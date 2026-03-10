using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Data.Sqlite;

namespace LifestyleCore.Data
{
    #region SECTION A — Archive Import Mode Enum
    public enum ArchiveImportMode
    {
        Merge,
        ReplaceRange,
        ReplaceAll
    }
    #endregion // SECTION A — Archive Import Mode Enum

    public static class BackupService
    {
        #region SECTION B — Public API
        public static async Task CreateDbSnapshotAsync(string destinationDbPath)
        {
            EnsureSchemas();

            Directory.CreateDirectory(Path.GetDirectoryName(destinationDbPath)!);

            try
            {
                using var conn = Db.OpenConnection();
                string escaped = destinationDbPath.Replace("'", "''");
                await conn.ExecuteAsync($"VACUUM INTO '{escaped}';");
            }
            catch
            {
                SqliteConnection.ClearAllPools();
                GC.Collect();
                GC.WaitForPendingFinalizers();

                File.Copy(Db.GetDbPath(), destinationDbPath, overwrite: true);
            }
        }

        public static void RestoreDbSnapshot(string sourceDbPath)
        {
            if (!File.Exists(sourceDbPath))
                throw new FileNotFoundException("Snapshot file not found.", sourceDbPath);

            string dest = Db.GetDbPath();
            Directory.CreateDirectory(Path.GetDirectoryName(dest)!);

            SqliteConnection.ClearAllPools();
            GC.Collect();
            GC.WaitForPendingFinalizers();

            TryDelete(dest + "-wal");
            TryDelete(dest + "-shm");

            File.Copy(sourceDbPath, dest, overwrite: true);

            EnsureSchemas();
        }

        public static async Task ExportArchiveAsync(string rootFolder)
        {
            EnsureSchemas();
            Directory.CreateDirectory(rootFolder);

            var manifest = new Manifest
            {
                ExportedAtUtc = DateTimeOffset.UtcNow.ToString("O"),
                TimeZoneId = TimeZoneInfo.Local.Id,
                TimeZoneDisplayName = TimeZoneInfo.Local.DisplayName,
                FormatVersion = 2
            };

            // Root-level reference files
            var foodItems = await GetFoodItemsAsync();
            await WriteJsonAsync(Path.Combine(rootFolder, "FoodItems.json"), foodItems);

            var habits = await GetHabitsAsync();
            await WriteJsonAsync(Path.Combine(rootFolder, "Habits.json"), habits);

            var pending = await GetPendingSleepAsync();
            await WriteJsonAsync(Path.Combine(rootFolder, "PendingSleep.json"), pending);

            // Per-day archives
            var focus = await GetFocusSessionsAsync();
            var food = await GetFoodEntriesAsync();
            var sleep = await GetSleepSessionsAsync();

            var stepsDaily = await GetStepsDailyAsync();              // Date -> steps
            var stepBuckets = await GetStepBucketsAsync();            // bucket rows
            var habitEntries = await GetHabitEntriesAsync();          // rows with Date + HabitExternalId

            var days = new SortedSet<string>(StringComparer.Ordinal);
            foreach (var f in focus) days.Add(f.LogDate);
            foreach (var e in food) days.Add(e.LogDate);
            foreach (var s in sleep) days.Add(s.WakeLogDate);
            foreach (var d in stepsDaily.Keys) days.Add(d);
            foreach (var b in stepBuckets) if (!string.IsNullOrWhiteSpace(b.BucketLocalDate)) days.Add(b.BucketLocalDate);
            foreach (var he in habitEntries) if (!string.IsNullOrWhiteSpace(he.Date)) days.Add(he.Date);

            foreach (var day in days)
            {
                stepsDaily.TryGetValue(day, out int steps);

                var dayObj = new DayArchive
                {
                    Date = day,
                    FocusSessions = focus.FindAll(x => x.LogDate == day),
                    FoodEntries = food.FindAll(x => x.LogDate == day),
                    SleepSessions = sleep.FindAll(x => x.WakeLogDate == day),

                    Steps = stepsDaily.ContainsKey(day) ? steps : (int?)null,
                    StepBuckets = stepBuckets.FindAll(x => x.BucketLocalDate == day),
                    HabitEntries = habitEntries.FindAll(x => x.Date == day)
                };

                var dt = DateOnly.ParseExact(day, "yyyy-MM-dd", CultureInfo.InvariantCulture);
                string dayDir = Path.Combine(rootFolder, dt.Year.ToString("0000"), dt.Month.ToString("00"));
                Directory.CreateDirectory(dayDir);
                string filePath = Path.Combine(dayDir, dt.Day.ToString("00") + ".json");

                await WriteJsonAsync(filePath, dayObj);
            }

            await WriteJsonAsync(Path.Combine(rootFolder, "manifest.json"), manifest);
        }

        public static async Task ImportArchiveAsync(
            string rootFolder,
            ArchiveImportMode mode,
            DateOnly? rangeStartInclusive = null,
            DateOnly? rangeEndInclusive = null)
        {
            EnsureSchemas();

            // If ReplaceAll, wipe first (so archive becomes source of truth)
            if (mode == ArchiveImportMode.ReplaceAll)
            {
                using var conn = Db.OpenConnection();

                await conn.ExecuteAsync("DELETE FROM FoodEntries;");
                await conn.ExecuteAsync("DELETE FROM FocusSessions;");
                await conn.ExecuteAsync("DELETE FROM SleepSessions;");
                await conn.ExecuteAsync("DELETE FROM PendingSleep;");

                // Steps + habits
                await conn.ExecuteAsync("DELETE FROM StepBuckets;");
                await conn.ExecuteAsync("DELETE FROM StepsDaily;");
                await conn.ExecuteAsync("DELETE FROM HabitEntries;");
                await conn.ExecuteAsync("DELETE FROM Habits;");

                // Keep FoodItems table in sync with archive (wipe + reimport)
                await conn.ExecuteAsync("DELETE FROM FoodItems;");
            }

            // FoodItems.json
            string foodItemsPath = Path.Combine(rootFolder, "FoodItems.json");
            if (File.Exists(foodItemsPath))
            {
                var items = await ReadJsonAsync<List<FoodItemExport>>(foodItemsPath) ?? new List<FoodItemExport>();
                await UpsertFoodItemsAsync(items);
            }

            // Habits.json
            string habitsPath = Path.Combine(rootFolder, "Habits.json");
            if (File.Exists(habitsPath))
            {
                var habits = await ReadJsonAsync<List<HabitExport>>(habitsPath) ?? new List<HabitExport>();
                await UpsertHabitsAsync(habits);
            }

            // ReplaceRange delete (entries only)
            if (mode == ArchiveImportMode.ReplaceRange)
            {
                if (!rangeStartInclusive.HasValue || !rangeEndInclusive.HasValue)
                    throw new InvalidOperationException("ReplaceRange requires start and end dates.");

                string start = rangeStartInclusive.Value.ToString("yyyy-MM-dd");
                string end = rangeEndInclusive.Value.ToString("yyyy-MM-dd");

                using var conn = Db.OpenConnection();

                await conn.ExecuteAsync("DELETE FROM FocusSessions WHERE LogDate >= @s AND LogDate <= @e;", new { s = start, e = end });
                await conn.ExecuteAsync("DELETE FROM FoodEntries WHERE LogDate >= @s AND LogDate <= @e;", new { s = start, e = end });
                await conn.ExecuteAsync("DELETE FROM SleepSessions WHERE WakeLogDate >= @s AND WakeLogDate <= @e;", new { s = start, e = end });

                await conn.ExecuteAsync("DELETE FROM StepsDaily WHERE Date >= @s AND Date <= @e;", new { s = start, e = end });
                await conn.ExecuteAsync("DELETE FROM StepBuckets WHERE BucketLocalDate >= @s AND BucketLocalDate <= @e;", new { s = start, e = end });
                await conn.ExecuteAsync("DELETE FROM HabitEntries WHERE Date >= @s AND Date <= @e;", new { s = start, e = end });
            }

            // Build habit map once for fast imports
            var habitMap = await GetHabitMapAsync();

            foreach (var file in EnumerateDayFiles(rootFolder))
            {
                var day = await ReadJsonAsync<DayArchive>(file);
                if (day == null) continue;

                var dt = DateOnly.ParseExact(day.Date, "yyyy-MM-dd", CultureInfo.InvariantCulture);

                if (mode == ArchiveImportMode.ReplaceRange)
                {
                    if (dt < rangeStartInclusive!.Value || dt > rangeEndInclusive!.Value)
                        continue;
                }

                await ImportOneDayAsync(day, habitMap);
            }

            // PendingSleep.json
            string pendingPath = Path.Combine(rootFolder, "PendingSleep.json");
            if (File.Exists(pendingPath))
            {
                var pending = await ReadJsonAsync<PendingSleepExport>(pendingPath);
                if (pending != null && !string.IsNullOrWhiteSpace(pending.StartUtc))
                {
                    using var conn = Db.OpenConnection();
                    await conn.ExecuteAsync("DELETE FROM PendingSleep;");
                    await conn.ExecuteAsync("INSERT INTO PendingSleep (Id, StartUtc) VALUES (1, @StartUtc);", new { StartUtc = pending.StartUtc });
                }
            }
        }
        #endregion // SECTION B — Public API

        #region SECTION C1 — Import helpers (day import)
        private static async Task ImportOneDayAsync(DayArchive day, Dictionary<string, long> habitByExternalId)
        {
            using var conn = Db.OpenConnection();
            using var tx = conn.BeginTransaction();

            // Map FoodItems by ExternalId so FoodEntries can link correctly
            var foodMap = await conn.QueryAsync<(long Id, string ExternalId)>(
                "SELECT Id, ExternalId FROM FoodItems;",
                transaction: tx);

            var foodByExt = new Dictionary<string, long>(StringComparer.OrdinalIgnoreCase);
            foreach (var x in foodMap)
                if (!string.IsNullOrWhiteSpace(x.ExternalId))
                    foodByExt[x.ExternalId] = x.Id;

            // -----------------------------
            // FocusSessions: UPDATE by ExternalId, else INSERT
            // -----------------------------
            foreach (var s in day.FocusSessions ?? new List<FocusSessionExport>())
            {
                if (string.IsNullOrWhiteSpace(s.ExternalId))
                    s.ExternalId = LowerHex16();

                int updated = await conn.ExecuteAsync(@"
                    UPDATE FocusSessions
                    SET LoggedAtUtc = @LoggedAtUtc,
                        LogDate     = @LogDate,
                        FocusType   = @FocusType,
                        Minutes     = @Minutes,
                        Completed   = @Completed
                    WHERE ExternalId = @ExternalId;",
                    new
                    {
                        LoggedAtUtc = s.LoggedAtUtc,
                        LogDate = s.LogDate,
                        FocusType = s.FocusType,
                        Minutes = s.Minutes,
                        Completed = s.Completed ? 1 : 0,
                        ExternalId = s.ExternalId
                    },
                    transaction: tx);

                if (updated == 0)
                {
                    await conn.ExecuteAsync(@"
                        INSERT INTO FocusSessions (LoggedAtUtc, LogDate, FocusType, Minutes, Completed, ExternalId)
                        VALUES (@LoggedAtUtc, @LogDate, @FocusType, @Minutes, @Completed, @ExternalId);",
                        new
                        {
                            LoggedAtUtc = s.LoggedAtUtc,
                            LogDate = s.LogDate,
                            FocusType = s.FocusType,
                            Minutes = s.Minutes,
                            Completed = s.Completed ? 1 : 0,
                            ExternalId = s.ExternalId
                        },
                        transaction: tx);
                }
            }

            // -----------------------------
            // FoodEntries: resolve FoodItemId, then UPDATE by ExternalId, else INSERT
            // -----------------------------
            foreach (var e in day.FoodEntries ?? new List<FoodEntryExport>())
            {
                if (string.IsNullOrWhiteSpace(e.ExternalId))
                    e.ExternalId = LowerHex16();

                long foodItemId = 0;

                if (!string.IsNullOrWhiteSpace(e.FoodItemExternalId) &&
                    foodByExt.TryGetValue(e.FoodItemExternalId, out var mapped))
                {
                    foodItemId = mapped;
                }
                else
                {
                    foodItemId = await conn.ExecuteScalarAsync<long>(@"
                        SELECT Id FROM FoodItems WHERE Name = @Name COLLATE NOCASE LIMIT 1;",
                        new { Name = e.FoodName },
                        transaction: tx);

                    if (foodItemId <= 0)
                    {
                        string foodExt = string.IsNullOrWhiteSpace(e.FoodItemExternalId) ? LowerHex16() : e.FoodItemExternalId;

                        foodItemId = await conn.ExecuteScalarAsync<long>(@"
                            INSERT INTO FoodItems (Name, KjPerServing, ServingLabel, KjPer100g, CreatedAtUtc, UpdatedAtUtc, ExternalId)
                            VALUES (@Name, @KjPerServing, @ServingLabel, @KjPer100g, @Now, @Now, @ExternalId);
                            SELECT last_insert_rowid();",
                            new
                            {
                                Name = e.FoodName,
                                KjPerServing = e.KjPerServingSnapshot,
                                ServingLabel = string.IsNullOrWhiteSpace(e.ServingLabel) ? "1 serving" : e.ServingLabel,
                                KjPer100g = e.KjPer100gSnapshot,
                                Now = DateTimeOffset.UtcNow.ToString("O"),
                                ExternalId = foodExt
                            },
                            transaction: tx);

                        foodByExt[foodExt] = foodItemId;
                    }
                }

                int updated = await conn.ExecuteAsync(@"
                    UPDATE FoodEntries
                    SET LoggedAtUtc          = @LoggedAtUtc,
                        LogDate              = @LogDate,
                        FoodItemId           = @FoodItemId,
                        FoodName             = @FoodName,
                        ServingLabel         = @ServingLabel,
                        KjPerServingSnapshot = @KjPerServingSnapshot,
                        KjPer100gSnapshot    = @KjPer100gSnapshot,
                        Servings             = @Servings,
                        Grams                = @Grams,
                        KjComputed           = @KjComputed
                    WHERE ExternalId = @ExternalId;",
                    new
                    {
                        LoggedAtUtc = e.LoggedAtUtc,
                        LogDate = e.LogDate,
                        FoodItemId = foodItemId,
                        FoodName = e.FoodName,
                        ServingLabel = e.ServingLabel,
                        KjPerServingSnapshot = e.KjPerServingSnapshot,
                        KjPer100gSnapshot = e.KjPer100gSnapshot,
                        Servings = e.Servings,
                        Grams = e.Grams,
                        KjComputed = e.KjComputed,
                        ExternalId = e.ExternalId
                    },
                    transaction: tx);

                if (updated == 0)
                {
                    await conn.ExecuteAsync(@"
                        INSERT INTO FoodEntries (
                            LoggedAtUtc, LogDate, FoodItemId,
                            FoodName, ServingLabel, KjPerServingSnapshot, KjPer100gSnapshot,
                            Servings, Grams, KjComputed,
                            ExternalId
                        )
                        VALUES (
                            @LoggedAtUtc, @LogDate, @FoodItemId,
                            @FoodName, @ServingLabel, @KjPerServingSnapshot, @KjPer100gSnapshot,
                            @Servings, @Grams, @KjComputed,
                            @ExternalId
                        );",
                        new
                        {
                            LoggedAtUtc = e.LoggedAtUtc,
                            LogDate = e.LogDate,
                            FoodItemId = foodItemId,
                            FoodName = e.FoodName,
                            ServingLabel = e.ServingLabel,
                            KjPerServingSnapshot = e.KjPerServingSnapshot,
                            KjPer100gSnapshot = e.KjPer100gSnapshot,
                            Servings = e.Servings,
                            Grams = e.Grams,
                            KjComputed = e.KjComputed,
                            ExternalId = e.ExternalId
                        },
                        transaction: tx);
                }
            }

            // -----------------------------
            // SleepSessions: UPDATE by ExternalId, else INSERT
            // -----------------------------
            foreach (var s in day.SleepSessions ?? new List<SleepSessionExport>())
            {
                if (string.IsNullOrWhiteSpace(s.ExternalId))
                    s.ExternalId = LowerHex16();

                int updated = await conn.ExecuteAsync(@"
                    UPDATE SleepSessions
                    SET StartUtc        = @StartUtc,
                        EndUtc          = @EndUtc,
                        WakeLogDate     = @WakeLogDate,
                        DurationMinutes = @DurationMinutes
                    WHERE ExternalId = @ExternalId;",
                    new
                    {
                        StartUtc = s.StartUtc,
                        EndUtc = s.EndUtc,
                        WakeLogDate = s.WakeLogDate,
                        DurationMinutes = s.DurationMinutes,
                        ExternalId = s.ExternalId
                    },
                    transaction: tx);

                if (updated == 0)
                {
                    await conn.ExecuteAsync(@"
                        INSERT INTO SleepSessions (StartUtc, EndUtc, WakeLogDate, DurationMinutes, ExternalId)
                        VALUES (@StartUtc, @EndUtc, @WakeLogDate, @DurationMinutes, @ExternalId);",
                        new
                        {
                            StartUtc = s.StartUtc,
                            EndUtc = s.EndUtc,
                            WakeLogDate = s.WakeLogDate,
                            DurationMinutes = s.DurationMinutes,
                            ExternalId = s.ExternalId
                        },
                        transaction: tx);
                }
            }

            // -----------------------------
            // StepsDaily (per day): upsert by Date
            // -----------------------------
            if (day.Steps.HasValue)
            {
                await conn.ExecuteAsync(@"
                    INSERT INTO StepsDaily (Date, Steps, UpdatedAtUtc)
                    VALUES (@Date, @Steps, @UpdatedAtUtc)
                    ON CONFLICT(Date) DO UPDATE SET
                        Steps = excluded.Steps,
                        UpdatedAtUtc = excluded.UpdatedAtUtc;",
                    new
                    {
                        Date = day.Date,
                        Steps = day.Steps.Value,
                        UpdatedAtUtc = DateTimeOffset.UtcNow.ToString("O")
                    },
                    transaction: tx);
            }

            // -----------------------------
            // StepBuckets (15-min buckets): upsert by BucketStartUtc
            // -----------------------------
            foreach (var b in day.StepBuckets ?? new List<StepBucketExport>())
            {
                if (string.IsNullOrWhiteSpace(b.BucketStartUtc))
                    continue;

                string ext = string.IsNullOrWhiteSpace(b.ExternalId) ? LowerHex16() : b.ExternalId;

                await conn.ExecuteAsync(@"
                    INSERT INTO StepBuckets (BucketStartUtc, BucketLocalDate, Steps, UpdatedAtUtc, ExternalId)
                    VALUES (@BucketStartUtc, @BucketLocalDate, @Steps, @UpdatedAtUtc, @ExternalId)
                    ON CONFLICT(BucketStartUtc) DO UPDATE SET
                        BucketLocalDate = excluded.BucketLocalDate,
                        Steps = excluded.Steps,
                        UpdatedAtUtc = excluded.UpdatedAtUtc;",
                    new
                    {
                        BucketStartUtc = b.BucketStartUtc,
                        BucketLocalDate = b.BucketLocalDate,
                        Steps = b.Steps,
                        UpdatedAtUtc = string.IsNullOrWhiteSpace(b.UpdatedAtUtc) ? DateTimeOffset.UtcNow.ToString("O") : b.UpdatedAtUtc,
                        ExternalId = ext
                    },
                    transaction: tx);
            }

            // -----------------------------
            // HabitEntries: upsert by (HabitId, Date) using HabitExternalId mapping
            // -----------------------------
            foreach (var he in day.HabitEntries ?? new List<HabitEntryExport>())
            {
                if (string.IsNullOrWhiteSpace(he.HabitExternalId))
                    continue;

                if (!habitByExternalId.TryGetValue(he.HabitExternalId, out long habitId))
                    continue;

                string ext = string.IsNullOrWhiteSpace(he.ExternalId) ? LowerHex16() : he.ExternalId;

                // If value <= 0, delete (keeps DB tidy for unchecked days)
                if (he.Value <= 0)
                {
                    await conn.ExecuteAsync(
                        "DELETE FROM HabitEntries WHERE HabitId = @HabitId AND Date = @Date;",
                        new { HabitId = habitId, Date = he.Date },
                        transaction: tx);

                    continue;
                }

                await conn.ExecuteAsync(@"
                    INSERT INTO HabitEntries (HabitId, Date, Value, UpdatedAtUtc, ExternalId)
                    VALUES (@HabitId, @Date, @Value, @UpdatedAtUtc, @ExternalId)
                    ON CONFLICT(HabitId, Date) DO UPDATE SET
                        Value = excluded.Value,
                        UpdatedAtUtc = excluded.UpdatedAtUtc;",
                    new
                    {
                        HabitId = habitId,
                        Date = he.Date,
                        Value = he.Value,
                        UpdatedAtUtc = string.IsNullOrWhiteSpace(he.UpdatedAtUtc) ? DateTimeOffset.UtcNow.ToString("O") : he.UpdatedAtUtc,
                        ExternalId = ext
                    },
                    transaction: tx);
            }

            tx.Commit();
        }
        #endregion // SECTION C1 — Import helpers (day import)

        #region SECTION C2 — Import helpers (reference upserts)
        private static async Task UpsertFoodItemsAsync(List<FoodItemExport> items)
        {
            using var conn = Db.OpenConnection();

            foreach (var i in items)
            {
                if (string.IsNullOrWhiteSpace(i.ExternalId))
                    i.ExternalId = LowerHex16();

                long existingId = await conn.ExecuteScalarAsync<long>(@"
                    SELECT Id FROM FoodItems WHERE ExternalId = @ExternalId LIMIT 1;",
                    new { ExternalId = i.ExternalId });

                if (existingId > 0)
                {
                    await conn.ExecuteAsync(@"
                        UPDATE FoodItems
                        SET Name=@Name,
                            KjPerServing=@KjPerServing,
                            ServingLabel=@ServingLabel,
                            KjPer100g=@KjPer100g,
                            UpdatedAtUtc=@UpdatedAtUtc
                        WHERE Id=@Id;",
                        new
                        {
                            Id = existingId,
                            Name = i.Name,
                            KjPerServing = i.KjPerServing,
                            ServingLabel = i.ServingLabel,
                            KjPer100g = i.KjPer100g,
                            UpdatedAtUtc = i.UpdatedAtUtc
                        });

                    continue;
                }

                long byNameId = await conn.ExecuteScalarAsync<long>(@"
                    SELECT Id FROM FoodItems WHERE Name = @Name COLLATE NOCASE LIMIT 1;",
                    new { Name = i.Name });

                if (byNameId > 0)
                {
                    await conn.ExecuteAsync(@"
                        UPDATE FoodItems
                        SET ExternalId=@ExternalId,
                            KjPerServing=@KjPerServing,
                            ServingLabel=@ServingLabel,
                            KjPer100g=@KjPer100g,
                            UpdatedAtUtc=@UpdatedAtUtc
                        WHERE Id=@Id;",
                        new
                        {
                            Id = byNameId,
                            ExternalId = i.ExternalId,
                            KjPerServing = i.KjPerServing,
                            ServingLabel = i.ServingLabel,
                            KjPer100g = i.KjPer100g,
                            UpdatedAtUtc = i.UpdatedAtUtc
                        });

                    continue;
                }

                await conn.ExecuteAsync(@"
                    INSERT INTO FoodItems (Name, KjPerServing, ServingLabel, KjPer100g, CreatedAtUtc, UpdatedAtUtc, ExternalId)
                    VALUES (@Name, @KjPerServing, @ServingLabel, @KjPer100g, @CreatedAtUtc, @UpdatedAtUtc, @ExternalId);",
                    new
                    {
                        Name = i.Name,
                        KjPerServing = i.KjPerServing,
                        ServingLabel = string.IsNullOrWhiteSpace(i.ServingLabel) ? "1 serving" : i.ServingLabel,
                        KjPer100g = i.KjPer100g,
                        CreatedAtUtc = i.CreatedAtUtc,
                        UpdatedAtUtc = i.UpdatedAtUtc,
                        ExternalId = i.ExternalId
                    });
            }
        }

        private static async Task UpsertHabitsAsync(List<HabitExport> habits)
        {
            using var conn = Db.OpenConnection();

            foreach (var h in habits)
            {
                if (string.IsNullOrWhiteSpace(h.ExternalId))
                    h.ExternalId = LowerHex16();

                long existingId = await conn.ExecuteScalarAsync<long>(@"
                    SELECT Id FROM Habits WHERE ExternalId = @ExternalId LIMIT 1;",
                    new { ExternalId = h.ExternalId });

                if (existingId > 0)
                {
                    await conn.ExecuteAsync(@"
                        UPDATE Habits
                        SET Title=@Title,
                            Kind=@Kind,
                            TargetPerWeek=@TargetPerWeek,
                            IsArchived=@IsArchived,
                            ArchivedAtUtc=@ArchivedAtUtc,
                            UpdatedAtUtc=@UpdatedAtUtc
                        WHERE Id=@Id;",
                        new
                        {
                            Id = existingId,
                            Title = h.Title,
                            Kind = h.Kind,
                            TargetPerWeek = h.TargetPerWeek,
                            IsArchived = h.IsArchived ? 1 : 0,
                            ArchivedAtUtc = string.IsNullOrWhiteSpace(h.ArchivedAtUtc) ? null : h.ArchivedAtUtc,
                            UpdatedAtUtc = string.IsNullOrWhiteSpace(h.UpdatedAtUtc) ? DateTimeOffset.UtcNow.ToString("O") : h.UpdatedAtUtc
                        });

                    continue;
                }

                await conn.ExecuteAsync(@"
                    INSERT INTO Habits (Title, Kind, TargetPerWeek, IsArchived, ArchivedAtUtc, CreatedAtUtc, UpdatedAtUtc, ExternalId)
                    VALUES (@Title, @Kind, @TargetPerWeek, @IsArchived, @ArchivedAtUtc, @CreatedAtUtc, @UpdatedAtUtc, @ExternalId);",
                    new
                    {
                        Title = h.Title,
                        Kind = h.Kind,
                        TargetPerWeek = h.TargetPerWeek,
                        IsArchived = h.IsArchived ? 1 : 0,
                        ArchivedAtUtc = string.IsNullOrWhiteSpace(h.ArchivedAtUtc) ? null : h.ArchivedAtUtc,
                        CreatedAtUtc = string.IsNullOrWhiteSpace(h.CreatedAtUtc) ? DateTimeOffset.UtcNow.ToString("O") : h.CreatedAtUtc,
                        UpdatedAtUtc = string.IsNullOrWhiteSpace(h.UpdatedAtUtc) ? DateTimeOffset.UtcNow.ToString("O") : h.UpdatedAtUtc,
                        ExternalId = h.ExternalId
                    });
            }
        }
        #endregion // SECTION C2 — Import helpers (reference upserts)

        #region SECTION C3 — Import helpers (habit map)
        private static async Task<Dictionary<string, long>> GetHabitMapAsync()
        {
            using var conn = Db.OpenConnection();
            var rows = await conn.QueryAsync<(long Id, string ExternalId)>("SELECT Id, ExternalId FROM Habits;");
            var dict = new Dictionary<string, long>(StringComparer.OrdinalIgnoreCase);

            foreach (var r in rows)
            {
                if (!string.IsNullOrWhiteSpace(r.ExternalId))
                    dict[r.ExternalId] = r.Id;
            }

            return dict;
        }
        #endregion // SECTION C3 — Import helpers (habit map)

        #region SECTION D — Export queries
        private static void EnsureSchemas()
        {
            Db.EnsureCreated();
            FoodSchema.EnsureCreated();
            SleepSchema.EnsureCreated();

            HabitsSchema.EnsureCreated();
            StepsSchema.EnsureCreated();
        }

        private static async Task<List<FoodItemExport>> GetFoodItemsAsync()
        {
            using var conn = Db.OpenConnection();
            var rows = await conn.QueryAsync<FoodItemExport>(@"
                SELECT ExternalId, Name, KjPerServing, ServingLabel, KjPer100g, CreatedAtUtc, UpdatedAtUtc
                FROM FoodItems
                ORDER BY Name COLLATE NOCASE ASC;
            ");
            return new List<FoodItemExport>(rows);
        }

        private static async Task<List<HabitExport>> GetHabitsAsync()
        {
            using var conn = Db.OpenConnection();
            var rows = await conn.QueryAsync<HabitExport>(@"
                SELECT ExternalId, Title, Kind, TargetPerWeek,
                       CASE WHEN IsArchived = 1 THEN 1 ELSE 0 END AS IsArchivedInt,
                       ArchivedAtUtc, CreatedAtUtc, UpdatedAtUtc
                FROM Habits
                ORDER BY Title COLLATE NOCASE ASC;
            ");

            var list = new List<HabitExport>();
            foreach (var r in rows)
            {
                list.Add(new HabitExport
                {
                    ExternalId = r.ExternalId,
                    Title = r.Title,
                    Kind = r.Kind,
                    TargetPerWeek = r.TargetPerWeek,
                    IsArchived = r.IsArchivedInt == 1,
                    ArchivedAtUtc = r.ArchivedAtUtc ?? "",
                    CreatedAtUtc = r.CreatedAtUtc,
                    UpdatedAtUtc = r.UpdatedAtUtc
                });
            }

            return list;
        }

        private static async Task<List<HabitEntryExport>> GetHabitEntriesAsync()
        {
            using var conn = Db.OpenConnection();
            var rows = await conn.QueryAsync<dynamic>(@"
                SELECT
                    he.ExternalId,
                    he.Date,
                    he.Value,
                    he.UpdatedAtUtc,
                    h.ExternalId AS HabitExternalId
                FROM HabitEntries he
                INNER JOIN Habits h ON h.Id = he.HabitId;
            ");

            var list = new List<HabitEntryExport>();
            foreach (var r in rows)
            {
                object valueObj = r.Value;
                object updatedObj = r.UpdatedAtUtc;
                object habitExternalIdObj = r.HabitExternalId;
                object externalIdObj = r.ExternalId;
                object dateObj = r.Date;

                list.Add(new HabitEntryExport
                {
                    ExternalId = Convert.ToString(externalIdObj) ?? "",
                    Date = Convert.ToString(dateObj) ?? "",
                    Value = Convert.ToDouble(valueObj),
                    UpdatedAtUtc = Convert.ToString(updatedObj) ?? "",
                    HabitExternalId = Convert.ToString(habitExternalIdObj) ?? ""
                });
            }

            return list;
        }

        private static async Task<Dictionary<string, int>> GetStepsDailyAsync()
        {
            using var conn = Db.OpenConnection();
            var rows = await conn.QueryAsync<dynamic>(@"
                SELECT Date, Steps
                FROM StepsDaily;
            ");

            var dict = new Dictionary<string, int>(StringComparer.Ordinal);
            foreach (var r in rows)
            {
                object dateObj = r.Date;
                object stepsObj = r.Steps;

                string date = Convert.ToString(dateObj) ?? "";
                int steps = Convert.ToInt32(stepsObj);

                dict[date] = steps;
            }

            return dict;
        }

        private static async Task<List<StepBucketExport>> GetStepBucketsAsync()
        {
            using var conn = Db.OpenConnection();
            var rows = await conn.QueryAsync<StepBucketExport>(@"
                SELECT ExternalId, BucketStartUtc, BucketLocalDate, Steps, UpdatedAtUtc
                FROM StepBuckets;
            ");
            return new List<StepBucketExport>(rows);
        }

        private static async Task<PendingSleepExport> GetPendingSleepAsync()
        {
            using var conn = Db.OpenConnection();
            var start = await conn.QueryFirstOrDefaultAsync<string>(
                "SELECT StartUtc FROM PendingSleep WHERE Id=1;"
            );

            return new PendingSleepExport { StartUtc = start ?? "" };
        }

        private static async Task<List<FocusSessionExport>> GetFocusSessionsAsync()
        {
            using var conn = Db.OpenConnection();
            var rows = await conn.QueryAsync<FocusSessionExport>(@"
                SELECT ExternalId, LoggedAtUtc, LogDate, FocusType, Minutes,
                       CASE WHEN Completed = 1 THEN 1 ELSE 0 END AS CompletedInt
                FROM FocusSessions;
            ");

            var list = new List<FocusSessionExport>();
            foreach (var r in rows)
            {
                list.Add(new FocusSessionExport
                {
                    ExternalId = r.ExternalId,
                    LoggedAtUtc = r.LoggedAtUtc,
                    LogDate = r.LogDate,
                    FocusType = r.FocusType,
                    Minutes = r.Minutes,
                    Completed = r.CompletedInt == 1
                });
            }
            return list;
        }

        private static async Task<List<FoodEntryExport>> GetFoodEntriesAsync()
        {
            using var conn = Db.OpenConnection();
            var rows = await conn.QueryAsync<dynamic>(@"
                SELECT
                    fe.ExternalId,
                    fe.LoggedAtUtc,
                    fe.LogDate,
                    fe.FoodName,
                    fe.ServingLabel,
                    fe.KjPerServingSnapshot,
                    fe.KjPer100gSnapshot,
                    fe.Servings,
                    fe.Grams,
                    fe.KjComputed,
                    fi.ExternalId AS FoodItemExternalId
                FROM FoodEntries fe
                LEFT JOIN FoodItems fi ON fi.Id = fe.FoodItemId;
            ");

            var list = new List<FoodEntryExport>();
            foreach (var r in rows)
            {
                object kjPer100gObj = r.KjPer100gSnapshot;
                object servingsObj = r.Servings;
                object gramsObj = r.Grams;
                object foodItemExternalIdObj = r.FoodItemExternalId;

                list.Add(new FoodEntryExport
                {
                    ExternalId = Convert.ToString(r.ExternalId) ?? "",
                    LoggedAtUtc = Convert.ToString(r.LoggedAtUtc) ?? "",
                    LogDate = Convert.ToString(r.LogDate) ?? "",

                    FoodName = Convert.ToString(r.FoodName) ?? "",
                    ServingLabel = Convert.ToString(r.ServingLabel) ?? "",
                    KjPerServingSnapshot = Convert.ToDouble(r.KjPerServingSnapshot),
                    KjPer100gSnapshot = kjPer100gObj is null || kjPer100gObj is DBNull ? null : Convert.ToDouble(kjPer100gObj),

                    Servings = servingsObj is null || servingsObj is DBNull ? null : Convert.ToDouble(servingsObj),
                    Grams = gramsObj is null || gramsObj is DBNull ? null : Convert.ToInt32(gramsObj),

                    KjComputed = Convert.ToDouble(r.KjComputed),
                    FoodItemExternalId = foodItemExternalIdObj is null || foodItemExternalIdObj is DBNull ? "" : (Convert.ToString(foodItemExternalIdObj) ?? "")
                });
            }
            return list;
        }

        private static async Task<List<SleepSessionExport>> GetSleepSessionsAsync()
        {
            using var conn = Db.OpenConnection();
            var rows = await conn.QueryAsync<SleepSessionExport>(@"
                SELECT ExternalId, StartUtc, EndUtc, WakeLogDate, DurationMinutes
                FROM SleepSessions;
            ");
            return new List<SleepSessionExport>(rows);
        }
        #endregion // SECTION D — Export queries


        #region SECTION E — JSON helpers + file enumeration
        private static IEnumerable<string> EnumerateDayFiles(string rootFolder)
        {
            foreach (var yearDir in Directory.EnumerateDirectories(rootFolder))
            {
                foreach (var monthDir in Directory.EnumerateDirectories(yearDir))
                {
                    foreach (var dayFile in Directory.EnumerateFiles(monthDir, "*.json"))
                    {
                        var name = Path.GetFileName(dayFile);
                        if (string.Equals(name, "manifest.json", StringComparison.OrdinalIgnoreCase)) continue;
                        if (string.Equals(name, "FoodItems.json", StringComparison.OrdinalIgnoreCase)) continue;
                        if (string.Equals(name, "PendingSleep.json", StringComparison.OrdinalIgnoreCase)) continue;
                        if (string.Equals(name, "Habits.json", StringComparison.OrdinalIgnoreCase)) continue;

                        yield return dayFile;
                    }
                }
            }
        }

        private static async Task WriteJsonAsync<T>(string path, T obj)
        {
            var options = new JsonSerializerOptions { WriteIndented = true };
            string json = JsonSerializer.Serialize(obj, options);
            await File.WriteAllTextAsync(path, json);
        }

        private static async Task<T?> ReadJsonAsync<T>(string path)
        {
            string json = await File.ReadAllTextAsync(path);
            return JsonSerializer.Deserialize<T>(json);
        }

        private static void TryDelete(string path)
        {
            try { if (File.Exists(path)) File.Delete(path); }
            catch { }
        }

        private static string LowerHex16() => Guid.NewGuid().ToString("N");
        #endregion // SECTION E — JSON helpers + file enumeration
    }

    #region SECTION F1 — Manifest DTO
    public sealed class Manifest
    {
        public int FormatVersion { get; set; }
        public string ExportedAtUtc { get; set; } = "";
        public string TimeZoneId { get; set; } = "";
        public string TimeZoneDisplayName { get; set; } = "";
    }
    #endregion // SECTION F1 — Manifest DTO

    #region SECTION F2 — Pending Sleep DTO
    public sealed class PendingSleepExport
    {
        public string StartUtc { get; set; } = "";
    }
    #endregion // SECTION F2 — Pending Sleep DTO

    #region SECTION F3 — Day Archive DTO
    public sealed class DayArchive
    {
        public string Date { get; set; } = "";

        public List<FocusSessionExport> FocusSessions { get; set; } = new();
        public List<FoodEntryExport> FoodEntries { get; set; } = new();
        public List<SleepSessionExport> SleepSessions { get; set; } = new();

        // NEW
        public int? Steps { get; set; }
        public List<StepBucketExport> StepBuckets { get; set; } = new();
        public List<HabitEntryExport> HabitEntries { get; set; } = new();
    }
    #endregion // SECTION F3 — Day Archive DTO

    #region SECTION F4 — Food Item Export DTO
    public sealed class FoodItemExport
    {
        public string ExternalId { get; set; } = "";
        public string Name { get; set; } = "";
        public double KjPerServing { get; set; }
        public string ServingLabel { get; set; } = "";
        public double? KjPer100g { get; set; }
        public string CreatedAtUtc { get; set; } = "";
        public string UpdatedAtUtc { get; set; } = "";
    }
    #endregion // SECTION F4 — Food Item Export DTO

    #region SECTION F5 — Focus Session Export DTO
    public sealed class FocusSessionExport
    {
        public string ExternalId { get; set; } = "";
        public string LoggedAtUtc { get; set; } = "";
        public string LogDate { get; set; } = "";
        public string FocusType { get; set; } = "";
        public int Minutes { get; set; }
        public bool Completed { get; set; }

        public int CompletedInt { get; set; }
    }
    #endregion // SECTION F5 — Focus Session Export DTO

    #region SECTION F6 — Food Entry Export DTO
    public sealed class FoodEntryExport
    {
        public string ExternalId { get; set; } = "";
        public string LoggedAtUtc { get; set; } = "";
        public string LogDate { get; set; } = "";

        public string FoodItemExternalId { get; set; } = "";

        public string FoodName { get; set; } = "";
        public string ServingLabel { get; set; } = "";
        public double KjPerServingSnapshot { get; set; }
        public double? KjPer100gSnapshot { get; set; }

        public double? Servings { get; set; }
        public int? Grams { get; set; }

        public double KjComputed { get; set; }
    }
    #endregion // SECTION F6 — Food Entry Export DTO

    #region SECTION F7 — Sleep Session Export DTO
    public sealed class SleepSessionExport
    {
        public string ExternalId { get; set; } = "";
        public string StartUtc { get; set; } = "";
        public string EndUtc { get; set; } = "";
        public string WakeLogDate { get; set; } = "";
        public int DurationMinutes { get; set; }
    }
    #endregion // SECTION F7 — Sleep Session Export DTO

    #region SECTION F8 — Step Bucket Export DTO
    public sealed class StepBucketExport
    {
        public string ExternalId { get; set; } = "";
        public string BucketStartUtc { get; set; } = "";
        public string BucketLocalDate { get; set; } = "";
        public int Steps { get; set; }
        public string UpdatedAtUtc { get; set; } = "";
    }
    #endregion // SECTION F8 — Step Bucket Export DTO

    #region SECTION F9 — Habit Export DTO
    public sealed class HabitExport
    {
        public string ExternalId { get; set; } = "";
        public string Title { get; set; } = "";
        public string Kind { get; set; } = ""; // "Check" or "Number" (or future "Auto")
        public double TargetPerWeek { get; set; }

        public bool IsArchived { get; set; }
        public int IsArchivedInt { get; set; }

        public string ArchivedAtUtc { get; set; } = "";
        public string CreatedAtUtc { get; set; } = "";
        public string UpdatedAtUtc { get; set; } = "";
    }
    #endregion // SECTION F9 — Habit Export DTO

    #region SECTION F10 — Habit Entry Export DTO
    public sealed class HabitEntryExport
    {
        public string ExternalId { get; set; } = "";
        public string Date { get; set; } = ""; // yyyy-MM-dd (local)
        public double Value { get; set; }       // 1 for checkbox, N for numeric
        public string UpdatedAtUtc { get; set; } = "";
        public string HabitExternalId { get; set; } = "";
    }
    #endregion // SECTION F10 — Habit Entry Export DTO
}
