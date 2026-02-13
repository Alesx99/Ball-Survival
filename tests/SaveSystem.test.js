/**
 * Unit tests for SaveSystem
 */
import { describe, it, expect } from 'vitest';
import { SaveSystem } from '../src/systems/SaveSystem.js';

function createMockGame(overrides = {}) {
    const base = {
        totalGems: 100,
        permanentUpgrades: { health: { level: 2 }, speed: { level: 1 } },
        unlockedArchetypes: new Set(['standard', 'steel']),
        totalElapsedTime: 120,
        score: 500,
        player: { level: 5, xp: 50, xpNext: 150, hp: 200, stats: {}, modifiers: {}, x: 100, y: 100, archetype: { id: 'standard' } },
        spells: {},
        passives: { health: { level: 1 } },
        difficultyTier: 0,
        cores: {},
        weapons: {},
    };
    return { ...base, ...overrides };
}

describe('SaveSystem.generateSaveCode', () => {
    it('returns base64 string', () => {
        const game = createMockGame();
        const code = SaveSystem.generateSaveCode.call(game);
        expect(typeof code).toBe('string');
        expect(code).not.toBe('ERRORE');
        expect(() => atob(code)).not.toThrow();
    });

    it('decoded data contains expected keys', () => {
        const game = createMockGame({ totalGems: 42 });
        const code = SaveSystem.generateSaveCode.call(game);
        const json = atob(code);
        const data = JSON.parse(json);
        expect(data).toHaveProperty('v');
        expect(data).toHaveProperty('gems');
        expect(data).toHaveProperty('perm_upgrades');
        expect(data).toHaveProperty('unlocked_archetypes');
        expect(data.gems).toBe(42);
    });

    it('includes run_state when isDebug=true', () => {
        const game = createMockGame();
        const code = SaveSystem.generateSaveCode.call(game, true);
        const data = JSON.parse(atob(code));
        expect(data).toHaveProperty('run_state');
        expect(data.run_state).toHaveProperty('time');
        expect(data.run_state).toHaveProperty('player');
        expect(data.run_state.player.level).toBe(5);
    });

    it('unlocked_archetypes is array', () => {
        const game = createMockGame();
        const code = SaveSystem.generateSaveCode.call(game);
        const data = JSON.parse(atob(code));
        expect(Array.isArray(data.unlocked_archetypes)).toBe(true);
    });
});
