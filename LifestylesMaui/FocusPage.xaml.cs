using Microsoft.Maui.Graphics;

namespace LifestylesMaui
{
    public partial class FocusPage : ContentPage
    {
        #region SEGMENT A - Sources, Masks, And Slider Constants
        private const string StartButtonDefaultSource = "focus_ui.png";
        private const string StartButtonPressedSource = "focus_ui_pressed.png";
        private const string BackButtonDefaultSource = "cancel_unpressed.png";
        private const string BackButtonPressedSource = "cancel_pressed.png";
        private const string ManageButtonDefaultSource = "cancel_unpressed.png";
        private const string ManageButtonPressedSource = "cancel_pressed.png";
        private const string CountDownButtonDefaultSource = "count_down_unpressed.png";
        private const string CountDownButtonPressedSource = "count_down_pressed.png";
        private const string CountUpButtonDefaultSource = "count_up_unpressed.png";
        private const string CountUpButtonPressedSource = "count_up_pressed.png";
        private const string StartButtonMaskSource = "focus_ui_mask.png";
        private const string BackButtonMaskSource = "cancel_mask.png";
        private const string ManageButtonMaskSource = "cancel_mask.png";
        private const string CountDownButtonMaskSource = "count_down_mask.png";
        private const string CountUpButtonMaskSource = "count_up_mask.png";
        private const string SliderNibMaskSource = "slider_nib_mask.png";
        private const float SliderNibAspectRatio = 117f / 148f;
        private const float SliderNibHitSlop = 12f;
        private const int MinDurationMinutes = 5;
        private const int MaxDurationMinutes = 120;
        private const double FocusTypePickerItemHeight = 24d;
        private static readonly string[] DefaultFocusTypeLabels =
        [
            "Focus",
            "Study",
            "Drawing",
            "Reading",
            "Planning"
        ];

        private readonly Task<PixelAlphaHitMask> _startButtonMaskTask;
        private readonly Task<PixelAlphaHitMask> _backButtonMaskTask;
        private readonly Task<PixelAlphaHitMask> _manageButtonMaskTask;
        private readonly Task<PixelAlphaHitMask> _countDownButtonMaskTask;
        private readonly Task<PixelAlphaHitMask> _countUpButtonMaskTask;
        private readonly Task<PixelAlphaHitMask> _sliderNibMaskTask;
        private readonly List<Label> _focusTypePickerItemLabels = [];
        #endregion // SEGMENT A - Sources, Masks, And Slider Constants

        #region SEGMENT B - Interaction State
        private SceneInteractionTarget _activeInteraction = SceneInteractionTarget.None;
        private bool _isInteractionActive;
        private double _sliderProgress = 0.5d;
        private FocusTimerMode _timerMode = FocusTimerMode.CountDown;
        private double _focusTypePickerPositionPx;
        private double _focusTypePickerDragStartPositionPx;
        private float _focusTypePickerDragStartY;
        private bool _isFocusTypePickerDragging;
        private int _selectedFocusTypeIndex;
        #endregion // SEGMENT B - Interaction State

        #region SEGMENT C - Construction And Touch Wiring
        public FocusPage()
        {
            InitializeComponent();

            InteractionSurface.Drawable = TransparentInteractionDrawable.Instance;
            _startButtonMaskTask = PixelAlphaHitMask.LoadAsync(StartButtonMaskSource);
            _backButtonMaskTask = PixelAlphaHitMask.LoadAsync(BackButtonMaskSource);
            _manageButtonMaskTask = PixelAlphaHitMask.LoadAsync(ManageButtonMaskSource);
            _countDownButtonMaskTask = PixelAlphaHitMask.LoadAsync(CountDownButtonMaskSource);
            _countUpButtonMaskTask = PixelAlphaHitMask.LoadAsync(CountUpButtonMaskSource);
            _sliderNibMaskTask = PixelAlphaHitMask.LoadAsync(SliderNibMaskSource);

            BuildFocusTypePickerItems();
            SetFocusTypeValue(DefaultFocusTypeLabels[0]);
            UpdateModeVisuals();
            UpdateDurationLabel();
        }

        private async void OnInteractionStarted(object? sender, TouchEventArgs e)
        {
            var interactionPoint = GetInteractionPoint(e);
            var interactionTarget = await HitTestSceneInteractionAsync(interactionPoint);

            _isInteractionActive = interactionTarget != SceneInteractionTarget.None;
            _activeInteraction = interactionTarget;

            if (!_isInteractionActive)
            {
                ApplyPressedState(SceneInteractionTarget.None);
                return;
            }

            if (interactionTarget == SceneInteractionTarget.FocusTypePicker)
            {
                _focusTypePickerDragStartY = interactionPoint.Y;
                _focusTypePickerDragStartPositionPx = _focusTypePickerPositionPx;
                _isFocusTypePickerDragging = false;
                RefreshFocusTypePickerSelectionStyles();
                return;
            }

            if (interactionTarget == SceneInteractionTarget.SliderNib)
            {
                UpdateSliderProgress(interactionPoint);
                return;
            }

            ApplyPressedState(interactionTarget);
        }

        private async void OnInteractionDragged(object? sender, TouchEventArgs e)
        {
            if (!_isInteractionActive)
            {
                return;
            }

            var interactionPoint = GetInteractionPoint(e);
            if (_activeInteraction == SceneInteractionTarget.SliderNib)
            {
                UpdateSliderProgress(interactionPoint);
                return;
            }

            if (_activeInteraction == SceneInteractionTarget.FocusTypePicker)
            {
                UpdateFocusTypePickerDrag(interactionPoint);
                return;
            }

            var hoveredTarget = await HitTestSceneInteractionAsync(interactionPoint);
            ApplyPressedState(hoveredTarget == _activeInteraction ? _activeInteraction : SceneInteractionTarget.None);
        }

        private async void OnInteractionEnded(object? sender, TouchEventArgs e)
        {
            var interactionPoint = GetInteractionPoint(e);
            var releasedTarget = _isInteractionActive
                ? await HitTestSceneInteractionAsync(interactionPoint)
                : SceneInteractionTarget.None;

            var completedInteraction = _activeInteraction;
            var shouldTriggerButton = completedInteraction != SceneInteractionTarget.None
                && completedInteraction != SceneInteractionTarget.SliderNib
                && completedInteraction != SceneInteractionTarget.FocusTypePicker
                && releasedTarget == completedInteraction;

            _isInteractionActive = false;
            _activeInteraction = SceneInteractionTarget.None;
            ApplyPressedState(SceneInteractionTarget.None);

            if (completedInteraction == SceneInteractionTarget.FocusTypePicker)
            {
                _isFocusTypePickerDragging = false;
                SnapFocusTypePickerToNearest();
                return;
            }

            if (!shouldTriggerButton)
            {
                return;
            }

            switch (releasedTarget)
            {
                case SceneInteractionTarget.Start:
                    OnStartClicked();
                    break;
                case SceneInteractionTarget.Back:
                    OnBackClicked();
                    break;
                case SceneInteractionTarget.CountDown:
                    OnCountDownClicked();
                    break;
                case SceneInteractionTarget.CountUp:
                    OnCountUpClicked();
                    break;
                case SceneInteractionTarget.Manage:
                    OnManageClicked();
                    break;
            }
        }
        #endregion // SEGMENT C - Construction And Touch Wiring

        #region SEGMENT D - Hit Testing And Slider Dragging
        private async Task<SceneInteractionTarget> HitTestSceneInteractionAsync(PointF interactionPoint)
        {
            var startButtonMask = await _startButtonMaskTask;
            if (startButtonMask.HitTest(StartButtonImage, interactionPoint, relativeTo: InteractionSurface))
            {
                return SceneInteractionTarget.Start;
            }

            var backButtonMask = await _backButtonMaskTask;
            if (backButtonMask.HitTest(BackButtonImage, interactionPoint, relativeTo: InteractionSurface))
            {
                return SceneInteractionTarget.Back;
            }

            var manageButtonMask = await _manageButtonMaskTask;
            if (manageButtonMask.HitTest(ManageButtonImage, interactionPoint, relativeTo: InteractionSurface))
            {
                return SceneInteractionTarget.Manage;
            }

            var countDownButtonMask = await _countDownButtonMaskTask;
            if (countDownButtonMask.HitTest(CountDownButtonImage, interactionPoint, relativeTo: InteractionSurface))
            {
                return SceneInteractionTarget.CountDown;
            }

            var countUpButtonMask = await _countUpButtonMaskTask;
            if (countUpButtonMask.HitTest(CountUpButtonImage, interactionPoint, relativeTo: InteractionSurface))
            {
                return SceneInteractionTarget.CountUp;
            }

            if (IsPointInsideViewBounds(FocusTypePickerShell, interactionPoint))
            {
                return SceneInteractionTarget.FocusTypePicker;
            }

            if (!_timerMode.Equals(FocusTimerMode.CountDown))
            {
                return SceneInteractionTarget.None;
            }

            var sliderNibMask = await _sliderNibMaskTask;
            if (sliderNibMask.HitTest(SliderNibImage, interactionPoint, SliderNibHitSlop, InteractionSurface))
            {
                return SceneInteractionTarget.SliderNib;
            }

            return SceneInteractionTarget.None;
        }

        private void UpdateSliderProgress(PointF interactionPoint)
        {
            if (_timerMode != FocusTimerMode.CountDown)
            {
                return;
            }

            var shellWidth = DurationSliderShell.Width;
            if (shellWidth <= 0)
            {
                return;
            }

            var sliderShellPosition = GetPositionRelativeToInteractionSurface(DurationSliderShell);
            var localX = interactionPoint.X - sliderShellPosition.X;
            var nibCenter = Math.Clamp(localX, 0f, (float)shellWidth);
            _sliderProgress = shellWidth <= 0 ? 0d : nibCenter / shellWidth;
            UpdateSliderVisuals();
            UpdateDurationLabel();
        }

        private void UpdateFocusTypePickerDrag(PointF interactionPoint)
        {
            var deltaY = interactionPoint.Y - _focusTypePickerDragStartY;
            if (Math.Abs(deltaY) > 3f)
            {
                _isFocusTypePickerDragging = true;
            }

            SetFocusTypePickerPosition(_focusTypePickerDragStartPositionPx - deltaY);
        }

        private static PointF GetInteractionPoint(TouchEventArgs e)
        {
            return e.Touches.Length > 0 ? e.Touches[0] : new PointF(-1f, -1f);
        }

        private bool IsPointInsideViewBounds(VisualElement view, PointF interactionPoint, float padding = 0f)
        {
            var viewBounds = GetViewBoundsRelativeToInteractionSurface(view);
            return interactionPoint.X >= viewBounds.Left - padding
                && interactionPoint.X <= viewBounds.Right + padding
                && interactionPoint.Y >= viewBounds.Top - padding
                && interactionPoint.Y <= viewBounds.Bottom + padding;
        }

        private RectF GetViewBoundsRelativeToInteractionSurface(VisualElement view)
        {
            var position = GetPositionRelativeToInteractionSurface(view);
            return new RectF(position.X, position.Y, (float)view.Width, (float)view.Height);
        }

        private PointF GetPositionRelativeToInteractionSurface(VisualElement view)
        {
            var x = (float)(view.X + view.TranslationX);
            var y = (float)(view.Y + view.TranslationY);
            var parent = view.Parent as VisualElement;

            while (parent is not null && parent != InteractionSurface)
            {
                x += (float)(parent.X + parent.TranslationX);
                y += (float)(parent.Y + parent.TranslationY);
                parent = parent.Parent as VisualElement;
            }

            return new PointF(x, y);
        }
        #endregion // SEGMENT D - Hit Testing And Slider Dragging

        #region SEGMENT E - Slider Layout And Visuals
        private void OnDurationSliderShellSizeChanged(object? sender, EventArgs e)
        {
            UpdateSliderVisuals();
        }

        private void OnFocusTypePickerShellSizeChanged(object? sender, EventArgs e)
        {
            ApplyFocusTypePickerPosition();
        }

        private void UpdateSliderVisuals()
        {
            var isCountDownMode = _timerMode == FocusTimerMode.CountDown;
            DurationSliderShell.IsVisible = isCountDownMode;
            if (!isCountDownMode)
            {
                return;
            }

            var shellWidth = DurationSliderShell.Width;
            var shellHeight = DurationSliderShell.Height;
            if (shellWidth <= 0 || shellHeight <= 0)
            {
                return;
            }

            var nibWidth = Math.Max(24d, shellHeight * SliderNibAspectRatio);
            SliderNibImage.WidthRequest = nibWidth;
            SliderNibImage.HeightRequest = shellHeight;

            SliderTrackEmptyImage.WidthRequest = shellWidth;
            SliderTrackEmptyImage.HeightRequest = shellHeight;
            SliderTrackFullImage.WidthRequest = shellWidth;
            SliderTrackFullImage.HeightRequest = shellHeight;
            SliderFillClipShell.HeightRequest = shellHeight;

            var nibCenter = Math.Clamp(shellWidth * _sliderProgress, 0d, shellWidth);
            var nibLeft = nibCenter - (nibWidth / 2d);
            SliderNibImage.TranslationX = nibLeft;

            var fillWidth = Math.Clamp(nibCenter, 0d, shellWidth);
            SliderFillClipShell.WidthRequest = fillWidth;
        }

        private void BuildFocusTypePickerItems()
        {
            FocusTypePickerList.Children.Clear();
            _focusTypePickerItemLabels.Clear();

            foreach (var labelText in DefaultFocusTypeLabels)
            {
                var itemLabel = new Label
                {
                    Text = labelText,
                    HeightRequest = FocusTypePickerItemHeight,
                    HorizontalTextAlignment = TextAlignment.Center,
                    VerticalTextAlignment = TextAlignment.Center,
                    FontSize = 16,
                    FontAttributes = FontAttributes.Bold,
                    TextColor = Color.FromArgb("#5C3941"),
                    LineBreakMode = LineBreakMode.NoWrap
                };

                _focusTypePickerItemLabels.Add(itemLabel);
                FocusTypePickerList.Children.Add(itemLabel);
            }
        }

        private double GetFocusTypePickerCenterOffset()
        {
            return Math.Max(0d, (FocusTypePickerShell.Height - FocusTypePickerItemHeight) / 2d);
        }

        private int ClampFocusTypePickerIndex(int index)
        {
            return Math.Max(0, Math.Min(Math.Max(DefaultFocusTypeLabels.Length - 1, 0), index));
        }

        private double GetFocusTypePickerMaxPosition()
        {
            return Math.Max(0d, Math.Max(DefaultFocusTypeLabels.Length - 1, 0) * FocusTypePickerItemHeight);
        }

        private double ClampFocusTypePickerPosition(double positionPx)
        {
            return Math.Max(0d, Math.Min(GetFocusTypePickerMaxPosition(), positionPx));
        }

        private void SetFocusTypeValue(string nextValue)
        {
            var resolvedIndex = Array.FindIndex(DefaultFocusTypeLabels, label =>
                string.Equals(label, nextValue, StringComparison.OrdinalIgnoreCase));

            _selectedFocusTypeIndex = ClampFocusTypePickerIndex(resolvedIndex >= 0 ? resolvedIndex : 0);
            SetFocusTypePickerPosition(_selectedFocusTypeIndex * FocusTypePickerItemHeight);
        }

        private void SetFocusTypePickerPosition(double positionPx)
        {
            _focusTypePickerPositionPx = ClampFocusTypePickerPosition(positionPx);
            ApplyFocusTypePickerPosition();
        }

        private void ApplyFocusTypePickerPosition()
        {
            if (FocusTypePickerShell.Height <= 0d)
            {
                return;
            }

            FocusTypePickerList.TranslationY = GetFocusTypePickerCenterOffset() - _focusTypePickerPositionPx;
            RefreshFocusTypePickerSelectionStyles();
        }

        private void RefreshFocusTypePickerSelectionStyles()
        {
            if (_focusTypePickerItemLabels.Count == 0 || FocusTypePickerShell.Height <= 0d)
            {
                return;
            }

            var centerOffset = GetFocusTypePickerCenterOffset();
            var viewportCenter = FocusTypePickerShell.Height / 2d;

            for (var index = 0; index < _focusTypePickerItemLabels.Count; index += 1)
            {
                var itemLabel = _focusTypePickerItemLabels[index];
                var itemCenter = (centerOffset - _focusTypePickerPositionPx) + (index * FocusTypePickerItemHeight) + (FocusTypePickerItemHeight / 2d);
                var distance = Math.Abs(itemCenter - viewportCenter);
                var normalizedDistance = Math.Min(1d, distance / Math.Max(FocusTypePickerItemHeight * 1.15d, 1d));
                var scale = _isFocusTypePickerDragging
                    ? 1d - (normalizedDistance * 0.28d)
                    : 1d - (normalizedDistance * 0.2d);
                var opacity = 1d - (normalizedDistance * 0.82d);
                var isSelected = !_isFocusTypePickerDragging && index == _selectedFocusTypeIndex;

                itemLabel.Scale = Math.Max(0.8d, scale);
                itemLabel.Opacity = Math.Max(0.16d, opacity);
                itemLabel.TextColor = isSelected
                    ? Color.FromArgb("#241018")
                    : Color.FromArgb("#5C3941");
            }
        }

        private void SnapFocusTypePickerToNearest()
        {
            var targetIndex = ClampFocusTypePickerIndex((int)Math.Round(_focusTypePickerPositionPx / Math.Max(FocusTypePickerItemHeight, 1d)));
            _selectedFocusTypeIndex = targetIndex;
            SetFocusTypePickerPosition(targetIndex * FocusTypePickerItemHeight);
        }
        #endregion // SEGMENT E - Slider Layout And Visuals

        #region SEGMENT F - Duration And Mode Display
        private void UpdateDurationLabel()
        {
            var duration = _timerMode == FocusTimerMode.CountDown
                ? TimeSpan.FromMinutes(GetSelectedDurationMinutes())
                : TimeSpan.Zero;

            var hours = (int)duration.TotalHours;
            var minutes = duration.Minutes;
            var seconds = duration.Seconds;

            HoursValueLabel.Text = hours.ToString();
            HoursUnitLabel.Text = hours == 1 ? "hour" : "hours";
            MinutesValueLabel.Text = minutes.ToString();
            MinutesUnitLabel.Text = minutes == 1 ? "minute" : "minutes";
            SecondsValueLabel.Text = seconds.ToString();
            SecondsUnitLabel.Text = seconds == 1 ? "second" : "seconds";
        }

        private void UpdateModeVisuals()
        {
            CountDownButtonImage.Source = _timerMode == FocusTimerMode.CountDown
                ? CountDownButtonPressedSource
                : CountDownButtonDefaultSource;

            CountUpButtonImage.Source = _timerMode == FocusTimerMode.CountUp
                ? CountUpButtonPressedSource
                : CountUpButtonDefaultSource;
        }

        private int GetSelectedDurationMinutes()
        {
            var totalRange = MaxDurationMinutes - MinDurationMinutes;
            return MinDurationMinutes + (int)Math.Round(totalRange * _sliderProgress);
        }

        #endregion // SEGMENT F - Duration And Mode Display

        #region SEGMENT G - Visual State And Actions
        private void ApplyPressedState(SceneInteractionTarget pressedTarget)
        {
            StartButtonImage.Source = pressedTarget == SceneInteractionTarget.Start
                ? StartButtonPressedSource
                : StartButtonDefaultSource;

            BackButtonImage.Source = pressedTarget == SceneInteractionTarget.Back
                ? BackButtonPressedSource
                : BackButtonDefaultSource;

            ManageButtonImage.Source = pressedTarget == SceneInteractionTarget.Manage
                ? ManageButtonPressedSource
                : ManageButtonDefaultSource;

            CountDownButtonImage.Source = pressedTarget switch
            {
                SceneInteractionTarget.CountDown => CountDownButtonPressedSource,
                SceneInteractionTarget.CountUp => CountDownButtonDefaultSource,
                _ => _timerMode == FocusTimerMode.CountDown ? CountDownButtonPressedSource : CountDownButtonDefaultSource
            };

            CountUpButtonImage.Source = pressedTarget switch
            {
                SceneInteractionTarget.CountUp => CountUpButtonPressedSource,
                SceneInteractionTarget.CountDown => CountUpButtonDefaultSource,
                _ => _timerMode == FocusTimerMode.CountUp ? CountUpButtonPressedSource : CountUpButtonDefaultSource
            };
        }

        private void OnStartClicked()
        {
        }

        private void OnBackClicked()
        {
            _ = Shell.Current.GoToAsync("..");
        }

        private void OnManageClicked()
        {
        }

        private void OnCountDownClicked()
        {
            _timerMode = FocusTimerMode.CountDown;
            UpdateModeVisuals();
            UpdateSliderVisuals();
            UpdateDurationLabel();
        }

        private void OnCountUpClicked()
        {
            _timerMode = FocusTimerMode.CountUp;
            UpdateModeVisuals();
            UpdateSliderVisuals();
            UpdateDurationLabel();
        }
        #endregion // SEGMENT G - Visual State And Actions

        #region SEGMENT H - Local Types
        private enum SceneInteractionTarget
        {
            None,
            Start,
            Back,
            Manage,
            CountDown,
            CountUp,
            SliderNib,
            FocusTypePicker
        }

        private enum FocusTimerMode
        {
            CountDown,
            CountUp
        }

        private sealed class TransparentInteractionDrawable : IDrawable
        {
            public static readonly TransparentInteractionDrawable Instance = new();

            public void Draw(ICanvas canvas, RectF dirtyRect)
            {
            }
        }
        #endregion // SEGMENT H - Local Types
    }
}
