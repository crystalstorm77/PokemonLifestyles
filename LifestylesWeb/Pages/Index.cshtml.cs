using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using LifestyleCore.Data;
using LifestyleCore.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace LifestylesWeb.Pages;

public class IndexModel : PageModel
{
    private readonly FocusSessionRepository _focusRepo = new();

    #region SECTION A — Bound Input + Display State
    [BindProperty]
    public SaveFocusInput Input { get; set; } = new();

    public string DataFilePath { get; private set; } = "";
    public string? StatusMessage { get; private set; }
    public List<FocusSession> Sessions { get; private set; } = new();
    #endregion // SECTION A — Bound Input + Display State

    #region SECTION B — Page Actions
    public async Task OnGetAsync(
        string? savedFocusType = null,
        int? savedDurationSeconds = null,
        bool? savedCompleted = null)
    {
        await LoadAsync();

        if (!string.IsNullOrWhiteSpace(savedFocusType) && savedDurationSeconds.HasValue && savedDurationSeconds.Value > 0)
        {
            string completionText = savedCompleted == true ? "completed" : "incomplete";
            StatusMessage = $"Saved {completionText} {savedFocusType} session for {FormatDuration(savedDurationSeconds.Value)}.";
        }
    }

    public async Task<IActionResult> OnPostSaveFocusAsync()
    {
        string focusType = (Input.FocusType ?? "").Trim();

        if (string.IsNullOrWhiteSpace(focusType))
        {
            return RedirectToPage();
        }

        int plannedDurationSeconds = Math.Clamp(Input.PlannedDurationSeconds, 300, 7200);
        int elapsedSeconds = Math.Clamp(Input.ElapsedSeconds, 0, plannedDurationSeconds);
        string saveMode = (Input.SaveMode ?? "").Trim().ToLowerInvariant();

        if (elapsedSeconds <= 0)
        {
            return RedirectToPage();
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

        return RedirectToPage(new
        {
            savedFocusType = session.FocusType,
            savedDurationSeconds = session.DurationSeconds,
            savedCompleted = session.Completed
        });
    }
    #endregion // SECTION B — Page Actions

    #region SECTION C — Load + Formatting Helpers
    private async Task LoadAsync()
    {
        DataFilePath = Db.GetDbPath();
        Sessions = (await _focusRepo.GetForDateAsync(GetGameDayForLocal(DateTime.Now))).ToList();
    }

    public string FormatDuration(int totalSeconds)
    {
        totalSeconds = Math.Max(0, totalSeconds);

        TimeSpan duration = TimeSpan.FromSeconds(totalSeconds);
        int totalHours = (int)duration.TotalHours;

        return $"{totalHours:00}:{duration.Minutes:00}:{duration.Seconds:00}";
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
    #endregion // SECTION C — Load + Formatting Helpers

    #region SECTION D — Input Model
    public sealed class SaveFocusInput
    {
        [Required]
        [StringLength(40)]
        public string FocusType { get; set; } = "Focus";

        [Range(300, 7200)]
        public int PlannedDurationSeconds { get; set; } = 300;

        [Range(0, 7200)]
        public int ElapsedSeconds { get; set; }

        [StringLength(20)]
        public string SaveMode { get; set; } = "";
    }
    #endregion // SECTION D — Input Model
}