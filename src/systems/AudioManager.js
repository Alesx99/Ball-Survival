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
        this._bgmSource = null;
        this._bgmGain = null;
        this._effectsGain = null;
        this._masterGain = null;
        this.effectsVolume = 1;
        this.musicVolume = 1;
        this.muted = false;
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
        if (this._bgmGain) this._bgmGain.gain.value = this.muted ? 0 : this.musicVolume * 0.5;
        this.saveSettings();
    }

    setMuted(m) {
        this.muted = !!m;
        if (this._masterGain) this._masterGain.gain.value = this.muted ? 0 : 1;
        if (this._effectsGain) this._effectsGain.gain.value = this.muted ? 0 : this.effectsVolume;
        if (this._bgmGain) this._bgmGain.gain.value = this.muted ? 0 : this.musicVolume * 0.5;
        this.saveSettings();
    }

    _applyVolumeToBgm() {
        if (this._bgmGain) this._bgmGain.gain.value = this.muted ? 0 : this.musicVolume * 0.5;
    }

    unlock() {
        if (!this._ensureContext()) return Promise.resolve();
        if (this.ctx.state === 'suspended') {
            return this.ctx.resume().then(() => { this.unlocked = true; });
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

    _createBgmBuffer() {
        if (!this._ensureContext()) return null;
        const duration = 8;
        const sampleRate = this.ctx.sampleRate;
        const length = sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        const t = (i) => i / sampleRate;

        // C minor chord (slightly quieter to leave room)
        const chordFreqs = [130.81, 155.56, 196]; // C3, Eb3, G3
        const chordAmp = 0.06;

        // Arpeggio: C4, Eb4, G4, C5, cycle every 0.35s
        const arpFreqs = [261.63, 311.13, 392, 523.25];
        const arpInterval = 0.35;
        const arpAmp = 0.04;

        // Melody: simple 8-note phrase (C4, Eb4, G4, C5, G4, Eb4, C4, rest) @ 0.5s per note
        const melNotes = [261.63, 311.13, 392, 523.25, 392, 311.13, 261.63, 0];
        const melInterval = 0.5;
        const melAmp = 0.05;

        // Bass: C2 on beats (every 0.5s), short pluck
        const bassFreq = 65.41;
        const bassInterval = 0.5;
        const bassAmp = 0.1;

        for (let i = 0; i < length; i++) {
            const ti = t(i);
            let v = 0;

            // Chord pad
            chordFreqs.forEach((freq, idx) => {
                const phase = (ti * freq * 2 * Math.PI) + idx * 0.5;
                v += Math.sin(phase) * chordAmp;
            });

            // Arpeggio
            const arpIdx = Math.floor(ti / arpInterval) % arpFreqs.length;
            const arpPhase = (ti % arpInterval) / arpInterval;
            const arpEnv = arpPhase < 0.3 ? Math.sin(arpPhase * Math.PI / 0.3) : 0;
            v += Math.sin(ti * arpFreqs[arpIdx] * 2 * Math.PI) * arpAmp * arpEnv;

            // Melody
            const melIdx = Math.floor(ti / melInterval) % melNotes.length;
            const melPhase = (ti % melInterval) / melInterval;
            const melEnv = melPhase < 0.4 ? Math.sin(melPhase * Math.PI / 0.4) : 0;
            if (melNotes[melIdx] > 0) {
                v += Math.sin(ti * melNotes[melIdx] * 2 * Math.PI) * melAmp * melEnv;
            }

            // Bass pluck
            const bassBeat = (ti % bassInterval) / bassInterval;
            const bassEnv = bassBeat < 0.15 ? Math.sin(bassBeat * Math.PI / 0.15) : 0;
            v += Math.sin(ti * bassFreq * 2 * Math.PI) * bassAmp * bassEnv;

            data[i] = Math.max(-1, Math.min(1, v));
        }
        return buffer;
    }

    _startBgmNow() {
        try {
            const buffer = this._createBgmBuffer();
            if (!buffer) return;
            this._bgmSource = this.ctx.createBufferSource();
            this._bgmSource.buffer = buffer;
            this._bgmSource.loop = true;
            this._bgmGain = this.ctx.createGain();
            this._bgmSource.connect(this._bgmGain);
            this._bgmGain.connect(this._masterGain);
            this._applyVolumeToBgm();
            this._bgmSource.start(0);
        } catch (e) {
            console.warn('BGM failed:', e);
        }
    }

    playBackgroundMusic() {
        if (!this._ensureContext()) return;
        this.stopBackgroundMusic();
        // Su mobile (iOS/Android) l'audio deve partire nello stesso gesto utente.
        // Chiamare _startBgmNow() subito e resume() in parallelo: start(0) pianifica la riproduzione,
        // che partirà quando il context riprende.
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(e => console.warn('BGM resume failed:', e));
        }
        this._startBgmNow();
    }

    stopBackgroundMusic() {
        if (this._bgmSource) {
            try {
                this._bgmSource.stop();
            } catch (e) { /* already stopped */ }
            this._bgmSource = null;
        }
    }
}
