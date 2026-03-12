using System;
using Dapper;
using Microsoft.Data.Sqlite;

namespace LifestyleCore.Data
{
    public static class DbMigrations
    {
        #region SECTION A — DB migrations helpers
        public static void EnsureExternalIdSupport(SqliteConnection conn, string tableName)
        {
            if (!ColumnExists(conn, tableName, "ExternalId"))
            {
                conn.Execute($"ALTER TABLE {tableName} ADD COLUMN ExternalId TEXT;");
            }

            conn.Execute($@"
UPDATE {tableName}
SET ExternalId = lower(hex(randomblob(16)))
WHERE ExternalId IS NULL OR ExternalId = '';
");

            conn.Execute($@"
CREATE UNIQUE INDEX IF NOT EXISTS UX_{tableName}_ExternalId
ON {tableName} (ExternalId);
");

            conn.Execute($@"
CREATE TRIGGER IF NOT EXISTS TR_{tableName}_ExternalId_AfterInsert
AFTER INSERT ON {tableName}
WHEN NEW.ExternalId IS NULL OR NEW.ExternalId = ''
BEGIN
    UPDATE {tableName}
    SET ExternalId = lower(hex(randomblob(16)))
    WHERE rowid = NEW.rowid;
END;
");
        }

        public static void EnsureFocusSessionDurationSecondsSupport(SqliteConnection conn)
        {
            if (!ColumnExists(conn, "FocusSessions", "DurationSeconds"))
            {
                conn.Execute("ALTER TABLE FocusSessions ADD COLUMN DurationSeconds INTEGER;");
            }

            conn.Execute(@"
UPDATE FocusSessions
SET DurationSeconds =
    CASE
        WHEN DurationSeconds IS NULL OR DurationSeconds <= 0 THEN
            CASE
                WHEN Minutes IS NULL OR Minutes <= 0 THEN 0
                ELSE Minutes * 60
            END
        ELSE DurationSeconds
    END;
");
        }

        private static bool ColumnExists(SqliteConnection conn, string tableName, string columnName)
        {
            var cols = conn.Query("PRAGMA table_info(" + tableName + ");");

            foreach (var c in cols)
            {
                string name = (string)c.name;
                if (string.Equals(name, columnName, StringComparison.OrdinalIgnoreCase))
                    return true;
            }

            return false;
        }
        #endregion // SECTION A — DB migrations helpers
    }
}