// Sistema di Login Semplice per Ball Survival

// ==================== RATE LIMITING ====================

// Rate limiting per GitHub API
let lastApiCall = 0;
const minApiInterval = 1000; // 1 secondo tra le chiamate

async function waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCall;
    
    if (timeSinceLastCall < minApiInterval) {
        const waitTime = minApiInterval - timeSinceLastCall;
        console.log(`⏳ Rate limiting: attendo ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    lastApiCall = Date.now();
}

// ==================== GESTIONE PLAYER ====================

// Stato globale del giocatore
let currentPlayer = null;
let isLoggedIn = false;
let isGuest = false;

// Inizializza il sistema
function initLogin() {
    loadPlayerData();
    updateLoginUI();
}

// Carica dati giocatore
function loadPlayerData() {
    const savedPlayer = localStorage.getItem('ballSurvivalPlayer');
    if (savedPlayer) {
        try {
            currentPlayer = JSON.parse(savedPlayer);
            isLoggedIn = true;
            isGuest = currentPlayer.isGuest || false;
            console.log(`✅ Giocatore caricato: ${currentPlayer.username}${isGuest ? ' (Guest)' : ''}`);
        } catch (error) {
            console.error('❌ Errore caricamento giocatore:', error);
            resetPlayerData();
        }
    }
}

// Salva dati giocatore
function savePlayerData() {
    if (currentPlayer) {
        localStorage.setItem('ballSurvivalPlayer', JSON.stringify(currentPlayer));
    }
}

// Reset dati giocatore
function resetPlayerData() {
    currentPlayer = null;
    isLoggedIn = false;
    isGuest = false;
    localStorage.removeItem('ballSurvivalPlayer');
}

// Aggiorna UI login
function updateLoginUI() {
    const loginMainMenu = document.getElementById('loginMainMenu');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const playerInfo = document.getElementById('playerInfo');
    
    if (isLoggedIn && currentPlayer) {
        // Giocatore loggato
        loginMainMenu.style.display = 'none';
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        playerInfo.style.display = 'block';
        
        const guestBadge = isGuest ? ' 🎮' : '';
        document.getElementById('playerName').textContent = `👤 ${currentPlayer.username}${guestBadge}`;
        
        const guestInfo = isGuest ? ' (Guest - Progressi locali)' : '';
        document.getElementById('playerStats').textContent = 
            `🎮 Partite: ${currentPlayer.stats.totalGames} | ⏱️ Tempo: ${formatTime(currentPlayer.stats.totalTime)} | 🏆 Miglior Livello: ${currentPlayer.stats.bestLevel}${guestInfo}`;
    } else {
        // Non loggato
        loginMainMenu.style.display = 'block';
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        playerInfo.style.display = 'none';
    }
}

// Mostra form login
function showLoginForm() {
    document.getElementById('loginMainMenu').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('playerInfo').style.display = 'none';
    
    // Pre-compila il token se già salvato
    const savedToken = localStorage.getItem('ballSurvivalGithubToken');
    if (savedToken) {
        document.getElementById('githubToken').value = savedToken;
    }
}

// Mostra form registrazione
function showRegisterForm() {
    document.getElementById('loginMainMenu').style.display = 'none';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('playerInfo').style.display = 'none';
    
    // Pre-compila il token se già salvato
    const savedToken = localStorage.getItem('ballSurvivalGithubToken');
    if (savedToken) {
        document.getElementById('regGithubToken').value = savedToken;
    }
}

// Torna al menu principale login
function backToLoginMenu() {
    document.getElementById('loginMainMenu').style.display = 'block';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('playerInfo').style.display = 'none';
    hideMessage();
}

// Gioca come guest
function playAsGuest() {
    const guestPlayer = {
        username: `Guest_${Math.floor(Math.random() * 10000)}`,
        id: 'guest_' + Date.now(),
        isGuest: true,
        createdAt: Date.now(),
        lastLogin: Date.now(),
        stats: {
            totalGames: 0,
            totalTime: 0,
            bestLevel: 0,
            favoriteArchetype: 'standard'
        }
    };
    
    currentPlayer = guestPlayer;
    isLoggedIn = true;
    isGuest = true;
    savePlayerData();
    updateLoginUI();
    showMessage('✅ Modalità Guest attivata!', false);
    
    console.log('🎮 Giocatore guest creato:', guestPlayer.username);
}

// Login
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const githubToken = document.getElementById('githubToken').value;
    
    if (!username || !password) {
        showMessage('⚠️ Compila tutti i campi obbligatori', true);
        return;
    }
    
    try {
        // Configura cloud sync PRIMA del login se token fornito
        const savedToken = localStorage.getItem('ballSurvivalGithubToken');
        const tokenToUse = githubToken && githubToken.trim() !== '' ? githubToken : savedToken;
        
        if (tokenToUse) {
            await configureCloudSync(tokenToUse);
            
            // Carica account da cloud PRIMA dell'autenticazione
            await loadUserAccounts();
        }
        
        // Ora prova l'autenticazione con tutti gli account disponibili
        const playerData = await authenticatePlayer(username, password);
        
        if (playerData) {
            currentPlayer = playerData;
            isLoggedIn = true;
            isGuest = false;
            savePlayerData();
            updateLoginUI();
            
            // Sincronizza account dopo login riuscito
            if (tokenToUse) {
                await syncUserAccounts();
                showMessage('✅ Login completato! Cloud sync configurato.', false);
            } else {
                showMessage('✅ Login completato!', false);
            }
            
            // Sync con analytics se disponibile
            if (window.analyticsManager) {
                await window.analyticsManager.syncPlayerData(currentPlayer);
            }
        } else {
            showMessage('❌ Username o password non validi', true);
        }
    } catch (error) {
        showMessage('❌ Errore durante il login', true);
        console.error('Login error:', error);
    }
}

// Registrazione
async function register() {
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;
    const githubToken = document.getElementById('regGithubToken').value;
    
    if (!username || !password || !passwordConfirm) {
        showMessage('⚠️ Compila tutti i campi obbligatori', true);
        return;
    }
    
    if (username.length < 3) {
        showMessage('⚠️ Username deve essere di almeno 3 caratteri', true);
        return;
    }
    
    if (password.length < 4) {
        showMessage('⚠️ Password deve essere di almeno 4 caratteri', true);
        return;
    }
    
    if (password !== passwordConfirm) {
        showMessage('⚠️ Le password non coincidono', true);
        return;
    }
    
    try {
        // Configura cloud sync PRIMA della registrazione se token fornito
        const savedToken = localStorage.getItem('ballSurvivalGithubToken');
        const tokenToUse = githubToken && githubToken.trim() !== '' ? githubToken : savedToken;
        
        if (tokenToUse) {
            await configureCloudSync(tokenToUse);
            
            // Carica account da cloud PRIMA di verificare se l'username esiste
            await loadUserAccounts();
        }
        
        // Ora prova a creare il giocatore con tutti gli account disponibili
        const playerData = await createPlayer(username, password);
        
        if (playerData) {
            currentPlayer = playerData;
            isLoggedIn = true;
            isGuest = false;
            savePlayerData();
            updateLoginUI();
            
            // Sincronizza il nuovo account dopo registrazione riuscita
            if (tokenToUse) {
                await syncUserAccounts();
                showMessage('✅ Registrazione completata! Cloud sync configurato.', false);
            } else {
                showMessage('✅ Registrazione completata!', false);
            }
            
            // Sync con analytics se disponibile
            if (window.analyticsManager) {
                await window.analyticsManager.syncPlayerData(currentPlayer);
            }
        } else {
            showMessage('❌ Username già esistente', true);
        }
    } catch (error) {
        showMessage('❌ Errore durante la registrazione', true);
        console.error('Registration error:', error);
    }
}

// Logout
function logout() {
    resetPlayerData();
    updateLoginUI();
    showMessage('🚪 Logout completato', false);
    console.log('🚪 Logout effettuato');
}

// Autenticazione giocatore
async function authenticatePlayer(username, password) {
    const players = JSON.parse(localStorage.getItem('ballSurvivalPlayers') || '{}');
    const player = players[username];
    
    if (player && player.password === password) {
        return {
            username: player.username,
            id: player.id,
            createdAt: player.createdAt,
            lastLogin: Date.now(),
            stats: player.stats || {
                totalGames: 0,
                totalTime: 0,
                bestLevel: 0,
                favoriteArchetype: 'standard'
            }
        };
    }
    
    return null;
}

// Crea nuovo giocatore
async function createPlayer(username, password) {
    const players = JSON.parse(localStorage.getItem('ballSurvivalPlayers') || '{}');
    
    if (players[username]) {
        return null; // Username già esistente
    }
    
    const newPlayer = {
        username: username,
        id: 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        password: password,
        createdAt: Date.now(),
        lastLogin: Date.now(),
        stats: {
            totalGames: 0,
            totalTime: 0,
            bestLevel: 0,
            favoriteArchetype: 'standard'
        }
    };
    
    players[username] = newPlayer;
    localStorage.setItem('ballSurvivalPlayers', JSON.stringify(players));
    
    return {
        username: newPlayer.username,
        id: newPlayer.id,
        createdAt: newPlayer.createdAt,
        lastLogin: newPlayer.lastLogin,
        stats: newPlayer.stats
    };
}

// Mostra messaggio
function showMessage(message, isError = false) {
    const messageBox = document.getElementById('loginMessage');
    messageBox.textContent = message;
    messageBox.style.display = 'block';
    messageBox.style.background = isError ? '#f44336' : '#4CAF50';
    messageBox.style.color = 'white';
    
    setTimeout(() => {
        hideMessage();
    }, 3000);
}

// Nascondi messaggio
function hideMessage() {
    document.getElementById('loginMessage').style.display = 'none';
}

// Formatta tempo
function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
}

// Aggiorna statistiche giocatore
function updatePlayerStats(gameStats) {
    if (!currentPlayer) return;
    
    currentPlayer.stats.totalGames++;
    currentPlayer.stats.totalTime += gameStats.duration || 0;
    currentPlayer.stats.bestLevel = Math.max(currentPlayer.stats.bestLevel, gameStats.level || 0);
    
    if (gameStats.archetype) {
        currentPlayer.stats.favoriteArchetype = gameStats.archetype;
    }
    
    currentPlayer.lastLogin = Date.now();
    savePlayerData();
    
    // Aggiorna anche nel database locale (solo per utenti registrati)
    if (!isGuest) {
        const players = JSON.parse(localStorage.getItem('ballSurvivalPlayers') || '{}');
        if (players[currentPlayer.username]) {
            players[currentPlayer.username].stats = currentPlayer.stats;
            players[currentPlayer.username].lastLogin = currentPlayer.lastLogin;
            localStorage.setItem('ballSurvivalPlayers', JSON.stringify(players));
            
            // Sync account con cloud se configurato
            if (window.analyticsManager && window.analyticsManager.config.enableCloudSync) {
                setTimeout(() => {
                    syncUserAccounts();
                }, 2000); // Sync dopo 2 secondi
            }
        }
    }
    
    console.log(`📊 Statistiche aggiornate per ${currentPlayer.username}${isGuest ? ' (Guest)' : ''}`);
}

// Ottieni dati giocatore per analytics
function getPlayerData() {
    return currentPlayer ? {
        id: currentPlayer.id,
        username: currentPlayer.username,
        stats: currentPlayer.stats,
        isGuest: isGuest || false
    } : null;
}

// Inizializza quando il DOM è pronto
document.addEventListener('DOMContentLoaded', function() {
    initLogin();
    
    // Controlla se è il primo avvio o se il token è già configurato
    const savedToken = localStorage.getItem('ballSurvivalGithubToken');
    
    if (savedToken && savedToken !== 'ghp_your_token_here') {
        // Token già configurato, vai direttamente al login
        showLoginScreen();
        
        // Carica account in background
        setTimeout(async () => {
            if (window.analyticsManager) {
                window.analyticsManager.config.githubToken = savedToken;
                window.analyticsManager.config.enableCloudSync = true;
                await loadUserAccounts();
            }
        }, 1000);
    } else {
        // Primo avvio o token non configurato, mostra setup
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('tokenSetupScreen').style.display = 'block';
        
        // Pre-filla token se presente
        if (savedToken && savedToken !== 'ghp_your_token_here') {
            document.getElementById('startupToken').value = savedToken;
        }
    }
});

// Configura cloud sync con token GitHub
async function configureCloudSync(githubToken) {
    try {
        if (!window.analyticsManager) {
            console.log('⚠️ AnalyticsManager non disponibile');
            return;
        }
        
        // Aggiorna la configurazione dell'analytics manager
        window.analyticsManager.config.githubToken = githubToken;
        window.analyticsManager.config.enableCloudSync = true;
        
        // Salva il token localmente per uso futuro
        localStorage.setItem('ballSurvivalGithubToken', githubToken);
        
        // Test della configurazione
        const testResult = await window.analyticsManager.testCloudSync();
        
        if (testResult) {
            console.log('✅ Cloud sync configurato con successo');
            showMessage('☁️ Cloud sync configurato! I dati verranno sincronizzati automaticamente.', false);
        } else {
            console.log('⚠️ Configurazione cloud sync fallita');
            showMessage('⚠️ Token GitHub non valido o errore di configurazione', true);
        }
        
    } catch (error) {
        console.error('❌ Errore configurazione cloud sync:', error);
        showMessage('❌ Errore configurazione cloud sync', true);
    }
}

// Carica token salvato all'avvio
function loadSavedToken() {
    const savedToken = localStorage.getItem('ballSurvivalGithubToken');
    if (savedToken && window.analyticsManager) {
        window.analyticsManager.config.githubToken = savedToken;
        window.analyticsManager.config.enableCloudSync = true;
        console.log('✅ Token GitHub caricato da localStorage');
    }
}

// Mostra configurazione cloud sync
function showCloudSyncConfig() {
    const savedToken = localStorage.getItem('ballSurvivalGithubToken');
    
    if (savedToken) {
        const useSaved = confirm(`🔧 Token GitHub già configurato!\n\nVuoi usare il token salvato o inserirne uno nuovo?\n\n✅ OK = Usa token salvato\n❌ Annulla = Inserisci nuovo token`);
        
        if (useSaved) {
            configureCloudSync(savedToken);
            return;
        }
    }
    
    const token = prompt('🔧 Inserisci il tuo Token GitHub per abilitare il Cloud Sync:\n\n💡 Ottieni il token da: https://github.com/settings/tokens\n\n⚠️ Seleziona solo il permesso "gist"');
    
    if (token && token.trim() !== '') {
        configureCloudSync(token.trim());
    } else if (token !== null) {
        showMessage('⚠️ Token non valido', true);
    }
}

// Test sync account
async function testAccountSync() {
    console.log('🧪 Test Sync Account...');
    
    const players = JSON.parse(localStorage.getItem('ballSurvivalPlayers') || '{}');
    console.log('Account locali:', Object.keys(players));
    
    if (window.analyticsManager && window.analyticsManager.config.enableCloudSync) {
        const syncResult = await syncUserAccounts();
        const loadResult = await loadUserAccounts();
        
        console.log('Sync result:', syncResult);
        console.log('Load result:', loadResult);
        
        const updatedPlayers = JSON.parse(localStorage.getItem('ballSurvivalPlayers') || '{}');
        console.log('Account dopo sync:', Object.keys(updatedPlayers));
    } else {
        console.log('⚠️ Cloud sync non configurato');
    }
}

// Sincronizza account utenti con Gist
async function syncUserAccounts() {
    try {
        if (!window.analyticsManager || !window.analyticsManager.config.enableCloudSync) {
            console.log('⚠️ Cloud sync non configurato per sync account');
            return false;
        }
        
        const players = JSON.parse(localStorage.getItem('ballSurvivalPlayers') || '{}');
        if (Object.keys(players).length === 0) {
            console.log('📝 Nessun account da sincronizzare');
            return true;
        }
        
        console.log('🔄 Sincronizzazione account utenti...');
        
        // Rate limiting prima di upload
        await waitForRateLimit();
        
        // Prepara dati account per upload
        const accountsData = {
            lastSync: Date.now(),
            totalAccounts: Object.keys(players).length,
            accounts: players
        };
        
        // Upload al Gist
        const response = await fetch(`https://api.github.com/gists/${window.analyticsManager.config.gistId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${window.analyticsManager.config.githubToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                description: `Ball Survival - Accounts & Analytics - Updated ${new Date().toISOString()}`,
                public: false,
                files: {
                    'analytics.json': {
                        content: JSON.stringify(window.analyticsManager.analyticsData, null, 2)
                    },
                    'accounts.json': {
                        content: JSON.stringify(accountsData, null, 2)
                    }
                }
            })
        });
        
        if (response.ok) {
            console.log('✅ Account sincronizzati con successo');
            return true;
        } else {
            const errorText = await response.text();
            console.error('❌ Errore sync account:', response.status, errorText);
            
            if (response.status === 404) {
                console.log('⚠️ Gist non accessibile per scrittura, disabilitando cloud sync...');
                if (window.analyticsManager) {
                    window.analyticsManager.config.enableCloudSync = false;
                }
            } else if (response.status === 403 && errorText.includes('rate limit')) {
                console.log('⚠️ Rate limit raggiunto, riproverò più tardi...');
                return false;
            }
            
            return false;
        }
        
    } catch (error) {
        console.error('❌ Errore sync account:', error);
        return false;
    }
}

// Carica account da Gist
async function loadUserAccounts() {
    try {
        if (!window.analyticsManager || !window.analyticsManager.config.enableCloudSync) {
            console.log('⚠️ Cloud sync non configurato per caricamento account');
            return false;
        }
        
        console.log('🔄 Caricamento account da cloud...');
        
        // Rate limiting prima di scaricare
        await waitForRateLimit();
        
        const response = await fetch(`https://api.github.com/gists/${window.analyticsManager.config.gistId}`, {
            headers: {
                'Authorization': `token ${window.analyticsManager.config.githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.ok) {
            const gist = await response.json();
            const accountsFile = gist.files['accounts.json'];
            
            if (accountsFile && accountsFile.content) {
                const accountsData = JSON.parse(accountsFile.content);
                const localPlayers = JSON.parse(localStorage.getItem('ballSurvivalPlayers') || '{}');
                let accountsLoaded = 0;
                
                // Merge intelligente degli account
                for (const [username, account] of Object.entries(accountsData.accounts)) {
                    if (!localPlayers[username] || localPlayers[username].lastLogin < account.lastLogin) {
                        localPlayers[username] = account;
                        accountsLoaded++;
                    }
                }
                
                localStorage.setItem('ballSurvivalPlayers', JSON.stringify(localPlayers));
                console.log(`✅ Account caricati da Gist: ${accountsLoaded} nuovi account`);
                return true;
            } else {
                console.log('📝 Nessun file accounts.json trovato nel Gist');
                return true; // Non è un errore, potrebbe essere il primo utilizzo
            }
        }
        
        return false;
    } catch (error) {
        console.error('❌ Errore caricamento account:', error);
        return false;
    }
}

// Funzioni per il flusso di avvio
async function configureStartupToken() {
    const token = document.getElementById('startupToken').value.trim();
    const statusElement = document.getElementById('tokenSetupStatus');
    
    if (!token) {
        showStartupStatus('⚠️ Inserisci un token GitHub valido', 'error');
        return;
    }
    
    if (!token.startsWith('ghp_')) {
        showStartupStatus('⚠️ Token GitHub deve iniziare con "ghp_"', 'error');
        return;
    }
    
    showStartupStatus('🔄 Configurazione in corso...', 'info');
    
    try {
        // Salva token
        localStorage.setItem('ballSurvivalGithubToken', token);
        
        // Configura analytics manager
        if (window.analyticsManager) {
            window.analyticsManager.config.githubToken = token;
            window.analyticsManager.config.enableCloudSync = true;
        }
        
        // Avvia processo di sync
        await startSyncProcess();
        
    } catch (error) {
        console.error('Errore configurazione token:', error);
        showStartupStatus('❌ Errore configurazione: ' + error.message, 'error');
    }
}

function skipTokenSetup() {
    showStartupStatus('⏭️ Modalità solo locale attivata', 'info');
    setTimeout(() => {
        showLoginScreen();
    }, 1500);
}

function showStartupStatus(message, type) {
    const statusElement = document.getElementById('tokenSetupStatus');
    statusElement.textContent = message;
    statusElement.className = `status-message ${type}`;
}

async function startSyncProcess() {
    // Mostra schermata sync
    document.getElementById('tokenSetupScreen').style.display = 'none';
    document.getElementById('syncScreen').style.display = 'block';
    
    const progressElement = document.getElementById('syncProgress');
    const statusElement = document.getElementById('syncStatus');
    const analyticsStatus = document.getElementById('analyticsStatus');
    const accountsStatus = document.getElementById('accountsStatus');
    
    try {
        // Step 1: Test connessione (25%)
        statusElement.textContent = 'Test connessione al cloud...';
        progressElement.style.width = '25%';
        
        if (window.analyticsManager) {
            const testResult = await window.analyticsManager.testCloudSync();
            if (!testResult) {
                throw new Error('Connessione al cloud fallita');
            }
        }
        
        // Step 2: Carica analytics (50%)
        statusElement.textContent = 'Caricamento analytics...';
        progressElement.style.width = '50%';
        analyticsStatus.textContent = '✅';
        
        // Step 3: Carica account (75%)
        statusElement.textContent = 'Caricamento account utenti...';
        progressElement.style.width = '75%';
        
        if (window.analyticsManager && window.analyticsManager.config.enableCloudSync) {
            await loadUserAccounts();
            accountsStatus.textContent = '✅';
        } else {
            accountsStatus.textContent = '⏭️';
        }
        
        // Step 4: Completato (100%)
        statusElement.textContent = 'Sincronizzazione completata!';
        progressElement.style.width = '100%';
        
        setTimeout(() => {
            showLoginScreen();
        }, 2000);
        
    } catch (error) {
        console.error('Errore sync:', error);
        statusElement.textContent = '❌ Errore sincronizzazione: ' + error.message;
        analyticsStatus.textContent = '❌';
        accountsStatus.textContent = '❌';
        
        setTimeout(() => {
            showLoginScreen();
        }, 3000);
    }
}

function showLoginScreen() {
    // Nascondi tutte le schermate con controllo esistenza
    const tokenSetupScreen = document.getElementById('tokenSetupScreen');
    const syncScreen = document.getElementById('syncScreen');
    const startScreen = document.getElementById('startScreen');
    
    if (tokenSetupScreen) tokenSetupScreen.style.display = 'none';
    if (syncScreen) syncScreen.style.display = 'none';
    
    // Mostra schermata login (usa startScreen che contiene il login)
    if (startScreen) {
        startScreen.style.display = 'block';
        
        // Pre-filla token se disponibile
        const savedToken = localStorage.getItem('ballSurvivalGithubToken');
        if (savedToken) {
            const tokenInputs = document.querySelectorAll('input[id*="githubToken"]');
            tokenInputs.forEach(input => {
                input.value = savedToken;
            });
        }
    } else {
        console.error('❌ Elemento startScreen non trovato');
    }
}

// Funzione per resettare configurazione token
function resetTokenConfiguration() {
    if (confirm('⚠️ Sei sicuro di voler resettare la configurazione del token?\n\nQuesto rimuoverà il token salvato e dovrai riconfigurarlo al prossimo avvio.')) {
        localStorage.removeItem('ballSurvivalGithubToken');
        
        if (window.analyticsManager) {
            window.analyticsManager.config.githubToken = 'ghp_your_token_here';
            window.analyticsManager.config.enableCloudSync = false;
        }
        
        showMessage('✅ Configurazione token resettata. Riavvia il gioco per riconfigurare.', false);
        
        // Torna alla schermata di setup
        setTimeout(() => {
            document.getElementById('playerInfoScreen').style.display = 'none';
            document.getElementById('tokenSetupScreen').style.display = 'block';
        }, 2000);
    }
}

// Funzioni per il popup cloud sync
function showCloudSyncConfig() {
    const popup = document.getElementById('cloudSyncPopup');
    const statusDisplay = document.getElementById('syncStatusDisplay');
    const tokenInput = document.getElementById('cloudSyncToken');
    
    // Pre-filla token se disponibile
    const savedToken = localStorage.getItem('ballSurvivalGithubToken');
    if (savedToken) {
        tokenInput.value = savedToken;
    }
    
    // Aggiorna stato
    updateSyncStatus();
    
    popup.style.display = 'block';
}

function closeCloudSyncConfig() {
    document.getElementById('cloudSyncPopup').style.display = 'none';
}

function updateSyncStatus() {
    const statusDisplay = document.getElementById('syncStatusDisplay');
    
    if (window.analyticsManager && window.analyticsManager.config.enableCloudSync) {
        statusDisplay.innerHTML = `
            <p>✅ Cloud Sync Abilitato</p>
            <p>Token: ${window.analyticsManager.config.githubToken.substring(0, 10)}...</p>
            <p>Gist ID: ${window.analyticsManager.config.gistId || 'Non configurato'}</p>
        `;
    } else {
        statusDisplay.innerHTML = `
            <p>❌ Cloud Sync Disabilitato</p>
            <p>Configura un token GitHub per abilitare la sincronizzazione</p>
        `;
    }
}

function configureCloudSync() {
    const token = document.getElementById('cloudSyncToken').value.trim();
    const messageElement = document.getElementById('cloudSyncMessage');
    
    if (!token) {
        showCloudSyncMessage('⚠️ Inserisci un token GitHub valido', 'error');
        return;
    }
    
    if (!token.startsWith('ghp_')) {
        showCloudSyncMessage('⚠️ Token GitHub deve iniziare con "ghp_"', 'error');
        return;
    }
    
    showCloudSyncMessage('🔄 Configurazione in corso...', 'info');
    
    // Salva token
    localStorage.setItem('ballSurvivalGithubToken', token);
    
    // Configura analytics manager
    if (window.analyticsManager) {
        window.analyticsManager.config.githubToken = token;
        window.analyticsManager.config.enableCloudSync = true;
    }
    
    // Testa connessione
    testCloudSync().then(success => {
        if (success) {
            showCloudSyncMessage('✅ Cloud Sync configurato con successo!', 'success');
            updateSyncStatus();
        } else {
            showCloudSyncMessage('❌ Errore configurazione. Verifica il token.', 'error');
        }
    });
}

function testCloudSync() {
    const messageElement = document.getElementById('cloudSyncMessage');
    showCloudSyncMessage('🧪 Test connessione in corso...', 'info');
    
    if (window.analyticsManager) {
        return window.analyticsManager.testCloudSync().then(success => {
            if (success) {
                showCloudSyncMessage('✅ Connessione al cloud riuscita!', 'success');
            } else {
                showCloudSyncMessage('❌ Gist non accessibile per scrittura. Verifica i permessi del Gist.', 'error');
            }
            return success;
        });
    } else {
        showCloudSyncMessage('❌ Analytics Manager non disponibile', 'error');
        return Promise.resolve(false);
    }
}

function resetCloudSync() {
    if (confirm('⚠️ Sei sicuro di voler resettare la configurazione del cloud sync?\n\nQuesto rimuoverà il token salvato.')) {
        localStorage.removeItem('ballSurvivalGithubToken');
        
        if (window.analyticsManager) {
            window.analyticsManager.config.githubToken = 'ghp_your_token_here';
            window.analyticsManager.config.enableCloudSync = false;
        }
        
        showCloudSyncMessage('✅ Configurazione resettata', 'success');
        updateSyncStatus();
        
        // Pulisci input
        document.getElementById('cloudSyncToken').value = '';
    }
}

function showCloudSyncMessage(message, type) {
    const messageElement = document.getElementById('cloudSyncMessage');
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    messageElement.className = `status-message ${type}`;
    
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 5000);
}



// Esponi funzioni globalmente
window.currentPlayer = currentPlayer;
window.isLoggedIn = isLoggedIn;
window.isGuest = isGuest;
window.updatePlayerStats = updatePlayerStats;
window.getPlayerData = getPlayerData;
window.configureCloudSync = configureCloudSync;
window.showCloudSyncConfig = showCloudSyncConfig;
window.syncUserAccounts = syncUserAccounts;
window.loadUserAccounts = loadUserAccounts;
window.testAccountSync = testAccountSync;
window.testCloudSync = testCloudSync;
window.resetCloudSync = resetCloudSync;
window.closeCloudSyncConfig = closeCloudSyncConfig;

// Inizializzazione al caricamento della pagina
document.addEventListener('DOMContentLoaded', function() {
    initLogin();
    
    // Event listener per chiudere popup cloud sync
    const closeCloudSyncBtn = document.getElementById('closeCloudSyncBtn');
    if (closeCloudSyncBtn) {
        closeCloudSyncBtn.addEventListener('click', closeCloudSyncConfig);
    }
    
    // Controlla se c'è un token salvato per il cloud sync
    const savedToken = localStorage.getItem('ballSurvivalGithubToken');
    if (savedToken && savedToken !== 'ghp_your_token_here') {
        // Configura analytics manager se disponibile
        if (window.analyticsManager) {
            window.analyticsManager.config.githubToken = savedToken;
            window.analyticsManager.config.enableCloudSync = true;
        }
        
        // Avvia processo di sync
        startSyncProcess();
    } else {
        // Mostra schermata di configurazione token
        document.getElementById('tokenSetupScreen').style.display = 'block';
        document.getElementById('startScreen').style.display = 'none';
    }
}); 