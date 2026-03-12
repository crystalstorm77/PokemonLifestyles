using System;
using System.IO;
using Microsoft.Data.Sqlite;

namespace LifestyleCore.Data
{
    public static class Db
    {
        #region SECTION A — Database path + initialization
        private const string DatabaseFileName = "lifestyles.db";
        private const string LegacyFolderName = "LifestylesTracker";
        private const string CurrentFolderName = "Pokemon Lifestyles";

        private static readonly object _pathLock = new();
        private static string? _dataDirectoryOverride;

        public static void SetDataDirectoryOverride(string? directoryPath)
        {
            lock (_pathLock)
            {
                if (string.IsNullOrWhiteSpace(directoryPath))
                {
                    _dataDirectoryOverride = null;
                    return;
                }

                string fullDirectory = Path.GetFullPath(
                    Environment.ExpandEnvironmentVariables(directoryPath.Trim()));

                Directory.CreateDirectory(fullDirectory);
                _dataDirectoryOverride = fullDirectory;
            }
        }

        public static string GetDefaultDataDirectoryPath()
        {
            string documents = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments);
            return Path.Combine(documents, CurrentFolderName);
        }

        public static string GetDataDirectoryPath()
        {
            lock (_pathLock)
            {
                return GetDataDirectoryPath_NoLock();
            }
        }

        public static string GetDbPath()
        {
            lock (_pathLock)
            {
                string dbPath = Path.Combine(GetDataDirectoryPath_NoLock(), DatabaseFileName);
                MigrateLegacyDatabaseIfNeeded_NoLock(dbPath);
                return dbPath;
            }
        }

        private static string GetDataDirectoryPath_NoLock()
        {
            string directory = _dataDirectoryOverride ?? GetDefaultDataDirectoryPath();
            Directory.CreateDirectory(directory);
            return directory;
        }

        private static string GetLegacyDbPath()
        {
            string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            string legacyDirectory = Path.Combine(appData, LegacyFolderName);
            return Path.Combine(legacyDirectory, DatabaseFileName);
        }

        private static void MigrateLegacyDatabaseIfNeeded_NoLock(string currentDbPath)
        {
            string legacyDbPath = GetLegacyDbPath();

            if (File.Exists(currentDbPath))
            {
                return;
            }

            if (!File.Exists(legacyDbPath))
            {
                return;
            }

            string currentFullPath = Path.GetFullPath(currentDbPath);
            string legacyFullPath = Path.GetFullPath(legacyDbPath);

            if (string.Equals(currentFullPath, legacyFullPath, StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            CopyIfExists(legacyDbPath, currentDbPath);
            CopyIfExists($"{legacyDbPath}-wal", $"{currentDbPath}-wal");
            CopyIfExists($"{legacyDbPath}-shm", $"{currentDbPath}-shm");
            CopyIfExists($"{legacyDbPath}-journal", $"{currentDbPath}-journal");
        }

        private static void CopyIfExists(string sourcePath, string destinationPath)
        {
            if (!File.Exists(sourcePath) || File.Exists(destinationPath))
            {
                return;
            }

            string? destinationDirectory = Path.GetDirectoryName(destinationPath);
            if (!string.IsNullOrWhiteSpace(destinationDirectory))
            {
                Directory.CreateDirectory(destinationDirectory);
            }

            File.Copy(sourcePath, destinationPath, overwrite: false);
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

            cmd.CommandText = @"
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS FocusSessions (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    LoggedAtUtc TEXT NOT NULL,
    LogDate TEXT NOT NULL,
    FocusType TEXT NOT NULL,
    Minutes INTEGER NOT NULL,
    DurationSeconds INTEGER NOT NULL,
    Completed INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS IX_FocusSessions_LogDate
ON FocusSessions(LogDate);
";
            cmd.ExecuteNonQuery();

            DbMigrations.EnsureFocusSessionDurationSecondsSupport(conn);
            DbMigrations.EnsureExternalIdSupport(conn, "FocusSessions");
        }
        #endregion // SECTION A — Database path + initialization
    }
}
