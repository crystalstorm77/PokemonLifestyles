using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Dapper;

namespace LifestyleCore.Data
{
    public sealed class FocusLabelRepository
    {
        #region SECTION A — Focus label repository
        public async Task<List<string>> GetActiveAsync()
        {
            FocusLabelsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            var rows = await conn.QueryAsync<string>(@"
SELECT Name
FROM FocusLabels
WHERE IsActive = 1
ORDER BY
 CASE
 WHEN Name = 'Draw' COLLATE NOCASE THEN 0
 WHEN Name = 'Music' COLLATE NOCASE THEN 1
 ELSE 2
 END,
 Name COLLATE NOCASE ASC;");

            return rows.ToList();
        }

        // Adds a label if new; if it exists but was deleted, re-activates it.
        // Returns true if it changed the stored set (new label OR re-activated).
        public async Task<bool> UpsertActiveAsync(string? rawName)
        {
            FocusLabelsSchema.EnsureCreated();

            string name = Normalize(rawName);
            if (string.IsNullOrWhiteSpace(name) || name == "(None)")
                return false;

            using var conn = Db.OpenConnection();
            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            var existing = await conn.QuerySingleOrDefaultAsync<(long Id, int IsActive)?>(@"
SELECT Id, IsActive
FROM FocusLabels
WHERE Name = @Name COLLATE NOCASE
LIMIT 1;", new { Name = name });

            if (existing.HasValue)
            {
                // Reactivate if needed
                await conn.ExecuteAsync(@"
UPDATE FocusLabels
SET IsActive = 1, DeletedAtUtc = NULL
WHERE Id = @Id;", new { Id = existing.Value.Id });

                return existing.Value.IsActive == 0;
            }

            await conn.ExecuteAsync(@"
INSERT INTO FocusLabels (Name, IsActive, CreatedAtUtc)
VALUES (@Name, 1, @NowUtc);",
                new { Name = name, NowUtc = nowUtc });

            return true;
        }

        public async Task<bool> SoftDeleteAsync(string? rawName)
        {
            FocusLabelsSchema.EnsureCreated();

            string name = Normalize(rawName);
            if (string.IsNullOrWhiteSpace(name) || name == "(None)")
                return false;

            using var conn = Db.OpenConnection();
            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            int affected = await conn.ExecuteAsync(@"
UPDATE FocusLabels
SET IsActive = 0,
    DeletedAtUtc = @NowUtc
WHERE Name = @Name COLLATE NOCASE
  AND IsActive = 1;",
                new { Name = name, NowUtc = nowUtc });

            return affected > 0;
        }

        private static string Normalize(string? raw)
        {
            string s = (raw ?? "").Trim();
            if (string.IsNullOrWhiteSpace(s))
                return "(None)";

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
        #endregion // SECTION A — Focus label repository
    }
}