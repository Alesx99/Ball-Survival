import { cloudSyncManager } from '../utils/cloudSync.js';

export class AnalyticsManager {
    constructor() {
        this.config = {
            enableCloudSync: false
        };
        this.archetypeData = {};
    }

    trackArchetypeSelection(archetypeId) {
        if (!this.archetypeData[archetypeId]) {
            this.archetypeData[archetypeId] = {
                selections: 0,
                totalDuration: 0,
                totalSessions: 0,
                avgLevel: 0,
                avgSatisfaction: 0
            };
        }
        this.archetypeData[archetypeId].selections++;
    }

    updatePlayerGameStats(stats) {
        const { archetypeId, sessionDuration, level, satisfaction } = stats;
        if (!archetypeId) return;

        if (!this.archetypeData[archetypeId]) {
            this.archetypeData[archetypeId] = {
                selections: 0,
                totalDuration: 0,
                totalSessions: 0,
                avgLevel: 0,
                avgSatisfaction: 0
            };
        }

        const data = this.archetypeData[archetypeId];
        data.totalSessions++;
        data.totalDuration += sessionDuration || 0;
        data.avgLevel = (data.avgLevel * (data.totalSessions - 1) + (level || 0)) / data.totalSessions;
        data.avgSatisfaction = (data.avgSatisfaction * (data.totalSessions - 1) + (satisfaction || 0)) / data.totalSessions;
    }

    async syncPlayerData(playerData) {
        if (!this.config.enableCloudSync) return false;
        const analyticsData = {
            archetypeData: this.archetypeData,
            playerData,
            lastUpdate: Date.now()
        };
        return await cloudSyncManager.syncAnalytics(analyticsData);
    }

    getAllArchetypeScores() {
        const scores = {};
        for (const [archetypeId, data] of Object.entries(this.archetypeData)) {
            scores[archetypeId] = this.calculateArchetypeScore(data);
        }
        return scores;
    }

    getAnalyticsReport() {
        let totalSessions = 0;
        let totalDuration = 0;
        for (const data of Object.values(this.archetypeData)) {
            totalSessions += data.totalSessions || 0;
            totalDuration += data.totalDuration || 0;
        }
        const avgSessionTime = totalSessions > 0 ? totalDuration / totalSessions : 0;
        return {
            sessionStats: {
                totalSessions,
                avgSessionTime
            },
            recommendations: []
        };
    }

    /** Returns analytics data for cloud sync payload. */
    getAnalyticsData() {
        return {
            archetypeData: this.archetypeData,
            lastUpdate: Date.now()
        };
    }

    calculateArchetypeScore(data) {
        if (!data || data.totalSessions === 0) return 0;
        const levelWeight = 0.4;
        const satisfactionWeight = 0.4;
        const sessionsWeight = 0.2;
        const levelScore = Math.min((data.avgLevel || 0) / 30, 1);
        const satisfactionScore = Math.min((data.avgSatisfaction || 0) / 5, 1);
        const sessionsScore = Math.min(data.totalSessions / 20, 1);
        return levelWeight * levelScore + satisfactionWeight * satisfactionScore + sessionsWeight * sessionsScore;
    }

    async uploadToGist() {
        if (!this.config.enableCloudSync) return false;
        const analyticsData = {
            archetypeData: this.archetypeData,
            lastUpdate: Date.now()
        };
        return await cloudSyncManager.syncAnalytics(analyticsData);
    }

    async loadFromGist() {
        const result = await cloudSyncManager.download();
        if (result?.analytics?.archetypeData) {
            this.archetypeData = result.analytics.archetypeData;
            return true;
        }
        return false;
    }
}
