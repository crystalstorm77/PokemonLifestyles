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

        private const string DefaultPoolText =
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

            var row = await conn.QuerySingleAsync<(int StepsPerItemRoll, int ItemRollOneInN, string? ItemPoolText)>(@"
SELECT StepsPerItemRoll, ItemRollOneInN, ItemPoolText
FROM GamificationSettings
WHERE Id = 1;");

            string pool = string.IsNullOrWhiteSpace(row.ItemPoolText) ? DefaultPoolText : row.ItemPoolText!;

            return new GamificationSettings
            {
                StepsPerItemRoll = row.StepsPerItemRoll,
                ItemRollOneInN = row.ItemRollOneInN,
                ItemPoolText = pool
            };
        }

        // Backwards-compatible overload
        public Task UpdateAsync(int stepsPerRoll, int oneInN)
            => UpdateAsync(stepsPerRoll, oneInN, null);

        public async Task UpdateAsync(int stepsPerRoll, int oneInN, string? itemPoolText)
        {
            ItemDropsSchema.EnsureCreated();

            if (stepsPerRoll <= 0) throw new InvalidOperationException("StepsPerItemRoll must be > 0.");
            if (oneInN <= 0) throw new InvalidOperationException("ItemRollOneInN must be > 0.");

            // If user clears it, treat that as "use defaults"
            string? poolToStore = string.IsNullOrWhiteSpace(itemPoolText) ? null : itemPoolText.Trim();

            using var conn = Db.OpenConnection();
            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            await conn.ExecuteAsync(@"
UPDATE GamificationSettings
SET StepsPerItemRoll = @StepsPerItemRoll,
    ItemRollOneInN = @ItemRollOneInN,
    ItemPoolText = @ItemPoolText,
    UpdatedAtUtc = @UpdatedAtUtc
WHERE Id = 1;",
                new
                {
                    StepsPerItemRoll = stepsPerRoll,
                    ItemRollOneInN = oneInN,
                    ItemPoolText = poolToStore,
                    UpdatedAtUtc = nowUtc
                });
        }
    }
}