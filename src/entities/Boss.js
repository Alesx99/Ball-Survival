/**
 * Boss Entity
 * @module entities/Boss
 */

import { Enemy } from './Enemy.js';
import { CONFIG } from '../config/index.js';
import { Utils } from '../utils/index.js';
import { poolManager } from '../utils/PoolManager.js';
import { StorageManager, StorageKeys } from '../core/StorageManager.js';

export class Boss extends Enemy {
    constructor(x, y, stats) {
        super(x, y, stats);
        this.type = this.stats.type || 'boss';

        // Differentiate color based on type
        const colors = {
            'orc_boss': '#2ecc71',
            'slime_boss': '#3498db',
            'golem_boss': '#95a5a6',
            'shadow_boss': '#8e44ad',
            'boss': '#e74c3c'
        };
        this.color = colors[this.type] || '#8e44ad';

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
                color: this.color
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
        game.bossesKilled++;
        game.bestiarySystem?.registerKill(this.type || 'boss');
        if (game.stats) game.stats.bossKills++;
        const healRatio = game.gameMode === 'bossRush' ? 0.15 : 0.5;
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
            const totalBossKills = (StorageManager.getItem(StorageKeys.TOTAL_BOSS_KILLS) || 0) + 1;
            StorageManager.setItem(StorageKeys.TOTAL_BOSS_KILLS, totalBossKills.toString());
        } catch (e) { /* ignore storage errors */ }

        game.showBossUpgradePopup();
    }

    draw(ctx, game) {
        ctx.save();
        if (this.spawnImmunityTimer > 0) {
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 50) * 0.2;
        }

        const r = this.stats.radius;
        const t = Date.now() / 1000;

        // Ground Shadow
        ctx.save();
        ctx.translate(this.x, this.y + r * 1.1);
        ctx.scale(1.3, 0.4);
        const shadowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        shadowGrad.addColorStop(0, 'rgba(0,0,0,0.4)');
        shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = shadowGrad;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        ctx.translate(this.x, this.y);

        // Model based on type
        switch (this.type) {
            case 'orc_boss':
                // Spiked Hexagon
                ctx.rotate(t * 0.5);
                ctx.fillStyle = this.color;
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 4;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = i * Math.PI * 2 / 6;
                    const sp = i % 2 === 0 ? r : r * 0.8;
                    const px = Math.cos(angle) * sp;
                    const py = Math.sin(angle) * sp;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                // Spikes
                ctx.strokeStyle = '#c0392b';
                for (let i = 0; i < 6; i++) {
                    const a = i * Math.PI * 2 / 6;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
                    ctx.lineTo(Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.3);
                    ctx.stroke();
                }
                break;

            case 'slime_boss':
                // Pulsing Blob
                const pulse = Math.sin(t * 4) * 5;
                const slimeGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r + pulse);
                slimeGrad.addColorStop(0, '#5dade2');
                slimeGrad.addColorStop(1, this.color);
                ctx.fillStyle = slimeGrad;
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const a = i * Math.PI * 2 / 8;
                    const dist = r + pulse + Math.sin(t * 6 + i) * 3;
                    const px = Math.cos(a) * dist;
                    const py = Math.sin(a) * dist;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.quadraticCurveTo(0, 0, px, py);
                }
                ctx.closePath();
                ctx.fill();
                // Shine
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.3, r * 0.2, 0, Math.PI * 2); ctx.fill();
                break;

            case 'golem_boss':
                // Armored Square
                ctx.rotate(t * 0.3);
                ctx.fillStyle = this.color;
                ctx.strokeStyle = '#2c3e50';
                ctx.lineWidth = 8;
                ctx.fillRect(-r * 0.8, -r * 0.8, r * 1.6, r * 1.6);
                ctx.strokeRect(-r * 0.8, -r * 0.8, r * 1.6, r * 1.6);
                // Cracks/Inner detailing
                ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-r * 0.4, -r * 0.4); ctx.lineTo(r * 0.4, r * 0.4);
                ctx.moveTo(r * 0.4, -r * 0.4); ctx.lineTo(-r * 0.4, r * 0.4);
                ctx.stroke();
                break;

            case 'shadow_boss':
                // Shifting Void
                ctx.shadowBlur = 20;
                ctx.shadowColor = this.color;
                const voidGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.2);
                voidGrad.addColorStop(0, '#000');
                voidGrad.addColorStop(0.7, this.color);
                voidGrad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = voidGrad;
                ctx.beginPath(); ctx.arc(0, 0, r * 1.2, 0, Math.PI * 2); ctx.fill();
                // Flying debris
                ctx.rotate(-t);
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                for (let i = 0; i < 4; i++) {
                    const a = i * Math.PI / 2;
                    ctx.beginPath();
                    ctx.arc(0, 0, r + Math.sin(t * 5) * 5, a, a + 0.5);
                    ctx.stroke();
                }
                break;

            default:
                // Generic Boss (Hexagon)
                ctx.rotate(t);
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = i * 2 * Math.PI / 6;
                    const px = r * Math.cos(angle);
                    const py = r * Math.sin(angle);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 4;
                ctx.stroke();
                Utils.drawPolygon(ctx, 0, 0, r * 0.7, 6, -t * 0.8, 'rgba(255,255,255,0.5)');
        }

        ctx.restore();

        // HP Bar
        const barW = this.stats.radius * 2;
        const barH = 8;
        const barX = this.x - barW / 2;
        const barY = Math.max(8, this.y - this.stats.radius - 20);
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barW, barH);
        const hpPercent = Math.max(0, this.hp / this.stats.maxHp);
        ctx.fillStyle = hpPercent > 0.5 ? '#2ecc71' : (hpPercent > 0.25 ? '#f1c40f' : '#e74c3c');
        ctx.fillRect(barX, barY, barW * hpPercent, barH);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW, barH);
    }
}
