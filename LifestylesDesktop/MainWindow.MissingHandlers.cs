using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using Dapper;
using LifestyleCore.Data;
using LifestyleCore.Models;

// ---- Resolve WinForms/WPF name collisions introduced by <UseWindowsForms>true</UseWindowsForms> ----
using MessageBox = System.Windows.MessageBox;
using Button = System.Windows.Controls.Button;
using DataGrid = System.Windows.Controls.DataGrid;
using StackPanel = System.Windows.Controls.StackPanel;
using TextBlock = System.Windows.Controls.TextBlock;

namespace LifestylesDesktop
{
    public partial class MainWindow : Window
    {

        #region SECTION C — Steps handlers
        private async void AddStepsButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (!int.TryParse((StepsAddBox.Text ?? "").Trim(), out int steps) || steps <= 0)
                {
                    MessageBox.Show("Steps must be a whole number greater than 0.");
                    return;
                }

                DateTime localWhen;
                DateOnly archiveViewDateAfterSave;

                string whenText = (StepsAtBox.Text ?? "").Trim();

                if (string.IsNullOrWhiteSpace(whenText))
                {
                    var effectiveNowLocal = GetEffectiveCurrentLocalTime();
                    localWhen = effectiveNowLocal.LocalDateTime;
                    archiveViewDateAfterSave = DateOnly.FromDateTime(localWhen);
                }
                else
                {
                    if (!TryParseLocalDateTimeFallback(whenText, out localWhen))
                    {
                        MessageBox.Show("Time must be: yyyy-MM-dd HH:mm (or yyyy-MM-dd HH:mm:ss)");
                        return;
                    }

                    archiveViewDateAfterSave = DateOnly.FromDateTime(localWhen);
                }

                await _stepsRepo.AddStepsAsync(localWhen, steps, source: "ManualDesktop");

                // Steps → Item drops (global; separate from tickets)
                await _stepItemDrops.ProcessStepsAddedAsync(steps);

                // Steps → Egg progress (honest raw steps, live sleep-adjusted hatch threshold)
                DateOnly eggGameDay = SleepRewardCalculator.GetGameDayForWakeLocal(localWhen);
                double eggSleepMultiplier = await GetSleepMultiplierForGameDayAsync(eggGameDay);

                var eggResult = await _eggService.ProcessStepsAddedAsync(
                    rawStepsAdded: steps,
                    effectiveNowLocal: LocalDateTimeToLocalOffset(localWhen),
                    sleepMultiplier: eggSleepMultiplier);

                StepsAddBox.Text = "";
                StepsAtBox.Text = "";

                if (SelectedLogDate != archiveViewDateAfterSave)
                    await SwitchArchiveViewToDateAsync(archiveViewDateAfterSave);
                else
                    await RefreshForSelectedDateAsync();

                if (eggResult.Hatched)
                {
                    string rarityText = eggResult.Rarity?.ToString() ?? "Unknown";
                    MessageBox.Show(
                        $"Your {rarityText} egg hatched!\n\nPokémon: {eggResult.Species}",
                        "Egg hatched");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not add steps");
            }
        }

        private async void ViewStepsBucketsButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var rows = await _stepsRepo.GetBucketsForLocalDateAsync(SelectedLogDate);

                var win = new Window
                {
                    Title = $"Step buckets ({SelectedLogDate:yyyy-MM-dd})",
                    Width = 360,
                    Height = 520,
                    WindowStartupLocation = WindowStartupLocation.CenterOwner,
                    Owner = this
                };

                var root = new StackPanel { Margin = new Thickness(12) };

                if (rows.Count == 0)
                {
                    root.Children.Add(new TextBlock
                    {
                        Text = "No buckets for this day.",
                        Foreground = System.Windows.Media.Brushes.Gray
                    });
                }
                else
                {
                    var grid = new DataGrid
                    {
                        AutoGenerateColumns = false,
                        CanUserAddRows = false,
                        CanUserDeleteRows = false,
                        IsReadOnly = true,
                        Height = 420,
                        ItemsSource = rows
                    };

                    grid.Columns.Add(new DataGridTextColumn
                    {
                        Header = "Time",
                        Binding = new System.Windows.Data.Binding("LocalTime")
                    });

                    grid.Columns.Add(new DataGridTextColumn
                    {
                        Header = "Steps",
                        Binding = new System.Windows.Data.Binding("Steps")
                    });

                    root.Children.Add(grid);
                }

                var close = new Button
                {
                    Content = "Close",
                    Width = 100,
                    Margin = new Thickness(0, 10, 0, 0),
                    HorizontalAlignment = System.Windows.HorizontalAlignment.Right
                };

                close.Click += (_, __) => win.Close();

                root.Children.Add(close);

                win.Content = root;
                win.ShowDialog();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not load step buckets");
            }
        }
        #endregion // SECTION C — Steps handlers

        #region SECTION D — Inventory + Item Drops handlers
        private async void InventoryMinus_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var key = (sender as Button)?.Tag as string;
                if (string.IsNullOrWhiteSpace(key)) return;

                await _inventoryRepo.AdjustItemAsync(key, -1);
                await RefreshItemDropsDebugAsync();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not update inventory");
            }
        }

        private async void InventoryPlus_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var key = (sender as Button)?.Tag as string;
                if (string.IsNullOrWhiteSpace(key)) return;

                await _inventoryRepo.AdjustItemAsync(key, +1);
                await RefreshItemDropsDebugAsync();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not update inventory");
            }
        }

        private async void ClearInventory_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var result = MessageBox.Show(
                    "Clear ALL inventory items?\n\n(This does not affect steps, rolls, or tickets.)",
                    "Confirm",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Warning);

                if (result != MessageBoxResult.Yes) return;

                await _inventoryRepo.ClearAsync();
                await RefreshItemDropsDebugAsync();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not clear inventory");
            }
        }

        private async void SaveItemDropSettings_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (!int.TryParse((StepsPerRollBox.Text ?? "").Trim(), out int stepsPerRoll) || stepsPerRoll <= 0)
                {
                    MessageBox.Show("Steps/roll must be a whole number greater than 0.");
                    return;
                }

                if (!int.TryParse((OddsOneInBox.Text ?? "").Trim(), out int oneInN) || oneInN <= 0)
                {
                    MessageBox.Show("Odds (1 in) must be a whole number greater than 0.");
                    return;
                }

                if (!int.TryParse((CommonWeightBox.Text ?? "").Trim(), out int commonW) || commonW < 0 ||
                    !int.TryParse((UncommonWeightBox.Text ?? "").Trim(), out int uncommonW) || uncommonW < 0 ||
                    !int.TryParse((RareWeightBox.Text ?? "").Trim(), out int rareW) || rareW < 0)
                {
                    MessageBox.Show("Tier weights must be whole numbers >= 0.");
                    return;
                }

                if (commonW + uncommonW + rareW <= 0)
                {
                    MessageBox.Show("At least one tier weight must be > 0.");
                    return;
                }

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
                    MessageBox.Show("Healthy min h must be a number greater than or equal to 0.");
                    return;
                }

                if (!TryParseFlexibleDouble(_sleepHealthyMaxHoursBox.Text, out double healthyMaxHours) || healthyMaxHours < healthyMinHours)
                {
                    MessageBox.Show("Healthy max h must be a number greater than or equal to healthy min h.");
                    return;
                }

                if (!TryParseFlexibleDouble(_sleepHealthyMultiplierBox.Text, out double healthyMultiplier) || healthyMultiplier < 1.0)
                {
                    MessageBox.Show("Healthy x must be a number greater than or equal to 1.0.");
                    return;
                }

                if (!TryParseFlexibleDouble(_sleepPenaltyPer15MinBox.Text, out double penaltyPer15Min) || penaltyPer15Min < 0)
                {
                    MessageBox.Show("Drop / 15 min must be a number greater than or equal to 0.");
                    return;
                }

                if (!TryParseFlexibleDouble(_sleepTrackedMinimumMultiplierBox.Text, out double trackedMinimumMultiplier) || trackedMinimumMultiplier < 1.0)
                {
                    MessageBox.Show("Tracked min x must be a number greater than or equal to 1.0.");
                    return;
                }

                if (trackedMinimumMultiplier > healthyMultiplier)
                {
                    MessageBox.Show("Tracked min x cannot be greater than healthy x.");
                    return;
                }

                if (!int.TryParse((_sleepRewardMinimumMinutesBox.Text ?? "").Trim(), out int rewardMinimumMinutes) || rewardMinimumMinutes < 1)
                {
                    MessageBox.Show("Minimum Sleep Minutes for Reward-Eligibility must be a whole number greater than or equal to 1.");
                    return;
                }

                await _gamiSettingsRepo.UpdateAsync(stepsPerRoll, oneInN, commonW, uncommonW, rareW);

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
                MessageBox.Show("Saved gamification settings.");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not save gamification settings");
            }
        }

        private async void ResetTierWeights_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // Keep steps/odds as-is, reset only tier weights to defaults.
                int stepsPerRoll = 1000;
                int oneInN = 4;

                int.TryParse((StepsPerRollBox.Text ?? "").Trim(), out stepsPerRoll);
                int.TryParse((OddsOneInBox.Text ?? "").Trim(), out oneInN);

                stepsPerRoll = Math.Max(1, stepsPerRoll);
                oneInN = Math.Max(1, oneInN);

                if (CommonWeightBox != null) CommonWeightBox.Text = "80";
                if (UncommonWeightBox != null) UncommonWeightBox.Text = "18";
                if (RareWeightBox != null) RareWeightBox.Text = "2";

                await _gamiSettingsRepo.UpdateAsync(stepsPerRoll, oneInN, 80, 18, 2);
                await RefreshItemDropsDebugAsync();

                MessageBox.Show("Reset tier weights.");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not reset tier weights");
            }
        }

        private async void ResetItemList_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var result = MessageBox.Show(
                    "Reset the DROP ITEM LIST back to defaults?\n\nThis can remove custom items you added.\n(It does NOT change your inventory counts.)",
                    "Confirm",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Warning);

                if (result != MessageBoxResult.Yes) return;

                await _itemDefsRepo.ResetToDefaultsAsync();
                await RefreshItemDropsDebugAsync();

                MessageBox.Show("Reset item list to defaults.");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not reset item list");
            }
        }

        private async void AddItemDefinition_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                string name = (NewItemNameBox?.Text ?? "").Trim();
                if (string.IsNullOrWhiteSpace(name))
                {
                    MessageBox.Show("Type an item name first.");
                    return;
                }

                string category = (NewItemCategoryBox?.Text ?? "").Trim();

                var tierObj = NewItemTierCombo?.SelectedItem;
                if (tierObj is not ItemTier tier)
                    tier = ItemTier.Common;

                int weight = 1;
                int.TryParse((NewItemWeightBox?.Text ?? "").Trim(), out weight);
                weight = Math.Max(1, weight);

                await _itemDefsRepo.UpsertActiveAsync(name, tier, weight, category);

                if (NewItemNameBox != null) NewItemNameBox.Text = "";
                if (NewItemCategoryBox != null) NewItemCategoryBox.Text = "";
                if (NewItemWeightBox != null) NewItemWeightBox.Text = "1";

                await RefreshItemDropsDebugAsync();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not add item");
            }
        }

        private async void SaveItemDefinitions_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // Save current grid contents (category/tier/weight/active)
                await _itemDefsRepo.UpsertManyAsync(_itemDefinitions);
                await RefreshItemDropsDebugAsync();

                MessageBox.Show("Saved item list changes.");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not save item list changes");
            }
        }

        private async void DeleteSelectedItemDefinition_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (ItemDefinitionsGrid?.SelectedItem is not ItemDefinition sel)
                {
                    MessageBox.Show("Select an item first.");
                    return;
                }

                var result = MessageBox.Show(
                    $"Deactivate '{sel.Name}'?\n\n(This stops it dropping, but does not affect your inventory.)",
                    "Confirm",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Warning);

                if (result != MessageBoxResult.Yes) return;

                await _itemDefsRepo.SetActiveAsync(sel.Name, isActive: false);
                await RefreshItemDropsDebugAsync();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not deactivate item");
            }
        }
        #endregion // SECTION D — Inventory + Item Drops handlers

        #region SECTION E — Habits handlers
        private async void AddHabitAmountButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (HabitLogCombo.SelectedItem is not HabitDbRow h)
                {
                    MessageBox.Show("Pick a numeric habit first.");
                    return;
                }

                if (h.Kind != HabitKind.NumericDaily)
                {
                    MessageBox.Show("That habit is not numeric.");
                    return;
                }

                if (!int.TryParse((HabitAddAmountBox.Text ?? "").Trim(), out int delta) || delta <= 0)
                {
                    MessageBox.Show("Add amount must be a whole number greater than 0.");
                    return;
                }

                var effectiveGameDay = GetEffectiveCurrentGameDay();
                await _habitRepo.AddDailyDeltaAsync(h.Id, effectiveGameDay, delta);
                HabitAddAmountBox.Text = "";

                if (SelectedLogDate != effectiveGameDay)
                    await SwitchArchiveViewToDateAsync(effectiveGameDay);
                else
                    await RefreshForSelectedDateAsync();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not add habit progress");
            }
        }

        private void HabitsGridRow_PreviewMouseRightButtonDown(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            if (sender is System.Windows.Controls.DataGridRow row)
            {
                row.IsSelected = true;
                HabitsGrid.SelectedItem = row.Item;
                HabitsGrid.Focus();
            }
        }

        private async void HabitArchivedToday_Click(object sender, RoutedEventArgs e)
        {
            // These flags exist in your main file; reading them here also removes the “never used” warnings.
            if (_habitsUiUpdating || _habitArchiveOpInProgress) return;

            try
            {
                _habitArchiveOpInProgress = true;

                if (sender is not System.Windows.Controls.CheckBox cb || cb.DataContext is not HabitRow row)
                    return;

                await EnsureHabitsArchivedAtUtcColumnExistsAsync();

                bool desiredArchivedToday = cb.IsChecked == true;
                bool currentlyArchivedToday = row.ArchivedLocalDate.HasValue && row.ArchivedLocalDate.Value == SelectedLogDate;

                if (desiredArchivedToday == currentlyArchivedToday)
                    return;

                if (desiredArchivedToday)
                {
                    await SetHabitArchivedAtLocalDateAsync(row.HabitId, SelectedLogDate);
                }
                else
                {
                    if (currentlyArchivedToday)
                        await ClearHabitArchivedAtUtcAsync(row.HabitId);
                }

                await RefreshForSelectedDateAsync();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not update archive status");
            }
            finally
            {
                _habitArchiveOpInProgress = false;
            }
        }

        private async void ArchiveSelectedHabit_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (_habitArchiveOpInProgress) return;

                if (HabitsGrid.SelectedItem is not HabitRow target)
                {
                    MessageBox.Show("Select a habit first.");
                    return;
                }

                var confirm = MessageBox.Show(
                    $"Archive “{target.Title}” on {SelectedLogDate:yyyy-MM-dd}?\n\nIt will still appear on this day, and stop appearing from the next day onward.",
                    "Confirm archive",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Warning);

                if (confirm != MessageBoxResult.Yes)
                    return;

                _habitArchiveOpInProgress = true;

                await EnsureHabitsArchivedAtUtcColumnExistsAsync();
                await SetHabitArchivedAtLocalDateAsync(target.HabitId, SelectedLogDate);
                await RefreshForSelectedDateAsync();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not archive habit");
            }
            finally
            {
                _habitArchiveOpInProgress = false;
            }
        }
        #endregion // SECTION E — Habits handlers

        #region SECTION F — Rewards viewer handler
        private async void ViewRewardsForSelectedDay_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var entries = await _rewardsRepo.GetForGameDayAsync(SelectedLogDate);

                // Best-effort lookup of focus sessions currently loaded in the UI
                var focusList = (_focusSessions ?? new System.Collections.ObjectModel.ObservableCollection<FocusSession>()).ToList();
                var focusById = focusList.ToDictionary(x => x.Id, x => x);

                var allHabits = await GetAllHabitsDbAsync();
                var habitTitleById = allHabits.ToDictionary(x => x.Id, x => x.Title);

                double currentSleepMultiplier = 1.0;
                double currentFocusXpPerMinute = GetDefaultFocusXpPerMinute();
                double currentFocusXpIncompleteMultiplier = GetDefaultFocusXpIncompleteMultiplier();

                if (entries.Any(x => x.FocusSessionId.HasValue))
                {
                    var gami = await _gamiSettingsRepo.GetAsync();
                    currentFocusXpPerMinute = gami.FocusXpPerMinute;
                    currentFocusXpIncompleteMultiplier = gami.FocusXpIncompleteMultiplier;

                    var currentSleepSummary = BuildSleepRewardSummary(
                        new SleepTuningSettings
                        {
                            SleepHealthyMinHours = gami.SleepHealthyMinHours,
                            SleepHealthyMaxHours = gami.SleepHealthyMaxHours,
                            SleepHealthyMultiplier = gami.SleepHealthyMultiplier,
                            SleepOutsideRangeStartMultiplier = gami.SleepOutsideRangeStartMultiplier,
                            SleepPenaltyPer15Min = gami.SleepPenaltyPer15Min,
                            SleepTrackedMinimumMultiplier = gami.SleepTrackedMinimumMultiplier,
                            SleepRewardMinimumMinutes = gami.SleepRewardMinimumMinutes
                        },
                        (_sleepSessions ?? new System.Collections.ObjectModel.ObservableCollection<SleepSession>())
                            .OrderBy(x => x.EndUtc)
                            .ThenBy(x => x.Id)
                            .Select(x => Math.Max(0, x.DurationMinutes)));

                    currentSleepMultiplier = Math.Max(1.0, currentSleepSummary.Multiplier);
                }

                var win = new Window
                {
                    Title = $"Rewards ledger ({SelectedLogDate:yyyy-MM-dd})",
                    Width = 520,
                    Height = 520,
                    WindowStartupLocation = WindowStartupLocation.CenterOwner,
                    Owner = this
                };

                var root = new StackPanel { Margin = new Thickness(12) };

                if (entries.Count == 0)
                {
                    root.Children.Add(new TextBlock
                    {
                        Text = "No rewards for this day.",
                        Foreground = System.Windows.Media.Brushes.Gray
                    });
                }
                else
                {
                    var display = new List<RewardDisplayRow>();

                    foreach (var e1 in entries)
                    {
                        if (!DateTimeOffset.TryParse(e1.AwardedAtUtc, out var awardedUtc))
                            awardedUtc = DateTimeOffset.UtcNow;

                        string source = "";

                        if (e1.RewardType == RewardType.HabitTicketWeeklyBonus)
                        {
                            string habitTitle = e1.HabitId.HasValue && habitTitleById.TryGetValue(e1.HabitId.Value, out var title)
                                ? title
                                : $"HabitId {e1.HabitId?.ToString() ?? "?"}";

                            source = $"Weekly habit bonus ({habitTitle}, week of {e1.HabitDate})";
                        }
                        else if (e1.RewardType == RewardType.SleepTicketWeeklyBonus)
                        {
                            source = $"Weekly sleep bonus (week of {e1.HabitDate})";
                        }
                        else if (e1.RewardType == RewardType.StepsTicketWeeklyBonus)
                        {
                            source = $"Weekly steps bonus (week of {e1.HabitDate})";
                        }
                        else if (e1.HabitId.HasValue)
                        {
                            source = $"HabitId {e1.HabitId.Value} ({e1.HabitDate})";
                        }
                        else if (e1.FocusSessionId.HasValue)
                        {
                            long id = e1.FocusSessionId.Value;

                            if (focusById.TryGetValue(id, out var fs))
                            {
                                source = $"Focus ID {fs.Id} ({(fs.FocusType ?? "").Trim()}, {fs.Minutes}m, Completed={fs.Completed})";

                                if (e1.RewardType == RewardType.FocusCoins)
                                {
                                    int expected = PreviewFocusCoins(fs.Minutes, fs.Completed, currentSleepMultiplier);
                                    if (expected != e1.Amount)
                                        source += " — changed since award";
                                }
                                else if (e1.RewardType == RewardType.TrainerXp)
                                {
                                    int expected = PreviewFocusTrainerXp(
                                        fs.Minutes,
                                        fs.Completed,
                                        currentFocusXpPerMinute,
                                        currentFocusXpIncompleteMultiplier,
                                        currentSleepMultiplier);

                                    if (expected != e1.Amount)
                                        source += " — changed since award";
                                }
                            }
                            else
                            {
                                source = $"Focus ID {id} — deleted";
                            }
                        }

                        display.Add(new RewardDisplayRow
                        {
                            AwardedLocal = awardedUtc.ToLocalTime().ToString("yyyy-MM-dd HH:mm:ss"),
                            Type = e1.RewardType.ToString(),
                            Amount = e1.Amount,
                            Source = source
                        });
                    }

                    var grid = new DataGrid
                    {
                        AutoGenerateColumns = false,
                        CanUserAddRows = false,
                        CanUserDeleteRows = false,
                        IsReadOnly = true,
                        Height = 420,
                        ItemsSource = display
                    };

                    grid.Columns.Add(new DataGridTextColumn
                    {
                        Header = "Awarded (local)",
                        Binding = new System.Windows.Data.Binding(nameof(RewardDisplayRow.AwardedLocal))
                    });

                    grid.Columns.Add(new DataGridTextColumn
                    {
                        Header = "Type",
                        Binding = new System.Windows.Data.Binding(nameof(RewardDisplayRow.Type))
                    });

                    grid.Columns.Add(new DataGridTextColumn
                    {
                        Header = "Amount",
                        Binding = new System.Windows.Data.Binding(nameof(RewardDisplayRow.Amount))
                    });

                    grid.Columns.Add(new DataGridTextColumn
                    {
                        Header = "Source",
                        Binding = new System.Windows.Data.Binding(nameof(RewardDisplayRow.Source))
                    });

                    root.Children.Add(grid);
                }

                var close = new Button
                {
                    Content = "Close",
                    Width = 100,
                    Margin = new Thickness(0, 10, 0, 0),
                    HorizontalAlignment = System.Windows.HorizontalAlignment.Right
                };

                close.Click += (_, __) => win.Close();
                root.Children.Add(close);

                win.Content = root;
                win.ShowDialog();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not load rewards ledger");
            }
        }
        #endregion // SECTION F — Rewards viewer handler

        #region SECTION G — Small helpers (local to this file)
        private static int PreviewFocusCoins(int minutes, bool completed, double sleepMultiplier)
        {
            if (minutes <= 0)
                return 0;

            double normalizedSleepMultiplier = Math.Max(1.0, sleepMultiplier);
            double completionMultiplier = completed ? 1.0 : 0.25;

            return (int)Math.Floor(minutes * completionMultiplier * normalizedSleepMultiplier);
        }

        private static int PreviewFocusTrainerXp(
            int minutes,
            bool completed,
            double focusXpPerMinute,
            double focusXpIncompleteMultiplier,
            double sleepMultiplier)
        {
            if (minutes <= 0)
                return 0;

            double normalizedXpPerMinute = Math.Max(0.0, focusXpPerMinute);
            double normalizedIncompleteMultiplier = Math.Clamp(focusXpIncompleteMultiplier, 0.0, 1.0);
            double normalizedSleepMultiplier = Math.Max(1.0, sleepMultiplier);
            double completionMultiplier = completed ? 1.0 : normalizedIncompleteMultiplier;

            return (int)Math.Floor(minutes * normalizedXpPerMinute * completionMultiplier * normalizedSleepMultiplier);
        }

        private sealed class RewardDisplayRow
        {
            public string AwardedLocal { get; set; } = "";
            public string Type { get; set; } = "";
            public int Amount { get; set; }
            public string Source { get; set; } = "";
        }

        private static bool IsTicketRewardType(RewardType rewardType)
        {
            return rewardType == RewardType.HabitTicketCheckbox ||
                   rewardType == RewardType.HabitTicketWeeklyBonus ||
                   rewardType == RewardType.SleepTicketWeeklyBonus ||
                   rewardType == RewardType.StepsTicketWeeklyBonus ||
                   rewardType == RewardType.WeeklyCrateTicketSpend;
        }

        private static bool TryParseLocalDateTimeFallback(string text, out DateTime localDateTime)
        {
            string input = (text ?? "").Trim();
            string[] formats = { "yyyy-MM-dd HH:mm", "yyyy-MM-dd HH:mm:ss" };

            return DateTime.TryParseExact(
                input,
                formats,
                CultureInfo.InvariantCulture,
                DateTimeStyles.AllowWhiteSpaces,
                out localDateTime);
        }

        private async Task EnsureHabitsArchivedAtUtcColumnExistsAsync()
        {
            using var conn = Db.OpenConnection();

            var colNames = (await conn.QueryAsync<string>("SELECT name FROM pragma_table_info('Habits');"))
                .Select(x => (x ?? "").Trim())
                .ToList();

            bool hasArchivedAtUtc = colNames.Any(n => string.Equals(n, "ArchivedAtUtc", StringComparison.OrdinalIgnoreCase));

            if (!hasArchivedAtUtc)
                await conn.ExecuteAsync("ALTER TABLE Habits ADD COLUMN ArchivedAtUtc TEXT NULL;");
        }

        private static DateTimeOffset LocalDateToUtcNoonAnchor(DateOnly localDate)
        {
            var localNoon = new DateTime(localDate.Year, localDate.Month, localDate.Day, 12, 0, 0, DateTimeKind.Unspecified);
            var utc = TimeZoneInfo.ConvertTimeToUtc(localNoon, TimeZoneInfo.Local);
            return new DateTimeOffset(utc, TimeSpan.Zero);
        }

        private async Task SetHabitArchivedAtLocalDateAsync(long habitId, DateOnly localArchiveDate)
        {
            var archiveUtc = LocalDateToUtcNoonAnchor(localArchiveDate);

            using var conn = Db.OpenConnection();

            await conn.ExecuteAsync(
                @"UPDATE Habits SET ArchivedAtUtc = @ArchivedAtUtc WHERE Id = @Id;",
                new { Id = habitId, ArchivedAtUtc = archiveUtc.ToString("O") });
        }

        private async Task ClearHabitArchivedAtUtcAsync(long habitId)
        {
            using var conn = Db.OpenConnection();

            await conn.ExecuteAsync(
                @"UPDATE Habits SET ArchivedAtUtc = NULL WHERE Id = @Id;",
                new { Id = habitId });
        }

        private async Task<double> GetSleepMultiplierForGameDayAsync(DateOnly gameDay)
        {
            var gami = await _gamiSettingsRepo.GetAsync();
            var sleepSessions = await _sleepRepo.GetForWakeDateAsync(gameDay);

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

            return Math.Max(1.0, summary.Multiplier);
        }
        #endregion // SECTION G — Small helpers (local to this file)
    }
}
