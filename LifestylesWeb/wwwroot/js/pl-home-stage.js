(function () {
    //#region SEGMENT A - Element Discovery And Runtime Flags
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

    const layoutModeStorageKey = "plLayoutModeRequested";

    function readStandaloneLayoutModePreference() {
        try {
            return window.localStorage.getItem(layoutModeStorageKey) === "1";
        }
        catch {
            return false;
        }
    }

    function writeStandaloneLayoutModePreference(isEnabled) {
        try {
            window.localStorage.setItem(layoutModeStorageKey, isEnabled ? "1" : "0");
        }
        catch {
        }
    }

    const layoutModeParam = new URL(window.location.href).searchParams.get("layout");
    if (layoutModeParam === "1") {
        writeStandaloneLayoutModePreference(true);
    } else if (layoutModeParam === "0") {
        writeStandaloneLayoutModePreference(false);
    }

    const standaloneDisplayRequested =
        window.matchMedia("(display-mode: standalone)").matches
        || window.navigator.standalone === true;
    const layoutModeEnabled = layoutModeParam === "1"
        || (layoutModeParam !== "0" && standaloneDisplayRequested && readStandaloneLayoutModePreference());
    const desktopPointerQuery = window.matchMedia("(pointer:fine)");
    const standaloneStartupLock = {
        lockedFrame: null,
        settleRafId: 0,
        settleActive: false,
        bestFrame: null,
        sessionId: 0
    };

    let firstPaintReady = false;
    let standaloneDeferredLayoutTimeoutId = 0;
    let standaloneDeferredLayoutPassesRemaining = 0;
    let keyboardDeferredLayoutTimeoutId = 0;

    homeStageShell.style.visibility = "hidden";
    homeStageShell.dataset.stageReady = "false";
    //#endregion SEGMENT A - Element Discovery And Runtime Flags

    //#region SEGMENT B - Basic Measurement Helpers
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

    function isStandaloneDisplayMode(displayMode) {
        return displayMode === "standalone";
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

    function isEditableElement(element) {
        if (!element) {
            return false;
        }

        const tagName = String(element.tagName || "").toUpperCase();

        if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
            return true;
        }

        return element.isContentEditable === true;
    }

    function buildSafeFrame(rootWidth, rootHeight, safeArea, uiAuthorTop) {
        const safeFrameLeft = Math.max(0, safeArea.left);
        const safeFrameTop = Math.max(uiAuthorTop, safeArea.top);
        const safeFrameRightInset = Math.max(0, safeArea.right);
        const safeFrameBottomInset = Math.max(0, safeArea.bottom);

        return {
            left: safeFrameLeft,
            top: safeFrameTop,
            width: Math.max(1, rootWidth - safeFrameLeft - safeFrameRightInset),
            height: Math.max(1, rootHeight - safeFrameTop - safeFrameBottomInset)
        };
    }
    //#endregion SEGMENT B - Basic Measurement Helpers

    //#region SEGMENT C - Shell Style Helpers
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
        homeStageShell.style.removeProperty("left");
        homeStageShell.style.removeProperty("top");
        homeStageShell.style.removeProperty("position");
        homeStageShell.style.removeProperty("transform");
        homeStageShell.style.removeProperty("transform-origin");

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
        homeStageShell.style.left = "";
        homeStageShell.style.top = "";
        homeStageShell.style.position = "";

        homeStage.style.width = `${round3(designWidth)}px`;
        homeStage.style.height = `${round3(designHeight)}px`;
        homeStage.style.transformOrigin = "top left";
        homeStage.style.transform = `scale(${round3(previewScale)})`;
    }

    function applyDesktopRuntimeShellStyles(renderWidth, renderHeight) {
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
        homeStageShell.style.left = "";
        homeStageShell.style.top = "";
        homeStageShell.style.position = "";

        homeStage.style.width = `${round3(renderWidth)}px`;
        homeStage.style.height = `${round3(renderHeight)}px`;
        homeStage.style.transformOrigin = "top left";
        homeStage.style.transform = "scale(1)";
    }

    function applyStandaloneRuntimeShellStyles(renderWidth, renderHeight, visualOffsetTop) {
        if (appShell) {
            appShell.style.justifyContent = "flex-start";
            appShell.style.alignItems = "stretch";
            appShell.style.padding = "0";
        }

        homeStageShell.style.width = `${round3(renderWidth)}px`;
        homeStageShell.style.height = `${round3(renderHeight)}px`;
        homeStageShell.style.margin = `${round3(-visualOffsetTop)}px 0 0 0`;
        homeStageShell.style.flex = "0 0 auto";
        homeStageShell.style.alignSelf = "stretch";
        homeStageShell.style.left = "";
        homeStageShell.style.top = "";
        homeStageShell.style.position = "";
        homeStageShell.style.transform = "";
        homeStageShell.style.transformOrigin = "";

        homeStage.style.width = `${round3(renderWidth)}px`;
        homeStage.style.height = `${round3(renderHeight)}px`;
        homeStage.style.transformOrigin = "top left";
        homeStage.style.transform = "scale(1)";
    }

    function applyMobilePortraitLockShellStyles(viewportWidth, viewportHeight, renderWidth, renderHeight, previewScale, rotationDegrees, designWidth, designHeight, centerYOffset) {
        const resolvedCenterYOffset = Number.isFinite(centerYOffset)
            ? centerYOffset
            : 0;

        if (appShell) {
            appShell.style.justifyContent = "center";
            appShell.style.alignItems = "center";
            appShell.style.padding = "0";
        }

        homeStageShell.style.width = `${round3(renderWidth)}px`;
        homeStageShell.style.height = `${round3(renderHeight)}px`;
        homeStageShell.style.margin = "0";
        homeStageShell.style.flex = "0 0 auto";
        homeStageShell.style.alignSelf = "auto";
        homeStageShell.style.position = "absolute";
        homeStageShell.style.left = "50%";
        homeStageShell.style.top = `calc(50% + ${round3(resolvedCenterYOffset)}px)`;
        homeStageShell.style.transformOrigin = "center center";
        homeStageShell.style.transform = `translate(-50%, -50%) rotate(${rotationDegrees}deg)`;

        homeStage.style.width = `${round3(designWidth)}px`;
        homeStage.style.height = `${round3(designHeight)}px`;
        homeStage.style.transformOrigin = "top left";
        homeStage.style.transform = `scale(${round3(previewScale)})`;
    }

    function shouldUseDesktopPreviewMode(displayMode) {
        return layoutModeEnabled && displayMode === "browser" && desktopPointerQuery.matches;
    }

    function shouldUseDesktopRuntimeEmulationMode(displayMode) {
        return !layoutModeEnabled && displayMode === "browser" && desktopPointerQuery.matches;
    }

    function getMobileLandscapeRotationDegrees() {
        const screenAngle = Number(screen.orientation && typeof screen.orientation.angle === "number"
            ? screen.orientation.angle
            : NaN);

        if (Number.isFinite(screenAngle)) {
            const normalized = ((screenAngle % 360) + 360) % 360;

            if (normalized === 90) {
                return -90;
            }

            if (normalized === 270) {
                return 90;
            }
        }

        const windowAngle = Number(typeof window.orientation === "number"
            ? window.orientation
            : NaN);

        if (Number.isFinite(windowAngle)) {
            if (windowAngle === 90) {
                return -90;
            }

            if (windowAngle === -90 || windowAngle === 270) {
                return 90;
            }
        }

        return -90;
    }
    //#endregion SEGMENT C - Shell Style Helpers

    //#region SEGMENT D - Standalone Startup Lock Helpers
    function clearStandaloneStartupSampling() {
        if (standaloneStartupLock.settleRafId) {
            cancelAnimationFrame(standaloneStartupLock.settleRafId);
            standaloneStartupLock.settleRafId = 0;
        }

        standaloneStartupLock.settleActive = false;
        standaloneStartupLock.bestFrame = null;
    }

    function cloneStandaloneFrame(frame) {
        return {
            viewportWidth: frame.viewportWidth,
            viewportHeight: frame.viewportHeight,
            liveViewportWidth: frame.liveViewportWidth,
            liveViewportHeight: frame.liveViewportHeight,
            screenWidth: frame.screenWidth,
            screenHeight: frame.screenHeight,
            safeAreaTop: frame.safeAreaTop,
            safeAreaRight: frame.safeAreaRight,
            safeAreaBottom: frame.safeAreaBottom,
            safeAreaLeft: frame.safeAreaLeft,
            safeFrameLeft: frame.safeFrameLeft,
            safeFrameTop: frame.safeFrameTop,
            safeFrameWidth: frame.safeFrameWidth,
            safeFrameHeight: frame.safeFrameHeight
        };
    }

    function readRuntimeViewport() {
        const visualViewport = window.visualViewport;

        if (
            visualViewport &&
            Number.isFinite(visualViewport.width) &&
            Number.isFinite(visualViewport.height)
        ) {
            return {
                width: Math.max(1, visualViewport.width),
                height: Math.max(1, visualViewport.height)
            };
        }

        return readViewportSize();
    }

    function captureStandaloneRuntimeFrame() {
        const uiAuthorTop = 47;
        const viewport = readRuntimeViewport();
        const safeArea = readSafeAreaInsets();
        const rootWidth = viewport.width;
        const rootHeight = viewport.height + Math.max(0, safeArea.bottom);
        const safeFrame = buildSafeFrame(
            rootWidth,
            rootHeight,
            safeArea,
            uiAuthorTop
        );

        return {
            viewportWidth: rootWidth,
            viewportHeight: rootHeight,
            liveViewportWidth: viewport.width,
            liveViewportHeight: viewport.height,
            screenWidth: Math.max(1, parsePx(window.screen?.width) || viewport.width),
            screenHeight: Math.max(1, parsePx(window.screen?.height) || rootHeight),
            safeAreaTop: safeArea.top,
            safeAreaRight: safeArea.right,
            safeAreaBottom: safeArea.bottom,
            safeAreaLeft: safeArea.left,
            safeFrameLeft: safeFrame.left,
            safeFrameTop: safeFrame.top,
            safeFrameWidth: safeFrame.width,
            safeFrameHeight: safeFrame.height
        };
    }

    function chooseBetterStandaloneFrame(currentBest, candidate) {
        if (!currentBest) {
            return cloneStandaloneFrame(candidate);
        }

        if (candidate.viewportHeight > currentBest.viewportHeight + 0.5) {
            return cloneStandaloneFrame(candidate);
        }

        if (
            Math.abs(candidate.viewportHeight - currentBest.viewportHeight) <= 0.5 &&
            candidate.safeFrameHeight > currentBest.safeFrameHeight + 0.5
        ) {
            return cloneStandaloneFrame(candidate);
        }

        if (
            Math.abs(candidate.viewportHeight - currentBest.viewportHeight) <= 0.5 &&
            Math.abs(candidate.safeFrameHeight - currentBest.safeFrameHeight) <= 0.5 &&
            candidate.viewportWidth > currentBest.viewportWidth + 0.5
        ) {
            return cloneStandaloneFrame(candidate);
        }

        return currentBest;
    }

    function beginStandaloneStartupLock() {
        clearStandaloneStartupSampling();

        standaloneStartupLock.sessionId += 1;
        standaloneStartupLock.settleActive = true;

        const sessionId = standaloneStartupLock.sessionId;
        const initialFrame = captureStandaloneRuntimeFrame();

        standaloneStartupLock.lockedFrame = cloneStandaloneFrame(initialFrame);
        standaloneStartupLock.bestFrame = cloneStandaloneFrame(initialFrame);

        applyHomeStageLayout();

        let remainingFrames = 6;

        function sampleFrame() {
            if (sessionId !== standaloneStartupLock.sessionId) {
                return;
            }

            const candidate = captureStandaloneRuntimeFrame();

            standaloneStartupLock.bestFrame = chooseBetterStandaloneFrame(
                standaloneStartupLock.bestFrame,
                candidate
            );

            remainingFrames -= 1;

            if (remainingFrames > 0) {
                standaloneStartupLock.settleRafId = requestAnimationFrame(sampleFrame);
                return;
            }

            standaloneStartupLock.lockedFrame = cloneStandaloneFrame(
                standaloneStartupLock.bestFrame || candidate
            );
            standaloneStartupLock.settleRafId = 0;
            standaloneStartupLock.settleActive = false;
            standaloneStartupLock.bestFrame = null;

            applyHomeStageLayout();
        }

        standaloneStartupLock.settleRafId = requestAnimationFrame(sampleFrame);
    }
    //#endregion SEGMENT D - Standalone Startup Lock Helpers

    //#region SEGMENT E - Stage Readiness Helpers
    function markStageReady() {
        firstPaintReady = true;

        const displayMode = readDisplayMode();
        const standaloneLockPending = isStandaloneDisplayMode(displayMode) && !standaloneStartupLock.lockedFrame;

        if (standaloneLockPending) {
            homeStageShell.style.visibility = "hidden";
            homeStageShell.dataset.stageReady = "false";
            return;
        }

        homeStageShell.style.visibility = "visible";
        homeStageShell.dataset.stageReady = "true";
    }

    window.addEventListener("pl-home-first-paint-ready", function () {
        markStageReady();
    }, { once: true });
    //#endregion SEGMENT E - Stage Readiness Helpers

    //#region SEGMENT F - Layout Application
    function applyHomeStageLayout() {
        const designWidth = readDesignPx("--pl-home-screen-width", 428);
        const designHeight = readDesignPx("--pl-home-screen-height", 926);
        const uiAuthorLeft = 0;
        const uiAuthorTop = 47;
        const uiAuthorWidth = designWidth;
        const uiAuthorHeight = designHeight - uiAuthorTop;

        const liveViewport = readRuntimeViewport();
        const liveSafeArea = readSafeAreaInsets();
        const displayMode = readDisplayMode();
        const desktopPreviewMode = shouldUseDesktopPreviewMode(displayMode);
        const desktopRuntimeEmulationMode = shouldUseDesktopRuntimeEmulationMode(displayMode);
        const standaloneDisplayMode = isStandaloneDisplayMode(displayMode);
        const standaloneLandscapeMode = standaloneDisplayMode && liveViewport.width > liveViewport.height;
        const mobilePortraitLockMode = !standaloneDisplayMode && !desktopPointerQuery.matches && liveViewport.width > liveViewport.height;
        const mobileLandscapeRotationDegrees = mobilePortraitLockMode
            ? getMobileLandscapeRotationDegrees()
            : 0;
        const activeStandaloneLockFrame =
            standaloneDisplayMode
                ? standaloneStartupLock.lockedFrame
                : null;

        const viewport =
            activeStandaloneLockFrame
                ? {
                    width: activeStandaloneLockFrame.viewportWidth,
                    height: activeStandaloneLockFrame.viewportHeight
                }
                : liveViewport;

        const safeArea =
            activeStandaloneLockFrame
                ? {
                    top: activeStandaloneLockFrame.safeAreaTop,
                    right: activeStandaloneLockFrame.safeAreaRight,
                    bottom: activeStandaloneLockFrame.safeAreaBottom,
                    left: activeStandaloneLockFrame.safeAreaLeft
                }
                : liveSafeArea;

        const standaloneLockPending =
            standaloneDisplayMode && !activeStandaloneLockFrame;
        const standaloneVisualOffsetTop = 0;

        setDesktopPreviewClasses(desktopPreviewMode);

        let rootWidth = designWidth;
        let rootHeight = designHeight;
        let worldScale = 1;
        let worldRenderWidth = designWidth;
        let worldRenderHeight = designHeight;
        let worldLeft = 0;
        let worldTop = 0;
        let worldStageMeasuredScale = 1;
        let safeFrameLeft = uiAuthorLeft;
        let safeFrameTop = uiAuthorTop;
        let safeFrameWidth = uiAuthorWidth;
        let safeFrameHeight = uiAuthorHeight;
        let safeUiRenderWidth = uiAuthorWidth;
        let safeUiRenderHeight = uiAuthorHeight;
        let safeUiLeft = uiAuthorLeft;
        let safeUiTop = uiAuthorTop;
        let safeUiStageMeasuredScale = 1;
        let uiProjectionScale = 1;
        let previewScale = 1;

        if (desktopPreviewMode) {
            const previewHorizontalPadding = 72;
            const previewVerticalPadding = 18;

            previewScale = Math.min(
                1,
                Math.max(0.1, (liveViewport.width - (previewHorizontalPadding * 2)) / designWidth),
                Math.max(0.1, (liveViewport.height - (previewVerticalPadding * 2)) / designHeight)
            );

            applyDesktopPreviewShellStyles(
                designWidth * previewScale,
                designHeight * previewScale,
                previewScale,
                designWidth,
                designHeight
            );

            rootWidth = designWidth;
            rootHeight = designHeight;
            worldScale = 1;
            worldRenderWidth = designWidth;
            worldRenderHeight = designHeight;
            worldLeft = 0;
            worldTop = 0;
            worldStageMeasuredScale = previewScale;
            safeFrameLeft = uiAuthorLeft;
            safeFrameTop = uiAuthorTop;
            safeFrameWidth = uiAuthorWidth;
            safeFrameHeight = uiAuthorHeight;
            safeUiRenderWidth = uiAuthorWidth;
            safeUiRenderHeight = uiAuthorHeight;
            safeUiLeft = uiAuthorLeft;
            safeUiTop = uiAuthorTop;
            safeUiStageMeasuredScale = previewScale;
            uiProjectionScale = 1;
        } else if (desktopRuntimeEmulationMode) {
            resetRuntimeShellStyles();

            rootHeight = liveViewport.height;
            rootWidth = Math.min(
                liveViewport.width,
                Math.round((rootHeight * designWidth) / designHeight)
            );

            applyDesktopRuntimeShellStyles(rootWidth, rootHeight);

            worldScale = Math.max(rootWidth / designWidth, rootHeight / designHeight);
            worldRenderWidth = designWidth * worldScale;
            worldRenderHeight = designHeight * worldScale;
            worldLeft = (rootWidth - worldRenderWidth) / 2;
            worldTop = (rootHeight - worldRenderHeight) / 2;
            worldStageMeasuredScale = worldScale;
            safeFrameLeft = 0;
            safeFrameTop = uiAuthorTop;
            safeFrameWidth = rootWidth;
            safeFrameHeight = Math.max(1, rootHeight - uiAuthorTop);
            safeUiRenderWidth = safeFrameWidth;
            safeUiRenderHeight = safeFrameHeight;
            safeUiLeft = 0;
            safeUiTop = uiAuthorTop;
            safeUiStageMeasuredScale = 1;
            uiProjectionScale = Math.min(
                safeFrameWidth / uiAuthorWidth,
                safeFrameHeight / uiAuthorHeight
            );
        } else if (standaloneDisplayMode && activeStandaloneLockFrame) {
            if (standaloneLandscapeMode) {
                const standaloneLandscapeCenterYOffset =
                    (liveSafeArea.top - liveSafeArea.bottom) / 2;

                previewScale = Math.min(
                    1,
                    Math.max(0.1, liveViewport.width / designHeight),
                    Math.max(0.1, liveViewport.height / designWidth)
                );

                applyMobilePortraitLockShellStyles(
                    liveViewport.width,
                    liveViewport.height,
                    designWidth * previewScale,
                    designHeight * previewScale,
                    previewScale,
                    getMobileLandscapeRotationDegrees(),
                    designWidth,
                    designHeight,
                    standaloneLandscapeCenterYOffset
                );

                rootWidth = designWidth;
                rootHeight = designHeight;
                worldScale = 1;
                worldRenderWidth = designWidth;
                worldRenderHeight = designHeight;
                worldLeft = 0;
                worldTop = 0;
                worldStageMeasuredScale = previewScale;
                safeFrameLeft = uiAuthorLeft;
                safeFrameTop = uiAuthorTop;
                safeFrameWidth = uiAuthorWidth;
                safeFrameHeight = uiAuthorHeight;
                safeUiRenderWidth = uiAuthorWidth;
                safeUiRenderHeight = uiAuthorHeight;
                safeUiLeft = uiAuthorLeft;
                safeUiTop = uiAuthorTop;
                safeUiStageMeasuredScale = previewScale;
                uiProjectionScale = 1;
            } else {
                const safeFrame = {
                    left: activeStandaloneLockFrame.safeFrameLeft,
                    top: activeStandaloneLockFrame.safeFrameTop,
                    width: activeStandaloneLockFrame.safeFrameWidth,
                    height: activeStandaloneLockFrame.safeFrameHeight
                };

                rootWidth = activeStandaloneLockFrame.viewportWidth;
                rootHeight = activeStandaloneLockFrame.viewportHeight;

                applyStandaloneRuntimeShellStyles(rootWidth, rootHeight, 0);

                worldScale = Math.max(rootWidth / designWidth, rootHeight / designHeight);
                worldRenderWidth = designWidth * worldScale;
                worldRenderHeight = designHeight * worldScale;
                worldLeft = (rootWidth - worldRenderWidth) / 2;
                worldTop = (rootHeight - worldRenderHeight) / 2;
                worldStageMeasuredScale = worldScale;
                safeFrameLeft = safeFrame.left;
                safeFrameTop = safeFrame.top;
                safeFrameWidth = safeFrame.width;
                safeFrameHeight = safeFrame.height;
                safeUiRenderWidth = safeFrameWidth;
                safeUiRenderHeight = safeFrameHeight;
                safeUiLeft = safeFrameLeft;
                safeUiTop = safeFrameTop;
                safeUiStageMeasuredScale = 1;
                uiProjectionScale = Math.min(
                    safeFrameWidth / uiAuthorWidth,
                    safeFrameHeight / uiAuthorHeight
                );
            }
        } else if (mobilePortraitLockMode) {
            previewScale = Math.min(
                1,
                Math.max(0.1, liveViewport.width / designHeight),
                Math.max(0.1, liveViewport.height / designWidth)
            );

            applyMobilePortraitLockShellStyles(
                liveViewport.width,
                liveViewport.height,
                designWidth * previewScale,
                designHeight * previewScale,
                previewScale,
                mobileLandscapeRotationDegrees,
                designWidth,
                designHeight,
                0
            );

            rootWidth = designWidth;
            rootHeight = designHeight;
            worldScale = 1;
            worldRenderWidth = designWidth;
            worldRenderHeight = designHeight;
            worldLeft = 0;
            worldTop = 0;
            worldStageMeasuredScale = previewScale;
            safeFrameLeft = uiAuthorLeft;
            safeFrameTop = uiAuthorTop;
            safeFrameWidth = uiAuthorWidth;
            safeFrameHeight = uiAuthorHeight;
            safeUiRenderWidth = uiAuthorWidth;
            safeUiRenderHeight = uiAuthorHeight;
            safeUiLeft = uiAuthorLeft;
            safeUiTop = uiAuthorTop;
            safeUiStageMeasuredScale = previewScale;
            uiProjectionScale = 1;
        } else if (standaloneDisplayMode) {
            const safeFrame = buildSafeFrame(
                viewport.width,
                viewport.height,
                safeArea,
                uiAuthorTop
            );

            rootWidth = viewport.width;
            rootHeight = viewport.height;

            applyStandaloneRuntimeShellStyles(rootWidth, rootHeight, 0);

            worldScale = Math.max(rootWidth / designWidth, rootHeight / designHeight);
            worldRenderWidth = designWidth * worldScale;
            worldRenderHeight = designHeight * worldScale;
            worldLeft = (rootWidth - worldRenderWidth) / 2;
            worldTop = (rootHeight - worldRenderHeight) / 2;
            worldStageMeasuredScale = worldScale;

            safeFrameLeft = safeFrame.left;
            safeFrameTop = safeFrame.top;
            safeFrameWidth = safeFrame.width;
            safeFrameHeight = safeFrame.height;

            safeUiRenderWidth = safeFrameWidth;
            safeUiRenderHeight = safeFrameHeight;
            safeUiLeft = safeFrameLeft;
            safeUiTop = safeFrameTop;
            safeUiStageMeasuredScale = 1;

            uiProjectionScale = Math.min(
                safeFrameWidth / uiAuthorWidth,
                safeFrameHeight / uiAuthorHeight
            );
        } else {
            previewScale = Math.min(
                1,
                Math.max(0.1, liveViewport.width / designWidth),
                Math.max(0.1, liveViewport.height / designHeight)
            );

            applyDesktopPreviewShellStyles(
                designWidth * previewScale,
                designHeight * previewScale,
                previewScale,
                designWidth,
                designHeight
            );

            rootWidth = designWidth;
            rootHeight = designHeight;
            worldScale = 1;
            worldRenderWidth = designWidth;
            worldRenderHeight = designHeight;
            worldLeft = 0;
            worldTop = 0;
            worldStageMeasuredScale = previewScale;
            safeFrameLeft = uiAuthorLeft;
            safeFrameTop = uiAuthorTop;
            safeFrameWidth = uiAuthorWidth;
            safeFrameHeight = uiAuthorHeight;
            safeUiRenderWidth = uiAuthorWidth;
            safeUiRenderHeight = uiAuthorHeight;
            safeUiLeft = uiAuthorLeft;
            safeUiTop = uiAuthorTop;
            safeUiStageMeasuredScale = previewScale;
            uiProjectionScale = 1;
        }

        homeRoot.style.width = `${round3(rootWidth)}px`;
        homeRoot.style.height = `${round3(rootHeight)}px`;

        worldStage.style.width = `${round3(designWidth)}px`;
        worldStage.style.height = `${round3(designHeight)}px`;
        worldStage.style.transform = `scale(${round3(worldScale)})`;

        safeUiStage.style.width = `${round3(safeUiRenderWidth)}px`;
        safeUiStage.style.height = `${round3(safeUiRenderHeight)}px`;
        safeUiStage.style.transform = "scale(1)";

        setShellBox(worldStageShell, worldLeft, worldTop, worldRenderWidth, worldRenderHeight);
        setShellBox(safeUiStageShell, safeUiLeft, safeUiTop, safeUiRenderWidth, safeUiRenderHeight);
        setShellBox(safeZoneOutline, safeFrameLeft, safeFrameTop, safeFrameWidth, safeFrameHeight);

        homeRoot.dataset.stageDisplayMode = displayMode;
        homeRoot.dataset.desktopPreviewMode = desktopPreviewMode ? "true" : "false";
        homeRoot.dataset.desktopRuntimeEmulationMode = desktopRuntimeEmulationMode ? "true" : "false";
        homeRoot.dataset.mobilePortraitLockMode = mobilePortraitLockMode ? "true" : "false";
        homeRoot.dataset.standaloneLandscapeMode = standaloneLandscapeMode ? "true" : "false";
        homeRoot.dataset.mobileLandscapeRotationDegrees = String(mobileLandscapeRotationDegrees);
        homeRoot.dataset.standaloneLockPending = standaloneLockPending ? "true" : "false";
        homeRoot.dataset.standaloneFrameLocked = standaloneStartupLock.lockedFrame ? "true" : "false";
        homeRoot.dataset.standaloneVisualOffsetTop = String(round3(standaloneVisualOffsetTop));
        homeRoot.dataset.desktopPreviewScale = String(round3(previewScale));
        homeRoot.dataset.viewportWidth = String(round3(rootWidth));
        homeRoot.dataset.viewportHeight = String(round3(rootHeight));
        homeRoot.dataset.worldStageScale = String(round3(worldStageMeasuredScale));
        homeRoot.dataset.worldStageRenderWidth = String(round3(worldRenderWidth));
        homeRoot.dataset.worldStageRenderHeight = String(round3(worldRenderHeight));
        homeRoot.dataset.uiAuthorFrameLeft = String(round3(uiAuthorLeft));
        homeRoot.dataset.uiAuthorFrameTop = String(round3(uiAuthorTop));
        homeRoot.dataset.uiAuthorFrameWidth = String(round3(uiAuthorWidth));
        homeRoot.dataset.uiAuthorFrameHeight = String(round3(uiAuthorHeight));
        homeRoot.dataset.safeUiStageScale = String(round3(safeUiStageMeasuredScale));
        homeRoot.dataset.safeUiStageRenderWidth = String(round3(safeUiRenderWidth));
        homeRoot.dataset.safeUiStageRenderHeight = String(round3(safeUiRenderHeight));
        homeRoot.dataset.uiProjectionScale = String(round3(uiProjectionScale));
        homeRoot.dataset.safeFrameLeft = String(round3(safeFrameLeft));
        homeRoot.dataset.safeFrameTop = String(round3(safeFrameTop));
        homeRoot.dataset.safeFrameWidth = String(round3(safeFrameWidth));
        homeRoot.dataset.safeFrameHeight = String(round3(safeFrameHeight));
        homeRoot.dataset.safeAreaTop = String(round3(safeArea.top));
        homeRoot.dataset.safeAreaRight = String(round3(safeArea.right));
        homeRoot.dataset.safeAreaBottom = String(round3(safeArea.bottom));
        homeRoot.dataset.safeAreaLeft = String(round3(safeArea.left));

        if (firstPaintReady && !standaloneLockPending) {
            markStageReady();
        } else {
            homeStageShell.style.visibility = "hidden";
            homeStageShell.dataset.stageReady = "false";
        }

        try {
            window.scrollTo(0, 0);
        } catch {
        }

        window.dispatchEvent(
            new CustomEvent("pl-home-stage-resized", {
                detail: {
                    displayMode,
                    desktopPreviewMode,
                    desktopRuntimeEmulationMode,
                    previewScale,
                    viewportWidth: rootWidth,
                    viewportHeight: rootHeight,
                    worldScale: worldStageMeasuredScale,
                    safeUiScale: safeUiStageMeasuredScale,
                    safeFrameLeft,
                    safeFrameTop,
                    safeFrameWidth,
                    safeFrameHeight,
                    uiAuthorLeft,
                    uiAuthorTop,
                    uiAuthorWidth,
                    uiAuthorHeight,
                    uiProjectionScale,
                    standaloneLockPending,
                    standaloneVisualOffsetTop
                }
            })
        );
    }

    function scheduleStandaloneDeferredLayoutRefresh() {
        if (standaloneDeferredLayoutTimeoutId) {
            clearTimeout(standaloneDeferredLayoutTimeoutId);
            standaloneDeferredLayoutTimeoutId = 0;
        }

        if (standaloneDeferredLayoutPassesRemaining <= 0) {
            return;
        }

        standaloneDeferredLayoutTimeoutId = window.setTimeout(function () {
            standaloneDeferredLayoutTimeoutId = 0;

            if (
                !isStandaloneDisplayMode(readDisplayMode()) ||
                (
                    window.visualViewport &&
                    Number.isFinite(window.visualViewport.scale) &&
                    window.visualViewport.scale > 1.01
                )
            ) {
                standaloneDeferredLayoutPassesRemaining = 0;
                return;
            }

            applyHomeStageLayout();
            standaloneDeferredLayoutPassesRemaining -= 1;
            scheduleStandaloneDeferredLayoutRefresh();
        }, 180);
    }

    function scheduleKeyboardDeferredLayoutRefresh() {
        if (keyboardDeferredLayoutTimeoutId) {
            clearTimeout(keyboardDeferredLayoutTimeoutId);
            keyboardDeferredLayoutTimeoutId = 0;
        }

        keyboardDeferredLayoutTimeoutId = window.setTimeout(function () {
            keyboardDeferredLayoutTimeoutId = 0;

            if (isEditableElement(document.activeElement)) {
                return;
            }

            if (
                window.visualViewport &&
                Number.isFinite(window.visualViewport.scale) &&
                window.visualViewport.scale > 1.01
            ) {
                return;
            }

            handleStageEnvironmentChange();
        }, 240);
    }

    function handleStageEnvironmentChange() {
        if (
            window.visualViewport &&
            Number.isFinite(window.visualViewport.scale) &&
            window.visualViewport.scale > 1.01
        ) {
            return;
        }

        if (isEditableElement(document.activeElement)) {
            scheduleKeyboardDeferredLayoutRefresh();
            return;
        }

        const displayMode = readDisplayMode();

        if (isStandaloneDisplayMode(displayMode)) {
            if (firstPaintReady) {
                if (standaloneDeferredLayoutTimeoutId) {
                    clearTimeout(standaloneDeferredLayoutTimeoutId);
                    standaloneDeferredLayoutTimeoutId = 0;
                }

                standaloneDeferredLayoutPassesRemaining = 2;
                applyHomeStageLayout();
                scheduleStandaloneDeferredLayoutRefresh();

                return;
            }

            beginStandaloneStartupLock();
            return;
        }

        if (standaloneDeferredLayoutTimeoutId) {
            clearTimeout(standaloneDeferredLayoutTimeoutId);
            standaloneDeferredLayoutTimeoutId = 0;
        }
        standaloneDeferredLayoutPassesRemaining = 0;

        clearStandaloneStartupSampling();
        standaloneStartupLock.lockedFrame = null;
        standaloneStartupLock.bestFrame = null;
        standaloneStartupLock.settleActive = false;

        applyHomeStageLayout();
    }
    //#endregion SEGMENT F - Layout Application

    //#region SEGMENT G - Boot
    function tryLockStandaloneOrientation() {
        const displayMode = readDisplayMode();

        if (!isStandaloneDisplayMode(displayMode)) {
            return;
        }

        if (!screen.orientation || typeof screen.orientation.lock !== "function") {
            return;
        }

        Promise.resolve(screen.orientation.lock("portrait")).catch(function () {
        });
    }

    function initializeHomeStageLayout() {
        tryLockStandaloneOrientation();
        handleStageEnvironmentChange();

        window.addEventListener("resize", handleStageEnvironmentChange);
        window.addEventListener("orientationchange", handleStageEnvironmentChange);
        window.addEventListener("pageshow", handleStageEnvironmentChange);
        window.addEventListener("pageshow", tryLockStandaloneOrientation);

        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", handleStageEnvironmentChange);
            window.visualViewport.addEventListener("scroll", handleStageEnvironmentChange);
        }

        document.addEventListener("focusout", scheduleKeyboardDeferredLayoutRefresh, true);

        if (desktopPointerQuery.addEventListener) {
            desktopPointerQuery.addEventListener("change", handleStageEnvironmentChange);
        } else if (desktopPointerQuery.addListener) {
            desktopPointerQuery.addListener(handleStageEnvironmentChange);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeHomeStageLayout, { once: true });
    } else {
        initializeHomeStageLayout();
    }
    //#endregion SEGMENT G - Boot
})();
