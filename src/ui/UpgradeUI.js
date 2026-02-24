import { CONFIG } from '../config/index.js';
import { getUpgradeIcon } from '../data/icons.js';

export const UpgradeUI = {
    populateUpgradeMenu() {
        const container = this.dom.containers.upgradeOptions;
        container.innerHTML = '';
        const choices = this.getUpgradeChoices();
        choices.forEach(upgrade => {
            if (!upgrade) return;
            const div = document.createElement('div');
            div.className = 'upgrade-option' + (upgrade.type === 'evolution' ? ' evolution' : '') + (upgrade.type === 'mastery' ? ' mastery' : '') + (upgrade.type === 'fusion' ? ' fusion' : '') + (upgrade.type === 'passive' ? ' passive' : '');

            let s;
            if (upgrade.type === 'passive') {
                s = this.passives[upgrade.id];
            } else {
                const baseId = upgrade.primary || upgrade.id.split('_')[0];
                s = this.spells[baseId];
            }

            let levelText = s && s.level > 0 ? `(Liv. ${s.level + 1})` : `(Nuovo!)`;
            if (upgrade.type === 'evolution' || upgrade.id === 'magicMissile' || upgrade.type === 'mastery' || upgrade.type === 'fusion') levelText = '';
            const icon = getUpgradeIcon(upgrade.id, upgrade);
            div.innerHTML = `<div class="upgrade-option-icon">${icon}</div><div class="upgrade-option-text"><div class="upgrade-title">${upgrade.name} ${levelText}</div><div class="upgrade-desc">${upgrade.details || upgrade.desc}</div></div>`;
            div.onclick = () => { this.applyUpgrade(upgrade.id); this.hideAllPopups(); };
            container.appendChild(div);
        });
        // Se non ci sono scelte (run molto lunga, tutto al massimo) aggiungi pulsante "Continua" per evitare blocco
        if (choices.length === 0) {
            const btn = document.createElement('div');
            btn.className = 'upgrade-option';
            btn.innerHTML = '<div class="upgrade-option-icon">🎉</div><div class="upgrade-option-text"><div class="upgrade-title">Livello massimo raggiunto!</div><div class="upgrade-desc">Continua a giocare</div></div>';
            btn.onclick = () => this.hideAllPopups();
            container.appendChild(btn);
        }
    },

    showBossUpgradePopup() {
        this.state = 'paused';
        if (this.dom.menuOverlay) this.dom.menuOverlay.style.display = 'block';
        Object.values(this.dom.popups).forEach(p => {
            if (p) p.style.display = 'none';
        });
        if (this.dom.popups['upgrade']) this.dom.popups['upgrade'].style.display = 'flex';
        this.populateBossUpgradeMenu();
    },

    populateBossUpgradeMenu() {
        const container = this.dom.containers.upgradeOptions;
        if (!container) return;

        container.innerHTML = '';
        const choices = this.getBossUpgradeChoices();
        choices.forEach(upgrade => {
            if (!upgrade) return;
            const div = document.createElement('div');
            div.className = 'upgrade-option' + (upgrade.type === 'evolution' ? ' evolution' : '') + (upgrade.type === 'mastery' ? ' mastery' : '') + (upgrade.type === 'passive' ? ' passive' : '');
            let s;
            if (upgrade.type === 'passive') {
                s = this.passives[upgrade.id];
            } else {
                const baseId = upgrade.id.split('_')[0];
                s = this.spells[baseId];
            }
            let levelText = s && s.level > 0 ? `(Liv. ${s.level + 1})` : `(Nuovo!)`;
            if (upgrade.type === 'evolution' || upgrade.id === 'magicMissile' || upgrade.type === 'mastery') levelText = '';

            const affix = upgrade.affix;
            const displayName = affix ? `${CONFIG.affixes[affix].name} ${upgrade.name}` : upgrade.name;
            const titleColor = affix ? CONFIG.affixes[affix].color : 'inherit';

            const icon = getUpgradeIcon(upgrade.id, upgrade);
            div.innerHTML = `
                <div class="upgrade-option-icon">${icon}</div>
                <div class="upgrade-option-text">
                    <div class="upgrade-title" style="color:${titleColor}">${displayName} ${levelText}</div>
                    <div class="upgrade-desc">${upgrade.details || upgrade.desc}</div>
                </div>`;
            div.onclick = () => { this.applyBossUpgrade(upgrade.id, affix); this.hideAllPopups(); };
            container.appendChild(div);
        });
    },

    getBossUpgradeChoices() {
        // Permettiamo l'overcap: includi tutti i passivi, anche se già maxati
        const upgradeTree = CONFIG.upgradeTree;
        const passives = Object.values(upgradeTree).filter(u => u.type === 'passive');
        // Scegli 3 a caso
        const shuffled = passives.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 3);

        const affixKeys = Object.keys(CONFIG.affixes);
        return selected.map(choice => {
            const currentLevel = this.passives[choice.id]?.level ?? 0;
            const isMaxLevel = currentLevel >= (choice.maxLevel ?? 0);
            const affix = isMaxLevel ? affixKeys[Math.floor(Math.random() * affixKeys.length)] : null;
            return { ...choice, affix };
        });
    },

    applyBossUpgrade(upgradeId, affixId) {
        const upgrade = CONFIG.upgradeTree[upgradeId];
        if (!upgrade) return;
        let target;
        if (upgrade.type === 'passive') {
            target = this.passives[upgrade.id];
        } else {
            const baseId = upgrade.id.split('_')[0];
            target = this.spells[baseId];
        }
        if (!target) return;

        // Niente overcap infinito: il livello non supera maxLevel
        const maxLevel = upgrade.maxLevel ?? Infinity;
        if (target.level < maxLevel) {
            target.level++;
        }

        // Applica i bonus dell'affisso
        if (affixId && CONFIG.affixes[affixId]) {
            const affix = CONFIG.affixes[affixId];
            for (const [stat, val] of Object.entries(affix.stats)) {
                if (stat === 'hp') {
                    this.player.stats.maxHp += val;
                    this.player.hp += val;
                } else if (this.player.stats[stat] !== undefined) {
                    this.player.stats[stat] += val;
                } else if (this.player.modifiers[stat] !== undefined) {
                    if (stat === 'power' || stat === 'area' || stat === 'xpGain') {
                        this.player.modifiers[stat] += val;
                    } else if (stat === 'frequency') {
                        this.player.modifiers[stat] += val;
                    } else {
                        this.player.modifiers[stat] += val;
                    }
                }
            }
            this.notifications.push({ text: `Loot ${affix.name}: ${upgrade.name}!`, life: 220, color: affix.color });
        } else {
            this.notifications.push({ text: `Upgrade boss: ${upgrade.name}!`, life: 180 });
        }
    }
};
