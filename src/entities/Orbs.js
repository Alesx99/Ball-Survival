/**
 * Orb Entity Classes
 * XpOrb, GemOrb, MaterialOrb
 * @module entities/Orbs
 */

import { Entity } from './Entity.js';
import { CONFIG } from '../config/index.js';
import { Utils } from '../utils/index.js';

export class XpOrb extends Entity {
    constructor(x, y, value) {
        super(x, y);
        this.value = value;
    }

    update(game) {
        const player = game.player;
        const pickupRadius = CONFIG.xpOrbs.pickupRadius * (1 + ((player.modifiers?.area || 1) - 1) * 0.5);
        const dist = Utils.getDistance(this, player);
        if (dist < pickupRadius) {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            const speed = Math.max(4, (pickupRadius - dist) * 0.1);
            this.x += Math.cos(angle) * speed;
            this.y += Math.sin(angle) * speed;
        }
        if (dist < 20) {
            player.gainXP(this.value);
            game.audio?.playPickup();
            this.toRemove = true;
        }
    }

    draw(ctx, game) {
        ctx.fillStyle = '#00ff88';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
        ctx.fill();
    }
}

export class GemOrb extends Entity {
    constructor(x, y, value) {
        super(x, y);
        this.value = value;
    }

    update(game) {
        const player = game.player;
        const dist = Utils.getDistance(this, player);
        if (dist < 120) {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            this.x += Math.cos(angle) * 5;
            this.y += Math.sin(angle) * 5;
        }
        if (dist < 20) {
            game.gemsThisRun += this.value;
            game.audio?.playGemPickup();
            this.toRemove = true;
        }
    }

    draw(ctx, game) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Date.now() / 500);
        ctx.fillStyle = '#72f5f5';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -7);
        ctx.lineTo(7, 0);
        ctx.lineTo(0, 7);
        ctx.lineTo(-7, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

export class MaterialOrb extends Entity {
    constructor(x, y, materialId) {
        super(x, y);
        this.materialId = materialId;
        this.material = CONFIG.materials.coreMaterials[materialId] || CONFIG.materials.weaponMaterials[materialId];
        this.life = 900;
    }

    update(game) {
        this.life--;
        if (this.life <= 0) this.toRemove = true;

        const player = game.player;
        const dist = Utils.getDistance(this, player);
        const magnetRange = 150;
        if (dist < magnetRange) {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            const speed = Math.max(3, (magnetRange - dist) * 0.08);
            this.x += Math.cos(angle) * speed;
            this.y += Math.sin(angle) * speed;
        }

        if (dist < 20) {
            game.addMaterial(this.materialId, 1);
            if (game.achievementSystem) {
                game.achievementSystem.updateProgress('materials_collected', 1, game);
            }
            this.toRemove = true;
        }
    }

    draw(ctx, game) {
        const rarity = this.material?.rarity || 'common';
        const colors = {
            common: '#8B7355',
            uncommon: '#708090',
            rare: '#87CEEB',
            epic: '#FF4500',
            legendary: '#8A2BE2'
        };
        const color = colors[rarity] || '#8B7355';

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Date.now() / 800);
        const pulse = Math.sin(Date.now() / 200) * 2;
        const size = 8 + (rarity === 'legendary' ? pulse : 0);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();

        if (rarity !== 'common') {
            ctx.strokeStyle = rarity === 'legendary' ? '#FFD700' : '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        if (rarity === 'legendary') {
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(0, 0, size + 4, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }
}
