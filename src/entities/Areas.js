/**
 * Area-of-Effect Entity Classes
 * Aura, Orbital, StaticField, Sanctuary
 * @module entities/Areas
 */

import { Entity } from './Entity.js';
import { Utils } from '../utils/index.js';

export class Aura extends Entity {
    constructor(x, y, props) {
        super(x, y);
        Object.assign(this, props);
        this.affectedEnemies = new Map();
    }

    update(game) {
        this.life--;
        if (this.life <= 0) this.toRemove = true;
        this.x = game.player.x;
        this.y = game.player.y;

        const targets = game.getEnemiesAndBosses();
        for (const target of targets) {
            if (target.toRemove) continue;
            if (Utils.getDistance(this, target) < this.radius + target.stats.radius) {
                if (!this.affectedEnemies.has(target)) {
                    this.affectedEnemies.set(target, { tick: 0 });
                }
                const enemyData = this.affectedEnemies.get(target);
                enemyData.tick = (enemyData.tick + 1) % (this.tickRate || 60);
                if (enemyData.tick === 0) {
                    target.takeDamage(this.dps, game);
                }
                target.slowAmount = this.slowAmount;
                target.slowTimer = Math.max(target.slowTimer, 2);
            }
        }
    }

    draw(ctx, game) {
        const opacity = this.life > 30 ? 0.4 : (this.life / 30) * 0.4;
        const g = ctx.createRadialGradient(this.x, this.y, this.radius * 0.2, this.x, this.y, this.radius);
        g.addColorStop(0, `rgba(173, 216, 230, ${opacity * 0.5})`);
        g.addColorStop(1, `rgba(100, 149, 237, ${opacity})`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

export class Orbital extends Entity {
    constructor(x, y, props) {
        super(x, y);
        this.angle = props.angle ?? 0;
        this.distance = props.distance ?? 40;
        this.rotationSpeed = props.rotationSpeed ?? 0.05;
        this.damage = props.damage ?? 8;
        this.radius = props.radius ?? 8;
        this.weaponId = props.weaponId ?? null;
    }

    update(game) {
        this.angle += this.rotationSpeed;
        this.x = game.player.x + Math.cos(this.angle) * this.distance;
        this.y = game.player.y + Math.sin(this.angle) * this.distance;

        game.getEnemiesAndBosses().forEach(enemy => {
            if (enemy.toRemove) return;
            if (Utils.getDistance(this, enemy) < this.radius + enemy.stats.radius) {
                enemy.takeDamage(this.damage / 60, game);
            }
        });

        (game.entities.enemyProjectiles || []).forEach(proj => {
            if (Utils.getDistance(this, proj) < this.radius + (proj.radius || proj.size || 0)) {
                proj.toRemove = true;
            }
        });
    }

    draw(ctx, game) {
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
}

export class StaticField extends Entity {
    constructor(x, y, props) {
        super(x, y);
        Object.assign(this, props);
        this.tick = 0;
    }

    update(game) {
        this.life--;
        if (this.life <= 0) this.toRemove = true;
        this.tick++;
        if (this.tick % this.tickRate === 0) {
            const targets = game.getEnemiesAndBosses().filter(e =>
                !e.toRemove && Utils.getDistance(this, e) < this.radius
            );
            if (targets.length > 0) {
                const target = targets[Math.floor(Math.random() * targets.length)];
                target.takeDamage(this.damage, game);
                const { Effect } = game._entityClasses;
                const midX = (this.x + target.x) / 2, midY = (this.y + target.y) / 2;
                game.addEntity('effects', new Effect(midX, midY, {
                    type: 'lightning_chain',
                    from: { x: this.x, y: this.y },
                    to: { x: target.x, y: target.y },
                    life: 10,
                    initialLife: 10
                }));
            }
        }
    }

    draw(ctx, game) {
        const opacity = this.life > 30 ? 0.3 : (this.life / 30) * 0.3;
        ctx.strokeStyle = `rgba(255, 255, 0, ${opacity * 2})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
}

export class Sanctuary extends Entity {
    constructor(x, y, props) {
        super(x, y);
        Object.assign(this, props);
    }

    update(game) {
        this.life--;
        if (this.life <= 0) this.toRemove = true;
        if (Utils.getDistance(this, game.player) < this.radius) {
            game.player.hp = Math.min(game.player.stats.maxHp, game.player.hp + this.hps / 60);
        }
    }

    draw(ctx, game) {
        const opacity = this.life > 30 ? 0.3 : (this.life / 30) * 0.3;
        const g = ctx.createRadialGradient(this.x, this.y, 1, this.x, this.y, this.radius);
        g.addColorStop(0, `rgba(255, 253, 208, ${opacity})`);
        g.addColorStop(1, `rgba(240, 230, 140, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}
