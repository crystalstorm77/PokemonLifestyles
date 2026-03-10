#region SECTION A — Habits Tables Schema (SQLite)
using Dapper;

namespace LifestyleCore.Data
{
    public static class HabitsSchema
    {
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
CREATE TABLE IF NOT EXISTS Habits (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Title TEXT NOT NULL,
    Kind INTEGER NOT NULL,
    TargetPerWeek INTEGER NOT NULL,
    IsArchived INTEGER NOT NULL DEFAULT 0,
    CreatedAtUtc TEXT NOT NULL,
    UpdatedAtUtc TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS IX_Habits_IsArchived
ON Habits (IsArchived);

CREATE TABLE IF NOT EXISTS HabitEntries (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    HabitId INTEGER NOT NULL,
    Date TEXT NOT NULL, -- local date: yyyy-MM-dd
    Value INTEGER NOT NULL,
    UpdatedAtUtc TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS UX_HabitEntries_HabitId_Date
ON HabitEntries (HabitId, Date);

CREATE INDEX IF NOT EXISTS IX_HabitEntries_Date
ON HabitEntries (Date);
");

                // Ensure ExternalId exists for archive import/export
                DbMigrations.EnsureExternalIdSupport(conn, "Habits");
                DbMigrations.EnsureExternalIdSupport(conn, "HabitEntries");

                _ensured = true;
            }
        }
    }
}
#endregion // SECTION A — Habits Tables Schema (SQLite)