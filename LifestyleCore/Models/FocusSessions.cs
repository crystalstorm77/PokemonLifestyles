using System;

namespace LifestyleCore.Models
{
    public sealed class FocusSession
    {
        #region SECTION A — Focus session model
        public long Id { get; set; }
        public DateTimeOffset LoggedAtUtc { get; set; }
        public DateOnly LogDate { get; set; }
        public string FocusType { get; set; } = "Draw"; // "Draw" or "Music"
        public int Minutes { get; set; }
        public bool Completed { get; set; }

        public DateTimeOffset LoggedAtLocal => LoggedAtUtc.ToLocalTime();
        #endregion // SECTION A — Focus session model

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