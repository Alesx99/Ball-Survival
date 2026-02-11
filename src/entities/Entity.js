/**
 * Base Entity class for all game entities
 * @module entities/Entity
 */

export class Entity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.toRemove = false;
    }

    update(game) {
        // Override in subclasses
    }

    draw(ctx, game) {
        // Override in subclasses
    }
}
