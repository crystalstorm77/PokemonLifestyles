using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using LifestyleCore.Models;

namespace LifestyleCore.Data
{
    public sealed class WeeklyBonusesGrantResult
    {
        #region SECTION A — Weekly Bonuses Grant Result
        public DateOnly AwardGameDay { get; set; }
        public DateOnly WeekStart { get; set; }
        public DateOnly WeekEnd { get; set; }
        public int GrantedSleepBonusCount { get; set; }
        public int GrantedHabitBonusCount { get; set; }
        public int GrantedStepsBonusCount { get; set; }
        public int TotalTicketsGranted { get; set; }
        #endregion // SECTION A — Weekly Bonuses Grant Result
    }

    public sealed class WeeklyBonusesService
    {
        #region SECTION A — Weekly Bonuses Service Fields
        private readonly RewardsLedgerRepository _rewards = new();
        private readonly GamificationSettingsRepository _settingsRepo = new();
        private readonly HabitRepository _habitRepo = new();
        private readonly SleepSessionRepository _sleepRepo = new();
        private readonly StepsRepository _stepsRepo = new();

        private sealed class HabitBonusCandidate
        {
            public long Id { get; set; }
            public HabitKind Kind { get; set; }
            public int TargetPerWeek { get; set; }
            public string? CreatedAtUtc { get; set; }
            public string? ArchivedAtUtc { get; set; }
        }
        #endregion // SECTION A — Weekly Bonuses Service Fields

        #region SECTION B — Grant Weekly Bonuses
        public Task<WeeklyBonusesGrantResult> GrantMostRecentCompletedWeekAsync()
        {
            return GrantMostRecentCompletedWeekAsync(DateTimeOffset.Now);
        }

        public async Task<WeeklyBonusesGrantResult> GrantMostRecentCompletedWeekAsync(DateTimeOffset currentLocalNow)
        {
            ItemDropsSchema.EnsureCreated();
            HabitsSchema.EnsureCreated();
            SleepSchema.EnsureCreated();
            StepsSchema.EnsureCreated();
            RewardsSchema.EnsureCreated();

            var currentGameDay = SleepRewardCalculator.GetGameDayForWakeLocal(currentLocalNow.LocalDateTime);
            var mostRecentCompletedDay = currentGameDay.AddDays(-1);
            var weekStart = GetWeekStartMonday(mostRecentCompletedDay);
            var weekEnd = weekStart.AddDays(6);

            var settings = NormalizeWeeklyBonusSettings(await _settingsRepo.GetAsync());
            var result = new WeeklyBonusesGrantResult
            {
                AwardGameDay = currentGameDay,
                WeekStart = weekStart,
                WeekEnd = weekEnd
            };

            await GrantWeeklySleepTrackingBonusAsync(settings, weekStart, currentGameDay, result);
            await GrantWeeklyStepsTrackingBonusAsync(settings, weekStart, currentGameDay, result);

            return result;
        }

        public Task<WeeklyBonusesGrantResult> GrantCurrentWeekHabitBonusesAsync()
        {
            return GrantCurrentWeekHabitBonusesAsync(DateTimeOffset.Now);
        }

        public async Task<WeeklyBonusesGrantResult> GrantCurrentWeekHabitBonusesAsync(DateTimeOffset currentLocalNow)
        {
            ItemDropsSchema.EnsureCreated();
            HabitsSchema.EnsureCreated();
            RewardsSchema.EnsureCreated();

            var currentGameDay = SleepRewardCalculator.GetGameDayForWakeLocal(currentLocalNow.LocalDateTime);
            var weekStart = GetWeekStartMonday(currentGameDay);
            var weekEnd = weekStart.AddDays(6);

            var settings = NormalizeWeeklyBonusSettings(await _settingsRepo.GetAsync());
            var result = new WeeklyBonusesGrantResult
            {
                AwardGameDay = currentGameDay,
                WeekStart = weekStart,
                WeekEnd = weekEnd
            };

            await GrantWeeklyHabitTrackingBonusesAsync(settings, weekStart, weekEnd, currentGameDay, result);

            return result;
        }

        private async Task GrantWeeklySleepTrackingBonusAsync(
            GamificationSettings settings,
            DateOnly weekStart,
            DateOnly awardGameDay,
            WeeklyBonusesGrantResult result)
        {
            if (settings.WeeklySleepTrackingBonus <= 0)
                return;

            int requiredDays = Math.Clamp(settings.WeeklySleepTrackingQuota, 1, 7);
            int successfulDays = 0;

            for (int i = 0; i < 7; i++)
            {
                var day = weekStart.AddDays(i);
                var sessions = await _sleepRepo.GetForWakeDateAsync(day);

                var summary = SleepRewardCalculator.Calculate(
                    sessions.OrderBy(x => x.EndUtc).ThenBy(x => x.Id).Select(x => Math.Max(0, x.DurationMinutes)),
                    settings.SleepHealthyMinHours,
                    settings.SleepHealthyMaxHours,
                    settings.SleepHealthyMultiplier,
                    settings.SleepPenaltyPer15Min,
                    settings.SleepTrackedMinimumMultiplier,
                    settings.SleepRewardMinimumMinutes);

                if (summary.QualifyingSessionCount > 0)
                    successfulDays++;
            }

            if (successfulDays < requiredDays)
                return;

            bool granted = await _rewards.TryGrantWeeklySleepTrackingBonusAsync(
                weekStart,
                awardGameDay,
                settings.WeeklySleepTrackingBonus);

            if (!granted)
                return;

            result.GrantedSleepBonusCount++;
            result.TotalTicketsGranted += settings.WeeklySleepTrackingBonus;
        }

        private async Task GrantWeeklyHabitTrackingBonusesAsync(
            GamificationSettings settings,
            DateOnly weekStart,
            DateOnly weekEnd,
            DateOnly awardGameDay,
            WeeklyBonusesGrantResult result)
        {
            if (settings.WeeklyHabitTrackingBonus <= 0)
                return;

            var habits = await GetHabitBonusCandidatesAsync(weekStart, weekEnd);
            if (habits.Count == 0)
                return;

            var weekTotals = await _habitRepo.GetWeekTotalsAsync(weekStart, weekEnd);

            foreach (var habit in habits)
            {
                if (!weekTotals.TryGetValue(habit.Id, out int weekTotal))
                    continue;

                if (weekTotal < habit.TargetPerWeek)
                    continue;

                bool granted = await _rewards.TryGrantWeeklyHabitTrackingBonusAsync(
                    habit.Id,
                    weekStart,
                    awardGameDay,
                    settings.WeeklyHabitTrackingBonus);

                if (!granted)
                    continue;

                result.GrantedHabitBonusCount++;
                result.TotalTicketsGranted += settings.WeeklyHabitTrackingBonus;
            }
        }

        private async Task GrantWeeklyStepsTrackingBonusAsync(
            GamificationSettings settings,
            DateOnly weekStart,
            DateOnly awardGameDay,
            WeeklyBonusesGrantResult result)
        {
            if (settings.WeeklyStepsTrackingBonus <= 0)
                return;

            if (settings.DailyStepsGoalQuota <= 0)
                return;

            int successfulDays = 0;

            for (int i = 0; i < 7; i++)
            {
                var day = weekStart.AddDays(i);
                int steps = await _stepsRepo.GetStepsForDateAsync(day);

                if (steps >= settings.DailyStepsGoal)
                    successfulDays++;
            }

            if (successfulDays < settings.DailyStepsGoalQuota)
                return;

            bool granted = await _rewards.TryGrantWeeklyStepsTrackingBonusAsync(
                weekStart,
                awardGameDay,
                settings.WeeklyStepsTrackingBonus);

            if (!granted)
                return;

            result.GrantedStepsBonusCount++;
            result.TotalTicketsGranted += settings.WeeklyStepsTrackingBonus;
        }
        #endregion // SECTION B — Grant Weekly Bonuses

        #region SECTION C — Weekly Bonus Helpers
        private static DateOnly GetWeekStartMonday(DateOnly date)
        {
            int diff = ((int)date.DayOfWeek - (int)DayOfWeek.Monday + 7) % 7;
            return date.AddDays(-diff);
        }

        private static GamificationSettings NormalizeWeeklyBonusSettings(GamificationSettings settings)
        {
            settings ??= new GamificationSettings();

            settings.WeeklySleepTrackingBonus = Math.Max(0, settings.WeeklySleepTrackingBonus);
            settings.WeeklySleepTrackingQuota = Math.Clamp(settings.WeeklySleepTrackingQuota, 1, 7);
            settings.WeeklyHabitTrackingBonus = Math.Max(0, settings.WeeklyHabitTrackingBonus);
            settings.DailyStepsGoal = Math.Max(1, settings.DailyStepsGoal);
            settings.DailyStepsGoalQuota = Math.Clamp(settings.DailyStepsGoalQuota, 1, 7);
            settings.WeeklyStepsTrackingBonus = Math.Max(0, settings.WeeklyStepsTrackingBonus);

            return settings;
        }

        private static bool TryParseUtcIsoToLocalDate(string? utcIso, out DateOnly localDate)
        {
            localDate = default;

            string s = (utcIso ?? "").Trim();
            if (string.IsNullOrWhiteSpace(s))
                return false;

            if (!DateTimeOffset.TryParse(s, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var dto))
                return false;

            localDate = DateOnly.FromDateTime(dto.ToLocalTime().DateTime);
            return true;
        }

        private static async Task EnsureHabitsArchiveColumnAsync(System.Data.IDbConnection conn)
        {
            var colNames = (await conn.QueryAsync<string>("SELECT name FROM pragma_table_info('Habits');"))
                .Select(x => (x ?? "").Trim())
                .ToList();

            bool hasArchivedAtUtc = colNames.Any(n => string.Equals(n, "ArchivedAtUtc", StringComparison.OrdinalIgnoreCase));
            if (!hasArchivedAtUtc)
                await conn.ExecuteAsync("ALTER TABLE Habits ADD COLUMN ArchivedAtUtc TEXT NULL;");
        }

        private async Task<List<HabitBonusCandidate>> GetHabitBonusCandidatesAsync(DateOnly weekStart, DateOnly weekEnd)
        {
            using var conn = Db.OpenConnection();
            await EnsureHabitsArchiveColumnAsync(conn);

            var rows = await conn.QueryAsync<HabitBonusCandidate>(@"
SELECT Id, Kind, TargetPerWeek, CreatedAtUtc, ArchivedAtUtc
FROM Habits
WHERE TargetPerWeek > 0;");

            var result = new List<HabitBonusCandidate>();

            foreach (var row in rows)
            {
                if (TryParseUtcIsoToLocalDate(row.CreatedAtUtc, out var createdLocal) && createdLocal > weekEnd)
                    continue;

                if (TryParseUtcIsoToLocalDate(row.ArchivedAtUtc, out var archivedLocal) && archivedLocal < weekStart)
                    continue;

                result.Add(row);
            }

            return result;
        }
        #endregion // SECTION C — Weekly Bonus Helpers
    }
}