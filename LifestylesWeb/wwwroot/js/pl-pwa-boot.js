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
    async function registerServiceWorker() {
        const isSecureLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        const isSecureContext = window.location.protocol === "https:" || isSecureLocalHost;

        if (!("serviceWorker" in navigator) || !isSecureContext) {
            return null;
        }

        try {
            const registration = await navigator.serviceWorker.register("/pl-service-worker.js", {
                scope: "/"
            });

            window.__plServiceWorkerRegistration = registration;

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
    applyPwaEnvironment();
    registerServiceWorker();

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
