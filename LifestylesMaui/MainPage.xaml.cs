using Microsoft.Maui.Graphics;

namespace LifestylesMaui
{
    public partial class MainPage : ContentPage
    {
        #region SEGMENT A - Button Sources And Hit Masks
        private const string FocusButtonDefaultSource = "focus_ui.png";
        private const string FocusButtonPressedSource = "focus_ui_pressed.png";
        private const string SleepButtonDefaultSource = "sleep_ui.png";
        private const string SleepButtonPressedSource = "sleep_ui_pressed.png";
        private const string FocusButtonMaskSource = "focus_ui_mask.png";
        private const string SleepButtonMaskSource = "sleep_ui_mask.png";

        private readonly Task<PixelAlphaHitMask> _focusButtonMaskTask;
        private readonly Task<PixelAlphaHitMask> _sleepButtonMaskTask;
        #endregion // SEGMENT A - Button Sources And Hit Masks

        #region SEGMENT B - Interaction State
        private SceneButtonType _activeButton = SceneButtonType.None;
        private bool _isInteractionActive;
        #endregion // SEGMENT B - Interaction State

        #region SEGMENT C - Construction And Touch Wiring
        public MainPage()
        {
            InitializeComponent();

            InteractionSurface.Drawable = TransparentInteractionDrawable.Instance;
            _focusButtonMaskTask = PixelAlphaHitMask.LoadAsync(FocusButtonMaskSource);
            _sleepButtonMaskTask = PixelAlphaHitMask.LoadAsync(SleepButtonMaskSource);
        }

        private async void OnInteractionStarted(object? sender, TouchEventArgs e)
        {
            _isInteractionActive = true;
            await UpdateInteractionStateAsync(GetInteractionPoint(e));
        }

        private async void OnInteractionDragged(object? sender, TouchEventArgs e)
        {
            if (!_isInteractionActive)
            {
                return;
            }

            await UpdateInteractionStateAsync(GetInteractionPoint(e));
        }

        private async void OnInteractionEnded(object? sender, TouchEventArgs e)
        {
            var releasedButton = _isInteractionActive
                ? await HitTestSceneButtonAsync(GetInteractionPoint(e))
                : SceneButtonType.None;

            var shouldTriggerButton = releasedButton != SceneButtonType.None && releasedButton == _activeButton;

            _isInteractionActive = false;
            _activeButton = SceneButtonType.None;
            ApplyPressedState(SceneButtonType.None);

            if (!shouldTriggerButton)
            {
                return;
            }

            switch (releasedButton)
            {
                case SceneButtonType.Focus:
                    OnFocusClicked();
                    break;
                case SceneButtonType.Sleep:
                    OnSleepClicked();
                    break;
            }
        }
        #endregion // SEGMENT C - Construction And Touch Wiring

        #region SEGMENT D - Hit Testing
        private async Task UpdateInteractionStateAsync(PointF interactionPoint)
        {
            var hitButton = await HitTestSceneButtonAsync(interactionPoint);
            if (hitButton == _activeButton)
            {
                return;
            }

            _activeButton = hitButton;
            ApplyPressedState(hitButton);
        }

        private async Task<SceneButtonType> HitTestSceneButtonAsync(PointF interactionPoint)
        {
            var focusButtonMask = await _focusButtonMaskTask;
            if (focusButtonMask.HitTest(FocusButtonImage, interactionPoint, relativeTo: InteractionSurface))
            {
                return SceneButtonType.Focus;
            }

            var sleepButtonMask = await _sleepButtonMaskTask;
            if (sleepButtonMask.HitTest(SleepButtonImage, interactionPoint, relativeTo: InteractionSurface))
            {
                return SceneButtonType.Sleep;
            }

            return SceneButtonType.None;
        }

        private static PointF GetInteractionPoint(TouchEventArgs e)
        {
            return e.Touches.Length > 0 ? e.Touches[0] : new PointF(-1f, -1f);
        }
        #endregion // SEGMENT D - Hit Testing

        #region SEGMENT E - Visual State And Actions
        private void ApplyPressedState(SceneButtonType pressedButton)
        {
            FocusButtonImage.Source = pressedButton == SceneButtonType.Focus
                ? FocusButtonPressedSource
                : FocusButtonDefaultSource;

            SleepButtonImage.Source = pressedButton == SceneButtonType.Sleep
                ? SleepButtonPressedSource
                : SleepButtonDefaultSource;
        }

        private void OnFocusClicked()
        {
            _ = Shell.Current.GoToAsync(nameof(FocusPage));
        }

        private void OnSleepClicked()
        {
        }
        #endregion // SEGMENT E - Visual State And Actions

        #region SEGMENT F - Local Types
        private enum SceneButtonType
        {
            None,
            Focus,
            Sleep
        }

        private sealed class TransparentInteractionDrawable : IDrawable
        {
            public static readonly TransparentInteractionDrawable Instance = new();

            public void Draw(ICanvas canvas, RectF dirtyRect)
            {
            }
        }
        #endregion // SEGMENT F - Local Types
    }
}
