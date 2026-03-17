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

    homeStageShell.style.visibility = "hidden";

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
    // SEGMENT A END — Home Stage Bootstrap

    // SEGMENT B START — Home Stage Measurements
    function applyHomeStageLayout() {
        const designWidth = readDesignPx("--pl-home-screen-width", 428);
        const designHeight = readDesignPx("--pl-home-screen-height", 926);
        const viewport = readViewportSize();
        const safeArea = readSafeAreaInsets();
        const displayMode = readDisplayMode();
        const desktopPreviewMode = shouldUseDesktopPreviewMode(displayMode);

        let rootWidth = designWidth;
        let rootHeight = designHeight;

        let worldScale = 1;
        let worldRenderWidth = designWidth;
        let worldRenderHeight = designHeight;
        let worldLeft = 0;
        let worldTop = 0;

        let safeFrameLeft = 0;
        let safeFrameTop = 0;
        let safeFrameWidth = designWidth;
        let safeFrameHeight = designHeight;

        let safeUiScale = 1;
        let safeUiRenderWidth = designWidth;
        let safeUiRenderHeight = designHeight;
        let safeUiLeft = 0;
        let safeUiTop = 0;

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

            safeFrameLeft = safeArea.left;
            safeFrameTop = safeArea.top;
            safeFrameWidth = Math.max(1, rootWidth - safeArea.left - safeArea.right);
            safeFrameHeight = Math.max(1, rootHeight - safeArea.top - safeArea.bottom);

            safeUiScale = Math.min(1, safeFrameWidth / designWidth, safeFrameHeight / designHeight);
            safeUiRenderWidth = designWidth * safeUiScale;
            safeUiRenderHeight = designHeight * safeUiScale;
            safeUiLeft = safeFrameLeft + ((safeFrameWidth - safeUiRenderWidth) / 2);
            safeUiTop = safeFrameTop;
        }

        homeRoot.style.width = `${round3(rootWidth)}px`;
        homeRoot.style.height = `${round3(rootHeight)}px`;

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

        homeStageShell.style.visibility = "visible";
        homeStageShell.dataset.stageReady = "true";

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
                safeFrameHeight
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