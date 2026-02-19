/**
 * Daily Challenge System
 * Manages daily seeds, forced configurations, and leaderboards.
 * @module systems/DailyChallengeSystem
 */

import { CONFIG } from '../config/index.js';
import { SeededRNG } from '../utils/SeededRNG.js';

export class DailyChallengeSystem {
    constructor(game) {
        this.game = game;
        this.currentSeed = this._generateDailySeed();
        this.rng = new SeededRNG(this.currentSeed);
        this.config = this._generateDailyConfig();
    }

    /**
     * Generates a seed based on the current date (YYYYMMDD).
     */
    _generateDailySeed() {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        return parseInt(`${year}${month}${day}`);
    }

    /**
     * Generates the daily challenge configuration based on the seed.
     */
    _generateDailyConfig() {
        // Reset RNG to ensure consistency for the whole day
        this.rng.setSeed(this.currentSeed);

        // Pick forced archetype
        const archetypes = Object.keys(CONFIG.characterArchetypes).filter(id => id !== 'secret' && id !== 'debug');
        const archetypeId = this.rng.pick(archetypes);
        const archetype = CONFIG.characterArchetypes[archetypeId];

        // Pick forced starting weapon (if applicable, otherwise random from pool)
        let weaponId = archetype.startingWeapon;
        if (!weaponId) {
            const weapons = ['magicMissile', 'orbitals', 'staticField', 'aura', 'fireTrail'];
            weaponId = this.rng.pick(weapons);
        }

        // Pick a daily modifier
        const modifiers = [
            { id: 'double_speed', name: 'Velocità Doppia', desc: 'Nemici 2x più veloci, Player +50% velocità', apply: (g) => { g.player.stats.speed *= 1.5; } },
            { id: 'glass_cannon', name: 'Cannone di Vetro', desc: 'Danni x2, HP massimi -50%', apply: (g) => { g.player.stats.damageMult *= 2; g.player.stats.maxHp *= 0.5; g.player.hp = g.player.stats.maxHp; } },
            { id: 'horde', name: 'Orda Infinita', desc: 'Spawn rate +50%, nemici -20% HP', apply: (g) => { /* Logic in SpawnSystem */ } },
            { id: 'giant_slayer', name: 'Caccia ai Giganti', desc: 'Nemici +50% grandezza e HP, +50% XP', apply: (g) => { /* Logic in SpawnSystem */ } },
            { id: 'tiny_trouble', name: 'Problemi Piccoli', desc: 'Nemici -50% grandezza, +50% spawn rate', apply: (g) => { /* Logic in SpawnSystem */ } }
        ];
        const modifier = this.rng.pick(modifiers);

        return {
            date: new Date().toLocaleDateString(),
            seed: this.currentSeed,
            archetype: archetypeId,
            archetypeName: archetype.name,
            weapon: weaponId,
            modifier: modifier
        };
    }

    /**
     * Applies the daily configuration to the game instance.
     */
    applyConfiguration() {
        const g = this.game;

        // Force archetype
        g.selectedArchetype = this.config.archetype;

        // Apply modifier effects
        if (this.config.modifier && this.config.modifier.apply) {
            this.config.modifier.apply(g);
        }

        console.log(`[DailyChallenge] Applied config: ${this.config.archetypeName} + ${this.config.modifier.name}`);
    }

    getDailyInfo() {
        return this.config;
    }
}
