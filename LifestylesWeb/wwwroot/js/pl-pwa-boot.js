(() => {
    // SEGMENT A — PWA Boot START
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

    applyPwaEnvironment();

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
    // SEGMENT A — PWA Boot END
})();
