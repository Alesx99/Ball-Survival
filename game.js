const CONFIG = {
    world: { width: 8000, height: 6000, gridSize: 100 },
    player: {
        base: { hp: 120, speed: 3, radius: 15, dr: 0 },
        xpCurve: { base: 10, growth: 1.12, levelFactor: 8, power: 1.0 }
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
            cost: 0, // Sempre sbloccato
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
            desc: "Lenta ma incredibilmente resistente. Ideale per chi ama la mischia.",
            startingWeapon: 'shockwave',
            bonus: "+70% Riduzione Danno (DR) base. Shockwave: +20% danno, +30% knockback.",
            malus: "-25% Velocità di movimento.",
            color: '#bdc3c7',
            cost: 200,
            weaponBonuses: {
                shockwave: { damage: 1.2, knockback: 1.3 }
            },
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
            bonus: "Infligge danni da bruciatura potenziati ai nemici al contatto. Fireball: +30% danno da bruciatura.",
            malus: "+5% tempo di ricarica per tutte le abilità.",
            color: '#e67e22',
            cost: 300,
            weaponBonuses: {
                fireball: { burnDamage: 1.3 }
            },
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
            bonus: "Rallenta fortemente i nemici che entrano in contatto. Frostbolt: +20% slow, +10% danno.",
            malus: "-8 Salute massima.",
            color: '#3498db',
            cost: 300,
            weaponBonuses: {
                frostbolt: { slow: 1.2, damage: 1.1 }
            },
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
            bonus: "+18% Velocità di movimento. Shotgun: +1 proiettile, +10% critico.",
            malus: "-8% Salute massima.",
            color: '#8e44ad',
            cost: 400,
            weaponBonuses: {
                shotgun: { count: 1, critChance: 0.1 }
            },
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
            bonus: "+15% Area d'effetto. Lightning: +1 rimbalzo, +10% area.",
            malus: "-3% Danno globale.",
            color: '#1abc9c',
            cost: 500,
            weaponBonuses: {
                lightning: { chains: 1, area: 1.1 }
            },
            draw: (ctx, player) => {
                const radius = player.stats.radius;
                ctx.strokeStyle = player.archetype.color;
                ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(player.x, player.y, radius, 0, Math.PI*2); ctx.stroke();
                
                ctx.save();
                ctx.translate(player.x, player.y);
                ctx.rotate(Date.now()/500);
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(0, 0, radius * 0.7, -Math.PI/2, Math.PI/2); ctx.stroke();
                ctx.beginPath(); ctx.arc(0, 0, radius * 0.7, Math.PI/2, -Math.PI/2); ctx.stroke();
                ctx.restore();
            }
        }
    },
    enemies: {
        spawnInterval: 0.35, 
        spawnImmunity: 90, 
        scaling: { 
            timeFactor: 10, 
            hpPerFactor: 8, 
            speedPerFactor: 0.03, 
            damagePerFactor: 1.0, // ancora più dolce
            xpPerFactor: 1,
            xpPowerFactor: 1.05, 
            levelFactorMultiplier: 0.7,
            drPerFactor: 0.0007
        },
        base: { hp: 15, speed: 0.8, radius: 12, damage: 3, xp: 2, dr: 0 }
    },
    difficultyTiers: {
        '1': { time: 300, dr: 0.15, speed: 0.1, message: "DIFFICOLTÀ AUMENTATA: L'Orda si Agita!" }, // 5 min
        '2': { time: 600, dr: 0.30, speed: 0.2, championChance: 0.05, message: "ALLARME: Campioni nemici individuati!" }, // 10 min
        '3': { time: 900, dr: 0.50, speed: 0.3, eliteChanceMultiplier: 2, message: "ALLARME ROSSO: Convergenza Planare!" } // 15 min
    },
    stages: {
        '1': { 
            name: "Pianura Eterna", 
            time: 0, 
            unlocked: true, // Sempre sbloccato
            unlockRequirement: null,
            background: { 
                color: '#16213e', 
                gridColor: 'rgba(255, 255, 255, 0.05)',
                pattern: 'grid'
            },
            enemies: {
                baseColor: '#e74c3c',
                eliteColor: '#c0392b',
                shape: 'circle'
            },
            difficulty: { dr: 0, speed: 0, eliteChance: 0.05 },
            message: "Benvenuto nella Pianura Eterna!"
        },
        '2': { 
            name: "Foresta Oscura", 
            time: 300, 
            unlocked: false,
            unlockRequirement: { type: 'survival', stage: 1, time: 300 }, // 5 minuti in stage 1
            background: { 
                color: '#1a472a', 
                gridColor: 'rgba(34, 139, 34, 0.1)',
                pattern: 'forest'
            },
            enemies: {
                baseColor: '#27ae60',
                eliteColor: '#229954',
                shape: 'triangle'
            },
            difficulty: { dr: 0.15, speed: 0.1, eliteChance: 0.08 },
            message: "Entri nella Foresta Oscura..."
        },
        '3': { 
            name: "Deserto Infuocato", 
            time: 600, 
            unlocked: false,
            unlockRequirement: { type: 'boss_kill', stage: 2, count: 1 }, // 1 boss in stage 2
            background: { 
                color: '#8b4513', 
                gridColor: 'rgba(255, 165, 0, 0.1)',
                pattern: 'desert'
            },
            enemies: {
                baseColor: '#f39c12',
                eliteColor: '#e67e22',
                shape: 'square'
            },
            difficulty: { dr: 0.30, speed: 0.2, eliteChance: 0.12 },
            message: "Il Deserto Infuocato ti attende!"
        },
        '4': { 
            name: "Ghiacciaio Perduto", 
            time: 900, 
            unlocked: false,
            unlockRequirement: { type: 'level', stage: 3, level: 10 }, // Livello 10 in stage 3
            background: { 
                color: '#4682b4', 
                gridColor: 'rgba(173, 216, 230, 0.15)',
                pattern: 'ice'
            },
            enemies: {
                baseColor: '#87ceeb',
                eliteColor: '#00bfff',
                shape: 'diamond'
            },
            difficulty: { dr: 0.45, speed: 0.3, eliteChance: 0.15 },
            message: "Il Ghiacciaio Perduto ti congela!"
        },
        '5': { 
            name: "Abisso Cosmico", 
            time: 1200, 
            unlocked: false,
            unlockRequirement: { type: 'total_time', time: 900 }, // 15 minuti totali
            background: { 
                color: '#2c1810', 
                gridColor: 'rgba(138, 43, 226, 0.2)',
                pattern: 'cosmic'
            },
            enemies: {
                baseColor: '#8a2be2',
                eliteColor: '#9932cc',
                shape: 'star'
            },
            difficulty: { dr: 0.60, speed: 0.4, eliteChance: 0.20 },
            message: "L'Abisso Cosmico ti risucchia!"
        }
    },
    boss: {
        spawnThreshold: 150,
        base: { hp: 1000, speed: 1.5, radius: 40, damage: 25 },
        scaling: { timeFactor: 60, hpPerFactor: 500 },
        attack: { cooldown: 2000, projectileSpeed: 4, projectileRadius: 8 }
    },
    chest: { spawnTime: 20, respawnTime: 30, size: 25, gemDrop: { min: 5, random: 6 } },
    merchant: { x: 4000, y: 2800, size: 40, interactionRadius: 60 },
    xpOrbs: { mapSpawn: { interval: 4, batch: 15, max: 300, value: 5 }, pickupRadius: 100 },
    upgradeTree: {
        'health': { id: 'health', name: 'Vitalità', desc: 'Aumenta la salute massima di 40.', maxLevel: 10, type: 'passive' },
        'speed': { id: 'speed', name: 'Rapidità', desc: 'Aumenta la velocità di movimento.', maxLevel: 5, type: 'passive' },
        'armor': { id: 'armor', name: 'Armatura', desc: 'Aumenta la Riduzione Danno del 2%.', maxLevel: 10, type: 'passive' },
        'attack_speed': { id: 'attack_speed', name: 'Velocità d\'attacco', desc: 'Riduce la ricarica di tutte le abilità del 8%.', maxLevel: 5, type: 'passive' },
        'magicMissile': { id: 'magicMissile', name: 'Proiettile Magico', desc: 'L\'attacco base, non potenziabile.', type: 'active' },
        'fireball': { id: 'fireball', name: 'Sfera di Fuoco', desc: 'Lancia una palla di fuoco che esplode.', details: "+5 Danni, +5 Raggio Esplosione", maxLevel: 4 },
        'fireball_evolve_giant': { id: 'fireball_evolve_giant', name: 'EVO: Palla di Fuoco Gigante', desc: 'Palla di fuoco lenta ma devastante che trapassa nemici e lascia una scia ardente.', type: 'evolution' },
        'fireball_evolve_meteor': { id: 'fireball_evolve_meteor', name: 'EVO: Pioggia di Meteore', desc: 'Fa piovere meteore dal cielo sui nemici.', type: 'evolution' },
        'fireball_mastery_giant': { id: 'fireball_mastery_giant', name: 'Maestria: Palla Gigante', desc: 'Aumenta i danni della Palla Gigante (+30) e della scia (+5).', type: 'mastery' },
        'fireball_mastery_meteor': { id: 'fireball_mastery_meteor', name: 'Maestria: Pioggia di Meteore', desc: 'Aggiunge una meteora extra e aumenta il raggio d\'impatto.', type: 'mastery' },
        'lightning': { id: 'lightning', name: 'Fulmine a Catena', desc: 'Un fulmine che rimbalza tra i nemici.', details: "+4 Danni, +1 Rimbalzo", maxLevel: 4 },
        'lightning_evolve_storm': { id: 'lightning_evolve_storm', name: 'EVO: Tempesta di Fulmini', desc: 'Evoca una tempesta stazionaria che colpisce i nemici.', type: 'evolution' },
        'lightning_evolve_spear': { id: 'lightning_evolve_spear', name: 'EVO: Lancia del Fulmine', desc: 'Un potente fulmine che trapassa tutti e può stordire.', type: 'evolution' },
        'lightning_mastery_storm': { id: 'lightning_mastery_storm', name: 'Maestria: Tempesta', desc: 'Aumenta la durata e la frequenza dei fulmini della tempesta.', type: 'mastery' },
        'lightning_mastery_spear': { id: 'lightning_mastery_spear', name: 'Maestria: Lancia', desc: 'Aumenta i danni (+25%) e la probabilità di stordire.', type: 'mastery' },
        'frostbolt': { id: 'frostbolt', name: 'Dardo di Gelo', desc: 'Un dardo che trapassa e rallenta.', details: "+3 Danni, +1 Perforazione", maxLevel: 4 },
        'frostbolt_evolve_glacial': { id: 'frostbolt_evolve_glacial', name: 'EVO: Tormenta Glaciale', desc: 'Crea un\'aura di gelo che danneggia e rallenta i nemici.', type: 'evolution' },
        'frostbolt_evolve_comet': { id: 'frostbolt_evolve_comet', name: 'EVO: Cometa di Ghiaccio', desc: 'Evoca una cometa che esplode, congelando i nemici.', type: 'evolution' },
        'frostbolt_mastery_glacial': { id: 'frostbolt_mastery_glacial', name: 'Maestria: Tormenta', desc: 'Aumenta i danni e l\'effetto di rallentamento dell\'aura.', type: 'mastery' },
        'frostbolt_mastery_comet': { id: 'frostbolt_mastery_comet', name: 'Maestria: Cometa', desc: 'La cometa lascia un\'area di ghiaccio che infligge danni nel tempo.', type: 'mastery' },
        'shotgun': { id: 'shotgun', name: 'Fucile Arcano', desc: 'Una rosa di proiettili a corto raggio.', details: "+2 Danni, +2 Proiettili", maxLevel: 4 },
        'shotgun_evolve_explosive': { id: 'shotgun_evolve_explosive', name: 'EVO: Raffica Esplosiva', desc: 'I proiettili ora esplodono, infliggendo danni ad area.', type: 'evolution' },
        'shotgun_evolve_cannon': { id: 'shotgun_evolve_cannon', name: 'EVO: Cannone a Rotazione', desc: 'Spara un flusso costante di proiettili in direzioni casuali.', type: 'evolution' },
        'shotgun_mastery_explosive': { id: 'shotgun_mastery_explosive', name: 'Maestria: Raffica Esplosiva', desc: 'Aumenta il raggio delle esplosioni e applica una breve bruciatura.', type: 'mastery' },
        'shotgun_mastery_cannon': { id: 'shotgun_mastery_cannon', name: 'Maestria: Cannone Rotante', desc: 'Aumenta la durata e la velocità dei proiettili.', type: 'mastery' },
        'shockwave': { id: 'shockwave', name: 'Onda d\'Urto', desc: 'Respinge e danneggia i nemici.', details: "+10 Danni, +15 Raggio, +5 Respinta", maxLevel: 4 },
        'shockwave_evolve_resonant': { id: 'shockwave_evolve_resonant', name: 'EVO: Epicentro Risonante', desc: 'L\'onda d\'urto viene emessa tre volte in rapida successione.', type: 'evolution' },
        'shockwave_evolve_implosion': { id: 'shockwave_evolve_implosion', name: 'EVO: Implosione Gravitazionale', desc: 'Invece di respingere, attira a te i nemici.', type: 'evolution' },
        'shockwave_mastery_resonant': { id: 'shockwave_mastery_resonant', name: 'Maestria: Epicentro', desc: 'L\'ultima onda stordisce brevemente i nemici colpiti.', type: 'mastery' },
        'shockwave_mastery_implosion': { id: 'shockwave_mastery_implosion', name: 'Maestria: Implosione', desc: 'L\'implosione infligge danni bonus basati sulla salute mancante dei nemici.', type: 'mastery' },
        'heal': { id: 'heal', name: 'Impulso Curativo', desc: 'Emette un impulso che rigenera salute.', details: "+10 Salute Curata, -1s Ricarica", maxLevel: 5 },
        'heal_evolve_sanctuary': { id: 'heal_evolve_sanctuary', name: 'EVO: Santuario Consacrato', desc: 'Crea un\'area a terra che cura e aumenta la difesa.', type: 'evolution' },
        'heal_evolve_lifesteal': { id: 'heal_evolve_lifesteal', name: 'EVO: Sacrificio Vitale', desc: 'Conferisce rubavita su tutti i danni per un breve periodo.', type: 'evolution' },
        'heal_mastery_sanctuary': { id: 'heal_mastery_sanctuary', name: 'Maestria: Santuario', desc: 'Il santuario fornisce anche un leggero aumento della velocità d\'attacco.', type: 'mastery' },
        'heal_mastery_lifesteal': { id: 'heal_mastery_lifesteal', name: 'Maestria: Sacrificio', desc: 'Aumenta la percentuale di rubavita e la durata dell\'effetto.', type: 'mastery' },
        'shield': { id: 'shield', name: 'Scudo Magico', desc: 'Crea una barriera protettiva temporanea.', details: "+0.5s Durata, -1s Ricarica", maxLevel: 5 },
        'shield_evolve_reflect': { id: 'shield_evolve_reflect', name: 'EVO: Barriera Riflettente', desc: 'Riduce i danni e riflette una parte ai nemici.', type: 'evolution' },
        'shield_evolve_orbital': { id: 'shield_evolve_orbital', name: 'EVO: Singolarità Protettiva', desc: 'Evoca un globo orbitale che blocca proiettili e danneggia.', type: 'evolution' },
        'shield_mastery_reflect': { id: 'shield_mastery_reflect', name: 'Maestria: Riflesso', desc: 'Aumenta la percentuale di danni riflessi.', type: 'mastery' },
        'shield_mastery_orbital': { id: 'shield_mastery_orbital', name: 'Maestria: Singolarità', desc: 'Aggiunge un secondo globo orbitale.', type: 'mastery' }
    },
    permanentUpgrades: {
        health: { 
            name: 'Salute', 
            baseCost: 15, 
            costGrowth: 1.35, 
            maxLevel: 10,
            effect: (level) => `+${level * 10} HP massimi`
        },
        speed: { 
            name: 'Velocità', 
            baseCost: 15, 
            costGrowth: 1.5, 
            maxLevel: 5,
            effect: (level) => `+${level * 0.1} Velocità`
        },
        defense: { 
            name: 'Difesa', 
            baseCost: 20, 
            costGrowth: 1.5, 
            maxLevel: 10,
            effect: (level) => `+${level * 1}% Riduzione Danno`
        },
        xpGain: { 
            name: 'XP', 
            baseCost: 10, 
            costGrowth: 1.4, 
            maxLevel: 10,
            effect: (level) => `+${level * 5}% Guadagno XP`
        },
        luck: { 
            name: 'Fortuna', 
            baseCost: 10, 
            costGrowth: 1.4, 
            maxLevel: 10,
            effect: (level) => `+${level * 2}% Fortuna`
        },
        power: { 
            name: 'Potenza', 
            baseCost: 20, 
            costGrowth: 1.5, 
            maxLevel: 10,
            effect: (level) => `+${level * 5}% Danno`
        },
        frequency: { 
            name: 'Frequenza', 
            baseCost: 20, 
            costGrowth: 1.5, 
            maxLevel: 10,
            effect: (level) => `-${level * 3}% Tempo di Ricarica`
        },
        area: { 
            name: 'Area', 
            baseCost: 20, 
            costGrowth: 1.5, 
            maxLevel: 10,
            effect: (level) => `+${level * 4}% Area d'Effetto`
        },
    },
    itemTypes: {
        'HEAL_POTION': { name: "Pozione di Cura", color: '#ff69b4', desc: "Ripristina il 50% della salute massima." },
        'XP_BOMB': { name: "Bomba di XP", color: '#ffff00', desc: "Fornisce un'enorme quantità di esperienza." },
        'INVINCIBILITY': { name: "Scudo Divino", color: '#ffffff', desc: "Immunità dai danni per 10 secondi." },
        'DAMAGE_BOOST': { name: "Gemma del Potere", color: '#ff4500', desc: "Aumenta i danni del 25% per 20 secondi." },
        'LEGENDARY_ORB': { name: "Frammento Divino", color: '#ff00ff', desc: "Invincibilità e danni aumentati per 60 secondi!" }
    },
    materialTypes: {
        'IRON_ORE': { 
            name: "Minerale di Ferro", 
            color: '#8B4513', 
            desc: "Minerale grezzo di ferro per forgiatura.", 
            rarity: 'common', 
            baseDropRate: 0.35,
            unlockRequirement: { type: 'none' },
            scaling: { stageMultiplier: 1.1, eliteBonus: 0.1, bossBonus: 0.2 }
        },
        'STEEL_INGOT': { 
            name: "Lingotto d'Acciaio", 
            color: '#708090', 
            desc: "Acciaio raffinato per armi resistenti.", 
            rarity: 'uncommon', 
            baseDropRate: 0.25,
            unlockRequirement: { type: 'material', material: 'IRON_ORE', amount: 50 },
            scaling: { stageMultiplier: 1.2, eliteBonus: 0.15, bossBonus: 0.25 }
        },
        'MAGIC_CRYSTAL': { 
            name: "Cristallo Magico", 
            color: '#9370DB', 
            desc: "Cristallo pulsante di energia magica.", 
            rarity: 'rare', 
            baseDropRate: 0.15,
            unlockRequirement: { type: 'material', material: 'STEEL_INGOT', amount: 50 },
            scaling: { stageMultiplier: 1.3, eliteBonus: 0.2, bossBonus: 0.35 }
        },
        'FIRE_ESSENCE': { 
            name: "Essenza di Fuoco", 
            color: '#FF4500', 
            desc: "Essenza pura del fuoco elementale.", 
            rarity: 'rare', 
            baseDropRate: 0.12,
            unlockRequirement: { type: 'material', material: 'MAGIC_CRYSTAL', amount: 50 },
            scaling: { stageMultiplier: 1.4, eliteBonus: 0.25, bossBonus: 0.4 }
        },
        'ICE_SHARD': { 
            name: "Scheggia di Ghiaccio", 
            color: '#87CEEB', 
            desc: "Ghiaccio eterno per armi gelide.", 
            rarity: 'rare', 
            baseDropRate: 0.10,
            unlockRequirement: { type: 'material', material: 'FIRE_ESSENCE', amount: 50 },
            scaling: { stageMultiplier: 1.5, eliteBonus: 0.3, bossBonus: 0.45 }
        },
        'LIGHTNING_CORE': { 
            name: "Nucleo di Fulmine", 
            color: '#FFD700', 
            desc: "Nucleo pulsante di energia elettrica.", 
            rarity: 'epic', 
            baseDropRate: 0.08,
            unlockRequirement: { type: 'material', material: 'ICE_SHARD', amount: 50 },
            scaling: { stageMultiplier: 1.8, eliteBonus: 0.4, bossBonus: 0.6 }
        },
        'DEMON_BONE': { 
            name: "Osso Demoniaco", 
            color: '#800000', 
            desc: "Osso corrotto di un demone caduto.", 
            rarity: 'epic', 
            baseDropRate: 0.06,
            unlockRequirement: { type: 'material', material: 'LIGHTNING_CORE', amount: 50 },
            scaling: { stageMultiplier: 2.0, eliteBonus: 0.5, bossBonus: 0.7 }
        },
        'DRAGON_SCALE': { 
            name: "Squama di Drago", 
            color: '#FF6347', 
            desc: "Squama indurita di un drago antico.", 
            rarity: 'legendary', 
            baseDropRate: 0.04,
            unlockRequirement: { type: 'material', material: 'DEMON_BONE', amount: 50 },
            scaling: { stageMultiplier: 2.5, eliteBonus: 0.6, bossBonus: 0.8 }
        },
        'COSMIC_FRAGMENT': { 
            name: "Frammento Cosmico", 
            color: '#FF1493', 
            desc: "Frammento di stella caduta.", 
            rarity: 'legendary', 
            baseDropRate: 0.02,
            unlockRequirement: { type: 'material', material: 'DRAGON_SCALE', amount: 50 },
            scaling: { stageMultiplier: 3.0, eliteBonus: 0.8, bossBonus: 1.0 }
        }
    },
    statIcons: {
        health: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
        speed: `<svg class="icon" viewBox="0 0 24 24"><path d="M15.58 11.5l-3.5-3.5a1 1 0 00-1.41 1.41L12.17 11H5a1 1 0 000 2h7.17l-1.5 1.5a1 1 0 101.41 1.41l3.5-3.5c.19-.2.3-.45.3-.71s-.11-.51-.3-.71zM19 3a1 1 0 00-1 1v16a1 1 0 002 0V4a1 1 0 00-1-1z"/></svg>`,
        power: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21L12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/></svg>`,
        frequency: `<svg class="icon" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`,
        area: `<svg class="icon" viewBox="0 0 24 24"><path d="M3 11h2v2H3v-2zm2-2h2v2H5V9zm2-2h2v2H7V7zM3 3h2v2H3V3zm16 0h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm-4 4h2v2h-2v-2zM7 17h2v2H7v-2zm-2 2h2v2H5v-2zm-2-4h2v2H3v-2zm16-4h2v2h-2v-2zM15 5h2v2h-2V5zm-4 0h2v2h-2V5zm-4 0h2v2H7V5zM5 5h2v2H5V5zm8 12h2v2h-2v-2zm-4 0h2v2H9v-2zm-4 0h2v2H5v-2z"/></svg>`,
        luck: `<svg class="icon" viewBox="0 0 24 24"><path d="M16.29 5.71a1 1 0 00-1.41 0L12 8.59l-2.88-2.88a1 1 0 00-1.41 1.41L10.59 10l-2.88 2.88a1 1 0 101.41 1.41L12 11.41l2.88 2.88a1 1 0 001.41-1.41L13.41 10l2.88-2.88a1 1 0 000-1.41zM12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>`,
        xpGain: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 1L9 4h6l-3-3zm0 22l3-3H9l3 3zm7-11h-3v-2h3v2zm-4 2h-2v2h2v-2zm-2-4V8h-2v2h2zm-4 0V8H7v2h2zm-2 4h-2v2h2v-2zM7 8V6H5v2h2zm12-4h-2v2h2V4zm-2 14h-2v2h2v-2zm-4 0h-2v2h2v-2zm-4 0H7v2h2v-2zm-4-4H3v2h2v-2z"/></svg>`,
        defense: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"/></svg>`
    }
};

const Utils = {
    getDistance: (obj1, obj2) => {
        const dx = obj1.x - obj2.x; const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    },
    findNearest: (from, targets, range = Infinity) => {
        let nearest = null; let minDist = range;
        for (const target of targets) {
            if (target.toRemove) continue;
            const dist = Utils.getDistance(from, target);
            if (dist < minDist) { minDist = dist; nearest = target; }
        }
        return nearest;
    },
    drawJaggedLine: (ctx,x1,y1,x2,y2,segments) => {
        ctx.beginPath(); ctx.moveTo(x1,y1);
        const dx=x2-x1, dy=y2-y1, dist=Math.sqrt(dx*dx+dy*dy);
        for(let i=1; i<segments; i++){
            const t=i/segments, tx=x1+dx*t, ty=y1+dy*t, offset=(Math.random()-0.5)*(dist/segments)*2;
            ctx.lineTo(tx-dy/dist*offset,ty+dx/dist*offset);
        }
        ctx.lineTo(x2,y2); ctx.stroke();
    },
    drawPolygon: (ctx, x, y, radius, sides, angle = 0, color = 'red') => {
        ctx.save();
        ctx.fillStyle = color; ctx.beginPath();
        ctx.moveTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
        for (let i = 1; i <= sides; i++) {
            ctx.lineTo(x + radius * Math.cos(angle + i * 2 * Math.PI / sides), y + radius * Math.sin(angle + i * 2 * Math.PI / sides));
        }
        ctx.closePath(); ctx.fill();
        ctx.restore();
    },
    
    // Funzioni per disegnare sprite nemici dettagliati
    drawEnemySprite: (ctx, x, y, radius, type, color, isElite = false) => {
        ctx.save();
        
        switch(type) {
            case 'circle':
                Utils.drawSlimeSprite(ctx, x, y, radius, color, isElite);
                break;
            case 'triangle':
                Utils.drawGoblinSprite(ctx, x, y, radius, color, isElite);
                break;
            case 'square':
                Utils.drawGolemSprite(ctx, x, y, radius, color, isElite);
                break;
            case 'diamond':
                Utils.drawIceSprite(ctx, x, y, radius, color, isElite);
                break;
            case 'star':
                Utils.drawDemonSprite(ctx, x, y, radius, color, isElite);
                break;
            default:
                Utils.drawSlimeSprite(ctx, x, y, radius, color, isElite);
        }
        
        ctx.restore();
    },
    
    drawSlimeSprite: (ctx, x, y, radius, color, isElite) => {
        // Corpo principale - forma più irregolare e minacciosa
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Bordo scuro e minaccioso
        ctx.strokeStyle = isElite ? '#ff0000' : '#1a1a1a';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Occhi demoniaci rossi
        const eyeSize = radius * 0.25;
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.2, eyeSize, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.3, y - radius * 0.2, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupille nere e vuote
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.2, eyeSize * 0.6, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.3, y - radius * 0.2, eyeSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Bocca con denti affilati
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x, y + radius * 0.3, radius * 0.4, 0, Math.PI);
        ctx.fill();
        
        // Denti affilati
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 3; i++) {
            const toothX = x - radius * 0.2 + i * radius * 0.2;
            ctx.beginPath();
            ctx.moveTo(toothX, y + radius * 0.3);
            ctx.lineTo(toothX - 2, y + radius * 0.5);
            ctx.lineTo(toothX + 2, y + radius * 0.5);
            ctx.closePath();
            ctx.fill();
        }
        
        // Effetti elite - aura demoniaca
        if (isElite) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
            ctx.stroke();
            
            // Fiamme demoniache
            ctx.fillStyle = '#ff6600';
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI * 2) / 4;
                const fx = x + Math.cos(angle) * (radius + 6);
                const fy = y + Math.sin(angle) * (radius + 6);
                
                ctx.beginPath();
                ctx.moveTo(fx, fy);
                ctx.lineTo(fx + Math.cos(angle - 0.2) * 8, fy + Math.sin(angle - 0.2) * 8);
                ctx.lineTo(fx + Math.cos(angle + 0.2) * 8, fy + Math.sin(angle + 0.2) * 8);
                ctx.closePath();
                ctx.fill();
            }
        }
    },
    
    drawGoblinSprite: (ctx, x, y, radius, color, isElite) => {
        // Corpo - forma più spigolosa e minacciosa
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y - radius);
        ctx.lineTo(x - radius * 0.9, y + radius * 0.6);
        ctx.lineTo(x + radius * 0.9, y + radius * 0.6);
        ctx.closePath();
        ctx.fill();
        
        // Bordo scuro
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Occhi demoniaci arancioni
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.1, radius * 0.25, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.3, y - radius * 0.1, radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupille nere
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.1, radius * 0.15, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.3, y - radius * 0.1, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // Bocca con zanne più grandi e affilate
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x, y + radius * 0.2, radius * 0.4, 0, Math.PI);
        ctx.fill();
        
        // Zanne più grandi e minacciose
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(x - radius * 0.25, y + radius * 0.1);
        ctx.lineTo(x - radius * 0.15, y + radius * 0.4);
        ctx.lineTo(x - radius * 0.35, y + radius * 0.4);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x + radius * 0.25, y + radius * 0.1);
        ctx.lineTo(x + radius * 0.15, y + radius * 0.4);
        ctx.lineTo(x + radius * 0.35, y + radius * 0.4);
        ctx.closePath();
        ctx.fill();
        
        // Zanna centrale
        ctx.beginPath();
        ctx.moveTo(x, y + radius * 0.1);
        ctx.lineTo(x - 3, y + radius * 0.35);
        ctx.lineTo(x + 3, y + radius * 0.35);
        ctx.closePath();
        ctx.fill();
        
        if (isElite) {
            // Aura demoniaca
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(x, y - radius - 4);
            ctx.lineTo(x - radius * 0.9, y + radius * 0.6 + 4);
            ctx.lineTo(x + radius * 0.9, y + radius * 0.6 + 4);
            ctx.closePath();
            ctx.stroke();
            
            // Fiamme
            ctx.fillStyle = '#ff6600';
            for (let i = 0; i < 3; i++) {
                const angle = (i * Math.PI * 2) / 3;
                const fx = x + Math.cos(angle) * (radius + 5);
                const fy = y + Math.sin(angle) * (radius + 5);
                
                ctx.beginPath();
                ctx.moveTo(fx, fy);
                ctx.lineTo(fx + Math.cos(angle - 0.3) * 10, fy + Math.sin(angle - 0.3) * 10);
                ctx.lineTo(fx + Math.cos(angle + 0.3) * 10, fy + Math.sin(angle + 0.3) * 10);
                ctx.closePath();
                ctx.fill();
            }
        }
    },
    
    drawGolemSprite: (ctx, x, y, radius, color, isElite) => {
        // Corpo principale - più squadrato e minaccioso
        ctx.fillStyle = color;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        
        // Bordo scuro
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - radius, y - radius, radius * 2, radius * 2);
        
        // Occhi rossi e minacciosi
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(x - radius * 0.4, y - radius * 0.3, radius * 0.35, radius * 0.35);
        ctx.fillRect(x + radius * 0.05, y - radius * 0.3, radius * 0.35, radius * 0.35);
        
        // Pupille nere
        ctx.fillStyle = '#000000';
        ctx.fillRect(x - radius * 0.3, y - radius * 0.2, radius * 0.15, radius * 0.15);
        ctx.fillRect(x + radius * 0.15, y - radius * 0.2, radius * 0.15, radius * 0.15);
        
        // Bocca con denti
        ctx.fillStyle = '#000000';
        ctx.fillRect(x - radius * 0.4, y + radius * 0.2, radius * 0.8, radius * 0.15);
        
        // Denti
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 4; i++) {
            const toothX = x - radius * 0.3 + i * radius * 0.2;
            ctx.fillRect(toothX, y + radius * 0.2, 4, 8);
        }
        
        // Dettagli pietra - più scuri e minacciosi
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - radius * 0.6, y);
        ctx.lineTo(x + radius * 0.6, y);
        ctx.moveTo(x, y - radius * 0.6);
        ctx.lineTo(x, y + radius * 0.6);
        ctx.stroke();
        
        // Fessure minacciose
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - radius * 0.4, y - radius * 0.1);
        ctx.lineTo(x + radius * 0.4, y - radius * 0.1);
        ctx.moveTo(x - radius * 0.4, y + radius * 0.1);
        ctx.lineTo(x + radius * 0.4, y + radius * 0.1);
        ctx.stroke();
        
        if (isElite) {
            // Aura di pietra demoniaca
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 5;
            ctx.strokeRect(x - radius - 3, y - radius - 3, radius * 2 + 6, radius * 2 + 6);
            
            // Cristalli di energia
            ctx.fillStyle = '#ff6600';
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI * 2) / 4;
                const cx = x + Math.cos(angle) * (radius + 8);
                const cy = y + Math.sin(angle) * (radius + 8);
                
                ctx.beginPath();
                ctx.moveTo(cx, cy - 4);
                ctx.lineTo(cx + 4, cy);
                ctx.lineTo(cx, cy + 4);
                ctx.lineTo(cx - 4, cy);
                ctx.closePath();
                ctx.fill();
            }
        }
    },
    
    drawIceSprite: (ctx, x, y, radius, color, isElite) => {
        // Corpo principale - diamante più affilato
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y - radius);
        ctx.lineTo(x + radius * 0.8, y - radius * 0.4);
        ctx.lineTo(x + radius * 0.8, y + radius * 0.4);
        ctx.lineTo(x, y + radius);
        ctx.lineTo(x - radius * 0.8, y + radius * 0.4);
        ctx.lineTo(x - radius * 0.8, y - radius * 0.4);
        ctx.closePath();
        ctx.fill();
        
        // Bordo ghiacciato
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Occhi di ghiaccio - più freddi e minacciosi
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.2, radius * 0.25, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.3, y - radius * 0.2, radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupille nere
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.2, radius * 0.15, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.3, y - radius * 0.2, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // Cristalli di ghiaccio più affilati
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI * 2) / 4;
            const cx = x + Math.cos(angle) * radius * 0.9;
            const cy = y + Math.sin(angle) * radius * 0.9;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * radius * 0.4, cy + Math.sin(angle) * radius * 0.4);
            ctx.stroke();
        }
        
        // Cristalli interni
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            const angle = (i * Math.PI * 2) / 3;
            const cx = x + Math.cos(angle) * radius * 0.5;
            const cy = y + Math.sin(angle) * radius * 0.5;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * radius * 0.3, cy + Math.sin(angle) * radius * 0.3);
            ctx.stroke();
        }
        
        if (isElite) {
            // Aura di ghiaccio demoniaco
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(x, y - radius - 4);
            ctx.lineTo(x + radius * 0.8, y - radius * 0.4);
            ctx.lineTo(x + radius * 0.8, y + radius * 0.4);
            ctx.lineTo(x, y + radius + 4);
            ctx.lineTo(x - radius * 0.8, y + radius * 0.4);
            ctx.lineTo(x - radius * 0.8, y - radius * 0.4);
            ctx.closePath();
            ctx.stroke();
            
            // Tempesta di ghiaccio
            ctx.fillStyle = '#00ffff';
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI * 2) / 6;
                const fx = x + Math.cos(angle) * (radius + 6);
                const fy = y + Math.sin(angle) * (radius + 6);
                
                ctx.beginPath();
                ctx.moveTo(fx, fy);
                ctx.lineTo(fx + Math.cos(angle - 0.2) * 6, fy + Math.sin(angle - 0.2) * 6);
                ctx.lineTo(fx + Math.cos(angle + 0.2) * 6, fy + Math.sin(angle + 0.2) * 6);
                ctx.closePath();
                ctx.fill();
            }
        }
    },
    
    drawDemonSprite: (ctx, x, y, radius, color, isElite) => {
        // Corpo principale - stella più affilata e minacciosa
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const outerRadius = radius;
            const innerRadius = radius * 0.4;
            
            if (i === 0) {
                ctx.moveTo(x + Math.cos(angle) * outerRadius, y + Math.sin(angle) * outerRadius);
            } else {
                ctx.lineTo(x + Math.cos(angle) * outerRadius, y + Math.sin(angle) * outerRadius);
            }
            
            const nextAngle = ((i + 0.5) * Math.PI * 2) / 5 - Math.PI / 2;
            ctx.lineTo(x + Math.cos(nextAngle) * innerRadius, y + Math.sin(nextAngle) * innerRadius);
        }
        ctx.closePath();
        ctx.fill();
        
        // Bordo demoniaco
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Occhi demoniaci - più grandi e minacciosi
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.2, radius * 0.3, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.3, y - radius * 0.2, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupille nere e vuote
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.2, radius * 0.2, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.3, y - radius * 0.2, radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Fiamme demoniache più intense
        ctx.fillStyle = '#ff6600';
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const fx = x + Math.cos(angle) * radius * 0.9;
            const fy = y + Math.sin(angle) * radius * 0.9;
            
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(fx + Math.cos(angle - 0.4) * radius * 0.5, fy + Math.sin(angle - 0.4) * radius * 0.5);
            ctx.lineTo(fx + Math.cos(angle + 0.4) * radius * 0.5, fy + Math.sin(angle + 0.4) * radius * 0.5);
            ctx.closePath();
            ctx.fill();
        }
        
        // Fiamme interne
        ctx.fillStyle = '#ff0000';
        for (let i = 0; i < 3; i++) {
            const angle = (i * Math.PI * 2) / 3;
            const fx = x + Math.cos(angle) * radius * 0.6;
            const fy = y + Math.sin(angle) * radius * 0.6;
            
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(fx + Math.cos(angle - 0.3) * radius * 0.3, fy + Math.sin(angle - 0.3) * radius * 0.3);
            ctx.lineTo(fx + Math.cos(angle + 0.3) * radius * 0.3, fy + Math.sin(angle + 0.3) * radius * 0.3);
            ctx.closePath();
            ctx.fill();
        }
        
        if (isElite) {
            // Aura demoniaca intensa
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 5;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
                const outerRadius = radius + 4;
                const innerRadius = (radius + 4) * 0.4;
                
                if (i === 0) {
                    ctx.moveTo(x + Math.cos(angle) * outerRadius, y + Math.sin(angle) * outerRadius);
                } else {
                    ctx.lineTo(x + Math.cos(angle) * outerRadius, y + Math.sin(angle) * outerRadius);
                }
                
                const nextAngle = ((i + 0.5) * Math.PI * 2) / 5 - Math.PI / 2;
                ctx.lineTo(x + Math.cos(nextAngle) * innerRadius, y + Math.sin(nextAngle) * innerRadius);
            }
            ctx.closePath();
            ctx.stroke();
            
            // Tempesta di fuoco
            ctx.fillStyle = '#ff6600';
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI * 2) / 8;
                const fx = x + Math.cos(angle) * (radius + 8);
                const fy = y + Math.sin(angle) * (radius + 8);
                
                ctx.beginPath();
                ctx.moveTo(fx, fy);
                ctx.lineTo(fx + Math.cos(angle - 0.4) * 12, fy + Math.sin(angle - 0.4) * 12);
                ctx.lineTo(fx + Math.cos(angle + 0.4) * 12, fy + Math.sin(angle + 0.4) * 12);
                ctx.closePath();
                ctx.fill();
            }
        }
    }
};

// ################# ENTITY CLASSES ##################

class Entity { constructor(x, y) { this.x = x; this.y = y; this.toRemove = false; } update(game) {} draw(ctx, game) {} }

class Player extends Entity {
    constructor() { super(CONFIG.world.width / 2, CONFIG.world.height / 2); this.baseStats = { ...CONFIG.player.base }; this.keys = {}; this.initStats(); }
    initStats() {
        this.level = 1; 
        this.xp = 0;
        this.xpNext = CONFIG.player.xpCurve.base;
        
        // Controllo di sicurezza per xpNext
        if (this.xpNext <= 0) this.xpNext = 1;
        
        this.powerUpTimers = { invincibility: 0, damageBoost: 0, lifesteal: 0 };
        this.stats = { ...this.baseStats };
        this.modifiers = { power: 1, frequency: 1, area: 1, xpGain: 1, luck: 0, contactBurn: false, contactSlow: false };
        this.hp = this.stats.maxHp;
        this.archetype = CONFIG.characterArchetypes.standard; // Default
        
        // Inizializza l'inventario dei materiali
        this.materials = {};
    }
    resetForNewRun(permUpgrades, archetypeId) {
        this.x = CONFIG.world.width / 2; 
        this.y = CONFIG.world.height / 2;
        this.initStats();
        this.archetype = CONFIG.characterArchetypes[archetypeId];
        
        this.applyPermanentUpgrades(permUpgrades);
        
        if (this.archetype) {
            switch(this.archetype.id) {
                case 'steel':
                    this.stats.dr += 0.7;
                    this.stats.speed *= 0.75;
                    break;
                case 'magma':
                    this.modifiers.contactBurn = true;
                    this.modifiers.frequency *= 1.05;
                    break;
                case 'frost':
                    this.stats.maxHp -= 8;
                    this.modifiers.contactSlow = true;
                    break;
                case 'shadow':
                    this.stats.speed *= 1.18;
                    this.stats.maxHp *= 0.92;
                    break;
                case 'tech':
                    this.modifiers.area *= 1.15;
                    this.modifiers.power *= 0.97;
                    break;
            }
        }
        
        this.hp = this.stats.maxHp;
        
        // I materiali NON vengono resettati - persistono tra le run
        if (!this.materials) {
            this.materials = {};
        }
        
        // Controlli di sicurezza finali per XP
        if (this.xp < 0) this.xp = 0;
        if (this.xpNext <= 0) this.xpNext = 1;
        if (this.level < 1) this.level = 1;
        
        console.log(`Reset completato - Livello: ${this.level}, XP: ${this.xp}, XP necessario: ${this.xpNext}`);
    }
    applyPermanentUpgrades(p) { this.stats.maxHp = this.baseStats.hp + (p.health.level * 10); this.stats.speed = this.baseStats.speed + (p.speed.level * 0.1); this.stats.dr = (p.defense.level * 0.01); this.modifiers.xpGain = 1 + (p.xpGain.level * 0.05); this.modifiers.luck = p.luck.level * 0.02; this.modifiers.power = 1 + (p.power.level * 0.05); this.modifiers.frequency = 1 - (p.frequency.level * 0.03); this.modifiers.area = 1 + (p.area.level * 0.04); }
    update(game, joystick) { let kDx = 0, kDy = 0; if (this.keys['KeyW'] || this.keys['ArrowUp']) kDy -= 1; if (this.keys['KeyS'] || this.keys['ArrowDown']) kDy += 1; if (this.keys['KeyA'] || this.keys['ArrowLeft']) kDx -= 1; if (this.keys['KeyD'] || this.keys['ArrowRight']) kDx += 1; let fDx = joystick.dx !== 0 ? joystick.dx : kDx; let fDy = joystick.dy !== 0 ? joystick.dy : kDy; const m = Math.sqrt(fDx * fDx + fDy * fDy); if (m > 1) { fDx /= m; fDy /= m; } this.x += fDx * this.stats.speed; this.y += fDy * this.stats.speed; this.x = Math.max(this.stats.radius, Math.min(CONFIG.world.width - this.stats.radius, this.x)); this.y = Math.max(this.stats.radius, Math.min(CONFIG.world.height - this.stats.radius, this.y)); for (const key in this.powerUpTimers) { if (this.powerUpTimers[key] > 0) this.powerUpTimers[key]--; } }
    
    gainXP(amount) {
        this.xp += amount * this.modifiers.xpGain;
    }

    levelUp() {
        this.level++;
        this.xp -= this.xpNext;
        const c = CONFIG.player.xpCurve;
        // Calcolo più robusto per xpNext con controlli di sicurezza
        const baseXP = c.base * Math.pow(c.growth, this.level - 1);
        const levelXP = c.levelFactor * this.level;
        this.xpNext = Math.max(1, Math.floor(baseXP + levelXP));
        
        // Controllo di sicurezza per evitare valori negativi
        if (this.xp < 0) this.xp = 0;
        if (this.xpNext <= 0) this.xpNext = 1;
        
        this.hp = this.stats.maxHp;
        this.powerUpTimers.invincibility = 120;
    }

    takeDamage(amount, game, sourceEnemy = null) {
        const shieldSpell = game.spells.shield;
        if ((shieldSpell && shieldSpell.active && shieldSpell.evolution !== 'reflect') || this.powerUpTimers.invincibility > 0) return;
        
        let damageReduction = this.stats.dr;
        // Penetrazione DR del 10% da elite e boss
        if (sourceEnemy && (sourceEnemy.stats.isElite || sourceEnemy instanceof Boss)) {
            damageReduction = Math.max(0, damageReduction - 0.10);
        }
        if (shieldSpell && shieldSpell.active && shieldSpell.evolution === 'reflect') {
            damageReduction += shieldSpell.dr;
            if(sourceEnemy) { sourceEnemy.takeDamage(amount * shieldSpell.reflectDamage, game); }
        }
        
        const finalDamage = amount * (1 - damageReduction);
        this.hp -= finalDamage;
        if (this.hp <= 0) game.gameOver();
    }
    draw(ctx, game) {
        // Disegna l'archetipo del giocatore
        if(this.archetype && this.archetype.draw) {
            this.archetype.draw(ctx, this);
        } else {
            CONFIG.characterArchetypes.standard.draw(ctx, this);
        }

        // MODIFICA: Barra HP più visibile e sempre dentro il canvas
        const barWidth = this.stats.radius * 2.7;
        const barHeight = 8;
        const offsetY = this.stats.radius + 22; // Più in basso
        const barX = this.x - barWidth / 2;
        const barY = Math.max(8, this.y - offsetY); // Mai sopra il bordo canvas

        // Sfondo della barra
        ctx.fillStyle = 'rgba(30, 30, 30, 0.95)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Barra della salute effettiva
        const healthPercentage = Math.max(0, this.hp / this.stats.maxHp);
        const healthBarWidth = barWidth * healthPercentage;
        ctx.fillStyle = `rgba(80, 255, 80, 1)`;
        ctx.fillRect(barX, barY, healthBarWidth, barHeight);

        // Bordo della barra
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        // FINE MODIFICA

        // Disegna scudo se attivo
        const shieldSpell = game.spells.shield;
        if ((shieldSpell && shieldSpell.active) || this.powerUpTimers.invincibility > 0) {
            const shieldRadius = this.stats.radius + 8 + Math.sin(Date.now() / 200) * 3;
            const alpha = this.powerUpTimers.invincibility > 0 ? (this.powerUpTimers.invincibility % 60 < 30 ? 0.9 : 0.5) : 0.8;
            ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`; ctx.fillStyle = `rgba(255, 255, 0, ${alpha/4})`; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(this.x, this.y, shieldRadius, 0, Math.PI * 2); ctx.stroke(); ctx.fill();
        }
    }
}

class Enemy extends Entity {
    constructor(x, y, stats) {
        super(x, y); this.stats = stats; this.hp = this.stats.hp; this.slowTimer = 0;
        this.stunTimer = 0; this.color = `hsl(${Math.random() * 60}, 70%, 50%)`;
        this.spawnImmunityTimer = CONFIG.enemies.spawnImmunity; this.isDead = false;
    }
    update(game) {
        if (this.spawnImmunityTimer > 0) { this.spawnImmunityTimer--; }
        if (this.stunTimer > 0) { this.stunTimer--; return; }
        if (this.slowTimer > 0) { this.slowTimer--; }
        const player = game.player; const angle = Math.atan2(player.y - this.y, player.x - this.x);
        const currentSpeed = this.stats.speed * (this.slowTimer > 0 ? (1 - (this.slowAmount || 0.5)) : 1);
        this.x += Math.cos(angle) * currentSpeed; this.y += Math.sin(angle) * currentSpeed;
        if (Utils.getDistance(this, player) < this.stats.radius + player.stats.radius) {
            player.takeDamage(this.stats.damage, game, this);
            
            if (player.modifiers.contactBurn) {
                this.takeDamage(2, game); 
            }
            if (player.modifiers.contactSlow) {
                this.slowTimer = 60; 
                this.slowAmount = 0.3;
            }

            const kAngle = Math.atan2(this.y - player.y, this.x - player.x);
            this.x += Math.cos(kAngle) * 20; this.y += Math.sin(kAngle) * 20;
        }
    }
    takeDamage(amount, game) {
        if (this.isDead || this.spawnImmunityTimer > 0) return;
        const finalDamage = amount * (1 - (this.stats.dr || 0));
        this.hp -= finalDamage;
        if (game.player.powerUpTimers.lifesteal > 0 && game.spells.heal.lifestealPercent > 0) {
            const healedAmount = finalDamage * game.spells.heal.lifestealPercent;
            game.player.hp = Math.min(game.player.stats.maxHp, game.player.hp + healedAmount);
        }
        if (this.hp <= 0) { this.isDead = true; this.onDeath(game); this.toRemove = true; }
    }
    onDeath(game) {
        game.enemiesKilled++;
        game.enemiesKilledSinceBoss++;
        game.score += Math.floor(this.stats.maxHp);
        game.addEntity('xpOrbs', new XpOrb(this.x, this.y, this.stats.xp));
        
        // Drop di gemme
        if (Math.random() < 0.1 + game.player.modifiers.luck) {
            game.addEntity('gemOrbs', new GemOrb(this.x, this.y, 1 + (Math.random() < game.player.modifiers.luck ? 1 : 0)));
        }
        
        // Drop di materiali
        this.dropMaterials(game);
        
        for (let j = 0; j < 8; j++) {
            game.addEntity('particles', new Particle(this.x, this.y, { vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 20, color: this.color }));
        }
    }
    
    dropMaterials(game) {
        const unlockedMaterials = game.getUnlockedMaterials();
        const enemyType = this.stats.isElite ? 'elite' : (this instanceof Boss ? 'boss' : 'normal');
        
        // Controlla ogni tipo di materiale sbloccato per il drop
        unlockedMaterials.forEach(materialType => {
            const materialInfo = CONFIG.materialTypes[materialType];
            const dropRate = game.getMaterialDropRate(materialType, enemyType);
            
            if (Math.random() < dropRate) {
                // Posizione casuale vicino al nemico
                const offsetX = (Math.random() - 0.5) * 40;
                const offsetY = (Math.random() - 0.5) * 40;
                
                game.addEntity('materialOrbs', new MaterialOrb(
                    this.x + offsetX, 
                    this.y + offsetY, 
                    materialType
                ));
            }
        });
    }
    draw(ctx, game) {
        ctx.save();
        if (this.spawnImmunityTimer > 0) {
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 50) * 0.2;
        }

        // Ottieni i colori dello stage corrente
        const stageInfo = CONFIG.stages[game.currentStage];
        let baseColor = this.color;
        let eliteColor = '#ff4500';
        
        if (stageInfo && stageInfo.enemies) {
            baseColor = this.stats.isElite ? stageInfo.enemies.eliteColor : stageInfo.enemies.baseColor;
            eliteColor = stageInfo.enemies.eliteColor;
        }
        
        // Determina il colore finale
        let finalColor = this.stats.isElite ? eliteColor : (this.stunTimer > 0 ? '#ffffff' : (this.slowTimer > 0 ? '#66b2ff' : baseColor));
        
        // Determina la forma/tipo di nemico
        const shape = stageInfo && stageInfo.enemies ? stageInfo.enemies.shape : 'triangle';
        
        // Usa i nuovi sprite dettagliati
        Utils.drawEnemySprite(ctx, this.x, this.y, this.stats.radius, shape, finalColor, this.stats.isElite);
        
        ctx.restore();

        // Barra HP
        if (this.hp < this.stats.maxHp) {
            const barW = this.stats.radius * 2;
            const barH = 4;
            const x = this.x - barW / 2;
            const y = this.y - this.stats.radius - 8;
            ctx.fillStyle = 'rgba(255,0,0,0.7)';
            ctx.fillRect(x, y, barW, barH);
            ctx.fillStyle = 'rgba(0,255,0,0.7)';
            ctx.fillRect(x, y, barW * (this.hp / this.stats.maxHp), barH);
        }
    }
}
class Boss extends Enemy {
    constructor(x, y, stats) { super(x, y, stats); this.color = '#8e44ad'; this.lastAttack = 0; }
    update(game) {
        super.update(game);
        if (this.spawnImmunityTimer > 0) return; 
        const now = Date.now();
        if (now - this.lastAttack > CONFIG.boss.attack.cooldown) {
            const angleToPlayer = Math.atan2(game.player.y - this.y, game.player.x - this.x);
            game.addEntity('enemyProjectiles', new Projectile(this.x, this.y, {
                angle: angleToPlayer, speed: CONFIG.boss.attack.projectileSpeed,
                damage: this.stats.damage, radius: CONFIG.boss.attack.projectileRadius,
                life: 300, color: '#ff5555'
            }));
            this.lastAttack = now;
        }
    }
    onDeath(game) {
        super.onDeath(game);
        // Incrementa il contatore dei boss uccisi nello stage corrente
        game.bossesKilledThisStage++;
        // Cura il giocatore del 50% HP max
        game.player.hp = Math.min(game.player.stats.maxHp, game.player.hp + game.player.stats.maxHp * 0.5);
        // Bonus gemme
        game.gemsThisRun += 50;
        // Mostra popup scelta upgrade passivo extra (overcap)
        game.showBossUpgradePopup();
    }
    draw(ctx) {
        ctx.save();
        if (this.spawnImmunityTimer > 0) {
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 50) * 0.2;
        }
        ctx.fillStyle = this.color; ctx.strokeStyle = '#ff00ff'; ctx.lineWidth = 4;
        Utils.drawPolygon(ctx, this.x, this.y, this.stats.radius, 6, Date.now() / 1000); ctx.stroke();
        Utils.drawPolygon(ctx, this.x, this.y, this.stats.radius * 0.7, 6, -Date.now() / 800, 'rgba(255,255,255,0.5)');
        ctx.restore();
        const barW = this.stats.radius * 2, barH = 8, x = this.x - barW / 2, y = this.y - this.stats.radius - 15;
        ctx.fillStyle = '#ff0000'; ctx.fillRect(x, y, barW, barH);
        ctx.fillStyle = '#00ff00'; ctx.fillRect(x, y, barW * (this.hp / this.stats.maxHp), barH);
    }
}

class Projectile extends Entity {
    constructor(x, y, props) {
        super(x, y);
        if (props.angle !== undefined) {
            this.vx = Math.cos(props.angle) * props.speed; this.vy = Math.sin(props.angle) * props.speed;
        }
        Object.assign(this, props); this.penetrated = 0;
    }
    update(game) {
        this.x += this.vx; this.y += this.vy; this.life--;
        if (this.life <= 0) this.toRemove = true;
        if (this.leavesTrail && this.life % 4 === 0) { game.addEntity('fireTrails', new FireTrail(this.x, this.y, { radius: (this.size || 0) * 0.7, damage: this.burnDamage })); }
        const targets = [...game.entities.enemies, ...game.entities.bosses];
        for (const target of targets) {
            if (Utils.getDistance(this, target) < target.stats.radius + (this.size || this.radius)) {
                target.takeDamage(this.damage, game);
                if (this.slow) { target.slowAmount = this.slow; target.slowTimer = this.slowDuration; }
                if (this.stunChance && Math.random() < this.stunChance) { target.stunTimer = this.stunDuration; }
                this.penetrated++;
                if (this.penetrated >= this.penetration) {
                    if (this.onDeathEffect === 'explosion') game.createExplosion(this.x, this.y, this.explosionRadius, this.damage / 2);
                    if (this.type !== 'great_fireball' && this.type !== 'lightning_spear') this.toRemove = true;
                    break;
                }
            }
        }
    }
    draw(ctx) {
        if (this.drawFunc) { this.drawFunc(ctx, this); }
        else {
            ctx.fillStyle = this.color || '#ffaa00'; ctx.beginPath();
            ctx.arc(this.x, this.y, this.size || this.radius, 0, Math.PI * 2); ctx.fill();
        }
    }
}
class Aura extends Entity {
    constructor(x, y, props) { super(x, y); Object.assign(this, props); this.affectedEnemies = new Map(); }
    update(game) {
        this.life--; if (this.life <= 0) this.toRemove = true;
        this.x = game.player.x; this.y = game.player.y;
        const targets = [...game.entities.enemies, ...game.entities.bosses];
        for(const target of targets) {
            if (Utils.getDistance(this, target) < this.radius + target.stats.radius) {
                if (!this.affectedEnemies.has(target)) { this.affectedEnemies.set(target, {tick: 0}); }
                const enemyData = this.affectedEnemies.get(target);
                enemyData.tick = (enemyData.tick + 1) % this.tickRate;
                if(enemyData.tick === 0) {
                    target.takeDamage(this.dps, game);
                }
                target.slowAmount = this.slowAmount;
                target.slowTimer = Math.max(target.slowTimer, 2);
            }
        }
    }
    draw(ctx) { const opacity = this.life > 30 ? 0.4 : (this.life / 30) * 0.4; const g = ctx.createRadialGradient(this.x, this.y, this.radius * 0.2, this.x, this.y, this.radius); g.addColorStop(0, `rgba(173, 216, 230, ${opacity * 0.5})`); g.addColorStop(1, `rgba(100, 149, 237, ${opacity})`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI); ctx.fill(); }
}
class Orbital extends Entity {
    constructor(x, y, props) { super(x,y); this.angle = props.angle; this.distance = props.distance; this.rotationSpeed = props.rotationSpeed; this.damage = props.damage; this.radius = props.radius; }
    update(game) {
        this.angle += this.rotationSpeed;
        this.x = game.player.x + Math.cos(this.angle) * this.distance;
        this.y = game.player.y + Math.sin(this.angle) * this.distance;

        [...game.entities.enemies, ...game.entities.bosses].forEach(enemy => {
            if (Utils.getDistance(this, enemy) < this.radius + enemy.stats.radius) {
                enemy.takeDamage(this.damage / 60, game); // Damage per frame
            }
        });
        game.entities.enemyProjectiles.forEach(proj => {
            if (Utils.getDistance(this, proj) < this.radius + (proj.radius || proj.size)) {
                proj.toRemove = true;
            }
        });
    }
    draw(ctx) { ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#4a90e2'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
}
class StaticField extends Entity {
    constructor(x, y, props) { super(x, y); Object.assign(this, props); this.tick = 0; }
    update(game) {
        this.life--; if (this.life <= 0) this.toRemove = true;
        this.tick++;
        if (this.tick % this.tickRate === 0) {
            const targets = [...game.entities.enemies, ...game.entities.bosses].filter(e => Utils.getDistance(this, e) < this.radius);
            if (targets.length > 0) {
                const target = targets[Math.floor(Math.random() * targets.length)];
                target.takeDamage(this.damage, game);
                game.addEntity('effects', new Effect(0, 0, { type: 'lightning_chain', from: { x: this.x, y: this.y }, to: { x: target.x, y: target.y }, life: 10, initialLife: 10 }));
            }
        }
    }
    draw(ctx) { const opacity = this.life > 30 ? 0.3 : (this.life / 30) * 0.3; ctx.strokeStyle = `rgba(255, 255, 0, ${opacity * 2})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI); ctx.stroke(); }
}
class Sanctuary extends Entity {
    constructor(x, y, props) { super(x, y); Object.assign(this, props); }
    update(game) {
        this.life--; if (this.life <= 0) this.toRemove = true;
        if(Utils.getDistance(this, game.player) < this.radius) {
            game.player.hp = Math.min(game.player.stats.maxHp, game.player.hp + this.hps / 60);
        }
    }
    draw(ctx) { const opacity = this.life > 30 ? 0.3 : (this.life / 30) * 0.3; const g = ctx.createRadialGradient(this.x, this.y, 1, this.x, this.y, this.radius); g.addColorStop(0, `rgba(255, 253, 208, ${opacity})`); g.addColorStop(1, `rgba(240, 230, 140, 0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI); ctx.fill(); }
}
class XpOrb extends Entity {
    constructor(x,y,value) { super(x,y); this.value = value; }
    update(game) {
        const player = game.player;
        const pickupRadius = CONFIG.xpOrbs.pickupRadius * (1 + (player.modifiers.area - 1) * 0.5);
        const dist = Utils.getDistance(this, player);
        if (dist < pickupRadius) {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            const speed = Math.max(4, (pickupRadius - dist) * 0.1);
            this.x += Math.cos(angle) * speed; this.y += Math.sin(angle) * speed;
        }
        if (dist < 20) {
            player.gainXP(this.value);
            this.toRemove = true;
        }
    }
    draw(ctx) { ctx.fillStyle = '#00ff88'; ctx.beginPath(); ctx.arc(this.x, this.y, 6, 0, Math.PI * 2); ctx.fill(); }
}
class GemOrb extends Entity {
    constructor(x,y,value) { super(x,y); this.value = value; }
    update(game) {
        const player = game.player;
        const dist = Utils.getDistance(this, player);
        if (dist < 120) {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            this.x += Math.cos(angle) * 5; this.y += Math.sin(angle) * 5;
        }
        if (dist < 20) { game.gemsThisRun += this.value; this.toRemove = true; }
    }
    draw(ctx) {
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(Date.now()/500);
        ctx.fillStyle = '#72f5f5'; ctx.strokeStyle = 'white'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(7, 0); ctx.lineTo(0, 7); ctx.lineTo(-7, 0);
        ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    }
}

class MaterialOrb extends Entity {
    constructor(x, y, materialType) { 
        super(x, y); 
        this.materialType = materialType; 
        this.life = 900; // Durata più lunga dei materiali
        this.bobOffset = Math.random() * Math.PI * 2; // Offset casuale per l'animazione
    }
    
    update(game) {
        this.life--;
        if (this.life <= 0) {
            this.toRemove = true;
            return;
        }
        
        const dist = Utils.getDistance(game.player, this);
        if (dist < game.player.stats.radius + 12) {
            // Aggiungi il materiale all'inventario del giocatore
            if (!game.player.materials) {
                game.player.materials = {};
            }
            
            if (!game.player.materials[this.materialType]) {
                game.player.materials[this.materialType] = 0;
            }
            
            game.player.materials[this.materialType]++;
            
            // Salva automaticamente i materiali
            game.saveGameData();
            
            const materialInfo = CONFIG.materialTypes[this.materialType];
            game.notifications.push({ 
                text: `+1 ${materialInfo.name}`, 
                life: 180,
                color: this.getRarityColor(materialInfo.rarity)
            });
            
            // Controlla se questo materiale ha sbloccato nuovi materiali
            game.checkMaterialUnlocks(this.materialType);
            
            this.toRemove = true;
        }
    }
    
    getRarityColor(rarity) {
        switch(rarity) {
            case 'common': return '#ffffff';
            case 'uncommon': return '#00ff00';
            case 'rare': return '#0080ff';
            case 'epic': return '#8000ff';
            case 'legendary': return '#ff8000';
            default: return '#ffffff';
        }
    }
    
    draw(ctx) {
        const materialInfo = CONFIG.materialTypes[this.materialType];
        const opacity = this.life > 60 ? 1.0 : Math.max(0, this.life / 60);
        
        ctx.save();
        ctx.globalAlpha = opacity;
        
        // Animazione di fluttuazione
        const bob = Math.sin(Date.now() / 300 + this.bobOffset) * 4;
        
        // Disegna il materiale con forma e colore specifici
        ctx.fillStyle = materialInfo.color;
        ctx.strokeStyle = this.getRarityColor(materialInfo.rarity);
        ctx.lineWidth = 2;
        
        // Forma diversa per rarità diverse
        switch(materialInfo.rarity) {
            case 'common':
                // Cerchio semplice
                ctx.beginPath();
                ctx.arc(this.x, this.y + bob, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                break;
                
            case 'uncommon':
                // Quadrato
                ctx.fillRect(this.x - 6, this.y + bob - 6, 12, 12);
                ctx.strokeRect(this.x - 6, this.y + bob - 6, 12, 12);
                break;
                
            case 'rare':
                // Diamante
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + bob - 8);
                ctx.lineTo(this.x + 6, this.y + bob);
                ctx.lineTo(this.x, this.y + bob + 8);
                ctx.lineTo(this.x - 6, this.y + bob);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
                
            case 'epic':
                // Stella a 5 punte
                this.drawStar(ctx, this.x, this.y + bob, 8, 5);
                break;
                
            case 'legendary':
                // Stella a 8 punte con bagliore
                ctx.shadowColor = materialInfo.color;
                ctx.shadowBlur = 10;
                this.drawStar(ctx, this.x, this.y + bob, 10, 8);
                ctx.shadowBlur = 0;
                break;
        }
        
        ctx.restore();
    }
    
    drawStar(ctx, x, y, radius, points) {
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const r = i % 2 === 0 ? radius : radius * 0.5;
            const px = x + Math.cos(angle) * r;
            const py = y + Math.sin(angle) * r;
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}
class Chest extends Entity {
    constructor(x,y) { super(x,y); this.size = CONFIG.chest.size; }
    update(game) {
        const dist = Utils.getDistance(game.player, {x: this.x + this.size/2, y: this.y + this.size/2});
        if (dist < game.player.stats.radius + this.size) {
            const itemKeys = Object.keys(CONFIG.itemTypes).filter(k => k !== 'LEGENDARY_ORB');
            const randomType = itemKeys[Math.floor(Math.random() * itemKeys.length)];
            game.addEntity('droppedItems', new DroppedItem(this.x + this.size / 2, this.y - 10, randomType));
            if (Math.random() < 0.5 + game.player.modifiers.luck) {
                let c = CONFIG.chest.gemDrop;
                let gemsFound = c.min + Math.floor(Math.random() * c.random * (1 + game.player.modifiers.luck));
                game.gemsThisRun += gemsFound;
            }
            this.toRemove = true;
        }
    }
    draw(ctx) {
        ctx.fillStyle = '#8B4513'; ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.x + this.size * 0.3, this.y - this.size * 0.2, this.size * 0.4, this.size*0.4);
        ctx.fillRect(this.x + this.size * 0.4, this.y + this.size * 0.4, this.size*0.2, this.size*0.3);
    }
}
class DroppedItem extends Entity {
    constructor(x,y,type) { super(x,y); this.type = type; this.life = 600; }
    update(game) {
        this.life--; if (this.life <= 0) this.toRemove = true;
        const dist = Utils.getDistance(game.player, this);
        if (dist < game.player.stats.radius + 10) { game.applyItemEffect(this); this.toRemove = true; }
    }
    draw(ctx) {
        const itemInfo = CONFIG.itemTypes[this.type]; ctx.save();
        ctx.globalAlpha = this.life > 60 ? 1.0 : Math.max(0, this.life / 60);
        const bob = Math.sin(Date.now()/200 + this.x) * 3;
        ctx.fillStyle = itemInfo.color; ctx.beginPath();
        ctx.arc(this.x, this.y + bob, 10, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    }
}
class Particle extends Entity {
    constructor(x, y, props) { super(x,y); Object.assign(this, props); }
    update() { this.x += this.vx; this.y += this.vy; this.life--; if (this.life <= 0) this.toRemove = true; }
    draw(ctx) {
        ctx.globalAlpha = this.life / 30; ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(this.x, this.y, 3, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    }
}
class FireTrail extends Entity {
    constructor(x,y,props) { super(x,y); this.radius = props.radius; this.damage = props.damage; this.life = 60; this.initialLife = 60;}
    update(game) {
        this.life--; if (this.life <= 0) this.toRemove = true;
        [...game.entities.enemies, ...game.entities.bosses].forEach(enemy => {
            if (Utils.getDistance(enemy, this) < enemy.stats.radius + this.radius) { enemy.takeDamage(this.damage / 60, game); }
        });
    }
    draw(ctx) {
        ctx.globalAlpha = (this.life / this.initialLife) * 0.7;
        const g = ctx.createRadialGradient(this.x, this.y, 1, this.x, this.y, this.radius);
        g.addColorStop(0, 'rgba(255, 150, 0, 0.8)'); g.addColorStop(1, 'rgba(255, 50, 0, 0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
    }
}
class Effect extends Entity {
    constructor(x,y,props) { super(x,y); Object.assign(this, props); }
    update() { this.life--; if (this.life <= 0) this.toRemove = true; }
    draw(ctx) {
        const opacity = this.life / this.initialLife;
        if (this.type === 'emp_wave' || this.type === 'explosion' || this.type === 'level_up_burst') {
            const currentRadius = this.maxRadius * (1 - opacity); let color = this.color || '136,170,255';
            if (this.type === 'explosion' && !this.color) color = '255,150,0'; if (this.type === 'level_up_burst' && !this.color) color = '255,215,0';
            ctx.strokeStyle=`rgba(${color},${opacity})`; ctx.lineWidth=5;
            ctx.beginPath(); ctx.arc(this.x,this.y,currentRadius,0,Math.PI*2); ctx.stroke();
        } else if (this.type === 'lightning_chain') {
            ctx.strokeStyle = `rgba(255,255,0,${opacity})`; ctx.lineWidth = Math.random() * 3 + 2;
            Utils.drawJaggedLine(ctx, this.from.x, this.from.y, this.to.x, this.to.y, 10);
        } else if (this.type === 'meteor_indicator') {
            ctx.strokeStyle=`rgba(${this.color || '255,100,0'},${1 - opacity})`; ctx.lineWidth=3;
            ctx.beginPath(); ctx.arc(this.x,this.y,this.radius,0,Math.PI*2); ctx.stroke();
        }
    }
}


class BallSurvivalGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId); this.ctx = this.canvas.getContext('2d');
        this.initDOM();
        this.initInputHandlers();
        this.camera = { x: 0, y: 0, width: this.canvas.width, height: this.canvas.height };
        this.player = new Player();
        this.joystick = { dx: 0, dy: 0, ...this.dom.joystick };
        this.state = 'startScreen'; 
        this.selectedArchetype = 'standard';
        this.selectedStage = 1; // Stage selezionato dal giocatore
        this.lastFrameTime = 0; 
        this.totalElapsedTime = 0; 
        this.menuCooldown = 0;
        this.loadGameData(); 
        this.loadStageProgress(); // Carica la progressione degli stage
        this.resetRunState(); 
        this.resizeCanvas();
        this.populateCharacterSelection();
        this.populateStageSelection();
        this.showPopup('start');
    }

    initDOM() {
        this.dom = {
            gameContainer: document.getElementById('gameContainer'),
            popups: { start: document.getElementById('startScreen'), pause: document.getElementById('pauseMenu'), gameOver: document.getElementById('gameOver'), upgrade: document.getElementById('upgradeMenu'), shop: document.getElementById('permanentUpgradeShop') },
            buttons: { start: document.getElementById('startGameBtn'), restart: document.getElementById('restartGameBtn'), restartFromPause: document.getElementById('restartFromPauseBtn'), pause: document.getElementById('pauseButton'), load: document.getElementById('loadGameBtn'), copy: document.getElementById('copyCodeBtn'), generateDebugSave: document.getElementById('generateDebugSave'), copyDebugCodeBtn: document.getElementById('copyDebugCodeBtn'), returnToMenu: document.getElementById('returnToMenuBtn'), returnToMenuPause: document.getElementById('returnToMenuPauseBtn') },
            inputs: { saveCode: document.getElementById('saveCodeOutput'), loadCode: document.getElementById('loadCodeInput'), debugSaveOutput: document.getElementById('debugSaveOutput') },
            containers: { 
                debugSaveContainer: document.getElementById('debugSaveContainer'),
                characterSelectionContainer: document.getElementById('characterSelectionContainer'),
                stageSelectionContainer: document.getElementById('stageSelectionContainer'),
                permanentUpgradeOptions: document.getElementById('permanentUpgradeOptions'),
                upgradeOptions: document.getElementById('upgradeOptions'),
                pauseStatsContainer: document.getElementById('pauseStatsContainer'),
                runStatsContainer: document.getElementById('runStatsContainer')
            },
            joystick: { container: document.getElementById('joystick-container'), stick: document.getElementById('joystick-stick'), active: false, radius: 60, touchId: null },
            menuOverlay: document.getElementById('menuOverlay'),
            totalGemsShop: document.getElementById('totalGemsShop'),
            playerStatsColumn: document.getElementById('playerStatsColumn'),
            weaponsStatsColumn: document.getElementById('weaponsStatsColumn'),
            loadNotification: document.getElementById('load-notification'),
            inGameUI: {
                container: document.getElementById('inGameUI'),
                timer: document.getElementById('gameTimer'),
                xpBarFill: document.getElementById('xpBarFill'),
                xpBarText: document.getElementById('xpBarText'),
                gemCounter: document.getElementById('gemCounter')
            }
        };
    }
    initInputHandlers() {
        window.addEventListener('resize', () => this.resizeCanvas());
        this.dom.buttons.start.onclick = () => this.startGame();
        this.dom.buttons.restart.onclick = () => this.startGame();
        this.dom.buttons.restartFromPause.onclick = () => this.startGame();
        this.dom.buttons.pause.onclick = () => this.togglePause();
        this.dom.buttons.copy.onclick = () => this.copySaveCode();
        this.dom.buttons.load.onclick = () => this.loadFromSaveCode();
        this.dom.buttons.generateDebugSave.onclick = () => this.generateAndShowDebugCode();
        this.dom.buttons.copyDebugCodeBtn.onclick = () => this.copyDebugCode();
        this.dom.buttons.returnToMenu.onclick = () => this.returnToStartScreen();
        this.dom.buttons.returnToMenuPause.onclick = () => this.returnToStartScreen();
        
        // Pulsante chiudi negozio
        const closeShopBtn = document.getElementById('closeShopBtn');
        if (closeShopBtn) {
            closeShopBtn.onclick = () => this.hideAllPopups();
        }
        
        // Tasto pausa mobile
        const pauseBtnMobile = document.getElementById('pauseButtonMobile');
        if (pauseBtnMobile) {
            pauseBtnMobile.onclick = () => this.togglePause();
        }

        this.dom.menuOverlay.onclick = () => {
            if (this.state === 'gameOver' || this.state === 'startScreen') {
                return; 
            }
            this.hideAllPopups();
        };

        Object.values(this.dom.popups).forEach(p => p.addEventListener('click', e => e.stopPropagation()));
        document.addEventListener('keydown', (e) => {
            this.player.keys[e.code] = true;
            if (e.code === 'Escape') this.handleEscapeKey();
            if (e.code === 'KeyE') this.handleInteractionKey();
        });
        document.addEventListener('keyup', (e) => { this.player.keys[e.code] = false; });
        this.canvas.addEventListener('pointerdown', this.handlePointerDown.bind(this));
        this.canvas.addEventListener('pointermove', this.handlePointerMove.bind(this));
        this.canvas.addEventListener('pointerup', this.handlePointerEnd.bind(this));
        this.canvas.addEventListener('pointercancel', this.handlePointerEnd.bind(this));
    }
    startGame(isLoadedRun = false) {
        if (!isLoadedRun) {
            this.resetRunState();
            this.currentStage = this.selectedStage; // Inizia con lo stage selezionato
            this.player.resetForNewRun(this.permanentUpgrades, this.selectedArchetype);

            const archetype = CONFIG.characterArchetypes[this.selectedArchetype];
            if (archetype && archetype.startingWeapon && this.spells[archetype.startingWeapon]) {
                this.spells[archetype.startingWeapon].level = 1;
            } else {
                 this.spells.magicMissile.level = 1;
            }
        }
        this.hideAllPopups(true); 
        this.dom.inGameUI.container.style.display = 'flex';
        this.dom.buttons.pause.style.display = 'flex';
        this.state = 'running'; 
        this.lastFrameTime = performance.now();
        
        // Mostra i materiali già sbloccati all'inizio della run
        this.showUnlockedMaterialsOnStart();
        
        if (!this.gameLoopId) this.gameLoop();
    }
    gameOver() {
        if (this.state === 'gameOver') return;

        this.state = 'gameOver'; 
        this.totalGems += this.gemsThisRun; 
        this.saveGameData();
        document.getElementById('survivalTime').textContent = Math.floor(this.totalElapsedTime);
        document.getElementById('enemiesKilled').textContent = this.enemiesKilled;
        document.getElementById('gemsEarned').textContent = this.gemsThisRun;
        document.getElementById('finalScore').textContent = this.score;
        this.dom.inputs.saveCode.value = this.generateSaveCode();
        this.dom.buttons.pause.style.display = 'none';
        this.dom.inGameUI.container.style.display = 'none';
        this.hideAllPopups(true); 
        this.showPopup('gameOver');
    }
    resetRunState() {
        this.entities = { enemies: [], bosses: [], projectiles: [], enemyProjectiles: [], xpOrbs: [], gemOrbs: [], materialOrbs: [], particles: [], effects: [], chests: [], droppedItems: [], fireTrails: [], auras: [], orbitals: [], staticFields: [], sanctuaries: [] };
        this.notifications = []; this.score = 0; this.enemiesKilled = 0; this.gemsThisRun = 0;
        this.totalElapsedTime = 0; this.enemiesKilledSinceBoss = 0;
        this.nextChestSpawnTime = CONFIG.chest.spawnTime; this.nextMapXpSpawnTime = 5;
        this.lastEnemySpawnTime = 0; 
        this.difficultyTier = 0;
        this.currentStage = 1;
        this.stageStartTime = 0; // Tempo di inizio dello stage corrente
        this.bossesKilledThisStage = 0; // Boss uccisi nello stage corrente
        this.resetSpells();
    }
    gameLoop() {
        this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
        const now = performance.now(); const deltaTime = (now - this.lastFrameTime) / 1000;
        if (this.state === 'running') {
            this.totalElapsedTime += deltaTime;
            if (this.menuCooldown > 0) this.menuCooldown--;
            this.update(deltaTime);
            this.updateInGameUI();
        }
        this.draw(); 
        this.lastFrameTime = now;
    }
    update(deltaTime) {
        if (this.state !== 'running') return; // Non aggiornare nulla se non in gioco
        this.player.update(this, this.joystick); 
        this.updateCamera();
        this.checkStage();
        for (const type in this.entities) {
            for (let i = this.entities[type].length - 1; i >= 0; i--) {
                const entity = this.entities[type][i];
                entity.update(this);
                if (entity.toRemove) this.entities[type].splice(i, 1);
            }
        }
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            this.notifications[i].life--;
            if (this.notifications[i].life <= 0) this.notifications.splice(i, 1);
        }
        this.spawnEnemies(); 
        this.spawnBoss(); 
        this.spawnChests(); 
        this.spawnMapXpOrbs();
        this.castSpells();
        this.checkForLevelUp(); // Spostato qui per coerenza
    }
    
    draw() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        this.drawBackground();
        this.entities.fireTrails.forEach(e => e.draw(this.ctx, this));
        this.entities.sanctuaries.forEach(e => e.draw(this.ctx, this));
        this.entities.staticFields.forEach(e => e.draw(this.ctx, this));
        this.entities.xpOrbs.forEach(e => e.draw(this.ctx, this));
        this.entities.gemOrbs.forEach(e => e.draw(this.ctx, this));
        this.entities.materialOrbs.forEach(e => e.draw(this.ctx, this));
        this.entities.chests.forEach(e => e.draw(this.ctx, this));
        this.entities.droppedItems.forEach(e => e.draw(this.ctx, this));
        this.entities.enemies.forEach(e => e.draw(this.ctx, this));
        this.entities.bosses.forEach(e => e.draw(this.ctx, this));
        this.player.draw(this.ctx, this);
        this.entities.projectiles.forEach(e => e.draw(this.ctx, this));
        this.entities.enemyProjectiles.forEach(e => e.draw(this.ctx, this));
        this.entities.auras.forEach(e => e.draw(this.ctx, this));
        this.entities.orbitals.forEach(e => e.draw(this.ctx, this));
        this.entities.particles.forEach(e => e.draw(this.ctx, this));
        this.entities.effects.forEach(e => e.draw(this.ctx, this));
        this.drawMerchant();
        this.ctx.restore();
        this.drawOffscreenIndicators();
        this.drawNotifications();
    }
    
    drawBackground() {
        const stageInfo = CONFIG.stages[this.currentStage];
        if (!stageInfo) return;
        
        // Sfondo base
        this.ctx.fillStyle = stageInfo.background.color;
        this.ctx.fillRect(0, 0, CONFIG.world.width, CONFIG.world.height);
        
        // Griglia o pattern specifico dello stage
        this.ctx.strokeStyle = stageInfo.background.gridColor;
        this.ctx.lineWidth = 2;
        
        switch (stageInfo.background.pattern) {
            case 'grid':
                // Griglia standard
                for (let x = 0; x < CONFIG.world.width; x += CONFIG.world.gridSize) {
                    this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, CONFIG.world.height); this.ctx.stroke();
                }
                for (let y = 0; y < CONFIG.world.height; y += CONFIG.world.gridSize) {
                    this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(CONFIG.world.width, y); this.ctx.stroke();
                }
                break;
            case 'forest':
                // Pattern foresta - alberi stilizzati
                for (let x = 0; x < CONFIG.world.width; x += CONFIG.world.gridSize * 2) {
                    for (let y = 0; y < CONFIG.world.height; y += CONFIG.world.gridSize * 2) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(x, y + 20);
                        this.ctx.lineTo(x - 10, y);
                        this.ctx.lineTo(x + 10, y);
                        this.ctx.closePath();
                        this.ctx.stroke();
                    }
                }
                break;
            case 'desert':
                // Pattern deserto - dune
                for (let x = 0; x < CONFIG.world.width; x += CONFIG.world.gridSize) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, CONFIG.world.height);
                    this.ctx.quadraticCurveTo(x + 50, CONFIG.world.height - 30, x + 100, CONFIG.world.height);
                    this.ctx.stroke();
                }
                break;
            case 'ice':
                // Pattern ghiaccio - cristalli
                for (let x = 0; x < CONFIG.world.width; x += CONFIG.world.gridSize) {
                    for (let y = 0; y < CONFIG.world.height; y += CONFIG.world.gridSize) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(x, y);
                        this.ctx.lineTo(x + 5, y - 10);
                        this.ctx.lineTo(x + 10, y);
                        this.ctx.lineTo(x + 5, y + 10);
                        this.ctx.closePath();
                        this.ctx.stroke();
                    }
                }
                break;
            case 'cosmic':
                // Pattern cosmico - stelle
                for (let x = 0; x < CONFIG.world.width; x += CONFIG.world.gridSize) {
                    for (let y = 0; y < CONFIG.world.height; y += CONFIG.world.gridSize) {
                        if (Math.random() < 0.3) {
                            this.ctx.beginPath();
                            this.ctx.arc(x + Math.random() * 20, y + Math.random() * 20, 1, 0, Math.PI * 2);
                            this.ctx.fill();
                        }
                    }
                }
                break;
        }
    }
    addEntity(type, entity) { if (this.entities[type]) this.entities[type].push(entity); }
    
    checkStage() {
        // Controlla se è il momento di cambiare stage automaticamente
        const nextStage = this.currentStage + 1;
        if (CONFIG.stages[nextStage] && this.totalElapsedTime >= CONFIG.stages[nextStage].time) {
            this.changeStage(nextStage);
        }
        
        // Controlla se gli stage possono essere sbloccati
        this.checkStageUnlocks();
    }
    
    changeStage(newStage) {
        this.currentStage = newStage;
        this.stageStartTime = this.totalElapsedTime;
        this.bossesKilledThisStage = 0;
        
        const stageInfo = CONFIG.stages[newStage];
        this.notifications.push({ text: `STAGE ${newStage}: ${stageInfo.message}`, life: 400 });
        
        // Effetto visivo di transizione
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.addEntity('particles', new Particle(
                    Math.random() * CONFIG.world.width, 
                    Math.random() * CONFIG.world.height, 
                    { vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, life: 60, color: stageInfo.background.color }
                ));
            }, i * 50);
        }
    }
    
    checkStageUnlocks() {
        Object.keys(CONFIG.stages).forEach(stageId => {
            const stage = CONFIG.stages[stageId];
            if (!stage.unlocked && stage.unlockRequirement) {
                if (this.checkUnlockRequirement(stage.unlockRequirement)) {
                    stage.unlocked = true;
                    this.notifications.push({ 
                        text: `🎉 NUOVO STAGE SBLOCCATO: ${stage.name}!`, 
                        life: 500 
                    });
                    this.saveStageProgress();
                }
            }
        });
    }
    
    checkUnlockRequirement(requirement) {
        switch (requirement.type) {
            case 'survival':
                // Sopravvivi X secondi in uno stage specifico
                return this.totalElapsedTime >= requirement.time;
                
            case 'boss_kill':
                // Uccidi X boss in uno stage specifico
                return this.bossesKilledThisStage >= requirement.count;
                
            case 'level':
                // Raggiungi livello X in uno stage specifico
                return this.player.level >= requirement.level;
                
            case 'total_time':
                // Tempo totale di gioco
                return this.totalElapsedTime >= requirement.time;
                
            default:
                return false;
        }
    }
    
    saveStageProgress() {
        try {
            const stageProgress = {};
            Object.keys(CONFIG.stages).forEach(stageId => {
                stageProgress[stageId] = CONFIG.stages[stageId].unlocked;
            });
            localStorage.setItem('ballSurvivalStageProgress', JSON.stringify(stageProgress));
        } catch (e) {
            console.error("Impossibile salvare la progressione degli stage:", e);
        }
    }
    
    loadStageProgress() {
        try {
            const savedProgress = localStorage.getItem('ballSurvivalStageProgress');
            if (savedProgress) {
                const stageProgress = JSON.parse(savedProgress);
                Object.keys(stageProgress).forEach(stageId => {
                    if (CONFIG.stages[stageId]) {
                        CONFIG.stages[stageId].unlocked = stageProgress[stageId];
                    }
                });
            }
        } catch (e) {
            console.error("Impossibile caricare la progressione degli stage:", e);
        }
    }

    // Mostra i materiali già sbloccati all'inizio della run
    showUnlockedMaterialsOnStart() {
        const unlockedMaterials = this.getUnlockedMaterials();
        // Mostra una notifica per ogni materiale sbloccato
        unlockedMaterials.forEach(materialType => {
            const materialInfo = CONFIG.materialTypes[materialType];
            const rarityColor = this.getRarityColor(materialInfo.rarity);
            this.notifications.push({
                text: `📦 ${materialInfo.name} disponibile`,
                life: 180,
                color: rarityColor
            });
        });
        // Se ci sono materiali sbloccati, mostra una notifica generale
        if (unlockedMaterials.length > 0) {
            this.notifications.push({
                text: `🔓 ${unlockedMaterials.length} materiali sbloccati`,
                life: 240,
                color: '#00ff00'
            });
        }
    }

    // Gestione tasti e input
    handleEscapeKey() {
        const anyPopupOpen = Object.values(this.dom.popups).some(p => p.style.display === 'flex');
        if (anyPopupOpen && this.state !== 'startScreen' && this.state !== 'gameOver') {
            this.hideAllPopups();
        } else {
            this.togglePause();
        }
    }

    handleInteractionKey() {
        if (this.menuCooldown > 0 || this.state !== 'running') return;
        if (Utils.getDistance(this.player, CONFIG.merchant) < CONFIG.merchant.interactionRadius) {
            this.showPopup('shop');
        }
    }

    handlePointerDown(e) {
        if (this.state === 'gameOver' || this.state === 'startScreen') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;
        const worldX = (clientX - rect.left) * (this.canvas.width / rect.width) + this.camera.x;
        const worldY = (clientY - rect.top) * (this.canvas.height / rect.height) + this.camera.y;
        
        if (this.state === 'running' && Utils.getDistance({x: worldX, y: worldY}, CONFIG.merchant) < CONFIG.merchant.interactionRadius) {
            this.showPopup('shop');
            return;
        }
        
        if (e.pointerType === 'touch' && !this.joystick.active) {
            e.preventDefault();
            this.joystick.touchId = e.pointerId;
            this.joystick.active = true;
            this.joystick.startX = clientX;
            this.joystick.startY = clientY;
            this.dom.joystick.container.style.display = 'block';
            this.dom.joystick.container.style.left = `${clientX - this.dom.joystick.radius}px`;
            this.dom.joystick.container.style.top = `${clientY - this.dom.joystick.radius}px`;
        }
    }

    handlePointerMove(e) {
        if (!this.joystick.active || e.pointerId !== this.joystick.touchId) return;
        
        e.preventDefault();
        let deltaX = e.clientX - this.joystick.startX;
        let deltaY = e.clientY - this.joystick.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = this.dom.joystick.radius;
        
        if (distance > maxDistance) {
            deltaX = (deltaX / distance) * maxDistance;
            deltaY = (deltaY / distance) * maxDistance;
        }
        
        this.dom.joystick.stick.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        this.joystick.dx = deltaX / maxDistance;
        this.joystick.dy = deltaY / maxDistance;
    }

    handlePointerEnd(e) {
        if (this.joystick.active && e.pointerId === this.joystick.touchId) {
            this.joystick.active = false;
            this.joystick.touchId = null;
            this.dom.joystick.stick.style.transform = 'translate(0px, 0px)';
            this.dom.joystick.container.style.display = 'none';
            this.joystick.dx = 0;
            this.joystick.dy = 0;
        }
    }
}

// Stato runtime degli archetipi acquistati (non salvato in localStorage)
let unlockedArchetypes = new Set(['standard']);

let game;
window.addEventListener('DOMContentLoaded', () => { 
    game = new BallSurvivalGame('gameCanvas'); 
});