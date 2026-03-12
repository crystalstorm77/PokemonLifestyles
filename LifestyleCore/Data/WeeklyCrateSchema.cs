using Dapper;
using LifestyleCore.Data;
using System;

namespace LifestyleCore.Data
{
    public static class WeeklyCrateSchema
    {
        #region SECTION A — Weekly Crate Schema
        private static bool _created = false;
        #endregion // SECTION A — Weekly Crate Schema

        #region SECTION B — Ensure Created
        public static void EnsureCreated()
        {
            if (_created)
                return;

            using var conn = Db.OpenConnection();

            conn.Execute(@"
CREATE TABLE IF NOT EXISTS WeeklyCrateSettings (
    Id INTEGER PRIMARY KEY CHECK (Id = 1),
    IsEnabled INTEGER NOT NULL,
    TicketCost INTEGER NOT NULL,
    RollCount INTEGER NOT NULL,
    UpdatedAtUtc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS WeeklyCrateClaims (
    WeekStart TEXT PRIMARY KEY,
    OpenedGameDay TEXT NOT NULL,
    OpenedAtUtc TEXT NOT NULL,
    TicketCost INTEGER NOT NULL,
    RollCount INTEGER NOT NULL,
    RewardSummary TEXT NULL
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
                    // Ignore “duplicate column” style upgrade errors.
                }
            }

            TryAddColumn(@"ALTER TABLE WeeklyCrateSettings ADD COLUMN IsEnabled INTEGER NOT NULL DEFAULT 1;");
            TryAddColumn(@"ALTER TABLE WeeklyCrateSettings ADD COLUMN TicketCost INTEGER NOT NULL DEFAULT 5;");
            TryAddColumn(@"ALTER TABLE WeeklyCrateSettings ADD COLUMN RollCount INTEGER NOT NULL DEFAULT 3;");
            TryAddColumn(@"ALTER TABLE WeeklyCrateSettings ADD COLUMN UpdatedAtUtc TEXT NOT NULL DEFAULT '';");

            TryAddColumn(@"ALTER TABLE WeeklyCrateClaims ADD COLUMN OpenedGameDay TEXT NOT NULL DEFAULT '';");
            TryAddColumn(@"ALTER TABLE WeeklyCrateClaims ADD COLUMN OpenedAtUtc TEXT NOT NULL DEFAULT '';");
            TryAddColumn(@"ALTER TABLE WeeklyCrateClaims ADD COLUMN TicketCost INTEGER NOT NULL DEFAULT 0;");
            TryAddColumn(@"ALTER TABLE WeeklyCrateClaims ADD COLUMN RollCount INTEGER NOT NULL DEFAULT 0;");
            TryAddColumn(@"ALTER TABLE WeeklyCrateClaims ADD COLUMN RewardSummary TEXT NULL;");

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            conn.Execute(@"
INSERT OR IGNORE INTO WeeklyCrateSettings
    (Id, IsEnabled, TicketCost, RollCount, UpdatedAtUtc)
VALUES
    (1, 1, 5, 3, @NowUtc);",
                new { NowUtc = nowUtc });

            conn.Execute(@"
UPDATE WeeklyCrateSettings
SET
    IsEnabled = COALESCE(IsEnabled, 1),
    TicketCost = COALESCE(TicketCost, 5),
    RollCount = COALESCE(RollCount, 3),
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