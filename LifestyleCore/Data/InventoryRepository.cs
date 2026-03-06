// ============================================================
// SECTION A — Inventory Repository
// ============================================================

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using LifestyleCore.Models;

namespace LifestyleCore.Data
{
    public sealed class InventoryRepository
    {
        // ============================================================
        // SECTION B — Read / Write
        // ============================================================
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

            itemKey = (itemKey ?? "").Trim();
            if (string.IsNullOrWhiteSpace(itemKey)) return;
            if (delta == 0) return;

            using var conn = Db.OpenConnection();

            if (delta > 0)
            {
                await conn.ExecuteAsync(@"
INSERT INTO InventoryItems (ItemKey, Count)
VALUES (@ItemKey, @Count)
ON CONFLICT(ItemKey) DO UPDATE SET Count = Count + excluded.Count;",
                    new { ItemKey = itemKey, Count = delta });

                return;
            }

            // delta < 0: only affects existing items; delete row if it hits 0 or below.
            await conn.ExecuteAsync(@"
UPDATE InventoryItems
SET Count = Count + @Delta
WHERE ItemKey = @ItemKey;",
                new { ItemKey = itemKey, Delta = delta });

            await conn.ExecuteAsync(@"
DELETE FROM InventoryItems
WHERE ItemKey = @ItemKey
  AND Count <= 0;",
                new { ItemKey = itemKey });
        }

        public async Task ClearAsync()
        {
            ItemDropsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();
            await conn.ExecuteAsync(@"DELETE FROM InventoryItems;");
        }
    }
}