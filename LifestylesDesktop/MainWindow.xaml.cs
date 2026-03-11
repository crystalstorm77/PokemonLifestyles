using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Threading;
using Dapper;
using LifestyleCore.Data;
using LifestyleCore.Models;

// ---- Resolve WinForms/WPF name collisions introduced by <UseWindowsForms>true</UseWindowsForms> ----
using MessageBox = System.Windows.MessageBox;
using OpenFileDialog = Microsoft.Win32.OpenFileDialog;
using SaveFileDialog = Microsoft.Win32.SaveFileDialog;

using Button = System.Windows.Controls.Button;
using DataGrid = System.Windows.Controls.DataGrid;
using ListBox = System.Windows.Controls.ListBox;
using MenuItem = System.Windows.Controls.MenuItem;
using Orientation = System.Windows.Controls.Orientation;
using StackPanel = System.Windows.Controls.StackPanel;
using TextBlock = System.Windows.Controls.TextBlock;
using TextBox = System.Windows.Controls.TextBox;

using HorizontalAlignment = System.Windows.HorizontalAlignment;




namespace LifestylesDesktop
{
    public partial class MainWindow : Window
    {
        #region SECTION B — Main Window Class
        private readonly FocusSessionRepository _repo = new();
        private readonly FoodItemRepository _foodItemRepo = new();
        private readonly FoodEntryRepository _foodEntryRepo = new();
        private readonly SleepSessionRepository _sleepRepo = new();
        private readonly StepsRepository _stepsRepo = new();
        private readonly HabitRepository _habitRepo = new();
        private readonly RewardsLedgerRepository _rewardsRepo = new();
        private readonly WeeklyBonusesService _weeklyBonusesService = new();

        // Focus labels (tracking only; no gamification impact)
        private readonly FocusLabelRepository _focusLabelRepo = new();
        public ObservableCollection<string> FocusLabelChoices { get; } = new();

        // Steps → Item Drops (global; separate from tickets)
        private readonly GamificationSettingsRepository _gamiSettingsRepo = new();
        private readonly StepItemRollStateRepository _rollStateRepo = new();
        private readonly InventoryRepository _inventoryRepo = new();
        private readonly StepItemDropsService _stepItemDrops = new();

        // Item definitions (structured; “real game” items)
        private readonly ItemDefinitionsRepository _itemDefsRepo = new();
        public ObservableCollection<ItemTier> ItemTierChoices { get; } = new ObservableCollection<ItemTier>
        {
            ItemTier.Common,
            ItemTier.Uncommon,
            ItemTier.Rare
        };

        private ObservableCollection<ItemDefinition> _itemDefinitions = new();
        private ObservableCollection<InventoryItem> _inventoryItems = new();
        private ObservableCollection<FocusSession> _focusSessions = new();
        private ObservableCollection<FoodEntry> _foodEntries = new();
        private ObservableCollection<SleepSession> _sleepSessions = new();
        private readonly Dictionary<long, double> _foodEntryOriginalKj = new();
        private ObservableCollection<HabitRow> _habitRows = new();

        // Trainer XP / Level controls (injected at runtime into the debug area)
        private bool _trainerXpUiBuilt = false;
        private TextBox? _focusXpPerMinuteBox;
        private TextBox? _focusXpIncompleteMultiplierBox;
        private TextBlock? _trainerLevelText;
        private TextBlock? _trainerProgressText;
        private TextBlock? _trainerSelectedDayXpText;
        private Button? _trainerPrestigeResetButton;

        // Live clock for the debug header
        private readonly DispatcherTimer _liveClockTimer = new();

        // Focus timer controls/state
        private readonly DispatcherTimer _focusTimerUiTimer = new();
        private bool _focusTimerUiInitialized = false;
        private bool _focusTimerRunning = false;
        private bool _focusTimerPaused = false;
        private bool _focusTimerPausedByUser = false;
        private bool _focusTimerIsCountUp = false;
        private bool _focusTimerStopDialogOpen = false;
        private Window? _focusTimerStopDialogWindow;
        private DateTimeOffset _focusTimerRunStartedUtc;
        private TimeSpan _focusTimerElapsedBeforePause = TimeSpan.Zero;
        private int _focusTimerCountdownTargetMinutes = 25;
        private int _focusTimerNextCountUpPauseMinutes = 120;
        private string _focusTimerFocusType = "(None)";

        // Sleep tuning controls (injected at runtime into the debug area)
        private bool _sleepSettingsUiBuilt = false;
        private TextBox? _sleepHealthyMinHoursBox;
        private TextBox? _sleepHealthyMaxHoursBox;
        private TextBox? _sleepHealthyMultiplierBox;
        private TextBox? _sleepPenaltyPer15MinBox;
        private TextBox? _sleepTrackedMinimumMultiplierBox;
        private TextBox? _sleepRewardMinimumMinutesBox;
        private TextBlock? _sleepPreview5hText;
        private TextBlock? _sleepPreview8hText;
        private TextBlock? _sleepPreview11hText;
        private TextBlock? _sleepPreview24hText;

        // Weekly bonus controls (injected at runtime into the debug area)
        private bool _weeklyBonusesUiBuilt = false;
        private TextBox? _weeklySleepTrackingBonusBox;
        private TextBox? _weeklyHabitTrackingBonusBox;
        private TextBox? _dailyStepsGoalBox;
        private TextBox? _dailyStepsGoalQuotaBox;
        private TextBox? _weeklyStepsTrackingBonusBox;

        // Auto-fit should run once PER grid, the first time that grid is actually loaded/measured.
        private bool _autoFitFocusDone = false;
        private bool _autoFitFoodDone = false;
        private bool _autoFitSleepDone = false;

        // Prevent refresh spam when we programmatically set the date picker.
        private bool _logDateUiUpdating = false;

        public MainWindow()
        {
            InitializeComponent();
            InitializeFocusTimerUi();
            AttachNestedDataGridWheelForwarding();

            Loaded += (_, __) => FitSelectedTabColumnsOnce();
            Closed += (_, __) =>
            {
                _liveClockTimer.Stop();
                _focusTimerUiTimer.Stop();
            };

            TimeZoneText.Text = $"Timezone: {TimeZoneInfo.Local.DisplayName}";

            // Default log date = today
            _logDateUiUpdating = true;
            LogDatePicker.SelectedDate = DateTime.Today;
            _logDateUiUpdating = false;

            UpdateLogDateUI();
            StartLiveClock();

            _ = InitializeAndRefreshAsync();
        }

        private async Task InitializeAndRefreshAsync()
        {
            await RefreshFoodMenuAsync();

            // Load focus labels early so both the input ComboBox and grid editor have choices.
            await RefreshFocusLabelsAsync();

            EnsureTrainerXpDebugUiBuilt();
            EnsureSleepSettingsDebugUiBuilt();
            EnsureWeeklyBonusesDebugUiBuilt();
            UpdateLiveClockText();
            UpdateFocusTimerUi();

            await RefreshForSelectedDateAsync();
        }
        #endregion // SECTION B — Main Window Class

        #region SECTION C — Log Date Helpers
        private DateOnly SelectedLogDate
        {
            get
            {
                DateTime dt = LogDatePicker?.SelectedDate ?? DateTime.Today;
                return DateOnly.FromDateTime(dt);
            }
        }

        private void UpdateLogDateUI()
        {
            var d = SelectedLogDate;
            LogDateDisplay.Text = d.ToString("yyyy-MM-dd");
            SessionsHeaderText.Text = $"Sessions ({d:yyyy-MM-dd})";
        }

        private async void LogTodayButton_Click(object sender, RoutedEventArgs e)
        {
            _logDateUiUpdating = true;
            LogDatePicker.SelectedDate = DateTime.Today;
            _logDateUiUpdating = false;

            UpdateLogDateUI();
            await RefreshForSelectedDateAsync();
        }

        private async void LogYesterdayButton_Click(object sender, RoutedEventArgs e)
        {
            _logDateUiUpdating = true;
            LogDatePicker.SelectedDate = DateTime.Today.AddDays(-1);
            _logDateUiUpdating = false;

            UpdateLogDateUI();
            await RefreshForSelectedDateAsync();
        }

        private async void LogDatePicker_SelectedDateChanged(object sender, SelectionChangedEventArgs e)
        {
            if (_logDateUiUpdating)
                return;

            UpdateLogDateUI();
            await RefreshForSelectedDateAsync();
        }
        private static string NormalizeFocusLabel(string? raw)
        {
            string s = (raw ?? "").Trim();
            if (string.IsNullOrWhiteSpace(s))
                return "(None)";

            // Collapse repeated whitespace (tabs/newlines/spaces)
            var parts = s.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries);
            s = string.Join(" ", parts);

            // If user typed fully-lowercase, auto Title-Case it for consistency.
            bool allLettersLower = true;
            foreach (char ch in s)
            {
                if (char.IsLetter(ch) && !char.IsLower(ch))
                {
                    allLettersLower = false;
                    break;
                }
            }

            if (allLettersLower)
                s = CultureInfo.InvariantCulture.TextInfo.ToTitleCase(s);

            return s;
        }


        #endregion // SECTION C — Log Date Helpers

        #region SECTION D1 — Focus Timer State + UI Helpers
        private enum FocusTimerStopChoice
        {
            KeepFocusing,
            StopFocusing
        }

        private enum FocusTimerCheckpointChoice
        {
            KeepGoing,
            TakeABreak,
            DiscardSession,
            Closed
        }

        private sealed class FocusTimerRewardPreview
        {
            public int Coins { get; set; }
            public int TrainerXp { get; set; }
            public double SleepMultiplier { get; set; } = 1.0;
        }

        private void InitializeFocusTimerUi()
        {
            if (_focusTimerUiInitialized)
                return;

            _focusTimerUiInitialized = true;
            _focusTimerUiTimer.Interval = TimeSpan.FromSeconds(1);
            _focusTimerUiTimer.Tick += FocusTimerUiTimer_Tick;

            if (FocusTimerModeCombo != null && FocusTimerModeCombo.SelectedIndex < 0)
                FocusTimerModeCombo.SelectedIndex = 0;

            UpdateFocusTimerUi();
        }

        private bool IsCountUpModeSelected()
        {
            return FocusTimerModeCombo?.SelectedIndex == 1;
        }

        private static string FormatTimerClock(TimeSpan time)
        {
            if (time < TimeSpan.Zero)
                time = TimeSpan.Zero;

            int totalHours = (int)Math.Floor(time.TotalHours);
            return $"{totalHours:00}:{time.Minutes:00}:{time.Seconds:00}";
        }

        private static int CalculateNextCountUpPauseMinutes(int currentWholeMinutes)
        {
            if (currentWholeMinutes < 0)
                currentWholeMinutes = 0;

            return ((currentWholeMinutes / 120) + 1) * 120;
        }

        private static bool HasMetFocusLoggingThreshold(int wholeMinutes)
        {
            return wholeMinutes >= 1;
        }

        private static bool HasMetFocusRewardThreshold(int wholeMinutes)
        {
            return wholeMinutes >= 5;
        }

        private TimeSpan GetCurrentFocusTimerElapsed()
        {
            if (_focusTimerRunning)
                return _focusTimerElapsedBeforePause + (DateTimeOffset.UtcNow - _focusTimerRunStartedUtc);

            return _focusTimerElapsedBeforePause;
        }

        private void SetFocusTimerStatus(string text)
        {
            if (FocusTimerStatusText != null)
                FocusTimerStatusText.Text = text;
        }

        private void CloseOpenStopFocusTimerDialog()
        {
            if (_focusTimerStopDialogWindow == null)
                return;

            var dialog = _focusTimerStopDialogWindow;
            _focusTimerStopDialogWindow = null;
            _focusTimerStopDialogOpen = false;

            if (dialog.IsVisible)
                dialog.Close();
        }

        private async Task<FocusTimerRewardPreview> BuildTimerRewardPreviewAsync(
            DateOnly logDate,
            int minutes,
            bool completed,
            bool grantRewards)
        {
            if (!grantRewards || minutes <= 0)
                return new FocusTimerRewardPreview();

            var gami = await _gamiSettingsRepo.GetAsync();
            var sleepSessions = await _sleepRepo.GetForWakeDateAsync(logDate);

            var orderedDurations = sleepSessions
                .OrderBy(x => x.EndUtc)
                .ThenBy(x => x.Id)
                .Select(x => Math.Max(0, x.DurationMinutes));

            var summary = SleepRewardCalculator.Calculate(
                orderedDurations,
                gami.SleepHealthyMinHours,
                gami.SleepHealthyMaxHours,
                gami.SleepHealthyMultiplier,
                gami.SleepPenaltyPer15Min,
                gami.SleepTrackedMinimumMultiplier,
                gami.SleepRewardMinimumMinutes);

            double sleepMultiplier = Math.Max(1.0, summary.Multiplier);

            return new FocusTimerRewardPreview
            {
                SleepMultiplier = sleepMultiplier,
                Coins = PreviewFocusCoins(minutes, completed, sleepMultiplier),
                TrainerXp = PreviewFocusTrainerXp(
                    minutes,
                    completed,
                    gami.FocusXpPerMinute,
                    gami.FocusXpIncompleteMultiplier,
                    sleepMultiplier)
            };
        }

        private void UpdateFocusTimerUi()
        {
            bool isActiveOrPaused = _focusTimerRunning || _focusTimerPaused;
            bool isCountUpSelected = IsCountUpModeSelected();

            if (FocusCountUpDebugStartRow != null)
                FocusCountUpDebugStartRow.Visibility = isCountUpSelected ? Visibility.Visible : Visibility.Collapsed;

            if (FocusCountdownMinutesRow != null)
                FocusCountdownMinutesRow.Visibility = isCountUpSelected ? Visibility.Collapsed : Visibility.Visible;

            if (FocusCountdownDebugRemainingRow != null)
                FocusCountdownDebugRemainingRow.Visibility = isCountUpSelected ? Visibility.Collapsed : Visibility.Visible;

            if (FocusTimerModeCombo != null)
                FocusTimerModeCombo.IsEnabled = !isActiveOrPaused;

            if (FocusCountUpDebugStartMinutesBox != null)
                FocusCountUpDebugStartMinutesBox.IsEnabled = !isActiveOrPaused && isCountUpSelected;

            if (FocusCountdownMinutesBox != null)
                FocusCountdownMinutesBox.IsEnabled = !isActiveOrPaused && !isCountUpSelected;

            if (FocusCountdownDebugRemainingMinutesBox != null)
                FocusCountdownDebugRemainingMinutesBox.IsEnabled = !isActiveOrPaused && !isCountUpSelected;

            if (FocusTypeCombo != null)
                FocusTypeCombo.IsEnabled = !isActiveOrPaused;

            if (ManageFocusLabelsButton != null)
                ManageFocusLabelsButton.IsEnabled = !isActiveOrPaused;

            if (MinutesBox != null)
                MinutesBox.IsEnabled = !isActiveOrPaused;

            if (CompletedCheck != null)
                CompletedCheck.IsEnabled = !isActiveOrPaused;

            if (AddFocusButton != null)
                AddFocusButton.IsEnabled = !isActiveOrPaused;

            if (StartFocusTimerButton != null)
                StartFocusTimerButton.IsEnabled = !isActiveOrPaused;

            if (PauseFocusTimerButton != null)
            {
                PauseFocusTimerButton.Visibility = isActiveOrPaused ? Visibility.Visible : Visibility.Collapsed;
                PauseFocusTimerButton.IsEnabled = !_focusTimerStopDialogOpen && (_focusTimerRunning || (_focusTimerPaused && _focusTimerPausedByUser));
                PauseFocusTimerButton.Content = _focusTimerPausedByUser ? "Keep going?" : "Pause";
            }

            if (StopFocusTimerButton != null)
                StopFocusTimerButton.IsEnabled = isActiveOrPaused && !_focusTimerStopDialogOpen;

            TimeSpan displayTime;

            if (_focusTimerRunning || _focusTimerPaused)
            {
                var elapsed = GetCurrentFocusTimerElapsed();
                displayTime = _focusTimerIsCountUp
                    ? elapsed
                    : TimeSpan.FromMinutes(_focusTimerCountdownTargetMinutes) - elapsed;
            }
            else if (isCountUpSelected)
            {
                displayTime = TryGetCountUpDebugStartMinutes(out int debugStartMinutes) && debugStartMinutes > 0
                    ? TimeSpan.FromMinutes(debugStartMinutes)
                    : TimeSpan.Zero;
            }
            else
            {
                if (TryGetCountdownTargetMinutes(out int previewCountdownMinutes))
                    _focusTimerCountdownTargetMinutes = previewCountdownMinutes;

                int displayMinutes = _focusTimerCountdownTargetMinutes;
                if (TryGetCountdownDebugRemainingMinutes(out int debugRemainingMinutes) &&
                    debugRemainingMinutes > 0 &&
                    debugRemainingMinutes <= _focusTimerCountdownTargetMinutes)
                {
                    displayMinutes = debugRemainingMinutes;
                }

                displayTime = TimeSpan.FromMinutes(displayMinutes);
            }

            if (FocusTimerDisplayText != null)
                FocusTimerDisplayText.Text = FormatTimerClock(displayTime);

            if (_focusTimerStopDialogOpen)
            {
                SetFocusTimerStatus("Stop confirmation is open. The timer is still running.");
            }
            else if (_focusTimerRunning)
            {
                SetFocusTimerStatus(_focusTimerIsCountUp
                    ? $"Count-up timer running. Next pause at {FormatMinutes(_focusTimerNextCountUpPauseMinutes)}."
                    : $"Countdown timer running for {FormatMinutes(_focusTimerCountdownTargetMinutes)}.");
            }
            else if (_focusTimerPausedByUser)
            {
                SetFocusTimerStatus("Timer paused. Click Keep going? to continue or Stop Focusing to end the session.");
            }
            else if (_focusTimerPaused)
            {
                SetFocusTimerStatus($"Timer paused at {FormatMinutes((int)Math.Floor(GetCurrentFocusTimerElapsed().TotalMinutes))}.");
            }
            else
            {
                SetFocusTimerStatus(isCountUpSelected
                    ? "Count-up timer ready. It will pause every 2 hours to make sure it was not left running by accident."
                    : "Countdown timer ready. Choose 5 to 120 minutes and press Start Focus.");
            }
        }

        private async Task SaveFocusLabelIfNeededAsync(string focusType)
        {
            if (focusType == "(None)")
                return;

            await _focusLabelRepo.UpsertActiveAsync(focusType);
            await RefreshFocusLabelsAsync(keepText: focusType);
        }

        private bool TryGetCountUpDebugStartMinutes(out int minutes)
        {
            minutes = 0;

            string raw = FocusCountUpDebugStartMinutesBox?.Text?.Trim() ?? "";
            if (string.IsNullOrWhiteSpace(raw))
                return true;

            if (!int.TryParse(raw, out minutes))
                return false;

            return minutes >= 0;
        }

        private bool TryGetCountdownTargetMinutes(out int minutes)
        {
            minutes = 0;

            string raw = FocusCountdownMinutesBox?.Text?.Trim() ?? "";
            if (!int.TryParse(raw, out minutes))
                return false;

            if (minutes < 5 || minutes > 120)
                return false;

            return true;
        }

        private bool TryGetCountdownDebugRemainingMinutes(out int minutes)
        {
            minutes = 0;

            string raw = FocusCountdownDebugRemainingMinutesBox?.Text?.Trim() ?? "";
            if (string.IsNullOrWhiteSpace(raw))
                return true;

            if (!int.TryParse(raw, out minutes))
                return false;

            return minutes >= 0;
        }

        private void ResetFocusTimerState(string status)
        {
            CloseOpenStopFocusTimerDialog();
            _focusTimerUiTimer.Stop();
            _focusTimerRunning = false;
            _focusTimerPaused = false;
            _focusTimerPausedByUser = false;
            _focusTimerIsCountUp = false;
            _focusTimerElapsedBeforePause = TimeSpan.Zero;
            _focusTimerNextCountUpPauseMinutes = 120;
            _focusTimerFocusType = NormalizeFocusLabel(FocusTypeCombo?.Text);

            if (TryGetCountdownTargetMinutes(out int countdownMinutes))
            {
                _focusTimerCountdownTargetMinutes = countdownMinutes;
            }
            else
            {
                _focusTimerCountdownTargetMinutes = 25;
                if (FocusCountdownMinutesBox != null)
                    FocusCountdownMinutesBox.Text = "25";
            }

            UpdateFocusTimerUi();
            SetFocusTimerStatus(status);
        }

        private async Task SaveTimerSessionAsync(
            DateTimeOffset nowLocal,
            int minutes,
            bool completed,
            bool grantRewards)
        {
            if (minutes <= 0)
                return;

            var logDate = GetCurrentGameDayLocal(nowLocal);

            var session = new FocusSession
            {
                LoggedAtUtc = nowLocal.ToUniversalTime(),
                LogDate = logDate,
                FocusType = _focusTimerFocusType,
                Minutes = minutes,
                Completed = completed
            };

            await _repo.AddAsync(session, grantRewards);

            if (SelectedLogDate != logDate)
            {
                _logDateUiUpdating = true;
                LogDatePicker.SelectedDate = logDate.ToDateTime(TimeOnly.MinValue);
                _logDateUiUpdating = false;
                UpdateLogDateUI();
            }

            await RefreshForSelectedDateAsync();
        }
        #endregion // SECTION D1 — Focus Timer State + UI Helpers

        #region SECTION D2 — Focus Timer Dialogs
        private Task<FocusTimerStopChoice> ShowStopFocusTimerDialogAsync(int wholeMinutes, bool discardInsteadOfStop)
        {
            if (_focusTimerStopDialogOpen)
                return Task.FromResult(FocusTimerStopChoice.KeepFocusing);

            var tcs = new TaskCompletionSource<FocusTimerStopChoice>();

            var dialog = new Window
            {
                Title = "Stop focusing?",
                Width = 360,
                Height = 155,
                WindowStartupLocation = WindowStartupLocation.CenterOwner,
                Owner = this,
                ResizeMode = ResizeMode.NoResize,
                WindowStyle = WindowStyle.ToolWindow,
                ShowInTaskbar = false
            };

            bool resolved = false;

            void Finish(FocusTimerStopChoice result)
            {
                if (resolved)
                    return;

                resolved = true;
                _focusTimerStopDialogOpen = false;
                _focusTimerStopDialogWindow = null;
                UpdateFocusTimerUi();
                tcs.TrySetResult(result);

                if (dialog.IsVisible)
                    dialog.Close();
            }

            dialog.Closed += (_, __) =>
            {
                if (resolved)
                    return;

                resolved = true;
                _focusTimerStopDialogOpen = false;
                _focusTimerStopDialogWindow = null;
                UpdateFocusTimerUi();
                tcs.TrySetResult(FocusTimerStopChoice.KeepFocusing);
            };

            var root = new StackPanel { Margin = new Thickness(12) };
            root.Children.Add(new TextBlock
            {
                Text = $"You have completed {wholeMinutes} full minute{(wholeMinutes == 1 ? "" : "s")}.",
                Margin = new Thickness(0, 0, 0, 12),
                TextWrapping = TextWrapping.Wrap
            });

            var buttons = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                HorizontalAlignment = HorizontalAlignment.Right
            };

            var keepBtn = new Button { Content = "Keep going?", Width = 120, Margin = new Thickness(0, 0, 10, 0) };
            keepBtn.Click += (_, __) => Finish(FocusTimerStopChoice.KeepFocusing);

            string stopButtonText = discardInsteadOfStop ? "Discard Session" : "Stop Focusing";
            var stopBtn = new Button { Content = stopButtonText, Width = 120 };
            stopBtn.Click += (_, __) => Finish(FocusTimerStopChoice.StopFocusing);

            buttons.Children.Add(keepBtn);
            buttons.Children.Add(stopBtn);
            root.Children.Add(buttons);

            dialog.Content = root;

            _focusTimerStopDialogOpen = true;
            _focusTimerStopDialogWindow = dialog;
            UpdateFocusTimerUi();

            dialog.Show();
            dialog.Activate();

            return tcs.Task;
        }

        private FocusTimerCheckpointChoice ShowCountUpCheckpointDialog(int wholeMinutes)
        {
            var dialog = new Window
            {
                Title = "Count-up timer paused",
                Width = 420,
                Height = 215,
                WindowStartupLocation = WindowStartupLocation.CenterOwner,
                Owner = this,
                ResizeMode = ResizeMode.NoResize,
                WindowStyle = WindowStyle.ToolWindow,
                ShowInTaskbar = false
            };

            FocusTimerCheckpointChoice choice = FocusTimerCheckpointChoice.Closed;

            var root = new StackPanel { Margin = new Thickness(12) };
            root.Children.Add(new TextBlock
            {
                Text = $"The count-up timer has reached {FormatMinutes(wholeMinutes)} and paused automatically.",
                Margin = new Thickness(0, 0, 0, 6),
                TextWrapping = TextWrapping.Wrap
            });
            root.Children.Add(new TextBlock
            {
                Text = "This is just to make sure the timer was not left running by accident.",
                Margin = new Thickness(0, 0, 0, 12),
                TextWrapping = TextWrapping.Wrap
            });

            var buttons = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                HorizontalAlignment = HorizontalAlignment.Right
            };

            var keepGoingBtn = new Button { Content = "Keep going?", Width = 105, Margin = new Thickness(0, 0, 8, 0) };
            keepGoingBtn.Click += (_, __) =>
            {
                choice = FocusTimerCheckpointChoice.KeepGoing;
                dialog.DialogResult = true;
                dialog.Close();
            };

            var takeBreakBtn = new Button { Content = "Take a break", Width = 105, Margin = new Thickness(0, 0, 8, 0) };
            takeBreakBtn.Click += (_, __) =>
            {
                choice = FocusTimerCheckpointChoice.TakeABreak;
                dialog.DialogResult = true;
                dialog.Close();
            };

            var discardBtn = new Button { Content = "Discard Session", Width = 115 };
            discardBtn.Click += (_, __) =>
            {
                choice = FocusTimerCheckpointChoice.DiscardSession;
                dialog.DialogResult = true;
                dialog.Close();
            };

            buttons.Children.Add(keepGoingBtn);
            buttons.Children.Add(takeBreakBtn);
            buttons.Children.Add(discardBtn);
            root.Children.Add(buttons);

            dialog.Content = root;
            dialog.ShowDialog();
            return choice;
        }

        private void ShowFocusRewardSummaryDialog(int wholeMinutes, int coins, int trainerXp)
        {
            var dialog = new Window
            {
                Title = "Focus rewards",
                Width = 360,
                Height = 220,
                WindowStartupLocation = WindowStartupLocation.CenterOwner,
                Owner = this,
                ResizeMode = ResizeMode.NoResize,
                WindowStyle = WindowStyle.ToolWindow,
                ShowInTaskbar = false
            };

            var root = new StackPanel { Margin = new Thickness(12) };

            root.Children.Add(new TextBlock
            {
                Text = $"Focused for {FormatMinutes(wholeMinutes)}",
                FontWeight = FontWeights.Bold,
                Margin = new Thickness(0, 0, 0, 12),
                TextWrapping = TextWrapping.Wrap
            });

            root.Children.Add(new TextBlock
            {
                Text = $"Coins earned: {coins}",
                Margin = new Thickness(0, 0, 0, 8)
            });

            root.Children.Add(new TextBlock
            {
                Text = $"XP gained: {trainerXp}",
                Margin = new Thickness(0, 0, 0, 12)
            });

            if (coins == 0 && trainerXp == 0)
            {
                root.Children.Add(new TextBlock
                {
                    Text = "This session was logged, but it did not generate rewards.",
                    Foreground = System.Windows.Media.Brushes.Gray,
                    TextWrapping = TextWrapping.Wrap,
                    Margin = new Thickness(0, 0, 0, 12)
                });
            }

            var closeBtn = new Button
            {
                Content = "Close",
                Width = 100,
                HorizontalAlignment = HorizontalAlignment.Right
            };
            closeBtn.Click += (_, __) => dialog.Close();

            root.Children.Add(closeBtn);
            dialog.Content = root;
            dialog.ShowDialog();
        }
        #endregion // SECTION D2 — Focus Timer Dialogs

        #region SECTION D3 — Focus Timer Handlers + Manual Add
        private async void StartFocusTimerButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (_focusTimerRunning || _focusTimerPaused)
                    return;

                _focusTimerIsCountUp = IsCountUpModeSelected();

                int countUpDebugStartMinutes = 0;
                int countdownDebugRemainingMinutes = 0;

                if (_focusTimerIsCountUp)
                {
                    if (!TryGetCountUpDebugStartMinutes(out countUpDebugStartMinutes))
                    {
                        MessageBox.Show("Debug Start From must be a whole number of minutes 0 or greater.");
                        return;
                    }
                }
                else
                {
                    if (!TryGetCountdownTargetMinutes(out _focusTimerCountdownTargetMinutes))
                    {
                        MessageBox.Show("Countdown minutes must be a whole number from 5 to 120.");
                        return;
                    }

                    if (!TryGetCountdownDebugRemainingMinutes(out countdownDebugRemainingMinutes))
                    {
                        MessageBox.Show("Debug Remaining must be a whole number of minutes 0 or greater.");
                        return;
                    }

                    if (countdownDebugRemainingMinutes > _focusTimerCountdownTargetMinutes)
                    {
                        MessageBox.Show("Debug Remaining cannot be greater than the countdown target.");
                        return;
                    }
                }

                _focusTimerFocusType = NormalizeFocusLabel(FocusTypeCombo?.Text);
                await SaveFocusLabelIfNeededAsync(_focusTimerFocusType);

                _focusTimerPaused = false;
                _focusTimerPausedByUser = false;
                _focusTimerRunning = true;
                _focusTimerRunStartedUtc = DateTimeOffset.UtcNow;

                if (_focusTimerIsCountUp)
                {
                    _focusTimerElapsedBeforePause = TimeSpan.FromMinutes(countUpDebugStartMinutes);
                    _focusTimerNextCountUpPauseMinutes = CalculateNextCountUpPauseMinutes(countUpDebugStartMinutes);
                }
                else
                {
                    _focusTimerElapsedBeforePause = countdownDebugRemainingMinutes > 0
                        ? TimeSpan.FromMinutes(_focusTimerCountdownTargetMinutes - countdownDebugRemainingMinutes)
                        : TimeSpan.Zero;
                    _focusTimerNextCountUpPauseMinutes = 120;
                }

                _focusTimerUiTimer.Start();
                UpdateFocusTimerUi();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not start focus timer");
            }
        }

        private void PauseFocusTimerButton_Click(object sender, RoutedEventArgs e)
        {
            if (_focusTimerRunning)
            {
                _focusTimerElapsedBeforePause = GetCurrentFocusTimerElapsed();
                _focusTimerUiTimer.Stop();
                _focusTimerRunning = false;
                _focusTimerPaused = true;
                _focusTimerPausedByUser = true;
                UpdateFocusTimerUi();
                return;
            }

            if (_focusTimerPaused && _focusTimerPausedByUser)
            {
                _focusTimerPaused = false;
                _focusTimerPausedByUser = false;
                _focusTimerRunning = true;
                _focusTimerRunStartedUtc = DateTimeOffset.UtcNow;
                _focusTimerUiTimer.Start();
                UpdateFocusTimerUi();
            }
        }

        private async void StopFocusTimerButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if ((!_focusTimerRunning && !_focusTimerPaused) || _focusTimerStopDialogOpen)
                    return;

                int wholeMinutesAtPrompt = Math.Max(0, (int)Math.Floor(
                    _focusTimerRunning ? GetCurrentFocusTimerElapsed().TotalMinutes : _focusTimerElapsedBeforePause.TotalMinutes));

                bool discardInsteadOfStop = !HasMetFocusLoggingThreshold(wholeMinutesAtPrompt);
                var choice = await ShowStopFocusTimerDialogAsync(wholeMinutesAtPrompt, discardInsteadOfStop);

                if (!_focusTimerRunning && !_focusTimerPaused)
                    return;

                if (choice == FocusTimerStopChoice.KeepFocusing)
                {
                    if (_focusTimerPaused && _focusTimerPausedByUser)
                    {
                        _focusTimerPaused = false;
                        _focusTimerPausedByUser = false;
                        _focusTimerRunning = true;
                        _focusTimerRunStartedUtc = DateTimeOffset.UtcNow;
                        _focusTimerUiTimer.Start();
                    }

                    UpdateFocusTimerUi();
                    return;
                }

                var finalElapsed = _focusTimerRunning
                    ? GetCurrentFocusTimerElapsed()
                    : _focusTimerElapsedBeforePause;

                _focusTimerElapsedBeforePause = finalElapsed;
                _focusTimerUiTimer.Stop();
                _focusTimerRunning = false;
                _focusTimerPaused = false;
                _focusTimerPausedByUser = false;

                int wholeMinutes = Math.Max(0, (int)Math.Floor(finalElapsed.TotalMinutes));
                bool grantRewards = HasMetFocusRewardThreshold(wholeMinutes);
                bool completed = _focusTimerIsCountUp && grantRewards;

                if (HasMetFocusLoggingThreshold(wholeMinutes))
                {
                    var nowLocal = DateTimeOffset.Now;
                    var logDate = GetCurrentGameDayLocal(nowLocal);
                    var rewardPreview = await BuildTimerRewardPreviewAsync(logDate, wholeMinutes, completed, grantRewards);

                    await SaveTimerSessionAsync(nowLocal, wholeMinutes, completed, grantRewards);

                    ResetFocusTimerState(
                        grantRewards
                            ? $"Focus session saved: {FormatMinutes(wholeMinutes)} ({(completed ? "completed" : "incomplete")})."
                            : $"Focus session saved: {FormatMinutes(wholeMinutes)} with no rewards (under 5 minutes).");

                    ShowFocusRewardSummaryDialog(wholeMinutes, rewardPreview.Coins, rewardPreview.TrainerXp);
                    return;
                }

                ResetFocusTimerState("Timer stopped before any full minutes were completed. Nothing was logged.");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not stop focus timer");
            }
        }

        private async void FocusTimerUiTimer_Tick(object? sender, EventArgs e)
        {
            if (!_focusTimerRunning)
                return;

            var elapsed = GetCurrentFocusTimerElapsed();

            if (_focusTimerIsCountUp)
            {
                UpdateFocusTimerUi();

                if (_focusTimerStopDialogOpen)
                    return;

                int wholeMinutes = Math.Max(0, (int)Math.Floor(elapsed.TotalMinutes));
                if (wholeMinutes < _focusTimerNextCountUpPauseMinutes)
                    return;

                _focusTimerElapsedBeforePause = elapsed;
                _focusTimerUiTimer.Stop();
                _focusTimerRunning = false;
                _focusTimerPaused = true;
                _focusTimerPausedByUser = false;
                UpdateFocusTimerUi();

                System.Media.SystemSounds.Exclamation.Play();

                var checkpointChoice = ShowCountUpCheckpointDialog(wholeMinutes);

                if (checkpointChoice == FocusTimerCheckpointChoice.DiscardSession)
                {
                    ResetFocusTimerState("Count-up session discarded.");
                    return;
                }

                if (checkpointChoice == FocusTimerCheckpointChoice.TakeABreak)
                {
                    var nowLocal = DateTimeOffset.Now;
                    var logDate = GetCurrentGameDayLocal(nowLocal);
                    var rewardPreview = await BuildTimerRewardPreviewAsync(logDate, wholeMinutes, completed: true, grantRewards: true);

                    await SaveTimerSessionAsync(nowLocal, wholeMinutes, completed: true, grantRewards: true);

                    ResetFocusTimerState($"Count-up session saved: {FormatMinutes(wholeMinutes)} (completed).");
                    ShowFocusRewardSummaryDialog(wholeMinutes, rewardPreview.Coins, rewardPreview.TrainerXp);
                    return;
                }

                _focusTimerNextCountUpPauseMinutes += 120;
                _focusTimerPaused = false;
                _focusTimerPausedByUser = false;
                _focusTimerRunning = true;
                _focusTimerRunStartedUtc = DateTimeOffset.UtcNow;
                _focusTimerUiTimer.Start();
                UpdateFocusTimerUi();
                return;
            }

            var remaining = TimeSpan.FromMinutes(_focusTimerCountdownTargetMinutes) - elapsed;

            if (remaining > TimeSpan.Zero)
            {
                UpdateFocusTimerUi();
                return;
            }

            _focusTimerElapsedBeforePause = TimeSpan.FromMinutes(_focusTimerCountdownTargetMinutes);
            _focusTimerUiTimer.Stop();
            _focusTimerRunning = false;
            _focusTimerPaused = false;
            _focusTimerPausedByUser = false;
            CloseOpenStopFocusTimerDialog();
            UpdateFocusTimerUi();

            var countdownNowLocal = DateTimeOffset.Now;
            var countdownLogDate = GetCurrentGameDayLocal(countdownNowLocal);
            var countdownRewardPreview = await BuildTimerRewardPreviewAsync(
                countdownLogDate,
                _focusTimerCountdownTargetMinutes,
                completed: true,
                grantRewards: true);

            await SaveTimerSessionAsync(
                countdownNowLocal,
                _focusTimerCountdownTargetMinutes,
                completed: true,
                grantRewards: true);

            System.Media.SystemSounds.Asterisk.Play();
            ResetFocusTimerState($"Countdown complete: {FormatMinutes(_focusTimerCountdownTargetMinutes)} saved as completed.");
            ShowFocusRewardSummaryDialog(
                _focusTimerCountdownTargetMinutes,
                countdownRewardPreview.Coins,
                countdownRewardPreview.TrainerXp);
        }

        private void FocusTimerModeCombo_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (_focusTimerRunning || _focusTimerPaused)
                return;

            UpdateFocusTimerUi();
        }

        private void FocusCountdownMinutesBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (_focusTimerRunning || _focusTimerPaused)
                return;

            if (TryGetCountdownTargetMinutes(out int countdownMinutes))
                _focusTimerCountdownTargetMinutes = countdownMinutes;

            UpdateFocusTimerUi();
        }

        private void FocusTimerDebugTextChanged(object sender, TextChangedEventArgs e)
        {
            if (_focusTimerRunning || _focusTimerPaused)
                return;

            UpdateFocusTimerUi();
        }

        private async void AddFocusButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (!int.TryParse(MinutesBox.Text.Trim(), out int minutes) || minutes <= 0)
                {
                    MessageBox.Show("Minutes must be a whole number greater than 0.");
                    return;
                }

                // Allow typed label (editable ComboBox)
                string focusType = NormalizeFocusLabel(FocusTypeCombo.Text);
                await SaveFocusLabelIfNeededAsync(focusType);

                var nowLocal = DateTimeOffset.Now;
                var session = new FocusSession
                {
                    LoggedAtUtc = nowLocal.ToUniversalTime(),
                    LogDate = SelectedLogDate,
                    FocusType = focusType,
                    Minutes = minutes,
                    Completed = CompletedCheck.IsChecked == true
                };

                await _repo.AddAsync(session);

                MinutesBox.Text = "";
                CompletedCheck.IsChecked = false;

                await RefreshForSelectedDateAsync();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.ToString(), "Error saving focus session");
            }
        }
        #endregion // SECTION D3 — Focus Timer Handlers + Manual Add

        #region SECTION D4 — Focus Labels
        private async Task RefreshFocusLabelsAsync(string? keepText = null)
        {
            var currentText = keepText ?? (FocusTypeCombo?.Text ?? "");

            var labels = await _focusLabelRepo.GetActiveAsync();

            FocusLabelChoices.Clear();
            foreach (var s in labels)
                FocusLabelChoices.Add(s);

            // Set a reasonable default if empty
            if (FocusLabelChoices.Count == 0)
            {
                FocusLabelChoices.Add("Draw");
                FocusLabelChoices.Add("Music");
            }

            // Restore typed/current selection (even if not in list)
            if (FocusTypeCombo != null)
            {
                if (!string.IsNullOrWhiteSpace(currentText) && currentText != "(None)")
                {
                    FocusTypeCombo.Text = currentText;
                }
                else
                {
                    // Prefer Draw if present
                    var draw = FocusLabelChoices.FirstOrDefault(x => string.Equals(x, "Draw", StringComparison.OrdinalIgnoreCase));
                    FocusTypeCombo.Text = draw ?? FocusLabelChoices[0];
                }
            }
        }

        private async void ManageFocusLabels_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var win = new Window
                {
                    Title = "Focus labels",
                    Width = 380,
                    Height = 460,
                    WindowStartupLocation = WindowStartupLocation.CenterOwner,
                    Owner = this
                };

                var root = new StackPanel { Margin = new Thickness(12) };

                var labels = new ObservableCollection<string>();

                var list = new ListBox
                {
                    Height = 250,
                    ItemsSource = labels
                };

                async Task ReloadAsync()
                {
                    var active = await _focusLabelRepo.GetActiveAsync();
                    labels.Clear();
                    foreach (var s in active.Where(x => !string.Equals(x, "(None)", StringComparison.OrdinalIgnoreCase)))
                        labels.Add(s);
                }

                await ReloadAsync();

                root.Children.Add(new TextBlock { Text = "Active labels (used for dropdown choices):", Margin = new Thickness(0, 0, 0, 6) });
                root.Children.Add(list);

                var addRow = new StackPanel { Orientation = Orientation.Horizontal, Margin = new Thickness(0, 10, 0, 0) };
                var addBox = new TextBox { Width = 220 };
                var addBtn = new Button { Content = "Add", Width = 100, Margin = new Thickness(10, 0, 0, 0) };

                addBtn.Click += async (_, __) =>
                {
                    string name = NormalizeFocusLabel(addBox.Text);
                    if (name == "(None)")
                    {
                        MessageBox.Show("Type a label name first.");
                        return;
                    }

                    await _focusLabelRepo.UpsertActiveAsync(name);
                    addBox.Text = "";
                    await ReloadAsync();
                };

                addRow.Children.Add(addBox);
                addRow.Children.Add(addBtn);
                root.Children.Add(addRow);

                var delRow = new StackPanel { Orientation = Orientation.Horizontal, Margin = new Thickness(0, 10, 0, 0) };

                var delBtn = new Button { Content = "Delete selected", Width = 140 };
                delBtn.Click += async (_, __) =>
                {
                    if (list.SelectedItem is not string selected || string.IsNullOrWhiteSpace(selected))
                        return;

                    var result = MessageBox.Show(
                        $"Delete label '{selected}'?\n\nExisting sessions keep their text, but this label will stop appearing in the dropdown.",
                        "Confirm",
                        MessageBoxButton.YesNo,
                        MessageBoxImage.Warning);

                    if (result != MessageBoxResult.Yes) return;

                    await _focusLabelRepo.SoftDeleteAsync(selected);
                    await ReloadAsync();
                };

                var closeBtn = new Button { Content = "Close", Width = 100, Margin = new Thickness(10, 0, 0, 0) };
                closeBtn.Click += (_, __) => win.Close();

                delRow.Children.Add(delBtn);
                delRow.Children.Add(closeBtn);
                root.Children.Add(delRow);

                win.Content = root;
                win.ShowDialog();

                await RefreshFocusLabelsAsync(keepText: FocusTypeCombo?.Text);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not manage focus labels");
            }
        }
        #endregion // SECTION D4 — Focus Labels

        #region SECTION E1 — Sleep Tuning Settings Helpers
        private sealed class SleepTuningSettings
        {
            public double SleepHealthyMinHours { get; set; } = 7.0;
            public double SleepHealthyMaxHours { get; set; } = 9.0;
            public double SleepHealthyMultiplier { get; set; } = 1.30;
            public double SleepOutsideRangeStartMultiplier { get; set; } = 1.30;
            public double SleepPenaltyPer15Min { get; set; } = 0.01;
            public double SleepTrackedMinimumMultiplier { get; set; } = 1.10;
            public int SleepRewardMinimumMinutes { get; set; } = 60;
        }

        private static SleepTuningSettings BuildDefaultSleepTuningSettings()
        {
            return new SleepTuningSettings
            {
                SleepHealthyMinHours = 7.0,
                SleepHealthyMaxHours = 9.0,
                SleepHealthyMultiplier = 1.30,
                SleepOutsideRangeStartMultiplier = 1.30,
                SleepPenaltyPer15Min = 0.01,
                SleepTrackedMinimumMultiplier = 1.10,
                SleepRewardMinimumMinutes = 60
            };
        }

        private static double GetDefaultFocusXpPerMinute() => 100.0;

        private static double GetDefaultFocusXpIncompleteMultiplier() => 0.25;

        private static SleepTuningSettings NormalizeSleepTuningSettings(SleepTuningSettings settings)
        {
            double healthyMin = Math.Max(0.0, settings.SleepHealthyMinHours);
            double healthyMax = Math.Max(healthyMin, settings.SleepHealthyMaxHours);
            double healthyMult = Math.Max(1.0, settings.SleepHealthyMultiplier);
            double outsideStart = Math.Max(1.0, settings.SleepOutsideRangeStartMultiplier);
            double penaltyPer15Min = Math.Max(0.0, settings.SleepPenaltyPer15Min);
            double trackedMin = Math.Max(1.0, settings.SleepTrackedMinimumMultiplier);
            int rewardMinimumMinutes = Math.Max(1, settings.SleepRewardMinimumMinutes);

            if (outsideStart > healthyMult)
                outsideStart = healthyMult;

            if (trackedMin > healthyMult)
                trackedMin = healthyMult;

            return new SleepTuningSettings
            {
                SleepHealthyMinHours = healthyMin,
                SleepHealthyMaxHours = healthyMax,
                SleepHealthyMultiplier = healthyMult,
                SleepOutsideRangeStartMultiplier = outsideStart,
                SleepPenaltyPer15Min = penaltyPer15Min,
                SleepTrackedMinimumMultiplier = trackedMin,
                SleepRewardMinimumMinutes = rewardMinimumMinutes
            };
        }

        private async Task<SleepTuningSettings> GetSleepTuningSettingsAsync()
        {
            ItemDropsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            var row = await conn.QuerySingleOrDefaultAsync<SleepTuningSettings>(@"
SELECT
    COALESCE(SleepHealthyMinHours, 7.0) AS SleepHealthyMinHours,
    COALESCE(SleepHealthyMaxHours, 9.0) AS SleepHealthyMaxHours,
    COALESCE(SleepHealthyMultiplier, 1.30) AS SleepHealthyMultiplier,
    COALESCE(SleepOutsideRangeStartMultiplier, 1.30) AS SleepOutsideRangeStartMultiplier,
    COALESCE(SleepPenaltyPer15Min, 0.01) AS SleepPenaltyPer15Min,
    COALESCE(SleepTrackedMinimumMultiplier, 1.10) AS SleepTrackedMinimumMultiplier,
    COALESCE(SleepRewardMinimumMinutes, 60) AS SleepRewardMinimumMinutes
FROM GamificationSettings
WHERE Id = 1;");

            return NormalizeSleepTuningSettings(row ?? new SleepTuningSettings());
        }

        private async Task SaveSleepTuningSettingsAsync(SleepTuningSettings settings)
        {
            settings = NormalizeSleepTuningSettings(settings);

            ItemDropsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            await conn.ExecuteAsync(@"
UPDATE GamificationSettings
SET
    SleepHealthyMinHours = @SleepHealthyMinHours,
    SleepHealthyMaxHours = @SleepHealthyMaxHours,
    SleepHealthyMultiplier = @SleepHealthyMultiplier,
    SleepOutsideRangeStartMultiplier = @SleepOutsideRangeStartMultiplier,
    SleepPenaltyPer15Min = @SleepPenaltyPer15Min,
    SleepTrackedMinimumMultiplier = @SleepTrackedMinimumMultiplier,
    SleepRewardMinimumMinutes = @SleepRewardMinimumMinutes,
    UpdatedAtUtc = @UpdatedAtUtc
WHERE Id = 1;",
                new
                {
                    settings.SleepHealthyMinHours,
                    settings.SleepHealthyMaxHours,
                    settings.SleepHealthyMultiplier,
                    settings.SleepOutsideRangeStartMultiplier,
                    settings.SleepPenaltyPer15Min,
                    settings.SleepTrackedMinimumMultiplier,
                    settings.SleepRewardMinimumMinutes,
                    UpdatedAtUtc = nowUtc
                });
        }

        private static bool TryParseFlexibleDouble(string text, out double value)
        {
            text = (text ?? "").Trim();

            return
                double.TryParse(text, NumberStyles.Float, CultureInfo.InvariantCulture, out value) ||
                double.TryParse(text, NumberStyles.Float, CultureInfo.CurrentCulture, out value);
        }

        private static string FormatDoubleForBox(double value)
        {
            return value.ToString("0.###", CultureInfo.InvariantCulture);
        }

        private static void SetTextBoxIfIdle(TextBox? box, string value)
        {
            if (box == null)
                return;

            if (box.IsKeyboardFocusWithin)
                return;

            box.Text = value;
        }

        private static void AutoSizeGridColumns(DataGrid? grid)
        {
            if (grid == null)
                return;

            grid.UpdateLayout();

            foreach (var col in grid.Columns)
                col.Width = DataGridLength.Auto;
        }

        private async void SaveSleepTuningButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (_sleepHealthyMinHoursBox == null ||
                    _sleepHealthyMaxHoursBox == null ||
                    _sleepHealthyMultiplierBox == null ||
                    _sleepPenaltyPer15MinBox == null ||
                    _sleepTrackedMinimumMultiplierBox == null ||
                    _sleepRewardMinimumMinutesBox == null)
                {
                    MessageBox.Show("Sleep tuning controls are not ready yet.");
                    return;
                }

                if (!TryParseFlexibleDouble(_sleepHealthyMinHoursBox.Text, out double healthyMinHours) || healthyMinHours < 0)
                {
                    MessageBox.Show("Healthy Minimum Hours must be a number greater than or equal to 0.");
                    return;
                }

                if (!TryParseFlexibleDouble(_sleepHealthyMaxHoursBox.Text, out double healthyMaxHours) || healthyMaxHours < healthyMinHours)
                {
                    MessageBox.Show("Healthy Maximum Hours must be a number greater than or equal to Healthy Minimum Hours.");
                    return;
                }

                if (!TryParseFlexibleDouble(_sleepHealthyMultiplierBox.Text, out double healthyMultiplier) || healthyMultiplier < 1.0)
                {
                    MessageBox.Show("Sleep Multiplier Max/Healthy must be a number greater than or equal to 1.0.");
                    return;
                }

                if (!TryParseFlexibleDouble(_sleepPenaltyPer15MinBox.Text, out double penaltyPer15Min) || penaltyPer15Min < 0)
                {
                    MessageBox.Show("Multiplier Minimum / 15 minutes must be a number greater than or equal to 0.");
                    return;
                }

                if (!TryParseFlexibleDouble(_sleepTrackedMinimumMultiplierBox.Text, out double trackedMinimumMultiplier) || trackedMinimumMultiplier < 1.0)
                {
                    MessageBox.Show("Sleep Multiplier Min/Unhealthy must be a number greater than or equal to 1.0.");
                    return;
                }

                if (trackedMinimumMultiplier > healthyMultiplier)
                {
                    MessageBox.Show("Sleep Multiplier Min/Unhealthy cannot be greater than Sleep Multiplier Max/Healthy.");
                    return;
                }

                if (!int.TryParse((_sleepRewardMinimumMinutesBox.Text ?? "").Trim(), out int rewardMinimumMinutes) || rewardMinimumMinutes < 1)
                {
                    MessageBox.Show("Minimum Sleep Minutes for Reward-Eligibility must be a whole number greater than or equal to 1.");
                    return;
                }

                await SaveSleepTuningSettingsAsync(new SleepTuningSettings
                {
                    SleepHealthyMinHours = healthyMinHours,
                    SleepHealthyMaxHours = healthyMaxHours,
                    SleepHealthyMultiplier = healthyMultiplier,
                    SleepOutsideRangeStartMultiplier = healthyMultiplier,
                    SleepPenaltyPer15Min = penaltyPer15Min,
                    SleepTrackedMinimumMultiplier = trackedMinimumMultiplier,
                    SleepRewardMinimumMinutes = rewardMinimumMinutes
                });

                await RefreshForSelectedDateAsync();

                MessageBox.Show("Saved sleep tuning.");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not save sleep tuning");
            }
        }

        private async void ResetSleepTuningButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var defaults = BuildDefaultSleepTuningSettings();

                await SaveSleepTuningSettingsAsync(defaults);
                await RefreshForSelectedDateAsync();

                MessageBox.Show("Reset sleep tuning to defaults.");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not reset sleep tuning");
            }
        }

        private async void SaveTrainerXpSettingsButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (_focusXpPerMinuteBox == null || _focusXpIncompleteMultiplierBox == null)
                {
                    MessageBox.Show("Trainer XP controls are not ready yet.");
                    return;
                }

                if (!TryParseFlexibleDouble(_focusXpPerMinuteBox.Text, out double focusXpPerMinute) || focusXpPerMinute <= 0)
                {
                    MessageBox.Show("Focus XP per minute must be a number greater than 0.");
                    return;
                }

                if (!TryParseFlexibleDouble(_focusXpIncompleteMultiplierBox.Text, out double incompleteMultiplier) ||
                    incompleteMultiplier < 0 || incompleteMultiplier > 1.0)
                {
                    MessageBox.Show("Incomplete session multiplier must be a number between 0 and 1.");
                    return;
                }

                await _gamiSettingsRepo.UpdateFocusXpSettingsAsync(focusXpPerMinute, incompleteMultiplier);
                await RefreshForSelectedDateAsync();

                MessageBox.Show("Saved XP settings.");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not save XP settings");
            }
        }

        private async void ResetTrainerXpSettingsButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                await _gamiSettingsRepo.UpdateFocusXpSettingsAsync(
                    GetDefaultFocusXpPerMinute(),
                    GetDefaultFocusXpIncompleteMultiplier());

                await RefreshForSelectedDateAsync();

                MessageBox.Show("Reset XP settings to defaults.");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not reset XP settings");
            }
        }

        private async void PrestigeResetButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var progress = await _rewardsRepo.GetTrainerProgressAsync();
                if (!progress.IsMaxLevel)
                {
                    MessageBox.Show("You must be level 100 before you can prestige reset.");
                    return;
                }

                var result = MessageBox.Show(
                    "Prestige reset now?\n\nThis will reset your cycle XP back to level 1 and add 1 prestige star. Lifetime trainer XP will stay unchanged.",
                    "Confirm prestige reset",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Question);

                if (result != MessageBoxResult.Yes)
                    return;

                bool didReset = await _rewardsRepo.TryPrestigeResetAsync();
                await RefreshForSelectedDateAsync();

                if (didReset)
                    MessageBox.Show("Prestige reset complete.");
                else
                    MessageBox.Show("Prestige reset was not applied.");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not prestige reset");
            }
        }

        private async void ResetTrainerLevelButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var result = MessageBox.Show(
                    "Reset trainer level to 1?\n\nThis will reset cycle XP to 0. Prestige stars and lifetime trainer XP will stay unchanged.",
                    "Confirm level reset",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Warning);

                if (result != MessageBoxResult.Yes)
                    return;

                await _rewardsRepo.ResetTrainerLevelAsync();
                await RefreshForSelectedDateAsync();

                MessageBox.Show("Trainer level reset to 1.");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not reset trainer level");
            }
        }

        private async void ResetTrainerPrestigeButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var result = MessageBox.Show(
                    "Reset prestige stars to 0?\n\nCycle XP and lifetime trainer XP will stay unchanged.",
                    "Confirm prestige reset to 0",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Warning);

                if (result != MessageBoxResult.Yes)
                    return;

                await _rewardsRepo.ResetTrainerPrestigeAsync();
                await RefreshForSelectedDateAsync();

                MessageBox.Show("Prestige stars reset to 0.");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not reset prestige stars");
            }
        }

        private async void ResetTrainerLifetimeXpButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var result = MessageBox.Show(
                    "Reset lifetime trainer XP to 0?\n\nCurrent level, cycle XP, and prestige stars will stay unchanged.",
                    "Confirm lifetime XP reset",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Warning);

                if (result != MessageBoxResult.Yes)
                    return;

                await _rewardsRepo.ResetTrainerLifetimeXpAsync();
                await RefreshForSelectedDateAsync();

                MessageBox.Show("Lifetime trainer XP reset to 0.");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not reset lifetime trainer XP");
            }
        }

        private void StartLiveClock()
        {
            _liveClockTimer.Stop();
            _liveClockTimer.Interval = TimeSpan.FromSeconds(1);
            _liveClockTimer.Tick -= LiveClockTimer_Tick;
            _liveClockTimer.Tick += LiveClockTimer_Tick;
            _liveClockTimer.Start();

            UpdateLiveClockText();
        }

        private void LiveClockTimer_Tick(object? sender, EventArgs e)
        {
            UpdateLiveClockText();
        }

        private void UpdateLiveClockText()
        {
            var nowLocal = DateTimeOffset.Now;
            var gameDayNow = GetCurrentGameDayLocal(nowLocal);

            if (NowLocalText != null)
                NowLocalText.Text = $"Now (local): {nowLocal:yyyy-MM-dd HH:mm:ss}";

            if (GameDayNowText != null)
                GameDayNowText.Text = $"Game day (03:00 cutoff): {gameDayNow:yyyy-MM-dd}";
        }

        private static SleepRewardSummary BuildSleepRewardSummary(SleepTuningSettings settings, IEnumerable<int> sessionDurationsMinutesChronological)
        {
            settings = NormalizeSleepTuningSettings(settings);

            return SleepRewardCalculator.Calculate(
                sessionDurationsMinutesChronological,
                settings.SleepHealthyMinHours,
                settings.SleepHealthyMaxHours,
                settings.SleepHealthyMultiplier,
                settings.SleepPenaltyPer15Min,
                settings.SleepTrackedMinimumMultiplier,
                settings.SleepRewardMinimumMinutes);
        }

        private static string BuildSleepPreviewText(SleepTuningSettings settings, int totalMinutes)
        {
            var summary = BuildSleepRewardSummary(settings, new[] { totalMinutes });
            return $"{FormatMinutes(totalMinutes)} → x{summary.Multiplier:F2} ({summary.Band})";
        }

        private static string BuildSleepStatusText(SleepRewardSummary summary)
        {
            if (summary.CountedSessionCount <= 0)
                return $"Sleep multiplier: x{summary.Multiplier:F2} ({summary.Band})";

            string rewardSleepText = FormatMinutes(summary.RewardEligibleMinutes);
            string mainSleepText = FormatMinutes(summary.MainSleepMinutes);

            if (summary.CatchUpMinutesUsed > 0)
            {
                return
                    $"Sleep multiplier: x{summary.Multiplier:F2} " +
                    $"(reward sleep: {rewardSleepText}, main: {mainSleepText}, catch-up used: {FormatMinutes(summary.CatchUpMinutesUsed)}, {summary.Band})";
            }

            return $"Sleep multiplier: x{summary.Multiplier:F2} (reward sleep: {rewardSleepText}, {summary.Band})";
        }

        private static string BuildSleepSessionsSummaryText(SleepRewardSummary summary)
        {
            string totalLoggedText = FormatMinutes(summary.TotalLoggedMinutes);

            if (summary.CountedSessionCount <= 0)
            {
                return
                    $"Total logged sleep: {totalLoggedText} across {summary.TotalLoggedSessionCount} session(s) | " +
                    $"Reward-eligible: none (minimum {summary.RewardEligibleSessionMinimumMinutes}m per session)";
            }

            string countedText =
                summary.IgnoredQualifyingSessionCount > 0
                    ? $"{summary.CountedSessionCount}/{summary.QualifyingSessionCount} qualifying session(s) counted"
                    : $"{summary.CountedSessionCount} qualifying session(s) counted";

            string catchUpText = summary.CatchUpMinutesUsed > 0
                ? $" | Catch-up used: {FormatMinutes(summary.CatchUpMinutesUsed)}"
                : "";

            return
                $"Total logged sleep: {totalLoggedText} across {summary.TotalLoggedSessionCount} session(s) | " +
                $"Reward-eligible: {FormatMinutes(summary.RewardEligibleMinutes)} | Main sleep: {FormatMinutes(summary.MainSleepMinutes)}{catchUpText} | {countedText}";
        }

        private static string BuildTrainerLevelLine(TrainerProgressSnapshot progress)
        {
            return $"Trainer: Lv {progress.CurrentLevel} | Prestige: {progress.PrestigeCount}★ | Cycle XP: {progress.CurrentCycleXp:#,0}/{progress.MaxCycleXp:#,0} | Lifetime XP: {progress.TotalLifetimeXp:#,0}";
        }

        private static string BuildTrainerProgressLine(TrainerProgressSnapshot progress)
        {
            if (progress.IsMaxLevel)
                return "Level 100 reached. Prestige Reset (+1 Star) is available.";

            return
                $"Current level progress: {progress.XpIntoCurrentLevel:#,0} XP into Lv {progress.CurrentLevel} | " +
                $"{progress.XpNeededForNextLevel:#,0} XP to Lv {progress.CurrentLevel + 1} " +
                $"(next at {progress.NextLevelBaseXp:#,0} total XP)";
        }

        #endregion // SECTION E1 — Sleep Tuning Settings Helpers

        #region SECTION E2A — Trainer XP Debug UI
        private void EnsureTrainerXpDebugUiBuilt()
        {
            if (_trainerXpUiBuilt)
                return;

            if (SleepMultiplierText?.Parent is not StackPanel root)
                return;

            int sleepMultiplierIndex = root.Children.IndexOf(SleepMultiplierText);
            if (sleepMultiplierIndex < 0)
                return;

            int insertAt = sleepMultiplierIndex + 1;

            var header = new TextBlock
            {
                Text = "Trainer XP / Level",
                FontWeight = FontWeights.Bold,
                Margin = new Thickness(0, 10, 0, 0)
            };

            _trainerLevelText = new TextBlock
            {
                Margin = new Thickness(0, 6, 0, 0)
            };

            _trainerProgressText = new TextBlock
            {
                Foreground = System.Windows.Media.Brushes.Gray,
                Margin = new Thickness(0, 2, 0, 0)
            };

            _trainerSelectedDayXpText = new TextBlock
            {
                Foreground = System.Windows.Media.Brushes.Gray,
                Margin = new Thickness(0, 2, 0, 0)
            };

            var settingsColumn = new StackPanel
            {
                Orientation = Orientation.Vertical,
                Margin = new Thickness(0, 8, 0, 0)
            };

            var xpPerMinuteRow = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                Margin = new Thickness(0, 0, 0, 6)
            };

            xpPerMinuteRow.Children.Add(new TextBlock
            {
                Text = "Focus Session XP per Minute:",
                Width = 220,
                VerticalAlignment = VerticalAlignment.Center
            });

            _focusXpPerMinuteBox = new TextBox
            {
                Width = 70
            };
            xpPerMinuteRow.Children.Add(_focusXpPerMinuteBox);

            var incompleteMultiplierRow = new StackPanel
            {
                Orientation = Orientation.Horizontal
            };

            incompleteMultiplierRow.Children.Add(new TextBlock
            {
                Text = "Incomplete Session Multiplier:",
                Width = 220,
                VerticalAlignment = VerticalAlignment.Center
            });

            _focusXpIncompleteMultiplierBox = new TextBox
            {
                Width = 70
            };
            incompleteMultiplierRow.Children.Add(_focusXpIncompleteMultiplierBox);

            settingsColumn.Children.Add(xpPerMinuteRow);
            settingsColumn.Children.Add(incompleteMultiplierRow);

            var settingsButtonRow = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                Margin = new Thickness(0, 8, 0, 0)
            };

            var saveButton = new Button
            {
                Content = "Save XP Settings",
                Width = 130,
                Margin = new Thickness(0, 0, 8, 0),
                HorizontalAlignment = HorizontalAlignment.Left
            };
            saveButton.Click += SaveTrainerXpSettingsButton_Click;

            var resetButton = new Button
            {
                Content = "Reset XP Settings",
                Width = 130,
                HorizontalAlignment = HorizontalAlignment.Left
            };
            resetButton.Click += ResetTrainerXpSettingsButton_Click;

            settingsButtonRow.Children.Add(saveButton);
            settingsButtonRow.Children.Add(resetButton);

            var debugButtonRow1 = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                Margin = new Thickness(0, 8, 0, 0)
            };

            _trainerPrestigeResetButton = new Button
            {
                Content = "Prestige Reset (+1 Star)",
                Width = 180,
                IsEnabled = false,
                Margin = new Thickness(0, 0, 8, 0),
                HorizontalAlignment = HorizontalAlignment.Left
            };
            _trainerPrestigeResetButton.Click += PrestigeResetButton_Click;

            var resetLevelButton = new Button
            {
                Content = "Reset to Level 1",
                Width = 140,
                HorizontalAlignment = HorizontalAlignment.Left
            };
            resetLevelButton.Click += ResetTrainerLevelButton_Click;

            debugButtonRow1.Children.Add(_trainerPrestigeResetButton);
            debugButtonRow1.Children.Add(resetLevelButton);

            var debugButtonRow2 = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                Margin = new Thickness(0, 8, 0, 0)
            };

            var resetPrestigeButton = new Button
            {
                Content = "Reset Prestige to 0",
                Width = 150,
                Margin = new Thickness(0, 0, 8, 0),
                HorizontalAlignment = HorizontalAlignment.Left
            };
            resetPrestigeButton.Click += ResetTrainerPrestigeButton_Click;

            var resetLifetimeXpButton = new Button
            {
                Content = "Reset Lifetime XP",
                Width = 150,
                HorizontalAlignment = HorizontalAlignment.Left
            };
            resetLifetimeXpButton.Click += ResetTrainerLifetimeXpButton_Click;

            debugButtonRow2.Children.Add(resetPrestigeButton);
            debugButtonRow2.Children.Add(resetLifetimeXpButton);

            var note = new TextBlock
            {
                Text = "Cycle XP drives Lv 1–100. Lifetime trainer XP keeps counting separately,\neven at level 100.\nPrestige Reset (+1 Star) only works at level 100.\nDebug reset buttons do not rewrite the reward ledger.",
                Foreground = System.Windows.Media.Brushes.Gray,
                Margin = new Thickness(0, 6, 0, 0),
                MaxWidth = 520,
                HorizontalAlignment = HorizontalAlignment.Left,
                TextAlignment = TextAlignment.Left,
                TextWrapping = TextWrapping.Wrap
            };

            root.Children.Insert(insertAt++, header);
            root.Children.Insert(insertAt++, _trainerLevelText);
            root.Children.Insert(insertAt++, _trainerProgressText);
            root.Children.Insert(insertAt++, _trainerSelectedDayXpText);
            root.Children.Insert(insertAt++, settingsColumn);
            root.Children.Insert(insertAt++, settingsButtonRow);
            root.Children.Insert(insertAt++, debugButtonRow1);
            root.Children.Insert(insertAt++, debugButtonRow2);
            root.Children.Insert(insertAt++, note);

            _trainerXpUiBuilt = true;
        }
        #endregion // SECTION E2A — Trainer XP Debug UI

        #region SECTION E2B — Sleep Tuning Debug UI
        private void EnsureSleepSettingsDebugUiBuilt()
        {
            if (_sleepSettingsUiBuilt)
                return;

            if (StepsPerRollBox?.Parent is not StackPanel itemDropRow)
                return;

            if (itemDropRow.Parent is not StackPanel root)
                return;

            int itemDropRowIndex = root.Children.IndexOf(itemDropRow);
            if (itemDropRowIndex < 0)
                return;

            int insertAt = Math.Max(0, itemDropRowIndex - 1);

            var header = new TextBlock
            {
                Text = "Sleep tuning",
                FontWeight = FontWeights.Bold,
                Margin = new Thickness(0, 10, 0, 0)
            };

            var contentRow = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                Margin = new Thickness(0, 6, 0, 0)
            };

            var leftColumn = new StackPanel
            {
                Orientation = Orientation.Vertical,
                Margin = new Thickness(0, 0, 28, 0)
            };

            var rightColumn = new StackPanel
            {
                Orientation = Orientation.Vertical,
                Margin = new Thickness(0, 0, 0, 0)
            };

            var row1 = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                Margin = new Thickness(0, 0, 0, 6)
            };

            row1.Children.Add(new TextBlock
            {
                Text = "Healthy Minimum Hours:",
                Width = 220,
                VerticalAlignment = VerticalAlignment.Center
            });

            _sleepHealthyMinHoursBox = new TextBox
            {
                Width = 60
            };
            row1.Children.Add(_sleepHealthyMinHoursBox);

            var row2 = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                Margin = new Thickness(0, 0, 0, 6)
            };

            row2.Children.Add(new TextBlock
            {
                Text = "Healthy Maximum Hours:",
                Width = 220,
                VerticalAlignment = VerticalAlignment.Center
            });

            _sleepHealthyMaxHoursBox = new TextBox
            {
                Width = 60
            };
            row2.Children.Add(_sleepHealthyMaxHoursBox);

            var row3 = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                Margin = new Thickness(0, 0, 0, 6)
            };

            row3.Children.Add(new TextBlock
            {
                Text = "Sleep Multiplier Max/Healthy:",
                Width = 220,
                VerticalAlignment = VerticalAlignment.Center
            });

            _sleepHealthyMultiplierBox = new TextBox
            {
                Width = 60
            };
            row3.Children.Add(_sleepHealthyMultiplierBox);

            var row4 = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                Margin = new Thickness(0, 0, 0, 6)
            };

            row4.Children.Add(new TextBlock
            {
                Text = "Multiplier Minimum / 15 minutes:",
                Width = 220,
                VerticalAlignment = VerticalAlignment.Center
            });

            _sleepPenaltyPer15MinBox = new TextBox
            {
                Width = 60
            };
            row4.Children.Add(_sleepPenaltyPer15MinBox);

            var row5 = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                Margin = new Thickness(0, 0, 0, 6)
            };

            row5.Children.Add(new TextBlock
            {
                Text = "Sleep Multiplier Min/Unhealthy:",
                Width = 220,
                VerticalAlignment = VerticalAlignment.Center
            });

            _sleepTrackedMinimumMultiplierBox = new TextBox
            {
                Width = 60
            };
            row5.Children.Add(_sleepTrackedMinimumMultiplierBox);

            var row6 = new StackPanel
            {
                Orientation = Orientation.Horizontal
            };

            row6.Children.Add(new TextBlock
            {
                Text = "Minimum Sleep Minutes for Reward-Eligibility:",
                Width = 220,
                VerticalAlignment = VerticalAlignment.Center,
                TextWrapping = TextWrapping.Wrap
            });

            _sleepRewardMinimumMinutesBox = new TextBox
            {
                Width = 60
            };
            row6.Children.Add(_sleepRewardMinimumMinutesBox);

            leftColumn.Children.Add(row1);
            leftColumn.Children.Add(row2);
            leftColumn.Children.Add(row3);
            leftColumn.Children.Add(row4);
            leftColumn.Children.Add(row5);
            leftColumn.Children.Add(row6);

            var previewHeader = new TextBlock
            {
                Text = "Preview",
                FontWeight = FontWeights.Bold,
                Margin = new Thickness(0, 0, 0, 6)
            };

            _sleepPreview5hText = new TextBlock
            {
                Margin = new Thickness(0, 0, 0, 4),
                Foreground = System.Windows.Media.Brushes.Gray
            };

            _sleepPreview8hText = new TextBlock
            {
                Margin = new Thickness(0, 0, 0, 4),
                Foreground = System.Windows.Media.Brushes.Gray
            };

            _sleepPreview11hText = new TextBlock
            {
                Margin = new Thickness(0, 0, 0, 4),
                Foreground = System.Windows.Media.Brushes.Gray
            };

            _sleepPreview24hText = new TextBlock
            {
                Margin = new Thickness(0, 0, 0, 4),
                Foreground = System.Windows.Media.Brushes.Gray
            };

            rightColumn.Children.Add(previewHeader);
            rightColumn.Children.Add(_sleepPreview5hText);
            rightColumn.Children.Add(_sleepPreview8hText);
            rightColumn.Children.Add(_sleepPreview11hText);
            rightColumn.Children.Add(_sleepPreview24hText);

            contentRow.Children.Add(leftColumn);
            contentRow.Children.Add(rightColumn);

            var buttonRow = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                Margin = new Thickness(0, 8, 0, 0)
            };

            var saveButton = new Button
            {
                Content = "Save sleep tuning",
                Width = 140,
                Margin = new Thickness(0, 0, 8, 0),
                HorizontalAlignment = HorizontalAlignment.Left
            };
            saveButton.Click += SaveSleepTuningButton_Click;

            var resetButton = new Button
            {
                Content = "Reset sleep values",
                Width = 140,
                HorizontalAlignment = HorizontalAlignment.Left
            };
            resetButton.Click += ResetSleepTuningButton_Click;

            buttonRow.Children.Add(saveButton);
            buttonRow.Children.Add(resetButton);

            var note = new TextBlock
            {
                Text = "Largest qualifying session is treated as the main sleep.\nUp to 2 more qualifying sessions can catch you up\nto the healthy maximum, but they do not add extra oversleep penalty.\nSave stores your custom values. Reset restores the stable defaults.",
                Foreground = System.Windows.Media.Brushes.Gray,
                Margin = new Thickness(0, 6, 0, 0),
                MaxWidth = 520,
                HorizontalAlignment = HorizontalAlignment.Left,
                TextAlignment = TextAlignment.Left,
                TextWrapping = TextWrapping.Wrap
            };

            root.Children.Insert(insertAt++, header);
            root.Children.Insert(insertAt++, contentRow);
            root.Children.Insert(insertAt++, buttonRow);
            root.Children.Insert(insertAt++, note);

            _sleepSettingsUiBuilt = true;
        }
        #endregion // SECTION E2B — Sleep Tuning Debug UI

        #region SECTION E2C — Weekly Bonuses Debug UI
        private void EnsureWeeklyBonusesDebugUiBuilt()
        {
            if (_weeklyBonusesUiBuilt)
                return;

            if (StepsPerRollBox?.Parent is not StackPanel itemDropRow)
                return;

            if (itemDropRow.Parent is not StackPanel root)
                return;

            int itemDropRowIndex = root.Children.IndexOf(itemDropRow);
            if (itemDropRowIndex < 0)
                return;

            int insertAt = itemDropRowIndex;

            var header = new TextBlock
            {
                Text = "Weekly Bonuses",
                FontWeight = FontWeights.Bold,
                Margin = new Thickness(0, 10, 0, 0)
            };

            var settingsColumn = new StackPanel
            {
                Orientation = Orientation.Vertical,
                Margin = new Thickness(0, 6, 0, 0)
            };

            StackPanel BuildRow(string label, out TextBox box, string suffix)
            {
                var row = new StackPanel
                {
                    Orientation = Orientation.Horizontal,
                    Margin = new Thickness(0, 0, 0, 6)
                };

                row.Children.Add(new TextBlock
                {
                    Text = label,
                    Width = 220,
                    VerticalAlignment = VerticalAlignment.Center,
                    TextWrapping = TextWrapping.Wrap
                });

                box = new TextBox
                {
                    Width = 70,
                    Margin = new Thickness(0, 0, 8, 0)
                };
                row.Children.Add(box);

                row.Children.Add(new TextBlock
                {
                    Text = suffix,
                    Foreground = System.Windows.Media.Brushes.Gray,
                    VerticalAlignment = VerticalAlignment.Center
                });

                return row;
            }

            settingsColumn.Children.Add(BuildRow("Weekly Sleep Tracking Bonus:", out var weeklySleepTrackingBonusBox, "tickets"));
            settingsColumn.Children.Add(BuildRow("Weekly Habit Tracking Bonus:", out var weeklyHabitTrackingBonusBox, "tickets"));
            settingsColumn.Children.Add(BuildRow("Daily Steps Goal:", out var dailyStepsGoalBox, "steps"));
            settingsColumn.Children.Add(BuildRow("Daily Steps Goal Quota:", out var dailyStepsGoalQuotaBox, "days"));
            settingsColumn.Children.Add(BuildRow("Weekly Steps Tracking Bonus:", out var weeklyStepsTrackingBonusBox, "tickets"));

            _weeklySleepTrackingBonusBox = weeklySleepTrackingBonusBox;
            _weeklyHabitTrackingBonusBox = weeklyHabitTrackingBonusBox;
            _dailyStepsGoalBox = dailyStepsGoalBox;
            _dailyStepsGoalQuotaBox = dailyStepsGoalQuotaBox;
            _weeklyStepsTrackingBonusBox = weeklyStepsTrackingBonusBox;

            var buttonRow = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                Margin = new Thickness(0, 8, 0, 0)
            };

            var saveButton = new Button
            {
                Content = "Save weekly bonuses",
                Width = 150,
                Margin = new Thickness(0, 0, 8, 0),
                HorizontalAlignment = HorizontalAlignment.Left
            };
            saveButton.Click += SaveWeeklyBonusesButton_Click;

            var resetButton = new Button
            {
                Content = "Reset weekly bonuses",
                Width = 150,
                HorizontalAlignment = HorizontalAlignment.Left
            };
            resetButton.Click += ResetWeeklyBonusesButton_Click;

            buttonRow.Children.Add(saveButton);
            buttonRow.Children.Add(resetButton);

            var note = new TextBlock
            {
                Text = "This first foundation checks the most recently completed week only.\nSleep bonus needs all 7 days with reward-eligible sleep.\nSteps bonus needs Daily Steps Goal met on the Daily Steps Goal Quota number of days.",
                Foreground = System.Windows.Media.Brushes.Gray,
                Margin = new Thickness(0, 6, 0, 0),
                MaxWidth = 520,
                HorizontalAlignment = HorizontalAlignment.Left,
                TextAlignment = TextAlignment.Left,
                TextWrapping = TextWrapping.Wrap
            };

            root.Children.Insert(insertAt++, header);
            root.Children.Insert(insertAt++, settingsColumn);
            root.Children.Insert(insertAt++, buttonRow);
            root.Children.Insert(insertAt++, note);

            _weeklyBonusesUiBuilt = true;
        }
        #endregion // SECTION E2C — Weekly Bonuses Debug UI

        #region SECTION E2D — Weekly Bonus Settings Helpers
        private sealed class WeeklyBonusSettings
        {
            public int WeeklySleepTrackingBonus { get; set; } = 7;
            public int WeeklyHabitTrackingBonus { get; set; } = 3;
            public int DailyStepsGoal { get; set; } = 10000;
            public int DailyStepsGoalQuota { get; set; } = 5;
            public int WeeklyStepsTrackingBonus { get; set; } = 5;
        }

        private static WeeklyBonusSettings BuildDefaultWeeklyBonusSettings()
        {
            return new WeeklyBonusSettings
            {
                WeeklySleepTrackingBonus = 7,
                WeeklyHabitTrackingBonus = 3,
                DailyStepsGoal = 10000,
                DailyStepsGoalQuota = 5,
                WeeklyStepsTrackingBonus = 5
            };
        }

        private static WeeklyBonusSettings NormalizeWeeklyBonusSettings(WeeklyBonusSettings settings)
        {
            return new WeeklyBonusSettings
            {
                WeeklySleepTrackingBonus = Math.Max(0, settings.WeeklySleepTrackingBonus),
                WeeklyHabitTrackingBonus = Math.Max(0, settings.WeeklyHabitTrackingBonus),
                DailyStepsGoal = Math.Max(1, settings.DailyStepsGoal),
                DailyStepsGoalQuota = Math.Clamp(settings.DailyStepsGoalQuota, 1, 7),
                WeeklyStepsTrackingBonus = Math.Max(0, settings.WeeklyStepsTrackingBonus)
            };
        }

        private async Task SaveWeeklyBonusSettingsAsync(WeeklyBonusSettings settings)
        {
            settings = NormalizeWeeklyBonusSettings(settings);

            await _gamiSettingsRepo.UpdateWeeklyBonusSettingsAsync(
                settings.WeeklySleepTrackingBonus,
                settings.WeeklyHabitTrackingBonus,
                settings.DailyStepsGoal,
                settings.DailyStepsGoalQuota,
                settings.WeeklyStepsTrackingBonus);
        }

        private async void SaveWeeklyBonusesButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (_weeklySleepTrackingBonusBox == null ||
                    _weeklyHabitTrackingBonusBox == null ||
                    _dailyStepsGoalBox == null ||
                    _dailyStepsGoalQuotaBox == null ||
                    _weeklyStepsTrackingBonusBox == null)
                {
                    MessageBox.Show("Weekly bonus controls are not ready yet.");
                    return;
                }

                if (!int.TryParse((_weeklySleepTrackingBonusBox.Text ?? "").Trim(), out int weeklySleepTrackingBonus) || weeklySleepTrackingBonus < 0)
                {
                    MessageBox.Show("Weekly Sleep Tracking Bonus must be a whole number greater than or equal to 0.");
                    return;
                }

                if (!int.TryParse((_weeklyHabitTrackingBonusBox.Text ?? "").Trim(), out int weeklyHabitTrackingBonus) || weeklyHabitTrackingBonus < 0)
                {
                    MessageBox.Show("Weekly Habit Tracking Bonus must be a whole number greater than or equal to 0.");
                    return;
                }

                if (!int.TryParse((_dailyStepsGoalBox.Text ?? "").Trim(), out int dailyStepsGoal) || dailyStepsGoal < 1)
                {
                    MessageBox.Show("Daily Steps Goal must be a whole number greater than or equal to 1.");
                    return;
                }

                if (!int.TryParse((_dailyStepsGoalQuotaBox.Text ?? "").Trim(), out int dailyStepsGoalQuota) || dailyStepsGoalQuota < 1 || dailyStepsGoalQuota > 7)
                {
                    MessageBox.Show("Daily Steps Goal Quota must be a whole number between 1 and 7.");
                    return;
                }

                if (!int.TryParse((_weeklyStepsTrackingBonusBox.Text ?? "").Trim(), out int weeklyStepsTrackingBonus) || weeklyStepsTrackingBonus < 0)
                {
                    MessageBox.Show("Weekly Steps Tracking Bonus must be a whole number greater than or equal to 0.");
                    return;
                }

                await SaveWeeklyBonusSettingsAsync(new WeeklyBonusSettings
                {
                    WeeklySleepTrackingBonus = weeklySleepTrackingBonus,
                    WeeklyHabitTrackingBonus = weeklyHabitTrackingBonus,
                    DailyStepsGoal = dailyStepsGoal,
                    DailyStepsGoalQuota = dailyStepsGoalQuota,
                    WeeklyStepsTrackingBonus = weeklyStepsTrackingBonus
                });

                await RefreshForSelectedDateAsync();

                MessageBox.Show("Saved weekly bonus settings.");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not save weekly bonus settings");
            }
        }

        private async void ResetWeeklyBonusesButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var defaults = BuildDefaultWeeklyBonusSettings();

                await SaveWeeklyBonusSettingsAsync(defaults);
                await RefreshForSelectedDateAsync();

                MessageBox.Show("Reset weekly bonus settings to defaults.");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not reset weekly bonus settings");
            }
        }
        #endregion // SECTION E2D — Weekly Bonus Settings Helpers

        #region SECTION E3 — Main Refresh Pipeline
        private async Task RefreshForSelectedDateAsync()
        {
            try
            {
                // Focus sessions
                var focus = await _repo.GetForDateAsync(SelectedLogDate);
                _focusSessions = new ObservableCollection<FocusSession>(focus);
                FocusSessionsGrid.ItemsSource = _focusSessions;

                // Food entries
                var food = await _foodEntryRepo.GetForDateAsync(SelectedLogDate);
                _foodEntries = new ObservableCollection<FoodEntry>(food);
                FoodEntriesGrid.ItemsSource = _foodEntries;

                // Sleep sessions
                var sleeps = await _sleepRepo.GetForWakeDateAsync(SelectedLogDate);
                _sleepSessions = new ObservableCollection<SleepSession>(sleeps);
                SleepSessionsGrid.ItemsSource = _sleepSessions;

                await RefreshPendingSleepTextAsync();

                // Steps + Habits (time-travel aware)
                await RefreshStepsAndHabitsAsync();

                // Gamification debug (includes item-drops + inventory + item defs)
                await RefreshGamificationDebugAsync();

                // Auto-fit (once)
                FitSelectedTabColumnsOnce();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Refresh failed");
            }
        }

        private async Task RefreshPendingSleepTextAsync()
        {
            if (PendingSleepText == null)
                return;

            try
            {
                var pending = await _sleepRepo.GetPendingStartUtcAsync();

                if (!pending.HasValue)
                {
                    PendingSleepText.Text = "Pending: none";
                    return;
                }

                var local = pending.Value.ToLocalTime();
                PendingSleepText.Text = $"Pending: started {local:yyyy-MM-dd HH:mm}";
            }
            catch
            {
                PendingSleepText.Text = "Pending: (error loading)";
            }
        }

        private static DateOnly GetCurrentGameDayLocal(DateTimeOffset nowLocal)
        {
            return SleepRewardCalculator.GetGameDayForWakeLocal(nowLocal.LocalDateTime);
        }

        private static string FormatMinutes(int totalMinutes)
        {
            if (totalMinutes <= 0) return "0m";

            int h = totalMinutes / 60;
            int m = totalMinutes % 60;

            if (h <= 0) return $"{m}m";
            if (m == 0) return $"{h}h";
            return $"{h}h {m}m";
        }

        #endregion // SECTION E3 — Main Refresh Pipeline

        #region SECTION E4 — Gamification + Item Drop Debug Refresh
        private async Task RefreshGamificationDebugAsync()
        {
            EnsureTrainerXpDebugUiBuilt();
            EnsureSleepSettingsDebugUiBuilt();
            EnsureWeeklyBonusesDebugUiBuilt();

            UpdateLiveClockText();

            try
            {
                await _weeklyBonusesService.GrantMostRecentCompletedWeekAsync();
            }
            catch
            {
                // Keep the rest of the refresh usable even if weekly bonus evaluation fails.
            }

            int selectedDayCoins = 0;
            int selectedDayTickets = 0;
            int selectedDayTrainerXp = 0;

            try
            {
                var entries = await _rewardsRepo.GetForGameDayAsync(SelectedLogDate);

                foreach (var e in entries)
                {
                    if (e.RewardType == RewardType.FocusCoins) selectedDayCoins += e.Amount;
                    else if (IsTicketRewardType(e.RewardType)) selectedDayTickets += e.Amount;
                    else if (e.RewardType == RewardType.TrainerXp) selectedDayTrainerXp += e.Amount;
                }

                if (RewardsSummaryText != null)
                {
                    RewardsSummaryText.Text =
                        $"Selected day rewards ({SelectedLogDate:yyyy-MM-dd}): {selectedDayCoins} coins, {selectedDayTickets} tickets, {selectedDayTrainerXp} XP | Ledger entries: {entries.Count}";
                }
            }
            catch (Exception ex)
            {
                if (RewardsSummaryText != null)
                    RewardsSummaryText.Text = $"Selected day rewards ({SelectedLogDate:yyyy-MM-dd}): (error loading) {ex.Message}";
            }

            if (_trainerSelectedDayXpText != null)
                _trainerSelectedDayXpText.Text = $"Selected day trainer XP: {selectedDayTrainerXp:#,0}";

            try
            {
                var gamiSettings = await _gamiSettingsRepo.GetAsync();

                SetTextBoxIfIdle(_focusXpPerMinuteBox, FormatDoubleForBox(gamiSettings.FocusXpPerMinute));
                SetTextBoxIfIdle(_focusXpIncompleteMultiplierBox, FormatDoubleForBox(gamiSettings.FocusXpIncompleteMultiplier));
                SetTextBoxIfIdle(_weeklySleepTrackingBonusBox, gamiSettings.WeeklySleepTrackingBonus.ToString(CultureInfo.InvariantCulture));
                SetTextBoxIfIdle(_weeklyHabitTrackingBonusBox, gamiSettings.WeeklyHabitTrackingBonus.ToString(CultureInfo.InvariantCulture));
                SetTextBoxIfIdle(_dailyStepsGoalBox, gamiSettings.DailyStepsGoal.ToString(CultureInfo.InvariantCulture));
                SetTextBoxIfIdle(_dailyStepsGoalQuotaBox, gamiSettings.DailyStepsGoalQuota.ToString(CultureInfo.InvariantCulture));
                SetTextBoxIfIdle(_weeklyStepsTrackingBonusBox, gamiSettings.WeeklyStepsTrackingBonus.ToString(CultureInfo.InvariantCulture));
            }
            catch (Exception ex)
            {
                if (_trainerProgressText != null && string.IsNullOrWhiteSpace(_trainerProgressText.Text))
                    _trainerProgressText.Text = $"XP settings load failed: {ex.Message}";
            }

            try
            {
                var sleepSettings = await GetSleepTuningSettingsAsync();

                SetTextBoxIfIdle(_sleepHealthyMinHoursBox, FormatDoubleForBox(sleepSettings.SleepHealthyMinHours));
                SetTextBoxIfIdle(_sleepHealthyMaxHoursBox, FormatDoubleForBox(sleepSettings.SleepHealthyMaxHours));
                SetTextBoxIfIdle(_sleepHealthyMultiplierBox, FormatDoubleForBox(sleepSettings.SleepHealthyMultiplier));
                SetTextBoxIfIdle(_sleepPenaltyPer15MinBox, FormatDoubleForBox(sleepSettings.SleepPenaltyPer15Min));
                SetTextBoxIfIdle(_sleepTrackedMinimumMultiplierBox, FormatDoubleForBox(sleepSettings.SleepTrackedMinimumMultiplier));
                SetTextBoxIfIdle(_sleepRewardMinimumMinutesBox, sleepSettings.SleepRewardMinimumMinutes.ToString(CultureInfo.InvariantCulture));

                if (_sleepPreview5hText != null)
                    _sleepPreview5hText.Text = BuildSleepPreviewText(sleepSettings, 5 * 60);

                if (_sleepPreview8hText != null)
                    _sleepPreview8hText.Text = BuildSleepPreviewText(sleepSettings, 8 * 60);

                if (_sleepPreview11hText != null)
                    _sleepPreview11hText.Text = BuildSleepPreviewText(sleepSettings, 11 * 60);

                if (_sleepPreview24hText != null)
                    _sleepPreview24hText.Text = BuildSleepPreviewText(sleepSettings, 24 * 60);

                var sleeps = await _sleepRepo.GetForWakeDateAsync(SelectedLogDate);
                var orderedSleepDurations = sleeps
                    .OrderBy(s => s.EndUtc)
                    .ThenBy(s => s.StartUtc)
                    .Select(s => Math.Max(0, s.DurationMinutes))
                    .ToList();

                var sleepSummary = BuildSleepRewardSummary(sleepSettings, orderedSleepDurations);

                if (SleepMultiplierText != null)
                    SleepMultiplierText.Text = BuildSleepStatusText(sleepSummary);

                if (SleepTotalText != null)
                    SleepTotalText.Text = BuildSleepSessionsSummaryText(sleepSummary);
            }
            catch (Exception ex)
            {
                if (_sleepPreview5hText != null) _sleepPreview5hText.Text = $"Sleep settings load failed: {ex.Message}";
                if (_sleepPreview8hText != null) _sleepPreview8hText.Text = "";
                if (_sleepPreview11hText != null) _sleepPreview11hText.Text = "";
                if (_sleepPreview24hText != null) _sleepPreview24hText.Text = "";
                if (SleepMultiplierText != null) SleepMultiplierText.Text = "Sleep multiplier: (error loading)";
                if (SleepTotalText != null) SleepTotalText.Text = "Sleep summary: (error loading)";
            }

            try
            {
                var trainerProgress = await _rewardsRepo.GetTrainerProgressAsync();

                if (_trainerLevelText != null)
                    _trainerLevelText.Text = BuildTrainerLevelLine(trainerProgress);

                if (_trainerProgressText != null)
                    _trainerProgressText.Text = BuildTrainerProgressLine(trainerProgress);

                if (_trainerPrestigeResetButton != null)
                    _trainerPrestigeResetButton.IsEnabled = trainerProgress.IsMaxLevel;
            }
            catch (Exception ex)
            {
                if (_trainerLevelText != null)
                    _trainerLevelText.Text = "Trainer progress: (error loading)";

                if (_trainerProgressText != null)
                    _trainerProgressText.Text = ex.Message;

                if (_trainerPrestigeResetButton != null)
                    _trainerPrestigeResetButton.IsEnabled = false;
            }

            await RefreshItemDropsDebugAsync();
        }

        private async Task RefreshItemDropsDebugAsync()
        {
            try
            {
                var settings = await _gamiSettingsRepo.GetAsync();
                var state = await _rollStateRepo.GetAsync();
                var items = await _inventoryRepo.GetAllAsync();
                var itemDefinitions = await _itemDefsRepo.GetAllAsync();

                int stepsPerRoll = Math.Max(1, settings.StepsPerItemRoll);
                int oneInN = Math.Max(1, settings.ItemRollOneInN);
                int remainder = state.StepsRemainder;

                if (remainder < 0) remainder = 0;
                if (remainder >= stepsPerRoll) remainder %= stepsPerRoll;

                int toNext = stepsPerRoll - remainder;

                if (StepsPerRollBox != null && !StepsPerRollBox.IsKeyboardFocusWithin)
                    StepsPerRollBox.Text = settings.StepsPerItemRoll.ToString(CultureInfo.InvariantCulture);

                if (OddsOneInBox != null && !OddsOneInBox.IsKeyboardFocusWithin)
                    OddsOneInBox.Text = settings.ItemRollOneInN.ToString(CultureInfo.InvariantCulture);

                if (CommonWeightBox != null && !CommonWeightBox.IsKeyboardFocusWithin)
                    CommonWeightBox.Text = settings.CommonTierWeight.ToString(CultureInfo.InvariantCulture);

                if (UncommonWeightBox != null && !UncommonWeightBox.IsKeyboardFocusWithin)
                    UncommonWeightBox.Text = settings.UncommonTierWeight.ToString(CultureInfo.InvariantCulture);

                if (RareWeightBox != null && !RareWeightBox.IsKeyboardFocusWithin)
                    RareWeightBox.Text = settings.RareTierWeight.ToString(CultureInfo.InvariantCulture);

                if (ItemDropsProgressText != null)
                    ItemDropsProgressText.Text = $"Steps remainder: {remainder}/{stepsPerRoll} | Steps to next roll: {toNext}";

                if (ItemDropsStatsText != null)
                    ItemDropsStatsText.Text = $"Roll chance: 1 in {oneInN} ({(100.0 / oneInN):0.##}%) | Rolls: {state.TotalRolls} | Successes: {state.TotalSuccesses}";

                if (ItemDropsLastText != null)
                {
                    string lastDrop = string.IsNullOrWhiteSpace(state.LastDropSummary)
                        ? "Last drop: none yet"
                        : $"Last drop: {state.LastDropSummary}";
                    ItemDropsLastText.Text = lastDrop;
                }

                _inventoryItems = new ObservableCollection<InventoryItem>(items.OrderBy(x => x.ItemKey));
                if (InventoryGrid != null)
                    InventoryGrid.ItemsSource = _inventoryItems;

                _itemDefinitions = new ObservableCollection<ItemDefinition>(itemDefinitions
                    .OrderBy(x => x.Tier)
                    .ThenBy(x => x.Name));

                if (ItemDefinitionsGrid != null)
                    ItemDefinitionsGrid.ItemsSource = _itemDefinitions;

                if (InventoryCountText != null)
                {
                    int totalCount = _inventoryItems.Sum(x => Math.Max(0, x.Count));
                    InventoryCountText.Text = $"Inventory ({totalCount} total)";
                }

                if (ItemDefinitionsGrid != null)
                    AutoFitGridColumns(ItemDefinitionsGrid);

                if (InventoryGrid != null)
                    AutoFitGridColumns(InventoryGrid);
            }
            catch (Exception ex)
            {
                if (ItemDropsProgressText != null)
                    ItemDropsProgressText.Text = $"Item drops: (error loading) {ex.Message}";

                if (ItemDropsStatsText != null)
                    ItemDropsStatsText.Text = "";

                if (ItemDropsLastText != null)
                    ItemDropsLastText.Text = "";
            }
        }
        #endregion // SECTION E4 — Gamification + Item Drop Debug Refresh

        #region SECTION F — Food Actions
        private async Task RefreshFoodMenuAsync()
        {
            var items = await _foodItemRepo.GetAllAsync();
            FoodCombo.ItemsSource = items;

            if (FoodCombo.SelectedIndex < 0 && items.Count > 0)
                FoodCombo.SelectedIndex = 0;
        }

        private async void RefreshFoodMenuButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                await RefreshFoodMenuAsync();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not refresh menu");
            }
        }

        private async void AddFoodToMenuButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                string name = (NewFoodNameBox.Text ?? "").Trim();
                string servingLabel = (NewFoodServingLabelBox.Text ?? "").Trim();

                if (!double.TryParse((NewFoodKjPerServingBox.Text ?? "").Trim(), out double kjPerServing) || kjPerServing <= 0)
                {
                    MessageBox.Show("kJ per serving must be a number greater than 0.");
                    return;
                }

                double? kjPer100g = null;
                string kj100Text = (NewFoodKjPer100gBox.Text ?? "").Trim();

                if (!string.IsNullOrWhiteSpace(kj100Text))
                {
                    if (!double.TryParse(kj100Text, out double kj100Parsed) || kj100Parsed <= 0)
                    {
                        MessageBox.Show("kJ per 100g must be blank or a number greater than 0.");
                        return;
                    }

                    kjPer100g = kj100Parsed;
                }

                var item = new FoodItem
                {
                    Name = name,
                    KjPerServing = kjPerServing,
                    ServingLabel = servingLabel,
                    KjPer100g = kjPer100g
                };

                await _foodItemRepo.AddAsync(item);

                NewFoodNameBox.Text = "";
                NewFoodKjPerServingBox.Text = "";
                NewFoodServingLabelBox.Text = "";
                NewFoodKjPer100gBox.Text = "";

                await RefreshFoodMenuAsync();

                MessageBox.Show("Food added to menu.");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not add food");
            }
        }

        private async void AddFoodEntryButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (FoodCombo.SelectedItem is not FoodItem selected)
                {
                    MessageBox.Show("Pick a food from the menu first.");
                    return;
                }

                double? servings = null;
                int? grams = null;

                string servingsText = (FoodServingsBox.Text ?? "").Trim();
                if (!string.IsNullOrWhiteSpace(servingsText))
                {
                    if (!double.TryParse(servingsText, out double s) || s <= 0)
                    {
                        MessageBox.Show("Servings must be blank or a number greater than 0.");
                        return;
                    }

                    servings = s;
                }

                string gramsText = (FoodGramsBox.Text ?? "").Trim();
                if (!string.IsNullOrWhiteSpace(gramsText))
                {
                    if (!int.TryParse(gramsText, out int g) || g <= 0)
                    {
                        MessageBox.Show("Grams must be blank or a whole number greater than 0.");
                        return;
                    }

                    grams = g;
                }

                await _foodEntryRepo.AddAsync(SelectedLogDate, selected.Id, servings, grams);

                FoodServingsBox.Text = "";
                FoodGramsBox.Text = "";

                await RefreshForSelectedDateAsync();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not add food entry");
            }
        }

        private async void ViewFoodMenuButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var win = new FoodMenuWindow { Owner = this };
                win.ShowDialog();
                await RefreshFoodMenuAsync();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not open food menu editor");
            }
        }

        private async void StartSleepNow_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var pending = await _sleepRepo.GetPendingStartUtcAsync();
                if (pending.HasValue)
                {
                    var local = pending.Value.ToLocalTime();
                    MessageBox.Show($"Sleep already started at {local:yyyy-MM-dd HH:mm}.", "Sleep already started");
                    return;
                }

                await _sleepRepo.SetPendingStartUtcAsync(DateTimeOffset.UtcNow);
                await RefreshForSelectedDateAsync();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not start sleep");
            }
        }

        private async void EndSleepNow_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                await _sleepRepo.EndSleepNowAsync();
                await RefreshForSelectedDateAsync();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not end sleep");
            }
        }


        #endregion // SECTION F — Food Actions

        #region SECTION G1 — Data Backup / Import Actions
        private async void BackupEverythingButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                string? folder = PickFolder("Choose a folder to save the backup into");
                if (string.IsNullOrWhiteSpace(folder))
                    return;

                string stamp = DateTime.Now.ToString("yyyy-MM-dd_HHmm");
                string backupRoot = Path.Combine(folder, $"LifestylesBackup_{stamp}");
                Directory.CreateDirectory(backupRoot);

                string snapshotPath = Path.Combine(backupRoot, $"Full App Snapshot - {stamp}.db");
                string archiveRoot = Path.Combine(backupRoot, "Database Archive");
                string gamificationPath = Path.Combine(backupRoot, $"Gamification Data - {stamp}.json");

                Directory.CreateDirectory(archiveRoot);

                await BackupService.CreateDbSnapshotAsync(snapshotPath);
                await BackupService.ExportArchiveAsync(archiveRoot);
                await BackupService.ExportGamificationDataAsync(gamificationPath);

                MessageBox.Show(
                    $"Backup created:\n\n{backupRoot}\n\nIncludes:\n- Full app snapshot (.db)\n- Database Archive folder\n- Gamification save (.json)",
                    "Backup complete",
                    MessageBoxButton.OK,
                    MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Backup failed", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async void RestoreDbButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var dlg = new OpenFileDialog
                {
                    Title = "Select Full App Snapshot to restore",
                    Filter = "SQLite DB (*.db)|*.db|All files (*.*)|*.*",
                    CheckFileExists = true,
                    Multiselect = false
                };

                if (dlg.ShowDialog(this) != true)
                    return;

                var confirm = MessageBox.Show(
                    "This will REPLACE your current database with the full app snapshot you selected.\n\nContinue?",
                    "Confirm full app snapshot restore",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Warning);

                if (confirm != MessageBoxResult.Yes)
                    return;

                await Task.Run(() => BackupService.RestoreDbSnapshot(dlg.FileName));

                await InitializeAndRefreshAsync();

                MessageBox.Show("Restore complete.", "Restore", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Restore failed", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async void ImportArchiveMergeButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                string? folder = PickFolder("Choose the Database Archive folder to import");
                if (string.IsNullOrWhiteSpace(folder))
                    return;

                if (!BackupService.TryValidateDatabaseArchiveRoot(folder, out string validationError))
                {
                    MessageBox.Show(validationError, "Invalid Database Archive folder", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                var confirm = MessageBox.Show(
                    "This will MERGE the database archive into your current tracked database data. Gamification save data will remain untouched.\n\nContinue?",
                    "Confirm database archive import (merge)",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Question);

                if (confirm != MessageBoxResult.Yes)
                    return;

                await BackupService.ImportArchiveAsync(folder, ArchiveImportMode.Merge);

                await InitializeAndRefreshAsync();

                MessageBox.Show("Database archive import (merge) complete.", "Import complete", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Import failed", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async void ImportArchiveRangeButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                string? folder = PickFolder("Choose the Database Archive folder to import");
                if (string.IsNullOrWhiteSpace(folder))
                    return;

                if (!BackupService.TryValidateDatabaseArchiveRoot(folder, out string validationError))
                {
                    MessageBox.Show(validationError, "Invalid Database Archive folder", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                var range = PromptDateRange();
                if (range is null)
                    return;

                var confirm = MessageBox.Show(
                    $"This will DELETE and REPLACE tracked database data in the date range:\n\n{range.Value.Start:yyyy-MM-dd} to {range.Value.End:yyyy-MM-dd}\n\nGamification save data will remain untouched.\n\nContinue?",
                    "Confirm database archive import (replace date range)",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Warning);

                if (confirm != MessageBoxResult.Yes)
                    return;

                await BackupService.ImportArchiveAsync(
                    folder,
                    ArchiveImportMode.ReplaceRange,
                    range.Value.Start,
                    range.Value.End);

                await InitializeAndRefreshAsync();

                MessageBox.Show("Database archive import (replace date range) complete.", "Import complete", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Import failed", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async void ExportGamificationButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                string stamp = DateTime.Now.ToString("yyyy-MM-dd_HHmm");

                var dlg = new SaveFileDialog
                {
                    Title = "Export Gamification Save",
                    Filter = "JSON (*.json)|*.json|All files (*.*)|*.*",
                    FileName = $"Gamification Data - {stamp}.json",
                    AddExtension = true,
                    DefaultExt = ".json",
                    OverwritePrompt = true
                };

                if (dlg.ShowDialog(this) != true)
                    return;

                await BackupService.ExportGamificationDataAsync(dlg.FileName);

                MessageBox.Show("Gamification save exported.", "Export complete", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Export failed", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async void ImportGamificationButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var dlg = new OpenFileDialog
                {
                    Title = "Import Gamification Save",
                    Filter = "JSON (*.json)|*.json|All files (*.*)|*.*",
                    CheckFileExists = true,
                    Multiselect = false
                };

                if (dlg.ShowDialog(this) != true)
                    return;

                var confirm = MessageBox.Show(
                    "This will REPLACE your current gamification save data only. Tracked database data will remain untouched.\n\nContinue?",
                    "Confirm gamification save import",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Warning);

                if (confirm != MessageBoxResult.Yes)
                    return;

                await BackupService.ImportGamificationDataAsync(dlg.FileName);

                await InitializeAndRefreshAsync();

                MessageBox.Show("Gamification save import complete.", "Import complete", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Import failed", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        #endregion // SECTION G1 — Data Backup / Import Actions

        #region SECTION G2 — Data Delete Actions + Dialog Helpers
        private async void DeleteAllDataButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var first = MessageBox.Show(
                    "This will permanently delete ALL tracked database data and ALL gamification save data.\n\nContinue?",
                    "Confirm delete all data",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Warning);

                if (first != MessageBoxResult.Yes)
                    return;

                if (!PromptDelayedDangerousConfirmation(
                        "Final confirmation — Delete All Data",
                        "This action permanently deletes everything: tracked database data, trainer progress, gamification settings, inventory, and rewards ledger.",
                        "Yes, Delete All Data"))
                    return;

                await BackupService.DeleteAllDataAsync();
                await InitializeAndRefreshAsync();

                MessageBox.Show("All data deleted.", "Delete complete", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Delete failed", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async void DeleteAllDatabaseDataButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var first = MessageBox.Show(
                    "This will permanently delete tracked database data only. Gamification save data will remain untouched.\n\nContinue?",
                    "Confirm delete all database data",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Warning);

                if (first != MessageBoxResult.Yes)
                    return;

                if (!PromptDelayedDangerousConfirmation(
                        "Final confirmation — Delete All Database Data",
                        "This action permanently deletes tracked database data only: focus, food, sleep, steps, habits, and labels. Gamification save data will remain untouched.",
                        "Yes, Delete All Database Data"))
                    return;

                await BackupService.DeleteAllDatabaseDataAsync();
                await InitializeAndRefreshAsync();

                MessageBox.Show("All database data deleted.", "Delete complete", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Delete failed", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async void DeleteAllGamificationDataButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var first = MessageBox.Show(
                    "This will permanently delete gamification save data only. Tracked database data will remain untouched. Item definitions in the drop items list will also remain untouched.\n\nContinue?",
                    "Confirm delete all gamification data",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Warning);

                if (first != MessageBoxResult.Yes)
                    return;

                if (!PromptDelayedDangerousConfirmation(
                        "Final confirmation — Delete All Gamification Data",
                        "This action permanently deletes trainer progress, rewards, inventory, item-roll state, and gamification settings only. Tracked database data and item definitions in the drop items list will remain untouched.",
                        "Yes, Delete All Gamification Data"))
                    return;

                await BackupService.DeleteAllGamificationDataAsync();
                await InitializeAndRefreshAsync();

                MessageBox.Show("All gamification data deleted.", "Delete complete", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Delete failed", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private string? PickFolder(string title)
        {
            var dlg = new Microsoft.Win32.OpenFolderDialog
            {
                Title = title,
                Multiselect = false
            };

            if (dlg.ShowDialog() != true)
                return null;

            return dlg.FolderName;
        }

        private static (DateOnly Start, DateOnly End)? PromptDateRange()
        {
            var win = new Window
            {
                Title = "Choose date range (yyyy-MM-dd)",
                Width = 360,
                Height = 190,
                WindowStartupLocation = WindowStartupLocation.CenterOwner,
                ResizeMode = ResizeMode.NoResize
            };

            var root = new StackPanel { Margin = new Thickness(12) };

            root.Children.Add(new TextBlock
            {
                Text = "Start date (yyyy-MM-dd):",
                Margin = new Thickness(0, 0, 0, 4)
            });

            var startBox = new TextBox { Text = DateTime.Now.AddDays(-7).ToString("yyyy-MM-dd") };
            root.Children.Add(startBox);

            root.Children.Add(new TextBlock
            {
                Text = "End date (yyyy-MM-dd):",
                Margin = new Thickness(0, 10, 0, 4)
            });

            var endBox = new TextBox { Text = DateTime.Now.ToString("yyyy-MM-dd") };
            root.Children.Add(endBox);

            var buttons = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                HorizontalAlignment = HorizontalAlignment.Right,
                Margin = new Thickness(0, 12, 0, 0)
            };

            var ok = new Button { Content = "OK", Width = 80, Margin = new Thickness(0, 0, 8, 0) };
            var cancel = new Button { Content = "Cancel", Width = 80 };

            buttons.Children.Add(ok);
            buttons.Children.Add(cancel);
            root.Children.Add(buttons);
            win.Content = root;

            (DateOnly Start, DateOnly End)? result = null;

            ok.Click += (_, __) =>
            {
                if (!DateOnly.TryParseExact(startBox.Text.Trim(), "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var s))
                {
                    MessageBox.Show("Start date must be yyyy-MM-dd");
                    return;
                }

                if (!DateOnly.TryParseExact(endBox.Text.Trim(), "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var e))
                {
                    MessageBox.Show("End date must be yyyy-MM-dd");
                    return;
                }

                if (e < s)
                {
                    MessageBox.Show("End date must be on/after start date.");
                    return;
                }

                result = (s, e);
                win.DialogResult = true;
                win.Close();
            };

            cancel.Click += (_, __) =>
            {
                win.DialogResult = false;
                win.Close();
            };

            win.ShowDialog();
            return result;
        }

        private bool PromptDelayedDangerousConfirmation(string title, string body, string confirmButtonText)
        {
            var win = new Window
            {
                Title = title,
                Width = 470,
                Height = 230,
                WindowStartupLocation = WindowStartupLocation.CenterOwner,
                ResizeMode = ResizeMode.NoResize,
                Owner = this
            };

            var root = new StackPanel { Margin = new Thickness(12) };

            root.Children.Add(new TextBlock
            {
                Text = body,
                TextWrapping = TextWrapping.Wrap,
                Margin = new Thickness(0, 0, 0, 10)
            });

            var countdownText = new TextBlock
            {
                Text = "You can confirm in 3 seconds.",
                Foreground = System.Windows.Media.Brushes.Gray,
                Margin = new Thickness(0, 0, 0, 12)
            };
            root.Children.Add(countdownText);

            var buttons = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                HorizontalAlignment = HorizontalAlignment.Right
            };

            var confirmButton = new Button
            {
                Content = confirmButtonText,
                Width = 190,
                IsEnabled = false,
                Margin = new Thickness(0, 0, 8, 0)
            };

            var cancelButton = new Button
            {
                Content = "Cancel",
                Width = 100
            };

            buttons.Children.Add(confirmButton);
            buttons.Children.Add(cancelButton);
            root.Children.Add(buttons);

            win.Content = root;

            bool confirmed = false;
            int remaining = 3;

            var timer = new DispatcherTimer
            {
                Interval = TimeSpan.FromSeconds(1)
            };

            timer.Tick += (_, __) =>
            {
                remaining--;

                if (remaining > 0)
                {
                    countdownText.Text = $"You can confirm in {remaining} second{(remaining == 1 ? "" : "s")}.";
                    return;
                }

                timer.Stop();
                confirmButton.IsEnabled = true;
                countdownText.Text = "You may now confirm or cancel.";
            };

            confirmButton.Click += (_, __) =>
            {
                confirmed = true;
                win.DialogResult = true;
                win.Close();
            };

            cancelButton.Click += (_, __) =>
            {
                confirmed = false;
                win.DialogResult = false;
                win.Close();
            };

            win.Closed += (_, __) => timer.Stop();

            timer.Start();
            win.ShowDialog();

            return confirmed;
        }
        #endregion // SECTION G2 — Data Delete Actions + Dialog Helpers

        #region SECTION H1 — Tab + Grid Helpers
        private void SessionsTabControl_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            // Ignore bubbled SelectionChanged events from inner controls
            if (!ReferenceEquals(e.OriginalSource, SessionsTabControl))
                return;

            FitSelectedTabColumnsOnce();
        }

        private void FitSelectedTabColumnsOnce()
        {
            int idx = SessionsTabControl.SelectedIndex;

            if (idx == 0)
                ScheduleAutoFitFocus();
            else if (idx == 1)
                ScheduleAutoFitFood();
            else if (idx == 2)
                ScheduleAutoFitSleep();
        }

        private void AttachNestedDataGridWheelForwarding()
        {
            RegisterNestedDataGrid(ItemDefinitionsGrid);
            RegisterNestedDataGrid(InventoryGrid);
            RegisterNestedDataGrid(FocusSessionsGrid);
            RegisterNestedDataGrid(FoodEntriesGrid);
            RegisterNestedDataGrid(SleepSessionsGrid);
            RegisterNestedDataGrid(HabitsGrid);
        }

        private static void RegisterNestedDataGrid(DataGrid? grid)
        {
            if (grid == null)
                return;

            grid.PreviewMouseWheel -= NestedDataGrid_PreviewMouseWheel;
            grid.PreviewMouseWheel += NestedDataGrid_PreviewMouseWheel;
        }

        private static void NestedDataGrid_PreviewMouseWheel(object sender, System.Windows.Input.MouseWheelEventArgs e)
        {
            if (sender is not DataGrid grid)
                return;

            var outerScrollViewer = FindAncestorScrollViewer(grid);
            if (outerScrollViewer == null)
                return;

            var innerScrollViewer = FindDescendantScrollViewer(grid);

            bool shouldBubbleToOuter;

            if (innerScrollViewer == null || innerScrollViewer.ScrollableHeight <= 0)
            {
                // Grid has no usable internal scrolling (empty list / too few rows / no scrollbar),
                // so let the main app continue scrolling.
                shouldBubbleToOuter = true;
            }
            else
            {
                bool atTop = innerScrollViewer.VerticalOffset <= 0.5;
                bool atBottom = innerScrollViewer.VerticalOffset >= innerScrollViewer.ScrollableHeight - 0.5;

                shouldBubbleToOuter =
                    (e.Delta > 0 && atTop) ||
                    (e.Delta < 0 && atBottom);
            }

            if (!shouldBubbleToOuter)
                return;

            e.Handled = true;

            var forwardedEvent = new System.Windows.Input.MouseWheelEventArgs(e.MouseDevice, e.Timestamp, e.Delta)
            {
                RoutedEvent = System.Windows.UIElement.MouseWheelEvent,
                Source = grid
            };

            outerScrollViewer.RaiseEvent(forwardedEvent);
        }

        private static System.Windows.Controls.ScrollViewer? FindDescendantScrollViewer(System.Windows.DependencyObject root)
        {
            int childCount = System.Windows.Media.VisualTreeHelper.GetChildrenCount(root);

            for (int i = 0; i < childCount; i++)
            {
                var child = System.Windows.Media.VisualTreeHelper.GetChild(root, i);

                if (child is System.Windows.Controls.ScrollViewer scrollViewer)
                    return scrollViewer;

                var nested = FindDescendantScrollViewer(child);
                if (nested != null)
                    return nested;
            }

            return null;
        }

        private static System.Windows.Controls.ScrollViewer? FindAncestorScrollViewer(System.Windows.DependencyObject start)
        {
            System.Windows.DependencyObject? current = System.Windows.Media.VisualTreeHelper.GetParent(start);

            while (current != null)
            {
                if (current is System.Windows.Controls.ScrollViewer scrollViewer)
                    return scrollViewer;

                current = System.Windows.Media.VisualTreeHelper.GetParent(current);
            }

            return null;
        }

        private void ScheduleAutoFitFocus()
        {
            if (_autoFitFocusDone) return;

            Dispatcher.BeginInvoke(new Action(() =>
            {
                if (_autoFitFocusDone) return;

                // Only fit once the grid is actually visible/measured
                if (!FocusSessionsGrid.IsVisible || FocusSessionsGrid.ActualWidth <= 0)
                    return;

                AutoFitGridColumns(FocusSessionsGrid);
                _autoFitFocusDone = true;
            }), DispatcherPriority.ContextIdle);
        }

        private void ScheduleAutoFitFood()
        {
            if (_autoFitFoodDone) return;

            Dispatcher.BeginInvoke(new Action(() =>
            {
                if (_autoFitFoodDone) return;

                if (!FoodEntriesGrid.IsVisible || FoodEntriesGrid.ActualWidth <= 0)
                    return;

                AutoFitGridColumns(FoodEntriesGrid);
                _autoFitFoodDone = true;
            }), DispatcherPriority.ContextIdle);
        }

        private void ScheduleAutoFitSleep()
        {
            if (_autoFitSleepDone) return;

            Dispatcher.BeginInvoke(new Action(() =>
            {
                if (_autoFitSleepDone) return;

                if (!SleepSessionsGrid.IsVisible || SleepSessionsGrid.ActualWidth <= 0)
                    return;

                AutoFitGridColumns(SleepSessionsGrid);
                _autoFitSleepDone = true;
            }), DispatcherPriority.ContextIdle);
        }

        private static void ForceCommitGridEdits(DataGrid grid)
        {
            // Ensures any active cell edit is pushed into the bound object *before* we read values.
            grid.CommitEdit(DataGridEditingUnit.Cell, true);
            grid.CommitEdit(DataGridEditingUnit.Row, true);

            // Extra commits help when the user clicks “Save changes” while still editing a cell.
            grid.CommitEdit();
            grid.CommitEdit();
        }

        private static bool TryParseLocalDateTime(string? text, out DateTime localDateTime)
        {
            // Accept either:
            //  - yyyy-MM-dd HH:mm
            //  - yyyy-MM-dd HH:mm:ss
            var input = (text ?? "").Trim();

            string[] formats = new[]
            {
                "yyyy-MM-dd HH:mm",
                "yyyy-MM-dd HH:mm:ss"
            };

            return DateTime.TryParseExact(
                input,
                formats,
                CultureInfo.InvariantCulture,
                DateTimeStyles.AllowWhiteSpaces,
                out localDateTime);
        }

        private static DateTimeOffset LocalDateTimeToUtc(DateTime localDateTime)
        {
            // Convert local "wall clock" time -> UTC using timezone rules (safe around DST).
            var unspecified = DateTime.SpecifyKind(localDateTime, DateTimeKind.Unspecified);
            var utc = TimeZoneInfo.ConvertTimeToUtc(unspecified, TimeZoneInfo.Local);
            return new DateTimeOffset(utc, TimeSpan.Zero);
        }

        private static DateTimeOffset LocalDateTimeToUtcForSleep(DateTime localDateTime, bool preferLaterInstantIfAmbiguous)
        {
            // For DST “fall back” (ambiguous times), the same wall-clock time can map to two UTC instants.
            // For sleep we want:
            //  - start: earlier instant
            //  - end: later instant
            var tz = TimeZoneInfo.Local;
            var unspecified = DateTime.SpecifyKind(localDateTime, DateTimeKind.Unspecified);

            if (tz.IsInvalidTime(unspecified))
                throw new InvalidOperationException("That local time does not exist (daylight savings shift). Please choose a different time.");

            if (tz.IsAmbiguousTime(unspecified))
            {
                var offsets = tz.GetAmbiguousTimeOffsets(unspecified);
                // Example (Sydney DST end): +11 and +10 for the same local time.
                // Later UTC instant corresponds to the SMALLER offset.
                var chosen = preferLaterInstantIfAmbiguous ? Min(offsets) : Max(offsets);
                return new DateTimeOffset(unspecified, chosen).ToUniversalTime();
            }

            return LocalDateTimeToUtc(localDateTime);

            static TimeSpan Min(TimeSpan[] arr)
            {
                TimeSpan m = arr[0];
                for (int i = 1; i < arr.Length; i++) if (arr[i] < m) m = arr[i];
                return m;
            }

            static TimeSpan Max(TimeSpan[] arr)
            {
                TimeSpan m = arr[0];
                for (int i = 1; i < arr.Length; i++) if (arr[i] > m) m = arr[i];
                return m;
            }
        }

        private void AutoFitGridColumns(DataGrid grid)
        {
            if (grid == null || grid.Columns == null || grid.Columns.Count == 0)
                return;

            if (!grid.IsVisible || grid.ActualWidth <= 0)
                return;

            grid.UpdateLayout();

            // Measure cells
            foreach (var col in grid.Columns)
                col.Width = new DataGridLength(1, DataGridLengthUnitType.SizeToCells);

            grid.UpdateLayout();

            var cellWidths = new double[grid.Columns.Count];
            for (int i = 0; i < grid.Columns.Count; i++)
                cellWidths[i] = grid.Columns[i].ActualWidth;

            // Measure headers
            for (int i = 0; i < grid.Columns.Count; i++)
                grid.Columns[i].Width = new DataGridLength(1, DataGridLengthUnitType.SizeToHeader);

            grid.UpdateLayout();

            // Lock to max(header, cells)
            for (int i = 0; i < grid.Columns.Count; i++)
            {
                double headerWidth = grid.Columns[i].ActualWidth;
                double finalWidth = Math.Max(cellWidths[i], headerWidth);
                grid.Columns[i].Width = new DataGridLength(finalWidth);
            }
        }

        #endregion // SECTION H1 — Tab + Grid Helpers

        #region SECTION H2 — Focus Session Edit/Delete
        private async void SaveFocusSessionsChanges_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                FocusSessionsGrid.CommitEdit(DataGridEditingUnit.Cell, true);
                FocusSessionsGrid.CommitEdit(DataGridEditingUnit.Row, true);

                using var conn = Db.OpenConnection();

                foreach (var s in _focusSessions)
                {
                    if (s.Id <= 0) continue;

                    if (s.Minutes <= 0)
                        throw new InvalidOperationException("Focus session minutes must be greater than 0.");

                    string focusType = NormalizeFocusLabel(s.FocusType);

                    if (!TryParseLocalDateTime(s.LoggedAtLocalEdit, out var newLocalDateTime))
                        throw new InvalidOperationException("Focus session Logged time must be in format: yyyy-MM-dd HH:mm (or HH:mm:ss)");

                    var newLoggedAtUtc = LocalDateTimeToUtc(newLocalDateTime);
                    var newLogDate = DateOnly.FromDateTime(newLocalDateTime);

                    await conn.ExecuteAsync(@"
                UPDATE FocusSessions
                SET LoggedAtUtc = @LoggedAtUtc,
                    LogDate = @LogDate,
                    FocusType = @FocusType,
                    Minutes = @Minutes,
                    Completed = @Completed
                WHERE Id = @Id;",
                        new
                        {
                            Id = s.Id,
                            LoggedAtUtc = newLoggedAtUtc.ToString("O"),
                            LogDate = newLogDate.ToString("yyyy-MM-dd"),
                            FocusType = focusType,
                            Minutes = s.Minutes,
                            Completed = s.Completed ? 1 : 0
                        });
                }

                await RefreshForSelectedDateAsync();
                MessageBox.Show("Saved focus session changes.");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not save focus session changes");
            }
        }

        private async void DeleteSelectedFocusSession_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (FocusSessionsGrid.SelectedItem is not FocusSession selected)
                {
                    MessageBox.Show("Select a focus session first.");
                    return;
                }

                var result = MessageBox.Show(
                    "Delete the selected focus session?",
                    "Confirm delete",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Warning);

                if (result != MessageBoxResult.Yes) return;

                using var conn = Db.OpenConnection();
                await conn.ExecuteAsync("DELETE FROM FocusSessions WHERE Id = @Id;", new { Id = selected.Id });

                await RefreshForSelectedDateAsync();
                MessageBox.Show("Deleted focus session.");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not delete focus session");
            }
        }

        #endregion // SECTION H2 — Focus Session Edit/Delete

        #region SECTION H3 — Food Entry Edit/Delete
        private async void SaveFoodEntriesChanges_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                FoodEntriesGrid.CommitEdit(DataGridEditingUnit.Cell, true);
                FoodEntriesGrid.CommitEdit(DataGridEditingUnit.Row, true);

                using var conn = Db.OpenConnection();

                foreach (var e1 in _foodEntries)
                {
                    if (e1.Id <= 0) continue;

                    string foodName = (e1.FoodName ?? "").Trim();
                    if (string.IsNullOrWhiteSpace(foodName))
                        throw new InvalidOperationException("Food name can’t be blank.");

                    if (!TryParseLocalDateTime(e1.LoggedAtLocalEdit, out var newLocalDateTime))
                        throw new InvalidOperationException("Food entry Logged time must be in format: yyyy-MM-dd HH:mm (or HH:mm:ss)");

                    var newLoggedAtUtc = LocalDateTimeToUtc(newLocalDateTime);
                    var newLogDate = DateOnly.FromDateTime(newLocalDateTime);

                    if (e1.Servings.HasValue && e1.Servings.Value <= 0) e1.Servings = null;
                    if (e1.Grams.HasValue && e1.Grams.Value <= 0) e1.Grams = null;

                    bool hasGrams = e1.Grams.HasValue && e1.Grams.Value > 0;
                    bool hasServings = e1.Servings.HasValue && e1.Servings.Value > 0;

                    if (!hasGrams && !hasServings)
                        throw new InvalidOperationException("Each food entry must have grams (>0) or servings (>0).");

                    _foodEntryOriginalKj.TryGetValue(e1.Id, out double originalKj);
                    bool kjWasEdited = Math.Abs(e1.KjComputed - originalKj) > 0.0001;

                    if (!kjWasEdited)
                    {
                        if (hasGrams)
                        {
                            if (!e1.KjPer100gSnapshot.HasValue || e1.KjPer100gSnapshot.Value <= 0)
                                throw new InvalidOperationException($"“{foodName}” has no kJ/100g snapshot; use servings or manually edit kJ.");

                            e1.KjComputed = (e1.Grams!.Value / 100.0) * e1.KjPer100gSnapshot.Value;
                        }
                        else
                        {
                            if (e1.KjPerServingSnapshot <= 0)
                                throw new InvalidOperationException($"“{foodName}” has no valid kJ/serving snapshot; manually edit kJ.");

                            e1.KjComputed = e1.Servings!.Value * e1.KjPerServingSnapshot;
                        }
                    }

                    await conn.ExecuteAsync(@"
                UPDATE FoodEntries
                SET LoggedAtUtc = @LoggedAtUtc,
                    LogDate = @LogDate,
                    FoodName = @FoodName,
                    Servings = @Servings,
                    Grams = @Grams,
                    KjComputed = @KjComputed
                WHERE Id = @Id;",
                        new
                        {
                            Id = e1.Id,
                            LoggedAtUtc = newLoggedAtUtc.ToString("O"),
                            LogDate = newLogDate.ToString("yyyy-MM-dd"),
                            FoodName = foodName,
                            Servings = e1.Servings,
                            Grams = e1.Grams,
                            KjComputed = e1.KjComputed
                        });
                }

                await RefreshForSelectedDateAsync();
                MessageBox.Show("Saved food entry changes.");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not save food entry changes");
            }
        }

        private async void DeleteSelectedFoodEntry_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (FoodEntriesGrid.SelectedItem is not FoodEntry selected)
                {
                    MessageBox.Show("Select a food entry first.");
                    return;
                }

                var result = MessageBox.Show(
                    "Delete the selected food entry?",
                    "Confirm delete",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Warning);

                if (result != MessageBoxResult.Yes) return;

                using var conn = Db.OpenConnection();
                await conn.ExecuteAsync("DELETE FROM FoodEntries WHERE Id = @Id;", new { Id = selected.Id });

                await RefreshForSelectedDateAsync();
                MessageBox.Show("Deleted food entry.");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not delete food entry");
            }
        }

        #endregion // SECTION H3 — Food Entry Edit/Delete

        #region SECTION H4 — Sleep Session Edit/Delete
        private async void SaveSleepSessionsChanges_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // IMPORTANT: force any in-progress edit into the bound object first
                ForceCommitGridEdits(SleepSessionsGrid);

                using var conn = Db.OpenConnection();

                foreach (var s in _sleepSessions)
                {
                    if (s.Id <= 0) continue;

                    if (!TryParseLocalDateTime(s.StartLocalEdit, out var startLocal))
                        throw new InvalidOperationException("Sleep Start must be in format: yyyy-MM-dd HH:mm (or HH:mm:ss)");

                    if (!TryParseLocalDateTime(s.EndLocalEdit, out var endLocal))
                        throw new InvalidOperationException("Sleep End must be in format: yyyy-MM-dd HH:mm (or HH:mm:ss)");

                    // Convert to UTC instants (handles DST ambiguity properly)
                    var startUtc = LocalDateTimeToUtcForSleep(startLocal, preferLaterInstantIfAmbiguous: false); // earlier
                    var endUtc = LocalDateTimeToUtcForSleep(endLocal, preferLaterInstantIfAmbiguous: true);     // later

                    if (endUtc <= startUtc)
                    {
                        throw new InvalidOperationException(
                            "Sleep end must be after sleep start.\n\n" +
                            $"Start: {startLocal:yyyy-MM-dd HH:mm}\n" +
                            $"End:   {endLocal:yyyy-MM-dd HH:mm}");
                    }

                    var wakeLogDate = DateOnly.FromDateTime(endLocal);
                    int durationMinutes = (int)Math.Round((endUtc - startUtc).TotalMinutes);

                    await conn.ExecuteAsync(@"
                UPDATE SleepSessions
                SET StartUtc = @StartUtc,
                    EndUtc = @EndUtc,
                    WakeLogDate = @WakeLogDate,
                    DurationMinutes = @DurationMinutes
                WHERE Id = @Id;",
                        new
                        {
                            Id = s.Id,
                            StartUtc = startUtc.ToString("O"),
                            EndUtc = endUtc.ToString("O"),
                            WakeLogDate = wakeLogDate.ToString("yyyy-MM-dd"),
                            DurationMinutes = durationMinutes
                        });
                }

                await RefreshForSelectedDateAsync();
                MessageBox.Show("Saved sleep session changes.");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not save sleep session changes");
            }
        }

        private async void DeleteSelectedSleepSession_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (SleepSessionsGrid.SelectedItem is not SleepSession selected)
                {
                    MessageBox.Show("Select a sleep session first.");
                    return;
                }

                var result = MessageBox.Show(
                    "Delete the selected sleep session?",
                    "Confirm delete",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Warning);

                if (result != MessageBoxResult.Yes) return;

                using var conn = Db.OpenConnection();
                await conn.ExecuteAsync("DELETE FROM SleepSessions WHERE Id = @Id;", new { Id = selected.Id });

                await RefreshForSelectedDateAsync();
                MessageBox.Show("Deleted sleep session.");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not delete sleep session");
            }
        }
        #endregion // SECTION H4 — Sleep Session Edit/Delete

    }
}

namespace LifestylesDesktop
{
    public partial class MainWindow
    {

        #region SECTION I1 — Steps Helpers
        // Prevent checkbox events from firing while we are rebuilding the grid.
        private bool _habitsUiUpdating = false;

        // Prevent double-click / re-entrancy during archive operations.
        private bool _habitArchiveOpInProgress = false;

        // One-time DB check/migration guard (adds ArchivedAtUtc column if missing).
        private bool _habitsArchiveColumnEnsured = false;

        private static DateOnly GetWeekStartMonday(DateOnly date)
        {
            // Week starts Monday
            int diff = ((int)date.DayOfWeek - (int)DayOfWeek.Monday + 7) % 7;
            return date.AddDays(-diff);
        }

        // ============================================================
        // Habit archive timeline support (CreatedAtUtc + ArchivedAtUtc)
        // ============================================================

        private sealed class HabitDbRow
        {
            public long Id { get; set; }
            public string Title { get; set; } = "";
            public HabitKind Kind { get; set; }
            public int TargetPerWeek { get; set; }

            public string? CreatedAtUtc { get; set; }

            // NOTE: this column may not exist yet; we add it automatically.
            public string? ArchivedAtUtc { get; set; }
        }

        #endregion // SECTION I1 — Steps Helpers

        #region SECTION I2 — Habits Archive Helpers
        private async Task EnsureHabitsArchiveColumnAsync()
        {
            if (_habitsArchiveColumnEnsured)
                return;

            using var conn = Db.OpenConnection();

            var colNames = (await conn.QueryAsync<string>("SELECT name FROM pragma_table_info('Habits');"))
                .Select(x => (x ?? "").Trim())
                .ToList();

            bool hasArchivedAtUtc = colNames.Any(n => string.Equals(n, "ArchivedAtUtc", StringComparison.OrdinalIgnoreCase));

            if (!hasArchivedAtUtc)
            {
                await conn.ExecuteAsync("ALTER TABLE Habits ADD COLUMN ArchivedAtUtc TEXT NULL;");
            }

            _habitsArchiveColumnEnsured = true;
        }

        private static bool TryParseUtcIsoToLocalDate(string? utcIso, out DateOnly localDate)
        {
            localDate = default;

            string s = (utcIso ?? "").Trim();
            if (string.IsNullOrWhiteSpace(s))
                return false;

            if (!DateTimeOffset.TryParse(s, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var dto))
                return false;

            localDate = DateOnly.FromDateTime(dto.ToLocalTime().DateTime);
            return true;
        }

        private static DateTimeOffset LocalDateToUtcAnchor(DateOnly localDate)
        {
            // Use local NOON as a safe anchor (avoids DST invalid/ambiguous midnight edge cases).
            var localNoon = new DateTime(localDate.Year, localDate.Month, localDate.Day, 12, 0, 0, DateTimeKind.Unspecified);
            var utc = TimeZoneInfo.ConvertTimeToUtc(localNoon, TimeZoneInfo.Local);
            return new DateTimeOffset(utc, TimeSpan.Zero);
        }

        private async Task<List<HabitDbRow>> GetAllHabitsDbAsync()
        {
            await EnsureHabitsArchiveColumnAsync();

            using var conn = Db.OpenConnection();
            var rows = await conn.QueryAsync<HabitDbRow>(@"
                SELECT Id, Title, Kind, TargetPerWeek, CreatedAtUtc, ArchivedAtUtc
                FROM Habits;");

            return rows.ToList();
        }

        private async Task SetHabitArchivedOnLocalDateAsync(long habitId, DateOnly localArchiveDate)
        {
            await EnsureHabitsArchiveColumnAsync();

            var archiveUtc = LocalDateToUtcAnchor(localArchiveDate);

            using var conn = Db.OpenConnection();
            await conn.ExecuteAsync(
                @"UPDATE Habits
                  SET ArchivedAtUtc = @ArchivedAtUtc
                  WHERE Id = @Id;",
                new
                {
                    Id = habitId,
                    ArchivedAtUtc = archiveUtc.ToString("O")
                });
        }

        private async Task ClearHabitArchivedAsync(long habitId)
        {
            await EnsureHabitsArchiveColumnAsync();

            using var conn = Db.OpenConnection();
            await conn.ExecuteAsync(
                @"UPDATE Habits
                  SET ArchivedAtUtc = NULL
                  WHERE Id = @Id;",
                new { Id = habitId });
        }

        // ============================================================
        // Refresh: Steps + Habits (with Created/Archived timeline)
        // ============================================================

        #endregion // SECTION I2 — Habits Archive Helpers

        #region SECTION I3 — Steps + Habits Refresh
        private async Task RefreshStepsAndHabitsAsync()
        {
            _habitsUiUpdating = true;
            try
            {
                int steps = await _stepsRepo.GetStepsForDateAsync(SelectedLogDate);
                StepsDayText.Text = $"Steps ({SelectedLogDate:yyyy-MM-dd}): {steps:#,0}";

                var weekStart = GetWeekStartMonday(SelectedLogDate);
                var weekEnd = weekStart.AddDays(6);
                HabitsWeekText.Text = $"Week: {weekStart:yyyy-MM-dd} → {weekEnd:yyyy-MM-dd}";

                var allHabits = await GetAllHabitsDbAsync();

                // Show if: CreatedDate <= SelectedDate AND (ArchivedDate is null OR SelectedDate <= ArchivedDate)
                var habitsVisibleOnThisDate = new List<HabitDbRow>();
                foreach (var h in allHabits)
                {
                    if (TryParseUtcIsoToLocalDate(h.CreatedAtUtc, out var createdLocal) && createdLocal > SelectedLogDate)
                        continue;

                    if (TryParseUtcIsoToLocalDate(h.ArchivedAtUtc, out var archivedLocal) && SelectedLogDate > archivedLocal)
                        continue;

                    habitsVisibleOnThisDate.Add(h);
                }

                var todayEntries = await _habitRepo.GetEntriesForDateAsync(SelectedLogDate);
                var weekTotals = await _habitRepo.GetWeekTotalsAsync(weekStart, weekEnd);

                var byHabitIdToday = new Dictionary<long, int>();
                foreach (var e in todayEntries)
                    byHabitIdToday[e.HabitId] = e.Value;

                _habitRows = new ObservableCollection<HabitRow>();

                foreach (var h in habitsVisibleOnThisDate)
                {
                    byHabitIdToday.TryGetValue(h.Id, out int todayVal);
                    weekTotals.TryGetValue(h.Id, out int weekTotal);

                    bool isCheckbox = h.Kind == HabitKind.CheckboxDaily;
                    bool isCounter = h.Kind == HabitKind.NumericDaily;

                    DateOnly? archivedLocalDate = null;
                    bool archivedToday = false;

                    if (TryParseUtcIsoToLocalDate(h.ArchivedAtUtc, out var aLocal))
                    {
                        archivedLocalDate = aLocal;
                        archivedToday = aLocal == SelectedLogDate;
                    }

                    var row = new HabitRow
                    {
                        HabitId = h.Id,
                        Title = h.Title,
                        Kind = h.Kind,
                        KindLabel = isCheckbox ? "Checkbox" : "Counter",
                        TargetPerWeek = h.TargetPerWeek,
                        TodayChecked = isCheckbox && todayVal > 0,
                        TodayValue = isCounter ? todayVal : (todayVal > 0 ? 1 : 0),
                        WeekTotal = weekTotal,
                        WeekMet = weekTotal >= h.TargetPerWeek,

                        ArchivedOnSelectedDate = archivedToday,
                        ArchivedLocalDate = archivedLocalDate
                    };

                    _habitRows.Add(row);
                }

                HabitsGrid.ItemsSource = _habitRows;

                var counterHabits = new List<HabitDbRow>();
                foreach (var h in habitsVisibleOnThisDate)
                    if (h.Kind == HabitKind.NumericDaily)
                        counterHabits.Add(h);

                HabitLogCombo.ItemsSource = counterHabits;

                if (HabitLogCombo.SelectedItem is not HabitDbRow && counterHabits.Count > 0)
                    HabitLogCombo.SelectedIndex = 0;
            }
            finally
            {
                _habitsUiUpdating = false;
            }
        }

        #endregion // SECTION I3 — Steps + Habits Refresh

        #region SECTION I4 — Steps + Habits Actions
        private void CounterMinus_Click(object sender, RoutedEventArgs e)
        {
            if (sender is not System.Windows.Controls.Button b || b.DataContext is not HabitRow row)
                return;

            row.TodayValue = Math.Max(0, row.TodayValue - 1);

            // HabitRow doesn't implement INotifyPropertyChanged (debug UI), so force a refresh.
            HabitsGrid.Items.Refresh();
        }

        private void CounterPlus_Click(object sender, RoutedEventArgs e)
        {
            if (sender is not System.Windows.Controls.Button b || b.DataContext is not HabitRow row)
                return;

            row.TodayValue = row.TodayValue + 1;

            HabitsGrid.Items.Refresh();
        }

        private async void AddHabitButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                string title = (HabitTitleBox.Text ?? "").Trim();
                if (string.IsNullOrWhiteSpace(title))
                {
                    MessageBox.Show("Habit title can’t be blank.");
                    return;
                }

                if (!int.TryParse((HabitTargetBox.Text ?? "").Trim(), out int target) || target <= 0)
                {
                    MessageBox.Show("Target/wk must be a whole number greater than 0.");
                    return;
                }

                HabitKind kind = (HabitKindCombo.SelectedIndex == 1)
                    ? HabitKind.NumericDaily
                    : HabitKind.CheckboxDaily;

                // Anchor creation to the selected log date (so time-travel works)
                await _habitRepo.AddHabitAsync(title, kind, target, SelectedLogDate);

                HabitTitleBox.Text = "";
                HabitTargetBox.Text = "";
                HabitKindCombo.SelectedIndex = 0;

                await RefreshStepsAndHabitsAsync();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not add habit");
            }
        }

        private async void SaveHabitsChanges_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                HabitsGrid.CommitEdit(DataGridEditingUnit.Cell, true);
                HabitsGrid.CommitEdit(DataGridEditingUnit.Row, true);
                HabitsGrid.CommitEdit();
                HabitsGrid.CommitEdit();

                // Use selected log date as the reward game day.
                DateOnly rewardDay = SelectedLogDate;

                // Reward window: allow granting tickets for "today" or "yesterday" (for late-night catch-up),
                // but don't allow backfilling older days.
                DateOnly today = DateOnly.FromDateTime(DateTime.Now);
                bool canAwardRewards = (rewardDay == today || rewardDay == today.AddDays(-1));

                var newlyGranted = new List<string>();
                var alreadyGranted = new List<string>();

                foreach (var row in _habitRows)
                {
                    if (row.Kind == HabitKind.CheckboxDaily)
                    {
                        int value = row.TodayChecked ? 1 : 0;

                        // Only attempt reward grant if we are within the window and the user marked it done.
                        bool tryAward = canAwardRewards && value > 0;

                        var result = await _habitRepo.SetDailyValueAsync(row.HabitId, SelectedLogDate, value, tryAward);
                        if (tryAward)
                        {
                            if (result.RewardGranted)
                                newlyGranted.Add($"{row.Title} (HabitId {row.HabitId})");
                            else if (value > 0)
                                alreadyGranted.Add($"{row.Title} (HabitId {row.HabitId})");
                        }
                    }
                    else
                    {
                        int value = row.TodayValue;

                        // Clamp instead of throwing (debug UI convenience)
                        if (value < 0) value = 0;
                        if (row.TodayValue != value) row.TodayValue = value;

                        await _habitRepo.SetDailyValueAsync(row.HabitId, SelectedLogDate, value);
                    }
                }

                await RefreshStepsAndHabitsAsync();

                // Popup summary (debug UI)
                if (canAwardRewards)
                {
                    string msg =
                        "Saved habit changes.\n\n" +
                        $"Tickets newly granted: {newlyGranted.Count}\n" +
                        (newlyGranted.Count == 0 ? "" : string.Join("\n", newlyGranted)) +
                        "\n\n" +
                        $"Tickets already granted (unchanged): {alreadyGranted.Count}\n" +
                        (alreadyGranted.Count == 0 ? "" : string.Join("\n", alreadyGranted));

                    MessageBox.Show(msg);
                }
                else
                {
                    MessageBox.Show("Saved habit changes.");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not save habit changes");
            }
        }

        private sealed class HabitRow
        {
            public long HabitId { get; set; }
            public string Title { get; set; } = "";

            public HabitKind Kind { get; set; }
            public string KindLabel { get; set; } = "";

            public int TargetPerWeek { get; set; }

            public bool TodayChecked { get; set; }
            public int TodayValue { get; set; }

            public int WeekTotal { get; set; }
            public bool WeekMet { get; set; }

            // Archive lifecycle
            public bool ArchivedOnSelectedDate { get; set; }
            public DateOnly? ArchivedLocalDate { get; set; }

            public bool IsCheckbox => Kind == HabitKind.CheckboxDaily;

            // Counter habits are still stored as NumericDaily in the enum (display name only changes)
            public bool IsCounter => Kind == HabitKind.NumericDaily;
            public bool IsNumeric => IsCounter;
        }
        #endregion // SECTION I4 — Steps + Habits Actions
    }
}

