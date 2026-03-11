using Dapper;
using LifestyleCore.Data;
using System;
using System.Linq;

namespace LifestyleCore.Data
{
    public static class RewardsSchema
    {
        #region SECTION A — Rewards Ledger Schema
        private static bool _created = false;
        #endregion // SECTION A — Rewards Ledger Schema

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
                    ForGameDay     TEXT    NOT NULL,
                    AwardedAtUtc   TEXT    NOT NULL,
                    RewardType     INTEGER NOT NULL,
                    Amount         INTEGER NOT NULL,
                    HabitId        INTEGER,
                    HabitDate      TEXT,
                    FocusSessionId INTEGER
                );

                CREATE INDEX IF NOT EXISTS IX_RewardsLedger_ForGameDay ON RewardsLedger(ForGameDay);
                CREATE INDEX IF NOT EXISTS IX_RewardsLedger_RewardType ON RewardsLedger(RewardType);

                CREATE TABLE IF NOT EXISTS TrainerProgress (
                    Id              INTEGER PRIMARY KEY CHECK (Id = 1),
                    CurrentCycleXp  INTEGER NOT NULL,
                    TotalLifetimeXp INTEGER NOT NULL DEFAULT 0,
                    PrestigeCount   INTEGER NOT NULL,
                    UpdatedAtUtc    TEXT    NOT NULL
                );
            ");

            EnsureColumnExists(conn, "RewardsLedger", "HabitId", "INTEGER");
            EnsureColumnExists(conn, "RewardsLedger", "HabitDate", "TEXT");
            EnsureColumnExists(conn, "RewardsLedger", "FocusSessionId", "INTEGER");
            EnsureColumnExists(conn, "TrainerProgress", "TotalLifetimeXp", "INTEGER NOT NULL DEFAULT 0");

            conn.Execute(@"
                CREATE UNIQUE INDEX IF NOT EXISTS UX_RewardsLedger_HabitTicket
                ON RewardsLedger(RewardType, HabitId, HabitDate)
                WHERE HabitId IS NOT NULL AND HabitDate IS NOT NULL;
            ");

            conn.Execute(@"
                CREATE UNIQUE INDEX IF NOT EXISTS UX_RewardsLedger_FocusCoins
                ON RewardsLedger(RewardType, FocusSessionId)
                WHERE FocusSessionId IS NOT NULL;
            ");

            DbMigrations.EnsureExternalIdSupport(conn, "RewardsLedger");

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            conn.Execute(@"
                INSERT OR IGNORE INTO TrainerProgress
                    (Id, CurrentCycleXp, TotalLifetimeXp, PrestigeCount, UpdatedAtUtc)
                VALUES
                    (1, 0, 0, 0, @UpdatedAtUtc);",
                new { UpdatedAtUtc = nowUtc });

            conn.Execute(@"
                UPDATE TrainerProgress
                SET
                    TotalLifetimeXp = COALESCE(TotalLifetimeXp, 0),
                    UpdatedAtUtc = COALESCE(UpdatedAtUtc, @UpdatedAtUtc)
                WHERE Id = 1;",
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
