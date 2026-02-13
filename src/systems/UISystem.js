import { CONFIG } from '../config/index.js';
import { Utils } from '../utils/index.js';

export const UISystem = {
    populateUpgradeMenu() { 
        const container = this.dom.containers.upgradeOptions; 
        container.innerHTML = ''; 
        const choices = this.getUpgradeChoices(); 
        choices.forEach(upgrade => { 
            if (!upgrade) return; 
            const div = document.createElement('div'); 
            div.className = 'upgrade-option' + (upgrade.type === 'evolution' ? ' evolution' : '') + (upgrade.type === 'mastery' ? ' mastery' : ''); 
            
            let s;
            if (upgrade.type === 'passive') {
                s = this.passives[upgrade.id];
            } else {
                const baseId = upgrade.id.split('_')[0];
                s = this.spells[baseId];
            }

            let levelText = s && s.level > 0 ? `(Liv. ${s.level + 1})` : `(Nuovo!)`; 
            if (upgrade.type === 'evolution' || upgrade.id === 'magicMissile' || upgrade.type === 'mastery') levelText = ''; 
            div.innerHTML = `<div class="upgrade-title">${upgrade.name} ${levelText}</div><div class="upgrade-desc">${upgrade.details || upgrade.desc}</div>`; 
            div.onclick = () => { this.applyUpgrade(upgrade.id); this.hideAllPopups(); }; 
            container.appendChild(div); 
        }); 
    },
    
    populateCharacterSelection() {
        const container = this.dom.containers.characterSelectionContainer;
        container.innerHTML = '';
        const unlockedArchetypes = this.getUnlockedArchetypes();

        for (const key in CONFIG.characterArchetypes) {
            const archetype = CONFIG.characterArchetypes[key];
            const unlocked = unlockedArchetypes.has(archetype.id);
            const div = document.createElement('div');
            div.className = `character-option ${unlocked ? '' : 'locked'}`;
            div.dataset.id = archetype.id;
            div.innerHTML = `
                <h5>${archetype.name}</h5>
                <p>${archetype.desc}</p>
                <p class="character-bonus"><strong>Bonus:</strong> ${archetype.bonus}</p>
                <p class="character-malus"><strong>Malus:</strong> ${archetype.malus}</p>
                ${archetype.cost > 0 ? `<p class="character-cost">Costo: ${archetype.cost} 💎</p>` : ''}
                <button class="buy-archetype-btn" style="display:${!unlocked && archetype.cost > 0 ? 'block' : 'none'}" ${this.totalGems < archetype.cost ? 'disabled' : ''}>Sblocca</button>
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
    
    populateAchievements() {
        if (!this.achievementSystem || !this.dom.containers.achievementsList) return;
        
        const container = this.dom.containers.achievementsList;
        container.innerHTML = '';
        
        const progress = this.achievementSystem.getProgress();
        
        const progressPara = document.createElement('p');
        progressPara.style.cssText = 'margin-bottom: 12px; color: var(--text-muted-color);';
        progressPara.textContent = `Progresso: ${progress.unlocked}/${progress.total} (${progress.percentage}%)`;
        container.appendChild(progressPara);
        
        // Lista achievements
        Object.values(this.achievementSystem.achievements).forEach(achievement => {
            const div = document.createElement('div');
            div.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            
            const progress = achievement.bestValue ?? achievement.currentValue ?? 0;
            const target = Array.isArray(achievement.thresholds) && achievement.thresholds.length > 0
                ? Math.max(...achievement.thresholds)
                : 1;
            const progressPercent = target > 0 ? Math.min(100, (progress / target) * 100) : 0;
            const rewardGems = achievement.reward?.gems ?? (achievement.tier + 1) * 5;
            
            div.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <h4 class="achievement-name">${achievement.name}</h4>
                    <p class="achievement-description">${achievement.description}</p>
                    <div class="achievement-progress">
                        <div class="achievement-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <span style="font-size:12px;">${progress}/${target}</span>
                    <div class="achievement-reward">
                        <span>💰 ${rewardGems} gemme</span>
                    </div>
                </div>
                <div class="achievement-status">
                    ${achievement.unlocked ? '✅' : '🔒'}
                </div>
            `;
            
            container.appendChild(div);
        });
    },
    
    populateStageSelection() {
        const dropdown = this.dom.containers.stageDropdown;
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
                return `Sopravvivi ${Math.floor(requirement.time / 60)} min in Stage ${requirement.stage}`;
            case 'boss_kill':
                return `Uccidi ${requirement.count} boss in Stage ${requirement.stage}`;
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
    },

    showPopup(popupKey) { 
        if (popupKey === 'settings') {
            /* settings overlay: no state change */
        } else if (popupKey !== 'upgrade' && popupKey !== 'shop') {
            this.state = (popupKey === 'gameOver' || popupKey === 'start') ? popupKey : 'paused';
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
        // Popola la lista dei materiali per core
        this.populateMaterialsList('coreMaterialsList', CONFIG.materials.coreMaterials);
        
        // Popola la lista dei materiali per armi
        this.populateMaterialsList('weaponMaterialsList', CONFIG.materials.weaponMaterials);
        
        // Popola la lista dei core disponibili
        this.populateCraftingList('coresList', CONFIG.cores, 'core');
        
        // Popola la lista delle armi disponibili
        this.populateCraftingList('weaponsList', CONFIG.weapons, 'weapon');
        
        // Popola l'arsenale
        this.populateArsenal();
    },
    
    populateMaterialsList(containerId, materialsConfig) {
        const container = this.dom.containers[containerId];
        if (!container) return;
        
        let html = '';
        let hasMaterials = false;
        
        for (const [materialId, material] of Object.entries(materialsConfig)) {
            const count = this.materials[materialId] || 0;
            if (count > 0) {
                hasMaterials = true;
                html += `
                    <div class="material-item">
                        <div class="material-icon" style="background-color: ${material.color}">
                            ${material.name.charAt(0)}
                        </div>
                        <div class="material-info">
                            <div class="material-name">${material.name}</div>
                            <div class="material-count">Quantità: ${count}</div>
                        </div>
                        <div class="material-rarity rarity-${material.rarity}">
                            ${material.rarity}
                        </div>
                    </div>
                `;
            }
        }
        
        if (!hasMaterials) {
            html = '<div class="empty-inventory">Nessun materiale disponibile</div>';
        }
        
        container.innerHTML = html;
    },
    
    populateCraftingList(containerId, itemsConfig, type) {
        const container = this.dom.containers[containerId];
        if (!container) return;
        
        let html = '';
        let hasItems = false;
        
        for (const [itemId, item] of Object.entries(itemsConfig)) {
            const canCraft = type === 'core' ? this.canCraftCore(itemId) : this.canCraftWeapon(itemId);
            const materialsText = this.getMaterialsRequiredText(itemId, type);
            
            // Informazioni sul livello e stato
            let statusText = '';
            let buttonText = 'Crea';
            
            if (type === 'core') {
                const coreData = this.cores[itemId];
                if (coreData) {
                    statusText = `<div class="item-status">Posseduto (Livello ${coreData.level})</div>`;
                    buttonText = 'Già posseduto';
                }
            } else {
                const weaponData = this.weapons[itemId];
                if (weaponData) {
                    statusText = `<div class="item-status">Livello ${weaponData.level}/${item.maxLevel}</div>`;
                    if (weaponData.level >= item.maxLevel) {
                        buttonText = 'Livello massimo';
                    } else {
                        buttonText = 'Potenziamento';
                    }
                }
            }
            
            html += `
                <div class="crafting-item">
                    <h5>${item.name}</h5>
                    <p>${item.desc}</p>
                    ${statusText}
                    <div class="materials-required">${materialsText}</div>
                    <button class="craft-btn" ${canCraft ? '' : 'disabled'} 
                            data-item-id="${itemId}" data-item-type="${type}">
                        ${buttonText}
                    </button>
                </div>
            `;
            hasItems = true;
        }
        
        if (!hasItems) {
            html = '<div class="empty-inventory">Nessun oggetto disponibile</div>';
        }
        
        container.innerHTML = html;
        
        // Aggiungi event listeners ai pulsanti
        container.querySelectorAll('.craft-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.dataset.itemId;
                const itemType = e.target.dataset.itemType;
                
                if (itemType === 'core') {
                    this.craftCore(itemId);
                } else if (itemType === 'weapon') {
                    this.craftWeapon(itemId);
                }
                
                // Aggiorna l'inventario dopo il crafting
                this.populateInventory();
            });
        });
    },
    
    getMaterialsRequiredText(itemId, type) {
        const item = type === 'core' ? CONFIG.cores[itemId] : CONFIG.weapons[itemId];
        if (!item) return '';
        
        let materialsToCheck = item.materials;
        
        // Se è un'arma e esiste già, usa i costi di potenziamento
        if (type === 'weapon' && this.weapons[itemId]) {
            materialsToCheck = item.upgradeCost;
        }
        
        if (!materialsToCheck) return '';
        
        const materials = [];
        for (const [materialId, amount] of Object.entries(materialsToCheck)) {
            const material = CONFIG.materials.coreMaterials[materialId] || CONFIG.materials.weaponMaterials[materialId];
            const current = this.materials[materialId] || 0;
            const color = current >= amount ? '#2ecc71' : '#e74c3c';
            materials.push(`<span style="color: ${color}">${material.name}: ${current}/${amount}</span>`);
        }
        
        return materials.join(', ');
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
    
    populateArsenal() {
        // Popola core attivo
        this.populateActiveCore();
        
        // Popola armi attive
        this.populateActiveWeapons();
        
        // Popola core disponibili
        this.populateAvailableCores();
        
        // Popola armi disponibili
        this.populateAvailableWeapons();
    },
    
    populateActiveCore() {
        const container = document.getElementById('activeCoreDisplay');
        if (!container) return;
        
        if (this.arsenal.activeCore) {
            const core = CONFIG.cores[this.arsenal.activeCore];
            const coreData = this.cores[this.arsenal.activeCore];
            
            container.innerHTML = `
                <div class="active-item">
                    <h6>${core.name}</h6>
                    <p>${core.desc}</p>
                    <div class="item-level">Livello ${coreData.level}</div>
                    <button class="unequip-btn" data-item-id="${this.arsenal.activeCore}" data-item-type="core">
                        Rimuovi
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = '<div class="no-item">Nessun core equipaggiato</div>';
        }
        
        // Aggiungi event listeners
        container.querySelectorAll('.unequip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.dataset.itemId;
                const itemType = e.target.dataset.itemType;
                
                if (itemType === 'core') {
                    this.unequipCore(itemId);
                }
                
                this.populateArsenal();
            });
        });
    },
    
    populateActiveWeapons() {
        const container = document.getElementById('activeWeaponsDisplay');
        if (!container) return;
        
        if (this.arsenal.activeWeapons.length > 0) {
            let html = '';
            for (const weaponId of this.arsenal.activeWeapons) {
                const weapon = CONFIG.weapons[weaponId];
                const weaponData = this.weapons[weaponId];
                
                html += `
                    <div class="active-item">
                        <h6>${weapon.name}</h6>
                        <p>${weapon.desc}</p>
                        <div class="item-level">Livello ${weaponData.level}/${weapon.maxLevel}</div>
                        <button class="unequip-btn" data-item-id="${weaponId}" data-item-type="weapon">
                            Rimuovi
                        </button>
                    </div>
                `;
            }
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div class="no-item">Nessuna arma equipaggiata</div>';
        }
        
        // Aggiungi event listeners
        container.querySelectorAll('.unequip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.dataset.itemId;
                const itemType = e.target.dataset.itemType;
                
                if (itemType === 'weapon') {
                    this.unequipWeapon(itemId);
                }
                
                this.populateArsenal();
            });
        });
    },
    
    populateAvailableCores() {
        const container = document.getElementById('availableCoresDisplay');
        if (!container) return;
        
        let html = '';
        for (const [coreId, coreData] of Object.entries(this.cores)) {
            const core = CONFIG.cores[coreId];
            
            html += `
                <div class="available-item ${coreData.equipped ? 'equipped' : ''}">
                    <h6>${core.name}</h6>
                    <p>${core.desc}</p>
                    <div class="item-level">Livello ${coreData.level}</div>
                    <button class="equip-btn" data-item-id="${coreId}" data-item-type="core" ${coreData.equipped ? 'disabled' : ''}>
                        ${coreData.equipped ? 'Equipaggiato' : 'Equipaggia'}
                    </button>
                </div>
            `;
        }
        
        if (!html) {
            html = '<div class="no-item">Nessun core posseduto</div>';
        }
        
        container.innerHTML = html;
        
        // Aggiungi event listeners
        container.querySelectorAll('.equip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.dataset.itemId;
                const itemType = e.target.dataset.itemType;
                
                if (itemType === 'core') {
                    this.equipCore(itemId);
                }
                
                this.populateArsenal();
            });
        });
    },
    
    populateAvailableWeapons() {
        const container = document.getElementById('availableWeaponsDisplay');
        if (!container) return;
        
        let html = '';
        for (const [weaponId, weaponData] of Object.entries(this.weapons)) {
            const weapon = CONFIG.weapons[weaponId];
            
            html += `
                <div class="available-item ${weaponData.equipped ? 'equipped' : ''}">
                    <h6>${weapon.name}</h6>
                    <p>${weapon.desc}</p>
                    <div class="item-level">Livello ${weaponData.level}/${weapon.maxLevel}</div>
                    <button class="equip-btn" data-item-id="${weaponId}" data-item-type="weapon" ${weaponData.equipped ? 'disabled' : ''}>
                        ${weaponData.equipped ? 'Equipaggiata' : 'Equipaggia'}
                    </button>
                </div>
            `;
        }
        
        if (!html) {
            html = '<div class="no-item">Nessuna arma posseduta</div>';
        }
        
        container.innerHTML = html;
        
        // Aggiungi event listeners
        container.querySelectorAll('.equip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.dataset.itemId;
                const itemType = e.target.dataset.itemType;
                
                if (itemType === 'weapon') {
                    this.equipWeapon(itemId);
                }
                
                this.populateArsenal();
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
            <div class="run-stat-item">Punteggio <span>${this.score}</span></div>
            <div class="run-stat-item">Nemici <span>${this.entities.enemies.length + this.entities.bosses.length}</span></div>
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
        if(debugCode) {
            navigator.clipboard.writeText(debugCode).then(() => {
                this.notifications.push({ text: "Codice Debug Copiato!", life: 120 });
            });
        }
    },

    populateShop() { 
        if (this.dom.totalGemsShop) this.dom.totalGemsShop.textContent = this.totalGems; 
        const container = this.dom.containers.permanentUpgradeOptions; 
        if (!container) return;
        
        // Inizializza il pulsante di chiusura se non è già stato fatto
        this.initShopCloseButton();
        
        container.innerHTML = ''; 
        
        // Aggiungi messaggio se non ci sono cristalli
        if (this.totalGems === 0) {
            container.innerHTML = `<div class="zero-gems-message">
                💎 Non hai ancora cristalli! Completa partite per guadagnarne.
            </div>`;
            return;
        }
        
        let availableUpgrades = 0;
        
        for (const key in this.permanentUpgrades) { 
            const upg = this.permanentUpgrades[key]; 
            const cost = Math.floor(upg.baseCost * Math.pow(upg.costGrowth, upg.level));
            
            // Conta upgrade disponibili
            if (upg.level < upg.maxLevel) {
                availableUpgrades++;
            }
            
            let costColor = this.totalGems < cost ? '#e74c3c' : '#fff';
            let optionHTML = `<div class="permanent-upgrade-option">
                <div>
                    <div class="upgrade-title">${upg.name}</div>
                    <div class="perm-upgrade-level">Livello: ${upg.level} / ${upg.maxLevel}</div>
                    <div class="upgrade-desc">Effetto attuale: ${upg.effect(upg.level)}</div>
                </div>`;
            if (upg.level < upg.maxLevel) {
                optionHTML += `<div>
                    <div class="perm-upgrade-cost" style="color:${costColor}">Costo: ${cost} 💎</div>
                    <button class="buy-button" data-key="${key}" ${this.totalGems < cost ? 'disabled' : ''}>
                        ${this.totalGems < cost ? 'Cristalli Insufficienti' : 'Compra'}
                    </button>
                </div>`;
            } else {
                optionHTML += `<div class="max-level-indicator">MAX</div>`;
            }
            optionHTML += `</div>`;
            container.innerHTML += optionHTML;
        } 
        
        container.querySelectorAll('.buy-button').forEach(btn => { 
            btn.onclick = () => this.buyPermanentUpgrade(btn.dataset.key); 
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
            div.className = 'upgrade-option' + (upgrade.type === 'evolution' ? ' evolution' : '') + (upgrade.type === 'mastery' ? ' mastery' : '');
            let s;
            if (upgrade.type === 'passive') {
                s = this.passives[upgrade.id];
            } else {
                const baseId = upgrade.id.split('_')[0];
                s = this.spells[baseId];
            }
            let levelText = s && s.level > 0 ? `(Liv. ${s.level + 1})` : `(Nuovo!)`;
            if (upgrade.type === 'evolution' || upgrade.id === 'magicMissile' || upgrade.type === 'mastery') levelText = '';
            div.innerHTML = `<div class="upgrade-title">${upgrade.name} ${levelText}</div><div class="upgrade-desc">${upgrade.details || upgrade.desc}</div>`;
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
    }
};
