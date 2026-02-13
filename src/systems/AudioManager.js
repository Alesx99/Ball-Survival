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
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this._masterGain = this.ctx.createGain();
            this._masterGain.connect(this.ctx.destination);
            this._effectsGain = this.ctx.createGain();
            this._effectsGain.connect(this._masterGain);
            this.loadSettings();
            this._masterGain.gain.value = this.muted ? 0 : 1;
            this._effectsGain.gain.value = this.muted ? 0 : this.effectsVolume;
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
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
        if (this._bgmGain) this._bgmGain.gain.value = this.muted ? 0 : this.musicVolume * 0.2;
        this.saveSettings();
    }

    setMuted(m) {
        this.muted = !!m;
        if (this._masterGain) this._masterGain.gain.value = this.muted ? 0 : 1;
        if (this._effectsGain) this._effectsGain.gain.value = this.muted ? 0 : this.effectsVolume;
        if (this._bgmGain) this._bgmGain.gain.value = this.muted ? 0 : this.musicVolume * 0.2;
        this.saveSettings();
    }

    _applyVolumeToBgm() {
        if (this._bgmGain) this._bgmGain.gain.value = this.muted ? 0 : this.musicVolume * 0.2;
    }

    unlock() {
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume?.();
        this.unlocked = true;
    }

    _beep(freq, duration, type = 'square', vol = 0.15) {
        if (!this.ctx || this._effectsGain == null) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this._effectsGain);
            osc.frequency.value = freq;
            osc.type = type;
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            osc.start(this.ctx.currentTime);
            osc.stop(this.ctx.currentTime + duration);
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
        if (!this.ctx || !this._effectsGain) return;
        try {
            const notes = [523, 659, 784, 1047];
            notes.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this._effectsGain);
                osc.frequency.value = freq;
                osc.type = 'sine';
                const t = this.ctx.currentTime + i * 0.08;
                gain.gain.setValueAtTime(0.15, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
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
        if (!this.ctx || !this._effectsGain) return;
        try {
            const notes = [392, 349, 262];
            notes.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this._effectsGain);
                osc.frequency.value = freq;
                osc.type = 'sine';
                const t = this.ctx.currentTime + i * 0.2;
                gain.gain.setValueAtTime(0.2, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
                osc.start(t);
                osc.stop(t + 0.3);
            });
        } catch (e) { /* ignore */ }
    }

    playClick() {
        this._beep(600, 0.02, 'sine', 0.08);
    }

    _createBgmBuffer() {
        if (!this.ctx) return null;
        const duration = 6;
        const sampleRate = this.ctx.sampleRate;
        const length = sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        const chordFreqs = [130.81, 164.81, 196];
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            let v = 0;
            chordFreqs.forEach((freq, idx) => {
                const phase = (t * freq * 2 * Math.PI) + idx * 0.5;
                v += Math.sin(phase) * 0.04;
            });
            data[i] = v;
        }
        return buffer;
    }

    playBackgroundMusic() {
        if (!this.ctx) return;
        this.stopBackgroundMusic();
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

    stopBackgroundMusic() {
        if (this._bgmSource) {
            try {
                this._bgmSource.stop();
            } catch (e) { /* already stopped */ }
            this._bgmSource = null;
        }
    }
}
