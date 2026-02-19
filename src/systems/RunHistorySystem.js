/**
 * RunHistorySystem - Stores details of past runs.
 * @module systems/RunHistorySystem
 */
export class RunHistorySystem {
    constructor(game) {
        this.game = game;
        this.history = JSON.parse(localStorage.getItem('ballSurvival_runHistory') || '[]');
        this.maxEntries = 20;
    }

    /**
     * Saves a completed run to history.
     * @param {object} runData - Data about the run.
     */
    saveRun(runData) {
        const entry = {
            id: Date.now().toString(36) + Math.random().toString(36).substring(2),
            date: Date.now(),
            time: runData.time || 0,
            level: runData.level || 1,
            score: runData.score || 0,
            archetype: runData.archetype || 'standard',
            weapons: runData.weapons || [],
            result: runData.result || 'Defeat', // 'Victory' or 'Defeat'
            mode: runData.mode || 'standard'
        };

        // Add to beginning of array
        this.history.unshift(entry);

        // Limit size
        if (this.history.length > this.maxEntries) {
            this.history = this.history.slice(0, this.maxEntries);
        }

        this.save();
    }

    /**
     * Returns the entire run history.
     */
    getHistory() {
        return this.history;
    }

    /**
     * Clears all run history.
     */
    clearHistory() {
        this.history = [];
        this.save();
    }

    /**
     * Saves history to localStorage.
     */
    save() {
        localStorage.setItem('ballSurvival_runHistory', JSON.stringify(this.history));
    }

    /**
     * Imports data (e.g. from cloud sync).
     * @param {Array} data 
     */
    importData(data) {
        if (Array.isArray(data)) {
            this.history = data;
            this.save();
        }
    }
}
