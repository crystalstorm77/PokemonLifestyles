// SEGMENT A START — Home Stage Bootstrap
(function () {
    const homeStageShell = document.getElementById("pl-home-stage-shell");
    const homeStage = document.getElementById("pl-home-stage");
    const homeRoot = document.getElementById("pl-home-root");

    if (!homeStageShell || !homeStage || !homeRoot) {
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

    function clampScale(value) {
        if (!Number.isFinite(value) || value <= 0) {
            return 1;
        }

        return Math.min(1, value);
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
    // SEGMENT A END — Home Stage Bootstrap
    // SEGMENT B START — Home Stage Measurements
    function applyHomeStageScale() {
        const designWidth = readDesignPx("--pl-home-screen-width", 428);
        const designHeight = readDesignPx("--pl-home-screen-height", 926);
        const viewport = readViewportSize();

        const widthScale = viewport.width / designWidth;
        const heightScale = viewport.height / designHeight;
        const stageScale = clampScale(Math.min(widthScale, heightScale));
        const renderWidth = Math.round(designWidth * stageScale * 1000) / 1000;
        const renderHeight = Math.round(designHeight * stageScale * 1000) / 1000;

        homeStageShell.style.width = `${renderWidth}px`;
        homeStageShell.style.height = `${renderHeight}px`;
        homeStage.style.transform = `scale(${stageScale})`;

        homeRoot.dataset.stageScale = String(stageScale);
        homeRoot.dataset.stageRenderWidth = String(renderWidth);
        homeRoot.dataset.stageRenderHeight = String(renderHeight);
        homeRoot.dataset.stageViewportWidth = String(Math.round(viewport.width * 1000) / 1000);
        homeRoot.dataset.stageViewportHeight = String(Math.round(viewport.height * 1000) / 1000);

        window.dispatchEvent(new CustomEvent("pl-home-stage-resized", {
            detail: {
                stageScale,
                renderWidth,
                renderHeight,
                viewportWidth: viewport.width,
                viewportHeight: viewport.height
            }
        }));
    }

    function initializeHomeStageScale() {
        applyHomeStageScale();

        window.addEventListener("resize", applyHomeStageScale);
        window.addEventListener("orientationchange", applyHomeStageScale);

        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", applyHomeStageScale);
            window.visualViewport.addEventListener("scroll", applyHomeStageScale);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeHomeStageScale, { once: true });
    }
    else {
        initializeHomeStageScale();
    }
})();
// SEGMENT B END — Home Stage Measurements