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

        // One item per line. If blank/null, the app will fall back to the built-in default pool.
        public string ItemPoolText { get; set; } =
            "Potion\n" +
            "Super Potion\n" +
            "Poke Ball\n" +
            "Great Ball\n" +
            "Revive\n" +
            "Antidote\n" +
            "Paralyze Heal\n" +
            "Escape Rope\n" +
            "Rare Candy\n" +
            "Nugget";
    }
}