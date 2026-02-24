import { CONFIG } from '../config/index.js';
import { Effect } from '../entities/Particles.js';

export const ProgressionSystem = {
    /** Returns Set of archetype ids unlocked (persisted + affordable from CONFIG costs) */
    getUnlockedArchetypes() {
        const totalGems = this.totalGems ?? 0;
        const set = new Set(this.unlockedArchetypes || []);
        for (const key in CONFIG.characterArchetypes) {
            const a = CONFIG.characterArchetypes[key];
            if (a.cost === 0 || totalGems >= a.cost) set.add(a.id);
        }
        return set;
    },

    checkForLevelUp() {
        if (this.state !== 'running') return;

        // Controlli di sicurezza per evitare loop infiniti
        let levelUpCount = 0;
        const maxLevelUpsPerFrame = 10; // Limite di sicurezza

        while (this.player.xp >= this.player.xpNext && this.player.xpNext > 0 && levelUpCount < maxLevelUpsPerFrame) {
            this.handleLevelUp();
            levelUpCount++;
        }

        // Se abbiamo raggiunto il limite, log per debug
        if (levelUpCount >= maxLevelUpsPerFrame) {
            console.warn(`Troppi level up in un frame! XP: ${this.player.xp}, XP necessario: ${this.player.xpNext}`);
        }
    },

    handleLevelUp() {
        this.player.levelUp(this);
        this.addEntity('effects', new Effect(this.player.x, this.player.y, { type: 'level_up_burst', maxRadius: 60, life: 30, initialLife: 30 }));
        this.notifications.push({ text: "Scudo temporaneo attivato!", life: 120 });
        this.populateUpgradeMenu();
        this.showPopup('upgrade');
    },

    getUpgradeChoices() {
        let choices = [];
        const upgradeTree = CONFIG.upgradeTree;
        const availableEvolutions = [];
        const availableMasteries = [];
        const newSkillsPool = [];
        const otherUpgradesPool = [];

        for (const spellKey in this.spells) {
            const spell = this.spells[spellKey];
            const baseUpgrade = upgradeTree[spellKey];
            if (!baseUpgrade) continue;

            const extraLevels = this.player._prismExtraSpellLevels || 0;
            if (spell.level === (baseUpgrade.maxLevel + extraLevels) && spell.evolution === 'none') {
                const evolutions = Object.keys(upgradeTree).filter(id => id.startsWith(spellKey + '_evolve_'));
                evolutions.forEach(evoId => availableEvolutions.push(upgradeTree[evoId]));
            } else if (spell.evolution !== 'none' && !spell.mastered) {
                const masteryId = `${spellKey}_mastery_${spell.evolution}`;
                const masteryUpgrade = upgradeTree[masteryId];
                if (masteryUpgrade) {
                    availableMasteries.push(masteryUpgrade);
                }
            }
        }

        const availableFusions = [];
        const fusions = CONFIG.fusions || [];
        for (const f of fusions) {
            const primary = this.spells[f.primary];
            const secondary = this.spells[f.secondary];
            const pTree = upgradeTree[f.primary];
            const sTree = upgradeTree[f.secondary];
            if (!primary || !secondary || !pTree || !sTree) continue;

            const extraLevels = this.player._prismExtraSpellLevels || 0;
            const pMax = (pTree.maxLevel ?? 4) + extraLevels;
            const sMax = (sTree.maxLevel ?? 4) + extraLevels;

            let tertiaryOk = true;
            if (f.tertiary) {
                const tertiary = this.spells[f.tertiary];
                const tTree = upgradeTree[f.tertiary];
                if (!tertiary || !tTree) {
                    tertiaryOk = false;
                } else {
                    const tMax = (tTree.maxLevel ?? 4) + extraLevels;
                    if (tertiary.level < tMax || tertiary.evolution !== 'none') {
                        tertiaryOk = false;
                    }
                }
            }

            let passiveOk = true;
            if (f.requiredPassive) {
                const rqPassive = this.passives[f.requiredPassive];
                const rqConfig = upgradeTree[f.requiredPassive];
                if (!rqPassive || !rqConfig || rqPassive.level < (rqConfig.maxLevel || 5)) {
                    passiveOk = false;
                }
            }

            if (primary.level >= pMax && secondary.level >= sMax && primary.evolution === 'none' && secondary.evolution === 'none' && tertiaryOk && passiveOk) {
                const tertiaryNotFused = !f.tertiary || !this.spells[f.tertiary].fusedInto;
                if (!primary.fusionId && !secondary.fusedInto && tertiaryNotFused) {
                    availableFusions.push({ ...f, type: 'fusion' });
                }
            }
        }

        const priorityPool = [...availableEvolutions, ...availableMasteries, ...availableFusions];
        if (priorityPool.length > 0) {
            while (choices.length < 3 && priorityPool.length > 0) {
                choices.push(priorityPool.splice(Math.floor(Math.random() * priorityPool.length), 1)[0]);
            }
        }

        Object.keys(upgradeTree).forEach(id => {
            const up = upgradeTree[id];
            if (up.type === 'evolution' || up.type === 'mastery' || id === 'magicMissile') return;

            if (up.type === 'passive') {
                if (!this.passives[id] || this.passives[id].level < up.maxLevel) {
                    otherUpgradesPool.push(up);
                }
            } else {
                const baseId = id.split('_')[0];
                const spell = this.spells[baseId];
                if (!spell) return;

                // Gating per livello giocatore / cosmic rarity
                const playerLevel = this.player?.level ?? 1;
                if (typeof up.minPlayerLevel === 'number') {
                    const starting = this.player?.archetype?.startingWeapon;
                    const isStartingWeapon = starting && (baseId === starting || up.id === starting);
                    if (!isStartingWeapon && playerLevel < up.minPlayerLevel) {
                        return;
                    }
                }
                if (up.rarity === 'cosmic') {
                    // Anche quando sbloccate, le cosmic hanno probabilità molto bassa di entrare nel pool
                    if (Math.random() > 0.25) return;
                }

                const extraLevels = this.player._prismExtraSpellLevels || 0;
                if (spell.level === 0) {
                    newSkillsPool.push(up);
                } else if (spell.level > 0 && spell.level < ((up.maxLevel || Infinity) + extraLevels) && spell.evolution === 'none') {
                    otherUpgradesPool.push(up);
                }
            }
        });

        if (choices.length < 3 && newSkillsPool.length > 0) {
            choices.push(newSkillsPool.splice(Math.floor(Math.random() * newSkillsPool.length), 1)[0]);
        }

        const combinedPool = [...newSkillsPool, ...otherUpgradesPool];
        while (choices.length < 3 && combinedPool.length > 0) {
            choices.push(combinedPool.splice(Math.floor(Math.random() * combinedPool.length), 1)[0]);
        }

        return choices.filter(c => c);
    },

    applyUpgrade(upgradeId) {
        const upgrade = CONFIG.upgradeTree[upgradeId];
        const fusion = (CONFIG.fusions || []).find(f => f.id === upgradeId);

        if (upgrade?.type === 'fusion' || fusion) {
            const f = fusion || upgrade;
            if (!f || !this.spells[f.primary] || !this.spells[f.secondary]) return;
            this.spells[f.secondary].level = 0;
            this.spells[f.secondary].fusedInto = f.primary;
            if (f.tertiary && this.spells[f.tertiary]) {
                this.spells[f.tertiary].level = 0;
                this.spells[f.tertiary].fusedInto = f.primary;
            }
            this.spells[f.primary].fusionId = f.id;
            this.spells[f.primary].fusionBonus = f.bonus || {};
            if (f.bonus?.damage) this.spells[f.primary].damage *= (1 + f.bonus.damage);
            if (f.bonus?.burnDamage) this.spells[f.primary].burnDamage = (this.spells[f.primary].burnDamage || 0) + f.bonus.burnDamage;
            if (f.bonus?.duration && f.primary === 'shield') this.spells[f.primary].duration *= (1 + f.bonus.duration);
            if (f.bonus?.auraDps) this.spells[f.primary].auraDps = (this.spells[f.primary].auraDps || 0) + f.bonus.auraDps;
            if (f.bonus?.auraSlow) this.spells[f.primary].auraSlow = (this.spells[f.primary].auraSlow || 0) + f.bonus.auraSlow;
            if (f.bonus?.count) this.spells[f.primary].count = (this.spells[f.primary].count || 5) + f.bonus.count;
            if (f.bonus?.lifestealOnHit) this.spells[f.primary].lifestealOnHit = f.bonus.lifestealOnHit;

            // Advanced bonuses
            if (f.bonus?.area) this.spells[f.primary].radius = (this.spells[f.primary].radius || 50) * (1 + f.bonus.area);
            if (f.bonus?.knockback) this.spells[f.primary].knockback = (this.spells[f.primary].knockback || 10) * (1 + f.bonus.knockback);
            if (f.bonus?.chains) this.spells[f.primary].chains = (this.spells[f.primary].chains || 2) + f.bonus.chains;
            if (f.bonus?.reflectDamage) this.spells[f.primary].reflectDamage = (this.spells[f.primary].reflectDamage || 1.0) * f.bonus.reflectDamage;
            if (f.bonus?.timeStop) {
                this._timeStopActive = true;
                this._timeStopTimer = f.bonus.timeStop / 16.6; // Convert ms to frames approx
                this.notifications?.push({ text: "TEMPO FERMO!", life: 120, color: '#00ffff' });
            }
            if (f.bonus?.healAmount && f.primary === 'shield') {
                this.spells[f.primary].healAmount = f.bonus.healAmount; // Adding a custom property handled elsewhere or just as a flag
                this.spells[f.primary].autoHealInterval = setInterval(() => {
                    if (this.state === 'running' && this.player) {
                        this.player.heal(this.spells[f.primary].healAmount * 5); // Example amount
                    }
                }, 2000);
            }

            this.notifications?.push({ text: `Fusione: ${f.name}!`, life: 300, color: '#FFD700' });
            return;
        }

        if (!upgrade) return;
        let baseId = upgrade.id.split('_')[0];

        if (upgrade.type === 'evolution') {
            const evoType = upgrade.id.split('_evolve_')[1];
            if (this.spells[baseId]) {
                this.spells[baseId].evolution = evoType;
                if (upgrade.id === 'shield_evolve_orbital') { this.castOrbital(Date.now()); }
            }
            return;
        }

        if (upgrade.type === 'mastery') {
            if (this.spells[baseId]) {
                this.spells[baseId].mastered = true;
                if (upgradeId === 'fireball_mastery_giant') { this.spells.fireball.damage += 50; this.spells.fireball.burnDamage += 10; }
                if (upgradeId === 'fireball_mastery_meteor') { this.spells.fireball.meteorCount += 2; this.spells.fireball.explosionRadius += 20; }
                if (upgradeId === 'lightning_mastery_storm') { this.spells.lightning.fieldDuration += 200; this.spells.lightning.fieldTickRate = Math.max(8, this.spells.lightning.fieldTickRate - 8); }
                if (upgradeId === 'lightning_mastery_spear') { this.spells.lightning.damage *= 1.5; this.spells.lightning.stunChance += 0.2; }
                if (upgradeId === 'frostbolt_mastery_glacial') { this.spells.frostbolt.auraDps += 8; this.spells.frostbolt.auraSlow += 0.2; }
                if (upgradeId === 'frostbolt_mastery_comet') { this.spells.frostbolt.leavesIcePatch = true; this.spells.frostbolt.icePatchDamage = 15; }
                if (upgradeId === 'shotgun_mastery_explosive') { this.spells.shotgun.explosionRadius = (this.spells.shotgun.explosionRadius || 40) + 20; }
                if (upgradeId === 'shotgun_mastery_cannon') { this.spells.shotgun.cannonCount = (this.spells.shotgun.cannonCount || 20) + 10; }
                if (upgradeId === 'shockwave_mastery_resonant') { this.spells.shockwave.stunDuration = 60; }
                if (upgradeId === 'shockwave_mastery_implosion') { this.spells.shockwave.executeDamage = true; }
                if (upgradeId === 'heal_mastery_sanctuary') { this.spells.heal.sanctuaryAttackSpeed = 0.20; }
                if (upgradeId === 'heal_mastery_lifesteal') { this.spells.heal.lifestealPercent += 0.05; this.spells.heal.lifestealDuration += 300; }
                if (upgradeId === 'shield_mastery_reflect') { this.spells.shield.reflectDamage += 0.5; }
                if (upgradeId === 'shield_mastery_orbital') { this.spells.shield.orbitalCount += 1; }
            }
            return;
        }

        let target;
        if (upgrade.type === 'passive') {
            if (!this.passives[upgrade.id]) this.passives[upgrade.id] = { level: 0 };
            target = this.passives[upgrade.id];
        } else {
            target = this.spells[baseId];
        }

        if (!target) { return; }

        // Rispetta il maxLevel (con bonus extra spell livelli per Prism), niente overcap infinito
        const extraLevels = this.player?._prismExtraSpellLevels || 0;
        const maxLevel = upgrade.type === 'passive'
            ? (upgrade.maxLevel ?? Infinity)
            : ((upgrade.maxLevel ?? Infinity) + extraLevels);

        if (target.level >= maxLevel) {
            return;
        }

        target.level++;

        if (upgrade.id === 'fireball') { target.damage += 8; target.explosionRadius += 8; }
        else if (upgrade.id === 'lightning') { target.damage += 6; target.chains++; }
        else if (upgrade.id === 'frostbolt') { target.damage += 5; target.penetration++; }
        else if (upgrade.id === 'shotgun') { target.damage += 4; target.count += 2; }
        else if (upgrade.id === 'shockwave') { target.damage += 10; target.radius += 15; target.knockback += 5; }
        else if (upgrade.id === 'cyclone') { target.damage += 5; target.radius += 10; target.duration += 30; }
        else if (upgrade.id === 'cloaking') { target.duration += 1000; target.cooldown = Math.max(6000, target.cooldown - 1000); }
        else if (upgrade.id === 'heal') { target.amount += 10; target.cooldown = Math.max(4000, target.cooldown - 1000); }
        else if (upgrade.id === 'shield') { target.duration += 300; target.cooldown = Math.max(12000, target.cooldown - 800); }
        else if (upgrade.id === 'singularity') { target.damage += 5; target.radius += 20; target.pullForce += 0.5; }
        else if (upgrade.id === 'stellarAura') { target.damage += 3; target.radius += 10; target.duration += 60; }
        else if (upgrade.id === 'pulsarRay') { target.damage += 15; target.width += 5; target.cooldown = Math.max(4000, target.cooldown - 1000); }
        else if (upgrade.id === 'health') { this.player.stats.maxHp += 60; this.player.hp += 60; }
        else if (upgrade.id === 'speed') { this.player.stats.speed += 0.4; }
        else if (upgrade.id === 'armor') { this.player.stats.dr = Math.min(this.player.stats.dr + 0.03, 1.0); }
        else if (upgrade.id === 'attack_speed') { this.player.modifiers.frequency *= 0.92; }
        else if (upgrade.id === 'regen') { this.player.modifiers.hpRegen += 0.5; }
        else if (upgrade.id === 'attractorb') { this.player.modifiers.pickupRadius *= 1.25; }
        else if (upgrade.id === 'aegis') { this.player.modifiers.iframeTimer += 0.2; }
        else if (upgrade.id === 'skull') {
            this.player.modifiers.curse += 0.1;
            this.player.modifiers.xpGain += 0.05;
        }
        else if (upgrade.id === 'torrona') {
            if (target.level === 9) {
                this.player.modifiers.curse += 1.0;
            } else {
                this.player.modifiers.power += 0.04;
                this.player.modifiers.area += 0.04;
                this.player.modifiers.frequency *= 0.96;
                this.player.stats.speed += 0.2;
            }
        }

        // Applica cap alle statistiche passive modificate per evitare scaling infiniti
        if (this.player && typeof this.player.clampModifiers === 'function') {
            this.player.clampModifiers();
        }
    }
};
