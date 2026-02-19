/**
 * SkinSystem - Player cosmetic skin management
 * Provides 8+ skins unlockable via achievements, easter eggs, gems, and cheat codes
 * @module systems/SkinSystem
 */

const SKIN_STORAGE_KEY = 'ballSurvival_skins';

export class SkinSystem {
    constructor(game) {
        this.game = game;
        this.equippedSkin = 'default';
        this.unlockedSkins = { default: true };
        this.load();
    }

    get skins() {
        return {
            default: { name: 'Classico', desc: 'La skin base del gioco', color: '#4488ff', glow: '#4488ff', trail: '#4488ff', border: '#2266dd', cost: 0, icon: '🔵' },
            retro_8bit: { name: 'Retro 8-bit', desc: 'Pixel art d\'epoca', color: '#00ff00', glow: '#00ff00', trail: '#00aa00', border: '#008800', cost: 0, icon: '👾', unlock: 'Codice Konami' },
            rainbow: { name: 'Arcobaleno', desc: 'Colori cangianti', color: 'rainbow', glow: '#fff', trail: 'rainbow', border: '#ff0000', cost: 0, icon: '🌈', unlock: 'Codice Rainbow' },
            night_shadow: { name: 'Ombra Notturna', desc: 'L\'oscurità ti avvolge', color: '#1a1a2e', glow: '#4a0080', trail: '#2d0050', border: '#6a0dad', cost: 0, icon: '🌙', unlock: 'Gioca di notte' },
            peace_aura: { name: 'Aura di Pace', desc: 'La calma è la vera forza', color: '#88ddff', glow: '#00ffcc', trail: '#66ffaa', border: '#00cc99', cost: 0, icon: '☮️', unlock: 'Pacifista 3min' },
            golden: { name: 'Dorato', desc: 'Brillante come l\'oro', color: '#ffd700', glow: '#ffaa00', trail: '#ff8800', border: '#cc8800', cost: 500, icon: '✨' },
            infernal: { name: 'Infernale', desc: 'Forgiato nel fuoco', color: '#ff3300', glow: '#ff6600', trail: '#ff4400', border: '#cc2200', cost: 750, icon: '🔥' },
            void_walker: { name: 'Camminatore del Vuoto', desc: 'Fra le dimensioni', color: '#8800ff', glow: '#aa00ff', trail: '#6600cc', border: '#5500aa', cost: 1000, icon: '🌀' },
            diamond: { name: 'Diamante', desc: 'Indistruttibile', color: '#b9f2ff', glow: '#e0f7ff', trail: '#88ddff', border: '#66bbdd', cost: 2000, icon: '💎' }
        };
    }

    unlockSkin(skinId) {
        if (!this.skins[skinId]) return false;
        if (this.unlockedSkins[skinId]) return false;
        this.unlockedSkins[skinId] = true;
        this.save();
        this.game?.notifications?.push?.({ text: `🎨 Nuova skin: ${this.skins[skinId].name}!`, life: 300, color: '#ffd700' });
        return true;
    }

    equipSkin(skinId) {
        if (!this.unlockedSkins[skinId]) return false;
        this.equippedSkin = skinId;
        this.save();
        return true;
    }

    buySkin(skinId) {
        const skin = this.skins[skinId];
        if (!skin || skin.cost <= 0) return false;
        if (this.unlockedSkins[skinId]) return false;
        if ((this.game?.gems ?? 0) < skin.cost) return false;
        this.game.gems -= skin.cost;
        return this.unlockSkin(skinId);
    }

    getEquipped() {
        return this.skins[this.equippedSkin] || this.skins.default;
    }

    /** Get skin color — handles rainbow animation */
    getSkinColor(time) {
        const skin = this.getEquipped();
        if (skin.color === 'rainbow') {
            const hue = ((time || 0) * 60 * 2) % 360;
            return `hsl(${hue}, 90%, 60%)`;
        }
        return skin.color;
    }

    getSkinTrail(time) {
        const skin = this.getEquipped();
        if (skin.trail === 'rainbow') {
            const hue = (((time || 0) * 60 * 2) + 30) % 360;
            return `hsl(${hue}, 80%, 50%)`;
        }
        return skin.trail;
    }

    getSkinGlow() {
        return this.getEquipped().glow;
    }

    // ─── Skin Selection UI ───────────────────────────────
    showSkinPopup() {
        const existing = document.getElementById('skin-popup-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'skin-popup-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:9000;display:flex;justify-content:center;align-items:center;overflow-y:auto;';

        const panel = document.createElement('div');
        panel.style.cssText = 'background:#1a1a2e;border:2px solid #00ffff;border-radius:16px;padding:20px;max-width:420px;width:90%;max-height:85vh;overflow-y:auto;color:#e0e0e0;font-family:sans-serif;';

        let html = `<h2 style="text-align:center;color:#00ffff;margin:0 0 16px;">🎨 SKIN</h2>`;

        for (const [id, skin] of Object.entries(this.skins)) {
            const owned = this.unlockedSkins[id];
            const equipped = this.equippedSkin === id;
            const canBuy = !owned && skin.cost > 0 && (this.game?.gems ?? 0) >= skin.cost;
            const borderColor = equipped ? '#00ffff' : owned ? '#4caf50' : '#333';

            html += `<div style="display:flex;align-items:center;gap:10px;padding:10px;margin-bottom:6px;border-radius:10px;background:rgba(255,255,255,0.04);border:2px solid ${borderColor};">`;

            // Preview circle
            const previewColor = skin.color === 'rainbow' ? `hsl(${(Date.now() / 10) % 360}, 90%, 60%)` : skin.color;
            html += `<div style="width:40px;height:40px;border-radius:50%;background:${previewColor};border:2px solid ${skin.border};box-shadow:0 0 8px ${skin.glow};flex-shrink:0;"></div>`;

            // Info
            html += `<div style="flex:1;min-width:0;">`;
            html += `<div style="font-weight:600;font-size:13px;">${skin.icon} ${skin.name} ${equipped ? '✅' : ''}</div>`;
            html += `<div style="font-size:11px;color:#aaa;">${skin.desc}</div>`;
            if (!owned && skin.unlock) html += `<div style="font-size:10px;color:#ffd700;">🔑 ${skin.unlock}</div>`;
            html += `</div>`;

            // Action
            if (equipped) {
                html += `<span style="font-size:11px;color:#00ffff;">Equipaggiata</span>`;
            } else if (owned) {
                html += `<button onclick="window._skinEquip('${id}')" style="padding:6px 12px;background:#4caf50;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">EQUIPA</button>`;
            } else if (canBuy) {
                html += `<button onclick="window._skinBuy('${id}')" style="padding:6px 12px;background:#ffd700;color:#000;border:none;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">${skin.cost}💎</button>`;
            } else if (skin.cost > 0) {
                html += `<span style="font-size:11px;color:#777;">🔒 ${skin.cost}💎</span>`;
            } else {
                html += `<span style="font-size:11px;color:#555;">🔒</span>`;
            }

            html += `</div>`;
        }

        html += `<button onclick="document.getElementById('skin-popup-overlay').remove()" style="display:block;margin:16px auto 0;padding:10px 24px;background:#00ffff;color:#000;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:14px;">CHIUDI</button>`;

        panel.innerHTML = html;
        overlay.appendChild(panel);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
        document.body.appendChild(overlay);

        // Global handlers for buttons
        window._skinEquip = (id) => { this.equipSkin(id); this.showSkinPopup(); };
        window._skinBuy = (id) => { this.buySkin(id); this.showSkinPopup(); };
    }

    // ─── Persistence ─────────────────────────────────────
    save() {
        try {
            localStorage.setItem(SKIN_STORAGE_KEY, JSON.stringify({
                equipped: this.equippedSkin,
                unlocked: this.unlockedSkins
            }));
        } catch { /* ignore */ }
    }

    load() {
        try {
            const raw = localStorage.getItem(SKIN_STORAGE_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                this.equippedSkin = data.equipped || 'default';
                this.unlockedSkins = { default: true, ...data.unlocked };
            }
        } catch { /* ignore */ }
    }
}
