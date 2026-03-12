using System;
using Dapper;

namespace LifestyleCore.Data
{
    public static class EggSchema
    {
        #region SECTION A — Egg Schema
        private static bool _created = false;
        #endregion // SECTION A — Egg Schema

        #region SECTION B — Ensure Created
        public static void EnsureCreated()
        {
            if (_created)
                return;

            using var conn = Db.OpenConnection();

            conn.Execute(@"
CREATE TABLE IF NOT EXISTS EggSettings (
    Id INTEGER PRIMARY KEY CHECK (Id = 1),
    CommonStepsRequired INTEGER NOT NULL,
    UncommonStepsRequired INTEGER NOT NULL,
    RareStepsRequired INTEGER NOT NULL,
    UpdatedAtUtc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS EggInventory (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Rarity INTEGER NOT NULL,
    BaseStepsRequired INTEGER NOT NULL,
    RawStepsWalked INTEGER NOT NULL,
    AddedGameDay TEXT NOT NULL,
    AddedAtUtc TEXT NOT NULL,
    IsActive INTEGER NOT NULL DEFAULT 0,
    ActivatedAtUtc TEXT NULL,
    ReturnedToInventoryAtUtc TEXT NULL,
    HatchedGameDay TEXT NULL,
    HatchedAtUtc TEXT NULL,
    HatchedPokemonSpecies TEXT NULL
);

CREATE TABLE IF NOT EXISTS HatchedPokemon (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Species TEXT NOT NULL,
    SourceEggRarity INTEGER NOT NULL,
    HatchedGameDay TEXT NOT NULL,
    HatchedAtUtc TEXT NOT NULL
);
");

            void TryAddColumn(string sql)
            {
                try
                {
                    conn.Execute(sql);
                }
                catch
                {
                    // Ignore duplicate-column style upgrades.
                }
            }

            TryAddColumn(@"ALTER TABLE EggSettings ADD COLUMN CommonStepsRequired INTEGER NOT NULL DEFAULT 10000;");
            TryAddColumn(@"ALTER TABLE EggSettings ADD COLUMN UncommonStepsRequired INTEGER NOT NULL DEFAULT 20000;");
            TryAddColumn(@"ALTER TABLE EggSettings ADD COLUMN RareStepsRequired INTEGER NOT NULL DEFAULT 30000;");
            TryAddColumn(@"ALTER TABLE EggSettings ADD COLUMN UpdatedAtUtc TEXT NOT NULL DEFAULT '';");

            TryAddColumn(@"ALTER TABLE EggInventory ADD COLUMN Rarity INTEGER NOT NULL DEFAULT 0;");
            TryAddColumn(@"ALTER TABLE EggInventory ADD COLUMN BaseStepsRequired INTEGER NOT NULL DEFAULT 10000;");
            TryAddColumn(@"ALTER TABLE EggInventory ADD COLUMN RawStepsWalked INTEGER NOT NULL DEFAULT 0;");
            TryAddColumn(@"ALTER TABLE EggInventory ADD COLUMN AddedGameDay TEXT NOT NULL DEFAULT '';");
            TryAddColumn(@"ALTER TABLE EggInventory ADD COLUMN AddedAtUtc TEXT NOT NULL DEFAULT '';");
            TryAddColumn(@"ALTER TABLE EggInventory ADD COLUMN IsActive INTEGER NOT NULL DEFAULT 0;");
            TryAddColumn(@"ALTER TABLE EggInventory ADD COLUMN ActivatedAtUtc TEXT NULL;");
            TryAddColumn(@"ALTER TABLE EggInventory ADD COLUMN ReturnedToInventoryAtUtc TEXT NULL;");
            TryAddColumn(@"ALTER TABLE EggInventory ADD COLUMN HatchedGameDay TEXT NULL;");
            TryAddColumn(@"ALTER TABLE EggInventory ADD COLUMN HatchedAtUtc TEXT NULL;");
            TryAddColumn(@"ALTER TABLE EggInventory ADD COLUMN HatchedPokemonSpecies TEXT NULL;");

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            conn.Execute(@"
INSERT OR IGNORE INTO EggSettings
    (Id, CommonStepsRequired, UncommonStepsRequired, RareStepsRequired, UpdatedAtUtc)
VALUES
    (1, 10000, 20000, 30000, @NowUtc);",
                new { NowUtc = nowUtc });

            conn.Execute(@"
UPDATE EggSettings
SET
    CommonStepsRequired = COALESCE(CommonStepsRequired, 10000),
    UncommonStepsRequired = COALESCE(UncommonStepsRequired, 20000),
    RareStepsRequired = COALESCE(RareStepsRequired, 30000),
    UpdatedAtUtc = CASE
        WHEN UpdatedAtUtc IS NULL OR TRIM(UpdatedAtUtc) = '' THEN @NowUtc
        ELSE UpdatedAtUtc
    END
WHERE Id = 1;",
                new { NowUtc = nowUtc });

            _created = true;
        }
        #endregion // SECTION B — Ensure Created
    }
}