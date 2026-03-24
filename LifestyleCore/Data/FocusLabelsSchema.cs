using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using Dapper;

namespace LifestyleCore.Data
{
    public static class FocusLabelsSchema
    {
        #region SECTION A — Focus labels schema (SQLite)
        private static bool _ensured;
        private static readonly object _lock = new();

        public static void EnsureCreated()
        {
            if (_ensured) return;

            lock (_lock)
            {
                if (_ensured) return;

                // Ensure FocusSessions exists so we can import existing FocusType values.
                Db.EnsureCreated();

                using var conn = Db.OpenConnection();

                conn.Execute(@"
CREATE TABLE IF NOT EXISTS FocusLabels (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    IsActive INTEGER NOT NULL,
    DisplayOrder INTEGER NOT NULL DEFAULT 0,
    CreatedAtUtc TEXT NOT NULL,
    DeletedAtUtc TEXT NULL
);

-- Case-insensitive uniqueness on Name
CREATE UNIQUE INDEX IF NOT EXISTS UX_FocusLabels_Name_NoCase
ON FocusLabels (Name COLLATE NOCASE);

CREATE INDEX IF NOT EXISTS IX_FocusLabels_IsActive
ON FocusLabels (IsActive);
");

                // Support archive import/export consistency (matches other tables)
                DbMigrations.EnsureExternalIdSupport(conn, "FocusLabels");
                EnsureDisplayOrderColumn(conn);
                NormalizeDisplayOrder(conn);

                string nowUtc = DateTimeOffset.UtcNow.ToString("O");

                // Seed defaults (can still be deleted later if you want).
                conn.Execute(@"
INSERT OR IGNORE INTO FocusLabels (Name, IsActive, DisplayOrder, CreatedAtUtc)
VALUES ('Draw', 1, 0, @NowUtc), ('Music', 1, 1, @NowUtc);", new { NowUtc = nowUtc });

                // Import any existing labels already used in FocusSessions
                // so older data shows up in the dropdown immediately.
                var existing = conn.Query<string>(@"SELECT DISTINCT FocusType FROM FocusSessions;").ToList();

                foreach (var raw in existing)
                {
                    string name = Normalize(raw);
                    if (string.IsNullOrWhiteSpace(name) || name == "(None)") continue;

                    int nextDisplayOrder = conn.ExecuteScalar<int>(@"
SELECT COALESCE(MAX(DisplayOrder), -1) + 1
FROM FocusLabels;");

                    conn.Execute(@"
INSERT OR IGNORE INTO FocusLabels (Name, IsActive, DisplayOrder, CreatedAtUtc)
VALUES (@Name, 1, @DisplayOrder, @NowUtc);", new { Name = name, DisplayOrder = nextDisplayOrder, NowUtc = nowUtc });

                    // If it existed but was deleted, reactivate it.
                    conn.Execute(@"
UPDATE FocusLabels
SET IsActive = 1, DeletedAtUtc = NULL
WHERE Name = @Name COLLATE NOCASE;", new { Name = name });
                }

                _ensured = true;
            }
        }

        private static void EnsureDisplayOrderColumn(System.Data.IDbConnection conn)
        {
            bool hasDisplayOrder = conn.Query("PRAGMA table_info(FocusLabels);")
                .Any(x => string.Equals((string)x.name, "DisplayOrder", StringComparison.OrdinalIgnoreCase));

            if (!hasDisplayOrder)
            {
                conn.Execute("ALTER TABLE FocusLabels ADD COLUMN DisplayOrder INTEGER NOT NULL DEFAULT 0;");
            }
        }

        private static void NormalizeDisplayOrder(System.Data.IDbConnection conn)
        {
            var rows = conn.Query<(long Id, string Name, int IsActive, int DisplayOrder)>(@"
SELECT Id, Name, IsActive, COALESCE(DisplayOrder, 0) AS DisplayOrder
FROM FocusLabels
ORDER BY
    CASE WHEN IsActive = 1 THEN 0 ELSE 1 END,
    CASE
        WHEN Name = 'Draw' COLLATE NOCASE THEN 0
        WHEN Name = 'Music' COLLATE NOCASE THEN 1
        ELSE 2
    END,
    DisplayOrder ASC,
    Name COLLATE NOCASE ASC,
    Id ASC;").ToList();

            bool requiresReset = rows
                .Select((row, index) => row.DisplayOrder != index)
                .Any(x => x);

            if (!requiresReset)
            {
                return;
            }

            using var tx = conn.BeginTransaction();

            for (int index = 0; index < rows.Count; index++)
            {
                conn.Execute(@"
UPDATE FocusLabels
SET DisplayOrder = @DisplayOrder
WHERE Id = @Id;", new
                {
                    DisplayOrder = index,
                    Id = rows[index].Id
                }, tx);
            }

            tx.Commit();
        }

        // Keep normalization consistent with the Desktop NormalizeFocusLabel:
        // - trim
        // - collapse whitespace
        // - if fully-lowercase, TitleCase it
        private static string Normalize(string? raw)
        {
            string s = (raw ?? "").Trim();
            if (string.IsNullOrWhiteSpace(s)) return "(None)";

            var parts = s.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries);
            s = string.Join(" ", parts);

            bool allLettersLower = true;
            foreach (char ch in s)
            {
                if (char.IsLetter(ch) && !char.IsLower(ch))
                {
                    allLettersLower = false;
                    break;
                }
            }

            if (allLettersLower)
                s = CultureInfo.InvariantCulture.TextInfo.ToTitleCase(s);

            return s;
        }
        #endregion // SECTION A — Focus labels schema (SQLite)
    }
}
