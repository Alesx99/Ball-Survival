import { CONFIG } from '../config/index.js';
import { Utils } from '../utils/index.js';
import {
    Player, Enemy, Boss,
    Projectile, Aura, Orbital, StaticField, Sanctuary,
    XpOrb, GemOrb, MaterialOrb,
    Chest, DroppedItem,
    Particle, FireTrail, Effect
} from '../entities/index.js';
import { AnalyticsManager, RetentionMonitor, QuickFeedback, ProgressionOptimizer, AchievementSystem } from '../systems/index.js';

// System mixins
import { SpellSystem } from '../systems/SpellSystem.js';
import { SpawnSystem } from '../systems/SpawnSystem.js';
import { StageSystem } from '../systems/StageSystem.js';
import { WeaponSystem } from '../systems/WeaponSystem.js';
import { CraftingSystem } from '../systems/CraftingSystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { ProgressionSystem } from '../systems/ProgressionSystem.js';
import { BalanceSystem } from '../systems/BalanceSystem.js';
import { RenderSystem } from '../systems/RenderSystem.js';
import { UISystem } from '../systems/UISystem.js';
import { AudioManager } from '../systems/AudioManager.js';

export class BallSurvivalGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId); this.ctx = this.canvas.getContext('2d');
        this.initDOM();
        this.initInputHandlers();
        this.camera = { x: 0, y: 0, width: this.canvas.width, height: this.canvas.height };
        this.player = new Player();
        this.joystick = { dx: 0, dy: 0, ...this.dom.joystick };
        this._joystickPending = { dx: 0, dy: 0 };
        this._joystickRAF = null;
        this.state = 'startScreen'; 
        this.selectedArchetype = 'standard';
        this.selectedStage = 1; // Stage selezionato dal giocatore
        this.lastFrameTime = 0; 
        this.totalElapsedTime = 0; 
        this.menuCooldown = 0;
        this.materials = {}; // Inizializza l'inventario materiali
        this.cores = {}; // Inizializza i core
        this.weapons = {}; // Inizializza le armi
        this.arsenal = {
            activeCore: null, // Solo 1 core attivo
            activeWeapons: [] // Max 2 armi attive
        };
        
        // Sistemi versione 5.3
        this.retentionMonitor = new RetentionMonitor();
        this.quickFeedback = new QuickFeedback();
        this.progressionOptimizer = new ProgressionOptimizer();
        this.achievementSystem = new AchievementSystem();
        
        this.analyticsManager = new AnalyticsManager();
        this.audio = new AudioManager();
        this.audio.init();
        this._entityClasses = { Projectile, Aura, Orbital, StaticField, Sanctuary, XpOrb, GemOrb, MaterialOrb, Chest, DroppedItem, Particle, FireTrail, Effect, Boss, Enemy };
        this.unlockedArchetypes = new Set(['standard']);
        
        this.loadGameData(); 
        this.loadStageProgress(); // Carica la progressione degli stage
        this.resetRunState(); 
        this.resizeCanvas();
        this.populateCharacterSelection();
        this.populateStageSelection();
        this.updateCharacterPreview(); // Inizializza l'anteprima del personaggio
        this.showPopup('start');
        
        this.sessionStartTime = 0;
        this.lastPeriodicCloudSyncTime = 0; // Timestamp ultimo sync periodico
    }

    initDOM() {
        this.dom = {
            gameContainer: document.getElementById('gameContainer'),
            popups: { 
                start: document.getElementById('startScreen'), 
                pause: document.getElementById('pauseMenu'), 
                gameOver: document.getElementById('gameOver'), 
                upgrade: document.getElementById('upgradeMenu'), 
                shop: document.getElementById('permanentUpgradeShop'), 
                inventory: document.getElementById('inventoryMenu'), 
                characterSelection: document.getElementById('characterSelectionPopup'), 
                achievements: document.getElementById('achievementsPopup'),
                settings: document.getElementById('settingsPopup')
            },
            buttons: { 
                start: document.getElementById('startGameBtn'), 
                restart: document.getElementById('restartGameBtn'), 
                restartFromPause: document.getElementById('restartFromPauseBtn'), 
                pause: document.getElementById('pauseButton'), 
                load: document.getElementById('loadGameBtn'), 
                copy: document.getElementById('copyCodeBtn'), 
                generateDebugSave: document.getElementById('generateDebugSave'), 
                copyDebugCodeBtn: document.getElementById('copyDebugCodeBtn'), 
                returnToMenu: document.getElementById('returnToMenuBtn'), 
                returnToMenuPause: document.getElementById('returnToMenuPauseBtn'), 
                inventory: document.getElementById('inventoryBtn'), 
                closeInventory: document.getElementById('closeInventoryBtn'), 
                openCharacterPopup: document.getElementById('openCharacterPopupBtn'), 
                closeCharacterPopup: document.getElementById('closeCharacterPopupBtn'), 
                achievements: document.getElementById('achievementsBtn'), 
                closeAchievements: document.getElementById('closeAchievementsBtn'),
                settings: document.getElementById('settingsBtn'),
                closeSettings: document.getElementById('closeSettingsBtn')
            },
            inputs: { saveCode: document.getElementById('saveCodeOutput'), loadCode: document.getElementById('loadCodeInput'), debugSaveOutput: document.getElementById('debugSaveOutput') },
            containers: { 
                debugSaveContainer: document.getElementById('debugSaveContainer'),
                characterSelectionContainer: document.getElementById('characterSelectionContainer'),
                stageSelectionContainer: document.getElementById('stageSelectionContainer'),
                permanentUpgradeOptions: document.getElementById('permanentUpgradeOptions'),
                upgradeOptions: document.getElementById('upgradeOptions'),
                pauseStatsContainer: document.getElementById('pauseStatsContainer'),
                runStatsContainer: document.getElementById('runStatsContainer'),
                coreMaterialsList: document.getElementById('coreMaterialsList'),
                weaponMaterialsList: document.getElementById('weaponMaterialsList'),
                coresList: document.getElementById('coresList'),
                weaponsList: document.getElementById('weaponsList'),
                selectedCharacterPreview: document.getElementById('selectedCharacterPreview'),
                stageDropdown: document.getElementById('stageDropdown'),
                achievementsList: document.getElementById('achievementsList')
            },
            joystick: { container: document.getElementById('joystick-container'), stick: document.getElementById('joystick-stick'), active: false, radius: 60, touchId: null },
            menuOverlay: document.getElementById('menuOverlay'),
            totalGemsShop: document.getElementById('totalGemsShop'),
            playerStatsColumn: document.getElementById('playerStatsColumn'),
            weaponsStatsColumn: document.getElementById('weaponsStatsColumn'),
            loadNotification: document.getElementById('load-notification'),
            inGameUI: {
                container: document.getElementById('inGameUI'),
                timer: document.getElementById('gameTimer'),
                xpBarFill: document.getElementById('xpBarFill'),
                xpBarText: document.getElementById('xpBarText'),
                gemCounter: document.getElementById('gemCounter')
            }
        };
    }
    initInputHandlers() {
        let resizeT = null;
        window.addEventListener('resize', () => {
            if (resizeT) clearTimeout(resizeT);
            resizeT = setTimeout(() => this.resizeCanvas(), 150);
        });
        if (this.dom.buttons.start) this.dom.buttons.start.onclick = () => this.startGame();
        if (this.dom.buttons.restart) this.dom.buttons.restart.onclick = () => this.startGame();
        if (this.dom.buttons.restartFromPause) this.dom.buttons.restartFromPause.onclick = () => this.startGame();
        if (this.dom.buttons.pause) this.dom.buttons.pause.onclick = () => this.togglePause();
        if (this.dom.buttons.copy) this.dom.buttons.copy.onclick = () => this.copySaveCode();
        if (this.dom.buttons.load) this.dom.buttons.load.onclick = () => this.loadFromSaveCode();
        if (this.dom.buttons.generateDebugSave) this.dom.buttons.generateDebugSave.onclick = () => this.generateAndShowDebugCode();
        if (this.dom.buttons.copyDebugCodeBtn) this.dom.buttons.copyDebugCodeBtn.onclick = () => this.copyDebugCode();
        if (this.dom.buttons.returnToMenu) this.dom.buttons.returnToMenu.onclick = () => this.returnToStartScreen();
        if (this.dom.buttons.returnToMenuPause) this.dom.buttons.returnToMenuPause.onclick = () => this.returnToStartScreen();
        
        if (this.dom.buttons.settings) this.dom.buttons.settings.onclick = () => this.showSettingsPopup();
        if (this.dom.buttons.closeSettings) this.dom.buttons.closeSettings.onclick = () => this.hideAllPopups();
        this._wireSettingsAudio();
        // Pulsante inventario
        if (this.dom.buttons.inventory) this.dom.buttons.inventory.onclick = () => this.showInventory();
        if (this.dom.buttons.closeInventory) this.dom.buttons.closeInventory.onclick = () => this.closeInventory();
        
        // Pulsanti popup personaggi
        if (this.dom.buttons.openCharacterPopup) this.dom.buttons.openCharacterPopup.onclick = () => this.showCharacterPopup();
        if (this.dom.buttons.closeCharacterPopup) this.dom.buttons.closeCharacterPopup.onclick = () => this.hideCharacterPopup();
        
        // Pulsante achievements
        if (this.dom.buttons.achievements) {
            this.dom.buttons.achievements.onclick = () => this.showAchievements();
        }
        
        // Pulsante chiudi achievements
        if (this.dom.buttons.closeAchievements) {
            this.dom.buttons.closeAchievements.onclick = () => {
                this.hideAllPopups();
                this.returnToStartScreen();
            };
        }
        
        // Pulsante chiudi negozio
        const closeShopBtn = document.getElementById('closeShopBtn');
        if (closeShopBtn) {
            closeShopBtn.onclick = () => this.hideAllPopups();
        }
        
        // Dropdown stage
        if (this.dom.containers.stageDropdown) {
            this.dom.containers.stageDropdown.onchange = (e) => {
                this.selectStage(parseInt(e.target.value));
            };
        }
        
        // Tasto pausa mobile
        const pauseBtnMobile = document.getElementById('pauseButtonMobile');
        if (pauseBtnMobile) {
            pauseBtnMobile.onclick = () => this.togglePause();
        }

        if (this.dom.menuOverlay) {
            this.dom.menuOverlay.onclick = () => {
                if (this.state === 'gameOver' || this.state === 'startScreen') {
                    return; 
                }
                
                // Se il popup dei personaggi è aperto, torna al menù principale
                if (this.dom.popups.characterSelection && this.dom.popups.characterSelection.style.display === 'flex') {
                    this.hideCharacterPopup();
                    return;
                }
                
                this.hideAllPopups();
            };
        }

        Object.values(this.dom.popups).forEach(p => {
            if (p) p.addEventListener('click', e => e.stopPropagation());
        });
        document.addEventListener('keydown', (e) => {
            this.audio?.unlock();
            this.player.keys[e.code] = true;
            if (e.code === 'Escape') this.handleEscapeKey();
            if (e.code === 'KeyE') this.handleInteractionKey();
        });
        document.addEventListener('keyup', (e) => { this.player.keys[e.code] = false; });
        if (this.canvas) {
            this.canvas.addEventListener('pointerdown', this.handlePointerDown.bind(this));
            this.canvas.addEventListener('pointermove', this.handlePointerMove.bind(this));
            this.canvas.addEventListener('pointerup', this.handlePointerEnd.bind(this));
            this.canvas.addEventListener('pointercancel', this.handlePointerEnd.bind(this));
        }
    }
    startGame(isLoadedRun = false) {
        if (!isLoadedRun) {
            this.resetRunState();
            this.currentStage = this.selectedStage; // Inizia con lo stage selezionato
            this.player.resetForNewRun(this.permanentUpgrades, this.selectedArchetype);

            const archetype = CONFIG.characterArchetypes[this.selectedArchetype];
            if (archetype && archetype.startingWeapon && this.spells[archetype.startingWeapon]) {
                this.spells[archetype.startingWeapon].level = 1;
            } else {
                 this.spells.magicMissile.level = 1;
            }
        }
        
        // TRACKING ANALYTICS: Inizializza sessione con dati giocatore
        this.sessionStartTime = Date.now();
        this.lastPeriodicCloudSyncTime = this.sessionStartTime; // Inizializza il timer del sync periodico
        if (this.analyticsManager && this.player.archetype) {
            console.log(`Iniziata sessione con archetipo: ${this.player.archetype.id}`);
            
            // Sync dati giocatore all'avvio se loggato
            if (this.playerAuth && this.playerAuth.currentPlayer) {
                this.analyticsManager.syncPlayerData(this.playerAuth.currentPlayer);
            }
        }
        
        // Applica gli effetti dei core e delle armi salvati
        if (this.cores && Object.keys(this.cores).length > 0) {
            for (const [coreId, coreData] of Object.entries(this.cores)) {
                if (coreData.equipped) {
                    this.applyCoreEffect(coreId);
                }
            }
        }
        
        if (this.weapons && Object.keys(this.weapons).length > 0) {
            for (const [weaponId, weaponData] of Object.entries(this.weapons)) {
                if (weaponData.equipped) {
                    this.applyWeaponEffect(weaponId);
                }
            }
        }
        
        this.hideAllPopups(true); 
        this.dom.inGameUI.container.style.display = 'flex';
        this.dom.buttons.pause.style.display = 'flex';
        this.state = 'running';
        this._updateAccumulator = 0;
        this.lastFrameTime = performance.now();
        this.audio?.unlock();
        this.audio?.playBackgroundMusic();
        if (!this.gameLoopId) this.gameLoop();
    }
    gameOver() {
    if (this.state === 'gameOver') return;

    this.state = 'gameOver'; 
    this.totalGems += this.gemsThisRun; 
    
    // TRACKING ANALYTICS: Registra completamento sessione con dati giocatore
    if (this.analyticsManager && this.player.archetype) {
        const sessionTime = (Date.now() - this.sessionStartTime) / 1000; // in secondi
        const satisfaction = this.calculateSatisfaction(this.player.level, this.entities.enemies.length + this.entities.bosses.length);
        
        const gameStats = {
            archetype: this.player.archetype.id,
            duration: sessionTime * 1000,
            level: this.player.level,
            satisfaction: satisfaction,
            enemiesKilled: this.enemiesKilled,
            gemsEarned: this.gemsThisRun,
            finalScore: this.score
        };
        
        this.analyticsManager.updatePlayerGameStats(gameStats);
        if (this.playerAuth && this.playerAuth.currentPlayer) {
            this.playerAuth.updatePlayerStats(gameStats);
            this.analyticsManager.syncPlayerData(this.playerAuth.currentPlayer);
        }
    }
    
    this.saveGameData();
    document.getElementById('survivalTime').textContent = Math.floor(this.totalElapsedTime);
    document.getElementById('enemiesKilled').textContent = this.enemiesKilled;
    document.getElementById('gemsEarned').textContent = this.gemsThisRun;
    document.getElementById('finalScore').textContent = this.score;
    this.dom.inputs.saveCode.value = this.generateSaveCode();
    this.dom.buttons.pause.style.display = 'none';
    this.dom.inGameUI.container.style.display = 'none';
    this.hideAllPopups(true); 
    this.showPopup('gameOver');
    this.audio?.stopBackgroundMusic();
    this.audio?.playGameOver();

    // Pulisci il canvas dopo aver mostrato il popup di game over
    setTimeout(() => {
        this.clearCanvas();
    }, 100);
}
    resetRunState() {
        this.entities = { enemies: [], bosses: [], projectiles: [], enemyProjectiles: [], xpOrbs: [], gemOrbs: [], materialOrbs: [], particles: [], effects: [], chests: [], droppedItems: [], fireTrails: [], auras: [], orbitals: [], staticFields: [], sanctuaries: [] };
        this.notifications = []; this.score = 0; this.enemiesKilled = 0; this.gemsThisRun = 0;
        this.totalElapsedTime = 0; this.enemiesKilledSinceBoss = 0;
        this.nextChestSpawnTime = CONFIG.chest.spawnTime; this.nextMapXpSpawnTime = 5;
        this.lastEnemySpawnTime = 0; 
        this.difficultyTier = 0;
        this.currentStage = 1;
        this.stageStartTime = 0; // Tempo di inizio dello stage corrente
        this.bossesKilledThisStage = 0; // Boss uccisi nello stage corrente
        this.elitesKilledThisStage = 0; // Elite uccisi nello stage corrente
        
        // NON reinizializzare materiali e arsenale - vengono mantenuti tra le run
        // this.materials, this.cores, this.weapons, this.arsenal rimangono invariati
        
        this.resetSpells();
    }
    gameLoop() {
        this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
        const now = performance.now();
        const deltaTime = Math.min((now - this.lastFrameTime) / 1000, 0.1);
        this.lastFrameTime = now;
        const FIXED_DT = 1 / 60;
        const MAX_STEPS = 3;
        if (this.state === 'running') {
            this._updateAccumulator = (this._updateAccumulator ?? 0) + deltaTime;
            let steps = 0;
            while (this._updateAccumulator >= FIXED_DT && steps < MAX_STEPS) {
                this.totalElapsedTime += FIXED_DT;
                if (this.menuCooldown > 0) this.menuCooldown--;
                this.update(FIXED_DT);
                this._updateAccumulator -= FIXED_DT;
                steps++;
            }
            if (this._updateAccumulator > FIXED_DT * 2) this._updateAccumulator = FIXED_DT;
            this.updateInGameUI();
        }
        this.draw();
    }
    update(deltaTime) {
        if (this.state !== 'running') return; // Non aggiornare nulla se non in gioco
        this.player.update(this, this.joystick); 
        this.updateCamera();
        this.checkStage();
        for (const type in this.entities) {
            for (let i = this.entities[type].length - 1; i >= 0; i--) {
                const entity = this.entities[type][i];
                entity.update(this);
                if (entity.toRemove) this.entities[type].splice(i, 1);
            }
        }
        
        // Aggiorna gli effetti delle armi
        this.updateWeaponEffects();
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            this.notifications[i].life--;
            if (this.notifications[i].life <= 0) this.notifications.splice(i, 1);
        }
        this.spawnEnemies(); 
        this.spawnBoss(); 
        this.spawnChests(); 
        this.spawnMapXpOrbs();
        this.castSpells();
        this.checkForLevelUp(); // Spostato qui per coerenza
        
        // Monitoraggio versione 5.3 - ogni 30 secondi
        if (Math.floor(this.gameTime / 30) % 30 === 0) {
            this.trackRetentionMetrics();
        }
        
        // ANALYTICS VERSIONE 5.4: Auto-bilanciamento ogni 60 secondi
        if (Math.floor(this.gameTime / 60) % 60 === 0) {
            this.checkAutoBalance();
        }
        
        // Achievement tracking - ogni 10 secondi
        if (Math.floor(this.gameTime / 10) % 10 === 0) {
            if (this.achievementSystem) {
                // Controlla achievement basati sul tempo
                this.achievementSystem.checkTimeBasedAchievements(this.gameTime, this);
                
                // Controlla achievement basati sulle statistiche del giocatore
                this.achievementSystem.checkPlayerStatsAchievements(this.player, this);
                
                // Controlla achievement per stage sbloccati
                const unlockedStages = Object.values(CONFIG.stages).filter(stage => stage.unlocked).length;
                this.achievementSystem.updateProgress('stages_unlocked', unlockedStages, this);
                
                // Controlla achievement per archetipi sbloccati
                const unlockedArchetypes = ['standard']; // Standard sempre sbloccato
                if (this.totalGems >= 200) unlockedArchetypes.push('steel');
                if (this.totalGems >= 300) unlockedArchetypes.push('magma');
                if (this.totalGems >= 300) unlockedArchetypes.push('frost');
                if (this.totalGems >= 400) unlockedArchetypes.push('shadow');
                if (this.totalGems >= 800) unlockedArchetypes.push('tech');
                this.achievementSystem.updateProgress('archetypes_unlocked', unlockedArchetypes.length, this);
            }
        }
        
        // --- SYNC CLOUD OGNI 20 MINUTI DALL'AVVIO SESSIONE ---
        if (this.analyticsManager && this.analyticsManager.config.enableCloudSync) {
            const now = Date.now();
            const ventiMinuti = 20 * 60 * 1000;
            if (now - this.lastPeriodicCloudSyncTime >= ventiMinuti) {
                this.analyticsManager.uploadToGist(); // Sync cloud periodico
                this.lastPeriodicCloudSyncTime = now;
                console.log('🔄 Sync cloud periodico ogni 20 minuti');
            }
        }
    }
    
    showSettingsPopup() {
        if (this.audio) {
            const eff = document.getElementById('effectsVolumeSlider');
            const mus = document.getElementById('musicVolumeSlider');
            const mute = document.getElementById('muteCheckbox');
            const effVal = document.getElementById('effectsVolumeValue');
            const musVal = document.getElementById('musicVolumeValue');
            if (eff) eff.value = Math.round(this.audio.effectsVolume * 100);
            if (mus) mus.value = Math.round(this.audio.musicVolume * 100);
            if (mute) mute.checked = this.audio.muted;
            if (effVal) effVal.textContent = Math.round(this.audio.effectsVolume * 100);
            if (musVal) musVal.textContent = Math.round(this.audio.musicVolume * 100);
        }
        this.showPopup('settings');
    }
    _wireSettingsAudio() {
        const eff = document.getElementById('effectsVolumeSlider');
        const mus = document.getElementById('musicVolumeSlider');
        const mute = document.getElementById('muteCheckbox');
        const effVal = document.getElementById('effectsVolumeValue');
        const musVal = document.getElementById('musicVolumeValue');
        if (eff && effVal) eff.addEventListener('input', () => {
            const v = eff.value / 100;
            this.audio?.setEffectsVolume(v);
            effVal.textContent = Math.round(v * 100);
        });
        if (mus && musVal) mus.addEventListener('input', () => {
            const v = mus.value / 100;
            this.audio?.setMusicVolume(v);
            musVal.textContent = Math.round(v * 100);
        });
        if (mute) mute.addEventListener('change', () => {
            this.audio?.setMuted(mute.checked);
        });
    }
    addEntity(type, entity) { if (this.entities[type]) this.entities[type].push(entity); }
    handleEscapeKey() { 
        const anyPopupOpen = Object.values(this.dom.popups).some(p => p && p.style.display === 'flex'); 
        
        // Se il popup dei personaggi è aperto, torna al menù principale
        if (this.dom.popups.characterSelection && this.dom.popups.characterSelection.style.display === 'flex') {
            this.hideCharacterPopup();
            return;
        }
        
        if (anyPopupOpen && this.state !== 'startScreen' && this.state !== 'gameOver') { 
            this.hideAllPopups(); 
        } else { 
            this.togglePause(); 
        } 
    }
    handleInteractionKey() { 
        if (this.menuCooldown > 0 || this.state !== 'running') { 
            return; 
        }
        
        const distance = Utils.getDistance(this.player, CONFIG.merchant);
        
        if (distance < CONFIG.merchant.interactionRadius) { 
            this.showPopup('shop'); 
        }
    }
    handlePointerDown(e) { 
        this.audio?.unlock();
        if (this.state === 'gameOver' || this.state === 'startScreen') return; 
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect(); 
        const clientX = e.clientX; 
        const clientY = e.clientY; 
        const worldX = (clientX - rect.left) * (this.canvas.width / rect.width) + this.camera.x; 
        const worldY = (clientY - rect.top) * (this.canvas.height / rect.height) + this.camera.y; 
        if (this.state === 'running' && Utils.getDistance({x: worldX, y: worldY}, CONFIG.merchant) < CONFIG.merchant.interactionRadius) { 
            this.showPopup('shop'); 
            return; 
        } 
        if (e.pointerType === 'touch' && !this.joystick.active) { 
            e.preventDefault(); 
            this.joystick.touchId = e.pointerId; 
            this.joystick.active = true; 
            this.joystick.startX = clientX; 
            this.joystick.startY = clientY; 
            if (this.dom.joystick && this.dom.joystick.container) {
                this.dom.joystick.container.style.display = 'block'; 
                this.dom.joystick.container.style.left = `${clientX - this.dom.joystick.radius}px`; 
                this.dom.joystick.container.style.top = `${clientY - this.dom.joystick.radius}px`; 
            }
        } 
    }
    handlePointerMove(e) { 
        if (!this.joystick.active || e.pointerId !== this.joystick.touchId) return; 
        e.preventDefault(); 
        let deltaX = e.clientX - this.joystick.startX; 
        let deltaY = e.clientY - this.joystick.startY; 
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY); 
        const maxDistance = this.dom.joystick.radius; 
        if (distance > maxDistance) { 
            deltaX = (deltaX / distance) * maxDistance; 
            deltaY = (deltaY / distance) * maxDistance; 
        } 
        const dxNorm = deltaX / maxDistance;
        const dyNorm = deltaY / maxDistance;
        this.joystick.dx = dxNorm;
        this.joystick.dy = dyNorm;
        this._joystickPending.dx = deltaX;
        this._joystickPending.dy = deltaY;
        if (!this._joystickRAF) {
            this._joystickRAF = requestAnimationFrame(() => {
                this._joystickRAF = null;
                if (this.dom.joystick && this.dom.joystick.stick) {
                    this.dom.joystick.stick.style.transform = 
                        `translate(${this._joystickPending.dx}px, ${this._joystickPending.dy}px)`;
                }
            });
        }
    }
    handlePointerEnd(e) { 
        if (this.joystick.active && e.pointerId === this.joystick.touchId) { 
            this.joystick.active = false; 
            this.joystick.touchId = null; 
            if (this.dom.joystick && this.dom.joystick.stick) {
                this.dom.joystick.stick.style.transform = 'translate(0px, 0px)'; 
            }
            if (this.dom.joystick && this.dom.joystick.container) {
                this.dom.joystick.container.style.display = 'none'; 
            }
            this.joystick.dx = 0; 
            this.joystick.dy = 0; 
        } 
    }
    buyPermanentUpgrade(key) { const upg = this.permanentUpgrades[key]; const cost = Math.floor(upg.baseCost * Math.pow(upg.costGrowth, upg.level)); if (upg.level < upg.maxLevel && this.totalGems >= cost) { this.totalGems -= cost; upg.level++; this.saveGameData(); this.player.applyPermanentUpgrades(this.permanentUpgrades); this.populateShop(); } }
    applyItemEffect(item) { const itemInfo = CONFIG.itemTypes[item.type]; this.notifications.push({ text: itemInfo.desc, life: 300 }); switch (item.type) { case 'HEAL_POTION': this.player.hp = Math.min(this.player.stats.maxHp, this.player.hp + this.player.stats.maxHp * 0.5); break; case 'XP_BOMB': this.player.gainXP(this.player.xpNext); break; case 'INVINCIBILITY': this.player.powerUpTimers.invincibility = 600; break; case 'DAMAGE_BOOST': this.player.powerUpTimers.damageBoost = 1200; break; case 'LEGENDARY_ORB': this.player.powerUpTimers.damageBoost = 3600; this.player.powerUpTimers.invincibility = 3600; break; } }

    // Funzione di test per il negozio
    testShop() {
        console.log('=== TEST NEGOZIO ===');
        console.log('DOM elements:');
        console.log('- totalGemsShop:', this.dom.totalGemsShop);
        console.log('- permanentUpgradeOptions:', this.dom.containers.permanentUpgradeOptions);
        console.log('- shop popup:', this.dom.popups.shop);
        
        console.log('Dati:');
        console.log('- totalGems:', this.totalGems);
        console.log('- permanentUpgrades:', this.permanentUpgrades);
        
        // Test diretto del populateShop
        console.log('Testando populateShop...');
        this.populateShop();
        
        console.log('=== FINE TEST ===');
    }
}

// Apply system mixins to Game prototype
Object.assign(BallSurvivalGame.prototype,
    SpellSystem,
    SpawnSystem,
    StageSystem,
    WeaponSystem,
    CraftingSystem,
    SaveSystem,
    ProgressionSystem,
    BalanceSystem,
    RenderSystem,
    UISystem
);
