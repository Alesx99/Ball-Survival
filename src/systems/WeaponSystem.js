import { CONFIG } from '../config/index.js';
import { Utils } from '../utils/index.js';
import { Orbital } from '../entities/Areas.js';

export const WeaponSystem = {
    applyCoreEffect(coreId) {
        const core = CONFIG.cores[coreId];
        if (!core) return;

        switch (core.effect.type) {
            case 'magnet':
                break;
            case 'reflect':
                this.player.modifiers.reflectChance = (this.player.modifiers.reflectChance || 0) + (core.effect.chance ?? 0);
                break;
            case 'bounce':
                this.player.modifiers.bounceDamage = (this.player.modifiers.bounceDamage || 0) + (core.effect.damage ?? 0);
                break;
            case 'speed':
                this.player.stats.speed += (core.effect.bonus ?? core.effect.speed ?? 0);
                break;
            case 'resistance':
                this.player.stats.dr += (core.effect.dr ?? 0);
                break;
            case 'amplify':
                this.player.modifiers.contactMultiplier = (this.player.modifiers.contactMultiplier || 1) * (core.effect.multiplier ?? 1);
                break;
            case 'void_teleport':
                this.player.voidTeleportConfig = core.effect;
                break;
            case 'crystal':
                this.player.modifiers.reflectChance = (this.player.modifiers.reflectChance || 0) + (core.effect.reflect ?? 0);
                this.player.modifiers.contactMultiplier = (this.player.modifiers.contactMultiplier || 1) * (core.effect.amplify ?? 1);
                break;
            case 'stellar':
                this.player.modifiers.power = (this.player.modifiers.power || 1) * (1 + (core.effect.damage ?? 0));
                break;
            case 'lifesteal':
                this.player.modifiers.lifestealPercent = (this.player.modifiers.lifestealPercent || 0) + (core.effect.percent ?? 0);
                break;
            case 'arcane':
                this.player.modifiers.power = (this.player.modifiers.power || 1) * (1 + (core.effect.damagePercent ?? 0));
                break;
        }
    },

    equipCore(coreId) {
        if (!this.cores[coreId]) return false;

        // Disequipaggia il core attuale
        if (this.arsenal.activeCore) {
            this.cores[this.arsenal.activeCore].equipped = false;
        }

        // Equipaggia il nuovo core
        this.arsenal.activeCore = coreId;
        this.cores[coreId].equipped = true;

        // Applica l'effetto del core
        this.applyCoreEffect(coreId);

        this.notifications.push({
            text: `Core equipaggiato: ${CONFIG.cores[coreId].name}`,
            life: 300,
            color: '#00FF00'
        });

        return true;
    },

    equipWeapon(weaponId) {
        if (!this.weapons[weaponId]) return false;
        if (this.arsenal.activeWeapons.length >= 2) return false;

        this.arsenal.activeWeapons.push(weaponId);
        this.weapons[weaponId].equipped = true;

        this.notifications.push({
            text: `Arma equipaggiata: ${CONFIG.weapons[weaponId].name}`,
            life: 300,
            color: '#00FF00'
        });

        return true;
    },

    unequipWeapon(weaponId) {
        const index = this.arsenal.activeWeapons.indexOf(weaponId);
        if (index === -1) return false;

        this.arsenal.activeWeapons.splice(index, 1);
        this.weapons[weaponId].equipped = false;

        (this.entities.orbitals || []).forEach(o => { if (o.weaponId === weaponId) o.toRemove = true; });

        this.notifications.push({
            text: `Arma rimossa: ${CONFIG.weapons[weaponId].name}`,
            life: 300,
            color: '#FF0000'
        });

        return true;
    },

    applyWeaponEffect(weaponId) {
        const weapon = CONFIG.weapons[weaponId];
        if (!weapon) return;

        // Gli effetti delle armi verranno applicati durante il gameplay
        console.log(`Effetto arma applicato: ${weapon.name}`);
    },

    updateCoreEffects() {
        const coreId = this.arsenal?.activeCore;
        if (!coreId) return;
        const core = CONFIG.cores[coreId];
        if (!core) return;
        const eff = core.effect;

        switch (eff.type) {
            case 'poison':
                this.getEnemiesAndBosses().forEach(e => {
                    if (Utils.getDistance(this.player, e) < this.player.stats.radius + 50) {
                        e.takeDamage((eff.damage ?? 3) / 60, this);
                        e.poisonTimer = (eff.duration ?? 5000) / 16.67;
                        e.poisonDps = eff.damage ?? 3;
                    }
                });
                break;
            case 'fire':
                this.getEnemiesAndBosses().forEach(e => {
                    if (Utils.getDistance(this.player, e) < this.player.stats.radius + 45) {
                        e.takeDamage((eff.damage ?? 5) / 60, this);
                    }
                });
                break;
            case 'frost':
                this.getEnemiesAndBosses().forEach(e => {
                    if (Utils.getDistance(this.player, e) < this.player.stats.radius + 50) {
                        e.takeDamage((eff.damage ?? 4) / 60, this);
                        e.slowAmount = eff.slow ?? 0.2;
                        e.slowTimer = 60;
                    }
                });
                break;
            case 'volcanic':
                if (!this.player.lastVolcanicTime) this.player.lastVolcanicTime = 0;
                if (Date.now() - this.player.lastVolcanicTime > (eff.cooldown ?? 4000)) {
                    this.createExplosion(this.player.x, this.player.y, eff.knockback ?? 25, eff.damage ?? 8);
                    this.player.lastVolcanicTime = Date.now();
                }
                break;
            case 'storm':
                if (!this.player.lastStormTime) this.player.lastStormTime = 0;
                if (Date.now() - this.player.lastStormTime > (eff.cooldown ?? 3500)) {
                    const enemies = this.getEnemiesAndBosses().filter(e => Utils.getDistance(this.player, e) < (eff.radius ?? 180));
                    const target = enemies[Math.floor(Math.random() * enemies.length)] || enemies[0];
                    if (target) target.takeDamage(this.getDamage?.(eff.damage ?? 12) ?? eff.damage, this);
                    this.player.lastStormTime = Date.now();
                }
                break;
            case 'gravity':
                this.getEnemiesAndBosses().forEach(e => {
                    const d = Utils.getDistance(this.player, e);
                    if (d < (eff.radius ?? 120) && d > 5) {
                        e.slowAmount = eff.slow ?? 0.25;
                        e.slowTimer = 30;
                        const dx = (this.player.x - e.x) / d * (eff.pullStrength ?? 0.03);
                        const dy = (this.player.y - e.y) / d * (eff.pullStrength ?? 0.03);
                        e.x += dx * 60;
                        e.y += dy * 60;
                    }
                });
                break;
            case 'stellar':
                if (!this.player.lastStellarRegen) this.player.lastStellarRegen = 0;
                if (Date.now() - this.player.lastStellarRegen > (eff.interval ?? 3000)) {
                    this.player.hp = Math.min(this.player.stats.maxHp, this.player.hp + (eff.regen ?? 1));
                    this.player.lastStellarRegen = Date.now();
                }
                break;
        }
    },

    updateWeaponEffects() {
        this.updateCoreEffects();

        if (!this.arsenal.activeWeapons || this.arsenal.activeWeapons.length === 0) return;

        for (const weaponId of this.arsenal.activeWeapons) {
            const weapon = CONFIG.weapons[weaponId];
            const weaponData = this.weapons[weaponId];
            if (!weapon || !weaponData) continue;

            // Calcola i valori basati sul livello dell'arma
            const level = weaponData.level || 1;
            let damage = weapon.effect.damage;
            let count = weapon.effect.count || 1;
            let slow = weapon.effect.slow || 0;
            let radius = weapon.effect.radius || 25;

            // Progressione basata sul livello
            const baseDmg = weapon.effect.damage ?? 8;
            switch (weaponId) {
                case 'iron_spikes':
                case 'spike_ring':
                    count = level === 1 ? 4 : level === 2 ? 6 : 8;
                    damage = baseDmg + (level - 1) * 3;
                    radius = weapon.effect.radius ?? 30;
                    break;
                case 'frost_field':
                case 'energy_field':
                    damage = baseDmg + (level - 1) * 2;
                    slow = (weapon.effect.slow ?? 0.2) + (level - 1) * 0.05;
                    radius = (weapon.effect.radius ?? 40) + (level - 1) * 5;
                    break;
                case 'orbital_blades':
                    count = 4 + (level - 1);
                    damage = baseDmg + (level - 1) * 4;
                    radius = weapon.effect.radius ?? 35;
                    break;
                case 'thorn_shield':
                    damage = baseDmg + (level - 1) * 4;
                    radius = weapon.effect.radius ?? 28;
                    break;
                case 'corrosive_mist':
                    damage = baseDmg + (level - 1) * 3;
                    radius = (weapon.effect.radius ?? 55) + (level - 1) * 8;
                    break;
                case 'arcane_lightning':
                    damage = baseDmg + (level - 1) * 5;
                    break;
                case 'void_blade':
                    count = 3 + (level - 1) * 2;
                    damage = 12 + (level - 1) * 3;
                    slow = 0.2 + (level - 1) * 0.05;
                    radius = 35;
                    break;
                case 'stellar_pulse':
                case 'pulse_wave':
                    damage = baseDmg + (level - 1) * 5;
                    break;
                case 'steel_barrier':
                case 'crystal_barrier':
                    radius = 30;
                    break;
                case 'ice_shards':
                    count = 5 + (level - 1) * 2;
                    damage = baseDmg + (level - 1) * 3;
                    slow = (weapon.effect.slow ?? 0.25) + (level - 1) * 0.03;
                    radius = 35;
                    break;
                case 'fire_ring':
                case 'obsidian_blade':
                case 'poison_vines':
                default:
                    if (!radius) radius = weapon.effect.radius ?? 35;
                    if (weapon.effect.count) count = weapon.effect.count + (level - 1);
                    damage = baseDmg + (level - 1) * (weapon.effect.damage ? 0 : 2);
                    break;
            }

            switch (weapon.effect.type) {
                case 'spikes':
                    this.getEnemiesAndBosses().forEach(enemy => {
                        if (Utils.getDistance(this.player, enemy) < this.player.stats.radius + radius) {
                            enemy.takeDamage(this.getDamage?.(damage) ?? damage, this);
                        }
                    });
                    break;

                case 'field':
                case 'frost_field':
                    this.getEnemiesAndBosses().forEach(enemy => {
                        if (Utils.getDistance(this.player, enemy) < radius) {
                            enemy.takeDamage((this.getDamage?.(damage) ?? damage) / 60, this);
                            enemy.slowAmount = slow || 0.2;
                            enemy.slowTimer = 60;
                        }
                    });
                    break;

                case 'fire_ring':
                    this.getEnemiesAndBosses().forEach(enemy => {
                        if (Utils.getDistance(this.player, enemy) < radius) {
                            enemy.takeDamage((this.getDamage?.(damage) ?? damage) / 60, this);
                        }
                    });
                    break;

                case 'poison_vines':
                    this.getEnemiesAndBosses().forEach(enemy => {
                        if (Utils.getDistance(this.player, enemy) < radius) {
                            enemy.takeDamage((this.getDamage?.(damage) ?? damage) / 60, this);
                            enemy.poisonDps = damage;
                            enemy.poisonTimer = (weapon.effect.duration ?? 4000) / 16.67;
                        }
                    });
                    break;

                case 'ice_shards':
                    this.getEnemiesAndBosses().forEach(enemy => {
                        if (Utils.getDistance(this.player, enemy) < this.player.stats.radius + radius) {
                            enemy.takeDamage((this.getDamage?.(damage) ?? damage) / 60, this);
                            enemy.slowAmount = slow || 0.25;
                            enemy.slowTimer = 60;
                        }
                    });
                    break;

                case 'orbital':
                case 'orbital_blades':
                    const orbitals = this.entities.orbitals || [];
                    const mine = orbitals.filter(o => o.weaponId === weaponId);
                    if (mine.length < count) {
                        const idx = mine.length;
                        const orb = new Orbital(this.player.x, this.player.y, {
                            angle: (idx / count) * Math.PI * 2 + Date.now() / 500,
                            distance: Math.max(30, (radius || 35) - 5),
                            rotationSpeed: 0.08,
                            damage: (this.getDamage?.(damage) ?? damage),
                            radius: 10,
                            weaponId
                        });
                        this.addEntity('orbitals', orb);
                    }
                    break;

                case 'pulse':
                case 'stellar_pulse':
                    if (!this.player.lastPulseTime) this.player.lastPulseTime = 0;
                    const cd = weapon.effect.cooldown ?? 4000;
                    if (Date.now() - this.player.lastPulseTime > cd) {
                        this.createExplosion(this.player.x, this.player.y, weapon.effect.knockback ?? 30, this.getDamage?.(damage) ?? damage);
                        this.player.lastPulseTime = Date.now();
                    }
                    break;

                case 'void_blade':
                    this.getEnemiesAndBosses().forEach(enemy => {
                        if (Utils.getDistance(this.player, enemy) < this.player.stats.radius + 35) {
                            enemy.takeDamage((this.getDamage?.(damage) ?? damage) / 60, this);
                            enemy.slowAmount = slow || 0.25;
                            enemy.slowTimer = (weapon.effect.duration ?? 4000) / 16.67;
                        }
                    });
                    break;

                case 'barrier':
                case 'crystal_barrier':
                    const blockChance = weapon.effect.blockChance ?? weapon.effect.reflectPercent ?? 0.5;
                    const reflDmg = weapon.effect.reflectDamage ?? damage;
                    (this.entities.enemyProjectiles || []).forEach(proj => {
                        if (Utils.getDistance(this.player, proj) < this.player.stats.radius + 30) {
                            if (Math.random() < blockChance) {
                                proj.toRemove = true;
                                const nearest = Utils.findNearest(this.player, this.getEnemiesAndBosses());
                                if (nearest) nearest.takeDamage(this.getDamage?.(reflDmg) ?? reflDmg, this);
                            }
                        }
                    });
                    break;

                case 'thorn_shield':
                    this.getEnemiesAndBosses().forEach(enemy => {
                        if (Utils.getDistance(this.player, enemy) < this.player.stats.radius + radius) {
                            enemy.takeDamage(this.getDamage?.(damage) ?? damage, this);
                        }
                    });
                    (this.entities.enemyProjectiles || []).forEach(proj => {
                        if (Utils.getDistance(this.player, proj) < this.player.stats.radius + 25) {
                            if (Math.random() < (weapon.effect.reflectPercent ?? 0.2)) {
                                proj.toRemove = true;
                                const nearest = Utils.findNearest(this.player, this.getEnemiesAndBosses());
                                if (nearest) nearest.takeDamage(this.getDamage?.(damage) ?? damage, this);
                            }
                        }
                    });
                    break;

                case 'corrosive_mist':
                    this.getEnemiesAndBosses().forEach(enemy => {
                        if (Utils.getDistance(this.player, enemy) < radius) {
                            enemy.takeDamage((this.getDamage?.(damage) ?? damage) / 60, this);
                            enemy.poisonDps = damage;
                            enemy.poisonTimer = (weapon.effect.duration ?? 3000) / 16.67;
                        }
                    });
                    break;

                case 'arcane_lightning':
                    if (!this.player.lastArcaneLightning) this.player.lastArcaneLightning = 0;
                    if (Date.now() - this.player.lastArcaneLightning > 2000) {
                        const bounces = weapon.effect.bounces ?? 4;
                        let chain = Utils.findNearest(this.player, this.getEnemiesAndBosses());
                        const hit = new Set();
                        for (let b = 0; b < bounces && chain; b++) {
                            if (hit.has(chain)) break;
                            hit.add(chain);
                            chain.takeDamage(this.getDamage?.(damage) ?? damage, this);
                            const next = this.getEnemiesAndBosses()
                                .filter(e => !hit.has(e) && Utils.getDistance(chain, e) < 100)
                                .sort((a, b) => Utils.getDistance(chain, a) - Utils.getDistance(chain, b))[0];
                            chain = next;
                        }
                        this.player.lastArcaneLightning = Date.now();
                    }
                    break;

                case 'obsidian_blade':
                    this.getEnemiesAndBosses().forEach(enemy => {
                        if (Utils.getDistance(this.player, enemy) < this.player.stats.radius + 40) {
                            enemy.takeDamage((this.getDamage?.(damage) ?? damage) / 60, this);
                        }
                    });
                    break;

                case 'shadow_cloak':
                    break;
            }
        }
    },

    unequipCore(coreId) {
        if (this.arsenal.activeCore !== coreId) return false;

        this.arsenal.activeCore = null;
        this.cores[coreId].equipped = false;

        this.notifications.push({
            text: `Core rimosso: ${CONFIG.cores[coreId].name}`,
            life: 300,
            color: '#FF0000'
        });

        return true;
    }
};
