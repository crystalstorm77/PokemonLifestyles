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
        // SECTION B — Item Pools (v2)
        // ============================================================

        private static List<string> ParsePool(string? poolText)
        {
            if (string.IsNullOrWhiteSpace(poolText))
                return new List<string>();

            var lines = poolText.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
            var items = new List<string>(lines.Length);

            foreach (var raw in lines)
            {
                var norm = NormalizeItemName(raw);
                if (!string.IsNullOrWhiteSpace(norm))
                    items.Add(norm);
            }

            return items;
        }

        private static string NormalizeItemName(string? s)
        {
            s = (s ?? "").Trim();
            if (string.IsNullOrWhiteSpace(s)) return "";

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
                if (w.Length == 0) continue;
                if (w.Length == 1) words[i] = char.ToUpperInvariant(w[0]).ToString();
                else words[i] = char.ToUpperInvariant(w[0]) + w.Substring(1).ToLowerInvariant();
            }

            return string.Join(' ', words);
        }

        private static int PickTierIndex(int commonW, int uncommonW, int rareW)
        {
            int cw = Math.Max(0, commonW);
            int uw = Math.Max(0, uncommonW);
            int rw = Math.Max(0, rareW);

            int total = cw + uw + rw;
            if (total <= 0) return 0;

            int r = Random.Shared.Next(total); // 0..total-1
            if (r < cw) return 0;
            r -= cw;
            if (r < uw) return 1;
            return 2;
        }

        // ============================================================
        // SECTION C — Processing
        // ============================================================
        public async Task<(int Rolls, List<string> ItemsFound)> ProcessStepsAddedAsync(int stepsAdded)
        {
            ItemDropsSchema.EnsureCreated();

            if (stepsAdded <= 0)
                return (0, new List<string>());

            var settingsRepo = new GamificationSettingsRepository();
            var settings = await settingsRepo.GetAsync();

            int stepsPerRoll = Math.Max(1, settings.StepsPerItemRoll);
            int oneInN = Math.Max(1, settings.ItemRollOneInN);

            // Rarity pools
            var commonPool = ParsePool(settings.CommonPoolText);
            var uncommonPool = ParsePool(settings.UncommonPoolText);
            var rarePool = ParsePool(settings.RarePoolText);

            // Safety: if all pools are somehow empty, fall back to a tiny safe default
            if (commonPool.Count == 0 && uncommonPool.Count == 0 && rarePool.Count == 0)
            {
                commonPool.AddRange(new[] { "Potion", "Poke Ball", "Antidote" });
                uncommonPool.AddRange(new[] { "Super Potion", "Great Ball" });
                rarePool.AddRange(new[] { "Rare Candy", "Nugget" });
            }

            using var conn = Db.OpenConnection();
            using var tx = conn.BeginTransaction();

            var state = await conn.QuerySingleAsync<(int StepsRemainder, long TotalRolls, long TotalSuccesses)>(
                @"SELECT StepsRemainder, TotalRolls, TotalSuccesses
          FROM StepItemRollState
          WHERE Id = 1;",
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
                if (r != 0) continue;

                successes++;

                int tier = PickTierIndex(settings.CommonTierWeight, settings.UncommonTierWeight, settings.RareTierWeight);

                List<string> pool = tier switch
                {
                    1 => uncommonPool,
                    2 => rarePool,
                    _ => commonPool
                };

                // If chosen tier is empty, fall back to the first non-empty tier.
                if (pool.Count == 0)
                {
                    if (commonPool.Count > 0) pool = commonPool;
                    else if (uncommonPool.Count > 0) pool = uncommonPool;
                    else pool = rarePool;
                }

                string item = pool[Random.Shared.Next(pool.Count)];
                item = NormalizeItemName(item);

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
ON CONFLICT(ItemKey) DO UPDATE SET Count = Count + excluded.Count;",
                    new { ItemKey = kvp.Key, Count = kvp.Value },
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
SET StepsRemainder = @StepsRemainder,
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

    }
}