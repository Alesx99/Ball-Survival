export const STAGES_CONFIG = {
    stages: {
        '1': {
            name: "Pianura Eterna",
            unlocked: true,
            unlockRequirement: null,
            background: { color: '#0a0a12', gridColor: 'rgba(0, 245, 255, 0.12)', pattern: 'grid', accentColor: '#00f5ff' },
            enemies: { baseColor: '#e74c3c', eliteColor: '#c0392b', shape: 'circle' },
            difficulty: { dr: 0, speed: 0, eliteChance: 0.08 },
            message: "Benvenuto nella Pianura Eterna!",
            effects: { xpBonus: 1.0, dropBonus: 1.0 }
        },
        '2': {
            name: "Foresta Oscura",
            unlocked: false,
            unlockRequirement: { type: 'craft_core', coreId: 'magnetic' },
            background: { color: '#0d1510', gridColor: 'rgba(57, 255, 20, 0.15)', pattern: 'forest', accentColor: '#39ff14' },
            enemies: { baseColor: '#27ae60', eliteColor: '#229954', shape: 'triangle' },
            difficulty: { dr: 0.25, speed: 0.15, eliteChance: 0.12 },
            message: "Entri nella Foresta Oscura...",
            effects: { xpBonus: 1.2, dropBonus: 1.1 }
        },
        '3': {
            name: "Deserto Infuocato",
            unlocked: false,
            unlockRequirement: { type: 'craft_weapon', weaponId: 'iron_spikes' },
            background: { color: '#1a1208', gridColor: 'rgba(255, 100, 50, 0.15)', pattern: 'desert', accentColor: '#ff6633' },
            enemies: { baseColor: '#f39c12', eliteColor: '#e67e22', shape: 'square' },
            difficulty: { dr: 0.40, speed: 0.25, eliteChance: 0.18 },
            message: "Il Deserto Infuocato ti attende!",
            effects: { xpBonus: 1.4, dropBonus: 1.25 }
        },
        '4': {
            name: "Ghiacciaio Perduto",
            unlocked: false,
            unlockRequirement: { type: 'kill_elites', stage: 3, count: 5 },
            background: { color: '#0a1218', gridColor: 'rgba(100, 220, 255, 0.15)', pattern: 'ice', accentColor: '#64dcff' },
            enemies: { baseColor: '#87ceeb', eliteColor: '#00bfff', shape: 'diamond' },
            difficulty: { dr: 0.55, speed: 0.35, eliteChance: 0.25 },
            message: "Il Ghiacciaio Perduto ti congela!",
            effects: { xpBonus: 1.6, dropBonus: 1.4 }
        },
        '5': {
            name: "Abisso Cosmico",
            unlocked: false,
            unlockRequirement: { type: 'arsenal_size', cores: 2, weapons: 2 },
            background: { color: '#0f0815', gridColor: 'rgba(255, 0, 255, 0.15)', pattern: 'cosmic', accentColor: '#ff00ff' },
            enemies: { baseColor: '#8a2be2', eliteColor: '#9932cc', shape: 'star' },
            difficulty: { dr: 0.75, speed: 0.50, eliteChance: 0.35 },
            message: "L'Abisso Cosmico ti risucchia!",
            effects: { xpBonus: 2.0, dropBonus: 1.8 }
        },
        '6': {
            name: "Abisso Infernale",
            unlocked: false,
            unlockRequirement: { type: 'boss_kill_total', count: 10 },
            background: { color: '#1a0500', gridColor: 'rgba(255, 50, 0, 0.15)', pattern: 'infernal', accentColor: '#ff3300' },
            enemies: { baseColor: '#8b0000', eliteColor: '#4a0000', shape: 'pentagon' },
            difficulty: { dr: 0.85, speed: 0.60, eliteChance: 0.40 },
            message: "Discendi nell'Abisso Infernale!",
            effects: { xpBonus: 2.5, dropBonus: 2.0 },
            hazards: { tickDamage: 2, safeZoneRadius: 150, safeZoneCount: 3 }
        },
        '7': {
            name: "Santuario Celeste",
            unlocked: false,
            unlockRequirement: { type: 'arsenal_size', cores: 14, weapons: 5 },
            background: { color: '#f5f0e0', gridColor: 'rgba(255, 215, 0, 0.15)', pattern: 'celestial', accentColor: '#ffd700' },
            enemies: { baseColor: '#fafad2', eliteColor: '#daa520', shape: 'hexagon' },
            difficulty: { dr: 0.90, speed: 0.65, eliteChance: 0.45 },
            message: "Il Santuario Celeste ti accoglie!",
            effects: { xpBonus: 3.0, dropBonus: 2.5 },
            hazards: { knockbackMultiplier: 2.0 }
        },
        '8': {
            name: "Il Vuoto",
            unlocked: false,
            unlockRequirement: { type: 'survival', time: 1200, stage: '5' },
            background: { color: '#000000', gridColor: 'rgba(255, 255, 255, 0.03)', pattern: 'void', accentColor: '#ffffff' },
            enemies: { baseColor: '#333333', eliteColor: '#666666', shape: 'glitch' },
            difficulty: { dr: 0.80, speed: 0.70, eliteChance: 0.50 },
            message: "Il Vuoto ti inghiotte...",
            effects: { xpBonus: 3.5, dropBonus: 3.0 },
            hazards: { glitchEnemies: true, noMinimap: true }
        }
    }
};
