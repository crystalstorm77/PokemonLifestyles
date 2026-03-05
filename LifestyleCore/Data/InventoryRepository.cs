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

        public async Task AddItemAsync(string itemKey, int delta)
        {
            ItemDropsSchema.EnsureCreated();

            itemKey = (itemKey ?? "").Trim();
            if (string.IsNullOrWhiteSpace(itemKey)) return;
            if (delta == 0) return;

            using var conn = Db.OpenConnection();

            await conn.ExecuteAsync(@"
                INSERT INTO InventoryItems (ItemKey, Count)
                VALUES (@ItemKey, @Count)
                ON CONFLICT(ItemKey) DO UPDATE SET
                    Count = Count + excluded.Count;",
                new { ItemKey = itemKey, Count = delta });
        }
    }
}