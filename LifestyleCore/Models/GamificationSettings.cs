// ============================================================
// SECTION A — Gamification Settings Model
// ============================================================

namespace LifestyleCore.Models
{
    public sealed class GamificationSettings
    {
        // ============================================================
        // SECTION B — Columns
        // ============================================================

        public int StepsPerItemRoll { get; set; } = 1000;

        public int ItemRollOneInN { get; set; } = 4;

        // Tier weights (used only when a roll succeeds)
        public int CommonTierWeight { get; set; } = 80;
        public int UncommonTierWeight { get; set; } = 18;
        public int RareTierWeight { get; set; } = 2;

        // One item per line.
        // Notes:
        // - Duplicates weight within that tier.
        // - Capitalization/spacing is normalized (Potion == potion).
        // - If a tier textbox is blank/null, we fall back to defaults.
        public string CommonPoolText { get; set; } = "";
        public string UncommonPoolText { get; set; } = "";
        public string RarePoolText { get; set; } = "";
    }
}