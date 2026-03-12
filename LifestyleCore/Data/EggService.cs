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
    public sealed class EggService
    {
        #region SECTION A — Helpers
        private sealed class EggRow
        {
            public long Id { get; set; }
            public int Rarity { get; set; }
            public int BaseStepsRequired { get; set; }
            public int RawStepsWalked { get; set; }
            public string AddedGameDay { get; set; } = "";
            public string AddedAtUtc { get; set; } = "";
            public int IsActive { get; set; }
            public string ActivatedAtUtc { get; set; } = "";
            public string ReturnedToInventoryAtUtc { get; set; } = "";
            public string HatchedGameDay { get; set; } = "";
            public string HatchedAtUtc { get; set; } = "";
            public string HatchedPokemonSpecies { get; set; } = "";
        }

        private static DateOnly GetCurrentGameDay(DateTimeOffset effectiveNowLocal)
        {
            return SleepRewardCalculator.GetGameDayForWakeLocal(effectiveNowLocal.LocalDateTime);
        }

        private static int NormalizeStepsRequired(int value, int fallback)
        {
            return value <= 0 ? fallback : value;
        }

        private static double NormalizeSleepMultiplier(double sleepMultiplier)
        {
            return sleepMultiplier < 1.0 ? 1.0 : sleepMultiplier;
        }

        private static int CalculateCurrentHatchThreshold(int baseStepsRequired, double sleepMultiplier)
        {
            int normalizedBase = Math.Max(1, baseStepsRequired);
            double normalizedMultiplier = NormalizeSleepMultiplier(sleepMultiplier);
            return Math.Max(1, (int)Math.Ceiling(normalizedBase / normalizedMultiplier));
        }

        private static EggInventoryEntry MapEgg(EggRow row)
        {
            DateOnly addedGameDay = DateOnly.MinValue;
            if (!DateOnly.TryParse(row.AddedGameDay, CultureInfo.InvariantCulture, DateTimeStyles.None, out addedGameDay))
                addedGameDay = DateOnly.MinValue;

            return new EggInventoryEntry
            {
                Id = row.Id,
                Rarity = (EggRarity)row.Rarity,
                BaseStepsRequired = row.BaseStepsRequired,
                RawStepsWalked = row.RawStepsWalked,
                AddedGameDay = addedGameDay,
                AddedAtUtc = row.AddedAtUtc ?? "",
                IsActive = row.IsActive != 0,
                ActivatedAtUtc = row.ActivatedAtUtc ?? "",
                HatchedAtUtc = row.HatchedAtUtc ?? "",
                HatchedPokemonSpecies = row.HatchedPokemonSpecies ?? ""
            };
        }

        private static string PickPokemon(EggRarity rarity)
        {
            string[] pool = rarity switch
            {
                EggRarity.Common => new[] { "Wurmple", "Mankey", "Poliwag" },
                EggRarity.Uncommon => new[] { "Spinda", "Ditto", "Seel" },
                EggRarity.Rare => new[] { "Eevee", "Larvitar", "Mudkip" },
                _ => new[] { "Wurmple" }
            };

            return pool[Random.Shared.Next(pool.Length)];
        }

        private static int GetBaseRequirementForRarity(EggSettings settings, EggRarity rarity)
        {
            return rarity switch
            {
                EggRarity.Common => NormalizeStepsRequired(settings.CommonStepsRequired, 10000),
                EggRarity.Uncommon => NormalizeStepsRequired(settings.UncommonStepsRequired, 20000),
                EggRarity.Rare => NormalizeStepsRequired(settings.RareStepsRequired, 30000),
                _ => 10000
            };
        }

        private static string BuildLastHatchSummary(HatchedPokemonEntry? latest)
        {
            if (latest == null)
                return "none yet";

            return $"{latest.Species} hatched from a {latest.SourceEggRarity} egg on {latest.HatchedGameDay:yyyy-MM-dd}";
        }

        private static async Task<EggRow?> GetActiveEggRowAsync(IDbConnection conn, IDbTransaction? tx)
        {
            return await conn.QuerySingleOrDefaultAsync<EggRow>(@"
SELECT
    Id,
    Rarity,
    BaseStepsRequired,
    RawStepsWalked,
    AddedGameDay,
    AddedAtUtc,
    IsActive,
    COALESCE(ActivatedAtUtc, '') AS ActivatedAtUtc,
    COALESCE(ReturnedToInventoryAtUtc, '') AS ReturnedToInventoryAtUtc,
    COALESCE(HatchedGameDay, '') AS HatchedGameDay,
    COALESCE(HatchedAtUtc, '') AS HatchedAtUtc,
    COALESCE(HatchedPokemonSpecies, '') AS HatchedPokemonSpecies
FROM EggInventory
WHERE IsActive = 1
  AND (HatchedAtUtc IS NULL OR TRIM(HatchedAtUtc) = '')
ORDER BY Id
LIMIT 1;",
                transaction: tx);
        }

        private static async Task<List<EggRow>> GetInventoryRowsAsync(IDbConnection conn, IDbTransaction? tx)
        {
            var rows = await conn.QueryAsync<EggRow>(@"
SELECT
    Id,
    Rarity,
    BaseStepsRequired,
    RawStepsWalked,
    AddedGameDay,
    AddedAtUtc,
    IsActive,
    COALESCE(ActivatedAtUtc, '') AS ActivatedAtUtc,
    COALESCE(ReturnedToInventoryAtUtc, '') AS ReturnedToInventoryAtUtc,
    COALESCE(HatchedGameDay, '') AS HatchedGameDay,
    COALESCE(HatchedAtUtc, '') AS HatchedAtUtc,
    COALESCE(HatchedPokemonSpecies, '') AS HatchedPokemonSpecies
FROM EggInventory
WHERE (HatchedAtUtc IS NULL OR TRIM(HatchedAtUtc) = '')
  AND IsActive = 0
ORDER BY Id ASC;",
                transaction: tx);

            return rows.ToList();
        }

        private static async Task<List<HatchedPokemonEntry>> GetHatchedPokemonAsync(IDbConnection conn, IDbTransaction? tx)
        {
            var rows = await conn.QueryAsync(@"
SELECT
    Id,
    Species,
    SourceEggRarity,
    HatchedGameDay,
    HatchedAtUtc
FROM HatchedPokemon
ORDER BY Id DESC
LIMIT 30;",
                transaction: tx);

            var result = new List<HatchedPokemonEntry>();

            foreach (var row in rows)
            {
                string hatchedGameDayText = Convert.ToString(row.HatchedGameDay, CultureInfo.InvariantCulture) ?? "";
                if (!DateOnly.TryParse(hatchedGameDayText, CultureInfo.InvariantCulture, DateTimeStyles.None, out var hatchedGameDay))
                    hatchedGameDay = DateOnly.MinValue;

                result.Add(new HatchedPokemonEntry
                {
                    Id = Convert.ToInt64(row.Id),
                    Species = Convert.ToString(row.Species, CultureInfo.InvariantCulture) ?? "",
                    SourceEggRarity = (EggRarity)Convert.ToInt32(row.SourceEggRarity),
                    HatchedGameDay = hatchedGameDay,
                    HatchedAtUtc = Convert.ToString(row.HatchedAtUtc, CultureInfo.InvariantCulture) ?? ""
                });
            }

            return result;
        }
        #endregion // SECTION A — Helpers

        #region SECTION B — Settings + Status
        public EggSettings BuildDefaultSettings()
        {
            return new EggSettings
            {
                CommonStepsRequired = 10000,
                UncommonStepsRequired = 20000,
                RareStepsRequired = 30000
            };
        }

        public async Task<EggSettings> GetSettingsAsync()
        {
            EggSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            var row = await conn.QuerySingleAsync(@"
SELECT
    CommonStepsRequired,
    UncommonStepsRequired,
    RareStepsRequired
FROM EggSettings
WHERE Id = 1;");

            return new EggSettings
            {
                CommonStepsRequired = NormalizeStepsRequired(Convert.ToInt32(row.CommonStepsRequired), 10000),
                UncommonStepsRequired = NormalizeStepsRequired(Convert.ToInt32(row.UncommonStepsRequired), 20000),
                RareStepsRequired = NormalizeStepsRequired(Convert.ToInt32(row.RareStepsRequired), 30000)
            };
        }

        public async Task SaveSettingsAsync(EggSettings settings)
        {
            EggSchema.EnsureCreated();

            settings ??= BuildDefaultSettings();

            settings.CommonStepsRequired = NormalizeStepsRequired(settings.CommonStepsRequired, 10000);
            settings.UncommonStepsRequired = NormalizeStepsRequired(settings.UncommonStepsRequired, 20000);
            settings.RareStepsRequired = NormalizeStepsRequired(settings.RareStepsRequired, 30000);

            using var conn = Db.OpenConnection();

            await conn.ExecuteAsync(@"
UPDATE EggSettings
SET
    CommonStepsRequired = @CommonStepsRequired,
    UncommonStepsRequired = @UncommonStepsRequired,
    RareStepsRequired = @RareStepsRequired,
    UpdatedAtUtc = @UpdatedAtUtc
WHERE Id = 1;",
                new
                {
                    settings.CommonStepsRequired,
                    settings.UncommonStepsRequired,
                    settings.RareStepsRequired,
                    UpdatedAtUtc = DateTimeOffset.UtcNow.ToString("O")
                });
        }

        public async Task ResetSettingsAsync()
        {
            await SaveSettingsAsync(BuildDefaultSettings());
        }

        public async Task<EggDashboardStatus> GetDashboardStatusAsync(DateTimeOffset effectiveNowLocal, double sleepMultiplier)
        {
            EggSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            EggSettings settings = await GetSettingsAsync();
            EggRow? activeRow = await GetActiveEggRowAsync(conn, tx: null);
            List<EggRow> inventoryRows = await GetInventoryRowsAsync(conn, tx: null);
            List<HatchedPokemonEntry> hatchedPokemon = await GetHatchedPokemonAsync(conn, tx: null);

            EggInventoryEntry? activeEgg = activeRow == null ? null : MapEgg(activeRow);
            int currentThreshold = activeEgg == null ? 0 : CalculateCurrentHatchThreshold(activeEgg.BaseStepsRequired, sleepMultiplier);
            int remainingRawSteps = activeEgg == null ? 0 : Math.Max(0, currentThreshold - activeEgg.RawStepsWalked);

            return new EggDashboardStatus
            {
                Settings = settings,
                InventoryEggs = inventoryRows.Select(MapEgg).ToList(),
                ActiveEgg = activeEgg,
                HatchedPokemon = hatchedPokemon,
                CurrentSleepMultiplier = NormalizeSleepMultiplier(sleepMultiplier),
                CurrentHatchThreshold = currentThreshold,
                RemainingRawSteps = remainingRawSteps,
                LastHatchSummary = BuildLastHatchSummary(hatchedPokemon.FirstOrDefault())
            };
        }
        #endregion // SECTION B — Settings + Status

        #region SECTION C — Commands
        public async Task AddEggAsync(EggRarity rarity, DateTimeOffset effectiveNowLocal)
        {
            EggSchema.EnsureCreated();

            using var conn = Db.OpenConnection();
            using var tx = conn.BeginTransaction();

            var active = await GetActiveEggRowAsync(conn, tx);
            if (active != null)
                throw new InvalidOperationException("Return the active egg to inventory before adding another test egg.");

            EggSettings settings = await GetSettingsAsync();
            int baseRequirement = GetBaseRequirementForRarity(settings, rarity);
            DateOnly currentGameDay = GetCurrentGameDay(effectiveNowLocal);

            await conn.ExecuteAsync(@"
INSERT INTO EggInventory
    (Rarity, BaseStepsRequired, RawStepsWalked, AddedGameDay, AddedAtUtc, IsActive)
VALUES
    (@Rarity, @BaseStepsRequired, 0, @AddedGameDay, @AddedAtUtc, 0);",
                new
                {
                    Rarity = (int)rarity,
                    BaseStepsRequired = baseRequirement,
                    AddedGameDay = currentGameDay.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                    AddedAtUtc = DateTimeOffset.UtcNow.ToString("O")
                },
                transaction: tx);

            tx.Commit();
        }

        public async Task ActivateEggAsync(long eggId, DateTimeOffset effectiveNowLocal)
        {
            EggSchema.EnsureCreated();

            using var conn = Db.OpenConnection();
            using var tx = conn.BeginTransaction();

            var active = await GetActiveEggRowAsync(conn, tx);
            if (active != null)
                throw new InvalidOperationException("An egg is already incubating. Return it to inventory before activating a different egg.");

            long exists = await conn.ExecuteScalarAsync<long>(@"
SELECT COUNT(*)
FROM EggInventory
WHERE Id = @Id
  AND IsActive = 0
  AND (HatchedAtUtc IS NULL OR TRIM(HatchedAtUtc) = '');",
                new { Id = eggId },
                transaction: tx);

            if (exists <= 0)
                throw new InvalidOperationException("Choose an egg from inventory first.");

            await conn.ExecuteAsync(@"
UPDATE EggInventory
SET
    IsActive = 1,
    ActivatedAtUtc = @ActivatedAtUtc
WHERE Id = @Id;",
                new
                {
                    Id = eggId,
                    ActivatedAtUtc = DateTimeOffset.UtcNow.ToString("O")
                },
                transaction: tx);

            tx.Commit();
        }

        public async Task ReturnActiveEggToInventoryAsync(DateTimeOffset effectiveNowLocal)
        {
            EggSchema.EnsureCreated();

            using var conn = Db.OpenConnection();
            using var tx = conn.BeginTransaction();

            var active = await GetActiveEggRowAsync(conn, tx);
            if (active == null)
                return;

            await conn.ExecuteAsync(@"
UPDATE EggInventory
SET
    IsActive = 0,
    ReturnedToInventoryAtUtc = @ReturnedAtUtc
WHERE Id = @Id;",
                new
                {
                    Id = active.Id,
                    ReturnedAtUtc = DateTimeOffset.UtcNow.ToString("O")
                },
                transaction: tx);

            tx.Commit();
        }

        public async Task<EggProgressResult> ProcessStepsAddedAsync(int rawStepsAdded, DateTimeOffset effectiveNowLocal, double sleepMultiplier)
        {
            EggSchema.EnsureCreated();

            if (rawStepsAdded <= 0)
                return new EggProgressResult();

            using var conn = Db.OpenConnection();
            using var tx = conn.BeginTransaction();

            var active = await GetActiveEggRowAsync(conn, tx);
            if (active == null)
            {
                tx.Commit();
                return new EggProgressResult();
            }

            int newRawStepsWalked = Math.Max(0, active.RawStepsWalked + rawStepsAdded);

            await conn.ExecuteAsync(@"
UPDATE EggInventory
SET RawStepsWalked = @RawStepsWalked
WHERE Id = @Id;",
                new
                {
                    Id = active.Id,
                    RawStepsWalked = newRawStepsWalked
                },
                transaction: tx);

            active.RawStepsWalked = newRawStepsWalked;

            EggProgressResult result = await TryHatchIfReadyAsync(conn, tx, active, effectiveNowLocal, sleepMultiplier);

            tx.Commit();
            return result;
        }

        public async Task<EggProgressResult> EvaluateActiveEggAgainstSleepAsync(DateTimeOffset effectiveNowLocal, double sleepMultiplier)
        {
            EggSchema.EnsureCreated();

            using var conn = Db.OpenConnection();
            using var tx = conn.BeginTransaction();

            var active = await GetActiveEggRowAsync(conn, tx);
            if (active == null)
            {
                tx.Commit();
                return new EggProgressResult();
            }

            EggProgressResult result = await TryHatchIfReadyAsync(conn, tx, active, effectiveNowLocal, sleepMultiplier);

            tx.Commit();
            return result;
        }

        public async Task DeleteAllEggDataAsync()
        {
            EggSchema.EnsureCreated();

            EggSettings defaults = BuildDefaultSettings();

            using var conn = Db.OpenConnection();
            using var tx = conn.BeginTransaction();

            await conn.ExecuteAsync("DELETE FROM EggInventory;", transaction: tx);
            await conn.ExecuteAsync("DELETE FROM HatchedPokemon;", transaction: tx);

            await conn.ExecuteAsync(@"
UPDATE EggSettings
SET
    CommonStepsRequired = @CommonStepsRequired,
    UncommonStepsRequired = @UncommonStepsRequired,
    RareStepsRequired = @RareStepsRequired,
    UpdatedAtUtc = @UpdatedAtUtc
WHERE Id = 1;",
                new
                {
                    defaults.CommonStepsRequired,
                    defaults.UncommonStepsRequired,
                    defaults.RareStepsRequired,
                    UpdatedAtUtc = DateTimeOffset.UtcNow.ToString("O")
                },
                transaction: tx);

            tx.Commit();
        }

        private static async Task<EggProgressResult> TryHatchIfReadyAsync(
            IDbConnection conn,
            IDbTransaction tx,
            EggRow active,
            DateTimeOffset effectiveNowLocal,
            double sleepMultiplier)
        {
            int currentThreshold = CalculateCurrentHatchThreshold(active.BaseStepsRequired, sleepMultiplier);

            if (active.RawStepsWalked < currentThreshold)
                return new EggProgressResult();

            EggRarity rarity = (EggRarity)active.Rarity;
            string species = PickPokemon(rarity);
            DateOnly currentGameDay = GetCurrentGameDay(effectiveNowLocal);
            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            await conn.ExecuteAsync(@"
UPDATE EggInventory
SET
    IsActive = 0,
    HatchedGameDay = @HatchedGameDay,
    HatchedAtUtc = @HatchedAtUtc,
    HatchedPokemonSpecies = @HatchedPokemonSpecies
WHERE Id = @Id;",
                new
                {
                    Id = active.Id,
                    HatchedGameDay = currentGameDay.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                    HatchedAtUtc = nowUtc,
                    HatchedPokemonSpecies = species
                },
                transaction: tx);

            await conn.ExecuteAsync(@"
INSERT INTO HatchedPokemon
    (Species, SourceEggRarity, HatchedGameDay, HatchedAtUtc)
VALUES
    (@Species, @SourceEggRarity, @HatchedGameDay, @HatchedAtUtc);",
                new
                {
                    Species = species,
                    SourceEggRarity = (int)rarity,
                    HatchedGameDay = currentGameDay.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                    HatchedAtUtc = nowUtc
                },
                transaction: tx);

            return new EggProgressResult
            {
                Hatched = true,
                Species = species,
                Rarity = rarity,
                Summary = $"{species} hatched from a {rarity} egg."
            };
        }
        #endregion // SECTION C — Commands
    }
}