/**
 * BestiarySystem - Tracks enemy encounters and kills.
 * @module systems/BestiarySystem
 */
import { StorageManager, StorageKeys } from '../core/StorageManager.js';
export class BestiarySystem {
    constructor(game) {
        this.game = game;
        this.data = ((StorageManager.getItem(StorageKeys.BESTIARY) || {}));
        // Data structure: { enemyType: { kills: 0, firstSeen: timestamp, maxKillsInRun: 0 } }
    }

    /**
     * Registers a kill for a specific enemy type.
     * @param {string} enemyType - The type/name of the enemy.
     * @param {number} count - Number of kills to add (default 1).
     */
    registerKill(enemyType, count = 1) {
        if (!enemyType) return;

        if (!this.data[enemyType]) {
            this.data[enemyType] = {
                kills: 0,
                firstSeen: Date.now(),
                maxKillsInRun: 0
            };
            // Optional: Notification for new enemy discovered?
            // this.game.notifications.push({ text: `Nuovo nemico scoperto: ${enemyType}`, life: 200 });
        }

        this.data[enemyType].kills += count;
        if (this.game?.runKillsByType) {
            this.game.runKillsByType[enemyType] = (this.game.runKillsByType[enemyType] || 0) + count;
        }
        this.save();
    }

    /**
     * Updates max kills in a single run stats (called at game over or periodically if needed).
     * @param {string} enemyType 
     * @param {number} runKills 
     */
    updateRunStats(enemyType, runKills) {
        if (!enemyType) return;
        if (!this.data[enemyType]) {
            this.data[enemyType] = { kills: runKills, firstSeen: Date.now(), maxKillsInRun: runKills };
        }
        if (runKills > (this.data[enemyType].maxKillsInRun || 0)) {
            this.data[enemyType].maxKillsInRun = runKills;
            this.save();
        }
    }

    /**
     * Returns the entry for a specific enemy type.
     * @param {string} enemyType 
     * @returns {object|null}
     */
    getEntry(enemyType) {
        return this.data[enemyType] || null;
    }

    /**
     * Returns all bestiary data.
     */
    getAllEntries() {
        return this.data;
    }

    /**
     * Saves bestiary data to localStorage.
     */
    save() {
        StorageManager.setItem(StorageKeys.BESTIARY, this.data);
    }

    /**
     * Imports data (e.g. from cloud sync).
     * @param {object} data 
     */
    importData(data) {
        if (data) {
            this.data = { ...this.data, ...data };
            this.save();
        }
    }
}
