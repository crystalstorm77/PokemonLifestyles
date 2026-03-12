using System;

namespace LifestyleCore.Models
{
    public sealed class EggInventoryEntry
    {
        #region SECTION A — Columns
        public long Id { get; set; }
        public EggRarity Rarity { get; set; }
        public int BaseStepsRequired { get; set; }
        public int RawStepsWalked { get; set; }
        public DateOnly AddedGameDay { get; set; }
        public string AddedAtUtc { get; set; } = "";
        public bool IsActive { get; set; }
        public string ActivatedAtUtc { get; set; } = "";
        public string HatchedAtUtc { get; set; } = "";
        public string HatchedPokemonSpecies { get; set; } = "";

        public bool IsHatched => !string.IsNullOrWhiteSpace(HatchedAtUtc);
        #endregion // SECTION A — Columns
    }
}