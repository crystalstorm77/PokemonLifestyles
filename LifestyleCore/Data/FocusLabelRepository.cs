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
 DisplayOrder ASC,
 Name COLLATE NOCASE ASC,
 Id ASC;");

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

            int nextDisplayOrder = await conn.ExecuteScalarAsync<int>(@"
SELECT COALESCE(MAX(DisplayOrder), -1) + 1
FROM FocusLabels;");

            await conn.ExecuteAsync(@"
INSERT INTO FocusLabels (Name, IsActive, DisplayOrder, CreatedAtUtc)
VALUES (@Name, 1, @DisplayOrder, @NowUtc);",
                new { Name = name, DisplayOrder = nextDisplayOrder, NowUtc = nowUtc });

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

        public async Task<bool> RenameAsync(string? rawExistingName, string? rawNextName)
        {
            FocusLabelsSchema.EnsureCreated();

            string existingName = Normalize(rawExistingName);
            string nextName = Normalize(rawNextName);

            if (string.IsNullOrWhiteSpace(existingName) || existingName == "(None)")
                return false;

            if (string.IsNullOrWhiteSpace(nextName) || nextName == "(None)")
                return false;

            if (string.Equals(existingName, nextName, StringComparison.OrdinalIgnoreCase))
                return false;

            using var conn = Db.OpenConnection();

            var existing = await conn.QuerySingleOrDefaultAsync<(long Id, int IsActive)?>(@"
SELECT Id, IsActive
FROM FocusLabels
WHERE Name = @Name COLLATE NOCASE
LIMIT 1;", new { Name = existingName });

            if (!existing.HasValue || existing.Value.IsActive == 0)
                return false;

            var target = await conn.QuerySingleOrDefaultAsync<(long Id, int IsActive)?>(@"
SELECT Id, IsActive
FROM FocusLabels
WHERE Name = @Name COLLATE NOCASE
LIMIT 1;", new { Name = nextName });

            if (target.HasValue)
                return false;

            int affected = await conn.ExecuteAsync(@"
UPDATE FocusLabels
SET Name = @NextName
WHERE Id = @Id;", new
            {
                NextName = nextName,
                Id = existing.Value.Id
            });

            return affected > 0;
        }

        public async Task<bool> MoveUpAsync(string? rawName)
        {
            return await MoveAsync(rawName, moveUp: true);
        }

        public async Task<bool> MoveDownAsync(string? rawName)
        {
            return await MoveAsync(rawName, moveUp: false);
        }

        private async Task<bool> MoveAsync(string? rawName, bool moveUp)
        {
            FocusLabelsSchema.EnsureCreated();

            string name = Normalize(rawName);
            if (string.IsNullOrWhiteSpace(name) || name == "(None)")
                return false;

            using var conn = Db.OpenConnection();
            using var tx = conn.BeginTransaction();

            var active = (await conn.QueryAsync<(long Id, string Name, int DisplayOrder)>(@"
SELECT Id, Name, DisplayOrder
FROM FocusLabels
WHERE IsActive = 1
ORDER BY DisplayOrder ASC, Name COLLATE NOCASE ASC, Id ASC;", transaction: tx)).ToList();

            int currentIndex = active.FindIndex(x => string.Equals(x.Name, name, StringComparison.OrdinalIgnoreCase));
            if (currentIndex < 0)
            {
                tx.Rollback();
                return false;
            }

            int swapIndex = moveUp ? currentIndex - 1 : currentIndex + 1;
            if (swapIndex < 0 || swapIndex >= active.Count)
            {
                tx.Rollback();
                return false;
            }

            var current = active[currentIndex];
            var swap = active[swapIndex];

            await conn.ExecuteAsync(@"
UPDATE FocusLabels
SET DisplayOrder = @DisplayOrder
WHERE Id = @Id;", new
            {
                DisplayOrder = swap.DisplayOrder,
                Id = current.Id
            }, tx);

            await conn.ExecuteAsync(@"
UPDATE FocusLabels
SET DisplayOrder = @DisplayOrder
WHERE Id = @Id;", new
            {
                DisplayOrder = current.DisplayOrder,
                Id = swap.Id
            }, tx);

            tx.Commit();
            return true;
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
