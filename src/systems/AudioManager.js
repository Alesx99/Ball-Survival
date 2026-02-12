/**
 * AudioManager - Procedural game sounds via Web Audio API
 * No external assets; unlocks on first user interaction (browser policy)
 * @module systems/AudioManager
 */

export class AudioManager {
    constructor() {
        this.ctx = null;
        this.unlocked = false;
        this._lastPickupTime = 0;
    }

    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    unlock() {
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume?.();
        this.unlocked = true;
    }

    _beep(freq, duration, type = 'square', vol = 0.15) {
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
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
        if (!this.ctx) return;
        try {
            const notes = [523, 659, 784, 1047];
            notes.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this.ctx.destination);
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
        if (!this.ctx) return;
        try {
            const notes = [392, 349, 262];
            notes.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this.ctx.destination);
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
}
