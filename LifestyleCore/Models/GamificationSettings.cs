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
    }
}