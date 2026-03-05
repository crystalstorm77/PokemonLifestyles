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

        public async Task<GamificationSettings> GetAsync()
        {
            ItemDropsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            var row = await conn.QuerySingleAsync<(int StepsPerItemRoll, int ItemRollOneInN)>(@"
                SELECT StepsPerItemRoll, ItemRollOneInN
                FROM GamificationSettings
                WHERE Id = 1;");

            return new GamificationSettings
            {
                StepsPerItemRoll = row.StepsPerItemRoll,
                ItemRollOneInN = row.ItemRollOneInN
            };
        }

        public async Task UpdateAsync(int stepsPerRoll, int oneInN)
        {
            ItemDropsSchema.EnsureCreated();

            if (stepsPerRoll <= 0) throw new InvalidOperationException("StepsPerItemRoll must be > 0.");
            if (oneInN <= 0) throw new InvalidOperationException("ItemRollOneInN must be > 0.");

            using var conn = Db.OpenConnection();

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            await conn.ExecuteAsync(@"
                UPDATE GamificationSettings
                SET StepsPerItemRoll = @StepsPerItemRoll,
                    ItemRollOneInN = @ItemRollOneInN,
                    UpdatedAtUtc = @UpdatedAtUtc
                WHERE Id = 1;",
                new
                {
                    StepsPerItemRoll = stepsPerRoll,
                    ItemRollOneInN = oneInN,
                    UpdatedAtUtc = nowUtc
                });
        }
    }
}