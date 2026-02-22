/**
 * StorageManager
 * Centralizza l'accesso al localStorage per gestire versioning, migrazioni e gestione errori
 * (es. QuotaExceededError o storage disabilitato).
 */

export const StorageKeys = {
    GITHUB_TOKEN: 'ballSurvivalGithubToken',
    TOTAL_BOSS_KILLS: 'ballSurvivalTotalBossKills',
    STAGE_PROGRESS: 'ballSurvivalStageProgress',
    SKIN_STORAGE: 'ballSurvivalSkins',
    PLAYERS: 'ballSurvivalPlayers',
    RUN_HISTORY: 'ballSurvival_runHistory',
    ACHIEVEMENTS: 'ballSurvival_achievements',
    GLOBAL_STATS: 'ballSurvival_globalStats',
    BESTIARY: 'ballSurvival_bestiary',
    AUDIO: 'ballSurvivalAudioSettings',
    DIFFICULTY_TIER: 'ballSurvivalActiveDifficultyTier',
    ARCHETYPES_PLAYED: 'ballSurvival_archetypesPlayed',
    ACCESSIBILITY: 'ballSurvivalAccessibilitySettings',
    LEGACY_SAVE: 'ballSurvivalSaveData'
};

export const StorageManager = {
    version: 1,

    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null || item === undefined) return defaultValue;
            try {
                return JSON.parse(item);
            } catch {
                return item; // Format as-is (e.g. basic strings/numbers)
            }
        } catch (e) {
            console.error(`[StorageManager] Errore di lettura per la chiave ${key}:`, e);
            this._notifyUser(`Attenzione: Si è verificato un errore nel leggere i dati di salvataggio.`);
            return defaultValue;
        }
    },

    setItem(key, value) {
        try {
            const val = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, val);
            return true;
        } catch (e) {
            console.error(`[StorageManager] Errore di scrittura per la chiave ${key}:`, e);
            if (e.name === 'QuotaExceededError' || e.code === 22) {
                this._notifyUser(`Spazio di archiviazione esaurito. Impossibile salvare la partita.`);
            } else {
                this._notifyUser(`Errore nel salvataggio dei dati sul dispositivo.`);
            }
            return false;
        }
    },

    removeItem(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error(`[StorageManager] Errore di rimozione per la chiave ${key}:`, e);
        }
    },

    clearAll() {
        try {
            Object.values(StorageKeys).forEach(key => this.removeItem(key));
        } catch (e) {
            console.error(`[StorageManager] Errore nello svuotamento:`, e);
        }
    },

    _notifyUser(message) {
        // Usa eventi custom per comunicare con la UI o fallback al semplice alert (non bloccante in console) se la UI non c'è
        if (typeof document !== 'undefined') {
            document.dispatchEvent(new CustomEvent('storage-error', { detail: { message } }));
        }
        console.warn(message);
    }
};
