// ============================================================
// SECTION A — Sleep Session Model
// ============================================================

using System;

namespace LifestyleCore.Models
{
    public sealed class SleepSession
    {
        public long Id { get; set; }

        public DateTimeOffset StartUtc { get; set; }
        public DateTimeOffset EndUtc { get; set; }

        public DateOnly WakeLogDate { get; set; }
        public int DurationMinutes { get; set; }

        public DateTimeOffset StartLocal => StartUtc.ToLocalTime();
        public DateTimeOffset EndLocal => EndUtc.ToLocalTime();

        public double DurationHours => Math.Round(DurationMinutes / 60.0, 2);

        // ============================================================
        // SECTION B — Editable fields for UI (local time)
        // Format shown: yyyy-MM-dd HH:mm:ss
        // (We still accept input without seconds: yyyy-MM-dd HH:mm)
        // ============================================================
        private string? _startLocalEdit;
        private string? _endLocalEdit;

        public string StartLocalEdit
        {
            get => _startLocalEdit ?? StartLocal.ToString("yyyy-MM-dd HH:mm:ss");
            set => _startLocalEdit = value;
        }

        public string EndLocalEdit
        {
            get => _endLocalEdit ?? EndLocal.ToString("yyyy-MM-dd HH:mm:ss");
            set => _endLocalEdit = value;
        }

        public string WakeLogDateEdit => WakeLogDate.ToString("yyyy-MM-dd");
    }
}