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
    const standaloneStartupLock = {
        lockedFrame: null,
        settleRafId: 0,
        settleActive: false,
        bestFrame: null,
        sessionId: 0
    };

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

    function readStandaloneScreenSize(fallbackViewport) {
        const widthCandidates = [
            parsePx(window.screen?.width),
            parsePx(window.screen?.availWidth),
            fallbackViewport.width
        ];

        const heightCandidates = [
            parsePx(window.screen?.height),
            parsePx(window.screen?.availHeight),
            fallbackViewport.height
        ];

        return {
            width: Math.max(1, ...widthCandidates),
            height: Math.max(1, ...heightCandidates)
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

        homeStage.style.width = `${round3(renderWidth)}px`;
        homeStage.style.height = `${round3(renderHeight)}px`;
        homeStage.style.transformOrigin = "top left";
        homeStage.style.transform = "scale(1)";
    }

    function shouldUseDesktopPreviewMode(displayMode) {
        return layoutModeEnabled && displayMode === "browser" && desktopPointerQuery.matches;
    }

    function shouldUseDesktopRuntimeEmulationMode(displayMode) {
        return !layoutModeEnabled && displayMode === "browser" && desktopPointerQuery.matches;
    }

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

    function captureStandaloneRuntimeFrame() {
        const liveViewport = readViewportSize();
        const screenSize = readStandaloneScreenSize(liveViewport);
        const topReserve = Math.max(0, screenSize.height - liveViewport.height);

        return {
            viewportWidth: screenSize.width,
            viewportHeight: screenSize.height,
            liveViewportWidth: liveViewport.width,
            liveViewportHeight: liveViewport.height,
            screenWidth: screenSize.width,
            screenHeight: screenSize.height,
            safeAreaTop: topReserve,
            safeAreaRight: 0,
            safeAreaBottom: 0,
            safeAreaLeft: 0,
            safeFrameLeft: 0,
            safeFrameTop: topReserve,
            safeFrameWidth: Math.max(1, screenSize.width),
            safeFrameHeight: Math.max(1, screenSize.height - topReserve)
        };
    }

    function chooseBetterStandaloneFrame(currentBest, candidate) {
        if (!currentBest) {
            return cloneStandaloneFrame(candidate);
        }

        if (candidate.safeFrameHeight > currentBest.safeFrameHeight + 0.5) {
            return cloneStandaloneFrame(candidate);
        }

        if (Math.abs(candidate.safeFrameHeight - currentBest.safeFrameHeight) <= 0.5 &&
            candidate.safeFrameWidth > currentBest.safeFrameWidth + 0.5) {
            return cloneStandaloneFrame(candidate);
        }

        if (Math.abs(candidate.safeFrameHeight - currentBest.safeFrameHeight) <= 0.5 &&
            Math.abs(candidate.safeFrameWidth - currentBest.safeFrameWidth) <= 0.5 &&
            candidate.viewportHeight > currentBest.viewportHeight + 0.5) {
            return cloneStandaloneFrame(candidate);
        }

        return currentBest;
    }

    function beginStandaloneStartupLock() {
        if (standaloneStartupLock.lockedFrame || standaloneStartupLock.settleActive) {
            return;
        }

        clearStandaloneStartupSampling();

        standaloneStartupLock.sessionId += 1;
        standaloneStartupLock.settleActive = true;
        standaloneStartupLock.bestFrame = null;

        const sessionId = standaloneStartupLock.sessionId;
        let remainingFrames = 12;

        function sampleFrame() {
            if (sessionId !== standaloneStartupLock.sessionId || standaloneStartupLock.lockedFrame) {
                return;
            }

            const candidate = captureStandaloneRuntimeFrame();
            standaloneStartupLock.bestFrame = chooseBetterStandaloneFrame(standaloneStartupLock.bestFrame, candidate);

            remainingFrames -= 1;

            if (remainingFrames > 0) {
                standaloneStartupLock.settleRafId = requestAnimationFrame(sampleFrame);
                return;
            }

            standaloneStartupLock.lockedFrame = cloneStandaloneFrame(standaloneStartupLock.bestFrame || candidate);
            standaloneStartupLock.settleRafId = 0;
            standaloneStartupLock.settleActive = false;
            standaloneStartupLock.bestFrame = null;

            applyHomeStageLayout();
        }

        sampleFrame();
    }

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
    // SEGMENT A END — Home Stage Bootstrap


    // SEGMENT B START — Home Stage Measurements

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

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    let homeChromeTintSourceUrl = "";
    let homeChromeTintRequestId = 0;

    function clampByte(value) {
        return Math.max(0, Math.min(255, Math.round(value)));
    }

    function byteToHex(value) {
        return clampByte(value).toString(16).padStart(2, "0");
    }

    function rgbToHex(red, green, blue) {
        return `#${byteToHex(red)}${byteToHex(green)}${byteToHex(blue)}`;
    }

    function parseBackgroundImageUrls(backgroundImageValue) {
        if (!backgroundImageValue) {
            return [];
        }

        const urls = [];
        const urlPattern = /url\((['"]?)(.*?)\1\)/g;
        let match = urlPattern.exec(backgroundImageValue);

        while (match) {
            if (match[2]) {
                urls.push(match[2]);
            }

            match = urlPattern.exec(backgroundImageValue);
        }

        return urls;
    }

    function readOpaqueBackgroundColor(element) {
        if (!element) {
            return "";
        }

        const computed = window.getComputedStyle(element);
        const backgroundColor = computed.backgroundColor || "";

        if (
            !backgroundColor ||
            backgroundColor === "transparent" ||
            backgroundColor === "rgba(0, 0, 0, 0)"
        ) {
            return "";
        }

        return backgroundColor;
    }

    function applyHomeChromeTint(colorValue) {
        if (!colorValue) {
            return;
        }

        document.documentElement.style.setProperty("--pl-home-edge-background", colorValue);
        document.documentElement.style.backgroundColor = colorValue;
        document.body.style.backgroundColor = colorValue;

        if (appShell) {
            appShell.style.backgroundColor = colorValue;
        }

        if (themeColorMeta) {
            themeColorMeta.setAttribute("content", colorValue);
        }
    }

    function applyFallbackHomeChromeTint() {
        const fallbackColor =
            readOpaqueBackgroundColor(homeRoot) ||
            readOpaqueBackgroundColor(homeStageShell) ||
            readOpaqueBackgroundColor(appShell) ||
            readOpaqueBackgroundColor(document.body) ||
            readOpaqueBackgroundColor(document.documentElement);

        if (fallbackColor) {
            applyHomeChromeTint(fallbackColor);
        }
    }

    function syncHomeChromeTintFromSceneArt() {
        const sceneArt = document.getElementById("pl-home-scene-art");

        if (!sceneArt) {
            applyFallbackHomeChromeTint();
            return;
        }

        const computed = window.getComputedStyle(sceneArt);
        const backgroundImageUrls = parseBackgroundImageUrls(computed.backgroundImage || "");

        if (!backgroundImageUrls.length) {
            applyFallbackHomeChromeTint();
            return;
        }

        const imageUrl = backgroundImageUrls[0];

        if (!imageUrl) {
            applyFallbackHomeChromeTint();
            return;
        }

        if (imageUrl === homeChromeTintSourceUrl) {
            return;
        }

        homeChromeTintSourceUrl = imageUrl;
        homeChromeTintRequestId += 1;

        const requestId = homeChromeTintRequestId;
        const image = new Image();

        image.decoding = "async";

        image.onload = function () {
            if (requestId !== homeChromeTintRequestId) {
                return;
            }

            const canvas = document.createElement("canvas");
            canvas.width = 24;
            canvas.height = 24;

            const context = canvas.getContext("2d", { willReadFrequently: true });

            if (!context) {
                applyFallbackHomeChromeTint();
                return;
            }

            context.drawImage(image, 0, 0, canvas.width, canvas.height);

            const samplePoints = [
                [1, 1],
                [12, 1],
                [22, 1],
                [1, 12],
                [22, 12],
                [1, 22],
                [12, 22],
                [22, 22]
            ];

            let redTotal = 0;
            let greenTotal = 0;
            let blueTotal = 0;
            let sampleCount = 0;

            for (const [sampleX, sampleY] of samplePoints) {
                const pixel = context.getImageData(sampleX, sampleY, 1, 1).data;
                const alpha = pixel[3];

                if (alpha < 16) {
                    continue;
                }

                redTotal += pixel[0];
                greenTotal += pixel[1];
                blueTotal += pixel[2];
                sampleCount += 1;
            }

            if (sampleCount === 0) {
                applyFallbackHomeChromeTint();
                return;
            }

            applyHomeChromeTint(
                rgbToHex(
                    redTotal / sampleCount,
                    greenTotal / sampleCount,
                    blueTotal / sampleCount
                )
            );
        };

        image.onerror = function () {
            if (requestId !== homeChromeTintRequestId) {
                return;
            }

            applyFallbackHomeChromeTint();
        };

        image.src = imageUrl;
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

    function captureStandaloneRuntimeFrame() {
        const designWidth = readDesignPx("--pl-home-screen-width", 428);
        const designHeight = readDesignPx("--pl-home-screen-height", 926);
        const uiAuthorTop = 47;
        const viewport = readRuntimeViewport();
        const safeArea = readSafeAreaInsets();
        const safeFrame = buildSafeFrame(
            viewport.width,
            viewport.height,
            safeArea,
            uiAuthorTop
        );

        return {
            viewportWidth: viewport.width,
            viewportHeight: viewport.height,
            liveViewportWidth: viewport.width,
            liveViewportHeight: viewport.height,
            screenWidth: Math.max(1, parsePx(window.screen?.width) || viewport.width),
            screenHeight: Math.max(1, parsePx(window.screen?.height) || viewport.height),
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

        const viewport =
            standaloneDisplayMode && standaloneStartupLock.lockedFrame
                ? {
                    width: standaloneStartupLock.lockedFrame.viewportWidth,
                    height: standaloneStartupLock.lockedFrame.viewportHeight
                }
                : liveViewport;

        const safeArea =
            standaloneDisplayMode && standaloneStartupLock.lockedFrame
                ? {
                    top: standaloneStartupLock.lockedFrame.safeAreaTop,
                    right: standaloneStartupLock.lockedFrame.safeAreaRight,
                    bottom: standaloneStartupLock.lockedFrame.safeAreaBottom,
                    left: standaloneStartupLock.lockedFrame.safeAreaLeft
                }
                : liveSafeArea;

        const standaloneLockPending =
            standaloneDisplayMode && !standaloneStartupLock.lockedFrame;
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
            worldScale = previewScale;
            worldRenderWidth = designWidth * previewScale;
            worldRenderHeight = designHeight * previewScale;
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
        else if (desktopRuntimeEmulationMode) {
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
        }
        else if (standaloneDisplayMode) {
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
        }
        else {
            const safeFrame = buildSafeFrame(
                liveViewport.width,
                liveViewport.height,
                liveSafeArea,
                uiAuthorTop
            );

            resetRuntimeShellStyles();

            rootWidth = liveViewport.width;
            rootHeight = liveViewport.height;

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

        syncHomeChromeTintFromSceneArt();

        homeRoot.dataset.stageDisplayMode = displayMode;
        homeRoot.dataset.desktopPreviewMode = desktopPreviewMode ? "true" : "false";
        homeRoot.dataset.desktopRuntimeEmulationMode = desktopRuntimeEmulationMode ? "true" : "false";
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
        }));
    }

    function handleStageEnvironmentChange() {
        const displayMode = readDisplayMode();

        if (isStandaloneDisplayMode(displayMode)) {
            beginStandaloneStartupLock();
            return;
        }

        clearStandaloneStartupSampling();
        standaloneStartupLock.lockedFrame = null;
        standaloneStartupLock.bestFrame = null;
        standaloneStartupLock.settleActive = false;

        applyHomeStageLayout();
    }

    function initializeHomeStageLayout() {
        handleStageEnvironmentChange();

        window.addEventListener("resize", handleStageEnvironmentChange);
        window.addEventListener("pageshow", handleStageEnvironmentChange);

        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", handleStageEnvironmentChange);
            window.visualViewport.addEventListener("scroll", handleStageEnvironmentChange);
        }

        if (desktopPointerQuery.addEventListener) {
            desktopPointerQuery.addEventListener("change", handleStageEnvironmentChange);
        }
        else if (desktopPointerQuery.addListener) {
            desktopPointerQuery.addListener(handleStageEnvironmentChange);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeHomeStageLayout, { once: true });
    }
    else {
        initializeHomeStageLayout();
    }

// SEGMENT B END — Home Stage Measurements
