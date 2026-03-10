
// ============================================================
// SECTION A — Usings
// ============================================================
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


// ============================================================
// SECTION B — Main Window Class
// ============================================================

namespace LifestylesDesktop
{
    public partial class MainWindow : Window
    {
        private readonly FocusSessionRepository _repo = new();
        private readonly FoodItemRepository _foodItemRepo = new();
        private readonly FoodEntryRepository _foodEntryRepo = new();
        private readonly SleepSessionRepository _sleepRepo = new();
        private readonly StepsRepository _stepsRepo = new();
        private readonly HabitRepository _habitRepo = new();
        private readonly RewardsLedgerRepository _rewardsRepo = new();

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

        // Sleep tuning controls (injected at runtime into the debug area)
        private bool _sleepSettingsUiBuilt = false;
        private TextBox? _sleepHealthyMinHoursBox;
        private TextBox? _sleepHealthyMaxHoursBox;
        private TextBox? _sleepHealthyMultiplierBox;
        private TextBox? _sleepPenaltyPer15MinBox;
        private TextBox? _sleepTrackedMinimumMultiplierBox;

        // Auto-fit should run once PER grid, the first time that grid is actually loaded/measured.
        private bool _autoFitFocusDone = false;
        private bool _autoFitFoodDone = false;
        private bool _autoFitSleepDone = false;

        // Prevent refresh spam when we programmatically set the date picker.
        private bool _logDateUiUpdating = false;

        public MainWindow()
        {
            InitializeComponent();

            Loaded += (_, __) => FitSelectedTabColumnsOnce();

            TimeZoneText.Text = $"Timezone: {TimeZoneInfo.Local.DisplayName}";

            // Default log date = today
            _logDateUiUpdating = true;
            LogDatePicker.SelectedDate = DateTime.Today;
            _logDateUiUpdating = false;

            UpdateLogDateUI();

            _ = InitializeAndRefreshAsync();
        }

        private async Task InitializeAndRefreshAsync()
        {
            await RefreshFoodMenuAsync();

            // Load focus labels early so both the input ComboBox and grid editor have choices.
            await RefreshFocusLabelsAsync();

            EnsureSleepSettingsDebugUiBuilt();

            await RefreshForSelectedDateAsync();
        }
      
        // ============================================================
        // SECTION C — Log Date Helpers
        // ============================================================

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


        // ============================================================
        // SECTION D — Focus Session Actions
        // ============================================================

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

                // Save label for future selection (but don't store "(None)")
                if (focusType != "(None)")
                {
                    await _focusLabelRepo.UpsertActiveAsync(focusType);
                    await RefreshFocusLabelsAsync(keepText: focusType);
                }

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

        // ============================================================
        // SECTION E — Refresh UI
        // ============================================================

        private sealed class SleepTuningSettings
        {
            public double SleepHealthyMinHours { get; set; } = 6.0;
            public double SleepHealthyMaxHours { get; set; } = 10.0;
            public double SleepHealthyMultiplier { get; set; } = 1.10;
            public double SleepOutsideRangeStartMultiplier { get; set; } = 1.05;
            public double SleepPenaltyPer15Min { get; set; } = 0.005;
            public double SleepTrackedMinimumMultiplier { get; set; } = 1.01;
        }

        private static SleepTuningSettings NormalizeSleepTuningSettings(SleepTuningSettings settings)
        {
            double healthyMin = Math.Max(0.0, settings.SleepHealthyMinHours);
            double healthyMax = Math.Max(healthyMin, settings.SleepHealthyMaxHours);
            double healthyMult = Math.Max(1.0, settings.SleepHealthyMultiplier);
            double outsideStart = Math.Max(1.0, settings.SleepOutsideRangeStartMultiplier);
            double penaltyPer15Min = Math.Max(0.0, settings.SleepPenaltyPer15Min);
            double trackedMin = Math.Max(1.0, settings.SleepTrackedMinimumMultiplier);

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
                SleepTrackedMinimumMultiplier = trackedMin
            };
        }

        private async Task<SleepTuningSettings> GetSleepTuningSettingsAsync()
        {
            ItemDropsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();

            var row = await conn.QuerySingleOrDefaultAsync<SleepTuningSettings>(@"
SELECT
    COALESCE(SleepHealthyMinHours, 6.0) AS SleepHealthyMinHours,
    COALESCE(SleepHealthyMaxHours, 10.0) AS SleepHealthyMaxHours,
    COALESCE(SleepHealthyMultiplier, 1.10) AS SleepHealthyMultiplier,
    COALESCE(SleepOutsideRangeStartMultiplier, 1.05) AS SleepOutsideRangeStartMultiplier,
    COALESCE(SleepPenaltyPer15Min, 0.005) AS SleepPenaltyPer15Min,
    COALESCE(SleepTrackedMinimumMultiplier, 1.01) AS SleepTrackedMinimumMultiplier
FROM GamificationSettings
WHERE Id = 1;");

            return NormalizeSleepTuningSettings(row ?? new SleepTuningSettings());
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

        private void EnsureSleepSettingsDebugUiBuilt()
        {
            if (_sleepSettingsUiBuilt)
                return;

            if (StepsPerRollBox?.Parent is not StackPanel itemDropRow)
                return;

            if (itemDropRow.Parent is not StackPanel root)
                return;

            int insertAt = root.Children.IndexOf(itemDropRow) + 1;
            if (insertAt <= 0)
                return;

            var header = new TextBlock
            {
                Text = "Sleep tuning",
                FontWeight = FontWeights.Bold,
                Margin = new Thickness(0, 10, 0, 0)
            };

            var row1 = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                Margin = new Thickness(0, 6, 0, 0)
            };

            row1.Children.Add(new TextBlock
            {
                Text = "Healthy min h:",
                Width = 100,
                VerticalAlignment = VerticalAlignment.Center
            });

            _sleepHealthyMinHoursBox = new TextBox
            {
                Width = 60,
                Margin = new Thickness(0, 0, 12, 0)
            };
            row1.Children.Add(_sleepHealthyMinHoursBox);

            row1.Children.Add(new TextBlock
            {
                Text = "Healthy max h:",
                Width = 100,
                VerticalAlignment = VerticalAlignment.Center
            });

            _sleepHealthyMaxHoursBox = new TextBox
            {
                Width = 60
            };
            row1.Children.Add(_sleepHealthyMaxHoursBox);

            var row2 = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                Margin = new Thickness(0, 6, 0, 0)
            };

            row2.Children.Add(new TextBlock
            {
                Text = "Healthy x:",
                Width = 100,
                VerticalAlignment = VerticalAlignment.Center
            });

            _sleepHealthyMultiplierBox = new TextBox
            {
                Width = 60,
                Margin = new Thickness(0, 0, 12, 0)
            };
            row2.Children.Add(_sleepHealthyMultiplierBox);

            row2.Children.Add(new TextBlock
            {
                Text = "Drop / 15 min:",
                Width = 100,
                VerticalAlignment = VerticalAlignment.Center
            });

            _sleepPenaltyPer15MinBox = new TextBox
            {
                Width = 60
            };
            row2.Children.Add(_sleepPenaltyPer15MinBox);

            var row3 = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                Margin = new Thickness(0, 6, 0, 0)
            };

            row3.Children.Add(new TextBlock
            {
                Text = "Tracked min x:",
                Width = 100,
                VerticalAlignment = VerticalAlignment.Center
            });

            _sleepTrackedMinimumMultiplierBox = new TextBox
            {
                Width = 60
            };
            row3.Children.Add(_sleepTrackedMinimumMultiplierBox);

            var note = new TextBlock
            {
                Text = "Visual-only for now. Save wiring comes next.",
                Foreground = System.Windows.Media.Brushes.Gray,
                Margin = new Thickness(0, 4, 0, 0),
                TextWrapping = TextWrapping.Wrap
            };

            root.Children.Insert(insertAt++, header);
            root.Children.Insert(insertAt++, row1);
            root.Children.Insert(insertAt++, row2);
            root.Children.Insert(insertAt++, row3);
            root.Children.Insert(insertAt++, note);

            _sleepSettingsUiBuilt = true;
        }

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
            // 03:00 cutoff: before 3am counts as previous “game day”
            var localTime = nowLocal.LocalDateTime;
            var day = DateOnly.FromDateTime(localTime);

            if (localTime.TimeOfDay < new TimeSpan(3, 0, 0))
                day = day.AddDays(-1);

            return day;
        }

        private static double ComputeSleepMultiplier(SleepTuningSettings settings, int totalMinutes)
        {
            settings = NormalizeSleepTuningSettings(settings);

            if (totalMinutes <= 0)
                return 1.00;

            double totalHours = totalMinutes / 60.0;

            if (totalHours >= settings.SleepHealthyMinHours && totalHours <= settings.SleepHealthyMaxHours)
                return settings.SleepHealthyMultiplier;

            double distanceMinutes =
                totalHours < settings.SleepHealthyMinHours
                    ? (settings.SleepHealthyMinHours * 60.0) - totalMinutes
                    : totalMinutes - (settings.SleepHealthyMaxHours * 60.0);

            double penaltySteps = distanceMinutes / 15.0;

            double mult = settings.SleepHealthyMultiplier
                        - (penaltySteps * settings.SleepPenaltyPer15Min);

            if (mult < settings.SleepTrackedMinimumMultiplier)
                mult = settings.SleepTrackedMinimumMultiplier;

            if (mult > settings.SleepHealthyMultiplier)
                mult = settings.SleepHealthyMultiplier;

            return mult;
        }

        private static string DescribeSleepBand(SleepTuningSettings settings, int totalMinutes)
        {
            settings = NormalizeSleepTuningSettings(settings);

            if (totalMinutes <= 0)
                return "no sleep logged";

            double totalHours = totalMinutes / 60.0;

            if (totalHours < settings.SleepHealthyMinHours)
                return "below healthy range";

            if (totalHours > settings.SleepHealthyMaxHours)
                return "above healthy range";

            return "healthy range";
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

        private async Task RefreshGamificationDebugAsync()
        {
            try
            {
                EnsureSleepSettingsDebugUiBuilt();

                var nowLocal = DateTimeOffset.Now;
                var gameDayNow = GetCurrentGameDayLocal(nowLocal);

                if (NowLocalText != null)
                    NowLocalText.Text = $"Now (local): {nowLocal:yyyy-MM-dd HH:mm:ss}";

                if (GameDayNowText != null)
                    GameDayNowText.Text = $"Game day (03:00 cutoff): {gameDayNow:yyyy-MM-dd}";

                // Selected-day rewards summary
                if (RewardsSummaryText != null)
                {
                    var entries = await _rewardsRepo.GetForGameDayAsync(SelectedLogDate);
                    int coins = 0;
                    int tickets = 0;

                    foreach (var e in entries)
                    {
                        if (e.RewardType == RewardType.FocusCoins) coins += e.Amount;
                        else if (e.RewardType == RewardType.HabitTicketCheckbox) tickets += e.Amount;
                    }

                    RewardsSummaryText.Text =
                        $"Selected day rewards ({SelectedLogDate:yyyy-MM-dd}): {coins} coins, {tickets} tickets | Ledger entries: {entries.Count}";
                }

                var sleepSettings = await GetSleepTuningSettingsAsync();

                SetTextBoxIfIdle(_sleepHealthyMinHoursBox, FormatDoubleForBox(sleepSettings.SleepHealthyMinHours));
                SetTextBoxIfIdle(_sleepHealthyMaxHoursBox, FormatDoubleForBox(sleepSettings.SleepHealthyMaxHours));
                SetTextBoxIfIdle(_sleepHealthyMultiplierBox, FormatDoubleForBox(sleepSettings.SleepHealthyMultiplier));
                SetTextBoxIfIdle(_sleepPenaltyPer15MinBox, FormatDoubleForBox(sleepSettings.SleepPenaltyPer15Min));
                SetTextBoxIfIdle(_sleepTrackedMinimumMultiplierBox, FormatDoubleForBox(sleepSettings.SleepTrackedMinimumMultiplier));

                // Sleep multiplier (applies to the day you woke up — i.e. the selected log date)
                if (SleepMultiplierText != null)
                {
                    var sleeps = await _sleepRepo.GetForWakeDateAsync(SelectedLogDate);
                    int totalMinutes = 0;

                    foreach (var s in sleeps)
                        totalMinutes += Math.Max(0, s.DurationMinutes);

                    double mult = ComputeSleepMultiplier(sleepSettings, totalMinutes);
                    string band = DescribeSleepBand(sleepSettings, totalMinutes);

                    if (totalMinutes <= 0)
                    {
                        SleepMultiplierText.Text = $"Sleep multiplier: x{mult:F2} ({band})";
                    }
                    else
                    {
                        SleepMultiplierText.Text =
                            $"Sleep multiplier: x{mult:F2} (sleep: {FormatMinutes(totalMinutes)}, {band})";
                    }
                }

                // Item drops debug (includes settings + progress + inventory)
                await RefreshItemDropsDebugAsync();
            }
            catch
            {
                // Keep debug UI resilient
            }
        }

        private async Task RefreshItemDropsDebugAsync()
        {
            try
            {
                var settings = await _gamiSettingsRepo.GetAsync();
                var state = await _rollStateRepo.GetAsync();
                var items = await _inventoryRepo.GetAllAsync();

                int stepsPerRoll = Math.Max(1, settings.StepsPerItemRoll);
                int oneInN = Math.Max(1, settings.ItemRollOneInN);
                int remainder = state.StepsRemainder;

                if (remainder < 0) remainder = 0;
                if (remainder >= stepsPerRoll) remainder = remainder % stepsPerRoll;

                int toNext = stepsPerRoll - remainder;

                // Only overwrite textboxes if the user isn't actively editing them
                if (StepsPerRollBox != null && !StepsPerRollBox.IsKeyboardFocusWithin)
                    StepsPerRollBox.Text = settings.StepsPerItemRoll.ToString();

                if (OddsOneInBox != null && !OddsOneInBox.IsKeyboardFocusWithin)
                    OddsOneInBox.Text = settings.ItemRollOneInN.ToString();

                if (ItemDropsProgressText != null)
                {
                    ItemDropsProgressText.Text =
                        $"Item roll progress: {remainder:#,0}/{stepsPerRoll:#,0} steps (next roll in {toNext:#,0})";
                }

                if (ItemDropsStatsText != null)
                {
                    ItemDropsStatsText.Text =
                        $"Total rolls: {state.TotalRolls:#,0} | Total drops: {state.TotalSuccesses:#,0} | Odds: 1/{oneInN}";
                }

                if (ItemDropsLastText != null)
                {
                    if (!string.IsNullOrWhiteSpace(state.LastDropSummary)
                        && !string.IsNullOrWhiteSpace(state.LastDropUtc)
                        && DateTimeOffset.TryParse(state.LastDropUtc, out var dto))
                    {
                        ItemDropsLastText.Text =
                            $"Last drop: {state.LastDropSummary} @ {dto.ToLocalTime():yyyy-MM-dd HH:mm:ss}";
                    }
                    else if (!string.IsNullOrWhiteSpace(state.LastDropSummary))
                    {
                        ItemDropsLastText.Text = $"Last drop: {state.LastDropSummary}";
                    }
                    else
                    {
                        ItemDropsLastText.Text = "Last drop: (none yet)";
                    }
                }

                if (InventoryCountText != null)
                    InventoryCountText.Text = items.Count == 0
                        ? "Inventory: (empty)"
                        : $"Inventory: {items.Count} item types";

                _inventoryItems = new ObservableCollection<InventoryItem>(items);

                if (InventoryGrid != null)
                    InventoryGrid.ItemsSource = _inventoryItems;
            }
            catch
            {
                if (ItemDropsProgressText != null)
                    ItemDropsProgressText.Text = "Item roll progress: (error loading)";
                if (ItemDropsStatsText != null)
                    ItemDropsStatsText.Text = "";
                if (ItemDropsLastText != null)
                    ItemDropsLastText.Text = "";
                if (InventoryCountText != null)
                    InventoryCountText.Text = "Inventory: (error loading)";
            }
        }

        // ============================================================
        // ============================================================
        // SECTION F — Food Actions
        // ============================================================

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


        // ============================================================
        // SECTION G — Data Backup / Restore
        // ============================================================

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

                // 1) DB snapshot file
                string snapshotPath = Path.Combine(backupRoot, $"lifestyles_snapshot_{stamp}.db");

                // 2) JSON archive folder
                string archiveRoot = Path.Combine(backupRoot, "Archive");
                Directory.CreateDirectory(archiveRoot);

                await BackupService.CreateDbSnapshotAsync(snapshotPath);
                await BackupService.ExportArchiveAsync(archiveRoot);

                MessageBox.Show(
                    $"Backup created:\n\n{backupRoot}\n\nIncludes:\n- DB snapshot (.db)\n- JSON archive (Archive folder)",
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
                    Title = "Select DB snapshot to restore",
                    Filter = "SQLite DB (*.db)|*.db|All files (*.*)|*.*",
                    CheckFileExists = true,
                    Multiselect = false
                };

                if (dlg.ShowDialog(this) != true)
                    return;

                var confirm = MessageBox.Show(
                    "This will REPLACE your current database with the snapshot you selected.\n\nContinue?",
                    "Confirm restore",
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
                string? folder = PickFolder("Choose the root folder of the archive to import");
                if (string.IsNullOrWhiteSpace(folder))
                    return;

                var confirm = MessageBox.Show(
                    "This will MERGE the archive into your current database.\n\nContinue?",
                    "Confirm import (merge)",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Question);

                if (confirm != MessageBoxResult.Yes)
                    return;

                await BackupService.ImportArchiveAsync(folder, ArchiveImportMode.Merge);

                await InitializeAndRefreshAsync();

                MessageBox.Show("Archive import (merge) complete.", "Import complete", MessageBoxButton.OK, MessageBoxImage.Information);
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
                string? folder = PickFolder("Choose the root folder of the archive to import");
                if (string.IsNullOrWhiteSpace(folder))
                    return;

                var range = PromptDateRange();
                if (range is null)
                    return;

                var confirm = MessageBox.Show(
                    $"This will DELETE and REPLACE data in the date range:\n\n{range.Value.Start:yyyy-MM-dd} to {range.Value.End:yyyy-MM-dd}\n\nContinue?",
                    "Confirm import (replace date range)",
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

                MessageBox.Show("Archive import (replace date range) complete.", "Import complete", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Import failed", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private static string? PickFolder(string title)
        {
            // WPF doesn't have a native folder picker.
            // This OpenFileDialog trick returns a folder path without requiring WinForms references.
            var dlg = new OpenFileDialog
            {
                Title = title,
                CheckFileExists = false,
                CheckPathExists = true,
                ValidateNames = false,
                FileName = "Select folder"
            };

            if (dlg.ShowDialog() != true)
                return null;

            return Path.GetDirectoryName(dlg.FileName);
        }

        private static (DateOnly Start, DateOnly End)? PromptDateRange()
        {
            // Simple modal input window: Start + End in yyyy-MM-dd
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
        // ============================================================
        // SECTION H — Edit/Delete Entries (Focus + Food)
        // ============================================================

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

    }
}

// ============================================================
// SECTION I — Steps + Habits
// ============================================================

namespace LifestylesDesktop
{
    public partial class MainWindow
    {
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
    }
}