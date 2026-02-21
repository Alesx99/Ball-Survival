/**
 * Boss Entity
 * @module entities/Boss
 */

import { Enemy } from './Enemy.js';
import { CONFIG } from '../config/index.js';
import { Utils } from '../utils/index.js';
import { poolManager } from '../utils/PoolManager.js';

export class Boss extends Enemy {
    constructor(x, y, stats) {
        super(x, y, stats);
        this.type = this.stats.type || 'boss';
        this.color = '#8e44ad';
        this.lastAttack = 0;
        this.isBoss = true;
        this.isElite = false;
    }

    update(game) {
        super.update(game);
        if (this.spawnImmunityTimer > 0) return;
        const now = Date.now();
        if (now - this.lastAttack > CONFIG.boss.attack.cooldown) {
            const angleToPlayer = Math.atan2(game.player.y - this.y, game.player.x - this.x);
            const { Projectile } = game._entityClasses;
            game.addEntity('enemyProjectiles', poolManager.get('Projectile', () => new Projectile(0, 0, {})).init(this.x, this.y, {
                angle: angleToPlayer,
                speed: CONFIG.boss.attack.projectileSpeed,
                damage: this.stats.damage,
                radius: CONFIG.boss.attack.projectileRadius,
                life: 300,
                color: '#ff5555'
            }));
            this.lastAttack = now;
        }
    }

    onDeath(game) {
        const { Particle } = game._entityClasses;
        const count = CONFIG.accessibility?.reduceMotion ? 6 : 20;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 6;
            game.addEntity('particles', new Particle(this.x, this.y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 35 + Math.floor(Math.random() * 20),
                color: this.color
            }));
        }
        game.addScreenShake?.(12);
        super.onDeath(game);
        game.bossesKilledThisStage++;
        game.bestiarySystem?.registerKill(this.type || 'boss');
        if (game.stats) game.stats.bossKills++;
        const healRatio = game.gameMode === 'bossRush' ? 0.25 : 0.5;
        game.player.hp = Math.min(game.player.stats.maxHp, game.player.hp + game.player.stats.maxHp * healRatio);
        game.gemsThisRun += 100;

        // Golden boss reward
        if (this._goldenReward) {
            game.gemsThisRun += this._goldenReward;
            game.notifications?.push?.({ text: `✨ BOSS DORATO SCONFITTO! +${this._goldenReward} 💎`, life: 400, color: '#ffd700' });
            game.cheatCodeSystem?.discoverEgg('golden_enemy');
        }

        // Traccia boss kills totali (persistente per sblocco stage)
        try {
            const totalBossKills = parseInt(localStorage.getItem('ballSurvivalTotalBossKills') || '0') + 1;
            localStorage.setItem('ballSurvivalTotalBossKills', totalBossKills.toString());
        } catch (e) { /* ignore storage errors */ }

        game.showBossUpgradePopup();
    }

    draw(ctx, game) {
        ctx.save();
        if (this.spawnImmunityTimer > 0) {
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 50) * 0.2;
        }
        const angle = Date.now() / 1000;
        ctx.beginPath();
        ctx.moveTo(this.x + this.stats.radius * Math.cos(angle), this.y + this.stats.radius * Math.sin(angle));
        for (let i = 1; i <= 6; i++) {
            ctx.lineTo(
                this.x + this.stats.radius * Math.cos(angle + i * 2 * Math.PI / 6),
                this.y + this.stats.radius * Math.sin(angle + i * 2 * Math.PI / 6)
            );
        }
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 4;
        ctx.stroke();
        Utils.drawPolygon(ctx, this.x, this.y, this.stats.radius * 0.7, 6, -Date.now() / 800, 'rgba(255,255,255,0.5)');
        ctx.restore();
        const barW = this.stats.radius * 2;
        const barH = 8;
        const barX = this.x - barW / 2;
        const barY = this.y - this.stats.radius - 15;
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = this.hp / this.stats.maxHp > 0.5 ? '#0f0' : (this.hp / this.stats.maxHp > 0.25 ? '#ff0' : '#f00');
        ctx.fillRect(barX, barY, barW * (this.hp / this.stats.maxHp), barH);
    }
}
