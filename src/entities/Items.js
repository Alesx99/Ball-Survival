/**
 * Item Entity Classes
 * Chest, DroppedItem
 * @module entities/Items
 */

import { Entity } from './Entity.js';
import { CONFIG } from '../config/index.js';
import { Utils } from '../utils/index.js';

export class Chest extends Entity {
    constructor(x, y) {
        super(x, y);
        this.size = CONFIG.chest.size;
    }

    update(game) {
        const centerX = this.x + this.size / 2;
        const centerY = this.y + this.size / 2;
        const dist = Utils.getDistance(game.player, { x: centerX, y: centerY });
        if (dist < game.player.stats.radius + this.size) {
            const { DroppedItem } = game._entityClasses;
            const itemKeys = Object.keys(CONFIG.itemTypes).filter(k => k !== 'LEGENDARY_ORB');
            const randomType = itemKeys[Math.floor(Math.random() * itemKeys.length)];
            game.addEntity('droppedItems', new DroppedItem(centerX, this.y - 10, randomType));
            if (Math.random() < 0.7 + (game.player.modifiers?.luck || 0)) {
                const c = CONFIG.chest.gemDrop;
                const gemsFound = c.min + Math.floor(Math.random() * c.random * (1 + (game.player.modifiers?.luck || 0)));
                game.gemsThisRun += gemsFound;
            }
            this.toRemove = true;
        }
    }

    draw(ctx, game) {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.x + this.size * 0.3, this.y - this.size * 0.2, this.size * 0.4, this.size * 0.4);
        ctx.fillRect(this.x + this.size * 0.4, this.y + this.size * 0.4, this.size * 0.2, this.size * 0.3);
    }
}

export class DroppedItem extends Entity {
    constructor(x, y, type) {
        super(x, y);
        this.type = type;
        this.life = 600;
    }

    update(game) {
        this.life--;
        if (this.life <= 0) this.toRemove = true;
        const dist = Utils.getDistance(game.player, this);
        if (dist < game.player.stats.radius + 10) {
            game.applyItemEffect(this);
            this.toRemove = true;
        }
    }

    draw(ctx, game) {
        const itemInfo = CONFIG.itemTypes[this.type] || { color: '#ffffff' };
        ctx.save();
        ctx.globalAlpha = this.life > 60 ? 1.0 : Math.max(0, this.life / 60);
        const bob = Math.sin(Date.now() / 200 + this.x) * 3;
        ctx.fillStyle = itemInfo.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y + bob, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }
}
