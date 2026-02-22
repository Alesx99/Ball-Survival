import { describe, it, expect, beforeEach } from 'vitest';
import { PoolManager } from '../src/utils/PoolManager.js';

describe('PoolManager', () => {
    let pool;

    beforeEach(() => {
        pool = new PoolManager();
    });

    it('creates new instances when pool is empty', () => {
        let count = 0;
        const factory = () => ({ id: ++count });

        const obj1 = pool.get('test', factory);
        const obj2 = pool.get('test', factory);

        expect(obj1.id).toBe(1);
        expect(obj2.id).toBe(2);
    });

    it('reuses instances when pool has items', () => {
        const factory = () => ({ active: true });

        const obj = pool.get('test', factory);
        obj.active = false;

        pool.release('test', obj);

        const reused = pool.get('test', factory);
        expect(reused).toBe(obj); // Same object reference
        expect(reused.active).toBe(false); // Does not auto-reset, consumer resets via init
    });

    it('creates separate pools for different types', () => {
        const factory1 = () => ({ type: 'A' });
        const factory2 = () => ({ type: 'B' });

        const objA = pool.get('typeA', factory1);
        const objB = pool.get('typeB', factory2);

        pool.release('typeA', objA);
        pool.release('typeB', objB);

        expect(pool.pools.get('typeA').length).toBe(1);
        expect(pool.pools.get('typeB').length).toBe(1);

        const newA = pool.get('typeA', factory1);
        expect(newA).toBe(objA);
        expect(pool.pools.get('typeA').length).toBe(0);
    });

    it('clears all pools', () => {
        const factory = () => ({});
        const obj = pool.get('test', factory);
        pool.release('test', obj);

        expect(pool.pools.get('test').length).toBe(1);

        pool.clear();

        expect(pool.pools.size).toBe(0);
    });
});
