// ============================================================
// SECTION A — Usings
// ============================================================
using System;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using System.Windows;
using LifestyleCore.Data;
using LifestyleCore.Models;

// Explicit alias to avoid WinForms/WPF ambiguity (from <UseWindowsForms>true</UseWindowsForms>)
using MessageBox = System.Windows.MessageBox;
// ============================================================
// SECTION B — Window Logic
// ============================================================
namespace LifestylesDesktop
{
    public partial class FoodMenuWindow : Window
    {
        private readonly FoodItemRepository _repo = new();
        private ObservableCollection<FoodItem> _items = new();

        public FoodMenuWindow()
        {
            InitializeComponent();
            Loaded += FoodMenuWindow_Loaded;
        }

        // ============================================================
        // SECTION C — Load / Refresh
        // ============================================================
        private async void FoodMenuWindow_Loaded(object sender, RoutedEventArgs e)
        {
            await RefreshAsync();
        }

        private async Task RefreshAsync()
        {
            var items = await _repo.GetAllAsync();
            _items = new ObservableCollection<FoodItem>(items);
            FoodGrid.ItemsSource = _items;
        }

        // ============================================================
        // SECTION D — Button Handlers
        // ============================================================
        private async void SaveChanges_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // Commit any in-progress cell edits
                FoodGrid.CommitEdit();
                FoodGrid.CommitEdit();

                foreach (var item in _items)
                {
                    // Normalize: treat <=0 as null for kJ/100g
                    if (item.KjPer100g.HasValue && item.KjPer100g.Value <= 0)
                        item.KjPer100g = null;

                    await _repo.UpdateAsync(item);
                }

                MessageBox.Show("Saved.");
                await RefreshAsync();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not save changes");
            }
        }

        private async void DeleteSelected_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (FoodGrid.SelectedItem is not FoodItem selected)
                {
                    MessageBox.Show("Select a food first.");
                    return;
                }

                var result = MessageBox.Show(
                    $"Delete “{selected.Name}” from the menu?\n\nYour existing food history will remain intact.",
                    "Confirm delete",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Warning);

                if (result != MessageBoxResult.Yes)
                    return;

                await _repo.DeleteAsync(selected.Id);
                _items.Remove(selected);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Could not delete food");
            }
        }

        private void Close_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }
    }
}