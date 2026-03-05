// ============================================================
// SECTION A — Rewards Ledger Entry Model
// ============================================================

namespace LifestyleCore.Models
{
    public sealed class RewardsLedgerEntry
    {
        // ============================================================
        // SECTION B — Columns
        // ============================================================

        public long Id { get; set; }
        public string ExternalId { get; set; } = "";

        public string ForGameDay { get; set; } = "";   // yyyy-MM-dd
        public string AwardedAtUtc { get; set; } = ""; // ISO 8601

        public RewardType RewardType { get; set; }
        public int Amount { get; set; }

        public long? HabitId { get; set; }
        public string? HabitDate { get; set; }         // yyyy-MM-dd

        public long? FocusSessionId { get; set; }
    }
}