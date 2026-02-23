import { CONFIG } from '../config/index.js';
import { Utils } from '../utils/index.js';
import { cloudSyncManager } from '../utils/cloudSync.js';
import { SeededRNG } from '../utils/SeededRNG.js';
import { poolManager } from '../utils/PoolManager.js';
import { DailyChallengeSystem } from '../systems/DailyChallengeSystem.js';
import { BestiarySystem } from '../systems/BestiarySystem.js';
import { RunHistorySystem } from '../systems/RunHistorySystem.js';
import { TutorialSystem } from '../systems/TutorialSystem.js';
import {
    Player, Enemy, Boss,
    Projectile, Aura, Orbital, StaticField, Sanctuary, AnomalousArea,
    XpOrb, GemOrb, MaterialOrb,
    Chest, DroppedItem, Relic,
    Particle, FireTrail, Effect
} from '../entities/index.js';
import { AnalyticsManager, RetentionMonitor, QuickFeedback, ProgressionOptimizer, AchievementSystem } from '../systems/index.js';
import { MetaProgressionSystem } from '../systems/MetaProgressionSystem.js';

// System mixins
import { SpellSystem } from '../systems/SpellSystem.js';
import { SpawnSystem } from '../systems/SpawnSystem.js';
import { StageSystem } from '../systems/StageSystem.js';
import { WeaponSystem } from '../systems/WeaponSystem.js';
import { CraftingSystem } from '../systems/CraftingSystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { ProgressionSystem } from '../systems/ProgressionSystem.js';
import { BalanceSystem } from '../systems/BalanceSystem.js';
import { ModeManager } from './ModeManager.js';
import { StorageManager } from './StorageManager.js';
import { RenderSystem } from '../systems/RenderSystem.js';
import { UISystem } from '../systems/UISystem.js';
import { InputManager } from './InputManager.js';
import { MenuController } from './MenuController.js';
import { AudioManager } from '../systems/AudioManager.js';
import { CheatCodeSystem } from '../systems/CheatCodeSystem.js';
import { SkinSystem } from '../systems/SkinSystem.js';

export class BallSurvivalGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId); this.ctx = this.canvas.getContext('2d');
        this.initDOM();
        this.camera = { x: 0, y: 0, width: this.canvas.width, height: this.canvas.height };
        this.player = new Player();
        this.joystick = { dx: 0, dy: 0, ...this.dom.joystick };
        this.inputManager = new InputManager(this);
        this.inputManager.init();
        this.menuController = new MenuController(this);
        this.menuController.init();
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

        // SaveSystem è un mixin (oggetto), non una classe: aggiungiamo i suoi metodi al game
        Object.assign(this, SaveSystem);

        // Sistemi versione 5.3
        const retentionInstance = new RetentionMonitor();
        this.retentionMonitor = typeof retentionInstance?.trackSession === 'function'
            ? retentionInstance
            : { trackSession: () => { }, getSessionDuration: () => 0, calculateRetention: () => 0, getOptimizationSuggestions: () => [], metricsData: [] };
        this.quickFeedback = new QuickFeedback();
        this.progressionOptimizer = new ProgressionOptimizer();
        this.achievementSystem = new AchievementSystem();
        this.metaProgressionSystem = new MetaProgressionSystem(this);

        this.analyticsManager = new AnalyticsManager();
        this.audio = new AudioManager();
        this.audio.init();
        this.craftingSystem = new CraftingSystem(this);
        this.balanceSystem = new BalanceSystem(this);
        this.modeManager = new ModeManager(this);

        this.storageManager = StorageManager;

        // Inizializza eventi controller
        this.menuController.init();
        this.inputManager.init();

        this.skinSystem = new SkinSystem(this);
        this.cheatCodeSystem = new CheatCodeSystem(this);
        this.dailyChallengeSystem = new DailyChallengeSystem(this);
        this.bestiarySystem = new BestiarySystem(this);
        this.runHistorySystem = new RunHistorySystem(this);
        this.tutorialSystem = new TutorialSystem(this);
        this.cloudSyncManager = cloudSyncManager;
        this.cheatCodeSystem.initShakeDetection();

        // Setup Auto-Sync Provider
        this.cloudSyncManager.startAutoSync(() => ({
            analytics: this.analyticsManager?.getAnalyticsData?.(),
            accounts: ((StorageManager.getItem(StorageKeys.PLAYERS) || {})),
            saveData: {
                globalStats: ((StorageManager.getItem(StorageKeys.GLOBAL_STATS) || {})),
                unlockedCheats: this.cheatCodeSystem?.unlockedCheats || {},
                discoveredEggs: this.cheatCodeSystem?.discoveredEggs || {},
                unlockedSkins: this.skinSystem?.unlockedSkins || {},
                equippedSkin: this.skinSystem?.equippedSkin || 'default',
                achievements: ((StorageManager.getItem(StorageKeys.ACHIEVEMENTS) || {})),
                bossKills: StorageManager.getItem(StorageKeys.TOTAL_BOSS_KILLS) || '0',
                difficultyTier: StorageManager.getItem(StorageKeys.DIFFICULTY_TIER),
                stageProgress: ((StorageManager.getItem(StorageKeys.STAGE_PROGRESS) || {})),
                bestiary: this.bestiarySystem?.getAllEntries() || {},
                runHistory: this.runHistorySystem?.getHistory() || []
            }
        }));
        this._entityClasses = { Projectile, Aura, Orbital, StaticField, Sanctuary, AnomalousArea, XpOrb, GemOrb, MaterialOrb, Chest, DroppedItem, Particle, FireTrail, Effect, Boss, Enemy };
        this.unlockedArchetypes = new Set(['standard']);

        this.loadGameData();
        this.loadStageProgress(); // Carica la progressione degli stage
        this.loadAccessibilitySettings();
        this.resetRunState();
        this.resizeCanvas();
        this.populateCharacterSelection();
        this.populateStageSelection();
        this.updateCharacterPreview(); // Inizializza l'anteprima del personaggio
        this.showPopup('start');
        this.draw();
        if (!this.gameLoopId) this.gameLoop();

        this.sessionStartTime = 0;
        this.lastPeriodicCloudSyncTime = 0; // Timestamp ultimo sync periodico
        this.selectedMode = 'standard';
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
                secretShop: document.getElementById('secretShopPopup'),
                inventory: document.getElementById('inventoryMenu'),
                characterSelection: document.getElementById('characterSelectionPopup'),
                achievements: document.getElementById('achievementsPopup'),
                glossary: document.getElementById('glossaryPopup'),
                settings: document.getElementById('settingsPopup'),
                dailyChallenge: document.getElementById('dailyChallengePopup')
            },
            buttons: {
                // Mode selection
                modeStandard: document.getElementById('modeStandardBtn'),
                modeEndless: document.getElementById('modeEndlessBtn'),
                modeDaily: document.getElementById('modeDailyBtn'),
                modeBossRush: document.getElementById('modeBossRushBtn'),
                modeTutorial: document.getElementById('modeTutorialBtn'),
                startDaily: document.getElementById('startDailyBtn'),
                closeDaily: document.getElementById('closeDailyChallengeBtn'),

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
                bestiary: document.getElementById('bestiaryBtn'),
                runHistory: document.getElementById('runHistoryBtn'),
                closeAchievements: document.getElementById('closeAchievementsBtn'),
                closeBestiary: document.getElementById('closeBestiaryBtn'),
                closeRunHistory: document.getElementById('closeRunHistoryBtn'),
                craftingPreview: document.getElementById('craftingPreviewBtn'),
                closeCrafting: document.getElementById('closeCraftingBtn'),
                glossary: document.getElementById('glossaryBtn'),
                closeGlossary: document.getElementById('closeGlossaryBtn'),
                settings: document.getElementById('settingsBtn'),
                closeSettings: document.getElementById('closeSettingsBtn'),
                cheats: document.getElementById('cheatsBtn'),
                skins: document.getElementById('skinsBtn')
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
            pauseButtonMobile: document.getElementById('pauseButtonMobile'),
            xpBarMobile: document.getElementById('xpBarMobile'),
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
        // Obsolete: Handled by InputManager and MenuController
    }
    startGame(mode = 'standard', isLoadedRun = false) {
        this.gameMode = mode;
        this.rng = new SeededRNG(mode === 'daily' ? this.dailyChallengeSystem.currentSeed : Date.now());

        const gameOverTitle = document.querySelector('#gameOver h2');
        if (gameOverTitle) gameOverTitle.textContent = "Game Over!";

        if (mode === 'daily') {
            this.dailyChallengeSystem.applyConfiguration();
        } else {
            // Reset to standard RNG for other modes if not continuing a run
            if (!isLoadedRun) this.rng = new SeededRNG(Date.now());
        }

        if (!isLoadedRun) {
            this.resetRunState();
            this.currentStage = this.selectedStage; // Inizia con lo stage selezionato
            this.player.resetForNewRun(this.permanentUpgrades, this.selectedArchetype);
            this.metaProgressionSystem?.applyModifiersToPlayer(this.player);

            const archetype = CONFIG.characterArchetypes[this.selectedArchetype];
            if (archetype && archetype.startingWeapon && this.spells[archetype.startingWeapon]) {
                this.spells[archetype.startingWeapon].level = 1;
            } else {
                this.spells.magicMissile.level = 1;
            }
        }

        // TRACKING ANALYTICS: Inizializza sessione con dati giocatore
        this.sessionStartTime = Date.now();
        this.lastPeriodicCloudSyncTime = this.sessionStartTime;

        if (mode === 'tutorial') {
            this.tutorialSystem?.start();
            return;
        }

        if (this.analyticsManager && this.player.archetype) {
            console.log(`Iniziata sessione con archetipo: ${this.player.archetype.id}`);

            // Traccia archetipo giocato per achievement
            if (this.stats) {
                if (!this.stats.archetypesPlayed.includes(this.player.archetype.id)) {
                    this.stats.archetypesPlayed.push(this.player.archetype.id);
                    StorageManager.setItem(StorageKeys.ARCHETYPES_PLAYED, this.stats.archetypesPlayed);
                }
            }

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
        if (this.dom.pauseButtonMobile) this.dom.pauseButtonMobile.style.display = 'flex';
        if (this.dom.xpBarMobile && window.innerWidth <= 700) this.dom.xpBarMobile.style.display = 'flex';
        this.state = 'running';
        this._updateAccumulator = 0;
        this.lastFrameTime = performance.now();
        this.audio?.unlock().then(() => { this.audio?.playBackgroundMusic(); this.audio?.setStageTone?.(this.currentStage); });
        // Easter eggs checks
        this.cheatCodeSystem?.checkNightMode();
        if (!this.gameLoopId) this.gameLoop();
    }
    gameOver() {
        if (this.state === 'gameOver') return;

        this.state = 'gameOver';
        this.totalGems += this.gemsThisRun;

        // Persist global stats
        this.cheatCodeSystem?.persistGlobalStats();
        // Trigger Cloud Sync
        this.cloudSyncManager?.notifyDataChanged();

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

        // Bestiary: aggiorna max kills per run per ogni tipo
        const runKills = this.runKillsByType || {};
        for (const [enemyType, count] of Object.entries(runKills)) {
            this.bestiarySystem?.updateRunStats(enemyType, count);
        }
        // Cronologia run
        this.runHistorySystem?.saveRun({
            time: this.totalElapsedTime,
            level: this.player?.level ?? 1,
            score: this.score,
            archetype: this.selectedArchetype || 'standard',
            weapons: this.arsenal?.activeWeapons || [],
            result: 'Defeat',
            mode: this.gameMode || 'standard'
        });

        document.getElementById('survivalTime').textContent = Math.floor(this.totalElapsedTime);
        const levelEl = document.getElementById('levelReached');
        if (levelEl) levelEl.textContent = this.player?.level ?? 1;
        document.getElementById('enemiesKilled').textContent = this.enemiesKilled;
        document.getElementById('gemsEarned').textContent = this.gemsThisRun;
        document.getElementById('finalScore').textContent = this.score;
        this.dom.inputs.saveCode.value = this.generateSaveCode();
        this.dom.buttons.pause.style.display = 'none';
        if (this.dom.pauseButtonMobile) this.dom.pauseButtonMobile.style.display = 'none';
        if (this.dom.xpBarMobile) this.dom.xpBarMobile.style.display = 'none';
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
        this.entities = { enemies: [], bosses: [], projectiles: [], enemyProjectiles: [], xpOrbs: [], gemOrbs: [], materialOrbs: [], particles: [], effects: [], chests: [], droppedItems: [], fireTrails: [], auras: [], orbitals: [], staticFields: [], sanctuaries: [], anomalousAreas: [] };
        this.notifications = []; this.score = 0; this.enemiesKilled = 0; this.gemsThisRun = 0;
        this.runKillsByType = {};
        this.totalElapsedTime = 0; this.enemiesKilledSinceBoss = 0;
        this.nextChestSpawnTime = CONFIG.chest.spawnTime; this.nextMapXpSpawnTime = 5;
        this.lastEnemySpawnTime = 0;
        this.difficultyTier = 0;
        this.currentStage = 1;
        this.stageStartTime = 0; // Tempo di inizio dello stage corrente
        this.bossesKilledThisStage = 0; // Boss uccisi nello stage corrente
        this.bossesKilled = 0; // Boss uccisi totali nella run (usato per scaling Boss Rush)
        this.elitesKilledThisStage = 0; // Elite uccisi nello stage corrente
        this.screenShakeIntensity = 0;
        this.hitFlashTimer = 0;
        this._timeStopActive = false;
        this._timeStopTimer = 0;
        if (this.player) this.player._spectralVeilTimer = 0;

        // Stats tracking per achievement
        this.stats = {
            bossKills: 0,
            totalDamageDealt: 0,
            totalSpellCasts: 0,
            noDamageTimer: 0,
            bestComboKills: 0,
            pacifistTimer: 0,
            kills: 0,
            archetypesPlayed: ((StorageManager.getItem(StorageKeys.ARCHETYPES_PLAYED) || [])),
            _comboKillCount: 0,
            _lastKillTime: 0
        };

        // NON reinizializzare materiali e arsenale - vengono mantenuti tra le run
        // this.materials, this.cores, this.weapons, this.arsenal rimangono invariati

        this.resetSpells();

        // Inizializza Reliquie della Mappa
        if (this.gameMode !== 'bossRush' && this.gameMode !== 'tutorial') {
            const relicConfigs = [
                { type: 'silver_ring', x: -8000, y: 0 },
                { type: 'gold_ring', x: 8000, y: 0 },
                { type: 'metaglio_left', x: 0, y: -8000 },
                { type: 'metaglio_right', x: 0, y: 8000 }
            ];

            relicConfigs.forEach(rc => {
                this.addEntity('droppedItems', new Relic(rc.x, rc.y, rc.type));
                // Spawn 4 guardiani per ogni reliquia
                const guardianStats = { ...CONFIG.enemies.base, hp: 4000, damage: 25, speed: 0.8, isElite: true };
                for (let i = 0; i < 4; i++) {
                    const angle = (Math.PI / 2) * i;
                    this.addEntity('enemies', new Enemy(rc.x + Math.cos(angle) * 150, rc.y + Math.sin(angle) * 150, guardianStats));
                }
            });
        }
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
                const dtMultiplier = this.gameMode === 'bossRush' ? 2 : 1;
                this.totalElapsedTime += FIXED_DT * dtMultiplier;
                if (this.menuCooldown > 0) this.menuCooldown--;
                this.update(FIXED_DT);
                this._updateAccumulator -= FIXED_DT;
                steps++;
            }
            if (this._updateAccumulator > FIXED_DT * 2) this._updateAccumulator = FIXED_DT;
            this.updateInGameUI();
            if (this.screenShakeIntensity > 0) {
                this.screenShakeIntensity *= (CONFIG.effects?.screenShakeDecay ?? 0.88);
                if (this.screenShakeIntensity < 0.5) this.screenShakeIntensity = 0;
            }
            if (this.hitFlashTimer > 0) this.hitFlashTimer--;
        }
        this.draw();
    }

    addScreenShake(amount) {
        if (CONFIG.accessibility?.reduceMotion) return;
        const max = CONFIG.effects?.screenShakeMax ?? 10;
        const scaled = amount * (CONFIG.effects?.screenShakeScale ?? 0.5);
        this.screenShakeIntensity = Math.min(max, (this.screenShakeIntensity || 0) + scaled);
    }

    triggerVictory() {
        if (this.state === 'gameOver') return;
        const gameOverTitle = this.dom.popups.gameOver?.querySelector('h2');
        if (gameOverTitle) gameOverTitle.textContent = "🏆 Vittoria!";
        this.gameOver();
    }

    update(deltaTime) {
        this.gameTime = this.totalElapsedTime; // Alias per BalanceSystem / AchievementSystem
        this.player.update(this, this.joystick);
        this.metaProgressionSystem?.update(deltaTime * 1000); // Passa millisecondi

        // Spectral Veil Fusion
        if (this.player._spectralVeilTimer > 0) {
            this.player._spectralVeilTimer--;
            if (this.player._spectralVeilTimer % 12 === 0) {
                this.castFrostbolt(Date.now(), Math.random() * Math.PI * 2);
            }
        }

        if (this.gameMode === 'tutorial') {
            this.tutorialSystem?.update();
        }

        this.modeManager.update();

        this.updateCamera();
        this.checkStage();

        if (this._timeStopActive) {
            this._timeStopTimer--;
            if (this._timeStopTimer <= 0) {
                this._timeStopActive = false;
                this.notifications.push({ text: "Il tempo riprende a scorrere...", life: 120 });
            }
        }

        for (const type in this.entities) {
            // Se il tempo è fermo, salta l'update per nemici e proiettili nemici
            if (this._timeStopActive && (type === 'enemies' || type === 'bosses' || type === 'enemyProjectiles')) {
                continue;
            }

            for (let i = this.entities[type].length - 1; i >= 0; i--) {
                const entity = this.entities[type][i];
                entity.update(this);
                if (entity.toRemove) {
                    this.entities[type].splice(i, 1);
                    if (entity.poolType) poolManager.release(entity.poolType, entity);
                }
            }
        }

        // Aggiorna gli effetti delle armi
        this.updateWeaponEffects();
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            this.notifications[i].life--;
            if (this.notifications[i].life <= 0) this.notifications.splice(i, 1);
        }

        if (!this._timeStopActive) {
            this.spawnEnemies();
            this.spawnBoss();
            this.spawnChests();
            this.spawnMapXpOrbs();
            this.spawnDynamicEvents();
        }
        this.castSpells();

        const inBattle = this.getEnemiesAndBosses().length > 0;
        this.audio?.setBgmMode(inBattle ? 'battle' : 'calm');
        this.checkForLevelUp(); // Spostato qui per coerenza

        // Stats tracking per achievement (ogni frame)
        if (this.stats) {
            this.stats.noDamageTimer += deltaTime;
            if (this.stats.kills === 0) {
                this.stats.pacifistTimer += deltaTime;
            }

            // Nuovi Easter Eggs Controls
            if (this.stats.noDamageTimer >= 60 && this.cheatCodeSystem) {
                if (this.cheatCodeSystem.discoverEgg('no_damage_60')) {
                    this.totalGems += 50;
                    this.notifications.push({ text: '+50 Gemme (Intoccabile)!', life: 250, color: '#f1c40f' });
                }
            }
        }

        if (this.cheatCodeSystem) {
            if (this.totalElapsedTime >= 666 && this.totalElapsedTime < 667) {
                if (this.cheatCodeSystem.discoverEgg('survival_666s')) {
                    this._secretMerchantActive = true;
                    this.addScreenShake?.(15);
                }
            }
            if (this.player.level >= 10 && this.totalElapsedTime <= 60) {
                if (this.cheatCodeSystem.discoverEgg('speedrun_lv10')) {
                    this.totalGems += 100;
                }
            }
            if (this.gemsThisRun >= 500) {
                if (this.cheatCodeSystem.discoverEgg('collector')) {
                    this.totalGems += 200; // Bonus extra
                }
            }
        }

        // Lazy initialize Secret Merchant position
        if (this._secretMerchantActive && !this._secretMerchantPos && CONFIG.secretMerchant) {
            this._secretMerchantPos = {
                x: this.player.x + (Math.random() > 0.5 ? 400 : -400),
                y: this.player.y + (Math.random() > 0.5 ? 400 : -400),
                size: CONFIG.secretMerchant.size,
                interactionRadius: CONFIG.secretMerchant.interactionRadius
            };
        }

        // Monitoraggio versione 5.3 - ogni 30 secondi (30 * CONFIG.FPS)
        if (this.gameTime > 0 && this.gameTime % CONFIG.timing.RETENTION_CHECK_FRAMES === 0) {
            this.trackRetentionMetrics();
        }

        // ANALYTICS VERSIONE 5.4: Auto-bilanciamento ogni 60 secondi (60 * CONFIG.FPS)
        if (this.gameTime > 0 && this.gameTime % CONFIG.timing.AUTO_BALANCE_FRAMES === 0) {
            this.checkAutoBalance();
        }

        // Achievement tracking - ogni 10 secondi (600 frame a 60fps)
        if (this.gameTime > 0 && this.gameTime % CONFIG.timing.ACHIEVEMENT_CHECK_FRAMES === 0) {
            if (this.achievementSystem) {
                // Controlla achievement basati sul tempo
                this.achievementSystem.checkTimeBasedAchievements(this.gameTime, this);

                // Controlla achievement basati sulle statistiche del giocatore
                this.achievementSystem.checkPlayerStatsAchievements(this.player, this);

                // Controlla achievement per stage sbloccati
                const unlockedStages = Object.values(CONFIG.stages).filter(stage => stage.unlocked).length;
                this.achievementSystem.updateProgress('stages_unlocked', unlockedStages, this);

                // Controlla achievement per archetipi sbloccati
                this.achievementSystem.updateProgress('archetypes_unlocked', this.getUnlockedArchetypes().size, this);

                // Controlla achievement combat e esplorazione
                this.achievementSystem.checkCombatAchievements(this);
                this.achievementSystem.checkExplorationAchievements(this);
            }
        }

        // --- SYNC CLOUD OGNI 20 MINUTI DALL'AVVIO SESSIONE ---
        if (this.analyticsManager && this.analyticsManager.config.enableCloudSync) {
            const now = Date.now();
            if (now - this.lastPeriodicCloudSyncTime >= CONFIG.timing.CLOUD_SYNC_INTERVAL_MS) {
                this.analyticsManager.uploadToGist(); // Sync cloud periodico
                this.lastPeriodicCloudSyncTime = now;
                console.log('🔄 Sync cloud periodico ogni 20 minuti');
            }
        }
    }

    loadAccessibilitySettings() {
        try {
            const raw = StorageManager.getItem(StorageKeys.ACCESSIBILITY);
            if (raw) {
                const s = JSON.parse(raw);
                if (CONFIG.accessibility) {
                    CONFIG.accessibility.reduceMotion = !!s.reduceMotion;
                    CONFIG.accessibility.highContrast = !!s.highContrast;
                }
            }
        } catch (e) { /* ignore */ }
        this.applyHighContrastClass();
    }

    saveAccessibilitySettings() {
        try {
            localStorage.setItem(StorageKeys.ACCESSIBILITY, JSON.stringify({
                reduceMotion: !!CONFIG.accessibility?.reduceMotion,
                highContrast: !!CONFIG.accessibility?.highContrast
            }));
        } catch (e) { /* ignore */ }
    }

    applyHighContrastClass() {
        document.body.classList.toggle('high-contrast', !!CONFIG.accessibility?.highContrast);
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
        const reduceMotion = document.getElementById('reduceMotionCheckbox');
        const highContrast = document.getElementById('highContrastCheckbox');
        if (reduceMotion) reduceMotion.checked = !!CONFIG.accessibility?.reduceMotion;
        if (highContrast) highContrast.checked = !!CONFIG.accessibility?.highContrast;
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
        const testSoundBtn = document.getElementById('testSoundBtn');
        if (testSoundBtn) testSoundBtn.addEventListener('click', () => {
            this.audio?.unlock();
            this.audio?.playPickup();
        });
    }

    _wireSettingsAccessibility() {
        const reduceMotion = document.getElementById('reduceMotionCheckbox');
        const highContrast = document.getElementById('highContrastCheckbox');
        if (reduceMotion) reduceMotion.addEventListener('change', () => {
            if (CONFIG.accessibility) CONFIG.accessibility.reduceMotion = reduceMotion.checked;
            this.saveAccessibilitySettings();
        });
        if (highContrast) highContrast.addEventListener('change', () => {
            if (CONFIG.accessibility) CONFIG.accessibility.highContrast = highContrast.checked;
            this.saveAccessibilitySettings();
            this.applyHighContrastClass();
        });
    }
    addEntity(type, entity) { if (this.entities[type]) this.entities[type].push(entity); }

    getEnemiesAndBosses() { return [...(this.entities?.enemies || []), ...(this.entities?.bosses || [])]; }



    applyItemEffect(item) {
        const itemInfo = CONFIG.itemTypes[item.type];

        if (itemInfo.isActive) {
            // È un oggetto Hotbar
            const added = this.player.addItemToHotbar(item.type);
            if (added) {
                this.notifications.push({ text: itemInfo.name + " (Premi 1, 2 o 3)", life: 300, color: '#f1c40f' });
                this.audio?.playPickup?.();
            } else {
                this.notifications.push({ text: "Inventario Pieno!", life: 180, color: '#e74c3c' });
                // Volendo si potrebbe rimettere a terra, ma per ora lo scartiamo
            }
            return;
        }

        // Oggetti immediati passivi
        this.notifications.push({ text: itemInfo.desc, life: 300 });
        switch (item.type) {
            case 'HEAL_POTION': this.player.hp = Math.min(this.player.stats.maxHp, this.player.hp + this.player.stats.maxHp * 0.5); break;
            case 'XP_BOMB': this.player.gainXP(this.player.xpNext); break;
            case 'INVINCIBILITY': this.player.powerUpTimers.invincibility = 600; break;
            case 'DAMAGE_BOOST': this.player.powerUpTimers.damageBoost = 1200; break;
            case 'LEGENDARY_ORB': this.player.powerUpTimers.damageBoost = 60 * CONFIG.FPS; this.player.powerUpTimers.invincibility = 60 * CONFIG.FPS; break;
        }
    }

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

    showDailyChallengePopup() {
        const info = this.dailyChallengeSystem.getDailyInfo();

        const dateEl = document.getElementById('dailyDate');
        if (dateEl) dateEl.innerText = info.date;

        const arcEl = document.getElementById('dailyArchetype');
        if (arcEl) arcEl.innerText = info.archetypeName;

        const weapEl = document.getElementById('dailyWeapon');
        const weaponName = CONFIG?.weapons?.[info.weapon]?.name || info.weapon;
        if (weapEl) weapEl.innerText = weaponName;

        const modName = document.getElementById('dailyModifierName');
        const modDesc = document.getElementById('dailyModifierDesc');

        if (modName && modDesc) {
            if (info.modifier) {
                modName.innerText = info.modifier.name;
                modDesc.innerText = info.modifier.desc;
                modName.style.color = '#ff4444';
            } else {
                modName.innerText = "Nessun Modificatore";
                modDesc.innerText = "Goditi una run standard!";
                modName.style.color = '#888';
            }
        }

        const objName = document.getElementById('dailyObjectiveName');
        const objDesc = document.getElementById('dailyObjectiveDesc');

        if (objName && objDesc) {
            if (info.objective) {
                objName.innerText = info.objective.name;
                objDesc.innerText = info.objective.desc;
            } else {
                objName.innerText = "Nessun Obiettivo Speciale";
                objDesc.innerText = "Completa una run standard!";
            }
        }

        if (this.dom.popups.dailyChallenge) {
            this.dom.popups.dailyChallenge.style.display = 'flex';
        }
    }

    testShop() {
        console.log('=== TEST NEGOZIO ===');
        console.log('DOM elements:');
        console.log('- Shop popup:', document.getElementById('permanentUpgradeShop'));
        console.log('- Close button:', document.getElementById('closeShopBtn'));
        console.log('- Options container:', document.getElementById('permanentUpgradeOptions'));
        console.log('- Total gems display:', document.getElementById('totalGemsShop'));

        if (!document.getElementById('permanentUpgradeShop')) {
            console.error('ERRORE: Elementi del negozio mancanti in index.html');
        } else {
            console.log('DOM OK. Chiamo showPopup()');
            this.showPopup('shop');
        }
    }

    spawnDummyEnemy() {
        const dummyStats = { hp: 50, speed: 0, damage: 0, color: '#777', size: 15 };
        const e = new Enemy(this.player.x + 100, this.player.y + 100, dummyStats, this);
        e.isDummy = true;
        this.addEntity('enemies', e);
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
