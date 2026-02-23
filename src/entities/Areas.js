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
                if (this.slowAmount !== undefined) {
                    target.slowAmount = this.slowAmount;
                    target.slowTimer = Math.max(target.slowTimer, 2);
                }
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
            if (this.attackSpeed) {
                game.player.powerUpTimers.attackSpeedBoost = Math.max(game.player.powerUpTimers.attackSpeedBoost || 0, 5);
            }
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

export class AnomalousArea extends Entity {
    constructor(x, y, props) {
        super(x, y);
        this.radius = props.radius || 150;
        this.life = props.duration || 60 * 60; // 60s * 60fps
        this.maxLife = this.life;
        this.eventType = props.eventType || 'survive'; // survive o kill
        this.progress = 0;
        this.maxProgress = props.maxProgress || (this.eventType === 'survive' ? 1200 : 20); // 20 sec o 20 kill
        this.completed = false;
        this.reward = props.reward || 'epic_chest';
        this.color = props.color || '#ff00ff';
        this.glowPhase = 0;
    }

    update(game) {
        if (this.completed || this.toRemove) return;

        this.life--;
        this.glowPhase += 0.05;

        if (this.life <= 0) {
            this.toRemove = true;
            return;
        }

        const distanceToPlayer = Utils.getDistance(this, game.player);
        const playerInside = distanceToPlayer < this.radius;

        if (playerInside) {
            if (this.eventType === 'survive') {
                this.progress++;
            }
        }

        if (this.progress >= this.maxProgress) {
            this.completeEvent(game);
        }
    }

    completeEvent(game) {
        this.completed = true;
        this.toRemove = true;

        // Conferisce la ricompensa
        if (this.reward === 'epic_chest') {
            const { Chest } = game._entityClasses;
            game.addEntity('chests', new Chest(this.x, this.y, { type: 'epic' }));
        } else if (this.reward === 'gems') {
            for (let i = 0; i < 20; i++) {
                const { GemOrb } = game._entityClasses;
                game.addEntity('gemOrbs', new GemOrb(this.x + (Math.random() - 0.5) * 40, this.y + (Math.random() - 0.5) * 40, { xp: 15 }));
            }
        }

        // Segnala al giocatore
        if (game.notifications) {
            game.notifications.push({ text: "EVENTO COMPLETATO!", life: 180, color: '#00ffff' });
        }
    }

    draw(ctx, game) {
        const glow = Math.sin(this.glowPhase) * 0.2 + 0.3;
        ctx.strokeStyle = `rgba(255, 0, 255, ${glow})`;
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 0, 255, ${glow * 0.2})`;
        ctx.fill();

        if (!this.completed) {
            const barWidth = 100;
            const barHeight = 8;
            const px = this.x - barWidth / 2;
            const py = this.y + this.radius + 15;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(px, py, barWidth, barHeight);

            ctx.fillStyle = '#00ffff';
            ctx.fillRect(px, py, barWidth * (this.progress / this.maxProgress), barHeight);

            ctx.fillStyle = '#fff';
            ctx.font = '12px Courier';
            ctx.textAlign = 'center';
            const timeRemaining = Math.ceil(this.life / 60);
            ctx.fillText(`${this.eventType.toUpperCase()} - ${timeRemaining}s`, this.x, py - 10);
        }
    }
}
