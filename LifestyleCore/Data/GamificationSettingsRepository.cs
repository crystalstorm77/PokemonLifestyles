using Dapper;
using LifestyleCore.Data;
using LifestyleCore.Models;
using System;
using System.Threading.Tasks;

namespace LifestyleCore.Data
{
    public sealed class GamificationSettingsRepository
    {
        #region SECTION B — Read / Write
        private const int DefaultCommonWeight = 80;
        private const int DefaultUncommonWeight = 18;
        private const int DefaultRareWeight = 2;

        private const double DefaultSleepHealthyMinHours = 7.0;
        private const double DefaultSleepHealthyMaxHours = 9.0;
        private const double DefaultSleepHealthyMultiplier = 1.30;
        private const double DefaultSleepOutsideRangeStartMultiplier = 1.30;
        private const double DefaultSleepPenaltyPer15Min = 0.01;
        private const double DefaultSleepTrackedMinimumMultiplier = 1.10;
        private const int DefaultSleepRewardMinimumMinutes = 60;

        private const double DefaultFocusXpPerMinute = 100.0;
        private const double DefaultFocusXpIncompleteMultiplier = 0.25;

        private const int DefaultWeeklySleepTrackingBonus = 7;
        private const int DefaultWeeklyHabitTrackingBonus = 3;
        private const int DefaultDailyStepsGoal = 10000;
        private const int DefaultDailyStepsGoalQuota = 5;
        private const int DefaultWeeklyStepsTrackingBonus = 5;

        private const string DefaultCommonPoolText =
            "Potion\nPoke Ball\nAntidote\nParalyze Heal\nEscape Rope";

        private const string DefaultUncommonPoolText =
            "Super Potion\nGreat Ball\nRevive";

        private const string DefaultRarePoolText =
            "Rare Candy\nNugget";

        private sealed class SettingsRow
        {
            public int StepsPerItemRoll { get; set; }
            public int ItemRollOneInN { get; set; }
            public string? CommonPoolText { get; set; }
            public string? UncommonPoolText { get; set; }
            public string? RarePoolText { get; set; }
            public int? CommonTierWeight { get; set; }
            public int? UncommonTierWeight { get; set; }
            public int? RareTierWeight { get; set; }
            public double? SleepHealthyMinHours { get; set; }
            public double? SleepHealthyMaxHours { get; set; }
            public double? SleepHealthyMultiplier { get; set; }
            public double? SleepOutsideRangeStartMultiplier { get; set; }
            public double? SleepPenaltyPer15Min { get; set; }
            public double? SleepTrackedMinimumMultiplier { get; set; }
            public int? SleepRewardMinimumMinutes { get; set; }
            public double? FocusXpPerMinute { get; set; }
            public double? FocusXpIncompleteMultiplier { get; set; }
            public int? WeeklySleepTrackingBonus { get; set; }
            public int? WeeklyHabitTrackingBonus { get; set; }
            public int? DailyStepsGoal { get; set; }
            public int? DailyStepsGoalQuota { get; set; }
            public int? WeeklyStepsTrackingBonus { get; set; }
        }

        public async Task<GamificationSettings> GetAsync()
        {
            ItemDropsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            var row = await conn.QuerySingleAsync<SettingsRow>(@"
SELECT
  StepsPerItemRoll,
  ItemRollOneInN,
  CommonPoolText,
  UncommonPoolText,
  RarePoolText,
  CommonTierWeight,
  UncommonTierWeight,
  RareTierWeight,
  SleepHealthyMinHours,
  SleepHealthyMaxHours,
  SleepHealthyMultiplier,
  SleepOutsideRangeStartMultiplier,
  SleepPenaltyPer15Min,
  SleepTrackedMinimumMultiplier,
  SleepRewardMinimumMinutes,
  FocusXpPerMinute,
  FocusXpIncompleteMultiplier,
  WeeklySleepTrackingBonus,
  WeeklyHabitTrackingBonus,
  DailyStepsGoal,
  DailyStepsGoalQuota,
  WeeklyStepsTrackingBonus
FROM GamificationSettings
WHERE Id = 1;");

            int cw = row.CommonTierWeight.GetValueOrDefault(DefaultCommonWeight);
            int uw = row.UncommonTierWeight.GetValueOrDefault(DefaultUncommonWeight);
            int rw = row.RareTierWeight.GetValueOrDefault(DefaultRareWeight);

            if (cw < 0) cw = DefaultCommonWeight;
            if (uw < 0) uw = DefaultUncommonWeight;
            if (rw < 0) rw = DefaultRareWeight;
            if (cw + uw + rw <= 0)
            {
                cw = DefaultCommonWeight;
                uw = DefaultUncommonWeight;
                rw = DefaultRareWeight;
            }

            string common = string.IsNullOrWhiteSpace(row.CommonPoolText) ? DefaultCommonPoolText : row.CommonPoolText.Trim();
            string uncommon = string.IsNullOrWhiteSpace(row.UncommonPoolText) ? DefaultUncommonPoolText : row.UncommonPoolText.Trim();
            string rare = string.IsNullOrWhiteSpace(row.RarePoolText) ? DefaultRarePoolText : row.RarePoolText.Trim();

            double sleepHealthyMinHours = row.SleepHealthyMinHours.GetValueOrDefault(DefaultSleepHealthyMinHours);
            if (sleepHealthyMinHours < 0)
                sleepHealthyMinHours = DefaultSleepHealthyMinHours;

            double sleepHealthyMaxHours = row.SleepHealthyMaxHours.GetValueOrDefault(DefaultSleepHealthyMaxHours);
            if (sleepHealthyMaxHours < sleepHealthyMinHours)
                sleepHealthyMaxHours = sleepHealthyMinHours;

            double sleepHealthyMultiplier = row.SleepHealthyMultiplier.GetValueOrDefault(DefaultSleepHealthyMultiplier);
            if (sleepHealthyMultiplier < 1.0)
                sleepHealthyMultiplier = DefaultSleepHealthyMultiplier;

            double sleepOutsideRangeStartMultiplier = row.SleepOutsideRangeStartMultiplier.GetValueOrDefault(DefaultSleepOutsideRangeStartMultiplier);
            if (sleepOutsideRangeStartMultiplier < 1.0)
                sleepOutsideRangeStartMultiplier = DefaultSleepOutsideRangeStartMultiplier;
            if (sleepOutsideRangeStartMultiplier > sleepHealthyMultiplier)
                sleepOutsideRangeStartMultiplier = sleepHealthyMultiplier;

            double sleepPenaltyPer15Min = row.SleepPenaltyPer15Min.GetValueOrDefault(DefaultSleepPenaltyPer15Min);
            if (sleepPenaltyPer15Min < 0)
                sleepPenaltyPer15Min = DefaultSleepPenaltyPer15Min;

            double sleepTrackedMinimumMultiplier = row.SleepTrackedMinimumMultiplier.GetValueOrDefault(DefaultSleepTrackedMinimumMultiplier);
            if (sleepTrackedMinimumMultiplier < 1.0)
                sleepTrackedMinimumMultiplier = DefaultSleepTrackedMinimumMultiplier;
            if (sleepTrackedMinimumMultiplier > sleepHealthyMultiplier)
                sleepTrackedMinimumMultiplier = sleepHealthyMultiplier;

            int sleepRewardMinimumMinutes = row.SleepRewardMinimumMinutes.GetValueOrDefault(DefaultSleepRewardMinimumMinutes);
            if (sleepRewardMinimumMinutes < 1)
                sleepRewardMinimumMinutes = DefaultSleepRewardMinimumMinutes;

            double focusXpPerMinute = row.FocusXpPerMinute.GetValueOrDefault(DefaultFocusXpPerMinute);
            if (focusXpPerMinute <= 0)
                focusXpPerMinute = DefaultFocusXpPerMinute;

            double focusXpIncompleteMultiplier = row.FocusXpIncompleteMultiplier.GetValueOrDefault(DefaultFocusXpIncompleteMultiplier);
            if (focusXpIncompleteMultiplier < 0)
                focusXpIncompleteMultiplier = DefaultFocusXpIncompleteMultiplier;
            if (focusXpIncompleteMultiplier > 1.0)
                focusXpIncompleteMultiplier = 1.0;

            int weeklySleepTrackingBonus = row.WeeklySleepTrackingBonus.GetValueOrDefault(DefaultWeeklySleepTrackingBonus);
            if (weeklySleepTrackingBonus < 0)
                weeklySleepTrackingBonus = DefaultWeeklySleepTrackingBonus;

            int weeklyHabitTrackingBonus = row.WeeklyHabitTrackingBonus.GetValueOrDefault(DefaultWeeklyHabitTrackingBonus);
            if (weeklyHabitTrackingBonus < 0)
                weeklyHabitTrackingBonus = DefaultWeeklyHabitTrackingBonus;

            int dailyStepsGoal = row.DailyStepsGoal.GetValueOrDefault(DefaultDailyStepsGoal);
            if (dailyStepsGoal < 1)
                dailyStepsGoal = DefaultDailyStepsGoal;

            int dailyStepsGoalQuota = row.DailyStepsGoalQuota.GetValueOrDefault(DefaultDailyStepsGoalQuota);
            if (dailyStepsGoalQuota < 1)
                dailyStepsGoalQuota = DefaultDailyStepsGoalQuota;
            if (dailyStepsGoalQuota > 7)
                dailyStepsGoalQuota = 7;

            int weeklyStepsTrackingBonus = row.WeeklyStepsTrackingBonus.GetValueOrDefault(DefaultWeeklyStepsTrackingBonus);
            if (weeklyStepsTrackingBonus < 0)
                weeklyStepsTrackingBonus = DefaultWeeklyStepsTrackingBonus;

            return new GamificationSettings
            {
                StepsPerItemRoll = row.StepsPerItemRoll,
                ItemRollOneInN = row.ItemRollOneInN,
                CommonPoolText = common,
                UncommonPoolText = uncommon,
                RarePoolText = rare,
                CommonTierWeight = cw,
                UncommonTierWeight = uw,
                RareTierWeight = rw,
                SleepHealthyMinHours = sleepHealthyMinHours,
                SleepHealthyMaxHours = sleepHealthyMaxHours,
                SleepHealthyMultiplier = sleepHealthyMultiplier,
                SleepOutsideRangeStartMultiplier = sleepOutsideRangeStartMultiplier,
                SleepPenaltyPer15Min = sleepPenaltyPer15Min,
                SleepTrackedMinimumMultiplier = sleepTrackedMinimumMultiplier,
                SleepRewardMinimumMinutes = sleepRewardMinimumMinutes,
                FocusXpPerMinute = focusXpPerMinute,
                FocusXpIncompleteMultiplier = focusXpIncompleteMultiplier,
                WeeklySleepTrackingBonus = weeklySleepTrackingBonus,
                WeeklyHabitTrackingBonus = weeklyHabitTrackingBonus,
                DailyStepsGoal = dailyStepsGoal,
                DailyStepsGoalQuota = dailyStepsGoalQuota,
                WeeklyStepsTrackingBonus = weeklyStepsTrackingBonus
            };
        }

        public Task UpdateAsync(int stepsPerRoll, int oneInN)
            => UpdateAsync(stepsPerRoll, oneInN, DefaultCommonWeight, DefaultUncommonWeight, DefaultRareWeight, null, null, null);

        public Task UpdateAsync(int stepsPerRoll, int oneInN, int commonWeight, int uncommonWeight, int rareWeight)
            => UpdateAsync(stepsPerRoll, oneInN, commonWeight, uncommonWeight, rareWeight, null, null, null);

        public Task UpdateAsync(int stepsPerRoll, int oneInN, string? legacyCommonPoolText)
            => UpdateAsync(stepsPerRoll, oneInN, DefaultCommonWeight, DefaultUncommonWeight, DefaultRareWeight, legacyCommonPoolText, null, null);

        public async Task UpdateFocusXpSettingsAsync(double focusXpPerMinute, double focusXpIncompleteMultiplier)
        {
            ItemDropsSchema.EnsureCreated();

            if (focusXpPerMinute <= 0)
                throw new InvalidOperationException("Focus XP per minute must be > 0.");

            if (focusXpIncompleteMultiplier < 0 || focusXpIncompleteMultiplier > 1.0)
                throw new InvalidOperationException("Focus XP incomplete multiplier must be between 0 and 1.");

            using var conn = Db.OpenConnection();

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            await conn.ExecuteAsync(@"
UPDATE GamificationSettings
SET
  FocusXpPerMinute = @FocusXpPerMinute,
  FocusXpIncompleteMultiplier = @FocusXpIncompleteMultiplier,
  UpdatedAtUtc = @UpdatedAtUtc
WHERE Id = 1;",
                new
                {
                    FocusXpPerMinute = focusXpPerMinute,
                    FocusXpIncompleteMultiplier = focusXpIncompleteMultiplier,
                    UpdatedAtUtc = nowUtc
                });
        }

        public async Task UpdateWeeklyBonusSettingsAsync(
            int weeklySleepTrackingBonus,
            int weeklyHabitTrackingBonus,
            int dailyStepsGoal,
            int dailyStepsGoalQuota,
            int weeklyStepsTrackingBonus)
        {
            ItemDropsSchema.EnsureCreated();

            if (weeklySleepTrackingBonus < 0)
                throw new InvalidOperationException("Weekly sleep tracking bonus must be >= 0.");

            if (weeklyHabitTrackingBonus < 0)
                throw new InvalidOperationException("Weekly habit tracking bonus must be >= 0.");

            if (dailyStepsGoal < 1)
                throw new InvalidOperationException("Daily steps goal must be >= 1.");

            if (dailyStepsGoalQuota < 1 || dailyStepsGoalQuota > 7)
                throw new InvalidOperationException("Daily steps goal quota must be between 1 and 7.");

            if (weeklyStepsTrackingBonus < 0)
                throw new InvalidOperationException("Weekly steps tracking bonus must be >= 0.");

            using var conn = Db.OpenConnection();
            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            await conn.ExecuteAsync(@"
UPDATE GamificationSettings
SET
  WeeklySleepTrackingBonus = @WeeklySleepTrackingBonus,
  WeeklyHabitTrackingBonus = @WeeklyHabitTrackingBonus,
  DailyStepsGoal = @DailyStepsGoal,
  DailyStepsGoalQuota = @DailyStepsGoalQuota,
  WeeklyStepsTrackingBonus = @WeeklyStepsTrackingBonus,
  UpdatedAtUtc = @UpdatedAtUtc
WHERE Id = 1;",
                new
                {
                    WeeklySleepTrackingBonus = weeklySleepTrackingBonus,
                    WeeklyHabitTrackingBonus = weeklyHabitTrackingBonus,
                    DailyStepsGoal = dailyStepsGoal,
                    DailyStepsGoalQuota = dailyStepsGoalQuota,
                    WeeklyStepsTrackingBonus = weeklyStepsTrackingBonus,
                    UpdatedAtUtc = nowUtc
                });
        }

        public async Task UpdateAsync(
            int stepsPerRoll,
            int oneInN,
            int commonWeight,
            int uncommonWeight,
            int rareWeight,
            string? commonPoolText,
            string? uncommonPoolText,
            string? rarePoolText)
        {
            ItemDropsSchema.EnsureCreated();

            if (stepsPerRoll <= 0) throw new InvalidOperationException("StepsPerItemRoll must be > 0.");
            if (oneInN <= 0) throw new InvalidOperationException("ItemRollOneInN must be > 0.");

            if (commonWeight < 0 || uncommonWeight < 0 || rareWeight < 0)
                throw new InvalidOperationException("Tier weights must be >= 0.");

            if (commonWeight + uncommonWeight + rareWeight <= 0)
                throw new InvalidOperationException("At least one tier weight must be > 0.");

            string? commonToStore = string.IsNullOrWhiteSpace(commonPoolText) ? null : commonPoolText.Trim();
            string? uncommonToStore = string.IsNullOrWhiteSpace(uncommonPoolText) ? null : uncommonPoolText.Trim();
            string? rareToStore = string.IsNullOrWhiteSpace(rarePoolText) ? null : rarePoolText.Trim();

            using var conn = Db.OpenConnection();

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            await conn.ExecuteAsync(@"
UPDATE GamificationSettings
SET
  StepsPerItemRoll = @StepsPerItemRoll,
  ItemRollOneInN = @ItemRollOneInN,
  CommonPoolText = @CommonPoolText,
  UncommonPoolText = @UncommonPoolText,
  RarePoolText = @RarePoolText,
  CommonTierWeight = @CommonTierWeight,
  UncommonTierWeight = @UncommonTierWeight,
  RareTierWeight = @RareTierWeight,
  UpdatedAtUtc = @UpdatedAtUtc
WHERE Id = 1;",
                new
                {
                    StepsPerItemRoll = stepsPerRoll,
                    ItemRollOneInN = oneInN,
                    CommonPoolText = commonToStore,
                    UncommonPoolText = uncommonToStore,
                    RarePoolText = rareToStore,
                    CommonTierWeight = commonWeight,
                    UncommonTierWeight = uncommonWeight,
                    RareTierWeight = rareWeight,
                    UpdatedAtUtc = nowUtc
                });
        }
        #endregion // SECTION B — Read / Write
    }
}

