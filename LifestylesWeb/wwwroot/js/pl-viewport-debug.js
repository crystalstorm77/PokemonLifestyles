// SEGMENT A START — Viewport Debug Bootstrap
(function () {
    const searchParams = new URL(window.location.href).searchParams;
    const layoutModeEnabled = searchParams.get("layout") === "1";

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
            safeZoneOutline: document.getElementById("pl-safe-zone-outline")
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
            // Ignore storage availability issues.
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
    // SEGMENT A END — Viewport Debug Bootstrap
    // SEGMENT B START — Viewport Debug Measurements
    function buildOutput() {
        const html = document.documentElement;
        const safeArea = readSafeAreaInsets();
        const visualViewport = window.visualViewport;
        const layers = getLayerElements();

        const appShellRect = layers.appShell ? layers.appShell.getBoundingClientRect() : null;
        const homeStageShellRect = layers.homeStageShell ? layers.homeStageShell.getBoundingClientRect() : null;
        const homeStageRect = layers.homeStage ? layers.homeStage.getBoundingClientRect() : null;
        const homeRootRect = layers.homeRoot ? layers.homeRoot.getBoundingClientRect() : null;
        const worldStageShellRect = layers.worldStageShell ? layers.worldStageShell.getBoundingClientRect() : null;
        const worldStageRect = layers.worldStage ? layers.worldStage.getBoundingClientRect() : null;
        const safeUiStageShellRect = layers.safeUiStageShell ? layers.safeUiStageShell.getBoundingClientRect() : null;
        const safeUiStageRect = layers.safeUiStage ? layers.safeUiStage.getBoundingClientRect() : null;
        const safeZoneOutlineRect = layers.safeZoneOutline ? layers.safeZoneOutline.getBoundingClientRect() : null;

        const lines = [];
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
            // Ignore storage availability issues.
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
        const toggleButton = panel.querySelector("#pl-viewport-debug-toggle");
        const resetLayersButton = panel.querySelector("#pl-viewport-debug-reset-layers");

        if (!output || !refreshButton || !toggleButton || !resetLayersButton) {
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
})();
// SEGMENT B END — Viewport Debug Measurements