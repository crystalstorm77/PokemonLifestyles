namespace LifestyleCore.Models
{
    public sealed class GamificationSettings
    {
        #region SECTION B — Columns
        public int StepsPerItemRoll { get; set; } = 1000;
        public int ItemRollOneInN { get; set; } = 4;

        // Tier weights (used only when a roll succeeds)
        public int CommonTierWeight { get; set; } = 80;
        public int UncommonTierWeight { get; set; } = 18;
        public int RareTierWeight { get; set; } = 2;

        // Sleep reward tuning
        public double SleepHealthyMinHours { get; set; } = 7.0;
        public double SleepHealthyMaxHours { get; set; } = 9.0;
        public double SleepHealthyMultiplier { get; set; } = 1.30;
        public double SleepOutsideRangeStartMultiplier { get; set; } = 1.30;
        public double SleepPenaltyPer15Min { get; set; } = 0.01;
        public double SleepTrackedMinimumMultiplier { get; set; } = 1.10;
        public int SleepRewardMinimumMinutes { get; set; } = 60;

        // Trainer XP tuning
        public double FocusXpPerMinute { get; set; } = 100.0;
        public double FocusXpIncompleteMultiplier { get; set; } = 0.25;

        // One item per line.
        // Notes:
        // - Duplicates weight within that tier.
        // - Capitalization/spacing is normalized (Potion == potion).
        // - If a tier textbox is blank/null, we fall back to defaults.
        public string CommonPoolText { get; set; } = "";
        public string UncommonPoolText { get; set; } = "";
        public string RarePoolText { get; set; } = "";
        #endregion // SECTION B — Columns
    }
}

