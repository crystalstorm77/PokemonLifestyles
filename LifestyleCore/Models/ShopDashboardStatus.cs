using System.Collections.Generic;

namespace LifestyleCore.Models
{
    public sealed class ShopDashboardStatus
    {
        #region SECTION A — State
        public ShopSettings Settings { get; set; } = new();
        public int CurrentCoins { get; set; }
        public int CurrentTickets { get; set; }
        public List<ShopItemOffer> ItemOffers { get; set; } = new();
        public WeeklyCrateStatus? WeeklyCrateStatus { get; set; }
        #endregion // SECTION A — State
    }
}