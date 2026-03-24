(function () {
    //#region SEGMENT A - Element References And Runtime State
    const homeRoot = document.getElementById("pl-home-root");
    const worldStage = document.getElementById("pl-world-stage");
    const safeUiStage = document.getElementById("pl-safe-ui-stage");
    const safeZoneOutline = document.getElementById("pl-safe-zone-outline");

    const homeSceneArt = document.getElementById("pl-home-scene-art");
    const homeFocusButton = document.getElementById("pl-home-focus-button");
    const homeSleepButton = document.getElementById("pl-home-sleep-button");

    const setupPanel = document.getElementById("pl-setup-panel");
    const setupControls = document.getElementById("pl-setup-controls");
    const focusTypeLabel = document.getElementById("pl-focus-type-label");
    const focusTypeField = document.getElementById("pl-focus-type-field");
    const durationText = document.getElementById("pl-duration-text");
    const sliderGroup = document.getElementById("pl-slider-group");
    const sliderTrackShell = document.getElementById("pl-slider-track-shell");
    const sliderTrackEmptyArt = document.getElementById("pl-slider-track-empty-art");
    const sliderFillShell = document.getElementById("pl-slider-fill-shell");
    const sliderFillArt = document.getElementById("pl-slider-fill-art");
    const sliderNibVisual = document.getElementById("pl-slider-nib-visual");
    const durationSlider = document.getElementById("pl-duration-slider");

    const startFocusButton = document.getElementById("pl-start-focus-button");
    const closeFocusButton = document.getElementById("pl-close-focus-button");
    const countdownModeButton = document.getElementById("pl-countdown-mode-button");
    const countUpModeButton = document.getElementById("pl-countup-mode-button");

    const manageButton = document.getElementById("pl-manage-button");
    const pauseButton = document.getElementById("pl-pause-button");
    const exitButton = document.getElementById("pl-exit-button");
    const focusManagePanel = document.getElementById("pl-focus-manage-panel");
    const focusManageListShell = document.getElementById("pl-focus-manage-list-shell");
    const focusManageListShellLower = document.getElementById("pl-focus-manage-list-shell-lower");
    const focusManageListViewport = document.getElementById("pl-focus-manage-list-viewport");
    const focusManageList = document.getElementById("pl-focus-manage-list");
    const focusManageListScrollbarVisual = document.getElementById("pl-focus-manage-list-scrollbar-visual");
    const focusManageListShellUpper = document.getElementById("pl-focus-manage-list-shell-upper");
    const focusManageStatus = document.getElementById("pl-focus-manage-status");
    const focusManageInputLabel = document.getElementById("pl-focus-manage-input-label");
    const focusManageInputField = document.getElementById("pl-focus-manage-input-field");
    const focusManageInput = document.getElementById("pl-focus-manage-input");
    const focusManageAddButton = document.getElementById("pl-focus-manage-add-button");
    const focusManageDeleteButton = document.getElementById("pl-focus-manage-delete-button");
    const focusManageBackButton = document.getElementById("pl-focus-manage-back-button");
    const focusManageOkButton = document.getElementById("pl-focus-manage-ok-button");
    const focusManageConfirmPanel = document.getElementById("pl-focus-manage-confirm-panel");
    const focusManageConfirmTitle = document.getElementById("pl-focus-manage-confirm-title");
    const focusManageConfirmMessage = document.getElementById("pl-focus-manage-confirm-message");
    const focusManageConfirmDeleteButton = document.getElementById("pl-focus-manage-confirm-delete-button");
    const focusManageConfirmCancelButton = document.getElementById("pl-focus-manage-confirm-cancel-button");
    const focusManageConfirmDismissField = document.getElementById("pl-focus-manage-confirm-dismiss-field");
    const focusManageConfirmDismissInput = document.getElementById("pl-focus-manage-confirm-dismiss-input");

    const confirmDim = document.getElementById("pl-confirm-dim");
    const confirmPanel = document.getElementById("pl-confirm-panel");
    const confirmKeepGoingButton = document.getElementById("pl-confirm-keep-going");
    const confirmStopButton = document.getElementById("pl-confirm-stop");

    const rewardDim = document.getElementById("pl-reward-dim");
    const rewardPanel = document.getElementById("pl-reward-panel");
    const rewardCloseButton = document.getElementById("pl-reward-close-button");

    const focusTypeInput = document.getElementById("pl-focus-type-input");
    const focusTypePicker = document.getElementById("pl-focus-type-picker");
    const focusTypePickerViewport = document.getElementById("pl-focus-type-picker-viewport");
    const focusTypePickerList = document.getElementById("pl-focus-type-picker-list");
    const setupModeBadge = document.getElementById("pl-setup-mode-badge");
    const setupModeHint = document.getElementById("pl-setup-mode-hint");

    const confirmEyebrow = document.getElementById("pl-confirm-eyebrow");
    const confirmTitle = document.getElementById("pl-confirm-title");
    const confirmSubtitle = document.getElementById("pl-confirm-subtitle");
    const confirmCurrentTime = document.getElementById("pl-confirm-current-time");
    const confirmTimerStatus = document.getElementById("pl-confirm-timer-status");
    const confirmCompleteLabel = document.getElementById("pl-confirm-complete-label");
    const confirmCompleteXp = document.getElementById("pl-confirm-complete-xp");
    const confirmCompleteCoins = document.getElementById("pl-confirm-complete-coins");
    const confirmCurrentLabel = document.getElementById("pl-confirm-current-label");
    const confirmCurrentXp = document.getElementById("pl-confirm-current-xp");
    const confirmCurrentCoins = document.getElementById("pl-confirm-current-coins");

    const rewardStatusText = document.getElementById("pl-reward-status-text");
    const rewardFocusType = document.getElementById("pl-reward-focus-type");
    const rewardDurationText = document.getElementById("pl-reward-duration-text");
    const rewardXp = document.getElementById("pl-reward-xp");
    const rewardCoins = document.getElementById("pl-reward-coins");

    const saveForm = document.getElementById("pl-save-form");
    const saveFocusType = document.getElementById("pl-save-focus-type");
    const savePlannedSeconds = document.getElementById("pl-save-planned-seconds");
    const saveElapsedSeconds = document.getElementById("pl-save-elapsed-seconds");
    const saveTimerMode = document.getElementById("pl-save-timer-mode");
    const saveMode = document.getElementById("pl-save-mode");
    const requestVerificationTokenInput = saveForm.querySelector('input[name="__RequestVerificationToken"]');

    const layoutPanel = document.getElementById("pl-layout-panel");
    const layoutEditorModeSelect = document.getElementById("pl-layout-editor-mode-select");
    const layoutEditorModeHint = document.getElementById("pl-layout-editor-mode-hint");
    const layoutEditorToggle = document.getElementById("pl-layout-editor-enabled");
    const layoutEditorModeStatus = document.getElementById("pl-layout-editor-mode-status");
    const layoutAssetSelect = document.getElementById("pl-layout-asset-select");
    const layoutSceneSelect = document.getElementById("pl-layout-scene-select");
    const layoutStateSelect = document.getElementById("pl-layout-state-select");
    const layoutStateStatus = document.getElementById("pl-layout-state-status");
    const layoutSceneName = document.getElementById("pl-layout-scene-name");
    const layoutStageStatus = document.getElementById("pl-layout-stage-status");
    const layoutSafeZoneStatus = document.getElementById("pl-layout-safe-zone-status");
    const layoutArtPickerField = document.getElementById("pl-layout-art-picker-field");
    const layoutArtPickerButton = document.getElementById("pl-layout-art-picker-button");
    let layoutArtPickerRemoveButton = document.getElementById("pl-layout-art-picker-remove-button");
    const layoutArtPickerInput = document.getElementById("pl-layout-art-picker-input");
    const layoutArtPickerStatus = document.getElementById("pl-layout-art-picker-status");
    const layoutStateVisibilityField = document.getElementById("pl-layout-state-visibility-field");
    const layoutStateVisible = document.getElementById("pl-layout-state-visible");
    const layoutStateVisibleStatus = document.getElementById("pl-layout-state-visible-status");
    const layoutSceneBuilderPanel = document.getElementById("pl-layout-scene-builder-panel");
    const layoutSceneAssetSourceSelect = document.getElementById("pl-layout-scene-asset-source-select");
    const layoutSceneAssetAddButton = document.getElementById("pl-layout-scene-asset-add");
    const layoutSceneAssetRemoveButton = document.getElementById("pl-layout-scene-asset-remove");
    const layoutSceneBuilderMembershipStatus = document.getElementById("pl-layout-scene-builder-membership-status");
    const layoutBehaviorRoleField = document.getElementById("pl-layout-behavior-role-field");
    const layoutBehaviorRoleSelect = document.getElementById("pl-layout-behavior-role-select");
    const layoutBehaviorRoleStatus = document.getElementById("pl-layout-behavior-role-status");
    const layoutNewTextAssetKey = document.getElementById("pl-layout-new-text-asset-key");
    const layoutNewTextAssetContent = document.getElementById("pl-layout-new-text-asset-content");
    const layoutNewTextAssetPreset = document.getElementById("pl-layout-new-text-asset-preset");
    const layoutCreateTextAssetButton = document.getElementById("pl-layout-create-text-asset");
    const layoutSceneBuilderTextStatus = document.getElementById("pl-layout-scene-builder-text-status");

    const layoutScale = document.getElementById("pl-layout-scale");
    const layoutScaleNumber = document.getElementById("pl-layout-scale-number");
    const layoutX = document.getElementById("pl-layout-x");
    const layoutXNumber = document.getElementById("pl-layout-x-number");
    const layoutY = document.getElementById("pl-layout-y");
    const layoutYNumber = document.getElementById("pl-layout-y-number");

    const layoutWidth = document.getElementById("pl-layout-width");
    const layoutHeight = document.getElementById("pl-layout-height");
    const layoutScaleValue = document.getElementById("pl-layout-scale-value");
    const layoutXValue = document.getElementById("pl-layout-x-value");
    const layoutYValue = document.getElementById("pl-layout-y-value");
    const layoutHeightLabel = document.getElementById("pl-layout-height-label");
    const layoutHeightHint = document.getElementById("pl-layout-height-hint");
    const layoutSaveSelected = document.getElementById("pl-layout-save-selected");
    const layoutRevertSelected = document.getElementById("pl-layout-revert-selected");
    const layoutResetSelected = document.getElementById("pl-layout-reset-selected");
    const layoutSaveDefault = document.getElementById("pl-layout-save-default");
    const layoutResetDefault = document.getElementById("pl-layout-reset-default");
    const layoutCode = document.getElementById("pl-layout-code");

    if (!homeRoot || !worldStage || !safeUiStage || !safeZoneOutline ||
        !homeSceneArt || !homeFocusButton || !homeSleepButton ||
        !setupPanel || !setupControls || !focusTypeLabel || !focusTypeField || !durationText ||
        !sliderGroup || !sliderTrackShell || !sliderTrackEmptyArt || !sliderFillShell ||
        !sliderFillArt || !sliderNibVisual || !durationSlider || !startFocusButton ||
        !countdownModeButton || !countUpModeButton ||
        !closeFocusButton || !manageButton || !pauseButton || !exitButton ||
        !focusManagePanel || !focusManageListShell || !focusManageListShellLower || !focusManageListViewport ||
        !focusManageList || !focusManageListScrollbarVisual || !focusManageListShellUpper || !focusManageStatus ||
        !focusManageInputLabel || !focusManageInputField || !focusManageInput || !focusManageAddButton || !focusManageDeleteButton ||
        !focusManageBackButton || !focusManageOkButton || !focusManageConfirmPanel ||
        !focusManageConfirmTitle || !focusManageConfirmMessage ||
        !focusManageConfirmDeleteButton || !focusManageConfirmCancelButton ||
        !focusManageConfirmDismissField || !focusManageConfirmDismissInput ||
        !confirmDim || !confirmPanel || !confirmKeepGoingButton || !confirmStopButton ||
        !rewardDim || !rewardPanel || !rewardCloseButton || !focusTypeInput ||
        !focusTypePicker || !focusTypePickerViewport || !focusTypePickerList ||
        !setupModeBadge || !setupModeHint || !confirmEyebrow || !confirmTitle ||
        !confirmSubtitle || !confirmCurrentTime || !confirmTimerStatus ||
        !confirmCompleteLabel || !confirmCompleteXp || !confirmCompleteCoins ||
        !confirmCurrentLabel || !confirmCurrentXp || !confirmCurrentCoins ||
        !rewardStatusText || !rewardFocusType || !rewardDurationText || !rewardXp ||
        !rewardCoins || !saveForm || !saveFocusType || !savePlannedSeconds ||
        !saveElapsedSeconds || !saveTimerMode || !saveMode || !layoutPanel || !layoutEditorToggle ||
        !layoutEditorModeSelect || !layoutEditorModeHint ||
        !layoutEditorModeStatus || !layoutAssetSelect || !layoutSceneSelect ||
        !layoutStateSelect || !layoutStateStatus ||
        !layoutSceneName || !layoutStageStatus || !layoutSafeZoneStatus ||
        !layoutArtPickerField || !layoutArtPickerButton || !layoutArtPickerInput || !layoutArtPickerStatus ||
        !layoutStateVisibilityField || !layoutStateVisible || !layoutStateVisibleStatus ||
        !layoutSceneBuilderPanel || !layoutSceneAssetSourceSelect || !layoutSceneAssetAddButton ||
        !layoutSceneAssetRemoveButton || !layoutSceneBuilderMembershipStatus || !layoutBehaviorRoleField ||
        !layoutBehaviorRoleSelect || !layoutBehaviorRoleStatus || !layoutNewTextAssetKey ||
        !layoutNewTextAssetContent || !layoutNewTextAssetPreset || !layoutCreateTextAssetButton ||
        !layoutSceneBuilderTextStatus ||
        !layoutScale || !layoutScaleNumber || !layoutX || !layoutXNumber ||
        !layoutY || !layoutYNumber || !layoutWidth || !layoutHeight ||
        !layoutScaleValue || !layoutXValue || !layoutYValue ||
        !layoutHeightLabel || !layoutHeightHint || !layoutSaveSelected ||
        !layoutRevertSelected || !layoutResetSelected || !layoutSaveDefault ||
        !layoutResetDefault || !layoutCode) {
        return;
    }

    const stopThresholdSeconds = 60;
    const layoutModeEnabled = new URL(window.location.href).searchParams.get("layout") === "1";
    let layoutEditorEnabled = layoutModeEnabled;
    const layoutSyncReadUrl = "/LayoutSync?handler=Read";
    const layoutSyncWriteUrl = "/LayoutSync?handler=Write";
    const layoutSyncUploadArtUrl = "/LayoutSync?handler=UploadArt";
    const focusLabelsHandlerUrl = `${window.location.pathname}?handler=FocusLabels`;

    const rewardXpPerMinute = Math.max(0, parseFloat(homeRoot.dataset.rewardXpPerMinute || "0") || 0);
    const rewardIncompleteMultiplier = Math.min(1, Math.max(0, parseFloat(homeRoot.dataset.rewardIncompleteMultiplier || "0.25") || 0.25));
    const rewardSleepMultiplier = Math.max(1, parseFloat(homeRoot.dataset.rewardSleepMultiplier || "1") || 1);
    const rewardWindowEligible = String(homeRoot.dataset.rewardWindowEligible || "").toLowerCase() === "true";
    const shouldShowRewardOverlay = String(homeRoot.dataset.showRewardOverlay || "").toLowerCase() === "true";

    const layoutColorAssetKey = "app-edge-color";
    const layoutColorAssetLabel = "home-scene.png";
    const layoutEdgeColorVariableName = "--pl-art-app-edge-color";
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');

    const artImageVars = {
        "home-scene": "--pl-home-scene-image",
        "home-focus": "--pl-btn-home-focus-image",
        "home-sleep": "--pl-btn-home-sleep-image",
        "setup-panel": "--pl-focus-setup-panel-image",
        "focus-manage-panel": "--pl-focus-manage-panel-image",
        "confirm-panel": "--pl-focus-confirm-panel-image",
        "reward-panel": "--pl-focus-reward-panel-image",
        "countdown-mode": "--pl-btn-countdown-mode-image",
        "countup-mode": "--pl-btn-countup-mode-image",
        "start": "--pl-btn-start-image",
        "back": "--pl-btn-back-image",
        "manage-button": "--pl-btn-manage-image",
        "pause": "--pl-btn-pause-image",
        "exit": "--pl-btn-exit-image",
        "focus-manage-confirm-panel": "--pl-focus-manage-confirm-panel-image",
        "focus-manage-add": "--pl-focus-manage-add-image",
        "focus-manage-delete": "--pl-focus-manage-delete-image",
        "focus-manage-back": "--pl-focus-manage-back-image",
        "focus-manage-ok": "--pl-focus-manage-ok-image",
        "focus-manage-confirm-delete": "--pl-focus-manage-confirm-delete-image",
        "focus-manage-confirm-cancel": "--pl-focus-manage-confirm-cancel-image",
        "keep-going": "--pl-btn-keep-going-image",
        "stop": "--pl-btn-stop-image",
        "gotcha": "--pl-btn-gotcha-image",
        "slider": "--pl-slider-track-empty-image",
        "slider-nib-art": "--pl-slider-nib-image"
    };

    const artComponentImageVars = {
        "slider": {
            "empty": "--pl-slider-track-empty-image",
            "fill": "--pl-slider-track-fill-image",
            "nib": "--pl-slider-nib-image"
        },
        "focus-manage-list": {
            "shell-lower": "--pl-focus-manage-list-shell-lower-image",
            "shell-upper": "--pl-focus-manage-list-shell-upper-image",
            "scrollbar": "--pl-focus-manage-list-scrollbar-image",
            "tile-deselected": "--pl-focus-manage-tile-deselected-image",
            "tile-selected": "--pl-focus-manage-tile-selected-image",
            "tile-empty": "--pl-focus-manage-tile-empty-image"
        }
    };

    const layoutAssets = {
        "home-scene": { element: homeSceneArt, stage: "world", interactive: false },
        "home-focus": { element: homeFocusButton, stage: "ui", interactive: true },
        "home-sleep": { element: homeSleepButton, stage: "ui", interactive: true },
        "setup-panel": { element: setupPanel, stage: "ui", interactive: false },
        "countdown-mode": { element: countdownModeButton, stage: "ui", interactive: true },
        "countup-mode": { element: countUpModeButton, stage: "ui", interactive: true },
        "focus-type-label": { element: focusTypeLabel, stage: "ui", interactive: false },
        "focus-type-field": { element: focusTypeField, stage: "ui", interactive: false },
        "duration-text": { element: durationText, stage: "ui", interactive: false },
        "slider": { element: sliderGroup, stage: "ui", interactive: true, compound: true },
        "start": { element: startFocusButton, stage: "ui", interactive: true },
        "back": { element: closeFocusButton, stage: "ui", interactive: true },
        "manage-button": { element: manageButton, stage: "ui", interactive: true },
        "pause": { element: pauseButton, stage: "ui", interactive: true },
        "exit": { element: exitButton, stage: "ui", interactive: true },
        "focus-manage-panel": { element: focusManagePanel, stage: "ui", interactive: false },
        "focus-manage-list": { element: focusManageListShell, stage: "ui", interactive: true },
        "focus-manage-input-label": { element: focusManageInputLabel, stage: "ui", interactive: false },
        "focus-manage-input": { element: focusManageInputField, stage: "ui", interactive: false },
        "focus-manage-add": { element: focusManageAddButton, stage: "ui", interactive: true },
        "focus-manage-delete": { element: focusManageDeleteButton, stage: "ui", interactive: true },
        "focus-manage-back": { element: focusManageBackButton, stage: "ui", interactive: true },
        "focus-manage-ok": { element: focusManageOkButton, stage: "ui", interactive: true },
        "focus-manage-confirm-panel": { element: focusManageConfirmPanel, stage: "ui", interactive: false },
        "focus-manage-confirm-title": { element: focusManageConfirmTitle, stage: "ui", interactive: false },
        "focus-manage-confirm-message": { element: focusManageConfirmMessage, stage: "ui", interactive: false },
        "focus-manage-confirm-delete": { element: focusManageConfirmDeleteButton, stage: "ui", interactive: true },
        "focus-manage-confirm-cancel": { element: focusManageConfirmCancelButton, stage: "ui", interactive: true },
        "focus-manage-confirm-dismiss": { element: focusManageConfirmDismissField, stage: "ui", interactive: true },
        "confirm-panel": { element: confirmPanel, stage: "ui", interactive: false },
        "keep-going": { element: confirmKeepGoingButton, stage: "ui", interactive: true },
        "stop": { element: confirmStopButton, stage: "ui", interactive: true },
        "reward-panel": { element: rewardPanel, stage: "ui", interactive: false },
        "gotcha": { element: rewardCloseButton, stage: "ui", interactive: true }
    };

    const layoutTextAssets = {
        "home-focus": homeFocusButton.querySelector(".pl-button-label"),
        "home-sleep": homeSleepButton.querySelector(".pl-button-label"),
        "countdown-mode": countdownModeButton.querySelector(".pl-button-label"),
        "countup-mode": countUpModeButton.querySelector(".pl-button-label"),
        "start": startFocusButton.querySelector(".pl-button-label"),
        "back": closeFocusButton.querySelector(".pl-button-label"),
        "manage-button": manageButton.querySelector(".pl-button-label"),
        "pause": pauseButton.querySelector(".pl-button-label"),
        "exit": exitButton.querySelector(".pl-button-label"),
        "focus-type-label": focusTypeLabel,
        "focus-manage-input-label": focusManageInputLabel,
        "focus-manage-add": focusManageAddButton.querySelector(".pl-button-label"),
        "focus-manage-delete": focusManageDeleteButton.querySelector(".pl-button-label"),
        "focus-manage-back": focusManageBackButton.querySelector(".pl-button-label"),
        "focus-manage-ok": focusManageOkButton.querySelector(".pl-button-label"),
        "focus-manage-confirm-title": focusManageConfirmTitle,
        "focus-manage-confirm-message": focusManageConfirmMessage,
        "focus-manage-confirm-delete": focusManageConfirmDeleteButton.querySelector(".pl-button-label"),
        "focus-manage-confirm-cancel": focusManageConfirmCancelButton.querySelector(".pl-button-label"),
        "keep-going": confirmKeepGoingButton.querySelector(".pl-button-label"),
        "stop": confirmStopButton.querySelector(".pl-button-label"),
        "gotcha": rewardCloseButton.querySelector(".pl-button-label")
    };

    const layoutTextArtLabels = {
        "home-focus": "focus-start.png",
        "home-sleep": "sleep.png",
        "countdown-mode": "countdown-mode.png",
        "countup-mode": "countup-mode.png",
        "start": "focus-start.png",
        "back": "back.png",
        "manage-button": "manage.png",
        "pause": "pause.png",
        "exit": "cancel.png",
        "focus-manage-add": "add.png",
        "focus-manage-delete": "remove.png",
        "focus-manage-back": "back.png",
        "focus-manage-ok": "ok.png",
        "focus-manage-confirm-delete": "delete.png",
        "focus-manage-confirm-cancel": "cancel.png",
        "gotcha": "gotcha.png"
    };

    const layoutTextFontFamilyOptions = [
        { label: "System UI", value: "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif" },
        { label: "Arial", value: "Arial, Helvetica, sans-serif" },
        { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
        { label: "Trebuchet MS", value: "\"Trebuchet MS\", Helvetica, sans-serif" },
        { label: "Georgia", value: "Georgia, serif" },
        { label: "Times New Roman", value: "\"Times New Roman\", Times, serif" },
        { label: "Courier New", value: "\"Courier New\", Courier, monospace" }
    ];

    const textAssetPresetDefinitions = {
        "text-label": {
            label: "Text Label",
            width: 180,
            height: 34,
            fontFamily: "\"Trebuchet MS\", Helvetica, sans-serif",
            fontSize: 18,
            color: "#1d2842",
            bold: true,
            italic: false
        },
        "text-title": {
            label: "Text Title",
            width: 240,
            height: 42,
            fontFamily: "\"Trebuchet MS\", Helvetica, sans-serif",
            fontSize: 24,
            color: "#1d2842",
            bold: true,
            italic: false
        },
        "text-hint": {
            label: "Text Hint",
            width: 260,
            height: 48,
            fontFamily: "\"Trebuchet MS\", Helvetica, sans-serif",
            fontSize: 14,
            color: "#51617d",
            bold: false,
            italic: false
        }
    };

    const behaviorRoleDefinitions = {
        "none": {
            label: "None"
        },
        "open-focus-setup": {
            label: "Open Focus Setup"
        },
        "open-focus-manage": {
            label: "Open Focus Manage"
        },
        "return-home": {
            label: "Return Home"
        },
        "return-focus-setup": {
            label: "Return Focus Setup"
        },
        "save-focus-manage": {
            label: "Save Focus Manage"
        },
        "select-countdown-mode": {
            label: "Select Count Down Mode"
        },
        "select-countup-mode": {
            label: "Select Count Up Mode"
        },
        "start-focus-session": {
            label: "Start Focus Session"
        },
        "toggle-pause-session": {
            label: "Toggle Pause Session"
        },
        "stop-focus-session": {
            label: "Stop Focus Session"
        },
        "confirm-keep-going": {
            label: "Confirm Keep Going"
        },
        "confirm-stop-session": {
            label: "Confirm Stop Session"
        },
        "close-reward": {
            label: "Close Reward"
        }
    };

    const defaultAssetBehaviorRoles = {
        "home-focus": "open-focus-setup",
        "home-sleep": "none",
        "countdown-mode": "select-countdown-mode",
        "countup-mode": "select-countup-mode",
        "start": "start-focus-session",
        "back": "return-home",
        "manage-button": "open-focus-manage",
        "pause": "toggle-pause-session",
        "exit": "stop-focus-session",
        "focus-manage-add": "none",
        "focus-manage-delete": "none",
        "focus-manage-back": "return-focus-setup",
        "focus-manage-ok": "save-focus-manage",
        "focus-manage-confirm-delete": "none",
        "focus-manage-confirm-cancel": "none",
        "keep-going": "confirm-keep-going",
        "stop": "confirm-stop-session",
        "gotcha": "close-reward"
    };

    const layoutSceneDefinitions = {
        "home": {
            label: "Home",
            assets: ["home-scene", "home-focus", "home-sleep"]
        },
        "focus-setup": {
            label: "Focus setup",
            assets: ["setup-panel", "countdown-mode", "countup-mode", "focus-type-label", "focus-type-field", "duration-text", "slider", "start", "back", "manage-button"],
            states: {
                base: {
                    label: "Base"
                },
                countdown: {
                    label: "Count Down"
                },
                countup: {
                    label: "Count Up",
                    visibility: {
                        slider: false
                    }
                }
            }
        },
        "focus-manage": {
            label: "Focus manage",
            assets: [
                "focus-manage-panel",
                "focus-manage-list",
                "focus-manage-input-label",
                "focus-manage-input",
                "focus-manage-add",
                "focus-manage-delete",
                "focus-manage-back",
                "focus-manage-ok",
                "focus-manage-confirm-panel",
                "focus-manage-confirm-title",
                "focus-manage-confirm-message",
                "focus-manage-confirm-delete",
                "focus-manage-confirm-cancel",
                "focus-manage-confirm-dismiss"
            ]
        },
        "focus-running": {
            label: "Focus running",
            assets: ["duration-text", "pause", "exit"]
        },
        "stop-confirm": {
            label: "Stop confirm",
            assets: ["confirm-panel", "keep-going", "stop"]
        },
        "reward": {
            label: "Reward",
            assets: ["reward-panel", "gotcha"]
        },
        "app-shell": {
            label: "App shell",
            assets: [layoutColorAssetKey]
        }
    };

    const layoutAssetDefaultStates = {
        "focus-type-label": { x: 20, y: 177, width: 88, height: 18, scale: 100 },
        "focus-manage-panel": { x: 54, y: 46, width: 238, height: 324, scale: 100 },
        "focus-manage-list": { x: 70, y: 78, width: 200, height: 170, scale: 100 },
        "focus-manage-input-label": { x: 70, y: 258, width: 120, height: 18, scale: 100 },
        "focus-manage-input": { x: 70, y: 280, width: 140, height: 40, scale: 100 },
        "focus-manage-add": { x: 216, y: 280, width: 54, height: 40, scale: 100 },
        "focus-manage-delete": { x: 70, y: 338, width: 110, height: 40, scale: 100 },
        "focus-manage-back": { x: 198, y: 338, width: 72, height: 40, scale: 100 },
        "focus-manage-ok": { x: 70, y: 388, width: 200, height: 44, scale: 100 },
        "focus-manage-confirm-panel": { x: 76, y: 102, width: 196, height: 132, scale: 100 },
        "focus-manage-confirm-title": { x: 96, y: 122, width: 120, height: 18, scale: 100 },
        "focus-manage-confirm-message": { x: 96, y: 144, width: 156, height: 58, scale: 100 },
        "focus-manage-confirm-delete": { x: 96, y: 190, width: 70, height: 38, scale: 100 },
        "focus-manage-confirm-cancel": { x: 176, y: 190, width: 76, height: 38, scale: 100 },
        "focus-manage-confirm-dismiss": { x: 96, y: 234, width: 140, height: 24, scale: 100 }
    };

    const assetComponentDefinitions = {
        "slider": {
            "root": {
                label: "Whole Asset",
                geometryMode: "asset",
                allowsHitScale: false,
                status: "Moves, resizes, and scales the selected asset as a whole."
            },
            "empty": {
                label: "empty",
                geometryMode: "component-scale",
                allowsHitScale: false,
                status: "Offsets the empty track art within the slider asset."
            },
            "fill": {
                label: "fill",
                geometryMode: "component-scale",
                allowsHitScale: false,
                status: "Offsets the full / filled track art within the slider asset."
            },
            "nib": {
                label: "nib",
                geometryMode: "component-box",
                allowsHitScale: false,
                status: "Offsets the visual nib within the slider asset and can override its width."
            },
            "nib-hit": {
                label: "nib-hit",
                geometryMode: "component-hit",
                allowsHitScale: true,
                status: "Controls the draggable nib interactable area without changing the nib art."
            }
        },
        "focus-manage-list": {
            "root": {
                label: "Whole Asset",
                geometryMode: "asset",
                allowsHitScale: false,
                status: "Moves, resizes, and scales the focus type grid container as a whole."
            },
            "shell-lower": {
                label: "scrollShellLower",
                geometryMode: "art-only",
                allowsHitScale: false,
                status: "Browse and save PNG art for the background behind the Focus Manage tile viewport."
            },
            "shell-upper": {
                label: "scrollShellUpper",
                geometryMode: "art-only",
                allowsHitScale: false,
                status: "Browse and save PNG art for the frame rendered above the Focus Manage tile viewport."
            },
            "scrollbar": {
                label: "scrollbar",
                geometryMode: "art-only",
                allowsHitScale: false,
                status: "Browse and save PNG art for the Focus Manage scrollbar thumb."
            },
            "tile-deselected": {
                label: "tileDeselected",
                geometryMode: "art-only",
                allowsHitScale: false,
                status: "Browse and save PNG art for unselected focus type tiles."
            },
            "tile-selected": {
                label: "tileSelected",
                geometryMode: "art-only",
                allowsHitScale: false,
                status: "Browse and save PNG art for selected focus type tiles."
            },
            "tile-empty": {
                label: "tileEmpty",
                geometryMode: "art-only",
                allowsHitScale: false,
                status: "Browse and save PNG art for empty Focus Manage tiles."
            }
        }
    };

    const setupInteractiveElements = [
        countdownModeButton,
        countUpModeButton,
        focusTypeField,
        sliderGroup
    ];

    const artMetrics = {};
    const runtimeComponentRects = {};
    let sharedLayoutState = {};
    let sharedLayoutVariables = {};
    let sharedDefaultLayoutState = {};
    let sharedDefaultLayoutVariables = {};
    let sharedSceneOverrides = {};
    let sharedSceneAssetDefinitions = {};
    let currentDraftKind = null;
    let currentDraftAssetKey = null;
    let currentDraftComponentKey = null;
    let currentDraftState = null;
    let currentVariableDraftKey = null;
    let currentVariableDraftValue = null;
    let currentTextDraftAssetKey = null;
    let currentTextDraftState = null;
    let currentImageDraftAssetKey = null;
    let currentImageDraftComponentKey = null;
    let currentImageDraftFile = null;
    let currentImageDraftUrl = null;
    let currentImageDraftLabel = null;
    let currentImageDraftObjectUrl = null;
    let currentVisibilityDraftAssetKey = null;
    let currentVisibilityDraftSceneKey = null;
    let currentVisibilityDraftStateKey = null;
    let currentVisibilityDraftValue = null;
    let currentBehaviorDraftAssetKey = null;
    let currentBehaviorDraftValue = null;
    let currentLayoutEditorMode = "layout";
    let currentVisibleSceneKey = "home";
    let currentVisibleSceneStateKey = "base";
    const dynamicAssetKeys = new Set();
    let savedFocusLabels = parseInitialFocusLabels();
    let focusTypePickerSelectedIndex = 0;
    let focusTypePickerScrollSyncFrameId = 0;
    let focusTypePickerScrollSnapTimeoutId = 0;
    let focusTypePickerSettleAttemptCount = 0;
    let focusTypePickerPointerState = null;
    let focusTypePickerSuppressClickUntil = 0;
    let focusTypePickerLastTouchInteractionAt = 0;
    let draftFocusLabels = [];
    let selectedFocusLabelDraftId = "";
    let focusManageSaveConfirmOpen = false;
    let nextFocusLabelDraftId = 1;
    const focusManageGridColumnCount = 3;
    const focusManageMinimumTileCount = 6;
    const focusManageRemovalReminderStorageKey = "pl-focus-manage-removal-reminder-dismissed";
    const focusManageConfirmAssetKeys = new Set([
        "focus-manage-confirm-panel",
        "focus-manage-confirm-title",
        "focus-manage-confirm-message",
        "focus-manage-confirm-delete",
        "focus-manage-confirm-cancel",
        "focus-manage-confirm-dismiss"
    ]);

    let selectedTimerMode = "countdown";
    let plannedSeconds = 300;
    let startedAtMs = 0;
    let pausedElapsedSeconds = 0;
    let nextCountUpCheckpointSeconds = 7200;
    let isRunning = false;
    let isPaused = false;
    let isSubmitting = false;
    let isFocusManageSaving = false;
    let completionTonePlayed = false;
    let activeConfirmContext = "stop";
    let dragState = null;
    let sliderDragState = null;
    let focusManageScrollbarDragState = null;

    const layoutAssetField = layoutAssetSelect.closest(".pl-field");
    const layoutScaleField = layoutScale.closest(".pl-field");
    const layoutXField = layoutX.closest(".pl-field");
    const layoutYField = layoutY.closest(".pl-field");
    const layoutWidthField = layoutWidth.closest(".pl-field");
    const layoutHeightField = layoutHeight.closest(".pl-field");

    let layoutComponentField = null;
    let layoutComponentSelect = document.getElementById("pl-layout-component-select");
    let layoutComponentStatus = document.getElementById("pl-layout-component-status");

    let layoutHitScaleField = document.getElementById("pl-layout-hit-scale-field");
    let layoutHitScaleX = document.getElementById("pl-layout-hit-scale-x");
    let layoutHitScaleXNumber = document.getElementById("pl-layout-hit-scale-x-number");
    let layoutHitScaleY = document.getElementById("pl-layout-hit-scale-y");
    let layoutHitScaleYNumber = document.getElementById("pl-layout-hit-scale-y-number");
    let layoutHitScaleStatus = document.getElementById("pl-layout-hit-scale-status");
    let layoutAspectRatioField = document.getElementById("pl-layout-aspect-ratio-field");
    let layoutAspectRatioLock = document.getElementById("pl-layout-aspect-ratio-lock");
    let layoutAspectRatioStatus = document.getElementById("pl-layout-aspect-ratio-status");

    let layoutColorField = null;
    let layoutColorPicker = null;
    let layoutColorText = null;
    let layoutColorHint = null;

    let layoutTextControls = null;
    let layoutTextContent = null;
    let layoutTextFontFamily = null;
    let layoutTextFontSize = null;
    let layoutTextColorPicker = null;
    let layoutTextColorText = null;
    let layoutTextBold = null;
    let layoutTextItalic = null;
    let layoutTextStyleStatus = null;

    let componentOutline = document.getElementById("pl-layout-component-outline");
    let hitOutline = document.getElementById("pl-layout-hit-outline");

    const defaultLayoutEdgeColor = normalizeHexColor(
        getComputedStyle(document.documentElement).getPropertyValue(layoutEdgeColorVariableName),
        "#01ff75");
    //#endregion SEGMENT A - Element References And Runtime State

    //#region SEGMENT B - CSS Readers And Asset Helpers
    function readCssPxVar(varName, fallbackValue) {
        const raw = getComputedStyle(homeRoot).getPropertyValue(varName).trim();

        if (!raw) {
            return fallbackValue;
        }

        const parsed = parseFloat(raw.replace("px", ""));
        return Number.isFinite(parsed) ? parsed : fallbackValue;
    }

    function readCssNumberVar(varName, fallbackValue) {
        const raw = getComputedStyle(homeRoot).getPropertyValue(varName).trim();

        if (!raw) {
            return fallbackValue;
        }

        const parsed = parseFloat(raw);
        return Number.isFinite(parsed) ? parsed : fallbackValue;
    }

    function readCssUrlVar(varName) {
        const raw = getComputedStyle(homeRoot).getPropertyValue(varName).trim();

        if (!raw || raw === "none") {
            return "";
        }

        if (!raw.startsWith("url(") || !raw.endsWith(")")) {
            return "";
        }

        let inner = raw.slice(4, -1).trim();

        if (
            (inner.startsWith('"') && inner.endsWith('"'))
            || (inner.startsWith("'") && inner.endsWith("'"))
        ) {
            inner = inner.slice(1, -1);
        }

        return inner;
    }

    function readDatasetPx(name, fallbackValue) {
        const parsed = parseFloat(homeRoot.dataset[name] || "");
        return Number.isFinite(parsed) ? parsed : fallbackValue;
    }

    function getDesignWidth() {
        return readCssPxVar("--pl-home-screen-width", 428);
    }

    function getDesignHeight() {
        return readCssPxVar("--pl-home-screen-height", 926);
    }

    function getUiAuthorFrameWidth() {
        return readDatasetPx("uiAuthorFrameWidth", readCssPxVar("--pl-safe-ui-author-width", getDesignWidth()));
    }

    function getUiAuthorFrameHeight() {
        return readDatasetPx("uiAuthorFrameHeight", readCssPxVar("--pl-safe-ui-author-height", getDesignHeight()));
    }

    function getSafeFrameWidth() {
        return readDatasetPx("safeFrameWidth", getUiAuthorFrameWidth());
    }

    function getSafeFrameHeight() {
        return readDatasetPx("safeFrameHeight", getUiAuthorFrameHeight());
    }

    function getUiProjectionScale() {
        return readDatasetPx("uiProjectionScale", 1);
    }

    function getWorldStageScale() {
        const parsed = parseFloat(homeRoot.dataset.worldStageScale || "1");
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    }

    function getSafeUiStageScale() {
        const parsed = parseFloat(homeRoot.dataset.safeUiStageScale || "1");
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    }

    function getAssetElement(assetKey) {
        return layoutAssets[assetKey]?.element || null;
    }

    function getAssetStageType(assetKey) {
        return layoutAssets[assetKey]?.stage || "ui";
    }

    function getAssetStageElement(assetKey) {
        return getAssetStageType(assetKey) === "world" ? worldStage : safeUiStage;
    }

    function getAssetStageRect(assetKey) {
        return getAssetStageElement(assetKey).getBoundingClientRect();
    }

    function getAssetStageScale(assetKey) {
        return getAssetStageType(assetKey) === "world"
            ? getWorldStageScale()
            : getSafeUiStageScale();
    }

    function clientToAssetDesignPoint(assetKey, clientX, clientY) {
        const rect = getAssetStageRect(assetKey);
        const scale = getAssetStageScale(assetKey);

        if (isSelfLabeledTextAsset(assetKey)) {
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }

        return {
            x: (clientX - rect.left) / scale,
            y: (clientY - rect.top) / scale
        };
    }

    function assetHasArt(assetKey) {
        const varName = artImageVars[assetKey];
        return !!(varName && readCssUrlVar(varName));
    }

    function getArtImageCssVariableName(assetKey, componentKey = "root") {
        if (!assetKey) {
            return "";
        }

        if (!componentKey || componentKey === "root") {
            return artImageVars[assetKey] || "";
        }

        return artComponentImageVars[assetKey]?.[componentKey] || "";
    }

    function getLayoutAssetImageVariableKey(assetKey, componentKey = "root") {
        if (!componentKey || componentKey === "root") {
            return `assetImage:${assetKey}`;
        }

        return `assetImage:${assetKey}:${componentKey}`;
    }

    function getFileNameFromAssetUrl(rawUrl) {
        const value = String(rawUrl || "").trim();

        if (!value) {
            return "";
        }

        const withoutQuery = value.split("?")[0].split("#")[0];
        const segments = withoutQuery.split("/");
        const fileName = segments[segments.length - 1] || "";

        try {
            return decodeURIComponent(fileName);
        }
        catch {
            return fileName;
        }
    }
    //#endregion SEGMENT B - CSS Readers And Asset Helpers

    //#region SEGMENT C - Layout State Normalizers And Persistence
    function normalizeLayoutOverride(value) {
        if (!value || typeof value !== "object") {
            return null;
        }

        const rawLockAspectRatio =
            value.lockAspectRatio
            ?? value.LockAspectRatio
            ?? value.aspectRatioLocked
            ?? value.AspectRatioLocked;
        let normalizedLockAspectRatio = null;

        if (typeof rawLockAspectRatio === "boolean") {
            normalizedLockAspectRatio = rawLockAspectRatio;
        }
        else if (rawLockAspectRatio != null) {
            const normalized = String(rawLockAspectRatio).trim().toLowerCase();

            if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
                normalizedLockAspectRatio = true;
            }
            else if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
                normalizedLockAspectRatio = false;
            }
        }

        return {
            x: value.x ?? value.X,
            y: value.y ?? value.Y,
            width: value.width ?? value.Width,
            height: value.height ?? value.Height,
            scale: value.scale ?? value.Scale,
            lockAspectRatio: normalizedLockAspectRatio,
            components: normalizeLayoutComponents(value.components ?? value.Components),
            text: normalizeLayoutTextStorage(value.text ?? value.Text),
            states: normalizeLayoutAssetStates(value.states ?? value.States)
        };
    }

    function normalizeComponentOverride(value) {
        if (!value || typeof value !== "object") {
            return null;
        }

        const legacyHitScale = value.hitScale ?? value.HitScale;

        return {
            x: value.x ?? value.X,
            y: value.y ?? value.Y,
            width: value.width ?? value.Width,
            height: value.height ?? value.Height,
            scale: value.scale ?? value.Scale,
            hitScaleX: value.hitScaleX ?? value.HitScaleX ?? legacyHitScale,
            hitScaleY: value.hitScaleY ?? value.HitScaleY ?? legacyHitScale
        };
    }

    function normalizeLayoutComponents(components) {
        if (!components || typeof components !== "object") {
            return {};
        }

        const result = {};

        Object.entries(components).forEach(function ([key, value]) {
            const normalized = normalizeComponentOverride(value);
            if (normalized) {
                result[key] = normalized;
            }
        });

        return result;
    }

    function normalizeLayoutTextStorage(value) {
        if (!value || typeof value !== "object") {
            return {};
        }

        const result = {};
        const keys = ["content", "fontFamily", "fontSize", "color", "bold", "italic", "x", "y"];

        keys.forEach(function (key) {
            const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
            const rawValue = value[key] ?? value[pascalKey];

            if (rawValue != null) {
                result[key] = String(rawValue);
            }
        });

        return result;
    }

    function normalizeLayoutItems(items) {
        if (!items || typeof items !== "object") {
            return {};
        }

        const result = {};

        Object.entries(items).forEach(([key, value]) => {
            const normalized = normalizeLayoutOverride(value);
            if (normalized) {
                result[key] = normalized;
            }
        });

        return result;
    }

    function getRenderedShellThemeColor() {
        const metaColor = themeColorMeta ? themeColorMeta.getAttribute("content") : "";
        const cssColor = getComputedStyle(document.documentElement).getPropertyValue(layoutEdgeColorVariableName);

        return normalizeHexColor(metaColor || cssColor, defaultLayoutEdgeColor);
    }

    function cloneJsonCompatibleObject(value) {
        if (!value || typeof value !== "object") {
            return {};
        }

        return JSON.parse(JSON.stringify(value));
    }

    function ensureLayoutVariableDefaults(variables, fallbackColor = null) {
        const result = normalizeLayoutVariables(variables);

        if (!result.appEdgeColor) {
            result.appEdgeColor = normalizeHexColor(fallbackColor, getRenderedShellThemeColor());
        }

        return result;
    }

    function normalizeSceneOverride(value) {
        if (!value || typeof value !== "object") {
            return null;
        }

        const rawAssets = Array.isArray(value.assets ?? value.Assets)
            ? (value.assets ?? value.Assets)
            : [];
        const rawRemovedAssets = Array.isArray(value.removedAssets ?? value.RemovedAssets)
            ? (value.removedAssets ?? value.RemovedAssets)
            : [];
        const normalizedAssets = rawAssets
            .map(function (item) {
                return String(item || "").trim();
            })
            .filter(Boolean);
        const normalizedRemovedAssets = rawRemovedAssets
            .map(function (item) {
                return String(item || "").trim();
            })
            .filter(Boolean);

        return {
            label: String(value.label ?? value.Label ?? "").trim(),
            assets: Array.from(new Set(normalizedAssets)),
            removedAssets: Array.from(new Set(normalizedRemovedAssets))
        };
    }

    function normalizeSceneOverrides(value) {
        if (!value || typeof value !== "object") {
            return {};
        }

        const result = {};

        Object.entries(value).forEach(function ([key, item]) {
            const normalized = normalizeSceneOverride(item);

            if (normalized) {
                result[key] = normalized;
            }
        });

        return result;
    }

    function normalizeSceneAssetDefinition(value) {
        if (!value || typeof value !== "object") {
            return null;
        }

        const type = String(value.type ?? value.Type ?? "").trim().toLowerCase();
        if (type !== "text" && type !== "built-in") {
            return null;
        }

        const rawBehaviorRole = value.behaviorRole ?? value.BehaviorRole;
        const normalizedBehaviorRole = behaviorRoleDefinitions[String(rawBehaviorRole ?? "").trim()]
            ? String(rawBehaviorRole).trim()
            : "";

        if (type === "built-in") {
            return {
                type: "built-in",
                presetKey: "",
                text: "",
                behaviorRole: normalizedBehaviorRole
            };
        }

        const presetKey = String(value.presetKey ?? value.PresetKey ?? "text-label").trim();
        const resolvedPresetKey = textAssetPresetDefinitions[presetKey] ? presetKey : "text-label";

        return {
            type: "text",
            presetKey: resolvedPresetKey,
            text: String(value.text ?? value.Text ?? "").trim() || "New Text",
            behaviorRole: normalizedBehaviorRole
        };
    }

    function normalizeSceneAssetDefinitions(value) {
        if (!value || typeof value !== "object") {
            return {};
        }

        const result = {};

        Object.entries(value).forEach(function ([key, item]) {
            const normalized = normalizeSceneAssetDefinition(item);

            if (normalized) {
                result[key] = normalized;
            }
        });

        return result;
    }

    function normalizeLayoutAssetStateOverride(value) {
        if (!value || typeof value !== "object") {
            return null;
        }

        const rawVisible = value.visible ?? value.Visible;
        let normalizedVisible = null;

        if (typeof rawVisible === "boolean") {
            normalizedVisible = rawVisible;
        }
        else if (rawVisible != null) {
            const normalizedRaw = String(rawVisible).trim().toLowerCase();

            if (normalizedRaw === "true" || normalizedRaw === "1" || normalizedRaw === "yes" || normalizedRaw === "on") {
                normalizedVisible = true;
            }
            else if (normalizedRaw === "false" || normalizedRaw === "0" || normalizedRaw === "no" || normalizedRaw === "off") {
                normalizedVisible = false;
            }
        }

        return {
            visible: normalizedVisible
        };
    }

    function normalizeLayoutAssetStates(states) {
        if (!states || typeof states !== "object") {
            return {};
        }

        const result = {};

        Object.entries(states).forEach(function ([key, value]) {
            const normalized = normalizeLayoutAssetStateOverride(value);

            if (normalized) {
                result[key] = normalized;
            }
        });

        return result;
    }

    function cloneNormalizedLayoutItems(items) {
        return normalizeLayoutItems(cloneJsonCompatibleObject(items));
    }

    function cloneNormalizedLayoutVariables(variables, fallbackColor = null) {
        return ensureLayoutVariableDefaults(cloneJsonCompatibleObject(variables), fallbackColor);
    }

    function ensureSharedLayoutVariableDefaults() {
        sharedLayoutVariables = ensureLayoutVariableDefaults(sharedLayoutVariables);
    }

    async function loadSharedLayoutState() {
        try {
            const response = await fetch(layoutSyncReadUrl, { cache: "no-store" });

            if (!response.ok) {
                sharedLayoutState = {};
                sharedLayoutVariables = {};
                sharedDefaultLayoutState = {};
                sharedDefaultLayoutVariables = {};
                ensureSharedLayoutVariableDefaults();
                applyLayoutVariables();
                return;
            }

            const payload = await response.json();
            sharedLayoutState = normalizeLayoutItems(payload?.items ?? payload?.Items);
            sharedLayoutVariables = normalizeLayoutVariables(payload?.variables ?? payload?.Variables);
            sharedDefaultLayoutState = normalizeLayoutItems(
                payload?.defaultItems
                ?? payload?.DefaultItems
                ?? payload?.items
                ?? payload?.Items);
            sharedDefaultLayoutVariables = normalizeLayoutVariables(
                payload?.defaultVariables
                ?? payload?.DefaultVariables
                ?? payload?.variables
                ?? payload?.Variables);
            sharedSceneOverrides = normalizeSceneOverrides(payload?.scenes ?? payload?.Scenes);
            sharedSceneAssetDefinitions = normalizeSceneAssetDefinitions(payload?.sceneAssets ?? payload?.SceneAssets);
        }
        catch {
            sharedLayoutState = {};
            sharedLayoutVariables = {};
            sharedDefaultLayoutState = {};
            sharedDefaultLayoutVariables = {};
            sharedSceneOverrides = {};
            sharedSceneAssetDefinitions = {};
        }

        ensureSharedLayoutVariableDefaults();
        sharedDefaultLayoutVariables = ensureLayoutVariableDefaults(
            sharedDefaultLayoutVariables,
            sharedLayoutVariables.appEdgeColor);
        currentVariableDraftKey = null;
        currentVariableDraftValue = null;
        rebuildDynamicSceneAssets();
        applyLayoutVariables();
    }

    async function saveSharedLayoutState() {
        ensureSharedLayoutVariableDefaults();

        try {
            await fetch(layoutSyncWriteUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    items: sharedLayoutState,
                    variables: sharedLayoutVariables,
                    defaultItems: sharedDefaultLayoutState,
                    defaultVariables: sharedDefaultLayoutVariables,
                    scenes: sharedSceneOverrides,
                    sceneAssets: sharedSceneAssetDefinitions
                })
            });
        }
        catch {
        }
    }

    function analyzeImageMetrics(image) {
        const metrics = {
            canvasWidth: image.naturalWidth,
            canvasHeight: image.naturalHeight,
            canvasRatio: image.naturalWidth / image.naturalHeight,
            visibleLeftRatio: 0,
            visibleTopRatio: 0,
            visibleWidthRatio: 1,
            visibleHeightRatio: 1,
            hasVisibleBounds: false
        };

        try {
            const canvas = document.createElement("canvas");
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;

            const context = canvas.getContext("2d", { willReadFrequently: true });

            if (!context) {
                return metrics;
            }

            context.drawImage(image, 0, 0);

            const imageData = context.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data;

            let minX = image.naturalWidth;
            let minY = image.naturalHeight;
            let maxX = -1;
            let maxY = -1;

            for (let y = 0; y < image.naturalHeight; y += 1) {
                for (let x = 0; x < image.naturalWidth; x += 1) {
                    const alpha = imageData[((y * image.naturalWidth) + x) * 4 + 3];

                    if (alpha > 0) {
                        if (x < minX) {
                            minX = x;
                        }

                        if (y < minY) {
                            minY = y;
                        }

                        if (x > maxX) {
                            maxX = x;
                        }

                        if (y > maxY) {
                            maxY = y;
                        }
                    }
                }
            }

            if (maxX >= minX && maxY >= minY) {
                metrics.visibleLeftRatio = minX / image.naturalWidth;
                metrics.visibleTopRatio = minY / image.naturalHeight;
                metrics.visibleWidthRatio = (maxX - minX + 1) / image.naturalWidth;
                metrics.visibleHeightRatio = (maxY - minY + 1) / image.naturalHeight;
                metrics.hasVisibleBounds = true;
            }
        }
        catch {
        }

        return metrics;
    }

    function primeArtMetrics() {
        Object.entries(artImageVars).forEach(function ([assetKey, cssVar]) {
            const url = readCssUrlVar(cssVar);

            if (!url) {
                return;
            }

            const image = new Image();
            image.decoding = "async";

            image.onload = function () {
                artMetrics[assetKey] = analyzeImageMetrics(image);

                if (assetKey === "slider" || assetKey === "slider-nib-art") {
                    updateSliderVisuals();
                }

                if (layoutModeEnabled) {
                    refreshLayoutUi();
                }
            };

            image.src = url;
        });
    }
    //#endregion SEGMENT C - Layout State Normalizers And Persistence

    //#region SEGMENT D1 - Asset State Resolvers And Draft Helpers
    function getCssLayoutDefaults(assetKey) {
        if (isCustomTextAsset(assetKey)) {
            const preset = getTextAssetPresetDefinition(assetKey);

            return {
                x: 0,
                y: 0,
                width: preset.width,
                height: preset.height,
                scale: 100,
                lockAspectRatio: false,
                components: {},
                text: {}
            };
        }

        if (layoutAssetDefaultStates[assetKey]) {
            const defaults = layoutAssetDefaultStates[assetKey];

            return {
                x: defaults.x,
                y: defaults.y,
                width: defaults.width,
                height: defaults.height,
                scale: defaults.scale,
                lockAspectRatio: false,
                components: {},
                text: {}
            };
        }

        const metrics = artMetrics[assetKey];
        const defaultWidth = readCssPxVar(`--pl-layout-${assetKey}-width`, 160);

        return {
            x: readCssPxVar(`--pl-layout-${assetKey}-x`, 0),
            y: readCssPxVar(`--pl-layout-${assetKey}-y`, 0),
            width: defaultWidth,
            height: readCssPxVar(`--pl-layout-${assetKey}-height`, metrics && metrics.canvasRatio > 0 ? Math.round(defaultWidth / metrics.canvasRatio) : 56),
            scale: readCssNumberVar(`--pl-layout-${assetKey}-scale`, 100),
            lockAspectRatio: !!(metrics && metrics.canvasRatio > 0),
            components: {},
            text: {}
        };
    }

    function getDefaultComponentState(assetKey, componentKey) {
        if (assetKey === "slider") {
            switch (componentKey) {
                case "empty":
                case "fill":
                case "nib":
                    return {
                        x: 0,
                        y: 0,
                        width: null,
                        height: null,
                        scale: 100,
                        hitScaleX: 100,
                        hitScaleY: 100
                    };
                case "nib-hit":
                    return {
                        x: 0,
                        y: 0,
                        width: null,
                        height: null,
                        scale: 100,
                        hitScaleX: 100,
                        hitScaleY: 100
                    };
                default:
                    return {
                        x: 0,
                        y: 0,
                        width: null,
                        height: null,
                        scale: 100,
                        hitScaleX: 100,
                        hitScaleY: 100
                    };
            }
        }

        return {
            x: 0,
            y: 0,
            width: null,
            height: null,
            scale: 100,
            hitScaleX: 100,
            hitScaleY: 100
        };
    }

    function getTextLabelElement(assetKey) {
        return layoutTextAssets[assetKey] || null;
    }

    function assetSupportsEditableText(assetKey) {
        return !!getTextLabelElement(assetKey);
    }

    function isTextComponent(assetKey, componentKey) {
        return assetSupportsEditableText(assetKey) && componentKey === "text";
    }

    function readTextStorageInt(value, fallbackValue) {
        const parsed = parseInt(String(value ?? ""), 10);
        return Number.isFinite(parsed) ? parsed : fallbackValue;
    }

    function readTextStorageBoolean(value, fallbackValue) {
        if (typeof value === "boolean") {
            return value;
        }

        const normalized = String(value ?? "").trim().toLowerCase();

        if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
            return true;
        }

        if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
            return false;
        }

        return fallbackValue;
    }

    function normalizeEditableTextState(rawState, fallbackState) {
        return {
            content: typeof rawState?.content === "string" ? rawState.content : fallbackState.content,
            fontFamily: typeof rawState?.fontFamily === "string" && rawState.fontFamily.trim()
                ? rawState.fontFamily.trim()
                : fallbackState.fontFamily,
            fontSize: Math.max(8, readTextStorageInt(rawState?.fontSize, fallbackState.fontSize)),
            color: normalizeHexColor(rawState?.color, fallbackState.color),
            bold: readTextStorageBoolean(rawState?.bold, fallbackState.bold),
            italic: readTextStorageBoolean(rawState?.italic, fallbackState.italic),
            x: readTextStorageInt(rawState?.x, fallbackState.x),
            y: readTextStorageInt(rawState?.y, fallbackState.y)
        };
    }

    function serializeTextState(textState) {
        return {
            content: String(textState.content ?? ""),
            fontFamily: String(textState.fontFamily ?? layoutTextFontFamilyOptions[0].value),
            fontSize: String(Math.max(8, Math.round(textState.fontSize || 16))),
            color: normalizeHexColor(textState.color, "#ffffff"),
            bold: textState.bold ? "true" : "false",
            italic: textState.italic ? "true" : "false",
            x: String(Math.round(textState.x || 0)),
            y: String(Math.round(textState.y || 0))
        };
    }

    function getCssTextDefaults(assetKey) {
        if (isCustomTextAsset(assetKey)) {
            const preset = getTextAssetPresetDefinition(assetKey);
            const sceneAssetDefinition = getSceneAssetDefinition(assetKey);

            return {
                content: sceneAssetDefinition?.text || "New Text",
                fontFamily: preset.fontFamily,
                fontSize: preset.fontSize,
                color: preset.color,
                bold: preset.bold,
                italic: preset.italic,
                x: 0,
                y: 0
            };
        }

        const labelElement = getTextLabelElement(assetKey);

        if (!labelElement) {
            return null;
        }

        const computedStyle = getComputedStyle(labelElement);
        const parsedFontSize = parseInt(computedStyle.fontSize || "", 10);
        const parsedFontWeight = parseInt(computedStyle.fontWeight || "", 10);

        return {
            content: labelElement.textContent || "",
            fontFamily: computedStyle.fontFamily || layoutTextFontFamilyOptions[0].value,
            fontSize: Number.isFinite(parsedFontSize) && parsedFontSize > 0 ? parsedFontSize : 16,
            color: normalizeHexColor(computedStyle.color, "#ffffff"),
            bold: Number.isFinite(parsedFontWeight)
                ? parsedFontWeight >= 700
                : /bold/i.test(String(computedStyle.fontWeight || "")),
            italic: String(computedStyle.fontStyle || "").toLowerCase().includes("italic"),
            x: 0,
            y: 0
        };
    }

    function getSavedLayoutState(assetKey) {
        const defaults = getCssLayoutDefaults(assetKey);
        const stored = sharedLayoutState[assetKey] || {};

        return {
            x: stored.x ?? defaults.x,
            y: stored.y ?? defaults.y,
            width: stored.width ?? defaults.width,
            height: stored.height ?? defaults.height,
            scale: stored.scale ?? defaults.scale,
            lockAspectRatio: stored.lockAspectRatio ?? defaults.lockAspectRatio,
            components: stored.components ?? {},
            text: stored.text ?? {},
            states: stored.states ?? {}
        };
    }

    function getSavedTextState(assetKey) {
        if (!assetSupportsEditableText(assetKey)) {
            return null;
        }

        const defaults = getCssTextDefaults(assetKey);
        const stored = getSavedLayoutState(assetKey).text || {};

        return normalizeEditableTextState(stored, defaults);
    }

    function getSavedComponentState(assetKey, componentKey) {
        const base = getDefaultComponentState(assetKey, componentKey);
        const stored = getSavedLayoutState(assetKey).components?.[componentKey] || {};

        return {
            x: stored.x ?? base.x,
            y: stored.y ?? base.y,
            width: stored.width ?? base.width,
            height: stored.height ?? base.height,
            scale: stored.scale ?? base.scale,
            hitScaleX: stored.hitScaleX ?? base.hitScaleX,
            hitScaleY: stored.hitScaleY ?? base.hitScaleY
        };
    }

    function getEffectiveLayoutState(assetKey) {
        const saved = getSavedLayoutState(assetKey);

        if (currentDraftKind === "asset" && currentDraftAssetKey === assetKey && currentDraftState) {
            return {
                x: currentDraftState.x ?? saved.x,
                y: currentDraftState.y ?? saved.y,
                width: currentDraftState.width ?? saved.width,
                height: currentDraftState.height ?? saved.height,
                scale: currentDraftState.scale ?? saved.scale,
                lockAspectRatio: currentDraftState.lockAspectRatio ?? saved.lockAspectRatio,
                components: saved.components,
                text: saved.text
            };
        }

        return saved;
    }

    function getEffectiveTextState(assetKey) {
        const saved = getSavedTextState(assetKey);

        if (!saved) {
            return null;
        }

        if (currentTextDraftAssetKey === assetKey && currentTextDraftState) {
            return normalizeEditableTextState(currentTextDraftState, saved);
        }

        return saved;
    }

    function getEffectiveComponentState(assetKey, componentKey) {
        const saved = getSavedComponentState(assetKey, componentKey);

        if (currentDraftKind === "component"
            && currentDraftAssetKey === assetKey
            && currentDraftComponentKey === componentKey
            && currentDraftState) {
            return {
                x: currentDraftState.x ?? saved.x,
                y: currentDraftState.y ?? saved.y,
                width: currentDraftState.width ?? saved.width,
                height: currentDraftState.height ?? saved.height,
                scale: currentDraftState.scale ?? saved.scale,
                hitScaleX: currentDraftState.hitScaleX ?? saved.hitScaleX,
                hitScaleY: currentDraftState.hitScaleY ?? saved.hitScaleY
            };
        }

        return saved;
    }

    function getResolvedHeight(assetKey, state) {
        const metrics = artMetrics[assetKey];

        if (state?.lockAspectRatio && metrics && metrics.canvasRatio > 0) {
            return Math.max(1, Math.round(state.width / metrics.canvasRatio));
        }

        return state.height;
    }

    function getScaledAssetSize(assetKey, state) {
        const resolvedHeight = getResolvedHeight(assetKey, state);
        const scaleRatio = Math.max(0.01, (state.scale || 100) / 100);

        return {
            width: Math.max(1, state.width * scaleRatio),
            height: Math.max(1, resolvedHeight * scaleRatio)
        };
    }

    function getSelectedAssetKey() {
        return layoutAssetSelect.value;
    }

    function getSelectedComponentKey() {
        return layoutComponentSelect ? layoutComponentSelect.value || "root" : "root";
    }

    function isRootComponent(componentKey) {
        return !componentKey || componentKey === "root";
    }

    function beginDraftForSelected(partialState) {
        const assetKey = getSelectedAssetKey();
        const componentKey = getSelectedComponentKey();

        if (isRootComponent(componentKey)) {
            const baseState = getEffectiveLayoutState(assetKey);

            currentDraftKind = "asset";
            currentDraftAssetKey = assetKey;
            currentDraftComponentKey = "root";
            currentDraftState = {
                x: partialState?.x ?? baseState.x,
                y: partialState?.y ?? baseState.y,
                width: partialState?.width ?? baseState.width,
                height: partialState?.height ?? baseState.height,
                scale: partialState?.scale ?? baseState.scale,
                lockAspectRatio: partialState?.lockAspectRatio ?? baseState.lockAspectRatio
            };

            return;
        }

        const baseState = getEffectiveComponentState(assetKey, componentKey);

        currentDraftKind = "component";
        currentDraftAssetKey = assetKey;
        currentDraftComponentKey = componentKey;
        currentDraftState = {
            x: partialState?.x ?? baseState.x,
            y: partialState?.y ?? baseState.y,
            width: partialState?.width ?? baseState.width,
            height: partialState?.height ?? baseState.height,
            scale: partialState?.scale ?? baseState.scale,
            hitScaleX: partialState?.hitScaleX ?? baseState.hitScaleX,
            hitScaleY: partialState?.hitScaleY ?? baseState.hitScaleY
        };
    }

    function beginAssetDraft(assetKey, partialState) {
        const baseState = getEffectiveLayoutState(assetKey);

        currentDraftKind = "asset";
        currentDraftAssetKey = assetKey;
        currentDraftComponentKey = "root";
        currentDraftState = {
            x: partialState?.x ?? baseState.x,
            y: partialState?.y ?? baseState.y,
            width: partialState?.width ?? baseState.width,
            height: partialState?.height ?? baseState.height,
            scale: partialState?.scale ?? baseState.scale,
            lockAspectRatio: partialState?.lockAspectRatio ?? baseState.lockAspectRatio
        };
    }

    function beginTextDraft(assetKey, partialState) {
        const baseState = getEffectiveTextState(assetKey);

        if (!baseState) {
            return;
        }

        currentTextDraftAssetKey = assetKey;
        currentTextDraftState = normalizeEditableTextState(
            Object.assign({}, baseState, partialState || {}),
            baseState);
    }

    function discardCurrentDraft() {
        const assetKey = currentDraftAssetKey;
        const componentKey = currentDraftComponentKey;

        currentDraftKind = null;
        currentDraftAssetKey = null;
        currentDraftComponentKey = null;
        currentDraftState = null;

        if (!assetKey) {
            return;
        }

        if (assetKey === "slider") {
            updateSliderVisuals();
            refreshLayoutUi();
            return;
        }

        if (isRootComponent(componentKey)) {
            applyAssetLayout(assetKey);
        }

        refreshLayoutUi();
    }

    function discardCurrentTextDraft() {
        const assetKey = currentTextDraftAssetKey;

        currentTextDraftAssetKey = null;
        currentTextDraftState = null;

        if (!assetKey) {
            return;
        }

        applyAssetTextStyle(assetKey);
        refreshLayoutUi();
    }

    function clearCurrentImageDraftState() {
        if (currentImageDraftObjectUrl) {
            URL.revokeObjectURL(currentImageDraftObjectUrl);
        }

        currentImageDraftAssetKey = null;
        currentImageDraftComponentKey = null;
        currentImageDraftFile = null;
        currentImageDraftUrl = null;
        currentImageDraftLabel = null;
        currentImageDraftObjectUrl = null;
    }

    //#endregion SEGMENT D1 - Asset State Resolvers And Draft Helpers

    //#region SEGMENT D2 - Layout Asset Persistence And Visibility
    async function refreshArtMetricsForAsset(assetKey, url) {
        if (!assetKey || !url) {
            delete artMetrics[assetKey];
            return;
        }

        await new Promise(function (resolve) {
            const image = new Image();
            image.decoding = "async";

            image.onload = function () {
                artMetrics[assetKey] = analyzeImageMetrics(image);
                resolve();
            };

            image.onerror = function () {
                delete artMetrics[assetKey];
                resolve();
            };

            image.src = url;
        });
    }

    function beginImageDraft(assetKey, componentKey, file) {
        if (!assetKey || !file) {
            return;
        }

        clearCurrentImageDraftState();

        currentImageDraftAssetKey = assetKey;
        currentImageDraftComponentKey = componentKey || "root";
        currentImageDraftFile = file;
        currentImageDraftLabel = file.name || "selected.png";
        currentImageDraftObjectUrl = URL.createObjectURL(file);
        currentImageDraftUrl = currentImageDraftObjectUrl;

        applyLayoutVariables();

        if (!isRootComponent(currentImageDraftComponentKey)) {
            applyAllAssetLayouts();
            refreshLayoutUi();
            return;
        }

        refreshArtMetricsForAsset(assetKey, currentImageDraftUrl).then(function () {
            applyAllAssetLayouts();
            refreshLayoutUi();
        });
    }

    function discardCurrentImageDraft() {
        const assetKey = currentImageDraftAssetKey;
        const componentKey = currentImageDraftComponentKey || "root";

        clearCurrentImageDraftState();
        applyLayoutVariables();

        if (!assetKey) {
            return;
        }

        if (componentKey !== "root") {
            applyAllAssetLayouts();
            refreshLayoutUi();
            return;
        }

        refreshArtMetricsForAsset(assetKey, readCssUrlVar(artImageVars[assetKey])).then(function () {
            applyAllAssetLayouts();
            refreshLayoutUi();
        });
    }

    async function uploadLayoutAssetArt(assetKey, file) {
        const payload = new FormData();
        payload.append("assetKey", assetKey);
        payload.append("file", file, file.name || `${assetKey}.png`);

        try {
            const response = await fetch(layoutSyncUploadArtUrl, {
                method: "POST",
                body: payload
            });

            if (!response.ok) {
                return null;
            }

            const result = await response.json();
            return result?.ok && result?.path ? String(result.path) : null;
        }
        catch {
            return null;
        }
    }

    async function saveSelectedLayoutAsset() {
        const assetKey = getSelectedAssetKey();
        const sceneKey = layoutSceneSelect.value || "home";
        const sceneStateKey = getSelectedSceneStateKey();
        const behaviorDraftActive = currentBehaviorDraftAssetKey === assetKey
            && !!currentBehaviorDraftValue
            && assetSupportsBehaviorRole(assetKey);

        if (isVariableAsset(assetKey)) {
            if (currentVariableDraftKey !== "appEdgeColor" || !currentVariableDraftValue) {
                return;
            }

            sharedLayoutVariables.appEdgeColor = currentVariableDraftValue;
            currentVariableDraftKey = null;
            currentVariableDraftValue = null;

            await saveSharedLayoutState();
            applyLayoutVariables();
            refreshLayoutUi();
            return;
        }

        const componentKey = getSelectedComponentKey();
        const textDraftActive = assetSupportsEditableText(assetKey)
            && currentTextDraftAssetKey === assetKey
            && !!currentTextDraftState;
        const textBoxAssetDraftActive = isTextComponent(assetKey, componentKey)
            && isSelfLabeledTextAsset(assetKey)
            && currentDraftKind === "asset"
            && currentDraftAssetKey === assetKey
            && !!currentDraftState;
        const imageDraftActive = currentImageDraftAssetKey === assetKey
            && (currentImageDraftComponentKey || "root") === componentKey
            && !!currentImageDraftFile;
        const visibilityDraftActive = sceneStateKey !== "base"
            && currentVisibilityDraftAssetKey === assetKey
            && currentVisibilityDraftSceneKey === sceneKey
            && currentVisibilityDraftStateKey === sceneStateKey
            && typeof currentVisibilityDraftValue === "boolean";

        if (imageDraftActive) {
            const uploadedPath = await uploadLayoutAssetArt(assetKey, currentImageDraftFile);

            if (!uploadedPath) {
                refreshLayoutUi();
                return;
            }

            sharedLayoutVariables[getLayoutAssetImageVariableKey(assetKey, componentKey)] = uploadedPath;
            clearCurrentImageDraftState();
            applyLayoutVariables();

            if (isRootComponent(componentKey)) {
                await refreshArtMetricsForAsset(assetKey, uploadedPath);
            }
        }

        if (behaviorDraftActive) {
            saveBehaviorRoleOverride(assetKey, currentBehaviorDraftValue);
        }

        if (isRootComponent(componentKey)) {
            const hasAssetDraft = currentDraftKind === "asset"
                && currentDraftAssetKey === assetKey
                && !!currentDraftState;

            if (!hasAssetDraft && !textDraftActive && !imageDraftActive && !visibilityDraftActive && !behaviorDraftActive) {
                return;
            }

            const existing = getSavedLayoutState(assetKey);
            const nextStates = Object.assign({}, existing.states || {});

            if (visibilityDraftActive) {
                const stateStorageKey = getLayoutSceneStateStorageKey(sceneKey, sceneStateKey);
                const defaultVisible = getDefaultSceneAssetVisibility(sceneKey, sceneStateKey, assetKey);

                if (currentVisibilityDraftValue === defaultVisible) {
                    delete nextStates[stateStorageKey];
                }
                else {
                    nextStates[stateStorageKey] = {
                        visible: currentVisibilityDraftValue
                    };
                }
            }

            sharedLayoutState[assetKey] = {
                x: hasAssetDraft ? currentDraftState.x : existing.x,
                y: hasAssetDraft ? currentDraftState.y : existing.y,
                width: hasAssetDraft ? currentDraftState.width : existing.width,
                height: hasAssetDraft ? currentDraftState.height : existing.height,
                scale: hasAssetDraft ? currentDraftState.scale : existing.scale,
                lockAspectRatio: hasAssetDraft ? currentDraftState.lockAspectRatio : existing.lockAspectRatio,
                components: existing.components ?? {},
                text: textDraftActive ? serializeTextState(currentTextDraftState) : (existing.text ?? {}),
                states: nextStates
            };
        }
        else {
            const hasComponentDraft = !isTextComponent(assetKey, componentKey)
                && currentDraftKind === "component"
                && currentDraftAssetKey === assetKey
                && currentDraftComponentKey === componentKey
                && !!currentDraftState;

            if (!hasComponentDraft && !textBoxAssetDraftActive && !textDraftActive && !imageDraftActive && !visibilityDraftActive && !behaviorDraftActive) {
                return;
            }

            const existing = getSavedLayoutState(assetKey);
            const nextComponents = Object.assign({}, existing.components || {});
            const nextStates = Object.assign({}, existing.states || {});

            if (hasComponentDraft) {
                nextComponents[componentKey] = {
                    x: currentDraftState.x,
                    y: currentDraftState.y,
                    width: currentDraftState.width,
                    height: currentDraftState.height,
                    scale: currentDraftState.scale,
                    hitScaleX: currentDraftState.hitScaleX,
                    hitScaleY: currentDraftState.hitScaleY
                };
            }

            if (visibilityDraftActive) {
                const stateStorageKey = getLayoutSceneStateStorageKey(sceneKey, sceneStateKey);
                const defaultVisible = getDefaultSceneAssetVisibility(sceneKey, sceneStateKey, assetKey);

                if (currentVisibilityDraftValue === defaultVisible) {
                    delete nextStates[stateStorageKey];
                }
                else {
                    nextStates[stateStorageKey] = {
                        visible: currentVisibilityDraftValue
                    };
                }
            }

            sharedLayoutState[assetKey] = {
                x: textBoxAssetDraftActive ? currentDraftState.x : existing.x,
                y: textBoxAssetDraftActive ? currentDraftState.y : existing.y,
                width: textBoxAssetDraftActive ? currentDraftState.width : existing.width,
                height: textBoxAssetDraftActive ? currentDraftState.height : existing.height,
                scale: textBoxAssetDraftActive ? currentDraftState.scale : existing.scale,
                lockAspectRatio: textBoxAssetDraftActive ? currentDraftState.lockAspectRatio : existing.lockAspectRatio,
                components: nextComponents,
                text: textDraftActive ? serializeTextState(currentTextDraftState) : (existing.text ?? {}),
                states: nextStates
            };
        }

        currentDraftKind = null;
        currentDraftAssetKey = null;
        currentDraftComponentKey = null;
        currentDraftState = null;
        currentTextDraftAssetKey = null;
        currentTextDraftState = null;
        clearCurrentImageDraftState();
        discardCurrentVisibilityDraft();
        discardCurrentBehaviorRoleDraft();

        await saveSharedLayoutState();
        applyAllAssetLayouts();
        refreshLayoutUi();
    }

    function revertSelectedLayoutAsset() {
        const assetKey = getSelectedAssetKey();

        if (isVariableAsset(assetKey)) {
            discardVariableDraft();
            refreshLayoutUi();
            return;
        }

        const shouldDiscardTextDraft = currentTextDraftAssetKey === assetKey;
        const shouldDiscardImageDraft = currentImageDraftAssetKey === assetKey
            && (currentImageDraftComponentKey || "root") === componentKey;

        discardCurrentDraft();

        if (shouldDiscardTextDraft) {
            discardCurrentTextDraft();
        }

        if (shouldDiscardImageDraft) {
            discardCurrentImageDraft();
        }

        if (currentVisibilityDraftAssetKey === assetKey) {
            discardCurrentVisibilityDraft();
            refreshLayoutUi();
        }

        if (currentBehaviorDraftAssetKey === assetKey) {
            discardCurrentBehaviorRoleDraft();
            refreshLayoutUi();
        }
    }

    function resetSelectedLayoutAsset() {
        const assetKey = getSelectedAssetKey();
        const sceneKey = layoutSceneSelect.value || "home";
        const sceneStateKey = getSelectedSceneStateKey();

        if (isVariableAsset(assetKey)) {
            beginVariableDraft("appEdgeColor", getCssLayoutVariableDefaults().appEdgeColor);
            syncLayoutColorInputs(currentVariableDraftValue);
            updateLayoutCodePreview(assetKey, "root");
            updateLayoutStatusDisplay(assetKey, "root");
            return;
        }

        if (isSceneBuilderModeSelected() && assetSupportsBehaviorRole(assetKey)) {
            beginBehaviorRoleDraft(assetKey, getDefaultBehaviorRole(assetKey));
            refreshLayoutUi();
            return;
        }

        const componentKey = getSelectedComponentKey();

        if (isTextComponent(assetKey, componentKey)) {
            beginTextDraft(assetKey, getCssTextDefaults(assetKey));

            if (isSelfLabeledTextAsset(assetKey)) {
                beginAssetDraft(assetKey, getCssLayoutDefaults(assetKey));
            }

            applyAssetTextStyle(assetKey);
            applyAssetLayout(assetKey);
            refreshLayoutUi();
            return;
        }

        if (sceneStateKey !== "base") {
            beginVisibilityDraft(
                assetKey,
                sceneKey,
                sceneStateKey,
                getDefaultSceneAssetVisibility(sceneKey, sceneStateKey, assetKey));
        }

        if (isRootComponent(componentKey)) {
            beginDraftForSelected(getCssLayoutDefaults(assetKey));
        }
        else {
            beginDraftForSelected(getDefaultComponentState(assetKey, componentKey));
        }

        applyAllAssetLayouts();
        refreshLayoutUi();
    }

    function clearAllLayoutDrafts() {
        const imageDraftAssetKey = currentImageDraftAssetKey;
        const hadImageDraft = !!currentImageDraftUrl;

        currentDraftKind = null;
        currentDraftAssetKey = null;
        currentDraftComponentKey = null;
        currentDraftState = null;
        currentVariableDraftKey = null;
        currentVariableDraftValue = null;
        currentTextDraftAssetKey = null;
        currentTextDraftState = null;
        clearCurrentImageDraftState();
        discardCurrentVisibilityDraft();
        discardCurrentBehaviorRoleDraft();

        if (hadImageDraft) {
            applyLayoutVariables();

            if (imageDraftAssetKey && artImageVars[imageDraftAssetKey]) {
                refreshArtMetricsForAsset(imageDraftAssetKey, readCssUrlVar(artImageVars[imageDraftAssetKey])).then(function () {
                    applyAllAssetLayouts();
                    refreshLayoutUi();
                });
            }
        }
    }

    function buildPersistedLayoutSnapshotFromEditorState() {
        const snapshotItems = cloneNormalizedLayoutItems(sharedLayoutState);
        const snapshotVariables = cloneNormalizedLayoutVariables(sharedLayoutVariables);

        if (currentVariableDraftKey === "appEdgeColor" && currentVariableDraftValue) {
            snapshotVariables.appEdgeColor = currentVariableDraftValue;
        }

        if (currentDraftAssetKey && currentDraftState) {
            const existing = snapshotItems[currentDraftAssetKey] || getSavedLayoutState(currentDraftAssetKey);

            if (currentDraftKind === "asset") {
                snapshotItems[currentDraftAssetKey] = {
                    x: currentDraftState.x,
                    y: currentDraftState.y,
                    width: currentDraftState.width,
                    height: currentDraftState.height,
                    scale: currentDraftState.scale,
                    lockAspectRatio: currentDraftState.lockAspectRatio,
                    components: existing.components ?? {},
                    text: existing.text ?? {},
                    states: existing.states ?? {}
                };
            }
            else if (currentDraftKind === "component" && currentDraftComponentKey) {
                const nextComponents = Object.assign({}, existing.components || {});
                nextComponents[currentDraftComponentKey] = {
                    x: currentDraftState.x,
                    y: currentDraftState.y,
                    width: currentDraftState.width,
                    height: currentDraftState.height,
                    scale: currentDraftState.scale,
                    hitScaleX: currentDraftState.hitScaleX,
                    hitScaleY: currentDraftState.hitScaleY
                };

                snapshotItems[currentDraftAssetKey] = {
                    x: existing.x,
                    y: existing.y,
                    width: existing.width,
                    height: existing.height,
                    scale: existing.scale,
                    lockAspectRatio: existing.lockAspectRatio,
                    components: nextComponents,
                    text: existing.text ?? {},
                    states: existing.states ?? {}
                };
            }
        }

        if (currentTextDraftAssetKey && currentTextDraftState) {
            const existing = snapshotItems[currentTextDraftAssetKey] || getSavedLayoutState(currentTextDraftAssetKey);
            snapshotItems[currentTextDraftAssetKey] = {
                x: existing.x,
                y: existing.y,
                width: existing.width,
                height: existing.height,
                scale: existing.scale,
                lockAspectRatio: existing.lockAspectRatio,
                components: existing.components ?? {},
                text: serializeTextState(currentTextDraftState),
                states: existing.states ?? {}
            };
        }

        if (
            currentVisibilityDraftAssetKey
            && currentVisibilityDraftSceneKey
            && currentVisibilityDraftStateKey
            && typeof currentVisibilityDraftValue === "boolean"
        ) {
            const existing = snapshotItems[currentVisibilityDraftAssetKey]
                || getSavedLayoutState(currentVisibilityDraftAssetKey);
            const nextStates = Object.assign({}, existing.states || {});
            const stateStorageKey = getLayoutSceneStateStorageKey(
                currentVisibilityDraftSceneKey,
                currentVisibilityDraftStateKey);
            const defaultVisible = getDefaultSceneAssetVisibility(
                currentVisibilityDraftSceneKey,
                currentVisibilityDraftStateKey,
                currentVisibilityDraftAssetKey);

            if (currentVisibilityDraftValue === defaultVisible) {
                delete nextStates[stateStorageKey];
            }
            else {
                nextStates[stateStorageKey] = {
                    visible: currentVisibilityDraftValue
                };
            }

            snapshotItems[currentVisibilityDraftAssetKey] = {
                x: existing.x,
                y: existing.y,
                width: existing.width,
                height: existing.height,
                scale: existing.scale,
                lockAspectRatio: existing.lockAspectRatio,
                components: existing.components ?? {},
                text: existing.text ?? {},
                states: nextStates
            };
        }
 
        return {
            items: snapshotItems,
            variables: snapshotVariables
        };
    }

    async function saveLayoutAsDefault() {
        const snapshot = buildPersistedLayoutSnapshotFromEditorState();

        sharedLayoutState = cloneNormalizedLayoutItems(snapshot.items);
        sharedLayoutVariables = cloneNormalizedLayoutVariables(snapshot.variables);
        sharedDefaultLayoutState = cloneNormalizedLayoutItems(snapshot.items);
        sharedDefaultLayoutVariables = cloneNormalizedLayoutVariables(snapshot.variables);
        clearAllLayoutDrafts();

        await saveSharedLayoutState();
        applyAllAssetLayouts();
        refreshLayoutUi();
    }

    async function resetLayoutToDefault() {
        sharedLayoutState = cloneNormalizedLayoutItems(sharedDefaultLayoutState);
        sharedLayoutVariables = cloneNormalizedLayoutVariables(
            sharedDefaultLayoutVariables,
            sharedLayoutVariables.appEdgeColor);
        clearAllLayoutDrafts();

        await saveSharedLayoutState();
        applyAllAssetLayouts();
        refreshLayoutUi();
    }

    function getStageBounds(assetKey) {
        if (getAssetStageType(assetKey) === "world") {
            return {
                width: getDesignWidth(),
                height: getDesignHeight()
            };
        }

        if (isSelfLabeledTextAsset(assetKey)) {
            return {
                width: getSafeFrameWidth(),
                height: getSafeFrameHeight()
            };
        }

        return {
            width: getUiAuthorFrameWidth(),
            height: getUiAuthorFrameHeight()
        };
    }

    function describeAxisPlacement(axis, position, size, limit) {
        const roundedPosition = Math.round(position);
        const roundedSize = Math.round(size);
        const insideMax = Math.max(0, Math.round(limit - roundedSize));

        if (roundedPosition < 0) {
            return {
                inside: false,
                text: `0 px (${Math.abs(roundedPosition)} px off ${axis === "x" ? "left" : "top"})`
            };
        }

        if (roundedPosition > insideMax) {
            return {
                inside: false,
                text: `${insideMax} px (${roundedPosition - insideMax} px off ${axis === "x" ? "right" : "bottom"})`
            };
        }

        return {
            inside: true,
            text: `${roundedPosition} px (inside safe zone)`
        };
    }

    function getVisibilityStatus(assetKey, state) {
        const stageBounds = getStageBounds(assetKey);
        const scaledSize = getScaledAssetSize(assetKey, state);

        return {
            xStatus: describeAxisPlacement("x", state.x, scaledSize.width, stageBounds.width),
            yStatus: describeAxisPlacement("y", state.y, scaledSize.height, stageBounds.height)
        };
    }
    //#endregion SEGMENT D2 - Layout Asset Persistence And Visibility

    

    

    //#region SEGMENT E - Layout Variable And Scene Helpers
    function setButtonLabel(button, label) {
        const labelElement = button.querySelector(".pl-button-label");

        if (labelElement) {
            labelElement.textContent = label;
        }
    }

    function isCountUpModeSelected() {
        return selectedTimerMode === "countup";
    }

    function formatClock(totalSeconds) {
        const clamped = Math.max(0, Math.floor(totalSeconds));
        const hours = String(Math.floor(clamped / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((clamped % 3600) / 60)).padStart(2, "0");
        const seconds = String(clamped % 60).padStart(2, "0");
        return `${hours}:${minutes}:${seconds}`;
    }

    function formatDurationLabel(totalSeconds) {
        const clamped = Math.max(0, Math.floor(totalSeconds));
        const hours = Math.floor(clamped / 3600);
        const minutes = Math.floor((clamped % 3600) / 60);
        const seconds = clamped % 60;
        const hourLabel = hours === 1 ? "hour" : "hours";

        return `${hours} ${hourLabel} ${minutes} min ${seconds} sec`;
    }

    function formatDurationSelection(totalMinutes) {
        const minutes = Math.max(1, Math.floor(totalMinutes));
        return formatDurationLabel(minutes * 60);
    }

    function formatMinutesLabel(totalMinutes) {
        const roundedMinutes = Math.max(0, Math.floor(totalMinutes));
        return roundedMinutes === 1 ? "1 minute" : `${roundedMinutes} minutes`;
    }

    function calculateRewardPreview(elapsedSeconds, isComplete) {
        const roundedMinutes = Math.max(0, Math.round(elapsedSeconds / 60));
        const baseXp = Math.round(roundedMinutes * rewardXpPerMinute);
        const multiplier = isComplete ? rewardSleepMultiplier : rewardIncompleteMultiplier;
        const xp = Math.max(0, Math.round(baseXp * multiplier));
        const coins = rewardWindowEligible
            ? Math.max(0, Math.round(xp / 100))
            : 0;

        return { xp, coins };
    }

    function syncTimerModeUi(forcedStateKey = null) {
        const countUpSelected = (forcedStateKey || getRenderedFocusSetupStateKey()) === "countup";

        setupModeBadge.textContent = countUpSelected ? "Count Up" : "Count Down";
        setupModeHint.textContent = countUpSelected
            ? "Count Up starts a stopwatch and pauses every 2 hours so you can confirm it is still intentional."
            : "Count Down uses the slider so you can set a target between 5 and 120 minutes.";

        countdownModeButton.classList.toggle("pl-canvas-button-mode-selected", !countUpSelected);
        countUpModeButton.classList.toggle("pl-canvas-button-mode-selected", countUpSelected);
        applyAssetTextStyle("countdown-mode");
        applyAssetTextStyle("countup-mode");
    }

    function projectAxis(authorPosition, authorBoxSize, authorFrameSize, runtimeFrameSize, uiScale) {
        const projectedSize = Math.max(1, authorBoxSize * uiScale);
        const authorInsideMax = Math.max(0, authorFrameSize - authorBoxSize);
        const runtimeInsideMax = Math.max(0, runtimeFrameSize - projectedSize);

        if (authorPosition < 0) {
            return authorPosition;
        }

        if (authorPosition > authorInsideMax) {
            return runtimeInsideMax + (authorPosition - authorInsideMax);
        }

        if (authorInsideMax <= 0 || runtimeInsideMax <= 0) {
            return 0;
        }

        return (authorPosition / authorInsideMax) * runtimeInsideMax;
    }

    function unprojectAxis(runtimePosition, authorBoxSize, authorFrameSize, runtimeFrameSize, uiScale) {
        const projectedSize = Math.max(1, authorBoxSize * uiScale);
        const authorInsideMax = Math.max(0, authorFrameSize - authorBoxSize);
        const runtimeInsideMax = Math.max(0, runtimeFrameSize - projectedSize);

        if (runtimePosition < 0) {
            return runtimePosition;
        }

        if (runtimePosition > runtimeInsideMax) {
            return authorInsideMax + (runtimePosition - runtimeInsideMax);
        }

        if (authorInsideMax <= 0 || runtimeInsideMax <= 0) {
            return 0;
        }

        return (runtimePosition / runtimeInsideMax) * authorInsideMax;
    }

    function projectUiAssetRect(state, authorWidth, authorHeight) {
        const uiScale = getUiProjectionScale();
        const authorFrameWidth = getUiAuthorFrameWidth();
        const authorFrameHeight = getUiAuthorFrameHeight();
        const runtimeFrameWidth = getSafeFrameWidth();
        const runtimeFrameHeight = getSafeFrameHeight();

        return {
            left: projectAxis(state.x, authorWidth, authorFrameWidth, runtimeFrameWidth, uiScale),
            top: projectAxis(state.y, authorHeight, authorFrameHeight, runtimeFrameHeight, uiScale),
            width: Math.max(1, authorWidth * uiScale),
            height: Math.max(1, authorHeight * uiScale)
        };
    }

    function getSelfLabeledProjectedRect(assetKey, state = null) {
        if (getAssetStageType(assetKey) === "world" || !isSelfLabeledTextAsset(assetKey)) {
            return null;
        }

        const resolvedState = state || getEffectiveLayoutState(assetKey);
        const resolvedHeight = getResolvedHeight(assetKey, resolvedState);
        const authorWidth = resolvedState.width * (resolvedState.scale / 100);
        const authorHeight = resolvedHeight * (resolvedState.scale / 100);

        return projectUiAssetRect(resolvedState, authorWidth, authorHeight);
    }

    function unprojectSelfLabeledPosition(assetKey, runtimeX, runtimeY, state = null) {
        if (getAssetStageType(assetKey) === "world" || !isSelfLabeledTextAsset(assetKey)) {
            return {
                x: runtimeX,
                y: runtimeY
            };
        }

        const resolvedState = state || getEffectiveLayoutState(assetKey);
        const resolvedHeight = getResolvedHeight(assetKey, resolvedState);
        const authorWidth = resolvedState.width * (resolvedState.scale / 100);
        const authorHeight = resolvedHeight * (resolvedState.scale / 100);
        const uiScale = getUiProjectionScale();

        return {
            x: unprojectAxis(runtimeX, authorWidth, getUiAuthorFrameWidth(), getSafeFrameWidth(), uiScale),
            y: unprojectAxis(runtimeY, authorHeight, getUiAuthorFrameHeight(), getSafeFrameHeight(), uiScale)
        };
    }

    function applyPanelArtStates() {
        setupPanel.classList.toggle("pl-canvas-panel-has-art", assetHasArt("setup-panel"));
        focusManagePanel.classList.toggle("pl-canvas-panel-has-art", assetHasArt("focus-manage-panel"));
        focusManageConfirmPanel.classList.toggle("pl-canvas-panel-has-art", assetHasArt("focus-manage-confirm-panel"));
        confirmPanel.classList.toggle("pl-canvas-panel-has-art", assetHasArt("confirm-panel"));
        rewardPanel.classList.toggle("pl-canvas-panel-has-art", assetHasArt("reward-panel"));
    }

    function applyButtonArtStates() {
        [
            "home-focus",
            "home-sleep",
            "countdown-mode",
            "countup-mode",
            "start",
            "back",
            "manage-button",
            "pause",
            "exit",
            "focus-manage-add",
            "focus-manage-delete",
            "focus-manage-back",
            "focus-manage-ok",
            "focus-manage-confirm-delete",
            "focus-manage-confirm-cancel",
            "keep-going",
            "stop",
            "gotcha"
        ].forEach(function (assetKey) {
            const element = layoutAssets[assetKey]?.element;
            const imageUrl = readCssUrlVar(artImageVars[assetKey]);

            if (!element) {
                return;
            }

            if (imageUrl) {
                const escapedUrl = String(imageUrl)
                    .replace(/\\/g, "\\\\")
                    .replace(/"/g, '\\"');

                element.style.setProperty("background-image", `url("${escapedUrl}")`, "important");
                return;
            }

            element.style.removeProperty("background-image");
        });
    }

    function syncLayoutEditorSelectableStates() {
        homeSleepButton.disabled = !layoutEditorEnabled;
        durationText.style.pointerEvents = layoutEditorEnabled ? "auto" : "none";
        durationText.style.cursor = layoutEditorEnabled ? "move" : "";
    }

    function normalizeSimpleHexColor(rawValue) {
        const raw = String(rawValue || "").trim();

        if (/^#[0-9a-f]{6}$/i.test(raw)) {
            return raw.toLowerCase();
        }

        if (/^#[0-9a-f]{3}$/i.test(raw)) {
            return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`.toLowerCase();
        }

        return "";
    }

    function clampRgbChannel(value) {
        return Math.max(0, Math.min(255, Math.round(value)));
    }

    function channelToHex(value) {
        return clampRgbChannel(value).toString(16).padStart(2, "0");
    }

    function tryNormalizeHexColor(rawValue) {
        const simpleHex = normalizeSimpleHexColor(rawValue);

        if (simpleHex) {
            return simpleHex;
        }

        const rgbMatch = String(rawValue || "")
            .trim()
            .match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);

        if (!rgbMatch) {
            return "";
        }

        return `#${channelToHex(parseInt(rgbMatch[1], 10))}${channelToHex(parseInt(rgbMatch[2], 10))}${channelToHex(parseInt(rgbMatch[3], 10))}`;
    }

    function normalizeHexColor(rawValue, fallbackValue = "#01ff75") {
        return tryNormalizeHexColor(rawValue)
            || tryNormalizeHexColor(fallbackValue)
            || "#01ff75";
    }

    function normalizeLayoutVariables(variables) {
        if (!variables || typeof variables !== "object") {
            return {};
        }

        const result = {};
        const appEdgeColor = normalizeHexColor(
            variables.appEdgeColor ?? variables.AppEdgeColor ?? variables["app-edge-color"],
            "");

        if (appEdgeColor) {
            result.appEdgeColor = appEdgeColor;
        }

        Object.entries(variables).forEach(function ([key, value]) {
            if (!key.startsWith("assetImage:")) {
                return;
            }

            const normalizedValue = String(value || "").trim();

            if (normalizedValue) {
                result[key] = normalizedValue;
            }
        });

        return result;
    }

    function getCssLayoutVariableDefaults() {
        return {
            appEdgeColor: defaultLayoutEdgeColor
        };
    }

    function getSavedLayoutVariable(key) {
        return sharedLayoutVariables[key] ?? getCssLayoutVariableDefaults()[key];
    }

    function getEffectiveLayoutVariable(key) {
        if (currentVariableDraftKey === key && currentVariableDraftValue) {
            return currentVariableDraftValue;
        }

        return getSavedLayoutVariable(key);
    }

    function getSavedAssetImageOverride(assetKey, componentKey = "root") {
        return String(sharedLayoutVariables[getLayoutAssetImageVariableKey(assetKey, componentKey)] || "").trim();
    }

    function getEffectiveAssetImageOverride(assetKey, componentKey = "root") {
        if (currentImageDraftAssetKey === assetKey
            && (currentImageDraftComponentKey || "root") === componentKey
            && currentImageDraftUrl) {
            return currentImageDraftUrl;
        }

        return getSavedAssetImageOverride(assetKey, componentKey);
    }

    function getAssetRootComponentLabel(assetKey) {
        if (!artImageVars[assetKey]) {
            return "Whole Asset";
        }

        if (currentImageDraftAssetKey === assetKey
            && (currentImageDraftComponentKey || "root") === "root"
            && currentImageDraftLabel) {
            return currentImageDraftLabel;
        }

        return getFileNameFromAssetUrl(getEffectiveAssetImageOverride(assetKey, "root")) || "wholeAssetRoot";
    }

    function applyEdgeColorVariable(colorValue) {
        const normalized = normalizeHexColor(colorValue, defaultLayoutEdgeColor);
        const appShell = document.querySelector(".app-shell");
        const htmlElement = document.documentElement;

        htmlElement.style.setProperty(layoutEdgeColorVariableName, normalized, "important");
        htmlElement.style.setProperty("--pl-app-edge-color", normalized, "important");
        htmlElement.style.setProperty("background-color", normalized, "important");

        if (document.body) {
            document.body.style.setProperty("background-color", normalized, "important");
        }

        if (appShell) {
            appShell.style.setProperty("background-color", normalized, "important");
        }

        if (themeColorMeta) {
            themeColorMeta.setAttribute("content", normalized);
        }
    }

    function applyAssetImageVariable(assetKey, rawUrl, componentKey = "root") {
        const cssVariableName = getArtImageCssVariableName(assetKey, componentKey);

        if (!cssVariableName || !homeRoot) {
            return;
        }

        if (!rawUrl) {
            homeRoot.style.removeProperty(cssVariableName);
            return;
        }

        const escapedUrl = String(rawUrl)
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"');

        homeRoot.style.setProperty(cssVariableName, `url("${escapedUrl}")`, "important");
    }

    function applyLayoutVariables() {
        applyEdgeColorVariable(getEffectiveLayoutVariable("appEdgeColor"));

        Object.keys(artImageVars).forEach(function (assetKey) {
            applyAssetImageVariable(assetKey, getEffectiveAssetImageOverride(assetKey, "root"), "root");
        });

        Object.entries(artComponentImageVars).forEach(function ([assetKey, componentVars]) {
            Object.keys(componentVars).forEach(function (componentKey) {
                applyAssetImageVariable(assetKey, getEffectiveAssetImageOverride(assetKey, componentKey), componentKey);
            });
        });

        applyPanelArtStates();
    }

    function discardVariableDraft() {
        const hadDraft = !!currentVariableDraftKey;

        currentVariableDraftKey = null;
        currentVariableDraftValue = null;

        if (hadDraft) {
            applyLayoutVariables();
        }
    }

    function beginVariableDraft(key, value) {
        currentVariableDraftKey = key;
        currentVariableDraftValue = normalizeHexColor(value, getSavedLayoutVariable(key));
        applyLayoutVariables();
    }

    function isVariableAsset(assetKey) {
        return assetKey === layoutColorAssetKey;
    }

    function syncLayoutColorInputs(colorValue) {
        if (!layoutColorPicker || !layoutColorText) {
            return;
        }

        const normalized = normalizeHexColor(colorValue, defaultLayoutEdgeColor);

        layoutColorPicker.value = normalized;
        layoutColorText.value = normalized.toUpperCase();
    }

    function getLayoutSceneDefinition(sceneKey) {
        const builtInDefinition = layoutSceneDefinitions[sceneKey] || layoutSceneDefinitions.home;
        const override = sharedSceneOverrides[sceneKey];
        const removedAssets = (override && Array.isArray(override.removedAssets))
            ? override.removedAssets
            : [];
        const mergedAssets = Array.from(new Set([
            ...(builtInDefinition.assets || []).filter(function (assetKey) {
                return !removedAssets.includes(assetKey);
            }),
            ...((override && Array.isArray(override.assets)) ? override.assets : [])
        ]));

        return {
            label: override?.label || builtInDefinition.label,
            assets: mergedAssets,
            states: builtInDefinition.states
        };
    }

    function getSceneAssetDefinition(assetKey) {
        if (sharedSceneAssetDefinitions[assetKey]) {
            return sharedSceneAssetDefinitions[assetKey];
        }

        if (layoutAssets[assetKey]) {
            return {
                type: "built-in",
                presetKey: "",
                text: "",
                behaviorRole: getDefaultBehaviorRole(assetKey)
            };
        }

        return null;
    }

    function getAvailableSceneAssetKeys() {
        const allKeys = new Set(Object.keys(layoutAssets));

        Object.keys(sharedSceneAssetDefinitions).forEach(function (assetKey) {
            allKeys.add(assetKey);
        });

        allKeys.delete(layoutColorAssetKey);
        return Array.from(allKeys);
    }

    function isCustomTextAsset(assetKey) {
        return sharedSceneAssetDefinitions[assetKey]?.type === "text";
    }

    function isSelfLabeledTextAsset(assetKey) {
        if (!assetSupportsEditableText(assetKey)) {
            return false;
        }

        const assetElement = getAssetElement(assetKey);
        const labelElement = getTextLabelElement(assetKey);
        return !!assetElement && assetElement === labelElement;
    }

    function getTextAssetPresetDefinition(assetKey) {
        const presetKey = sharedSceneAssetDefinitions[assetKey]?.presetKey || "text-label";
        return textAssetPresetDefinitions[presetKey] || textAssetPresetDefinitions["text-label"];
    }

    function normalizeBehaviorRole(role) {
        const normalizedRole = String(role || "").trim();
        return behaviorRoleDefinitions[normalizedRole] ? normalizedRole : "none";
    }

    function assetSupportsBehaviorRole(assetKey) {
        return !!layoutAssets[assetKey]?.interactive;
    }

    function getDefaultBehaviorRole(assetKey) {
        if (!assetSupportsBehaviorRole(assetKey)) {
            return "none";
        }

        return normalizeBehaviorRole(defaultAssetBehaviorRoles[assetKey] || "none");
    }

    function getSavedBehaviorRole(assetKey) {
        const definition = getSceneAssetDefinition(assetKey);

        if (!definition || !assetSupportsBehaviorRole(assetKey)) {
            return "none";
        }

        return definition.behaviorRole
            ? normalizeBehaviorRole(definition.behaviorRole)
            : getDefaultBehaviorRole(assetKey);
    }

    function getEffectiveBehaviorRole(assetKey) {
        if (currentBehaviorDraftAssetKey === assetKey && currentBehaviorDraftValue) {
            return normalizeBehaviorRole(currentBehaviorDraftValue);
        }

        return getSavedBehaviorRole(assetKey);
    }

    function beginBehaviorRoleDraft(assetKey, behaviorRole) {
        if (!assetSupportsBehaviorRole(assetKey)) {
            currentBehaviorDraftAssetKey = null;
            currentBehaviorDraftValue = null;
            return;
        }

        currentBehaviorDraftAssetKey = assetKey;
        currentBehaviorDraftValue = normalizeBehaviorRole(behaviorRole);
    }

    function discardCurrentBehaviorRoleDraft() {
        currentBehaviorDraftAssetKey = null;
        currentBehaviorDraftValue = null;
    }

    function saveBehaviorRoleOverride(assetKey, behaviorRole) {
        if (!assetSupportsBehaviorRole(assetKey)) {
            return;
        }

        const normalizedRole = normalizeBehaviorRole(behaviorRole);
        const defaultRole = getDefaultBehaviorRole(assetKey);
        const existingDefinition = sharedSceneAssetDefinitions[assetKey];

        if (existingDefinition?.type === "text") {
            sharedSceneAssetDefinitions[assetKey] = Object.assign({}, existingDefinition, {
                behaviorRole: normalizedRole === "none" ? "" : normalizedRole
            });
            return;
        }

        if (normalizedRole === defaultRole) {
            delete sharedSceneAssetDefinitions[assetKey];
            return;
        }

        sharedSceneAssetDefinitions[assetKey] = {
            type: "built-in",
            presetKey: "",
            text: "",
            behaviorRole: normalizedRole
        };
    }

    function isPersistentWorldAsset(assetKey) {
        return assetKey === "home-scene";
    }

    function sanitizeSceneAssetKey(rawValue) {
        return String(rawValue || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    function createDynamicTextAssetElement(assetKey) {
        const element = document.createElement("div");
        element.className = "pl-canvas-item pl-canvas-dynamic-text";
        element.id = `pl-dynamic-asset-${assetKey}`;
        element.hidden = true;
        element.style.background = "transparent";
        element.style.border = "none";
        element.style.pointerEvents = "auto";

        const labelElement = document.createElement("span");
        labelElement.className = "pl-dynamic-text-label";
        element.appendChild(labelElement);
        safeUiStage.appendChild(element);

        layoutAssets[assetKey] = {
            element,
            stage: "ui",
            interactive: false,
            dynamic: true
        };
        layoutTextAssets[assetKey] = labelElement;
        dynamicAssetKeys.add(assetKey);

        element.addEventListener("pointerdown", function (event) {
            beginDrag(assetKey, event);
        });

        element.addEventListener("click", function (event) {
            handleLayoutAssetCanvasClick(assetKey, event);
        }, true);
    }

    function removeDynamicTextAssetElement(assetKey) {
        const element = layoutAssets[assetKey]?.element;

        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }

        delete layoutAssets[assetKey];
        delete layoutTextAssets[assetKey];
        delete sharedLayoutState[assetKey];
        delete sharedDefaultLayoutState[assetKey];
        dynamicAssetKeys.delete(assetKey);
    }

    function rebuildDynamicSceneAssets() {
        Array.from(dynamicAssetKeys).forEach(function (assetKey) {
            if (!sharedSceneAssetDefinitions[assetKey]) {
                removeDynamicTextAssetElement(assetKey);
            }
        });

        Object.keys(sharedSceneAssetDefinitions).forEach(function (assetKey) {
            if (!layoutAssets[assetKey]) {
                createDynamicTextAssetElement(assetKey);
            }
        });
    }

    function ensureSceneAssetInScene(sceneKey, assetKey) {
        const existing = sharedSceneOverrides[sceneKey] || { label: "", assets: [], removedAssets: [] };
        const nextAssets = Array.from(new Set([...(existing.assets || []), assetKey]));
        const nextRemovedAssets = (existing.removedAssets || []).filter(function (key) {
            return key !== assetKey;
        });

        sharedSceneOverrides[sceneKey] = {
            label: existing.label || "",
            assets: nextAssets,
            removedAssets: nextRemovedAssets
        };
    }

    function removeSceneAssetFromScene(sceneKey, assetKey) {
        const existing = sharedSceneOverrides[sceneKey] || { label: "", assets: [], removedAssets: [] };
        const nextAssets = (existing.assets || []).filter(function (key) {
            return key !== assetKey;
        });
        const nextRemovedAssets = layoutSceneDefinitions[sceneKey]?.assets?.includes(assetKey)
            ? Array.from(new Set([...(existing.removedAssets || []), assetKey]))
            : (existing.removedAssets || []);

        sharedSceneOverrides[sceneKey] = {
            label: existing.label || "",
            assets: nextAssets,
            removedAssets: nextRemovedAssets
        };
    }

    function getLayoutSceneStateDefinitions(sceneKey) {
        return getLayoutSceneDefinition(sceneKey).states || {
            base: {
                label: "Base"
            }
        };
    }

    function getLayoutSceneStateDefinition(sceneKey, stateKey) {
        const definitions = getLayoutSceneStateDefinitions(sceneKey);
        return definitions[stateKey] || definitions.base || {
            label: "Base"
        };
    }

    function getLayoutSceneStateKeys(sceneKey) {
        return Object.keys(getLayoutSceneStateDefinitions(sceneKey));
    }

    function getSelectedSceneStateKey() {
        return layoutStateSelect.value || "base";
    }

    function getLayoutSceneStateStorageKey(sceneKey, stateKey) {
        return `${sceneKey}::${stateKey}`;
    }

    function getDefaultSceneAssetVisibility(sceneKey, stateKey, assetKey) {
        if (!assetKey || !getLayoutSceneAssetKeys(sceneKey).includes(assetKey)) {
            return false;
        }

        if (!stateKey || stateKey === "base") {
            return true;
        }

        const stateDefinition = getLayoutSceneStateDefinition(sceneKey, stateKey);
        const visibilityValue = stateDefinition.visibility?.[assetKey];
        return visibilityValue == null ? true : !!visibilityValue;
    }

    function getSavedSceneAssetVisibility(assetKey, sceneKey, stateKey) {
        if (!assetKey || !sceneKey || !stateKey || stateKey === "base") {
            return getDefaultSceneAssetVisibility(sceneKey, stateKey, assetKey);
        }

        const stateStorageKey = getLayoutSceneStateStorageKey(sceneKey, stateKey);
        const savedOverride = getSavedLayoutState(assetKey).states?.[stateStorageKey];

        if (savedOverride && typeof savedOverride.visible === "boolean") {
            return savedOverride.visible;
        }

        return getDefaultSceneAssetVisibility(sceneKey, stateKey, assetKey);
    }

    function getEffectiveSceneAssetVisibility(assetKey, sceneKey, stateKey) {
        if (
            currentVisibilityDraftAssetKey === assetKey
            && currentVisibilityDraftSceneKey === sceneKey
            && currentVisibilityDraftStateKey === stateKey
            && typeof currentVisibilityDraftValue === "boolean"
        ) {
            return currentVisibilityDraftValue;
        }

        return getSavedSceneAssetVisibility(assetKey, sceneKey, stateKey);
    }

    function getRenderedFocusSetupStateKey() {
        if (layoutModeEnabled && layoutEditorEnabled && layoutSceneSelect.value === "focus-setup") {
            const selectedStateKey = getSelectedSceneStateKey();
            return selectedStateKey === "base"
                ? (isCountUpModeSelected() ? "countup" : "countdown")
                : selectedStateKey;
        }

        return isCountUpModeSelected() ? "countup" : "countdown";
    }

    function beginVisibilityDraft(assetKey, sceneKey, stateKey, visible) {
        currentVisibilityDraftAssetKey = assetKey;
        currentVisibilityDraftSceneKey = sceneKey;
        currentVisibilityDraftStateKey = stateKey;
        currentVisibilityDraftValue = !!visible;
    }

    function discardCurrentVisibilityDraft() {
        currentVisibilityDraftAssetKey = null;
        currentVisibilityDraftSceneKey = null;
        currentVisibilityDraftStateKey = null;
        currentVisibilityDraftValue = null;
    }

    function getLayoutSceneAssetKeys(sceneKey) {
        return getLayoutSceneDefinition(sceneKey).assets.filter(function (assetKey) {
            return isVariableAsset(assetKey) || !!layoutAssets[assetKey];
        });
    }

    function getPreferredLayoutSceneKeyForAsset(assetKey, preferredSceneKey = null) {
        if (!assetKey) {
            return null;
        }

        const candidateSceneKeys = [
            preferredSceneKey,
            layoutSceneSelect.value,
            currentVisibleSceneKey
        ].filter(function (sceneKey, index, values) {
            return !!sceneKey && values.indexOf(sceneKey) === index;
        });

        return candidateSceneKeys.find(function (sceneKey) {
            return getLayoutSceneAssetKeys(sceneKey).includes(assetKey);
        }) || null;
    }

    function findLayoutSceneKeyForAsset(assetKey, preferredSceneKey = null) {
        if (!assetKey) {
            return preferredSceneKey || layoutSceneSelect.value || currentVisibleSceneKey || "home";
        }

        const preferredSceneKeyForAsset = getPreferredLayoutSceneKeyForAsset(assetKey, preferredSceneKey);
        if (preferredSceneKeyForAsset) {
            return preferredSceneKeyForAsset;
        }

        const matchingSceneEntry = Object.keys(layoutSceneDefinitions).find(function (sceneKey) {
            return getLayoutSceneAssetKeys(sceneKey).includes(assetKey);
        });

        return matchingSceneEntry || preferredSceneKey || layoutSceneSelect.value || currentVisibleSceneKey || "home";
    }

    function updateLayoutSceneHeader(sceneKey) {
        layoutSceneName.textContent = getLayoutSceneDefinition(sceneKey).label;
    }

    function getComponentDefinitionsForAsset(assetKey) {
        const rootLabel = getAssetRootComponentLabel(assetKey);

        if (assetSupportsEditableText(assetKey)) {
            if (isSelfLabeledTextAsset(assetKey)) {
                return {
                    text: {
                        label: "text",
                        geometryMode: "text-box-asset",
                        allowsHitScale: false,
                        status: "Moves this text box and controls the bounds that its copy wraps inside."
                    }
                };
            }

            return {
                root: {
                    label: rootLabel,
                    geometryMode: "asset",
                    allowsHitScale: false,
                    status: rootLabel === "wholeAssetRoot"
                        ? "Moves, resizes, and scales the selected asset as a whole. Browse and save a PNG to label this root by file name."
                        : `Moves, resizes, and scales ${rootLabel} as the button art area.`
                },
                text: {
                    label: "text",
                    geometryMode: "text",
                    allowsHitScale: false,
                    status: "Moves and styles the overlaid text independently inside this asset."
                }
            };
        }

        const definitions = assetComponentDefinitions[assetKey] || {
            root: {
                label: rootLabel,
                geometryMode: "asset",
                allowsHitScale: false,
                status: rootLabel === "wholeAssetRoot"
                    ? "This asset currently has no separate components."
                    : `This asset currently uses ${rootLabel} as its root art.`
            }
        };

        if (definitions.root) {
            definitions.root = Object.assign({}, definitions.root, {
                label: rootLabel,
                status: rootLabel === "wholeAssetRoot"
                    ? (definitions.root.status || "This asset currently has no separate components.")
                    : `Moves, resizes, and scales ${rootLabel} as the root art area.`
            });
        }

        return definitions;
    }
    //#endregion SEGMENT E - Layout Variable And Scene Helpers

    //#region SEGMENT F1 - Scene Selection And Editor Extensions
    function populateLayoutAssetSelectForScene(sceneKey, preferredAssetKey = null) {
        const assetKeys = getLayoutSceneAssetKeys(sceneKey);
        const preservedAssetKey = assetKeys.includes(preferredAssetKey)
            ? preferredAssetKey
            : (assetKeys.includes(layoutAssetSelect.value) ? layoutAssetSelect.value : (assetKeys[0] || ""));

        layoutAssetSelect.innerHTML = "";

        assetKeys.forEach(function (assetKey) {
            const option = document.createElement("option");
            option.value = assetKey;
            option.textContent = isVariableAsset(assetKey) ? layoutColorAssetLabel : assetKey;
            layoutAssetSelect.appendChild(option);
        });

        layoutAssetSelect.disabled = assetKeys.length === 0;
        layoutAssetSelect.value = preservedAssetKey;

        return preservedAssetKey;
    }

    function populateLayoutStateSelectForScene(sceneKey, preferredStateKey = null) {
        const stateDefinitions = getLayoutSceneStateDefinitions(sceneKey);
        const stateKeys = Object.keys(stateDefinitions);
        const preservedStateKey = stateKeys.includes(preferredStateKey)
            ? preferredStateKey
            : (stateKeys.includes(layoutStateSelect.value) ? layoutStateSelect.value : (stateKeys[0] || "base"));

        layoutStateSelect.innerHTML = "";

        stateKeys.forEach(function (stateKey) {
            const option = document.createElement("option");
            option.value = stateKey;
            option.textContent = stateDefinitions[stateKey].label || stateKey;
            layoutStateSelect.appendChild(option);
        });

        layoutStateSelect.disabled = stateKeys.length <= 1;
        layoutStateSelect.value = preservedStateKey;
        layoutStateStatus.textContent = preservedStateKey === "base"
            ? "Base = shared scene layout. Scene-specific states can override visibility."
            : `${stateDefinitions[preservedStateKey].label || preservedStateKey} currently previews this scene state and can override asset visibility.`;

        return preservedStateKey;
    }

    function populateLayoutComponentSelect(assetKey, preferredComponentKey = null) {
        if (!layoutComponentSelect) {
            return "root";
        }

        const definitions = getComponentDefinitionsForAsset(assetKey);
        const componentKeys = Object.keys(definitions);
        const defaultComponentKey = componentKeys.includes("root") ? "root" : (componentKeys[0] || "");
        const preservedKey = componentKeys.includes(preferredComponentKey)
            ? preferredComponentKey
            : (componentKeys.includes(layoutComponentSelect.value) ? layoutComponentSelect.value : defaultComponentKey);

        layoutComponentSelect.innerHTML = "";

        componentKeys.forEach(function (componentKey) {
            const option = document.createElement("option");
            option.value = componentKey;
            option.textContent = definitions[componentKey].label;
            layoutComponentSelect.appendChild(option);
        });

        layoutComponentSelect.disabled = componentKeys.length <= 1 || isVariableAsset(assetKey);
        layoutComponentSelect.value = preservedKey;
        layoutComponentStatus.textContent = definitions[preservedKey]?.status || "";

        return preservedKey;
    }

    function setActiveLayoutScene(sceneKey, preferredAssetKey = null, preferredComponentKey = null, preferredStateKey = null) {
        const resolvedSceneKey = layoutSceneDefinitions[sceneKey]
            ? sceneKey
            : findLayoutSceneKeyForAsset(preferredAssetKey, sceneKey);

        layoutSceneSelect.value = resolvedSceneKey;
        updateLayoutSceneHeader(resolvedSceneKey);
        populateLayoutStateSelectForScene(resolvedSceneKey, preferredStateKey);

        const assetKey = populateLayoutAssetSelectForScene(resolvedSceneKey, preferredAssetKey);
        populateLayoutComponentSelect(assetKey, preferredComponentKey);

        return assetKey;
    }

    function initializeLayoutSceneControls() {
        const initialAssetKey = layoutAssetSelect.value || "home-scene";
        const initialSceneKey = layoutSceneDefinitions[layoutSceneSelect.value]
            ? layoutSceneSelect.value
            : findLayoutSceneKeyForAsset(initialAssetKey, "home");

        setActiveLayoutScene(initialSceneKey, initialAssetKey, "root", "base");
    }

    function selectLayoutAsset(assetKey, componentKey = "root", preferredSceneKey = null) {
        const resolvedSceneKey = findLayoutSceneKeyForAsset(assetKey, preferredSceneKey);
        return setActiveLayoutScene(resolvedSceneKey, assetKey, componentKey, getSelectedSceneStateKey());
    }

    function ensureLayoutColorAssetSelected() {
        if (layoutAssetSelect.value === layoutColorAssetKey) {
            return;
        }

        selectLayoutAsset(layoutColorAssetKey, "root");
        handleLayoutAssetChange();
    }

    function updateLayoutColorDraft(rawValue) {
        const normalized = normalizeHexColor(rawValue, layoutColorPicker?.value || defaultLayoutEdgeColor);

        ensureLayoutColorAssetSelected();
        syncLayoutColorInputs(normalized);
        beginVariableDraft("appEdgeColor", normalized);
        updateLayoutCodePreview(layoutColorAssetKey, "root");
        updateLayoutStatusDisplay(layoutColorAssetKey, "root");
    }

    function ensureLayoutVariableControls() {
        if (layoutColorField) {
            return;
        }

        layoutColorField = document.createElement("label");
        layoutColorField.className = "pl-field";
        layoutColorField.hidden = true;
        layoutColorField.innerHTML = `
      <span class="pl-field-label">Shell background</span>
      <div class="pl-layout-range-with-number">
        <input class="pl-input" id="pl-layout-edge-color-picker" type="color" value="${defaultLayoutEdgeColor}" />
        <input class="pl-input pl-layout-number-input" id="pl-layout-edge-color-text" type="text" value="${defaultLayoutEdgeColor.toUpperCase()}" spellcheck="false" autocomplete="off" />
      </div>
      <span class="pl-field-hint" id="pl-layout-edge-color-hint">Colors the outer shell/background around the authored canvas.</span>
    `;

        if (layoutAssetField && layoutAssetField.parentNode) {
            layoutAssetField.parentNode.insertBefore(layoutColorField, layoutAssetField.nextSibling);
        }
        else {
            layoutPanel.appendChild(layoutColorField);
        }

        layoutColorPicker = layoutColorField.querySelector("#pl-layout-edge-color-picker");
        layoutColorText = layoutColorField.querySelector("#pl-layout-edge-color-text");
        layoutColorHint = layoutColorField.querySelector("#pl-layout-edge-color-hint");

        layoutColorPicker.addEventListener("input", function () {
            updateLayoutColorDraft(layoutColorPicker.value);
        });

        const commitTextColorDraft = function () {
            updateLayoutColorDraft(layoutColorText.value);
        };

        layoutColorText.addEventListener("change", commitTextColorDraft);
        layoutColorText.addEventListener("blur", commitTextColorDraft);
        layoutColorText.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                commitTextColorDraft();
            }
        });
    }

    function ensureLayoutTextControls() {
        if (layoutTextControls) {
            return;
        }

        layoutTextControls = document.createElement("div");
        layoutTextControls.hidden = true;
        layoutTextControls.innerHTML = `
        <label class="pl-field">
            <span class="pl-field-label">Text</span>
            <textarea class="pl-input" id="pl-layout-text-content" rows="4"></textarea>
            <span class="pl-field-hint">Updates the label rendered over this asset. Press Enter for a new line.</span>
        </label>

        <label class="pl-field">
            <span class="pl-field-label">Font</span>
            <select class="pl-input" id="pl-layout-text-font-family"></select>
        </label>

        <label class="pl-field">
            <span class="pl-field-label">Font size (px)</span>
            <input class="pl-input" id="pl-layout-text-font-size" type="number" min="8" max="96" step="1" />
        </label>

        <div class="pl-field">
            <span class="pl-field-label">Text color</span>
            <div class="pl-layout-range-with-number">
                <input class="pl-input" id="pl-layout-text-color-picker" type="color" value="#FFFFFF" />
                <input class="pl-input pl-layout-number-input" id="pl-layout-text-color-text" type="text" value="#FFFFFF" spellcheck="false" autocomplete="off" />
            </div>
        </div>

        <div class="pl-field" style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
            <label style="display:flex;align-items:center;gap:0.55rem;cursor:pointer;">
                <input id="pl-layout-text-bold" type="checkbox" />
                <span class="pl-field-label" style="margin:0;">Bold</span>
            </label>

            <label style="display:flex;align-items:center;gap:0.55rem;cursor:pointer;">
                <input id="pl-layout-text-italic" type="checkbox" />
                <span class="pl-field-label" style="margin:0;">Italic</span>
            </label>
        </div>

        <span class="pl-field-hint" id="pl-layout-text-style-status">These controls affect only the overlaid text component.</span>
    `;

        if (layoutScaleField && layoutScaleField.parentNode) {
            layoutScaleField.parentNode.insertBefore(layoutTextControls, layoutScaleField);
        }
        else {
            layoutPanel.appendChild(layoutTextControls);
        }

        layoutTextContent = layoutTextControls.querySelector("#pl-layout-text-content");
        layoutTextFontFamily = layoutTextControls.querySelector("#pl-layout-text-font-family");
        layoutTextFontSize = layoutTextControls.querySelector("#pl-layout-text-font-size");
        layoutTextColorPicker = layoutTextControls.querySelector("#pl-layout-text-color-picker");
        layoutTextColorText = layoutTextControls.querySelector("#pl-layout-text-color-text");
        layoutTextBold = layoutTextControls.querySelector("#pl-layout-text-bold");
        layoutTextItalic = layoutTextControls.querySelector("#pl-layout-text-italic");
        layoutTextStyleStatus = layoutTextControls.querySelector("#pl-layout-text-style-status");

        layoutTextFontFamily.innerHTML = "";
        layoutTextFontFamilyOptions.forEach(function (optionDefinition) {
            layoutTextFontFamily.appendChild(new Option(optionDefinition.label, optionDefinition.value));
        });

        layoutTextContent.addEventListener("input", pushTextControlValues);
        layoutTextFontFamily.addEventListener("change", pushTextControlValues);
        layoutTextFontSize.addEventListener("input", pushTextControlValues);

        layoutTextColorPicker.addEventListener("input", function () {
            syncLayoutTextColorInputs(layoutTextColorPicker.value);
            pushTextControlValues();
        });

        const commitTextColorChange = function () {
            syncLayoutTextColorInputs(layoutTextColorText.value);
            pushTextControlValues();
        };

        layoutTextColorText.addEventListener("change", commitTextColorChange);
        layoutTextColorText.addEventListener("blur", commitTextColorChange);
        layoutTextColorText.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                commitTextColorChange();
            }
        });

        layoutTextBold.addEventListener("change", pushTextControlValues);
        layoutTextItalic.addEventListener("change", pushTextControlValues);
    }

    function syncLayoutTextColorInputs(colorValue) {
        if (!layoutTextColorPicker || !layoutTextColorText) {
            return;
        }

        const normalized = normalizeHexColor(colorValue, "#ffffff");
        layoutTextColorPicker.value = normalized;
        layoutTextColorText.value = normalized.toUpperCase();
    }

    function ensureLayoutEditorExtensions() {
        if (!layoutArtPickerRemoveButton && layoutArtPickerButton && layoutArtPickerButton.parentNode) {
            layoutArtPickerRemoveButton = document.createElement("button");
            layoutArtPickerRemoveButton.type = "button";
            layoutArtPickerRemoveButton.id = "pl-layout-art-picker-remove-button";
            layoutArtPickerRemoveButton.className = layoutArtPickerButton.className;
            layoutArtPickerRemoveButton.textContent = "Remove PNG";
            layoutArtPickerButton.insertAdjacentElement("afterend", layoutArtPickerRemoveButton);
        }

        if (!componentOutline) {
            componentOutline = document.createElement("div");
            componentOutline.id = "pl-layout-component-outline";
            componentOutline.className = "pl-layout-component-outline";
            componentOutline.hidden = true;
            componentOutline.setAttribute("aria-hidden", "true");
            safeUiStage.appendChild(componentOutline);
        }

        if (!hitOutline) {
            hitOutline = document.createElement("div");
            hitOutline.id = "pl-layout-hit-outline";
            hitOutline.className = "pl-layout-hit-outline";
            hitOutline.hidden = true;
            hitOutline.setAttribute("aria-hidden", "true");
            safeUiStage.appendChild(hitOutline);
        }

        if (!layoutComponentSelect) {
            layoutComponentField = document.createElement("label");
            layoutComponentField.className = "pl-field";
            layoutComponentField.innerHTML = `
                <span class="pl-field-label">Component</span>
                <select class="pl-input" id="pl-layout-component-select"></select>
                <span class="pl-field-hint" id="pl-layout-component-status"></span>
            `;

            if (layoutAssetField && layoutAssetField.parentNode) {
                layoutAssetField.parentNode.insertBefore(layoutComponentField, layoutAssetField.nextSibling);
            }
            else {
                layoutPanel.appendChild(layoutComponentField);
            }

            layoutComponentSelect = layoutComponentField.querySelector("#pl-layout-component-select");
            layoutComponentStatus = layoutComponentField.querySelector("#pl-layout-component-status");
        }
        else {
            layoutComponentField = layoutComponentSelect.closest(".pl-field");
        }

        if (!layoutAspectRatioLock) {
            layoutAspectRatioField = document.createElement("div");
            layoutAspectRatioField.className = "pl-field";
            layoutAspectRatioField.id = "pl-layout-aspect-ratio-field";
            layoutAspectRatioField.hidden = true;
            layoutAspectRatioField.innerHTML = `
                <label style="display:flex;align-items:center;gap:0.55rem;cursor:pointer;">
                    <input id="pl-layout-aspect-ratio-lock" type="checkbox" checked />
                    <span class="pl-field-label" style="margin:0;">Lock PNG aspect ratio</span>
                </label>
                <span class="pl-field-hint" id="pl-layout-aspect-ratio-status">Keeps height matched to the uploaded PNG while you adjust width.</span>
            `;

            if (layoutHeightField && layoutHeightField.parentNode) {
                layoutHeightField.parentNode.insertBefore(layoutAspectRatioField, layoutHeightField.nextSibling);
            }
            else {
                layoutPanel.appendChild(layoutAspectRatioField);
            }

            layoutAspectRatioLock = layoutAspectRatioField.querySelector("#pl-layout-aspect-ratio-lock");
            layoutAspectRatioStatus = layoutAspectRatioField.querySelector("#pl-layout-aspect-ratio-status");
        }
        else {
            layoutAspectRatioField = document.getElementById("pl-layout-aspect-ratio-field") || layoutAspectRatioLock.closest(".pl-field");
            layoutAspectRatioStatus = document.getElementById("pl-layout-aspect-ratio-status");
        }

        if (!layoutHitScaleX || !layoutHitScaleXNumber || !layoutHitScaleY || !layoutHitScaleYNumber) {
            layoutHitScaleField = document.createElement("div");
            layoutHitScaleField.className = "pl-field";
            layoutHitScaleField.id = "pl-layout-hit-scale-field";
            layoutHitScaleField.hidden = true;
            layoutHitScaleField.innerHTML = `
                <span class="pl-field-label">Interactable Area Size</span>

                <label class="pl-field-label" for="pl-layout-hit-scale-x" style="display:block;margin-top:0.45rem;">Width scale</label>
                <div class="pl-layout-range-with-number">
                    <input class="pl-input" id="pl-layout-hit-scale-x" type="range" min="100" max="200" step="1" value="100" />
                    <input class="pl-input pl-layout-number-input" id="pl-layout-hit-scale-x-number" type="number" min="100" max="200" step="1" value="100" />
                </div>

                <label class="pl-field-label" for="pl-layout-hit-scale-y" style="display:block;margin-top:0.75rem;">Height scale</label>
                <div class="pl-layout-range-with-number">
                    <input class="pl-input" id="pl-layout-hit-scale-y" type="range" min="100" max="200" step="1" value="100" />
                    <input class="pl-input pl-layout-number-input" id="pl-layout-hit-scale-y-number" type="number" min="100" max="200" step="1" value="100" />
                </div>

                <label style="display:flex;align-items:center;gap:0.55rem;cursor:pointer;margin-top:0.8rem;">
                    <input id="pl-layout-hit-scale-lock" type="checkbox" checked />
                    <span class="pl-field-label" style="margin:0;">Lock width + height together</span>
                </label>

                <span class="pl-field-hint" id="pl-layout-hit-scale-status">100% = exact nib-hit bounds on that axis. 200% = double-size interactable area on that axis.</span>
            `;

            if (layoutHeightField && layoutHeightField.parentNode) {
                layoutHeightField.parentNode.insertBefore(layoutHitScaleField, layoutHeightField.nextSibling);
            }
            else {
                layoutPanel.appendChild(layoutHitScaleField);
            }

            layoutHitScaleX = layoutHitScaleField.querySelector("#pl-layout-hit-scale-x");
            layoutHitScaleXNumber = layoutHitScaleField.querySelector("#pl-layout-hit-scale-x-number");
            layoutHitScaleY = layoutHitScaleField.querySelector("#pl-layout-hit-scale-y");
            layoutHitScaleYNumber = layoutHitScaleField.querySelector("#pl-layout-hit-scale-y-number");
            layoutHitScaleStatus = layoutHitScaleField.querySelector("#pl-layout-hit-scale-status");
        }
        else {
            layoutHitScaleField = document.getElementById("pl-layout-hit-scale-field") || layoutHitScaleX.closest(".pl-field");
        }
    }

    function setGeometryFieldsHidden(isHidden) {
        [
            layoutScaleField,
            layoutXField,
            layoutYField,
            layoutWidthField,
            layoutHeightField
        ].forEach(function (field) {
            if (field) {
                field.hidden = isHidden;
            }
        });
    }

    function setAspectRatioFieldHidden(isHidden) {
        if (layoutAspectRatioField) {
            layoutAspectRatioField.hidden = isHidden;
        }
    }

    function setLayoutColorFieldHidden(isHidden) {
        if (layoutColorField) {
            layoutColorField.hidden = isHidden;
        }
    }

    function setLayoutTextControlsHidden(isHidden) {
        if (layoutTextControls) {
            layoutTextControls.hidden = isHidden;
        }
    }

    function setComponentFieldHidden(isHidden) {
        if (layoutComponentField) {
            layoutComponentField.hidden = isHidden;
        }
    }

    function setHitScaleFieldHidden(isHidden) {
        if (layoutHitScaleField) {
            layoutHitScaleField.hidden = isHidden;
        }
    }

    function assetSupportsArtPicker(assetKey, componentKey) {
        if ((assetKey === "slider" || assetKey === "focus-manage-list") && isRootComponent(componentKey)) {
            return false;
        }

        return !!getArtImageCssVariableName(assetKey, componentKey) && !isVariableAsset(assetKey);
    }

    function refreshLayoutArtPicker(assetKey, componentKey) {
        const isDisabledSliderRoot = assetKey === "slider" && isRootComponent(componentKey);
        const isDisabledFocusManageListRoot = assetKey === "focus-manage-list" && isRootComponent(componentKey);
        const shouldShow = !!assetKey
            && !isVariableAsset(assetKey)
            && (assetSupportsArtPicker(assetKey, componentKey) || isDisabledSliderRoot || isDisabledFocusManageListRoot);
        layoutArtPickerField.hidden = !shouldShow;

        if (!shouldShow) {
            layoutArtPickerStatus.textContent = "No PNG override selected.";
            if (layoutArtPickerRemoveButton) {
                layoutArtPickerRemoveButton.disabled = true;
            }
            return;
        }

        if (isDisabledSliderRoot) {
            layoutArtPickerStatus.textContent = "Whole Asset ties the slider together. Use empty, fill, or nib to browse PNG art.";
            layoutArtPickerButton.disabled = true;
            if (layoutArtPickerRemoveButton) {
                layoutArtPickerRemoveButton.disabled = true;
            }
            return;
        }

        if (isDisabledFocusManageListRoot) {
            layoutArtPickerStatus.textContent = "Whole Asset moves the Focus Manage list. Use scrollShellLower, scrollShellUpper, scrollbar, or the tile states to browse PNG art.";
            layoutArtPickerButton.disabled = true;
            if (layoutArtPickerRemoveButton) {
                layoutArtPickerRemoveButton.disabled = true;
            }
            return;
        }

        layoutArtPickerButton.disabled = false;

        if (currentImageDraftAssetKey === assetKey
            && (currentImageDraftComponentKey || "root") === componentKey
            && currentImageDraftLabel) {
            layoutArtPickerStatus.textContent = `Pending save: ${currentImageDraftLabel}`;
            return;
        }

        const savedOverride = getSavedAssetImageOverride(assetKey, componentKey);
        const savedLabel = getFileNameFromAssetUrl(savedOverride);
        layoutArtPickerStatus.textContent = savedLabel
            ? `Saved override: ${savedLabel}`
            : "No PNG override selected. Browse and then press Save Selected to remember one.";

        if (layoutArtPickerRemoveButton) {
            layoutArtPickerRemoveButton.disabled = !(savedLabel || (currentImageDraftAssetKey === assetKey
                && (currentImageDraftComponentKey || "root") === componentKey
                && currentImageDraftLabel));
        }
    }

    function refreshLayoutStateVisibilityControls(assetKey) {
        const sceneKey = layoutSceneSelect.value || "home";
        const stateKey = getSelectedSceneStateKey();
        const sceneSupportsStateVisibility = getLayoutSceneStateKeys(sceneKey).length > 1;
        const shouldShow = !!assetKey
            && !isVariableAsset(assetKey)
            && isRootComponent(getSelectedComponentKey())
            && sceneSupportsStateVisibility
            && !isSceneBuilderModeSelected();

        layoutStateVisibilityField.hidden = !shouldShow;
        layoutStateVisible.disabled = !shouldShow || stateKey === "base";

        if (!shouldShow) {
            layoutStateVisible.checked = true;
            layoutStateVisibleStatus.textContent = sceneSupportsStateVisibility
                ? "Switch back to Layout mode and select a root asset to edit scene-state visibility."
                : "This scene does not use state-specific visibility.";
            return;
        }

        if (stateKey === "base") {
            layoutStateVisible.checked = getDefaultSceneAssetVisibility(sceneKey, stateKey, assetKey);
            layoutStateVisibleStatus.textContent = "Base visibility is shared across all scene states. Switch to Count Down or Count Up to save a visibility override.";
            return;
        }

        const defaultVisible = getDefaultSceneAssetVisibility(sceneKey, stateKey, assetKey);
        const effectiveVisible = getEffectiveSceneAssetVisibility(assetKey, sceneKey, stateKey);
        const savedVisible = getSavedSceneAssetVisibility(assetKey, sceneKey, stateKey);
        const hasDraft = currentVisibilityDraftAssetKey === assetKey
            && currentVisibilityDraftSceneKey === sceneKey
            && currentVisibilityDraftStateKey === stateKey;

        layoutStateVisible.checked = effectiveVisible;

        if (hasDraft) {
            layoutStateVisibleStatus.textContent = `Pending save: ${effectiveVisible ? "visible" : "hidden"} in ${getLayoutSceneStateDefinition(sceneKey, stateKey).label || stateKey}.`;
            return;
        }

        if (savedVisible !== defaultVisible) {
            layoutStateVisibleStatus.textContent = `Saved override: ${savedVisible ? "visible" : "hidden"} in ${getLayoutSceneStateDefinition(sceneKey, stateKey).label || stateKey}.`;
            return;
        }

        layoutStateVisibleStatus.textContent = `Inherits default scene visibility: ${defaultVisible ? "visible" : "hidden"} in ${getLayoutSceneStateDefinition(sceneKey, stateKey).label || stateKey}.`;
    }

    function refreshLayoutBehaviorRoleControls(assetKey) {
        const shouldShow = isSceneBuilderModeSelected();
        layoutBehaviorRoleField.hidden = !shouldShow;

        if (!shouldShow) {
            return;
        }

        if (!assetKey || !assetSupportsBehaviorRole(assetKey)) {
            layoutBehaviorRoleSelect.value = "none";
            layoutBehaviorRoleSelect.disabled = true;
            layoutBehaviorRoleStatus.textContent = "Select an interactive asset in Scene Builder to edit its behavior role.";
            return;
        }

        const defaultRole = getDefaultBehaviorRole(assetKey);
        const savedRole = getSavedBehaviorRole(assetKey);
        const effectiveRole = getEffectiveBehaviorRole(assetKey);
        const hasDraft = currentBehaviorDraftAssetKey === assetKey && !!currentBehaviorDraftValue;

        layoutBehaviorRoleSelect.disabled = false;
        layoutBehaviorRoleSelect.value = effectiveRole;

        if (hasDraft) {
            layoutBehaviorRoleStatus.textContent = `Pending save: ${behaviorRoleDefinitions[effectiveRole]?.label || effectiveRole}.`;
            return;
        }

        if (savedRole !== defaultRole) {
            layoutBehaviorRoleStatus.textContent = `Saved override: ${behaviorRoleDefinitions[savedRole]?.label || savedRole}.`;
            return;
        }

        layoutBehaviorRoleStatus.textContent = `Default behavior: ${behaviorRoleDefinitions[defaultRole]?.label || defaultRole}.`;
    }

    function isSceneBuilderModeSelected() {
        return currentLayoutEditorMode === "scene-builder";
    }

    function populateSceneAssetSourceSelect() {
        const sceneKey = layoutSceneSelect.value || "home";
        const currentAssetKeys = new Set(getLayoutSceneAssetKeys(sceneKey));
        const availableAssetKeys = getAvailableSceneAssetKeys().filter(function (assetKey) {
            return !currentAssetKeys.has(assetKey);
        });

        layoutSceneAssetSourceSelect.innerHTML = "";

        if (availableAssetKeys.length <= 0) {
            const emptyOption = document.createElement("option");
            emptyOption.value = "";
            emptyOption.textContent = "No additional assets available";
            layoutSceneAssetSourceSelect.appendChild(emptyOption);
            layoutSceneAssetSourceSelect.disabled = true;
            return;
        }

        availableAssetKeys.forEach(function (assetKey) {
            const option = document.createElement("option");
            const sceneAssetDefinition = getSceneAssetDefinition(assetKey);
            option.value = assetKey;
            option.textContent = isCustomTextAsset(assetKey)
                ? `${assetKey} (text)`
                : assetKey;
            option.title = sceneAssetDefinition?.text || "";
            layoutSceneAssetSourceSelect.appendChild(option);
        });

        layoutSceneAssetSourceSelect.disabled = false;
    }

    function refreshSceneBuilderPanel() {
        const sceneKey = layoutSceneSelect.value || "home";
        const selectedAssetKey = getSelectedAssetKey();
        const canRemove = !!selectedAssetKey && getLayoutSceneAssetKeys(sceneKey).includes(selectedAssetKey);

        layoutSceneBuilderPanel.hidden = !isSceneBuilderModeSelected();

        if (!isSceneBuilderModeSelected()) {
            return;
        }

        populateSceneAssetSourceSelect();
        layoutSceneAssetAddButton.disabled = layoutSceneAssetSourceSelect.disabled;
        layoutSceneAssetRemoveButton.disabled = !canRemove;
        layoutSceneBuilderMembershipStatus.textContent = canRemove
            ? `${selectedAssetKey} currently belongs to ${getLayoutSceneDefinition(sceneKey).label}.`
            : `Add an existing asset to ${getLayoutSceneDefinition(sceneKey).label}, or select an asset there before removing it.`;
        layoutSceneBuilderTextStatus.textContent = "Creates a reusable text asset and adds it to the selected scene.";
        layoutEditorModeHint.textContent = "Scene Builder adds assets to scenes and creates text labels. Switch back to Layout to position them.";
    }

    async function addSelectedSceneAssetToCurrentScene() {
        const sceneKey = layoutSceneSelect.value || "home";
        const assetKey = String(layoutSceneAssetSourceSelect.value || "").trim();

        if (!assetKey) {
            return;
        }

        ensureSceneAssetInScene(sceneKey, assetKey);
        await saveSharedLayoutState();
        setActiveLayoutScene(sceneKey, assetKey, "root", getSelectedSceneStateKey());
        refreshLayoutUi();
    }

    async function removeSelectedSceneAssetFromCurrentScene() {
        const sceneKey = layoutSceneSelect.value || "home";
        const assetKey = getSelectedAssetKey();

        if (!assetKey || !getLayoutSceneAssetKeys(sceneKey).includes(assetKey)) {
            return;
        }

        removeSceneAssetFromScene(sceneKey, assetKey);
        await saveSharedLayoutState();
        setActiveLayoutScene(sceneKey, null, "root", getSelectedSceneStateKey());
        refreshLayoutUi();
    }

    async function createSceneTextAsset() {
        const sceneKey = layoutSceneSelect.value || "home";
        const assetKey = sanitizeSceneAssetKey(layoutNewTextAssetKey.value);
        const assetText = String(layoutNewTextAssetContent.value || "").trim();
        const presetKey = textAssetPresetDefinitions[layoutNewTextAssetPreset.value]
            ? layoutNewTextAssetPreset.value
            : "text-label";

        if (!assetKey) {
            layoutSceneBuilderTextStatus.textContent = "Text asset key is required.";
            return;
        }

        if (layoutAssets[assetKey] || sharedSceneAssetDefinitions[assetKey]) {
            layoutSceneBuilderTextStatus.textContent = `${assetKey} already exists. Choose a different key.`;
            return;
        }

        sharedSceneAssetDefinitions[assetKey] = {
            type: "text",
            presetKey,
            text: assetText || "New Text"
        };
        ensureSceneAssetInScene(sceneKey, assetKey);
        rebuildDynamicSceneAssets();
        layoutNewTextAssetKey.value = "";
        layoutNewTextAssetContent.value = "";
        await saveSharedLayoutState();
        setActiveLayoutScene(sceneKey, assetKey, "text", getSelectedSceneStateKey());
        refreshLayoutUi();
    }

    function hideSliderSpecificOutlines() {
        if (componentOutline) {
            componentOutline.hidden = true;
        }

        if (hitOutline) {
            hitOutline.hidden = true;
        }
    }

    //#endregion SEGMENT F1 - Scene Selection And Editor Extensions

    //#region SEGMENT F2 - Slider Metrics
    function getSliderVisualMetrics() {
        const state = getEffectiveLayoutState("slider");
        const resolvedHeight = getResolvedHeight("slider", state);
        const assetScaleRatio = Math.max(0.01, (state.scale || 100) / 100);
        const authorWidth = Math.max(20, state.width * assetScaleRatio);
        const authorHeight = resolvedHeight * assetScaleRatio;
        const projected = projectUiAssetRect(state, authorWidth, authorHeight);
        const localScaleX = projected.width / Math.max(1, state.width);
        const localScaleY = projected.height / Math.max(1, resolvedHeight);
        const sliderMetric = artMetrics.slider;
        const nibMetric = artMetrics["slider-nib-art"];
        const min = parseInt(durationSlider.min || "5", 10);
        const max = parseInt(durationSlider.max || "120", 10);
        const value = parseInt(durationSlider.value || "5", 10);
        const progressRatio = max <= min ? 0 : (value - min) / (max - min);

        const trackLeft = sliderMetric && sliderMetric.hasVisibleBounds
            ? projected.width * sliderMetric.visibleLeftRatio
            : 0;
        const trackWidth = sliderMetric && sliderMetric.hasVisibleBounds
            ? projected.width * sliderMetric.visibleWidthRatio
            : projected.width;

        const visibleNibWidthPixels = nibMetric && nibMetric.hasVisibleBounds
            ? nibMetric.canvasWidth * nibMetric.visibleWidthRatio
            : Math.max(1, nibMetric?.canvasWidth || 1);

        const visibleNibHeightPixels = nibMetric && nibMetric.hasVisibleBounds
            ? nibMetric.canvasHeight * nibMetric.visibleHeightRatio
            : Math.max(1, nibMetric?.canvasHeight || 1);

        const nibVisibleAspectRatio = visibleNibWidthPixels / Math.max(1, visibleNibHeightPixels);
        const nibVisibleHeight = nibMetric && nibMetric.hasVisibleBounds
            ? projected.height * nibMetric.visibleHeightRatio
            : projected.height;
        const nibVisibleWidth = Math.max(6, nibVisibleHeight * nibVisibleAspectRatio);
        const rightEdgeInset = Math.max(2, Math.round(nibVisibleWidth * 0.18));
        const targetCenter = trackLeft + (progressRatio * Math.max(0, trackWidth - rightEdgeInset));

        const nibTop = nibMetric && nibMetric.hasVisibleBounds
            ? projected.height * nibMetric.visibleTopRatio
            : 0;

        const nibLeft = targetCenter - (nibVisibleWidth / 2);

        return {
            projected,
            resolvedHeight,
            localScaleX,
            localScaleY,
            sliderMetric,
            nibMetric,
            progressRatio,
            trackLeft,
            trackWidth,
            targetCenter,
            nibRect: {
                left: nibLeft,
                top: nibTop,
                width: nibVisibleWidth,
                height: nibVisibleHeight
            }
        };
    }
    //#endregion SEGMENT F2 - Slider Metrics

    //#region SEGMENT G1 - Slider Geometry Helpers
    function applyLocalRectTransform(baseRect, componentState, options = {}) {
        const localScaleX = options.localScaleX ?? 1;
        const localScaleY = options.localScaleY ?? 1;
        const scaleRatio = Math.max(0.01, (componentState.scale || 100) / 100);
        const baseWidth = componentState.width != null
            ? componentState.width * localScaleX
            : baseRect.width;
        const baseHeight = componentState.height != null
            ? componentState.height * localScaleY
            : baseRect.height;

        let width = Math.max(1, baseWidth * scaleRatio);
        let height = Math.max(1, baseHeight * scaleRatio);
        let left = baseRect.left + ((componentState.x || 0) * localScaleX);
        let top = baseRect.top + ((componentState.y || 0) * localScaleY);

        if (options.hitScale) {
            const hitScaleRatioX = Math.max(1, (componentState.hitScaleX || 100) / 100);
            const hitScaleRatioY = Math.max(1, (componentState.hitScaleY || 100) / 100);
            const expandedWidth = Math.max(1, width * hitScaleRatioX);
            const expandedHeight = Math.max(1, height * hitScaleRatioY);

            left -= (expandedWidth - width) / 2;
            top -= (expandedHeight - height) / 2;
            width = expandedWidth;
            height = expandedHeight;
        }

        return {
            left,
            top,
            width,
            height
        };
    }

    function applySliderNibBackground(nibRect, nibMetric) {
        if (!nibMetric) {
            sliderNibVisual.style.backgroundSize = "100% 100%, 100% 100%";
            sliderNibVisual.style.backgroundPosition = "center center, center center";
            return;
        }

        if (!nibMetric.hasVisibleBounds) {
            sliderNibVisual.style.backgroundSize = "100% 100%, 100% 100%";
            sliderNibVisual.style.backgroundPosition = "center center, center center";
            return;
        }

        const fullBackgroundWidth = Math.max(1, nibRect.width / Math.max(0.0001, nibMetric.visibleWidthRatio));
        const fullBackgroundHeight = Math.max(1, nibRect.height / Math.max(0.0001, nibMetric.visibleHeightRatio));
        const backgroundX = -nibMetric.visibleLeftRatio * fullBackgroundWidth;
        const backgroundY = -nibMetric.visibleTopRatio * fullBackgroundHeight;
        const backgroundSize = `${fullBackgroundWidth}px ${fullBackgroundHeight}px`;
        const backgroundPosition = `${backgroundX}px ${backgroundY}px`;

        sliderNibVisual.style.backgroundSize = `${backgroundSize}, ${backgroundSize}`;
        sliderNibVisual.style.backgroundPosition = `${backgroundPosition}, ${backgroundPosition}`;
    }

    function getSliderComponentLocalPreviewWidth(componentKey) {
        const previewRect = runtimeComponentRects.slider?.[componentKey];

        if (!previewRect) {
            return 0;
        }

        const metrics = getSliderVisualMetrics();
        return previewRect.width / Math.max(0.0001, metrics.localScaleX);
    }

    function cacheSliderRuntimeRects(metrics, emptyRect, fillShellRect, fullFillRect, nibRect, nibHitRect) {
        const toStageRect = function (localRect) {
            return {
                left: metrics.projected.left + localRect.left,
                top: metrics.projected.top + localRect.top,
                width: localRect.width,
                height: localRect.height
            };
        };

        runtimeComponentRects.slider = {
            root: {
                left: metrics.projected.left,
                top: metrics.projected.top,
                width: metrics.projected.width,
                height: metrics.projected.height
            },
            empty: toStageRect(emptyRect),
            fill: toStageRect(fillShellRect),
            "fill-full": toStageRect(fullFillRect),
            nib: toStageRect(nibRect),
            "nib-hit": toStageRect(nibHitRect)
        };
    }

    function applyOutlineRect(outlineElement, rect) {
        if (!outlineElement || !rect) {
            return;
        }

        outlineElement.hidden = false;
        outlineElement.style.left = `${rect.left}px`;
        outlineElement.style.top = `${rect.top}px`;
        outlineElement.style.width = `${rect.width}px`;
        outlineElement.style.height = `${rect.height}px`;
    }

    //#endregion SEGMENT G1 - Slider Geometry Helpers

    //#region SEGMENT G2 - Slider Rendering And Asset Layout
    function applyAssetTextStyle(assetKey) {
        const assetElement = getAssetElement(assetKey);
        const labelElement = getTextLabelElement(assetKey);
        const textState = getEffectiveTextState(assetKey);

        if (!assetElement || !labelElement || !textState) {
            return;
        }

        if (isCustomTextAsset(assetKey)) {
            assetElement.style.background = "transparent";
            assetElement.style.border = "none";
            assetElement.style.overflow = "visible";
        }

        const isSelfLabeledAsset = assetElement === labelElement;

        labelElement.textContent = textState.content;
        labelElement.style.display = "block";
        labelElement.style.pointerEvents = isSelfLabeledAsset ? "auto" : "none";
        labelElement.style.textAlign = "center";
        labelElement.style.fontFamily = textState.fontFamily || layoutTextFontFamilyOptions[0].value;
        labelElement.style.fontSize = `${Math.max(8, Math.round(textState.fontSize || 16))}px`;
        labelElement.style.fontWeight = textState.bold ? "900" : "400";
        labelElement.style.fontStyle = textState.italic ? "italic" : "normal";
        labelElement.style.color = normalizeHexColor(textState.color, "#ffffff");

        if (isSelfLabeledAsset) {
            assetElement.style.display = "flex";
            assetElement.style.alignItems = "center";
            assetElement.style.justifyContent = "center";
            assetElement.style.padding = "0.25rem 0.4rem";
            assetElement.style.boxSizing = "border-box";
            assetElement.style.overflow = "hidden";
            labelElement.style.whiteSpace = "pre-wrap";
            labelElement.style.overflowWrap = "anywhere";
            labelElement.style.wordBreak = "break-word";
            labelElement.style.lineHeight = "1.15";
            return;
        }

        labelElement.style.position = "absolute";
        labelElement.style.left = "50%";
        labelElement.style.top = "50%";
        labelElement.style.transform = `translate(-50%, -50%) translate(${Math.round(textState.x)}px, ${Math.round(textState.y)}px)`;
        labelElement.style.width = "max-content";
        labelElement.style.maxWidth = "90%";
        labelElement.style.whiteSpace = "nowrap";
        labelElement.style.lineHeight = "1";
    }

    function updateSliderVisuals() {
        const metrics = getSliderVisualMetrics();

        const emptyState = getEffectiveComponentState("slider", "empty");
        const fillState = getEffectiveComponentState("slider", "fill");
        const nibState = getEffectiveComponentState("slider", "nib");
        const nibHitState = getEffectiveComponentState("slider", "nib-hit");

        const transformOptions = {
            localScaleX: metrics.localScaleX,
            localScaleY: metrics.localScaleY
        };

        const emptyBaseRect = {
            left: 0,
            top: 0,
            width: metrics.projected.width,
            height: metrics.projected.height
        };

        const nibBaseRect = {
            left: metrics.nibRect.left,
            top: metrics.nibRect.top,
            width: metrics.nibRect.width,
            height: metrics.nibRect.height
        };

        const emptyRect = applyLocalRectTransform(emptyBaseRect, emptyState, transformOptions);
        const fillFullRect = applyLocalRectTransform(emptyBaseRect, fillState, transformOptions);
        const nibRect = applyLocalRectTransform(nibBaseRect, nibState, transformOptions);
        const fillShellRect = {
            left: fillFullRect.left,
            top: fillFullRect.top,
            width: Math.max(0, Math.min(fillFullRect.width, (nibRect.left + (nibRect.width / 2)) - fillFullRect.left)),
            height: fillFullRect.height
        };
        const nibHitBaseRect = {
            left: nibRect.left,
            top: nibRect.top,
            width: nibRect.width,
            height: nibRect.height
        };
        const nibHitRect = applyLocalRectTransform(nibHitBaseRect, {
            x: nibHitState.x,
            y: nibHitState.y,
            width: nibHitState.width,
            height: nibHitState.height,
            scale: nibHitState.scale,
            hitScaleX: nibHitState.hitScaleX,
            hitScaleY: nibHitState.hitScaleY
        }, {
            localScaleX: metrics.localScaleX,
            localScaleY: metrics.localScaleY,
            hitScale: true
        });

        sliderGroup.style.left = `${metrics.projected.left}px`;
        sliderGroup.style.top = `${metrics.projected.top}px`;
        sliderGroup.style.width = `${metrics.projected.width}px`;
        sliderGroup.style.height = `${metrics.projected.height}px`;
        sliderGroup.style.transform = "scale(1)";
        sliderGroup.style.overflow = "visible";

        sliderTrackShell.style.left = `${emptyRect.left}px`;
        sliderTrackShell.style.top = `${emptyRect.top}px`;
        sliderTrackShell.style.width = `${emptyRect.width}px`;
        sliderTrackShell.style.height = `${emptyRect.height}px`;

        sliderTrackEmptyArt.style.left = "0px";
        sliderTrackEmptyArt.style.top = "0px";
        sliderTrackEmptyArt.style.width = `${emptyRect.width}px`;
        sliderTrackEmptyArt.style.height = `${emptyRect.height}px`;

        sliderFillShell.style.left = `${fillShellRect.left}px`;
        sliderFillShell.style.top = `${fillShellRect.top}px`;
        sliderFillShell.style.width = `${fillShellRect.width}px`;
        sliderFillShell.style.height = `${fillShellRect.height}px`;

        sliderFillArt.style.left = "0px";
        sliderFillArt.style.top = "0px";
        sliderFillArt.style.width = `${fillFullRect.width}px`;
        sliderFillArt.style.height = `${fillFullRect.height}px`;

        sliderNibVisual.style.left = `${nibRect.left}px`;
        sliderNibVisual.style.top = `${nibRect.top}px`;
        sliderNibVisual.style.width = `${nibRect.width}px`;
        sliderNibVisual.style.height = `${nibRect.height}px`;
        sliderNibVisual.style.transform = "none";
        applySliderNibBackground(nibRect, metrics.nibMetric);

        durationSlider.style.left = `${nibHitRect.left}px`;
        durationSlider.style.top = `${nibHitRect.top}px`;
        durationSlider.style.width = `${nibHitRect.width}px`;
        durationSlider.style.height = `${nibHitRect.height}px`;
        durationSlider.style.pointerEvents = "none";
        durationSlider.style.opacity = "0";
        durationSlider.style.background = "transparent";

        cacheSliderRuntimeRects(metrics, emptyRect, fillShellRect, fillFullRect, nibRect, nibHitRect);
        refreshComponentOutlines();
    }

    function updateDurationReadout() {
        const countUpPreviewSelected = layoutModeEnabled
            && layoutEditorEnabled
            && layoutSceneSelect.value === "focus-setup"
            && getRenderedFocusSetupStateKey() === "countup";
        const formatted = (countUpPreviewSelected || isCountUpModeSelected())
            ? formatClock(0)
            : formatDurationSelection(parseInt(durationSlider.value || "5", 10));
        durationText.textContent = formatted;
        updateSliderVisuals();
    }

    function applyAssetLayout(assetKey) {
        const element = getAssetElement(assetKey);

        if (!element) {
            return;
        }

        if (assetKey === "slider") {
            updateSliderVisuals();
            return;
        }

        const state = getEffectiveLayoutState(assetKey);
        const resolvedHeight = getResolvedHeight(assetKey, state);

        if (getAssetStageType(assetKey) === "world") {
            element.style.left = `${state.x}px`;
            element.style.top = `${state.y}px`;
            element.style.width = `${state.width}px`;
            element.style.height = `${resolvedHeight}px`;
            element.style.transform = `scale(${state.scale / 100})`;

            if (assetKey === "home-scene") {
                element.style.pointerEvents = layoutEditorEnabled ? "auto" : "none";
            }

            return;
        }

        if (isSelfLabeledTextAsset(assetKey)) {
            const stageScale = Math.max(0.0001, getSafeUiStageScale());
            element.style.left = `${state.x / stageScale}px`;
            element.style.top = `${state.y / stageScale}px`;
            element.style.width = `${state.width / stageScale}px`;
            element.style.height = `${resolvedHeight / stageScale}px`;
            element.style.transform = "scale(1)";
            return;
        }

        const authorWidth = state.width * (state.scale / 100);
        const authorHeight = resolvedHeight * (state.scale / 100);
        const projected = projectUiAssetRect(state, authorWidth, authorHeight);

        element.style.left = `${projected.left}px`;
        element.style.top = `${projected.top}px`;
        element.style.width = `${projected.width}px`;
        element.style.height = `${projected.height}px`;
        element.style.transform = "scale(1)";

        if (assetKey === "focus-manage-list") {
            requestAnimationFrame(updateFocusManageScrollbarVisual);
        }
    }

    function applyAllAssetLayouts() {
        Object.keys(layoutAssets).forEach(applyAssetLayout);
        Object.keys(layoutTextAssets).forEach(applyAssetTextStyle);
        applyLayoutVariables();
        refreshLayoutSelection();
        applyButtonArtStates();
        refreshComponentOutlines();
    }

    function refreshLayoutSelection() {
        const selectedAssetKey = getSelectedAssetKey();

        Object.entries(layoutAssets).forEach(function ([assetKey, config]) {
            const state = getEffectiveLayoutState(assetKey);
            const status = getVisibilityStatus(assetKey, state);
            const isSelected = layoutEditorEnabled && assetKey === selectedAssetKey;

            config.element.classList.toggle("pl-layout-selected", isSelected);
            config.element.classList.toggle(
                "pl-layout-selected-unsafe",
                isSelected && (!status.xStatus.inside || !status.yStatus.inside));
        });
    }

    function refreshComponentOutlines() {
        hideSliderSpecificOutlines();

        if (!layoutEditorEnabled) {
            return;
        }

        const assetKey = getSelectedAssetKey();
        const componentKey = getSelectedComponentKey();

        if (assetKey !== "slider" || isRootComponent(componentKey)) {
            return;
        }

        const rects = runtimeComponentRects.slider;
        if (!rects) {
            return;
        }

        if (componentKey === "nib-hit") {
            applyOutlineRect(componentOutline, rects.nib);
            applyOutlineRect(hitOutline, rects["nib-hit"]);
            return;
        }

        applyOutlineRect(componentOutline, rects[componentKey]);
    }
    //#endregion SEGMENT G2 - Slider Rendering And Asset Layout

    //#region SEGMENT H1 - Layout Bounds And Status Controls
    function getLayoutHitScaleLock() {
        return document.getElementById("pl-layout-hit-scale-lock");
    }

    function getLayoutAspectRatioLock() {
        return document.getElementById("pl-layout-aspect-ratio-lock");
    }

    function assetCanLockAspectRatio(assetKey) {
        return !!(artMetrics[assetKey] && artMetrics[assetKey].canvasRatio > 0);
    }

    function updateLayoutSliderBounds(assetKey, componentKey) {
        if (isVariableAsset(assetKey)) {
            return;
        }

        const isRootLikeTextBox = isTextComponent(assetKey, componentKey) && isSelfLabeledTextAsset(assetKey);
        const isRootLikeSelection = isRootLikeTextBox || isRootComponent(componentKey);

        if (!isRootLikeSelection) {
            layoutScale.min = "20";
            layoutScale.max = "250";
            layoutScaleNumber.min = "20";
            layoutScaleNumber.max = "250";

            layoutX.min = "-300";
            layoutX.max = "300";
            layoutXNumber.min = "-300";
            layoutXNumber.max = "300";

            layoutY.min = "-300";
            layoutY.max = "300";
            layoutYNumber.min = "-300";
            layoutYNumber.max = "300";
            return;
        }

        const state = getEffectiveLayoutState(assetKey);
        const stageBounds = getStageBounds(assetKey);
        const scaledSize = getScaledAssetSize(assetKey, state);

        layoutScale.min = "20";
        layoutScale.max = "250";
        layoutScaleNumber.min = "20";
        layoutScaleNumber.max = "250";

        layoutX.min = String(Math.round(-scaledSize.width));
        layoutX.max = String(Math.round(stageBounds.width + scaledSize.width));
        layoutXNumber.min = layoutX.min;
        layoutXNumber.max = layoutX.max;

        layoutY.min = String(Math.round(-scaledSize.height));
        layoutY.max = String(Math.round(stageBounds.height + scaledSize.height));
        layoutYNumber.min = layoutY.min;
        layoutYNumber.max = layoutY.max;
    }

    function updateLayoutCodePreview(assetKey, componentKey) {
        const sceneKey = layoutSceneSelect.value || "home";
        const sceneStateKey = getSelectedSceneStateKey();

        if (isVariableAsset(assetKey)) {
            layoutCode.value =
                `:root {\n  --pl-art-app-edge-color: ${getEffectiveLayoutVariable("appEdgeColor")};\n}`;
            return;
        }

        if (isTextComponent(assetKey, componentKey)) {
            const textState = getEffectiveTextState(assetKey);
            const payload = {
                items: {
                    [assetKey]: {
                        text: serializeTextState(textState)
                    }
                }
            };

            layoutCode.value = JSON.stringify(payload, null, 2);
            return;
        }

        if (!isRootComponent(componentKey)) {
            const componentState = getEffectiveComponentState(assetKey, componentKey);
            const payload = {
                items: {
                    [assetKey]: {
                        components: {
                            [componentKey]: {}
                        }
                    }
                }
            };

            if (componentState.x !== 0) {
                payload.items[assetKey].components[componentKey].x = Math.round(componentState.x);
            }

            if (componentState.y !== 0) {
                payload.items[assetKey].components[componentKey].y = Math.round(componentState.y);
            }

            if (componentState.scale !== 100 && componentKey !== "nib-hit") {
                payload.items[assetKey].components[componentKey].scale = Math.round(componentState.scale);
            }

            if (componentState.width != null) {
                payload.items[assetKey].components[componentKey].width = Math.round(componentState.width);
            }

            if (componentState.height != null) {
                payload.items[assetKey].components[componentKey].height = Math.round(componentState.height);
            }

            if (componentKey === "nib-hit") {
                if (componentState.hitScaleX !== 100) {
                    payload.items[assetKey].components[componentKey].hitScaleX = Math.round(componentState.hitScaleX);
                }

                if (componentState.hitScaleY !== 100) {
                    payload.items[assetKey].components[componentKey].hitScaleY = Math.round(componentState.hitScaleY);
                }
            }

            layoutCode.value = JSON.stringify(payload, null, 2);
            return;
        }

        if (sceneStateKey !== "base") {
            layoutCode.value = JSON.stringify({
                items: {
                    [assetKey]: {
                        states: {
                            [getLayoutSceneStateStorageKey(sceneKey, sceneStateKey)]: {
                                visible: getEffectiveSceneAssetVisibility(assetKey, sceneKey, sceneStateKey)
                            }
                        }
                    }
                }
            }, null, 2);
            return;
        }

        const state = getEffectiveLayoutState(assetKey);
        const resolvedHeight = getResolvedHeight(assetKey, state);
        const ratioLocked = !!state.lockAspectRatio && assetCanLockAspectRatio(assetKey);

        if (ratioLocked) {
            layoutCode.value =
                `.pl-home-screen {\n  --pl-layout-${assetKey}-x: ${Math.round(state.x)}px;\n  --pl-layout-${assetKey}-y: ${Math.round(state.y)}px;\n  --pl-layout-${assetKey}-width: ${Math.round(state.width)}px;\n  --pl-layout-${assetKey}-scale: ${Math.round(state.scale)};\n}\n\n/* Height auto from asset ratio: ${resolvedHeight}px */`;
            return;
        }

        layoutCode.value =
            `.pl-home-screen {\n  --pl-layout-${assetKey}-x: ${Math.round(state.x)}px;\n  --pl-layout-${assetKey}-y: ${Math.round(state.y)}px;\n  --pl-layout-${assetKey}-width: ${Math.round(state.width)}px;\n  --pl-layout-${assetKey}-height: ${Math.round(state.height)}px;\n  --pl-layout-${assetKey}-scale: ${Math.round(state.scale)};\n}`;
    }
    function updateLayoutStatusDisplay(assetKey, componentKey) {
        if (isVariableAsset(assetKey)) {
            layoutStageStatus.textContent = "Shell background · colors the edge fill outside the authored canvas.";
            layoutSafeZoneStatus.textContent = "Used for desktop chrome and the iPhone edge / bottom-bar tint fallback.";
            layoutScaleValue.textContent = getEffectiveLayoutVariable("appEdgeColor").toUpperCase();
            layoutXValue.textContent = "Not position-based";
            layoutYValue.textContent = "Not position-based";

            if (layoutColorHint) {
                layoutColorHint.textContent = "Press Save Selected to keep this shell background color. It is saved through LayoutSync and mirrored into the theme-color meta.";
            }

            return;
        }

        if (isTextComponent(assetKey, componentKey)) {
            const textState = getEffectiveTextState(assetKey);
            const assetState = getEffectiveLayoutState(assetKey);

            if (isSelfLabeledTextAsset(assetKey) && assetState) {
                layoutStageStatus.textContent = "Text box component · bounded copy";
                layoutSafeZoneStatus.textContent = "Moves this text box on the stage and sets the width/height that its copy wraps inside.";
                layoutScaleValue.textContent = `${Math.round(textState.fontSize)} px type`;
                layoutXValue.textContent = `${Math.round(assetState.x)} px stage position`;
                layoutYValue.textContent = `${Math.round(assetState.y)} px stage position`;

                if (layoutTextStyleStatus) {
                    layoutTextStyleStatus.textContent = "Width and height shape the text box bounds. The text controls below style the copy inside that box.";
                }

                return;
            }

            layoutStageStatus.textContent = "Text component · overlaid label";
            layoutSafeZoneStatus.textContent = "Moves and styles the overlaid text independently inside this asset.";
            layoutScaleValue.textContent = `${Math.round(textState.fontSize)} px`;
            layoutXValue.textContent = `${Math.round(textState.x)} px local offset`;
            layoutYValue.textContent = `${Math.round(textState.y)} px local offset`;

            if (layoutTextStyleStatus) {
                layoutTextStyleStatus.textContent = "Position comes from X/Y. Font controls below affect only this text component.";
            }

            return;
        }

        if (!isRootComponent(componentKey)) {
            const definitions = getComponentDefinitionsForAsset(assetKey);
            const componentState = getEffectiveComponentState(assetKey, componentKey);

            layoutStageStatus.textContent = `Component mode · ${definitions[componentKey]?.label || componentKey}`;
            layoutSafeZoneStatus.textContent = definitions[componentKey]?.status || "Component tuning mode.";
            layoutScaleValue.textContent = componentKey === "nib-hit"
                ? `${Math.round(componentState.hitScaleX)}% width · ${Math.round(componentState.hitScaleY)}% height`
                : `${Math.round(componentState.scale)}%`;
            layoutXValue.textContent = `${Math.round(componentState.x)} px local offset`;
            layoutYValue.textContent = `${Math.round(componentState.y)} px local offset`;

            if (componentKey === "nib-hit" && layoutHitScaleStatus) {
                layoutHitScaleStatus.textContent = "Width and height scales expand the nib's interactable area independently around its centre. Turn on the lock checkbox to scale both axes together again.";
            }

            return;
        }

        const state = getEffectiveLayoutState(assetKey);
        const status = getVisibilityStatus(assetKey, state);
        const stageType = getAssetStageType(assetKey);
        const sceneKey = layoutSceneSelect.value || "home";
        const sceneStateKey = getSelectedSceneStateKey();

        layoutStageStatus.textContent = stageType === "world"
            ? "World layer · fills the screen with cover scaling."
            : "Safe UI layer · authored against the shared safe frame.";
        layoutSafeZoneStatus.textContent = (!status.xStatus.inside || !status.yStatus.inside)
            ? `Outside safe zone · ${status.xStatus.text}; ${status.yStatus.text}`
            : "Inside safe zone.";
        layoutScaleValue.textContent = `${Math.round(state.scale)}%`;
        layoutXValue.textContent = status.xStatus.text;
        layoutYValue.textContent = status.yStatus.text;

        if (sceneStateKey !== "base") {
            layoutSafeZoneStatus.textContent += ` Visibility in ${getLayoutSceneStateDefinition(sceneKey, sceneStateKey).label || sceneStateKey}: ${getEffectiveSceneAssetVisibility(assetKey, sceneKey, sceneStateKey) ? "visible" : "hidden"}.`;
        }
    }

    function syncNumberPairs() {
        layoutScaleNumber.value = layoutScale.value;
        layoutXNumber.value = layoutX.value;
        layoutYNumber.value = layoutY.value;
    }

    function syncHitScalePairs() {
        if (layoutHitScaleX && layoutHitScaleXNumber) {
            layoutHitScaleXNumber.value = layoutHitScaleX.value;
        }

        if (layoutHitScaleY && layoutHitScaleYNumber) {
            layoutHitScaleYNumber.value = layoutHitScaleY.value;
        }
    }

    function getLayoutEditorManagedControls() {
        return [
            layoutEditorModeSelect,
            layoutSceneSelect,
            layoutStateSelect,
            layoutAssetSelect,
            layoutComponentSelect,
            layoutArtPickerButton,
            layoutArtPickerRemoveButton,
            layoutStateVisible,
            layoutSceneAssetSourceSelect,
            layoutSceneAssetAddButton,
            layoutSceneAssetRemoveButton,
            layoutBehaviorRoleSelect,
            layoutNewTextAssetKey,
            layoutNewTextAssetContent,
            layoutNewTextAssetPreset,
            layoutCreateTextAssetButton,
            layoutScale,
            layoutScaleNumber,
            layoutX,
            layoutXNumber,
            layoutY,
            layoutYNumber,
            layoutWidth,
            layoutHeight,
            layoutHitScaleX,
            layoutHitScaleXNumber,
            layoutHitScaleY,
            layoutHitScaleYNumber,
            getLayoutHitScaleLock(),
            getLayoutAspectRatioLock(),
            layoutSaveSelected,
            layoutRevertSelected,
            layoutResetSelected,
            layoutSaveDefault,
            layoutResetDefault,
            layoutCode,
            layoutColorPicker,
            layoutColorText,
            layoutTextContent,
            layoutTextFontFamily,
            layoutTextFontSize,
            layoutTextColorPicker,
            layoutTextColorText,
            layoutTextBold,
            layoutTextItalic
        ].filter(Boolean);
    }

    function updateLayoutEditorControlState() {
        const isEnabled = layoutEditorEnabled;

        getLayoutEditorManagedControls().forEach(function (control) {
            control.disabled = !isEnabled;
        });

        layoutCode.readOnly = true;
        layoutEditorToggle.checked = isEnabled;
    }

    function updateLayoutEditorModeStatus() {
        layoutEditorModeStatus.textContent = layoutEditorEnabled
            ? "Checked: click assets to select and move them. Unchecked: interact with the app normally."
            : "Editor disabled. Interact with the app normally until you check this again.";
    }

    function updateLayoutWorkspaceModeUi() {
        const sceneBuilderSelected = isSceneBuilderModeSelected();
        layoutEditorModeSelect.value = currentLayoutEditorMode;
        layoutSceneBuilderPanel.hidden = !sceneBuilderSelected;
        layoutEditorModeHint.textContent = sceneBuilderSelected
            ? "Scene Builder adds assets to scenes and creates text labels. Switch back to Layout to position them."
            : "Layout moves assets. Scene Builder adds assets to scenes and creates text labels.";

        if (sceneBuilderSelected) {
            setGeometryFieldsHidden(true);
            setAspectRatioFieldHidden(true);
            setLayoutColorFieldHidden(true);
            setLayoutTextControlsHidden(true);
            setHitScaleFieldHidden(true);
            layoutArtPickerField.hidden = true;
            layoutStateVisibilityField.hidden = true;
        }
        else {
            layoutBehaviorRoleField.hidden = true;
        }
    }

    function setLayoutEditorEnabled(nextEnabled) {
        if (!layoutModeEnabled) {
            return;
        }

        layoutEditorEnabled = !!nextEnabled;
        dragState = null;
        setFocusTypePickerDisabledState(focusTypeInput.disabled);
        refreshLayoutUi();
    }

    function applyGeometryModeForSelection(assetKey, componentKey) {
        if (isVariableAsset(assetKey)) {
            setGeometryFieldsHidden(true);
            setComponentFieldHidden(false);
            setAspectRatioFieldHidden(true);
            setHitScaleFieldHidden(true);
            return;
        }

        const definitions = getComponentDefinitionsForAsset(assetKey);
        const definition = definitions[componentKey] || definitions.root;

        setGeometryFieldsHidden(false);
        setComponentFieldHidden(false);

        if (definition.geometryMode === "asset") {
            layoutScaleField.hidden = false;
            layoutXField.hidden = false;
            layoutYField.hidden = false;
            layoutWidthField.hidden = false;
            layoutHeightField.hidden = false;
            setAspectRatioFieldHidden(false);
            setHitScaleFieldHidden(true);
            return;
        }

        if (definition.geometryMode === "text") {
            layoutScaleField.hidden = true;
            layoutXField.hidden = false;
            layoutYField.hidden = false;
            layoutWidthField.hidden = true;
            layoutHeightField.hidden = true;
            setAspectRatioFieldHidden(true);
            setHitScaleFieldHidden(true);
            return;
        }

        if (definition.geometryMode === "text-box-asset") {
            layoutScaleField.hidden = true;
            layoutXField.hidden = false;
            layoutYField.hidden = false;
            layoutWidthField.hidden = false;
            layoutHeightField.hidden = false;
            setAspectRatioFieldHidden(true);
            setHitScaleFieldHidden(true);
            return;
        }

        if (definition.geometryMode === "component-scale") {
            layoutScaleField.hidden = false;
            layoutXField.hidden = false;
            layoutYField.hidden = false;
            layoutWidthField.hidden = true;
            layoutHeightField.hidden = true;
            setAspectRatioFieldHidden(true);
            setHitScaleFieldHidden(true);
            return;
        }

        if (definition.geometryMode === "art-only") {
            layoutScaleField.hidden = true;
            layoutXField.hidden = true;
            layoutYField.hidden = true;
            layoutWidthField.hidden = true;
            layoutHeightField.hidden = true;
            setAspectRatioFieldHidden(true);
            setHitScaleFieldHidden(true);
            return;
        }

        if (definition.geometryMode === "component-box") {
            layoutScaleField.hidden = false;
            layoutXField.hidden = false;
            layoutYField.hidden = false;
            layoutWidthField.hidden = false;
            layoutHeightField.hidden = true;
            setAspectRatioFieldHidden(true);
            setHitScaleFieldHidden(true);
            return;
        }

        if (definition.geometryMode === "component-hit") {
            layoutScaleField.hidden = true;
            layoutXField.hidden = false;
            layoutYField.hidden = false;
            layoutWidthField.hidden = true;
            layoutHeightField.hidden = true;
            setAspectRatioFieldHidden(true);
            setHitScaleFieldHidden(false);
            return;
        }

        setAspectRatioFieldHidden(true);
        setHitScaleFieldHidden(true);
    }

    //#endregion SEGMENT H1 - Layout Bounds And Status Controls

    //#region SEGMENT H2 - Layout UI Refresh
    function refreshLayoutUi() {
        ensureLayoutVariableControls();
        ensureLayoutEditorExtensions();
        ensureLayoutTextControls();
        updateLayoutSceneHeader(layoutSceneSelect.value || "home");
        updateLayoutEditorControlState();
        updateLayoutEditorModeStatus();
        updateLayoutWorkspaceModeUi();
        syncLayoutEditorSelectableStates();
        syncFocusManageButtons();

        const assetKey = getSelectedAssetKey();
        if (!assetKey) {
            setLayoutColorFieldHidden(true);
            setLayoutTextControlsHidden(true);
            setComponentFieldHidden(true);
            setAspectRatioFieldHidden(true);
            setHitScaleFieldHidden(true);
            layoutArtPickerField.hidden = true;
            layoutStateVisibilityField.hidden = true;
            refreshSceneBuilderPanel();
            hideSliderSpecificOutlines();
            return;
        }

        const componentKey = populateLayoutComponentSelect(assetKey, getSelectedComponentKey());
        const layoutWidthLabel = layoutWidthField?.querySelector(".pl-field-label");
        refreshLayoutArtPicker(assetKey, componentKey);
        refreshLayoutStateVisibilityControls(assetKey);
        refreshLayoutBehaviorRoleControls(assetKey);
        refreshSceneBuilderPanel();
        syncLayoutPositionBounds(assetKey, componentKey);

        if (isSceneBuilderModeSelected()) {
            layoutArtPickerField.hidden = true;
            layoutStateVisibilityField.hidden = true;
            previewLayoutAsset(assetKey);
            applyAllAssetLayouts();
            updateLayoutCodePreview(assetKey, componentKey);
            updateLayoutStatusDisplay(assetKey, componentKey);
            refreshLayoutSelection();
            return;
        }

        if (isVariableAsset(assetKey)) {
            setLayoutColorFieldHidden(false);
            setLayoutTextControlsHidden(true);
            applyGeometryModeForSelection(assetKey, componentKey);
            previewLayoutAsset("home-scene");
            applyAllAssetLayouts();
            syncLayoutColorInputs(getEffectiveLayoutVariable("appEdgeColor"));
            updateLayoutCodePreview(assetKey, componentKey);
            updateLayoutStatusDisplay(assetKey, componentKey);
            refreshLayoutSelection();
            hideSliderSpecificOutlines();
            return;
        }

        setLayoutColorFieldHidden(true);
        syncLayoutColorInputs(getEffectiveLayoutVariable("appEdgeColor"));
        previewLayoutAsset(assetKey);
        updateLayoutSliderBounds(assetKey, componentKey);
        applyAllAssetLayouts();
        applyGeometryModeForSelection(assetKey, componentKey);

        const textComponentSelected = isTextComponent(assetKey, componentKey);
        setLayoutTextControlsHidden(!textComponentSelected);

        if (textComponentSelected) {
            const textState = getEffectiveTextState(assetKey);
            const assetState = getEffectiveLayoutState(assetKey);

            layoutTextContent.value = textState.content;
            layoutTextFontFamily.value = textState.fontFamily;
            layoutTextFontSize.value = String(Math.round(textState.fontSize));
            syncLayoutTextColorInputs(textState.color);
            layoutTextBold.checked = !!textState.bold;
            layoutTextItalic.checked = !!textState.italic;

            if (isSelfLabeledTextAsset(assetKey) && assetState) {
                layoutTextStyleStatus.textContent = "X/Y move this text box. Width and height control the bounds that its text wraps inside.";
                layoutX.value = String(Math.round(assetState.x));
                layoutY.value = String(Math.round(assetState.y));
                layoutWidth.value = String(Math.round(assetState.width));
                layoutHeight.value = String(Math.round(assetState.height));
                layoutHeight.disabled = !layoutEditorEnabled;
                layoutHeight.readOnly = !layoutEditorEnabled;

                if (layoutWidthLabel) {
                    layoutWidthLabel.textContent = "Text Width (px)";
                }

                layoutHeightLabel.textContent = "Text Height (px)";
                layoutHeightHint.textContent = "These values define the size of the box the text can flow inside.";
            }
            else {
                layoutTextStyleStatus.textContent = "Position comes from X/Y. Font controls below affect only this text component.";
                layoutX.value = String(Math.round(textState.x));
                layoutY.value = String(Math.round(textState.y));
                layoutWidth.value = "0";
                layoutHeight.value = "0";
                layoutHeight.disabled = false;
                layoutHeight.readOnly = false;

                if (layoutWidthLabel) {
                    layoutWidthLabel.textContent = "Width (px)";
                }

                layoutHeightLabel.textContent = "Height";
                layoutHeightHint.textContent = "";
            }

            syncNumberPairs();
        }
        else if (isRootComponent(componentKey)) {
            const state = getEffectiveLayoutState(assetKey);
            const resolvedHeight = getResolvedHeight(assetKey, state);
            const canLockAspectRatio = assetCanLockAspectRatio(assetKey);
            const ratioLocked = !!state.lockAspectRatio && canLockAspectRatio;

            layoutScale.value = String(Math.round(state.scale));
            layoutX.value = String(Math.round(state.x));
            layoutY.value = String(Math.round(state.y));
            layoutWidth.value = String(Math.round(state.width));
            layoutHeight.value = String(Math.round(resolvedHeight));
            syncNumberPairs();

            layoutHeight.disabled = !layoutEditorEnabled || ratioLocked;
            layoutHeight.readOnly = !layoutEditorEnabled || ratioLocked;
            setAspectRatioFieldHidden(false);

            if (layoutAspectRatioLock) {
                layoutAspectRatioLock.checked = ratioLocked;
                layoutAspectRatioLock.disabled = !layoutEditorEnabled || !canLockAspectRatio;
            }

            if (layoutAspectRatioStatus) {
                layoutAspectRatioStatus.textContent = canLockAspectRatio
                    ? (ratioLocked
                        ? "PNG ratio lock is on. Width drives height automatically."
                        : "PNG ratio lock is off. Width and height can be adjusted independently.")
                    : "No PNG aspect ratio is available for this asset yet, so width and height are already independent.";
            }

            if (layoutWidthLabel) {
                layoutWidthLabel.textContent = "Width (px)";
            }

            layoutHeightLabel.textContent = "Height (px)";
            layoutHeightHint.textContent = ratioLocked
                ? "Height is currently being matched to the PNG because the ratio lock is on."
                : "";
        }
        else {
            const componentState = getEffectiveComponentState(assetKey, componentKey);
            const geometryMode = getComponentDefinitionsForAsset(assetKey)[componentKey]?.geometryMode;
            const hitScaleLock = getLayoutHitScaleLock();

            layoutScale.value = String(Math.round(componentState.scale));
            layoutX.value = String(Math.round(componentState.x));
            layoutY.value = String(Math.round(componentState.y));
            layoutWidth.value = geometryMode === "component-box"
                ? String(Math.round(componentState.width ?? getSliderComponentLocalPreviewWidth(componentKey) ?? 0))
                : "0";
            layoutHeight.value = "0";
            syncNumberPairs();

            if (layoutHitScaleX && layoutHitScaleY) {
                layoutHitScaleX.value = String(Math.round(componentState.hitScaleX));
                layoutHitScaleY.value = String(Math.round(componentState.hitScaleY));
                syncHitScalePairs();
            }

            if (layoutWidthLabel) {
                layoutWidthLabel.textContent = geometryMode === "component-box"
                    ? "Component Width (px)"
                    : "Width (px)";
            }

            if (hitScaleLock && componentKey === "nib-hit") {
                hitScaleLock.checked = Math.round(componentState.hitScaleX) === Math.round(componentState.hitScaleY);
            }

            layoutHeightLabel.textContent = "Height";
            layoutHeightHint.textContent = geometryMode === "component-box"
                ? "Width lets you manually widen or narrow this component without changing the whole slider."
                : "";
        }

        updateLayoutCodePreview(assetKey, componentKey);
        updateLayoutStatusDisplay(assetKey, componentKey);
        refreshLayoutSelection();
        refreshComponentOutlines();
    }

    //#endregion SEGMENT H2 - Layout UI Refresh

    //#region SEGMENT H3 - Layout Draft Control Values
    function syncLayoutPositionBounds(assetKey, componentKey) {
        const isRootLikeTextBox = isTextComponent(assetKey, componentKey) && isSelfLabeledTextAsset(assetKey);
        const isRootLikeSelection = isRootLikeTextBox || isRootComponent(componentKey);
        const isWorldAsset = getAssetStageType(assetKey) === "world";
        const effectiveState = isRootLikeTextBox ? getEffectiveLayoutState(assetKey) : null;
        const scaledSize = effectiveState ? getScaledAssetSize(assetKey, effectiveState) : null;
        const minX = isRootLikeTextBox ? -Math.round(scaledSize?.width || 0) : -600;
        const minY = isRootLikeTextBox ? -Math.round(scaledSize?.height || 0) : -600;
        const maxX = isRootLikeTextBox
            ? Math.round(getSafeFrameWidth() + (scaledSize?.width || 0))
            : (isWorldAsset ? getDesignWidth() + 600 : getUiAuthorFrameWidth() + 600);
        const maxY = isRootLikeTextBox
            ? Math.round(getSafeFrameHeight() + (scaledSize?.height || 0))
            : (isWorldAsset ? getDesignHeight() + 600 : getUiAuthorFrameHeight() + 600);

        if (!isRootLikeSelection) {
            layoutX.min = "-300";
            layoutX.max = "700";
            layoutXNumber.min = "-300";
            layoutXNumber.max = "700";
            layoutY.min = "-300";
            layoutY.max = "700";
            layoutYNumber.min = "-300";
            layoutYNumber.max = "700";
            return;
        }

        layoutX.min = String(minX);
        layoutX.max = String(maxX);
        layoutXNumber.min = String(minX);
        layoutXNumber.max = String(maxX);
        layoutY.min = String(minY);
        layoutY.max = String(maxY);
        layoutYNumber.min = String(minY);
        layoutYNumber.max = String(maxY);
    }

    function setLockedHitScaleUiValue(nextValue) {
        const normalizedValue = String(Math.max(100, Math.min(200, parseInt(String(nextValue || "100"), 10) || 100)));

        if (layoutHitScaleX) {
            layoutHitScaleX.value = normalizedValue;
        }

        if (layoutHitScaleXNumber) {
            layoutHitScaleXNumber.value = normalizedValue;
        }

        if (layoutHitScaleY) {
            layoutHitScaleY.value = normalizedValue;
        }

        if (layoutHitScaleYNumber) {
            layoutHitScaleYNumber.value = normalizedValue;
        }
    }

    function buildPartialStateFromControls() {
        const assetKey = getSelectedAssetKey();
        const componentKey = getSelectedComponentKey();

        if (isVariableAsset(assetKey) || isTextComponent(assetKey, componentKey)) {
            return null;
        }

        if (isRootComponent(componentKey)) {
            const base = getEffectiveLayoutState(assetKey);
            const nextLockAspectRatio = assetCanLockAspectRatio(assetKey)
                ? !!getLayoutAspectRatioLock()?.checked
                : false;
            const parsedWidth = parseInt(layoutWidth.value || String(base.width), 10);
            const nextWidth = Number.isFinite(parsedWidth) && parsedWidth > 0
                ? parsedWidth
                : base.width;
            const lockedHeight = nextLockAspectRatio
                ? getResolvedHeight(assetKey, Object.assign({}, base, { width: nextWidth, lockAspectRatio: true }))
                : parseInt(layoutHeight.value || String(base.height), 10);
            const partial = {
                scale: parseInt(layoutScaleNumber.value || layoutScale.value || String(base.scale), 10),
                x: parseInt(layoutXNumber.value || layoutX.value || String(base.x), 10),
                y: parseInt(layoutYNumber.value || layoutY.value || String(base.y), 10),
                width: nextWidth,
                height: lockedHeight,
                lockAspectRatio: nextLockAspectRatio
            };

            return partial;
        }

        const base = getEffectiveComponentState(assetKey, componentKey);
        const geometryMode = getComponentDefinitionsForAsset(assetKey)[componentKey]?.geometryMode;
        const partial = {
            x: parseInt(layoutXNumber.value || layoutX.value || String(base.x), 10),
            y: parseInt(layoutYNumber.value || layoutY.value || String(base.y), 10),
            scale: parseInt(layoutScaleNumber.value || layoutScale.value || String(base.scale), 10),
            hitScaleX: parseInt(layoutHitScaleXNumber?.value || layoutHitScaleX?.value || String(base.hitScaleX), 10),
            hitScaleY: parseInt(layoutHitScaleYNumber?.value || layoutHitScaleY?.value || String(base.hitScaleY), 10)
        };

        if (geometryMode === "component-box") {
            const parsedWidth = parseInt(layoutWidth.value || String(base.width ?? 0), 10);
            partial.width = Number.isFinite(parsedWidth) && parsedWidth > 0
                ? parsedWidth
                : null;
        }

        if (geometryMode === "component-hit") {
            partial.scale = base.scale;
        }

        return partial;
    }

    function buildTextStateFromControls() {
        const assetKey = getSelectedAssetKey();
        const base = getEffectiveTextState(assetKey);

        if (!base) {
            return null;
        }

        const parsedFontSize = parseInt(layoutTextFontSize.value || String(base.fontSize), 10);

        return {
            content: layoutTextContent.value ?? base.content,
            fontFamily: layoutTextFontFamily.value || base.fontFamily,
            fontSize: Number.isFinite(parsedFontSize) && parsedFontSize > 0 ? parsedFontSize : base.fontSize,
            color: normalizeHexColor(layoutTextColorText.value || layoutTextColorPicker.value, base.color),
            bold: !!layoutTextBold.checked,
            italic: !!layoutTextItalic.checked,
            x: base.x,
            y: base.y
        };
    }

    function pushTextControlValues() {
        const assetKey = getSelectedAssetKey();
        const componentKey = getSelectedComponentKey();

        if (!isTextComponent(assetKey, componentKey)) {
            return;
        }

        const nextTextState = buildTextStateFromControls();

        if (!nextTextState) {
            return;
        }

        beginTextDraft(assetKey, nextTextState);
        syncLayoutTextColorInputs(nextTextState.color);
        applyAssetTextStyle(assetKey);
        updateLayoutCodePreview(assetKey, componentKey);
        updateLayoutStatusDisplay(assetKey, componentKey);
    }

    function pushLayoutControlValues() {
        const assetKey = getSelectedAssetKey();
        const componentKey = getSelectedComponentKey();

        if (isVariableAsset(assetKey)) {
            return;
        }

        if (isTextComponent(assetKey, componentKey)) {
            const base = getEffectiveTextState(assetKey);

            if (!base) {
                return;
            }

            if (isSelfLabeledTextAsset(assetKey)) {
                const boxState = getEffectiveLayoutState(assetKey);
                beginAssetDraft(assetKey, {
                    x: parseInt(layoutXNumber.value || layoutX.value || String(boxState.x), 10),
                    y: parseInt(layoutYNumber.value || layoutY.value || String(boxState.y), 10),
                    width: parseInt(layoutWidth.value || String(boxState.width), 10),
                    height: parseInt(layoutHeight.value || String(boxState.height), 10),
                    scale: boxState.scale
                });
                applyAssetLayout(assetKey);
            }
            else {
                beginTextDraft(assetKey, {
                    x: parseInt(layoutXNumber.value || layoutX.value || String(base.x), 10),
                    y: parseInt(layoutYNumber.value || layoutY.value || String(base.y), 10),
                    content: base.content,
                    fontFamily: base.fontFamily,
                    fontSize: base.fontSize,
                    color: base.color,
                    bold: base.bold,
                    italic: base.italic
                });
            }

            applyAssetTextStyle(assetKey);
            updateLayoutCodePreview(assetKey, componentKey);
            updateLayoutStatusDisplay(assetKey, componentKey);
            return;
        }

        const partial = buildPartialStateFromControls();
        if (!partial) {
            return;
        }

        beginDraftForSelected(partial);
        updateLayoutSliderBounds(assetKey, componentKey);

        if (isRootComponent(componentKey) && currentDraftState) {
            const resolvedHeight = getResolvedHeight(assetKey, currentDraftState);
            layoutHeight.value = String(Math.round(resolvedHeight));
        }

        if (currentDraftState && currentDraftState.scale != null) {
            layoutScale.value = String(Math.round(currentDraftState.scale));
            syncNumberPairs();
        }

        if (currentDraftState) {
            if (layoutHitScaleX) {
                layoutHitScaleX.value = String(Math.round(currentDraftState.hitScaleX ?? 100));
            }

            if (layoutHitScaleY) {
                layoutHitScaleY.value = String(Math.round(currentDraftState.hitScaleY ?? 100));
            }

            syncHitScalePairs();
        }

        applyAllAssetLayouts();
        refreshLayoutUi();
        updateLayoutCodePreview(assetKey, componentKey);
        updateLayoutStatusDisplay(assetKey, componentKey);
        refreshLayoutSelection();
        refreshComponentOutlines();
    }
    //#endregion SEGMENT H3 - Layout Draft Control Values

    //#region SEGMENT I - Layout Selection, Drag, And Slider Pointer Handling
    function handleLayoutSceneChange() {
        const nextSceneKey = layoutSceneSelect.value || "home";
        const newAssetKey = setActiveLayoutScene(
            nextSceneKey,
            getSelectedAssetKey(),
            getSelectedComponentKey(),
            getSelectedSceneStateKey());

        if (currentDraftAssetKey && currentDraftAssetKey !== newAssetKey) {
            discardCurrentDraft();
        }

        if (currentTextDraftAssetKey && currentTextDraftAssetKey !== newAssetKey) {
            discardCurrentTextDraft();
        }

        if (currentVariableDraftKey && newAssetKey !== layoutColorAssetKey) {
            discardVariableDraft();
        }

        if (currentImageDraftAssetKey && currentImageDraftAssetKey !== newAssetKey) {
            discardCurrentImageDraft();
        }

        if (currentVisibilityDraftSceneKey && currentVisibilityDraftSceneKey !== nextSceneKey) {
            discardCurrentVisibilityDraft();
        }

        if (currentBehaviorDraftAssetKey && currentBehaviorDraftAssetKey !== newAssetKey) {
            discardCurrentBehaviorRoleDraft();
        }

        refreshLayoutUi();
    }

    function handleLayoutStateChange() {
        const sceneKey = layoutSceneSelect.value || "home";
        const nextStateKey = layoutStateSelect.value || "base";
        populateLayoutStateSelectForScene(sceneKey, nextStateKey);

        if (
            currentVisibilityDraftSceneKey
            && (
                currentVisibilityDraftSceneKey !== sceneKey
                || currentVisibilityDraftStateKey !== nextStateKey
            )
        ) {
            discardCurrentVisibilityDraft();
        }

        refreshLayoutUi();
    }

    function handleLayoutAssetChange() {
        const newAssetKey = getSelectedAssetKey();

        if (currentDraftAssetKey && currentDraftAssetKey !== newAssetKey) {
            discardCurrentDraft();
        }

        if (currentTextDraftAssetKey && currentTextDraftAssetKey !== newAssetKey) {
            discardCurrentTextDraft();
        }

        if (currentVariableDraftKey && newAssetKey !== layoutColorAssetKey) {
            discardVariableDraft();
        }

        if (currentImageDraftAssetKey && currentImageDraftAssetKey !== newAssetKey) {
            discardCurrentImageDraft();
        }

        if (currentVisibilityDraftAssetKey && currentVisibilityDraftAssetKey !== newAssetKey) {
            discardCurrentVisibilityDraft();
        }

        if (currentBehaviorDraftAssetKey && currentBehaviorDraftAssetKey !== newAssetKey) {
            discardCurrentBehaviorRoleDraft();
        }

        populateLayoutComponentSelect(newAssetKey, "root");
        refreshLayoutUi();
    }

    function handleLayoutComponentChange() {
        const assetKey = getSelectedAssetKey();
        const newComponentKey = getSelectedComponentKey();

        if (currentDraftKind === "component" && currentDraftComponentKey !== newComponentKey) {
            discardCurrentDraft();
        }

        if (currentTextDraftAssetKey === assetKey && !isTextComponent(assetKey, newComponentKey)) {
            discardCurrentTextDraft();
        }

        if (currentImageDraftAssetKey === assetKey && (currentImageDraftComponentKey || "root") !== newComponentKey) {
            discardCurrentImageDraft();
        }

        refreshLayoutUi();
    }

    function handleLayoutArtPickerButtonClick() {
        const assetKey = getSelectedAssetKey();
        const componentKey = getSelectedComponentKey();

        if (!assetSupportsArtPicker(assetKey, componentKey)) {
            return;
        }

        layoutArtPickerInput.value = "";
        layoutArtPickerInput.click();
    }

    function handleLayoutArtPickerInputChange() {
        const assetKey = getSelectedAssetKey();
        const componentKey = getSelectedComponentKey();

        if (!assetSupportsArtPicker(assetKey, componentKey)) {
            layoutArtPickerInput.value = "";
            return;
        }

        const file = layoutArtPickerInput.files && layoutArtPickerInput.files[0];

        if (!file) {
            return;
        }

        const fileName = String(file.name || "").toLowerCase();

        if (!fileName.endsWith(".png")) {
            layoutArtPickerStatus.textContent = "Only PNG files are supported.";
            layoutArtPickerInput.value = "";
            return;
        }

        beginImageDraft(assetKey, componentKey, file);
        layoutArtPickerInput.value = "";
    }

    async function handleLayoutArtPickerRemoveButtonClick() {
        const assetKey = getSelectedAssetKey();
        const componentKey = getSelectedComponentKey();

        if (!assetSupportsArtPicker(assetKey, componentKey)) {
            return;
        }

        const imageVariableKey = getLayoutAssetImageVariableKey(assetKey, componentKey);
        const wasDraftingCurrentImage = currentImageDraftAssetKey === assetKey
            && (currentImageDraftComponentKey || "root") === componentKey;

        if (wasDraftingCurrentImage) {
            clearCurrentImageDraftState();
        }

        delete sharedLayoutVariables[imageVariableKey];
        applyLayoutVariables();

        if (isRootComponent(componentKey)) {
            await refreshArtMetricsForAsset(assetKey, readCssUrlVar(artImageVars[assetKey]));
        }

        applyAllAssetLayouts();
        refreshLayoutUi();
        await saveSharedLayoutState();
    }

    function handleLayoutStateVisibilityChange() {
        const assetKey = getSelectedAssetKey();
        const sceneKey = layoutSceneSelect.value || "home";
        const stateKey = getSelectedSceneStateKey();

        if (!assetKey || isVariableAsset(assetKey) || stateKey === "base") {
            refreshLayoutUi();
            return;
        }

        beginVisibilityDraft(assetKey, sceneKey, stateKey, !!layoutStateVisible.checked);
        refreshLayoutUi();
    }

    function handleLayoutBehaviorRoleChange() {
        const assetKey = getSelectedAssetKey();

        if (!assetKey || !assetSupportsBehaviorRole(assetKey)) {
            refreshLayoutUi();
            return;
        }

        beginBehaviorRoleDraft(assetKey, layoutBehaviorRoleSelect.value || getDefaultBehaviorRole(assetKey));
        refreshLayoutUi();
    }

    function handleLayoutEditorModeChange() {
        currentLayoutEditorMode = layoutEditorModeSelect.value === "scene-builder"
            ? "scene-builder"
            : "layout";
        refreshLayoutUi();
    }

    function handleLayoutEditorToggleChange() {
        setLayoutEditorEnabled(layoutEditorToggle.checked);
    }

    function handleLayoutAssetCanvasClick(assetKey, event) {
        if (!layoutEditorEnabled) {
            return;
        }

        const preferredSceneKey = layoutSceneSelect.value || currentVisibleSceneKey || "home";

        if (getSelectedAssetKey() !== assetKey) {
            selectLayoutAsset(assetKey, "root", preferredSceneKey);
            handleLayoutAssetChange();
        }
        else {
            refreshLayoutSelection();
        }

        event.preventDefault();
        event.stopPropagation();
    }

    function beginDrag(assetKey, event) {
        if (!layoutEditorEnabled || isVariableAsset(assetKey)) {
            return;
        }

        const preferredSceneKey = layoutSceneSelect.value || currentVisibleSceneKey || "home";
        const resolvedSceneKey = findLayoutSceneKeyForAsset(assetKey, preferredSceneKey);

        const allowsTextBoxDrag = isSelfLabeledTextAsset(assetKey) && getSelectedComponentKey() === "text";

        if (
            getSelectedAssetKey() !== assetKey
            || (!isRootComponent(getSelectedComponentKey()) && !allowsTextBoxDrag)
            || (layoutSceneSelect.value || "home") !== resolvedSceneKey
        ) {
            selectLayoutAsset(assetKey, "root", resolvedSceneKey);
            refreshLayoutUi();
        }

        if (
            getSelectedAssetKey() !== assetKey
            || (!isRootComponent(getSelectedComponentKey()) && !(isSelfLabeledTextAsset(assetKey) && getSelectedComponentKey() === "text"))
        ) {
            return;
        }

        const state = getEffectiveLayoutState(assetKey);
        const designPoint = clientToAssetDesignPoint(assetKey, event.clientX, event.clientY);

        dragState = {
            assetKey,
            pointerId: event.pointerId,
            offsetX: designPoint.x - state.x,
            offsetY: designPoint.y - state.y
        };

        event.preventDefault();
        event.stopPropagation();
    }

    function handleDragMove(event) {
        if (!dragState || event.pointerId !== dragState.pointerId) {
            return;
        }

        const assetKey = dragState.assetKey;
        const designPoint = clientToAssetDesignPoint(assetKey, event.clientX, event.clientY);
        const draggingSelfLabeledText = isSelfLabeledTextAsset(assetKey) && getSelectedComponentKey() === "text";

        if (draggingSelfLabeledText) {
            beginAssetDraft(assetKey, {
                x: Math.round(designPoint.x - dragState.offsetX),
                y: Math.round(designPoint.y - dragState.offsetY)
            });
        }
        else {
            beginDraftForSelected({
                x: Math.round(designPoint.x - dragState.offsetX),
                y: Math.round(designPoint.y - dragState.offsetY)
            });
        }

        applyAllAssetLayouts();

        if (draggingSelfLabeledText) {
            const draftState = getEffectiveLayoutState(assetKey);
            layoutX.value = String(Math.round(draftState.x));
            layoutY.value = String(Math.round(draftState.y));
        }
        else {
            layoutX.value = String(Math.round(currentDraftState.x));
            layoutY.value = String(Math.round(currentDraftState.y));
        }

        syncNumberPairs();

        updateLayoutCodePreview(assetKey, draggingSelfLabeledText ? "text" : "root");
        updateLayoutStatusDisplay(assetKey, draggingSelfLabeledText ? "text" : "root");
        refreshLayoutSelection();
    }

    function endDrag(event) {
        if (!dragState) {
            return;
        }

        if (event.pointerId !== undefined && event.pointerId !== dragState.pointerId) {
            return;
        }

        dragState = null;
    }

    function isPointInRect(clientX, clientY, rect) {
        return clientX >= rect.left
            && clientX <= rect.right
            && clientY >= rect.top
            && clientY <= rect.bottom;
    }

    function getSliderTrackClientMetrics() {
        const trackRect = sliderTrackEmptyArt.getBoundingClientRect();
        const sliderMetric = artMetrics.slider;

        const left = sliderMetric && sliderMetric.hasVisibleBounds
            ? trackRect.left + (trackRect.width * sliderMetric.visibleLeftRatio)
            : trackRect.left;

        const width = sliderMetric && sliderMetric.hasVisibleBounds
            ? trackRect.width * sliderMetric.visibleWidthRatio
            : trackRect.width;

        return { left, width };
    }

    function updateSliderValueFromClientX(clientX) {
        const metrics = getSliderTrackClientMetrics();
        if (metrics.width <= 0) {
            return;
        }

        const min = parseInt(durationSlider.min || "5", 10);
        const max = parseInt(durationSlider.max || "120", 10);
        const step = Math.max(1, parseInt(durationSlider.step || "1", 10) || 1);

        const ratio = Math.max(0, Math.min(1, (clientX - metrics.left) / metrics.width));
        const raw = min + ((max - min) * ratio);
        const snapped = min + (Math.round((raw - min) / step) * step);
        const clamped = Math.max(min, Math.min(max, snapped));

        durationSlider.value = String(clamped);
        updateDurationReadout();
    }

    function handleSliderPointerDown(event) {
        if (layoutEditorEnabled || durationSlider.disabled || sliderGroup.hidden || isRunning || setupPanel.classList.contains("pl-setup-panel-locked")) {
            return;
        }

        const hitRect = durationSlider.getBoundingClientRect();
        if (!isPointInRect(event.clientX, event.clientY, hitRect)) {
            return;
        }

        sliderDragState = {
            pointerId: event.pointerId
        };

        event.preventDefault();
        updateSliderValueFromClientX(event.clientX);
    }

    function handleSliderPointerMove(event) {
        if (!sliderDragState || event.pointerId !== sliderDragState.pointerId) {
            return;
        }

        event.preventDefault();
        updateSliderValueFromClientX(event.clientX);
    }

    function handleSliderPointerUp(event) {
        if (!sliderDragState || event.pointerId !== sliderDragState.pointerId) {
            return;
        }

        sliderDragState = null;
    }

    initializeLayoutSceneControls();
    //#endregion SEGMENT I - Layout Selection, Drag, And Slider Pointer Handling

    //#region SEGMENT J1 - Screen State Previews And Visibility
    function syncLayoutSceneToVisibleState(sceneKey) {
        if (!layoutModeEnabled || layoutEditorEnabled) {
            return;
        }

        const preservedAssetKey = getSelectedAssetKey();
        const preservedComponentKey = getSelectedComponentKey();
        const previewStateKey = sceneKey === "focus-setup"
            ? getRenderedFocusSetupStateKey()
            : "base";

        setActiveLayoutScene(sceneKey, preservedAssetKey, preservedComponentKey, previewStateKey);
    }

    function setSetupChildrenVisible(isVisible) {
        const sceneStateKey = getRenderedFocusSetupStateKey();
        const isAssetVisible = function (assetKey) {
            return isVisible && getEffectiveSceneAssetVisibility(assetKey, "focus-setup", sceneStateKey);
        };

        focusTypeLabel.hidden = !isAssetVisible("focus-type-label");
        focusTypeField.hidden = !isAssetVisible("focus-type-field");
        durationText.hidden = !isAssetVisible("duration-text");
        sliderGroup.hidden = !isAssetVisible("slider");
        countdownModeButton.hidden = !isAssetVisible("countdown-mode");
        countUpModeButton.hidden = !isAssetVisible("countup-mode");
    }

    function setSetupChildrenLocked(isLocked) {
        setupInteractiveElements.forEach(function (element) {
            element.classList.toggle("pl-setup-child-locked", isLocked);
        });

        focusTypeInput.disabled = isLocked;
        setFocusTypePickerDisabledState(isLocked);
    }

    function setHomeButtonsVisible(isVisible) {
        homeFocusButton.hidden = !isVisible;
        homeSleepButton.hidden = !isVisible;
    }

    function setSetupVisible(isVisible) {
        const sceneStateKey = getRenderedFocusSetupStateKey();
        setupPanel.hidden = !(isVisible && getEffectiveSceneAssetVisibility("setup-panel", "focus-setup", sceneStateKey));
        startFocusButton.hidden = !(isVisible && getEffectiveSceneAssetVisibility("start", "focus-setup", sceneStateKey));
        closeFocusButton.hidden = !(isVisible && getEffectiveSceneAssetVisibility("back", "focus-setup", sceneStateKey));
        manageButton.hidden = !(isVisible && getEffectiveSceneAssetVisibility("manage-button", "focus-setup", sceneStateKey));
        setSetupChildrenVisible(isVisible);
        syncTimerModeUi(sceneStateKey);

        if (isVisible) {
            requestAnimationFrame(function () {
                syncFocusTypePickerPadding();
                scrollFocusTypePickerToIndex(focusTypePickerSelectedIndex, "auto");
                refreshFocusTypePickerSelectionStyles();
            });
        }
    }

    function isFocusManageConfirmPreviewRequested() {
        return layoutModeEnabled
            && layoutEditorEnabled
            && currentVisibleSceneKey === "focus-manage"
            && focusManageConfirmAssetKeys.has(getSelectedAssetKey());
    }

    function isFocusManageConfirmActive() {
        return focusManageSaveConfirmOpen || isFocusManageConfirmPreviewRequested();
    }

    function setFocusManageConfirmVisible(isVisible) {
        focusManageConfirmPanel.hidden = !(isVisible && getEffectiveSceneAssetVisibility("focus-manage-confirm-panel", "focus-manage", "base"));
        focusManageConfirmTitle.hidden = !(isVisible && getEffectiveSceneAssetVisibility("focus-manage-confirm-title", "focus-manage", "base"));
        focusManageConfirmMessage.hidden = !(isVisible && getEffectiveSceneAssetVisibility("focus-manage-confirm-message", "focus-manage", "base"));
        focusManageConfirmDeleteButton.hidden = !(isVisible && getEffectiveSceneAssetVisibility("focus-manage-confirm-delete", "focus-manage", "base"));
        focusManageConfirmCancelButton.hidden = !(isVisible && getEffectiveSceneAssetVisibility("focus-manage-confirm-cancel", "focus-manage", "base"));
        focusManageConfirmDismissField.hidden = !(isVisible && getEffectiveSceneAssetVisibility("focus-manage-confirm-dismiss", "focus-manage", "base"));
    }

    function setFocusManageVisible(isVisible) {
        focusManagePanel.hidden = !(isVisible && getEffectiveSceneAssetVisibility("focus-manage-panel", "focus-manage", "base"));
        focusManageStatus.hidden = true;
        focusManageListShell.hidden = !(isVisible && getEffectiveSceneAssetVisibility("focus-manage-list", "focus-manage", "base"));
        focusManageInputLabel.hidden = !(isVisible && getEffectiveSceneAssetVisibility("focus-manage-input-label", "focus-manage", "base"));
        focusManageInputField.hidden = !(isVisible && getEffectiveSceneAssetVisibility("focus-manage-input", "focus-manage", "base"));
        focusManageAddButton.hidden = !(isVisible && getEffectiveSceneAssetVisibility("focus-manage-add", "focus-manage", "base"));
        focusManageDeleteButton.hidden = !(isVisible && getEffectiveSceneAssetVisibility("focus-manage-delete", "focus-manage", "base"));
        focusManageBackButton.hidden = !(isVisible && getEffectiveSceneAssetVisibility("focus-manage-back", "focus-manage", "base"));
        focusManageOkButton.hidden = !(isVisible && getEffectiveSceneAssetVisibility("focus-manage-ok", "focus-manage", "base"));
        setFocusManageConfirmVisible(isVisible && isFocusManageConfirmActive());
        syncFocusManageButtons();
        requestAnimationFrame(updateFocusManageScrollbarVisual);
    }

    function setRunVisible(isVisible) {
        pauseButton.hidden = !isVisible;
        exitButton.hidden = !isVisible;
    }

    function setConfirmVisible(isVisible) {
        confirmDim.hidden = !isVisible;
        confirmPanel.hidden = !isVisible;
        confirmKeepGoingButton.hidden = !isVisible;
        confirmStopButton.hidden = !isVisible;
    }

    function setRewardVisible(isVisible) {
        rewardDim.hidden = !isVisible;
        rewardPanel.hidden = !isVisible;
        rewardCloseButton.hidden = !isVisible;
    }

    function showHomeState() {
        currentVisibleSceneKey = "home";
        currentVisibleSceneStateKey = "base";
        setHomeButtonsVisible(true);
        setSetupVisible(false);
        setFocusManageVisible(false);
        setRunVisible(false);
        setConfirmVisible(false);
        setRewardVisible(false);
        applySceneMembershipVisibility();
        syncLayoutSceneToVisibleState("home");
    }

    function showSetupState() {
        currentVisibleSceneKey = "focus-setup";
        currentVisibleSceneStateKey = getRenderedFocusSetupStateKey();
        setHomeButtonsVisible(false);
        setSetupVisible(true);
        setFocusManageVisible(false);
        setRunVisible(false);
        setConfirmVisible(false);
        setRewardVisible(false);
        setupPanel.classList.remove("pl-setup-panel-locked");
        setSetupChildrenLocked(false);
        updateDurationReadout();
        applySceneMembershipVisibility();
        syncLayoutSceneToVisibleState("focus-setup");
    }

    function showFocusManageState(preserveDraft = false) {
        currentVisibleSceneKey = "focus-manage";
        currentVisibleSceneStateKey = "base";
        setHomeButtonsVisible(false);
        setSetupVisible(false);
        setFocusManageVisible(true);
        setRunVisible(false);
        setConfirmVisible(false);
        setRewardVisible(false);

        if (!preserveDraft || (!draftFocusLabels.length && !focusManageSaveConfirmOpen)) {
            beginFocusManageDraft();
        }
        else {
            setFocusManageConfirmVisible(isFocusManageConfirmActive());
            syncFocusManageButtons();
        }

        applySceneMembershipVisibility();
        syncLayoutSceneToVisibleState("focus-manage");
    }

    function showRunStatePreview() {
        const previewSeconds = isCountUpModeSelected() ? 4800 : 1500;
        const previewLabel = isCountUpModeSelected()
            ? formatClock(previewSeconds)
            : formatDurationLabel(previewSeconds);

        showSetupState();
        currentVisibleSceneKey = "focus-running";
        currentVisibleSceneStateKey = "base";
        setupPanel.classList.add("pl-setup-panel-locked");
        setSetupChildrenLocked(true);
        setRunVisible(true);
        countdownModeButton.hidden = true;
        countUpModeButton.hidden = true;
        durationText.textContent = previewLabel;
        setButtonLabel(pauseButton, "Pause");
        setButtonLabel(exitButton, "Stop Focusing");
        applySceneMembershipVisibility();
        syncLayoutSceneToVisibleState("focus-running");
    }

    function showConfirmStatePreview() {
        showRunStatePreview();
        currentVisibleSceneKey = "stop-confirm";
        currentVisibleSceneStateKey = "base";
        setConfirmVisible(true);
        activeConfirmContext = "stop";
        updateConfirmPanel(600);
        applySceneMembershipVisibility();
        syncLayoutSceneToVisibleState("stop-confirm");
    }

    function showRewardStatePreview() {
        currentVisibleSceneKey = "reward";
        currentVisibleSceneStateKey = "base";
        setHomeButtonsVisible(false);
        setSetupVisible(false);
        setRunVisible(false);
        setConfirmVisible(false);
        setRewardVisible(true);
        rewardStatusText.textContent = "Completed";
        rewardFocusType.textContent = "Focus";
        rewardDurationText.textContent = "00:25:00";
        rewardXp.textContent = "2500";
        rewardCoins.textContent = "25";
        applySceneMembershipVisibility();
        syncLayoutSceneToVisibleState("reward");
    }

    function applySceneMembershipVisibility() {
        Object.entries(layoutAssets).forEach(function ([assetKey, config]) {
            if (isPersistentWorldAsset(assetKey)) {
                config.element.hidden = false;
                return;
            }

            const isVisibleInScene = getLayoutSceneAssetKeys(currentVisibleSceneKey).includes(assetKey)
                && getEffectiveSceneAssetVisibility(assetKey, currentVisibleSceneKey, currentVisibleSceneStateKey);
            const isBuiltInDefault = !!layoutSceneDefinitions[currentVisibleSceneKey]?.assets?.includes(assetKey);

            if (config.dynamic) {
                config.element.hidden = !isVisibleInScene;
                return;
            }

            if (!isBuiltInDefault) {
                config.element.hidden = !isVisibleInScene;
                return;
            }

            if (isBuiltInDefault && !isVisibleInScene) {
                config.element.hidden = true;
                return;
            }
        });
    }

    function previewLayoutAsset(assetKey) {
        if (!layoutEditorEnabled) {
            return;
        }

        const sceneKey = findLayoutSceneKeyForAsset(
            assetKey,
            layoutSceneSelect.value || currentVisibleSceneKey || "home");

        switch (sceneKey) {
            case "focus-setup":
                showSetupState();
                break;
            case "focus-manage":
                showFocusManageState(true);
                break;
            case "focus-running":
                showRunStatePreview();
                break;
            case "stop-confirm":
                showConfirmStatePreview();
                break;
            case "reward":
                showRewardStatePreview();
                break;
            case "home":
            case "app-shell":
                showHomeState();
                break;
            default:
                break;
        }

        switch (assetKey) {
            case "home-scene":
            case "home-focus":
            case "home-sleep":
            case "setup-panel":
            case "countdown-mode":
            case "countup-mode":
            case "focus-type-label":
            case "focus-type-field":
            case "slider":
            case "start":
            case "back":
            case "manage-button":
            case "focus-manage-panel":
            case "focus-manage-list":
            case "focus-manage-input-label":
            case "focus-manage-input":
            case "focus-manage-add":
            case "focus-manage-delete":
            case "focus-manage-back":
            case "focus-manage-ok":
            case "focus-manage-confirm-panel":
            case "focus-manage-confirm-title":
            case "focus-manage-confirm-message":
            case "focus-manage-confirm-delete":
            case "focus-manage-confirm-cancel":
            case "focus-manage-confirm-dismiss":
                break;
            case "pause":
            case "exit":
            case "confirm-panel":
            case "keep-going":
            case "stop":
            case "reward-panel":
            case "gotcha":
                break;
            default:
                if (!sceneKey) {
                    showHomeState();
                }
                break;
        }

        updateDurationReadout();
    }

    function openFocusSetup() {
        showSetupState();
    }

    function openFocusManage() {
        showFocusManageState(false);
    }

    function returnToFocusSetup() {
        closeFocusManageDraft();
        showSetupState();
    }

    function returnToHome() {
        closeFocusManageDraft();
        resetRunState();
        showHomeState();
    }
    //#endregion SEGMENT J1 - Screen State Previews And Visibility

    //#region SEGMENT J2 - Session Runtime And Rewards
    function normalizeFocusLabelName(rawValue) {
        return String(rawValue || "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function parseInitialFocusLabels() {
        try {
            const parsed = JSON.parse(homeRoot.dataset.focusLabels || "[]");

            if (Array.isArray(parsed)) {
                const normalized = parsed
                    .map(function (item) {
                        return normalizeFocusLabelName(item);
                    })
                    .filter(Boolean);

                if (normalized.length > 0) {
                    return normalized;
                }
            }
        }
        catch {
        }

        const fallbackLabel = normalizeFocusLabelName(focusTypeInput.value || "Focus");
        return fallbackLabel ? [fallbackLabel] : ["Focus"];
    }

    function getFocusTypePickerItemHeight() {
        const parsed = parseFloat(
            getComputedStyle(focusTypePicker).getPropertyValue("--pl-focus-type-picker-item-height"));

        return Number.isFinite(parsed) && parsed > 0 ? parsed : 54;
    }

    function clampFocusTypePickerIndex(index) {
        return Math.max(0, Math.min(Math.max(savedFocusLabels.length - 1, 0), index));
    }

    function getSelectedFocusLabelIndexByName(labelName) {
        const normalizedLabel = normalizeFocusLabelName(labelName).toLowerCase();

        if (!normalizedLabel) {
            return 0;
        }

        const matchIndex = savedFocusLabels.findIndex(function (label) {
            return label.toLowerCase() === normalizedLabel;
        });

        return matchIndex >= 0 ? matchIndex : 0;
    }

    function syncFocusTypePickerPadding() {
        const viewportHeight = focusTypePickerViewport.clientHeight;

        if (viewportHeight <= 0) {
            return;
        }

        const itemHeight = getFocusTypePickerItemHeight();
        const verticalPadding = Math.max(0, Math.round((viewportHeight - itemHeight) / 2));

        focusTypePickerList.style.paddingTop = `${verticalPadding}px`;
        focusTypePickerList.style.paddingBottom = `${verticalPadding}px`;
    }

    function setFocusTypeValue(nextValue) {
        const normalizedValue = normalizeFocusLabelName(nextValue);
        const matchingLabel = savedFocusLabels.find(function (label) {
            return label.toLowerCase() === normalizedValue.toLowerCase();
        });
        const resolvedValue = matchingLabel || normalizedValue || savedFocusLabels[0] || "Focus";

        focusTypeInput.value = resolvedValue;
        saveFocusType.value = resolvedValue;
        focusTypePickerSelectedIndex = getSelectedFocusLabelIndexByName(resolvedValue);
        homeRoot.dataset.focusLabels = JSON.stringify(savedFocusLabels);
    }

    function refreshFocusTypePickerSelectionStyles() {
        const pickerItems = focusTypePickerList.querySelectorAll(".pl-focus-type-picker-item");

        if (pickerItems.length === 0) {
            focusTypePickerViewport.removeAttribute("aria-activedescendant");
            return;
        }

        const itemHeight = getFocusTypePickerItemHeight();
        const viewportCenter = focusTypePickerViewport.scrollTop + (focusTypePickerViewport.clientHeight / 2);
        const touchInteractionActive = isFocusTypePickerInteractionActive() && focusTypePickerPointerState?.pointerType === "touch";
        let activeItemId = "";

        pickerItems.forEach(function (item, index) {
            const itemCenter = item.offsetTop + (item.offsetHeight / 2);
            const distance = Math.abs(itemCenter - viewportCenter);
            const normalizedDistance = Math.min(1, distance / Math.max(itemHeight * 1.15, 1));
            const scale = touchInteractionActive
                ? 1.18 - (normalizedDistance * 0.72)
                : 1 - (normalizedDistance * 0.2);
            const opacity = 1 - (normalizedDistance * 0.82);
            const isSelected = !touchInteractionActive && index === focusTypePickerSelectedIndex;

            item.classList.toggle("pl-focus-type-picker-item-selected", isSelected);
            item.setAttribute("aria-selected", isSelected ? "true" : "false");
            item.style.transform = `scale(${Math.max(0.8, scale).toFixed(3)})`;
            item.style.opacity = `${Math.max(0.16, opacity).toFixed(3)}`;

            if (isSelected) {
                activeItemId = item.id;
            }
        });

        if (activeItemId) {
            focusTypePickerViewport.setAttribute("aria-activedescendant", activeItemId);
        }
        else {
            focusTypePickerViewport.removeAttribute("aria-activedescendant");
        }
    }

    function scrollFocusTypePickerToIndex(index, behavior = "auto") {
        if (focusTypeField.hidden || focusTypePickerViewport.clientHeight <= 0) {
            return;
        }

        syncFocusTypePickerPadding();

        const targetIndex = clampFocusTypePickerIndex(index);
        const top = getFocusTypePickerItemHeight() * targetIndex;

        focusTypePickerViewport.scrollTo({
            top,
            behavior
        });
    }

    function getClampedFocusTypePickerScrollTop() {
        const maxScrollTop = Math.max(
            0,
            focusTypePickerViewport.scrollHeight - focusTypePickerViewport.clientHeight);

        return Math.max(0, Math.min(maxScrollTop, focusTypePickerViewport.scrollTop));
    }

    function snapFocusTypePickerToNearest(behavior = "smooth") {
        const targetIndex = clampFocusTypePickerIndex(
            Math.round(getClampedFocusTypePickerScrollTop() / Math.max(getFocusTypePickerItemHeight(), 1)));

        setFocusTypeValue(savedFocusLabels[targetIndex] || savedFocusLabels[0] || "Focus");
        scrollFocusTypePickerToIndex(targetIndex, behavior);
        refreshFocusTypePickerSelectionStyles();
    }

    function isFocusTypePickerInteractionActive() {
        return !!focusTypePickerPointerState;
    }

    function scheduleFocusTypePickerSnap(delayMs = 140) {
        if (focusTypePickerScrollSnapTimeoutId) {
            clearTimeout(focusTypePickerScrollSnapTimeoutId);
        }

        focusTypePickerScrollSnapTimeoutId = window.setTimeout(function () {
            focusTypePickerScrollSnapTimeoutId = 0;

            if (isFocusTypePickerInteractionActive()) {
                return;
            }

            const currentScrollTop = focusTypePickerViewport.scrollTop;
            const clampedScrollTop = getClampedFocusTypePickerScrollTop();
            const isOutOfBounds = Math.abs(currentScrollTop - clampedScrollTop) > 0.5;

            if (isOutOfBounds && focusTypePickerSettleAttemptCount < 8) {
                focusTypePickerSettleAttemptCount += 1;
                focusTypePickerViewport.scrollTo({
                    top: clampedScrollTop,
                    behavior: "smooth"
                });
                scheduleFocusTypePickerSnap(90);
                return;
            }

            focusTypePickerSettleAttemptCount = 0;
            snapFocusTypePickerToNearest("smooth");
        }, delayMs);
    }

    function handleFocusTypePickerScroll() {
        if (focusTypePickerScrollSyncFrameId) {
            cancelAnimationFrame(focusTypePickerScrollSyncFrameId);
        }

        focusTypePickerScrollSyncFrameId = requestAnimationFrame(function () {
            focusTypePickerScrollSyncFrameId = 0;

            const touchInteractionActive = isFocusTypePickerInteractionActive() && focusTypePickerPointerState?.pointerType === "touch";

            if (!touchInteractionActive) {
                const targetIndex = clampFocusTypePickerIndex(
                    Math.round(focusTypePickerViewport.scrollTop / Math.max(getFocusTypePickerItemHeight(), 1)));

                setFocusTypeValue(savedFocusLabels[targetIndex] || savedFocusLabels[0] || "Focus");
            }

            refreshFocusTypePickerSelectionStyles();
        });

        if (isFocusTypePickerInteractionActive()) {
            return;
        }

        if (Date.now() - focusTypePickerLastTouchInteractionAt < 260) {
            scheduleFocusTypePickerSnap(260);
            return;
        }

        scheduleFocusTypePickerSnap(180);
    }

    function handleFocusTypePickerPointerDown(event) {
        if (focusTypePickerViewport.getAttribute("aria-disabled") === "true") {
            return;
        }

        if (event.pointerType === "touch") {
            focusTypePickerLastTouchInteractionAt = Date.now();
            focusTypePickerViewport.classList.add("pl-focus-type-picker-viewport-touch-active");
        }

        focusTypePickerPointerState = {
            pointerId: event.pointerId,
            pointerType: event.pointerType || "mouse",
            startClientY: event.clientY,
            startScrollTop: focusTypePickerViewport.scrollTop,
            moved: false
        };

        if (typeof focusTypePickerViewport.setPointerCapture === "function") {
            focusTypePickerViewport.setPointerCapture(event.pointerId);
        }
    }

    function handleFocusTypePickerPointerMove(event) {
        if (!focusTypePickerPointerState || event.pointerId !== focusTypePickerPointerState.pointerId) {
            return;
        }

        const deltaY = event.clientY - focusTypePickerPointerState.startClientY;
        const maxScrollTop = Math.max(
            0,
            focusTypePickerViewport.scrollHeight - focusTypePickerViewport.clientHeight);
        const desiredScrollTop = focusTypePickerPointerState.startScrollTop - deltaY;

        if (Math.abs(deltaY) > 3) {
            focusTypePickerPointerState.moved = true;
        }

        if (!focusTypePickerPointerState.moved) {
            return;
        }

        if (focusTypePickerPointerState.pointerType === "touch") {
            focusTypePickerLastTouchInteractionAt = Date.now();
            event.preventDefault();
            focusTypePickerViewport.scrollTop = Math.max(0, Math.min(maxScrollTop, desiredScrollTop));
            handleFocusTypePickerScroll();
            return;
        }

        event.preventDefault();
        focusTypePickerViewport.scrollTop = desiredScrollTop;
        handleFocusTypePickerScroll();
    }

    function handleFocusTypePickerPointerUp(event) {
        if (!focusTypePickerPointerState || event.pointerId !== focusTypePickerPointerState.pointerId) {
            return;
        }

        if (focusTypePickerPointerState.pointerType === "touch") {
            focusTypePickerViewport.classList.remove("pl-focus-type-picker-viewport-touch-active");
        }

        if (typeof focusTypePickerViewport.releasePointerCapture === "function") {
            try {
                focusTypePickerViewport.releasePointerCapture(event.pointerId);
            }
            catch {
            }
        }

        if (focusTypePickerScrollSnapTimeoutId) {
            clearTimeout(focusTypePickerScrollSnapTimeoutId);
            focusTypePickerScrollSnapTimeoutId = 0;
        }

        if (focusTypePickerPointerState.moved || focusTypePickerPointerState.pointerType === "touch") {
            focusTypePickerSuppressClickUntil = Date.now() + 180;
            focusTypePickerSettleAttemptCount = 0;
            if (focusTypePickerPointerState.pointerType === "touch") {
                focusTypePickerLastTouchInteractionAt = Date.now();
            }

            scheduleFocusTypePickerSnap(focusTypePickerPointerState.pointerType === "touch" ? 320 : 120);
        }

        focusTypePickerPointerState = null;
    }

    function handleFocusTypePickerWheel(event) {
        if (focusTypePickerViewport.getAttribute("aria-disabled") === "true") {
            return;
        }

        event.preventDefault();
        focusTypePickerViewport.scrollTop += event.deltaY * 0.18;
        handleFocusTypePickerScroll();
    }

    function renderFocusTypePicker() {
        focusTypePickerList.innerHTML = "";

        savedFocusLabels.forEach(function (label, index) {
            const pickerItem = document.createElement("button");
            pickerItem.type = "button";
            pickerItem.className = "pl-focus-type-picker-item";
            pickerItem.id = `pl-focus-type-option-${index}`;
            pickerItem.setAttribute("role", "option");
            pickerItem.textContent = label;

            pickerItem.addEventListener("click", function () {
                if (focusTypePickerViewport.getAttribute("aria-disabled") === "true") {
                    return;
                }

                if (Date.now() < focusTypePickerSuppressClickUntil) {
                    return;
                }

                setFocusTypeValue(label);
                scrollFocusTypePickerToIndex(index, "smooth");
                refreshFocusTypePickerSelectionStyles();
            });

            focusTypePickerList.appendChild(pickerItem);
        });

        setFocusTypeValue(focusTypeInput.value || savedFocusLabels[0] || "Focus");

        requestAnimationFrame(function () {
            syncFocusTypePickerPadding();
            scrollFocusTypePickerToIndex(focusTypePickerSelectedIndex, "auto");
            refreshFocusTypePickerSelectionStyles();
        });
    }

    function setFocusTypePickerDisabledState(isDisabled) {
        const resolvedDisabled = isDisabled || layoutEditorEnabled;

        focusTypePicker.classList.toggle("pl-focus-type-picker-disabled", resolvedDisabled);
        focusTypePickerViewport.setAttribute("aria-disabled", resolvedDisabled ? "true" : "false");
        focusTypePickerViewport.tabIndex = resolvedDisabled ? -1 : 0;
    }

    function createFocusLabelDraft(name, originalName = null, isNew = false) {
        return {
            draftId: `focus-label-${nextFocusLabelDraftId++}`,
            name: normalizeFocusLabelName(name),
            originalName: normalizeFocusLabelName(originalName ?? name),
            isNew: !!isNew,
            isDeleted: false
        };
    }

    function getActiveFocusLabelDrafts() {
        return draftFocusLabels.filter(function (item) {
            return !item.isDeleted;
        });
    }

    function getSelectedFocusLabelDraft() {
        return draftFocusLabels.find(function (item) {
            return item.draftId === selectedFocusLabelDraftId && !item.isDeleted;
        }) || null;
    }

    function rebuildFocusLabelDraftOrder(nextActiveDrafts) {
        const deletedDrafts = draftFocusLabels.filter(function (item) {
            return item.isDeleted;
        });
        draftFocusLabels = [...nextActiveDrafts, ...deletedDrafts];
    }

    function getFocusManageTileCount() {
        return Math.max(
            focusManageMinimumTileCount,
            Math.ceil(Math.max(getActiveFocusLabelDrafts().length, focusManageMinimumTileCount) / focusManageGridColumnCount) * focusManageGridColumnCount);
    }

    function hasRemovedFocusLabelDrafts() {
        return draftFocusLabels.some(function (item) {
            return !item.isNew && item.isDeleted;
        });
    }

    function getFocusManageRemovalReminderDismissed() {
        try {
            return window.localStorage.getItem(focusManageRemovalReminderStorageKey) === "1";
        }
        catch {
            return false;
        }
    }

    function setFocusManageRemovalReminderDismissed(isDismissed) {
        try {
            window.localStorage.setItem(focusManageRemovalReminderStorageKey, isDismissed ? "1" : "0");
        }
        catch {
        }
    }

    function setFocusManageStatus(message, tone = "neutral") {
        focusManageStatus.textContent = message;

        if (tone === "neutral") {
            focusManageStatus.removeAttribute("data-tone");
            return;
        }

        focusManageStatus.setAttribute("data-tone", tone);
    }

    function updateFocusManageConfirmMessage() {
        focusManageConfirmTitle.textContent = "Save changes?";
        focusManageConfirmMessage.textContent = "Removed labels leave archive data untouched and can be added back at any time by typing the same label again.";
    }

    function syncFocusManagePrimaryActionUi() {
        const selectedDraft = getSelectedFocusLabelDraft();
        setButtonLabel(focusManageAddButton, selectedDraft ? "Rename" : "Add");
        setButtonLabel(focusManageDeleteButton, "Remove");
        setButtonLabel(focusManageOkButton, "Save");
        setButtonLabel(focusManageBackButton, "Cancel");
        setButtonLabel(focusManageConfirmDeleteButton, "Save");
        setButtonLabel(focusManageConfirmCancelButton, "Cancel");

        if (!selectedDraft && !document.activeElement?.isSameNode(focusManageInput)) {
            focusManageInput.value = "";
        }
    }

    function syncFocusManageButtons() {
        const selectedDraft = getSelectedFocusLabelDraft();
        const saveConfirmOpen = focusManageSaveConfirmOpen;
        const interactionLocked = layoutEditorEnabled || isFocusManageSaving || saveConfirmOpen;
        const hasSelection = !!selectedDraft;

        focusManageInput.disabled = interactionLocked;
        focusManageAddButton.disabled = interactionLocked;
        focusManageDeleteButton.disabled = interactionLocked || !hasSelection;
        focusManageBackButton.disabled = interactionLocked;
        focusManageOkButton.disabled = interactionLocked;
        focusManageConfirmDeleteButton.disabled = layoutEditorEnabled || isFocusManageSaving;
        focusManageConfirmCancelButton.disabled = layoutEditorEnabled || isFocusManageSaving;
        focusManageConfirmDismissInput.disabled = layoutEditorEnabled || isFocusManageSaving;
        focusManagePanel.classList.toggle("pl-focus-manage-panel-layout-locked", layoutEditorEnabled);
        syncFocusManagePrimaryActionUi();
    }

    function getFocusManageScrollbarMetrics() {
        if (focusManageListShell.hidden || focusManageListViewport.hidden || focusManageList.hidden) {
            return null;
        }

        const scrollHeight = focusManageListViewport.scrollHeight;
        const clientHeight = focusManageListViewport.clientHeight;

        if (scrollHeight <= clientHeight + 1 || clientHeight <= 0) {
            return null;
        }

        const shellHeight = focusManageListShell.clientHeight;
        const trackInset = 2;
        const trackHeight = Math.max(0, shellHeight - (trackInset * 2));
        const thumbHeight = Math.max(24, Math.round(trackHeight * (clientHeight / scrollHeight)));
        const maxThumbTravel = Math.max(0, trackHeight - thumbHeight);
        const maxScrollTop = Math.max(1, scrollHeight - clientHeight);

        return {
            trackInset: trackInset,
            thumbHeight: thumbHeight,
            maxThumbTravel: maxThumbTravel,
            maxScrollTop: maxScrollTop
        };
    }

    function updateFocusManageScrollbarVisual() {
        const metrics = getFocusManageScrollbarMetrics();

        if (!metrics) {
            focusManageListScrollbarVisual.hidden = true;
            return;
        }

        const scrollRatio = focusManageListViewport.scrollTop / metrics.maxScrollTop;
        const thumbTop = metrics.trackInset + Math.round(metrics.maxThumbTravel * scrollRatio);

        focusManageListScrollbarVisual.hidden = false;
        focusManageListScrollbarVisual.style.top = `${thumbTop}px`;
        focusManageListScrollbarVisual.style.height = `${metrics.thumbHeight}px`;
    }

    function handleFocusManageScrollbarPointerDown(event) {
        const metrics = getFocusManageScrollbarMetrics();

        if (!metrics || layoutEditorEnabled || isFocusManageSaving) {
            return;
        }

        event.preventDefault();
        focusManageScrollbarDragState = {
            pointerId: event.pointerId,
            pointerOffsetY: event.clientY - focusManageListScrollbarVisual.getBoundingClientRect().top,
            metrics: metrics
        };
    }

    function handleFocusManageScrollbarPointerMove(event) {
        if (!focusManageScrollbarDragState || event.pointerId !== focusManageScrollbarDragState.pointerId) {
            return;
        }

        event.preventDefault();

        const shellRect = focusManageListShell.getBoundingClientRect();
        const desiredTop = event.clientY - shellRect.top - focusManageScrollbarDragState.pointerOffsetY;
        const clampedTop = Math.max(
            focusManageScrollbarDragState.metrics.trackInset,
            Math.min(
                focusManageScrollbarDragState.metrics.trackInset + focusManageScrollbarDragState.metrics.maxThumbTravel,
                desiredTop));
        const scrollRatio = focusManageScrollbarDragState.metrics.maxThumbTravel <= 0
            ? 0
            : (clampedTop - focusManageScrollbarDragState.metrics.trackInset) / focusManageScrollbarDragState.metrics.maxThumbTravel;

        focusManageListViewport.scrollTop = scrollRatio * focusManageScrollbarDragState.metrics.maxScrollTop;
        updateFocusManageScrollbarVisual();
    }

    function handleFocusManageScrollbarPointerUp(event) {
        if (!focusManageScrollbarDragState || event.pointerId !== focusManageScrollbarDragState.pointerId) {
            return;
        }

        focusManageScrollbarDragState = null;
    }

    function renderFocusManageList() {
        const activeDrafts = getActiveFocusLabelDrafts();
        focusManageList.innerHTML = "";

        if (activeDrafts.length === 0 && !layoutEditorEnabled) {
            const emptyState = document.createElement("div");
            emptyState.className = "pl-focus-manage-list-empty";
            emptyState.textContent = "No focus labels yet. Add one below to get started.";
            focusManageList.appendChild(emptyState);
            syncFocusManageButtons();
            requestAnimationFrame(updateFocusManageScrollbarVisual);
            return;
        }

        const tileCount = getFocusManageTileCount();

        for (let slotIndex = 0; slotIndex < tileCount; slotIndex += 1) {
            const item = activeDrafts[slotIndex] || null;
            const entryButton = document.createElement("button");
            entryButton.type = "button";
            entryButton.className = "pl-focus-manage-list-item";
            entryButton.setAttribute("role", "gridcell");
            entryButton.setAttribute("aria-selected", item && item.draftId === selectedFocusLabelDraftId ? "true" : "false");

            if (item) {
                entryButton.textContent = item.name;
                if (item.draftId === selectedFocusLabelDraftId) {
                    entryButton.classList.add("pl-focus-manage-list-item-selected");
                }
            }
            else {
                entryButton.classList.add("pl-focus-manage-list-item-empty");
                entryButton.textContent = "Empty";
            }

            entryButton.addEventListener("click", function () {
                if (layoutEditorEnabled || isFocusManageSaving || focusManageSaveConfirmOpen) {
                    return;
                }

                const selectedDraft = getSelectedFocusLabelDraft();

                if (!selectedDraft && !item) {
                    return;
                }

                if (!selectedDraft && item) {
                    selectedFocusLabelDraftId = item.draftId;
                    focusManageInput.value = item.name;
                    setFocusManageStatus(`Selected "${item.name}". Tap another tile to swap positions or edit it below.`, "neutral");
                    renderFocusManageList();
                    return;
                }

                if (selectedDraft && item && item.draftId === selectedDraft.draftId) {
                    selectedFocusLabelDraftId = "";
                    focusManageInput.value = "";
                    setFocusManageStatus("Selection cleared.", "neutral");
                    renderFocusManageList();
                    return;
                }

                const nextActiveDrafts = getActiveFocusLabelDrafts().slice();
                const selectedIndex = nextActiveDrafts.findIndex(function (draft) {
                    return draft.draftId === selectedDraft.draftId;
                });

                if (selectedIndex < 0) {
                    return;
                }

                if (!item) {
                    selectedFocusLabelDraftId = "";
                    focusManageInput.value = "";
                    setFocusManageStatus("Selection cleared.", "neutral");
                    renderFocusManageList();
                    return;
                }

                const targetIndex = nextActiveDrafts.findIndex(function (draft) {
                    return draft.draftId === item.draftId;
                });

                if (targetIndex < 0) {
                    return;
                }

                [nextActiveDrafts[selectedIndex], nextActiveDrafts[targetIndex]] = [nextActiveDrafts[targetIndex], nextActiveDrafts[selectedIndex]];
                rebuildFocusLabelDraftOrder(nextActiveDrafts);
                selectedFocusLabelDraftId = "";
                focusManageInput.value = "";
                setFocusManageStatus(`Swapped "${selectedDraft.name}" with "${item.name}".`, "success");
                renderFocusManageList();
            });

            focusManageList.appendChild(entryButton);
        }

        syncFocusManageButtons();
        requestAnimationFrame(updateFocusManageScrollbarVisual);
    }

    function beginFocusManageDraft() {
        draftFocusLabels = savedFocusLabels.map(function (label) {
            return createFocusLabelDraft(label);
        });
        focusManageSaveConfirmOpen = false;

        selectedFocusLabelDraftId = "";
        focusManageInput.value = "";
        focusManageConfirmDismissInput.checked = false;
        setFocusManageConfirmVisible(false);
        updateFocusManageConfirmMessage();
        setFocusManageStatus("Select a tile, then tap another tile to swap positions. Use the field below to add or rename.", "neutral");
        renderFocusManageList();
    }

    function closeFocusManageDraft() {
        draftFocusLabels = [];
        selectedFocusLabelDraftId = "";
        focusManageSaveConfirmOpen = false;
        setFocusManageConfirmVisible(false);
        focusManageConfirmDismissInput.checked = false;
        focusManageInput.value = "";
        updateFocusManageConfirmMessage();
        setFocusManageStatus("Select a tile, then tap another tile to swap positions.", "neutral");
        syncFocusManageButtons();
    }

    function findVisibleFocusLabelByName(name, excludeDraftId = "") {
        const normalizedName = normalizeFocusLabelName(name).toLowerCase();

        if (!normalizedName) {
            return null;
        }

        return getActiveFocusLabelDrafts().find(function (item) {
            return item.draftId !== excludeDraftId && item.name.toLowerCase() === normalizedName;
        }) || null;
    }

    function focusLabelNamesMatch(left, right) {
        return normalizeFocusLabelName(left).toLowerCase() === normalizeFocusLabelName(right).toLowerCase();
    }

    function findFocusLabelIndex(labels, targetName) {
        return labels.findIndex(function (label) {
            return focusLabelNamesMatch(label, targetName);
        });
    }

    function syncFocusTypeInputWithSavedLabels(preferredLabel = "") {
        const normalizedPreferred = normalizeFocusLabelName(preferredLabel);
        const matchingPreferred = savedFocusLabels.find(function (label) {
            return label.toLowerCase() === normalizedPreferred.toLowerCase();
        });
        const matchingCurrent = savedFocusLabels.find(function (label) {
            return label.toLowerCase() === normalizeFocusLabelName(focusTypeInput.value || "").toLowerCase();
        });
        const nextValue = matchingPreferred || matchingCurrent || savedFocusLabels[0] || "Focus";

        setFocusTypeValue(nextValue);
        renderFocusTypePicker();
    }

    async function fetchFocusLabels() {
        const response = await fetch(focusLabelsHandlerUrl, { cache: "no-store" });

        if (!response.ok) {
            throw new Error("Unable to load focus labels.");
        }

        const payload = await response.json();
        if (!Array.isArray(payload)) {
            throw new Error("Unexpected focus labels payload.");
        }

        return payload
            .map(function (item) {
                return normalizeFocusLabelName(item);
            })
            .filter(Boolean);
    }

    async function postFocusLabelMutation(action, name = "", nextName = "") {
        const headers = {
            "Content-Type": "application/json"
        };
        const requestVerificationToken = requestVerificationTokenInput?.value;

        if (requestVerificationToken) {
            headers.RequestVerificationToken = requestVerificationToken;
        }

        const response = await fetch(focusLabelsHandlerUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({
                action,
                name,
                nextName
            })
        });

        if (!response.ok) {
            throw new Error(`Unable to ${action} focus labels.`);
        }

        const payload = await response.json();
        if (!payload?.ok || !Array.isArray(payload.labels)) {
            throw new Error(`Focus label ${action} failed.`);
        }

        return payload.labels
            .map(function (item) {
                return normalizeFocusLabelName(item);
            })
            .filter(Boolean);
    }

    function handleFocusManagePrimaryAction() {
        const selectedDraft = getSelectedFocusLabelDraft();
        const nextName = normalizeFocusLabelName(focusManageInput.value);

        if (!nextName) {
            setFocusManageStatus("Enter a focus type name first.", "error");
            focusManageInput.focus();
            return;
        }

        if (!selectedDraft) {
            if (findVisibleFocusLabelByName(nextName)) {
                setFocusManageStatus(`"${nextName}" is already in the list.`, "error");
                focusManageInput.focus();
                return;
            }

            const draft = createFocusLabelDraft(nextName, nextName, true);
            draftFocusLabels.push(draft);
            selectedFocusLabelDraftId = draft.draftId;
            focusManageInput.value = draft.name;
            setFocusManageStatus(`Added "${draft.name}" to the draft grid.`, "success");
            renderFocusManageList();
            return;
        }

        if (selectedDraft.name.toLowerCase() === nextName.toLowerCase()) {
            setFocusManageStatus("That focus type already has this name.", "neutral");
            return;
        }

        if (findVisibleFocusLabelByName(nextName, selectedDraft.draftId)) {
            setFocusManageStatus(`"${nextName}" is already in the list.`, "error");
            focusManageInput.focus();
            return;
        }

        const previousName = selectedDraft.name;
        selectedDraft.name = nextName;
        focusManageInput.value = nextName;
        setFocusManageStatus(`Renamed "${previousName}" to "${nextName}" in the draft grid.`, "success");
        renderFocusManageList();
    }

    function removeSelectedFocusLabel() {
        const selectedDraft = getSelectedFocusLabelDraft();

        if (!selectedDraft) {
            setFocusManageStatus("Select a focus type tile first.", "error");
            return;
        }

        if (selectedDraft.isNew) {
            draftFocusLabels = draftFocusLabels.filter(function (item) {
                return item.draftId !== selectedDraft.draftId;
            });
        }
        else {
            selectedDraft.isDeleted = true;
        }

        selectedFocusLabelDraftId = "";
        focusManageInput.value = "";
        setFocusManageStatus(`Removed "${selectedDraft.name}" from the draft grid. Save to apply the change.`, "success");
        renderFocusManageList();
    }

    function openFocusManageSaveConfirm() {
        focusManageSaveConfirmOpen = true;
        focusManageConfirmDismissInput.checked = false;
        updateFocusManageConfirmMessage();
        setFocusManageConfirmVisible(true);
        syncFocusManageButtons();
    }

    function closeFocusManageSaveConfirm() {
        focusManageSaveConfirmOpen = false;
        setFocusManageConfirmVisible(false);
        syncFocusManageButtons();
    }

    async function persistFocusManageDraft() {
        const finalLabels = getActiveFocusLabelDrafts().map(function (item) {
            return item.name;
        });
        const removedDrafts = draftFocusLabels.filter(function (item) {
            return !item.isNew && item.isDeleted;
        });
        const renamedDrafts = draftFocusLabels.filter(function (item) {
            return !item.isNew && !item.isDeleted && !focusLabelNamesMatch(item.originalName, item.name);
        });
        const addedDrafts = draftFocusLabels.filter(function (item) {
            return item.isNew && !item.isDeleted;
        });

        let serverLabels = savedFocusLabels.slice();

        for (const draft of removedDrafts) {
            serverLabels = await postFocusLabelMutation("delete", draft.originalName);
        }

        for (const draft of renamedDrafts) {
            serverLabels = await postFocusLabelMutation("rename", draft.originalName, draft.name);
        }

        for (const draft of addedDrafts) {
            serverLabels = await postFocusLabelMutation("add", draft.name);
        }

        for (let targetIndex = 0; targetIndex < finalLabels.length; targetIndex += 1) {
            const targetLabel = finalLabels[targetIndex];
            let currentIndex = findFocusLabelIndex(serverLabels, targetLabel);

            while (currentIndex > targetIndex) {
                serverLabels = await postFocusLabelMutation("move-up", targetLabel);
                currentIndex = findFocusLabelIndex(serverLabels, targetLabel);
            }
        }

        return fetchFocusLabels();
    }

    async function commitFocusManageChanges() {
        if (layoutEditorEnabled || isFocusManageSaving) {
            return;
        }

        const preferredLabel = getSelectedFocusLabelDraft()?.name || focusTypeInput.value || "";

        isFocusManageSaving = true;
        setFocusManageStatus("Saving focus labels...", "neutral");
        syncFocusManageButtons();

        try {
            savedFocusLabels = await persistFocusManageDraft();
            syncFocusTypeInputWithSavedLabels(preferredLabel);
            closeFocusManageDraft();
            setFocusManageStatus("Focus labels saved.", "success");
            returnToFocusSetup();
        }
        catch {
            setFocusManageStatus("Could not save focus labels right now.", "error");
        }
        finally {
            isFocusManageSaving = false;
            syncFocusManageButtons();
        }
    }

    async function saveFocusManageChanges() {
        if (layoutEditorEnabled || isFocusManageSaving) {
            return;
        }

        if (hasRemovedFocusLabelDrafts() && !getFocusManageRemovalReminderDismissed()) {
            openFocusManageSaveConfirm();
            return;
        }

        await commitFocusManageChanges();
    }

    function selectCountdownMode() {
        if (isRunning || isPaused || isSubmitting) {
            return;
        }

        selectedTimerMode = "countdown";
        syncTimerModeUi();
        setSetupChildrenVisible(!setupPanel.hidden);
        applySceneMembershipVisibility();
        updateDurationReadout();
        refreshLayoutUi();
    }

    function selectCountUpMode() {
        if (isRunning || isPaused || isSubmitting) {
            return;
        }

        selectedTimerMode = "countup";
        syncTimerModeUi();
        setSetupChildrenVisible(!setupPanel.hidden);
        applySceneMembershipVisibility();
        updateDurationReadout();
        refreshLayoutUi();
    }

    function startFocusSession() {
        if (isSubmitting) {
            return;
        }

        plannedSeconds = isCountUpModeSelected()
            ? 7200
            : Math.max(300, Math.min(7200, parseInt(durationSlider.value || "5", 10) * 60));
        nextCountUpCheckpointSeconds = 7200;
        startedAtMs = Date.now();
        pausedElapsedSeconds = 0;
        isRunning = true;
        isPaused = false;
        isSubmitting = false;
        completionTonePlayed = false;
        activeConfirmContext = "stop";

        setupPanel.classList.add("pl-setup-panel-locked");
        setSetupChildrenLocked(true);
        setRunVisible(true);
        countdownModeButton.hidden = true;
        countUpModeButton.hidden = true;
        startFocusButton.hidden = true;
        closeFocusButton.hidden = true;

        setButtonLabel(pauseButton, "Pause");
        setButtonLabel(exitButton, "Cancel");
        currentVisibleSceneKey = "focus-running";
        currentVisibleSceneStateKey = "base";
        applySceneMembershipVisibility();

        updateUi();
    }

    function togglePauseSession() {
        if ((!isRunning && !isPaused) || isSubmitting || !confirmPanel.hidden) {
            return;
        }

        if (!isPaused) {
            pausedElapsedSeconds = getElapsedSeconds();
            isPaused = true;
            updateUi();
            return;
        }

        startedAtMs = Date.now() - (pausedElapsedSeconds * 1000);
        isPaused = false;
        updateUi();
    }

    function stopFocusSession() {
        if (!isRunning || isSubmitting) {
            return;
        }

        const elapsedSeconds = getElapsedSeconds();

        if (elapsedSeconds < stopThresholdSeconds) {
            returnToHome();
            return;
        }

        openConfirmPanel("stop", elapsedSeconds);
    }

    function confirmKeepGoing() {
        if (isSubmitting) {
            return;
        }

        setConfirmVisible(false);

        if (activeConfirmContext === "countup-checkpoint" && isPaused && !isRunning) {
            nextCountUpCheckpointSeconds += 7200;
            startedAtMs = Date.now() - (pausedElapsedSeconds * 1000);
            isPaused = false;
            isRunning = true;
            activeConfirmContext = "stop";
            currentVisibleSceneKey = "focus-running";
            currentVisibleSceneStateKey = "base";
            applySceneMembershipVisibility();
            updateUi();
        }
    }

    function confirmStopSession() {
        if (isSubmitting) {
            return;
        }

        submitSave(activeConfirmContext === "countup-checkpoint" ? "break" : "stop");
    }

    function closeRewardSummary() {
        window.location.href = "/Index";
    }

    function runAssetBehaviorRole(assetKey) {
        switch (getEffectiveBehaviorRole(assetKey)) {
            case "open-focus-setup":
                openFocusSetup();
                return;
            case "open-focus-manage":
                openFocusManage();
                return;
            case "return-home":
                returnToHome();
                return;
            case "return-focus-setup":
                returnToFocusSetup();
                return;
            case "save-focus-manage":
                saveFocusManageChanges();
                return;
            case "select-countdown-mode":
                selectCountdownMode();
                return;
            case "select-countup-mode":
                selectCountUpMode();
                return;
            case "start-focus-session":
                startFocusSession();
                return;
            case "toggle-pause-session":
                togglePauseSession();
                return;
            case "stop-focus-session":
                stopFocusSession();
                return;
            case "confirm-keep-going":
                confirmKeepGoing();
                return;
            case "confirm-stop-session":
                confirmStopSession();
                return;
            case "close-reward":
                closeRewardSummary();
                return;
            default:
                return;
        }
    }

    function resetRunState() {
        isRunning = false;
        isPaused = false;
        isSubmitting = false;
        completionTonePlayed = false;
        pausedElapsedSeconds = 0;
        startedAtMs = 0;
        nextCountUpCheckpointSeconds = 7200;
        activeConfirmContext = "stop";

        setupPanel.classList.remove("pl-setup-panel-locked");
        setSetupChildrenLocked(false);
        setButtonLabel(pauseButton, "Pause");
        setButtonLabel(exitButton, "Cancel");
        updateDurationReadout();
    }

    function getElapsedSeconds() {
        if (!isRunning && !isPaused) {
            return 0;
        }

        if (isPaused) {
            return Math.max(0, pausedElapsedSeconds);
        }

        const liveElapsed = Math.floor((Date.now() - startedAtMs) / 1000);
        return Math.max(0, liveElapsed);
    }

    function setButtonsDisabled(isDisabled) {
        countdownModeButton.disabled = isDisabled || setupPanel.classList.contains("pl-setup-panel-locked");
        countUpModeButton.disabled = isDisabled || setupPanel.classList.contains("pl-setup-panel-locked");
        startFocusButton.disabled = isDisabled;
        manageButton.disabled = isDisabled;
        pauseButton.disabled = isDisabled;
        exitButton.disabled = isDisabled;
        confirmKeepGoingButton.disabled = isDisabled;
        confirmStopButton.disabled = isDisabled;
        rewardCloseButton.disabled = isDisabled;
        focusTypeInput.disabled = isDisabled || setupPanel.classList.contains("pl-setup-panel-locked");
        setFocusTypePickerDisabledState(isDisabled || setupPanel.classList.contains("pl-setup-panel-locked"));
        durationSlider.disabled = isDisabled || setupPanel.classList.contains("pl-setup-panel-locked") || isCountUpModeSelected();
        syncFocusManageButtons();
    }

    function openConfirmPanel(context, elapsedSeconds) {
        activeConfirmContext = context;
        setConfirmVisible(true);
        currentVisibleSceneKey = "stop-confirm";
        currentVisibleSceneStateKey = "base";
        applySceneMembershipVisibility();
        updateConfirmPanel(elapsedSeconds);
    }

    function updateConfirmPanel(elapsedSeconds) {
        const countUpSelected = isCountUpModeSelected();
        const countUpCheckpoint = activeConfirmContext === "countup-checkpoint";
        const countUpEligibleForCompletion = countUpSelected && elapsedSeconds >= 300;
        const completedPreviewSeconds = countUpCheckpoint
            ? elapsedSeconds
            : (countUpSelected ? elapsedSeconds : plannedSeconds);
        const completePreview = calculateRewardPreview(completedPreviewSeconds, true);
        const currentPreview = calculateRewardPreview(elapsedSeconds, countUpEligibleForCompletion);

        confirmCurrentTime.textContent = formatClock(elapsedSeconds);
        confirmTimerStatus.textContent = countUpCheckpoint
            ? "Paused at checkpoint"
            : (isPaused ? "Paused" : (countUpSelected ? "Still counting up" : "Still counting down"));
        confirmEyebrow.textContent = countUpCheckpoint ? "Count Up Checkpoint" : "Stop Focusing";
        confirmTitle.textContent = countUpCheckpoint ? "Continue tracking?" : "Are you sure?";
        confirmSubtitle.innerHTML = countUpCheckpoint
            ? "The stopwatch paused automatically at the 2-hour checkpoint to make sure it was not left running by accident."
            : (countUpEligibleForCompletion
                ? "This will save the current stopwatch session as <strong>completed</strong>."
                : (countUpSelected
                    ? "Under 5 minutes will still save, but the stopwatch session will be marked <strong>incomplete</strong>."
                    : "Session will be marked <strong>incomplete</strong>."));
        confirmCompleteLabel.textContent = countUpCheckpoint
            ? "Take a break"
            : (countUpSelected ? "Stop now" : "If complete");
        confirmCurrentLabel.textContent = countUpCheckpoint
            ? "Keep going"
            : (countUpSelected ? "Current result" : "Current");
        confirmCompleteXp.textContent = String(completePreview.xp);
        confirmCompleteCoins.textContent = String(completePreview.coins);
        confirmCurrentXp.textContent = String(currentPreview.xp);
        confirmCurrentCoins.textContent = String(currentPreview.coins);
        setButtonLabel(confirmKeepGoingButton, "Keep Going");
        setButtonLabel(confirmStopButton, countUpCheckpoint ? "Take a Break" : "Stop Focusing");
    }

    function hydrateRewardPanelFromDataset() {
        rewardStatusText.textContent = String(homeRoot.dataset.rewardCompleted || "").toLowerCase() === "true"
            ? "Completed"
            : "Incomplete";

        rewardFocusType.textContent = homeRoot.dataset.rewardFocusType || "Focus";
        rewardDurationText.textContent = homeRoot.dataset.rewardDuration || "00:00:00";
        rewardXp.textContent = homeRoot.dataset.rewardXp || "0";
        rewardCoins.textContent = homeRoot.dataset.rewardCoins || "0";
    }

    function playCompletionTone() {
        if (completionTonePlayed) {
            return;
        }

        completionTonePlayed = true;

        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) {
                return;
            }

            const audioContext = new AudioContextClass();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = 880;

            gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.35);

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.36);
        }
        catch {
        }
    }

    function submitSave(mode) {
        if (isSubmitting) {
            return;
        }

        const elapsedSeconds = mode === "complete" && !isCountUpModeSelected()
            ? plannedSeconds
            : getElapsedSeconds();
        if (elapsedSeconds <= 0) {
            return;
        }

        isSubmitting = true;
        saveFocusType.value = (focusTypeInput.value || "Focus").trim() || "Focus";
        savePlannedSeconds.value = String(Math.max(plannedSeconds, elapsedSeconds));
        saveElapsedSeconds.value = String(elapsedSeconds);
        saveTimerMode.value = selectedTimerMode;
        saveMode.value = mode;
        setButtonsDisabled(true);
        saveForm.submit();
    }

    function updateExitButton(elapsedSeconds) {
        if (elapsedSeconds >= stopThresholdSeconds) {
            setButtonLabel(exitButton, "Stop Focusing");
        }
        else {
            setButtonLabel(exitButton, "Cancel");
        }
    }

    function updateUi() {
        if (!isRunning) {
            return;
        }

        const elapsedSeconds = getElapsedSeconds();
        const remainingSeconds = Math.max(0, plannedSeconds - elapsedSeconds);
        durationText.textContent = isCountUpModeSelected()
            ? formatClock(elapsedSeconds)
            : formatDurationLabel(remainingSeconds);

        updateExitButton(elapsedSeconds);

        if (!confirmPanel.hidden) {
            updateConfirmPanel(elapsedSeconds);
        }

        if (isPaused) {
            setButtonLabel(pauseButton, "Keep Going?");
        }
        else {
            setButtonLabel(pauseButton, "Pause");
        }

        if (isCountUpModeSelected()) {
            if (elapsedSeconds >= nextCountUpCheckpointSeconds && confirmPanel.hidden && !isSubmitting) {
                pausedElapsedSeconds = elapsedSeconds;
                isRunning = false;
                isPaused = true;
                openConfirmPanel("countup-checkpoint", elapsedSeconds);
            }
            return;
        }

        if (remainingSeconds <= 0 && !isSubmitting) {
            playCompletionTone();
            submitSave("complete");
        }
    }
    //#endregion SEGMENT J2 - Session Runtime And Rewards

    //#region SEGMENT K1 - Event Wiring
    homeFocusButton.addEventListener("click", function () {
        if (layoutEditorEnabled && getSelectedAssetKey() === "home-focus") {
            return;
        }

        runAssetBehaviorRole("home-focus");
    });

    closeFocusButton.addEventListener("click", function () {
        if (layoutEditorEnabled && getSelectedAssetKey() === "back") {
            return;
        }

        runAssetBehaviorRole("back");
    });

    manageButton.addEventListener("click", function () {
        if (layoutEditorEnabled && getSelectedAssetKey() === "manage-button") {
            return;
        }

        runAssetBehaviorRole("manage-button");
    });

    durationSlider.addEventListener("input", function () {
        updateDurationReadout();
    });

    focusTypePickerViewport.addEventListener("scroll", handleFocusTypePickerScroll, { passive: true });
    focusTypePickerViewport.addEventListener("pointerdown", handleFocusTypePickerPointerDown);
    focusTypePickerViewport.addEventListener("pointermove", handleFocusTypePickerPointerMove);
    focusTypePickerViewport.addEventListener("pointerup", handleFocusTypePickerPointerUp);
    focusTypePickerViewport.addEventListener("pointercancel", handleFocusTypePickerPointerUp);
    focusTypePickerViewport.addEventListener("wheel", handleFocusTypePickerWheel, { passive: false });

    focusTypePickerViewport.addEventListener("keydown", function (event) {
        if (focusTypePickerViewport.getAttribute("aria-disabled") === "true") {
            return;
        }

        let nextIndex = focusTypePickerSelectedIndex;

        switch (event.key) {
            case "ArrowUp":
                nextIndex -= 1;
                break;
            case "ArrowDown":
                nextIndex += 1;
                break;
            case "Home":
                nextIndex = 0;
                break;
            case "End":
                nextIndex = savedFocusLabels.length - 1;
                break;
            case "PageUp":
                nextIndex -= 3;
                break;
            case "PageDown":
                nextIndex += 3;
                break;
            default:
                return;
        }

        event.preventDefault();
        nextIndex = clampFocusTypePickerIndex(nextIndex);
        setFocusTypeValue(savedFocusLabels[nextIndex] || savedFocusLabels[0] || "Focus");
        scrollFocusTypePickerToIndex(nextIndex, "smooth");
        refreshFocusTypePickerSelectionStyles();
    });

    countdownModeButton.addEventListener("click", function () {
        if (isRunning || isPaused || isSubmitting || (layoutEditorEnabled && getSelectedAssetKey() === "countdown-mode")) {
            return;
        }

        runAssetBehaviorRole("countdown-mode");
    });

    countUpModeButton.addEventListener("click", function () {
        if (isRunning || isPaused || isSubmitting || (layoutEditorEnabled && getSelectedAssetKey() === "countup-mode")) {
            return;
        }

        runAssetBehaviorRole("countup-mode");
    });

    startFocusButton.addEventListener("click", function () {
        if (isSubmitting || (layoutEditorEnabled && getSelectedAssetKey() === "start")) {
            return;
        }

        runAssetBehaviorRole("start");
    });

    pauseButton.addEventListener("click", function () {
        if ((!isRunning && !isPaused) || isSubmitting || !confirmPanel.hidden || (layoutEditorEnabled && getSelectedAssetKey() === "pause")) {
            return;
        }

        runAssetBehaviorRole("pause");
    });

    exitButton.addEventListener("click", function () {
        if (!isRunning || isSubmitting || (layoutEditorEnabled && getSelectedAssetKey() === "exit")) {
            return;
        }

        runAssetBehaviorRole("exit");
    });

    focusManageAddButton.addEventListener("click", function () {
        if (layoutEditorEnabled || isFocusManageSaving) {
            return;
        }

        handleFocusManagePrimaryAction();
    });

    focusManageDeleteButton.addEventListener("click", function () {
        if (layoutEditorEnabled || isFocusManageSaving) {
            return;
        }

        removeSelectedFocusLabel();
    });

    focusManageBackButton.addEventListener("click", function () {
        if (layoutEditorEnabled && getSelectedAssetKey() === "focus-manage-back") {
            return;
        }

        runAssetBehaviorRole("focus-manage-back");
    });

    focusManageOkButton.addEventListener("click", function () {
        if (layoutEditorEnabled && getSelectedAssetKey() === "focus-manage-ok") {
            return;
        }

        runAssetBehaviorRole("focus-manage-ok");
    });

    focusManageConfirmDeleteButton.addEventListener("click", function () {
        if (layoutEditorEnabled || isFocusManageSaving) {
            return;
        }

        if (focusManageConfirmDismissInput.checked) {
            setFocusManageRemovalReminderDismissed(true);
        }

        void commitFocusManageChanges();
    });

    focusManageConfirmCancelButton.addEventListener("click", function () {
        if (layoutEditorEnabled || isFocusManageSaving) {
            return;
        }

        closeFocusManageSaveConfirm();
    });

    focusManageInput.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" || layoutEditorEnabled || isFocusManageSaving) {
            return;
        }

        event.preventDefault();

        handleFocusManagePrimaryAction();
    });

    focusManageListViewport.addEventListener("scroll", function () {
        updateFocusManageScrollbarVisual();
    });

    focusManageListScrollbarVisual.addEventListener("pointerdown", handleFocusManageScrollbarPointerDown);

    confirmKeepGoingButton.addEventListener("click", function () {
        if (isSubmitting || (layoutEditorEnabled && getSelectedAssetKey() === "keep-going")) {
            return;
        }

        runAssetBehaviorRole("keep-going");
    });

    confirmStopButton.addEventListener("click", function () {
        if (isSubmitting || (layoutEditorEnabled && getSelectedAssetKey() === "stop")) {
            return;
        }

        runAssetBehaviorRole("stop");
    });

    rewardCloseButton.addEventListener("click", function () {
        if (layoutEditorEnabled && getSelectedAssetKey() === "gotcha") {
            return;
        }

        runAssetBehaviorRole("gotcha");
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !confirmPanel.hidden && !isSubmitting) {
            setConfirmVisible(false);
            currentVisibleSceneKey = isRunning || isPaused ? "focus-running" : "focus-setup";
            currentVisibleSceneStateKey = currentVisibleSceneKey === "focus-setup"
                ? getRenderedFocusSetupStateKey()
                : "base";
            applySceneMembershipVisibility();
        }
    });

    window.addEventListener("pointerdown", handleSliderPointerDown, true);
    window.addEventListener("pointermove", handleDragMove);
    window.addEventListener("pointermove", handleSliderPointerMove);
    window.addEventListener("pointermove", handleFocusManageScrollbarPointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointerup", handleSliderPointerUp);
    window.addEventListener("pointerup", handleFocusManageScrollbarPointerUp);
    window.addEventListener("pointercancel", endDrag);
    window.addEventListener("pointercancel", handleSliderPointerUp);
    window.addEventListener("pointercancel", handleFocusManageScrollbarPointerUp);

    window.addEventListener("resize", function () {
        applyAllAssetLayouts();
        syncFocusTypePickerPadding();
        refreshFocusTypePickerSelectionStyles();

        if (layoutModeEnabled) {
            refreshLayoutUi();
        }
    });

    window.addEventListener("pl-home-stage-resized", function () {
        applyAllAssetLayouts();
        syncFocusTypePickerPadding();
        refreshFocusTypePickerSelectionStyles();

        if (layoutModeEnabled) {
            refreshLayoutUi();
        }
    });

    Object.entries(layoutAssets).forEach(function ([assetKey, config]) {
        config.element.addEventListener("pointerdown", function (event) {
            beginDrag(assetKey, event);
        });

        config.element.addEventListener("click", function (event) {
            handleLayoutAssetCanvasClick(assetKey, event);
        }, true);
    });

    function wireLayoutInputs() {
        layoutEditorModeSelect.addEventListener("change", handleLayoutEditorModeChange);
        layoutStateSelect.addEventListener("change", handleLayoutStateChange);

        function isDeferredNumberEntryKey(event) {
            if (event.ctrlKey || event.metaKey || event.altKey) {
                return false;
            }

            return (
                (event.key >= "0" && event.key <= "9")
                || event.key === "-"
                || event.key === "."
                || event.key === "Backspace"
                || event.key === "Delete");
        }

        function wireDeferredNumberInput(numberInput, commitAction) {
            if (!numberInput) {
                return;
            }

            const commit = function () {
                delete numberInput.dataset.pendingCommit;
                commitAction();
            };

            numberInput.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    commit();
                    numberInput.select();
                    return;
                }

                if (isDeferredNumberEntryKey(event)) {
                    numberInput.dataset.pendingCommit = "true";
                }
            });

            numberInput.addEventListener("input", function () {
                if (numberInput.dataset.pendingCommit === "true") {
                    return;
                }

                commitAction();
            });

            numberInput.addEventListener("change", commit);
            numberInput.addEventListener("blur", function () {
                if (numberInput.dataset.pendingCommit === "true") {
                    commit();
                }
            });
        }

        const rangeToNumberPairs = [
            [layoutScale, layoutScaleNumber],
            [layoutX, layoutXNumber],
            [layoutY, layoutYNumber]
        ];

        rangeToNumberPairs.forEach(function ([rangeInput, numberInput]) {
            rangeInput.addEventListener("input", function () {
                numberInput.value = rangeInput.value;
                pushLayoutControlValues();
            });

            wireDeferredNumberInput(numberInput, function () {
                rangeInput.value = numberInput.value;
                pushLayoutControlValues();
            });
        });

        if (layoutHitScaleX && layoutHitScaleXNumber) {
            layoutHitScaleX.addEventListener("input", function () {
                const hitScaleLock = getLayoutHitScaleLock();

                if (hitScaleLock && hitScaleLock.checked) {
                    setLockedHitScaleUiValue(layoutHitScaleX.value);
                } else {
                    layoutHitScaleXNumber.value = layoutHitScaleX.value;
                }

                pushLayoutControlValues();
            });

            wireDeferredNumberInput(layoutHitScaleXNumber, function () {
                const hitScaleLock = getLayoutHitScaleLock();

                if (hitScaleLock && hitScaleLock.checked) {
                    setLockedHitScaleUiValue(layoutHitScaleXNumber.value);
                } else {
                    layoutHitScaleX.value = layoutHitScaleXNumber.value;
                }

                pushLayoutControlValues();
            });
        }

        if (layoutHitScaleY && layoutHitScaleYNumber) {
            layoutHitScaleY.addEventListener("input", function () {
                const hitScaleLock = getLayoutHitScaleLock();

                if (hitScaleLock && hitScaleLock.checked) {
                    setLockedHitScaleUiValue(layoutHitScaleY.value);
                } else {
                    layoutHitScaleYNumber.value = layoutHitScaleY.value;
                }

                pushLayoutControlValues();
            });

            wireDeferredNumberInput(layoutHitScaleYNumber, function () {
                const hitScaleLock = getLayoutHitScaleLock();

                if (hitScaleLock && hitScaleLock.checked) {
                    setLockedHitScaleUiValue(layoutHitScaleYNumber.value);
                } else {
                    layoutHitScaleY.value = layoutHitScaleYNumber.value;
                }

                pushLayoutControlValues();
            });
        }

        const hitScaleLock = getLayoutHitScaleLock();
        if (hitScaleLock) {
            hitScaleLock.addEventListener("change", function () {
                if (!hitScaleLock.checked) {
                    return;
                }

                const lockedValue = Math.max(
                    parseInt(layoutHitScaleX?.value || "100", 10) || 100,
                    parseInt(layoutHitScaleY?.value || "100", 10) || 100);

                setLockedHitScaleUiValue(lockedValue);
                pushLayoutControlValues();
            });
        }

        wireDeferredNumberInput(layoutWidth, pushLayoutControlValues);
        wireDeferredNumberInput(layoutHeight, pushLayoutControlValues);
        getLayoutAspectRatioLock()?.addEventListener("change", pushLayoutControlValues);
        layoutEditorToggle.addEventListener("change", handleLayoutEditorToggleChange);
        layoutSceneSelect.addEventListener("change", handleLayoutSceneChange);
        layoutAssetSelect.addEventListener("change", handleLayoutAssetChange);
        layoutArtPickerButton.addEventListener("click", handleLayoutArtPickerButtonClick);
        layoutArtPickerRemoveButton?.addEventListener("click", function () {
            void handleLayoutArtPickerRemoveButtonClick();
        });
        layoutArtPickerInput.addEventListener("change", handleLayoutArtPickerInputChange);
        layoutStateVisible.addEventListener("change", handleLayoutStateVisibilityChange);
        layoutBehaviorRoleSelect.addEventListener("change", handleLayoutBehaviorRoleChange);
        layoutSceneAssetAddButton.addEventListener("click", function () {
            void addSelectedSceneAssetToCurrentScene();
        });
        layoutSceneAssetRemoveButton.addEventListener("click", function () {
            void removeSelectedSceneAssetFromCurrentScene();
        });
        layoutCreateTextAssetButton.addEventListener("click", function () {
            void createSceneTextAsset();
        });

        if (layoutComponentSelect) {
            layoutComponentSelect.addEventListener("change", handleLayoutComponentChange);
        }

        layoutSaveSelected.addEventListener("click", saveSelectedLayoutAsset);
        layoutRevertSelected.addEventListener("click", revertSelectedLayoutAsset);
        layoutResetSelected.addEventListener("click", resetSelectedLayoutAsset);
        layoutSaveDefault.addEventListener("click", saveLayoutAsDefault);
        layoutResetDefault.addEventListener("click", resetLayoutToDefault);
    }

    //#endregion SEGMENT K1 - Event Wiring

    //#region SEGMENT K2 - Async Boot And Layout Workspace
    async function awaitFirstPaintArtMetrics() {
        const loadTasks = Object.entries(artImageVars).map(function ([assetKey, cssVar]) {
            const url = readCssUrlVar(cssVar);

            if (!url) {
                delete artMetrics[assetKey];
                return Promise.resolve();
            }

            return new Promise(function (resolve) {
                const image = new Image();
                image.decoding = "async";

                image.onload = function () {
                    artMetrics[assetKey] = analyzeImageMetrics(image);
                    resolve();
                };

                image.onerror = function () {
                    delete artMetrics[assetKey];
                    resolve();
                };

                image.src = url;
            });
        });

        await Promise.all(loadTasks);
    }

    function notifyFirstPaintReady() {
        if (homeRoot.dataset.firstPaintReady === "true") {
            return;
        }

        homeRoot.dataset.firstPaintReady = "true";

        window.requestAnimationFrame(function () {
            applyAllAssetLayouts();
            updateDurationReadout();

            window.requestAnimationFrame(function () {
                window.dispatchEvent(new CustomEvent("pl-home-first-paint-ready"));
            });
        });
    }

    function initializeLayoutPanelWorkspace() {
        if (!layoutModeEnabled || !layoutPanel) {
            return;
        }

        if (layoutPanel.dataset.workspaceReady === "true") {
            return;
        }

        layoutPanel.dataset.workspaceReady = "true";

        let style = document.getElementById("pl-layout-panel-runtime-style");

        if (!style) {
            style = document.createElement("style");
            style.id = "pl-layout-panel-runtime-style";
            style.textContent = `
                .pl-layout-panel {
                    max-height: calc(100dvh - 2rem);
                    overflow: auto;
                    overscroll-behavior: contain;
                    scrollbar-gutter: stable;
                }

                .pl-layout-panel.pl-layout-panel-collapsed > :not(.pl-layout-header) {
                    display: none;
                }

                .pl-layout-header {
                    position: sticky;
                    top: 0;
                    z-index: 1;
                    padding-bottom: 0.75rem;
                    background: rgba(255, 255, 255, 0.97);
                }

                .pl-layout-header-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    margin-left: auto;
                }

                .pl-layout-header-button {
                    border: 1px solid #cbd5e1;
                    border-radius: 999px;
                    padding: 0.35rem 0.7rem;
                    background: #ffffff;
                    color: #0f172a;
                    font-size: 0.75rem;
                    font-weight: 800;
                    cursor: pointer;
                }

                #pl-layout-editor-toggle-field input[type="checkbox"] {
                    width: 1rem;
                    height: 1rem;
                    margin: 0;
                    accent-color: #2563eb;
                    cursor: pointer;
                }

                .pl-layout-component-outline,
                .pl-layout-hit-outline {
                    position: absolute;
                    z-index: 17;
                    pointer-events: none;
                }

                .pl-layout-component-outline {
                    border: 2px dashed rgba(59, 130, 246, 0.95);
                    border-radius: 0.9rem;
                    box-shadow: inset 0 0 0 9999px rgba(59, 130, 246, 0.08);
                }

                .pl-layout-hit-outline {
                    border: 2px dotted rgba(6, 182, 212, 0.98);
                    border-radius: 1rem;
                    box-shadow: inset 0 0 0 9999px rgba(6, 182, 212, 0.08);
                }

                @media (max-width: 640px) {
                    .pl-layout-panel {
                        max-height: calc(100dvh - 1.5rem);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        ensureLayoutEditorExtensions();

        const collapseStorageKey = "plLayoutPanelCollapsed";
        const header = layoutPanel.querySelector(".pl-layout-header");

        if (!header) {
            return;
        }

        let actions = header.querySelector(".pl-layout-header-actions");

        if (!actions) {
            actions = document.createElement("div");
            actions.className = "pl-layout-header-actions";
            header.appendChild(actions);
        }

        let collapseButton = document.getElementById("pl-layout-panel-toggle");

        if (!collapseButton) {
            collapseButton = document.createElement("button");
            collapseButton.type = "button";
            collapseButton.id = "pl-layout-panel-toggle";
            collapseButton.className = "pl-layout-header-button";
            actions.appendChild(collapseButton);
        }

        function writeCollapsedPreference(isCollapsed) {
            try {
                window.sessionStorage.setItem(collapseStorageKey, isCollapsed ? "1" : "0");
            }
            catch {
            }
        }

        function readCollapsedPreference() {
            try {
                return window.sessionStorage.getItem(collapseStorageKey) === "1";
            }
            catch {
                return false;
            }
        }

        function applyCollapsedState(isCollapsed) {
            layoutPanel.classList.toggle("pl-layout-panel-collapsed", isCollapsed);
            collapseButton.textContent = isCollapsed ? "Expand" : "Collapse";
            collapseButton.setAttribute("aria-expanded", isCollapsed ? "false" : "true");
        }

        collapseButton.addEventListener("click", function () {
            const nextCollapsed = !layoutPanel.classList.contains("pl-layout-panel-collapsed");
            applyCollapsedState(nextCollapsed);
            writeCollapsedPreference(nextCollapsed);
        });

        applyCollapsedState(readCollapsedPreference());
    }

    async function initializeAsync() {
        initializeLayoutPanelWorkspace();
        applyPanelArtStates();
        syncFocusTypeInputWithSavedLabels(focusTypeInput.value);
        setFocusTypePickerDisabledState(false);
        syncFocusManageButtons();

        await loadSharedLayoutState();
        await awaitFirstPaintArtMetrics();

        homeRoot.classList.toggle("pl-layout-mode", layoutModeEnabled);
        safeZoneOutline.hidden = !layoutModeEnabled;

        applyAllAssetLayouts();
        updateDurationReadout();

        if (layoutModeEnabled) {
            layoutPanel.hidden = false;
            wireLayoutInputs();
            setLayoutEditorEnabled(layoutEditorToggle.checked);
            notifyFirstPaintReady();
            return;
        }

        if (shouldShowRewardOverlay) {
            hydrateRewardPanelFromDataset();
            showRewardStatePreview();
        }
        else {
            returnToHome();
        }

        applyAllAssetLayouts();
        updateDurationReadout();
        notifyFirstPaintReady();
    }

    initializeAsync();
    window.setInterval(updateUi, 250);
    //#endregion SEGMENT K2 - Async Boot And Layout Workspace
})();
