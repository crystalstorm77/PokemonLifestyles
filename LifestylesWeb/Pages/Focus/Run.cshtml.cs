using System;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using LifestyleCore.Data;
using LifestyleCore.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace LifestylesWeb.Pages.Focus;

public class RunModel : PageModel
{
    private readonly FocusSessionRepository _focusRepo = new();

    #region SECTION A — Bound Input + Display State
    [BindProperty]
    public RunSaveInput Input { get; set; } = new();

    public string FocusType { get; private set; } = "Focus";
    public int PlannedDurationSeconds { get; private set; } = 25 * 60;
    public string TargetDurationText { get; private set; } = "25 minutes";
    public string InitialRemainingText { get; private set; } = "00:25:00";
    public string InitialElapsedText { get; private set; } = "00:00:00";
    #endregion // SECTION A — Bound Input + Display State

    #region SECTION B — Page Actions
    public IActionResult OnGet(string? focusType, int durationMinutes = 25)
    {
        string normalizedFocusType = NormalizeFocusType(focusType);
        if (string.IsNullOrWhiteSpace(normalizedFocusType))
        {
            return RedirectToPage("/Focus/Index");
        }

        int clampedMinutes = Math.Clamp(durationMinutes, 5, 120);
        ApplyRunState(normalizedFocusType, clampedMinutes * 60);

        return Page();
    }

    public async Task<IActionResult> OnPostSaveAsync()
    {
        string focusType = NormalizeFocusType(Input.FocusType);
        if (string.IsNullOrWhiteSpace(focusType))
        {
            return RedirectToPage("/Focus/Index");
        }

        int plannedDurationSeconds = Math.Clamp(Input.PlannedDurationSeconds, 300, 7200);
        int elapsedSeconds = Math.Clamp(Input.ElapsedSeconds, 0, plannedDurationSeconds);
        string saveMode = (Input.SaveMode ?? "").Trim().ToLowerInvariant();

        if (elapsedSeconds <= 0)
        {
            return RedirectToPage("/Focus/Index");
        }

        bool completed = saveMode == "complete" && elapsedSeconds >= plannedDurationSeconds;

        DateTime localDateTime = DateTime.Now;
        DateOnly logDate = GetGameDayForLocal(localDateTime);

        var session = new FocusSession
        {
            LoggedAtUtc = LocalDateTimeToLocalOffset(localDateTime).ToUniversalTime(),
            LogDate = logDate,
            FocusType = focusType,
            DurationSeconds = elapsedSeconds,
            Completed = completed
        };

        await _focusRepo.AddAsync(session);

        return RedirectToPage("/Focus/Index", new
        {
            savedFocusType = session.FocusType,
            savedDurationSeconds = session.DurationSeconds
        });
    }
    #endregion // SECTION B — Page Actions

    #region SECTION C — Helpers
    private void ApplyRunState(string focusType, int plannedDurationSeconds)
    {
        FocusType = focusType;
        PlannedDurationSeconds = Math.Clamp(plannedDurationSeconds, 300, 7200);
        TargetDurationText = FormatDurationSelection(PlannedDurationSeconds / 60);
        InitialRemainingText = FormatClock(PlannedDurationSeconds);
        InitialElapsedText = FormatClock(0);

        Input = new RunSaveInput
        {
            FocusType = FocusType,
            PlannedDurationSeconds = PlannedDurationSeconds,
            ElapsedSeconds = 0,
            SaveMode = ""
        };
    }

    private static string NormalizeFocusType(string? focusType)
    {
        string value = (focusType ?? "").Trim();

        if (value.Length > 40)
        {
            value = value[..40].Trim();
        }

        return value;
    }

    private static string FormatClock(int totalSeconds)
    {
        totalSeconds = Math.Max(0, totalSeconds);

        TimeSpan duration = TimeSpan.FromSeconds(totalSeconds);
        int totalHours = (int)duration.TotalHours;

        return $"{totalHours:00}:{duration.Minutes:00}:{duration.Seconds:00}";
    }

    private static string FormatDurationSelection(int totalMinutes)
    {
        totalMinutes = Math.Clamp(totalMinutes, 5, 120);

        int hours = totalMinutes / 60;
        int minutes = totalMinutes % 60;

        if (hours == 0)
        {
            return $"{totalMinutes} minutes";
        }

        if (minutes == 0)
        {
            return hours == 1 ? "1 hour" : $"{hours} hours";
        }

        return hours == 1
            ? $"1 hour {minutes} minutes"
            : $"{hours} hours {minutes} minutes";
    }

    private static DateOnly GetGameDayForLocal(DateTime localDateTime)
    {
        return DateOnly.FromDateTime(localDateTime.AddHours(-3));
    }

    private static DateTimeOffset LocalDateTimeToLocalOffset(DateTime localDateTime)
    {
        DateTime unspecified = DateTime.SpecifyKind(localDateTime, DateTimeKind.Unspecified);
        TimeSpan offset = TimeZoneInfo.Local.GetUtcOffset(unspecified);
        return new DateTimeOffset(unspecified, offset);
    }
    #endregion // SECTION C — Helpers

    #region SECTION D — Input Model
    public sealed class RunSaveInput
    {
        [Required]
        [StringLength(40)]
        public string FocusType { get; set; } = "Focus";

        [Range(300, 7200)]
        public int PlannedDurationSeconds { get; set; } = 25 * 60;

        [Range(0, 7200)]
        public int ElapsedSeconds { get; set; }

        [StringLength(20)]
        public string SaveMode { get; set; } = "";
    }
    #endregion // SECTION D — Input Model
}