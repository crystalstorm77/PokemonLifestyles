#region SECTION A — Inventory Item Model
namespace LifestyleCore.Models
{
    public sealed class InventoryItem
    {
        #region SECTION B — Columns
        public string ItemKey { get; set; } = "";
        public int Count { get; set; }
        #endregion // SECTION B — Columns
    }
}
#endregion // SECTION A — Inventory Item Model