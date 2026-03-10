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
    }
}