/**
 * Game Configuration - All game constants and data
 * @module config
 */

import { Utils } from '../utils/index.js';

export const CONFIG = {
    world: { width: 8000, height: 6000, gridSize: 100 },
    effects: {
        screenShakeDecay: 0.88,
        screenShakeMax: 25,
        cameraLerp: 0.1,
        hitFlashFrames: 10,
    },
    player: {
        base: { hp: 220, speed: 3, radius: 15, dr: 0 },
        iFramesDuration: 0.8,
        xpCurve: { base: 12, growth: 1.15, levelFactor: 10, power: 1.0 }
    },
    characterArchetypes: {
        'standard': {
            id: 'standard',
            name: "Sfera Standard",
            desc: "L'archetipo base. Equilibrato e senza modificatori speciali.",
            startingWeapon: 'magicMissile',
            bonus: "Nessuno.",
            malus: "Nessuno.",
            color: '#4488ff',
            cost: 0,
            draw: (ctx, player) => {
                const pulse = Math.sin(Date.now() / 200) * 2;
                ctx.strokeStyle = player.archetype.color;
                ctx.fillStyle = `rgba(68, 136, 255, 0.2)`;
                ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(player.x, player.y, player.stats.radius + pulse, 0, Math.PI * 2); ctx.stroke(); ctx.fill();
                ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(player.x, player.y, player.stats.radius - 4, 0, Math.PI * 2); ctx.stroke();
                ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(player.x, player.y, 3, 0, Math.PI * 2); ctx.fill();
            }
        },
        'steel': {
            id: 'steel',
            name: "Palla d'Acciaio",
            desc: "Incredibilmente resistente ma molto lenta. Ideale per chi ama la mischia.",
            startingWeapon: 'shockwave',
            bonus: "+70% Riduzione Danno (DR) base. Shockwave: +40% danno, +50% knockback, +25% area.",
            malus: "-50% Velocità di movimento, -40% Velocità di attacco.",
            color: '#bdc3c7',
            cost: 200,
            weaponBonuses: { shockwave: { damage: 1.4, knockback: 1.5, radius: 1.25 } },
            draw: (ctx, player) => {
                const pulse = Math.sin(Date.now() / 300) * 1;
                ctx.fillStyle = player.archetype.color;
                ctx.strokeStyle = '#7f8c8d';
                ctx.lineWidth = 4;
                ctx.beginPath(); ctx.arc(player.x, player.y, player.stats.radius + pulse, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.beginPath(); ctx.arc(player.x, player.y, player.stats.radius * 0.6, 0, Math.PI * 2); ctx.fill();
            }
        },
        'magma': {
            id: 'magma',
            name: "Nucleo Magmatico",
            desc: "Una sfera volatile che incenerisce chiunque si avvicini troppo.",
            startingWeapon: 'fireball',
            bonus: "Infligge danni da bruciatura potenziati ai nemici al contatto. Fireball: +60% danno da bruciatura, +25% danno diretto.",
            malus: "+15% tempo di ricarica per tutte le abilità.",
            color: '#e67e22',
            cost: 300,
            weaponBonuses: { fireball: { burnDamage: 1.6, damage: 1.25 } },
            draw: (ctx, player) => {
                const pulse = Math.sin(Date.now() / 150) * 2;
                ctx.fillStyle = '#2c3e50';
                ctx.beginPath(); ctx.arc(player.x, player.y, player.stats.radius + pulse, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = player.archetype.color;
                ctx.lineWidth = 3 + pulse * 0.5;
                Utils.drawJaggedLine(ctx, player.x - player.stats.radius, player.y, player.x + player.stats.radius, player.y, 8);
                Utils.drawJaggedLine(ctx, player.x, player.y - player.stats.radius, player.x, player.y + player.stats.radius, 8);
            }
        },
        'frost': {
            id: 'frost',
            name: "Cristallo di Gelo",
            desc: "Fragile ma capace di controllare il campo di battaglia con il suo freddo glaciale.",
            startingWeapon: 'frostbolt',
            bonus: "Rallenta fortemente i nemici che entrano in contatto. Frostbolt: +40% slow, +25% danno, +30% penetrazione.",
            malus: "-15 Salute massima.",
            color: '#3498db',
            cost: 300,
            weaponBonuses: { frostbolt: { slow: 1.4, damage: 1.25, penetration: 1.3 } },
            draw: (ctx, player) => {
                const pulse = Math.sin(Date.now() / 250) * 2;
                ctx.fillStyle = `rgba(52, 152, 219, 0.4)`;
                ctx.strokeStyle = '#ecf0f1';
                ctx.lineWidth = 3;
                Utils.drawPolygon(ctx, player.x, player.y, player.stats.radius + pulse, 6, Date.now() / 1000, `rgba(52, 152, 219, 0.6)`);
                ctx.stroke();
            }
        },
        'shadow': {
            id: 'shadow',
            name: "Sfera d'Ombra",
            desc: "Veloce e letale, ma non può incassare molti colpi. Per giocatori audaci.",
            startingWeapon: 'shotgun',
            bonus: "+35% Velocità di movimento. Shotgun: +2 proiettili, +25% critico, +15% danno.",
            malus: "-20% Salute massima.",
            color: '#8e44ad',
            cost: 400,
            weaponBonuses: { shotgun: { count: 2, critChance: 0.25, damage: 1.15 } },
            draw: (ctx, player) => {
                const radius = player.stats.radius;
                const g = ctx.createRadialGradient(player.x, player.y, radius * 0.2, player.x, player.y, radius);
                g.addColorStop(0, player.archetype.color);
                g.addColorStop(1, '#000000');
                ctx.fillStyle = g;
                ctx.beginPath(); ctx.arc(player.x, player.y, radius, 0, Math.PI * 2); ctx.fill();
            }
        },
        'tech': {
            id: 'tech',
            name: "Giroscopio Tecnologico",
            desc: "Un congegno preciso che amplifica l'area d'effetto a discapito della potenza pura.",
            startingWeapon: 'lightning',
            bonus: "+50% Area d'effetto. Lightning: +3 rimbalzi, +40% area, +25% danno. Tutte le armi: +15% area bonus.",
            malus: "-5% Danno globale.",
            color: '#1abc9c',
            cost: 800,
            weaponBonuses: { lightning: { chains: 3, area: 1.4, damage: 1.25 } },
            draw: (ctx, player) => {
                const radius = player.stats.radius;
                ctx.strokeStyle = player.archetype.color;
                ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(player.x, player.y, radius, 0, Math.PI * 2); ctx.stroke();
                ctx.save();
                ctx.translate(player.x, player.y);
                ctx.rotate(Date.now() / 500);
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(0, 0, radius * 0.7, -Math.PI / 2, Math.PI / 2); ctx.stroke();
                ctx.beginPath(); ctx.arc(0, 0, radius * 0.7, Math.PI / 2, -Math.PI / 2); ctx.stroke();
                ctx.restore();
            }
        }
    },
    enemies: {
        spawnInterval: 0.8,
        spawnImmunity: 60,
        /** Cooldown (secondi) tra un hit da contatto e il successivo per ogni nemico. Limita DPS da swarm. */
        contactDamageCooldown: 1.0,
        scaling: {
            timeFactor: 15,
            hpPerFactor: 5,
            speedPerFactor: 0.02,
            damagePerFactor: 0.58,
            xpPerFactor: 1.25,
            xpPowerFactor: 1.05,
            levelFactorMultiplier: 0.7,
            drPerFactor: 0.0006
        },
        base: { hp: 25, speed: 1.2, radius: 12, damage: 8, xp: 4, dr: 0 }
    },
    difficultyTiers: {
        '1': { time: 300, dr: 0.25, speed: 0.15, message: "DIFFICOLTÀ AUMENTATA: L'Orda si Agita!" },
        '2': { time: 600, dr: 0.45, speed: 0.25, championChance: 0.08, message: "ALLARME: Campioni nemici individuati!" },
        '3': { time: 900, dr: 0.70, speed: 0.40, eliteChanceMultiplier: 3, message: "ALLARME ROSSO: Convergenza Planare!" }
    },
    stages: {
        '1': {
            name: "Pianura Eterna",
            unlocked: true,
            unlockRequirement: null,
            background: { color: '#16213e', gridColor: 'rgba(255, 255, 255, 0.05)', pattern: 'grid' },
            enemies: { baseColor: '#e74c3c', eliteColor: '#c0392b', shape: 'circle' },
            difficulty: { dr: 0, speed: 0, eliteChance: 0.08 },
            message: "Benvenuto nella Pianura Eterna!",
            effects: { xpBonus: 1.0, dropBonus: 1.0 }
        },
        '2': {
            name: "Foresta Oscura",
            unlocked: false,
            unlockRequirement: { type: 'craft_core', coreId: 'magnetic' },
            background: { color: '#1a472a', gridColor: 'rgba(34, 139, 34, 0.1)', pattern: 'forest' },
            enemies: { baseColor: '#27ae60', eliteColor: '#229954', shape: 'triangle' },
            difficulty: { dr: 0.25, speed: 0.15, eliteChance: 0.12 },
            message: "Entri nella Foresta Oscura...",
            effects: { xpBonus: 1.2, dropBonus: 1.1 }
        },
        '3': {
            name: "Deserto Infuocato",
            unlocked: false,
            unlockRequirement: { type: 'craft_weapon', weaponId: 'iron_spikes' },
            background: { color: '#8b4513', gridColor: 'rgba(255, 165, 0, 0.1)', pattern: 'desert' },
            enemies: { baseColor: '#f39c12', eliteColor: '#e67e22', shape: 'square' },
            difficulty: { dr: 0.40, speed: 0.25, eliteChance: 0.18 },
            message: "Il Deserto Infuocato ti attende!",
            effects: { xpBonus: 1.4, dropBonus: 1.25 }
        },
        '4': {
            name: "Ghiacciaio Perduto",
            unlocked: false,
            unlockRequirement: { type: 'kill_elites', stage: 3, count: 5 },
            background: { color: '#4682b4', gridColor: 'rgba(173, 216, 230, 0.15)', pattern: 'ice' },
            enemies: { baseColor: '#87ceeb', eliteColor: '#00bfff', shape: 'diamond' },
            difficulty: { dr: 0.55, speed: 0.35, eliteChance: 0.25 },
            message: "Il Ghiacciaio Perduto ti congela!",
            effects: { xpBonus: 1.6, dropBonus: 1.4 }
        },
        '5': {
            name: "Abisso Cosmico",
            unlocked: false,
            unlockRequirement: { type: 'arsenal_size', cores: 2, weapons: 2 },
            background: { color: '#2c1810', gridColor: 'rgba(138, 43, 226, 0.2)', pattern: 'cosmic' },
            enemies: { baseColor: '#8a2be2', eliteColor: '#9932cc', shape: 'star' },
            difficulty: { dr: 0.75, speed: 0.50, eliteChance: 0.35 },
            message: "L'Abisso Cosmico ti risucchia!",
            effects: { xpBonus: 2.0, dropBonus: 1.8 }
        }
    },
    boss: {
        spawnThreshold: 150,
        base: { hp: 1500, speed: 1.8, radius: 45, damage: 35 },
        scaling: { timeFactor: 60, hpPerFactor: 800 },
        attack: { cooldown: 1800, projectileSpeed: 5, projectileRadius: 10 }
    },
    chest: { spawnTime: 20, respawnTime: 30, size: 25, gemDrop: { min: 5, random: 6 } },
    merchant: { x: 4000, y: 2800, size: 40, interactionRadius: 60 },
    xpOrbs: { mapSpawn: { interval: 4, batch: 15, max: 300, value: 5 }, pickupRadius: 100 },
    materials: {
        coreMaterials: {
            'iron_fragment': { id: 'iron_fragment', name: 'Frammento di Ferro', rarity: 'common', color: '#8B7355', dropChance: 0.15, enemyTypes: ['slime'], stage: 1, description: "Metallo grezzo estratto dalle viscere della terra" },
            'steel_fragment': { id: 'steel_fragment', name: 'Frammento di Acciaio', rarity: 'uncommon', color: '#708090', dropChance: 0.08, enemyTypes: ['slime_elite'], stage: 1, description: "Acciaio temprato dalle fucine degli antichi" },
            'wood_fragment': { id: 'wood_fragment', name: 'Frammento di Legno Corrotto', rarity: 'common', color: '#2d5016', dropChance: 0.12, enemyTypes: ['goblin'], stage: 2, description: "Legno corrotto dalla magia oscura della foresta" },
            'poison_fragment': { id: 'poison_fragment', name: 'Frammento di Veleno', rarity: 'uncommon', color: '#32cd32', dropChance: 0.06, enemyTypes: ['goblin_elite'], stage: 2, description: "Veleno distillato dalle piante carnivore" },
            'sand_fragment': { id: 'sand_fragment', name: 'Frammento di Sabbia Ardente', rarity: 'common', color: '#daa520', dropChance: 0.14, enemyTypes: ['golem'], stage: 3, description: "Sabbia infuocata dal sole del deserto" },
            'fire_fragment': { id: 'fire_fragment', name: 'Frammento di Fuoco', rarity: 'uncommon', color: '#ff4500', dropChance: 0.07, enemyTypes: ['golem_elite'], stage: 3, description: "Fuoco eterno racchiuso in cristalli di quarzo" },
            'ice_fragment': { id: 'ice_fragment', name: 'Frammento di Ghiaccio Eterno', rarity: 'common', color: '#87ceeb', dropChance: 0.13, enemyTypes: ['ice_spirit'], stage: 4, description: "Ghiaccio che non si scioglie mai" },
            'frost_fragment': { id: 'frost_fragment', name: 'Frammento di Brina', rarity: 'uncommon', color: '#00ffff', dropChance: 0.065, enemyTypes: ['ice_spirit_elite'], stage: 4, description: "Brina che congela il tempo stesso" },
            'void_fragment': { id: 'void_fragment', name: 'Frammento del Vuoto', rarity: 'rare', color: '#8A2BE2', dropChance: 0.04, enemyTypes: ['cosmic_demon'], stage: 5, description: "Essenza pura del vuoto interstellare" },
            'star_fragment': { id: 'star_fragment', name: 'Frammento di Stella', rarity: 'epic', color: '#ffd700', dropChance: 0.02, enemyTypes: ['cosmic_demon_elite'], stage: 5, description: "Polvere di stelle cadute" }
        },
        weaponMaterials: {
            'stone_fragment': { id: 'stone_fragment', name: 'Frammento di Pietra', rarity: 'common', color: '#696969', dropChance: 0.16, enemyTypes: ['slime'], stage: 1, description: "Pietra solida della pianura" },
            'metal_fragment': { id: 'metal_fragment', name: 'Frammento di Metallo', rarity: 'uncommon', color: '#C0C0C0', dropChance: 0.08, enemyTypes: ['slime_elite'], stage: 1, description: "Metallo raffinato dalle miniere" },
            'vine_fragment': { id: 'vine_fragment', name: 'Frammento di Vite', rarity: 'common', color: '#228b22', dropChance: 0.15, enemyTypes: ['goblin'], stage: 2, description: "Viti animate della foresta oscura" },
            'shadow_fragment': { id: 'shadow_fragment', name: "Frammento d'Ombra", rarity: 'uncommon', color: '#2f2f2f', dropChance: 0.07, enemyTypes: ['goblin_elite'], stage: 2, description: "Ombra solidificata dalla magia oscura" },
            'obsidian_fragment': { id: 'obsidian_fragment', name: 'Frammento di Ossidiana', rarity: 'common', color: '#1a1a1a', dropChance: 0.14, enemyTypes: ['golem'], stage: 3, description: "Ossidiana forgiata dal calore del deserto" },
            'magma_fragment': { id: 'magma_fragment', name: 'Frammento di Magma', rarity: 'uncommon', color: '#ff4500', dropChance: 0.06, enemyTypes: ['golem_elite'], stage: 3, description: "Magma liquido racchiuso in cristalli" },
            'crystal_fragment': { id: 'crystal_fragment', name: 'Frammento di Cristallo', rarity: 'common', color: '#87CEEB', dropChance: 0.13, enemyTypes: ['ice_spirit'], stage: 4, description: "Cristalli di ghiaccio purissimo" },
            'energy_fragment': { id: 'energy_fragment', name: 'Frammento di Energia', rarity: 'uncommon', color: '#00FFFF', dropChance: 0.065, enemyTypes: ['ice_spirit_elite'], stage: 4, description: "Energia pura congelata nel tempo" },
            'cosmic_fragment': { id: 'cosmic_fragment', name: 'Frammento Cosmico', rarity: 'rare', color: '#FF1493', dropChance: 0.03, enemyTypes: ['cosmic_demon'], stage: 5, description: "Essenza cosmica dell'universo" },
            'nebula_fragment': { id: 'nebula_fragment', name: 'Frammento di Nebulosa', rarity: 'epic', color: '#9370db', dropChance: 0.015, enemyTypes: ['cosmic_demon_elite'], stage: 5, description: "Polvere di nebulose lontane" }
        }
    },
    cores: {
        'magnetic': { id: 'magnetic', name: 'Core Magnetico', desc: 'Anelli magnetici rotanti che attirano gemme e XP da +25% distanza.', materials: { 'iron_fragment': 3, 'steel_fragment': 1 }, effect: { type: 'magnet', range: 1.25 }, maxLevel: 1, upgradeCost: null, stage: 1, theme: 'metallico' },
        'resistance': { id: 'resistance', name: 'Core di Resistenza', desc: 'Barriera marrone che riduce i danni ricevuti del 5%.', materials: { 'steel_fragment': 3, 'stone_fragment': 2 }, effect: { type: 'resistance', dr: 0.05 }, maxLevel: 1, upgradeCost: null, stage: 1, theme: 'metallico' },
        'poison': { id: 'poison', name: 'Core Velenoso', desc: 'Aura verde che avvelena i nemici al contatto infliggendo 3 DPS per 5s.', materials: { 'wood_fragment': 2, 'poison_fragment': 2 }, effect: { type: 'poison', damage: 3, duration: 5000 }, maxLevel: 1, upgradeCost: null, stage: 2, theme: 'organico' },
        'shadow': { id: 'shadow', name: "Core d'Ombra", desc: 'Ombra che aumenta la velocità di movimento del 12%.', materials: { 'vine_fragment': 2, 'shadow_fragment': 1 }, effect: { type: 'shadow', speed: 0.12, stealth: 0.3 }, maxLevel: 1, upgradeCost: null, stage: 2, theme: 'organico' },
        'fire': { id: 'fire', name: 'Core Infuocato', desc: 'Aura di fuoco che brucia i nemici al contatto infliggendo 5 DPS.', materials: { 'sand_fragment': 3, 'fire_fragment': 1 }, effect: { type: 'fire', damage: 5 }, maxLevel: 1, upgradeCost: null, stage: 3, theme: 'infuocato' },
        'volcanic': { id: 'volcanic', name: 'Core Vulcanico', desc: 'Eruzioni periodiche che respingono i nemici e infliggono 8 danno.', materials: { 'obsidian_fragment': 2, 'magma_fragment': 2 }, effect: { type: 'volcanic', damage: 8, knockback: 25, cooldown: 4000 }, maxLevel: 1, upgradeCost: null, stage: 3, theme: 'infuocato' },
        'frost': { id: 'frost', name: 'Core Glaciale', desc: 'Aura di ghiaccio che rallenta i nemici del 20% e infligge 4 DPS.', materials: { 'ice_fragment': 3, 'frost_fragment': 1 }, effect: { type: 'frost', slow: 0.2, damage: 4 }, maxLevel: 1, upgradeCost: null, stage: 4, theme: 'glaciale' },
        'crystal': { id: 'crystal', name: 'Core di Cristallo', desc: 'Barriera di cristallo che riflette il 40% dei proiettili.', materials: { 'crystal_fragment': 2, 'energy_fragment': 2 }, effect: { type: 'crystal', reflect: 0.4, amplify: 1.5 }, maxLevel: 1, upgradeCost: null, stage: 4, theme: 'glaciale' },
        'void': { id: 'void', name: 'Core del Vuoto', desc: 'Vortice viola che teletrasporta quando salute < 30%.', materials: { 'void_fragment': 1, 'cosmic_fragment': 1 }, effect: { type: 'void_teleport', threshold: 0.3, cooldown: 10000 }, maxLevel: 1, upgradeCost: null, stage: 5, theme: 'cosmico' },
        'stellar': { id: 'stellar', name: 'Core Stellare', desc: 'Aura stellare che aumenta tutti i danni del 15% e rigenera 1 HP ogni 3s.', materials: { 'star_fragment': 1, 'nebula_fragment': 1 }, effect: { type: 'stellar', damage: 0.15, regen: 1, interval: 3000 }, maxLevel: 1, upgradeCost: null, stage: 5, theme: 'cosmico' }
    },
    weapons: {
        'iron_spikes': { id: 'iron_spikes', name: 'Spine di Ferro', desc: '4 spine metalliche che danneggiano i nemici per +10 danno al contatto.', materials: { 'iron_fragment': 3, 'stone_fragment': 2 }, effect: { type: 'spikes', damage: 10, radius: 30, count: 4 }, maxLevel: 3, upgradeCost: { 'iron_fragment': 2, 'stone_fragment': 1 }, stage: 1, theme: 'metallico' },
        'steel_barrier': { id: 'steel_barrier', name: "Barriera d'Acciaio", desc: 'Barriera metallica che blocca il 50% dei proiettili.', materials: { 'steel_fragment': 2, 'metal_fragment': 2 }, effect: { type: 'barrier', blockChance: 0.5, damage: 6 }, maxLevel: 3, upgradeCost: { 'steel_fragment': 1, 'metal_fragment': 1 }, stage: 1, theme: 'metallico' },
        'poison_vines': { id: 'poison_vines', name: 'Viti Velenose', desc: 'Viti animate che avvelenano i nemici infliggendo 3 DPS per 4s.', materials: { 'vine_fragment': 3, 'poison_fragment': 1 }, effect: { type: 'poison_vines', damage: 3, duration: 4000, radius: 35 }, maxLevel: 3, upgradeCost: { 'vine_fragment': 2, 'poison_fragment': 1 }, stage: 2, theme: 'organico' },
        'shadow_cloak': { id: 'shadow_cloak', name: "Mantello d'Ombra", desc: 'Mantello che riduce la visibilità ai nemici del 40%.', materials: { 'shadow_fragment': 2, 'wood_fragment': 2 }, effect: { type: 'shadow_cloak', stealth: 0.4, speed: 0.08 }, maxLevel: 3, upgradeCost: { 'shadow_fragment': 1, 'wood_fragment': 1 }, stage: 2, theme: 'organico' },
        'fire_ring': { id: 'fire_ring', name: 'Anello di Fuoco', desc: 'Anello di fiamme che brucia i nemici infliggendo 6 DPS.', materials: { 'fire_fragment': 2, 'sand_fragment': 2 }, effect: { type: 'fire_ring', damage: 6, radius: 40 }, maxLevel: 3, upgradeCost: { 'fire_fragment': 1, 'sand_fragment': 1 }, stage: 3, theme: 'infuocato' },
        'obsidian_blade': { id: 'obsidian_blade', name: 'Lama di Ossidiana', desc: '2 lame di ossidiana che tagliano i nemici per +15 danno.', materials: { 'obsidian_fragment': 3, 'magma_fragment': 1 }, effect: { type: 'obsidian_blade', damage: 15, burn: 3, count: 2 }, maxLevel: 3, upgradeCost: { 'obsidian_fragment': 2, 'magma_fragment': 1 }, stage: 3, theme: 'infuocato' },
        'ice_shards': { id: 'ice_shards', name: 'Schegge di Ghiaccio', desc: '5 schegge di ghiaccio che rallentano i nemici del 25%.', materials: { 'ice_fragment': 3, 'crystal_fragment': 2 }, effect: { type: 'ice_shards', damage: 8, slow: 0.25, count: 5 }, maxLevel: 3, upgradeCost: { 'ice_fragment': 2, 'crystal_fragment': 1 }, stage: 4, theme: 'glaciale' },
        'frost_field': { id: 'frost_field', name: 'Campo di Brina', desc: 'Campo di brina che rallenta i nemici del 30% e infligge 5 DPS.', materials: { 'frost_fragment': 2, 'energy_fragment': 2 }, effect: { type: 'frost_field', damage: 5, slow: 0.3, radius: 45 }, maxLevel: 3, upgradeCost: { 'frost_fragment': 1, 'energy_fragment': 1 }, stage: 4, theme: 'glaciale' },
        'void_blade': { id: 'void_blade', name: 'Lama del Vuoto', desc: '3 lame del vuoto che tagliano i nemici per +18 danno.', materials: { 'void_fragment': 2, 'cosmic_fragment': 1 }, effect: { type: 'void_blade', damage: 18, slow: 0.25, duration: 4000, count: 3 }, maxLevel: 3, upgradeCost: { 'void_fragment': 1, 'cosmic_fragment': 1 }, stage: 5, theme: 'cosmico' },
        'stellar_pulse': { id: 'stellar_pulse', name: 'Impulso Stellare', desc: 'Impulso cosmico che respinge i nemici infliggendo +20 danno.', materials: { 'star_fragment': 1, 'nebula_fragment': 1 }, effect: { type: 'stellar_pulse', damage: 20, knockback: 40, cooldown: 4000 }, maxLevel: 3, upgradeCost: { 'star_fragment': 1, 'nebula_fragment': 1 }, stage: 5, theme: 'cosmico' }
    },
    upgradeTree: {
        'health': { id: 'health', name: 'Vitalità', desc: 'Aumenta la salute massima di 60.', maxLevel: 10, type: 'passive' },
        'speed': { id: 'speed', name: 'Rapidità', desc: 'Aumenta la velocità di movimento.', maxLevel: 5, type: 'passive' },
        'armor': { id: 'armor', name: 'Armatura', desc: 'Aumenta la Riduzione Danno del 3%.', maxLevel: 10, type: 'passive' },
        'attack_speed': { id: 'attack_speed', name: "Velocità d'attacco", desc: 'Riduce la ricarica di tutte le abilità del 8%.', maxLevel: 5, type: 'passive' },
        'magicMissile': { id: 'magicMissile', name: 'Proiettile Magico', desc: "L'attacco base, non potenziabile.", type: 'active' },
        'fireball': { id: 'fireball', name: 'Sfera di Fuoco', desc: 'Lancia una palla di fuoco che esplode.', details: "+8 Danni, +8 Raggio Esplosione", maxLevel: 4 },
        'fireball_evolve_giant': { id: 'fireball_evolve_giant', name: 'EVO: Palla di Fuoco Gigante', desc: 'Palla di fuoco lenta ma devastante.', type: 'evolution' },
        'fireball_evolve_meteor': { id: 'fireball_evolve_meteor', name: 'EVO: Pioggia di Meteore', desc: 'Fa piovere meteore dal cielo.', type: 'evolution' },
        'fireball_mastery_giant': { id: 'fireball_mastery_giant', name: 'Maestria: Palla Gigante', desc: 'Aumenta i danni della Palla Gigante.', type: 'mastery' },
        'fireball_mastery_meteor': { id: 'fireball_mastery_meteor', name: 'Maestria: Pioggia di Meteore', desc: 'Aggiunge una meteora extra.', type: 'mastery' },
        'lightning': { id: 'lightning', name: 'Fulmine a Catena', desc: 'Un fulmine che rimbalza tra i nemici.', details: "+6 Danni, +1 Rimbalzo", maxLevel: 4 },
        'lightning_evolve_storm': { id: 'lightning_evolve_storm', name: 'EVO: Tempesta di Fulmini', desc: 'Evoca una tempesta stazionaria.', type: 'evolution' },
        'lightning_evolve_spear': { id: 'lightning_evolve_spear', name: 'EVO: Lancia del Fulmine', desc: 'Potente fulmine che trapassa.', type: 'evolution' },
        'lightning_mastery_storm': { id: 'lightning_mastery_storm', name: 'Maestria: Tempesta', desc: 'Aumenta durata e frequenza.', type: 'mastery' },
        'lightning_mastery_spear': { id: 'lightning_mastery_spear', name: 'Maestria: Lancia', desc: 'Aumenta danni e stordimento.', type: 'mastery' },
        'frostbolt': { id: 'frostbolt', name: 'Dardo di Gelo', desc: 'Un dardo che trapassa e rallenta.', details: "+5 Danni, +1 Perforazione", maxLevel: 4 },
        'frostbolt_evolve_glacial': { id: 'frostbolt_evolve_glacial', name: 'EVO: Tormenta Glaciale', desc: "Crea un'aura di gelo.", type: 'evolution' },
        'frostbolt_evolve_comet': { id: 'frostbolt_evolve_comet', name: 'EVO: Cometa di Ghiaccio', desc: 'Cometa che congela nemici.', type: 'evolution' },
        'frostbolt_mastery_glacial': { id: 'frostbolt_mastery_glacial', name: 'Maestria: Tormenta', desc: "Aumenta danni e rallentamento dell'aura.", type: 'mastery' },
        'frostbolt_mastery_comet': { id: 'frostbolt_mastery_comet', name: 'Maestria: Cometa', desc: "La cometa lascia un'area di ghiaccio.", type: 'mastery' },
        'shotgun': { id: 'shotgun', name: 'Fucile Arcano', desc: 'Rosa di proiettili a corto raggio.', details: "+4 Danni, +2 Proiettili", maxLevel: 4 },
        'shotgun_evolve_explosive': { id: 'shotgun_evolve_explosive', name: 'EVO: Raffica Esplosiva', desc: 'I proiettili ora esplodono.', type: 'evolution' },
        'shotgun_evolve_cannon': { id: 'shotgun_evolve_cannon', name: 'EVO: Cannone a Rotazione', desc: 'Spara un flusso costante.', type: 'evolution' },
        'shotgun_mastery_explosive': { id: 'shotgun_mastery_explosive', name: 'Maestria: Raffica Esplosiva', desc: 'Aumenta raggio esplosioni.', type: 'mastery' },
        'shotgun_mastery_cannon': { id: 'shotgun_mastery_cannon', name: 'Maestria: Cannone Rotante', desc: 'Aumenta durata e velocità.', type: 'mastery' },
        'shockwave': { id: 'shockwave', name: "Onda d'Urto", desc: 'Respinge e danneggia nemici.', details: "+10 Danni, +15 Raggio, +5 Respinta", maxLevel: 4 },
        'shockwave_evolve_resonant': { id: 'shockwave_evolve_resonant', name: 'EVO: Epicentro Risonante', desc: "Onda d'urto con knockback devastante.", type: 'evolution' },
        'shockwave_evolve_implosion': { id: 'shockwave_evolve_implosion', name: 'EVO: Onda Distruttiva', desc: 'Onda potenziata con forza devastante.', type: 'evolution' },
        'shockwave_mastery_resonant': { id: 'shockwave_mastery_resonant', name: 'Maestria: Epicentro', desc: 'Ultima onda stordisce nemici.', type: 'mastery' },
        'shockwave_mastery_implosion': { id: 'shockwave_mastery_implosion', name: 'Maestria: Implosione', desc: 'Danni bonus basati su salute mancante.', type: 'mastery' },
        'heal': { id: 'heal', name: 'Impulso Curativo', desc: 'Rigenera salute.', details: "+10 Salute Curata, -1s Ricarica", maxLevel: 5 },
        'heal_evolve_sanctuary': { id: 'heal_evolve_sanctuary', name: 'EVO: Santuario Consacrato', desc: 'Area a terra che cura.', type: 'evolution' },
        'heal_evolve_lifesteal': { id: 'heal_evolve_lifesteal', name: 'EVO: Sacrificio Vitale', desc: 'Conferisce rubavita.', type: 'evolution' },
        'heal_mastery_sanctuary': { id: 'heal_mastery_sanctuary', name: 'Maestria: Santuario', desc: "Anche velocità d'attacco.", type: 'mastery' },
        'heal_mastery_lifesteal': { id: 'heal_mastery_lifesteal', name: 'Maestria: Sacrificio', desc: 'Aumenta rubavita e durata.', type: 'mastery' },
        'shield': { id: 'shield', name: 'Scudo Magico', desc: 'Barriera protettiva temporanea.', details: "+0.5s Durata, -1s Ricarica", maxLevel: 5 },
        'shield_evolve_reflect': { id: 'shield_evolve_reflect', name: 'EVO: Barriera Riflettente', desc: 'Riduce danni e riflette.', type: 'evolution' },
        'shield_evolve_orbital': { id: 'shield_evolve_orbital', name: 'EVO: Singolarità Protettiva', desc: 'Globo orbitale protettivo.', type: 'evolution' },
        'shield_mastery_reflect': { id: 'shield_mastery_reflect', name: 'Maestria: Riflesso', desc: 'Aumenta danni riflessi.', type: 'mastery' },
        'shield_mastery_orbital': { id: 'shield_mastery_orbital', name: 'Maestria: Singolarità', desc: 'Aggiunge secondo globo.', type: 'mastery' }
    },
    permanentUpgrades: {
        health: { name: 'Salute', baseCost: 10, costGrowth: 1.25, maxLevel: 10, effect: (level) => `+${level * 20} HP massimi` },
        speed: { name: 'Velocità', baseCost: 10, costGrowth: 1.3, maxLevel: 5, effect: (level) => `+${level * 0.2} Velocità` },
        defense: { name: 'Difesa', baseCost: 12, costGrowth: 1.3, maxLevel: 10, effect: (level) => `+${level * 2}% Riduzione Danno` },
        xpGain: { name: 'XP', baseCost: 8, costGrowth: 1.25, maxLevel: 10, effect: (level) => `+${level * 8}% Guadagno XP` },
        luck: { name: 'Fortuna', baseCost: 8, costGrowth: 1.25, maxLevel: 10, effect: (level) => `+${level * 4}% Fortuna` },
        power: { name: 'Potenza', baseCost: 15, costGrowth: 1.3, maxLevel: 10, effect: (level) => `+${level * 8}% Danno` },
        frequency: { name: 'Frequenza', baseCost: 15, costGrowth: 1.3, maxLevel: 10, effect: (level) => `-${level * 5}% Tempo di Ricarica` },
        area: { name: 'Area', baseCost: 15, costGrowth: 1.3, maxLevel: 10, effect: (level) => `+${level * 6}% Area d'Effetto` }
    },
    itemTypes: {
        'HEAL_POTION': { name: "Pozione di Cura", color: '#ff69b4', desc: "Ripristina il 50% della salute massima." },
        'XP_BOMB': { name: "Bomba di XP", color: '#ffff00', desc: "Fornisce un'enorme quantità di esperienza." },
        'INVINCIBILITY': { name: "Scudo Divino", color: '#ffffff', desc: "Immunità dai danni per 10 secondi." },
        'DAMAGE_BOOST': { name: "Gemma del Potere", color: '#ff4500', desc: "Aumenta i danni del 25% per 20 secondi." },
        'LEGENDARY_ORB': { name: "Frammento Divino", color: '#ff00ff', desc: "Invincibilità e danni aumentati per 60 secondi!" }
    },
    statIcons: {
        health: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
        speed: `<svg class="icon" viewBox="0 0 24 24"><path d="M15.58 11.5l-3.5-3.5a1 1 0 00-1.41 0L12 8.59l-2.88-2.88a1 1 0 00-1.41 1.41L10.59 10l-2.88 2.88a1 1 0 101.41 1.41L12 11.41l2.88 2.88a1 1 0 001.41-1.41L13.41 10l2.88-2.88a1 1 0 000-1.41zM19 3a1 1 0 00-1 1v16a1 1 0 002 0V4a1 1 0 00-1-1z"/></svg>`,
        power: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 2L9 4h6l-3-3zm0 22l3-3H9l3 3zm7-11h-3v-2h3v2zm-4 2h-2v2h2v-2zm-2-4V8h-2v2h2zm-4 0V8H7v2h2zm-2 4h-2v2h2v-2zm-4 0h2v2H5v-2zm8 12h2v2h-2v-2zm-4 0h2v2H9v-2zm-4 0h2v2H5v-2zM5 5h2v2H5V5zm8 12h2v2h-2v-2zm-4 0h2v2H9v-2zm-4 0h2v2H5v-2z"/></svg>`,
        frequency: `<svg class="icon" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`,
        area: `<svg class="icon" viewBox="0 0 24 24"><path d="M3 11h2v2H3v-2zm2-2h2v2H5V9zm2-2h2v2H7V7zM3 3h2v2H3V3zm16 0h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm-4 4h2v2h-2v-2zM7 17h2v2H7v-2zm-2 2h2v2H5v-2zm-2-4h2v2H3v-2zm16-4h2v2h-2v-2zM15 5h2v2h-2V5zm-4 0h2v2H7V5zm-4 0h2v2H3V5zM5 5h2v2H5V5zm8 12h2v2h-2v-2zm-4 0h2v2H9v-2zm-4 0h2v2H5v-2z"/></svg>`,
        luck: `<svg class="icon" viewBox="0 0 24 24"><path d="M16.29 5.71a1 1 0 00-1.41 0L12 8.59l-2.88-2.88a1 1 0 00-1.41 1.41L10.59 10l-2.88 2.88a1 1 0 101.41 1.41L12 11.41l2.88 2.88a1 1 0 001.41-1.41L13.41 10l2.88-2.88a1 1 0 000-1.41zM12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>`,
        xpGain: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 1L9 4h6l-3-3zm0 22l3-3H9l3 3zm7-11h-3v-2h3v2zm-4 2h-2v2h2v-2zm-2-4V8h-2v2h2zm-4 0V8H7v2h2zm-2 4h-2v2h2v-2zm-4 0h2v2H5v-2zm8 12h2v2h-2v-2zm-4 0h2v2H9v-2zm-4 0h2v2H5v-2zM5 5h2v2H5V5zm8 12h2v2h-2v-2zm-4 0h2v2H9v-2zm-4 0h2v2H5v-2z"/></svg>`,
        defense: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"/></svg>`
    }
};
