using System.Collections.Generic;

namespace LifestyleCore.Models
{
    public sealed class EggDashboardStatus
    {
        #region SECTION A — State
        public EggSettings Settings { get; set; } = new();
        public List<EggInventoryEntry> InventoryEggs { get; set; } = new();
        public EggInventoryEntry? ActiveEgg { get; set; }
        public List<HatchedPokemonEntry> HatchedPokemon { get; set; } = new();

        public double CurrentSleepMultiplier { get; set; } = 1.0;
        public int CurrentHatchThreshold { get; set; }
        public int RemainingRawSteps { get; set; }
        public string LastHatchSummary { get; set; } = "";

        public bool HasActiveEgg => ActiveEgg != null;
        #endregion // SECTION A — State
    }
}