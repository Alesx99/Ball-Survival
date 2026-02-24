import { CONFIG } from '../config/index.js';
import { Utils } from '../utils/index.js';
import * as InventoryUI from '../ui/InventoryUI.js';
import { searchTerms, getAllTerms } from '../data/glossary.js';
import { getUpgradeIcon, getGlossaryIcon, getItemIcon, ICONS } from '../data/icons.js';
import { CharacterUI } from '../ui/CharacterUI.js';
import { StageUI } from '../ui/StageUI.js';
import { GlossaryUI } from '../ui/GlossaryUI.js';
import { AchievementsUI } from '../ui/AchievementsUI.js';
import { ShopUI } from '../ui/ShopUI.js';
import { UpgradeUI } from '../ui/UpgradeUI.js';
import { BestiaryUI } from '../ui/BestiaryUI.js';
import { RunHistoryUI } from '../ui/RunHistoryUI.js';

export const UISystem = {
    ...CharacterUI,
    ...StageUI,
    ...GlossaryUI,
    ...AchievementsUI,
    ...ShopUI,
    ...UpgradeUI,
    ...BestiaryUI,
    ...RunHistoryUI,




    returnToStartScreen() {
        // Se esci da una partita in corso (pausa o running), salva i diamanti della run
        if (this.state === 'running' || this.state === 'paused') {
            this.totalGems = (this.totalGems || 0) + (this.gemsThisRun || 0);
            this.saveGameData?.();
        }

        this.audio?.stopBackgroundMusic();
        this.hideAllPopups(true);
        this.dom.inGameUI.container.style.display = 'none';
        this.dom.buttons.pause.style.display = 'none';
        if (this.dom.pauseButtonMobile) this.dom.pauseButtonMobile.style.display = 'none';
        if (this.dom.xpBarMobile) this.dom.xpBarMobile.style.display = 'none';
        this.state = 'startScreen';

        // Pulisci completamente il canvas
        this.clearCanvas();

        this.populateCharacterSelection();
        this.populateStageSelection(); // Ricarica anche la selezione stage
        this.updateCharacterPreview(); // Aggiorna l'anteprima del personaggio
        this.showPopup('start');
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }
        this.draw();
        if (!this.gameLoopId) this.gameLoop();
    },

    showPopup(popupKey) {
        if (popupKey === 'settings') {
            /* settings overlay: no state change */
        } else if (popupKey !== 'upgrade' && popupKey !== 'shop' && popupKey !== 'secretShop') {
            if (popupKey === 'start') this.state = 'startScreen';
            else if (popupKey === 'gameOver') this.state = 'gameOver';
            else this.state = 'paused';
        } else if (this.state === 'running') {
            this.state = 'paused';
        }

        if (this.dom.menuOverlay) this.dom.menuOverlay.style.display = 'block';
        Object.values(this.dom.popups).forEach(p => {
            if (p) p.style.display = 'none';
        });
        if (this.dom.popups[popupKey]) this.dom.popups[popupKey].style.display = 'flex';

        if (popupKey === 'shop') {
            this.populateShop();
        } else if (popupKey === 'secretShop') {
            this.populateSecretShop();
        }
        if (popupKey === 'pause') {
            this.populateStatsMenu();
        }
    },

    showInventory() {
        this.showPopup('inventory');
        this.populateInventory();
    },

    closeInventory() {
        if (this.state === 'running' || this.state === 'paused') {
            this.returnToStartScreen();
        } else {
            this.hideAllPopups();
            this.showPopup('start');
        }
    },

    populateInventory() {
        InventoryUI.populateInventory(this);
    },

    populateMaterialsList(containerId, materialsConfig) {
        InventoryUI.populateMaterialsList(this, containerId, materialsConfig);
    },

    populateCraftingList(containerId, itemsConfig, type) {
        InventoryUI.populateCraftingList(this, containerId, itemsConfig, type);
    },

    getMaterialsRequiredText(itemId, type) {
        return InventoryUI.getMaterialsRequiredText(this, itemId, type);
    },

    populateArsenal() {
        InventoryUI.populateArsenal(this);
    },

    hideAllPopups(forceNoResume) {
        const wasSettings = this.dom.popups.settings && this.dom.popups.settings.style.display === 'flex';
        Object.values(this.dom.popups).forEach(p => {
            if (p) p.style.display = 'none';
        });
        if (this.dom.menuOverlay) this.dom.menuOverlay.style.display = 'none';
        if (wasSettings) {
            if (this.state === 'startScreen') this.showPopup('start');
            else if (this.state === 'paused') this.showPopup('pause');
            return;
        }
        if (this.state === 'startScreen' && !forceNoResume) {
            this.showPopup('start');
            return;
        }
        if (this.state === 'paused' && !forceNoResume) {
            if (this.gameLoopId != null) {
                this.state = 'running';
                this.lastFrameTime = performance.now();
                this.menuCooldown = 5;
            } else {
                this.showPopup('start');
            }
        }
    },

    togglePause() {
        if (this.state !== 'running' && this.state !== 'paused') return;
        if (this.state === 'running') {
            this.showPopup('pause');
        } else {
            this.hideAllPopups();
            if (this.dom.containers.debugSaveContainer) {
                this.dom.containers.debugSaveContainer.style.display = 'none';
            }
        }
    },

    populateStatsMenu() {
        const runStatsContainer = this.dom.containers.runStatsContainer;
        if (!runStatsContainer) return;

        runStatsContainer.innerHTML = `
            <div class="run-stat-item">Tempo <span>${Math.floor(this.totalElapsedTime ?? 0)}s</span></div>
            <div class="run-stat-item">Livello <span>${this.player?.level ?? 1}</span></div>
            <div class="run-stat-item">Punteggio <span>${this.score ?? 0}</span></div>
            <div class="run-stat-item">Nemici sconfitti <span>${this.enemiesKilled ?? 0}</span></div>
            <div class="run-stat-item">Cristalli <span>${this.gemsThisRun ?? 0} 💎</span></div>
        `;

        const p = this.player;
        if (!p || !this.dom.playerStatsColumn || !this.dom.weaponsStatsColumn) return;

        const mod = p.modifiers ?? {};
        const st = p.stats ?? {};
        const archName = p.archetype?.name ?? 'Sconosciuto';
        const maxHp = Number(st.maxHp) || 0;
        const hp = Number(p.hp);
        const speed = Number(st.speed) || 0;
        const dr = Number(st.dr) || 0;
        const power = Number(mod.power) || 1;
        const frequency = Number(mod.frequency) || 1;
        const area = Number(mod.area) || 1;
        const xpGain = Number(mod.xpGain) || 1;
        const luck = Number(mod.luck) || 0;

        let playerHTML = `<div class="stats-section"><div class="stats-section-title">${archName}</div>`;
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.health}<span class="stat-item-label">Salute:</span><span class="stat-item-value">${Math.floor(hp)} / ${Math.floor(maxHp)}</span></div>`;
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.speed}<span class="stat-item-label">Velocità:</span><span class="stat-item-value">${speed.toFixed(1)}</span></div>`;
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.defense}<span class="stat-item-label">Rid. Danni:</span><span class="stat-item-value">${Math.round(dr * 100)}%</span></div></div>`;

        playerHTML += `<div class="stats-section"><div class="stats-section-title">Modificatori</div>`;
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.power}<span class="stat-item-label">Potenza:</span><span class="stat-item-value">${Math.round((power - 1) * 100)}%</span></div>`;
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.frequency}<span class="stat-item-label">Vel. ricarica:</span><span class="stat-item-value">${Math.round((1 - frequency) * 100)}%</span></div>`;
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.area}<span class="stat-item-label">Area:</span><span class="stat-item-value">${Math.round((area - 1) * 100)}%</span></div>`;
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.xpGain}<span class="stat-item-label">Guadagno XP:</span><span class="stat-item-value">${Math.round((xpGain - 1) * 100)}%</span></div>`;
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.luck}<span class="stat-item-label">Fortuna:</span><span class="stat-item-value">${Math.round(luck * 100)}%</span></div></div>`;

        const hpRegen = Number(mod.hpRegen) || 0;
        const pickupRadius = Number(mod.pickupRadius) || 1;
        const curse = Number(mod.curse) || 0;
        const iframeTimer = Number(mod.iframeTimer) || 0;
        const lifestealPercent = Number(mod.lifestealPercent) || 0;
        const hasExtra = hpRegen > 0 || pickupRadius !== 1 || curse > 0 || iframeTimer > 0 || mod.contactBurn || mod.contactSlow || lifestealPercent > 0;
        if (hasExtra) {
            playerHTML += `<div class="stats-section"><div class="stats-section-title">Altri</div>`;
            if (hpRegen > 0) playerHTML += `<div class="stat-item"><span class="stat-item-label">Rigenerazione HP:</span><span class="stat-item-value">${hpRegen.toFixed(1)}/s</span></div>`;
            if (pickupRadius !== 1) playerHTML += `<div class="stat-item"><span class="stat-item-label">Raggio raccolta:</span><span class="stat-item-value">${Math.round((pickupRadius - 1) * 100)}%</span></div>`;
            if (curse > 0) playerHTML += `<div class="stat-item"><span class="stat-item-label">Maledizione:</span><span class="stat-item-value">+${Math.round(curse * 100)}%</span></div>`;
            if (iframeTimer > 0) playerHTML += `<div class="stat-item"><span class="stat-item-label">Invulnerabilità (extra):</span><span class="stat-item-value">+${(iframeTimer * 100).toFixed(0)}%</span></div>`;
            if (lifestealPercent > 0) playerHTML += `<div class="stat-item"><span class="stat-item-label">Rubavita:</span><span class="stat-item-value">${Math.round(lifestealPercent * 100)}%</span></div>`;
            if (mod.contactBurn) playerHTML += `<div class="stat-item"><span class="stat-item-label">Bruciatura al contatto</span></div>`;
            if (mod.contactSlow) playerHTML += `<div class="stat-item"><span class="stat-item-label">Rallentamento al contatto</span></div>`;
            playerHTML += `</div>`;
        }
        this.dom.playerStatsColumn.innerHTML = playerHTML;

        const getDamageSafe = typeof this.getDamage === 'function' ? (d) => this.getDamage(d) : (d) => d;
        const spells = this.spells && typeof this.spells === 'object' ? this.spells : {};
        let weaponsHTML = `<div class="stats-section"><div class="stats-section-title">Abilità (Spell)</div>`;
        let hasSpells = false;
        Object.values(spells).filter(s => s && s.level > 0).forEach(s => {
            hasSpells = true;
            weaponsHTML += `<div class="stat-item-title">${s.name || s.id} (Liv. ${s.level}) ${s.evolution !== 'none' && s.evolution ? `[EVO]` : ''}</div>`;
            let details = '';
            const cooldownSec = (Number(s.cooldown) || 0) * frequency / 1000;
            if (s.damage != null) details += `Danno: ${Math.round(getDamageSafe(s.damage))}, `;
            if (cooldownSec > 0) details += `Ricarica: ${cooldownSec.toFixed(2)}s, `;
            if (s.id === 'heal' && s.amount != null) details += `Cura: ${s.amount}, `;
            if (s.id === 'shield' && s.duration != null) details += `Durata: ${(s.duration / 1000).toFixed(1)}s, `;
            if (s.id === 'shield' && s.dr != null) details += `Rid. danno: ${Math.round(s.dr * 100)}%, `;
            if (s.id === 'cloaking' && s.duration != null) details += `Durata: ${(s.duration / 1000).toFixed(1)}s, `;
            if (s.burnDamage != null) details += `Burn: ${Math.round(getDamageSafe(s.burnDamage))}, `;
            weaponsHTML += `<div class="weapon-stat-details">${details.slice(0, -2) || '—'}</div>`;
        });
        if (!hasSpells) weaponsHTML += `<div>Nessuna abilità acquisita.</div>`;
        weaponsHTML += `</div>`;

        if (CONFIG.cores && CONFIG.weapons) {
            const activeCoreId = this.arsenal?.activeCore;
            const activeWeaponIds = this.arsenal?.activeWeapons || [];
            if (activeCoreId) {
                const coreDef = CONFIG.cores[activeCoreId];
                weaponsHTML += `<div class="stats-section"><div class="stats-section-title">Core attivo</div>`;
                weaponsHTML += `<div class="stat-item-title">${coreDef?.name ?? activeCoreId}</div>`;
                weaponsHTML += `<div class="weapon-stat-details">${coreDef?.desc ?? '—'}</div></div>`;
            }
            if (activeWeaponIds.length > 0) {
                weaponsHTML += `<div class="stats-section"><div class="stats-section-title">Armi equipaggiate</div>`;
                activeWeaponIds.forEach(wid => {
                    const wDef = CONFIG.weapons[wid];
                    weaponsHTML += `<div class="stat-item-title">${wDef?.name ?? wid}</div>`;
                    weaponsHTML += `<div class="weapon-stat-details">${wDef?.desc ?? '—'}</div>`;
                });
                weaponsHTML += `</div>`;
            }
        }

        if (this.passives && typeof this.passives === 'object') {
            const passiveEntries = Object.entries(this.passives).filter(([, v]) => v && Number(v.level) > 0);
            if (passiveEntries.length > 0) {
                const passiveNames = { health: 'Vitalità', speed: 'Rapidità', armor: 'Armatura', defense: 'Difesa', attack_speed: "Vel. attacco", regen: 'Rigenerazione', attractorb: 'Magnete', aegis: 'Egida', skull: 'Teschio', torrona: 'Torrona' };
                weaponsHTML += `<div class="stats-section"><div class="stats-section-title">Passivi (livello)</div>`;
                passiveEntries.forEach(([id, v]) => {
                    const lvl = v.level ?? 0;
                    if (lvl <= 0) return;
                    weaponsHTML += `<div class="stat-item"><span class="stat-item-label">${passiveNames[id] ?? id}:</span><span class="stat-item-value">${lvl}</span></div>`;
                });
                weaponsHTML += `<div class="weapon-stat-details" style="margin-top:4px;opacity:0.85;">I valori sopra includono passivi, core e armi.</div></div>`;
            }
        }

        this.dom.weaponsStatsColumn.innerHTML = weaponsHTML;

        if (this.analyticsManager && p.archetype) {
            const report = this.analyticsManager.getAnalyticsReport();
            const scores = this.analyticsManager.getAllArchetypeScores();
            const archId = p.archetype.id;

            let analyticsHTML = `<div class="stats-section"><div class="stats-section-title">📊 Analytics Bilanciamento</div>`;
            analyticsHTML += `<div class="stat-item">Sessione Corrente: <span>${archId}</span></div>`;
            analyticsHTML += `<div class="stat-item">Score Archetipo: <span>${(scores[archId] ?? 0.5).toFixed(2)}</span></div>`;
            analyticsHTML += `<div class="stat-item">Partite Totali: <span>${report.sessionStats?.totalSessions ?? 0}</span></div>`;
            analyticsHTML += `<div class="stat-item">Tempo Medio: <span>${Math.floor(report.sessionStats?.avgSessionTime ?? 0)}s</span></div>`;
            if (report.recommendations?.length > 0) {
                analyticsHTML += `<div class="stat-item">Raccomandazioni: <span style="color: #ff6b6b;">${report.recommendations.length} pending</span></div>`;
            }
            analyticsHTML += `</div>`;

            if (this.dom.weaponsStatsColumn) this.dom.weaponsStatsColumn.innerHTML += analyticsHTML;
        }
    },

    generateAndShowDebugCode() {
        if (this.dom.inputs.debugSaveOutput) {
            this.dom.inputs.debugSaveOutput.value = this.generateSaveCode(true);
        }
        if (this.dom.containers.debugSaveContainer) {
            this.dom.containers.debugSaveContainer.style.display = 'block';
        }
    },

    copyDebugCode() {
        const debugCode = this.dom.inputs.debugSaveOutput ? this.dom.inputs.debugSaveOutput.value : '';
        if (debugCode) {
            navigator.clipboard.writeText(debugCode).then(() => {
                this.notifications.push({ text: "Codice Debug Copiato!", life: 120 });
            });
        }
    },



    populateCraftingPreview() {
        const container = document.getElementById('craftingPreviewList');
        if (!container) return;
        container.innerHTML = '';

        // Combine all items to show
        const allItems = [
            ...Object.entries(CONFIG.characterArchetypes).filter(([id]) => id !== 'standard'),
            ...Object.entries(CONFIG.weapons || {})
        ];

        if (allItems.length === 0) {
            container.innerHTML = '<div class="empty-state">Nessuna ricetta disponibile</div>';
            return;
        }

        allItems.forEach(([id, data]) => {
            const div = document.createElement('div');
            div.className = 'crafting-item';

            const icon = ICONS[id] || '⚒️';
            const name = data.name || id;
            const materials = data.materials || (data.cost ? { 'Gemme': data.cost } : {});

            let recipeHtml = '';
            for (const [matId, count] of Object.entries(materials)) {
                recipeHtml += `
                    <div class="recipe-material">
                        <span>${matId}</span>
                        <span class="material-count">${count}</span>
                    </div>
                `;
            }

            div.innerHTML = `
                <div class="crafting-item-header">
                    <div class="crafting-item-icon">${icon}</div>
                    <div class="crafting-item-name">${name}</div>
                </div>
                <div class="crafting-recipe">
                    ${recipeHtml || '<p>Materiali sconosciuti</p>'}
                </div>
            `;
            container.appendChild(div);
        });
    }
};
