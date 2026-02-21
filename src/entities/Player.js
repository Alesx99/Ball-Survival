/**
 * Player class - main player entity
 * ES module version
 * @module entities/Player
 */

import { Entity } from './Entity.js';
import { CONFIG } from '../config/index.js';
import { Utils } from '../utils/index.js';
import { coreDrawers, weaponDrawers } from './PlayerVisuals.js';

export class Player extends Entity {
    constructor() {
        super(CONFIG.world.width / 2, CONFIG.world.height / 2);
        const baseStats = { ...CONFIG.player.base, maxHp: CONFIG.player.base.hp };
        this.baseStats = baseStats;
        this.keys = {};
        this._trail = [];
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
                case 'prism':
                    this.modifiers.power *= 1.25;
                    this.modifiers.area *= 1.20;
                    this.stats.maxHp = Math.floor(this.stats.maxHp * 0.75);
                    this.stats.speed *= 0.90;
                    this._prismExtraSpellLevels = 1; // +1 livello max a tutte le spell
                    break;
                case 'unstable':
                    this.modifiers.power *= 1.40;
                    this.stats.maxHp = Math.floor(this.stats.maxHp * 0.70);
                    this._explosionTimer = 0;
                    this._explosionInterval = 1800; // Ogni 30 secondi (1800 frame a 60fps)
                    this._selfDamageTimer = 0;
                    this._selfDamageInterval = 2700; // 5 danni ogni 45 secondi
                    this._selfDamageAmount = 5;
                    break;
                case 'druid':
                    this.stats.maxHp = Math.floor(this.stats.maxHp * 1.15);
                    this.modifiers.frequency *= 1.20; // -20% velocità d'attacco (freq più alta = più lento)
                    this._druidRegenRate = 2; // 2 HP/sec
                    this._druidDotDurationBonus = 0.50; // +50% durata DoT
                    break;
                case 'phantom':
                    this.stats.speed *= 1.50;
                    this.stats.maxHp = Math.floor(this.stats.maxHp * 0.60);
                    this._phantomPassthrough = true; // Attraversa nemici
                    this._phantomShieldBlock = true; // Non può usare Shield
                    this._phantomImmunityDuration = 30; // 0.5s di immunità (30 frame)
                    this._phantomImmunityCooldown = 300; // Ogni 5s (300 frame)
                    this._phantomImmunityTimer = 0;
                    this._phantomImmuneActive = false;
                    break;
            }
        }

        this.hp = this.stats.maxHp;
        this._trail = [];

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

        if ((fDx !== 0 || fDy !== 0) && this.stats.speed > 0.5) {
            if (!this._trail) this._trail = [];
            this._trail.unshift({ x: this.x, y: this.y });
            if (this._trail.length > 12) this._trail.pop();
        }

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

        // Druido: rigenerazione HP passiva
        if (this._druidRegenRate && this.hp < this.stats.maxHp) {
            this.hp = Math.min(this.stats.maxHp, this.hp + this._druidRegenRate / 60);
        }

        // Instabile: esplosione periodica (ogni 30s)
        if (this._explosionInterval) {
            this._explosionTimer = (this._explosionTimer || 0) + 1;
            if (this._explosionTimer >= this._explosionInterval && game) {
                this._explosionTimer = 0;
                const explosionRadius = 120;
                const explosionDamage = 30 * this.modifiers.power;
                const enemies = [...(game.entities?.enemies || []), ...(game.entities?.bosses || [])];
                enemies.forEach(enemy => {
                    if (Utils.getDistance(this, enemy) < explosionRadius) {
                        enemy.takeDamage(explosionDamage, game);
                    }
                });
                const EffectClass = game._entityClasses?.Effect;
                if (EffectClass) {
                    game.addEntity('effects', new EffectClass(this.x, this.y, {
                        type: 'level_up_burst', maxRadius: explosionRadius, life: 20, initialLife: 20
                    }));
                }
                game.notifications?.push({ text: 'Esplosione Instabile!', life: 90, color: '#ff1744' });
            }
        }

        // Instabile: autolesionismo (5 danni ogni 45s)
        if (this._selfDamageInterval) {
            this._selfDamageTimer = (this._selfDamageTimer || 0) + 1;
            if (this._selfDamageTimer >= this._selfDamageInterval) {
                this._selfDamageTimer = 0;
                this.hp -= this._selfDamageAmount;
                if (game) {
                    game.notifications?.push({ text: 'Instabilità!', life: 60, color: '#ff6b6b' });
                    if (this.hp <= 0) game.gameOver?.();
                }
            }
        }

        // Fantasma: immunità ciclica (0.5s ogni 5s)
        if (this._phantomImmunityCooldown) {
            this._phantomImmunityTimer = (this._phantomImmunityTimer || 0) + 1;
            if (this._phantomImmuneActive) {
                // Fase attiva: immunità in corso
                if (this._phantomImmunityTimer >= this._phantomImmunityDuration) {
                    this._phantomImmuneActive = false;
                    this._phantomImmunityTimer = 0;
                }
            } else {
                // Fase cooldown: aspetta il prossimo ciclo
                if (this._phantomImmunityTimer >= this._phantomImmunityCooldown) {
                    this._phantomImmuneActive = true;
                    this._phantomImmunityTimer = 0;
                }
            }
        }
    }

    gainXP(amount) {
        const gain = amount * this.modifiers.xpGain;
        if (!Number.isFinite(gain)) return; // Protegge da NaN/Infinity
        this.xp += gain;
        // Auto-heal: se xp è già corrotto, resettalo
        if (!Number.isFinite(this.xp)) {
            console.warn('XP corrotto, reset a 0');
            this.xp = 0;
        }
    }

    levelUp(game) {
        this.level++;
        this.xp = Math.max(0, this.xp - this.xpNext);
        const c = CONFIG.player.xpCurve;
        const baseXP = c.base * Math.pow(c.growth, this.level - 1);
        const levelXP = c.levelFactor * this.level;
        this.xpNext = Math.max(1, Math.floor(baseXP + levelXP));

        // Protezione da valori corrotti
        if (!Number.isFinite(this.xp)) this.xp = 0;
        if (!Number.isFinite(this.xpNext) || this.xpNext <= 0) this.xpNext = 1;

        this.hp = this.stats.maxHp;
        this.powerUpTimers.invincibility = 60;
        game?.audio?.playLevelUp();
    }

    takeDamage(amount, game, sourceEnemy = null) {
        const shieldSpell = game?.spells?.shield;
        // Scudo base/orbitale: blocca solo il PRIMO colpo, poi si consuma (evita immortalità)
        if (shieldSpell && shieldSpell.active && shieldSpell.evolution !== 'reflect') {
            shieldSpell.active = false;
            return;
        }
        if (this.powerUpTimers.invincibility > 0 || this.iFramesTimer > 0) return;

        // Fantasma: immunità ciclica (0.5s ogni 5s)
        if (this._phantomImmuneActive) {
            game?.notifications?.push({ text: 'Fase spettrale!', life: 40, color: '#b0bec5' });
            return;
        }

        // Fantasma: non può usare Shield (lo scudo non blocca)
        // Nota: il blocco dello Shield è gestito separatamente nel cast

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
        // Reset no-damage timer per achievement
        if (game?.stats) game.stats.noDamageTimer = 0;
        game?.audio?.playDamage();
        game?.addScreenShake?.(10);
        if (!CONFIG.accessibility?.reduceMotion) game.hitFlashTimer = CONFIG.effects?.hitFlashFrames ?? 10;
        this.iFramesTimer = Math.ceil((CONFIG.player.iFramesDuration ?? 0.8) * 60);
        if (this.hp <= 0 && game) {
            if (game.metaProgressionSystem?.onPlayerDeath(this)) {
                // Il sistema ha annullato la morte (es. revive)
                return;
            }
            game.gameOver?.();
        }
    }

    draw(ctx, game) {
        // Skin system override
        const skinColor = game?.skinSystem?.getSkinColor(game.totalElapsedTime);
        const trailColor = skinColor || this.archetype?.color || '#4488ff';
        if (!CONFIG.accessibility?.reduceMotion && this._trail && this._trail.length > 0) {
            const hex = trailColor.startsWith('#') ? trailColor : '#4488ff';
            const rs = parseInt(hex.slice(1, 3), 16);
            const gs = parseInt(hex.slice(3, 5), 16);
            const bs = parseInt(hex.slice(5, 7), 16);
            this._trail.forEach((p, i) => {
                const alpha = (1 - i / this._trail.length) * 0.35;
                const rad = this.stats.radius * (0.6 + (i / this._trail.length) * 0.4);
                ctx.fillStyle = `rgba(${rs},${gs},${bs},${alpha})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
                ctx.fill();
            });
        }
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
            if (!coreData.equipped || !CONFIG.cores?.[coreId]) continue;
            coreDrawers[coreId]?.(ctx, this);
        }
    }

    drawActiveWeapons(ctx, game) {
        if (!game?.weapons || Object.keys(game.weapons).length === 0) return;
        for (const [weaponId, weaponData] of Object.entries(game.weapons)) {
            if (!weaponData.equipped || !CONFIG.weapons?.[weaponId]) continue;
            weaponDrawers[weaponId]?.(ctx, this, game);
        }
    }

}
