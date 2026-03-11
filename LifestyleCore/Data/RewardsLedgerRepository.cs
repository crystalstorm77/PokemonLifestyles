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
            public long TotalLifetimeXp { get; set; }
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

        private static async Task EnsureTrainerProgressLifetimeColumnAsync(System.Data.IDbConnection conn, System.Data.IDbTransaction? tx = null)
        {
            var cols = await conn.QueryAsync("PRAGMA table_info(TrainerProgress);", transaction: tx);

            bool hasTotalLifetimeXp = false;

            foreach (var c in cols)
            {
                string name = (string)c.name;
                if (string.Equals(name, "TotalLifetimeXp", StringComparison.OrdinalIgnoreCase))
                {
                    hasTotalLifetimeXp = true;
                    break;
                }
            }

            if (!hasTotalLifetimeXp)
            {
                await conn.ExecuteAsync(
                    "ALTER TABLE TrainerProgress ADD COLUMN TotalLifetimeXp INTEGER NOT NULL DEFAULT 0;",
                    transaction: tx);
            }

            await conn.ExecuteAsync(@"
                UPDATE TrainerProgress
                SET TotalLifetimeXp = COALESCE(TotalLifetimeXp, (PrestigeCount * 1000000) + CurrentCycleXp)
                WHERE Id = 1;",
                transaction: tx);
        }

        public async Task<bool> TryGrantHabitCheckboxTicketAsync(long habitId, DateOnly habitDate)
        {
            RewardsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");
            string day = habitDate.ToString("yyyy-MM-dd");

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

        public Task<bool> TryGrantWeeklyHabitTrackingBonusAsync(long habitId, DateOnly weekStart, DateOnly awardGameDay, int amount)
            => TryGrantWeeklyTicketRewardAsync(RewardType.HabitTicketWeeklyBonus, habitId, weekStart, awardGameDay, amount);

        public Task<bool> TryGrantWeeklySleepTrackingBonusAsync(DateOnly weekStart, DateOnly awardGameDay, int amount)
            => TryGrantWeeklyTicketRewardAsync(RewardType.SleepTicketWeeklyBonus, 0, weekStart, awardGameDay, amount);

        public Task<bool> TryGrantWeeklyStepsTrackingBonusAsync(DateOnly weekStart, DateOnly awardGameDay, int amount)
            => TryGrantWeeklyTicketRewardAsync(RewardType.StepsTicketWeeklyBonus, 0, weekStart, awardGameDay, amount);

        private async Task<bool> TryGrantWeeklyTicketRewardAsync(
            RewardType rewardType,
            long claimKeyHabitId,
            DateOnly weekStart,
            DateOnly awardGameDay,
            int amount)
        {
            if (amount <= 0)
                return false;

            RewardsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");
            string forGameDay = awardGameDay.ToString("yyyy-MM-dd");
            string weekStartText = weekStart.ToString("yyyy-MM-dd");

            int rows = await conn.ExecuteAsync(@"
        INSERT OR IGNORE INTO RewardsLedger
            (ForGameDay, AwardedAtUtc, RewardType, Amount, HabitId, HabitDate)
        VALUES
            (@ForGameDay, @AwardedAtUtc, @RewardType, @Amount, @HabitId, @HabitDate);",
                new
                {
                    ForGameDay = forGameDay,
                    AwardedAtUtc = nowUtc,
                    RewardType = (int)rewardType,
                    Amount = amount,
                    HabitId = claimKeyHabitId,
                    HabitDate = weekStartText
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

            await EnsureTrainerProgressLifetimeColumnAsync(conn, tx);

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");
            string day = forGameDay.ToString("yyyy-MM-dd");

            var progress = await conn.QuerySingleOrDefaultAsync<TrainerProgressRow>(@"
                SELECT CurrentCycleXp, TotalLifetimeXp, PrestigeCount
                FROM TrainerProgress
                WHERE Id = 1;",
                transaction: tx) ?? new TrainerProgressRow();

            int currentCycleXp = progress.CurrentCycleXp;
            if (currentCycleXp < 0) currentCycleXp = 0;
            if (currentCycleXp > MaxTrainerCycleXp) currentCycleXp = MaxTrainerCycleXp;

            long totalLifetimeXp = progress.TotalLifetimeXp;
            if (totalLifetimeXp < 0) totalLifetimeXp = 0;

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
                    Amount = amount,
                    FocusSessionId = focusSessionId
                },
                tx);

            if (rows == 1)
            {
                await conn.ExecuteAsync(@"
                    UPDATE TrainerProgress
                    SET
                        CurrentCycleXp = @CurrentCycleXp,
                        TotalLifetimeXp = @TotalLifetimeXp,
                        UpdatedAtUtc = @UpdatedAtUtc
                    WHERE Id = 1;",
                    new
                    {
                        CurrentCycleXp = Math.Min(MaxTrainerCycleXp, currentCycleXp + amount),
                        TotalLifetimeXp = totalLifetimeXp + amount,
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

            await EnsureTrainerProgressLifetimeColumnAsync(conn, tx);

            var progress = await conn.QuerySingleOrDefaultAsync<TrainerProgressRow>(@"
                SELECT CurrentCycleXp, TotalLifetimeXp, PrestigeCount
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

        public async Task ResetTrainerLevelAsync()
        {
            RewardsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            await EnsureTrainerProgressLifetimeColumnAsync(conn);

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            await conn.ExecuteAsync(@"
                UPDATE TrainerProgress
                SET
                    CurrentCycleXp = 0,
                    UpdatedAtUtc = @UpdatedAtUtc
                WHERE Id = 1;",
                new { UpdatedAtUtc = nowUtc });
        }

        public async Task ResetTrainerPrestigeAsync()
        {
            RewardsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            await EnsureTrainerProgressLifetimeColumnAsync(conn);

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            await conn.ExecuteAsync(@"
                UPDATE TrainerProgress
                SET
                    PrestigeCount = 0,
                    UpdatedAtUtc = @UpdatedAtUtc
                WHERE Id = 1;",
                new { UpdatedAtUtc = nowUtc });
        }

        public async Task ResetTrainerLifetimeXpAsync()
        {
            RewardsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            await EnsureTrainerProgressLifetimeColumnAsync(conn);

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            await conn.ExecuteAsync(@"
                UPDATE TrainerProgress
                SET
                    TotalLifetimeXp = 0,
                    UpdatedAtUtc = @UpdatedAtUtc
                WHERE Id = 1;",
                new { UpdatedAtUtc = nowUtc });
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

            await EnsureTrainerProgressLifetimeColumnAsync(conn);

            var row = await conn.QuerySingleOrDefaultAsync<TrainerProgressRow>(@"
                SELECT CurrentCycleXp, TotalLifetimeXp, PrestigeCount
                FROM TrainerProgress
                WHERE Id = 1;") ?? new TrainerProgressRow();

            int cycleXp = row.CurrentCycleXp;
            if (cycleXp < 0) cycleXp = 0;
            if (cycleXp > MaxTrainerCycleXp) cycleXp = MaxTrainerCycleXp;

            long totalLifetimeXp = row.TotalLifetimeXp;
            if (totalLifetimeXp < 0) totalLifetimeXp = 0;

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
                    TotalLifetimeXp = totalLifetimeXp,
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
                TotalLifetimeXp = totalLifetimeXp,
                CurrentLevel = level,
                CurrentLevelBaseXp = currentLevelBaseXp,
                NextLevelBaseXp = nextLevelBaseXp,
                XpIntoCurrentLevel = Math.Max(0, cycleXp - currentLevelBaseXp),
                XpNeededForNextLevel = Math.Max(0, nextLevelBaseXp - cycleXp),
                IsMaxLevel = false
            };
        }

        public async Task<(int Coins, int Tickets)> GetCurrencyTotalsAsync()
        {
            RewardsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            var rows = await conn.QueryAsync<(int RewardType, long TotalAmount)>(@"
                SELECT RewardType, COALESCE(SUM(Amount), 0) AS TotalAmount
                FROM RewardsLedger
                GROUP BY RewardType;");

            int coins = 0;
            int tickets = 0;

            foreach (var row in rows)
            {
                var rewardType = (RewardType)row.RewardType;
                int amount = (int)row.TotalAmount;

                if (rewardType == RewardType.FocusCoins)
                    coins += amount;
                else if (rewardType == RewardType.HabitTicketCheckbox ||
                         rewardType == RewardType.HabitTicketWeeklyBonus ||
                         rewardType == RewardType.SleepTicketWeeklyBonus ||
                         rewardType == RewardType.StepsTicketWeeklyBonus)
                    tickets += amount;
            }

            return (coins, tickets);
        }

        #endregion // SECTION C — Read Rewards
    }
}



