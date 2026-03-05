// ============================================================
// SECTION A — Step Item Roll State Repository
// ============================================================
using System.Threading.Tasks;
using Dapper;
using LifestyleCore.Models;

namespace LifestyleCore.Data
{
    public sealed class StepItemRollStateRepository
    {
        // ============================================================
        // SECTION B — Read
        // ============================================================
        public async Task<StepItemRollState> GetAsync()
        {
            ItemDropsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            var row = await conn.QuerySingleAsync<(int StepsRemainder, long TotalRolls, long TotalSuccesses)>(
                @"SELECT StepsRemainder, TotalRolls, TotalSuccesses
                  FROM StepItemRollState
                  WHERE Id = 1;");

            return new StepItemRollState
            {
                StepsRemainder = row.StepsRemainder,
                TotalRolls = row.TotalRolls,
                TotalSuccesses = row.TotalSuccesses
            };
        }
    }
}