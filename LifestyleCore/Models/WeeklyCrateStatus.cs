namespace LifestyleCore.Models
{
    public sealed class WeeklyCrateStatus
    {
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