// ============================================================
// SECTION A — Item Definitions Repository
// ============================================================

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using LifestyleCore.Models;

namespace LifestyleCore.Data
{
    public sealed class ItemDefinitionsRepository
    {
        // ============================================================
        // SECTION B — Public API
        // ============================================================

        public async Task<List<ItemDefinition>> GetAllAsync()
        {
            ItemDropsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();
            var rows = await conn.QueryAsync<ItemDefinition>(@"
SELECT
  Name,
  COALESCE(Category,'') AS Category,
  Tier,
  Weight,
  IsActive,
  COALESCE(ExternalId,'') AS ExternalId,
  COALESCE(CreatedAtUtc,'') AS CreatedAtUtc,
  DeletedAtUtc
FROM ItemDefinitions
ORDER BY Tier ASC, Name ASC;
");
            return rows.ToList();
        }

        public async Task<List<ItemDefinition>> GetActiveByTierAsync(ItemTier tier)
        {
            ItemDropsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();
            var rows = await conn.QueryAsync<ItemDefinition>(@"
SELECT
  Name,
  COALESCE(Category,'') AS Category,
  Tier,
  Weight,
  IsActive,
  COALESCE(ExternalId,'') AS ExternalId,
  COALESCE(CreatedAtUtc,'') AS CreatedAtUtc,
  DeletedAtUtc
FROM ItemDefinitions
WHERE IsActive = 1
  AND Tier = @Tier
  AND Weight > 0
ORDER BY Name ASC;
", new { Tier = (int)tier });

            return rows.ToList();
        }

        // Backwards-compatible overload (existing callers)
        public Task UpsertActiveAsync(string name, ItemTier tier, int weight)
            => UpsertActiveAsync(name, tier, weight, category: null);

        public async Task UpsertActiveAsync(string name, ItemTier tier, int weight, string? category)
        {
            ItemDropsSchema.EnsureCreated();

            string norm = NormalizeItemName(name);
            if (string.IsNullOrWhiteSpace(norm)) throw new InvalidOperationException("Item name cannot be empty.");

            string cat = NormalizeCategory(category);
            string? catToStore = string.IsNullOrWhiteSpace(cat) ? null : cat;

            if (weight <= 0) weight = 1;

            using var conn = Db.OpenConnection();
            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            await conn.ExecuteAsync(@"
INSERT INTO ItemDefinitions (Name, Category, Tier, Weight, IsActive, CreatedAtUtc, DeletedAtUtc)
VALUES (@Name, @Category, @Tier, @Weight, 1, @NowUtc, NULL)
ON CONFLICT(Name) DO UPDATE SET
  Tier = excluded.Tier,
  Weight = excluded.Weight,
  IsActive = 1,
  DeletedAtUtc = NULL,
  Category = CASE
    WHEN excluded.Category IS NULL OR TRIM(excluded.Category) = '' THEN ItemDefinitions.Category
    ELSE excluded.Category
  END;
", new
            {
                Name = norm,
                Category = catToStore,
                Tier = (int)tier,
                Weight = weight,
                NowUtc = nowUtc
            });
        }

        public async Task UpsertManyAsync(IEnumerable<ItemDefinition> items)
        {
            ItemDropsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();
            using var tx = conn.BeginTransaction();

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            foreach (var it in items ?? Array.Empty<ItemDefinition>())
            {
                string norm = NormalizeItemName(it.Name);
                if (string.IsNullOrWhiteSpace(norm)) continue;

                string cat = NormalizeCategory(it.Category);
                string? catToStore = string.IsNullOrWhiteSpace(cat) ? null : cat;

                int weight = it.Weight <= 0 ? 1 : it.Weight;
                int tier = (int)it.Tier;
                int active = it.IsActive ? 1 : 0;

                await conn.ExecuteAsync(@"
INSERT INTO ItemDefinitions (Name, Category, Tier, Weight, IsActive, CreatedAtUtc, DeletedAtUtc)
VALUES (@Name, @Category, @Tier, @Weight, @IsActive, @NowUtc, CASE WHEN @IsActive = 1 THEN NULL ELSE @NowUtc END)
ON CONFLICT(Name) DO UPDATE SET
  Category = excluded.Category,
  Tier = excluded.Tier,
  Weight = excluded.Weight,
  IsActive = excluded.IsActive,
  DeletedAtUtc = CASE WHEN excluded.IsActive = 1 THEN NULL ELSE COALESCE(ItemDefinitions.DeletedAtUtc, @NowUtc) END;
", new
                {
                    Name = norm,
                    Category = catToStore,
                    Tier = tier,
                    Weight = weight,
                    IsActive = active,
                    NowUtc = nowUtc
                }, tx);
            }

            tx.Commit();
        }

        public async Task SetActiveAsync(string name, bool isActive)
        {
            ItemDropsSchema.EnsureCreated();

            string norm = NormalizeItemName(name);
            if (string.IsNullOrWhiteSpace(norm)) return;

            using var conn = Db.OpenConnection();
            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            await conn.ExecuteAsync(@"
UPDATE ItemDefinitions
SET
  IsActive = @IsActive,
  DeletedAtUtc = CASE WHEN @IsActive = 1 THEN NULL ELSE COALESCE(DeletedAtUtc, @NowUtc) END
WHERE Name = @Name;
", new { Name = norm, IsActive = isActive ? 1 : 0, NowUtc = nowUtc });
        }

        public async Task ResetToDefaultsAsync()
        {
            ItemDropsSchema.EnsureCreated();

            var defaults = GetDefaultDefinitions();

            using var conn = Db.OpenConnection();
            using var tx = conn.BeginTransaction();

            await conn.ExecuteAsync("DELETE FROM ItemDefinitions;", transaction: tx);

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            foreach (var d in defaults)
            {
                string cat = NormalizeCategory(d.Category);
                string? catToStore = string.IsNullOrWhiteSpace(cat) ? null : cat;

                await conn.ExecuteAsync(@"
INSERT INTO ItemDefinitions (Name, Category, Tier, Weight, IsActive, CreatedAtUtc, DeletedAtUtc)
VALUES (@Name, @Category, @Tier, @Weight, 1, @NowUtc, NULL);
", new
                {
                    Name = d.Name,
                    Category = catToStore,
                    Tier = (int)d.Tier,
                    Weight = d.Weight <= 0 ? 1 : d.Weight,
                    NowUtc = nowUtc
                }, tx);
            }

            tx.Commit();
        }

        // ============================================================
        // SECTION C — Defaults + Normalization
        // ============================================================

        public static List<ItemDefinition> GetDefaultDefinitions()
        {
            return new List<ItemDefinition>
    {
        // Common
        new() { Name = "Potion", Tier = ItemTier.Common, Weight = 1, IsActive = true, Category = "Healing" },
        new() { Name = "Poke Ball", Tier = ItemTier.Common, Weight = 1, IsActive = true, Category = "Ball" },
        new() { Name = "Antidote", Tier = ItemTier.Common, Weight = 1, IsActive = true, Category = "Status" },
        new() { Name = "Paralyze Heal", Tier = ItemTier.Common, Weight = 1, IsActive = true, Category = "Status" },
        new() { Name = "Escape Rope", Tier = ItemTier.Common, Weight = 1, IsActive = true, Category = "Escape" },

        // Uncommon
        new() { Name = "Super Potion", Tier = ItemTier.Uncommon, Weight = 1, IsActive = true, Category = "Healing" },
        new() { Name = "Great Ball", Tier = ItemTier.Uncommon, Weight = 1, IsActive = true, Category = "Ball" },
        new() { Name = "Revive", Tier = ItemTier.Uncommon, Weight = 1, IsActive = true, Category = "Healing" },

        // Rare
        new() { Name = "Rare Candy", Tier = ItemTier.Rare, Weight = 1, IsActive = true, Category = "Candy" },
        new() { Name = "Nugget", Tier = ItemTier.Rare, Weight = 1, IsActive = true, Category = "Valuable" },
    };
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

        private static string NormalizeCategory(string? s)
        {
            s = (s ?? "").Trim();
            if (string.IsNullOrWhiteSpace(s)) return "";

            // collapse whitespace
            var parts = s.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries);
            s = string.Join(" ", parts);

            // Title Words if user typed lowercase
            bool allLower = s.Any(char.IsLetter) && s.Where(char.IsLetter).All(char.IsLower);

            if (allLower)
            {
                var words = s.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                for (int i = 0; i < words.Length; i++)
                {
                    var w = words[i];
                    if (w.Length == 0) continue;
                    if (w.Length == 1) words[i] = char.ToUpperInvariant(w[0]).ToString();
                    else words[i] = char.ToUpperInvariant(w[0]) + w.Substring(1).ToLowerInvariant();
                }
                s = string.Join(' ', words);
            }

            return s;
        }
    }
}