using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using LifestyleCore.Models;

namespace LifestyleCore.Data
{
    public sealed class SleepSessionRepository
    {
        #region SECTION B — Pending start helpers
        public async Task<DateTimeOffset?> GetPendingStartUtcAsync()
        {
            SleepSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            var row = await conn.QueryFirstOrDefaultAsync<string?>(
                "SELECT StartUtc FROM PendingSleep WHERE Id = 1;");

            if (string.IsNullOrWhiteSpace(row))
                return null;

            return DateTimeOffset.Parse(row);
        }

        public async Task SetPendingStartUtcAsync(DateTimeOffset startUtc)
        {
            SleepSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            await conn.ExecuteAsync(@"
INSERT INTO PendingSleep (Id, StartUtc)
VALUES (1, @StartUtc)
ON CONFLICT(Id) DO UPDATE SET
    StartUtc = excluded.StartUtc;",
                new { StartUtc = startUtc.ToString("O") });
        }

        public async Task ClearPendingAsync()
        {
            SleepSchema.EnsureCreated();

            using var conn = Db.OpenConnection();
            await conn.ExecuteAsync("DELETE FROM PendingSleep WHERE Id = 1;");
        }
        #endregion // SECTION B — Pending start helpers

        #region SECTION C — Create session from pending
        public async Task<long> EndSleepNowAsync()
        {
            SleepSchema.EnsureCreated();

            var pending = await GetPendingStartUtcAsync();
            if (!pending.HasValue)
                throw new InvalidOperationException("No pending sleep start exists.");

            var startUtc = pending.Value;
            var endUtc = DateTimeOffset.UtcNow;

            if (endUtc <= startUtc)
                throw new InvalidOperationException("Sleep end must be after sleep start.");

            var endLocal = endUtc.ToLocalTime();
            var wakeLogDate = DateOnly.FromDateTime(endLocal.DateTime);
            int durationMinutes = (int)Math.Round((endUtc - startUtc).TotalMinutes);

            using var conn = Db.OpenConnection();

            const string sql = @"
INSERT INTO SleepSessions (StartUtc, EndUtc, WakeLogDate, DurationMinutes)
VALUES (@StartUtc, @EndUtc, @WakeLogDate, @DurationMinutes);
SELECT last_insert_rowid();
";

            long id = await conn.ExecuteScalarAsync<long>(sql, new
            {
                StartUtc = startUtc.ToString("O"),
                EndUtc = endUtc.ToString("O"),
                WakeLogDate = wakeLogDate.ToString("yyyy-MM-dd"),
                DurationMinutes = durationMinutes
            });

            await ClearPendingAsync();

            return id;
        }
        #endregion // SECTION C — Create session from pending

        #region SECTION D — Query
        public async Task<IReadOnlyList<SleepSession>> GetForWakeDateAsync(DateOnly wakeLogDate)
        {
            SleepSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            const string sql = @"
SELECT Id, StartUtc, EndUtc, WakeLogDate, DurationMinutes
FROM SleepSessions
WHERE WakeLogDate = @WakeLogDate
ORDER BY Id DESC;
";

            var rows = await conn.QueryAsync(sql, new
            {
                WakeLogDate = wakeLogDate.ToString("yyyy-MM-dd")
            });

            return rows.Select(r => new SleepSession
            {
                Id = (long)r.Id,
                StartUtc = DateTimeOffset.Parse((string)r.StartUtc),
                EndUtc = DateTimeOffset.Parse((string)r.EndUtc),
                WakeLogDate = DateOnly.Parse((string)r.WakeLogDate),
                DurationMinutes = (int)r.DurationMinutes
            }).ToList();
        }
        #endregion // SECTION D — Query
    }
}