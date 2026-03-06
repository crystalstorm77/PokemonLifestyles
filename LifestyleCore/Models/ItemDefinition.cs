// ============================================================
// SECTION A — Item Definition Model
// ============================================================

namespace LifestyleCore.Models
{
    public sealed class ItemDefinition
    {
        public string Name { get; set; } = "";

        // Optional tag to group items (e.g. "Healing", "Ball", "Status", "Valuable")
        public string Category { get; set; } = "";

        public ItemTier Tier { get; set; } = ItemTier.Common;

        public int Weight { get; set; } = 1;

        public bool IsActive { get; set; } = true;

        // For backup/import compatibility (same pattern as other tables)
        public string ExternalId { get; set; } = "";

        // Optional bookkeeping
        public string CreatedAtUtc { get; set; } = "";

        public string? DeletedAtUtc { get; set; }
    }
}