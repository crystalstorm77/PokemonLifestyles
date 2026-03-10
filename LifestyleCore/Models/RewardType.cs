#region SECTION A — Reward Types
namespace LifestyleCore.Models
{
    public enum RewardType
    {
        #region SECTION B — Tickets
        HabitTicketCheckbox = 100, // (Reserved for later)
        HabitTicketWeeklyBonus = 110,
        #endregion // SECTION B — Tickets

        #region SECTION C — Coins / Focus
        FocusCoins = 200,
        TrainerXp = 210,
        #endregion // SECTION C — Coins / Focus

        #region SECTION D — Sleep / Steps (Reserved)
        SleepLuckMultiplier = 300,
        StepItemRoll = 400,
        StepEggHatch = 410
        #endregion // SECTION D — Sleep / Steps (Reserved)
    }
}
#endregion // SECTION A — Reward Types