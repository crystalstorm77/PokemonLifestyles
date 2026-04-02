//#region SEGMENT A - Cache Names And Core Assets
const APP_SHELL_CACHE = "pl-app-shell-v3";
const RUNTIME_CACHE = "pl-runtime-v3";
const OFFLINE_ASSET_MANIFEST_URL = "/offline-asset-manifest.json";
const CORE_APP_ASSET_PATHS = [
    "/",
    "/manifest.json",
    OFFLINE_ASSET_MANIFEST_URL,
    "/favicon.ico",
    "/css/site.css",
    "/css/art-skin.css",
    "/css/focus-canvas.css",
    "/js/pl-pwa-boot.js",
    "/js/pl-home-stage.js",
    "/js/pl-viewport-debug.js",
    "/js/pl-home-canvas.js",
    "/js/pl-offline-store.js",
    "/lib/bootstrap/dist/css/bootstrap.min.css",
    "/lib/bootstrap/dist/js/bootstrap.bundle.min.js"
];
//#endregion SEGMENT A - Cache Names And Core Assets

//#region SEGMENT B - Request Helpers
function toNormalizedCacheKey(input) {
    const rawUrl = typeof input === "string" ? input : input.url;
    const url = new URL(rawUrl, self.location.origin);

    if (url.origin !== self.location.origin) {
        return url.href;
    }

    if (url.pathname === "/index" || url.pathname === "/index/") {
        return `${self.location.origin}/`;
    }

    return `${self.location.origin}${url.pathname}`;
}

function isSameOriginGetRequest(request) {
    return request.method === "GET" && new URL(request.url).origin === self.location.origin;
}

function isNavigationRequest(request) {
    return request.mode === "navigate";
}

function isStaticAssetRequest(request) {
    const url = new URL(request.url);
    return /\.(?:css|js|png|jpg|jpeg|gif|svg|webp|ico|woff2?)$/i.test(url.pathname);
}

async function broadcastStatus(status, extra = {}) {
    const clients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true
    });

    for (const client of clients) {
        client.postMessage({
            type: "pl-service-worker-status",
            status,
            at: new Date().toISOString(),
            ...extra
        });
    }
}

async function cacheCoreShell() {
    const cache = await caches.open(APP_SHELL_CACHE);

    for (const assetPath of CORE_APP_ASSET_PATHS) {
        try {
            const response = await fetch(assetPath, { cache: "no-store" });
            if (response.ok) {
                await cache.put(toNormalizedCacheKey(assetPath), response.clone());
            }
        }
        catch {
        }
    }
}

async function warmDiscoveredAssets() {
    const cache = await caches.open(RUNTIME_CACHE);
    await broadcastStatus("warm-assets-started");

    try {
        const manifestResponse = await fetch(OFFLINE_ASSET_MANIFEST_URL, { cache: "no-store" });
        if (!manifestResponse.ok) {
            await broadcastStatus("warm-assets-manifest-failed", {
                httpStatus: manifestResponse.status
            });
            return;
        }

        const manifestPayload = await manifestResponse.json();
        const manifestAssets = Array.isArray(manifestPayload?.assets)
            ? manifestPayload.assets
            : [];

        for (const assetPath of manifestAssets) {
            if (CORE_APP_ASSET_PATHS.includes(assetPath)) {
                continue;
            }

            try {
                const response = await fetch(assetPath, { cache: "no-store" });
                if (response.ok) {
                    await cache.put(toNormalizedCacheKey(assetPath), response.clone());
                }
            }
            catch {
            }
        }

        await broadcastStatus("warm-assets-complete", {
            assetCount: manifestAssets.length
        });
    }
    catch {
        await broadcastStatus("warm-assets-error");
    }
}

async function clearOldCaches() {
    const keys = await caches.keys();
    const activeKeys = new Set([APP_SHELL_CACHE, RUNTIME_CACHE]);

    await Promise.all(
        keys.map((key) => {
            if (!activeKeys.has(key)) {
                return caches.delete(key);
            }

            return Promise.resolve(false);
        })
    );
}

async function cacheResponse(cacheName, request, response) {
    if (!response || !response.ok) {
        return response;
    }

    const cache = await caches.open(cacheName);
    await cache.put(toNormalizedCacheKey(request), response.clone());
    return response;
}
//#endregion SEGMENT B - Request Helpers

//#region SEGMENT C - Fetch Strategies
async function handleNavigationRequest(request) {
    try {
        const networkResponse = await fetch(request);
        await cacheResponse(APP_SHELL_CACHE, "/", networkResponse);
        return networkResponse;
    }
    catch {
        const cachedResponse = await caches.match(toNormalizedCacheKey("/"));
        if (cachedResponse) {
            await broadcastStatus("navigation-served-from-cache");
            return cachedResponse;
        }

        await broadcastStatus("navigation-cache-miss");
        return new Response(`<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Pokemon Lifestyles Offline Diagnostic</title>
    <style>
        body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 24px;
            background: #0f172a;
            color: #e2e8f0;
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        }

        article {
            max-width: 42rem;
            line-height: 1.6;
            white-space: pre-wrap;
        }

        h1 {
            margin-top: 0;
            color: #f8fafc;
        }
    </style>
</head>
<body>
    <article>
        <h1>Offline shell not available</h1>
        <p>The service worker handled an offline navigation, but the cached app shell for "/" was missing.</p>
        <p>Status: navigation-cache-miss</p>
    </article>
</body>
</html>`, {
            headers: {
                "Content-Type": "text/html; charset=utf-8"
            }
        });
    }
}

async function handleStaticAssetRequest(request) {
    const normalizedKey = toNormalizedCacheKey(request);
    const cachedResponse = await caches.match(normalizedKey);

    if (cachedResponse) {
        void fetch(request)
            .then((response) => cacheResponse(RUNTIME_CACHE, request, response))
            .catch(() => null);

        return cachedResponse;
    }

    const networkResponse = await fetch(request);
    return cacheResponse(RUNTIME_CACHE, request, networkResponse);
}

async function handleSameOriginRequest(request) {
    if (isNavigationRequest(request)) {
        return handleNavigationRequest(request);
    }

    if (isStaticAssetRequest(request)) {
        return handleStaticAssetRequest(request);
    }

    return fetch(request);
}
//#endregion SEGMENT C - Fetch Strategies

//#region SEGMENT D - Lifecycle And Event Wiring
self.addEventListener("install", (event) => {
    event.waitUntil(broadcastStatus("install-started"));
    event.waitUntil(cacheCoreShell());
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        clearOldCaches()
            .then(() => broadcastStatus("activate-started"))
            .then(() => self.clients.claim())
            .then(() => broadcastStatus("activate-complete"))
    );
});

self.addEventListener("message", (event) => {
    if (event.data?.type !== "pl-warm-offline-assets") {
        return;
    }

    event.waitUntil(warmDiscoveredAssets());
});

self.addEventListener("fetch", (event) => {
    if (!isSameOriginGetRequest(event.request)) {
        return;
    }

    event.respondWith(handleSameOriginRequest(event.request));
});
//#endregion SEGMENT D - Lifecycle And Event Wiring
