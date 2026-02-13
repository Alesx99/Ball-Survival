/**
 * Unit tests for BalanceSystem
 */
import { describe, it, expect } from 'vitest';
import { BalanceSystem } from '../src/systems/BalanceSystem.js';

describe('BalanceSystem.calculateRetention', () => {
    it('returns 0.6 for very short sessions (<5 min)', () => {
        expect(BalanceSystem.calculateRetention(2)).toBe(0.6);
        expect(BalanceSystem.calculateRetention(4.9)).toBe(0.6);
    });

    it('returns 0.75 for short sessions (5-10 min)', () => {
        expect(BalanceSystem.calculateRetention(5)).toBe(0.75);
        expect(BalanceSystem.calculateRetention(9)).toBe(0.75);
    });

    it('returns 0.9 for optimal sessions (10-20 min)', () => {
        expect(BalanceSystem.calculateRetention(10)).toBe(0.9);
        expect(BalanceSystem.calculateRetention(15)).toBe(0.9);
        expect(BalanceSystem.calculateRetention(19)).toBe(0.9);
    });

    it('returns 0.85 for long sessions (20-30 min)', () => {
        expect(BalanceSystem.calculateRetention(20)).toBe(0.85);
        expect(BalanceSystem.calculateRetention(25)).toBe(0.85);
    });

    it('returns 0.7 for very long sessions (>30 min)', () => {
        expect(BalanceSystem.calculateRetention(30)).toBe(0.7);
        expect(BalanceSystem.calculateRetention(60)).toBe(0.7);
    });
});

describe('BalanceSystem.calculateSatisfaction', () => {
    it('caps at 1.0', () => {
        expect(BalanceSystem.calculateSatisfaction(100, 100)).toBeLessThanOrEqual(1);
    });

    it('increases with level', () => {
        const s1 = BalanceSystem.calculateSatisfaction(1, 5);
        const s5 = BalanceSystem.calculateSatisfaction(5, 5);
        const s10 = BalanceSystem.calculateSatisfaction(10, 5);
        expect(s1).toBeLessThan(s5);
        expect(s5).toBeLessThanOrEqual(s10);
    });

    it('increases with enemy count', () => {
        const s5 = BalanceSystem.calculateSatisfaction(5, 5);
        const s20 = BalanceSystem.calculateSatisfaction(5, 20);
        expect(s5).toBeLessThan(s20);
    });

    it('returns average of level and enemy satisfaction', () => {
        const s = BalanceSystem.calculateSatisfaction(10, 20);
        const levelSat = Math.min(1.0, 10 / 10);
        const enemySat = Math.min(1.0, 20 / 20);
        expect(s).toBeCloseTo((levelSat + enemySat) / 2, 5);
    });
});
