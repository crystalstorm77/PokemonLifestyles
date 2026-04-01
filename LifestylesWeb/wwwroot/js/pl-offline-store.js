(() => {
    //#region SEGMENT A - Constants And Versioned Keys
    const DATABASE_NAME = "pokemon-lifestyles-offline";
    const DATABASE_VERSION = 1;
    const RECORDS_STORE = "records";
    const METADATA_STORE = "metadata";
    const RECORD_TYPE_FOCUS_SESSION = "focus-session";
    const RECORD_TYPE_FOCUS_LABEL_CHANGE = "focus-label-change";
    const SYNC_STATUS_PENDING = "pending";
    const SYNC_STATUS_SYNCED = "synced";
    const DEVICE_ID_KEY = "device-id";
    const FOCUS_LABEL_SNAPSHOT_KEY = "focus-label-snapshot";
    //#endregion SEGMENT A - Constants And Versioned Keys

    //#region SEGMENT B - IndexedDB Helpers
    function openDatabase() {
        return new Promise((resolve, reject) => {
            if (typeof indexedDB === "undefined") {
                reject(new Error("IndexedDB is not available in this browser."));
                return;
            }

            const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

            request.onupgradeneeded = function () {
                const database = request.result;

                if (!database.objectStoreNames.contains(RECORDS_STORE)) {
                    const recordStore = database.createObjectStore(RECORDS_STORE, {
                        keyPath: "localId"
                    });

                    recordStore.createIndex("byType", "type", { unique: false });
                    recordStore.createIndex("bySyncStatus", "syncStatus", { unique: false });
                    recordStore.createIndex("byTypeAndSyncStatus", ["type", "syncStatus"], { unique: false });
                    recordStore.createIndex("byCreatedAt", "createdAt", { unique: false });
                }

                if (!database.objectStoreNames.contains(METADATA_STORE)) {
                    database.createObjectStore(METADATA_STORE, {
                        keyPath: "key"
                    });
                }
            };

            request.onsuccess = function () {
                resolve(request.result);
            };

            request.onerror = function () {
                reject(request.error || new Error("Unable to open offline database."));
            };
        });
    }

    function withStore(storeName, mode, action) {
        return openDatabase().then((database) => {
            return new Promise((resolve, reject) => {
                const transaction = database.transaction(storeName, mode);
                const store = transaction.objectStore(storeName);

                let actionResult;

                try {
                    actionResult = action(store, transaction);
                }
                catch (error) {
                    reject(error);
                    return;
                }

                transaction.oncomplete = function () {
                    resolve(actionResult);
                };

                transaction.onerror = function () {
                    reject(transaction.error || new Error(`Offline store transaction failed for ${storeName}.`));
                };

                transaction.onabort = function () {
                    reject(transaction.error || new Error(`Offline store transaction aborted for ${storeName}.`));
                };
            }).finally(() => {
                database.close();
            });
        });
    }

    function requestToPromise(request) {
        return new Promise((resolve, reject) => {
            request.onsuccess = function () {
                resolve(request.result);
            };

            request.onerror = function () {
                reject(request.error || new Error("IndexedDB request failed."));
            };
        });
    }
    //#endregion SEGMENT B - IndexedDB Helpers

    //#region SEGMENT C - Record Normalizers And Identifiers
    function createLocalId(prefix) {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
            return `${prefix}-${crypto.randomUUID()}`;
        }

        return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
    }

    function normalizeText(value, fallback = "") {
        return typeof value === "string"
            ? value.trim()
            : fallback;
    }

    function normalizeSyncStatus(value) {
        return value === SYNC_STATUS_SYNCED
            ? SYNC_STATUS_SYNCED
            : SYNC_STATUS_PENDING;
    }

    function normalizeIsoDate(value) {
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }

        return new Date().toISOString();
    }

    function normalizeFocusSessionRecord(input) {
        const payload = input && typeof input === "object" ? input : {};

        return {
            localId: normalizeText(payload.localId) || createLocalId("focus-session"),
            type: RECORD_TYPE_FOCUS_SESSION,
            createdAt: normalizeIsoDate(payload.createdAt),
            updatedAt: normalizeIsoDate(payload.updatedAt || payload.createdAt),
            syncStatus: normalizeSyncStatus(payload.syncStatus),
            syncedAt: normalizeText(payload.syncedAt) || "",
            payload: {
                phoneSessionId: normalizeText(payload.payload?.phoneSessionId) || createLocalId("phone-session"),
                loggedAt: normalizeIsoDate(payload.payload?.loggedAt),
                logDate: normalizeText(payload.payload?.logDate),
                focusType: normalizeText(payload.payload?.focusType, "Focus") || "Focus",
                durationSeconds: Number.isFinite(payload.payload?.durationSeconds) ? Math.max(0, Math.trunc(payload.payload.durationSeconds)) : 0,
                completed: payload.payload?.completed === true,
                timerMode: normalizeText(payload.payload?.timerMode, "countdown") || "countdown",
                plannedDurationSeconds: Number.isFinite(payload.payload?.plannedDurationSeconds) ? Math.max(0, Math.trunc(payload.payload.plannedDurationSeconds)) : 0,
                rewardXp: Number.isFinite(payload.payload?.rewardXp) ? Math.max(0, Math.trunc(payload.payload.rewardXp)) : 0,
                rewardCoins: Number.isFinite(payload.payload?.rewardCoins) ? Math.max(0, Math.trunc(payload.payload.rewardCoins)) : 0
            }
        };
    }

    function normalizeFocusLabelChangeRecord(input) {
        const payload = input && typeof input === "object" ? input : {};

        return {
            localId: normalizeText(payload.localId) || createLocalId("focus-label-change"),
            type: RECORD_TYPE_FOCUS_LABEL_CHANGE,
            createdAt: normalizeIsoDate(payload.createdAt),
            updatedAt: normalizeIsoDate(payload.updatedAt || payload.createdAt),
            syncStatus: normalizeSyncStatus(payload.syncStatus),
            syncedAt: normalizeText(payload.syncedAt) || "",
            payload: {
                phoneChangeId: normalizeText(payload.payload?.phoneChangeId) || createLocalId("phone-label-change"),
                action: normalizeText(payload.payload?.action),
                name: normalizeText(payload.payload?.name),
                nextName: normalizeText(payload.payload?.nextName),
                loggedAt: normalizeIsoDate(payload.payload?.loggedAt)
            }
        };
    }

    function normalizeRecord(record) {
        if (!record || typeof record !== "object") {
            throw new Error("Offline record is required.");
        }

        switch (record.type) {
            case RECORD_TYPE_FOCUS_SESSION:
                return normalizeFocusSessionRecord(record);
            case RECORD_TYPE_FOCUS_LABEL_CHANGE:
                return normalizeFocusLabelChangeRecord(record);
            default:
                throw new Error(`Unsupported offline record type: ${String(record.type || "")}`);
        }
    }

    function normalizeFocusLabelSnapshot(labels) {
        if (!Array.isArray(labels)) {
            return [];
        }

        const seen = new Set();

        return labels
            .map(function (label) {
                return normalizeText(label);
            })
            .filter(function (label) {
                if (!label) {
                    return false;
                }

                const normalizedKey = label.toLowerCase();
                if (seen.has(normalizedKey)) {
                    return false;
                }

                seen.add(normalizedKey);
                return true;
            });
    }
    //#endregion SEGMENT C - Record Normalizers And Identifiers

    //#region SEGMENT D - Metadata And Record Persistence
    async function getMetadataValue(key) {
        const entry = await withStore(METADATA_STORE, "readonly", (store) => requestToPromise(store.get(key)));
        return entry?.value;
    }

    async function setMetadataValue(key, value) {
        await withStore(METADATA_STORE, "readwrite", (store) => {
            store.put({
                key,
                value,
                updatedAt: new Date().toISOString()
            });
        });

        return value;
    }

    async function ensureDeviceId() {
        const existingDeviceId = await getMetadataValue(DEVICE_ID_KEY);
        if (normalizeText(existingDeviceId)) {
            return existingDeviceId;
        }

        const createdDeviceId = createLocalId("device");
        await setMetadataValue(DEVICE_ID_KEY, createdDeviceId);
        return createdDeviceId;
    }

    async function getFocusLabelSnapshot() {
        const snapshot = await getMetadataValue(FOCUS_LABEL_SNAPSHOT_KEY);
        return normalizeFocusLabelSnapshot(snapshot);
    }

    async function setFocusLabelSnapshot(labels) {
        const normalizedLabels = normalizeFocusLabelSnapshot(labels);
        await setMetadataValue(FOCUS_LABEL_SNAPSHOT_KEY, normalizedLabels);
        return normalizedLabels;
    }

    async function putRecord(record) {
        const normalized = normalizeRecord(record);
        normalized.updatedAt = new Date().toISOString();

        if (normalized.syncStatus !== SYNC_STATUS_SYNCED) {
            normalized.syncedAt = "";
        }

        await withStore(RECORDS_STORE, "readwrite", (store) => {
            store.put(normalized);
        });

        return normalized;
    }

    async function listRecordsBySyncStatus(syncStatus) {
        return withStore(RECORDS_STORE, "readonly", (store) => {
            const index = store.index("bySyncStatus");
            return requestToPromise(index.getAll(syncStatus));
        });
    }

    async function listRecordsByType(type) {
        return withStore(RECORDS_STORE, "readonly", (store) => {
            const index = store.index("byType");
            return requestToPromise(index.getAll(type));
        });
    }

    async function markRecordsSynced(localIds, syncedAt = new Date().toISOString()) {
        const ids = Array.isArray(localIds) ? localIds.filter(Boolean) : [];

        if (!ids.length) {
            return [];
        }

        return withStore(RECORDS_STORE, "readwrite", (store) => {
            return new Promise((resolve, reject) => {
                const updated = [];
                let index = 0;

                function processNext() {
                    if (index >= ids.length) {
                        resolve(updated);
                        return;
                    }

                    const localId = ids[index];
                    index += 1;

                    const getRequest = store.get(localId);

                    getRequest.onsuccess = function () {
                        const existing = getRequest.result;

                        if (!existing) {
                            processNext();
                            return;
                        }

                        existing.syncStatus = SYNC_STATUS_SYNCED;
                        existing.syncedAt = syncedAt;
                        existing.updatedAt = new Date().toISOString();

                        const putRequest = store.put(existing);
                        putRequest.onsuccess = function () {
                            updated.push(existing);
                            processNext();
                        };
                        putRequest.onerror = function () {
                            reject(putRequest.error || new Error(`Could not mark record ${localId} as synced.`));
                        };
                    };

                    getRequest.onerror = function () {
                        reject(getRequest.error || new Error(`Could not read record ${localId} for sync update.`));
                    };
                }

                processNext();
            });
        });
    }

    async function getSyncSummary() {
        const records = await withStore(RECORDS_STORE, "readonly", (store) => requestToPromise(store.getAll()));
        const summary = {
            deviceId: await ensureDeviceId(),
            totalRecords: records.length,
            pendingRecords: 0,
            syncedRecords: 0,
            pendingFocusSessions: 0,
            pendingFocusLabelChanges: 0
        };

        for (const record of records) {
            if (record.syncStatus === SYNC_STATUS_SYNCED) {
                summary.syncedRecords += 1;
                continue;
            }

            summary.pendingRecords += 1;

            if (record.type === RECORD_TYPE_FOCUS_SESSION) {
                summary.pendingFocusSessions += 1;
            }
            else if (record.type === RECORD_TYPE_FOCUS_LABEL_CHANGE) {
                summary.pendingFocusLabelChanges += 1;
            }
        }

        return summary;
    }
    //#endregion SEGMENT D - Metadata And Record Persistence

    //#region SEGMENT E - Public API And Boot Wiring
    const offlineStoreApi = {
        databaseName: DATABASE_NAME,
        databaseVersion: DATABASE_VERSION,
        recordTypes: Object.freeze({
            focusSession: RECORD_TYPE_FOCUS_SESSION,
            focusLabelChange: RECORD_TYPE_FOCUS_LABEL_CHANGE
        }),
        syncStatuses: Object.freeze({
            pending: SYNC_STATUS_PENDING,
            synced: SYNC_STATUS_SYNCED
        }),
        init: ensureDeviceId,
        ensureDeviceId,
        putRecord,
        listPendingRecords: function () {
            return listRecordsBySyncStatus(SYNC_STATUS_PENDING);
        },
        listRecordsByType,
        queueFocusSession: function (payload) {
            return putRecord({
                type: RECORD_TYPE_FOCUS_SESSION,
                payload
            });
        },
        queueFocusLabelChange: function (payload) {
            return putRecord({
                type: RECORD_TYPE_FOCUS_LABEL_CHANGE,
                payload
            });
        },
        getFocusLabelSnapshot,
        setFocusLabelSnapshot,
        markRecordsSynced,
        getSyncSummary
    };

    window.__plOfflineStore = offlineStoreApi;
    window.__plOfflineStoreReady = ensureDeviceId()
        .then((deviceId) => {
            window.dispatchEvent(
                new CustomEvent("pl-offline-store-ready", {
                    detail: {
                        ok: true,
                        deviceId
                    }
                }));

            return deviceId;
        })
        .catch((error) => {
            window.dispatchEvent(
                new CustomEvent("pl-offline-store-ready", {
                    detail: {
                        ok: false,
                        error: error instanceof Error ? error.message : String(error || "Unknown error")
                    }
                }));

            throw error;
        });
    //#endregion SEGMENT E - Public API And Boot Wiring
})();
