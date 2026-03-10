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

            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN SleepHealthyMinHours REAL NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN SleepHealthyMaxHours REAL NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN SleepHealthyMultiplier REAL NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN SleepOutsideRangeStartMultiplier REAL NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN SleepOutsideRangePenaltyPerHour REAL NULL;");
            TryAddColumn(@"ALTER TABLE GamificationSettings ADD COLUMN SleepTrackedMinimumMultiplier REAL NULL;");

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            conn.Execute(@"
INSERT OR IGNORE INTO GamificationSettings
(
    Id,
    StepsPerItemRoll,
    ItemRollOneInN,
    UpdatedAtUtc
)
VALUES
(
    1,
    1000,
    4,
    @NowUtc
);",
                new { NowUtc = nowUtc });

            conn.Execute(@"
UPDATE GamificationSettings
SET
    SleepHealthyMinHours = COALESCE(SleepHealthyMinHours, 6.0),
    SleepHealthyMaxHours = COALESCE(SleepHealthyMaxHours, 10.0),
    SleepHealthyMultiplier = COALESCE(SleepHealthyMultiplier, 1.10),
    SleepOutsideRangeStartMultiplier = COALESCE(SleepOutsideRangeStartMultiplier, 1.05),
    SleepOutsideRangePenaltyPerHour = COALESCE(SleepOutsideRangePenaltyPerHour, 0.02),
    SleepTrackedMinimumMultiplier = COALESCE(SleepTrackedMinimumMultiplier, 1.01)
WHERE Id = 1;");

            conn.Execute(@"
INSERT OR IGNORE INTO StepItemRollState
(Id, StepsRemainder, TotalRolls, TotalSuccesses, UpdatedAtUtc)
VALUES
(1, 0, 0, 0, @NowUtc);",
                new { NowUtc = nowUtc });

            _created = true;
        }
