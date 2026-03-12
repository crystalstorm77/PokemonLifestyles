using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using LifestyleCore.Data;
using LifestyleCore.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace LifestylesWeb.Pages.Focus;

public class IndexModel : PageModel
{
    private readonly FocusSessionRepository _focusRepo = new();

    #region SECTION A — Bound Input + Display State
    [BindProperty]
    public FocusSetupInput Input { get; set; } = CreateDefaultInput();

    public List<FocusSession> Sessions { get; private set; } = new();
    public string? StatusMessage { get; private set; }
    public string CurrentGameDayText { get; private set; } = "";
    public string DataFilePath { get; private set; } = "";
    #endregion // SECTION A — Bound Input + Display State

    #region SECTION B — Page Actions
    public async Task OnGetAsync(string? savedFocusType = null, int? savedDurationSeconds = null)
    {
        Input = CreateDefaultInput(savedFocusType ?? "Focus");
        await LoadSessionsAsync(GetGameDayForLocal(DateTime.Now));

        if (!string.IsNullOrWhiteSpace(savedFocusType) && savedDurationSeconds.HasValue && savedDurationSeconds.Value > 0)
        {
            StatusMessage = $"Saved {savedFocusType} session for {FormatDuration(savedDurationSeconds.Value)}.";
        }
    }

    public async Task<IActionResult> OnPostStartAsync()
    {
        string focusType = (Input.FocusType ?? "").Trim();

        if (string.IsNullOrWhiteSpace(focusType))
        {
            ModelState.AddModelError("Input.FocusType", "Please enter a focus type.");
        }

        if (!ModelState.IsValid)
        {
            await LoadSessionsAsync(GetGameDayForLocal(DateTime.Now));
            return Page();
        }

        return RedirectToPage("/Focus/Run", new
        {
            focusType,
            durationMinutes = Input.DurationMinutes
        });
    }
    #endregion // SECTION B — Page Actions

    #region SECTION C — Helpers
    private static FocusSetupInput CreateDefaultInput(string focusType = "Focus")
    {
        return new FocusSetupInput
        {
            FocusType = focusType,
            DurationMinutes = 25
        };
    }

    private async Task LoadSessionsAsync(DateOnly gameDay)
    {
        Sessions = (await _focusRepo.GetForDateAsync(gameDay)).ToList();
        CurrentGameDayText = gameDay.ToString("yyyy-MM-dd");
        DataFilePath = Db.GetDbPath();
    }

    public string FormatDuration(int totalSeconds)
    {
        totalSeconds = Math.Max(0, totalSeconds);

        TimeSpan duration = TimeSpan.FromSeconds(totalSeconds);
        int totalHours = (int)duration.TotalHours;

        return $"{totalHours:00}:{duration.Minutes:00}:{duration.Seconds:00}";
    }

    public string FormatDurationSelection(int totalMinutes)
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
    #endregion // SECTION C — Helpers

    #region SECTION D — Input Model
    public sealed class FocusSetupInput
    {
        [Required]
        [StringLength(40)]
        public string FocusType { get; set; } = "Focus";

        [Range(5, 120)]
        public int DurationMinutes { get; set; } = 25;
    }
    #endregion // SECTION D — Input Model
}