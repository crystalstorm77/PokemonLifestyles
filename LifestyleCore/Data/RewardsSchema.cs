#region SECTION A — Rewards Ledger Schema
using Dapper;
using LifestyleCore.Data;
using System;
using System.Linq;

namespace LifestyleCore.Data
{
    public static class RewardsSchema
    {
        private static bool _created = false;

        #region SECTION B — Ensure Created
        public static void EnsureCreated()
        {
            if (_created) return;

            using var conn = Db.OpenConnection();

            conn.Execute("PRAGMA foreign_keys = ON;");

            conn.Execute(@"
                CREATE TABLE IF NOT EXISTS RewardsLedger (
                    Id             INTEGER PRIMARY KEY AUTOINCREMENT,
                    ExternalId     TEXT,

                    -- The game day this reward applies to (yyyy-MM-dd, using the selected log date / game-day notion)
                    ForGameDay     TEXT    NOT NULL,

                    -- When the reward was actually granted
                    AwardedAtUtc   TEXT    NOT NULL,

                    -- What kind of reward this is (see RewardType enum)
                    RewardType     INTEGER NOT NULL,

                    -- Amount (tickets/coins/etc.)
                    Amount         INTEGER NOT NULL,

                    -- Optional linkage for dedupe/auditing
                    HabitId        INTEGER,
                    HabitDate      TEXT,

                    FocusSessionId INTEGER
                );

                CREATE INDEX IF NOT EXISTS IX_RewardsLedger_ForGameDay ON RewardsLedger(ForGameDay);
                CREATE INDEX IF NOT EXISTS IX_RewardsLedger_RewardType ON RewardsLedger(RewardType);

                CREATE TABLE IF NOT EXISTS TrainerProgress (
                    Id             INTEGER PRIMARY KEY CHECK (Id = 1),
                    CurrentCycleXp INTEGER NOT NULL,
                    PrestigeCount  INTEGER NOT NULL,
                    UpdatedAtUtc   TEXT    NOT NULL
                );
            ");

            // ---- Migrate older DBs safely (CREATE TABLE IF NOT EXISTS doesn't add columns) ----
            EnsureColumnExists(conn, "RewardsLedger", "HabitId", "INTEGER");
            EnsureColumnExists(conn, "RewardsLedger", "HabitDate", "TEXT");
            EnsureColumnExists(conn, "RewardsLedger", "FocusSessionId", "INTEGER");

            // ---- Dedupe rules ----
            // Prevent double-granting a checkbox ticket for the same habit+date
            conn.Execute(@"
                CREATE UNIQUE INDEX IF NOT EXISTS UX_RewardsLedger_HabitTicket
                ON RewardsLedger(RewardType, HabitId, HabitDate)
                WHERE HabitId IS NOT NULL AND HabitDate IS NOT NULL;
            ");

            // Prevent double-granting focus-linked rewards for the same focus session + reward type
            conn.Execute(@"
                CREATE UNIQUE INDEX IF NOT EXISTS UX_RewardsLedger_FocusCoins
                ON RewardsLedger(RewardType, FocusSessionId)
                WHERE FocusSessionId IS NOT NULL;
            ");

            // Add/populate ExternalId for older DBs and ensure uniqueness.
            DbMigrations.EnsureExternalIdSupport(conn, "RewardsLedger");

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            conn.Execute(@"
                INSERT OR IGNORE INTO TrainerProgress
                    (Id, CurrentCycleXp, PrestigeCount, UpdatedAtUtc)
                VALUES
                    (1, 0, 0, @UpdatedAtUtc);",
                new { UpdatedAtUtc = nowUtc });

            _created = true;
        }

        private static void EnsureColumnExists(System.Data.IDbConnection conn, string tableName, string columnName, string columnSqlType)
        {
            var cols = conn.Query("PRAGMA table_info(" + tableName + ");");
            bool exists = false;

            foreach (var c in cols)
            {
                string name = (string)c.name;
                if (string.Equals(name, columnName, StringComparison.OrdinalIgnoreCase))
                {
                    exists = true;
                    break;
                }
            }

            if (!exists)
            {
                conn.Execute($"ALTER TABLE {tableName} ADD COLUMN {columnName} {columnSqlType};");
            }
        }
        #endregion // SECTION B — Ensure Created
    }
}
#endregion // SECTION A — Rewards Ledger Schema

