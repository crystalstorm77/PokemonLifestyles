// ============================================================
// SECTION A — Step Item Drops Service
// ============================================================

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;
using LifestyleCore.Models;

namespace LifestyleCore.Data
{
    public sealed class StepItemDropsService
    {
        // ============================================================
        // SECTION B — Item Pool (v1)
        // ============================================================

        private static readonly string[] _defaultItemPool = new[]
        {
            "Potion",
            "Super Potion",
            "Poke Ball",
            "Great Ball",
            "Revive",
            "Antidote",
            "Paralyze Heal",
            "Escape Rope",
            "Rare Candy",
            "Nugget"
        };

        // ============================================================
        // SECTION C — Processing
        // ============================================================

        public async Task<(int Rolls, List<string> ItemsFound)> ProcessStepsAddedAsync(int stepsAdded)
        {
            ItemDropsSchema.EnsureCreated();

            if (stepsAdded <= 0)
                return (0, new List<string>());

            using var conn = Db.OpenConnection();

            // Settings
            var settings = await conn.QuerySingleAsync<(int StepsPerItemRoll, int ItemRollOneInN)>(@"
                SELECT StepsPerItemRoll, ItemRollOneInN
                FROM GamificationSettings
                WHERE Id = 1;");

            int stepsPerRoll = Math.Max(1, settings.StepsPerItemRoll);
            int oneInN = Math.Max(1, settings.ItemRollOneInN);

            // State
            var state = await conn.QuerySingleAsync<StepItemRollState>(@"
                SELECT StepsRemainder, TotalRolls, TotalSuccesses
                FROM StepItemRollState
                WHERE Id = 1;");

            int total = state.StepsRemainder + stepsAdded;
            int rolls = total / stepsPerRoll;
            int remainder = total % stepsPerRoll;

            if (rolls <= 0)
            {
                // Just update remainder
                await conn.ExecuteAsync(@"
                    UPDATE StepItemRollState
                    SET StepsRemainder = @StepsRemainder,
                        UpdatedAtUtc = @UpdatedAtUtc
                    WHERE Id = 1;",
                    new
                    {
                        StepsRemainder = remainder,
                        UpdatedAtUtc = DateTimeOffset.UtcNow.ToString("O")
                    });

                return (0, new List<string>());
            }

            var found = new List<string>();
            long successes = 0;

            for (int i = 0; i < rolls; i++)
            {
                // 1 in N chance
                int r = Random.Shared.Next(oneInN); // 0..N-1
                if (r == 0)
                {
                    string item = _defaultItemPool[Random.Shared.Next(_defaultItemPool.Length)];
                    found.Add(item);
                    successes++;

                    await conn.ExecuteAsync(@"
                        INSERT INTO InventoryItems (ItemKey, Count)
                        VALUES (@ItemKey, 1)
                        ON CONFLICT(ItemKey) DO UPDATE SET
                            Count = Count + 1;",
                        new { ItemKey = item });
                }
            }

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            await conn.ExecuteAsync(@"
                UPDATE StepItemRollState
                SET StepsRemainder = @StepsRemainder,
                    TotalRolls = TotalRolls + @AddRolls,
                    TotalSuccesses = TotalSuccesses + @AddSuccesses,
                    UpdatedAtUtc = @UpdatedAtUtc
                WHERE Id = 1;",
                new
                {
                    StepsRemainder = remainder,
                    AddRolls = rolls,
                    AddSuccesses = successes,
                    UpdatedAtUtc = nowUtc
                });

            return (rolls, found);
        }
    }
}