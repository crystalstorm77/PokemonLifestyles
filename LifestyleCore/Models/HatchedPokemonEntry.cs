using System;

namespace LifestyleCore.Models
{
    public sealed class HatchedPokemonEntry
    {
        #region SECTION A — Columns
        public long Id { get; set; }
        public string Species { get; set; } = "";
        public EggRarity SourceEggRarity { get; set; }
        public DateOnly HatchedGameDay { get; set; }
        public string HatchedAtUtc { get; set; } = "";
        #endregion // SECTION A — Columns
    }
}