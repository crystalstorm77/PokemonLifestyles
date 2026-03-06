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
  ItemPoolText TEXT NULL,
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

            // NEW migration: configurable item pool
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN ItemPoolText TEXT NULL;");

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            string defaultPool =
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
(Id, StepsPerItemRoll, ItemRollOneInN, ItemPoolText, UpdatedAtUtc)
VALUES
(1, 1000, 4, @DefaultPool, @NowUtc);",
                new { DefaultPool = defaultPool, NowUtc = nowUtc });

            // If the row already exists but ItemPoolText is empty/null, seed it.
            conn.Execute(@"
UPDATE GamificationSettings
SET ItemPoolText = @DefaultPool
WHERE Id = 1
  AND (ItemPoolText IS NULL OR TRIM(ItemPoolText) = '');",
                new { DefaultPool = defaultPool });

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

