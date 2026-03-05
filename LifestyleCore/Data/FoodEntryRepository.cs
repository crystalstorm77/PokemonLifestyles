// ============================================================
// SECTION A — Food Log Repository (SQLite + Dapper)
// ============================================================

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;
using LifestyleCore.Models;

namespace LifestyleCore.Data
{
    public sealed class FoodEntryRepository
    {
        private readonly FoodItemRepository _foodRepo = new();

        public async Task<long> AddAsync(
            DateOnly logDate,
            long foodItemId,
            double? servings,
            int? grams)
        {
            FoodSchema.EnsureCreated();

            var food = await _foodRepo.GetByIdAsync(foodItemId);
            if (food is null)
                throw new InvalidOperationException("Selected food item no longer exists.");

            // Prefer grams if provided
            bool hasGrams = grams.HasValue && grams.Value > 0;
            bool hasServings = servings.HasValue && servings.Value > 0;

            if (!hasGrams && !hasServings)
                throw new InvalidOperationException("Enter grams (>0) or servings (>0).");

            double kjComputed;

            double? servingsToStore = null;
            int? gramsToStore = null;

            if (hasGrams)
            {
                if (!food.KjPer100g.HasValue || food.KjPer100g.Value <= 0)
                    throw new InvalidOperationException("This food has no kJ per 100g value. Use servings instead.");

                gramsToStore = grams!.Value;
                kjComputed = (gramsToStore.Value / 100.0) * food.KjPer100g.Value;
            }
            else
            {
                servingsToStore = servings!.Value;
                kjComputed = servingsToStore.Value * food.KjPerServing;
            }

            var nowUtc = DateTimeOffset.UtcNow;

            using var conn = Db.OpenConnection();

            const string sql = @"
                INSERT INTO FoodEntries (
                    LoggedAtUtc, LogDate, FoodItemId,
                    FoodName, ServingLabel, KjPerServingSnapshot, KjPer100gSnapshot,
                    Servings, Grams, KjComputed
                )
                VALUES (
                    @LoggedAtUtc, @LogDate, @FoodItemId,
                    @FoodName, @ServingLabel, @KjPerServingSnapshot, @KjPer100gSnapshot,
                    @Servings, @Grams, @KjComputed
                );
                SELECT last_insert_rowid();
            ";

            long id = await conn.ExecuteScalarAsync<long>(sql, new
            {
                LoggedAtUtc = nowUtc.ToString("O"),
                LogDate = logDate.ToString("yyyy-MM-dd"),
                FoodItemId = food.Id,

                FoodName = food.Name,
                ServingLabel = food.ServingLabel,
                KjPerServingSnapshot = food.KjPerServing,
                KjPer100gSnapshot = food.KjPer100g,

                Servings = servingsToStore,
                Grams = gramsToStore,
                KjComputed = kjComputed
            });

            return id;
        }

        public async Task<IReadOnlyList<FoodEntry>> GetForDateAsync(DateOnly logDate)
        {
            FoodSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            const string sql = @"
                SELECT
                    Id, LoggedAtUtc, LogDate, FoodItemId,
                    FoodName, ServingLabel, KjPerServingSnapshot, KjPer100gSnapshot,
                    Servings, Grams, KjComputed
                FROM FoodEntries
                WHERE LogDate = @LogDate
                ORDER BY Id DESC;
            ";

            var rows = await conn.QueryAsync<dynamic>(sql, new { LogDate = logDate.ToString("yyyy-MM-dd") });

            var list = new List<FoodEntry>();
            foreach (var r in rows)
            {
                list.Add(new FoodEntry
                {
                    Id = (long)r.Id,
                    LoggedAtUtc = DateTimeOffset.Parse((string)r.LoggedAtUtc),
                    LogDate = DateOnly.Parse((string)r.LogDate),
                    FoodItemId = (long)r.FoodItemId,
                    FoodName = (string)r.FoodName,
                    ServingLabel = (string)r.ServingLabel,
                    KjPerServingSnapshot = (double)r.KjPerServingSnapshot,
                    KjPer100gSnapshot = r.KjPer100gSnapshot is null ? null : (double?)r.KjPer100gSnapshot,
                    Servings = r.Servings is null ? null : (double?)r.Servings,
                    Grams = r.Grams is null ? null : (int?)Convert.ToInt32(r.Grams),
                    KjComputed = (double)r.KjComputed
                });
            }

            return list;
        }

        public async Task<double> GetTotalKjForDateAsync(DateOnly logDate)
        {
            FoodSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            const string sql = @"
                SELECT IFNULL(SUM(KjComputed), 0)
                FROM FoodEntries
                WHERE LogDate = @LogDate;
            ";

            return await conn.ExecuteScalarAsync<double>(sql, new { LogDate = logDate.ToString("yyyy-MM-dd") });
        }
    }
}