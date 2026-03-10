#region SECTION A — Sleep Tables Schema (SQLite)
using Dapper;

namespace LifestyleCore.Data
{
    public static class SleepSchema
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
CREATE TABLE IF NOT EXISTS SleepSessions (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    StartUtc TEXT NOT NULL,
    EndUtc TEXT NOT NULL,
    WakeLogDate TEXT NOT NULL,
    DurationMinutes INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS IX_SleepSessions_WakeLogDate
ON SleepSessions (WakeLogDate);

CREATE TABLE IF NOT EXISTS PendingSleep (
    Id INTEGER PRIMARY KEY CHECK (Id = 1),
    StartUtc TEXT NOT NULL
);
");

                // Ensure ExternalId exists for archive import/export
                DbMigrations.EnsureExternalIdSupport(conn, "SleepSessions");

                _ensured = true;
            }
        }
    }
}
#endregion // SECTION A — Sleep Tables Schema (SQLite)