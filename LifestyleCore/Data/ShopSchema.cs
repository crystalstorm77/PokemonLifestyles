using System;
using Dapper;

namespace LifestyleCore.Data
{
    public static class ShopSchema
    {
        #region SECTION A — Shop Schema
        private static bool _created = false;
        #endregion // SECTION A — Shop Schema

        #region SECTION B — Ensure Created
        public static void EnsureCreated()
        {
            if (_created)
                return;

            using var conn = Db.OpenConnection();

            conn.Execute(@"
CREATE TABLE IF NOT EXISTS ShopSettings (
    Id INTEGER PRIMARY KEY CHECK (Id = 1),
    CommonItemCoinCost INTEGER NOT NULL,
    UncommonItemCoinCost INTEGER NOT NULL,
    RareItemCoinCost INTEGER NOT NULL,
    CommonEggTicketCost INTEGER NOT NULL,
    UncommonEggTicketCost INTEGER NOT NULL,
    RareEggTicketCost INTEGER NOT NULL,
    UpdatedAtUtc TEXT NOT NULL
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

            TryAddColumn(@"ALTER TABLE ShopSettings ADD COLUMN CommonItemCoinCost INTEGER NOT NULL DEFAULT 25;");
            TryAddColumn(@"ALTER TABLE ShopSettings ADD COLUMN UncommonItemCoinCost INTEGER NOT NULL DEFAULT 60;");
            TryAddColumn(@"ALTER TABLE ShopSettings ADD COLUMN RareItemCoinCost INTEGER NOT NULL DEFAULT 120;");
            TryAddColumn(@"ALTER TABLE ShopSettings ADD COLUMN CommonEggTicketCost INTEGER NOT NULL DEFAULT 4;");
            TryAddColumn(@"ALTER TABLE ShopSettings ADD COLUMN UncommonEggTicketCost INTEGER NOT NULL DEFAULT 8;");
            TryAddColumn(@"ALTER TABLE ShopSettings ADD COLUMN RareEggTicketCost INTEGER NOT NULL DEFAULT 15;");
            TryAddColumn(@"ALTER TABLE ShopSettings ADD COLUMN UpdatedAtUtc TEXT NOT NULL DEFAULT '';");

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            conn.Execute(@"
INSERT OR IGNORE INTO ShopSettings
    (Id, CommonItemCoinCost, UncommonItemCoinCost, RareItemCoinCost, CommonEggTicketCost, UncommonEggTicketCost, RareEggTicketCost, UpdatedAtUtc)
VALUES
    (1, 25, 60, 120, 4, 8, 15, @NowUtc);",
                new { NowUtc = nowUtc });

            conn.Execute(@"
UPDATE ShopSettings
SET
    CommonItemCoinCost = COALESCE(CommonItemCoinCost, 25),
    UncommonItemCoinCost = COALESCE(UncommonItemCoinCost, 60),
    RareItemCoinCost = COALESCE(RareItemCoinCost, 120),
    CommonEggTicketCost = COALESCE(CommonEggTicketCost, 4),
    UncommonEggTicketCost = COALESCE(UncommonEggTicketCost, 8),
    RareEggTicketCost = COALESCE(RareEggTicketCost, 15),
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