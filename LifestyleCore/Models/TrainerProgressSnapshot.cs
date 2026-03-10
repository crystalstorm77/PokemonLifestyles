#region SECTION A — Trainer Progress Snapshot Model
namespace LifestyleCore.Models
{
    public sealed class TrainerProgressSnapshot
    {
        #region SECTION B — Columns
        public int PrestigeCount { get; set; }
        public int CurrentCycleXp { get; set; }
        public int MaxCycleXp { get; set; }

        public int CurrentLevel { get; set; }
        public int CurrentLevelBaseXp { get; set; }
        public int NextLevelBaseXp { get; set; }

        public int XpIntoCurrentLevel { get; set; }
        public int XpNeededForNextLevel { get; set; }

        public bool IsMaxLevel { get; set; }
        #endregion // SECTION B — Columns
    }
}
#endregion // SECTION A — Trainer Progress Snapshot Model