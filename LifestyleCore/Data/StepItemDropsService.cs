#region SECTION A — Step Item Drops Service
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using LifestyleCore.Models;

namespace LifestyleCore.Data
{
    public sealed class StepItemDropsService
    {
        #region SECTION B — Item Pools (v3: ItemDefinitions table)
        private static string NormalizeItemName(string? s)
        {
            s = (s ?? "").Trim();
            if (string.IsNullOrWhiteSpace(s))
                return "";

            // Collapse internal whitespace
            var chars = s.ToCharArray();
            var outChars = new List<char>(chars.Length);
            bool prevSpace = false;

            for (int i = 0; i < chars.Length; i++)
            {
                char c = chars[i];
                bool isSpace = char.IsWhiteSpace(c);

                if (isSpace)
                {
                    if (!prevSpace)
                    {
                        outChars.Add(' ');
                        prevSpace = true;
                    }

                    continue;
                }

                outChars.Add(c);
                prevSpace = false;
            }

            var collapsed = new string(outChars.ToArray()).Trim();

            // Title Words (Potion == potion)
            var words = collapsed.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            for (int i = 0; i < words.Length; i++)
            {
                var w = words[i];
                if (w.Length == 0)
                    continue;

                if (w.Length == 1)
                    words[i] = char.ToUpperInvariant(w[0]).ToString();
                else
                    words[i] = char.ToUpperInvariant(w[0]) + w.Substring(1).ToLowerInvariant();
            }

            return string.Join(' ', words);
        }

        private static int PickTierIndex(int commonW, int uncommonW, int rareW)
        {
            int cw = Math.Max(0, commonW);
            int uw = Math.Max(0, uncommonW);
            int rw = Math.Max(0, rareW);

            int total = cw + uw + rw;
            if (total <= 0)
                return 0;

            int r = Random.Shared.Next(total); // 0..total-1
            if (r < cw)
                return 0;

            r -= cw;
            if (r < uw)
                return 1;

            return 2;
        }

        private static ItemDefinition? PickWeighted(IReadOnlyList<ItemDefinition> defs)
        {
            if (defs == null || defs.Count == 0)
                return null;

            int total = 0;
            for (int i = 0; i < defs.Count; i++)
                total += Math.Max(0, defs[i].Weight);

            if (total <= 0)
                return null;

            int r = Random.Shared.Next(total);
            for (int i = 0; i < defs.Count; i++)
            {
                r -= Math.Max(0, defs[i].Weight);
                if (r < 0)
                    return defs[i];
            }

            return defs[0];
        }
        #endregion // SECTION B — Item Pools (v3: ItemDefinitions table)

        #region SECTION C — Processing
        public async Task<(int Rolls, List<string> ItemsFound)> ProcessStepsAddedAsync(int stepsAdded)
        {
            ItemDropsSchema.EnsureCreated();

            if (stepsAdded <= 0)
                return (0, new List<string>());

            var settingsRepo = new GamificationSettingsRepository();
            var settings = await settingsRepo.GetAsync();

            int stepsPerRoll = Math.Max(1, settings.StepsPerItemRoll);
            int oneInN = Math.Max(1, settings.ItemRollOneInN);

            using var conn = Db.OpenConnection();
            using var tx = conn.BeginTransaction();

            // Load structured item definitions (active + weight > 0)
            async Task<List<ItemDefinition>> LoadDefsAsync(ItemTier tier)
            {
                var rows = await conn.QueryAsync<ItemDefinition>(@"
SELECT Name, Tier, Weight, IsActive
FROM ItemDefinitions
WHERE IsActive = 1 AND Tier = @Tier AND Weight > 0
ORDER BY Name ASC;",
                    new { Tier = (int)tier },
                    transaction: tx);

                return rows.ToList();
            }

            var commonDefs = await LoadDefsAsync(ItemTier.Common);
            var uncommonDefs = await LoadDefsAsync(ItemTier.Uncommon);
            var rareDefs = await LoadDefsAsync(ItemTier.Rare);

            // Safety: if all defs are empty, fall back to a tiny safe default (in-memory)
            if (commonDefs.Count == 0 && uncommonDefs.Count == 0 && rareDefs.Count == 0)
            {
                commonDefs = new List<ItemDefinition>
                {
                    new() { Name = "Potion", Tier = ItemTier.Common, Weight = 1, IsActive = true },
                    new() { Name = "Poke Ball", Tier = ItemTier.Common, Weight = 1, IsActive = true },
                    new() { Name = "Antidote", Tier = ItemTier.Common, Weight = 1, IsActive = true },
                };

                uncommonDefs = new List<ItemDefinition>
                {
                    new() { Name = "Super Potion", Tier = ItemTier.Uncommon, Weight = 1, IsActive = true },
                    new() { Name = "Great Ball", Tier = ItemTier.Uncommon, Weight = 1, IsActive = true },
                };

                rareDefs = new List<ItemDefinition>
                {
                    new() { Name = "Rare Candy", Tier = ItemTier.Rare, Weight = 1, IsActive = true },
                    new() { Name = "Nugget", Tier = ItemTier.Rare, Weight = 1, IsActive = true },
                };
            }

            var state = await conn.QuerySingleAsync<(int StepsRemainder, long TotalRolls, long TotalSuccesses)>(
                @"SELECT StepsRemainder, TotalRolls, TotalSuccesses FROM StepItemRollState WHERE Id = 1;",
                transaction: tx);

            int total = state.StepsRemainder + stepsAdded;
            int rolls = total / stepsPerRoll;
            int remainder = total % stepsPerRoll;

            if (rolls <= 0)
            {
                await conn.ExecuteAsync(@"
UPDATE StepItemRollState
SET StepsRemainder = @StepsRemainder,
    UpdatedAtUtc = @UpdatedAtUtc
WHERE Id = 1;",
                    new
                    {
                        StepsRemainder = remainder,
                        UpdatedAtUtc = DateTimeOffset.UtcNow.ToString("O")
                    },
                    transaction: tx);

                tx.Commit();
                return (0, new List<string>());
            }

            var found = new List<string>();
            var foundCounts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            long successes = 0;

            for (int i = 0; i < rolls; i++)
            {
                int r = Random.Shared.Next(oneInN);
                if (r != 0)
                    continue;

                successes++;

                int tierIdx = PickTierIndex(settings.CommonTierWeight, settings.UncommonTierWeight, settings.RareTierWeight);
                IReadOnlyList<ItemDefinition> pool = tierIdx switch
                {
                    2 => rareDefs,
                    1 => uncommonDefs,
                    _ => commonDefs
                };

                // Tier fallback if chosen tier has no active items
                if (pool.Count == 0)
                    pool = commonDefs.Count > 0 ? commonDefs : (uncommonDefs.Count > 0 ? uncommonDefs : rareDefs);

                var picked = PickWeighted(pool);
                string item = NormalizeItemName(picked?.Name ?? "Potion");

                found.Add(item);

                if (foundCounts.TryGetValue(item, out int c))
                    foundCounts[item] = c + 1;
                else
                    foundCounts[item] = 1;
            }

            // Batch inventory updates: one upsert per item type
            foreach (var kvp in foundCounts)
            {
                await conn.ExecuteAsync(@"
INSERT INTO InventoryItems (ItemKey, Count)
VALUES (@ItemKey, @Count)
ON CONFLICT(ItemKey) DO UPDATE SET
    Count = Count + excluded.Count;",
                    new
                    {
                        ItemKey = kvp.Key,
                        Count = kvp.Value
                    },
                    transaction: tx);
            }

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            // Build a compact “Potion x2, Nugget x1” style summary.
            string? dropSummary = null;
            if (foundCounts.Count > 0)
            {
                var parts = foundCounts
                    .OrderBy(k => k.Key, StringComparer.OrdinalIgnoreCase)
                    .Select(k => k.Value == 1 ? k.Key : $"{k.Key} x{k.Value}");

                dropSummary = string.Join(", ", parts);
            }

            await conn.ExecuteAsync(@"
UPDATE StepItemRollState
SET
    StepsRemainder = @StepsRemainder,
    TotalRolls = TotalRolls + @AddRolls,
    TotalSuccesses = TotalSuccesses + @AddSuccesses,
    UpdatedAtUtc = @UpdatedAtUtc,
    LastDropUtc = CASE WHEN @LastDropUtc IS NULL THEN LastDropUtc ELSE @LastDropUtc END,
    LastDropSummary = CASE WHEN @LastDropSummary IS NULL THEN LastDropSummary ELSE @LastDropSummary END
WHERE Id = 1;",
                new
                {
                    StepsRemainder = remainder,
                    AddRolls = rolls,
                    AddSuccesses = successes,
                    UpdatedAtUtc = nowUtc,
                    LastDropUtc = foundCounts.Count > 0 ? nowUtc : null,
                    LastDropSummary = dropSummary
                },
                transaction: tx);

            tx.Commit();
            return (rolls, found);
        }
        #endregion // SECTION C — Processing
    }
}
#endregion // SECTION A — Step Item Drops Service