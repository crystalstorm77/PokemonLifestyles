using Dapper;

namespace LifestyleCore.Data
{
    public static class FoodSchema
    {
        #region SECTION A — Food Tables Schema (SQLite)
        private static bool _ensured;
        private static readonly object _lock = new();

        public static void EnsureCreated()
        {
            if (_ensured) return;

            lock (_lock)
            {
                if (_ensured) return;

                using var conn = Db.OpenConnection();

                conn.Execute(@"
CREATE TABLE IF NOT EXISTS FoodItems (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    KjPerServing REAL NOT NULL,
    ServingLabel TEXT NOT NULL,
    KjPer100g REAL NULL,
    CreatedAtUtc TEXT NOT NULL,
    UpdatedAtUtc TEXT NOT NULL
);

-- Case-insensitive uniqueness on Name
CREATE UNIQUE INDEX IF NOT EXISTS UX_FoodItems_Name_NoCase
ON FoodItems (Name COLLATE NOCASE);

CREATE TABLE IF NOT EXISTS FoodEntries (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    LoggedAtUtc TEXT NOT NULL,
    LogDate TEXT NOT NULL,
    FoodItemId INTEGER NOT NULL,
    FoodName TEXT NOT NULL,
    ServingLabel TEXT NOT NULL,
    KjPerServingSnapshot REAL NOT NULL,
    KjPer100gSnapshot REAL NULL,
    Servings REAL NULL,
    Grams INTEGER NULL,
    KjComputed REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS IX_FoodEntries_LogDate
ON FoodEntries (LogDate);
");

                // Ensure ExternalId exists for archive import/export
                DbMigrations.EnsureExternalIdSupport(conn, "FoodItems");
                DbMigrations.EnsureExternalIdSupport(conn, "FoodEntries");

                _ensured = true;
            }
        }
        #endregion // SECTION A — Food Tables Schema (SQLite)
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
                    Id              INTEGER PRIMARY KEY CHECK (Id = 1),
                    CurrentCycleXp  INTEGER NOT NULL,
                    TotalLifetimeXp INTEGER NOT NULL DEFAULT 0,
                    PrestigeCount   INTEGER NOT NULL,
                    UpdatedAtUtc    TEXT    NOT NULL
                );
            ");

            // ---- Migrate older DBs safely (CREATE TABLE IF NOT EXISTS doesn't add columns) ----
            EnsureColumnExists(conn, "RewardsLedger", "HabitId", "INTEGER");
            EnsureColumnExists(conn, "RewardsLedger", "HabitDate", "TEXT");
            EnsureColumnExists(conn, "RewardsLedger", "FocusSessionId", "INTEGER");
            EnsureColumnExists(conn, "TrainerProgress", "TotalLifetimeXp", "INTEGER");

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
                    (Id, CurrentCycleXp, TotalLifetimeXp, PrestigeCount, UpdatedAtUtc)
                VALUES
                    (1, 0, 0, 0, @UpdatedAtUtc);",
                new { UpdatedAtUtc = nowUtc });

            conn.Execute(@"
                UPDATE TrainerProgress
                SET
                    TotalLifetimeXp = COALESCE(TotalLifetimeXp, (PrestigeCount * 1000000) + CurrentCycleXp),
                    UpdatedAtUtc = @UpdatedAtUtc
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