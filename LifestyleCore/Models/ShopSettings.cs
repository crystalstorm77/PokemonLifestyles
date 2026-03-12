namespace LifestyleCore.Models
{
    public sealed class ShopSettings
    {
        #region SECTION A — Columns
        public int CommonItemCoinCost { get; set; } = 25;
        public int UncommonItemCoinCost { get; set; } = 60;
        public int RareItemCoinCost { get; set; } = 120;

        public int CommonEggTicketCost { get; set; } = 4;
        public int UncommonEggTicketCost { get; set; } = 8;
        public int RareEggTicketCost { get; set; } = 15;
        #endregion // SECTION A — Columns
    }
}