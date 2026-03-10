using Dapper;

namespace LifestyleCore.Data
{
    public static class StepsSchema
    {
        #region SECTION A — Steps Tables Schema (SQLite)
        private static bool _ensured;
        private static readonly object _lock = new();

        public static void EnsureCreated()
        {
            if (_ensured)
                return;

            lock (_lock)
            {
                if (_ensured)
                    return;

                using var conn = Db.OpenConnection();

                conn.Execute(@"
CREATE TABLE IF NOT EXISTS StepsDaily (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Date TEXT NOT NULL, -- local date: yyyy-MM-dd
    Steps INTEGER NOT NULL,
    UpdatedAtUtc TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS UX_StepsDaily_Date
ON StepsDaily (Date);

CREATE TABLE IF NOT EXISTS StepBuckets (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    BucketStartUtc TEXT NOT NULL, -- UTC instant: O
    BucketLocalDate TEXT NOT NULL, -- local date of bucket start: yyyy-MM-dd
    Steps INTEGER NOT NULL,
    UpdatedAtUtc TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS UX_StepBuckets_BucketStartUtc
ON StepBuckets (BucketStartUtc);

CREATE INDEX IF NOT EXISTS IX_StepBuckets_BucketLocalDate
ON StepBuckets (BucketLocalDate);

CREATE TABLE IF NOT EXISTS StepsSyncState (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Source TEXT NOT NULL,
    LastCumulativeSteps INTEGER NOT NULL,
    LastSyncUtc TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS UX_StepsSyncState_Source
ON StepsSyncState (Source);
");

                // Ensure ExternalId exists for archive import/export
                DbMigrations.EnsureExternalIdSupport(conn, "StepsDaily");
                DbMigrations.EnsureExternalIdSupport(conn, "StepBuckets");

                _ensured = true;
            }
        }
        #endregion // SECTION A — Steps Tables Schema (SQLite)
    }
}