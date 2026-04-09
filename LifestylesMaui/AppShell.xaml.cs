namespace LifestylesMaui
{
    public partial class AppShell : Shell
    {
        #region SEGMENT A - Construction
        public AppShell()
        {
            InitializeComponent();
            Routing.RegisterRoute(nameof(FocusPage), typeof(FocusPage));
        }
        #endregion // SEGMENT A - Construction
    }
}
