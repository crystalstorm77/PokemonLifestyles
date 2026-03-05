// ============================================================
// SECTION A — Habit Repository
// ============================================================

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;
using LifestyleCore.Models;

namespace LifestyleCore.Data
{
    public sealed class HabitRepository
    {
        // ============================================================
        // SECTION B — Habits
        // ============================================================

        public async Task AddHabitAsync(string title, HabitKind kind, int targetPerWeek, DateOnly? createdOnLocalDate = null)
        {
            HabitsSchema.EnsureCreated();

            title = (title ?? "").Trim();
            if (string.IsNullOrWhiteSpace(title))
                throw new InvalidOperationException("Habit title can’t be blank.");

            if (targetPerWeek <= 0)
                throw new InvalidOperationException("TargetPerWeek must be > 0.");

            using var conn = Db.OpenConnection();

            // If provided (debug/time-travel), anchor the habit's creation to the selected local date.
            // Otherwise use "now".
            DateTimeOffset createdUtc = createdOnLocalDate.HasValue
                ? LocalDateToUtcAnchor(createdOnLocalDate.Value)
                : DateTimeOffset.UtcNow;

            string now = createdUtc.ToString("O");

            await conn.ExecuteAsync(@"
        INSERT INTO Habits (Title, Kind, TargetPerWeek, IsArchived, CreatedAtUtc, UpdatedAtUtc)
        VALUES (@Title, @Kind, @TargetPerWeek, 0, @Now, @Now);",
                new
                {
                    Title = title,
                    Kind = (int)kind,
                    TargetPerWeek = targetPerWeek,
                    Now = now
                });
        }

        public async Task<List<Habit>> GetActiveHabitsAsync()
        {
            HabitsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();
            var rows = await conn.QueryAsync<Habit>(@"
        SELECT
            Id,
            ExternalId,
            Title,
            Kind,
            TargetPerWeek,
            IsArchived,
            CreatedAtUtc,
            UpdatedAtUtc
        FROM Habits
        WHERE IsArchived = 0
        ORDER BY Title COLLATE NOCASE ASC;
    ");
            return new List<Habit>(rows);
        }

        public async Task ArchiveHabitAsync(long habitId)
        {
            HabitsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();
            string now = DateTimeOffset.UtcNow.ToString("O");

            await conn.ExecuteAsync(@"
        UPDATE Habits
        SET IsArchived = 1,
            UpdatedAtUtc = @Now
        WHERE Id = @Id;",
                new { Id = habitId, Now = now });
        }

        // Use local NOON as a safe anchor (avoids DST invalid/ambiguous midnight edge cases).
        private static DateTimeOffset LocalDateToUtcAnchor(DateOnly localDate)
        {
            var localNoon = new DateTime(localDate.Year, localDate.Month, localDate.Day, 12, 0, 0, DateTimeKind.Unspecified);
            var utc = TimeZoneInfo.ConvertTimeToUtc(localNoon, TimeZoneInfo.Local);
            return new DateTimeOffset(utc, TimeSpan.Zero);
        }

        // ============================================================
        // SECTION C — Habit entries (daily)
        // ============================================================

        public async Task<List<HabitEntry>> GetEntriesForDateAsync(DateOnly date)
        {
            HabitsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();
            string d = date.ToString("yyyy-MM-dd");

            var rows = await conn.QueryAsync<HabitEntry>(@"
        SELECT
            Id,
            ExternalId,
            HabitId,
            Date,
            Value,
            UpdatedAtUtc
        FROM HabitEntries
        WHERE Date = @Date;",
                new { Date = d });

            return new List<HabitEntry>(rows);
        }

        public async Task<Dictionary<long, int>> GetWeekTotalsAsync(DateOnly weekStart, DateOnly weekEnd)
        {
            HabitsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            string s = weekStart.ToString("yyyy-MM-dd");
            string e = weekEnd.ToString("yyyy-MM-dd");

            var rows = await conn.QueryAsync<(long HabitId, long Total)>(@"
        SELECT HabitId, SUM(Value) AS Total
        FROM HabitEntries
        WHERE Date >= @Start AND Date <= @End
        GROUP BY HabitId;",
                new { Start = s, End = e });

            var dict = new Dictionary<long, int>();
            foreach (var r in rows)
                dict[r.HabitId] = (int)r.Total;

            return dict;
        }

        public async Task AddDailyDeltaAsync(long habitId, DateOnly date, int delta)
        {
            HabitsSchema.EnsureCreated();

            if (delta <= 0)
                throw new InvalidOperationException("delta must be > 0.");

            string d = date.ToString("yyyy-MM-dd");
            string now = DateTimeOffset.UtcNow.ToString("O");

            using var conn = Db.OpenConnection();

            await conn.ExecuteAsync(@"
        INSERT INTO HabitEntries (HabitId, Date, Value, UpdatedAtUtc)
        VALUES (@HabitId, @Date, @Value, @UpdatedAtUtc)
        ON CONFLICT(HabitId, Date) DO UPDATE SET
            Value = Value + excluded.Value,
            UpdatedAtUtc = excluded.UpdatedAtUtc;",
                new
                {
                    HabitId = habitId,
                    Date = d,
                    Value = delta,
                    UpdatedAtUtc = now
                });
        }

        public async Task SetDailyValueAsync(long habitId, DateOnly date, int value)
        {
            HabitsSchema.EnsureCreated();

            string d = date.ToString("yyyy-MM-dd");
            string now = DateTimeOffset.UtcNow.ToString("O");

            using var conn = Db.OpenConnection();

            if (value <= 0)
            {
                // Treat 0/unchecked as “no entry”
                await conn.ExecuteAsync(
                    "DELETE FROM HabitEntries WHERE HabitId = @HabitId AND Date = @Date;",
                    new { HabitId = habitId, Date = d });
                return;
            }

            await conn.ExecuteAsync(@"
        INSERT INTO HabitEntries (HabitId, Date, Value, UpdatedAtUtc)
        VALUES (@HabitId, @Date, @Value, @UpdatedAtUtc)
        ON CONFLICT(HabitId, Date) DO UPDATE SET
            Value = excluded.Value,
            UpdatedAtUtc = excluded.UpdatedAtUtc;",
                new
                {
                    HabitId = habitId,
                    Date = d,
                    Value = value,
                    UpdatedAtUtc = now
                });
        }
    }
}