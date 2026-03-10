#region SECTION A — Food Menu Repository (SQLite + Dapper)
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;
using LifestyleCore.Models;
using Microsoft.Data.Sqlite;

namespace LifestyleCore.Data
{
    public sealed class FoodItemRepository
    {
        public async Task<long> AddAsync(FoodItem item)
        {
            FoodSchema.EnsureCreated();

            string name = (item.Name ?? "").Trim();
            if (string.IsNullOrWhiteSpace(name))
                throw new InvalidOperationException("Food name can’t be blank.");

            if (item.KjPerServing <= 0)
                throw new InvalidOperationException("kJ per serving must be greater than 0.");

            string servingLabel = (item.ServingLabel ?? "").Trim();
            if (string.IsNullOrWhiteSpace(servingLabel))
                servingLabel = "1 serving";

            var nowUtc = DateTimeOffset.UtcNow;

            using var conn = Db.OpenConnection();

            const string sql = @"
INSERT INTO FoodItems (Name, KjPerServing, ServingLabel, KjPer100g, CreatedAtUtc, UpdatedAtUtc)
VALUES (@Name, @KjPerServing, @ServingLabel, @KjPer100g, @CreatedAtUtc, @UpdatedAtUtc);
SELECT last_insert_rowid();
";

            try
            {
                long id = await conn.ExecuteScalarAsync<long>(sql, new
                {
                    Name = name,
                    KjPerServing = item.KjPerServing,
                    ServingLabel = servingLabel,
                    KjPer100g = item.KjPer100g,
                    CreatedAtUtc = nowUtc.ToString("O"),
                    UpdatedAtUtc = nowUtc.ToString("O"),
                });

                return id;
            }
            catch (SqliteException ex) when (ex.SqliteErrorCode == 19) // constraint violation
            {
                throw new InvalidOperationException($"“{name}” already exists (names are case-insensitive).");
            }
        }

        public async Task<IReadOnlyList<FoodItem>> GetAllAsync()
        {
            FoodSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            const string sql = @"
SELECT Id, Name, KjPerServing, ServingLabel, KjPer100g, CreatedAtUtc, UpdatedAtUtc
FROM FoodItems
ORDER BY Name COLLATE NOCASE ASC;
";

            var rows = await conn.QueryAsync<dynamic>(sql);

            var list = new List<FoodItem>();
            foreach (var r in rows)
            {
                list.Add(new FoodItem
                {
                    Id = (long)r.Id,
                    Name = (string)r.Name,
                    KjPerServing = (double)r.KjPerServing,
                    ServingLabel = (string)r.ServingLabel,
                    KjPer100g = r.KjPer100g is null ? null : (double?)r.KjPer100g,
                    CreatedAtUtc = DateTimeOffset.Parse((string)r.CreatedAtUtc),
                    UpdatedAtUtc = DateTimeOffset.Parse((string)r.UpdatedAtUtc),
                });
            }

            return list;
        }

        public async Task<FoodItem?> GetByIdAsync(long id)
        {
            FoodSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            const string sql = @"
SELECT Id, Name, KjPerServing, ServingLabel, KjPer100g, CreatedAtUtc, UpdatedAtUtc
FROM FoodItems
WHERE Id = @Id
LIMIT 1;
";

            var r = await conn.QueryFirstOrDefaultAsync<dynamic>(sql, new { Id = id });
            if (r is null)
                return null;

            return new FoodItem
            {
                Id = (long)r.Id,
                Name = (string)r.Name,
                KjPerServing = (double)r.KjPerServing,
                ServingLabel = (string)r.ServingLabel,
                KjPer100g = r.KjPer100g is null ? null : (double?)r.KjPer100g,
                CreatedAtUtc = DateTimeOffset.Parse((string)r.CreatedAtUtc),
                UpdatedAtUtc = DateTimeOffset.Parse((string)r.UpdatedAtUtc),
            };
        }

        #region SECTION B — Update / Delete
        public async Task UpdateAsync(FoodItem item)
        {
            FoodSchema.EnsureCreated();

            string name = (item.Name ?? "").Trim();
            if (string.IsNullOrWhiteSpace(name))
                throw new InvalidOperationException("Food name can’t be blank.");

            if (item.KjPerServing <= 0)
                throw new InvalidOperationException("kJ per serving must be greater than 0.");

            string servingLabel = (item.ServingLabel ?? "").Trim();
            if (string.IsNullOrWhiteSpace(servingLabel))
                servingLabel = "1 serving";

            // Treat 0/negative as "not set"
            double? kjPer100g = item.KjPer100g.HasValue && item.KjPer100g.Value > 0
                ? item.KjPer100g
                : null;

            var nowUtc = DateTimeOffset.UtcNow;

            using var conn = Db.OpenConnection();

            const string sql = @"
UPDATE FoodItems
SET Name = @Name,
    KjPerServing = @KjPerServing,
    ServingLabel = @ServingLabel,
    KjPer100g = @KjPer100g,
    UpdatedAtUtc = @UpdatedAtUtc
WHERE Id = @Id;
";

            try
            {
                int affected = await conn.ExecuteAsync(sql, new
                {
                    Id = item.Id,
                    Name = name,
                    KjPerServing = item.KjPerServing,
                    ServingLabel = servingLabel,
                    KjPer100g = kjPer100g,
                    UpdatedAtUtc = nowUtc.ToString("O")
                });

                if (affected == 0)
                    throw new InvalidOperationException("Food item not found.");
            }
            catch (SqliteException ex) when (ex.SqliteErrorCode == 19)
            {
                throw new InvalidOperationException($"“{name}” already exists (names are case-insensitive).");
            }
        }

        public async Task DeleteAsync(long id)
        {
            FoodSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            const string sql = @"DELETE FROM FoodItems WHERE Id = @Id;";
            await conn.ExecuteAsync(sql, new { Id = id });
        }
        #endregion // SECTION B — Update / Delete
    }
}
#endregion // SECTION A — Food Menu Repository (SQLite + Dapper)