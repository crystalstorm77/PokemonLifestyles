(function () {
    //#region SEGMENT A - Layout Gate And Defaults
    const layoutModeStorageKey = "plLayoutModeRequested";
    const searchParams = new URL(window.location.href).searchParams;

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

    const layoutModeParam = searchParams.get("layout");
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

    if (!layoutModeEnabled) {
        return;
    }

    const panelId = "pl-viewport-debug-panel";
    const collapsedStorageKey = "plViewportDebugCollapsed";
    const layerToggleStorageKey = "plViewportDebugLayerToggles";

    function createDefaultLayerToggleState() {
        return {
            shellTint: false,
            rootTint: false,
            worldTint: false,
            hideScene: false,
            hideWorld: false,
            hideSafeUi: false
        };
    }
    //#endregion SEGMENT A - Layout Gate And Defaults

    //#region SEGMENT B - Panel Styles And Markup
    function injectStyles() {
        if (document.getElementById("pl-viewport-debug-style")) {
            return;
        }

        const style = document.createElement("style");
        style.id = "pl-viewport-debug-style";
        style.textContent = `
            .pl-viewport-debug-panel {
                position: fixed;
                top: 1rem;
                left: 1rem;
                z-index: 70;
                width: min(92vw, 340px);
                max-height: calc(100dvh - 2rem);
                border-radius: 1rem;
                background: rgba(255, 255, 255, 0.97);
                box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
                backdrop-filter: blur(8px);
                color: #0f172a;
                overflow: hidden;
            }

            .pl-viewport-debug-panel.pl-viewport-debug-panel-collapsed .pl-viewport-debug-body {
                display: none;
            }

            .pl-viewport-debug-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 0.75rem;
                padding: 0.9rem 1rem 0.8rem;
                border-bottom: 1px solid rgba(148, 163, 184, 0.35);
            }

            .pl-viewport-debug-title {
                display: flex;
                flex-direction: column;
                gap: 0.2rem;
            }

            .pl-viewport-debug-title strong {
                font-size: 0.98rem;
                line-height: 1.2;
            }

            .pl-viewport-debug-title span {
                font-size: 0.78rem;
                color: #64748b;
            }

            .pl-viewport-debug-actions {
                display: flex;
                align-items: center;
                gap: 0.45rem;
            }

            .pl-viewport-debug-button {
                border: 1px solid #cbd5e1;
                border-radius: 999px;
                padding: 0.35rem 0.7rem;
                background: #ffffff;
                color: #0f172a;
                font-size: 0.75rem;
                font-weight: 800;
                cursor: pointer;
            }

            .pl-viewport-debug-body {
                padding: 0.85rem 1rem 1rem;
                overflow: auto;
                max-height: calc(100dvh - 6rem);
            }

            .pl-viewport-debug-controls {
                display: flex;
                flex-direction: column;
                gap: 0.55rem;
                margin-bottom: 0.9rem;
                padding-bottom: 0.85rem;
                border-bottom: 1px solid rgba(148, 163, 184, 0.3);
            }

            .pl-viewport-debug-controls-title {
                font-size: 0.76rem;
                font-weight: 800;
                color: #334155;
            }

            .pl-viewport-debug-controls-help {
                font-size: 0.72rem;
                line-height: 1.35;
                color: #64748b;
            }

            .pl-viewport-debug-control-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 0.45rem 0.7rem;
            }

            .pl-viewport-debug-control {
                display: flex;
                align-items: center;
                gap: 0.45rem;
                min-width: 0;
                font-size: 0.72rem;
                line-height: 1.2;
                color: #0f172a;
            }

            .pl-viewport-debug-control input {
                margin: 0;
                flex: 0 0 auto;
            }

            .pl-viewport-debug-secondary-button {
                align-self: flex-start;
                border-radius: 0.75rem;
            }

            .pl-viewport-debug-pre {
                margin: 0;
                white-space: pre-wrap;
                word-break: break-word;
                font-family: Consolas, "Courier New", monospace;
                font-size: 0.76rem;
                line-height: 1.45;
            }

            @media (max-width: 640px) {
                .pl-viewport-debug-panel {
                    top: 0.75rem;
                    left: 0.75rem;
                    width: min(calc(100vw - 1.5rem), 340px);
                    max-height: calc(100dvh - 1.5rem);
                }

                .pl-viewport-debug-body {
                    max-height: calc(100dvh - 5.4rem);
                }

                .pl-viewport-debug-control-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function createPanel() {
        let panel = document.getElementById(panelId);

        if (panel) {
            return panel;
        }

        panel = document.createElement("aside");
        panel.id = panelId;
        panel.className = "pl-viewport-debug-panel";
        panel.setAttribute("aria-label", "Viewport debug panel");
        panel.innerHTML = `
            <div class="pl-viewport-debug-header">
                <div class="pl-viewport-debug-title">
                    <strong>Viewport Debug</strong>
                    <span>Layout mode diagnostics</span>
                </div>

                <div class="pl-viewport-debug-actions">
                    <button type="button" class="pl-viewport-debug-button" id="pl-viewport-debug-refresh">Refresh</button>
                    <button type="button" class="pl-viewport-debug-button" id="pl-viewport-debug-copy">Copy Data</button>
                    <button type="button" class="pl-viewport-debug-button" id="pl-viewport-debug-toggle">Collapse</button>
                </div>
            </div>

            <div class="pl-viewport-debug-body">
                <div class="pl-viewport-debug-controls">
                    <div class="pl-viewport-debug-controls-title">Layer diagnostics</div>
                    <div class="pl-viewport-debug-controls-help">Use these in layout mode on the phone to identify which layer owns the grey strip.</div>

                    <div class="pl-viewport-debug-control-grid">
                        <label class="pl-viewport-debug-control"><input type="checkbox" id="pl-viewport-debug-shell-tint" />Tint shell</label>
                        <label class="pl-viewport-debug-control"><input type="checkbox" id="pl-viewport-debug-root-tint" />Tint root</label>
                        <label class="pl-viewport-debug-control"><input type="checkbox" id="pl-viewport-debug-world-tint" />Tint world shell</label>
                        <label class="pl-viewport-debug-control"><input type="checkbox" id="pl-viewport-debug-hide-scene" />Hide scene art</label>
                        <label class="pl-viewport-debug-control"><input type="checkbox" id="pl-viewport-debug-hide-world" />Hide world shell</label>
                        <label class="pl-viewport-debug-control"><input type="checkbox" id="pl-viewport-debug-hide-safe-ui" />Hide safe UI</label>
                    </div>

                    <button type="button" class="pl-viewport-debug-button pl-viewport-debug-secondary-button" id="pl-viewport-debug-reset-layers">Clear layers</button>
                </div>

                <pre class="pl-viewport-debug-pre" id="pl-viewport-debug-output"></pre>
            </div>
        `;

        document.body.appendChild(panel);
        return panel;
    }
    //#endregion SEGMENT B - Panel Styles And Markup

    //#region SEGMENT C - Measurement Helpers
    function parsePx(value) {
        const parsed = parseFloat(String(value || "").replace("px", "").trim());
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function round(value) {
        if (!Number.isFinite(value)) {
            return "n/a";
        }

        return String(Math.round(value * 100) / 100);
    }

    function summarizeCssValue(value) {
        const normalized = String(value || "").trim();

        if (!normalized) {
            return "n/a";
        }

        return normalized.length > 96 ? `${normalized.slice(0, 96)}...` : normalized;
    }

    function describeElement(element) {
        if (!element) {
            return "n/a";
        }

        const id = element.id ? `#${element.id}` : "";
        const className = typeof element.className === "string" && element.className.trim()
            ? `.${element.className.trim().replace(/\s+/g, ".")}`
            : "";

        return `${element.tagName.toLowerCase()}${id}${className}`;
    }

    function formatHitTest(label, x, y) {
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
            return `${label}: n/a`;
        }

        return `${label}: x=${round(x)} y=${round(y)} -> ${describeElement(document.elementFromPoint(x, y))}`;
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

    function readDisplayMode() {
        if (window.matchMedia("(display-mode: standalone)").matches) {
            return "standalone";
        }

        if (window.navigator.standalone === true) {
            return "standalone (navigator.standalone)";
        }

        if (window.matchMedia("(display-mode: fullscreen)").matches) {
            return "fullscreen";
        }

        return "browser";
    }

    function formatRect(label, rect) {
        if (!rect) {
            return `${label}: n/a`;
        }

        return `${label}: x=${round(rect.left)} y=${round(rect.top)} w=${round(rect.width)} h=${round(rect.height)} right=${round(rect.right)} bottom=${round(rect.bottom)}`;
    }

    function measureNodeContentRect(element) {
        if (!element) {
            return null;
        }

        const range = document.createRange();

        try {
            range.selectNodeContents(element);
            const rect = range.getBoundingClientRect();

            if (!Number.isFinite(rect.width) || !Number.isFinite(rect.height)) {
                return null;
            }

            return rect;
        }
        catch {
            return null;
        }
        finally {
            range.detach?.();
        }
    }

    function formatTextMetrics(label, element) {
        if (!element) {
            return `${label}: n/a`;
        }

        const computed = window.getComputedStyle(element);

        return `${label}: clientW=${round(element.clientWidth)} scrollW=${round(element.scrollWidth)} offsetW=${round(element.offsetWidth)} fontSize=${summarizeCssValue(computed.fontSize)} fontFamily=${summarizeCssValue(computed.fontFamily)} lineHeight=${summarizeCssValue(computed.lineHeight)} letterSpacing=${summarizeCssValue(computed.letterSpacing)} textAlign=${summarizeCssValue(computed.textAlign)} justifyContent=${summarizeCssValue(computed.justifyContent)} paddingL=${summarizeCssValue(computed.paddingLeft)} paddingR=${summarizeCssValue(computed.paddingRight)}`;
    }
    //#endregion SEGMENT C - Measurement Helpers

    //#region SEGMENT D - Layer Diagnostics State
    function getLayerElements() {
        return {
            appShell: document.querySelector(".app-shell"),
            homeStageShell: document.getElementById("pl-home-stage-shell"),
            homeStage: document.getElementById("pl-home-stage"),
            homeRoot: document.getElementById("pl-home-root"),
            worldStageShell: document.getElementById("pl-world-stage-shell"),
            worldStage: document.getElementById("pl-world-stage"),
            homeSceneArt: document.getElementById("pl-home-scene-art"),
            safeUiStageShell: document.getElementById("pl-safe-ui-stage-shell"),
            safeUiStage: document.getElementById("pl-safe-ui-stage"),
            safeZoneOutline: document.getElementById("pl-safe-zone-outline"),
            overlayBackdrop: document.getElementById("pl-overlay-backdrop"),
            overlayStageShell: document.getElementById("pl-overlay-ui-stage-shell"),
            overlayStage: document.getElementById("pl-overlay-ui-stage"),
            homeFocusButton: document.getElementById("pl-home-focus-button"),
            homeSleepButton: document.getElementById("pl-home-sleep-button"),
            setupPanel: document.getElementById("pl-setup-panel"),
            durationText: document.getElementById("pl-duration-text"),
            durationTextContent: document.getElementById("pl-duration-text"),
            sliderGroup: document.getElementById("pl-slider-group"),
            sliderTrackShell: document.getElementById("pl-slider-track-shell"),
            sliderTrackEmptyArt: document.getElementById("pl-slider-track-empty-art"),
            sliderFillShell: document.getElementById("pl-slider-fill-shell"),
            sliderFillArt: document.getElementById("pl-slider-fill-art"),
            sliderNibVisual: document.getElementById("pl-slider-nib-visual"),
            durationSlider: document.getElementById("pl-duration-slider"),
            manageButton: document.getElementById("pl-manage-button"),
            manageButtonLabel: document.querySelector("#pl-manage-button .pl-button-label"),
            countdownModeButton: document.getElementById("pl-countdown-mode-button"),
            countUpModeButton: document.getElementById("pl-countup-mode-button"),
            focusManagePanel: document.getElementById("pl-focus-manage-panel"),
            focusManageListShell: document.getElementById("pl-focus-manage-list-shell"),
            focusManageListViewport: document.getElementById("pl-focus-manage-list-viewport"),
            focusManageList: document.getElementById("pl-focus-manage-list"),
            focusManageScrollbarVisual: document.getElementById("pl-focus-manage-list-scrollbar-visual")
        };
    }

    function readLayerToggleState() {
        const defaults = createDefaultLayerToggleState();

        try {
            const raw = window.sessionStorage.getItem(layerToggleStorageKey);

            if (!raw) {
                return defaults;
            }

            const parsed = JSON.parse(raw);
            return {
                shellTint: parsed?.shellTint === true,
                rootTint: parsed?.rootTint === true,
                worldTint: parsed?.worldTint === true,
                hideScene: parsed?.hideScene === true,
                hideWorld: parsed?.hideWorld === true,
                hideSafeUi: parsed?.hideSafeUi === true
            };
        }
        catch {
            return defaults;
        }
    }

    function writeLayerToggleState(state) {
        try {
            window.sessionStorage.setItem(layerToggleStorageKey, JSON.stringify(state));
        }
        catch {
        }
    }

    function applyLayerDiagnostics(state) {
        const layers = getLayerElements();

        const resetElement = (element, properties) => {
            if (!element) {
                return;
            }

            for (const property of properties) {
                element.style.removeProperty(property);
            }
        };

        resetElement(layers.appShell, ["box-shadow"]);
        resetElement(layers.homeRoot, ["box-shadow"]);
        resetElement(layers.worldStageShell, ["box-shadow", "opacity"]);
        resetElement(layers.homeSceneArt, ["opacity"]);
        resetElement(layers.safeUiStageShell, ["opacity"]);
        resetElement(layers.safeZoneOutline, ["opacity"]);

        if (state.shellTint && layers.appShell) {
            layers.appShell.style.boxShadow = "inset 0 0 0 9999px rgba(239, 68, 68, 0.22)";
        }

        if (state.rootTint && layers.homeRoot) {
            layers.homeRoot.style.boxShadow = "inset 0 0 0 9999px rgba(59, 130, 246, 0.2)";
        }

        if (state.worldTint && layers.worldStageShell) {
            layers.worldStageShell.style.boxShadow = "inset 0 0 0 9999px rgba(34, 197, 94, 0.18)";
        }

        if (state.hideScene && layers.homeSceneArt) {
            layers.homeSceneArt.style.opacity = "0";
        }

        if (state.hideWorld && layers.worldStageShell) {
            layers.worldStageShell.style.opacity = "0";
        }

        if (state.hideSafeUi && layers.safeUiStageShell) {
            layers.safeUiStageShell.style.opacity = "0";
        }

        if (state.hideSafeUi && layers.safeZoneOutline) {
            layers.safeZoneOutline.style.opacity = "0";
        }
    }

    function syncLayerToggleInputs(panel, state) {
        const mapping = {
            shellTint: "#pl-viewport-debug-shell-tint",
            rootTint: "#pl-viewport-debug-root-tint",
            worldTint: "#pl-viewport-debug-world-tint",
            hideScene: "#pl-viewport-debug-hide-scene",
            hideWorld: "#pl-viewport-debug-hide-world",
            hideSafeUi: "#pl-viewport-debug-hide-safe-ui"
        };

        Object.entries(mapping).forEach(([key, selector]) => {
            const input = panel.querySelector(selector);

            if (input) {
                input.checked = state[key] === true;
            }
        });
    }
    //#endregion SEGMENT D - Layer Diagnostics State

    //#region SEGMENT E - Output Builder
    function buildOutput() {
        const html = document.documentElement;
        const safeArea = readSafeAreaInsets();
        const visualViewport = window.visualViewport;
        const layers = getLayerElements();
        const sliderDebug = window.__plSliderDebugSnapshot || null;

        const appShellRect = layers.appShell ? layers.appShell.getBoundingClientRect() : null;
        const homeStageShellRect = layers.homeStageShell ? layers.homeStageShell.getBoundingClientRect() : null;
        const homeStageRect = layers.homeStage ? layers.homeStage.getBoundingClientRect() : null;
        const homeRootRect = layers.homeRoot ? layers.homeRoot.getBoundingClientRect() : null;
        const worldStageShellRect = layers.worldStageShell ? layers.worldStageShell.getBoundingClientRect() : null;
        const worldStageRect = layers.worldStage ? layers.worldStage.getBoundingClientRect() : null;
        const safeUiStageShellRect = layers.safeUiStageShell ? layers.safeUiStageShell.getBoundingClientRect() : null;
        const safeUiStageRect = layers.safeUiStage ? layers.safeUiStage.getBoundingClientRect() : null;
        const safeZoneOutlineRect = layers.safeZoneOutline ? layers.safeZoneOutline.getBoundingClientRect() : null;
        const overlayBackdropRect = layers.overlayBackdrop ? layers.overlayBackdrop.getBoundingClientRect() : null;
        const overlayStageShellRect = layers.overlayStageShell ? layers.overlayStageShell.getBoundingClientRect() : null;
        const overlayStageRect = layers.overlayStage ? layers.overlayStage.getBoundingClientRect() : null;
        const homeFocusButtonRect = layers.homeFocusButton ? layers.homeFocusButton.getBoundingClientRect() : null;
        const homeSleepButtonRect = layers.homeSleepButton ? layers.homeSleepButton.getBoundingClientRect() : null;
        const setupPanelRect = layers.setupPanel ? layers.setupPanel.getBoundingClientRect() : null;
        const durationTextRect = layers.durationText ? layers.durationText.getBoundingClientRect() : null;
        const durationTextContentRect = measureNodeContentRect(layers.durationTextContent);
        const sliderGroupRect = layers.sliderGroup ? layers.sliderGroup.getBoundingClientRect() : null;
        const sliderTrackShellRect = layers.sliderTrackShell ? layers.sliderTrackShell.getBoundingClientRect() : null;
        const sliderTrackEmptyArtRect = layers.sliderTrackEmptyArt ? layers.sliderTrackEmptyArt.getBoundingClientRect() : null;
        const sliderFillShellRect = layers.sliderFillShell ? layers.sliderFillShell.getBoundingClientRect() : null;
        const sliderFillArtRect = layers.sliderFillArt ? layers.sliderFillArt.getBoundingClientRect() : null;
        const sliderNibVisualRect = layers.sliderNibVisual ? layers.sliderNibVisual.getBoundingClientRect() : null;
        const durationSliderRect = layers.durationSlider ? layers.durationSlider.getBoundingClientRect() : null;
        const manageButtonRect = layers.manageButton ? layers.manageButton.getBoundingClientRect() : null;
        const manageButtonLabelRect = layers.manageButtonLabel ? layers.manageButtonLabel.getBoundingClientRect() : null;
        const countdownModeButtonRect = layers.countdownModeButton ? layers.countdownModeButton.getBoundingClientRect() : null;
        const countUpModeButtonRect = layers.countUpModeButton ? layers.countUpModeButton.getBoundingClientRect() : null;
        const focusManagePanelRect = layers.focusManagePanel ? layers.focusManagePanel.getBoundingClientRect() : null;
        const focusManageListShellRect = layers.focusManageListShell ? layers.focusManageListShell.getBoundingClientRect() : null;
        const focusManageListViewportRect = layers.focusManageListViewport ? layers.focusManageListViewport.getBoundingClientRect() : null;
        const focusManageListRect = layers.focusManageList ? layers.focusManageList.getBoundingClientRect() : null;
        const focusManageScrollbarVisualRect = layers.focusManageScrollbarVisual ? layers.focusManageScrollbarVisual.getBoundingClientRect() : null;
        const measuredStageScale =
            homeRootRect && layers.homeRoot && layers.homeRoot.offsetWidth > 0
                ? homeRootRect.width / layers.homeRoot.offsetWidth
                : NaN;
        const measuredStageHeightScale =
            homeRootRect && layers.homeRoot && layers.homeRoot.offsetHeight > 0
                ? homeRootRect.height / layers.homeRoot.offsetHeight
                : NaN;
        const measuredShellScale =
            homeStageShellRect && layers.homeRoot && layers.homeRoot.offsetWidth > 0
                ? homeStageShellRect.width / layers.homeRoot.offsetWidth
                : NaN;
        const stageLeftGap =
            appShellRect && homeStageShellRect
                ? homeStageShellRect.left - appShellRect.left
                : NaN;
        const stageRightGap =
            appShellRect && homeStageShellRect
                ? appShellRect.right - homeStageShellRect.right
                : NaN;
        const stageTopGap =
            appShellRect && homeStageShellRect
                ? homeStageShellRect.top - appShellRect.top
                : NaN;
        const stageBottomGap =
            appShellRect && homeStageShellRect
                ? appShellRect.bottom - homeStageShellRect.bottom
                : NaN;
        const visibleViewportAspect =
            visualViewport && visualViewport.width > 0
                ? visualViewport.height / visualViewport.width
                : NaN;
        const designViewportWidth = parsePx(layers.homeRoot?.dataset.viewportWidth);
        const designViewportHeight = parsePx(layers.homeRoot?.dataset.viewportHeight);
        const designAspect =
            designViewportWidth > 0
                ? designViewportHeight / designViewportWidth
                : NaN;
        const safeFrameWidth = parsePx(layers.homeRoot?.dataset.safeFrameWidth);
        const safeFrameHeight = parsePx(layers.homeRoot?.dataset.safeFrameHeight);
        const safeFrameAspect =
            safeFrameWidth > 0
                ? safeFrameHeight / safeFrameWidth
                : NaN;

        const lines = [];
        const formatSliderDebugRect = (label, rect) => {
            if (!rect) {
                lines.push(`${label}: n/a`);
                return;
            }

            lines.push(
                `${label}: left=${round(rect.left)} top=${round(rect.top)} width=${round(rect.width)} height=${round(rect.height)}`
            );
        };
        const addSliderDebugStateLines = (label, state) => {
            if (!state) {
                lines.push(`${label}: n/a`);
                return;
            }

            lines.push(
                `${label}: x=${round(state.x)} y=${round(state.y)} width=${state.width == null ? "null" : round(state.width)} height=${state.height == null ? "null" : round(state.height)} scale=${round(state.scale)} hitScaleX=${round(state.hitScaleX)} hitScaleY=${round(state.hitScaleY)}`
            );
        };
        const addSliderComputedStyleLines = (label, element) => {
            if (!element) {
                lines.push(`${label}.computed: n/a`);
                return;
            }

            const computed = window.getComputedStyle(element);
            lines.push(`${label}.computed.position: ${summarizeCssValue(computed.position)}`);
            lines.push(`${label}.computed.display: ${summarizeCssValue(computed.display)}`);
            lines.push(`${label}.computed.overflow: ${summarizeCssValue(computed.overflow)}`);
            lines.push(`${label}.computed.backgroundImage: ${summarizeCssValue(computed.backgroundImage)}`);
            lines.push(`${label}.computed.backgroundSize: ${summarizeCssValue(computed.backgroundSize)}`);
            lines.push(`${label}.computed.left: ${summarizeCssValue(computed.left)}`);
            lines.push(`${label}.computed.top: ${summarizeCssValue(computed.top)}`);
            lines.push(`${label}.computed.width: ${summarizeCssValue(computed.width)}`);
            lines.push(`${label}.computed.height: ${summarizeCssValue(computed.height)}`);
        };
        const addComputedStyleLines = (label, element, properties) => {
            if (!element) {
                lines.push(`${label}: n/a`);
                return;
            }

            const computed = window.getComputedStyle(element);
            properties.forEach(function (property) {
                lines.push(`${label}.${property}: ${summarizeCssValue(computed[property])}`);
            });
        };

        lines.push(`displayMode: ${readDisplayMode()}`);
        lines.push(`navigator.standalone: ${window.navigator.standalone === true ? "true" : "false"}`);
        lines.push(`devicePixelRatio: ${round(window.devicePixelRatio)}`);
        lines.push(`location: ${window.location.pathname}${window.location.search}`);
        lines.push("");
        lines.push(`screen: ${round(window.screen.width)} x ${round(window.screen.height)}`);
        lines.push(`screen.avail: ${round(window.screen.availWidth)} x ${round(window.screen.availHeight)}`);
        lines.push(`window.inner: ${round(window.innerWidth)} x ${round(window.innerHeight)}`);
        lines.push(`document.client: ${round(html.clientWidth)} x ${round(html.clientHeight)}`);
        lines.push(`window.scroll: x=${round(window.scrollX)} y=${round(window.scrollY)}`);
        lines.push("");
        lines.push(`dataset.stageDisplayMode: ${layers.homeRoot?.dataset.stageDisplayMode || "n/a"}`);
        lines.push(`dataset.viewport: ${layers.homeRoot?.dataset.viewportWidth || "n/a"} x ${layers.homeRoot?.dataset.viewportHeight || "n/a"}`);
        lines.push(`dataset.uiAuthorFrame: left=${layers.homeRoot?.dataset.uiAuthorFrameLeft || "n/a"} top=${layers.homeRoot?.dataset.uiAuthorFrameTop || "n/a"} w=${layers.homeRoot?.dataset.uiAuthorFrameWidth || "n/a"} h=${layers.homeRoot?.dataset.uiAuthorFrameHeight || "n/a"}`);
        lines.push(`dataset.safeFrame: left=${layers.homeRoot?.dataset.safeFrameLeft || "n/a"} top=${layers.homeRoot?.dataset.safeFrameTop || "n/a"} w=${layers.homeRoot?.dataset.safeFrameWidth || "n/a"} h=${layers.homeRoot?.dataset.safeFrameHeight || "n/a"}`);
        lines.push(`dataset.worldStageScale: ${layers.homeRoot?.dataset.worldStageScale || "n/a"}`);
        lines.push(`dataset.safeUiStageScale: ${layers.homeRoot?.dataset.safeUiStageScale || "n/a"}`);
        lines.push(`dataset.uiProjectionScale: ${layers.homeRoot?.dataset.uiProjectionScale || "n/a"}`);
        lines.push("");
        lines.push(`derived.visibleViewportAspect: ${round(visibleViewportAspect)}`);
        lines.push(`derived.designAspect: ${round(designAspect)}`);
        lines.push(`derived.safeFrameAspect: ${round(safeFrameAspect)}`);
        lines.push(`derived.measuredStageWidthScale: ${round(measuredStageScale)}`);
        lines.push(`derived.measuredStageHeightScale: ${round(measuredStageHeightScale)}`);
        lines.push(`derived.measuredShellScale: ${round(measuredShellScale)}`);
        lines.push(`derived.stageGaps: left=${round(stageLeftGap)} right=${round(stageRightGap)} top=${round(stageTopGap)} bottom=${round(stageBottomGap)}`);
        lines.push("");
        lines.push(`safeArea.top: ${round(safeArea.top)}`);
        lines.push(`safeArea.right: ${round(safeArea.right)}`);
        lines.push(`safeArea.bottom: ${round(safeArea.bottom)}`);
        lines.push(`safeArea.left: ${round(safeArea.left)}`);
        lines.push("");

        if (visualViewport) {
            lines.push(`visualViewport.size: ${round(visualViewport.width)} x ${round(visualViewport.height)}`);
            lines.push(`visualViewport.offset: x=${round(visualViewport.offsetLeft)} y=${round(visualViewport.offsetTop)}`);
            lines.push(`visualViewport.pageOffset: x=${round(visualViewport.pageLeft)} y=${round(visualViewport.pageTop)}`);
            lines.push(`visualViewport.scale: ${round(visualViewport.scale)}`);
            lines.push("");
        }
        else {
            lines.push("visualViewport: n/a");
            lines.push("");
        }

        lines.push(formatRect("appShell.rect", appShellRect));
        lines.push(formatRect("homeStageShell.rect", homeStageShellRect));
        lines.push(formatRect("homeStage.rect", homeStageRect));
        lines.push(formatRect("homeRoot.rect", homeRootRect));
        lines.push(formatRect("worldStageShell.rect", worldStageShellRect));
        lines.push(formatRect("worldStage.rect", worldStageRect));
        lines.push(formatRect("safeUiStageShell.rect", safeUiStageShellRect));
        lines.push(formatRect("safeUiStage.rect", safeUiStageRect));
        lines.push(formatRect("safeZoneOutline.rect", safeZoneOutlineRect));
        lines.push(formatRect("overlayBackdrop.rect", overlayBackdropRect));
        lines.push(formatRect("overlayStageShell.rect", overlayStageShellRect));
        lines.push(formatRect("overlayStage.rect", overlayStageRect));
        lines.push("");
        lines.push(formatRect("homeFocusButton.rect", homeFocusButtonRect));
        lines.push(formatRect("homeSleepButton.rect", homeSleepButtonRect));
        lines.push(formatRect("setupPanel.rect", setupPanelRect));
        lines.push(formatRect("durationText.rect", durationTextRect));
        lines.push(formatRect("durationTextContent.rect", durationTextContentRect));
        lines.push(formatRect("sliderGroup.rect", sliderGroupRect));
        lines.push(formatRect("sliderTrackShell.rect", sliderTrackShellRect));
        lines.push(formatRect("sliderTrackEmptyArt.rect", sliderTrackEmptyArtRect));
        lines.push(formatRect("sliderFillShell.rect", sliderFillShellRect));
        lines.push(formatRect("sliderFillArt.rect", sliderFillArtRect));
        lines.push(formatRect("sliderNibVisual.rect", sliderNibVisualRect));
        lines.push(formatRect("durationSlider.rect", durationSliderRect));
        lines.push(formatRect("manageButton.rect", manageButtonRect));
        lines.push(formatRect("manageButtonLabel.rect", manageButtonLabelRect));
        lines.push(formatRect("countdownModeButton.rect", countdownModeButtonRect));
        lines.push(formatRect("countUpModeButton.rect", countUpModeButtonRect));
        lines.push(formatRect("focusManagePanel.rect", focusManagePanelRect));
        lines.push(formatRect("focusManageListShell.rect", focusManageListShellRect));
        lines.push(formatRect("focusManageListViewport.rect", focusManageListViewportRect));
        lines.push(formatRect("focusManageList.rect", focusManageListRect));
        lines.push(formatRect("focusManageScrollbarVisual.rect", focusManageScrollbarVisualRect));
        lines.push(`slider.hiddenStates: group=${layers.sliderGroup ? layers.sliderGroup.hidden : "n/a"} track=${layers.sliderTrackShell ? layers.sliderTrackShell.hidden : "n/a"} input=${layers.durationSlider ? layers.durationSlider.hidden : "n/a"}`);
        lines.push("");

        const addRelativeRectLine = (label, rect, containerRect) => {
            if (!rect || !containerRect) {
                return;
            }

            lines.push(
                `${label}.relativeToSafeUi: left=${round(rect.left - containerRect.left)} top=${round(rect.top - containerRect.top)} rightGap=${round(containerRect.right - rect.right)} bottomGap=${round(containerRect.bottom - rect.bottom)}`
            );
        };

        addRelativeRectLine("homeFocusButton", homeFocusButtonRect, safeUiStageRect);
        addRelativeRectLine("homeSleepButton", homeSleepButtonRect, safeUiStageRect);
        addRelativeRectLine("setupPanel", setupPanelRect, safeUiStageRect);
        addRelativeRectLine("durationText", durationTextRect, safeUiStageRect);
        addRelativeRectLine("durationTextContent", durationTextContentRect, safeUiStageRect);
        addRelativeRectLine("sliderGroup", sliderGroupRect, safeUiStageRect);
        addRelativeRectLine("sliderTrackShell", sliderTrackShellRect, safeUiStageRect);
        addRelativeRectLine("sliderTrackEmptyArt", sliderTrackEmptyArtRect, safeUiStageRect);
        addRelativeRectLine("sliderFillShell", sliderFillShellRect, safeUiStageRect);
        addRelativeRectLine("sliderFillArt", sliderFillArtRect, safeUiStageRect);
        addRelativeRectLine("sliderNibVisual", sliderNibVisualRect, safeUiStageRect);
        addRelativeRectLine("durationSlider", durationSliderRect, safeUiStageRect);
        addRelativeRectLine("manageButton", manageButtonRect, safeUiStageRect);
        addRelativeRectLine("manageButtonLabel", manageButtonLabelRect, safeUiStageRect);
        addRelativeRectLine("countdownModeButton", countdownModeButtonRect, safeUiStageRect);
        addRelativeRectLine("countUpModeButton", countUpModeButtonRect, safeUiStageRect);
        addRelativeRectLine("focusManagePanel", focusManagePanelRect, safeUiStageRect);
        addRelativeRectLine("focusManageListShell", focusManageListShellRect, safeUiStageRect);
        addRelativeRectLine("focusManageListViewport", focusManageListViewportRect, safeUiStageRect);
        addRelativeRectLine("focusManageScrollbarVisual", focusManageScrollbarVisualRect, safeUiStageRect);
        lines.push("");
        lines.push(formatTextMetrics("durationText.metrics", layers.durationText));
        lines.push(formatTextMetrics("manageButtonLabel.metrics", layers.manageButtonLabel));
        lines.push("");

        const addSizeLines = (label, element) => {
            if (!element) {
                return;
            }

            const computed = window.getComputedStyle(element);
            lines.push(`${label}.cssSize: ${computed.width} x ${computed.height}`);
            lines.push(`${label}.clientSize: ${round(element.clientWidth)} x ${round(element.clientHeight)}`);
            lines.push(`${label}.offsetSize: ${round(element.offsetWidth)} x ${round(element.offsetHeight)}`);
        };

        addSizeLines("appShell", layers.appShell);
        addSizeLines("homeRoot", layers.homeRoot);
        addSizeLines("worldStageShell", layers.worldStageShell);
        addSizeLines("overlayStageShell", layers.overlayStageShell);
        addSizeLines("overlayStage", layers.overlayStage);
        lines.push("");

        const addBottomDeltaLines = (label, rect) => {
            if (!rect) {
                return;
            }

            lines.push(`${label}.bottom - innerHeight: ${round(rect.bottom - window.innerHeight)}`);
            lines.push(`${label}.bottom - clientHeight: ${round(rect.bottom - html.clientHeight)}`);

            if (visualViewport) {
                lines.push(`${label}.bottom - visualViewport.height: ${round(rect.bottom - visualViewport.height)}`);
            }
        };

        addBottomDeltaLines("appShell", appShellRect);
        addBottomDeltaLines("homeRoot", homeRootRect);
        addBottomDeltaLines("worldStageShell", worldStageShellRect);
        addBottomDeltaLines("overlayStageShell", overlayStageShellRect);
        lines.push("");

        lines.push("focusManageList.debug:");
        lines.push(`focusManageListShell.parent: ${describeElement(layers.focusManageListShell?.parentElement)}`);
        lines.push(`focusManageListViewport.parent: ${describeElement(layers.focusManageListViewport?.parentElement)}`);
        lines.push(`focusManageList.parent: ${describeElement(layers.focusManageList?.parentElement)}`);
        lines.push(`focusManageListShell.hidden: ${layers.focusManageListShell ? String(layers.focusManageListShell.hidden) : "n/a"}`);
        lines.push(`focusManageListViewport.hidden: ${layers.focusManageListViewport ? String(layers.focusManageListViewport.hidden) : "n/a"}`);
        lines.push(`focusManageList.childCount: ${layers.focusManageList ? String(layers.focusManageList.children.length) : "n/a"}`);
        lines.push(`focusManageListViewport.scrollTop: ${layers.focusManageListViewport ? round(layers.focusManageListViewport.scrollTop) : "n/a"}`);
        lines.push(`focusManageListViewport.scrollHeight: ${layers.focusManageListViewport ? round(layers.focusManageListViewport.scrollHeight) : "n/a"}`);
        lines.push(`focusManageListViewport.clientHeight: ${layers.focusManageListViewport ? round(layers.focusManageListViewport.clientHeight) : "n/a"}`);
        lines.push(`focusManageListViewport.clientWidth: ${layers.focusManageListViewport ? round(layers.focusManageListViewport.clientWidth) : "n/a"}`);
        addComputedStyleLines("focusManageListShell.computed", layers.focusManageListShell, ["display", "position", "pointerEvents", "overflow", "zIndex", "touchAction"]);
        addComputedStyleLines("focusManageListViewport.computed", layers.focusManageListViewport, ["display", "position", "pointerEvents", "overflowX", "overflowY", "touchAction", "zIndex"]);
        addComputedStyleLines("focusManageList.computed", layers.focusManageList, ["display", "position", "pointerEvents"]);
        addComputedStyleLines("overlayBackdrop.computed", layers.overlayBackdrop, ["display", "position", "pointerEvents", "zIndex"]);
        addComputedStyleLines("overlayStageShell.computed", layers.overlayStageShell, ["display", "position", "pointerEvents", "overflow", "zIndex"]);
        addComputedStyleLines("overlayStage.computed", layers.overlayStage, ["display", "position", "pointerEvents", "transform"]);

        if (focusManageListViewportRect) {
            const centerX = focusManageListViewportRect.left + (focusManageListViewportRect.width / 2);
            const centerY = focusManageListViewportRect.top + (focusManageListViewportRect.height / 2);
            const topInsetX = focusManageListViewportRect.left + Math.min(24, focusManageListViewportRect.width / 2);
            const topInsetY = focusManageListViewportRect.top + Math.min(24, focusManageListViewportRect.height / 2);
            const bottomInsetY = focusManageListViewportRect.bottom - Math.min(24, focusManageListViewportRect.height / 2);
            lines.push(formatHitTest("focusManageListViewport.hit.center", centerX, centerY));
            lines.push(formatHitTest("focusManageListViewport.hit.topLeftInset", topInsetX, topInsetY));
            lines.push(formatHitTest("focusManageListViewport.hit.bottomLeftInset", topInsetX, bottomInsetY));
        }
        else {
            lines.push("focusManageListViewport.hit.center: n/a");
        }

        const firstTile = layers.focusManageList?.querySelector(".pl-focus-manage-list-item");
        if (firstTile) {
            const firstTileRect = firstTile.getBoundingClientRect();
            lines.push(formatRect("focusManageList.firstTile.rect", firstTileRect));
            lines.push(`focusManageList.firstTile: ${describeElement(firstTile)}`);
            lines.push(`focusManageList.firstTile.disabled: ${"disabled" in firstTile ? String(firstTile.disabled) : "n/a"}`);
            lines.push(formatHitTest(
                "focusManageList.firstTile.hit.center",
                firstTileRect.left + (firstTileRect.width / 2),
                firstTileRect.top + (firstTileRect.height / 2)
            ));
        }
        else {
            lines.push("focusManageList.firstTile: n/a");
        }
        lines.push("");

        lines.push(`sliderDebug.snapshot: ${sliderDebug ? "present" : "missing"}`);
        if (sliderDebug) {
            lines.push(`sliderDebug.timestamp: ${sliderDebug.timestamp || "n/a"}`);
            lines.push(`sliderDebug.value: min=${sliderDebug.sliderValue?.min ?? "n/a"} max=${sliderDebug.sliderValue?.max ?? "n/a"} step=${sliderDebug.sliderValue?.step ?? "n/a"} value=${sliderDebug.sliderValue?.value ?? "n/a"}`);
            addSliderDebugStateLines("sliderDebug.rootState", sliderDebug.rootState);
            addSliderDebugStateLines("sliderDebug.savedRootState", sliderDebug.savedRootState);
            addSliderDebugStateLines("sliderDebug.state.empty", sliderDebug.componentStates?.empty);
            addSliderDebugStateLines("sliderDebug.state.fill", sliderDebug.componentStates?.fill);
            addSliderDebugStateLines("sliderDebug.state.nib", sliderDebug.componentStates?.nib);
            addSliderDebugStateLines("sliderDebug.state.nib-hit", sliderDebug.componentStates?.["nib-hit"]);
            addSliderDebugStateLines("sliderDebug.saved.empty", sliderDebug.savedComponentStates?.empty);
            addSliderDebugStateLines("sliderDebug.saved.fill", sliderDebug.savedComponentStates?.fill);
            addSliderDebugStateLines("sliderDebug.saved.nib", sliderDebug.savedComponentStates?.nib);
            addSliderDebugStateLines("sliderDebug.saved.nib-hit", sliderDebug.savedComponentStates?.["nib-hit"]);
            formatSliderDebugRect("sliderDebug.metrics.projected", sliderDebug.metrics?.projected);
            lines.push(`sliderDebug.metrics.scales: localScaleX=${round(sliderDebug.metrics?.localScaleX)} localScaleY=${round(sliderDebug.metrics?.localScaleY)} resolvedHeight=${round(sliderDebug.metrics?.resolvedHeight)}`);
            lines.push(`sliderDebug.metrics.track: progressRatio=${round(sliderDebug.metrics?.progressRatio)} trackLeft=${round(sliderDebug.metrics?.trackLeft)} trackWidth=${round(sliderDebug.metrics?.trackWidth)} targetCenter=${round(sliderDebug.metrics?.targetCenter)}`);
            formatSliderDebugRect("sliderDebug.metrics.nibRect", sliderDebug.metrics?.nibRect);
            lines.push(`sliderDebug.art.slider: canvas=${sliderDebug.artMetrics?.slider?.canvasWidth ?? "n/a"}x${sliderDebug.artMetrics?.slider?.canvasHeight ?? "n/a"} visibleLeft=${round(sliderDebug.artMetrics?.slider?.visibleLeftRatio)} visibleTop=${round(sliderDebug.artMetrics?.slider?.visibleTopRatio)} visibleWidth=${round(sliderDebug.artMetrics?.slider?.visibleWidthRatio)} visibleHeight=${round(sliderDebug.artMetrics?.slider?.visibleHeightRatio)} hasBounds=${sliderDebug.artMetrics?.slider?.hasVisibleBounds === true ? "true" : "false"}`);
            lines.push(`sliderDebug.art.nib: canvas=${sliderDebug.artMetrics?.nib?.canvasWidth ?? "n/a"}x${sliderDebug.artMetrics?.nib?.canvasHeight ?? "n/a"} visibleLeft=${round(sliderDebug.artMetrics?.nib?.visibleLeftRatio)} visibleTop=${round(sliderDebug.artMetrics?.nib?.visibleTopRatio)} visibleWidth=${round(sliderDebug.artMetrics?.nib?.visibleWidthRatio)} visibleHeight=${round(sliderDebug.artMetrics?.nib?.visibleHeightRatio)} hasBounds=${sliderDebug.artMetrics?.nib?.hasVisibleBounds === true ? "true" : "false"}`);
            formatSliderDebugRect("sliderDebug.runtime.empty", sliderDebug.runtimeRects?.empty);
            formatSliderDebugRect("sliderDebug.runtime.fill-shell", sliderDebug.runtimeRects?.["fill-shell"]);
            formatSliderDebugRect("sliderDebug.runtime.fill-full", sliderDebug.runtimeRects?.["fill-full"]);
            formatSliderDebugRect("sliderDebug.runtime.nib", sliderDebug.runtimeRects?.nib);
            formatSliderDebugRect("sliderDebug.runtime.nib-hit", sliderDebug.runtimeRects?.["nib-hit"]);
        }
        lines.push("");
        addSliderComputedStyleLines("sliderGroup", layers.sliderGroup);
        addSliderComputedStyleLines("sliderTrackShell", layers.sliderTrackShell);
        addSliderComputedStyleLines("sliderFillShell", layers.sliderFillShell);
        addSliderComputedStyleLines("sliderNibVisual", layers.sliderNibVisual);
        addSliderComputedStyleLines("durationSlider", layers.durationSlider);
        lines.push("");

        if (layers.appShell) {
            const appShellComputed = window.getComputedStyle(layers.appShell);
            lines.push(`appShell.backgroundImage: ${summarizeCssValue(appShellComputed.backgroundImage)}`);
            lines.push(`appShell.backgroundSize: ${summarizeCssValue(appShellComputed.backgroundSize)}`);
            lines.push(`appShell.backgroundPosition: ${summarizeCssValue(appShellComputed.backgroundPosition)}`);
        }

        if (layers.homeRoot) {
            const homeRootComputed = window.getComputedStyle(layers.homeRoot);
            lines.push(`homeRoot.background: ${summarizeCssValue(homeRootComputed.backgroundColor)}`);
        }

        if (layers.homeSceneArt) {
            const sceneComputed = window.getComputedStyle(layers.homeSceneArt);
            lines.push(`homeSceneArt.backgroundImage: ${summarizeCssValue(sceneComputed.backgroundImage)}`);
            lines.push(`homeSceneArt.opacity: ${summarizeCssValue(sceneComputed.opacity)}`);
        }

        if (layers.worldStageShell) {
            const worldShellComputed = window.getComputedStyle(layers.worldStageShell);
            lines.push(`worldStageShell.overflow: ${summarizeCssValue(worldShellComputed.overflow)}`);
            lines.push(`worldStageShell.opacity: ${summarizeCssValue(worldShellComputed.opacity)}`);
        }

        if (layers.safeUiStageShell) {
            const safeUiComputed = window.getComputedStyle(layers.safeUiStageShell);
            lines.push(`safeUiStageShell.overflow: ${summarizeCssValue(safeUiComputed.overflow)}`);
            lines.push(`safeUiStageShell.opacity: ${summarizeCssValue(safeUiComputed.opacity)}`);
        }

        return lines.join("\n");
    }
    //#endregion SEGMENT E - Output Builder

    //#region SEGMENT F - Panel Lifecycle And Boot
    function fallbackCopyText(text) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "readonly");
        textarea.setAttribute("aria-hidden", "true");
        textarea.style.position = "fixed";
        textarea.style.top = "0";
        textarea.style.left = "-9999px";
        textarea.style.width = "1px";
        textarea.style.height = "1px";
        textarea.style.opacity = "0";
        textarea.style.pointerEvents = "none";

        document.body.appendChild(textarea);

        try {
            textarea.focus();
            textarea.select();
            textarea.setSelectionRange(0, textarea.value.length);
            return document.execCommand("copy");
        }
        catch {
            return false;
        }
        finally {
            textarea.remove();
        }
    }

    function setCollapsed(panel, collapsed) {
        panel.classList.toggle("pl-viewport-debug-panel-collapsed", collapsed);
        const toggleButton = panel.querySelector("#pl-viewport-debug-toggle");

        if (toggleButton) {
            toggleButton.textContent = collapsed ? "Expand" : "Collapse";
        }

        try {
            window.sessionStorage.setItem(collapsedStorageKey, collapsed ? "1" : "0");
        }
        catch {
        }
    }

    function readCollapsedPreference() {
        try {
            return window.sessionStorage.getItem(collapsedStorageKey) === "1";
        }
        catch {
            return false;
        }
    }

    function init() {
        injectStyles();
        const panel = createPanel();
        const output = panel.querySelector("#pl-viewport-debug-output");
        const refreshButton = panel.querySelector("#pl-viewport-debug-refresh");
        const copyButton = panel.querySelector("#pl-viewport-debug-copy");
        const toggleButton = panel.querySelector("#pl-viewport-debug-toggle");
        const resetLayersButton = panel.querySelector("#pl-viewport-debug-reset-layers");

        if (!output || !refreshButton || !copyButton || !toggleButton || !resetLayersButton) {
            return;
        }

        let layerState = readLayerToggleState();

        const update = () => {
            output.textContent = buildOutput();
        };

        const applyAndRefresh = () => {
            applyLayerDiagnostics(layerState);
            syncLayerToggleInputs(panel, layerState);
            writeLayerToggleState(layerState);
            update();
        };

        refreshButton.addEventListener("click", update);
        copyButton.addEventListener("click", async () => {
            const text = buildOutput();
            let copied = false;

            try {
                await navigator.clipboard.writeText(text);
                copied = true;
            }
            catch {
                copied = fallbackCopyText(text);
            }

            if (copied) {
                copyButton.textContent = "Copied";
                return;
            }

            output.textContent = `${text}\n\n[Copy failed. Use the browser share sheet or long-press in Safari if needed.]`;
            copyButton.textContent = "Copy Failed";

            window.setTimeout(() => {
                copyButton.textContent = "Copy Data";
            }, 1500);
        });
        toggleButton.addEventListener("click", () => {
            const collapsed = !panel.classList.contains("pl-viewport-debug-panel-collapsed");
            setCollapsed(panel, collapsed);
        });

        const checkboxBindings = [
            ["#pl-viewport-debug-shell-tint", "shellTint"],
            ["#pl-viewport-debug-root-tint", "rootTint"],
            ["#pl-viewport-debug-world-tint", "worldTint"],
            ["#pl-viewport-debug-hide-scene", "hideScene"],
            ["#pl-viewport-debug-hide-world", "hideWorld"],
            ["#pl-viewport-debug-hide-safe-ui", "hideSafeUi"]
        ];

        checkboxBindings.forEach(([selector, key]) => {
            const input = panel.querySelector(selector);

            if (!input) {
                return;
            }

            input.addEventListener("change", () => {
                layerState = {
                    ...layerState,
                    [key]: input.checked
                };
                applyAndRefresh();
            });
        });

        resetLayersButton.addEventListener("click", () => {
            layerState = createDefaultLayerToggleState();
            applyAndRefresh();
        });

        setCollapsed(panel, readCollapsedPreference());
        applyAndRefresh();

        window.addEventListener("resize", update);
        window.addEventListener("orientationchange", update);
        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("pageshow", update);
        window.addEventListener("pl-home-stage-resized", update);

        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", update);
            window.visualViewport.addEventListener("scroll", update);
        }

        window.setInterval(update, 1000);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    }
    else {
        init();
    }
    //#endregion SEGMENT F - Panel Lifecycle And Boot
})();
