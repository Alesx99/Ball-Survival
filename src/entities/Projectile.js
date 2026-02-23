/**
 * Projectile Entity
 * @module entities/Projectile
 */

import { Entity } from './Entity.js';
import { Utils } from '../utils/index.js';

export class Projectile extends Entity {
    constructor(x, y, props) {
        super(x, y);
        this.init(x, y, props);
        this.poolType = 'Projectile';
    }

    init(x, y, props) {
        this.x = x;
        this.y = y;
        this.toRemove = false;
        this.penetrated = 0;
        this.penetration = props.penetration ?? 1;
        if (props.angle !== undefined) {
            this.vx = Math.cos(props.angle) * props.speed;
            this.vy = Math.sin(props.angle) * props.speed;
        } else {
            this.vx = 0;
            this.vy = 0;
        }

        // Reset pooled properties that might have been left over
        this.slow = undefined;
        this.slowDuration = undefined;
        this.stunChance = undefined;
        this.stunDuration = undefined;
        this.drawFunc = undefined;
        this.onDeathEffect = undefined;
        this.explosionRadius = undefined;
        this.burnDamage = undefined;
        this.customEffect = undefined;
        this.leavesTrail = false;
        this.type = undefined;
        this.color = undefined;

        Object.assign(this, props);
        return this;
    }

    update(game) {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        if (this.life <= 0) {
            this.triggerDeathEffect(game);
            this.toRemove = true;
        }

        if (this.leavesTrail && this.life % 4 === 0) {
            const { FireTrail } = game._entityClasses;
            game.addEntity('fireTrails', new FireTrail(this.x, this.y, {
                radius: (this.size || this.radius || 0) * 0.7,
                damage: this.burnDamage || 0
            }));
        }

        const targets = game.getEnemiesAndBosses();
        for (const target of targets) {
            if (target.toRemove) continue;
            const hitRadius = this.size || this.radius || 0;
            if (Utils.getDistance(this, target) < target.stats.radius + hitRadius) {
                target.takeDamage(this.damage, game);
                if (this.slow) {
                    target.slowAmount = this.slow;
                    target.slowTimer = this.slowDuration || 60;
                }
                if (this.stunChance && Math.random() < this.stunChance) {
                    target.stunTimer = this.stunDuration || 60;
                }
                this.penetrated++;
                if (this.penetrated >= (this.penetration ?? 1)) {
                    this.triggerDeathEffect(game);
                    if (this.type !== 'great_fireball' && this.type !== 'lightning_spear') {
                        this.toRemove = true;
                    }
                    break;
                }
            }
        }
    }

    triggerDeathEffect(game) {
        if (this.onDeathEffect === 'explosion' && game.createExplosion) {
            game.createExplosion(this.x, this.y, this.explosionRadius, this.damage / 2);
        } else if (this.onDeathEffect === 'custom' && typeof this.customEffect === 'function') {
            this.customEffect(this, game);
        }
    }

    draw(ctx, game) {
        if (this.drawFunc) {
            this.drawFunc(ctx, this);
        } else {
            ctx.fillStyle = this.color || '#ffaa00';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size || this.radius || 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
