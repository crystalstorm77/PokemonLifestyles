(function () {
    // SEGMENT A1 — Home Canvas Element Cache + Early Exit START
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
    const layoutAssetSelect = document.getElementById("pl-layout-asset-select");
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
        !saveElapsedSeconds || !saveMode || !layoutPanel || !layoutAssetSelect ||
        !layoutStageStatus || !layoutSafeZoneStatus || !layoutScale || !layoutScaleNumber ||
        !layoutX || !layoutXNumber || !layoutY || !layoutYNumber || !layoutWidth ||
        !layoutHeight || !layoutScaleValue || !layoutXValue || !layoutYValue ||
        !layoutHeightLabel || !layoutHeightHint || !layoutSaveSelected ||
        !layoutRevertSelected || !layoutResetSelected || !layoutResetAll || !layoutCode) {
        return;
    }

    const stopThresholdSeconds = 60;
    const layoutModeEnabled = new URL(window.location.href).searchParams.get("layout") === "1";
    const layoutSyncReadUrl = "/LayoutSync?handler=Read";
    const layoutSyncWriteUrl = "/LayoutSync?handler=Write";

    const rewardXpPerMinute = Math.max(0, parseFloat(homeRoot.dataset.rewardXpPerMinute || "0") || 0);
    const rewardIncompleteMultiplier = Math.min(1, Math.max(0, parseFloat(homeRoot.dataset.rewardIncompleteMultiplier || "0.25") || 0.25));
    const rewardSleepMultiplier = Math.max(1, parseFloat(homeRoot.dataset.rewardSleepMultiplier || "1") || 1);
    const rewardWindowEligible = String(homeRoot.dataset.rewardWindowEligible || "").toLowerCase() === "true";
    const shouldShowRewardOverlay = String(homeRoot.dataset.showRewardOverlay || "").toLowerCase() === "true";

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
        "home-scene": { element: homeSceneArt, stage: "world" },
        "home-focus": { element: homeFocusButton, stage: "ui" },
        "home-sleep": { element: homeSleepButton, stage: "ui" },
        "setup-panel": { element: setupPanel, stage: "ui" },
        "focus-type-field": { element: focusTypeField, stage: "ui" },
        "duration-text": { element: durationText, stage: "ui" },
        "slider": { element: sliderGroup, stage: "ui" },
        "start": { element: startFocusButton, stage: "ui" },
        "back": { element: closeFocusButton, stage: "ui" },
        "run-panel": { element: runPanel, stage: "ui" },
        "pause": { element: pauseButton, stage: "ui" },
        "exit": { element: exitButton, stage: "ui" },
        "confirm-panel": { element: confirmPanel, stage: "ui" },
        "keep-going": { element: confirmKeepGoingButton, stage: "ui" },
        "stop": { element: confirmStopButton, stage: "ui" },
        "reward-panel": { element: rewardPanel, stage: "ui" },
        "gotcha": { element: rewardCloseButton, stage: "ui" }
    };

    const setupInteractiveElements = [
        focusTypeField,
        durationText,
        sliderGroup
    ];

    const artMetrics = {};
    let sharedLayoutState = {};
    let currentDraftAssetKey = null;
    let currentDraftState = null;
    let plannedSeconds = 300;
    let startedAtMs = 0;
    let pausedElapsedSeconds = 0;
    let isRunning = false;
    let isPaused = false;
    let isSubmitting = false;
    let completionTonePlayed = false;
    let dragState = null;

    // SEGMENT A1 — Home Canvas Element Cache + Early Exit END
    // SEGMENT A2 — Home Canvas Asset Defaults + Measurement Helpers START
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

    function getUiAuthorFrameLeft() {
        return readDatasetPx("uiAuthorFrameLeft", readCssPxVar("--pl-safe-ui-author-left", 0));
    }

    function getUiAuthorFrameTop() {
        return readDatasetPx("uiAuthorFrameTop", readCssPxVar("--pl-safe-ui-author-top", 0));
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
            scale: value.scale ?? value.Scale
        };
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

    // SEGMENT A2 — Home Canvas Asset Defaults + Measurement Helpers END
    // SEGMENT A3 — Home Canvas Layout Sync + Draft Helpers START
    async function loadSharedLayoutState() {
        try {
            const response = await fetch(layoutSyncReadUrl, { cache: "no-store" });

            if (!response.ok) {
                sharedLayoutState = {};
                return;
            }

            const payload = await response.json();
            sharedLayoutState = normalizeLayoutItems(payload?.items ?? payload?.Items);
        }
        catch {
            sharedLayoutState = {};
        }
    }

    async function saveSharedLayoutState() {
        try {
            await fetch(layoutSyncWriteUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ items: sharedLayoutState })
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
        Object.entries(artImageVars).forEach(([assetKey, cssVar]) => {
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
            scale: readCssNumberVar(`--pl-layout-${assetKey}-scale`, 100)
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
            scale: stored.scale ?? defaults.scale
        };
    }

    function getEffectiveLayoutState(assetKey) {
        const saved = getSavedLayoutState(assetKey);

        if (assetKey === currentDraftAssetKey && currentDraftState) {
            return {
                x: currentDraftState.x ?? saved.x,
                y: currentDraftState.y ?? saved.y,
                width: currentDraftState.width ?? saved.width,
                height: currentDraftState.height ?? saved.height,
                scale: currentDraftState.scale ?? saved.scale
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

    function beginDraftForSelected(partialState) {
        const assetKey = layoutAssetSelect.value;
        const baseState = getEffectiveLayoutState(assetKey);

        currentDraftAssetKey = assetKey;
        currentDraftState = {
            x: partialState?.x ?? baseState.x,
            y: partialState?.y ?? baseState.y,
            width: partialState?.width ?? baseState.width,
            height: partialState?.height ?? baseState.height,
            scale: partialState?.scale ?? baseState.scale
        };
    }

    function discardCurrentDraft() {
        const assetKey = currentDraftAssetKey;
        currentDraftAssetKey = null;
        currentDraftState = null;

        if (assetKey) {
            applyAssetLayout(assetKey);
        }
    }

    async function saveSelectedLayoutAsset() {
        const assetKey = layoutAssetSelect.value;

        if (currentDraftAssetKey !== assetKey || !currentDraftState) {
            return;
        }

        sharedLayoutState[assetKey] = {
            x: currentDraftState.x,
            y: currentDraftState.y,
            width: currentDraftState.width,
            height: currentDraftState.height,
            scale: currentDraftState.scale
        };

        currentDraftAssetKey = null;
        currentDraftState = null;
        await saveSharedLayoutState();
        applyAllAssetLayouts();
        refreshLayoutUi();
    }

    function revertSelectedLayoutAsset() {
        discardCurrentDraft();
        refreshLayoutUi();
    }

    function resetSelectedLayoutAsset() {
        beginDraftForSelected(getCssLayoutDefaults(layoutAssetSelect.value));
        applyAssetLayout(layoutAssetSelect.value);
        refreshLayoutUi();
    }

    async function resetAllLayoutAssets() {
        sharedLayoutState = {};
        currentDraftAssetKey = null;
        currentDraftState = null;
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

    function formatDurationSelection(totalMinutes) {
        const minutes = Math.max(1, Math.floor(totalMinutes));
        return minutes === 1 ? "1 minute" : `${minutes} minutes`;
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





    // SEGMENT A3 — Home Canvas Layout Sync + Draft Helpers END
    // SEGMENT B1 — Home Canvas Scene + Variable Controls START
    const layoutColorAssetKey = "app-edge-color";
    const layoutColorAssetLabel = "shell-background";
    const layoutEdgeColorVariableName = "--pl-art-app-edge-color";
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    const layoutSceneSelect = document.getElementById("pl-layout-scene-select");
    const layoutSceneName = document.getElementById("pl-layout-scene-name");
    const defaultLayoutSceneKey = "home";
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

    const layoutAssetField = layoutAssetSelect.closest(".pl-field");
    const layoutScaleField = layoutScale.closest(".pl-field");
    const layoutXField = layoutX.closest(".pl-field");
    const layoutYField = layoutY.closest(".pl-field");
    const layoutWidthField = layoutWidth.closest(".pl-field");
    const layoutHeightField = layoutHeight.closest(".pl-field");

    const defaultLayoutEdgeColor = normalizeHexColor(
        getComputedStyle(document.documentElement).getPropertyValue(layoutEdgeColorVariableName),
        "#01ff75");

    let sharedLayoutVariables = {};
    let currentVariableDraftKey = null;
    let currentVariableDraftValue = null;

    let layoutColorField = null;
    let layoutColorPicker = null;
    let layoutColorText = null;
    let layoutColorHint = null;

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

    function getLayoutSceneDefinition(sceneKey) {
        return layoutSceneDefinitions[sceneKey] || layoutSceneDefinitions[defaultLayoutSceneKey];
    }

    function getLayoutSceneAssetKeys(sceneKey) {
        return getLayoutSceneDefinition(sceneKey).assets.filter(function (assetKey) {
            return isVariableAsset(assetKey) || !!layoutAssets[assetKey];
        });
    }

    function findLayoutSceneKeyForAsset(assetKey) {
        if (!assetKey) {
            return defaultLayoutSceneKey;
        }

        const matchingSceneEntry = Object.entries(layoutSceneDefinitions).find(function ([, sceneDefinition]) {
            return sceneDefinition.assets.includes(assetKey);
        });

        return matchingSceneEntry ? matchingSceneEntry[0] : defaultLayoutSceneKey;
    }

    function updateLayoutSceneHeader(sceneKey) {
        if (!layoutSceneName) {
            return;
        }

        layoutSceneName.textContent = getLayoutSceneDefinition(sceneKey).label;
    }

    function populateLayoutAssetSelectForScene(sceneKey, preferredAssetKey = null) {
        if (!layoutAssetSelect) {
            return "";
        }

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

    function setActiveLayoutScene(sceneKey, preferredAssetKey = null) {
        const resolvedSceneKey = layoutSceneDefinitions[sceneKey]
            ? sceneKey
            : findLayoutSceneKeyForAsset(preferredAssetKey);

        if (layoutSceneSelect) {
            layoutSceneSelect.value = resolvedSceneKey;
        }

        updateLayoutSceneHeader(resolvedSceneKey);
        return populateLayoutAssetSelectForScene(resolvedSceneKey, preferredAssetKey);
    }

    function initializeLayoutSceneControls() {
        const initialAssetKey = layoutAssetSelect?.value || "home-scene";
        const initialSceneKey = layoutSceneDefinitions[layoutSceneSelect?.value]
            ? layoutSceneSelect.value
            : findLayoutSceneKeyForAsset(initialAssetKey);

        setActiveLayoutScene(initialSceneKey, initialAssetKey);
    }

    function selectLayoutAsset(assetKey) {
        return setActiveLayoutScene(findLayoutSceneKeyForAsset(assetKey), assetKey);
    }

    function ensureLayoutColorAssetSelected() {
        if (layoutAssetSelect.value === layoutColorAssetKey) {
            return;
        }

        selectLayoutAsset(layoutColorAssetKey);
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

    // SEGMENT B1 — Home Canvas Scene + Variable Controls END
    // SEGMENT B2 — Home Canvas Layout Variable Editors START
    function ensureLayoutVariableControls() {
        if (!layoutAssetSelect) {
            return;
        }

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
        } else {
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

    // SEGMENT B2 — Home Canvas Layout Variable Editors END
    // SEGMENT B3 — Home Canvas Layout Rendering + Status START
    function updateSliderVisuals() {
        const state = getEffectiveLayoutState("slider");
        const authorWidth = Math.max(20, state.width * (state.scale / 100));
        const authorHeight = getResolvedHeight("slider", state) * (state.scale / 100);
        const projected = projectUiAssetRect(state, authorWidth, authorHeight);
        const sliderMetric = artMetrics["slider"];
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
        const defaultNibCenter = nibMetric && nibMetric.hasVisibleBounds
            ? projected.width * (nibMetric.visibleLeftRatio + (nibMetric.visibleWidthRatio / 2))
            : projected.width / 2;
        const translateX = Math.round(targetCenter - defaultNibCenter);
        const fillWidth = Math.max(0, Math.min(projected.width, Math.round(targetCenter)));

        sliderGroup.style.left = `${projected.left}px`;
        sliderGroup.style.top = `${projected.top}px`;
        sliderGroup.style.width = `${projected.width}px`;
        sliderGroup.style.height = `${projected.height}px`;
        sliderGroup.style.transform = "scale(1)";

        sliderTrackShell.style.width = `${projected.width}px`;
        sliderTrackShell.style.height = `${projected.height}px`;

        sliderTrackEmptyArt.style.width = `${projected.width}px`;
        sliderTrackEmptyArt.style.height = `${projected.height}px`;

        sliderFillShell.style.width = `${fillWidth}px`;
        sliderFillShell.style.height = `${projected.height}px`;

        sliderFillArt.style.width = `${projected.width}px`;
        sliderFillArt.style.height = `${projected.height}px`;

        sliderNibVisual.style.width = `${projected.width}px`;
        sliderNibVisual.style.height = `${projected.height}px`;
        sliderNibVisual.style.transform = `translateX(${translateX}px)`;

        durationSlider.style.pointerEvents = layoutModeEnabled ? "none" : "auto";
    }

    function updateDurationReadout() {
        durationText.textContent = formatDurationSelection(parseInt(durationSlider.value || "5", 10));
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
                element.style.pointerEvents = "none";
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
    }

    function refreshLayoutSelection() {
        const selectedAssetKey = layoutAssetSelect.value;

        Object.entries(layoutAssets).forEach(function ([assetKey, config]) {
            const state = getEffectiveLayoutState(assetKey);
            const status = getVisibilityStatus(assetKey, state);
            const isSelected = layoutModeEnabled && assetKey === selectedAssetKey;

            config.element.classList.toggle("pl-layout-selected", isSelected);
            config.element.classList.toggle(
                "pl-layout-selected-unsafe",
                isSelected && (!status.xStatus.inside || !status.yStatus.inside));
        });
    }

    function updateLayoutSliderBounds(assetKey) {
        if (isVariableAsset(assetKey)) {
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

    function updateLayoutCodePreview(assetKey) {
        if (isVariableAsset(assetKey)) {
            layoutCode.value =
                `:root {
  --pl-art-app-edge-color: ${getEffectiveLayoutVariable("appEdgeColor")};
}`;
            return;
        }

        const state = getEffectiveLayoutState(assetKey);
        const resolvedHeight = getResolvedHeight(assetKey, state);
        const ratioLocked = !!artMetrics[assetKey];

        if (ratioLocked) {
            layoutCode.value =
                `.pl-home-screen {
  --pl-layout-${assetKey}-x: ${Math.round(state.x)}px;
  --pl-layout-${assetKey}-y: ${Math.round(state.y)}px;
  --pl-layout-${assetKey}-width: ${Math.round(state.width)}px;
  --pl-layout-${assetKey}-scale: ${Math.round(state.scale)};
}

/* Height auto from asset ratio: ${resolvedHeight}px */`;
            return;
        }

        layoutCode.value =
            `.pl-home-screen {
  --pl-layout-${assetKey}-x: ${Math.round(state.x)}px;
  --pl-layout-${assetKey}-y: ${Math.round(state.y)}px;
  --pl-layout-${assetKey}-width: ${Math.round(state.width)}px;
  --pl-layout-${assetKey}-height: ${Math.round(state.height)}px;
  --pl-layout-${assetKey}-scale: ${Math.round(state.scale)};
}`;
    }

    function updateLayoutStatusDisplay(assetKey) {
        if (isVariableAsset(assetKey)) {
            layoutStageStatus.textContent = "Shell background · colors the edge fill outside the authored canvas.";
            layoutSafeZoneStatus.textContent = "Used for desktop chrome and the iPhone edge / bottom-bar tint fallback.";
            layoutSafeZoneStatus.classList.remove("pl-layout-field-hint-safe");
            layoutSafeZoneStatus.classList.remove("pl-layout-field-hint-unsafe");
            layoutScaleValue.textContent = getEffectiveLayoutVariable("appEdgeColor").toUpperCase();
            layoutXValue.textContent = "Not position-based";
            layoutYValue.textContent = "Not position-based";

            if (layoutColorHint) {
                layoutColorHint.textContent = "Press Save Selected to keep this shell background color. It is saved through LayoutSync and mirrored into the theme-color meta.";
            }

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
        layoutSafeZoneStatus.classList.toggle("pl-layout-field-hint-safe", status.xStatus.inside && status.yStatus.inside);
        layoutSafeZoneStatus.classList.toggle("pl-layout-field-hint-unsafe", !status.xStatus.inside || !status.yStatus.inside);
        layoutScaleValue.textContent = `${Math.round(state.scale)}%`;
        layoutXValue.textContent = status.xStatus.text;
        layoutYValue.textContent = status.yStatus.text;

        if (layoutColorHint) {
            layoutColorHint.textContent = "Available only in the App shell scene.";
        }
    }

    function syncNumberPairs() {
        layoutScaleNumber.value = layoutScale.value;
        layoutXNumber.value = layoutX.value;
        layoutYNumber.value = layoutY.value;
    }

    function refreshLayoutUi() {
        ensureLayoutVariableControls();
        updateLayoutSceneHeader(layoutSceneSelect?.value || defaultLayoutSceneKey);

        const assetKey = layoutAssetSelect.value;

        if (!assetKey) {
            setLayoutColorFieldHidden(true);
            return;
        }

        if (isVariableAsset(assetKey)) {
            setGeometryFieldsHidden(true);
            setLayoutColorFieldHidden(false);
            previewLayoutAsset("home-scene");
            applyAllAssetLayouts();
            syncLayoutColorInputs(getEffectiveLayoutVariable("appEdgeColor"));
            updateLayoutCodePreview(assetKey);
            updateLayoutStatusDisplay(assetKey);
            refreshLayoutSelection();
            return;
        }

        setGeometryFieldsHidden(false);
        setLayoutColorFieldHidden(true);
        syncLayoutColorInputs(getEffectiveLayoutVariable("appEdgeColor"));

        const state = getEffectiveLayoutState(assetKey);
        const resolvedHeight = getResolvedHeight(assetKey, state);
        const ratioLocked = !!artMetrics[assetKey];

        previewLayoutAsset(assetKey);
        updateLayoutSliderBounds(assetKey);
        applyAllAssetLayouts();

        layoutScale.value = String(Math.round(state.scale));
        layoutX.value = String(Math.round(state.x));
        layoutY.value = String(Math.round(state.y));
        layoutWidth.value = String(Math.round(state.width));
        layoutHeight.value = String(Math.round(resolvedHeight));

        syncNumberPairs();

        layoutHeight.disabled = ratioLocked;
        layoutHeight.readOnly = ratioLocked;
        layoutHeightLabel.textContent = ratioLocked ? "Height (auto)" : "Height (px)";
        layoutHeightHint.textContent = ratioLocked
            ? "Image-backed assets keep their natural aspect ratio automatically."
            : "";

        updateLayoutCodePreview(assetKey);
        updateLayoutStatusDisplay(assetKey);
        refreshLayoutSelection();
    }

    // SEGMENT B3 — Home Canvas Layout Rendering + Status END
    // SEGMENT B4 — Home Canvas Layout Actions + Dragging START
    function buildPartialStateFromControls() {
        const assetKey = layoutAssetSelect.value;

        if (isVariableAsset(assetKey)) {
            return null;
        }

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

    function pushLayoutControlValues() {
        if (isVariableAsset(layoutAssetSelect.value)) {
            return;
        }

        const partial = buildPartialStateFromControls();

        if (!partial) {
            return;
        }

        beginDraftForSelected(partial);
        updateLayoutSliderBounds(layoutAssetSelect.value);

        layoutScale.value = String(Math.round(currentDraftState.scale));
        layoutX.value = String(Math.round(currentDraftState.x));
        layoutY.value = String(Math.round(currentDraftState.y));

        syncNumberPairs();

        applyAssetLayout(layoutAssetSelect.value);
        updateLayoutCodePreview(layoutAssetSelect.value);
        updateLayoutStatusDisplay(layoutAssetSelect.value);
        refreshLayoutSelection();
    }

    async function saveSelectedLayoutAsset() {
        const assetKey = layoutAssetSelect.value;

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

        if (currentDraftAssetKey !== assetKey || !currentDraftState) {
            return;
        }

        sharedLayoutState[assetKey] = {
            x: currentDraftState.x,
            y: currentDraftState.y,
            width: currentDraftState.width,
            height: currentDraftState.height,
            scale: currentDraftState.scale
        };

        currentDraftAssetKey = null;
        currentDraftState = null;

        await saveSharedLayoutState();
        applyAllAssetLayouts();
        refreshLayoutUi();
    }

    function revertSelectedLayoutAsset() {
        const assetKey = layoutAssetSelect.value;

        if (isVariableAsset(assetKey)) {
            discardVariableDraft();
            refreshLayoutUi();
            return;
        }

        discardCurrentDraft();
        refreshLayoutUi();
    }

    function resetSelectedLayoutAsset() {
        const assetKey = layoutAssetSelect.value;

        if (isVariableAsset(assetKey)) {
            beginVariableDraft("appEdgeColor", getCssLayoutVariableDefaults().appEdgeColor);
            syncLayoutColorInputs(currentVariableDraftValue);
            updateLayoutCodePreview(assetKey);
            updateLayoutStatusDisplay(assetKey);
            return;
        }

        beginDraftForSelected(getCssLayoutDefaults(assetKey));
        applyAssetLayout(assetKey);
        refreshLayoutUi();
    }

    async function resetAllLayoutAssets() {
        sharedLayoutState = {};
        sharedLayoutVariables = {};
        currentDraftAssetKey = null;
        currentDraftState = null;
        currentVariableDraftKey = null;
        currentVariableDraftValue = null;

        await saveSharedLayoutState();
        applyAllAssetLayouts();
        refreshLayoutUi();
    }

    function handleLayoutSceneChange() {
        const newAssetKey = setActiveLayoutScene(layoutSceneSelect?.value || defaultLayoutSceneKey, layoutAssetSelect.value);

        if (currentDraftAssetKey && currentDraftAssetKey !== newAssetKey) {
            discardCurrentDraft();
        }

        if (currentVariableDraftKey && newAssetKey !== layoutColorAssetKey) {
            discardVariableDraft();
        }

        refreshLayoutUi();
    }

    function handleLayoutAssetChange() {
        const newAssetKey = layoutAssetSelect.value;

        if (currentDraftAssetKey && currentDraftAssetKey !== newAssetKey) {
            discardCurrentDraft();
        }

        if (currentVariableDraftKey && newAssetKey !== layoutColorAssetKey) {
            discardVariableDraft();
        }

        refreshLayoutUi();
    }

    function beginDrag(assetKey, event) {
        if (!layoutModeEnabled || layoutAssetSelect.value !== assetKey || isVariableAsset(assetKey)) {
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

        applyAssetLayout(assetKey);
        updateLayoutSliderBounds(assetKey);

        layoutX.value = String(Math.round(currentDraftState.x));
        layoutY.value = String(Math.round(currentDraftState.y));
        syncNumberPairs();

        updateLayoutCodePreview(assetKey);
        updateLayoutStatusDisplay(assetKey);
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

    initializeLayoutSceneControls();

    if (layoutSceneSelect) {
        layoutSceneSelect.addEventListener("change", handleLayoutSceneChange);
    }



    // SEGMENT B4 — Home Canvas Layout Actions + Dragging END
    // SEGMENT C1 — Home Canvas View States + Reward Hydration START
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
        durationSlider.disabled = isLocked;
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
        showSetupState();
        setupPanel.classList.add("pl-setup-panel-locked");
        setSetupChildrenLocked(true);
        setRunVisible(true);
        runStateLabel.textContent = "Time remaining";
        runReadout.textContent = "00:25:00";
        runElapsed.textContent = "00:10:00";
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
        if (!layoutModeEnabled) {
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
        runReadout.textContent = "00:05:00";
        runElapsed.textContent = "00:00:00";
        progressFill.style.width = "0%";
        runNote.textContent = "Cancel before 1 minute to discard this session with no save.";
        updateDurationReadout();
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

    // SEGMENT C1 — Home Canvas View States + Reward Hydration END
    // SEGMENT C2 — Home Canvas Runtime Save + Update Loop START
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

        runReadout.textContent = formatClock(remainingSeconds);
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
        if (layoutModeEnabled && layoutAssetSelect.value === "home-focus") {
            return;
        }

        openFocusSetup();
    });

    closeFocusButton.addEventListener("click", function () {
        if (layoutModeEnabled && layoutAssetSelect.value === "back") {
            return;
        }

        returnToHome();
    });

    durationSlider.addEventListener("input", function () {
        updateDurationReadout();
    });

    startFocusButton.addEventListener("click", function () {
        if (isSubmitting || (layoutModeEnabled && layoutAssetSelect.value === "start")) {
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
        runPanel.hidden = false;
        pauseButton.hidden = false;
        exitButton.hidden = false;
        startFocusButton.hidden = true;
        closeFocusButton.hidden = true;

        runStateLabel.textContent = "Time remaining";
        setButtonLabel(pauseButton, "Pause");
        setButtonLabel(exitButton, "Cancel");

        updateUi();
    });

    pauseButton.addEventListener("click", function () {
        if (!isRunning || isSubmitting || !confirmPanel.hidden || (layoutModeEnabled && layoutAssetSelect.value === "pause")) {
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
        if (!isRunning || isSubmitting || (layoutModeEnabled && layoutAssetSelect.value === "exit")) {
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
        if (isSubmitting || (layoutModeEnabled && layoutAssetSelect.value === "keep-going")) {
            return;
        }

        setConfirmVisible(false);
    });

    confirmStopButton.addEventListener("click", function () {
        if (isSubmitting || (layoutModeEnabled && layoutAssetSelect.value === "stop")) {
            return;
        }

        submitSave("stop");
    });

    rewardCloseButton.addEventListener("click", function () {
        if (layoutModeEnabled && layoutAssetSelect.value === "gotcha") {
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

    Object.entries(layoutAssets).forEach(([assetKey, config]) => {
        config.element.addEventListener("pointerdown", function (event) {
            beginDrag(assetKey, event);
        });

        config.element.addEventListener("click", function (event) {
            if (layoutModeEnabled && layoutAssetSelect.value === assetKey) {
                event.preventDefault();
                event.stopPropagation();
            }
        }, true);
    });

    // SEGMENT C2 — Home Canvas Runtime Save + Update Loop END
    // SEGMENT C3 — Home Canvas Wiring + Initialization START
    function wireLayoutInputs() {
        const rangeToNumberPairs = [
            [layoutScale, layoutScaleNumber],
            [layoutX, layoutXNumber],
            [layoutY, layoutYNumber]
        ];

        rangeToNumberPairs.forEach(([rangeInput, numberInput]) => {
            rangeInput.addEventListener("input", function () {
                numberInput.value = rangeInput.value;
                pushLayoutControlValues();
            });

            numberInput.addEventListener("input", function () {
                rangeInput.value = numberInput.value;
                pushLayoutControlValues();
            });
        });

        layoutWidth.addEventListener("input", pushLayoutControlValues);
        layoutHeight.addEventListener("input", pushLayoutControlValues);
        layoutAssetSelect.addEventListener("change", handleLayoutAssetChange);
        layoutSaveSelected.addEventListener("click", saveSelectedLayoutAsset);
        layoutRevertSelected.addEventListener("click", revertSelectedLayoutAsset);
        layoutResetSelected.addEventListener("click", resetSelectedLayoutAsset);
        layoutResetAll.addEventListener("click", resetAllLayoutAssets);
    }

    async function awaitFirstPaintArtMetrics() {
        const loadTasks = Object.entries(artImageVars).map(([assetKey, cssVar]) => {
            const url = readCssUrlVar(cssVar);

            if (!url) {
                return Promise.resolve();
            }

            if (artMetrics[assetKey]) {
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

                @media (max-width: 640px) {
                    .pl-layout-panel {
                        max-height: calc(100dvh - 1.5rem);
                    }
                }
            `;
            document.head.appendChild(style);
        }

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
            refreshLayoutUi();
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
    // SEGMENT C3 — Home Canvas Wiring + Initialization END
})();
