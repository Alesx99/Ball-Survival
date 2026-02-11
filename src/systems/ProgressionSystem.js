import { CONFIG } from '../config/index.js';
import { Effect } from '../entities/Particles.js';

export const ProgressionSystem = {
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
        this.player.levelUp();
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

            if (spell.level === baseUpgrade.maxLevel && spell.evolution === 'none') {
                const evolutions = Object.keys(upgradeTree).filter(id => id.startsWith(spellKey + '_evolve_'));
                evolutions.forEach(evoId => availableEvolutions.push(upgradeTree[evoId]));
            } else if (spell.evolution !== 'none' && !spell.mastered) {
                const masteryId = `${spellKey}_mastery_${spell.evolution}`;
                const masteryUpgrade = upgradeTree[masteryId];
                if(masteryUpgrade) {
                    availableMasteries.push(masteryUpgrade);
                }
            }
        }
        
        const priorityPool = [...availableEvolutions, ...availableMasteries];
        if (priorityPool.length > 0) {
            while(choices.length < 3 && priorityPool.length > 0) {
                 choices.push(priorityPool.splice(Math.floor(Math.random() * priorityPool.length), 1)[0]);
            }
        }

        Object.keys(upgradeTree).forEach(id => {
            if (upgradeTree[id].type === 'evolution' || upgradeTree[id].type === 'mastery' || id === 'magicMissile') return;

            if (upgradeTree[id].type === 'passive') {
                if (!this.passives[id] || this.passives[id].level < upgradeTree[id].maxLevel) {
                    otherUpgradesPool.push(upgradeTree[id]);
                }
            } else {
                const baseId = id.split('_')[0];
                const spell = this.spells[baseId];
                if (spell) {
                    if (spell.level === 0) {
                        newSkillsPool.push(upgradeTree[id]);
                    } else if (spell.level > 0 && spell.level < (upgradeTree[id].maxLevel || Infinity) && spell.evolution === 'none') {
                        otherUpgradesPool.push(upgradeTree[id]);
                    }
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
        if (!upgrade) return;

        let baseId = upgrade.id.split('_')[0];

        if(upgrade.type === 'evolution') {
            const evoType = upgrade.id.split('_evolve_')[1];
            if (this.spells[baseId]) {
                this.spells[baseId].evolution = evoType;
                if(upgrade.id === 'shield_evolve_orbital') { this.castOrbital(Date.now()); }
            }
            return;
        }

        if(upgrade.type === 'mastery') {
             if (this.spells[baseId]) {
                this.spells[baseId].mastered = true;
                if (upgradeId === 'fireball_mastery_giant') { this.spells.fireball.damage += 50; this.spells.fireball.burnDamage += 10; }
                if (upgradeId === 'fireball_mastery_meteor') { this.spells.fireball.meteorCount += 2; this.spells.fireball.explosionRadius += 20; }
                if (upgradeId === 'lightning_mastery_storm') { this.spells.lightning.fieldDuration += 200; this.spells.lightning.fieldTickRate = Math.max(8, this.spells.lightning.fieldTickRate - 8); }
                if (upgradeId === 'lightning_mastery_spear') { this.spells.lightning.damage *= 1.5; this.spells.lightning.stunChance += 0.2; }
                if (upgradeId === 'frostbolt_mastery_glacial') { this.spells.frostbolt.auraDps += 8; this.spells.frostbolt.auraSlow += 0.2; }
                if (upgradeId === 'frostbolt_mastery_comet') { this.spells.frostbolt.leavesIcePatch = true; this.spells.frostbolt.icePatchDamage = 15; } 
             }
            return;
        }
        
        let target;
        if (upgrade.type === 'passive') {
            target = this.passives[upgrade.id];
        } else {
            target = this.spells[baseId];
        }

        if (!target) { return; }
        
        target.level++;

        if (upgrade.id === 'fireball') { target.damage += 8; target.explosionRadius += 8; }
        else if (upgrade.id === 'lightning') { target.damage += 6; target.chains++; }
        else if (upgrade.id === 'frostbolt') { target.damage += 5; target.penetration++; }
        else if (upgrade.id === 'shotgun') { target.damage += 4; target.count += 2; }
        else if (upgrade.id === 'shockwave') { target.damage += 10; target.radius += 15; target.knockback += 5; }
        else if (upgrade.id === 'heal') { target.amount += 10; target.cooldown = Math.max(4000, target.cooldown - 1000); }
        else if (upgrade.id === 'shield') { target.duration += 500; target.cooldown = Math.max(10000, target.cooldown - 1000); }
        else if (upgrade.id === 'health') { this.player.stats.maxHp += 60; this.player.hp += 60; }
        else if (upgrade.id === 'speed') { this.player.stats.speed += 0.4; }
        else if (upgrade.id === 'armor') { this.player.stats.dr = Math.min(this.player.stats.dr + 0.03, 1.0); }
        else if (upgrade.id === 'attack_speed') { this.player.modifiers.frequency *= 0.92; }
    }
};
