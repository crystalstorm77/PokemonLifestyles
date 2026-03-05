// ============================================================
// SECTION A — Usings
// ============================================================

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

// ============================================================
// SECTION B — Event handlers missing from MainWindow.xaml.cs
// ============================================================

namespace LifestylesDesktop
{
    public partial class MainWindow : Window
    {
        // ============================================================
        // SECTION C — Steps handlers
        // ============================================================

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
                string whenText = (StepsAtBox.Text ?? "").Trim();

                if (string.IsNullOrWhiteSpace(whenText))
                {
                    localWhen = DateTime.Now;
                }
                else
                {
                    if (!TryParseLocalDateTimeFallback(whenText, out localWhen))
                    {
                        MessageBox.Show("Time must be: yyyy-MM-dd HH:mm (or yyyy-MM-dd HH:mm:ss)");
                        return;
                    }
                }

                await _stepsRepo.AddStepsAsync(localWhen, steps, source: "ManualDesktop");

                StepsAddBox.Text = "";
                StepsAtBox.Text = "";

                await RefreshForSelectedDateAsync();
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

        // ============================================================
        // SECTION D — Habits handlers
        // ============================================================

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

                await _habitRepo.AddDailyDeltaAsync(h.Id, SelectedLogDate, delta);

                HabitAddAmountBox.Text = "";

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
            if (_habitsUiUpdating || _habitArchiveOpInProgress)
                return;

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
                if (_habitArchiveOpInProgress)
                    return;

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

        // ============================================================
        // SECTION E — Rewards viewer handler
        // ============================================================

        private async void ViewRewardsForSelectedDay_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var entries = await _rewardsRepo.GetForGameDayAsync(SelectedLogDate);

                // Best-effort lookup of focus sessions currently loaded in the UI
                var focusList = (_focusSessions ?? new System.Collections.ObjectModel.ObservableCollection<FocusSession>()).ToList();
                var focusById = focusList.ToDictionary(x => x.Id, x => x);

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
                        // Award time
                        if (!DateTimeOffset.TryParse(e1.AwardedAtUtc, out var awardedUtc))
                            awardedUtc = DateTimeOffset.UtcNow;

                        string source = "";

                        if (e1.HabitId.HasValue)
                        {
                            source = $"HabitId {e1.HabitId.Value} ({e1.HabitDate})";
                        }
                        else if (e1.FocusSessionId.HasValue)
                        {
                            long id = e1.FocusSessionId.Value;

                            if (focusById.TryGetValue(id, out var fs))
                            {
                                // If focus exists, show its *current* label/minutes/completed
                                source = $"Focus ID {fs.Id} ({(fs.FocusType ?? "").Trim()}, {fs.Minutes}m, Completed={fs.Completed})";

                                // If the current state would produce a different coin amount, flag it.
                                if (e1.RewardType == RewardType.FocusCoins)
                                {
                                    int expected = PreviewFocusCoins(fs.Minutes, fs.Completed);
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

        // ============================================================
        // SECTION F — Small helpers (local to this file)
        // ============================================================

        private static int PreviewFocusCoins(int minutes, bool completed)
        {
            if (minutes <= 0) return 0;

            // Completed sessions: 1 coin per minute
            if (completed) return minutes;

            // Incomplete sessions: 0.25x, floored (e.g. 77 -> 19)
            return (int)Math.Floor(minutes * 0.25);
        }

        private sealed class RewardDisplayRow
        {
            public string AwardedLocal { get; set; } = "";
            public string Type { get; set; } = "";
            public int Amount { get; set; }
            public string Source { get; set; } = "";
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
    }
}