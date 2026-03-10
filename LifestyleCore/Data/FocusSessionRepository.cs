#region SECTION A — Focus sessions repository (SQLite + Dapper)
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using LifestyleCore.Models;

namespace LifestyleCore.Data
{
    public sealed class FocusSessionRepository
    {
        #region SECTION B — Add
        private readonly RewardsLedgerRepository _rewards = new();

        private static bool IsWithinRewardWindow(DateOnly logDate)
        {
            // Rewards for a given log date are eligible until the next calendar day at 03:00 local.
            var tz = TimeZoneInfo.Local;
            var nextDay = logDate.AddDays(1);

            DateTime cutoffLocalUnspec = new DateTime(
                nextDay.Year, nextDay.Month, nextDay.Day,
                3, 0, 0,
                DateTimeKind.Unspecified);

            DateTime probe = cutoffLocalUnspec;

            for (int i = 0; i < 6; i++)
            {
                try
                {
                    var cutoffUtc = TimeZoneInfo.ConvertTimeToUtc(probe, tz);
                    return DateTimeOffset.UtcNow.UtcDateTime < cutoffUtc;
                }
                catch
                {
                    // DST edge cases: nudge forward and retry
                    probe = probe.AddHours(1);
                }
            }

            // Fail closed
            return false;
        }

        public async Task<long> AddAsync(FocusSession session)
        {
            Db.EnsureCreated();

            if (session == null)
                throw new ArgumentNullException(nameof(session));

            if (session.Minutes <= 0)
                throw new InvalidOperationException("Focus session minutes must be > 0.");

            using var conn = Db.OpenConnection();

            const string sql = @"
INSERT INTO FocusSessions (LoggedAtUtc, LogDate, FocusType, Minutes, Completed)
VALUES (@LoggedAtUtc, @LogDate, @FocusType, @Minutes, @Completed);
SELECT last_insert_rowid();
";

            var parameters = new
            {
                LoggedAtUtc = session.LoggedAtUtc.ToString("O"),
                LogDate = session.LogDate.ToString("yyyy-MM-dd"),
                FocusType = session.FocusType,
                Minutes = session.Minutes,
                Completed = session.Completed ? 1 : 0
            };

            long id = await conn.ExecuteScalarAsync<long>(sql, parameters);

            // Grant coins immediately (immutable ledger), only if within reward window for that log date.
            // v1 constants (later moves to Gamification settings):
            // - 1 coin per minute
            // - Completed: 1.0x
            // - Incomplete: 0.25x
            if (IsWithinRewardWindow(session.LogDate))
            {
                const double coinsPerMinute = 1.0;
                double mult = session.Completed ? 1.0 : 0.25;
                int coins = (int)Math.Floor(session.Minutes * coinsPerMinute * mult);

                if (coins > 0)
                    await _rewards.TryGrantFocusCoinsAsync(id, session.LogDate, coins);
            }

            return id;
        }
        #endregion // SECTION B — Add

        #region SECTION C — Query
        public async Task<IReadOnlyList<FocusSession>> GetForDateAsync(DateOnly logDate)
        {
            Db.EnsureCreated();

            using var conn = Db.OpenConnection();

            const string sql = @"
SELECT
    Id,
    LoggedAtUtc,
    LogDate,
    FocusType,
    Minutes,
    Completed
FROM FocusSessions
WHERE LogDate = @LogDate
ORDER BY Id DESC;
";

            var rows = await conn.QueryAsync<dynamic>(
                sql,
                new { LogDate = logDate.ToString("yyyy-MM-dd") });

            var list = rows.Select(r => new FocusSession
            {
                Id = (long)r.Id,
                LoggedAtUtc = DateTimeOffset.Parse((string)r.LoggedAtUtc),
                LogDate = DateOnly.Parse((string)r.LogDate),
                FocusType = (string)r.FocusType,
                Minutes = (int)r.Minutes,
                Completed = ((long)r.Completed) == 1
            }).ToList();

            return list;
        }
        #endregion // SECTION C — Query
    }
}
#endregion // SECTION A — Focus sessions repository (SQLite + Dapper)