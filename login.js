// Sistema di Login e Registrazione per Ball Survival
class PlayerAuth {
    constructor() {
        this.currentPlayer = null;
        this.isLoggedIn = false;
        this.init();
    }
    
    init() {
        this.loadPlayerData();
        this.showLoginScreen();
    }
    
    loadPlayerData() {
        const savedPlayer = localStorage.getItem('ballSurvivalPlayer');
        if (savedPlayer) {
            try {
                this.currentPlayer = JSON.parse(savedPlayer);
                this.isLoggedIn = true;
                console.log('✅ Giocatore caricato:', this.currentPlayer.username);
            } catch (error) {
                console.error('❌ Errore caricamento giocatore:', error);
                this.currentPlayer = null;
                this.isLoggedIn = false;
            }
        }
    }
    
    savePlayerData() {
        if (this.currentPlayer) {
            localStorage.setItem('ballSurvivalPlayer', JSON.stringify(this.currentPlayer));
        }
    }
    
    showLoginScreen() {
        const loginHTML = `
            <div id="loginOverlay" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                font-family: 'Arial', sans-serif;
            ">
                <div style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 40px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    text-align: center;
                    color: white;
                    max-width: 400px;
                    width: 90%;
                ">
                    <h1 style="margin: 0 0 30px 0; font-size: 28px;">🎮 Ball Survival</h1>
                    
                    <div id="loginForm" style="display: block;">
                        <h2 style="margin: 0 0 20px 0; font-size: 20px;">Accedi o Registrati</h2>
                        
                        <input type="text" id="username" placeholder="Nome Giocatore" style="
                            width: 100%;
                            padding: 12px;
                            margin: 10px 0;
                            border: none;
                            border-radius: 8px;
                            font-size: 16px;
                            box-sizing: border-box;
                        ">
                        
                        <input type="password" id="password" placeholder="Password" style="
                            width: 100%;
                            padding: 12px;
                            margin: 10px 0;
                            border: none;
                            border-radius: 8px;
                            font-size: 16px;
                            box-sizing: border-box;
                        ">
                        
                        <div style="margin: 20px 0;">
                            <button onclick="playerAuth.login()" style="
                                background: #4CAF50;
                                color: white;
                                padding: 12px 25px;
                                border: none;
                                border-radius: 8px;
                                font-size: 16px;
                                margin: 5px;
                                cursor: pointer;
                                transition: background 0.3s;
                            " onmouseover="this.style.background='#45a049'" onmouseout="this.style.background='#4CAF50'">
                                🔑 Accedi
                            </button>
                            
                            <button onclick="playerAuth.register()" style="
                                background: #2196F3;
                                color: white;
                                padding: 12px 25px;
                                border: none;
                                border-radius: 8px;
                                font-size: 16px;
                                margin: 5px;
                                cursor: pointer;
                                transition: background 0.3s;
                            " onmouseover="this.style.background='#1976D2'" onmouseout="this.style.background='#2196F3'">
                                ✨ Registrati
                            </button>
                        </div>
                        
                        <div id="loginMessage" style="
                            margin: 10px 0;
                            padding: 10px;
                            border-radius: 5px;
                            display: none;
                        "></div>
                    </div>
                    
                    <div id="playerInfo" style="display: none;">
                        <h2 style="margin: 0 0 20px 0; font-size: 20px;">Benvenuto!</h2>
                        <p id="playerName" style="font-size: 18px; margin: 10px 0;"></p>
                        <p id="playerStats" style="font-size: 14px; margin: 10px 0; opacity: 0.8;"></p>
                        
                        <button onclick="playerAuth.startGame()" style="
                            background: #FF9800;
                            color: white;
                            padding: 15px 30px;
                            border: none;
                            border-radius: 8px;
                            font-size: 18px;
                            margin: 10px;
                            cursor: pointer;
                            transition: background 0.3s;
                        " onmouseover="this.style.background='#F57C00'" onmouseout="this.style.background='#FF9800'">
                            🚀 Inizia Partita
                        </button>
                        
                        <button onclick="playerAuth.logout()" style="
                            background: #f44336;
                            color: white;
                            padding: 10px 20px;
                            border: none;
                            border-radius: 8px;
                            font-size: 14px;
                            margin: 5px;
                            cursor: pointer;
                            transition: background 0.3s;
                        " onmouseover="this.style.background='#d32f2f'" onmouseout="this.style.background='#f44336'">
                            🔓 Logout
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', loginHTML);
        
        // Se già loggato, mostra info giocatore
        if (this.isLoggedIn) {
            this.showPlayerInfo();
        }
    }
    
    showMessage(message, isError = false) {
        const messageDiv = document.getElementById('loginMessage');
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';
        messageDiv.style.background = isError ? '#f44336' : '#4CAF50';
        messageDiv.style.color = 'white';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
    
    async login() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            this.showMessage('⚠️ Inserisci username e password', true);
            return;
        }
        
        try {
            // Simula login (in produzione sarebbe una chiamata API)
            const playerData = await this.authenticatePlayer(username, password);
            
            if (playerData) {
                this.currentPlayer = playerData;
                this.isLoggedIn = true;
                this.savePlayerData();
                this.showPlayerInfo();
                this.showMessage('✅ Login effettuato con successo!');
                
                // Sync dati all'avvio
                if (window.analyticsManager) {
                    await window.analyticsManager.syncPlayerData(this.currentPlayer);
                }
            } else {
                this.showMessage('❌ Username o password non validi', true);
            }
        } catch (error) {
            this.showMessage('❌ Errore durante il login', true);
            console.error('Login error:', error);
        }
    }
    
    async register() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            this.showMessage('⚠️ Inserisci username e password', true);
            return;
        }
        
        if (username.length < 3) {
            this.showMessage('⚠️ Username deve essere di almeno 3 caratteri', true);
            return;
        }
        
        if (password.length < 4) {
            this.showMessage('⚠️ Password deve essere di almeno 4 caratteri', true);
            return;
        }
        
        try {
            // Simula registrazione
            const playerData = await this.createPlayer(username, password);
            
            if (playerData) {
                this.currentPlayer = playerData;
                this.isLoggedIn = true;
                this.savePlayerData();
                this.showPlayerInfo();
                this.showMessage('✅ Registrazione completata!');
                
                // Sync dati all'avvio
                if (window.analyticsManager) {
                    await window.analyticsManager.syncPlayerData(this.currentPlayer);
                }
            } else {
                this.showMessage('❌ Username già esistente', true);
            }
        } catch (error) {
            this.showMessage('❌ Errore durante la registrazione', true);
            console.error('Registration error:', error);
        }
    }
    
    async authenticatePlayer(username, password) {
        // Simula autenticazione (in produzione sarebbe una chiamata API)
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
    
    async createPlayer(username, password) {
        // Simula creazione giocatore
        const players = JSON.parse(localStorage.getItem('ballSurvivalPlayers') || '{}');
        
        if (players[username]) {
            return null; // Username già esistente
        }
        
        const newPlayer = {
            username: username,
            id: this.generatePlayerId(),
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
    
    generatePlayerId() {
        return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    showPlayerInfo() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('playerInfo').style.display = 'block';
        
        document.getElementById('playerName').textContent = `👤 ${this.currentPlayer.username}`;
        document.getElementById('playerStats').textContent = 
            `🎮 Partite: ${this.currentPlayer.stats.totalGames} | ⏱️ Tempo: ${this.formatTime(this.currentPlayer.stats.totalTime)} | 🏆 Miglior Livello: ${this.currentPlayer.stats.bestLevel}`;
    }
    
    formatTime(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    }
    
    startGame() {
        // Nasconde il login overlay
        document.getElementById('loginOverlay').style.display = 'none';
        
        // Avvia il gioco
        if (window.startGame) {
            window.startGame();
        }
        
        console.log('🎮 Partita iniziata per:', this.currentPlayer.username);
    }
    
    logout() {
        this.currentPlayer = null;
        this.isLoggedIn = false;
        localStorage.removeItem('ballSurvivalPlayer');
        
        // Ricarica la pagina per mostrare login
        location.reload();
    }
    
    // Funzione per aggiornare statistiche giocatore
    updatePlayerStats(gameStats) {
        if (!this.currentPlayer) return;
        
        this.currentPlayer.stats.totalGames++;
        this.currentPlayer.stats.totalTime += gameStats.duration || 0;
        this.currentPlayer.stats.bestLevel = Math.max(this.currentPlayer.stats.bestLevel, gameStats.level || 0);
        
        if (gameStats.archetype) {
            this.currentPlayer.stats.favoriteArchetype = gameStats.archetype;
        }
        
        this.currentPlayer.lastLogin = Date.now();
        this.savePlayerData();
        
        // Aggiorna anche nel database locale
        const players = JSON.parse(localStorage.getItem('ballSurvivalPlayers') || '{}');
        if (players[this.currentPlayer.username]) {
            players[this.currentPlayer.username].stats = this.currentPlayer.stats;
            players[this.currentPlayer.username].lastLogin = this.currentPlayer.lastLogin;
            localStorage.setItem('ballSurvivalPlayers', JSON.stringify(players));
        }
    }
    
    // Funzione per ottenere dati giocatore per analytics
    getPlayerData() {
        return this.currentPlayer ? {
            id: this.currentPlayer.id,
            username: this.currentPlayer.username,
            stats: this.currentPlayer.stats
        } : null;
    }
}

// Inizializza il sistema di autenticazione
const playerAuth = new PlayerAuth();
window.playerAuth = playerAuth; 