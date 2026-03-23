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
    const focusManageBackButton = document.getElementById("pl-focus-manage-back-button");
    const focusManageOkButton = document.getElementById("pl-focus-manage-ok-button");

    const confirmDim = document.getElementById("pl-confirm-dim");
    const confirmPanel = document.getElementById("pl-confirm-panel");
    const confirmKeepGoingButton = document.getElementById("pl-confirm-keep-going");
    const confirmStopButton = document.getElementById("pl-confirm-stop");

    const rewardDim = document.getElementById("pl-reward-dim");
    const rewardPanel = document.getElementById("pl-reward-panel");
    const rewardCloseButton = document.getElementById("pl-reward-close-button");

    const focusTypeInput = document.getElementById("pl-focus-type-input");
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
        !setupPanel || !setupControls || !focusTypeField || !durationText ||
        !sliderGroup || !sliderTrackShell || !sliderTrackEmptyArt || !sliderFillShell ||
        !sliderFillArt || !sliderNibVisual || !durationSlider || !startFocusButton ||
        !countdownModeButton || !countUpModeButton ||
        !closeFocusButton || !manageButton || !pauseButton || !exitButton ||
        !focusManagePanel || !focusManageBackButton || !focusManageOkButton ||
        !confirmDim || !confirmPanel || !confirmKeepGoingButton || !confirmStopButton ||
        !rewardDim || !rewardPanel || !rewardCloseButton || !focusTypeInput ||
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
        "confirm-panel": "--pl-focus-confirm-panel-image",
        "reward-panel": "--pl-focus-reward-panel-image",
        "countdown-mode": "--pl-btn-countdown-mode-image",
        "countup-mode": "--pl-btn-countup-mode-image",
        "start": "--pl-btn-start-image",
        "back": "--pl-btn-back-image",
        "pause": "--pl-btn-pause-image",
        "exit": "--pl-btn-exit-image",
        "keep-going": "--pl-btn-keep-going-image",
        "stop": "--pl-btn-stop-image",
        "gotcha": "--pl-btn-gotcha-image",
        "slider": "--pl-slider-track-empty-image",
        "slider-nib-art": "--pl-slider-nib-image"
    };

    const layoutAssets = {
        "home-scene": { element: homeSceneArt, stage: "world", interactive: false },
        "home-focus": { element: homeFocusButton, stage: "ui", interactive: true },
        "home-sleep": { element: homeSleepButton, stage: "ui", interactive: true },
        "setup-panel": { element: setupPanel, stage: "ui", interactive: false },
        "countdown-mode": { element: countdownModeButton, stage: "ui", interactive: true },
        "countup-mode": { element: countUpModeButton, stage: "ui", interactive: true },
        "focus-type-field": { element: focusTypeField, stage: "ui", interactive: false },
        "duration-text": { element: durationText, stage: "ui", interactive: false },
        "slider": { element: sliderGroup, stage: "ui", interactive: true, compound: true },
        "start": { element: startFocusButton, stage: "ui", interactive: true },
        "back": { element: closeFocusButton, stage: "ui", interactive: true },
        "manage-button": { element: manageButton, stage: "ui", interactive: true },
        "pause": { element: pauseButton, stage: "ui", interactive: true },
        "exit": { element: exitButton, stage: "ui", interactive: true },
        "focus-manage-panel": { element: focusManagePanel, stage: "ui", interactive: false },
        "focus-manage-back": { element: focusManageBackButton, stage: "ui", interactive: true },
        "focus-manage-ok": { element: focusManageOkButton, stage: "ui", interactive: true },
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
        "focus-manage-back": focusManageBackButton.querySelector(".pl-button-label"),
        "focus-manage-ok": focusManageOkButton.querySelector(".pl-button-label"),
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
        "focus-manage-back": "back.png",
        "focus-manage-ok": "ok.png",
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
        "focus-manage-back": "return-focus-setup",
        "focus-manage-ok": "return-focus-setup",
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
            assets: ["setup-panel", "countdown-mode", "countup-mode", "focus-type-field", "duration-text", "slider", "start", "back", "manage-button"],
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
            assets: ["focus-manage-panel", "focus-manage-back", "focus-manage-ok"]
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

    let selectedTimerMode = "countdown";
    let plannedSeconds = 300;
    let startedAtMs = 0;
    let pausedElapsedSeconds = 0;
    let nextCountUpCheckpointSeconds = 7200;
    let isRunning = false;
    let isPaused = false;
    let isSubmitting = false;
    let completionTonePlayed = false;
    let activeConfirmContext = "stop";
    let dragState = null;
    let sliderDragState = null;

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

        return {
            x: (clientX - rect.left) / scale,
            y: (clientY - rect.top) / scale
        };
    }

    function assetHasArt(assetKey) {
        const varName = artImageVars[assetKey];
        return !!(varName && readCssUrlVar(varName));
    }

    function getLayoutAssetImageVariableKey(assetKey) {
        return `assetImage:${assetKey}`;
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

        return {
            x: value.x ?? value.X,
            y: value.y ?? value.Y,
            width: value.width ?? value.Width,
            height: value.height ?? value.Height,
            scale: value.scale ?? value.Scale,
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

        if (metrics && metrics.canvasRatio > 0) {
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
                scale: partialState?.scale ?? baseState.scale
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

    function beginImageDraft(assetKey, file) {
        if (!assetKey || !file) {
            return;
        }

        clearCurrentImageDraftState();

        currentImageDraftAssetKey = assetKey;
        currentImageDraftFile = file;
        currentImageDraftLabel = file.name || "selected.png";
        currentImageDraftObjectUrl = URL.createObjectURL(file);
        currentImageDraftUrl = currentImageDraftObjectUrl;

        applyLayoutVariables();
        refreshArtMetricsForAsset(assetKey, currentImageDraftUrl).then(function () {
            applyAllAssetLayouts();
            refreshLayoutUi();
        });
    }

    function discardCurrentImageDraft() {
        const assetKey = currentImageDraftAssetKey;

        clearCurrentImageDraftState();
        applyLayoutVariables();

        if (!assetKey) {
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
        const imageDraftActive = isRootComponent(componentKey)
            && currentImageDraftAssetKey === assetKey
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

            sharedLayoutVariables[getLayoutAssetImageVariableKey(assetKey)] = uploadedPath;
            clearCurrentImageDraftState();
            applyLayoutVariables();
            await refreshArtMetricsForAsset(assetKey, uploadedPath);
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

            if (!hasComponentDraft && !textDraftActive && !visibilityDraftActive && !behaviorDraftActive) {
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
                x: existing.x,
                y: existing.y,
                width: existing.width,
                height: existing.height,
                scale: existing.scale,
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
        const shouldDiscardImageDraft = currentImageDraftAssetKey === assetKey;

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
            applyAssetTextStyle(assetKey);
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
        setButtonLabel(countdownModeButton, "Count Down");
        setButtonLabel(countUpModeButton, "Count Up");
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

    function applyPanelArtStates() {
        setupPanel.classList.toggle("pl-canvas-panel-has-art", assetHasArt("setup-panel"));
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
            "pause",
            "exit",
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

    function getSavedAssetImageOverride(assetKey) {
        return String(sharedLayoutVariables[getLayoutAssetImageVariableKey(assetKey)] || "").trim();
    }

    function getEffectiveAssetImageOverride(assetKey) {
        if (currentImageDraftAssetKey === assetKey && currentImageDraftUrl) {
            return currentImageDraftUrl;
        }

        return getSavedAssetImageOverride(assetKey);
    }

    function getAssetRootComponentLabel(assetKey) {
        if (!artImageVars[assetKey]) {
            return "Whole Asset";
        }

        if (currentImageDraftAssetKey === assetKey && currentImageDraftLabel) {
            return currentImageDraftLabel;
        }

        return getFileNameFromAssetUrl(getEffectiveAssetImageOverride(assetKey)) || "wholeAssetRoot";
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

    function applyAssetImageVariable(assetKey, rawUrl) {
        const cssVariableName = artImageVars[assetKey];

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
            applyAssetImageVariable(assetKey, getEffectiveAssetImageOverride(assetKey));
        });
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
            <input class="pl-input" id="pl-layout-text-content" type="text" maxlength="40" />
            <span class="pl-field-hint">Updates the label rendered over this asset.</span>
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
        return !!artImageVars[assetKey] && !isVariableAsset(assetKey) && isRootComponent(componentKey);
    }

    function refreshLayoutArtPicker(assetKey, componentKey) {
        const shouldShow = !!assetKey && assetSupportsArtPicker(assetKey, componentKey);
        layoutArtPickerField.hidden = !shouldShow;

        if (!shouldShow) {
            layoutArtPickerStatus.textContent = "No PNG override selected.";
            return;
        }

        if (currentImageDraftAssetKey === assetKey && currentImageDraftLabel) {
            layoutArtPickerStatus.textContent = `Pending save: ${currentImageDraftLabel}`;
            return;
        }

        const savedOverride = getSavedAssetImageOverride(assetKey);
        const savedLabel = getFileNameFromAssetUrl(savedOverride);
        layoutArtPickerStatus.textContent = savedLabel
            ? `Saved override: ${savedLabel}`
            : "No PNG override selected. Browse and then press Save Selected to remember one.";
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

        const targetCenter = trackLeft + (progressRatio * trackWidth);

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

        labelElement.textContent = textState.content;
        labelElement.style.position = "absolute";
        labelElement.style.left = "50%";
        labelElement.style.top = "50%";
        labelElement.style.transform = `translate(-50%, -50%) translate(${Math.round(textState.x)}px, ${Math.round(textState.y)}px)`;
        labelElement.style.display = "block";
        labelElement.style.width = "max-content";
        labelElement.style.maxWidth = "90%";
        labelElement.style.whiteSpace = "nowrap";
        labelElement.style.lineHeight = "1";
        labelElement.style.textAlign = "center";
        labelElement.style.pointerEvents = "none";
        labelElement.style.fontFamily = textState.fontFamily || layoutTextFontFamilyOptions[0].value;
        labelElement.style.fontSize = `${Math.max(8, Math.round(textState.fontSize || 16))}px`;
        labelElement.style.fontWeight = textState.bold ? "900" : "400";
        labelElement.style.fontStyle = textState.italic ? "italic" : "normal";
        labelElement.style.color = normalizeHexColor(textState.color, "#ffffff");
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
        const fillShellRect = {
            left: fillFullRect.left,
            top: fillFullRect.top,
            width: Math.max(0, Math.min(fillFullRect.width, metrics.progressRatio * fillFullRect.width)),
            height: fillFullRect.height
        };
        const nibRect = applyLocalRectTransform(nibBaseRect, nibState, transformOptions);
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

        const authorWidth = state.width * (state.scale / 100);
        const authorHeight = resolvedHeight * (state.scale / 100);
        const projected = projectUiAssetRect(state, authorWidth, authorHeight);

        element.style.left = `${projected.left}px`;
        element.style.top = `${projected.top}px`;
        element.style.width = `${projected.width}px`;
        element.style.height = `${projected.height}px`;
        element.style.transform = "scale(1)";
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

    function updateLayoutSliderBounds(assetKey, componentKey) {
        if (isVariableAsset(assetKey)) {
            return;
        }

        if (!isRootComponent(componentKey)) {
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
        const ratioLocked = !!artMetrics[assetKey];

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
        refreshLayoutUi();
    }

    function applyGeometryModeForSelection(assetKey, componentKey) {
        if (isVariableAsset(assetKey)) {
            setGeometryFieldsHidden(true);
            setComponentFieldHidden(false);
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
            setHitScaleFieldHidden(true);
            return;
        }

        if (definition.geometryMode === "text") {
            layoutScaleField.hidden = true;
            layoutXField.hidden = false;
            layoutYField.hidden = false;
            layoutWidthField.hidden = true;
            layoutHeightField.hidden = true;
            setHitScaleFieldHidden(true);
            return;
        }

        if (definition.geometryMode === "component-scale") {
            layoutScaleField.hidden = false;
            layoutXField.hidden = false;
            layoutYField.hidden = false;
            layoutWidthField.hidden = true;
            layoutHeightField.hidden = true;
            setHitScaleFieldHidden(true);
            return;
        }

        if (definition.geometryMode === "component-box") {
            layoutScaleField.hidden = false;
            layoutXField.hidden = false;
            layoutYField.hidden = false;
            layoutWidthField.hidden = false;
            layoutHeightField.hidden = true;
            setHitScaleFieldHidden(true);
            return;
        }

        if (definition.geometryMode === "component-hit") {
            layoutScaleField.hidden = true;
            layoutXField.hidden = false;
            layoutYField.hidden = false;
            layoutWidthField.hidden = true;
            layoutHeightField.hidden = true;
            setHitScaleFieldHidden(false);
            return;
        }

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

        const assetKey = getSelectedAssetKey();
        if (!assetKey) {
            setLayoutColorFieldHidden(true);
            setLayoutTextControlsHidden(true);
            setComponentFieldHidden(true);
            setHitScaleFieldHidden(true);
            layoutArtPickerField.hidden = true;
            layoutStateVisibilityField.hidden = true;
            refreshSceneBuilderPanel();
            hideSliderSpecificOutlines();
            return;
        }

        const componentKey = populateLayoutComponentSelect(assetKey, getSelectedComponentKey());
        refreshLayoutArtPicker(assetKey, componentKey);
        refreshLayoutStateVisibilityControls(assetKey);
        refreshLayoutBehaviorRoleControls(assetKey);
        refreshSceneBuilderPanel();

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

            layoutTextContent.value = textState.content;
            layoutTextFontFamily.value = textState.fontFamily;
            layoutTextFontSize.value = String(Math.round(textState.fontSize));
            syncLayoutTextColorInputs(textState.color);
            layoutTextBold.checked = !!textState.bold;
            layoutTextItalic.checked = !!textState.italic;
            layoutTextStyleStatus.textContent = "Position comes from X/Y. Font controls below affect only this text component.";

            layoutX.value = String(Math.round(textState.x));
            layoutY.value = String(Math.round(textState.y));
            syncNumberPairs();

            layoutHeightLabel.textContent = "Height";
            layoutHeightHint.textContent = "";
        }
        else if (isRootComponent(componentKey)) {
            const state = getEffectiveLayoutState(assetKey);
            const resolvedHeight = getResolvedHeight(assetKey, state);
            const ratioLocked = !!artMetrics[assetKey];

            layoutScale.value = String(Math.round(state.scale));
            layoutX.value = String(Math.round(state.x));
            layoutY.value = String(Math.round(state.y));
            layoutWidth.value = String(Math.round(state.width));
            layoutHeight.value = String(Math.round(resolvedHeight));
            syncNumberPairs();

            layoutHeight.disabled = !layoutEditorEnabled || ratioLocked;
            layoutHeight.readOnly = !layoutEditorEnabled || ratioLocked;
            layoutHeightLabel.textContent = ratioLocked ? "Height (auto)" : "Height (px)";
            layoutHeightHint.textContent = ratioLocked
                ? "Image-backed assets keep their natural aspect ratio automatically."
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
            const partial = {
                scale: parseInt(layoutScaleNumber.value || layoutScale.value || String(base.scale), 10),
                x: parseInt(layoutXNumber.value || layoutX.value || String(base.x), 10),
                y: parseInt(layoutYNumber.value || layoutY.value || String(base.y), 10),
                width: parseInt(layoutWidth.value || String(base.width), 10)
            };

            if (!artMetrics[assetKey]) {
                partial.height = parseInt(layoutHeight.value || String(base.height), 10);
            }

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

        beginImageDraft(assetKey, file);
        layoutArtPickerInput.value = "";
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

        if (
            getSelectedAssetKey() !== assetKey
            || !isRootComponent(getSelectedComponentKey())
            || (layoutSceneSelect.value || "home") !== resolvedSceneKey
        ) {
            selectLayoutAsset(assetKey, "root", resolvedSceneKey);
            refreshLayoutUi();
        }

        if (getSelectedAssetKey() !== assetKey || !isRootComponent(getSelectedComponentKey())) {
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

        beginDraftForSelected({
            x: Math.round(designPoint.x - dragState.offsetX),
            y: Math.round(designPoint.y - dragState.offsetY)
        });

        applyAllAssetLayouts();

        layoutX.value = String(Math.round(currentDraftState.x));
        layoutY.value = String(Math.round(currentDraftState.y));
        syncNumberPairs();

        updateLayoutCodePreview(assetKey, "root");
        updateLayoutStatusDisplay(assetKey, "root");
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
    }

    function setFocusManageVisible(isVisible) {
        focusManagePanel.hidden = !(isVisible && getEffectiveSceneAssetVisibility("focus-manage-panel", "focus-manage", "base"));
        focusManageBackButton.hidden = !(isVisible && getEffectiveSceneAssetVisibility("focus-manage-back", "focus-manage", "base"));
        focusManageOkButton.hidden = !(isVisible && getEffectiveSceneAssetVisibility("focus-manage-ok", "focus-manage", "base"));
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

    function showFocusManageState() {
        currentVisibleSceneKey = "focus-manage";
        currentVisibleSceneStateKey = "base";
        setHomeButtonsVisible(false);
        setSetupVisible(false);
        setFocusManageVisible(true);
        setRunVisible(false);
        setConfirmVisible(false);
        setRewardVisible(false);
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
                showFocusManageState();
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
            case "focus-type-field":
            case "slider":
            case "start":
            case "back":
            case "manage-button":
            case "focus-manage-panel":
            case "focus-manage-back":
            case "focus-manage-ok":
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
        showFocusManageState();
    }

    function returnToFocusSetup() {
        showSetupState();
    }

    function returnToHome() {
        resetRunState();
        showHomeState();
    }
    //#endregion SEGMENT J1 - Screen State Previews And Visibility

    //#region SEGMENT J2 - Session Runtime And Rewards
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
        focusManageBackButton.disabled = isDisabled;
        focusManageOkButton.disabled = isDisabled;
        confirmKeepGoingButton.disabled = isDisabled;
        confirmStopButton.disabled = isDisabled;
        rewardCloseButton.disabled = isDisabled;
        focusTypeInput.disabled = isDisabled || setupPanel.classList.contains("pl-setup-panel-locked");
        durationSlider.disabled = isDisabled || setupPanel.classList.contains("pl-setup-panel-locked") || isCountUpModeSelected();
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
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointerup", handleSliderPointerUp);
    window.addEventListener("pointercancel", endDrag);
    window.addEventListener("pointercancel", handleSliderPointerUp);

    window.addEventListener("resize", function () {
        applyAllAssetLayouts();

        if (layoutModeEnabled) {
            refreshLayoutUi();
        }
    });

    window.addEventListener("pl-home-stage-resized", function () {
        applyAllAssetLayouts();

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

            numberInput.addEventListener("input", function () {
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

            layoutHitScaleXNumber.addEventListener("input", function () {
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

            layoutHitScaleYNumber.addEventListener("input", function () {
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

        layoutWidth.addEventListener("input", pushLayoutControlValues);
        layoutHeight.addEventListener("input", pushLayoutControlValues);
        layoutEditorToggle.addEventListener("change", handleLayoutEditorToggleChange);
        layoutSceneSelect.addEventListener("change", handleLayoutSceneChange);
        layoutAssetSelect.addEventListener("change", handleLayoutAssetChange);
        layoutArtPickerButton.addEventListener("click", handleLayoutArtPickerButtonClick);
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

            if (!url || artMetrics[assetKey]) {
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

        await Promise.all([
            loadSharedLayoutState(),
            awaitFirstPaintArtMetrics()
        ]);

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
