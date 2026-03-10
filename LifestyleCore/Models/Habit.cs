namespace LifestyleCore.Models
{
    public enum HabitKind
    {
        #region SECTION A — Habit Model
        CheckboxDaily = 0,
        NumericDaily = 1
        #endregion // SECTION A — Habit Model
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