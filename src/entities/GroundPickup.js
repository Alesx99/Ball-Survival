/**
 * GroundPickup — temporary power-up pickups on the ground
 * @module entities/GroundPickup
 */

import { Entity } from './Entity.js';
import { Utils } from '../utils/index.js';
import { CONFIG } from '../config/index.js';

export class GroundPickup extends Entity {
    constructor(x, y, pickupType) {
        super(x, y);
        const typeDef = CONFIG.groundPickups.types[pickupType];
        this.pickupType = pickupType;
        this.name = typeDef?.name || 'Pickup';
        this.color = typeDef?.color || '#ffffff';
        this.duration = typeDef?.duration || 300;
        this.effect = typeDef?.effect || {};
        this.radius = 14;
        this.life = (CONFIG.groundPickups.despawnTime || 30) * 60; // frames
        this.maxLife = this.life;
        this.glowPhase = Math.random() * Math.PI * 2;
        this.toRemove = false;
    }

    update(game) {
        this.life--;
        this.glowPhase += 0.08;

        if (this.life <= 0) {
            this.toRemove = true;
            return;
        }

        // Check pickup by player
        const dist = Utils.getDistance(this, game.player);
        if (dist < game.player.stats.radius + this.radius + 5) {
            this._applyEffect(game);
            this.toRemove = true;
        }
    }

    _applyEffect(game) {
        const player = game.player;

        if (this.pickupType === 'speed_boost') {
            player.powerUpTimers = player.powerUpTimers || {};
            player.powerUpTimers.speedBoost = (player.powerUpTimers.speedBoost || 0) + this.duration;
            player._pickupSpeedBonus = this.effect.speed || 0.4;
            game.notifications?.push?.({ text: '⚡ ' + this.name + '!', life: 180, color: this.color });
        } else if (this.pickupType === 'damage_boost') {
            player.powerUpTimers = player.powerUpTimers || {};
            player.powerUpTimers.damageBoost = (player.powerUpTimers.damageBoost || 0) + this.duration;
            player._pickupDamageBonus = this.effect.power || 0.3;
            game.notifications?.push?.({ text: '⚔️ ' + this.name + '!', life: 180, color: this.color });
        } else if (this.pickupType === 'magnet_pulse') {
            // Attract all XP orbs in radius instantly
            const magnetRadius = this.effect.magnetRadius || 300;
            if (game.entities.xpOrbs) {
                game.entities.xpOrbs.forEach(orb => {
                    if (Utils.getDistance(this, orb) < magnetRadius) {
                        // Move orb very close to player for instant pickup
                        orb.x = player.x + (Math.random() - 0.5) * 20;
                        orb.y = player.y + (Math.random() - 0.5) * 20;
                    }
                });
            }
            if (game.entities.gemOrbs) {
                game.entities.gemOrbs.forEach(orb => {
                    if (Utils.getDistance(this, orb) < magnetRadius) {
                        orb.x = player.x + (Math.random() - 0.5) * 20;
                        orb.y = player.y + (Math.random() - 0.5) * 20;
                    }
                });
            }
            game.notifications?.push?.({ text: '🧲 ' + this.name + '!', life: 180, color: this.color });
            game.addScreenShake?.(4);
        } else if (this.pickupType === 'shield_bubble') {
            // Temporary invincibility
            player.powerUpTimers = player.powerUpTimers || {};
            player.powerUpTimers.invincibility = (player.powerUpTimers.invincibility || 0) + this.duration;
            game.notifications?.push?.({ text: '🛡️ ' + this.name + '!', life: 180, color: this.color });
        } else if (this.pickupType === 'rage_crystal') {
            // Strong damage boost (stacks with existing)
            player.powerUpTimers = player.powerUpTimers || {};
            player.powerUpTimers.damageBoost = (player.powerUpTimers.damageBoost || 0) + this.duration;
            player._pickupDamageBonus = this.effect.power || 0.8;
            game.notifications?.push?.({ text: '🔥 ' + this.name + '!', life: 180, color: this.color });
            game.addScreenShake?.(6);
        } else if (this.pickupType === 'freeze_pulse') {
            // Instant stun all enemies in radius
            const freezeRadius = this.effect.freezeRadius || 200;
            const freezeDuration = this.effect.freezeDuration || 120;
            const allEnemies = [...(game.entities.enemies || []), ...(game.entities.bosses || [])];
            allEnemies.forEach(enemy => {
                if (Utils.getDistance(this, enemy) < freezeRadius && !enemy.toRemove) {
                    enemy.stunTimer = freezeDuration;
                }
            });
            // Visual burst
            const { Effect } = game._entityClasses || {};
            if (Effect) {
                game.addEntity('effects', new Effect(this.x, this.y, {
                    type: 'level_up_burst', maxRadius: freezeRadius, life: 20, initialLife: 20, color: '#b0e0ff'
                }));
            }
            game.notifications?.push?.({ text: '❄️ ' + this.name + '!', life: 180, color: this.color });
            game.addScreenShake?.(5);
        }

        game.audio?.playPowerUp?.();
    }

    draw(ctx, game) {
        const glow = Math.sin(this.glowPhase) * 0.3 + 0.6;
        const lifePercent = this.life / this.maxLife;

        // Outer glow
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10 + Math.sin(this.glowPhase) * 5;

        // Pulsing circle
        const pulseR = this.radius + Math.sin(this.glowPhase * 2) * 2;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = glow * (lifePercent > 0.2 ? 1 : lifePercent * 5);
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseR, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright core
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = glow * 0.8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Rotating sparkles
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = glow * 0.6;
        for (let i = 0; i < 4; i++) {
            const a = this.glowPhase + (i * Math.PI / 2);
            const d = pulseR + 4;
            ctx.beginPath();
            ctx.moveTo(this.x + Math.cos(a) * (d - 3), this.y + Math.sin(a) * (d - 3));
            ctx.lineTo(this.x + Math.cos(a) * (d + 3), this.y + Math.sin(a) * (d + 3));
            ctx.stroke();
        }

        ctx.restore();

        // Life remaining bar
        if (lifePercent < 0.5) {
            const barW = 20;
            const barH = 3;
            const barX = this.x - barW / 2;
            const barY = this.y + this.radius + 6;
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = this.color;
            ctx.fillRect(barX, barY, barW * lifePercent, barH);
        }
    }
}
