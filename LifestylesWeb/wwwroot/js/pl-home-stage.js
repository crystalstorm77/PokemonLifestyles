// SEGMENT A START — Home Stage Bootstrap
(function () {
    const homeRoot = document.getElementById("pl-home-root");
    const worldStageShell = document.getElementById("pl-world-stage-shell");
    const worldStage = document.getElementById("pl-world-stage");
    const safeUiStageShell = document.getElementById("pl-safe-ui-stage-shell");
    const safeUiStage = document.getElementById("pl-safe-ui-stage");
    const safeZoneOutline = document.getElementById("pl-safe-zone-outline");

    if (!homeRoot || !worldStageShell || !worldStage || !safeUiStageShell || !safeUiStage || !safeZoneOutline) {
        return;
    }

    function readDesignPx(varName, fallbackValue) {
        const raw = getComputedStyle(homeRoot).getPropertyValue(varName).trim();

        if (!raw) {
            return fallbackValue;
        }

        const parsed = parseFloat(raw.replace("px", ""));
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackValue;
    }

    function readViewportSize() {
        if (window.visualViewport) {
            return {
                width: window.visualViewport.width,
                height: window.visualViewport.height
            };
        }

        return {
            width: window.innerWidth,
            height: window.innerHeight
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
    // SEGMENT A END — Home Stage Bootstrap

    // SEGMENT B START — Home Stage Measurements
    function applyHomeStageLayout() {
        const designWidth = readDesignPx("--pl-home-screen-width", 428);
        const designHeight = readDesignPx("--pl-home-screen-height", 926);
        const viewport = readViewportSize();
        const safeArea = readSafeAreaInsets();
        const displayMode = readDisplayMode();

        const rootWidth = Math.max(1, viewport.width);
        const rootHeight = Math.max(1, viewport.height);

        const worldScale = Math.max(rootWidth / designWidth, rootHeight / designHeight);
        const worldRenderWidth = designWidth * worldScale;
        const worldRenderHeight = designHeight * worldScale;
        const worldLeft = (rootWidth - worldRenderWidth) / 2;
        const worldTop = (rootHeight - worldRenderHeight) / 2;

        const safeFrameLeft = safeArea.left;
        const safeFrameTop = safeArea.top;
        const safeFrameWidth = Math.max(1, rootWidth - safeArea.left - safeArea.right);
        const safeFrameHeight = Math.max(1, rootHeight - safeArea.top - safeArea.bottom);

        const safeUiScale = Math.min(1, safeFrameWidth / designWidth, safeFrameHeight / designHeight);
        const safeUiRenderWidth = designWidth * safeUiScale;
        const safeUiRenderHeight = designHeight * safeUiScale;
        const safeUiLeft = safeFrameLeft + ((safeFrameWidth - safeUiRenderWidth) / 2);
        const safeUiTop = safeFrameTop;

        homeRoot.style.width = `${round3(rootWidth)}px`;
        homeRoot.style.height = `${round3(rootHeight)}px`;

        setShellBox(worldStageShell, worldLeft, worldTop, worldRenderWidth, worldRenderHeight);
        worldStage.style.transform = `scale(${round3(worldScale)})`;

        setShellBox(safeUiStageShell, safeUiLeft, safeUiTop, safeUiRenderWidth, safeUiRenderHeight);
        safeUiStage.style.transform = `scale(${round3(safeUiScale)})`;

        setShellBox(safeZoneOutline, safeFrameLeft, safeFrameTop, safeFrameWidth, safeFrameHeight);

        homeRoot.dataset.stageDisplayMode = displayMode;
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

        window.dispatchEvent(new CustomEvent("pl-home-stage-resized", {
            detail: {
                displayMode,
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
        window.addEventListener("orientationchange", applyHomeStageLayout);

        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", applyHomeStageLayout);
            window.visualViewport.addEventListener("scroll", applyHomeStageLayout);
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