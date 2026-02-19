/**
 * Cloud Sync Manager - Unified cloud synchronization via GitHub Gist
 * v2.0: Debounced auto-sync, offline queue with exponential backoff, full save sync
 * @module cloudSync
 */

export class CloudSyncManager {
    constructor() {
        this.config = {
            githubToken: localStorage.getItem('ballSurvivalGithubToken') || '',
            gistId: '1dc2b7cdfc87ca61cfaf7e2dc7e13cfd',
            enableCloudSync: false,
            minApiInterval: 1000
        };
        this.lastApiCall = 0;
        this.isSyncing = false;

        // Auto-sync state
        this._autoSyncInterval = null;
        this._autoSyncDebounce = null;
        this._lastSyncTime = 0;
        this._syncIntervalMs = 60000; // 60s
        this._debounceMs = 5000; // 5s

        // Offline queue with exponential backoff
        this._offlineQueue = [];
        this._retryCount = 0;
        this._maxRetries = 5;
        this._retryTimer = null;
        this._baseRetryDelay = 2000; // 2s, doubles each retry

        // Status tracking
        this._status = 'idle'; // idle, syncing, success, error, offline
        this._lastError = null;
        this._lastSyncTimestamp = null;

        if (this.config.githubToken && this.config.githubToken.startsWith('ghp_')) {
            this.config.enableCloudSync = true;
        }
    }

    // ─── Status ──────────────────────────────────────────
    getStatus() {
        return {
            status: this._status,
            enabled: this.config.enableCloudSync,
            lastSync: this._lastSyncTimestamp,
            lastError: this._lastError,
            queueSize: this._offlineQueue.length,
            retryCount: this._retryCount
        };
    }

    getStatusIcon() {
        if (!this.config.enableCloudSync) return '⚪';
        switch (this._status) {
            case 'syncing': return '🟡';
            case 'success': return '🟢';
            case 'error': return '🔴';
            case 'offline': return '🟠';
            default: return '⚪';
        }
    }

    // ─── Rate Limiting ────────────────────────────────────
    async waitForRateLimit() {
        const now = Date.now();
        const timeSinceLastCall = now - this.lastApiCall;
        if (timeSinceLastCall < this.config.minApiInterval) {
            await new Promise(resolve => setTimeout(resolve, this.config.minApiInterval - timeSinceLastCall));
        }
        this.lastApiCall = Date.now();
    }

    // ─── Configuration ────────────────────────────────────
    configure(githubToken) {
        this.config.githubToken = githubToken;
        this.config.enableCloudSync = true;
        localStorage.setItem('ballSurvivalGithubToken', githubToken);
        this._retryCount = 0;
        this._status = 'idle';
    }

    // ─── Connection Test ──────────────────────────────────
    async testConnection() {
        try {
            if (!this.config.enableCloudSync || !this.config.githubToken) return false;
            await this.waitForRateLimit();
            const response = await fetch(`https://api.github.com/gists/${this.config.gistId}`, {
                headers: {
                    'Authorization': `token ${this.config.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            return response.ok;
        } catch (error) {
            console.error('Errore test connessione:', error);
            return false;
        }
    }

    // ─── Download ─────────────────────────────────────────
    async download() {
        try {
            if (!this.config.enableCloudSync) return null;
            this._status = 'syncing';
            await this.waitForRateLimit();
            const response = await fetch(`https://api.github.com/gists/${this.config.gistId}`, {
                headers: {
                    'Authorization': `token ${this.config.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (!response.ok) {
                this._status = 'error';
                this._lastError = `HTTP ${response.status}`;
                return null;
            }
            const gist = await response.json();
            this._status = 'success';
            this._lastSyncTimestamp = new Date().toISOString();
            return {
                analytics: gist.files['analytics.json']?.content ? JSON.parse(gist.files['analytics.json'].content) : null,
                accounts: gist.files['accounts.json']?.content ? JSON.parse(gist.files['accounts.json'].content) : null,
                saveData: gist.files['save_data.json']?.content ? JSON.parse(gist.files['save_data.json'].content) : null
            };
        } catch (error) {
            console.error('Errore download:', error);
            this._status = navigator.onLine ? 'error' : 'offline';
            this._lastError = error.message;
            return null;
        }
    }

    // ─── Upload ───────────────────────────────────────────
    async upload(analyticsData = null, accountsData = null, saveData = null) {
        try {
            if (!this.config.enableCloudSync || !this.config.githubToken) return false;
            this._status = 'syncing';
            this.isSyncing = true;
            await this.waitForRateLimit();
            const files = {};
            if (analyticsData) files['analytics.json'] = { content: JSON.stringify(analyticsData, null, 2) };
            if (accountsData) files['accounts.json'] = { content: JSON.stringify(accountsData, null, 2) };
            if (saveData) files['save_data.json'] = { content: JSON.stringify(saveData, null, 2) };
            if (Object.keys(files).length === 0) { this.isSyncing = false; return false; }
            const response = await fetch(`https://api.github.com/gists/${this.config.gistId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${this.config.githubToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({ description: `Ball Survival - Updated ${new Date().toISOString()}`, public: false, files })
            });
            this.isSyncing = false;
            if (response.ok) {
                this._status = 'success';
                this._lastSyncTimestamp = new Date().toISOString();
                this._retryCount = 0;
                return true;
            }
            if (response.status === 404) this.config.enableCloudSync = false;
            this._status = 'error';
            this._lastError = `HTTP ${response.status}`;
            return false;
        } catch (error) {
            console.error('Errore upload:', error);
            this.isSyncing = false;
            this._status = navigator.onLine ? 'error' : 'offline';
            this._lastError = error.message;
            return false;
        }
    }

    // ─── Convenience methods ──────────────────────────────
    async syncAnalytics(analyticsData) { return await this.upload(analyticsData, null); }
    async syncAccounts(accountsData) { return await this.upload(null, accountsData); }
    async syncAll(analyticsData, accountsData) { return await this.upload(analyticsData, accountsData); }

    // ─── Full Save Sync ───────────────────────────────────
    async syncSaveData(saveData) { return await this.upload(null, null, saveData); }

    async downloadSaveData() {
        const data = await this.download();
        return data?.saveData || null;
    }

    // ─── Debounced Auto-Sync ──────────────────────────────
    startAutoSync(getDataFn) {
        this.stopAutoSync();
        this._getDataFn = getDataFn;
        this._autoSyncInterval = setInterval(() => this._doAutoSync(), this._syncIntervalMs);
    }

    stopAutoSync() {
        if (this._autoSyncInterval) clearInterval(this._autoSyncInterval);
        if (this._autoSyncDebounce) clearTimeout(this._autoSyncDebounce);
        this._autoSyncInterval = null;
        this._autoSyncDebounce = null;
    }

    /** Call when data changes — debounces 5s then syncs */
    notifyDataChanged() {
        if (!this.config.enableCloudSync || !this._getDataFn) return;
        if (this._autoSyncDebounce) clearTimeout(this._autoSyncDebounce);
        this._autoSyncDebounce = setTimeout(() => this._doAutoSync(), this._debounceMs);
    }

    async _doAutoSync() {
        if (!this.config.enableCloudSync || this.isSyncing) return;
        if (!this._getDataFn) return;
        try {
            const data = this._getDataFn();
            if (data) {
                const success = await this.upload(data.analytics, data.accounts, data.saveData);
                if (!success && this._status === 'offline') {
                    this._enqueueForRetry(data);
                }
            }
        } catch (e) {
            console.warn('Auto-sync failed:', e);
        }
    }

    // ─── Offline Queue with Exponential Backoff ───────────
    _enqueueForRetry(data) {
        this._offlineQueue = [data]; // Keep only latest
        this._scheduleRetry();
    }

    _scheduleRetry() {
        if (this._retryTimer) return;
        if (this._retryCount >= this._maxRetries) {
            this._status = 'offline';
            this._lastError = 'Max retries reached';
            return;
        }
        const delay = this._baseRetryDelay * Math.pow(2, this._retryCount);
        this._retryTimer = setTimeout(() => this._processRetry(), delay);
    }

    async _processRetry() {
        this._retryTimer = null;
        if (this._offlineQueue.length === 0) return;
        this._retryCount++;
        const data = this._offlineQueue[0];
        try {
            const success = await this.upload(data.analytics, data.accounts, data.saveData);
            if (success) {
                this._offlineQueue = [];
                this._retryCount = 0;
            } else {
                this._scheduleRetry();
            }
        } catch (e) {
            this._scheduleRetry();
        }
    }

    // ─── Disable / Reset ──────────────────────────────────
    disable() {
        this.config.enableCloudSync = false;
        this.stopAutoSync();
    }

    reset() {
        localStorage.removeItem('ballSurvivalGithubToken');
        this.config.githubToken = '';
        this.config.enableCloudSync = false;
        this.stopAutoSync();
        this._offlineQueue = [];
        this._retryCount = 0;
        this._status = 'idle';
        this._lastError = null;
    }
}

export const cloudSyncManager = new CloudSyncManager();
