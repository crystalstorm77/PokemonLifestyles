
// SEGMENT A START - Home Canvas Script
(function () {
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

    const runPanel = document.getElementById("pl-run-panel");
    const pauseButton = document.getElementById("pl-pause-button");
    const exitButton = document.getElementById("pl-exit-button");

    const confirmDim = document.getElementById("pl-confirm-dim");
    const confirmPanel = document.getElementById("pl-confirm-panel");
    const confirmKeepGoingButton = document.getElementById("pl-confirm-keep-going");
    const confirmStopButton = document.getElementById("pl-confirm-stop");

    const rewardDim = document.getElementById("pl-reward-dim");
    const rewardPanel = document.getElementById("pl-reward-panel");
    const rewardCloseButton = document.getElementById("pl-reward-close-button");

    const focusTypeInput = document.getElementById("pl-focus-type-input");

    const runStateLabel = document.getElementById("pl-run-state-label");
    const runReadout = document.getElementById("pl-run-readout");
    const runElapsed = document.getElementById("pl-run-elapsed");
    const runNote = document.getElementById("pl-run-note");
    const progressFill = document.getElementById("pl-progress-fill");

    const confirmCurrentTime = document.getElementById("pl-confirm-current-time");
    const confirmTimerStatus = document.getElementById("pl-confirm-timer-status");
    const confirmCompleteXp = document.getElementById("pl-confirm-complete-xp");
    const confirmCompleteCoins = document.getElementById("pl-confirm-complete-coins");
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
    const saveMode = document.getElementById("pl-save-mode");

    const layoutPanel = document.getElementById("pl-layout-panel");
    const layoutEditorToggle = document.getElementById("pl-layout-editor-enabled");
    const layoutEditorModeStatus = document.getElementById("pl-layout-editor-mode-status");
    const layoutAssetSelect = document.getElementById("pl-layout-asset-select");
    const layoutSceneSelect = document.getElementById("pl-layout-scene-select");
    const layoutSceneName = document.getElementById("pl-layout-scene-name");
    const layoutStageStatus = document.getElementById("pl-layout-stage-status");
    const layoutSafeZoneStatus = document.getElementById("pl-layout-safe-zone-status");

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
    const layoutResetAll = document.getElementById("pl-layout-reset-all");
    const layoutCode = document.getElementById("pl-layout-code");

    if (!homeRoot || !worldStage || !safeUiStage || !safeZoneOutline ||
        !homeSceneArt || !homeFocusButton || !homeSleepButton ||
        !setupPanel || !setupControls || !focusTypeField || !durationText ||
        !sliderGroup || !sliderTrackShell || !sliderTrackEmptyArt || !sliderFillShell ||
        !sliderFillArt || !sliderNibVisual || !durationSlider || !startFocusButton ||
        !closeFocusButton || !runPanel || !pauseButton || !exitButton ||
        !confirmDim || !confirmPanel || !confirmKeepGoingButton || !confirmStopButton ||
        !rewardDim || !rewardPanel || !rewardCloseButton || !focusTypeInput ||
        !runStateLabel || !runReadout || !runElapsed || !runNote || !progressFill ||
        !confirmCurrentTime || !confirmTimerStatus || !confirmCompleteXp ||
        !confirmCompleteCoins || !confirmCurrentXp || !confirmCurrentCoins ||
        !rewardStatusText || !rewardFocusType || !rewardDurationText || !rewardXp ||
        !rewardCoins || !saveForm || !saveFocusType || !savePlannedSeconds ||
        !saveElapsedSeconds || !saveMode || !layoutPanel || !layoutEditorToggle ||
        !layoutEditorModeStatus || !layoutAssetSelect || !layoutSceneSelect ||
        !layoutSceneName || !layoutStageStatus || !layoutSafeZoneStatus ||
        !layoutScale || !layoutScaleNumber || !layoutX || !layoutXNumber ||
        !layoutY || !layoutYNumber || !layoutWidth || !layoutHeight ||
        !layoutScaleValue || !layoutXValue || !layoutYValue ||
        !layoutHeightLabel || !layoutHeightHint || !layoutSaveSelected ||
        !layoutRevertSelected || !layoutResetSelected || !layoutResetAll || !layoutCode) {
        return;
    }

    const stopThresholdSeconds = 60;
    const layoutModeEnabled = new URL(window.location.href).searchParams.get("layout") === "1";
    let layoutEditorEnabled = layoutModeEnabled;
    const layoutSyncReadUrl = "/LayoutSync?handler=Read";
    const layoutSyncWriteUrl = "/LayoutSync?handler=Write";

    const rewardXpPerMinute = Math.max(0, parseFloat(homeRoot.dataset.rewardXpPerMinute || "0") || 0);
    const rewardIncompleteMultiplier = Math.min(1, Math.max(0, parseFloat(homeRoot.dataset.rewardIncompleteMultiplier || "0.25") || 0.25));
    const rewardSleepMultiplier = Math.max(1, parseFloat(homeRoot.dataset.rewardSleepMultiplier || "1") || 1);
    const rewardWindowEligible = String(homeRoot.dataset.rewardWindowEligible || "").toLowerCase() === "true";
    const shouldShowRewardOverlay = String(homeRoot.dataset.showRewardOverlay || "").toLowerCase() === "true";

    const layoutColorAssetKey = "app-edge-color";
    const layoutColorAssetLabel = "shell-background";
    const layoutEdgeColorVariableName = "--pl-art-app-edge-color";
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');

    const artImageVars = {
        "home-scene": "--pl-home-scene-image",
        "home-focus": "--pl-btn-home-focus-image",
        "home-sleep": "--pl-btn-home-sleep-image",
        "setup-panel": "--pl-focus-setup-panel-image",
        "run-panel": "--pl-focus-run-panel-image",
        "confirm-panel": "--pl-focus-confirm-panel-image",
        "reward-panel": "--pl-focus-reward-panel-image",
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
        "focus-type-field": { element: focusTypeField, stage: "ui", interactive: false },
        "duration-text": { element: durationText, stage: "ui", interactive: false },
        "slider": { element: sliderGroup, stage: "ui", interactive: true, compound: true },
        "start": { element: startFocusButton, stage: "ui", interactive: true },
        "back": { element: closeFocusButton, stage: "ui", interactive: true },
        "run-panel": { element: runPanel, stage: "ui", interactive: false },
        "pause": { element: pauseButton, stage: "ui", interactive: true },
        "exit": { element: exitButton, stage: "ui", interactive: true },
        "confirm-panel": { element: confirmPanel, stage: "ui", interactive: false },
        "keep-going": { element: confirmKeepGoingButton, stage: "ui", interactive: true },
        "stop": { element: confirmStopButton, stage: "ui", interactive: true },
        "reward-panel": { element: rewardPanel, stage: "ui", interactive: false },
        "gotcha": { element: rewardCloseButton, stage: "ui", interactive: true }
    };

    const layoutSceneDefinitions = {
        "home": {
            label: "Home",
            assets: ["home-scene", "home-focus", "home-sleep"]
        },
        "focus-setup": {
            label: "Focus setup",
            assets: ["setup-panel", "focus-type-field", "duration-text", "slider", "start", "back"]
        },
        "focus-running": {
            label: "Focus running",
            assets: ["run-panel", "pause", "exit"]
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
                label: "root",
                geometryMode: "asset",
                allowsHitScale: false,
                status: "Controls the overall slider position, width, and scale."
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
        focusTypeField,
        sliderGroup
    ];

    const artMetrics = {};
    const runtimeComponentRects = {};
    let sharedLayoutState = {};
    let sharedLayoutVariables = {};
    let currentDraftKind = null;
    let currentDraftAssetKey = null;
    let currentDraftComponentKey = null;
    let currentDraftState = null;
    let currentVariableDraftKey = null;
    let currentVariableDraftValue = null;

    let plannedSeconds = 300;
    let startedAtMs = 0;
    let pausedElapsedSeconds = 0;
    let isRunning = false;
    let isPaused = false;
    let isSubmitting = false;
    let completionTonePlayed = false;
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

    let layoutHitScaleField = null;
    let layoutHitScale = document.getElementById("pl-layout-hit-scale");
    let layoutHitScaleNumber = document.getElementById("pl-layout-hit-scale-number");
    let layoutHitScaleStatus = document.getElementById("pl-layout-hit-scale-status");

    let layoutColorField = null;
    let layoutColorPicker = null;
    let layoutColorText = null;
    let layoutColorHint = null;

    let componentOutline = document.getElementById("pl-layout-component-outline");
    let hitOutline = document.getElementById("pl-layout-hit-outline");

    const defaultLayoutEdgeColor = normalizeHexColor(
        getComputedStyle(document.documentElement).getPropertyValue(layoutEdgeColorVariableName),
        "#01ff75");

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

        const match = raw.match(/^url\((['"]?)(.*?)\1\)$/);
        return match ? match[2] : "";
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
            components: normalizeLayoutComponents(value.components ?? value.Components)
        };
    }

    function normalizeComponentOverride(value) {
        if (!value || typeof value !== "object") {
            return null;
        }

        return {
            x: value.x ?? value.X,
            y: value.y ?? value.Y,
            width: value.width ?? value.Width,
            height: value.height ?? value.Height,
            scale: value.scale ?? value.Scale,
            hitScale: value.hitScale ?? value.HitScale
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

    async function loadSharedLayoutState() {
        try {
            const response = await fetch(layoutSyncReadUrl, { cache: "no-store" });

            if (!response.ok) {
                sharedLayoutState = {};
                sharedLayoutVariables = {};
                applyLayoutVariables();
                return;
            }

            const payload = await response.json();
            sharedLayoutState = normalizeLayoutItems(payload?.items ?? payload?.Items);
            sharedLayoutVariables = normalizeLayoutVariables(payload?.variables ?? payload?.Variables);
        }
        catch {
            sharedLayoutState = {};
            sharedLayoutVariables = {};
        }

        currentVariableDraftKey = null;
        currentVariableDraftValue = null;
        applyLayoutVariables();
    }

    async function saveSharedLayoutState() {
        try {
            await fetch(layoutSyncWriteUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    items: sharedLayoutState,
                    variables: sharedLayoutVariables
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

    function getCssLayoutDefaults(assetKey) {
        const metrics = artMetrics[assetKey];
        const defaultWidth = readCssPxVar(`--pl-layout-${assetKey}-width`, 160);

        return {
            x: readCssPxVar(`--pl-layout-${assetKey}-x`, 0),
            y: readCssPxVar(`--pl-layout-${assetKey}-y`, 0),
            width: defaultWidth,
            height: readCssPxVar(`--pl-layout-${assetKey}-height`, metrics && metrics.canvasRatio > 0 ? Math.round(defaultWidth / metrics.canvasRatio) : 56),
            scale: readCssNumberVar(`--pl-layout-${assetKey}-scale`, 100),
            components: {}
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
                        hitScale: 100
                    };
                case "nib-hit":
                    return {
                        x: 0,
                        y: 0,
                        width: null,
                        height: null,
                        scale: 100,
                        hitScale: 100
                    };
                default:
                    return {
                        x: 0,
                        y: 0,
                        width: null,
                        height: null,
                        scale: 100,
                        hitScale: 100
                    };
            }
        }

        return {
            x: 0,
            y: 0,
            width: null,
            height: null,
            scale: 100,
            hitScale: 100
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
            components: stored.components ?? {}
        };
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
            hitScale: stored.hitScale ?? base.hitScale
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
                components: saved.components
            };
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
                hitScale: currentDraftState.hitScale ?? saved.hitScale
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
            hitScale: partialState?.hitScale ?? baseState.hitScale
        };
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

    async function saveSelectedLayoutAsset() {
        const assetKey = getSelectedAssetKey();

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

        if (isRootComponent(componentKey)) {
            if (currentDraftKind !== "asset" || currentDraftAssetKey !== assetKey || !currentDraftState) {
                return;
            }

            const existing = getSavedLayoutState(assetKey);

            sharedLayoutState[assetKey] = {
                x: currentDraftState.x,
                y: currentDraftState.y,
                width: currentDraftState.width,
                height: currentDraftState.height,
                scale: currentDraftState.scale,
                components: existing.components ?? {}
            };
        }
        else {
            if (currentDraftKind !== "component"
                || currentDraftAssetKey !== assetKey
                || currentDraftComponentKey !== componentKey
                || !currentDraftState) {
                return;
            }

            const existing = getSavedLayoutState(assetKey);
            const nextComponents = Object.assign({}, existing.components || {});

            nextComponents[componentKey] = {
                x: currentDraftState.x,
                y: currentDraftState.y,
                width: currentDraftState.width,
                height: currentDraftState.height,
                scale: currentDraftState.scale,
                hitScale: currentDraftState.hitScale
            };

            sharedLayoutState[assetKey] = {
                x: existing.x,
                y: existing.y,
                width: existing.width,
                height: existing.height,
                scale: existing.scale,
                components: nextComponents
            };
        }

        currentDraftKind = null;
        currentDraftAssetKey = null;
        currentDraftComponentKey = null;
        currentDraftState = null;

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

        discardCurrentDraft();
    }

    function resetSelectedLayoutAsset() {
        const assetKey = getSelectedAssetKey();

        if (isVariableAsset(assetKey)) {
            beginVariableDraft("appEdgeColor", getCssLayoutVariableDefaults().appEdgeColor);
            syncLayoutColorInputs(currentVariableDraftValue);
            updateLayoutCodePreview(assetKey);
            updateLayoutStatusDisplay(assetKey);
            return;
        }

        const componentKey = getSelectedComponentKey();

        if (isRootComponent(componentKey)) {
            beginDraftForSelected(getCssLayoutDefaults(assetKey));
        }
        else {
            beginDraftForSelected(getDefaultComponentState(assetKey, componentKey));
        }

        applyAllAssetLayouts();
        refreshLayoutUi();
    }

    async function resetAllLayoutAssets() {
        sharedLayoutState = {};
        sharedLayoutVariables = {};
        currentDraftKind = null;
        currentDraftAssetKey = null;
        currentDraftComponentKey = null;
        currentDraftState = null;
        currentVariableDraftKey = null;
        currentVariableDraftValue = null;

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

    function setButtonLabel(button, label) {
        const labelElement = button.querySelector(".pl-button-label");

        if (labelElement) {
            labelElement.textContent = label;
        }
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
        runPanel.classList.toggle("pl-canvas-panel-has-art", assetHasArt("run-panel"));
        confirmPanel.classList.toggle("pl-canvas-panel-has-art", assetHasArt("confirm-panel"));
        rewardPanel.classList.toggle("pl-canvas-panel-has-art", assetHasArt("reward-panel"));
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

    function applyEdgeColorVariable(colorValue) {
        const normalized = normalizeHexColor(colorValue, defaultLayoutEdgeColor);

        document.documentElement.style.setProperty(layoutEdgeColorVariableName, normalized);

        if (themeColorMeta) {
            themeColorMeta.setAttribute("content", normalized);
        }
    }

    function applyLayoutVariables() {
        applyEdgeColorVariable(getEffectiveLayoutVariable("appEdgeColor"));
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
        return layoutSceneDefinitions[sceneKey] || layoutSceneDefinitions.home;
    }

    function getLayoutSceneAssetKeys(sceneKey) {
        return getLayoutSceneDefinition(sceneKey).assets.filter(function (assetKey) {
            return isVariableAsset(assetKey) || !!layoutAssets[assetKey];
        });
    }

    function findLayoutSceneKeyForAsset(assetKey) {
        if (!assetKey) {
            return "home";
        }

        const matchingSceneEntry = Object.entries(layoutSceneDefinitions).find(function ([, sceneDefinition]) {
            return sceneDefinition.assets.includes(assetKey);
        });

        return matchingSceneEntry ? matchingSceneEntry[0] : "home";
    }

    function updateLayoutSceneHeader(sceneKey) {
        layoutSceneName.textContent = getLayoutSceneDefinition(sceneKey).label;
    }

    function getComponentDefinitionsForAsset(assetKey) {
        return assetComponentDefinitions[assetKey] || {
            root: {
                label: "root",
                geometryMode: "asset",
                allowsHitScale: false,
                status: "This asset currently exposes only root-level controls."
            }
        };
    }

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

    function populateLayoutComponentSelect(assetKey, preferredComponentKey = null) {
        if (!layoutComponentSelect) {
            return "root";
        }

        const definitions = getComponentDefinitionsForAsset(assetKey);
        const componentKeys = Object.keys(definitions);
        const preservedKey = componentKeys.includes(preferredComponentKey)
            ? preferredComponentKey
            : (componentKeys.includes(layoutComponentSelect.value) ? layoutComponentSelect.value : "root");

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

    function setActiveLayoutScene(sceneKey, preferredAssetKey = null, preferredComponentKey = null) {
        const resolvedSceneKey = layoutSceneDefinitions[sceneKey]
            ? sceneKey
            : findLayoutSceneKeyForAsset(preferredAssetKey);

        layoutSceneSelect.value = resolvedSceneKey;
        updateLayoutSceneHeader(resolvedSceneKey);

        const assetKey = populateLayoutAssetSelectForScene(resolvedSceneKey, preferredAssetKey);
        populateLayoutComponentSelect(assetKey, preferredComponentKey);

        return assetKey;
    }

    function initializeLayoutSceneControls() {
        const initialAssetKey = layoutAssetSelect.value || "home-scene";
        const initialSceneKey = layoutSceneDefinitions[layoutSceneSelect.value]
            ? layoutSceneSelect.value
            : findLayoutSceneKeyForAsset(initialAssetKey);

        setActiveLayoutScene(initialSceneKey, initialAssetKey, "root");
    }

    function selectLayoutAsset(assetKey, componentKey = "root") {
        return setActiveLayoutScene(findLayoutSceneKeyForAsset(assetKey), assetKey, componentKey);
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
        updateLayoutCodePreview(layoutColorAssetKey);
        updateLayoutStatusDisplay(layoutColorAssetKey);
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

        if (!layoutHitScale) {
            layoutHitScaleField = document.createElement("label");
            layoutHitScaleField.className = "pl-field";
            layoutHitScaleField.hidden = true;
            layoutHitScaleField.innerHTML = `
                <span class="pl-field-label">Interactable Area Scale</span>
                <div class="pl-layout-range-with-number">
                    <input class="pl-input" id="pl-layout-hit-scale" type="range" min="100" max="200" step="1" value="100" />
                    <input class="pl-input pl-layout-number-input" id="pl-layout-hit-scale-number" type="number" min="100" max="200" step="1" value="100" />
                </div>
                <span class="pl-field-hint" id="pl-layout-hit-scale-status">100% = exact component bounds. 200% = double-size interactable area.</span>
            `;

            if (layoutHeightField && layoutHeightField.parentNode) {
                layoutHeightField.parentNode.insertBefore(layoutHitScaleField, layoutHeightField.nextSibling);
            }
            else {
                layoutPanel.appendChild(layoutHitScaleField);
            }

            layoutHitScale = layoutHitScaleField.querySelector("#pl-layout-hit-scale");
            layoutHitScaleNumber = layoutHitScaleField.querySelector("#pl-layout-hit-scale-number");
            layoutHitScaleStatus = layoutHitScaleField.querySelector("#pl-layout-hit-scale-status");
        }
        else {
            layoutHitScaleField = layoutHitScale.closest(".pl-field");
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

    function hideSliderSpecificOutlines() {
        if (componentOutline) {
            componentOutline.hidden = true;
        }

        if (hitOutline) {
            hitOutline.hidden = true;
        }
    }


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
            const hitScaleRatio = Math.max(1, (componentState.hitScale || 100) / 100);
            const expandedWidth = Math.max(1, width * hitScaleRatio);
            const expandedHeight = Math.max(1, height * hitScaleRatio);
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
            hitScale: nibHitState.hitScale
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
        const formatted = formatDurationSelection(parseInt(durationSlider.value || "5", 10));
        durationText.textContent = formatted;
        runReadout.textContent = formatted;
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
        applyLayoutVariables();
        refreshLayoutSelection();
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
        if (isVariableAsset(assetKey)) {
            layoutCode.value =
                `:root {\n  --pl-art-app-edge-color: ${getEffectiveLayoutVariable("appEdgeColor")};\n}`;
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

            if (componentKey === "nib-hit" && componentState.hitScale !== 100) {
                payload.items[assetKey].components[componentKey].hitScale = Math.round(componentState.hitScale);
            }

            layoutCode.value = JSON.stringify(payload, null, 2);
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

        if (!isRootComponent(componentKey)) {
            const definitions = getComponentDefinitionsForAsset(assetKey);
            layoutStageStatus.textContent = `Component mode · ${definitions[componentKey]?.label || componentKey}`;
            layoutSafeZoneStatus.textContent = definitions[componentKey]?.status || "Component tuning mode.";
            layoutScaleValue.textContent = componentKey === "nib-hit"
                ? `${Math.round(getEffectiveComponentState(assetKey, componentKey).hitScale)}% hit area`
                : `${Math.round(getEffectiveComponentState(assetKey, componentKey).scale)}%`;
            layoutXValue.textContent = `${Math.round(getEffectiveComponentState(assetKey, componentKey).x)} px local offset`;
            layoutYValue.textContent = `${Math.round(getEffectiveComponentState(assetKey, componentKey).y)} px local offset`;
            return;
        }

        const state = getEffectiveLayoutState(assetKey);
        const status = getVisibilityStatus(assetKey, state);
        const stageType = getAssetStageType(assetKey);

        layoutStageStatus.textContent = stageType === "world"
            ? "World layer · fills the screen with cover scaling."
            : "Safe UI layer · authored against the shared safe frame.";
        layoutSafeZoneStatus.textContent = (!status.xStatus.inside || !status.yStatus.inside)
            ? `Outside safe zone · ${status.xStatus.text}; ${status.yStatus.text}`
            : "Inside safe zone.";
        layoutScaleValue.textContent = `${Math.round(state.scale)}%`;
        layoutXValue.textContent = status.xStatus.text;
        layoutYValue.textContent = status.yStatus.text;
    }

    function syncNumberPairs() {
        layoutScaleNumber.value = layoutScale.value;
        layoutXNumber.value = layoutX.value;
        layoutYNumber.value = layoutY.value;
    }

    function syncHitScalePairs() {
        if (!layoutHitScale || !layoutHitScaleNumber) {
            return;
        }

        layoutHitScaleNumber.value = layoutHitScale.value;
    }

    function getLayoutEditorManagedControls() {
        return [
            layoutSceneSelect,
            layoutAssetSelect,
            layoutComponentSelect,
            layoutScale,
            layoutScaleNumber,
            layoutX,
            layoutXNumber,
            layoutY,
            layoutYNumber,
            layoutWidth,
            layoutHeight,
            layoutHitScale,
            layoutHitScaleNumber,
            layoutSaveSelected,
            layoutRevertSelected,
            layoutResetSelected,
            layoutResetAll,
            layoutCode,
            layoutColorPicker,
            layoutColorText
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

    function refreshLayoutUi() {
        ensureLayoutVariableControls();
        ensureLayoutEditorExtensions();
        updateLayoutSceneHeader(layoutSceneSelect.value || "home");
        updateLayoutEditorControlState();
        updateLayoutEditorModeStatus();
        syncLayoutEditorSelectableStates();

        const assetKey = getSelectedAssetKey();
        if (!assetKey) {
            setLayoutColorFieldHidden(true);
            setComponentFieldHidden(true);
            setHitScaleFieldHidden(true);
            hideSliderSpecificOutlines();
            return;
        }

        const componentKey = populateLayoutComponentSelect(assetKey, getSelectedComponentKey());

        if (isVariableAsset(assetKey)) {
            setLayoutColorFieldHidden(false);
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

        if (isRootComponent(componentKey)) {
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
            const previewRect = runtimeComponentRects[assetKey]?.[componentKey];

            layoutScale.value = String(Math.round(componentState.scale));
            layoutX.value = String(Math.round(componentState.x));
            layoutY.value = String(Math.round(componentState.y));
            layoutWidth.value = geometryMode === "component-box"
                ? String(Math.round(componentState.width ?? getSliderComponentLocalPreviewWidth(componentKey) ?? 0))
                : "0";
            layoutHeight.value = "0";
            syncNumberPairs();

            if (layoutHitScale) {
                layoutHitScale.value = String(Math.round(componentState.hitScale));
                syncHitScalePairs();
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

    function buildPartialStateFromControls() {
        const assetKey = getSelectedAssetKey();
        const componentKey = getSelectedComponentKey();

        if (isVariableAsset(assetKey)) {
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
            hitScale: parseInt(layoutHitScaleNumber?.value || layoutHitScale?.value || String(base.hitScale), 10)
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

    function pushLayoutControlValues() {
        const assetKey = getSelectedAssetKey();
        if (isVariableAsset(assetKey)) {
            return;
        }

        const partial = buildPartialStateFromControls();
        if (!partial) {
            return;
        }

        beginDraftForSelected(partial);
        updateLayoutSliderBounds(assetKey, getSelectedComponentKey());

        if (currentDraftState && currentDraftState.scale != null) {
            layoutScale.value = String(Math.round(currentDraftState.scale));
            syncNumberPairs();
        }

        if (currentDraftState && currentDraftState.hitScale != null && layoutHitScale) {
            layoutHitScale.value = String(Math.round(currentDraftState.hitScale));
            syncHitScalePairs();
        }

        applyAllAssetLayouts();
        updateLayoutCodePreview(assetKey, getSelectedComponentKey());
        updateLayoutStatusDisplay(assetKey, getSelectedComponentKey());
        refreshLayoutSelection();
        refreshComponentOutlines();
    }

    function handleLayoutSceneChange() {
        const newAssetKey = setActiveLayoutScene(layoutSceneSelect.value || "home", getSelectedAssetKey(), getSelectedComponentKey());

        if (currentDraftAssetKey && currentDraftAssetKey !== newAssetKey) {
            discardCurrentDraft();
        }

        if (currentVariableDraftKey && newAssetKey !== layoutColorAssetKey) {
            discardVariableDraft();
        }

        refreshLayoutUi();
    }

    function handleLayoutAssetChange() {
        const newAssetKey = getSelectedAssetKey();

        if (currentDraftAssetKey && currentDraftAssetKey !== newAssetKey) {
            discardCurrentDraft();
        }

        if (currentVariableDraftKey && newAssetKey !== layoutColorAssetKey) {
            discardVariableDraft();
        }

        populateLayoutComponentSelect(newAssetKey, "root");
        refreshLayoutUi();
    }

    function handleLayoutComponentChange() {
        const newComponentKey = getSelectedComponentKey();

        if (currentDraftKind === "component" && currentDraftComponentKey !== newComponentKey) {
            discardCurrentDraft();
        }

        refreshLayoutUi();
    }

    function handleLayoutEditorToggleChange() {
        setLayoutEditorEnabled(layoutEditorToggle.checked);
    }

    function handleLayoutAssetCanvasClick(assetKey, event) {
        if (!layoutEditorEnabled) {
            return;
        }

        if (getSelectedAssetKey() !== assetKey) {
            selectLayoutAsset(assetKey, "root");
            handleLayoutAssetChange();
        }
        else {
            refreshLayoutSelection();
        }

        event.preventDefault();
        event.stopPropagation();
    }

    function beginDrag(assetKey, event) {
        if (!layoutEditorEnabled || getSelectedAssetKey() !== assetKey || !isRootComponent(getSelectedComponentKey()) || isVariableAsset(assetKey)) {
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

        try {
            sliderGroup.setPointerCapture(event.pointerId);
        }
        catch {
        }

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

        try {
            sliderGroup.releasePointerCapture(event.pointerId);
        }
        catch {
        }

        sliderDragState = null;
    }

    initializeLayoutSceneControls();

    function setSetupChildrenVisible(isVisible) {
        focusTypeField.hidden = !isVisible;
        durationText.hidden = !isVisible;
        sliderGroup.hidden = !isVisible;
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
        setupPanel.hidden = !isVisible;
        startFocusButton.hidden = !isVisible;
        closeFocusButton.hidden = !isVisible;
        setSetupChildrenVisible(isVisible);
    }

    function setRunVisible(isVisible) {
        runPanel.hidden = !isVisible;
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
        setHomeButtonsVisible(true);
        setSetupVisible(false);
        setRunVisible(false);
        setConfirmVisible(false);
        setRewardVisible(false);
    }

    function showSetupState() {
        setHomeButtonsVisible(false);
        setSetupVisible(true);
        setRunVisible(false);
        setConfirmVisible(false);
        setRewardVisible(false);
        setupPanel.classList.remove("pl-setup-panel-locked");
        setSetupChildrenLocked(false);
        updateDurationReadout();
    }

    function showRunStatePreview() {
        const previewElapsedSeconds = 600;
        const previewRemainingSeconds = 1500;
        const previewRemainingLabel = formatDurationLabel(previewRemainingSeconds);

        showSetupState();
        setupPanel.classList.add("pl-setup-panel-locked");
        setSetupChildrenLocked(true);
        setRunVisible(true);
        runStateLabel.textContent = "Time remaining";
        durationText.textContent = previewRemainingLabel;
        runReadout.textContent = previewRemainingLabel;
        runElapsed.textContent = formatClock(previewElapsedSeconds);
        progressFill.style.width = "40%";
        setButtonLabel(pauseButton, "Pause");
        setButtonLabel(exitButton, "Stop Focusing");
        runNote.textContent = "You have reached 1 minute. Stopping now will save the current session as incomplete.";
    }

    function showConfirmStatePreview() {
        showRunStatePreview();
        setConfirmVisible(true);
        updateConfirmPanel(600);
    }

    function showRewardStatePreview() {
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
    }

    function previewLayoutAsset(assetKey) {
        if (!layoutEditorEnabled) {
            return;
        }

        switch (assetKey) {
            case "home-scene":
            case "home-focus":
            case "home-sleep":
                showHomeState();
                break;
            case "setup-panel":
            case "focus-type-field":
            case "duration-text":
            case "slider":
            case "start":
            case "back":
                showSetupState();
                break;
            case "run-panel":
            case "pause":
            case "exit":
                showRunStatePreview();
                break;
            case "confirm-panel":
            case "keep-going":
            case "stop":
                showConfirmStatePreview();
                break;
            case "reward-panel":
            case "gotcha":
                showRewardStatePreview();
                break;
            default:
                showHomeState();
                break;
        }

        updateDurationReadout();
    }

    function openFocusSetup() {
        showSetupState();
    }

    function returnToHome() {
        resetRunState();
        showHomeState();
    }

    function resetRunState() {
        isRunning = false;
        isPaused = false;
        isSubmitting = false;
        completionTonePlayed = false;
        pausedElapsedSeconds = 0;
        startedAtMs = 0;

        setupPanel.classList.remove("pl-setup-panel-locked");
        setSetupChildrenLocked(false);
        setButtonLabel(pauseButton, "Pause");
        setButtonLabel(exitButton, "Cancel");
        runStateLabel.textContent = "Time remaining";
        updateDurationReadout();
        runElapsed.textContent = "00:00:00";
        progressFill.style.width = "0%";
        runNote.textContent = "Cancel before 1 minute to discard this session with no save.";
    }

    function getElapsedSeconds() {
        if (!isRunning) {
            return 0;
        }

        if (isPaused) {
            return Math.min(plannedSeconds, pausedElapsedSeconds);
        }

        const liveElapsed = Math.floor((Date.now() - startedAtMs) / 1000);
        return Math.min(plannedSeconds, Math.max(0, liveElapsed));
    }

    function setButtonsDisabled(isDisabled) {
        startFocusButton.disabled = isDisabled;
        pauseButton.disabled = isDisabled;
        exitButton.disabled = isDisabled;
        confirmKeepGoingButton.disabled = isDisabled;
        confirmStopButton.disabled = isDisabled;
        rewardCloseButton.disabled = isDisabled;
        focusTypeInput.disabled = isDisabled || setupPanel.classList.contains("pl-setup-panel-locked");
        durationSlider.disabled = isDisabled || setupPanel.classList.contains("pl-setup-panel-locked");
    }

    function updateConfirmPanel(elapsedSeconds) {
        const completePreview = calculateRewardPreview(plannedSeconds, true);
        const currentPreview = calculateRewardPreview(elapsedSeconds, false);

        confirmCurrentTime.textContent = formatClock(elapsedSeconds);
        confirmTimerStatus.textContent = isPaused ? "Paused" : "Still counting down";
        confirmCompleteXp.textContent = String(completePreview.xp);
        confirmCompleteCoins.textContent = String(completePreview.coins);
        confirmCurrentXp.textContent = String(currentPreview.xp);
        confirmCurrentCoins.textContent = String(currentPreview.coins);
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

        const elapsedSeconds = mode === "complete" ? plannedSeconds : getElapsedSeconds();
        if (elapsedSeconds <= 0) {
            return;
        }

        isSubmitting = true;
        saveFocusType.value = (focusTypeInput.value || "Focus").trim() || "Focus";
        savePlannedSeconds.value = String(plannedSeconds);
        saveElapsedSeconds.value = String(elapsedSeconds);
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
        const progressPercent = plannedSeconds <= 0 ? 0 : (elapsedSeconds / plannedSeconds) * 100;
        const remainingDurationLabel = formatDurationLabel(remainingSeconds);

        durationText.textContent = remainingDurationLabel;
        runReadout.textContent = remainingDurationLabel;
        runElapsed.textContent = formatClock(elapsedSeconds);
        progressFill.style.width = `${Math.max(0, Math.min(100, progressPercent))}%`;

        updateExitButton(elapsedSeconds);

        if (!confirmPanel.hidden) {
            updateConfirmPanel(elapsedSeconds);
        }

        if (isPaused) {
            runStateLabel.textContent = "Paused";
            setButtonLabel(pauseButton, "Keep Going?");
            runNote.textContent = elapsedSeconds >= stopThresholdSeconds
                ? "Session paused. You can keep going, or stop focusing and save the current incomplete session."
                : "Session paused. Cancel before 1 minute to discard this session with no save.";
        }
        else {
            runStateLabel.textContent = "Time remaining";
            setButtonLabel(pauseButton, "Pause");
            runNote.textContent = elapsedSeconds >= stopThresholdSeconds
                ? "You have reached 1 minute. Stopping now will save the current session as incomplete."
                : "Cancel before 1 minute to discard this session with no save.";
        }

        if (remainingSeconds <= 0 && !isSubmitting) {
            playCompletionTone();
            submitSave("complete");
        }
    }

    homeFocusButton.addEventListener("click", function () {
        if (layoutEditorEnabled && getSelectedAssetKey() === "home-focus") {
            return;
        }

        openFocusSetup();
    });

    closeFocusButton.addEventListener("click", function () {
        if (layoutEditorEnabled && getSelectedAssetKey() === "back") {
            return;
        }

        returnToHome();
    });

    durationSlider.addEventListener("input", function () {
        updateDurationReadout();
    });

    sliderGroup.addEventListener("pointerdown", handleSliderPointerDown);
    sliderGroup.addEventListener("pointermove", handleSliderPointerMove);
    sliderGroup.addEventListener("pointerup", handleSliderPointerUp);
    sliderGroup.addEventListener("pointercancel", handleSliderPointerUp);

    startFocusButton.addEventListener("click", function () {
        if (isSubmitting || (layoutEditorEnabled && getSelectedAssetKey() === "start")) {
            return;
        }

        plannedSeconds = Math.max(300, Math.min(7200, parseInt(durationSlider.value || "5", 10) * 60));
        startedAtMs = Date.now();
        pausedElapsedSeconds = 0;
        isRunning = true;
        isPaused = false;
        isSubmitting = false;
        completionTonePlayed = false;

        setupPanel.classList.add("pl-setup-panel-locked");
        setSetupChildrenLocked(true);
        setRunVisible(true);
        startFocusButton.hidden = true;
        closeFocusButton.hidden = true;

        runStateLabel.textContent = "Time remaining";
        setButtonLabel(pauseButton, "Pause");
        setButtonLabel(exitButton, "Cancel");

        updateUi();
    });

    pauseButton.addEventListener("click", function () {
        if (!isRunning || isSubmitting || !confirmPanel.hidden || (layoutEditorEnabled && getSelectedAssetKey() === "pause")) {
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
    });

    exitButton.addEventListener("click", function () {
        if (!isRunning || isSubmitting || (layoutEditorEnabled && getSelectedAssetKey() === "exit")) {
            return;
        }

        const elapsedSeconds = getElapsedSeconds();

        if (elapsedSeconds < stopThresholdSeconds) {
            returnToHome();
            return;
        }

        updateConfirmPanel(elapsedSeconds);
        setConfirmVisible(true);
    });

    confirmKeepGoingButton.addEventListener("click", function () {
        if (isSubmitting || (layoutEditorEnabled && getSelectedAssetKey() === "keep-going")) {
            return;
        }

        setConfirmVisible(false);
    });

    confirmStopButton.addEventListener("click", function () {
        if (isSubmitting || (layoutEditorEnabled && getSelectedAssetKey() === "stop")) {
            return;
        }

        submitSave("stop");
    });

    rewardCloseButton.addEventListener("click", function () {
        if (layoutEditorEnabled && getSelectedAssetKey() === "gotcha") {
            return;
        }

        window.location.href = "/Index";
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !confirmPanel.hidden && !isSubmitting) {
            setConfirmVisible(false);
        }
    });

    window.addEventListener("pointermove", handleDragMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

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

        if (layoutHitScale && layoutHitScaleNumber) {
            layoutHitScale.addEventListener("input", function () {
                layoutHitScaleNumber.value = layoutHitScale.value;
                pushLayoutControlValues();
            });

            layoutHitScaleNumber.addEventListener("input", function () {
                layoutHitScale.value = layoutHitScaleNumber.value;
                pushLayoutControlValues();
            });
        }

        layoutWidth.addEventListener("input", pushLayoutControlValues);
        layoutHeight.addEventListener("input", pushLayoutControlValues);
        layoutEditorToggle.addEventListener("change", handleLayoutEditorToggleChange);
        layoutSceneSelect.addEventListener("change", handleLayoutSceneChange);
        layoutAssetSelect.addEventListener("change", handleLayoutAssetChange);

        if (layoutComponentSelect) {
            layoutComponentSelect.addEventListener("change", handleLayoutComponentChange);
        }

        layoutSaveSelected.addEventListener("click", saveSelectedLayoutAsset);
        layoutRevertSelected.addEventListener("click", revertSelectedLayoutAsset);
        layoutResetSelected.addEventListener("click", resetSelectedLayoutAsset);
        layoutResetAll.addEventListener("click", resetAllLayoutAssets);
    }

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

        runReadout.hidden = true;
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
})();
// SEGMENT A END - Home Canvas Script

