using Dapper;
using LifestyleCore.Data;
using LifestyleCore.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LifestyleCore.Data
{
    public sealed class RewardsLedgerRepository
    {
        #region SECTION B — Grant Rewards
        private const int MaxTrainerLevel = 100;
        private const int MaxTrainerCycleXp = 1_000_000;

        private sealed class TrainerProgressRow
        {
            public int CurrentCycleXp { get; set; }
            public int PrestigeCount { get; set; }
        }

        private static int Cube(int n) => n * n * n;

        private static int GetTrainerLevelForCycleXp(int cycleXp)
        {
            if (cycleXp <= 0)
                return 1;

            if (cycleXp >= MaxTrainerCycleXp)
                return MaxTrainerLevel;

            for (int level = MaxTrainerLevel - 1; level >= 2; level--)
            {
                if (cycleXp >= Cube(level))
                    return level;
            }

            return 1;
        }

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

        public async Task<bool> TryGrantFocusTrainerXpAsync(long focusSessionId, DateOnly forGameDay, int amount)
        {
            if (amount <= 0)
                return false;

            RewardsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();
            using var tx = conn.BeginTransaction();

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");
            string day = forGameDay.ToString("yyyy-MM-dd");

            var progress = await conn.QuerySingleOrDefaultAsync<TrainerProgressRow>(@"
                SELECT CurrentCycleXp, PrestigeCount
                FROM TrainerProgress
                WHERE Id = 1;",
                transaction: tx) ?? new TrainerProgressRow();

            int currentCycleXp = progress.CurrentCycleXp;
            if (currentCycleXp < 0) currentCycleXp = 0;
            if (currentCycleXp > MaxTrainerCycleXp) currentCycleXp = MaxTrainerCycleXp;

            if (currentCycleXp >= MaxTrainerCycleXp)
            {
                tx.Commit();
                return false;
            }

            int grantXp = Math.Min(amount, MaxTrainerCycleXp - currentCycleXp);
            if (grantXp <= 0)
            {
                tx.Commit();
                return false;
            }

            int rows = await conn.ExecuteAsync(@"
        INSERT OR IGNORE INTO RewardsLedger
            (ForGameDay, AwardedAtUtc, RewardType, Amount, FocusSessionId)
        VALUES
            (@ForGameDay, @AwardedAtUtc, @RewardType, @Amount, @FocusSessionId);",
                new
                {
                    ForGameDay = day,
                    AwardedAtUtc = nowUtc,
                    RewardType = (int)RewardType.TrainerXp,
                    Amount = grantXp,
                    FocusSessionId = focusSessionId
                },
                tx);

            if (rows == 1)
            {
                await conn.ExecuteAsync(@"
                    UPDATE TrainerProgress
                    SET
                        CurrentCycleXp = @CurrentCycleXp,
                        UpdatedAtUtc = @UpdatedAtUtc
                    WHERE Id = 1;",
                    new
                    {
                        CurrentCycleXp = currentCycleXp + grantXp,
                        UpdatedAtUtc = nowUtc
                    },
                    tx);

                tx.Commit();
                return true;
            }

            tx.Commit();
            return false;
        }

        public async Task<bool> TryPrestigeResetAsync()
        {
            RewardsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();
            using var tx = conn.BeginTransaction();

            var progress = await conn.QuerySingleOrDefaultAsync<TrainerProgressRow>(@"
                SELECT CurrentCycleXp, PrestigeCount
                FROM TrainerProgress
                WHERE Id = 1;",
                transaction: tx) ?? new TrainerProgressRow();

            int currentCycleXp = progress.CurrentCycleXp;
            int prestigeCount = progress.PrestigeCount;

            if (currentCycleXp < MaxTrainerCycleXp)
            {
                tx.Commit();
                return false;
            }

            if (prestigeCount < 0)
                prestigeCount = 0;

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            await conn.ExecuteAsync(@"
                UPDATE TrainerProgress
                SET
                    CurrentCycleXp = 0,
                    PrestigeCount = @PrestigeCount,
                    UpdatedAtUtc = @UpdatedAtUtc
                WHERE Id = 1;",
                new
                {
                    PrestigeCount = prestigeCount + 1,
                    UpdatedAtUtc = nowUtc
                },
                tx);

            tx.Commit();
            return true;
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

        public async Task<TrainerProgressSnapshot> GetTrainerProgressAsync()
        {
            RewardsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            var row = await conn.QuerySingleOrDefaultAsync<TrainerProgressRow>(@"
                SELECT CurrentCycleXp, PrestigeCount
                FROM TrainerProgress
                WHERE Id = 1;") ?? new TrainerProgressRow();

            int cycleXp = row.CurrentCycleXp;
            if (cycleXp < 0) cycleXp = 0;
            if (cycleXp > MaxTrainerCycleXp) cycleXp = MaxTrainerCycleXp;

            int prestigeCount = row.PrestigeCount;
            if (prestigeCount < 0) prestigeCount = 0;

            int level = GetTrainerLevelForCycleXp(cycleXp);
            bool isMaxLevel = cycleXp >= MaxTrainerCycleXp || level >= MaxTrainerLevel;

            if (isMaxLevel)
            {
                return new TrainerProgressSnapshot
                {
                    PrestigeCount = prestigeCount,
                    CurrentCycleXp = MaxTrainerCycleXp,
                    MaxCycleXp = MaxTrainerCycleXp,
                    CurrentLevel = MaxTrainerLevel,
                    CurrentLevelBaseXp = MaxTrainerCycleXp,
                    NextLevelBaseXp = MaxTrainerCycleXp,
                    XpIntoCurrentLevel = 0,
                    XpNeededForNextLevel = 0,
                    IsMaxLevel = true
                };
            }

            int currentLevelBaseXp = level <= 1 ? 0 : Cube(level);
            int nextLevelBaseXp = Cube(level + 1);

            return new TrainerProgressSnapshot
            {
                PrestigeCount = prestigeCount,
                CurrentCycleXp = cycleXp,
                MaxCycleXp = MaxTrainerCycleXp,
                CurrentLevel = level,
                CurrentLevelBaseXp = currentLevelBaseXp,
                NextLevelBaseXp = nextLevelBaseXp,
                XpIntoCurrentLevel = Math.Max(0, cycleXp - currentLevelBaseXp),
                XpNeededForNextLevel = Math.Max(0, nextLevelBaseXp - cycleXp),
                IsMaxLevel = false
            };
        }
        #endregion // SECTION C — Read Rewards
    }
}



