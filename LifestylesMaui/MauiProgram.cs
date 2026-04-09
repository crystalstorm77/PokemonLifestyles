using Microsoft.Extensions.Logging;
using Microsoft.Maui.Handlers;

#if ANDROID
using Android.Content.Res;
using Android.Graphics.Drawables;
#endif

namespace LifestylesMaui
{
    public static class MauiProgram
    {
        public static MauiApp CreateMauiApp()
        {
            var builder = MauiApp.CreateBuilder();
            builder
                .UseMauiApp<App>()
                .ConfigureFonts(fonts =>
                {
                    fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                    fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
                });

            ConfigureImageButtonHandlers();

#if DEBUG
            builder.Logging.AddDebug();
#endif

            return builder.Build();
        }

        private static void ConfigureImageButtonHandlers()
        {
            ImageButtonHandler.Mapper.AppendToMapping("PokemonLifestylesImageButtonChrome", (handler, view) =>
            {
#if ANDROID
                handler.PlatformView.Background = new ColorDrawable(Android.Graphics.Color.Transparent);
                handler.PlatformView.BackgroundTintList = ColorStateList.ValueOf(Android.Graphics.Color.Transparent);
                handler.PlatformView.Foreground = null;
                handler.PlatformView.StateListAnimator = null;
                handler.PlatformView.SetPadding(0, 0, 0, 0);
                handler.PlatformView.Focusable = false;
                handler.PlatformView.FocusableInTouchMode = false;
                handler.PlatformView.Clickable = true;
                handler.PlatformView.LongClickable = false;
                handler.PlatformView.SoundEffectsEnabled = false;
#endif
            });
        }
    }
}
