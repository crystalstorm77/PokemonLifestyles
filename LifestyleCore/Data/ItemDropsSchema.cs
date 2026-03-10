#region SECTION A — Item Drops Schema
using Dapper;
using LifestyleCore.Data;
using System;

namespace LifestyleCore.Data
{
    public static class ItemDropsSchema
    {
        private static bool _created = false;

       
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

            TryAddColumn(@"ALTER TABLE StepItemRollState ADD COLUMN LastDropUtc TEXT NULL;");
            TryAddColumn(@"ALTER TABLE StepItemRollState ADD COLUMN LastDropSummary TEXT NULL;");

            // Sleep tuning settings
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN SleepHealthyMinHours REAL NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN SleepHealthyMaxHours REAL NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN SleepHealthyMultiplier REAL NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN SleepOutsideRangeStartMultiplier REAL NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN SleepPenaltyPer15Min REAL NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN SleepTrackedMinimumMultiplier REAL NULL;");

            // Trainer XP tuning
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN FocusXpPerMinute REAL NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN FocusXpIncompleteMultiplier REAL NULL;");

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
 SleepHealthyMinHours = COALESCE(SleepHealthyMinHours, 6.0),
 SleepHealthyMaxHours = COALESCE(SleepHealthyMaxHours, 10.0),
 SleepHealthyMultiplier = COALESCE(SleepHealthyMultiplier, 1.10),
 SleepOutsideRangeStartMultiplier = COALESCE(SleepOutsideRangeStartMultiplier, 1.05),
 SleepPenaltyPer15Min = COALESCE(SleepPenaltyPer15Min, 0.005),
 SleepTrackedMinimumMultiplier = COALESCE(SleepTrackedMinimumMultiplier, 1.01),
 FocusXpPerMinute = COALESCE(FocusXpPerMinute, 100.0),
 FocusXpIncompleteMultiplier = COALESCE(FocusXpIncompleteMultiplier, 0.25)
WHERE Id = 1;");

            conn.Execute(@"
INSERT OR IGNORE INTO StepItemRollState
(Id, StepsRemainder, TotalRolls, TotalSuccesses, UpdatedAtUtc)
VALUES
(1, 0, 0, 0, @NowUtc);",
            new { NowUtc = nowUtc });

            _created = true;
        }
        #endregion // SECTION B — Ensure Created
    }
}
#endregion // SECTION A — Item Drops Schema