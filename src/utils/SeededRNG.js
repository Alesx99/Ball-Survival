/**
 * Seeded Random Number Generator
 * Uses Mulberry32 algorithm for deterministic results based on a seed.
 * @module utils/SeededRNG
 */

export class SeededRNG {
    constructor(seed = Date.now()) {
        this.seed = seed;
        this.state = seed;
    }

    /**
     * Returns a float between 0 (inclusive) and 1 (exclusive).
     * Replaces Math.random()
     */
    next() {
        let t = this.state += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        this.state = t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    /**
     * Returns an integer between min (inclusive) and max (exclusive).
     */
    range(min, max) {
        return min + Math.floor(this.next() * (max - min));
    }

    /**
     * Returns a float between min (inclusive) and max (exclusive).
     */
    rangeFloat(min, max) {
        return min + this.next() * (max - min);
    }

    /**
     * Returns true with probability p (0-1).
     */
    chance(p) {
        return this.next() < p;
    }

    /**
     * Returns a random element from an array.
     */
    pick(array) {
        if (!array || array.length === 0) return undefined;
        return array[Math.floor(this.next() * array.length)];
    }

    /**
     * Resets the generator with a new seed.
     */
    setSeed(seed) {
        this.seed = seed;
        this.state = seed;
    }
}
