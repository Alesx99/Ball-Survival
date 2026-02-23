/**
 * AuthService - Logica autenticazione e persistenza giocatore (senza DOM)
 * @module auth/AuthService
 */

import { securityManager } from '../utils/security.js';
import { StorageManager, StorageKeys } from '../core/StorageManager.js';

const STORAGE_PLAYER = 'ballSurvivalPlayer';


export class AuthService {
    constructor() {
        this.currentPlayer = null;
        this.isLoggedIn = false;
        this.isGuest = false;
    }

    loadPlayerData() {
        const savedPlayer = StorageManager.getItem(STORAGE_PLAYER);
        if (savedPlayer) {
            try {
                this.currentPlayer = JSON.parse(savedPlayer);
                this.isLoggedIn = true;
                this.isGuest = this.currentPlayer.isGuest || false;
                console.log(`✅ Giocatore caricato: ${this.currentPlayer.username}${this.isGuest ? ' (Guest)' : ''}`);
            } catch (error) {
                console.error('❌ Errore caricamento giocatore:', error);
                this.resetPlayerData();
            }
        }
    }

    savePlayerData() {
        if (this.currentPlayer) {
            StorageManager.setItem(STORAGE_PLAYER, this.currentPlayer);
        }
    }

    resetPlayerData() {
        this.currentPlayer = null;
        this.isLoggedIn = false;
        this.isGuest = false;
        StorageManager.removeItem(STORAGE_PLAYER);
    }

    /** Autentica utente. Ritorna dati giocatore o null. */
    async authenticate(username, password) {
        const players = ((StorageManager.getItem(StorageKeys.PLAYERS) || {}));
        const player = players[username];

        if (!player) return null;

        if (player.password && !player.passwordHash) {
            console.log('🔄 Migrando password da plaintext per:', username);
            const { hash, salt } = await securityManager.hashPassword(player.password);
            player.passwordHash = hash;
            player.passwordSalt = salt;
            delete player.password;
            players[username] = player;
            StorageManager.setItem(StorageKeys.PLAYERS, players);
        }

        const isValid = await securityManager.verifyPassword(password, player.passwordHash, player.passwordSalt);

        if (isValid) {
            if (!player.achievements) player.achievements = {};
            if (!player.unlockedCharacters) player.unlockedCharacters = { standard: true };
            if (!player.unlockedWeapons) player.unlockedWeapons = {};
            if (!player.unlockedCores) player.unlockedCores = {};
            return {
                username: player.username,
                id: player.id,
                passwordHash: player.passwordHash,
                passwordSalt: player.passwordSalt,
                createdAt: player.createdAt,
                lastLogin: Date.now(),
                stats: player.stats || { totalGames: 0, totalTime: 0, bestLevel: 0, favoriteArchetype: 'standard' },
                achievements: player.achievements,
                unlockedCharacters: player.unlockedCharacters,
                unlockedWeapons: player.unlockedWeapons,
                unlockedCores: player.unlockedCores
            };
        }
        return null;
    }

    /** Crea nuovo account. Ritorna dati giocatore o null se username già usato. */
    async createPlayer(username, password) {
        const players = ((StorageManager.getItem(StorageKeys.PLAYERS) || {}));

        if (players[username]) return null;

        const { hash, salt } = await securityManager.hashPassword(password);

        const newPlayer = {
            username,
            id: 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            passwordHash: hash,
            passwordSalt: salt,
            createdAt: Date.now(),
            lastLogin: Date.now(),
            stats: { totalGames: 0, totalTime: 0, bestLevel: 0, favoriteArchetype: 'standard' },
            achievements: {},
            unlockedCharacters: { standard: true },
            unlockedWeapons: {},
            unlockedCores: {}
        };

        players[username] = newPlayer;
        StorageManager.setItem(StorageKeys.PLAYERS, players);

        return {
            username: newPlayer.username,
            id: newPlayer.id,
            passwordHash: newPlayer.passwordHash,
            passwordSalt: newPlayer.passwordSalt,
            createdAt: newPlayer.createdAt,
            lastLogin: newPlayer.lastLogin,
            stats: newPlayer.stats,
            achievements: newPlayer.achievements,
            unlockedCharacters: newPlayer.unlockedCharacters,
            unlockedWeapons: newPlayer.unlockedWeapons,
            unlockedCores: newPlayer.unlockedCores
        };
    }

    setCurrentPlayer(player) {
        this.currentPlayer = player;
        this.isLoggedIn = !!player;
        this.isGuest = player?.isGuest || false;
    }

    updatePlayerStats(gameStats) {
        if (!this.currentPlayer) return;

        this.currentPlayer.stats.totalGames++;
        this.currentPlayer.stats.totalTime += gameStats.duration || 0;
        this.currentPlayer.stats.bestLevel = Math.max(this.currentPlayer.stats.bestLevel, gameStats.level || 0);
        if (gameStats.archetype) this.currentPlayer.stats.favoriteArchetype = gameStats.archetype;
        this.currentPlayer.lastLogin = Date.now();
        this.savePlayerData();

        if (!this.isGuest) {
            const players = ((StorageManager.getItem(StorageKeys.PLAYERS) || {}));
            if (players[this.currentPlayer.username]) {
                players[this.currentPlayer.username].stats = this.currentPlayer.stats;
                players[this.currentPlayer.username].lastLogin = this.currentPlayer.lastLogin;
                StorageManager.setItem(StorageKeys.PLAYERS, players);
            }
        }
        console.log(`📊 Statistiche aggiornate per ${this.currentPlayer.username}${this.isGuest ? ' (Guest)' : ''}`);
    }

    getPlayerData() {
        return this.currentPlayer ? {
            id: this.currentPlayer.id,
            username: this.currentPlayer.username,
            stats: this.currentPlayer.stats,
            isGuest: this.isGuest || false
        } : null;
    }
}
