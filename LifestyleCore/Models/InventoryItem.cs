// ============================================================
// SECTION A — Inventory Item Model
// ============================================================

namespace LifestyleCore.Models
{
    public sealed class InventoryItem
    {
        // ============================================================
        // SECTION B — Columns
        // ============================================================

        public string ItemKey { get; set; } = "";
        public int Count { get; set; }
    }
}