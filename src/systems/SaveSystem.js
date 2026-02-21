import { CONFIG } from '../config/index.js';

export const SaveSystem = {
    generateSaveCode(isDebug = false) {
        const saveData = {
            v: "4.7-menus",
            gems: this.totalGems,
            perm_upgrades: this.permanentUpgrades,
            skillTreeNodes: this.metaProgressionSystem?.unlockedNodes || {},
            unlocked_archetypes: Array.from(this.unlockedArchetypes)
        };

        if (isDebug) {
            saveData.run_state = {
                time: this.totalElapsedTime,
                score: this.score,
                player: {
                    level: this.player.level,
                    xp: this.player.xp,
                    xpNext: this.player.xpNext,
                    hp: this.player.hp,
                    stats: this.player.stats,
                    modifiers: this.player.modifiers,
                    x: this.player.x,
                    y: this.player.y,
                    archetype: this.player.archetype.id
                },
                spells: this.spells,
                passives: this.passives,
                difficultyTier: this.difficultyTier,
                cores: this.cores,
                weapons: this.weapons
            };
        }

        try {
            const jsonString = JSON.stringify(saveData);
            return btoa(jsonString);
        } catch (e) {
            console.error("Errore durante la creazione del codice di salvataggio:", e);
            return "ERRORE";
        }
    },

    loadFromSaveCode() {
        const code = this.dom.inputs.loadCode ? this.dom.inputs.loadCode.value.trim() : '';
        const notification = this.dom.loadNotification;
        if (!code) {
            if (notification) {
                notification.textContent = "Inserisci un codice.";
                notification.style.color = '#e74c3c';
                setTimeout(() => notification.textContent = "", 3000);
            }
            return;
        }

        try {
            const jsonString = atob(code);
            const loadedData = JSON.parse(jsonString);

            if (loadedData.gems !== undefined) this.totalGems = loadedData.gems;
            if (loadedData.perm_upgrades) {
                Object.keys(this.permanentUpgrades).forEach(key => {
                    if (loadedData.perm_upgrades[key] && typeof loadedData.perm_upgrades[key].level === 'number') {
                        this.permanentUpgrades[key].level = loadedData.perm_upgrades[key].level;
                    }
                });
            }
            if (loadedData.skillTreeNodes && this.metaProgressionSystem) {
                this.metaProgressionSystem.unlockedNodes = loadedData.skillTreeNodes;
            }
            this.saveGameData();

            if (loadedData.run_state) {
                const run = loadedData.run_state;
                this.resetRunState();
                this.totalElapsedTime = run.time || 0;
                this.score = run.score || 0;
                this.difficultyTier = run.difficultyTier || 0;

                this.player.resetForNewRun(this.permanentUpgrades, run.player.archetype || 'standard');
                this.player.level = run.player.level;
                this.player.xp = run.player.xp;
                this.player.xpNext = run.player.xpNext;
                this.player.hp = run.player.hp;
                this.player.x = run.player.x;
                this.player.y = run.player.y;

                this.spells = run.spells;
                this.passives = run.passives || {};
                const upgradeTree = CONFIG.upgradeTree || {};
                for (const id in upgradeTree) {
                    if (upgradeTree[id].type === 'passive' && !this.passives[id]) this.passives[id] = { level: 0 };
                }

                this.player.stats.maxHp += ((this.passives.health?.level || 0) * 25);
                this.player.stats.speed += ((this.passives.speed?.level || 0) * 0.4);
                this.player.stats.dr = Math.min(this.player.stats.dr + ((this.passives.armor?.level || 0) * 0.02), 1.0);
                this.player.modifiers.frequency *= Math.pow(0.92, this.passives.attack_speed?.level || 0);

                // Carica core e armi dal salvataggio
                if (run.cores) {
                    this.cores = run.cores;
                    this.player.cores = run.cores;
                }
                if (run.weapons) {
                    this.weapons = run.weapons;
                    this.player.weapons = run.weapons;
                }

                notification.textContent = "Stato di debug caricato!";
                notification.style.color = '#2ecc71';
                setTimeout(() => {
                    this.startGame(true);
                }, 1000);

            } else {
                notification.textContent = "Dati caricati!";
                notification.style.color = '#2ecc71';
            }
        } catch (e) {
            console.error("Errore durante il caricamento:", e);
            notification.textContent = "Codice non valido o corrotto.";
            notification.style.color = '#e74c3c';
        }
        setTimeout(() => notification.textContent = "", 3000);
    },

    copySaveCode() {
        const saveCodeInput = this.dom.inputs.saveCode;
        if (saveCodeInput && saveCodeInput.value) {
            saveCodeInput.select();
            saveCodeInput.setSelectionRange(0, 99999);
            try {
                document.execCommand('copy');
                this.notifications.push({ text: "Codice copiato!", life: 120 });
            } catch (err) {
                console.error("Copia fallita", err);
            }
        }
    },

    loadGameData() {
        this.permanentUpgrades = {};
        Object.keys(CONFIG.permanentUpgrades).forEach(key => {
            this.permanentUpgrades[key] = { ...CONFIG.permanentUpgrades[key], level: 0 };
        });

        // Inizializza materiali, core e armi
        this.materials = {};
        this.cores = {};
        this.weapons = {};
        this.arsenal = {
            activeCore: null,
            activeWeapons: []
        };

        let data = null;
        const LEGACY_KEY = 'ballSurvivalSaveData_v4.8';

        try {
            const player = this.playerAuth?.auth?.currentPlayer;
            // Giocatore loggato (non guest): carica dal suo account
            if (player && !player.isGuest && player.username) {
                const players = JSON.parse(localStorage.getItem('ballSurvivalPlayers') || '{}');
                const acc = players[player.username];
                if (acc?.saveData) {
                    data = acc.saveData;
                }
                // Nuovo account senza saveData: parte da zero (non usare legacy)
            } else {
                // Guest o nessun login: usa storage legacy
                const savedData = localStorage.getItem(LEGACY_KEY);
                if (savedData) data = JSON.parse(savedData);
            }

            if (data) {
                this.totalGems = data.totalGems ?? 0;
                if (data.upgrades) {
                    Object.keys(this.permanentUpgrades).forEach(key => {
                        if (data.upgrades[key]) this.permanentUpgrades[key].level = data.upgrades[key].level ?? 0;
                    });
                }
                if (data.skillTreeNodes && this.metaProgressionSystem) {
                    this.metaProgressionSystem.unlockedNodes = data.skillTreeNodes;
                }
                if (data.materials) this.materials = data.materials;
                if (data.cores) this.cores = data.cores;
                if (data.weapons) this.weapons = data.weapons;
                if (data.arsenal) this.arsenal = data.arsenal;
            } else {
                this.totalGems = 0;
            }
        } catch (e) {
            console.error("Impossibile caricare:", e);
            this.totalGems = 0;
        }
    },

    saveGameData() {
        const LEGACY_KEY = 'ballSurvivalSaveData_v4.8';
        const saveData = {
            totalGems: this.totalGems,
            upgrades: this.permanentUpgrades,
            skillTreeNodes: this.metaProgressionSystem?.unlockedNodes || {},
            materials: this.materials,
            cores: this.cores,
            weapons: this.weapons,
            arsenal: this.arsenal,
            saveDataUpdatedAt: Date.now()
        };
        try {
            localStorage.setItem(LEGACY_KEY, JSON.stringify(saveData));
            // Salva anche nel player loggato (per sync cloud)
            const player = this.playerAuth?.auth?.currentPlayer;
            if (player && !player.isGuest && player.username) {
                const players = JSON.parse(localStorage.getItem('ballSurvivalPlayers') || '{}');
                if (players[player.username]) {
                    players[player.username].saveData = saveData;
                    localStorage.setItem('ballSurvivalPlayers', JSON.stringify(players));
                }
            }
        } catch (e) {
            console.error("Impossibile salvare:", e);
        }
    }
};
