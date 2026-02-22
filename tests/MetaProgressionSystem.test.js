import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MetaProgressionSystem } from '../src/systems/MetaProgressionSystem.js';

// Mock the exact required dependencies to avoid huge config imports and canvas logic
vi.mock('../src/config/index.js', () => ({
    CONFIG: {
        skillTree: {
            'node_a': { maxLevel: 5, baseCost: 100 },
            'node_b': { maxLevel: 3, baseCost: 200, requires: ['node_a'], requireType: 'any' },
            'tier1_regen': { maxLevel: 1, baseCost: 50 }
        }
    }
}));

describe('MetaProgressionSystem', () => {
    let mockGame;
    let system;

    beforeEach(() => {
        mockGame = {
            totalGems: 1000,
            loadGameData: vi.fn(() => ({ skillTreeNodes: {} })),
            saveGameData: vi.fn()
        };
        system = new MetaProgressionSystem(mockGame);
    });

    it('initializes with loaded data', () => {
        mockGame.loadGameData = vi.fn(() => ({ skillTreeNodes: { 'node_a': 2 } }));
        const sys = new MetaProgressionSystem(mockGame);
        expect(sys.getUnlockedLevel('node_a')).toBe(2);
    });

    it('checks unlockability correctly', () => {
        expect(system.canUnlockNode('node_a')).toBe(true);
        expect(system.canUnlockNode('node_b')).toBe(false); // requires node_a

        system.unlockedNodes['node_a'] = 1;
        expect(system.canUnlockNode('node_b')).toBe(true);

        system.unlockedNodes['node_a'] = 5; // max level
        expect(system.canUnlockNode('node_a')).toBe(false);
    });

    it('calculates node costs correctly', () => {
        expect(system.getNodeCost('node_a')).toBe(100);
        system.unlockedNodes['node_a'] = 1;
        // Cost should be 100 * 1.3^1 = 130
        expect(system.getNodeCost('node_a')).toBe(Math.floor(100 * 1.3));
    });

    it('unlocks node and consumes gems', () => {
        const success = system.unlockNode('node_a');
        expect(success).toBe(true);
        expect(system.getUnlockedLevel('node_a')).toBe(1);
        expect(mockGame.totalGems).toBe(900); // 1000 - 100
        expect(mockGame.saveGameData).toHaveBeenCalled();
    });

    it('fails to unlock if not enough gems', () => {
        mockGame.totalGems = 50;
        const success = system.unlockNode('node_a');
        expect(success).toBe(false);
        expect(system.getUnlockedLevel('node_a')).toBe(0);
    });
});
