using LifestyleCore.Data;

// Explicit aliases to avoid WinForms/WPF ambiguity (from <UseWindowsForms>true</UseWindowsForms>)
using Application = System.Windows.Application;
using StartupEventArgs = System.Windows.StartupEventArgs;

namespace LifestylesDesktop
{
    public partial class App : Application
    {
        #region SECTION B — App Startup
        protected override void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);

            // Ensure all schemas exist before UI touches any repos
            Db.EnsureCreated();
            FoodSchema.EnsureCreated();
            SleepSchema.EnsureCreated();
        }
        #endregion // SECTION B — App Startup
    }
}