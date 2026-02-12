/**
 * Player class - main player entity
 * ES module version
 * @module entities/Player
 */

import { Entity } from './Entity.js';
import { CONFIG } from '../config/index.js';
import { Utils } from '../utils/index.js';

export class Player extends Entity {
    constructor() {
        super(CONFIG.world.width / 2, CONFIG.world.height / 2);
        const baseStats = { ...CONFIG.player.base, maxHp: CONFIG.player.base.hp };
        this.baseStats = baseStats;
        this.keys = {};
        this.cores = [];
        this.weapons = [];
        this.initStats();
    }

    initStats() {
        this.level = 1;
        this.xp = 0;
        this.xpNext = CONFIG.player.xpCurve.base;

        if (this.xpNext <= 0) this.xpNext = 1;

        this.powerUpTimers = { invincibility: 0, damageBoost: 0, lifesteal: 0 };
        this.iFramesTimer = 0;
        this.stats = { ...this.baseStats };
        this.modifiers = { power: 1, frequency: 1, area: 1, xpGain: 1, luck: 0, contactBurn: false, contactSlow: false };
        this.hp = this.stats.maxHp;
        this.archetype = CONFIG.characterArchetypes.standard;
    }

    resetForNewRun(permUpgrades, archetypeId, game) {
        this.x = CONFIG.world.width / 2;
        this.y = CONFIG.world.height / 2;
        this.initStats();
        this.archetype = (CONFIG.characterArchetypes[archetypeId] || CONFIG.characterArchetypes.standard);

        this.applyPermanentUpgrades(permUpgrades);

        if (this.archetype) {
            switch (this.archetype.id) {
                case 'steel':
                    this.stats.dr += 0.70;
                    this.stats.speed *= 0.5;
                    this.modifiers.frequency *= 0.6;
                    break;
                case 'magma':
                    this.modifiers.contactBurn = true;
                    this.modifiers.frequency *= 1.15;
                    break;
                case 'frost':
                    this.stats.maxHp -= 15;
                    this.modifiers.contactSlow = true;
                    break;
                case 'shadow':
                    this.stats.speed *= 1.35;
                    this.stats.maxHp *= 0.8;
                    break;
                case 'tech':
                    this.modifiers.area *= 1.50;
                    this.modifiers.power *= 0.95;
                    break;
            }
        }

        this.hp = this.stats.maxHp;

        if (game) {
            if (this.cores && this.cores.length > 0) {
                for (const coreId of this.cores) {
                    game.applyCoreEffect?.(coreId);
                }
            }
            if (this.weapons && this.weapons.length > 0) {
                for (const weaponId of this.weapons) {
                    game.applyWeaponEffect?.(weaponId);
                }
            }
        }

        if (this.xp < 0) this.xp = 0;
        if (this.xpNext <= 0) this.xpNext = 1;
        if (this.level < 1) this.level = 1;
    }

    applyPermanentUpgrades(p) {
        if (!p || typeof p !== 'object') {
            p = {
                health: { level: 0 },
                speed: { level: 0 },
                defense: { level: 0 },
                xpGain: { level: 0 },
                luck: { level: 0 },
                power: { level: 0 },
                frequency: { level: 0 },
                area: { level: 0 }
            };
        }

        this.stats.maxHp = this.baseStats.hp + ((p.health?.level || 0) * 20);
        this.stats.speed = this.baseStats.speed + ((p.speed?.level || 0) * 0.2);
        this.stats.dr += ((p.defense?.level || 0) * 0.02);
        this.modifiers.xpGain = 1 + ((p.xpGain?.level || 0) * 0.08);
        this.modifiers.luck = (p.luck?.level || 0) * 0.04;
        this.modifiers.power = 1 + ((p.power?.level || 0) * 0.08);
        this.modifiers.frequency = 1 - ((p.frequency?.level || 0) * 0.05);
        this.modifiers.area = 1 + ((p.area?.level || 0) * 0.06);
    }

    update(game, joystick) {
        let kDx = 0, kDy = 0;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) kDy -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) kDy += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) kDx -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) kDx += 1;

        let fDx = joystick.dx !== 0 ? joystick.dx : kDx;
        let fDy = joystick.dy !== 0 ? joystick.dy : kDy;
        const m = Math.sqrt(fDx * fDx + fDy * fDy);
        if (m > 1) {
            fDx /= m;
            fDy /= m;
        }

        this.x += fDx * this.stats.speed;
        this.y += fDy * this.stats.speed;
        this.x = Math.max(this.stats.radius, Math.min(CONFIG.world.width - this.stats.radius, this.x));
        this.y = Math.max(this.stats.radius, Math.min(CONFIG.world.height - this.stats.radius, this.y));

        if (this.voidTeleportConfig && this.cores && this.cores.includes('void') && game) {
            const healthPercentage = this.hp / this.stats.maxHp;
            if (healthPercentage <= this.voidTeleportConfig.threshold) {
                const now = Date.now();
                if (!this.lastVoidTeleport || (now - this.lastVoidTeleport) > this.voidTeleportConfig.cooldown) {
                    let safeX, safeY;
                    let attempts = 0;
                    const enemies = [...(game.entities?.enemies || []), ...(game.entities?.bosses || [])];
                    do {
                        safeX = Math.random() * (CONFIG.world.width - 200) + 100;
                        safeY = Math.random() * (CONFIG.world.height - 200) + 100;
                        attempts++;
                    } while (attempts < 10 && enemies.some(enemy =>
                        Utils.getDistance({ x: safeX, y: safeY }, enemy) < 100
                    ));

                    this.x = safeX;
                    this.y = safeY;
                    this.lastVoidTeleport = now;

                    const ParticleClass = game._entityClasses?.Particle;
                    if (ParticleClass) {
                        for (let i = 0; i < 20; i++) {
                            game.addEntity('particles', new ParticleClass(this.x, this.y, {
                                vx: (Math.random() - 0.5) * 10,
                                vy: (Math.random() - 0.5) * 10,
                                life: 60,
                                color: '#8A2BE2'
                            }));
                        }
                    }

                    if (game.notifications) {
                        game.notifications.push({
                            text: 'Teletrasporto del Vuoto!',
                            life: 180,
                            color: '#8A2BE2'
                        });
                    }
                }
            }
        }

        for (const key in this.powerUpTimers) {
            if (this.powerUpTimers[key] > 0) this.powerUpTimers[key]--;
        }
        if (this.iFramesTimer > 0) this.iFramesTimer--;
    }

    gainXP(amount) {
        this.xp += amount * this.modifiers.xpGain;
    }

    levelUp(game) {
        this.level++;
        this.xp -= this.xpNext;
        const c = CONFIG.player.xpCurve;
        const baseXP = c.base * Math.pow(c.growth, this.level - 1);
        const levelXP = c.levelFactor * this.level;
        this.xpNext = Math.max(1, Math.floor(baseXP + levelXP));

        if (this.xp < 0) this.xp = 0;
        if (this.xpNext <= 0) this.xpNext = 1;

        this.hp = this.stats.maxHp;
        this.powerUpTimers.invincibility = 120;
        game?.audio?.playLevelUp();
    }

    takeDamage(amount, game, sourceEnemy = null) {
        const shieldSpell = game?.spells?.shield;
        if ((shieldSpell && shieldSpell.active && shieldSpell.evolution !== 'reflect') || this.powerUpTimers.invincibility > 0 || this.iFramesTimer > 0) return;

        let maxDR = 0.85;
        if (this.archetype && this.archetype.id === 'steel') {
            maxDR = 0.90;
        }

        let damageReduction = Math.min(maxDR, this.stats.dr);

        if (sourceEnemy && sourceEnemy.stats?.isElite) {
            damageReduction = Math.max(0, damageReduction - 0.10);
        }
        if (sourceEnemy && sourceEnemy.isBoss) {
            damageReduction = Math.max(0, damageReduction - 0.25);
        }

        if (shieldSpell && shieldSpell.active && shieldSpell.evolution === 'reflect') {
            damageReduction += shieldSpell.dr;
            if (sourceEnemy) {
                sourceEnemy.takeDamage(amount * shieldSpell.reflectDamage, game);
            }
        }

        const finalDamage = amount * (1 - damageReduction);
        this.hp -= finalDamage;
        game?.audio?.playDamage();
        this.iFramesTimer = Math.ceil((CONFIG.player.iFramesDuration ?? 0.8) * 60);
        if (this.hp <= 0 && game) game.gameOver?.();
    }

    draw(ctx, game) {
        if (this.archetype && this.archetype.draw) {
            this.archetype.draw(ctx, this);
        } else {
            CONFIG.characterArchetypes.standard.draw(ctx, this);
        }

        this.drawActiveCores(ctx, game);
        this.drawActiveWeapons(ctx, game);

        const barWidth = this.stats.radius * 2.7;
        const barHeight = 8;
        const offsetY = this.stats.radius + 22;
        const barX = this.x - barWidth / 2;
        const barY = Math.max(8, this.y - offsetY);

        ctx.fillStyle = 'rgba(30, 30, 30, 0.95)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        const healthPercentage = Math.max(0, this.hp / this.stats.maxHp);
        const healthBarWidth = barWidth * healthPercentage;
        ctx.fillStyle = 'rgba(80, 255, 80, 1)';
        ctx.fillRect(barX, barY, healthBarWidth, barHeight);

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        const shieldSpell = game?.spells?.shield;
        if ((shieldSpell && shieldSpell.active) || this.powerUpTimers.invincibility > 0 || this.iFramesTimer > 0) {
            const shieldRadius = this.stats.radius + 8 + Math.sin(Date.now() / 200) * 3;
            const isIFrames = this.iFramesTimer > 0 && this.powerUpTimers.invincibility <= 0;
            const alpha = this.powerUpTimers.invincibility > 0 ? (this.powerUpTimers.invincibility % 60 < 30 ? 0.9 : 0.5) : (isIFrames ? (this.iFramesTimer % 8 < 4 ? 0.6 : 0.2) : 0.8);
            ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`;
            ctx.fillStyle = `rgba(255, 255, 0, ${alpha / 4})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, shieldRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fill();
        }
    }

    drawActiveCores(ctx, game) {
        if (!game?.cores || Object.keys(game.cores).length === 0) return;

        for (const [coreId, coreData] of Object.entries(game.cores)) {
            if (!coreData.equipped) continue;

            const core = CONFIG.cores?.[coreId];
            if (!core) continue;

            switch (coreId) {
                case 'magnetic':
                    this.drawMagneticCore(ctx);
                    break;
                case 'reflection':
                    this.drawReflectionCore(ctx);
                    break;
                case 'bounce':
                    this.drawBounceCore(ctx);
                    break;
                case 'speed':
                    this.drawSpeedCore(ctx);
                    break;
                case 'resistance':
                    this.drawResistanceCore(ctx);
                    break;
                case 'amplification':
                    this.drawAmplificationCore(ctx);
                    break;
                case 'void':
                    this.drawVoidCore(ctx);
                    break;
            }
        }
    }

    drawActiveWeapons(ctx, game) {
        if (!game?.weapons || Object.keys(game.weapons).length === 0) return;

        for (const [weaponId, weaponData] of Object.entries(game.weapons)) {
            if (!weaponData.equipped) continue;

            const weapon = CONFIG.weapons?.[weaponId];
            if (!weapon) continue;

            switch (weaponId) {
                case 'spike_ring':
                    this.drawSpikeRing(ctx, game);
                    break;
                case 'energy_field':
                    this.drawEnergyField(ctx);
                    break;
                case 'orbital_shield':
                    this.drawOrbitalShield(ctx);
                    break;
                case 'pulse_wave':
                    this.drawPulseWave(ctx);
                    break;
                case 'void_blade':
                    this.drawVoidBlade(ctx);
                    break;
                case 'crystal_barrier':
                    this.drawCrystalBarrier(ctx);
                    break;
            }
        }
    }

    drawMagneticCore(ctx) {
        const time = Date.now() / 1000;
        const radius = this.stats.radius + 12;

        ctx.save();

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time * 3;
            const particleRadius = radius + Math.sin(time * 4 + i) * 5;
            const x = this.x + Math.cos(angle) * particleRadius;
            const y = this.y + Math.sin(angle) * particleRadius;

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 6);
            gradient.addColorStop(0, 'rgba(74, 144, 226, 1)');
            gradient.addColorStop(0.5, 'rgba(74, 144, 226, 0.6)');
            gradient.addColorStop(1, 'rgba(74, 144, 226, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        for (let i = 0; i < 3; i++) {
            const ringRadius = radius + i * 8;
            const rotationSpeed = time * (2 + i * 0.5);

            ctx.strokeStyle = `rgba(74, 144, 226, ${0.8 - i * 0.2})`;
            ctx.lineWidth = 3 - i;
            ctx.globalAlpha = 0.9 - i * 0.2;

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(rotationSpeed);

            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
        }

        const pulseRadius = radius + Math.sin(time * 6) * 10;
        const pulseAlpha = 0.3 + Math.sin(time * 6) * 0.2;

        ctx.strokeStyle = `rgba(74, 144, 226, ${pulseAlpha})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    drawReflectionCore(ctx) {
        const time = Date.now() / 1000;
        const radius = this.stats.radius + 10;

        ctx.save();

        const shieldGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, radius);
        shieldGradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
        shieldGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.4)');
        shieldGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

        ctx.fillStyle = shieldGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time * 2;
            const prismRadius = radius * 0.7;
            const x = this.x + Math.cos(angle) * prismRadius;
            const y = this.y + Math.sin(angle) * prismRadius;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle + time * 3);

            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.moveTo(0, -6);
            ctx.lineTo(-4, 4);
            ctx.lineTo(4, 4);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + time * 1.5;
            const rayLength = 15 + Math.sin(time * 4 + i) * 5;
            const x1 = this.x + Math.cos(angle) * radius;
            const y1 = this.y + Math.sin(angle) * radius;
            const x2 = this.x + Math.cos(angle) * (radius + rayLength);
            const y2 = this.y + Math.sin(angle) * (radius + rayLength);

            ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 + Math.sin(time * 4 + i) * 0.4})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + time * 4;
            const sparkRadius = radius + Math.sin(time * 6 + i) * 8;
            const x = this.x + Math.cos(angle) * sparkRadius;
            const y = this.y + Math.sin(angle) * sparkRadius;

            const sparkGradient = ctx.createRadialGradient(x, y, 0, x, y, 4);
            sparkGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            sparkGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.8)');
            sparkGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

            ctx.fillStyle = sparkGradient;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    drawBounceCore(ctx) {
        const time = Date.now() / 1000;
        const radius = this.stats.radius + 10;

        ctx.save();
        ctx.fillStyle = '#FF6B35';
        ctx.globalAlpha = 0.8;

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time;
            const x = this.x + Math.cos(angle) * radius;
            const y = this.y + Math.sin(angle) * radius;

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    drawSpeedCore(ctx) {
        const time = Date.now() / 1000;
        const radius = this.stats.radius + 8;

        ctx.save();

        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + time * 8;
            const particleRadius = radius + Math.sin(time * 6 + i) * 8;
            const x = this.x + Math.cos(angle) * particleRadius;
            const y = this.y + Math.sin(angle) * particleRadius;

            const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, 4);
            particleGradient.addColorStop(0, 'rgba(0, 255, 255, 1)');
            particleGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.6)');
            particleGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

            ctx.fillStyle = particleGradient;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        for (let i = 0; i < 4; i++) {
            const offset = (i / 4) * Math.PI * 2 + time * 6;
            const sciaRadius = radius + i * 6;
            const alpha = 0.8 - i * 0.15;

            ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
            ctx.lineWidth = 3 - i * 0.5;
            ctx.globalAlpha = alpha;

            ctx.beginPath();
            ctx.arc(this.x, this.y, sciaRadius, offset, offset + Math.PI * 1.5);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(this.x, this.y, sciaRadius * 0.7, offset + Math.PI, offset + Math.PI * 2.5);
            ctx.stroke();
        }

        for (let i = 0; i < 3; i++) {
            const shockRadius = radius + 15 + i * 8 + Math.sin(time * 8 + i) * 5;
            const shockAlpha = 0.4 - i * 0.1;

            ctx.strokeStyle = `rgba(0, 255, 255, ${shockAlpha})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 5]);
            ctx.beginPath();
            ctx.arc(this.x, this.y, shockRadius, 0, Math.PI * 2);
            ctx.stroke();
        }

        const speedFieldRadius = radius + Math.sin(time * 10) * 12;
        const speedFieldAlpha = 0.2 + Math.sin(time * 10) * 0.1;

        ctx.setLineDash([]);
        ctx.strokeStyle = `rgba(0, 255, 255, ${speedFieldAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, speedFieldRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    drawResistanceCore(ctx) {
        const radius = this.stats.radius + 12;

        ctx.save();
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.7;

        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#A0522D';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    drawAmplificationCore(ctx) {
        const time = Date.now() / 1000;
        const radius = this.stats.radius + 8;

        ctx.save();
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, radius);
        gradient.addColorStop(0, 'rgba(255, 69, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 + time * 2;
            const x = this.x + Math.cos(angle) * radius * 0.6;
            const y = this.y + Math.sin(angle) * radius * 0.6;

            ctx.fillStyle = '#FF4500';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    drawVoidCore(ctx) {
        const time = Date.now() / 1000;
        const radius = this.stats.radius + 15;

        ctx.save();
        ctx.strokeStyle = '#8A2BE2';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.9;

        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(time * -1.5);
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + time * 3;
            const x = this.x + Math.cos(angle) * radius * 0.8;
            const y = this.y + Math.sin(angle) * radius * 0.8;

            ctx.fillStyle = '#8A2BE2';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    drawSpikeRing(ctx, game) {
        const time = Date.now() / 1000;
        const radius = this.stats.radius + 25;

        ctx.save();

        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        let spikeCount = 3;
        if (game?.weapons?.spike_ring) {
            const level = game.weapons.spike_ring.level || 1;
            spikeCount = level === 1 ? 3 : level === 2 ? 7 : 10;
        }

        for (let i = 0; i < spikeCount; i++) {
            const angle = (i / spikeCount) * Math.PI * 2 + time * 2;
            const spikeRadius = radius + Math.sin(time * 4 + i) * 3;
            const x = this.x + Math.cos(angle) * spikeRadius;
            const y = this.y + Math.sin(angle) * spikeRadius;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle + time * 3);

            const spikeGradient = ctx.createLinearGradient(0, -12, 0, 12);
            spikeGradient.addColorStop(0, '#8B4513');
            spikeGradient.addColorStop(0.5, '#A0522D');
            spikeGradient.addColorStop(1, '#8B4513');

            ctx.fillStyle = spikeGradient;
            ctx.globalAlpha = 0.9;

            ctx.beginPath();
            ctx.moveTo(0, -12);
            ctx.lineTo(-6, 0);
            ctx.lineTo(-3, 8);
            ctx.lineTo(3, 8);
            ctx.lineTo(6, 0);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        }

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time * 4;
            const particleRadius = radius * 0.6;
            const x = this.x + Math.cos(angle) * particleRadius;
            const y = this.y + Math.sin(angle) * particleRadius;

            const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, 3);
            particleGradient.addColorStop(0, 'rgba(139, 69, 19, 1)');
            particleGradient.addColorStop(0.5, 'rgba(160, 82, 45, 0.8)');
            particleGradient.addColorStop(1, 'rgba(139, 69, 19, 0)');

            ctx.fillStyle = particleGradient;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        const forceFieldRadius = radius + Math.sin(time * 6) * 8;
        const forceFieldAlpha = 0.3 + Math.sin(time * 6) * 0.2;

        ctx.strokeStyle = `rgba(139, 69, 19, ${forceFieldAlpha})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(this.x, this.y, forceFieldRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    drawEnergyField(ctx) {
        const time = Date.now() / 1000;
        const radius = this.stats.radius + 30;

        ctx.save();

        const fieldGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, radius);
        fieldGradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
        fieldGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.4)');
        fieldGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

        ctx.fillStyle = fieldGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fill();

        const borderRadius = radius + Math.sin(time * 8) * 5;
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(this.x, this.y, borderRadius, 0, Math.PI * 2);
        ctx.stroke();

        for (let i = 0; i < 4; i++) {
            const waveRadius = radius + i * 8 + Math.sin(time * 3 + i) * 6;
            const waveAlpha = 0.6 - i * 0.15;

            ctx.strokeStyle = `rgba(0, 255, 255, ${waveAlpha})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 5]);
            ctx.beginPath();
            ctx.arc(this.x, this.y, waveRadius, 0, Math.PI * 2);
            ctx.stroke();
        }

        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + time * 5;
            const particleRadius = radius * 0.7 + Math.sin(time * 4 + i) * 10;
            const x = this.x + Math.cos(angle) * particleRadius;
            const y = this.y + Math.sin(angle) * particleRadius;

            const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, 5);
            particleGradient.addColorStop(0, 'rgba(0, 255, 255, 1)');
            particleGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.6)');
            particleGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

            ctx.fillStyle = particleGradient;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + time * 2;
            const lightningLength = 20 + Math.sin(time * 6 + i) * 10;
            const x1 = this.x + Math.cos(angle) * radius;
            const y1 = this.y + Math.sin(angle) * radius;
            const x2 = this.x + Math.cos(angle) * (radius + lightningLength);
            const y2 = this.y + Math.sin(angle) * (radius + lightningLength);

            ctx.strokeStyle = `rgba(0, 255, 255, ${0.8 + Math.sin(time * 8 + i) * 0.2})`;
            ctx.lineWidth = 3;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        const coreRadius = 8 + Math.sin(time * 10) * 3;
        const coreGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, coreRadius);
        coreGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        coreGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.8)');
        coreGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, coreRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawOrbitalShield(ctx) {
        // Scudi orbitali - compatibilità
    }

    drawPulseWave(ctx) {
        const time = Date.now() / 1000;
        const radius = this.stats.radius + 30;

        ctx.save();
        ctx.strokeStyle = '#FF1493';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.7;

        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        for (let i = 1; i <= 2; i++) {
            const waveRadius = radius + i * 10;
            ctx.globalAlpha = 0.5 - i * 0.2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, waveRadius, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawVoidBlade(ctx) {
        const time = Date.now() / 1000;
        const radius = this.stats.radius + 12;

        ctx.save();
        ctx.strokeStyle = '#8A2BE2';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;

        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + time * 2;
            const x1 = this.x + Math.cos(angle) * radius;
            const y1 = this.y + Math.sin(angle) * radius;
            const x2 = this.x + Math.cos(angle) * (radius + 12);
            const y2 = this.y + Math.sin(angle) * (radius + 12);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawCrystalBarrier(ctx) {
        const time = Date.now() / 1000;
        const radius = this.stats.radius + 22;

        ctx.save();
        ctx.strokeStyle = '#87CEEB';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.8;

        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = this.x + Math.cos(angle) * radius;
            const y = this.y + Math.sin(angle) * radius;

            ctx.fillStyle = '#87CEEB';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
