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
    Chest, DroppedItem,
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
            accounts: JSON.parse(localStorage.getItem('ballSurvivalPlayers') || '{}'),
            saveData: {
                globalStats: JSON.parse(localStorage.getItem('ballSurvival_globalStats') || '{}'),
                unlockedCheats: this.cheatCodeSystem?.unlockedCheats || {},
                discoveredEggs: this.cheatCodeSystem?.discoveredEggs || {},
                unlockedSkins: this.skinSystem?.unlockedSkins || {},
                equippedSkin: this.skinSystem?.equippedSkin || 'default',
                achievements: JSON.parse(localStorage.getItem('ballSurvival_achievements') || '{}'),
                bossKills: localStorage.getItem('ballSurvivalTotalBossKills') || '0',
                difficultyTier: localStorage.getItem('ballSurvivalActiveDifficultyTier'),
                stageProgress: JSON.parse(localStorage.getItem('ballSurvivalStageProgress') || '{}'),
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
                    try { localStorage.setItem('ballSurvival_archetypesPlayed', JSON.stringify(this.stats.archetypesPlayed)); } catch (e) { }
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
        this.elitesKilledThisStage = 0; // Elite uccisi nello stage corrente
        this.screenShakeIntensity = 0;
        this.hitFlashTimer = 0;

        // Stats tracking per achievement
        this.stats = {
            bossKills: 0,
            totalDamageDealt: 0,
            totalSpellCasts: 0,
            noDamageTimer: 0,
            bestComboKills: 0,
            pacifistTimer: 0,
            kills: 0,
            archetypesPlayed: JSON.parse(localStorage.getItem('ballSurvival_archetypesPlayed') || '[]'),
            _comboKillCount: 0,
            _lastKillTime: 0
        };

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
        const max = CONFIG.effects?.screenShakeMax ?? 25;
        this.screenShakeIntensity = Math.min(max, (this.screenShakeIntensity || 0) + amount);
    }

    checkDailyObjective() {
        if (this.gameMode !== 'daily' || !this.dailyChallengeSystem?.config?.objective) return;

        const obj = this.dailyChallengeSystem.config.objective;
        const timeElapsed = this.totalElapsedTime;

        // Controlla se il tempo limite è scaduto
        if (obj.timeLimit && timeElapsed >= obj.timeLimit) {
            if (obj.type === 'survival') {
                this.triggerDailyVictory();
            } else {
                this.triggerDailyDefeat();
            }
            return;
        }

        // Condizioni di vittoria anticipate
        if (obj.type === 'kills' && this.enemiesKilled >= obj.target) {
            this.triggerDailyVictory();
        } else if (obj.type === 'level' && this.player.level >= obj.target) {
            this.triggerDailyVictory();
        }
    }

    triggerDailyVictory() {
        if (this.state === 'gameOver') return;
        this.score += 5000;
        this.gemsThisRun += 1000;
        this.notifications.push({ text: '🏆 SFIDA GIORNALIERA COMPLETATA! +1000 Gemme', life: 300, color: '#FFD700' });

        const gameOverTitle = this.dom.popups.gameOver.querySelector('h2');
        if (gameOverTitle) gameOverTitle.textContent = "🏆 Sfida Completata!";

        this.gameOver();
    }

    triggerDailyDefeat() {
        if (this.state === 'gameOver') return;

        const gameOverTitle = this.dom.popups.gameOver.querySelector('h2');
        if (gameOverTitle) gameOverTitle.textContent = "❌ Sfida Fallita: Tempo Scaduto";

        this.gameOver();
    }

    update(deltaTime) {
        this.gameTime = this.totalElapsedTime; // Alias per BalanceSystem / AchievementSystem
        this.player.update(this, this.joystick);
        this.metaProgressionSystem?.update(deltaTime * 1000); // Passa millisecondi

        if (this.gameMode === 'tutorial') {
            this.tutorialSystem?.update();
        }

        if (this.gameMode === 'bossRush') {
            this.checkBossRushVictory();
        }

        if (this.gameMode === 'daily') {
            this.checkDailyObjective();
        }

        this.updateCamera();
        this.checkStage();
        for (const type in this.entities) {
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
        this.spawnEnemies();
        this.spawnBoss();
        this.spawnChests();
        this.spawnMapXpOrbs();
        this.spawnDynamicEvents();
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
        }

        // Monitoraggio versione 5.3 - ogni 30 secondi (1800 frame a 60fps)
        if (this.gameTime > 0 && this.gameTime % 1800 === 0) {
            this.trackRetentionMetrics();
        }

        // ANALYTICS VERSIONE 5.4: Auto-bilanciamento ogni 60 secondi (3600 frame a 60fps)
        if (this.gameTime > 0 && this.gameTime % 3600 === 0) {
            this.checkAutoBalance();
        }

        // Achievement tracking - ogni 10 secondi (600 frame a 60fps)
        if (this.gameTime > 0 && this.gameTime % 600 === 0) {
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
            const ventiMinuti = 20 * 60 * 1000;
            if (now - this.lastPeriodicCloudSyncTime >= ventiMinuti) {
                this.analyticsManager.uploadToGist(); // Sync cloud periodico
                this.lastPeriodicCloudSyncTime = now;
                console.log('🔄 Sync cloud periodico ogni 20 minuti');
            }
        }
    }

    loadAccessibilitySettings() {
        try {
            const raw = localStorage.getItem('ballSurvivalAccessibilitySettings');
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
            localStorage.setItem('ballSurvivalAccessibilitySettings', JSON.stringify({
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

    handleEscapeKey() {
        const anyPopupOpen = Object.values(this.dom.popups).some(p => p && p.style.display === 'flex');

        // Se il popup dei personaggi è aperto, torna al menù principale
        if (this.dom.popups.characterSelection && this.dom.popups.characterSelection.style.display === 'flex') {
            this.hideCharacterPopup();
            return;
        }
        // Su start screen: chiudi glossario/achievements e torna al menu
        if (this.state === 'startScreen') {
            if (this.dom.popups.glossary?.style.display === 'flex') { this.hideGlossary(); return; }
            if (this.dom.popups.achievements?.style.display === 'flex') { this.hideAllPopups(); this.showPopup('start'); return; }
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
        const worldX = (clientX - rect.left) * (this.camera.width / rect.width) + this.camera.x;
        const worldY = (clientY - rect.top) * (this.camera.height / rect.height) + this.camera.y;
        if (this.state === 'running' && Utils.getDistance({ x: worldX, y: worldY }, CONFIG.merchant) < CONFIG.merchant.interactionRadius) {
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

        // Balletto easter egg: track joystick spin (5 full rotations in 3s)
        if (distance > maxDistance * 0.5) {
            const angle = Math.atan2(dyNorm, dxNorm);
            if (this._ballettoLastAngle !== undefined) {
                let delta = angle - this._ballettoLastAngle;
                if (delta > Math.PI) delta -= 2 * Math.PI;
                if (delta < -Math.PI) delta += 2 * Math.PI;
                this._ballettoTotalSpin = (this._ballettoTotalSpin || 0) + Math.abs(delta);
            }
            this._ballettoLastAngle = angle;
            if (!this._ballettoStartTime) this._ballettoStartTime = Date.now();
            if (Date.now() - this._ballettoStartTime > 3000) {
                this._ballettoTotalSpin = 0;
                this._ballettoStartTime = Date.now();
            }
            if (this._ballettoTotalSpin >= Math.PI * 10) { // 5 full spins
                this._ballettoTotalSpin = 0;
                this._ballettoStartTime = 0;
                this.cheatCodeSystem?.discoverEgg('balletto');
                // Confetti explosion
                if (this.state === 'running' && this.player && this._entityClasses?.Particle) {
                    for (let i = 0; i < 40; i++) {
                        const a = Math.random() * Math.PI * 2;
                        const s = 2 + Math.random() * 6;
                        const colors = ['#ffd700', '#ff6347', '#00ff88', '#ff69b4', '#87ceeb', '#ff4500'];
                        this.addEntity('particles', new this._entityClasses.Particle(this.player.x, this.player.y, {
                            vx: Math.cos(a) * s, vy: Math.sin(a) * s,
                            life: 30 + Math.floor(Math.random() * 40),
                            color: colors[Math.floor(Math.random() * colors.length)]
                        }));
                    }
                    this.notifications?.push?.({ text: '💃 BALLETTO! 🎉', life: 200, color: '#ff69b4' });
                }
            }
        } else {
            this._ballettoLastAngle = undefined;
        }
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

    applyItemEffect(item) { const itemInfo = CONFIG.itemTypes[item.type]; this.notifications.push({ text: itemInfo.desc, life: 300 }); switch (item.type) { case 'HEAL_POTION': this.player.hp = Math.min(this.player.stats.maxHp, this.player.hp + this.player.stats.maxHp * 0.5); break; case 'XP_BOMB': this.player.gainXP(this.player.xpNext); break; case 'INVINCIBILITY': this.player.powerUpTimers.invincibility = 600; break; case 'DAMAGE_BOOST': this.player.powerUpTimers.damageBoost = 1200; break; case 'LEGENDARY_ORB': this.player.powerUpTimers.damageBoost = 3600; this.player.powerUpTimers.invincibility = 3600; break; } }

    // Funzione di test per il negozio
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

    spawnDummyEnemy() {
        const stats = { ...CONFIG.enemies?.base, hp: 10, damage: 0, speed: 0.5, xp: 5, radius: 20 };
        const x = this.player.x + 200;
        const y = this.player.y;
        this.addEntity('enemies', new Enemy(x, y, stats));
    }

    handleBossRushLogic() {
        if (this.gameMode !== 'bossRush') return;
        if (this.entities.bosses.length === 0 && !this._bossRushWaiting) {
            this._bossRushWaiting = true;
            setTimeout(() => {
                this.spawnBossRushBoss();
                this._bossRushWaiting = false;
            }, (CONFIG.bossRush?.spawnInterval || 5) * 1000);
        }
    }

    spawnBossRushBoss() {
        const cfg = CONFIG.bossRush || {};
        const base = CONFIG.boss?.base || { hp: 1500, speed: 1.8, radius: 45, damage: 35 };
        const k = this.bossesKilled;
        const hpPerKill = cfg.hpPerKill ?? 600;
        const damagePerKill = cfg.damagePerKill ?? 10;
        const speedFactor = cfg.speedFactorPerKill ?? 0.05;
        const drPerKill = cfg.drPerKill ?? 0.03;
        const drCap = cfg.drCap ?? 0.55;

        const stats = {
            ...base,
            hp: base.hp + k * hpPerKill,
            damage: (base.damage || 35) + k * damagePerKill,
            speed: (base.speed || 1.8) * (1 + k * speedFactor),
            dr: Math.min(drCap, k * drPerKill)
        };
        stats.maxHp = stats.hp;

        const spawnOne = (offsetX = 0, offsetY = 0) => {
            const bossType = cfg.bossSequence?.[(this.bossesKilled) % (cfg.bossSequence?.length || 4)] || 'boss';
            const x = this.player.x + (Math.random() - 0.5) * 100 + offsetX;
            const y = this.player.y - 400 + offsetY;
            this.addEntity('bosses', new Boss(x, y, { ...stats }));
            this.notifications.push({ text: `BOSS RUSH: ${bossType} APPARSO!`, life: 200 });
        };

        spawnOne();
        const doubleFrom = (cfg.doubleBossFromWave ?? 5) - 1;
        if (k >= doubleFrom) {
            spawnOne(200, 80);
        }
    }

    checkBossRushVictory() {
        if (this.gameMode === 'bossRush' && this.bossesKilled >= (CONFIG.bossRush?.victoryCount || 10)) {
            this.triggerVictory();
        }
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
