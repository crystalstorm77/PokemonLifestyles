using System;

namespace LifestyleCore.Models
{
    public sealed class FoodEntry
    {
        #region SECTION A — Food Entry Model
        public long Id { get; set; }
        public DateTimeOffset LoggedAtUtc { get; set; }
        public DateOnly LogDate { get; set; }

        public long FoodItemId { get; set; }

        // Snapshot fields (so history doesn’t rewrite when menu changes)
        public string FoodName { get; set; } = "";
        public string ServingLabel { get; set; } = "";
        public double KjPerServingSnapshot { get; set; }
        public double? KjPer100gSnapshot { get; set; }

        public double? Servings { get; set; }
        public int? Grams { get; set; }

        public double KjComputed { get; set; }

        // Convenience for UI display
        public DateTimeOffset LoggedAtLocal => LoggedAtUtc.ToLocalTime();
        #endregion // SECTION A — Food Entry Model

        #region SECTION B — Editable fields for UI (local time + date)
        private string? _logDateEdit;
        private string? _loggedAtLocalEdit;

        // Format: yyyy-MM-dd
        public string LogDateEdit
        {
            get => _logDateEdit ?? LogDate.ToString("yyyy-MM-dd");
            set => _logDateEdit = value;
        }

        // Format: yyyy-MM-dd HH:mm (local time)
        public string LoggedAtLocalEdit
        {
            get => _loggedAtLocalEdit ?? LoggedAtLocal.ToString("yyyy-MM-dd HH:mm");
            set => _loggedAtLocalEdit = value;
        }
        #endregion // SECTION B — Editable fields for UI (local time + date)
    }
}