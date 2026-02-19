/**
 * Login Manager - Sistema di Login e Autenticazione per Ball Survival
 * Facade che coordina AuthService (logica) e UI (DOM)
 * @module auth/LoginManager
 */

import { AuthService } from './AuthService.js';
import { cloudSyncManager } from '../utils/cloudSync.js';

export class LoginManager {
    constructor() {
        this.auth = new AuthService();
        this.analyticsManager = null;
    }

    get currentPlayer() { return this.auth.currentPlayer; }
    get isLoggedIn() { return this.auth.isLoggedIn; }
    get isGuest() { return this.auth.isGuest; }

    setDependencies({ analyticsManager, game }) {
        this.analyticsManager = analyticsManager;
        this.game = game;
    }

    initLogin() {
        this.auth.loadPlayerData();
        this._migrateLocalAccounts();
        this.updateLoginUI();

        // Carica token salvato se presente (cloud sync opzionale)
        const savedToken = localStorage.getItem('ballSurvivalGithubToken');
        if (savedToken && savedToken !== 'ghp_your_token_here') {
            cloudSyncManager.configure(savedToken);
            if (this.analyticsManager) {
                this.analyticsManager.config.githubToken = savedToken;
                this.analyticsManager.config.enableCloudSync = true;
            }
            setTimeout(async () => {
                await this.loadUserAccounts();
                this.game?.loadGameData?.();
            }, 1000);
        }
    }

    loadPlayerData() {
        this.auth.loadPlayerData();
    }

    savePlayerData() {
        this.auth.savePlayerData();
    }

    resetPlayerData() {
        this.auth.resetPlayerData();
    }

    updateLoginUI() {
        const loginMainMenu = document.getElementById('loginMainMenu');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const playerInfo = document.getElementById('playerInfo');

        if (this.isLoggedIn && this.currentPlayer) {
            if (loginMainMenu) loginMainMenu.style.display = 'none';
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'none';
            if (playerInfo) playerInfo.style.display = 'block';

            const guestBadge = this.isGuest ? ' 🎮' : '';
            const playerName = document.getElementById('playerName');
            if (playerName) playerName.textContent = `👤 ${this.currentPlayer.username}${guestBadge}`;

            const guestInfo = this.isGuest ? ' (Guest - Progressi locali)' : '';
            const playerStats = document.getElementById('playerStats');
            if (playerStats) playerStats.textContent =
                `🎮 Partite: ${this.currentPlayer.stats.totalGames} | ⏱️ Tempo: ${this._formatTime(this.currentPlayer.stats.totalTime)} | 🏆 Miglior Livello: ${this.currentPlayer.stats.bestLevel}${guestInfo}`;
        } else {
            if (loginMainMenu) loginMainMenu.style.display = 'block';
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'none';
            if (playerInfo) playerInfo.style.display = 'none';
        }
    }

    showLoginForm() {
        const loginMainMenu = document.getElementById('loginMainMenu');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const playerInfo = document.getElementById('playerInfo');
        if (loginMainMenu) loginMainMenu.style.display = 'none';
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
        if (playerInfo) playerInfo.style.display = 'none';

        const savedToken = localStorage.getItem('ballSurvivalGithubToken');
        if (savedToken) {
            const githubToken = document.getElementById('githubToken');
            if (githubToken) githubToken.value = savedToken;
        }
    }

    showRegisterForm() {
        const loginMainMenu = document.getElementById('loginMainMenu');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const playerInfo = document.getElementById('playerInfo');
        if (loginMainMenu) loginMainMenu.style.display = 'none';
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
        if (playerInfo) playerInfo.style.display = 'none';

        const savedToken = localStorage.getItem('ballSurvivalGithubToken');
        if (savedToken) {
            const regGithubToken = document.getElementById('regGithubToken');
            if (regGithubToken) regGithubToken.value = savedToken;
        }
    }

    backToLoginMenu() {
        const loginMainMenu = document.getElementById('loginMainMenu');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const playerInfo = document.getElementById('playerInfo');
        if (loginMainMenu) loginMainMenu.style.display = 'block';
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'none';
        if (playerInfo) playerInfo.style.display = 'none';
        this._hideMessage();
    }

    playAsGuest() {
        const guestPlayer = {
            username: `Guest_${Math.floor(Math.random() * 10000)}`,
            id: 'guest_' + Date.now(),
            isGuest: true,
            createdAt: Date.now(),
            lastLogin: Date.now(),
            stats: { totalGames: 0, totalTime: 0, bestLevel: 0, favoriteArchetype: 'standard' }
        };

        this.auth.setCurrentPlayer(guestPlayer);
        this.auth.savePlayerData();
        this.updateLoginUI();
        this._showMessage('✅ Modalità Guest attivata!', false);
        console.log('🎮 Giocatore guest creato:', guestPlayer.username);
    }

    async login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const githubToken = document.getElementById('githubToken').value;

        if (!username || !password) {
            this._showMessage('⚠️ Compila tutti i campi obbligatori', true);
            return;
        }

        try {
            const savedToken = localStorage.getItem('ballSurvivalGithubToken');
            const tokenToUse = githubToken && githubToken.trim() !== '' ? githubToken : savedToken;

            if (tokenToUse) {
                await this.configureCloudSync(tokenToUse);
                await this.loadUserAccounts();
            }

            const playerData = await this.auth.authenticate(username, password);

            if (playerData) {
                this.auth.setCurrentPlayer(playerData);
                this.auth.savePlayerData();
                this.game?.loadGameData?.();
                this.updateLoginUI();

                if (tokenToUse) {
                    await this.syncUserAccounts();
                    this._showMessage('✅ Login completato! Cloud sync configurato.', false);
                } else {
                    this._showMessage('✅ Login completato!', false);
                }

                if (this.analyticsManager) {
                    await this.analyticsManager.syncPlayerData(this.currentPlayer);
                }
            } else {
                this._showMessage('❌ Username o password non validi', true);
            }
        } catch (error) {
            this._showMessage('❌ Errore durante il login', true);
            console.error('Login error:', error);
        }
    }

    async register() {
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const passwordConfirm = document.getElementById('regPasswordConfirm').value;
        const githubToken = document.getElementById('regGithubToken').value;

        if (!username || !password || !passwordConfirm) {
            this._showMessage('⚠️ Compila tutti i campi obbligatori', true);
            return;
        }

        if (username.length < 3) {
            this._showMessage('⚠️ Username deve essere di almeno 3 caratteri', true);
            return;
        }

        if (password.length < 4) {
            this._showMessage('⚠️ Password deve essere di almeno 4 caratteri', true);
            return;
        }

        if (password !== passwordConfirm) {
            this._showMessage('⚠️ Le password non coincidono', true);
            return;
        }

        try {
            const savedToken = localStorage.getItem('ballSurvivalGithubToken');
            const tokenToUse = githubToken && githubToken.trim() !== '' ? githubToken : savedToken;

            if (tokenToUse) {
                await this.configureCloudSync(tokenToUse);
                await this.loadUserAccounts();
            }

            const playerData = await this.auth.createPlayer(username, password);

            if (playerData) {
                this.auth.setCurrentPlayer(playerData);
                this.auth.savePlayerData();
                this.game?.loadGameData?.();
                this.updateLoginUI();

                if (tokenToUse) {
                    await this.syncUserAccounts();
                    this._showMessage('✅ Registrazione completata! Cloud sync configurato.', false);
                } else {
                    this._showMessage('✅ Registrazione completata!', false);
                }

                if (this.analyticsManager) {
                    await this.analyticsManager.syncPlayerData(this.currentPlayer);
                }
            } else {
                this._showMessage('❌ Username già esistente', true);
            }
        } catch (error) {
            this._showMessage('❌ Errore durante la registrazione', true);
            console.error('Registration error:', error);
        }
    }

    logout() {
        this.resetPlayerData();
        this.updateLoginUI();
        this._showMessage('🚪 Logout completato', false);
        console.log('🚪 Logout effettuato');
    }

    updatePlayerStats(gameStats) {
        this.auth.updatePlayerStats(gameStats);
        if (!this.isGuest && cloudSyncManager.config.enableCloudSync) {
            setTimeout(() => this.syncUserAccounts(), 2000);
        }
    }

    getPlayerData() {
        return this.auth.getPlayerData();
    }

    // === Cloud Sync Methods ===

    async configureCloudSync(githubToken) {
        const token = typeof githubToken === 'string' && githubToken.trim() !== ''
            ? githubToken.trim()
            : document.getElementById('cloudSyncToken')?.value?.trim();

        const fromPopup = !githubToken || (typeof githubToken === 'string' && githubToken.trim() === '');

        if (!token) {
            if (fromPopup) this.showCloudSyncMessage('⚠️ Inserisci un token GitHub valido', 'error');
            else this._showMessage('⚠️ Token GitHub non valido', true);
            return;
        }

        if (!token.startsWith('ghp_')) {
            if (fromPopup) this.showCloudSyncMessage('⚠️ Token GitHub deve iniziare con "ghp_"', 'error');
            else this._showMessage('⚠️ Token GitHub non valido', true);
            return;
        }

        try {
            if (fromPopup) this.showCloudSyncMessage('🔄 Configurazione in corso...', 'info');
            cloudSyncManager.configure(token);

            if (this.analyticsManager) {
                this.analyticsManager.config.githubToken = token;
                this.analyticsManager.config.enableCloudSync = true;
            }

            const testResult = await cloudSyncManager.testConnection();

            if (testResult) {
                this._showMessage('☁️ Cloud sync configurato! I dati verranno sincronizzati automaticamente.', false);
                if (fromPopup) {
                    this.showCloudSyncMessage('✅ Cloud Sync configurato con successo!', 'success');
                    this._updateSyncStatus();
                }
            } else {
                this._showMessage('⚠️ Token GitHub non valido o errore di configurazione', true);
                if (fromPopup) this.showCloudSyncMessage('❌ Errore configurazione. Verifica il token.', 'error');
            }
        } catch (error) {
            console.error('❌ Errore configurazione cloud sync:', error);
            this._showMessage('❌ Errore configurazione cloud sync', true);
            if (fromPopup) this.showCloudSyncMessage('❌ Errore configurazione cloud sync', 'error');
        }
    }

    showCloudSyncConfig() {
        const savedToken = localStorage.getItem('ballSurvivalGithubToken');

        if (savedToken) {
            const useSaved = confirm(`🔧 Token GitHub già configurato!\n\nVuoi usare il token salvato o inserirne uno nuovo?\n\n✅ OK = Usa token salvato\n❌ Annulla = Inserisci nuovo token`);

            if (useSaved) {
                this.configureCloudSync(savedToken);
                return;
            }
        }

        const popup = document.getElementById('cloudSyncPopup');
        const tokenInput = document.getElementById('cloudSyncToken');

        if (savedToken && tokenInput) tokenInput.value = savedToken;
        this._updateSyncStatus();
        if (popup) popup.style.display = 'block';
    }

    closeCloudSyncConfig() {
        const popup = document.getElementById('cloudSyncPopup');
        if (popup) popup.style.display = 'none';
    }

    async syncUserAccounts() {
        try {
            if (!cloudSyncManager.config.enableCloudSync) {
                console.log('⚠️ Cloud sync non configurato');
                return false;
            }
            // Salva lo stato attuale nel player prima di sincronizzare
            this.game?.saveGameData?.();
            const players = JSON.parse(localStorage.getItem('ballSurvivalPlayers') || '{}');
            if (Object.keys(players).length === 0) {
                console.log('📝 Nessun account da sincronizzare');
                return true;
            }

            const sanitizedPlayers = {};
            for (const username in players) {
                sanitizedPlayers[username] = { ...players[username] };
                if (sanitizedPlayers[username].password) {
                    delete sanitizedPlayers[username].password;
                }
                // Migrazione: forza struttura saveData per account esistenti (compatibilità Gist)
                if (sanitizedPlayers[username].saveData === undefined) {
                    sanitizedPlayers[username].saveData = null;
                }
            }

            const accountsData = {
                lastSync: Date.now(),
                totalAccounts: Object.keys(sanitizedPlayers).length,
                accounts: sanitizedPlayers
            };

            const analyticsData = this.analyticsManager ? this.analyticsManager.analyticsData : null;
            return await cloudSyncManager.syncAll(analyticsData, accountsData);
        } catch (error) {
            console.error('❌ Errore sync account:', error);
            return false;
        }
    }

    async loadUserAccounts() {
        try {
            if (!cloudSyncManager.config.enableCloudSync) {
                console.log('⚠️ Cloud sync non configurato');
                return false;
            }

            console.log('🔄 Caricamento account da cloud...');
            const cloudData = await cloudSyncManager.download();

            if (!cloudData || !cloudData.accounts) {
                console.log('📝 Nessun account nel cloud');
                return true;
            }

            const accountsData = cloudData.accounts;
            const localPlayers = JSON.parse(localStorage.getItem('ballSurvivalPlayers') || '{}');
            let accountsLoaded = 0;

            for (const [username, account] of Object.entries(accountsData.accounts || {})) {
                const normalizedCloud = this._normalizeAccount(account);
                if (!localPlayers[username]) {
                    localPlayers[username] = normalizedCloud;
                    accountsLoaded++;
                } else {
                    const mergedAccount = this._mergeAccountState(
                        this._normalizeAccount(localPlayers[username]),
                        normalizedCloud
                    );
                    localPlayers[username] = this._normalizeAccount(mergedAccount);
                    accountsLoaded++;
                    console.log(`🔀 Merge per ${username}`);
                }
            }

            localStorage.setItem('ballSurvivalPlayers', JSON.stringify(localPlayers));
            console.log(`✅ Account caricati: ${accountsLoaded}`);
            return true;
        } catch (error) {
            console.error('❌ Errore caricamento account:', error);
            return false;
        }
    }

    async testAccountSync() {
        console.log('🧪 Test Sync Account...');
        const players = JSON.parse(localStorage.getItem('ballSurvivalPlayers') || '{}');
        console.log('Account locali:', Object.keys(players));

        if (this.analyticsManager?.config?.enableCloudSync) {
            const syncResult = await this.syncUserAccounts();
            const loadResult = await this.loadUserAccounts();
            console.log('Sync result:', syncResult);
            console.log('Load result:', loadResult);
            const updatedPlayers = JSON.parse(localStorage.getItem('ballSurvivalPlayers') || '{}');
            console.log('Account dopo sync:', Object.keys(updatedPlayers));
        } else {
            console.log('⚠️ Cloud sync non configurato');
        }
    }

    async testCloudSync() {
        this.showCloudSyncMessage('🧪 Test connessione in corso...', 'info');

        const success = await cloudSyncManager.testConnection();
        if (success) {
            this.showCloudSyncMessage('✅ Connessione al cloud riuscita!', 'success');
        } else {
            this.showCloudSyncMessage('❌ Connessione fallita. Verifica token e permessi.', 'error');
        }
        return success;
    }

    resetCloudSync() {
        if (confirm('⚠️ Sei sicuro di voler resettare la configurazione del cloud sync?\n\nQuesto rimuoverà il token salvato.')) {
            cloudSyncManager.reset();

            if (this.analyticsManager) {
                this.analyticsManager.config.githubToken = '';
                this.analyticsManager.config.enableCloudSync = false;
            }

            this.showCloudSyncMessage('✅ Configurazione resettata', 'success');
            this._updateSyncStatus();

            const tokenInput = document.getElementById('cloudSyncToken');
            if (tokenInput) tokenInput.value = '';
        }
    }

    resetTokenConfiguration() {
        if (confirm('⚠️ Sei sicuro di voler resettare la configurazione del token?\n\nQuesto rimuoverà il token salvato.')) {
            cloudSyncManager.reset();

            if (this.analyticsManager) {
                this.analyticsManager.config.githubToken = '';
                this.analyticsManager.config.enableCloudSync = false;
            }

            this._showMessage('✅ Configurazione token resettata. Usa il pulsante Cloud Sync per riconfigurare.', false);
        }
    }

    async forcePushCurrentUserToCloud() {
        if (!this.currentPlayer) {
            alert('Nessun utente loggato!');
            return;
        }
        const players = JSON.parse(localStorage.getItem('ballSurvivalPlayers') || '{}');
        players[this.currentPlayer.username] = this.currentPlayer;
        localStorage.setItem('ballSurvivalPlayers', JSON.stringify(players));

        const result = await this.syncUserAccounts();
        if (result) {
            alert('✅ Dati utente sovrascritti e sincronizzati sul cloud!');
        } else {
            alert('❌ Errore durante la sincronizzazione.');
        }
    }

    showCloudSyncMessage(message, type) {
        const messageElement = document.getElementById('cloudSyncMessage');
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.style.display = 'block';
            messageElement.className = `status-message ${type}`;
        }

        setTimeout(() => {
            if (messageElement) messageElement.style.display = 'none';
        }, 5000);
    }

    // === Private / Helper Methods ===

    _showMessage(message, isError = false) {
        const messageBox = document.getElementById('loginMessage');
        if (messageBox) {
            messageBox.textContent = message;
            messageBox.style.display = 'block';
            messageBox.style.background = isError ? '#f44336' : '#4CAF50';
            messageBox.style.color = 'white';
        }

        setTimeout(() => this._hideMessage(), 3000);
    }

    _hideMessage() {
        const messageBox = document.getElementById('loginMessage');
        if (messageBox) messageBox.style.display = 'none';
    }

    _formatTime(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    }

    /** Migrazione: normalizza tutti gli account in localStorage (struttura saveData). */
    _migrateLocalAccounts() {
        try {
            const players = JSON.parse(localStorage.getItem('ballSurvivalPlayers') || '{}');
            let changed = false;
            for (const username in players) {
                if (players[username].saveData === undefined) {
                    players[username].saveData = null;
                    changed = true;
                }
            }
            if (changed) {
                localStorage.setItem('ballSurvivalPlayers', JSON.stringify(players));
                console.log('📦 Migrazione account completata (saveData)');
            }
        } catch (e) {
            console.warn('Migrazione account:', e);
        }
    }

    /** Normalizza un account: aggiunge saveData se mancante (compatibilità con account esistenti). */
    _normalizeAccount(account) {
        if (!account) return account;
        const normalized = { ...account };
        if (normalized.saveData === undefined) {
            normalized.saveData = null;
        }
        return normalized;
    }

    _mergeAccountState(local, cloud) {
        const merged = {};
        merged.stats = {};
        const statKeys = new Set([
            ...Object.keys(local.stats || {}),
            ...Object.keys(cloud.stats || {})
        ]);
        for (const key of statKeys) {
            const localVal = local.stats?.[key] ?? 0;
            const cloudVal = cloud.stats?.[key] ?? 0;
            merged.stats[key] = Math.max(localVal, cloudVal);
        }

        merged.achievements = {};
        const achKeys = new Set([
            ...Object.keys(local.achievements || {}),
            ...Object.keys(cloud.achievements || {})
        ]);
        for (const key of achKeys) {
            merged.achievements[key] = Boolean((local.achievements && local.achievements[key]) || (cloud.achievements && cloud.achievements[key]));
        }

        merged.unlockedCharacters = {};
        const charKeys = new Set([
            ...Object.keys(local.unlockedCharacters || {}),
            ...Object.keys(cloud.unlockedCharacters || {})
        ]);
        for (const key of charKeys) {
            merged.unlockedCharacters[key] = Boolean((local.unlockedCharacters && local.unlockedCharacters[key]) || (cloud.unlockedCharacters && cloud.unlockedCharacters[key]));
        }

        merged.unlockedWeapons = {};
        const weaponKeys = new Set([
            ...Object.keys(local.unlockedWeapons || {}),
            ...Object.keys(cloud.unlockedWeapons || {})
        ]);
        for (const key of weaponKeys) {
            merged.unlockedWeapons[key] = Boolean((local.unlockedWeapons && local.unlockedWeapons[key]) || (cloud.unlockedWeapons && cloud.unlockedWeapons[key]));
        }

        merged.unlockedCores = {};
        const coreKeys = new Set([
            ...Object.keys(local.unlockedCores || {}),
            ...Object.keys(cloud.unlockedCores || {})
        ]);
        for (const key of coreKeys) {
            merged.unlockedCores[key] = Boolean((local.unlockedCores && local.unlockedCores[key]) || (cloud.unlockedCores && cloud.unlockedCores[key]));
        }

        merged.username = cloud.username || local.username;
        merged.id = cloud.id || local.id;
        merged.createdAt = Math.min(local.createdAt || Date.now(), cloud.createdAt || Date.now());
        merged.lastLogin = Math.max(local.lastLogin || 0, cloud.lastLogin || 0);
        merged.isGuest = local.isGuest || cloud.isGuest || false;
        merged.passwordHash = cloud.passwordHash || local.passwordHash || "";
        merged.passwordSalt = cloud.passwordSalt || local.passwordSalt || "";

        if (local.password && !local.passwordHash) {
            merged.password = local.password;
        }

        // Merge saveData: preferisci il più recente (saveDataUpdatedAt)
        const localSave = local.saveData;
        const cloudSave = cloud.saveData;
        if (localSave && cloudSave) {
            const localTs = localSave.saveDataUpdatedAt ?? 0;
            const cloudTs = cloudSave.saveDataUpdatedAt ?? 0;
            merged.saveData = cloudTs >= localTs ? cloudSave : localSave;
        } else {
            merged.saveData = cloudSave || localSave || null;
        }

        return merged;
    }

    _updateSyncStatus() {
        const statusDisplay = document.getElementById('syncStatusDisplay');

        if (cloudSyncManager.config.enableCloudSync) {
            if (statusDisplay) {
                statusDisplay.innerHTML = `
                    <p>✅ Cloud Sync Abilitato</p>
                    <p>Token: ${cloudSyncManager.config.githubToken.substring(0, 10)}...</p>
                    <p>Gist ID: ${cloudSyncManager.config.gistId || 'Non configurato'}</p>
                `;
            }
        } else {
            if (statusDisplay) {
                statusDisplay.innerHTML = `
                    <p>❌ Cloud Sync Disabilitato</p>
                    <p>Configura un token GitHub per abilitare la sincronizzazione</p>
                `;
            }
        }
    }
}

export const playerAuth = new LoginManager();

/**
 * Attaches login-related handlers. Call after DOM is ready.
 * @param {LoginManager} auth - The LoginManager instance
 * @param {{ analyticsManager?: object }} deps - Dependencies (analyticsManager from game)
 */
export function setupLoginHandlers(auth = playerAuth, deps = {}) {
    if (deps.analyticsManager || deps.game) auth.setDependencies({ analyticsManager: deps.analyticsManager, game: deps.game });

    // Attach event listeners (no inline onclick)
    const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', () => fn()); };
    bind('showLoginFormBtn', () => auth.showLoginForm());
    bind('showRegisterFormBtn', () => auth.showRegisterForm());
    bind('playAsGuestBtn', () => auth.playAsGuest());
    bind('backToLoginMenuBtn1', () => auth.backToLoginMenu());
    bind('backToLoginMenuBtn2', () => auth.backToLoginMenu());
    bind('loginBtn', () => auth.login());
    bind('registerBtn', () => auth.register());
    bind('logoutBtn', () => auth.logout());
    bind('showCloudSyncConfigBtn', () => auth.showCloudSyncConfig());
    bind('syncUserAccountsBtn', () => auth.syncUserAccounts());
    bind('resetTokenConfigBtn', () => auth.resetTokenConfiguration());
    bind('configureCloudSyncBtn', () => auth.configureCloudSync());
    bind('testCloudSyncBtn', () => auth.testCloudSync());
    bind('resetCloudSyncBtn', () => auth.resetCloudSync());
    bind('cloudSyncBtn', () => auth.showCloudSyncConfig());

    const closeCloudSyncBtn = document.getElementById('closeCloudSyncBtn');
    if (closeCloudSyncBtn) closeCloudSyncBtn.addEventListener('click', () => auth.closeCloudSyncConfig());

    const forcePushBtn = document.getElementById('forcePushSyncBtn');
    if (forcePushBtn) forcePushBtn.addEventListener('click', () => auth.forcePushCurrentUserToCloud());

    requestAnimationFrame(() => auth.initLogin());
}
