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

        private const string DefaultCommonPoolText =
            "Potion" + "Poke Ball" + "Antidote" + "Paralyze Heal" + "Escape Rope";

        private const string DefaultUncommonPoolText =
            "Super Potion" +"Great Ball" +"Revive";

        private const string DefaultRarePoolText =
            "Rare Candy" +"Nugget";

        // Legacy fallback for older DBs
        private const string LegacyDefaultPoolText =
            "Potion" +"Super Potion" +"Poke Ball" +"Great Ball" +"Revive" +"Antidote" +"Paralyze Heal" +"Escape Rope" +"Rare Candy" +"Nugget";

        public async Task<GamificationSettings> GetAsync()
        {
            ItemDropsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            var row = await conn.QuerySingleAsync<(
                int StepsPerItemRoll,
                int ItemRollOneInN,
                string? ItemPoolText,
                string? CommonPoolText,
                string? UncommonPoolText,
                string? RarePoolText,
                int CommonTierWeight,
                int UncommonTierWeight,
                int RareTierWeight,
                double? SleepHealthyMinHours,
                double? SleepHealthyMaxHours,
                double? SleepHealthyMultiplier,
                double? SleepOutsideRangeStartMultiplier,
                double? SleepPenaltyPer15Min,
                double? SleepTrackedMinimumMultiplier,
                int? SleepRewardMinimumMinutes,
                double? FocusXpPerMinute,
                double? FocusXpIncompleteMultiplier
            )>(@"
SELECT
  StepsPerItemRoll,
  ItemRollOneInN,
  ItemPoolText,
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
  FocusXpIncompleteMultiplier
FROM GamificationSettings
WHERE Id = 1;");

            string common = !string.IsNullOrWhiteSpace(row.CommonPoolText)
                ? row.CommonPoolText!
                : (!string.IsNullOrWhiteSpace(row.ItemPoolText) ? row.ItemPoolText! : DefaultCommonPoolText);

            string uncommon = string.IsNullOrWhiteSpace(row.UncommonPoolText) ? DefaultUncommonPoolText : row.UncommonPoolText!;
            string rare = string.IsNullOrWhiteSpace(row.RarePoolText) ? DefaultRarePoolText : row.RarePoolText!;

            int cw = row.CommonTierWeight < 0 ? DefaultCommonWeight : row.CommonTierWeight;
            int uw = row.UncommonTierWeight < 0 ? 0 : row.UncommonTierWeight;
            int rw = row.RareTierWeight < 0 ? 0 : row.RareTierWeight;

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
                FocusXpIncompleteMultiplier = focusXpIncompleteMultiplier
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

