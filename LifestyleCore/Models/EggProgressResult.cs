namespace LifestyleCore.Models
{
    public sealed class EggProgressResult
    {
        #region SECTION A — Result
        public bool Hatched { get; set; }
        public string Species { get; set; } = "";
        public EggRarity? Rarity { get; set; }
        public string Summary { get; set; } = "";
        #endregion // SECTION A — Result
    }
}