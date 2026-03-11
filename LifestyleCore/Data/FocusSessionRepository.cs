using Dapper;
using LifestyleCore.Data;
using LifestyleCore.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LifestyleCore.Data
{
    public sealed class FocusSessionRepository
    {
        #region SECTION B — Add
        private readonly RewardsLedgerRepository _rewards = new();
        private readonly GamificationSettingsRepository _gamiSettings = new();
        private readonly SleepSessionRepository _sleepSessions = new();

        private static bool IsWithinRewardWindow(DateOnly logDate, DateTimeOffset loggedAtLocal)
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
                    return loggedAtLocal.UtcDateTime < cutoffUtc;
                }
                catch
                {
                    probe = probe.AddHours(1);
                }
            }

            return false;
        }

        private async Task<double> GetSleepRewardMultiplierAsync(DateOnly gameDay, GamificationSettings settings)
        {
            var sleepSessions = await _sleepSessions.GetForWakeDateAsync(gameDay);

            var orderedDurations = sleepSessions
                .OrderBy(x => x.EndUtc)
                .ThenBy(x => x.Id)
                .Select(x => Math.Max(0, x.DurationMinutes));

            var summary = SleepRewardCalculator.Calculate(
                orderedDurations,
                settings.SleepHealthyMinHours,
                settings.SleepHealthyMaxHours,
                settings.SleepHealthyMultiplier,
                settings.SleepPenaltyPer15Min,
                settings.SleepTrackedMinimumMultiplier,
                settings.SleepRewardMinimumMinutes);

            return Math.Max(1.0, summary.Multiplier);
        }

        private static int CalculateFocusCoins(int minutes, bool completed, double sleepMultiplier)
        {
            if (minutes <= 0)
                return 0;

            double normalizedSleepMultiplier = Math.Max(1.0, sleepMultiplier);
            double completionMultiplier = completed ? 1.0 : 0.25;

            return (int)Math.Floor(minutes * completionMultiplier * normalizedSleepMultiplier);
        }

        private static int CalculateFocusTrainerXp(
            int minutes,
            bool completed,
            double focusXpPerMinute,
            double focusXpIncompleteMultiplier,
            double sleepMultiplier)
        {
            if (minutes <= 0)
                return 0;

            double normalizedXpPerMinute = Math.Max(0.0, focusXpPerMinute);
            double normalizedIncompleteMultiplier = Math.Clamp(focusXpIncompleteMultiplier, 0.0, 1.0);
            double normalizedSleepMultiplier = Math.Max(1.0, sleepMultiplier);
            double completionMultiplier = completed ? 1.0 : normalizedIncompleteMultiplier;

            return (int)Math.Floor(minutes * normalizedXpPerMinute * completionMultiplier * normalizedSleepMultiplier);
        }

        public Task<long> AddAsync(FocusSession session)
        {
            return AddAsync(session, grantRewards: true);
        }

        public async Task<long> AddAsync(FocusSession session, bool grantRewards)
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

            if (grantRewards && IsWithinRewardWindow(session.LogDate, session.LoggedAtUtc.ToLocalTime()))
            {
                var gami = await _gamiSettings.GetAsync();
                double sleepMultiplier = await GetSleepRewardMultiplierAsync(session.LogDate, gami);

                int trainerXp = CalculateFocusTrainerXp(
                    session.Minutes,
                    session.Completed,
                    gami.FocusXpPerMinute,
                    gami.FocusXpIncompleteMultiplier,
                    sleepMultiplier);

                if (trainerXp > 0)
                    await _rewards.TryGrantFocusTrainerXpAsync(id, session.LogDate, trainerXp);

                int coins = CalculateFocusCoins(session.Minutes, session.Completed, sleepMultiplier);

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

