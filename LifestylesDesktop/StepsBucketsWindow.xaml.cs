using System;
using System.Threading.Tasks;
using System.Windows;
using LifestyleCore.Data;

namespace LifestylesDesktop
{
    public partial class StepsBucketsWindow : Window
    {
        #region SECTION B — Window
        private readonly DateOnly _date;
        private readonly StepsRepository _repo = new();

        public StepsBucketsWindow(DateOnly date)
        {
            InitializeComponent();
            _date = date;
            Loaded += StepsBucketsWindow_Loaded;
        }
        #endregion // SECTION B — Window

        #region SECTION C — Load / Refresh
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
        #endregion // SECTION C — Load / Refresh

        #region SECTION D — Buttons
        private void Close_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }
        #endregion // SECTION D — Buttons
    }
}