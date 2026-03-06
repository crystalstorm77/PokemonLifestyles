// ============================================================
// SECTION A — Gamification Settings Repository
// ============================================================

using System;
using System.Threading.Tasks;
using Dapper;
using LifestyleCore.Models;

namespace LifestyleCore.Data
{
    public sealed class GamificationSettingsRepository
    {
        // ============================================================
        // SECTION B — Read / Write
        // ============================================================

        private const int DefaultCommonWeight = 80;
        private const int DefaultUncommonWeight = 18;
        private const int DefaultRareWeight = 2;

        private const string DefaultCommonPoolText =
            "Potion\n" +
            "Poke Ball\n" +
            "Antidote\n" +
            "Paralyze Heal\n" +
            "Escape Rope";

        private const string DefaultUncommonPoolText =
            "Super Potion\n" +
            "Great Ball\n" +
            "Revive";

        private const string DefaultRarePoolText =
            "Rare Candy\n" +
            "Nugget";

        // Legacy fallback for older DBs
        private const string LegacyDefaultPoolText =
            "Potion\n" +
            "Super Potion\n" +
            "Poke Ball\n" +
            "Great Ball\n" +
            "Revive\n" +
            "Antidote\n" +
            "Paralyze Heal\n" +
            "Escape Rope\n" +
            "Rare Candy\n" +
            "Nugget";

        public async Task<GamificationSettings> GetAsync()
        {
            ItemDropsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            var row = await conn.QuerySingleAsync<(
                int StepsPerItemRoll,
                int ItemRollOneInN,
                string? ItemPoolText, // legacy
                string? CommonPoolText,
                string? UncommonPoolText,
                string? RarePoolText,
                int CommonTierWeight,
                int UncommonTierWeight,
                int RareTierWeight
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
  RareTierWeight
FROM GamificationSettings
WHERE Id = 1;");

            // Fallback chain:
            // Common: CommonPoolText -> ItemPoolText (legacy) -> defaults
            string common = !string.IsNullOrWhiteSpace(row.CommonPoolText)
                ? row.CommonPoolText!
                : (!string.IsNullOrWhiteSpace(row.ItemPoolText) ? row.ItemPoolText! : DefaultCommonPoolText);

            // If we fell back to legacy ItemPoolText, we still want a proper Uncommon/Rare default
            string uncommon = string.IsNullOrWhiteSpace(row.UncommonPoolText) ? DefaultUncommonPoolText : row.UncommonPoolText!;
            string rare = string.IsNullOrWhiteSpace(row.RarePoolText) ? DefaultRarePoolText : row.RarePoolText!;

            // IMPORTANT: allow 0 to mean “disabled” (only negative is invalid)
            int cw = row.CommonTierWeight < 0 ? DefaultCommonWeight : row.CommonTierWeight;

            int uw = row.UncommonTierWeight < 0 ? 0 : row.UncommonTierWeight;
            int rw = row.RareTierWeight < 0 ? 0 : row.RareTierWeight;

            return new GamificationSettings
            {
                StepsPerItemRoll = row.StepsPerItemRoll,
                ItemRollOneInN = row.ItemRollOneInN,
                CommonPoolText = common,
                UncommonPoolText = uncommon,
                RarePoolText = rare,
                CommonTierWeight = cw,
                UncommonTierWeight = uw,
                RareTierWeight = rw
            };
        }

        // Backwards-compatible overloads
        public Task UpdateAsync(int stepsPerRoll, int oneInN)
            => UpdateAsync(stepsPerRoll, oneInN, DefaultCommonWeight, DefaultUncommonWeight, DefaultRareWeight, null, null, null);

        public Task UpdateAsync(int stepsPerRoll, int oneInN, int commonWeight, int uncommonWeight, int rareWeight)
            => UpdateAsync(stepsPerRoll, oneInN, commonWeight, uncommonWeight, rareWeight, null, null, null);

        public Task UpdateAsync(int stepsPerRoll, int oneInN, string? legacyCommonPoolText)
            => UpdateAsync(stepsPerRoll, oneInN, DefaultCommonWeight, DefaultUncommonWeight, DefaultRareWeight, legacyCommonPoolText, null, null);

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

            // If user clears a tier textbox, treat that as "use defaults for that tier"
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
    }
}
