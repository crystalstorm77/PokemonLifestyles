// ============================================================
// SECTION A — Usings
// ============================================================
using System;
using System.Threading.Tasks;
using System.Windows;
using LifestyleCore.Data;

// ============================================================
// SECTION B — Window
// ============================================================
namespace LifestylesDesktop
{
    public partial class StepsBucketsWindow : Window
    {
        private readonly DateOnly _date;
        private readonly StepsRepository _repo = new();

        public StepsBucketsWindow(DateOnly date)
        {
            InitializeComponent();
            _date = date;
            Loaded += StepsBucketsWindow_Loaded;
        }

        // ============================================================
        // SECTION C — Load / Refresh
        // ============================================================
        private async void StepsBucketsWindow_Loaded(object sender, RoutedEventArgs e)
        {
            await RefreshAsync();
        }

        private async Task RefreshAsync()
        {
            HeaderText.Text = $"Step buckets ({_date:yyyy-MM-dd})";

            var buckets = await _repo.GetBucketsForDateAsync(_date);
            BucketsGrid.ItemsSource = buckets;
        }

        // ============================================================
        // SECTION D — Buttons
        // ============================================================
        private void Close_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }
    }
}