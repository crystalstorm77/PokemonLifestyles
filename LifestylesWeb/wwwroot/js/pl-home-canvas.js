// SEGMENT A START — Home Stage Bootstrap
(function () {
    const appShell = document.querySelector(".app-shell");
    const homeStageShell = document.getElementById("pl-home-stage-shell");
    const homeStage = document.getElementById("pl-home-stage");
    const homeRoot = document.getElementById("pl-home-root");
    const worldStageShell = document.getElementById("pl-world-stage-shell");
    const worldStage = document.getElementById("pl-world-stage");
    const safeUiStageShell = document.getElementById("pl-safe-ui-stage-shell");
    const safeUiStage = document.getElementById("pl-safe-ui-stage");
    const safeZoneOutline = document.getElementById("pl-safe-zone-outline");

    if (!homeStageShell || !homeStage || !homeRoot || !worldStageShell || !worldStage || !safeUiStageShell || !safeUiStage || !safeZoneOutline) {
        return;
    }

    const layoutModeEnabled = new URL(window.location.href).searchParams.get("layout") === "1";
    const desktopPointerQuery = window.matchMedia("(pointer:fine)");
    let firstPaintReady = false;

    homeStageShell.style.visibility = "hidden";
    homeStageShell.dataset.stageReady = "false";

    function readDesignPx(varName, fallbackValue) {
        const raw = getComputedStyle(homeRoot).getPropertyValue(varName).trim();

        if (!raw) {
            return fallbackValue;
        }

        const parsed = parseFloat(raw.replace("px", ""));
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackValue;
    }

    function readViewportSize() {
        const width = window.innerWidth || document.documentElement.clientWidth || 0;
        const height = window.innerHeight || document.documentElement.clientHeight || 0;

        return {
            width: Math.max(1, width),
            height: Math.max(1, height)
        };
    }

    function readDisplayMode() {
        if (window.matchMedia("(display-mode: standalone)").matches) {
            return "standalone";
        }

        if (window.navigator.standalone === true) {
            return "standalone";
        }

        if (window.matchMedia("(display-mode: fullscreen)").matches) {
            return "fullscreen";
        }

        return "browser";
    }

    function parsePx(value) {
        const parsed = parseFloat(String(value || "").replace("px", "").trim());
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function readSafeAreaInsets() {
        let probe = document.getElementById("pl-safe-area-probe");

        if (!probe) {
            probe = document.createElement("div");
            probe.id = "pl-safe-area-probe";
            probe.setAttribute("aria-hidden", "true");
            probe.style.position = "fixed";
            probe.style.left = "0";
            probe.style.top = "0";
            probe.style.visibility = "hidden";
            probe.style.pointerEvents = "none";
            probe.style.paddingTop = "env(safe-area-inset-top, 0px)";
            probe.style.paddingRight = "env(safe-area-inset-right, 0px)";
            probe.style.paddingBottom = "env(safe-area-inset-bottom, 0px)";
            probe.style.paddingLeft = "env(safe-area-inset-left, 0px)";
            document.body.appendChild(probe);
        }

        const computed = window.getComputedStyle(probe);

        return {
            top: parsePx(computed.paddingTop),
            right: parsePx(computed.paddingRight),
            bottom: parsePx(computed.paddingBottom),
            left: parsePx(computed.paddingLeft)
        };
    }

    function round3(value) {
        return Math.round(value * 1000) / 1000;
    }

    function setShellBox(element, left, top, width, height) {
        element.style.left = `${round3(left)}px`;
        element.style.top = `${round3(top)}px`;
        element.style.width = `${round3(width)}px`;
        element.style.height = `${round3(height)}px`;
    }

    function setDesktopPreviewClasses(isEnabled) {
        homeStageShell.classList.toggle("pl-desktop-preview-mode", isEnabled);
        homeStage.classList.toggle("pl-desktop-preview-mode", isEnabled);
        homeRoot.classList.toggle("pl-desktop-preview-mode", isEnabled);
    }

    function resetRuntimeShellStyles() {
        if (appShell) {
            appShell.style.removeProperty("justify-content");
            appShell.style.removeProperty("align-items");
            appShell.style.removeProperty("padding");
        }

        homeStageShell.style.removeProperty("width");
        homeStageShell.style.removeProperty("height");
        homeStageShell.style.removeProperty("margin");
        homeStageShell.style.removeProperty("flex");
        homeStageShell.style.removeProperty("align-self");

        homeStage.style.removeProperty("width");
        homeStage.style.removeProperty("height");
        homeStage.style.removeProperty("transform");
        homeStage.style.removeProperty("transform-origin");
    }

    function applyDesktopPreviewShellStyles(renderWidth, renderHeight, previewScale, designWidth, designHeight) {
        if (appShell) {
            appShell.style.justifyContent = "center";
            appShell.style.alignItems = "flex-start";
            appShell.style.padding = "0";
        }

        homeStageShell.style.width = `${round3(renderWidth)}px`;
        homeStageShell.style.height = `${round3(renderHeight)}px`;
        homeStageShell.style.margin = "0 auto";
        homeStageShell.style.flex = "0 0 auto";
        homeStageShell.style.alignSelf = "flex-start";

        homeStage.style.width = `${round3(designWidth)}px`;
        homeStage.style.height = `${round3(designHeight)}px`;
        homeStage.style.transformOrigin = "top left";
        homeStage.style.transform = `scale(${round3(previewScale)})`;
    }

    function shouldUseDesktopPreviewMode(displayMode) {
        return displayMode === "browser" && desktopPointerQuery.matches;
    }

    function markStageReady() {
        firstPaintReady = true;
        homeStageShell.style.visibility = "visible";
        homeStageShell.dataset.stageReady = "true";
    }

    window.addEventListener("pl-home-first-paint-ready", function () {
        markStageReady();
    }, { once: true });
    // SEGMENT A END — Home Stage Bootstrap

    // SEGMENT B START — Home Stage Measurements
    function applyHomeStageLayout() {
        const designWidth = readDesignPx("--pl-home-screen-width", 428);
        const designHeight = readDesignPx("--pl-home-screen-height", 926);

        const uiAuthorLeft = readDesignPx("--pl-safe-ui-author-left", 0);
        const uiAuthorTop = readDesignPx("--pl-safe-ui-author-top", 0);
        const uiAuthorWidth = readDesignPx("--pl-safe-ui-author-width", designWidth);
        const uiAuthorHeight = readDesignPx("--pl-safe-ui-author-height", 879);

        const viewport = readViewportSize();
        const safeArea = readSafeAreaInsets();
        const displayMode = readDisplayMode();
        const desktopPreviewMode = shouldUseDesktopPreviewMode(displayMode);

        setDesktopPreviewClasses(desktopPreviewMode);

        let rootWidth = designWidth;
        let rootHeight = designHeight;

        let worldScale = 1;
        let worldRenderWidth = designWidth;
        let worldRenderHeight = designHeight;
        let worldLeft = 0;
        let worldTop = 0;

        let safeFrameLeft = uiAuthorLeft;
        let safeFrameTop = uiAuthorTop;
        let safeFrameWidth = uiAuthorWidth;
        let safeFrameHeight = uiAuthorHeight;

        let safeUiScale = 1;
        let safeUiRenderWidth = uiAuthorWidth;
        let safeUiRenderHeight = uiAuthorHeight;
        let safeUiLeft = uiAuthorLeft;
        let safeUiTop = uiAuthorTop;

        let previewScale = 1;

        if (desktopPreviewMode) {
            const previewHorizontalPadding = layoutModeEnabled ? 72 : 24;
            const previewVerticalPadding = layoutModeEnabled ? 18 : 24;

            previewScale = Math.min(
                1,
                Math.max(0.1, (viewport.width - (previewHorizontalPadding * 2)) / designWidth),
                Math.max(0.1, (viewport.height - (previewVerticalPadding * 2)) / designHeight)
            );

            applyDesktopPreviewShellStyles(
                designWidth * previewScale,
                designHeight * previewScale,
                previewScale,
                designWidth,
                designHeight
            );
        }
        else {
            resetRuntimeShellStyles();

            rootWidth = viewport.width;
            rootHeight = viewport.height;

            worldScale = Math.max(rootWidth / designWidth, rootHeight / designHeight);
            worldRenderWidth = designWidth * worldScale;
            worldRenderHeight = designHeight * worldScale;
            worldLeft = (rootWidth - worldRenderWidth) / 2;
            worldTop = (rootHeight - worldRenderHeight) / 2;

            safeUiScale = Math.min(
                rootWidth / uiAuthorWidth,
                rootHeight / uiAuthorHeight
            );

            safeUiRenderWidth = uiAuthorWidth * safeUiScale;
            safeUiRenderHeight = uiAuthorHeight * safeUiScale;
            safeUiLeft = (rootWidth - safeUiRenderWidth) / 2;
            safeUiTop = 0;

            safeFrameLeft = safeUiLeft;
            safeFrameTop = safeUiTop;
            safeFrameWidth = safeUiRenderWidth;
            safeFrameHeight = safeUiRenderHeight;
        }

        homeRoot.style.width = `${round3(rootWidth)}px`;
        homeRoot.style.height = `${round3(rootHeight)}px`;

        worldStage.style.width = `${round3(designWidth)}px`;
        worldStage.style.height = `${round3(designHeight)}px`;
        safeUiStage.style.width = `${round3(uiAuthorWidth)}px`;
        safeUiStage.style.height = `${round3(uiAuthorHeight)}px`;

        setShellBox(worldStageShell, worldLeft, worldTop, worldRenderWidth, worldRenderHeight);
        worldStage.style.transform = `scale(${round3(worldScale)})`;

        setShellBox(safeUiStageShell, safeUiLeft, safeUiTop, safeUiRenderWidth, safeUiRenderHeight);
        safeUiStage.style.transform = `scale(${round3(safeUiScale)})`;

        setShellBox(safeZoneOutline, safeFrameLeft, safeFrameTop, safeFrameWidth, safeFrameHeight);

        homeRoot.dataset.stageDisplayMode = displayMode;
        homeRoot.dataset.desktopPreviewMode = desktopPreviewMode ? "true" : "false";
        homeRoot.dataset.desktopPreviewScale = String(round3(previewScale));

        homeRoot.dataset.viewportWidth = String(round3(rootWidth));
        homeRoot.dataset.viewportHeight = String(round3(rootHeight));

        homeRoot.dataset.worldStageScale = String(round3(worldScale));
        homeRoot.dataset.worldStageRenderWidth = String(round3(worldRenderWidth));
        homeRoot.dataset.worldStageRenderHeight = String(round3(worldRenderHeight));

        homeRoot.dataset.uiAuthorFrameLeft = String(round3(uiAuthorLeft));
        homeRoot.dataset.uiAuthorFrameTop = String(round3(uiAuthorTop));
        homeRoot.dataset.uiAuthorFrameWidth = String(round3(uiAuthorWidth));
        homeRoot.dataset.uiAuthorFrameHeight = String(round3(uiAuthorHeight));

        homeRoot.dataset.safeUiStageScale = String(round3(safeUiScale));
        homeRoot.dataset.safeUiStageRenderWidth = String(round3(safeUiRenderWidth));
        homeRoot.dataset.safeUiStageRenderHeight = String(round3(safeUiRenderHeight));

        homeRoot.dataset.safeFrameLeft = String(round3(safeFrameLeft));
        homeRoot.dataset.safeFrameTop = String(round3(safeFrameTop));
        homeRoot.dataset.safeFrameWidth = String(round3(safeFrameWidth));
        homeRoot.dataset.safeFrameHeight = String(round3(safeFrameHeight));

        homeRoot.dataset.safeAreaTop = String(round3(safeArea.top));
        homeRoot.dataset.safeAreaRight = String(round3(safeArea.right));
        homeRoot.dataset.safeAreaBottom = String(round3(safeArea.bottom));
        homeRoot.dataset.safeAreaLeft = String(round3(safeArea.left));

        if (firstPaintReady) {
            markStageReady();
        }
        else {
            homeStageShell.style.visibility = "hidden";
            homeStageShell.dataset.stageReady = "false";
        }

        try {
            window.scrollTo(0, 0);
        }
        catch {
        }

        window.dispatchEvent(new CustomEvent("pl-home-stage-resized", {
            detail: {
                displayMode,
                desktopPreviewMode,
                previewScale,
                viewportWidth: rootWidth,
                viewportHeight: rootHeight,
                worldScale,
                safeUiScale,
                safeFrameLeft,
                safeFrameTop,
                safeFrameWidth,
                safeFrameHeight,
                uiAuthorLeft,
                uiAuthorTop,
                uiAuthorWidth,
                uiAuthorHeight
            }
        }));
    }

    function initializeHomeStageLayout() {
        applyHomeStageLayout();

        window.addEventListener("resize", applyHomeStageLayout);
        window.addEventListener("pageshow", applyHomeStageLayout);

        if (desktopPointerQuery.addEventListener) {
            desktopPointerQuery.addEventListener("change", applyHomeStageLayout);
        }
        else if (desktopPointerQuery.addListener) {
            desktopPointerQuery.addListener(applyHomeStageLayout);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeHomeStageLayout, { once: true });
    }
    else {
        initializeHomeStageLayout();
    }
})();
// SEGMENT B END — Home Stage Measurements



    // SEGMENT C START — Home Canvas App Flow
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

    async function initializeAsync() {
        applyPanelArtStates();
        await Promise.all([
            loadSharedLayoutState(),
            awaitFirstPaintArtMetrics()
        ]);

        homeRoot.classList.toggle("pl-layout-mode", layoutModeEnabled);
        safeZoneOutline.hidden = !layoutModeEnabled;

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
})();
// SEGMENT C END — Home Canvas App Flow