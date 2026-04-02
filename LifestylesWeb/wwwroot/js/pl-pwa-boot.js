(() => {
    //#region SEGMENT A - PWA Environment Reader
    function readPwaEnvironment() {
        const navigatorStandalone =
            typeof navigator !== "undefined" && navigator.standalone === true;

        const displayModeStandalone =
            typeof window.matchMedia === "function" &&
            window.matchMedia("(display-mode: standalone)").matches;

        const url = new URL(window.location.href);

        return {
            isStandalone: navigatorStandalone || displayModeStandalone,
            navigatorStandalone,
            displayModeStandalone,
            launchHref: window.location.href,
            launchPath: window.location.pathname,
            launchSearch: window.location.search,
            launchSource: url.searchParams.get("source") || "",
            referrer: document.referrer || ""
        };
    }
    //#endregion SEGMENT A - PWA Environment Reader

    //#region SEGMENT B - PWA Environment Application
    function applyPwaEnvironment() {
        const env = readPwaEnvironment();

        window.__plPwaEnv = env;

        document.documentElement.classList.toggle("pl-standalone", env.isStandalone);
        document.documentElement.classList.toggle("pl-browser", !env.isStandalone);
        document.documentElement.dataset.plStandalone = env.isStandalone ? "true" : "false";
        document.documentElement.dataset.plNavigatorStandalone = env.navigatorStandalone ? "true" : "false";
        document.documentElement.dataset.plDisplayModeStandalone = env.displayModeStandalone ? "true" : "false";
        document.documentElement.dataset.plLaunchSource = env.launchSource || "none";

        window.dispatchEvent(
            new CustomEvent("pl-pwa-env-changed", {
                detail: env
            }));
    }
    //#endregion SEGMENT B - PWA Environment Application

    //#region SEGMENT C - Service Worker Registration
    const serviceWorkerScriptUrl = "/pl-service-worker.js?v=5";
    const bootDiagnostics = {
        firstPaintReady: false,
        firstPaintAt: "",
        lastWindowError: "",
        lastUnhandledRejection: "",
        serviceWorkerSupported: "serviceWorker" in navigator,
        serviceWorkerRegistered: false,
        serviceWorkerRegistrationError: "",
        serviceWorkerControllingPage: !!navigator.serviceWorker?.controller,
        serviceWorkerControllerChangeCount: 0,
        lastServiceWorkerStatus: "",
        lastServiceWorkerStatusAt: "",
        cacheApiAvailable: "caches" in window,
        cacheProbeSummary: "pending",
        cacheProbeDetails: {
            root: "pending",
            homeCanvas: "pending",
            focusCss: "pending"
        }
    };
    let bootDiagnosticsOverlay = null;
    let bootDiagnosticsBody = null;
    let bootDiagnosticsStatus = null;
    let bootDiagnosticsTimeoutId = 0;
    let bootDiagnosticsVisible = false;

    function recordBootDiagnostic(partial) {
        Object.assign(bootDiagnostics, partial || {});
        window.__plBootDiagnostics = bootDiagnostics;
        window.dispatchEvent(new CustomEvent("pl-boot-diagnostics-updated", {
            detail: { ...bootDiagnostics }
        }));
        renderBootDiagnostics();
    }

    function formatBootDiagnosticValue(value) {
        if (value === true) {
            return "yes";
        }

        if (value === false) {
            return "no";
        }

        if (value === null || value === undefined || value === "") {
            return "none";
        }

        return String(value);
    }

    function renderBootDiagnostics() {
        if (!bootDiagnosticsBody || !bootDiagnosticsStatus) {
            return;
        }

        bootDiagnosticsStatus.textContent = bootDiagnostics.firstPaintReady
            ? "App first paint completed."
            : "App has not reached first paint yet.";

        const env = window.__plPwaEnv || readPwaEnvironment();
        const lines = [
            `Secure context: ${formatBootDiagnosticValue(window.isSecureContext)}`,
            `Standalone mode: ${formatBootDiagnosticValue(env.isStandalone)}`,
            `Online: ${formatBootDiagnosticValue(typeof navigator.onLine === "boolean" ? navigator.onLine : "unknown")}`,
            `Service worker supported: ${formatBootDiagnosticValue(bootDiagnostics.serviceWorkerSupported)}`,
            `Service worker registered: ${formatBootDiagnosticValue(bootDiagnostics.serviceWorkerRegistered)}`,
            `Service worker controlling page: ${formatBootDiagnosticValue(bootDiagnostics.serviceWorkerControllingPage)}`,
            `Controller changes seen: ${formatBootDiagnosticValue(bootDiagnostics.serviceWorkerControllerChangeCount)}`,
            `Last service worker status: ${formatBootDiagnosticValue(bootDiagnostics.lastServiceWorkerStatus)}`,
            `Last SW status time: ${formatBootDiagnosticValue(bootDiagnostics.lastServiceWorkerStatusAt)}`,
            `Cache API available: ${formatBootDiagnosticValue(bootDiagnostics.cacheApiAvailable)}`,
            `Cache probe summary: ${formatBootDiagnosticValue(bootDiagnostics.cacheProbeSummary)}`,
            `Cache '/' present: ${formatBootDiagnosticValue(bootDiagnostics.cacheProbeDetails.root)}`,
            `Cache pl-home-canvas.js present: ${formatBootDiagnosticValue(bootDiagnostics.cacheProbeDetails.homeCanvas)}`,
            `Cache focus-canvas.css present: ${formatBootDiagnosticValue(bootDiagnostics.cacheProbeDetails.focusCss)}`,
            `First paint ready: ${formatBootDiagnosticValue(bootDiagnostics.firstPaintReady)}`,
            `First paint time: ${formatBootDiagnosticValue(bootDiagnostics.firstPaintAt)}`,
            `Service worker register error: ${formatBootDiagnosticValue(bootDiagnostics.serviceWorkerRegistrationError)}`,
            `Last window error: ${formatBootDiagnosticValue(bootDiagnostics.lastWindowError)}`,
            `Last unhandled rejection: ${formatBootDiagnosticValue(bootDiagnostics.lastUnhandledRejection)}`
        ];

        bootDiagnosticsBody.textContent = lines.join("\n");
    }

    function ensureBootDiagnosticsOverlay() {
        if (bootDiagnosticsOverlay || !document.body) {
            return;
        }

        const style = document.createElement("style");
        style.id = "pl-boot-diagnostics-style";
        style.textContent = `
            #pl-boot-diagnostics {
                position: fixed;
                inset: 0;
                z-index: 2147483647;
                display: none;
                padding: max(16px, env(safe-area-inset-top)) 16px 16px 16px;
                background: rgba(15, 23, 42, 0.96);
                color: #e2e8f0;
                font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
                overflow: auto;
                white-space: pre-wrap;
            }

            #pl-boot-diagnostics[data-visible="true"] {
                display: block;
            }

            #pl-boot-diagnostics h1 {
                margin: 0 0 12px 0;
                font-size: 18px;
                line-height: 1.35;
                color: #f8fafc;
            }

            #pl-boot-diagnostics p {
                margin: 0 0 12px 0;
                font-size: 13px;
                line-height: 1.5;
                color: #cbd5e1;
            }

            #pl-boot-diagnostics pre {
                margin: 0;
                font-size: 12px;
                line-height: 1.55;
                color: #bfdbfe;
            }
        `;
        document.head.appendChild(style);

        bootDiagnosticsOverlay = document.createElement("section");
        bootDiagnosticsOverlay.id = "pl-boot-diagnostics";
        bootDiagnosticsOverlay.setAttribute("aria-live", "polite");
        bootDiagnosticsOverlay.innerHTML = `
            <h1>Pokemon Lifestyles Boot Diagnostics</h1>
            <p id="pl-boot-diagnostics-status">Waiting for startup status…</p>
            <pre id="pl-boot-diagnostics-body"></pre>
        `;

        document.body.appendChild(bootDiagnosticsOverlay);
        bootDiagnosticsOverlay.dataset.visible = bootDiagnosticsVisible ? "true" : "false";
        bootDiagnosticsStatus = document.getElementById("pl-boot-diagnostics-status");
        bootDiagnosticsBody = document.getElementById("pl-boot-diagnostics-body");
        renderBootDiagnostics();
    }

    function setBootDiagnosticsVisible(isVisible) {
        if (!bootDiagnosticsOverlay && isVisible) {
            ensureBootDiagnosticsOverlay();
        }

        bootDiagnosticsVisible = !!isVisible;

        if (bootDiagnosticsOverlay) {
            bootDiagnosticsOverlay.dataset.visible = bootDiagnosticsVisible ? "true" : "false";
        }
    }

    async function runCacheDiagnostics() {
        if (!("caches" in window)) {
            recordBootDiagnostic({
                cacheProbeSummary: "cache api unavailable",
                cacheProbeDetails: {
                    root: "unavailable",
                    homeCanvas: "unavailable",
                    focusCss: "unavailable"
                }
            });
            return;
        }

        try {
            const [rootMatch, homeCanvasMatch, focusCssMatch] = await Promise.all([
                caches.match(new URL("/", window.location.origin).href),
                caches.match(new URL("/js/pl-home-canvas.js", window.location.origin).href),
                caches.match(new URL("/css/focus-canvas.css", window.location.origin).href)
            ]);

            recordBootDiagnostic({
                cacheProbeSummary: "completed",
                cacheProbeDetails: {
                    root: rootMatch ? "present" : "missing",
                    homeCanvas: homeCanvasMatch ? "present" : "missing",
                    focusCss: focusCssMatch ? "present" : "missing"
                }
            });
        }
        catch (error) {
            recordBootDiagnostic({
                cacheProbeSummary: error instanceof Error ? error.message : String(error || "cache probe failed"),
                cacheProbeDetails: {
                    root: "error",
                    homeCanvas: "error",
                    focusCss: "error"
                }
            });
        }
    }

    function markFirstPaintReady() {
        recordBootDiagnostic({
            firstPaintReady: true,
            firstPaintAt: new Date().toISOString()
        });

        if (bootDiagnosticsTimeoutId) {
            clearTimeout(bootDiagnosticsTimeoutId);
            bootDiagnosticsTimeoutId = 0;
        }

        setBootDiagnosticsVisible(false);
    }

    function scheduleBootDiagnosticsTimeout() {
        if (bootDiagnosticsTimeoutId) {
            clearTimeout(bootDiagnosticsTimeoutId);
        }

        bootDiagnosticsTimeoutId = window.setTimeout(async function () {
            if (bootDiagnostics.firstPaintReady) {
                return;
            }

            await runCacheDiagnostics();
            setBootDiagnosticsVisible(true);
        }, 5000);
    }

    async function registerServiceWorker() {
        const isSecureLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        const isSecureContext = window.location.protocol === "https:" || isSecureLocalHost;

        if (!("serviceWorker" in navigator) || !isSecureContext) {
            recordBootDiagnostic({
                serviceWorkerRegistered: false,
                serviceWorkerRegistrationError: !("serviceWorker" in navigator)
                    ? "service worker unsupported"
                    : "insecure context"
            });
            return null;
        }

        try {
            const registration = await navigator.serviceWorker.register(serviceWorkerScriptUrl, {
                scope: "/"
            });

            window.__plServiceWorkerRegistration = registration;
            recordBootDiagnostic({
                serviceWorkerRegistered: true,
                serviceWorkerRegistrationError: "",
                serviceWorkerControllingPage: !!navigator.serviceWorker.controller
            });

            if (registration.active) {
                registration.active.postMessage({
                    type: "pl-warm-offline-assets"
                });
            }

            if (registration.installing) {
                registration.installing.addEventListener("statechange", function () {
                    if (registration.active) {
                        registration.active.postMessage({
                            type: "pl-warm-offline-assets"
                        });
                    }
                });
            }

            if (registration.waiting) {
                registration.waiting.postMessage({
                    type: "pl-warm-offline-assets"
                });
            }

            window.dispatchEvent(
                new CustomEvent("pl-service-worker-ready", {
                    detail: {
                        ok: true,
                        scope: registration.scope
                    }
                }));

            return registration;
        }
        catch (error) {
            recordBootDiagnostic({
                serviceWorkerRegistered: false,
                serviceWorkerRegistrationError: error instanceof Error ? error.message : String(error || "Unknown error")
            });

            window.dispatchEvent(
                new CustomEvent("pl-service-worker-ready", {
                    detail: {
                        ok: false,
                        error: error instanceof Error ? error.message : String(error || "Unknown error")
                    }
                }));

            return null;
        }
    }
    //#endregion SEGMENT C - Service Worker Registration

    //#region SEGMENT D - Boot And Event Wiring
    window.__plBootDiagnostics = bootDiagnostics;

    applyPwaEnvironment();
    registerServiceWorker();
    scheduleBootDiagnosticsTimeout();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", ensureBootDiagnosticsOverlay, { once: true });
    } else {
        ensureBootDiagnosticsOverlay();
    }

    window.addEventListener("pl-home-first-paint-ready", markFirstPaintReady, { once: true });
    window.addEventListener("error", function (event) {
        recordBootDiagnostic({
            lastWindowError: event.message || "Unknown window error"
        });
    });
    window.addEventListener("unhandledrejection", function (event) {
        const reason = event.reason instanceof Error
            ? event.reason.message
            : String(event.reason || "Unknown rejection");

        recordBootDiagnostic({
            lastUnhandledRejection: reason
        });
    });

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.addEventListener("message", function (event) {
            if (event.data?.type !== "pl-service-worker-status") {
                return;
            }

            recordBootDiagnostic({
                lastServiceWorkerStatus: event.data.status || "unknown",
                lastServiceWorkerStatusAt: event.data.at || new Date().toISOString(),
                serviceWorkerControllingPage: !!navigator.serviceWorker.controller
            });
        });

        navigator.serviceWorker.addEventListener("controllerchange", function () {
            recordBootDiagnostic({
                serviceWorkerControllingPage: !!navigator.serviceWorker.controller,
                serviceWorkerControllerChangeCount: (bootDiagnostics.serviceWorkerControllerChangeCount || 0) + 1
            });
        });
    }

    const standaloneMedia =
        typeof window.matchMedia === "function"
            ? window.matchMedia("(display-mode: standalone)")
            : null;

    window.addEventListener("pageshow", applyPwaEnvironment);

    if (standaloneMedia) {
        if (typeof standaloneMedia.addEventListener === "function") {
            standaloneMedia.addEventListener("change", applyPwaEnvironment);
        } else if (typeof standaloneMedia.addListener === "function") {
            standaloneMedia.addListener(applyPwaEnvironment);
        }
    }
    //#endregion SEGMENT D - Boot And Event Wiring
})();
