export class RetentionMonitor {
    constructor() {
        this.sessionStart = Date.now();
        this.metricsData = [];
    }

    trackSession(metrics) {
        this.metricsData.push({ ...metrics, timestamp: Date.now() });
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
