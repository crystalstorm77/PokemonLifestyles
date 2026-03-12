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
    public FocusEntryInput Input { get; set; } = CreateDefaultInput();

    public List<FocusSession> Sessions { get; private set; } = new();
    public string? StatusMessage { get; private set; }
    public string CurrentGameDayText { get; private set; } = "";
    public string DataFilePath { get; private set; } = "";
    #endregion // SECTION A — Bound Input + Display State

    #region SECTION B — Page Actions
    public async Task OnGetAsync()
    {
        Input = CreateDefaultInput();
        await LoadSessionsAsync(GetGameDayForLocal(DateTime.Now));
    }

    public async Task<IActionResult> OnPostAsync()
    {
        string focusType = (Input.FocusType ?? "").Trim();

        if (string.IsNullOrWhiteSpace(focusType))
        {
            ModelState.AddModelError("Input.FocusType", "Please enter a focus type.");
        }

        if (!ModelState.IsValid)
        {
            await LoadSessionsAsync(GetGameDayForLocal(EnsureLocalDateTime(Input.LoggedAtLocal)));
            return Page();
        }

        DateTime localDateTime = EnsureLocalDateTime(Input.LoggedAtLocal);
        DateOnly logDate = GetGameDayForLocal(localDateTime);

        var session = new FocusSession
        {
            LoggedAtUtc = LocalDateTimeToLocalOffset(localDateTime).ToUniversalTime(),
            LogDate = logDate,
            FocusType = focusType,
            Minutes = Input.Minutes,
            Completed = Input.Completed
        };

        await _focusRepo.AddAsync(session);

        StatusMessage = $"Saved {session.Minutes} minute {session.FocusType} session.";
        Input = CreateDefaultInput(focusType);
        await LoadSessionsAsync(logDate);

        return Page();
    }
    #endregion // SECTION B — Page Actions

    #region SECTION C — Helpers
    private static FocusEntryInput CreateDefaultInput(string focusType = "Focus")
    {
        return new FocusEntryInput
        {
            FocusType = focusType,
            Minutes = 25,
            Completed = true,
            LoggedAtLocal = DateTime.Now
        };
    }

    private async Task LoadSessionsAsync(DateOnly gameDay)
    {
        Sessions = (await _focusRepo.GetForDateAsync(gameDay)).ToList();
        CurrentGameDayText = gameDay.ToString("yyyy-MM-dd");
        DataFilePath = Db.GetDbPath();
    }

    private static DateTime EnsureLocalDateTime(DateTime value)
    {
        if (value == default)
        {
            return DateTime.Now;
        }

        return value.Kind == DateTimeKind.Unspecified
            ? DateTime.SpecifyKind(value, DateTimeKind.Local)
            : value.ToLocalTime();
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
    public sealed class FocusEntryInput
    {
        [Required]
        [StringLength(40)]
        public string FocusType { get; set; } = "Focus";

        [Range(5, 120)]
        public int Minutes { get; set; } = 25;

        public bool Completed { get; set; } = true;

        [Display(Name = "Logged at")]
        public DateTime LoggedAtLocal { get; set; } = DateTime.Now;
    }
    #endregion // SECTION D — Input Model
}