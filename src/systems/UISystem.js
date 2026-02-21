import { CONFIG } from '../config/index.js';
import { Utils } from '../utils/index.js';
import * as InventoryUI from '../ui/InventoryUI.js';
import { searchTerms, getAllTerms } from '../data/glossary.js';
import { getUpgradeIcon, getGlossaryIcon, getItemIcon, ICONS } from '../data/icons.js';

export const UISystem = {
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

    populateCharacterSelection() {
        const container = this.dom.containers.characterSelectionContainer;
        container.innerHTML = '';
        const unlockedArchetypes = this.getUnlockedArchetypes();

        for (const key in CONFIG.characterArchetypes) {
            const archetype = CONFIG.characterArchetypes[key];
            const unlocked = unlockedArchetypes.has(archetype.id);
            const div = document.createElement('div');
            const archIcon = ICONS[archetype.id] || '🔵';
            div.className = `character-option ${unlocked ? '' : 'locked'}`;
            div.dataset.id = archetype.id;
            div.innerHTML = `
                <span class="character-option-icon">${archIcon}</span>
                <div class="character-option-content">
                <h5>${archetype.name}</h5>
                <p>${archetype.desc}</p>
                <p class="character-bonus"><strong>Bonus:</strong> ${archetype.bonus}</p>
                <p class="character-malus"><strong>Malus:</strong> ${archetype.malus}</p>
                ${archetype.cost > 0 ? `<p class="character-cost">Costo: ${archetype.cost} 💎</p>` : ''}
                <button class="buy-archetype-btn" style="display:${!unlocked && archetype.cost > 0 ? 'block' : 'none'}" ${this.totalGems < archetype.cost ? 'disabled' : ''}>Sblocca</button>
                </div>
            `;
            div.onclick = () => {
                if (unlockedArchetypes.has(archetype.id)) {
                    this.selectCharacter(archetype.id);
                    this.hideCharacterPopup();
                }
            };
            // Gestione acquisto
            const buyBtn = div.querySelector('.buy-archetype-btn');
            if (buyBtn) {
                buyBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (this.totalGems >= archetype.cost) {
                        this.totalGems -= archetype.cost;
                        this.unlockedArchetypes.add(archetype.id);
                        this.saveGameData?.();
                        this.populateCharacterSelection();
                        this.updateCharacterPreview();
                        this.notifications.push({ text: `${archetype.name} sbloccato!`, life: 120 });
                        this.dom.totalGemsShop.textContent = this.totalGems;
                    } else {
                        this.notifications.push({ text: `Non hai abbastanza gemme!`, life: 120 });
                        buyBtn.disabled = true;
                        setTimeout(() => { buyBtn.disabled = this.totalGems < archetype.cost; }, 1000);
                    }
                };
            }
            container.appendChild(div);
        }
        this.selectCharacter(this.selectedArchetype);
    },

    selectCharacter(archetypeId) {
        const unlockedArchetypes = this.getUnlockedArchetypes();
        if (!unlockedArchetypes.has(archetypeId)) return;
        this.selectedArchetype = archetypeId;
        document.querySelectorAll('.character-option').forEach(el => {
            el.classList.remove('selected');
        });
        const selectedElement = document.querySelector(`.character-option[data-id="${archetypeId}"]`);
        if (selectedElement) {
            selectedElement.classList.add('selected');
        }
        this.updateCharacterPreview();
    },

    updateCharacterPreview() {
        const preview = this.dom.containers.selectedCharacterPreview;
        const archetype = CONFIG.characterArchetypes[this.selectedArchetype];

        if (preview && archetype) {
            preview.innerHTML = `
                <h5>${archetype.name}</h5>
                <p>${archetype.desc}</p>
                <p class="character-bonus"><strong>Bonus:</strong> ${archetype.bonus}</p>
                <p class="character-malus"><strong>Malus:</strong> ${archetype.malus}</p>
            `;
        }
    },

    showCharacterPopup() {
        this.showPopup('characterSelection');
        this.populateCharacterSelection();
    },

    hideCharacterPopup() {
        this.hideAllPopups();
        this.showPopup('start'); // Torna al menù principale
    },

    showAchievements() {
        this.populateAchievements();
        this.showPopup('achievements');
    },

    showGlossary() {
        this.populateGlossary();
        this.showPopup('glossary');
        this._wireGlossaryHandlers();
    },
    hideGlossary() {
        this.hideAllPopups();
        this.showPopup('start');
    },
    populateGlossary() {
        const container = document.getElementById('glossaryContent');
        if (!container) return;
        const searchInput = document.getElementById('glossarySearch');
        const categorySelect = document.getElementById('glossaryCategory');
        const query = searchInput?.value?.trim() || '';
        const category = categorySelect?.value || '';
        let terms = query ? searchTerms(query) : getAllTerms();
        if (category) terms = terms.filter((t) => t.category === category);
        container.innerHTML = '';
        const catLabels = { base: 'Base', combattimento: 'Combattimento', spell: 'Spell', equip: 'Equipaggiamento', progressione: 'Progressione' };
        const byCat = {};
        terms.forEach((t) => {
            if (!byCat[t.category]) byCat[t.category] = [];
            byCat[t.category].push(t);
        });
        Object.keys(byCat).sort().forEach((cat) => {
            const h = document.createElement('h4');
            h.className = 'glossary-category-title';
            h.textContent = catLabels[cat] || cat;
            container.appendChild(h);
            byCat[cat].forEach((t) => {
                const div = document.createElement('div');
                div.className = 'glossary-term';
                const icon = getGlossaryIcon(t.id);
                div.innerHTML = `<span class="glossary-term-icon">${icon}</span><div class="glossary-term-text"><strong>${t.name}</strong><p>${t.desc}</p></div>`;
                container.appendChild(div);
            });
        });
        if (terms.length === 0) {
            const p = document.createElement('p');
            p.className = 'glossary-empty';
            p.textContent = 'Nessun termine trovato.';
            container.appendChild(p);
        }
    },
    _wireGlossaryHandlers() {
        const searchInput = document.getElementById('glossarySearch');
        const categorySelect = document.getElementById('glossaryCategory');
        if (!searchInput || !categorySelect) return;
        const refresh = () => this.populateGlossary();
        searchInput.oninput = refresh;
        searchInput.onchange = refresh;
        categorySelect.onchange = refresh;
    },

    populateAchievements() {
        if (!this.achievementSystem || !this.dom.containers.achievementsList) return;

        const container = this.dom.containers.achievementsList;
        container.innerHTML = '';

        const allAchievements = Object.values(this.achievementSystem.achievements);
        const progress = this.achievementSystem.getProgress();
        const totalTiers = allAchievements.reduce((sum, a) => sum + a.thresholds.length, 0);
        const completedTiers = allAchievements.reduce((sum, a) => sum + (a.tier || 0), 0);

        // Header con barra di progresso globale
        const header = document.createElement('div');
        header.style.cssText = 'margin-bottom:16px;text-align:center;';
        const globalPercent = totalTiers > 0 ? Math.round((completedTiers / totalTiers) * 100) : 0;
        header.innerHTML = `
            <div style="font-size:14px;color:var(--text-muted-color);margin-bottom:8px;">
                🏆 ${progress.unlocked}/${progress.total} sbloccati · ${completedTiers}/${totalTiers} tier completati
            </div>
            <div style="background:rgba(255,255,255,0.1);border-radius:8px;height:8px;overflow:hidden;">
                <div style="height:100%;width:${globalPercent}%;background:linear-gradient(90deg,#cd7f32,#c0c0c0,#ffd700);border-radius:8px;transition:width 0.3s;"></div>
            </div>
        `;
        container.appendChild(header);

        // Lista achievements
        allAchievements.forEach(achievement => {
            const isSecret = achievement.secret && !achievement.unlocked;
            const div = document.createElement('div');
            div.style.cssText = `display:flex;align-items:center;gap:12px;padding:10px 12px;margin-bottom:6px;border-radius:8px;background:${achievement.unlocked ? 'rgba(76,175,80,0.12)' : 'rgba(255,255,255,0.04)'};border:1px solid ${achievement.unlocked ? 'rgba(76,175,80,0.3)' : 'rgba(255,255,255,0.08)'};${isSecret ? 'opacity:0.5;' : ''}`;

            // Calcola progresso verso il prossimo tier
            const currentTier = achievement.tier || 0;
            const bestVal = achievement.bestValue ?? achievement.currentValue ?? 0;
            const nextThreshold = achievement.thresholds[currentTier] ?? achievement.thresholds[achievement.thresholds.length - 1];
            const prevThreshold = currentTier > 0 ? achievement.thresholds[currentTier - 1] : 0;
            const range = nextThreshold - prevThreshold;
            const progressInRange = bestVal - prevThreshold;
            const tierPercent = range > 0 ? Math.min(100, Math.max(0, (progressInRange / range) * 100)) : (achievement.unlocked ? 100 : 0);

            // Tier badges
            const tierBadges = ['🥉', '🥈', '🥇'];
            let badgesHtml = '';
            for (let t = 0; t < achievement.thresholds.length; t++) {
                if (currentTier > t) {
                    badgesHtml += `<span style="font-size:14px;">${tierBadges[t] || '⭐'}</span>`;
                } else {
                    badgesHtml += `<span style="font-size:14px;opacity:0.2;">${tierBadges[t] || '⭐'}</span>`;
                }
            }

            // Gems per il prossimo tier
            const gemRewards = achievement.gemReward || [5, 15, 50];
            const nextGem = gemRewards[currentTier] || gemRewards[gemRewards.length - 1] || 5;

            // Color della barra
            const barColor = currentTier >= 2 ? '#ffd700' : currentTier >= 1 ? '#c0c0c0' : '#cd7f32';

            const name = isSecret ? '???' : achievement.name;
            const desc = isSecret ? 'Achievement segreto' : achievement.description;
            const icon = isSecret ? '❓' : achievement.icon;

            div.innerHTML = `
                <div style="font-size:28px;min-width:36px;text-align:center;">${icon}</div>
                <div style="flex:1;min-width:0;">
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
                        <span style="font-weight:600;font-size:13px;color:${achievement.unlocked ? '#4caf50' : '#e0e0e0'};">${name}</span>
                        <span style="font-size:12px;">${badgesHtml}</span>
                    </div>
                    <div style="font-size:11px;color:var(--text-muted-color);margin-bottom:4px;">${desc}</div>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <div style="flex:1;background:rgba(255,255,255,0.1);border-radius:4px;height:6px;overflow:hidden;">
                            <div style="height:100%;width:${tierPercent}%;background:${barColor};border-radius:4px;transition:width 0.3s;"></div>
                        </div>
                        <span style="font-size:10px;color:var(--text-muted-color);white-space:nowrap;">${isSecret ? '?' : Math.floor(bestVal)}/${isSecret ? '?' : nextThreshold}</span>
                    </div>
                </div>
                <div style="text-align:center;min-width:40px;">
                    <div style="font-size:10px;color:#ffd700;">${!isSecret ? `+${nextGem}💎` : ''}</div>
                    <div style="font-size:18px;">${achievement.unlocked ? '✅' : '🔒'}</div>
                </div>
            `;

            container.appendChild(div);
        });
    },

    populateStageSelection() {
        const dropdown = this.dom.containers.stageDropdown;
        if (!dropdown || !CONFIG.stages) return;
        dropdown.innerHTML = '';

        Object.keys(CONFIG.stages).forEach(stageId => {
            const stage = CONFIG.stages[stageId];
            const option = document.createElement('option');
            option.value = stageId;
            option.textContent = stage.name;
            option.disabled = !stage.unlocked;

            if (!stage.unlocked) {
                option.textContent += ` (${this.getUnlockRequirementText(stage.unlockRequirement)})`;
            }

            dropdown.appendChild(option);
        });

        // Imposta il valore selezionato
        dropdown.value = this.selectedStage;
    },

    selectStage(stageId) {
        this.selectedStage = parseInt(stageId);
        this.dom.containers.stageDropdown.value = this.selectedStage;
    },

    getUnlockRequirementText(requirement) {
        if (!requirement) return 'Sempre disponibile';

        switch (requirement.type) {
            case 'craft_core':
                const core = CONFIG.cores[requirement.coreId];
                return `Crea il ${core ? core.name : 'Core'}`;
            case 'craft_weapon':
                const weapon = CONFIG.weapons[requirement.weaponId];
                return `Crea le ${weapon ? weapon.name : 'Armi'}`;
            case 'kill_elites':
                return `Uccidi ${requirement.count} elite in Stage ${requirement.stage}`;
            case 'reach_level':
                return `Raggiungi livello ${requirement.level}`;
            case 'arsenal_size':
                return `Possiedi almeno ${requirement.cores} core e ${requirement.weapons} armi`;
            case 'survival':
                if (requirement.stage) {
                    const stageName = CONFIG.stages[requirement.stage]?.name || `Stage ${requirement.stage}`;
                    return `Sopravvivi ${Math.floor(requirement.time / 60)} min in ${stageName}`;
                }
                return `Sopravvivi ${Math.floor(requirement.time / 60)} minuti`;
            case 'boss_kill':
                return `Uccidi ${requirement.count} boss in Stage ${requirement.stage}`;
            case 'boss_kill_total':
                return `Uccidi ${requirement.count} boss in totale`;
            case 'total_time':
                return `Gioca ${Math.floor(requirement.time / 60)} min totali`;
            default:
                return 'Sconosciuto';
        }
    },

    returnToStartScreen() {
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
        } else if (popupKey !== 'upgrade' && popupKey !== 'shop') {
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
        }
        if (popupKey === 'pause') {
            this.populateStatsMenu();
        }
    },

    showInventory() {
        console.log('showInventory chiamato');
        console.log('Popup inventory:', this.dom.popups.inventory);
        console.log('Materiali:', this.materials);

        this.showPopup('inventory');
        this.populateInventory();
        this.setupInventoryTabs();

        console.log('Inventario popolato');
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

    setupInventoryTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');

                // Rimuovi la classe active da tutti i tab
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Aggiungi la classe active al tab selezionato
                button.classList.add('active');
                document.getElementById(targetTab + 'Tab').classList.add('active');
            });
        });
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
            <div class="run-stat-item">Tempo <span>${Math.floor(this.totalElapsedTime)}s</span></div>
            <div class="run-stat-item">Livello <span>${this.player?.level ?? 1}</span></div>
            <div class="run-stat-item">Punteggio <span>${this.score}</span></div>
            <div class="run-stat-item">Nemici sconfitti <span>${this.enemiesKilled ?? 0}</span></div>
            <div class="run-stat-item">Cristalli <span>${this.gemsThisRun} 💎</span></div>
        `;

        const p = this.player;
        let playerHTML = `<div class="stats-section"><div class="stats-section-title">${p.archetype.name}</div>`;
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.health}<span class="stat-item-label">Salute:</span><span class="stat-item-value">${Math.floor(p.hp)} / ${p.stats.maxHp}</span></div>`;
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.speed}<span class="stat-item-label">Velocità:</span><span class="stat-item-value">${p.stats.speed.toFixed(1)}</span></div>`;
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.defense}<span class="stat-item-label">Rid. Danni:</span><span class="stat-item-value">${Math.round(p.stats.dr * 100)}%</span></div></div>`;
        playerHTML += `<div class="stats-section"><div class="stats-section-title">Modificatori</div>`;
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.power}<span class="stat-item-label">Potenza:</span><span class="stat-item-value">${Math.round((p.modifiers.power - 1) * 100)}%</span></div>`;
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.frequency}<span class="stat-item-label">Frequenza:</span><span class="stat-item-value">${Math.round((1 - p.modifiers.frequency) * 100)}%</span></div>`;
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.area}<span class="stat-item-label">Area:</span><span class="stat-item-value">${Math.round((p.modifiers.area - 1) * 100)}%</span></div>`;
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.xpGain}<span class="stat-item-label">Guadagno XP:</span><span class="stat-item-value">${Math.round((p.modifiers.xpGain - 1) * 100)}%</span></div>`;
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.luck}<span class="stat-item-label">Fortuna:</span><span class="stat-item-value">${Math.round(p.modifiers.luck * 100)}%</span></div></div>`;
        this.dom.playerStatsColumn.innerHTML = playerHTML;

        let weaponsHTML = `<div class="stats-section"><div class="stats-section-title">Armi e Abilità</div>`;
        let hasWeapons = false;
        Object.values(this.spells).filter(s => s.level > 0).forEach(s => {
            hasWeapons = true;
            weaponsHTML += `<div class="stat-item-title">${s.name} (Liv. ${s.level}) ${s.evolution !== 'none' ? `[EVO]` : ''}</div>`;
            let details = '';
            if (s.damage) details += `Danno: ${Math.round(this.getDamage(s.damage))}, `;
            if (s.cooldown) details += `Ricarica: ${(s.cooldown * p.modifiers.frequency / 1000).toFixed(2)}s, `;
            weaponsHTML += `<div class="weapon-stat-details">${details.slice(0, -2) || 'Statistiche base'}</div>`;
        });
        if (!hasWeapons) weaponsHTML += `<div>Nessuna abilità acquisita.</div>`;
        weaponsHTML += `</div>`;
        this.dom.weaponsStatsColumn.innerHTML = weaponsHTML;

        // ANALYTICS VERSIONE 5.4: Statistiche di bilanciamento
        if (this.analyticsManager) {
            const report = this.analyticsManager.getAnalyticsReport();
            const scores = this.analyticsManager.getAllArchetypeScores();

            let analyticsHTML = `<div class="stats-section"><div class="stats-section-title">📊 Analytics Bilanciamento</div>`;
            analyticsHTML += `<div class="stat-item">Sessione Corrente: <span>${p.archetype.id}</span></div>`;
            analyticsHTML += `<div class="stat-item">Score Archetipo: <span>${(scores[p.archetype.id] || 0.5).toFixed(2)}</span></div>`;
            analyticsHTML += `<div class="stat-item">Partite Totali: <span>${report.sessionStats.totalSessions}</span></div>`;
            analyticsHTML += `<div class="stat-item">Tempo Medio: <span>${Math.floor(report.sessionStats.avgSessionTime)}s</span></div>`;

            // Mostra raccomandazioni di bilanciamento
            if (report.recommendations.length > 0) {
                analyticsHTML += `<div class="stat-item">Raccomandazioni: <span style="color: #ff6b6b;">${report.recommendations.length} pending</span></div>`;
            }
            analyticsHTML += `</div>`;

            // Aggiungi analytics alla colonna delle armi se esiste
            if (this.dom.weaponsStatsColumn) {
                this.dom.weaponsStatsColumn.innerHTML += analyticsHTML;
            }
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

    populateShop() {
        if (this.dom.totalGemsShop) this.dom.totalGemsShop.textContent = this.totalGems;
        const container = this.dom.containers.permanentUpgradeOptions;
        if (!container) return;

        this.initShopCloseButton();
        container.innerHTML = '';

        if (!this.metaProgressionSystem) {
            console.error("MetaProgressionSystem non trovato!");
            return;
        }

        const skillTree = CONFIG.skillTree;

        for (const [nodeId, nodeData] of Object.entries(skillTree)) {
            const currentLevel = this.metaProgressionSystem.getUnlockedLevel(nodeId);
            const isMax = currentLevel >= nodeData.maxLevel;
            const canUnlock = this.metaProgressionSystem.canUnlockNode(nodeId);
            const cost = this.metaProgressionSystem.getNodeCost(nodeId);
            const isLocked = !canUnlock && currentLevel === 0;

            let costColor = this.totalGems < cost ? '#e74c3c' : '#fff';
            let btnHTML = '';

            if (isMax) {
                btnHTML = `<button class="skill-node-btn max-level" disabled>Assimilato</button>`;
            } else if (isLocked) {
                btnHTML = `<button class="skill-node-btn locked" disabled>Bloccato</button>`;
            } else {
                btnHTML = `<div class="skill-node-cost" style="color:${costColor}">${cost} 💎</div>
                           <button class="skill-node-btn buy-button" data-key="${nodeId}" ${this.totalGems < cost ? 'disabled' : ''}>
                               ${this.totalGems < cost ? 'Cristalli Insuff.' : 'Sblocca'}
                           </button>`;
            }

            const nodeHTML = `
                <div class="skill-node ${isLocked ? 'locked' : ''} ${isMax ? 'max-level' : ''}">
                    <div class="skill-node-header">
                        <div class="skill-node-icon">${nodeData.icon || '✨'}</div>
                        <div class="skill-node-level">${currentLevel}/${nodeData.maxLevel}</div>
                    </div>
                    <div class="skill-node-title">${nodeData.name}</div>
                    <div class="skill-node-desc">${nodeData.desc}</div>
                    ${btnHTML}
                </div>
            `;
            container.innerHTML += nodeHTML;
        }

        container.querySelectorAll('.buy-button').forEach(btn => {
            btn.onclick = () => {
                const nodeId = btn.dataset.key;
                if (this.metaProgressionSystem.unlockNode(nodeId)) {
                    this.totalGems = this.game.totalGems; // Sync totalGems back
                    this.saveGameData();
                    if (this.game.audio) this.game.audio.playLevelUp(); // Suono generico per lo sblocco
                    this.populateShop(); // Aggiorna UI
                }
            };
        });
    },

    initShopCloseButton() {
        // Setup close button se non è già stato fatto
        const closeBtn = document.getElementById('closeShopBtn');
        if (closeBtn && !closeBtn.hasAttribute('data-initialized')) {
            closeBtn.setAttribute('data-initialized', 'true');
            closeBtn.addEventListener('click', () => {
                this.hideAllPopups();
            });
        }
    },

    showBossUpgradePopup() {
        // Mostra popup con scelta upgrade passivo extra (overcap)
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
            const icon = getUpgradeIcon(upgrade.id, upgrade);
            div.innerHTML = `<div class="upgrade-option-icon">${icon}</div><div class="upgrade-option-text"><div class="upgrade-title">${upgrade.name} ${levelText}</div><div class="upgrade-desc">${upgrade.details || upgrade.desc}</div></div>`;
            div.onclick = () => { this.applyBossUpgrade(upgrade.id); this.hideAllPopups(); };
            container.appendChild(div);
        });
    },

    getBossUpgradeChoices() {
        // Permettiamo l'overcap: includi tutti i passivi, anche se già maxati
        const upgradeTree = CONFIG.upgradeTree;
        const passives = Object.values(upgradeTree).filter(u => u.type === 'passive');
        // Scegli 3 a caso
        const shuffled = passives.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 3);
    },

    applyBossUpgrade(upgradeId) {
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
        target.level++;
        this.notifications.push({ text: `Upgrade boss: ${upgrade.name}!`, life: 180 });
    },

    // --- BESTIARY & HISTORY ---

    showBestiary() {
        this.populateBestiary();
        this.showPopup('bestiary');
    },

    hideBestiary() {
        this.hideAllPopups();
        this.showPopup('start');
    },

    populateBestiary() {
        const container = document.getElementById('bestiaryGrid');
        if (!container || !this.bestiarySystem) return;
        container.innerHTML = '';

        const data = this.bestiarySystem.getAllEntries();
        const stageInfo = CONFIG.stages[this.selectedStage] || {}; // Use current selected stage as context or just generic list
        // Note: For a global bestiary, we might want to iterate over all KNOWN enemy definitions or iterate over the data we have.
        // Let's iterate over keys in data.

        const sortedKeys = Object.keys(data).sort();
        if (sortedKeys.length === 0) {
            container.innerHTML = '<div class="empty-state">Nessun nemico scoperto ancora!</div>';
            return;
        }

        sortedKeys.forEach(type => {
            const entry = data[type];
            // Try to find display name from somewhere. 
            // We might need a lookup map for enemy names if not in the entity itself.
            // For now, capitalize ID.
            const name = type.charAt(0).toUpperCase() + type.slice(1);

            const div = document.createElement('div');
            div.className = 'bestiary-card';

            // Icon logic (simplified)
            let icon = '👾';
            if (type.includes('boss')) icon = '💀';
            else if (type.includes('bat')) icon = '🦇';
            else if (type.includes('slime')) icon = '🦠';
            else if (type.includes('ghost')) icon = '👻';
            else if (type.includes('snake')) icon = '🐍';
            else if (type.includes('tank')) icon = '🛡️';

            div.innerHTML = `
                <div class="bestiary-icon">${icon}</div>
                <div class="bestiary-info">
                    <div class="bestiary-name">${name}</div>
                    <div class="bestiary-stats">Uccisioni: ${entry.kills}</div>
                    <div class="bestiary-stats">Max/Run: ${entry.maxKillsInRun}</div>
                </div>
            `;
            container.appendChild(div);
        });
    },

    showRunHistory() {
        this.populateRunHistory();
        this.showPopup('runHistory');
    },

    hideRunHistory() {
        this.hideAllPopups();
        this.showPopup('start');
    },

    populateRunHistory() {
        const container = document.getElementById('runHistoryList');
        if (!container || !this.runHistorySystem) return;
        container.innerHTML = '';

        const history = this.runHistorySystem.getHistory();
        if (history.length === 0) {
            container.innerHTML = '<div class="empty-state">Nessuna partita registrata.</div>';
            return;
        }

        history.forEach(run => {
            const date = new Date(run.date).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
            const resultClass = run.result === 'Victory' ? 'victory' : 'defeat';
            const resultIcon = run.result === 'Victory' ? '🏆' : '💀';

            const div = document.createElement('div');
            div.className = `history-item ${resultClass}`;

            const archName = CONFIG.characterArchetypes[run.archetype]?.name || run.archetype;

            // Format weapons
            let weaponsHtml = '';
            run.weapons.forEach(w => {
                const icon = getUpgradeIcon(w) || '⚔️';
                weaponsHtml += `<span title="${w}">${icon}</span>`;
            });

            div.innerHTML = `
                <div class="history-header">
                    <span class="history-result">${resultIcon} ${run.result === 'Victory' ? 'Vittoria' : 'Sconfitta'}</span>
                    <span class="history-date">${date}</span>
                </div>
                <div class="history-details">
                    <div>Archetipo: <strong>${archName}</strong></div>
                    <div>Livello: ${run.level}</div>
                    <div>Tempo: ${Math.floor(run.time / 60)}:${(Math.floor(run.time) % 60).toString().padStart(2, '0')}</div>
                    <div>Score: ${run.score.toLocaleString()}</div>
                </div>
                <div class="history-weapons">
                    ${weaponsHtml}
                </div>
            `;
            container.appendChild(div);
        });
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
