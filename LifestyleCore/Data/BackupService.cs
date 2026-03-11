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
                FormatVersion = 3
            };

            var foodItems = await GetFoodItemsAsync();
            await WriteJsonAsync(Path.Combine(rootFolder, "FoodItems.json"), foodItems);

            var habits = await GetHabitsAsync();
            await WriteJsonAsync(Path.Combine(rootFolder, "Habits.json"), habits);

            var focusLabels = await GetFocusLabelsAsync();
            await WriteJsonAsync(Path.Combine(rootFolder, "FocusLabels.json"), focusLabels);

            var pending = await GetPendingSleepAsync();
            await WriteJsonAsync(Path.Combine(rootFolder, "PendingSleep.json"), pending);

            var focus = await GetFocusSessionsAsync();
            var food = await GetFoodEntriesAsync();
            var sleep = await GetSleepSessionsAsync();

            var stepsDaily = await GetStepsDailyAsync();
            var stepBuckets = await GetStepBucketsAsync();
            var habitEntries = await GetHabitEntriesAsync();

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

            if (mode == ArchiveImportMode.ReplaceAll)
            {
                using var conn = Db.OpenConnection();
                using var tx = conn.BeginTransaction();
                await ResetDatabaseDataInternalAsync(conn, tx, seedDefaultFocusLabels: true);
                tx.Commit();
            }

            string foodItemsPath = Path.Combine(rootFolder, "FoodItems.json");
            if (File.Exists(foodItemsPath))
            {
                var items = await ReadJsonAsync<List<FoodItemExport>>(foodItemsPath) ?? new List<FoodItemExport>();
                await UpsertFoodItemsAsync(items);
            }

            string habitsPath = Path.Combine(rootFolder, "Habits.json");
            if (File.Exists(habitsPath))
            {
                var habits = await ReadJsonAsync<List<HabitExport>>(habitsPath) ?? new List<HabitExport>();
                await UpsertHabitsAsync(habits);
            }

            string focusLabelsPath = Path.Combine(rootFolder, "FocusLabels.json");
            if (File.Exists(focusLabelsPath))
            {
                var focusLabels = await ReadJsonAsync<List<FocusLabelExport>>(focusLabelsPath) ?? new List<FocusLabelExport>();
                await UpsertFocusLabelsAsync(focusLabels);
            }

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

            string pendingPath = Path.Combine(rootFolder, "PendingSleep.json");
            if (File.Exists(pendingPath))
            {
                var pending = await ReadJsonAsync<PendingSleepExport>(pendingPath);
                using var conn = Db.OpenConnection();
                await conn.ExecuteAsync("DELETE FROM PendingSleep;");

                if (pending != null && !string.IsNullOrWhiteSpace(pending.StartUtc))
                {
                    await conn.ExecuteAsync("INSERT INTO PendingSleep (Id, StartUtc) VALUES (1, @StartUtc);", new { StartUtc = pending.StartUtc });
                }
            }
        }

        public static async Task ExportGamificationDataAsync(string destinationJsonPath)
        {
            EnsureSchemas();
            Directory.CreateDirectory(Path.GetDirectoryName(destinationJsonPath)!);

            var save = new GamificationSaveExport
            {
                FormatVersion = 1,
                ExportedAtUtc = DateTimeOffset.UtcNow.ToString("O"),
                TimeZoneId = TimeZoneInfo.Local.Id,
                TimeZoneDisplayName = TimeZoneInfo.Local.DisplayName,
                TrainerProgress = await GetTrainerProgressExportAsync(),
                RewardsLedger = await GetRewardsLedgerExportAsync(),
                Settings = await GetGamificationSettingsExportAsync(),
                StepItemRollState = await GetStepItemRollStateExportAsync(),
                Inventory = await GetInventoryItemsExportAsync(),
                ItemDefinitions = await GetItemDefinitionsExportAsync()
            };

            await WriteJsonAsync(destinationJsonPath, save);
        }

        public static async Task ImportGamificationDataAsync(string sourceJsonPath)
        {
            EnsureSchemas();

            if (!File.Exists(sourceJsonPath))
                throw new FileNotFoundException("Gamification save file not found.", sourceJsonPath);

            var save = await ReadJsonAsync<GamificationSaveExport>(sourceJsonPath);
            if (save == null)
                throw new InvalidOperationException("Gamification save file could not be read.");

            await ReplaceGamificationDataAsync(save);
        }

        public static async Task DeleteAllDataAsync()
        {
            EnsureSchemas();

            using var conn = Db.OpenConnection();
            using var tx = conn.BeginTransaction();
            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            await ResetDatabaseDataInternalAsync(conn, tx, seedDefaultFocusLabels: true);
            await ResetGamificationDataInternalAsync(conn, tx, nowUtc, seedDefaultItemDefinitions: true);

            tx.Commit();
        }

        public static async Task DeleteAllDatabaseDataAsync()
        {
            EnsureSchemas();

            using var conn = Db.OpenConnection();
            using var tx = conn.BeginTransaction();

            await ResetDatabaseDataInternalAsync(conn, tx, seedDefaultFocusLabels: true);

            tx.Commit();
        }

        public static async Task DeleteAllGamificationDataAsync()
        {
            EnsureSchemas();

            using var conn = Db.OpenConnection();
            using var tx = conn.BeginTransaction();
            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            await ResetGamificationDataInternalAsync(conn, tx, nowUtc, seedDefaultItemDefinitions: true);

            tx.Commit();
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

        private static async Task UpsertFocusLabelsAsync(List<FocusLabelExport> labels)
        {
            using var conn = Db.OpenConnection();
            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            foreach (var label in labels)
            {
                if (string.IsNullOrWhiteSpace(label.Name))
                    continue;

                if (string.IsNullOrWhiteSpace(label.ExternalId))
                    label.ExternalId = LowerHex16();

                long existingId = await conn.ExecuteScalarAsync<long>(@"
                    SELECT Id FROM FocusLabels WHERE ExternalId = @ExternalId LIMIT 1;",
                    new { ExternalId = label.ExternalId });

                if (existingId <= 0)
                {
                    existingId = await conn.ExecuteScalarAsync<long>(@"
                        SELECT Id FROM FocusLabels WHERE Name = @Name COLLATE NOCASE LIMIT 1;",
                        new { Name = label.Name });
                }

                if (existingId > 0)
                {
                    await conn.ExecuteAsync(@"
                        UPDATE FocusLabels
                        SET ExternalId = @ExternalId,
                            Name = @Name,
                            IsActive = @IsActive,
                            CreatedAtUtc = COALESCE(CreatedAtUtc, @CreatedAtUtc),
                            DeletedAtUtc = @DeletedAtUtc
                        WHERE Id = @Id;",
                        new
                        {
                            Id = existingId,
                            ExternalId = label.ExternalId,
                            Name = label.Name,
                            IsActive = label.IsActive ? 1 : 0,
                            CreatedAtUtc = string.IsNullOrWhiteSpace(label.CreatedAtUtc) ? nowUtc : label.CreatedAtUtc,
                            DeletedAtUtc = string.IsNullOrWhiteSpace(label.DeletedAtUtc) ? null : label.DeletedAtUtc
                        });

                    continue;
                }

                await conn.ExecuteAsync(@"
                    INSERT INTO FocusLabels (ExternalId, Name, IsActive, CreatedAtUtc, DeletedAtUtc)
                    VALUES (@ExternalId, @Name, @IsActive, @CreatedAtUtc, @DeletedAtUtc);",
                    new
                    {
                        ExternalId = label.ExternalId,
                        Name = label.Name,
                        IsActive = label.IsActive ? 1 : 0,
                        CreatedAtUtc = string.IsNullOrWhiteSpace(label.CreatedAtUtc) ? nowUtc : label.CreatedAtUtc,
                        DeletedAtUtc = string.IsNullOrWhiteSpace(label.DeletedAtUtc) ? null : label.DeletedAtUtc
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

        #region SECTION C4 — Import helpers (gamification resets)
        private static async Task EnsureTrainerProgressLifetimeColumnAsync(System.Data.IDbConnection conn, System.Data.IDbTransaction? tx = null)
        {
            var cols = await conn.QueryAsync("PRAGMA table_info(TrainerProgress);", transaction: tx);

            bool hasTotalLifetimeXp = false;
            foreach (var c in cols)
            {
                string name = (string)c.name;
                if (string.Equals(name, "TotalLifetimeXp", StringComparison.OrdinalIgnoreCase))
                {
                    hasTotalLifetimeXp = true;
                    break;
                }
            }

            if (!hasTotalLifetimeXp)
            {
                await conn.ExecuteAsync(
                    "ALTER TABLE TrainerProgress ADD COLUMN TotalLifetimeXp INTEGER NOT NULL DEFAULT 0;",
                    transaction: tx);
            }

            await conn.ExecuteAsync(@"
                UPDATE TrainerProgress
                SET TotalLifetimeXp = COALESCE(TotalLifetimeXp, 0)
                WHERE Id = 1;",
                transaction: tx);
        }

        private static async Task ResetDatabaseDataInternalAsync(System.Data.IDbConnection conn, System.Data.IDbTransaction tx, bool seedDefaultFocusLabels)
        {
            await conn.ExecuteAsync("DELETE FROM FoodEntries;", transaction: tx);
            await conn.ExecuteAsync("DELETE FROM FocusSessions;", transaction: tx);
            await conn.ExecuteAsync("DELETE FROM SleepSessions;", transaction: tx);
            await conn.ExecuteAsync("DELETE FROM PendingSleep;", transaction: tx);
            await conn.ExecuteAsync("DELETE FROM StepBuckets;", transaction: tx);
            await conn.ExecuteAsync("DELETE FROM StepsDaily;", transaction: tx);
            await conn.ExecuteAsync("DELETE FROM HabitEntries;", transaction: tx);
            await conn.ExecuteAsync("DELETE FROM Habits;", transaction: tx);
            await conn.ExecuteAsync("DELETE FROM FoodItems;", transaction: tx);
            await conn.ExecuteAsync("DELETE FROM FocusLabels;", transaction: tx);

            if (seedDefaultFocusLabels)
            {
                string nowUtc = DateTimeOffset.UtcNow.ToString("O");
                await conn.ExecuteAsync(@"
INSERT INTO FocusLabels (Name, IsActive, CreatedAtUtc)
VALUES ('Draw', 1, @NowUtc), ('Music', 1, @NowUtc);",
                    new { NowUtc = nowUtc },
                    tx);
            }
        }

        private static async Task ResetGamificationDataInternalAsync(System.Data.IDbConnection conn, System.Data.IDbTransaction tx, string nowUtc, bool seedDefaultItemDefinitions)
        {
            await EnsureTrainerProgressLifetimeColumnAsync(conn, tx);

            await conn.ExecuteAsync("DELETE FROM RewardsLedger;", transaction: tx);
            await conn.ExecuteAsync("DELETE FROM InventoryItems;", transaction: tx);
            await conn.ExecuteAsync("DELETE FROM ItemDefinitions;", transaction: tx);
            await conn.ExecuteAsync("DELETE FROM StepItemRollState;", transaction: tx);
            await conn.ExecuteAsync("DELETE FROM GamificationSettings;", transaction: tx);
            await conn.ExecuteAsync("DELETE FROM TrainerProgress;", transaction: tx);

            await conn.ExecuteAsync(@"
INSERT INTO TrainerProgress (Id, CurrentCycleXp, TotalLifetimeXp, PrestigeCount, UpdatedAtUtc)
VALUES (1, 0, 0, 0, @UpdatedAtUtc);",
                new { UpdatedAtUtc = nowUtc },
                tx);

            await conn.ExecuteAsync(@"
INSERT INTO GamificationSettings (
    Id,
    StepsPerItemRoll,
    ItemRollOneInN,
    CommonTierWeight,
    UncommonTierWeight,
    RareTierWeight,
    CommonPoolText,
    UncommonPoolText,
    RarePoolText,
    SleepHealthyMinHours,
    SleepHealthyMaxHours,
    SleepHealthyMultiplier,
    SleepOutsideRangeStartMultiplier,
    SleepPenaltyPer15Min,
    SleepTrackedMinimumMultiplier,
    FocusXpPerMinute,
    FocusXpIncompleteMultiplier,
    UpdatedAtUtc)
VALUES (
    1,
    1000,
    4,
    80,
    18,
    2,
    'Potion\nPoke Ball\nAntidote\nParalyze Heal\nEscape Rope',
    'Super Potion\nGreat Ball\nRevive',
    'Rare Candy\nNugget',
    6.0,
    10.0,
    1.10,
    1.05,
    0.005,
    1.01,
    100.0,
    0.25,
    @UpdatedAtUtc);",
                new { UpdatedAtUtc = nowUtc },
                tx);

            await conn.ExecuteAsync(@"
INSERT INTO StepItemRollState (
    Id,
    StepsRemainder,
    TotalRolls,
    TotalSuccesses,
    LastDropUtc,
    LastDropSummary,
    UpdatedAtUtc)
VALUES (1, 0, 0, 0, NULL, NULL, @UpdatedAtUtc);",
                new { UpdatedAtUtc = nowUtc },
                tx);

            if (seedDefaultItemDefinitions)
                await InsertDefaultItemDefinitionsAsync(conn, tx, nowUtc);
        }

        private static async Task InsertDefaultItemDefinitionsAsync(System.Data.IDbConnection conn, System.Data.IDbTransaction tx, string nowUtc)
        {
            await conn.ExecuteAsync(@"
INSERT INTO ItemDefinitions (Name, Category, Tier, Weight, IsActive, CreatedAtUtc, DeletedAtUtc)
VALUES
 ('Potion', 'Healing', 0, 1, 1, @NowUtc, NULL),
 ('Poke Ball', 'Ball', 0, 1, 1, @NowUtc, NULL),
 ('Antidote', 'Status', 0, 1, 1, @NowUtc, NULL),
 ('Paralyze Heal', 'Status', 0, 1, 1, @NowUtc, NULL),
 ('Escape Rope', 'Escape', 0, 1, 1, @NowUtc, NULL),
 ('Super Potion', 'Healing', 1, 1, 1, @NowUtc, NULL),
 ('Great Ball', 'Ball', 1, 1, 1, @NowUtc, NULL),
 ('Revive', 'Healing', 1, 1, 1, @NowUtc, NULL),
 ('Rare Candy', 'Candy', 2, 1, 1, @NowUtc, NULL),
 ('Nugget', 'Valuable', 2, 1, 1, @NowUtc, NULL);",
                new { NowUtc = nowUtc },
                tx);
        }

        #endregion // SECTION C4 — Import helpers (gamification resets)

        #region SECTION C5 — Import helpers (gamification replace)
        private static async Task ReplaceGamificationDataAsync(GamificationSaveExport save)
        {
            using var conn = Db.OpenConnection();
            using var tx = conn.BeginTransaction();

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            await ResetGamificationDataInternalAsync(conn, tx, nowUtc, seedDefaultItemDefinitions: false);

            var trainer = save.TrainerProgress ?? new TrainerProgressExport();
            await conn.ExecuteAsync(@"
UPDATE TrainerProgress
SET CurrentCycleXp = @CurrentCycleXp,
    TotalLifetimeXp = @TotalLifetimeXp,
    PrestigeCount = @PrestigeCount,
    UpdatedAtUtc = @UpdatedAtUtc
WHERE Id = 1;",
                new
                {
                    CurrentCycleXp = Math.Max(0, trainer.CurrentCycleXp),
                    TotalLifetimeXp = Math.Max(0L, trainer.TotalLifetimeXp),
                    PrestigeCount = Math.Max(0, trainer.PrestigeCount),
                    UpdatedAtUtc = string.IsNullOrWhiteSpace(trainer.UpdatedAtUtc) ? nowUtc : trainer.UpdatedAtUtc
                },
                tx);

            var settings = save.Settings ?? new GamificationSettingsExport();
            await conn.ExecuteAsync(@"
UPDATE GamificationSettings
SET StepsPerItemRoll = @StepsPerItemRoll,
    ItemRollOneInN = @ItemRollOneInN,
    CommonTierWeight = @CommonTierWeight,
    UncommonTierWeight = @UncommonTierWeight,
    RareTierWeight = @RareTierWeight,
    ItemPoolText = @ItemPoolText,
    CommonPoolText = @CommonPoolText,
    UncommonPoolText = @UncommonPoolText,
    RarePoolText = @RarePoolText,
    SleepHealthyMinHours = @SleepHealthyMinHours,
    SleepHealthyMaxHours = @SleepHealthyMaxHours,
    SleepHealthyMultiplier = @SleepHealthyMultiplier,
    SleepOutsideRangeStartMultiplier = @SleepOutsideRangeStartMultiplier,
    SleepPenaltyPer15Min = @SleepPenaltyPer15Min,
    SleepTrackedMinimumMultiplier = @SleepTrackedMinimumMultiplier,
    FocusXpPerMinute = @FocusXpPerMinute,
    FocusXpIncompleteMultiplier = @FocusXpIncompleteMultiplier,
    UpdatedAtUtc = @UpdatedAtUtc
WHERE Id = 1;",
                new
                {
                    StepsPerItemRoll = settings.StepsPerItemRoll <= 0 ? 1000 : settings.StepsPerItemRoll,
                    ItemRollOneInN = settings.ItemRollOneInN <= 0 ? 4 : settings.ItemRollOneInN,
                    CommonTierWeight = Math.Max(0, settings.CommonTierWeight),
                    UncommonTierWeight = Math.Max(0, settings.UncommonTierWeight),
                    RareTierWeight = Math.Max(0, settings.RareTierWeight),
                    ItemPoolText = string.IsNullOrWhiteSpace(settings.ItemPoolText) ? null : settings.ItemPoolText,
                    CommonPoolText = string.IsNullOrWhiteSpace(settings.CommonPoolText) ? null : settings.CommonPoolText,
                    UncommonPoolText = string.IsNullOrWhiteSpace(settings.UncommonPoolText) ? null : settings.UncommonPoolText,
                    RarePoolText = string.IsNullOrWhiteSpace(settings.RarePoolText) ? null : settings.RarePoolText,
                    SleepHealthyMinHours = settings.SleepHealthyMinHours,
                    SleepHealthyMaxHours = settings.SleepHealthyMaxHours,
                    SleepHealthyMultiplier = settings.SleepHealthyMultiplier,
                    SleepOutsideRangeStartMultiplier = settings.SleepOutsideRangeStartMultiplier,
                    SleepPenaltyPer15Min = settings.SleepPenaltyPer15Min,
                    SleepTrackedMinimumMultiplier = settings.SleepTrackedMinimumMultiplier,
                    FocusXpPerMinute = settings.FocusXpPerMinute <= 0 ? 100.0 : settings.FocusXpPerMinute,
                    FocusXpIncompleteMultiplier = settings.FocusXpIncompleteMultiplier < 0 ? 0.0 : (settings.FocusXpIncompleteMultiplier > 1.0 ? 1.0 : settings.FocusXpIncompleteMultiplier),
                    UpdatedAtUtc = string.IsNullOrWhiteSpace(settings.UpdatedAtUtc) ? nowUtc : settings.UpdatedAtUtc
                },
                tx);

            var rollState = save.StepItemRollState ?? new StepItemRollStateExport();
            await conn.ExecuteAsync(@"
UPDATE StepItemRollState
SET StepsRemainder = @StepsRemainder,
    TotalRolls = @TotalRolls,
    TotalSuccesses = @TotalSuccesses,
    LastDropUtc = @LastDropUtc,
    LastDropSummary = @LastDropSummary,
    UpdatedAtUtc = @UpdatedAtUtc
WHERE Id = 1;",
                new
                {
                    StepsRemainder = Math.Max(0, rollState.StepsRemainder),
                    TotalRolls = Math.Max(0L, rollState.TotalRolls),
                    TotalSuccesses = Math.Max(0L, rollState.TotalSuccesses),
                    LastDropUtc = string.IsNullOrWhiteSpace(rollState.LastDropUtc) ? null : rollState.LastDropUtc,
                    LastDropSummary = string.IsNullOrWhiteSpace(rollState.LastDropSummary) ? null : rollState.LastDropSummary,
                    UpdatedAtUtc = string.IsNullOrWhiteSpace(rollState.UpdatedAtUtc) ? nowUtc : rollState.UpdatedAtUtc
                },
                tx);

            foreach (var item in save.Inventory ?? new List<InventoryItemExport>())
            {
                if (string.IsNullOrWhiteSpace(item.ItemKey) || item.Count <= 0)
                    continue;

                await conn.ExecuteAsync(@"
INSERT INTO InventoryItems (ItemKey, Count)
VALUES (@ItemKey, @Count);",
                    new { ItemKey = item.ItemKey, Count = item.Count },
                    tx);
            }

            var itemDefinitions = save.ItemDefinitions ?? new List<ItemDefinitionExport>();
            if (itemDefinitions.Count == 0)
            {
                await InsertDefaultItemDefinitionsAsync(conn, tx, nowUtc);
            }
            else
            {
                foreach (var item in itemDefinitions)
                {
                    if (string.IsNullOrWhiteSpace(item.Name))
                        continue;

                    await conn.ExecuteAsync(@"
INSERT INTO ItemDefinitions (Name, Category, Tier, Weight, IsActive, CreatedAtUtc, DeletedAtUtc, ExternalId)
VALUES (@Name, @Category, @Tier, @Weight, @IsActive, @CreatedAtUtc, @DeletedAtUtc, @ExternalId);",
                        new
                        {
                            Name = item.Name,
                            Category = string.IsNullOrWhiteSpace(item.Category) ? null : item.Category,
                            Tier = item.Tier,
                            Weight = item.Weight <= 0 ? 1 : item.Weight,
                            IsActive = item.IsActive ? 1 : 0,
                            CreatedAtUtc = string.IsNullOrWhiteSpace(item.CreatedAtUtc) ? nowUtc : item.CreatedAtUtc,
                            DeletedAtUtc = string.IsNullOrWhiteSpace(item.DeletedAtUtc) ? null : item.DeletedAtUtc,
                            ExternalId = string.IsNullOrWhiteSpace(item.ExternalId) ? null : item.ExternalId
                        },
                        tx);
                }
            }

            foreach (var reward in save.RewardsLedger ?? new List<RewardsLedgerPortableExport>())
            {
                if (string.IsNullOrWhiteSpace(reward.ForGameDay) || string.IsNullOrWhiteSpace(reward.AwardedAtUtc))
                    continue;

                await conn.ExecuteAsync(@"
INSERT INTO RewardsLedger (ExternalId, ForGameDay, AwardedAtUtc, RewardType, Amount, HabitId, HabitDate, FocusSessionId)
VALUES (@ExternalId, @ForGameDay, @AwardedAtUtc, @RewardType, @Amount, NULL, @HabitDate, NULL);",
                    new
                    {
                        ExternalId = string.IsNullOrWhiteSpace(reward.ExternalId) ? LowerHex16() : reward.ExternalId,
                        ForGameDay = reward.ForGameDay,
                        AwardedAtUtc = reward.AwardedAtUtc,
                        RewardType = reward.RewardType,
                        Amount = reward.Amount,
                        HabitDate = string.IsNullOrWhiteSpace(reward.HabitDate) ? null : reward.HabitDate
                    },
                    tx);
            }

            tx.Commit();
        }
        #endregion // SECTION C5 — Import helpers (gamification replace)

        #region SECTION D1 — Export queries (database archive)
        private static void EnsureSchemas()
        {
            Db.EnsureCreated();
            FoodSchema.EnsureCreated();
            SleepSchema.EnsureCreated();
            HabitsSchema.EnsureCreated();
            StepsSchema.EnsureCreated();
            FocusLabelsSchema.EnsureCreated();
            RewardsSchema.EnsureCreated();
            ItemDropsSchema.EnsureCreated();
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

        private static async Task<List<FocusLabelExport>> GetFocusLabelsAsync()
        {
            using var conn = Db.OpenConnection();
            var rows = await conn.QueryAsync<FocusLabelExport>(@"
                SELECT
                    COALESCE(ExternalId, '') AS ExternalId,
                    Name,
                    CASE WHEN IsActive = 1 THEN 1 ELSE 0 END AS IsActiveInt,
                    CreatedAtUtc,
                    DeletedAtUtc
                FROM FocusLabels
                ORDER BY Name COLLATE NOCASE ASC;
            ");

            var list = new List<FocusLabelExport>();
            foreach (var row in rows)
            {
                row.IsActive = row.IsActiveInt == 1;
                list.Add(row);
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

        #endregion // SECTION D1 — Export queries (database archive)

        #region SECTION D2 — Export queries (gamification save)
        private static async Task<GamificationSettingsExport> GetGamificationSettingsExportAsync()
        {
            using var conn = Db.OpenConnection();
            return await conn.QuerySingleAsync<GamificationSettingsExport>(@"
                SELECT
                    StepsPerItemRoll,
                    ItemRollOneInN,
                    COALESCE(CommonTierWeight, 80) AS CommonTierWeight,
                    COALESCE(UncommonTierWeight, 18) AS UncommonTierWeight,
                    COALESCE(RareTierWeight, 2) AS RareTierWeight,
                    COALESCE(ItemPoolText, '') AS ItemPoolText,
                    COALESCE(CommonPoolText, '') AS CommonPoolText,
                    COALESCE(UncommonPoolText, '') AS UncommonPoolText,
                    COALESCE(RarePoolText, '') AS RarePoolText,
                    COALESCE(SleepHealthyMinHours, 6.0) AS SleepHealthyMinHours,
                    COALESCE(SleepHealthyMaxHours, 10.0) AS SleepHealthyMaxHours,
                    COALESCE(SleepHealthyMultiplier, 1.10) AS SleepHealthyMultiplier,
                    COALESCE(SleepOutsideRangeStartMultiplier, 1.05) AS SleepOutsideRangeStartMultiplier,
                    COALESCE(SleepPenaltyPer15Min, 0.005) AS SleepPenaltyPer15Min,
                    COALESCE(SleepTrackedMinimumMultiplier, 1.01) AS SleepTrackedMinimumMultiplier,
                    COALESCE(FocusXpPerMinute, 100.0) AS FocusXpPerMinute,
                    COALESCE(FocusXpIncompleteMultiplier, 0.25) AS FocusXpIncompleteMultiplier,
                    UpdatedAtUtc
                FROM GamificationSettings
                WHERE Id = 1;
            ");
        }

        private static async Task<StepItemRollStateExport> GetStepItemRollStateExportAsync()
        {
            using var conn = Db.OpenConnection();
            return await conn.QuerySingleAsync<StepItemRollStateExport>(@"
                SELECT
                    StepsRemainder,
                    TotalRolls,
                    TotalSuccesses,
                    COALESCE(LastDropUtc, '') AS LastDropUtc,
                    COALESCE(LastDropSummary, '') AS LastDropSummary,
                    UpdatedAtUtc
                FROM StepItemRollState
                WHERE Id = 1;
            ");
        }

        private static async Task<TrainerProgressExport> GetTrainerProgressExportAsync()
        {
            using var conn = Db.OpenConnection();
            await EnsureTrainerProgressLifetimeColumnAsync(conn);

            return await conn.QuerySingleAsync<TrainerProgressExport>(@"
                SELECT
                    CurrentCycleXp,
                    COALESCE(TotalLifetimeXp, 0) AS TotalLifetimeXp,
                    PrestigeCount,
                    UpdatedAtUtc
                FROM TrainerProgress
                WHERE Id = 1;
            ");
        }

        private static async Task<List<RewardsLedgerPortableExport>> GetRewardsLedgerExportAsync()
        {
            using var conn = Db.OpenConnection();
            var rows = await conn.QueryAsync<RewardsLedgerPortableExport>(@"
                SELECT
                    COALESCE(ExternalId, '') AS ExternalId,
                    ForGameDay,
                    AwardedAtUtc,
                    RewardType,
                    Amount,
                    COALESCE(HabitDate, '') AS HabitDate
                FROM RewardsLedger
                ORDER BY AwardedAtUtc ASC, Id ASC;
            ");
            return new List<RewardsLedgerPortableExport>(rows);
        }

        private static async Task<List<InventoryItemExport>> GetInventoryItemsExportAsync()
        {
            using var conn = Db.OpenConnection();
            var rows = await conn.QueryAsync<InventoryItemExport>(@"
                SELECT ItemKey, Count
                FROM InventoryItems
                ORDER BY ItemKey COLLATE NOCASE ASC;
            ");
            return new List<InventoryItemExport>(rows);
        }

        private static async Task<List<ItemDefinitionExport>> GetItemDefinitionsExportAsync()
        {
            using var conn = Db.OpenConnection();
            var rows = await conn.QueryAsync<ItemDefinitionExport>(@"
                SELECT
                    Name,
                    COALESCE(Category, '') AS Category,
                    Tier,
                    Weight,
                    CASE WHEN IsActive = 1 THEN 1 ELSE 0 END AS IsActiveInt,
                    COALESCE(ExternalId, '') AS ExternalId,
                    COALESCE(CreatedAtUtc, '') AS CreatedAtUtc,
                    DeletedAtUtc
                FROM ItemDefinitions
                ORDER BY Tier ASC, Name ASC;
            ");

            var list = new List<ItemDefinitionExport>();
            foreach (var row in rows)
            {
                row.IsActive = row.IsActiveInt == 1;
                list.Add(row);
            }

            return list;
        }
        #endregion // SECTION D2 — Export queries (gamification save)



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
                        if (string.Equals(name, "FocusLabels.json", StringComparison.OrdinalIgnoreCase)) continue;

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
    #region SECTION F11 — Focus Label Export DTO
    public sealed class FocusLabelExport
    {
        public string ExternalId { get; set; } = "";
        public string Name { get; set; } = "";
        public bool IsActive { get; set; }
        public int IsActiveInt { get; set; }
        public string CreatedAtUtc { get; set; } = "";
        public string? DeletedAtUtc { get; set; }
    }
    #endregion // SECTION F11 — Focus Label Export DTO

    #region SECTION F12 — Gamification Save Export DTO
    public sealed class GamificationSaveExport
    {
        public int FormatVersion { get; set; }
        public string ExportedAtUtc { get; set; } = "";
        public string TimeZoneId { get; set; } = "";
        public string TimeZoneDisplayName { get; set; } = "";
        public TrainerProgressExport TrainerProgress { get; set; } = new();
        public List<RewardsLedgerPortableExport> RewardsLedger { get; set; } = new();
        public GamificationSettingsExport Settings { get; set; } = new();
        public StepItemRollStateExport StepItemRollState { get; set; } = new();
        public List<InventoryItemExport> Inventory { get; set; } = new();
        public List<ItemDefinitionExport> ItemDefinitions { get; set; } = new();
    }
    #endregion // SECTION F12 — Gamification Save Export DTO

    #region SECTION F13 — Trainer Progress Export DTO
    public sealed class TrainerProgressExport
    {
        public int CurrentCycleXp { get; set; }
        public long TotalLifetimeXp { get; set; }
        public int PrestigeCount { get; set; }
        public string UpdatedAtUtc { get; set; } = "";
    }
    #endregion // SECTION F13 — Trainer Progress Export DTO

    #region SECTION F14 — Rewards Ledger Portable Export DTO
    public sealed class RewardsLedgerPortableExport
    {
        public string ExternalId { get; set; } = "";
        public string ForGameDay { get; set; } = "";
        public string AwardedAtUtc { get; set; } = "";
        public int RewardType { get; set; }
        public int Amount { get; set; }
        public string HabitDate { get; set; } = "";
    }
    #endregion // SECTION F14 — Rewards Ledger Portable Export DTO

    #region SECTION F15 — Gamification Settings Export DTO
    public sealed class GamificationSettingsExport
    {
        public int StepsPerItemRoll { get; set; } = 1000;
        public int ItemRollOneInN { get; set; } = 4;
        public int CommonTierWeight { get; set; } = 80;
        public int UncommonTierWeight { get; set; } = 18;
        public int RareTierWeight { get; set; } = 2;
        public string ItemPoolText { get; set; } = "";
        public string CommonPoolText { get; set; } = "";
        public string UncommonPoolText { get; set; } = "";
        public string RarePoolText { get; set; } = "";
        public double SleepHealthyMinHours { get; set; } = 6.0;
        public double SleepHealthyMaxHours { get; set; } = 10.0;
        public double SleepHealthyMultiplier { get; set; } = 1.10;
        public double SleepOutsideRangeStartMultiplier { get; set; } = 1.05;
        public double SleepPenaltyPer15Min { get; set; } = 0.005;
        public double SleepTrackedMinimumMultiplier { get; set; } = 1.01;
        public double FocusXpPerMinute { get; set; } = 100.0;
        public double FocusXpIncompleteMultiplier { get; set; } = 0.25;
        public string UpdatedAtUtc { get; set; } = "";
    }
    #endregion // SECTION F15 — Gamification Settings Export DTO

    #region SECTION F16 — Step Item Roll State Export DTO
    public sealed class StepItemRollStateExport
    {
        public int StepsRemainder { get; set; }
        public long TotalRolls { get; set; }
        public long TotalSuccesses { get; set; }
        public string LastDropUtc { get; set; } = "";
        public string LastDropSummary { get; set; } = "";
        public string UpdatedAtUtc { get; set; } = "";
    }
    #endregion // SECTION F16 — Step Item Roll State Export DTO

    #region SECTION F17 — Inventory Item Export DTO
    public sealed class InventoryItemExport
    {
        public string ItemKey { get; set; } = "";
        public int Count { get; set; }
    }
    #endregion // SECTION F17 — Inventory Item Export DTO

    #region SECTION F18 — Item Definition Export DTO
    public sealed class ItemDefinitionExport
    {
        public string Name { get; set; } = "";
        public string Category { get; set; } = "";
        public int Tier { get; set; }
        public int Weight { get; set; }
        public bool IsActive { get; set; }
        public int IsActiveInt { get; set; }
        public string ExternalId { get; set; } = "";
        public string CreatedAtUtc { get; set; } = "";
        public string? DeletedAtUtc { get; set; }
    }
    #endregion // SECTION F18 — Item Definition Export DTO

}
