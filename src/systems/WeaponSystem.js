import { CONFIG } from '../config/index.js';
import { Utils } from '../utils/index.js';
import { Orbital } from '../entities/Areas.js';

export const WeaponSystem = {
    applyCoreEffect(coreId) {
        const core = CONFIG.cores[coreId];
        if (!core) return;

        switch (core.effect.type) {
            case 'magnet':
                // Il core magnetico è già implementato nel MaterialOrb
                break;
            case 'reflect':
                this.player.modifiers.reflectChance = (this.player.modifiers.reflectChance || 0) + core.effect.chance;
                break;
            case 'bounce':
                this.player.modifiers.bounceDamage = (this.player.modifiers.bounceDamage || 0) + core.effect.damage;
                break;
            case 'speed':
                this.player.stats.speed += core.effect.bonus;
                break;
            case 'resistance':
                this.player.stats.dr += core.effect.dr;
                break;
            case 'amplify':
                this.player.modifiers.contactMultiplier = (this.player.modifiers.contactMultiplier || 1) * core.effect.multiplier;
                break;
            case 'void_teleport':
                // Il teletrasporto viene gestito nel metodo update del player
                this.player.voidTeleportConfig = core.effect;
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

    updateWeaponEffects() {
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
            switch (weaponId) {
                case 'spike_ring':
                    // Progressione spine: 3 -> 7 -> 10
                    count = level === 1 ? 3 : level === 2 ? 7 : 10;
                    damage = 8 + (level - 1) * 2; // 8 -> 10 -> 12
                    break;

                case 'energy_field':
                    // Progressione DPS: 4 -> 6 -> 8
                    damage = 4 + (level - 1) * 2;
                    slow = 0.15 + (level - 1) * 0.05; // 15% -> 20% -> 25%
                    break;

                case 'orbital_shield':
                    // Progressione scudi: 1 -> 2 -> 3
                    count = level;
                    damage = 8 + (level - 1) * 3; // 8 -> 11 -> 14
                    break;

                case 'void_blade':
                    // Progressione lame: 3 -> 5 -> 7
                    count = 3 + (level - 1) * 2;
                    damage = 12 + (level - 1) * 3; // 12 -> 15 -> 18
                    slow = 0.2 + (level - 1) * 0.05; // 20% -> 25% -> 30%
                    break;

                case 'pulse_wave':
                    // Progressione danno: 15 -> 20 -> 25
                    damage = 15 + (level - 1) * 5;
                    break;

                case 'crystal_barrier':
                    // Progressione blocco: 60% -> 70% -> 80%
                    const blockChance = 0.6 + (level - 1) * 0.1;
                    const reflectDamage = 10 + (level - 1) * 3; // 10 -> 13 -> 16
                    break;
            }

            switch (weapon.effect.type) {
                case 'spikes':
                    // Danno da contatto con spine
                    [...this.entities.enemies, ...this.entities.bosses].forEach(enemy => {
                        const dist = Utils.getDistance(this.player, enemy);
                        if (dist < this.player.stats.radius + radius) {
                            enemy.takeDamage(damage, this);
                        }
                    });
                    break;

                case 'field':
                    // Campo energetico che rallenta e danneggia
                    [...this.entities.enemies, ...this.entities.bosses].forEach(enemy => {
                        const dist = Utils.getDistance(this.player, enemy);
                        if (dist < radius) {
                            enemy.takeDamage(damage / 60, this); // DPS
                            enemy.slowAmount = slow;
                            enemy.slowTimer = 60; // 1 secondo
                        }
                    });
                    break;

                case 'orbital':
                    // Scudi orbitali
                    if (!this.player.orbitals) this.player.orbitals = [];
                    if (this.player.orbitals.length < count) {
                        const angle = (this.player.orbitals.length / count) * Math.PI * 2;
                        this.addEntity('orbitals', new Orbital(this.player.x, this.player.y, {
                            angle: angle,
                            distance: 40,
                            rotationSpeed: 0.05,
                            damage: damage,
                            radius: 8
                        }));
                    }
                    break;

                case 'pulse':
                    // Onda pulsante (una volta ogni cooldown)
                    if (!this.player.lastPulseTime) this.player.lastPulseTime = 0;
                    if (Date.now() - this.player.lastPulseTime > weapon.effect.cooldown) {
                        this.createExplosion(this.player.x, this.player.y, weapon.effect.knockback, damage);
                        this.player.lastPulseTime = Date.now();
                    }
                    break;

                case 'void_blade':
                    // Lame del vuoto che rallentano
                    [...this.entities.enemies, ...this.entities.bosses].forEach(enemy => {
                        const dist = Utils.getDistance(this.player, enemy);
                        if (dist < this.player.stats.radius + 35) {
                            enemy.takeDamage(damage / 60, this); // DPS
                            enemy.slowAmount = slow;
                            enemy.slowTimer = weapon.effect.duration / 16.67; // Converti ms in frame
                        }
                    });
                    break;

                case 'crystal_barrier':
                    // Barriera di cristallo che blocca proiettili
                    this.entities.enemyProjectiles.forEach(proj => {
                        const dist = Utils.getDistance(this.player, proj);
                        if (dist < this.player.stats.radius + 25) {
                            if (Math.random() < weapon.effect.blockChance) {
                                proj.toRemove = true;
                                // Riflette danno al nemico più vicino
                                const nearestEnemy = Utils.findNearest(this.player, [...this.entities.enemies, ...this.entities.bosses]);
                                if (nearestEnemy) {
                                    nearestEnemy.takeDamage(weapon.effect.reflectDamage, this);
                                }
                            }
                        }
                    });
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
