namespace LifestyleCore.Models
{
    public sealed class HabitEntry
    {
        #region SECTION B — Columns
        public long Id { get; set; }
        public string ExternalId { get; set; } = "";
        public long HabitId { get; set; }
        public string Date { get; set; } = ""; // yyyy-MM-dd (local)
        public int Value { get; set; }
        public string UpdatedAtUtc { get; set; } = "";
        #endregion // SECTION B — Columns
    }
}