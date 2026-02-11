/**
 * Cloud Sync Manager - Unified cloud synchronization via GitHub Gist
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
        this.syncQueue = [];
        this.isSyncing = false;

        if (this.config.githubToken && this.config.githubToken.startsWith('ghp_')) {
            this.config.enableCloudSync = true;
        }
    }

    async waitForRateLimit() {
        const now = Date.now();
        const timeSinceLastCall = now - this.lastApiCall;
        if (timeSinceLastCall < this.config.minApiInterval) {
            await new Promise(resolve => setTimeout(resolve, this.config.minApiInterval - timeSinceLastCall));
        }
        this.lastApiCall = Date.now();
    }

    configure(githubToken) {
        this.config.githubToken = githubToken;
        this.config.enableCloudSync = true;
        localStorage.setItem('ballSurvivalGithubToken', githubToken);
    }

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

    async download() {
        try {
            if (!this.config.enableCloudSync) return null;
            await this.waitForRateLimit();
            const response = await fetch(`https://api.github.com/gists/${this.config.gistId}`, {
                headers: {
                    'Authorization': `token ${this.config.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (!response.ok) return null;
            const gist = await response.json();
            return {
                analytics: gist.files['analytics.json']?.content ? JSON.parse(gist.files['analytics.json'].content) : null,
                accounts: gist.files['accounts.json']?.content ? JSON.parse(gist.files['accounts.json'].content) : null
            };
        } catch (error) {
            console.error('Errore download:', error);
            return null;
        }
    }

    async upload(analyticsData = null, accountsData = null) {
        try {
            if (!this.config.enableCloudSync || !this.config.githubToken) return false;
            await this.waitForRateLimit();
            const files = {};
            if (analyticsData) files['analytics.json'] = { content: JSON.stringify(analyticsData, null, 2) };
            if (accountsData) files['accounts.json'] = { content: JSON.stringify(accountsData, null, 2) };
            if (Object.keys(files).length === 0) return false;
            const response = await fetch(`https://api.github.com/gists/${this.config.gistId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${this.config.githubToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({ description: `Ball Survival - Updated ${new Date().toISOString()}`, public: false, files })
            });
            if (response.ok) return true;
            if (response.status === 404) this.config.enableCloudSync = false;
            return false;
        } catch (error) {
            console.error('Errore upload:', error);
            return false;
        }
    }

    async syncAnalytics(analyticsData) { return await this.upload(analyticsData, null); }
    async syncAccounts(accountsData) { return await this.upload(null, accountsData); }
    async syncAll(analyticsData, accountsData) { return await this.upload(analyticsData, accountsData); }

    disable() { this.config.enableCloudSync = false; }

    reset() {
        localStorage.removeItem('ballSurvivalGithubToken');
        this.config.githubToken = '';
        this.config.enableCloudSync = false;
    }
}

export const cloudSyncManager = new CloudSyncManager();
