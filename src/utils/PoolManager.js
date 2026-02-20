/**
 * Object Pool Manager for performance optimization.
 * Reuses objects instead of creating new ones to reduce Garbage Collection pauses.
 */
export class PoolManager {
    constructor() {
        this.pools = new Map();
    }

    /**
     * Retrieves an object from the pool, or creates a new one if the pool is empty.
     * @param {string} type - Pool identifier (e.g. 'Enemy', 'Projectile')
     * @param {class} constructorFn - The initial constructor function
     * @param {object} initArgs - Arguments to pass to the init/reset method
     */
    get(type, factoryFn) {
        if (!this.pools.has(type)) {
            this.pools.set(type, []);
        }

        const pool = this.pools.get(type);
        if (pool.length > 0) {
            const instance = pool.pop();
            return instance;
        }

        return factoryFn();
    }

    /**
     * Returns an object back to the pool to be reused later.
     */
    release(type, instance) {
        if (!this.pools.has(type)) {
            this.pools.set(type, []);
        }
        this.pools.get(type).push(instance);
    }

    /**
     * Clears all pools (useful for full resets)
     */
    clear() {
        this.pools.clear();
    }
}

// Global pool instance
export const poolManager = new PoolManager();
