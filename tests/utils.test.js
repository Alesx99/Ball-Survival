/**
 * Unit tests for Utils
 */
import { describe, it, expect } from 'vitest';
import { Utils } from '../src/utils/index.js';

describe('Utils.getDistance', () => {
    it('returns 0 for same point', () => {
        expect(Utils.getDistance({ x: 10, y: 20 }, { x: 10, y: 20 })).toBe(0);
    });

    it('returns correct distance for horizontal line', () => {
        expect(Utils.getDistance({ x: 0, y: 0 }, { x: 3, y: 0 })).toBe(3);
    });

    it('returns correct distance for vertical line', () => {
        expect(Utils.getDistance({ x: 0, y: 0 }, { x: 0, y: 4 })).toBe(4);
    });

    it('returns correct distance for diagonal (3-4-5 triangle)', () => {
        expect(Utils.getDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    });

    it('is symmetric', () => {
        const a = { x: 100, y: 50 };
        const b = { x: 200, y: 150 };
        expect(Utils.getDistance(a, b)).toBe(Utils.getDistance(b, a));
    });
});

describe('Utils.findNearest', () => {
    it('returns null for empty targets', () => {
        expect(Utils.findNearest({ x: 0, y: 0 }, [])).toBeNull();
    });

    it('returns the only target when one exists', () => {
        const target = { x: 10, y: 0, toRemove: false };
        expect(Utils.findNearest({ x: 0, y: 0 }, [target])).toBe(target);
    });

    it('returns nearest target among multiple', () => {
        const far = { x: 100, y: 0, toRemove: false };
        const near = { x: 5, y: 0, toRemove: false };
        const mid = { x: 50, y: 0, toRemove: false };
        const from = { x: 0, y: 0 };
        expect(Utils.findNearest(from, [far, near, mid])).toBe(near);
    });

    it('respects range parameter', () => {
        const target = { x: 100, y: 0, toRemove: false };
        expect(Utils.findNearest({ x: 0, y: 0 }, [target], 50)).toBeNull();
        expect(Utils.findNearest({ x: 0, y: 0 }, [target], 150)).toBe(target);
    });

    it('skips targets with toRemove', () => {
        const removed = { x: 5, y: 0, toRemove: true };
        const valid = { x: 50, y: 0, toRemove: false };
        expect(Utils.findNearest({ x: 0, y: 0 }, [removed, valid])).toBe(valid);
    });
});
