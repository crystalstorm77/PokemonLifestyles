using Dapper;
using LifestyleCore.Data;
using System;

namespace LifestyleCore.Data
{
    public static class ItemDropsSchema
    {
        #region SECTION A — Item Drops Schema
        private static bool _created = false;
        #endregion // SECTION A — Item Drops Schema

        #region SECTION B — Ensure Created
        public static void EnsureCreated()
        {
            if (_created) return;

            using var conn = Db.OpenConnection();

            conn.Execute(@"
CREATE TABLE IF NOT EXISTS GamificationSettings (
 Id INTEGER PRIMARY KEY CHECK (Id = 1),
 StepsPerItemRoll INTEGER NOT NULL,
 ItemRollOneInN INTEGER NOT NULL,
 CommonTierWeight INTEGER NULL,
 UncommonTierWeight INTEGER NULL,
 RareTierWeight INTEGER NULL,
 ItemPoolText TEXT NULL,
 CommonPoolText TEXT NULL,
 UncommonPoolText TEXT NULL,
 RarePoolText TEXT NULL,
 SleepHealthyMinHours REAL NULL,
 SleepHealthyMaxHours REAL NULL,
 SleepHealthyMultiplier REAL NULL,
 SleepOutsideRangeStartMultiplier REAL NULL,
 SleepPenaltyPer15Min REAL NULL,
 SleepTrackedMinimumMultiplier REAL NULL,
 SleepRewardMinimumMinutes INTEGER NULL,
 FocusXpPerMinute REAL NULL,
 FocusXpIncompleteMultiplier REAL NULL,
 UpdatedAtUtc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS StepItemRollState (
 Id INTEGER PRIMARY KEY CHECK (Id = 1),
 StepsRemainder INTEGER NOT NULL,
 TotalRolls INTEGER NOT NULL,
 TotalSuccesses INTEGER NOT NULL,
 LastDropUtc TEXT NULL,
 LastDropSummary TEXT NULL,
 UpdatedAtUtc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS InventoryItems (
 ItemKey TEXT PRIMARY KEY,
 Count INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ItemDefinitions (
 Name TEXT PRIMARY KEY,
 Category TEXT NULL,
 Tier INTEGER NOT NULL,
 Weight INTEGER NOT NULL,
 IsActive INTEGER NOT NULL,
 CreatedAtUtc TEXT NULL,
 DeletedAtUtc TEXT NULL,
 ExternalId TEXT NULL
);

CREATE INDEX IF NOT EXISTS IX_ItemDefinitions_IsActive_Tier
ON ItemDefinitions (IsActive, Tier);
");

            void TryAddColumn(string sql)
            {
                try { conn.Execute(sql); } catch { /* ignore */ }
            }

            TryAddColumn(@"ALTER TABLE StepItemRollState ADD COLUMN LastDropUtc TEXT NULL;");
            TryAddColumn(@"ALTER TABLE StepItemRollState ADD COLUMN LastDropSummary TEXT NULL;");

            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN CommonTierWeight INTEGER NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN UncommonTierWeight INTEGER NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN RareTierWeight INTEGER NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN ItemPoolText TEXT NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN CommonPoolText TEXT NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN UncommonPoolText TEXT NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN RarePoolText TEXT NULL;");

            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN SleepHealthyMinHours REAL NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN SleepHealthyMaxHours REAL NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN SleepHealthyMultiplier REAL NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN SleepOutsideRangeStartMultiplier REAL NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN SleepPenaltyPer15Min REAL NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN SleepTrackedMinimumMultiplier REAL NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN SleepRewardMinimumMinutes INTEGER NULL;");

            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN FocusXpPerMinute REAL NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN FocusXpIncompleteMultiplier REAL NULL;");

            TryAddColumn(@"ALTER TABLE ItemDefinitions ADD COLUMN Category TEXT NULL;");
            TryAddColumn(@"ALTER TABLE ItemDefinitions ADD COLUMN CreatedAtUtc TEXT NULL;");
            TryAddColumn(@"ALTER TABLE ItemDefinitions ADD COLUMN DeletedAtUtc TEXT NULL;");
            TryAddColumn(@"ALTER TABLE ItemDefinitions ADD COLUMN ExternalId TEXT NULL;");

            DbMigrations.EnsureExternalIdSupport(conn, "ItemDefinitions");

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            conn.Execute(@"
INSERT OR IGNORE INTO GamificationSettings
(Id, StepsPerItemRoll, ItemRollOneInN, UpdatedAtUtc)
VALUES
(1, 1000, 4, @NowUtc);",
                new { NowUtc = nowUtc });

            conn.Execute(@"
UPDATE GamificationSettings
SET
 CommonTierWeight = COALESCE(CommonTierWeight, 80),
 UncommonTierWeight = COALESCE(UncommonTierWeight, 18),
 RareTierWeight = COALESCE(RareTierWeight, 2),
 CommonPoolText = COALESCE(CommonPoolText, 'Potion\nPoke Ball\nAntidote\nParalyze Heal\nEscape Rope'),
 UncommonPoolText = COALESCE(UncommonPoolText, 'Super Potion\nGreat Ball\nRevive'),
 RarePoolText = COALESCE(RarePoolText, 'Rare Candy\nNugget'),
 SleepHealthyMinHours = COALESCE(SleepHealthyMinHours, 7.0),
 SleepHealthyMaxHours = COALESCE(SleepHealthyMaxHours, 9.0),
 SleepHealthyMultiplier = COALESCE(SleepHealthyMultiplier, 1.30),
 SleepOutsideRangeStartMultiplier = COALESCE(SleepOutsideRangeStartMultiplier, 1.30),
 SleepPenaltyPer15Min = COALESCE(SleepPenaltyPer15Min, 0.01),
 SleepTrackedMinimumMultiplier = COALESCE(SleepTrackedMinimumMultiplier, 1.10),
 SleepRewardMinimumMinutes = COALESCE(SleepRewardMinimumMinutes, 60),
 FocusXpPerMinute = COALESCE(FocusXpPerMinute, 100.0),
 FocusXpIncompleteMultiplier = COALESCE(FocusXpIncompleteMultiplier, 0.25),
 UpdatedAtUtc = COALESCE(UpdatedAtUtc, @NowUtc)
WHERE Id = 1;",
                new { NowUtc = nowUtc });

            conn.Execute(@"
INSERT OR IGNORE INTO StepItemRollState
(Id, StepsRemainder, TotalRolls, TotalSuccesses, UpdatedAtUtc)
VALUES
(1, 0, 0, 0, @NowUtc);",
                new { NowUtc = nowUtc });

            long itemDefinitionCount = conn.ExecuteScalar<long>("SELECT COUNT(*) FROM ItemDefinitions;");
            if (itemDefinitionCount == 0)
            {
                conn.Execute(@"
INSERT INTO ItemDefinitions (Name, Category, Tier, Weight, IsActive, CreatedAtUtc, DeletedAtUtc)
VALUES
 ('Potion', 'Healing', 0, 1, 1, @NowUtc, NULL),
 ('Poke Ball', 'Ball', 0, 1, 1, @NowUtc, NULL),
 ('Antidote', 'Status', 0, 1, 1, @NowUtc, NULL),
 ('Paralyze Heal', 'Status', 0, 1, 1, @NowUtc, NULL),
 ('Escape Rope', 'Escape', 0, 1, 1, @NowUtc, NULL),
 ('Super Potion', 'Healing', 1, 1, 1, @NowUtc, NULL),
 ('Great Ball', 'Ball', 1, 1, 1, @NowUtc, NULL),
 ('Revive', 'Healing', 1, 1, 1, @NowUtc, NULL),
 ('Rare Candy', 'Candy', 2, 1, 1, @NowUtc, NULL),
 ('Nugget', 'Valuable', 2, 1, 1, @NowUtc, NULL);",
                    new { NowUtc = nowUtc });

                DbMigrations.EnsureExternalIdSupport(conn, "ItemDefinitions");
            }

            _created = true;
        }
        #endregion // SECTION B — Ensure Created
    }
}
