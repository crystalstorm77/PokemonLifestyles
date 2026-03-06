// ============================================================
// SECTION A — Item Drops Schema
// ============================================================

using System;
using Dapper;

namespace LifestyleCore.Data
{
    public static class ItemDropsSchema
    {
        private static bool _created = false;
        // ============================================================
        // SECTION B — Ensure Created
        // ============================================================

        public static void EnsureCreated()
        {
            if (_created) return;

            using var conn = Db.OpenConnection();

            conn.Execute(@"
CREATE TABLE IF NOT EXISTS GamificationSettings (
  Id INTEGER PRIMARY KEY CHECK (Id = 1),
  StepsPerItemRoll INTEGER NOT NULL,
  ItemRollOneInN INTEGER NOT NULL,

  -- Legacy (v1): kept for backwards-compat / migration
  ItemPoolText TEXT NULL,

  -- v2: rarity buckets (legacy UI pools)
  CommonPoolText TEXT NULL,
  UncommonPoolText TEXT NULL,
  RarePoolText TEXT NULL,

  CommonTierWeight INTEGER NOT NULL DEFAULT 80,
  UncommonTierWeight INTEGER NOT NULL DEFAULT 18,
  RareTierWeight INTEGER NOT NULL DEFAULT 2,

  UpdatedAtUtc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS StepItemRollState (
  Id INTEGER PRIMARY KEY CHECK (Id = 1),
  StepsRemainder INTEGER NOT NULL,
  TotalRolls INTEGER NOT NULL,
  TotalSuccesses INTEGER NOT NULL,
  UpdatedAtUtc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS InventoryItems (
  ItemKey TEXT PRIMARY KEY,
  Count INTEGER NOT NULL
);

-- v3: Structured item definitions (the “real game” table)
CREATE TABLE IF NOT EXISTS ItemDefinitions (
  Name TEXT NOT NULL PRIMARY KEY COLLATE NOCASE,
  Tier INTEGER NOT NULL,
  Weight INTEGER NOT NULL,
  IsActive INTEGER NOT NULL,
  CreatedAtUtc TEXT NOT NULL,
  DeletedAtUtc TEXT NULL,
  ExternalId TEXT NULL
);

CREATE INDEX IF NOT EXISTS IX_ItemDefinitions_TierActive
ON ItemDefinitions (Tier, IsActive);
");

            // ExternalId support (for archive merge patterns)
            DbMigrations.EnsureExternalIdSupport(conn, "ItemDefinitions");

            // Lightweight "migration": add new optional columns if missing.
            // (SQLite: ALTER TABLE ADD COLUMN is safe to try; it throws if it already exists.)
            void TryAddColumn(string sql)
            {
                try { conn.Execute(sql); } catch { /* ignore */ }
            }

            // Existing migrations
            TryAddColumn(@"ALTER TABLE StepItemRollState ADD COLUMN LastDropUtc TEXT NULL;");
            TryAddColumn(@"ALTER TABLE StepItemRollState ADD COLUMN LastDropSummary TEXT NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN ItemPoolText TEXT NULL;");

            // v2 rarity migrations
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN CommonPoolText TEXT NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN UncommonPoolText TEXT NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN RarePoolText TEXT NULL;");

            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN CommonTierWeight INTEGER NOT NULL DEFAULT 80;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN UncommonTierWeight INTEGER NOT NULL DEFAULT 18;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN RareTierWeight INTEGER NOT NULL DEFAULT 2;");

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            // Defaults (reasonable “starter rarity table”)
            string defaultCommon =
                "Potion\n" +
                "Poke Ball\n" +
                "Antidote\n" +
                "Paralyze Heal\n" +
                "Escape Rope";

            string defaultUncommon =
                "Super Potion\n" +
                "Great Ball\n" +
                "Revive";

            string defaultRare =
                "Rare Candy\n" +
                "Nugget";

            // Keep legacy default pool too (used only for migrating older DBs)
            string legacyDefaultPool =
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

            conn.Execute(@"
INSERT OR IGNORE INTO GamificationSettings
(Id, StepsPerItemRoll, ItemRollOneInN, ItemPoolText, CommonPoolText, UncommonPoolText, RarePoolText, CommonTierWeight, UncommonTierWeight, RareTierWeight, UpdatedAtUtc)
VALUES
(1, 1000, 4, @LegacyPool, @Common, @Uncommon, @Rare, 80, 18, 2, @NowUtc);",
                new
                {
                    LegacyPool = legacyDefaultPool,
                    Common = defaultCommon,
                    Uncommon = defaultUncommon,
                    Rare = defaultRare,
                    NowUtc = nowUtc
                });

            // If migrating from v1: copy ItemPoolText -> CommonPoolText if CommonPoolText is blank.
            conn.Execute(@"
UPDATE GamificationSettings
SET CommonPoolText = ItemPoolText
WHERE Id = 1
  AND (CommonPoolText IS NULL OR TRIM(CommonPoolText) = '')
  AND (ItemPoolText IS NOT NULL AND TRIM(ItemPoolText) <> '');");

            // Ensure tier pools are never empty (unless user explicitly wants a tier disabled via weight=0)
            conn.Execute(@"
UPDATE GamificationSettings
SET CommonPoolText = @Common
WHERE Id = 1
  AND (CommonPoolText IS NULL OR TRIM(CommonPoolText) = '');",
                new { Common = defaultCommon });

            conn.Execute(@"
UPDATE GamificationSettings
SET UncommonPoolText = @Uncommon
WHERE Id = 1
  AND (UncommonPoolText IS NULL OR TRIM(UncommonPoolText) = '');",
                new { Uncommon = defaultUncommon });

            conn.Execute(@"
UPDATE GamificationSettings
SET RarePoolText = @Rare
WHERE Id = 1
  AND (RarePoolText IS NULL OR TRIM(RarePoolText) = '');",
                new { Rare = defaultRare });

            conn.Execute(@"
INSERT OR IGNORE INTO StepItemRollState
(Id, StepsRemainder, TotalRolls, TotalSuccesses, UpdatedAtUtc)
VALUES
(1, 0, 0, 0, @NowUtc);",
                new { NowUtc = nowUtc });

            // ------------------------------------------------------------
            // Seed ItemDefinitions (v3) once (if empty)
            // - Migrates from the legacy pools so your current setup carries over
            // - Duplicates in pools become Weight
            // ------------------------------------------------------------
            long defCount = conn.ExecuteScalar<long>(@"SELECT COUNT(*) FROM ItemDefinitions;");
            if (defCount == 0)
            {
                var pools = conn.QuerySingle<(string? CommonPoolText, string? UncommonPoolText, string? RarePoolText)>(@"
SELECT
  CommonPoolText,
  UncommonPoolText,
  RarePoolText
FROM GamificationSettings
WHERE Id = 1;
");

                static string Norm(string? s)
                {
                    s = (s ?? "").Trim();
                    if (string.IsNullOrWhiteSpace(s)) return "";

                    // collapse whitespace
                    var parts = s.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries);
                    s = string.Join(" ", parts);

                    // title-case words (Potion == potion)
                    var words = s.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                    for (int i = 0; i < words.Length; i++)
                    {
                        var w = words[i];
                        if (w.Length == 0) continue;
                        if (w.Length == 1) words[i] = char.ToUpperInvariant(w[0]).ToString();
                        else words[i] = char.ToUpperInvariant(w[0]) + w.Substring(1).ToLowerInvariant();
                    }
                    return string.Join(' ', words);
                }

                static System.Collections.Generic.Dictionary<string, int> CountPool(string? text)
                {
                    var dict = new System.Collections.Generic.Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
                    if (string.IsNullOrWhiteSpace(text)) return dict;

                    var lines = text.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
                    foreach (var raw in lines)
                    {
                        var n = Norm(raw);
                        if (string.IsNullOrWhiteSpace(n)) continue;

                        if (!dict.TryGetValue(n, out int c)) c = 0;
                        dict[n] = c + 1; // duplicates => weight
                    }
                    return dict;
                }

                var rareDict = CountPool(pools.RarePoolText);
                var uncommonDict = CountPool(pools.UncommonPoolText);
                var commonDict = CountPool(pools.CommonPoolText);

                // Rarest wins if an item appears in multiple tiers during migration
                void InsertAll(System.Collections.Generic.Dictionary<string, int> dict, int tier)
                {
                    foreach (var kv in dict)
                    {
                        conn.Execute(@"
INSERT OR IGNORE INTO ItemDefinitions (Name, Tier, Weight, IsActive, CreatedAtUtc, DeletedAtUtc)
VALUES (@Name, @Tier, @Weight, 1, @NowUtc, NULL);",
                            new
                            {
                                Name = kv.Key,
                                Tier = tier,
                                Weight = Math.Max(1, kv.Value),
                                NowUtc = nowUtc
                            });
                    }
                }

                InsertAll(rareDict, 2);      // Rare
                InsertAll(uncommonDict, 1);  // Uncommon
                InsertAll(commonDict, 0);    // Common

                // If STILL empty (edge case), seed hard defaults
                defCount = conn.ExecuteScalar<long>(@"SELECT COUNT(*) FROM ItemDefinitions;");
                if (defCount == 0)
                {
                    void InsertDefaults(string text, int tier)
                    {
                        var lines = text.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
                        foreach (var raw in lines)
                        {
                            var n = Norm(raw);
                            if (string.IsNullOrWhiteSpace(n)) continue;

                            conn.Execute(@"
INSERT OR IGNORE INTO ItemDefinitions (Name, Tier, Weight, IsActive, CreatedAtUtc, DeletedAtUtc)
VALUES (@Name, @Tier, 1, 1, @NowUtc, NULL);",
                                new { Name = n, Tier = tier, NowUtc = nowUtc });
                        }
                    }

                    InsertDefaults(defaultRare, 2);
                    InsertDefaults(defaultUncommon, 1);
                    InsertDefaults(defaultCommon, 0);
                }
            }

            _created = true;
        }

    }
}

