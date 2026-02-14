/**
 * Enemy class
 * @module entities/Enemy
 */

import { Entity } from './Entity.js';
import { CONFIG } from '../config/index.js';
import { Utils } from '../utils/index.js';

export class Enemy extends Entity {
    constructor(x, y, stats) {
        super(x, y);
        this.stats = { ...stats };
        this.hp = this.stats.maxHp || this.stats.hp || 25;
        this.stats.maxHp = this.hp;
        this.spawnImmunityTimer = CONFIG.enemies.spawnImmunity;
        this.slowAmount = 0;
        this.slowTimer = 0;
        this.stunTimer = 0;
        this.burnTimer = 0;
        this.burnDamage = 0;
        this.lastContactDamageTime = -999;
    }

    update(game) {
        if (this.spawnImmunityTimer > 0) {
            this.spawnImmunityTimer--;
            return;
        }

        if (this.stunTimer > 0) {
            this.stunTimer--;
            return;
        }

        let speed = this.stats.speed;
        if (this.slowTimer > 0) {
            speed *= (1 - this.slowAmount);
            this.slowTimer--;
        }

        if (this.burnTimer > 0) {
            this.hp -= this.burnDamage / 60;
            this.burnTimer--;
            if (this.hp <= 0) {
                this.onDeath(game);
                return;
            }
        }

        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            this.x += (dx / dist) * speed;
            this.y += (dy / dist) * speed;
        }

        this.x = Math.max(this.stats.radius, Math.min(CONFIG.world.width - this.stats.radius, this.x));
        this.y = Math.max(this.stats.radius, Math.min(CONFIG.world.height - this.stats.radius, this.y));

        if (dist < game.player.stats.radius + this.stats.radius) {
            const cooldown = CONFIG.enemies.contactDamageCooldown ?? 0.9;
            if (game.totalElapsedTime - this.lastContactDamageTime >= cooldown) {
                game.player.takeDamage(this.stats.damage, game, this);
                this.lastContactDamageTime = game.totalElapsedTime;
            }

            // Contact effects from player archetype
            if (game.player.modifiers.contactBurn) {
                this.burnTimer = 120;
                this.burnDamage = 8;
            }
            if (game.player.modifiers.contactSlow) {
                this.slowAmount = 0.5;
                this.slowTimer = 60;
            }
        }
    }

    takeDamage(amount, game) {
        if (this.spawnImmunityTimer > 0) return;
        const dr = this.stats.dr || 0;
        const finalDamage = amount * (1 - dr);
        this.hp -= finalDamage;

        // Lifesteal (da powerUp e da Core Sangue)
        const lsPower = game.player.powerUpTimers?.lifesteal > 0 ? 0.15 : 0;
        const lsCore = game.player.modifiers?.lifestealPercent ?? 0;
        const lsTotal = Math.max(lsPower, lsCore);
        if (lsTotal > 0) {
            game.player.hp = Math.min(game.player.stats.maxHp, game.player.hp + finalDamage * lsTotal);
        }

        if (this.hp <= 0) {
            this.onDeath(game);
        }
    }

    onDeath(game) {
        this.toRemove = true;
        game.audio?.playEnemyDeath();
        game.addScreenShake?.(this.stats.isElite ? 5 : 3);
        game.enemiesKilled++;
        game.score += 10 * (this.stats.isElite ? 3 : 1);

        // Death particles
        const stageInfo = CONFIG.stages[game.currentStage];
        const particleColor = this.stats.isElite
            ? (stageInfo?.enemies?.eliteColor || '#c0392b')
            : (stageInfo?.enemies?.baseColor || '#e74c3c');
        const { Particle } = game._entityClasses;
        const count = CONFIG.accessibility?.reduceMotion ? (this.stats.isElite ? 4 : 2) : (this.stats.isElite ? 14 : 8);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            game.addEntity('particles', new Particle(this.x, this.y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 25 + Math.floor(Math.random() * 15),
                color: particleColor
            }));
        }

        // Drop XP orb
        const { XpOrb } = game._entityClasses;
        const stageEffects = CONFIG.stages[game.currentStage]?.effects || { xpBonus: 1, dropBonus: 1 };
        const xpValue = Math.floor(this.stats.xp * stageEffects.xpBonus);
        game.addEntity('xpOrbs', new XpOrb(this.x, this.y, xpValue));

        // Drop gems sometimes
        if (Math.random() < 0.05 + game.player.modifiers.luck * 0.5) {
            const { GemOrb } = game._entityClasses;
            game.addEntity('gemOrbs', new GemOrb(this.x, this.y, 1));
        }

        // Drop materials
        game.tryDropMaterial(this);

        // Track elite kills
        if (this.stats.isElite) {
            game.elitesKilledThisStage++;
            game.enemiesKilledSinceBoss += 3;
            if (game.achievementSystem) {
                game.achievementSystem.updateProgress('elites_killed', 1, game);
            }
        } else {
            game.enemiesKilledSinceBoss++;
        }

        // Achievement tracking
        if (game.achievementSystem) {
            game.achievementSystem.updateProgress('enemies_killed', 1, game);
        }
    }

    draw(ctx, game) {
        if (this.spawnImmunityTimer > 0) {
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 50) * 0.2;
        }

        const stageInfo = CONFIG.stages[game.currentStage];
        const shape = stageInfo?.enemies?.shape || 'circle';
        const baseColor = this.stats.isElite
            ? (stageInfo?.enemies?.eliteColor || '#c0392b')
            : (stageInfo?.enemies?.baseColor || '#e74c3c');

        Utils.drawEnemySprite(ctx, this.x, this.y, this.stats.radius, shape, baseColor, this.stats.isElite);

        // HP bar
        if (this.hp < this.stats.maxHp) {
            const barW = this.stats.radius * 2;
            const barH = 4;
            const barX = this.x - barW / 2;
            const barY = this.y - this.stats.radius - 10;
            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = this.hp / this.stats.maxHp > 0.5 ? '#0f0' : (this.hp / this.stats.maxHp > 0.25 ? '#ff0' : '#f00');
            ctx.fillRect(barX, barY, barW * (this.hp / this.stats.maxHp), barH);
        }

        ctx.globalAlpha = 1;
    }
}
