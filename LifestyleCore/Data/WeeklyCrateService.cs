using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using LifestyleCore.Models;

namespace LifestyleCore.Data
{
    public sealed class WeeklyCrateService
    {
        #region SECTION A — Helpers
        private const int DefaultTicketCost = 5;
        private const int DefaultRollCount = 3;

        private sealed class WeeklyCrateClaimRow
        {
            public string WeekStart { get; set; } = "";
            public string OpenedGameDay { get; set; } = "";
            public string OpenedAtUtc { get; set; } = "";
            public int TicketCost { get; set; }
            public int RollCount { get; set; }
            public string RewardSummary { get; set; } = "";
        }

        private static DateOnly GetCurrentGameDay(DateTimeOffset effectiveNowLocal)
        {
            return SleepRewardCalculator.GetGameDayForWakeLocal(effectiveNowLocal.LocalDateTime);
        }

        private static DateOnly GetWeekStartMonday(DateOnly date)
        {
            int diff = ((int)date.DayOfWeek - (int)DayOfWeek.Monday + 7) % 7;
            return date.AddDays(-diff);
        }

        private static (bool IsEnabled, int TicketCost, int RollCount) NormalizeSettings(bool isEnabled, int ticketCost, int rollCount)
        {
            return
            (
                IsEnabled: isEnabled,
                TicketCost: Math.Max(0, ticketCost),
                RollCount: Math.Clamp(rollCount, 1, 10)
            );
        }

        private static bool IsTicketRewardType(RewardType rewardType)
        {
            return rewardType == RewardType.HabitTicketCheckbox ||
                   rewardType == RewardType.HabitTicketWeeklyBonus ||
                   rewardType == RewardType.SleepTicketWeeklyBonus ||
                   rewardType == RewardType.StepsTicketWeeklyBonus ||
                   rewardType == RewardType.WeeklyCrateTicketSpend ||
                   rewardType == RewardType.ShopEggTicketSpend;
        }

        private static int PickTierIndex(int commonW, int uncommonW, int rareW)
        {
            int cw = Math.Max(0, commonW);
            int uw = Math.Max(0, uncommonW);
            int rw = Math.Max(0, rareW);

            int total = cw + uw + rw;
            if (total <= 0)
                return 0;

            int r = Random.Shared.Next(total);
            if (r < cw)
                return 0;

            r -= cw;
            if (r < uw)
                return 1;

            return 2;
        }

        private static ItemDefinition? PickWeighted(IReadOnlyList<ItemDefinition> defs)
        {
            if (defs == null || defs.Count == 0)
                return null;

            int total = 0;
            for (int i = 0; i < defs.Count; i++)
                total += Math.Max(0, defs[i].Weight);

            if (total <= 0)
                return null;

            int r = Random.Shared.Next(total);

            for (int i = 0; i < defs.Count; i++)
            {
                r -= Math.Max(0, defs[i].Weight);
                if (r < 0)
                    return defs[i];
            }

            return defs[0];
        }

        private static async Task<int> GetTicketBalanceAsync(IDbConnection conn, IDbTransaction? tx)
        {
            var rows = await conn.QueryAsync<(int RewardType, long TotalAmount)>(@"
SELECT RewardType, COALESCE(SUM(Amount), 0) AS TotalAmount
FROM RewardsLedger
GROUP BY RewardType;",
                transaction: tx);

            int tickets = 0;

            foreach (var row in rows)
            {
                var rewardType = (RewardType)row.RewardType;
                if (IsTicketRewardType(rewardType))
                    tickets += (int)row.TotalAmount;
            }

            return tickets;
        }

        private static string BuildRewardSummary(Dictionary<string, int> foundCounts)
        {
            if (foundCounts.Count == 0)
                return "No items";

            var parts = foundCounts
                .OrderBy(k => k.Key, StringComparer.OrdinalIgnoreCase)
                .Select(k => k.Value == 1 ? k.Key : $"{k.Key} x{k.Value}");

            return string.Join(", ", parts);
        }
        #endregion // SECTION A — Helpers

        #region SECTION B — Settings + Status
        public (bool IsEnabled, int TicketCost, int RollCount) BuildDefaultSettings()
        {
            return
            (
                IsEnabled: true,
                TicketCost: DefaultTicketCost,
                RollCount: DefaultRollCount
            );
        }

        public async Task<(bool IsEnabled, int TicketCost, int RollCount)> GetSettingsAsync()
        {
            WeeklyCrateSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            var row = await conn.QuerySingleAsync<(int IsEnabled, int TicketCost, int RollCount)>(@"
SELECT IsEnabled, TicketCost, RollCount
FROM WeeklyCrateSettings
WHERE Id = 1;");

            return NormalizeSettings(row.IsEnabled != 0, row.TicketCost, row.RollCount);
        }

        public async Task SaveSettingsAsync(bool isEnabled, int ticketCost, int rollCount)
        {
            WeeklyCrateSchema.EnsureCreated();

            var settings = NormalizeSettings(isEnabled, ticketCost, rollCount);

            using var conn = Db.OpenConnection();
            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            await conn.ExecuteAsync(@"
UPDATE WeeklyCrateSettings
SET
    IsEnabled = @IsEnabled,
    TicketCost = @TicketCost,
    RollCount = @RollCount,
    UpdatedAtUtc = @UpdatedAtUtc
WHERE Id = 1;",
                new
                {
                    IsEnabled = settings.IsEnabled ? 1 : 0,
                    TicketCost = settings.TicketCost,
                    RollCount = settings.RollCount,
                    UpdatedAtUtc = nowUtc
                });
        }

        public async Task ResetSettingsAsync()
        {
            var defaults = BuildDefaultSettings();
            await SaveSettingsAsync(defaults.IsEnabled, defaults.TicketCost, defaults.RollCount);
        }

        public async Task<WeeklyCrateStatus> GetStatusAsync(DateTimeOffset effectiveNowLocal)
        {
            WeeklyCrateSchema.EnsureCreated();
            RewardsSchema.EnsureCreated();

            var settings = await GetSettingsAsync();
            DateOnly currentGameDay = GetCurrentGameDay(effectiveNowLocal);
            DateOnly weekStart = GetWeekStartMonday(currentGameDay);
            DateOnly weekEnd = weekStart.AddDays(6);

            using var conn = Db.OpenConnection();

            int currentTickets = await GetTicketBalanceAsync(conn, tx: null);

            var claim = await conn.QuerySingleOrDefaultAsync<WeeklyCrateClaimRow>(@"
SELECT
    WeekStart,
    OpenedGameDay,
    OpenedAtUtc,
    TicketCost,
    RollCount,
    COALESCE(RewardSummary, '') AS RewardSummary
FROM WeeklyCrateClaims
WHERE WeekStart = @WeekStart;",
                new { WeekStart = weekStart.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture) });

            DateOnly? openedGameDay = null;
            if (claim != null &&
                DateOnly.TryParse(claim.OpenedGameDay, CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedOpenedGameDay))
            {
                openedGameDay = parsedOpenedGameDay;
            }

            return new WeeklyCrateStatus
            {
                CurrentGameDay = currentGameDay,
                WeekStart = weekStart,
                WeekEnd = weekEnd,
                IsEnabled = settings.IsEnabled,
                TicketCost = settings.TicketCost,
                RollCount = settings.RollCount,
                CurrentTickets = currentTickets,
                IsOpened = claim != null,
                OpenedGameDay = openedGameDay,
                OpenedAtUtc = claim?.OpenedAtUtc ?? "",
                RewardSummary = claim?.RewardSummary ?? ""
            };
        }
        #endregion // SECTION B — Settings + Status

        #region SECTION C — Open Crate
        public async Task DeleteAllWeeklyCrateDataAsync()
        {
            WeeklyCrateSchema.EnsureCreated();

            var defaults = BuildDefaultSettings();

            using var conn = Db.OpenConnection();
            using var tx = conn.BeginTransaction();

            await conn.ExecuteAsync("DELETE FROM WeeklyCrateClaims;", transaction: tx);

            await conn.ExecuteAsync(@"
UPDATE WeeklyCrateSettings
SET
    IsEnabled = @IsEnabled,
    TicketCost = @TicketCost,
    RollCount = @RollCount,
    UpdatedAtUtc = @UpdatedAtUtc
WHERE Id = 1;",
                new
                {
                    IsEnabled = defaults.IsEnabled ? 1 : 0,
                    TicketCost = defaults.TicketCost,
                    RollCount = defaults.RollCount,
                    UpdatedAtUtc = DateTimeOffset.UtcNow.ToString("O")
                },
                transaction: tx);

            tx.Commit();
        }

        public async Task<WeeklyCrateStatus> OpenCurrentWeekAsync(DateTimeOffset effectiveNowLocal)
        {
            WeeklyCrateSchema.EnsureCreated();
            ItemDropsSchema.EnsureCreated();
            RewardsSchema.EnsureCreated();

            var settings = await GetSettingsAsync();
            var gamiSettings = await new GamificationSettingsRepository().GetAsync();

            if (!settings.IsEnabled)
                throw new InvalidOperationException("Weekly crate is currently disabled.");

            DateOnly currentGameDay = GetCurrentGameDay(effectiveNowLocal);
            DateOnly weekStart = GetWeekStartMonday(currentGameDay);
            string weekStartText = weekStart.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
            string currentGameDayText = currentGameDay.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            using var conn = Db.OpenConnection();
            using var tx = conn.BeginTransaction();

            long alreadyOpened = await conn.ExecuteScalarAsync<long>(@"
SELECT COUNT(*)
FROM WeeklyCrateClaims
WHERE WeekStart = @WeekStart;",
                new { WeekStart = weekStartText },
                transaction: tx);

            if (alreadyOpened > 0)
                throw new InvalidOperationException("This week's crate has already been opened.");

            int currentTickets = await GetTicketBalanceAsync(conn, tx);
            if (currentTickets < settings.TicketCost)
                throw new InvalidOperationException($"You need {settings.TicketCost} tickets to open this week's crate. Current total: {currentTickets}.");

            async Task<List<ItemDefinition>> LoadDefsAsync(ItemTier tier)
            {
                var rows = await conn.QueryAsync<ItemDefinition>(@"
SELECT
    Name,
    COALESCE(Category, '') AS Category,
    Tier,
    Weight,
    IsActive,
    COALESCE(ExternalId, '') AS ExternalId,
    COALESCE(CreatedAtUtc, '') AS CreatedAtUtc,
    DeletedAtUtc
FROM ItemDefinitions
WHERE IsActive = 1 AND Tier = @Tier AND Weight > 0
ORDER BY Name ASC;",
                    new { Tier = (int)tier },
                    transaction: tx);

                return rows.ToList();
            }

            var commonDefs = await LoadDefsAsync(ItemTier.Common);
            var uncommonDefs = await LoadDefsAsync(ItemTier.Uncommon);
            var rareDefs = await LoadDefsAsync(ItemTier.Rare);

            if (commonDefs.Count == 0 && uncommonDefs.Count == 0 && rareDefs.Count == 0)
            {
                commonDefs = new List<ItemDefinition>
                {
                    new() { Name = "Potion", Tier = ItemTier.Common, Weight = 1, IsActive = true },
                    new() { Name = "Poke Ball", Tier = ItemTier.Common, Weight = 1, IsActive = true },
                    new() { Name = "Antidote", Tier = ItemTier.Common, Weight = 1, IsActive = true }
                };

                uncommonDefs = new List<ItemDefinition>
                {
                    new() { Name = "Super Potion", Tier = ItemTier.Uncommon, Weight = 1, IsActive = true },
                    new() { Name = "Great Ball", Tier = ItemTier.Uncommon, Weight = 1, IsActive = true }
                };

                rareDefs = new List<ItemDefinition>
                {
                    new() { Name = "Rare Candy", Tier = ItemTier.Rare, Weight = 1, IsActive = true },
                    new() { Name = "Nugget", Tier = ItemTier.Rare, Weight = 1, IsActive = true }
                };
            }

            var foundCounts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

            for (int i = 0; i < settings.RollCount; i++)
            {
                int tierIndex = PickTierIndex(
                    gamiSettings.CommonTierWeight,
                    gamiSettings.UncommonTierWeight,
                    gamiSettings.RareTierWeight);

                IReadOnlyList<ItemDefinition> pool = tierIndex switch
                {
                    2 => rareDefs,
                    1 => uncommonDefs,
                    _ => commonDefs
                };

                if (pool.Count == 0)
                    pool = commonDefs.Count > 0 ? commonDefs : (uncommonDefs.Count > 0 ? uncommonDefs : rareDefs);

                var picked = PickWeighted(pool);
                string itemName = (picked?.Name ?? "Potion").Trim();
                if (string.IsNullOrWhiteSpace(itemName))
                    itemName = "Potion";

                if (foundCounts.TryGetValue(itemName, out int existingCount))
                    foundCounts[itemName] = existingCount + 1;
                else
                    foundCounts[itemName] = 1;
            }

            foreach (var kvp in foundCounts)
            {
                await conn.ExecuteAsync(@"
INSERT INTO InventoryItems (ItemKey, Count)
VALUES (@ItemKey, @Count)
ON CONFLICT(ItemKey) DO UPDATE SET
    Count = Count + excluded.Count;",
                    new
                    {
                        ItemKey = kvp.Key,
                        Count = kvp.Value
                    },
                    transaction: tx);
            }

            string rewardSummary = BuildRewardSummary(foundCounts);

            await conn.ExecuteAsync(@"
INSERT INTO RewardsLedger
    (ForGameDay, AwardedAtUtc, RewardType, Amount)
VALUES
    (@ForGameDay, @AwardedAtUtc, @RewardType, @Amount);",
                new
                {
                    ForGameDay = currentGameDayText,
                    AwardedAtUtc = nowUtc,
                    RewardType = (int)RewardType.WeeklyCrateTicketSpend,
                    Amount = -settings.TicketCost
                },
                transaction: tx);

            await conn.ExecuteAsync(@"
INSERT INTO WeeklyCrateClaims
    (WeekStart, OpenedGameDay, OpenedAtUtc, TicketCost, RollCount, RewardSummary)
VALUES
    (@WeekStart, @OpenedGameDay, @OpenedAtUtc, @TicketCost, @RollCount, @RewardSummary);",
                new
                {
                    WeekStart = weekStartText,
                    OpenedGameDay = currentGameDayText,
                    OpenedAtUtc = nowUtc,
                    TicketCost = settings.TicketCost,
                    RollCount = settings.RollCount,
                    RewardSummary = rewardSummary
                },
                transaction: tx);

            tx.Commit();

            return await GetStatusAsync(effectiveNowLocal);
        }
        #endregion // SECTION C — Open Crate
    }
}