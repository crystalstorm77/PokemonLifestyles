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

  -- v2: rarity buckets
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
");

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

            _created = true;
        }

    }
}

