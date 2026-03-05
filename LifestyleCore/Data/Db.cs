// ============================================================
// SECTION A — Database path + initialization
// ============================================================

using System;
using System.IO;
using Microsoft.Data.Sqlite;

namespace LifestyleCore.Data
{
    public static class Db
    {
        public static string GetDbPath()
        {
            string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            string dir = Path.Combine(appData, "LifestylesTracker");
            Directory.CreateDirectory(dir);
            return Path.Combine(dir, "lifestyles.db");
        }

        public static SqliteConnection OpenConnection()
        {
            var conn = new SqliteConnection($"Data Source={GetDbPath()};");
            conn.Open();
            return conn;
        }

        public static void EnsureCreated()
        {
            using var conn = OpenConnection();
            using var cmd = conn.CreateCommand();

            // IMPORTANT:
            // - CREATE TABLE IF NOT EXISTS won't modify an existing table.
            // - So we create the "base" table + safe index first,
            //   then run a migration to add ExternalId + unique index.
            cmd.CommandText = @"
                PRAGMA foreign_keys = ON;

                CREATE TABLE IF NOT EXISTS FocusSessions (
                    Id            INTEGER PRIMARY KEY AUTOINCREMENT,
                    LoggedAtUtc    TEXT    NOT NULL,
                    LogDate        TEXT    NOT NULL,
                    FocusType      TEXT    NOT NULL,
                    Minutes        INTEGER NOT NULL,
                    Completed      INTEGER NOT NULL
                );

                CREATE INDEX IF NOT EXISTS IX_FocusSessions_LogDate ON FocusSessions(LogDate);
            ";
            cmd.ExecuteNonQuery();

            // Ensure ExternalId exists & is populated even for older DBs
            DbMigrations.EnsureExternalIdSupport(conn, "FocusSessions");
        }
    }
}