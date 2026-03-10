#region SECTION A — Habit Model
namespace LifestyleCore.Models
{
    public enum HabitKind
    {
        CheckboxDaily = 0,
        NumericDaily = 1
    }

    public sealed class Habit
    {
        #region SECTION B — Columns
        public long Id { get; set; }
        public string ExternalId { get; set; } = "";
        public string Title { get; set; } = "";
        public HabitKind Kind { get; set; }
        public int TargetPerWeek { get; set; }
        public int IsArchived { get; set; } // SQLite int (0/1)
        public string CreatedAtUtc { get; set; } = "";
        public string UpdatedAtUtc { get; set; } = "";
        #endregion // SECTION B — Columns
    }
}
#endregion // SECTION A — Habit Model