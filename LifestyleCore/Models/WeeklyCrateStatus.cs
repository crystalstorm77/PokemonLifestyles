using LifestyleCore.Data;
using System.Data;

namespace LifestyleCore.Models
{
    public sealed class WeeklyCrateStatus
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

        #region SECTION B — Columns
        public DateOnly CurrentGameDay { get; set; }
        public DateOnly WeekStart { get; set; }
        public DateOnly WeekEnd { get; set; }

        public bool IsEnabled { get; set; } = true;
        public int TicketCost { get; set; } = 5;
        public int RollCount { get; set; } = 3;

        public int CurrentTickets { get; set; }
        public bool IsOpened { get; set; }
        public DateOnly? OpenedGameDay { get; set; }
        public string OpenedAtUtc { get; set; } = "";
        public string RewardSummary { get; set; } = "";

        public bool CanAfford => CurrentTickets >= TicketCost;
        public bool CanOpen => IsEnabled && !IsOpened && RollCount > 0 && TicketCost >= 0 && CanAfford;
        #endregion // SECTION B — Columns
    }
}