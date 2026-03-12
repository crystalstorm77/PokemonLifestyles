namespace LifestyleCore.Models
{
    public sealed class ShopItemOffer
    {
        #region SECTION A — Columns
        public string Name { get; set; } = "";
        public string Category { get; set; } = "";
        public ItemTier Tier { get; set; }
        public int CoinPrice { get; set; }
        public int InventoryCount { get; set; }

        public string Display
        {
            get
            {
                string categoryText = string.IsNullOrWhiteSpace(Category) ? "Uncategorised" : Category;
                return $"{Name} — {Tier} — {CoinPrice:#,0} coins — in bag: {InventoryCount:#,0} — {categoryText}";
            }
        }
        #endregion // SECTION A — Columns
    }
}