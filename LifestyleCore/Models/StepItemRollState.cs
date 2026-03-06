// ============================================================
// SECTION A — Step Item Roll State Model
// ============================================================

namespace LifestyleCore.Models
{
    public sealed class StepItemRollState
    {
        // ============================================================
        // SECTION B — Columns
        // ============================================================
        public int StepsRemainder { get; set; }

        public long TotalRolls { get; set; }

        public long TotalSuccesses { get; set; }

        // Optional: persisted “last drop” info (no full history).
        public string? LastDropUtc { get; set; }

        public string? LastDropSummary { get; set; }