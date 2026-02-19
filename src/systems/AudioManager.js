/**
 * AudioManager - Procedural game sounds via Web Audio API
 * No external assets; unlocks on first user interaction (browser policy)
 * @module systems/AudioManager
 */

const STORAGE_KEY = 'ballSurvivalAudioSettings';

export class AudioManager {
    constructor() {
        this.ctx = null;
        this.unlocked = false;
        this._lastPickupTime = 0;
        this._bgmCalmSource = null;
        this._bgmBattleSource = null;
        this._bgmCalmGain = null;
        this._bgmBattleGain = null;
        this._bgmMode = 'calm';
        this._effectsGain = null;
        this._masterGain = null;
        this.effectsVolume = 1;
        this.musicVolume = 1;
        this.muted = false;
        this._resumePromise = null;
    }

    init() {
        this.loadSettings();
        // AudioContext non creato qui: su iOS deve essere creato DOPO un gesto utente.
        // Verrà creato al primo unlock() (tap su Start, canvas, ecc.)
    }

    _ensureContext() {
        if (this.ctx) return !!this.ctx;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this._masterGain = this.ctx.createGain();
            this._masterGain.connect(this.ctx.destination);
            this._effectsGain = this.ctx.createGain();
            this._effectsGain.connect(this._masterGain);
            this._masterGain.gain.value = this.muted ? 0 : 1;
            this._effectsGain.gain.value = this.muted ? 0 : this.effectsVolume;
            return true;
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            return false;
        }
    }

    loadSettings() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const s = JSON.parse(raw);
                this.effectsVolume = Math.max(0, Math.min(1, s.effectsVolume ?? 1));
                this.musicVolume = Math.max(0, Math.min(1, s.musicVolume ?? 1));
                this.muted = !!s.muted;
            }
        } catch (e) { /* ignore */ }
    }

    saveSettings() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                effectsVolume: this.effectsVolume,
                musicVolume: this.musicVolume,
                muted: this.muted
            }));
        } catch (e) { /* ignore */ }
    }

    setEffectsVolume(v) {
        this.effectsVolume = Math.max(0, Math.min(1, v));
        if (this._effectsGain) this._effectsGain.gain.value = this.muted ? 0 : this.effectsVolume;
        this.saveSettings();
    }

    setMusicVolume(v) {
        this.musicVolume = Math.max(0, Math.min(1, v));
        this._applyVolumeToBgm();
        this.saveSettings();
    }

    setMuted(m) {
        this.muted = !!m;
        if (this._masterGain) this._masterGain.gain.value = this.muted ? 0 : 1;
        if (this._effectsGain) this._effectsGain.gain.value = this.muted ? 0 : this.effectsVolume;
        this._applyVolumeToBgm();
        this.saveSettings();
    }

    _applyVolumeToBgm() {
        const base = this.muted ? 0 : this.musicVolume * 0.5;
        const now = this.ctx?.currentTime ?? 0;
        if (this._bgmCalmGain) {
            this._bgmCalmGain.gain.cancelScheduledValues?.(now);
            this._bgmCalmGain.gain.setValueAtTime(this._bgmMode === 'calm' ? base : 0, now);
        }
        if (this._bgmBattleGain) {
            this._bgmBattleGain.gain.cancelScheduledValues?.(now);
            this._bgmBattleGain.gain.setValueAtTime(this._bgmMode === 'battle' ? base : 0, now);
        }
    }

    /** Imposta modalità BGM: 'calm' (nessun nemico) o 'battle' (nemici in zona). Crossfade ~1.5s. */
    setBgmMode(mode) {
        if (!this.ctx || this._bgmMode === mode || !this._bgmCalmGain || !this._bgmBattleGain) return;
        const now = this.ctx.currentTime;
        const dur = 1.5;
        const base = this.muted ? 0 : this.musicVolume * 0.5;
        this._bgmCalmGain.gain.cancelScheduledValues?.(now);
        this._bgmBattleGain.gain.cancelScheduledValues?.(now);
        if (mode === 'battle') {
            this._bgmCalmGain.gain.setValueAtTime(this._bgmCalmGain.gain.value, now);
            this._bgmCalmGain.gain.linearRampToValueAtTime(0, now + dur);
            this._bgmBattleGain.gain.setValueAtTime(this._bgmBattleGain.gain.value, now);
            this._bgmBattleGain.gain.linearRampToValueAtTime(base, now + dur);
        } else {
            this._bgmBattleGain.gain.setValueAtTime(this._bgmBattleGain.gain.value, now);
            this._bgmBattleGain.gain.linearRampToValueAtTime(0, now + dur);
            this._bgmCalmGain.gain.setValueAtTime(this._bgmCalmGain.gain.value, now);
            this._bgmCalmGain.gain.linearRampToValueAtTime(base, now + dur);
        }
        this._bgmMode = mode;
    }

    unlock() {
        if (!this._ensureContext()) return Promise.resolve();
        if (this.ctx.state === 'running') {
            this.unlocked = true;
            return Promise.resolve();
        }
        if (this._resumePromise) return this._resumePromise;
        if (this.ctx.state === 'suspended') {
            this._resumePromise = this.ctx.resume()
                .then(() => { this.unlocked = true; this._resumePromise = null; })
                .catch(() => { this._resumePromise = null; });
            return this._resumePromise;
        }
        this.unlocked = true;
        return Promise.resolve();
    }

    /** Pitch variation: 95%–105% of base freq to avoid mechanical repetition */
    _pitchVariation(freq, amount = 0.1) {
        return freq * (1 - amount / 2 + Math.random() * amount);
    }

    /** AD envelope: short attack then decay to avoid "flat" clicks */
    _applyEnvelope(gainNode, startTime, duration, vol, attackRatio = 0.15) {
        const attackTime = Math.min(duration * attackRatio, 0.02);
        gainNode.gain.setValueAtTime(0.001, startTime);
        gainNode.gain.linearRampToValueAtTime(vol, startTime + attackTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    }

    _beep(freq, duration, type = 'square', vol = 0.15) {
        if (!this._ensureContext() || !this._effectsGain) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this._effectsGain);
            osc.frequency.value = this._pitchVariation(freq);
            osc.type = type;
            this._applyEnvelope(gain, now, duration, vol);
            osc.start(now);
            osc.stop(now + duration);
        } catch (e) { /* ignore */ }
    }

    playHit() {
        this._beep(400, 0.04, 'square', 0.1);
    }

    playShoot() {
        this._beep(600, 0.03, 'square', 0.08);
    }

    playPickup() {
        const now = performance.now();
        if (now - this._lastPickupTime < 0.08) return;
        this._lastPickupTime = now;
        this._beep(800, 0.06, 'sine', 0.1);
    }

    playGemPickup() {
        this._beep(1200, 0.08, 'sine', 0.1);
    }

    playLevelUp() {
        if (!this._ensureContext() || !this._effectsGain) return;
        try {
            const notes = [523, 659, 784, 1047];
            notes.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this._effectsGain);
                osc.frequency.value = this._pitchVariation(freq, 0.04);
                osc.type = 'sine';
                const t = this.ctx.currentTime + i * 0.08;
                this._applyEnvelope(gain, t, 0.15, 0.15, 0.2);
                osc.start(t);
                osc.stop(t + 0.15);
            });
        } catch (e) { /* ignore */ }
    }

    playDamage() {
        this._beep(150, 0.12, 'sawtooth', 0.15);
    }

    playEnemyDeath() {
        this._beep(200, 0.05, 'square', 0.08);
    }

    playSpell() {
        this._beep(350, 0.05, 'sine', 0.1);
    }

    playGameOver() {
        if (!this._ensureContext() || !this._effectsGain) return;
        try {
            const notes = [392, 349, 262];
            notes.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this._effectsGain);
                osc.frequency.value = this._pitchVariation(freq, 0.04);
                osc.type = 'sine';
                const t = this.ctx.currentTime + i * 0.2;
                this._applyEnvelope(gain, t, 0.3, 0.2, 0.15);
                osc.start(t);
                osc.stop(t + 0.3);
            });
        } catch (e) { /* ignore */ }
    }

    playClick() {
        this._beep(600, 0.02, 'sine', 0.08);
    }

    _createCalmBgmBuffer() {
        if (!this._ensureContext()) return null;
        const duration = 8;
        const sampleRate = this.ctx.sampleRate;
        const length = sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        const t = (i) => i / sampleRate;

        const chordFreqs = [130.81, 155.56, 196];
        const chordAmp = 0.06;
        const arpFreqs = [261.63, 311.13, 392, 523.25];
        const arpInterval = 0.35;
        const arpAmp = 0.04;
        const melNotes = [261.63, 311.13, 392, 523.25, 392, 311.13, 261.63, 0];
        const melInterval = 0.5;
        const melAmp = 0.05;
        const bassFreq = 65.41;
        const bassInterval = 0.5;
        const bassAmp = 0.1;

        for (let i = 0; i < length; i++) {
            const ti = t(i);
            let v = 0;
            chordFreqs.forEach((freq, idx) => {
                const phase = (ti * freq * 2 * Math.PI) + idx * 0.5;
                v += Math.sin(phase) * chordAmp;
            });
            const arpIdx = Math.floor(ti / arpInterval) % arpFreqs.length;
            const arpPhase = (ti % arpInterval) / arpInterval;
            const arpEnv = arpPhase < 0.3 ? Math.sin(arpPhase * Math.PI / 0.3) : 0;
            v += Math.sin(ti * arpFreqs[arpIdx] * 2 * Math.PI) * arpAmp * arpEnv;
            const melIdx = Math.floor(ti / melInterval) % melNotes.length;
            const melPhase = (ti % melInterval) / melInterval;
            const melEnv = melPhase < 0.4 ? Math.sin(melPhase * Math.PI / 0.4) : 0;
            if (melNotes[melIdx] > 0) v += Math.sin(ti * melNotes[melIdx] * 2 * Math.PI) * melAmp * melEnv;
            const bassBeat = (ti % bassInterval) / bassInterval;
            const bassEnv = bassBeat < 0.15 ? Math.sin(bassBeat * Math.PI / 0.15) : 0;
            v += Math.sin(ti * bassFreq * 2 * Math.PI) * bassAmp * bassEnv;
            data[i] = Math.max(-1, Math.min(1, v));
        }
        return buffer;
    }

    /** BGM battaglia: tempo più veloce, tonalità più oscura (Dm), pulse aggiunto */
    _createBattleBgmBuffer() {
        if (!this._ensureContext()) return null;
        const duration = 6;
        const sampleRate = this.ctx.sampleRate;
        const length = sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        const t = (i) => i / sampleRate;

        const chordFreqs = [146.83, 174.61, 220]; // Dm
        const chordAmp = 0.07;
        const arpFreqs = [293.66, 349.23, 440, 587.33];
        const arpInterval = 0.2;
        const arpAmp = 0.05;
        const bassFreq = 73.42; // D2
        const bassInterval = 0.25;
        const bassAmp = 0.12;

        for (let i = 0; i < length; i++) {
            const ti = t(i);
            let v = 0;
            chordFreqs.forEach((freq, idx) => {
                const phase = (ti * freq * 2 * Math.PI) + idx * 0.5;
                v += Math.sin(phase) * chordAmp;
            });
            const arpIdx = Math.floor(ti / arpInterval) % arpFreqs.length;
            const arpPhase = (ti % arpInterval) / arpInterval;
            const arpEnv = arpPhase < 0.25 ? Math.sin(arpPhase * Math.PI / 0.25) : 0;
            v += Math.sin(ti * arpFreqs[arpIdx] * 2 * Math.PI) * arpAmp * arpEnv;
            const bassBeat = (ti % bassInterval) / bassInterval;
            const bassEnv = bassBeat < 0.12 ? Math.sin(bassBeat * Math.PI / 0.12) : 0;
            v += Math.sin(ti * bassFreq * 2 * Math.PI) * bassAmp * bassEnv;
            const pulse = Math.sin(ti * 4 * Math.PI) > 0.7 ? 0.04 : 0;
            v += Math.sin(ti * 110 * 2 * Math.PI) * pulse;
            data[i] = Math.max(-1, Math.min(1, v));
        }
        return buffer;
    }

    _startBgmNow() {
        try {
            const calmBuf = this._createCalmBgmBuffer();
            const battleBuf = this._createBattleBgmBuffer();
            if (!calmBuf || !battleBuf) return;

            this._bgmCalmGain = this.ctx.createGain();
            this._bgmBattleGain = this.ctx.createGain();
            this._bgmCalmGain.connect(this._masterGain);
            this._bgmBattleGain.connect(this._masterGain);

            this._bgmCalmSource = this.ctx.createBufferSource();
            this._bgmCalmSource.buffer = calmBuf;
            this._bgmCalmSource.loop = true;
            this._bgmCalmSource.connect(this._bgmCalmGain);

            this._bgmBattleSource = this.ctx.createBufferSource();
            this._bgmBattleSource.buffer = battleBuf;
            this._bgmBattleSource.loop = true;
            this._bgmBattleSource.connect(this._bgmBattleGain);

            this._bgmMode = 'calm';
            this._applyVolumeToBgm();
            this._bgmCalmSource.start(0);
            this._bgmBattleSource.start(0);
        } catch (e) {
            console.warn('BGM failed:', e);
        }
    }

    playBackgroundMusic() {
        if (!this._ensureContext()) return;
        this.stopBackgroundMusic();
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        this._startBgmNow();
    }

    stopBackgroundMusic() {
        const stop = (s) => { try { s?.stop(); } catch (_) {} };
        stop(this._bgmCalmSource);
        stop(this._bgmBattleSource);
        this._bgmCalmSource = null;
        this._bgmBattleSource = null;
        this._bgmCalmGain = null;
        this._bgmBattleGain = null;
    }
}
