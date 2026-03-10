#region SECTION A — Inventory Repository
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using LifestyleCore.Models;

namespace LifestyleCore.Data
{
    public sealed class InventoryRepository
    {
        #region SECTION B — Read / Write
        private static string NormalizeKey(string itemKey)
        {
            itemKey = (itemKey ?? "").Trim();
            if (string.IsNullOrWhiteSpace(itemKey)) return "";

            // Collapse internal whitespace to single spaces
            var chars = itemKey.ToCharArray();
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

            // Simple “Title Words” (Potion == potion)
            var words = collapsed.Split(' ', System.StringSplitOptions.RemoveEmptyEntries);
            for (int i = 0; i < words.Length; i++)
            {
                var w = words[i];
                if (w.Length == 0) continue;
                if (w.Length == 1) words[i] = char.ToUpperInvariant(w[0]).ToString();
                else words[i] = char.ToUpperInvariant(w[0]) + w.Substring(1).ToLowerInvariant();
            }

            return string.Join(' ', words);
        }

        public async Task<List<InventoryItem>> GetAllAsync()
        {
            ItemDropsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();
            var rows = await conn.QueryAsync<InventoryItem>(@"
SELECT ItemKey, Count
FROM InventoryItems
ORDER BY ItemKey COLLATE NOCASE ASC;");

            return rows.ToList();
        }

        // Keep existing API for callers, but route through the safer method.
        public Task AddItemAsync(string itemKey, int delta) => AdjustItemAsync(itemKey, delta);

        public async Task AdjustItemAsync(string itemKey, int delta)
        {
            ItemDropsSchema.EnsureCreated();

            itemKey = NormalizeKey(itemKey);
            if (string.IsNullOrWhiteSpace(itemKey)) return;
            if (delta == 0) return;

            using var conn = Db.OpenConnection();

            // Try to find an existing row case-insensitively so "Potion" and "potion" merge.
            var existingKey = await conn.QuerySingleOrDefaultAsync<string>(@"
SELECT ItemKey
FROM InventoryItems
WHERE ItemKey = @Key COLLATE NOCASE
LIMIT 1;",
                new { Key = itemKey });

            string dbKey = string.IsNullOrWhiteSpace(existingKey) ? itemKey : existingKey!;

            if (delta > 0)
            {
                await conn.ExecuteAsync(@"
INSERT INTO InventoryItems (ItemKey, Count)
VALUES (@ItemKey, @Count)
ON CONFLICT(ItemKey) DO UPDATE SET Count = Count + excluded.Count;",
                    new { ItemKey = dbKey, Count = delta });

                return;
            }

            // delta < 0: only affects existing items; delete row if it hits 0 or below.
            await conn.ExecuteAsync(@"
UPDATE InventoryItems
SET Count = Count + @Delta
WHERE ItemKey = @ItemKey;",
                new { ItemKey = dbKey, Delta = delta });

            await conn.ExecuteAsync(@"
DELETE FROM InventoryItems
WHERE ItemKey = @ItemKey AND Count <= 0;",
                new { ItemKey = dbKey });
        }

        public async Task ClearAsync()
        {
            ItemDropsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();
            await conn.ExecuteAsync(@"DELETE FROM InventoryItems;");
        }
        #endregion // SECTION B — Read / Write
    }
}
#endregion // SECTION A — Inventory Repository