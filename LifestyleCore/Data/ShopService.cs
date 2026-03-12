using System;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using LifestyleCore.Models;

namespace LifestyleCore.Data
{
    public sealed class ShopService
    {
        #region SECTION A — Helpers
        private readonly ItemDefinitionsRepository _itemDefinitionsRepo = new();
        private readonly RewardsLedgerRepository _rewardsRepo = new();
        private readonly WeeklyCrateService _weeklyCrateService = new();
        private readonly EggService _eggService = new();

        private static int NormalizeCost(int value, int fallback)
        {
            return value < 0 ? fallback : value;
        }

        private static bool IsCoinRewardType(RewardType rewardType)
        {
            return rewardType == RewardType.FocusCoins ||
                   rewardType == RewardType.ShopItemCoinSpend;
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

        private static DateOnly GetCurrentGameDay(DateTimeOffset effectiveNowLocal)
        {
            return SleepRewardCalculator.GetGameDayForWakeLocal(effectiveNowLocal.LocalDateTime);
        }

        private static async Task<int> GetCoinBalanceAsync(IDbConnection conn, IDbTransaction? tx)
        {
            var rows = await conn.QueryAsync<(int RewardType, long TotalAmount)>(@"
SELECT RewardType, COALESCE(SUM(Amount), 0) AS TotalAmount
FROM RewardsLedger
GROUP BY RewardType;",
                transaction: tx);

            int coins = 0;

            foreach (var row in rows)
            {
                var rewardType = (RewardType)row.RewardType;
                if (IsCoinRewardType(rewardType))
                    coins += (int)row.TotalAmount;
            }

            return coins;
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

        private static int GetItemCoinPrice(ShopSettings settings, ItemTier tier)
        {
            return tier switch
            {
                ItemTier.Common => settings.CommonItemCoinCost,
                ItemTier.Uncommon => settings.UncommonItemCoinCost,
                ItemTier.Rare => settings.RareItemCoinCost,
                _ => settings.CommonItemCoinCost
            };
        }

        private static int GetEggTicketPrice(ShopSettings settings, EggRarity rarity)
        {
            return rarity switch
            {
                EggRarity.Common => settings.CommonEggTicketCost,
                EggRarity.Uncommon => settings.UncommonEggTicketCost,
                EggRarity.Rare => settings.RareEggTicketCost,
                _ => settings.CommonEggTicketCost
            };
        }
        #endregion // SECTION A — Helpers

        #region SECTION B — Settings + Dashboard
        public ShopSettings BuildDefaultSettings()
        {
            return new ShopSettings
            {
                CommonItemCoinCost = 25,
                UncommonItemCoinCost = 60,
                RareItemCoinCost = 120,
                CommonEggTicketCost = 4,
                UncommonEggTicketCost = 8,
                RareEggTicketCost = 15
            };
        }

        public async Task<ShopSettings> GetSettingsAsync()
        {
            ShopSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            var row = await conn.QuerySingleAsync(@"
SELECT
    CommonItemCoinCost,
    UncommonItemCoinCost,
    RareItemCoinCost,
    CommonEggTicketCost,
    UncommonEggTicketCost,
    RareEggTicketCost
FROM ShopSettings
WHERE Id = 1;");

            return new ShopSettings
            {
                CommonItemCoinCost = NormalizeCost(Convert.ToInt32(row.CommonItemCoinCost), 25),
                UncommonItemCoinCost = NormalizeCost(Convert.ToInt32(row.UncommonItemCoinCost), 60),
                RareItemCoinCost = NormalizeCost(Convert.ToInt32(row.RareItemCoinCost), 120),
                CommonEggTicketCost = NormalizeCost(Convert.ToInt32(row.CommonEggTicketCost), 4),
                UncommonEggTicketCost = NormalizeCost(Convert.ToInt32(row.UncommonEggTicketCost), 8),
                RareEggTicketCost = NormalizeCost(Convert.ToInt32(row.RareEggTicketCost), 15)
            };
        }

        public async Task SaveSettingsAsync(ShopSettings settings)
        {
            ShopSchema.EnsureCreated();
            settings ??= BuildDefaultSettings();

            settings.CommonItemCoinCost = NormalizeCost(settings.CommonItemCoinCost, 25);
            settings.UncommonItemCoinCost = NormalizeCost(settings.UncommonItemCoinCost, 60);
            settings.RareItemCoinCost = NormalizeCost(settings.RareItemCoinCost, 120);
            settings.CommonEggTicketCost = NormalizeCost(settings.CommonEggTicketCost, 4);
            settings.UncommonEggTicketCost = NormalizeCost(settings.UncommonEggTicketCost, 8);
            settings.RareEggTicketCost = NormalizeCost(settings.RareEggTicketCost, 15);

            using var conn = Db.OpenConnection();

            await conn.ExecuteAsync(@"
UPDATE ShopSettings
SET
    CommonItemCoinCost = @CommonItemCoinCost,
    UncommonItemCoinCost = @UncommonItemCoinCost,
    RareItemCoinCost = @RareItemCoinCost,
    CommonEggTicketCost = @CommonEggTicketCost,
    UncommonEggTicketCost = @UncommonEggTicketCost,
    RareEggTicketCost = @RareEggTicketCost,
    UpdatedAtUtc = @UpdatedAtUtc
WHERE Id = 1;",
                new
                {
                    settings.CommonItemCoinCost,
                    settings.UncommonItemCoinCost,
                    settings.RareItemCoinCost,
                    settings.CommonEggTicketCost,
                    settings.UncommonEggTicketCost,
                    settings.RareEggTicketCost,
                    UpdatedAtUtc = DateTimeOffset.UtcNow.ToString("O")
                });
        }

        public async Task ResetSettingsAsync()
        {
            await SaveSettingsAsync(BuildDefaultSettings());
        }

        public async Task<ShopDashboardStatus> GetDashboardStatusAsync(DateTimeOffset effectiveNowLocal)
        {
            ShopSchema.EnsureCreated();
            RewardsSchema.EnsureCreated();
            ItemDropsSchema.EnsureCreated();
            EggSchema.EnsureCreated();
            WeeklyCrateSchema.EnsureCreated();

            ShopSettings settings = await GetSettingsAsync();
            var currencyTotals = await _rewardsRepo.GetCurrencyTotalsAsync();
            var itemDefinitions = await _itemDefinitionsRepo.GetAllAsync();
            var inventory = await new InventoryRepository().GetAllAsync();
            var weeklyCrate = await _weeklyCrateService.GetStatusAsync(effectiveNowLocal);

            var inventoryMap = inventory
                .GroupBy(x => (x.ItemKey ?? "").Trim(), StringComparer.OrdinalIgnoreCase)
                .ToDictionary(g => g.Key, g => g.Sum(x => Math.Max(0, x.Count)), StringComparer.OrdinalIgnoreCase);

            var offers = itemDefinitions
                .Where(x => x.IsActive)
                .OrderBy(x => x.Tier)
                .ThenBy(x => x.Name, StringComparer.OrdinalIgnoreCase)
                .Select(x => new ShopItemOffer
                {
                    Name = x.Name,
                    Category = x.Category,
                    Tier = x.Tier,
                    CoinPrice = GetItemCoinPrice(settings, x.Tier),
                    InventoryCount = inventoryMap.TryGetValue(x.Name, out int count) ? count : 0
                })
                .ToList();

            return new ShopDashboardStatus
            {
                Settings = settings,
                CurrentCoins = currencyTotals.Coins,
                CurrentTickets = currencyTotals.Tickets,
                ItemOffers = offers,
                WeeklyCrateStatus = weeklyCrate
            };
        }
        #endregion // SECTION B — Settings + Dashboard

        #region SECTION C — Purchases
        public async Task BuyItemAsync(string itemName, DateTimeOffset effectiveNowLocal)
        {
            ShopSchema.EnsureCreated();
            RewardsSchema.EnsureCreated();
            ItemDropsSchema.EnsureCreated();

            string normalizedName = (itemName ?? "").Trim();
            if (string.IsNullOrWhiteSpace(normalizedName))
                throw new InvalidOperationException("Choose an item first.");

            ShopSettings settings = await GetSettingsAsync();

            using var conn = Db.OpenConnection();
            using var tx = conn.BeginTransaction();

            var item = await conn.QuerySingleOrDefaultAsync<ItemDefinition>(@"
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
WHERE Name = @Name COLLATE NOCASE
  AND IsActive = 1
LIMIT 1;",
                new { Name = normalizedName },
                transaction: tx);

            if (item == null)
                throw new InvalidOperationException("That item is not currently available in the shop.");

            int coinPrice = GetItemCoinPrice(settings, item.Tier);
            int currentCoins = await GetCoinBalanceAsync(conn, tx);

            if (currentCoins < coinPrice)
                throw new InvalidOperationException($"You need {coinPrice} coins to buy {item.Name}. Current total: {currentCoins}.");

            DateOnly currentGameDay = GetCurrentGameDay(effectiveNowLocal);
            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            await conn.ExecuteAsync(@"
INSERT INTO RewardsLedger
    (ForGameDay, AwardedAtUtc, RewardType, Amount)
VALUES
    (@ForGameDay, @AwardedAtUtc, @RewardType, @Amount);",
                new
                {
                    ForGameDay = currentGameDay.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                    AwardedAtUtc = nowUtc,
                    RewardType = (int)RewardType.ShopItemCoinSpend,
                    Amount = -coinPrice
                },
                transaction: tx);

            await conn.ExecuteAsync(@"
INSERT INTO InventoryItems (ItemKey, Count)
VALUES (@ItemKey, 1)
ON CONFLICT(ItemKey) DO UPDATE SET
    Count = Count + 1;",
                new { ItemKey = item.Name },
                transaction: tx);

            tx.Commit();
        }

        public async Task BuyEggAsync(EggRarity rarity, DateTimeOffset effectiveNowLocal)
        {
            ShopSchema.EnsureCreated();
            RewardsSchema.EnsureCreated();
            EggSchema.EnsureCreated();

            ShopSettings shopSettings = await GetSettingsAsync();
            EggSettings eggSettings = await _eggService.GetSettingsAsync();

            int ticketPrice = GetEggTicketPrice(shopSettings, rarity);
            int baseRequirement = rarity switch
            {
                EggRarity.Common => eggSettings.CommonStepsRequired,
                EggRarity.Uncommon => eggSettings.UncommonStepsRequired,
                EggRarity.Rare => eggSettings.RareStepsRequired,
                _ => eggSettings.CommonStepsRequired
            };

            using var conn = Db.OpenConnection();
            using var tx = conn.BeginTransaction();

            int currentTickets = await GetTicketBalanceAsync(conn, tx);
            if (currentTickets < ticketPrice)
                throw new InvalidOperationException($"You need {ticketPrice} tickets to buy a {rarity} egg. Current total: {currentTickets}.");

            DateOnly currentGameDay = GetCurrentGameDay(effectiveNowLocal);
            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            await conn.ExecuteAsync(@"
INSERT INTO RewardsLedger
    (ForGameDay, AwardedAtUtc, RewardType, Amount)
VALUES
    (@ForGameDay, @AwardedAtUtc, @RewardType, @Amount);",
                new
                {
                    ForGameDay = currentGameDay.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                    AwardedAtUtc = nowUtc,
                    RewardType = (int)RewardType.ShopEggTicketSpend,
                    Amount = -ticketPrice
                },
                transaction: tx);

            await conn.ExecuteAsync(@"
INSERT INTO EggInventory
    (Rarity, BaseStepsRequired, RawStepsWalked, AddedGameDay, AddedAtUtc, IsActive)
VALUES
    (@Rarity, @BaseStepsRequired, 0, @AddedGameDay, @AddedAtUtc, 0);",
                new
                {
                    Rarity = (int)rarity,
                    BaseStepsRequired = Math.Max(1, baseRequirement),
                    AddedGameDay = currentGameDay.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                    AddedAtUtc = nowUtc
                },
                transaction: tx);

            tx.Commit();
        }
        #endregion // SECTION C — Purchases
    }
}