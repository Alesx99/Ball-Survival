/**
 * Game Systems - Analytics, Retention, Feedback, Progression, Achievements
 * @module systems
 */

import { cloudSyncManager } from '../utils/cloudSync.js';

/**
 * AnalyticsManager - Tracks archetype usage and game stats
 */
class AnalyticsManager {
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

/**
 * RetentionMonitor - Tracks session time and satisfaction
 */
class RetentionMonitor {
    constructor() {
        this.sessionStart = Date.now();
    }

    getSessionDuration() {
        return (Date.now() - this.sessionStart) / 1000;
    }

    calculateRetention(gameTime) {
        const sessionDuration = this.getSessionDuration();
        return Math.min(gameTime / Math.max(sessionDuration, 1), 1);
    }

    getOptimizationSuggestions() {
        const duration = this.getSessionDuration();
        const suggestions = [];
        if (duration < 60) {
            suggestions.push({ type: 'early_exit', message: 'Sessioni brevi: considerare riduzione difficoltà iniziale' });
        }
        if (duration > 600) {
            suggestions.push({ type: 'long_session', message: 'Sessioni lunghe: verificare engagement a metà partita' });
        }
        return suggestions;
    }
}

/**
 * QuickFeedback - Simple feedback collection
 */
class QuickFeedback {
    constructor() {
        this.feedbackData = [];
    }

    collectFeedback(rating, comment = '') {
        this.feedbackData.push({
            rating,
            comment,
            timestamp: Date.now()
        });
    }

    getFeedbackSummary() {
        if (this.feedbackData.length === 0) {
            return { count: 0, avgRating: 0, recent: [] };
        }
        const avgRating = this.feedbackData.reduce((sum, f) => sum + f.rating, 0) / this.feedbackData.length;
        const recent = this.feedbackData.slice(-5).reverse();
        return {
            count: this.feedbackData.length,
            avgRating,
            recent
        };
    }
}

/**
 * ProgressionOptimizer - Monitors progression balance
 */
class ProgressionOptimizer {
    analyzeProgression(playerLevel, gameTime) {
        const issues = [];
        if (playerLevel < 5 && gameTime > 120) {
            issues.push({ type: 'slow_leveling', message: 'Progressione XP lenta nei primi minuti' });
        }
        if (playerLevel > 20 && gameTime < 300) {
            issues.push({ type: 'fast_leveling', message: 'Progressione XP troppo rapida' });
        }
        return { playerLevel, gameTime, issues };
    }

    getBalanceRecommendations(playerLevel, gameTime) {
        const recommendations = [];
        if (playerLevel < 3 && gameTime > 60) {
            recommendations.push('Aumentare XP early game per ridurre tempo al primo livello');
        }
        if (gameTime > 600 && playerLevel < 15) {
            recommendations.push('Ridurre curva XP per partite lunghe');
        }
        return recommendations;
    }
}

/**
 * AchievementSystem - Tracks and awards achievements
 */
class AchievementSystem {
    constructor() {
        this.achievements = {
            enemies_killed: { id: 'enemies_killed', name: 'Enemy Slayer', description: 'Kill enemies', icon: '⚔️', thresholds: [100, 500, 1000], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 },
            elites_killed: { id: 'elites_killed', name: 'Elite Hunter', description: 'Kill elite enemies', icon: '👹', thresholds: [10, 50, 100], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 },
            materials_collected: { id: 'materials_collected', name: 'Collector', description: 'Collect materials', icon: '💎', thresholds: [50, 200, 500], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 },
            items_crafted: { id: 'items_crafted', name: 'Craftsman', description: 'Craft items', icon: '🔨', thresholds: [5, 20, 50], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 },
            stages_unlocked: { id: 'stages_unlocked', name: 'Explorer', description: 'Unlock stages', icon: '🗺️', thresholds: [2, 3, 5], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 },
            archetypes_unlocked: { id: 'archetypes_unlocked', name: 'Versatile', description: 'Unlock archetypes', icon: '🎭', thresholds: [3, 4, 6], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 },
            survival_time_5min: { id: 'survival_time_5min', name: 'Survivor 5min', description: 'Survive 5 minutes', icon: '⏱️', thresholds: [300], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 },
            survival_time_10min: { id: 'survival_time_10min', name: 'Survivor 10min', description: 'Survive 10 minutes', icon: '⏱️', thresholds: [600], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 },
            survival_time_15min: { id: 'survival_time_15min', name: 'Survivor 15min', description: 'Survive 15 minutes', icon: '⏱️', thresholds: [900], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 },
            level_10: { id: 'level_10', name: 'Level 10', description: 'Reach level 10', icon: '📈', thresholds: [10], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 },
            level_20: { id: 'level_20', name: 'Level 20', description: 'Reach level 20', icon: '📈', thresholds: [20], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 },
            level_30: { id: 'level_30', name: 'Level 30', description: 'Reach level 30', icon: '📈', thresholds: [30], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 }
        };
        this.loadAchievements();
    }

    loadAchievements() {
        const saved = localStorage.getItem('ballSurvival_achievements');
        if (saved) {
            try {
                const loaded = JSON.parse(saved);
                for (const [id, data] of Object.entries(loaded)) {
                    if (this.achievements[id]) {
                        Object.assign(this.achievements[id], data);
                    }
                }
            } catch (e) {
                console.log('Achievement data corrupted, starting fresh');
            }
        }
    }

    saveAchievements() {
        localStorage.setItem('ballSurvival_achievements', JSON.stringify(this.achievements));
    }

    updateProgress(achievementId, value, game) {
        const achievement = this.achievements[achievementId];
        if (!achievement || achievement.unlocked) return;

        achievement.currentValue = value;
        achievement.bestValue = Math.max(achievement.bestValue || 0, value);

        for (let tier = 0; tier < achievement.thresholds.length; tier++) {
            if (achievement.bestValue >= achievement.thresholds[tier]) {
                if (achievement.tier <= tier) {
                    this.unlockAchievement(achievementId, tier, game);
                }
            }
        }
        this.saveAchievements();
    }

    checkTimeBasedAchievements(gameTime, game) {
        const timeAchievements = ['survival_time_5min', 'survival_time_10min', 'survival_time_15min'];
        for (const id of timeAchievements) {
            this.updateProgress(id, gameTime, game);
        }
    }

    checkPlayerStatsAchievements(player, game) {
        if (!player) return;
        if (typeof player.level === 'number') {
            this.updateProgress('level_10', player.level, game);
            this.updateProgress('level_20', player.level, game);
            this.updateProgress('level_30', player.level, game);
        }
        if (typeof player.kills === 'number') {
            this.updateProgress('enemies_killed', player.kills, game);
        }
        if (typeof player.eliteKills === 'number') {
            this.updateProgress('elites_killed', player.eliteKills, game);
        }
        if (typeof player.materialsCollected === 'number') {
            this.updateProgress('materials_collected', player.materialsCollected, game);
        }
        if (typeof player.itemsCrafted === 'number') {
            this.updateProgress('items_crafted', player.itemsCrafted, game);
        }
        if (typeof player.stagesUnlocked === 'number') {
            this.updateProgress('stages_unlocked', player.stagesUnlocked, game);
        }
        if (typeof player.archetypesUnlocked === 'number') {
            this.updateProgress('archetypes_unlocked', player.archetypesUnlocked, game);
        }
    }

    getAchievementsList() {
        return Object.values(this.achievements);
    }

    unlockAchievement(achievementId, tier, game) {
        const achievement = this.achievements[achievementId];
        if (!achievement) return;

        achievement.unlocked = true;
        achievement.tier = Math.max(achievement.tier || 0, tier);

        const tierName = achievement.thresholds[tier] !== undefined ? ` (${achievement.thresholds[tier]})` : '';
        const notification = {
            type: 'achievement',
            text: `🏆 ${achievement.name}${tierName}: ${achievement.description}`,
            icon: achievement.icon
        };

        if (game?.notifications?.push) {
            game.notifications.push(notification);
        }

        this.saveAchievements();
    }
}

export { AnalyticsManager, RetentionMonitor, QuickFeedback, ProgressionOptimizer, AchievementSystem };
