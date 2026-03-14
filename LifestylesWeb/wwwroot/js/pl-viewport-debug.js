// SEGMENT A START — Viewport Debug Bootstrap
(function () {
    const searchParams = new URL(window.location.href).searchParams;
    const layoutModeEnabled = searchParams.get("layout") === "1";

    if (!layoutModeEnabled) {
        return;
    }

    const panelId = "pl-viewport-debug-panel";
    const collapsedStorageKey = "plViewportDebugCollapsed";

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
    // SEGMENT A END — Viewport Debug Bootstrap
    // SEGMENT B START — Viewport Debug Measurements
    function buildOutput() {
        const homeRoot = document.getElementById("pl-home-root");
        const html = document.documentElement;
        const safeArea = readSafeAreaInsets();
        const homeRect = homeRoot ? homeRoot.getBoundingClientRect() : null;
        const visualViewport = window.visualViewport;

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

        lines.push(formatRect("homeRoot.rect", homeRect));

        if (homeRoot) {
            const computed = window.getComputedStyle(homeRoot);
            lines.push(`homeRoot.cssSize: ${computed.width} x ${computed.height}`);
            lines.push(`homeRoot.clientSize: ${round(homeRoot.clientWidth)} x ${round(homeRoot.clientHeight)}`);
            lines.push(`homeRoot.offsetSize: ${round(homeRoot.offsetWidth)} x ${round(homeRoot.offsetHeight)}`);
        }

        if (homeRect) {
            lines.push(`homeRoot.bottom - innerHeight: ${round(homeRect.bottom - window.innerHeight)}`);
            lines.push(`homeRoot.bottom - clientHeight: ${round(homeRect.bottom - html.clientHeight)}`);

            if (visualViewport) {
                lines.push(`homeRoot.bottom - visualViewport.height: ${round(homeRect.bottom - visualViewport.height)}`);
            }
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

        if (!output || !refreshButton || !toggleButton) {
            return;
        }

        const update = () => {
            output.textContent = buildOutput();
        };

        refreshButton.addEventListener("click", update);
        toggleButton.addEventListener("click", () => {
            const collapsed = !panel.classList.contains("pl-viewport-debug-panel-collapsed");
            setCollapsed(panel, collapsed);
        });

        setCollapsed(panel, readCollapsedPreference());
        update();

        window.addEventListener("resize", update);
        window.addEventListener("orientationchange", update);
        window.addEventListener("scroll", update, { passive: true });

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