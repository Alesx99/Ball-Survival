/**
 * Ball Survival - Utility Functions
 * Funzioni di utilità per migliorare l'esperienza utente
 * @author Alessio (Alesx99) + AI Assistant
 * @version 1.1.0
 */

// ==================== PERFORMANCE MONITORING ====================

/**
 * Monitor FPS e performance del gioco
 */
class PerformanceMonitor {
    constructor() {
        this.fps = 0;
        this.frames = 0;
        this.lastTime = performance.now();
        this.enabled = false;
    }
    
    update() {
        if (!this.enabled) return;
        
        this.frames++;
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        
        if (deltaTime >= 1000) {
            this.fps = Math.round((this.frames * 1000) / deltaTime);
            this.frames = 0;
            this.lastTime = currentTime;
            
            // Mostra FPS in console (debug)
            if (this.fps < 30) {
                console.warn(`⚠️ FPS basso: ${this.fps}`);
            }
        }
    }
    
    getFPS() {
        return this.fps;
    }
    
    enable() {
        this.enabled = true;
        console.log('📊 Performance Monitor abilitato');
    }
    
    disable() {
        this.enabled = false;
    }
}

// ==================== LOCAL STORAGE MANAGER ====================

/**
 * Gestione sicura del localStorage con fallback
 */
class StorageManager {
    constructor() {
        this.available = this.checkAvailability();
    }
    
    checkAvailability() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('⚠️ localStorage non disponibile:', e);
            return false;
        }
    }
    
    set(key, value) {
        if (!this.available) {
            console.warn('⚠️ localStorage non disponibile, dati non salvati');
            return false;
        }
        
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (e) {
            console.error('❌ Errore salvataggio:', e);
            
            // Se quota exceeded, prova a pulire vecchi dati
            if (e.name === 'QuotaExceededError') {
                this.cleanup();
                return this.set(key, value); // Retry
            }
            
            return false;
        }
    }
    
    get(key, defaultValue = null) {
        if (!this.available) return defaultValue;
        
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('❌ Errore lettura:', e);
            return defaultValue;
        }
    }
    
    remove(key) {
        if (!this.available) return;
        localStorage.removeItem(key);
    }
    
    clear() {
        if (!this.available) return;
        localStorage.clear();
    }
    
    cleanup() {
        console.log('🧹 Pulizia localStorage...');
        
        // Rimuovi vecchi backup se esistono
        const keys = Object.keys(localStorage);
        const backups = keys.filter(k => k.includes('_backup_'));
        
        backups.forEach(key => {
            console.log(`🗑️ Rimozione backup: ${key}`);
            localStorage.removeItem(key);
        });
    }
    
    getSize() {
        if (!this.available) return 0;
        
        let size = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                size += localStorage[key].length + key.length;
            }
        }
        
        return size;
    }
    
    getSizeFormatted() {
        const bytes = this.getSize();
        if (bytes < 1024) return bytes + ' bytes';
        if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / 1048576).toFixed(2) + ' MB';
    }
}

// ==================== NOTIFICATION SYSTEM ====================

/**
 * Sistema di notifiche in-game
 */
class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.maxNotifications = 3;
        this.init();
    }
    
    init() {
        // Crea container per notifiche
        this.container = document.createElement('div');
        this.container.id = 'notificationContainer';
        this.container.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(this.container);
    }
    
    show(message, type = 'info', duration = 3000) {
        // Limita numero di notifiche
        if (this.notifications.length >= this.maxNotifications) {
            this.notifications[0].remove();
            this.notifications.shift();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const colors = {
            info: '#3498db',
            success: '#2ecc71',
            warning: '#f39c12',
            error: '#e74c3c'
        };
        
        notification.style.cssText = `
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            border-left: 4px solid ${colors[type] || colors.info};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
            font-family: 'Cinzel', serif;
            font-size: 14px;
            pointer-events: auto;
            opacity: 0;
            transform: translateX(100px);
            transition: all 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        this.container.appendChild(notification);
        this.notifications.push(notification);
        
        // Animazione entrata
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto-rimozione
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100px)';
            
            setTimeout(() => {
                notification.remove();
                const index = this.notifications.indexOf(notification);
                if (index > -1) {
                    this.notifications.splice(index, 1);
                }
            }, 300);
        }, duration);
    }
    
    info(message, duration) {
        this.show(message, 'info', duration);
    }
    
    success(message, duration) {
        this.show(message, 'success', duration);
    }
    
    warning(message, duration) {
        this.show(message, 'warning', duration);
    }
    
    error(message, duration) {
        this.show(message, 'error', duration);
    }
}

// ==================== KEYBOARD SHORTCUTS ====================

/**
 * Gestione scorciatoie da tastiera
 */
class KeyboardShortcuts {
    constructor() {
        this.shortcuts = new Map();
        this.enabled = true;
        this.init();
    }
    
    init() {
        document.addEventListener('keydown', (e) => {
            if (!this.enabled) return;
            
            const key = e.key.toLowerCase();
            const ctrl = e.ctrlKey;
            const shift = e.shiftKey;
            const alt = e.altKey;
            
            const combo = `${ctrl ? 'ctrl+' : ''}${shift ? 'shift+' : ''}${alt ? 'alt+' : ''}${key}`;
            
            if (this.shortcuts.has(combo)) {
                e.preventDefault();
                this.shortcuts.get(combo)();
            }
        });
    }
    
    register(combo, callback, description = '') {
        this.shortcuts.set(combo.toLowerCase(), callback);
        console.log(`⌨️ Shortcut registrato: ${combo}${description ? ' - ' + description : ''}`);
    }
    
    unregister(combo) {
        this.shortcuts.delete(combo.toLowerCase());
    }
    
    enable() {
        this.enabled = true;
    }
    
    disable() {
        this.enabled = false;
    }
    
    list() {
        console.log('📋 Scorciatoie disponibili:');
        this.shortcuts.forEach((callback, combo) => {
            console.log(`  ${combo}`);
        });
    }
}

// ==================== AUTO-SAVE SYSTEM ====================

/**
 * Sistema di auto-save periodico
 */
class AutoSaveSystem {
    constructor(saveCallback, interval = 60000) { // Default: 1 minuto
        this.saveCallback = saveCallback;
        this.interval = interval;
        this.timer = null;
        this.lastSave = Date.now();
        this.enabled = false;
    }
    
    start() {
        if (this.enabled) return;
        
        this.enabled = true;
        this.timer = setInterval(() => {
            this.save();
        }, this.interval);
        
        console.log(`💾 Auto-save abilitato (intervallo: ${this.interval / 1000}s)`);
    }
    
    stop() {
        if (!this.enabled) return;
        
        this.enabled = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        console.log('💾 Auto-save disabilitato');
    }
    
    save() {
        try {
            this.saveCallback();
            this.lastSave = Date.now();
            console.log('💾 Auto-save completato');
        } catch (e) {
            console.error('❌ Errore auto-save:', e);
        }
    }
    
    getTimeSinceLastSave() {
        return Date.now() - this.lastSave;
    }
}

// ==================== EXPORT ====================

// Istanze globali
window.performanceMonitor = new PerformanceMonitor();
window.storageManager = new StorageManager();
window.notificationSystem = new NotificationSystem();
window.keyboardShortcuts = new KeyboardShortcuts();

// Registra alcune scorciatoie utili
window.keyboardShortcuts.register('f11', () => {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        document.documentElement.requestFullscreen();
    }
}, 'Toggle Fullscreen');

window.keyboardShortcuts.register('ctrl+s', () => {
    window.notificationSystem.info('Gioco salvato!');
    // Qui potrebbe essere chiamata la funzione di save del gioco
}, 'Quick Save');

// Mostra info storage all'avvio
console.log(`💾 localStorage: ${window.storageManager.getSizeFormatted()} utilizzati`);

// Log versione utilities
console.log('🔧 Ball Survival Utils v1.1.0 caricato');
