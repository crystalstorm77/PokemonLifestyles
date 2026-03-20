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

public class PagesIndexModel : PageModel
{
    private readonly FocusSessionRepository _focusRepo = new();

    #region SEGMENT A — Bound Input + Display State
    [BindProperty]
    public SaveFocusInput Input { get; set; } = new();

    public string DataFilePath { get; private set; } = "";
    public string? StatusMessage { get; private set; }
    public List<FocusSession> Sessions { get; private set; } = new();

    public double RewardPreviewFocusXpPerMinute { get; private set; }
    public double RewardPreviewIncompleteMultiplier { get; private set; } = 0.25;
    public double RewardPreviewSleepMultiplier { get; private set; } = 1.0;
    public bool RewardWindowEligible { get; private set; } = true;

    public bool ShowRewardOverlay { get; private set; }
    public string RewardFocusType { get; private set; } = "Focus";
    public int RewardDurationSeconds { get; private set; }
    public bool RewardCompleted { get; private set; }
    public int RewardXp { get; private set; }
    public int RewardCoins { get; private set; }
    #endregion // SEGMENT A — Bound Input + Display State

    #region SEGMENT B — Page Actions
    public async Task OnGetAsync(
        string? rewardFocusType = null,
        int? rewardDurationSeconds = null,
        bool? rewardCompleted = null,
        int? rewardXp = null,
        int? rewardCoins = null)
    {
        await LoadAsync();

        if (!string.IsNullOrWhiteSpace(rewardFocusType) &&
            rewardDurationSeconds.HasValue &&
            rewardXp.HasValue &&
            rewardCoins.HasValue)
        {
            ShowRewardOverlay = true;
            RewardFocusType = rewardFocusType.Trim();
            RewardDurationSeconds = Math.Max(0, rewardDurationSeconds.Value);
            RewardCompleted = rewardCompleted == true;
            RewardXp = Math.Max(0, rewardXp.Value);
            RewardCoins = Math.Max(0, rewardCoins.Value);

            string completionText = RewardCompleted ? "completed" : "incomplete";
            StatusMessage = $"Saved {completionText} {RewardFocusType} session for {FormatDuration(RewardDurationSeconds)}.";
        }
    }

    public async Task<IActionResult> OnPostSaveFocusAsync()
    {
        string focusType = (Input.FocusType ?? "").Trim();

        if (string.IsNullOrWhiteSpace(focusType))
        {
            return RedirectToPage();
        }

        string timerMode = (Input.TimerMode ?? "").Trim().ToLowerInvariant();
        string saveMode = (Input.SaveMode ?? "").Trim().ToLowerInvariant();
        bool isCountUp = timerMode == "countup";

        int plannedDurationSeconds = isCountUp
            ? Math.Clamp(Input.PlannedDurationSeconds, 0, 86400)
            : Math.Clamp(Input.PlannedDurationSeconds, 300, 7200);

        if (isCountUp && plannedDurationSeconds <= 0)
        {
            plannedDurationSeconds = 7200;
        }

        int elapsedSeconds = isCountUp
            ? Math.Clamp(Input.ElapsedSeconds, 0, 86400)
            : Math.Clamp(Input.ElapsedSeconds, 0, plannedDurationSeconds);

        if (elapsedSeconds <= 0)
        {
            return RedirectToPage();
        }

        bool completed = saveMode == "complete" && elapsedSeconds >= plannedDurationSeconds;

        if (isCountUp && (saveMode == "stop" || saveMode == "break"))
        {
            completed = elapsedSeconds >= 300;
        }

        DateTime localDateTime = DateTime.Now;
        DateOnly logDate = GetGameDayForLocal(localDateTime);

        await LoadRewardPreviewSettingsAsync(localDateTime);
        (int xp, int coins) = CalculateFocusRewardPreview(elapsedSeconds, completed);

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
            rewardFocusType = session.FocusType,
            rewardDurationSeconds = session.DurationSeconds,
            rewardCompleted = session.Completed,
            rewardXp = xp,
            rewardCoins = coins
        });
    }
    #endregion // SEGMENT B — Page Actions

    #region SEGMENT C — Load + Formatting Helpers
    private async Task LoadAsync()
    {
        DataFilePath = Db.GetDbPath();
        Sessions = (await _focusRepo.GetForDateAsync(GetGameDayForLocal(DateTime.Now))).ToList();
        await LoadRewardPreviewSettingsAsync(DateTime.Now);
    }

    private async Task LoadRewardPreviewSettingsAsync(DateTime localDateTime)
    {
        var gamificationSettings = await new GamificationSettingsRepository().GetAsync();
        DateOnly logDate = GetGameDayForLocal(localDateTime);

        RewardPreviewFocusXpPerMinute = Math.Max(0.0, gamificationSettings.FocusXpPerMinute);
        RewardPreviewIncompleteMultiplier = Math.Clamp(gamificationSettings.FocusXpIncompleteMultiplier, 0.0, 1.0);
        RewardPreviewSleepMultiplier = await GetSleepRewardMultiplierAsync(logDate, gamificationSettings);
        RewardWindowEligible = IsWithinRewardWindow(logDate, LocalDateTimeToLocalOffset(localDateTime));
    }

    private async Task<double> GetSleepRewardMultiplierAsync(DateOnly gameDay, GamificationSettings settings)
    {
        var sleepSessions = await new SleepSessionRepository().GetForWakeDateAsync(gameDay);

        var orderedDurations = sleepSessions
            .OrderBy(x => x.EndUtc)
            .ThenBy(x => x.Id)
            .Select(x => Math.Max(0, x.DurationMinutes));

        var summary = SleepRewardCalculator.Calculate(
            orderedDurations,
            settings.SleepHealthyMinHours,
            settings.SleepHealthyMaxHours,
            settings.SleepHealthyMultiplier,
            settings.SleepPenaltyPer15Min,
            settings.SleepTrackedMinimumMultiplier,
            settings.SleepRewardMinimumMinutes);

        return Math.Max(1.0, summary.Multiplier);
    }

    private static bool IsWithinRewardWindow(DateOnly logDate, DateTimeOffset loggedAtLocal)
    {
        var timeZone = TimeZoneInfo.Local;
        var nextDay = logDate.AddDays(1);

        DateTime cutoffLocalUnspecified = new DateTime(
            nextDay.Year,
            nextDay.Month,
            nextDay.Day,
            3,
            0,
            0,
            DateTimeKind.Unspecified);

        DateTime probe = cutoffLocalUnspecified;

        for (int i = 0; i < 6; i++)
        {
            try
            {
                DateTime cutoffUtc = TimeZoneInfo.ConvertTimeToUtc(probe, timeZone);
                return loggedAtLocal.UtcDateTime < cutoffUtc;
            }
            catch
            {
                probe = probe.AddHours(1);
            }
        }

        return false;
    }

    private (int xp, int coins) CalculateFocusRewardPreview(int durationSeconds, bool completed)
    {
        int rewardMinutes = Math.Max(0, durationSeconds) / 60;

        if (!RewardWindowEligible || rewardMinutes <= 0)
        {
            return (0, 0);
        }

        double normalizedSleepMultiplier = Math.Max(1.0, RewardPreviewSleepMultiplier);
        double xpCompletionMultiplier = completed ? 1.0 : RewardPreviewIncompleteMultiplier;
        double coinCompletionMultiplier = completed ? 1.0 : 0.25;

        int xp = (int)Math.Floor(
            rewardMinutes *
            RewardPreviewFocusXpPerMinute *
            xpCompletionMultiplier *
            normalizedSleepMultiplier);

        int coins = (int)Math.Floor(
            rewardMinutes *
            coinCompletionMultiplier *
            normalizedSleepMultiplier);

        return (xp, coins);
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
    #endregion // SEGMENT C — Load + Formatting Helpers

    #region SEGMENT D — Input Model
    public sealed class SaveFocusInput
    {
        [Required]
        [StringLength(40)]
        public string FocusType { get; set; } = "Focus";

        [Range(0, 86400)]
        public int PlannedDurationSeconds { get; set; } = 300;

        [Range(0, 86400)]
        public int ElapsedSeconds { get; set; }

        [StringLength(20)]
        public string TimerMode { get; set; } = "countdown";

        [StringLength(20)]
        public string SaveMode { get; set; } = "";
    }
    #endregion // SEGMENT D — Input Model
}
