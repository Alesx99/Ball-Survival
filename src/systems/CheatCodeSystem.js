/**
 * CheatCodeSystem - Virtual controller cheat code input + easter egg tracking
 * Cross-platform: works on both touch (mobile) and mouse/keyboard (PC)
 * @module systems/CheatCodeSystem
 */

const CHEAT_STORAGE_KEY = 'ballSurvival_cheatsUnlocked';
const EASTER_STORAGE_KEY = 'ballSurvival_easterEggs';

export class CheatCodeSystem {
    constructor(game) {
        this.game = game;
        this.inputSequence = [];
        this.maxSequenceLength = 12;
        this.unlockedCheats = this._loadUnlocked(CHEAT_STORAGE_KEY);
        this.discoveredEggs = this._loadUnlocked(EASTER_STORAGE_KEY);
        this.popupEl = null;
        this._logoTapCount = 0;
        this._logoTapTimer = null;
        this._spinAngle = 0;
        this._spinStartTime = 0;
        this._lastSpinCheck = 0;
    }

    // ─── Cheat Codes ─────────────────────────────────────
    get codes() {
        return {
            konami: { sequence: '↑↑↓↓←→←→BA', name: 'Konami Code', reward: 'skin', skinId: 'retro_8bit', desc: 'Sblocca la skin Retro 8-bit!' },
            abba: { sequence: 'AABBAA', name: 'ABBA', reward: 'gems', gems: 200, desc: '+200 💎 gemme!' },
            all_directions: { sequence: '↑→↓←↑→↓←', name: 'All Directions', reward: 'effect', effect: 'matrix', desc: 'Modalità Matrix attivata!' },
            secret_boss: { sequence: '↓↓↓BBB', name: 'Secret Boss', reward: 'boss', desc: 'Un Boss Dorato apparirà!' },
            rainbow: { sequence: '←→←→XYXY', name: 'Rainbow', reward: 'skin', skinId: 'rainbow', desc: 'Sblocca la skin Arcobaleno!' },
            devmode: { sequence: 'XXYY↑↓AB', name: 'Dev Mode', reward: 'devroom', desc: 'Accesso alla Dev Room!' }
        };
    }

    // ─── Easter Eggs registry (for glossary) ─────────────
    get easterEggs() {
        return {
            logo_tap: { name: '🔟 Logo Segreto', hint: 'Tocca il logo 10 volte velocemente nel menu', desc: 'Apre la Dev Room con statistiche globali e crediti.' },
            night_mode: { name: '🌙 Giocatore Notturno', hint: 'Gioca tra mezzanotte e le 5 di mattina', desc: 'Sblocca la skin "Ombra Notturna" e un titolo speciale.' },
            golden_enemy: { name: '✨ Nemico Dorato', hint: 'Raro spawn casuale (0.1%)', desc: 'Un nemico dorato che dropa 500 gemme e fuochi d\'artificio!' },
            balletto: { name: '💃 Il Balletto', hint: 'Ruota il joystick 5 giri in 3 secondi', desc: 'Esplosione di coriandoli intorno al giocatore.' },
            six_six_six: { name: '😈 666', hint: 'Raggiungi esattamente 666 kills', desc: 'Lo sfondo pulsa rosso per 10 secondi.' },
            shake_world: { name: '📳 Scuoti il Mondo', hint: 'Mobile: scuoti il dispositivo. PC: premi S nello start screen', desc: 'Screen shake + pioggia di 50 gemme!' },
            dev_signature: { name: '✍️ Firma dello Sviluppatore', hint: 'Tieni premuto 5s sull\'icona settings', desc: 'Popup: "Made with ❤️ by Alesx99"' },
            pacifist: { name: '☮️ Pacifista', hint: 'Sopravvivi 3 minuti senza uccidere', desc: 'Sblocca la skin "Aura di Pace".' },
            konami_code: { name: '🎮 Konami Code', hint: 'Usa la schermata CODICI: ↑↑↓↓←→←→BA', desc: 'Sblocca la skin "Retro 8-bit".' },
            devroom_code: { name: '🔧 Dev Mode', hint: 'Usa la schermata CODICI: XXYY↑↓AB', desc: 'Accesso alla Dev Room con glossario easter egg.' }
        };
    }

    // ─── Input handling ──────────────────────────────────
    addInput(symbol) {
        this.inputSequence.push(symbol);
        if (this.inputSequence.length > this.maxSequenceLength) {
            this.inputSequence.shift();
        }
        this._updateDisplay();
        this._checkCodes();
    }

    clearInput() {
        this.inputSequence = [];
        this._updateDisplay();
    }

    _checkCodes() {
        const current = this.inputSequence.join('');
        for (const [id, code] of Object.entries(this.codes)) {
            if (current.endsWith(code.sequence)) {
                if (!this.unlockedCheats[id]) {
                    this._activateCode(id, code);
                } else {
                    this._showFeedback('⚠️ Codice già utilizzato!', '#ff9800');
                }
                this.inputSequence = [];
                this._updateDisplay();
                return;
            }
        }
    }

    _activateCode(id, code) {
        this.unlockedCheats[id] = true;
        this._saveUnlocked(CHEAT_STORAGE_KEY, this.unlockedCheats);

        switch (code.reward) {
            case 'gems':
                if (this.game) this.game.totalGems = (this.game.totalGems || 0) + code.gems;
                break;
            case 'skin':
                this.game?.skinSystem?.unlockSkin?.(code.skinId);
                break;
            case 'effect':
                if (code.effect === 'matrix' && this.game) {
                    // Slow all enemies for 30 seconds
                    this.game._matrixModeTimer = 1800; // 30s * 60fps
                }
                break;
            case 'boss':
                // Will be handled by SpawnSystem on next boss check
                if (this.game) this.game._spawnGoldenBoss = true;
                break;
            case 'devroom':
                this._showDevRoom();
                break;
        }

        this._showFeedback(`✅ ${code.name}: ${code.desc}`, '#4caf50');
        this.game?.audio?.playAchievementUnlock?.();
    }

    // ─── Dev Room ────────────────────────────────────────
    _showDevRoom() {
        this.discoverEgg('devroom_code');
        const overlay = document.createElement('div');
        overlay.id = 'devroom-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:10000;display:flex;justify-content:center;align-items:center;overflow-y:auto;';

        const panel = document.createElement('div');
        panel.style.cssText = 'background:#1a1a2e;border:2px solid #00ffff;border-radius:16px;padding:24px;max-width:500px;width:90%;max-height:85vh;overflow-y:auto;color:#e0e0e0;font-family:sans-serif;';

        // Header
        let html = `<h2 style="text-align:center;color:#00ffff;margin:0 0 16px;">🔧 DEV ROOM</h2>`;
        html += `<p style="text-align:center;color:#ffd700;font-size:14px;margin-bottom:16px;">Made with ❤️ by <strong>Alesx99</strong></p>`;

        // Global stats
        const stats = this._getGlobalStats();
        html += `<h3 style="color:#ff6b6b;margin:12px 0 8px;">📊 Statistiche Globali</h3>`;
        html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;margin-bottom:16px;">`;
        for (const [label, value] of Object.entries(stats)) {
            html += `<div style="background:rgba(255,255,255,0.06);padding:6px 8px;border-radius:6px;"><span style="color:#aaa;">${label}:</span> <strong>${value}</strong></div>`;
        }
        html += `</div>`;

        // Easter Egg Glossary
        html += `<h3 style="color:#ff6b6b;margin:12px 0 8px;">🥚 Glossario Easter Egg</h3>`;
        for (const [id, egg] of Object.entries(this.easterEggs)) {
            const found = this.discoveredEggs[id];
            html += `<div style="background:rgba(255,255,255,${found ? '0.08' : '0.03'});padding:8px 10px;border-radius:8px;margin-bottom:6px;border-left:3px solid ${found ? '#4caf50' : '#555'};">`;
            html += `<div style="font-weight:600;font-size:13px;color:${found ? '#e0e0e0' : '#777'};">${found ? egg.name : '❓ ???'} ${found ? '✅' : '🔒'}</div>`;
            html += `<div style="font-size:11px;color:#aaa;margin-top:2px;">${found ? egg.desc : 'Non ancora scoperto...'}</div>`;
            if (found) html += `<div style="font-size:10px;color:#ffd700;margin-top:2px;">💡 ${egg.hint}</div>`;
            html += `</div>`;
        }

        // Cheats status
        html += `<h3 style="color:#ff6b6b;margin:12px 0 8px;">🎮 Codici Sbloccati</h3>`;
        for (const [id, code] of Object.entries(this.codes)) {
            const unlocked = this.unlockedCheats[id];
            html += `<div style="font-size:12px;padding:4px 0;color:${unlocked ? '#4caf50' : '#555'};">${unlocked ? '✅' : '🔒'} ${code.name} — <code style="color:#888;">${unlocked ? code.sequence : '???'}</code></div>`;
        }

        // Close button
        html += `<button onclick="this.closest('#devroom-overlay').remove()" style="display:block;margin:16px auto 0;padding:10px 24px;background:#00ffff;color:#000;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:14px;">CHIUDI</button>`;

        panel.innerHTML = html;
        overlay.appendChild(panel);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
        document.body.appendChild(overlay);
    }

    _getGlobalStats() {
        const g = this.game;
        // Read persistent stats (written by _persistGlobalStats)
        let persistent = {};
        try { persistent = JSON.parse(localStorage.getItem('ballSurvival_globalStats') || '{}'); } catch { }
        const achievementProgress = g?.achievementSystem?.getProgress?.() || { unlocked: 0, total: 0 };
        const skinCount = g?.skinSystem ? Object.keys(g.skinSystem.unlockedSkins).length : 0;
        const cloudStatus = g?.cloudSyncManager?.getStatus?.();
        return {
            'Partite totali': persistent.totalRuns || 0,
            'Kills totali': persistent.totalKills || 0,
            'Tempo totale': this._formatTime(persistent.totalTime || 0),
            'Miglior livello': persistent.bestLevel || 0,
            'Boss uccisi': localStorage.getItem('ballSurvivalTotalBossKills') || '0',
            'Gemme attuali': g?.totalGems ?? 0,
            'Achievement': `${achievementProgress.unlocked}/${achievementProgress.total}`,
            'Skin sbloccate': skinCount,
            'Easter Egg': `${Object.keys(this.discoveredEggs).length}/${Object.keys(this.easterEggs).length}`,
            'Codici usati': `${Object.keys(this.unlockedCheats).length}/${Object.keys(this.codes).length}`,
            'Cloud Sync': cloudStatus?.enabled ? `${g?.cloudSyncManager?.getStatusIcon?.()} ${cloudStatus.status}` : '⚪ disabilitato'
        };
    }

    _formatTime(seconds) {
        if (seconds < 60) return `${Math.floor(seconds)}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    }

    /** Call at gameOver to persist global stats */
    persistGlobalStats() {
        if (!this.game) return;
        try {
            const prev = JSON.parse(localStorage.getItem('ballSurvival_globalStats') || '{}');
            const stats = {
                totalRuns: (prev.totalRuns || 0) + 1,
                totalKills: (prev.totalKills || 0) + (this.game.stats?.kills || 0),
                totalTime: (prev.totalTime || 0) + (this.game.totalElapsedTime || 0),
                bestLevel: Math.max(prev.bestLevel || 0, this.game.player?.level || 0)
            };
            localStorage.setItem('ballSurvival_globalStats', JSON.stringify(stats));
        } catch { /* ignore */ }
    }

    // ─── Cheat Code UI Popup ─────────────────────────────
    showCheatPopup() {
        if (this.popupEl) { this.popupEl.remove(); this.popupEl = null; }
        this.inputSequence = [];

        const overlay = document.createElement('div');
        overlay.id = 'cheat-popup-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:9000;display:flex;justify-content:center;align-items:center;';

        const panel = document.createElement('div');
        panel.style.cssText = 'background:#1a1a2e;border:2px solid #00ffff;border-radius:16px;padding:20px;max-width:380px;width:90%;color:#e0e0e0;font-family:sans-serif;text-align:center;';

        // Title
        panel.innerHTML = `<h2 style="color:#00ffff;margin:0 0 12px;">🎮 CODICI / TRUCCHI</h2>`;

        // Sequence display
        const display = document.createElement('div');
        display.id = 'cheat-display';
        display.style.cssText = 'background:#0a0a1a;border:1px solid #333;border-radius:8px;padding:10px;min-height:32px;font-family:monospace;font-size:16px;color:#00ffff;letter-spacing:2px;margin-bottom:16px;word-break:break-all;';
        display.textContent = '_ _ _';
        panel.appendChild(display);

        // D-Pad
        const dpad = document.createElement('div');
        dpad.style.cssText = 'display:grid;grid-template-columns:50px 50px 50px;grid-template-rows:50px 50px 50px;gap:4px;justify-content:center;margin-bottom:12px;';

        const dirs = [
            { label: '', row: 0, col: 0 },
            { label: '↑', row: 0, col: 1, sym: '↑' },
            { label: '', row: 0, col: 2 },
            { label: '←', row: 1, col: 0, sym: '←' },
            { label: '•', row: 1, col: 1 },
            { label: '→', row: 1, col: 2, sym: '→' },
            { label: '', row: 2, col: 0 },
            { label: '↓', row: 2, col: 1, sym: '↓' },
            { label: '', row: 2, col: 2 }
        ];

        dirs.forEach(d => {
            const btn = document.createElement('button');
            btn.textContent = d.label;
            btn.style.cssText = `border:none;border-radius:8px;font-size:20px;cursor:pointer;background:${d.sym ? '#2a2a4a' : 'transparent'};color:#e0e0e0;transition:all 0.1s;user-select:none;-webkit-user-select:none;touch-action:manipulation;`;
            if (d.sym) {
                const addEvt = (el, evts, fn) => evts.forEach(e => el.addEventListener(e, fn, { passive: false }));
                addEvt(btn, ['pointerdown'], (e) => {
                    e.preventDefault();
                    btn.style.background = '#00ffff';
                    btn.style.color = '#000';
                    this.addInput(d.sym);
                    setTimeout(() => { btn.style.background = '#2a2a4a'; btn.style.color = '#e0e0e0'; }, 150);
                });
            }
            dpad.appendChild(btn);
        });
        panel.appendChild(dpad);

        // ABXY buttons
        const abxy = document.createElement('div');
        abxy.style.cssText = 'display:grid;grid-template-columns:50px 50px 50px 50px;gap:8px;justify-content:center;margin-bottom:16px;';

        const buttons = [
            { label: 'A', color: '#4caf50' },
            { label: 'B', color: '#f44336' },
            { label: 'X', color: '#2196f3' },
            { label: 'Y', color: '#ffc107' }
        ];

        buttons.forEach(b => {
            const btn = document.createElement('button');
            btn.textContent = b.label;
            btn.style.cssText = `width:50px;height:50px;border-radius:50%;border:2px solid ${b.color};background:rgba(0,0,0,0.5);color:${b.color};font-weight:bold;font-size:18px;cursor:pointer;transition:all 0.1s;user-select:none;-webkit-user-select:none;touch-action:manipulation;`;
            const addEvt = (el, evts, fn) => evts.forEach(e => el.addEventListener(e, fn, { passive: false }));
            addEvt(btn, ['pointerdown'], (e) => {
                e.preventDefault();
                btn.style.background = b.color;
                btn.style.color = '#000';
                this.addInput(b.label);
                setTimeout(() => { btn.style.background = 'rgba(0,0,0,0.5)'; btn.style.color = b.color; }, 150);
            });
            abxy.appendChild(btn);
        });
        panel.appendChild(abxy);

        // Feedback area
        const feedback = document.createElement('div');
        feedback.id = 'cheat-feedback';
        feedback.style.cssText = 'min-height:24px;font-size:13px;margin-bottom:12px;';
        panel.appendChild(feedback);

        // Action buttons
        const actions = document.createElement('div');
        actions.style.cssText = 'display:flex;gap:8px;justify-content:center;';

        const clearBtn = document.createElement('button');
        clearBtn.textContent = '🗑️ RESET';
        clearBtn.style.cssText = 'padding:8px 16px;background:#333;color:#e0e0e0;border:none;border-radius:8px;cursor:pointer;font-size:13px;';
        clearBtn.addEventListener('click', () => this.clearInput());
        actions.appendChild(clearBtn);

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✖ CHIUDI';
        closeBtn.style.cssText = 'padding:8px 16px;background:#00ffff;color:#000;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-size:13px;';
        closeBtn.addEventListener('click', () => { overlay.remove(); this.popupEl = null; });
        actions.appendChild(closeBtn);

        panel.appendChild(actions);
        overlay.appendChild(panel);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) { overlay.remove(); this.popupEl = null; } });
        document.body.appendChild(overlay);
        this.popupEl = overlay;

        // Keyboard support for PC
        this._kbHandler = (e) => {
            const map = {
                ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→',
                a: 'A', b: 'B', x: 'X', y: 'Y',
                A: 'A', B: 'B', X: 'X', Y: 'Y'
            };
            if (map[e.key]) { this.addInput(map[e.key]); e.preventDefault(); }
        };
        document.addEventListener('keydown', this._kbHandler);
    }

    hideCheatPopup() {
        if (this.popupEl) { this.popupEl.remove(); this.popupEl = null; }
        if (this._kbHandler) { document.removeEventListener('keydown', this._kbHandler); this._kbHandler = null; }
    }

    _updateDisplay() {
        const el = document.getElementById('cheat-display');
        if (el) {
            el.textContent = this.inputSequence.length > 0 ? this.inputSequence.join(' ') : '_ _ _';
        }
    }

    _showFeedback(text, color = '#e0e0e0') {
        const el = document.getElementById('cheat-feedback');
        if (el) {
            el.innerHTML = `<span style="color:${color};">${text}</span>`;
        }
        // Also show game notification
        this.game?.notifications?.push?.({ text, life: 300, color });
    }

    // ─── Hidden Easter Eggs ──────────────────────────────
    discoverEgg(id) {
        if (this.discoveredEggs[id]) return false;
        this.discoveredEggs[id] = true;
        this._saveUnlocked(EASTER_STORAGE_KEY, this.discoveredEggs);
        this.game?.notifications?.push?.({ text: `🥚 Easter Egg scoperto: ${this.easterEggs[id]?.name || id}!`, life: 300, color: '#ffd700' });
        this.game?.audio?.playAchievementUnlock?.();
        return true;
    }

    // Logo tap tracker
    onLogoTap() {
        this._logoTapCount++;
        clearTimeout(this._logoTapTimer);
        this._logoTapTimer = setTimeout(() => { this._logoTapCount = 0; }, 2000);
        if (this._logoTapCount >= 10) {
            this._logoTapCount = 0;
            this.discoverEgg('logo_tap');
            this._showDevRoom();
        }
    }

    // Night mode check (midnight–5am)
    checkNightMode() {
        const h = new Date().getHours();
        if (h >= 0 && h < 5 && !this.discoveredEggs.night_mode) {
            this.discoverEgg('night_mode');
            this.game?.skinSystem?.unlockSkin?.('night_shadow');
        }
    }

    // 666 kills check
    check666(kills) {
        if (kills === 666 && !this.discoveredEggs.six_six_six) {
            this.discoverEgg('six_six_six');
            if (this.game) this.game._666PulseTimer = 600; // 10s
        }
    }

    // Device shake (mobile) + keyboard "S" (PC)
    initShakeDetection() {
        if (typeof DeviceMotionEvent !== 'undefined') {
            let lastShake = 0;
            window.addEventListener('devicemotion', (e) => {
                const acc = e.accelerationIncludingGravity;
                if (!acc) return;
                const force = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);
                if (force > 30 && Date.now() - lastShake > 3000 && this.game?.state === 'startScreen') {
                    lastShake = Date.now();
                    this._fireShakeEgg();
                }
            });
        }
    }

    onKeyInStartScreen(key) {
        if (key.toLowerCase() === 's') {
            this._fireShakeEgg();
        }
    }

    _fireShakeEgg() {
        if (!this.discoveredEggs.shake_world) {
            this.discoverEgg('shake_world');
            if (this.game) {
                this.game.totalGems = (this.game.totalGems || 0) + 50;
                this.game.addScreenShake?.(20);
            }
        }
    }

    // Dev signature (5s long press on settings)
    onSettingsLongPress() {
        if (!this.discoveredEggs.dev_signature) {
            this.discoverEgg('dev_signature');
            this._showFeedback('Made with ❤️ by Alesx99', '#ff6b6b');
        }
    }

    // ─── Persistence ─────────────────────────────────────
    _loadUnlocked(key) {
        try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
    }

    _saveUnlocked(key, data) {
        try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* ignore */ }
    }
}
