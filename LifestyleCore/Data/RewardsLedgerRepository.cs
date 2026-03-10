#region SECTION A — Rewards Ledger Repository
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;
using LifestyleCore.Models;

namespace LifestyleCore.Data
{
    public sealed class RewardsLedgerRepository
    {
        #region SECTION B — Grant Rewards
        public async Task<bool> TryGrantHabitCheckboxTicketAsync(long habitId, DateOnly habitDate)
        {
            RewardsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");
            string day = habitDate.ToString("yyyy-MM-dd");

            // v1: +1 ticket for checkbox completion
            int rows = await conn.ExecuteAsync(@"
        INSERT OR IGNORE INTO RewardsLedger
            (ForGameDay, AwardedAtUtc, RewardType, Amount, HabitId, HabitDate)
        VALUES
            (@ForGameDay, @AwardedAtUtc, @RewardType, @Amount, @HabitId, @HabitDate);",
                new
                {
                    ForGameDay = day,
                    AwardedAtUtc = nowUtc,
                    RewardType = (int)RewardType.HabitTicketCheckbox,
                    Amount = 1,
                    HabitId = habitId,
                    HabitDate = day
                });

            return rows == 1;
        }

        public async Task<bool> TryGrantFocusCoinsAsync(long focusSessionId, DateOnly forGameDay, int amount)
        {
            if (amount <= 0)
                return false;

            RewardsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");
            string day = forGameDay.ToString("yyyy-MM-dd");

            int rows = await conn.ExecuteAsync(@"
        INSERT OR IGNORE INTO RewardsLedger
            (ForGameDay, AwardedAtUtc, RewardType, Amount, FocusSessionId)
        VALUES
            (@ForGameDay, @AwardedAtUtc, @RewardType, @Amount, @FocusSessionId);",
                new
                {
                    ForGameDay = day,
                    AwardedAtUtc = nowUtc,
                    RewardType = (int)RewardType.FocusCoins,
                    Amount = amount,
                    FocusSessionId = focusSessionId
                });

            return rows == 1;
        }
        #endregion // SECTION B — Grant Rewards

        #region SECTION C — Read Rewards
        public async Task<List<RewardsLedgerEntry>> GetForGameDayAsync(DateOnly gameDay)
        {
            RewardsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();
            string d = gameDay.ToString("yyyy-MM-dd");

            var rows = await conn.QueryAsync<RewardsLedgerEntry>(@"
                SELECT
                    Id,
                    ExternalId,
                    ForGameDay,
                    AwardedAtUtc,
                    RewardType,
                    Amount,
                    HabitId,
                    HabitDate,
                    FocusSessionId
                FROM RewardsLedger
                WHERE ForGameDay = @ForGameDay
                ORDER BY AwardedAtUtc ASC;",
                new { ForGameDay = d });

            return new List<RewardsLedgerEntry>(rows);
        }
        #endregion // SECTION C — Read Rewards
    }
}
#endregion // SECTION A — Rewards Ledger Repository