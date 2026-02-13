/**
 * Integration tests for CONFIG
 */
import { describe, it, expect } from 'vitest';
import { CONFIG } from '../src/config/index.js';

describe('CONFIG', () => {
    it('has required world config', () => {
        expect(CONFIG.world).toBeDefined();
        expect(CONFIG.world.width).toBeGreaterThan(0);
        expect(CONFIG.world.height).toBeGreaterThan(0);
        expect(CONFIG.world.gridSize).toBeGreaterThan(0);
    });

    it('has player base stats', () => {
        expect(CONFIG.player.base).toBeDefined();
        expect(CONFIG.player.base.hp).toBeGreaterThan(0);
        expect(CONFIG.player.base.speed).toBeGreaterThan(0);
    });

    it('has enemies config', () => {
        expect(CONFIG.enemies).toBeDefined();
        expect(CONFIG.enemies.base).toBeDefined();
        expect(CONFIG.enemies.base.damage).toBeGreaterThan(0);
        expect(CONFIG.enemies.scaling).toBeDefined();
    });

    it('has at least one stage', () => {
        expect(CONFIG.stages).toBeDefined();
        const stageIds = Object.keys(CONFIG.stages);
        expect(stageIds.length).toBeGreaterThanOrEqual(1);
    });

    it('has accessibility config', () => {
        expect(CONFIG.accessibility).toBeDefined();
        expect(typeof CONFIG.accessibility.reduceMotion).toBe('boolean');
        expect(typeof CONFIG.accessibility.highContrast).toBe('boolean');
    });

    it('has effects config for screen shake, camera, hit flash', () => {
        expect(CONFIG.effects).toBeDefined();
        expect(typeof CONFIG.effects.screenShakeDecay).toBe('number');
        expect(typeof CONFIG.effects.cameraLerp).toBe('number');
        expect(typeof CONFIG.effects.hitFlashFrames).toBe('number');
    });

    it('stage 1 has required structure', () => {
        const stage = CONFIG.stages[1];
        expect(stage).toBeDefined();
        expect(stage.name).toBeDefined();
        expect(stage.background).toBeDefined();
        expect(stage.background.color).toBeDefined();
        expect(stage.background.pattern).toBeDefined();
        expect(stage.enemies).toBeDefined();
        expect(stage.effects).toBeDefined();
    });
});
