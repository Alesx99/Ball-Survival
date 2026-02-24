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
        this.init(x, y, stats);
        this.poolType = 'Enemy';
    }

    init(x, y, stats) {
        this.x = x;
        this.y = y;
        this.toRemove = false;
        this.stats = { ...stats };
        this.type = this.stats.type || 'enemy';
        this.hp = this.stats.maxHp || this.stats.hp || 25;
        this.stats.maxHp = this.hp;
        this.spawnImmunityTimer = CONFIG.enemies.spawnImmunity;
        this.slowAmount = 0;
        this.slowTimer = 0;
        this.stunTimer = 0;
        this.burnTimer = 0;
        this.burnDamage = 0;
        this.lastContactDamageTime = -999;
        return this;
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

        // Regen da difficulty tier (tier 4+)
        if (this.stats.regen && this.hp < this.stats.maxHp) {
            this.hp = Math.min(this.stats.maxHp, this.hp + this.stats.regen / 60);
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
            // Fantasma: attraversa nemici (no danno da contatto)
            if (!game.player._phantomPassthrough) {
                const cooldown = CONFIG.enemies.contactDamageCooldown ?? 0.9;
                if (game.totalElapsedTime - this.lastContactDamageTime >= cooldown) {
                    game.player.takeDamage(this.stats.damage, game, this);
                    this.lastContactDamageTime = game.totalElapsedTime;
                }
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

        // Stats tracking per achievement
        if (game.stats) game.stats.totalDamageDealt += finalDamage;

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
        game.addScreenShake?.(this.stats.isElite ? 5 : (this.stats.isGolden ? 10 : 3));
        game.enemiesKilled++;
        game.bestiarySystem?.registerKill(this.type);
        game.score += 10 * (this.stats.isElite ? 3 : (this.stats.isGolden ? 50 : 1));

        // AnomalousArea progress (evento kill)
        if (game.entities && game.entities.anomalousAreas) {
            game.entities.anomalousAreas.forEach(area => {
                if (!area.completed && area.eventType === 'kill') {
                    if (Utils.getDistance(this, area) < area.radius) {
                        area.progress++;
                    }
                }
            });
        }

        // Golden enemy reward
        if (this.stats.isGolden) {
            game.gemsThisRun += 120;
            game.notifications?.push?.({ text: '✨ NEMICO DORATO! +120 💎', life: 300, color: '#ffd700' });
            game.cheatCodeSystem?.discoverEgg('golden_enemy');
            game.audio?.playAchievementUnlock?.();
            // Confetti particles
            const { Particle } = game._entityClasses;
            for (let i = 0; i < 30; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 3 + Math.random() * 5;
                const colors = ['#ffd700', '#ff6347', '#00ff88', '#ff69b4', '#87ceeb'];
                game.addEntity('particles', new Particle(this.x, this.y, {
                    vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                    life: 40 + Math.floor(Math.random() * 30),
                    color: colors[Math.floor(Math.random() * colors.length)]
                }));
            }
        }

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

        // Drop materials (disattivato: nuovo sistema di core/armi via chest)

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

        // Stats tracking per combat achievements
        if (game.stats) {
            game.stats.kills++;
            // Easter egg: 666 kills
            game.cheatCodeSystem?.check666(game.stats.kills);
            // Combo kills (entro 3s)
            const now = Date.now();
            if (now - game.stats._lastKillTime < 3000) {
                game.stats._comboKillCount++;
                game.stats.bestComboKills = Math.max(game.stats.bestComboKills, game.stats._comboKillCount);
            } else {
                game.stats._comboKillCount = 1;
            }
            game.stats._lastKillTime = now;
        }

        // Meta Progression System hook
        game.metaProgressionSystem?.onEnemyKilled?.(this);
    }

    draw(ctx, game) {
        if (this.spawnImmunityTimer > 0) {
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 50) * 0.2;
        }

        const stageInfo = CONFIG.stages[game.currentStage];
        const shape = stageInfo?.enemies?.shape || 'circle';
        const baseColor = this.stats.isGolden ? '#ffd700'
            : this.stats.isElite
                ? (stageInfo?.enemies?.eliteColor || '#c0392b')
                : (stageInfo?.enemies?.baseColor || '#e74c3c');

        Utils.drawEnemySprite(ctx, this.x, this.y, this.stats.radius, shape, baseColor, this.stats.isElite);

        // Golden enemy sparkle
        if (this.stats.isGolden) {
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 15 + Math.sin(Date.now() / 200) * 5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.stats.radius + 2, 0, Math.PI * 2);
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

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
