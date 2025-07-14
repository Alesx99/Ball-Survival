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
    statIcons: {
        health: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
        speed: `<svg class="icon" viewBox="0 0 24 24"><path d="M15.58 11.5l-3.5-3.5a1 1 0 00-1.41 1.41L12.17 11H5a1 1 0 000 2h7.17l-1.5 1.5a1 1 0 101.41 1.41l3.5-3.5c.19-.2.3-.45.3-.71s-.11-.51-.3-.71zM19 3a1 1 0 00-1 1v16a1 1 0 002 0V4a1 1 0 00-1-1z"/></svg>`,
        power: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21L12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/></svg>`,
        frequency: `<svg class="icon" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`,
        area: `<svg class="icon" viewBox="0 0 24 24"><path d="M3 11h2v2H3v-2zm2-2h2v2H5V9zm2-2h2v2H7V7zM3 3h2v2H3V3zm16 0h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm-4 4h2v2h-2v-2zM7 17h2v2H7v-2zm-2 2h2v2H5v-2zm-2-4h2v2H3v-2zm16-4h2v2h-2v-2zM15 5h2v2h-2V5zm-4 0h2v2h-2V5zm-4 0h2v2H7V5zM5 5h2v2H5V5zm8 12h2v2h-2v-2zm-4 0h2v2H9v-2zm-4 0h2v2H5v-2z"/></svg>`,
        luck: `<svg class="icon" viewBox="0 0 24 24"><path d="M16.29 5.71a1 1 0 00-1.41 0L12 8.59l-2.88-2.88a1 1 0 00-1.41 1.41L10.59 10l-2.88 2.88a1 1 0 101.41 1.41L12 11.41l2.88 2.88a1 1 0 001.41-1.41L13.41 10l2.88-2.88a1 1 0 000-1.41zM12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>`,
        xpGain: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 1L9 4h6l-3-3zm0 22l3-3H9l3 3zm7-11h-3v-2h3v2zm-4 2h-2v2h2v-2zm-2-4V8h-2v2h2zm-4 0V8H7v2h2zm-2 4h-2v2h2v-2zM7 8V6H5v2h2zm12-4h-2v2h2V4zm-2 14h-2v2h2v-2zm-4 0h-2v2h2v-2zm-4 0H7v2h2v-2zm-4-4H3v2h2v-2z"/></svg>`,
        defense: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"/></svg>`
    },
    // Sistema di Materiali con Rarità
    materials: {
        // Materiali Comuni (Rarità 1)
        common: {
            'IRON_ORE': { 
                name: "Minerale di Ferro", 
                color: '#8B7355', 
                desc: "Minerale comune utilizzato per armi base.",
                rarity: 1,
                baseDropChance: 0.15,
                stageMultiplier: 1.0
            },
            'WOOD': { 
                name: "Legno", 
                color: '#8B4513', 
                desc: "Legno resistente per impugnature.",
                rarity: 1,
                baseDropChance: 0.12,
                stageMultiplier: 1.0
            },
            'STONE': { 
                name: "Pietra", 
                color: '#696969', 
                desc: "Pietra solida per armi pesanti.",
                rarity: 1,
                baseDropChance: 0.10,
                stageMultiplier: 1.0
            },
            'LEATHER': { 
                name: "Cuoio", 
                color: '#D2691E', 
                desc: "Cuoio flessibile per protezioni.",
                rarity: 1,
                baseDropChance: 0.08,
                stageMultiplier: 1.0
            }
        },
        // Materiali Rari (Rarità 2)
        rare: {
            'SILVER_ORE': { 
                name: "Minerale d'Argento", 
                color: '#C0C0C0', 
                desc: "Argento prezioso per armi magiche.",
                rarity: 2,
                baseDropChance: 0.06,
                stageMultiplier: 1.2
            },
            'MAGIC_CRYSTAL': { 
                name: "Cristallo Magico", 
                color: '#9370DB', 
                desc: "Cristallo che irradia energia magica.",
                rarity: 2,
                baseDropChance: 0.05,
                stageMultiplier: 1.3
            },
            'ENCHANTED_WOOD': { 
                name: "Legno Incantato", 
                color: '#228B22', 
                desc: "Legno che brilla di magia antica.",
                rarity: 2,
                baseDropChance: 0.04,
                stageMultiplier: 1.2
            },
            'MYTHRIL_FRAGMENT': { 
                name: "Frammento di Mithril", 
                color: '#4169E1', 
                desc: "Lega leggendaria per armi supreme.",
                rarity: 2,
                baseDropChance: 0.03,
                stageMultiplier: 1.4
            }
        },
        // Materiali Epici (Rarità 3)
        epic: {
            'GOLD_ORE': { 
                name: "Minerale d'Oro", 
                color: '#FFD700', 
                desc: "Oro puro per armi divine.",
                rarity: 3,
                baseDropChance: 0.025,
                stageMultiplier: 1.5
            },
            'DRAGON_SCALE': { 
                name: "Squama di Drago", 
                color: '#DC143C', 
                desc: "Squama indurita di drago antico.",
                rarity: 3,
                baseDropChance: 0.02,
                stageMultiplier: 1.6
            },
            'PHOENIX_FEATHER': { 
                name: "Piuma di Fenice", 
                color: '#FF4500', 
                desc: "Piuma che brucia di fuoco eterno.",
                rarity: 3,
                baseDropChance: 0.015,
                stageMultiplier: 1.7
            },
            'VOID_ESSENCE': { 
                name: "Essenza del Vuoto", 
                color: '#4B0082', 
                desc: "Essenza che piega la realtà.",
                rarity: 3,
                baseDropChance: 0.01,
                stageMultiplier: 1.8
            }
        },
        // Materiali Leggendari (Rarità 4)
        legendary: {
            'DIAMOND_CORE': { 
                name: "Nucleo di Diamante", 
                color: '#00FFFF', 
                desc: "Diamante puro che irradia potere.",
                rarity: 4,
                baseDropChance: 0.005,
                stageMultiplier: 2.0
            },
            'CELESTIAL_STEEL': { 
                name: "Acciaio Celestiale", 
                color: '#FF69B4', 
                desc: "Metallo forgiato nelle stelle.",
                rarity: 4,
                baseDropChance: 0.003,
                stageMultiplier: 2.2
            },
            'TIME_SHARD': { 
                name: "Scheggia del Tempo", 
                color: '#FF00FF', 
                desc: "Frammento che controlla il tempo.",
                rarity: 4,
                baseDropChance: 0.002,
                stageMultiplier: 2.5
            },
            'REALITY_FRAGMENT': { 
                name: "Frammento di Realtà", 
                color: '#FFFFFF', 
                desc: "Pezzo della realtà stessa.",
                rarity: 4,
                baseDropChance: 0.001,
                stageMultiplier: 3.0
            }
        }
    },
    // Configurazione del sistema di drop
    materialDrop: {
        // Bonus per materiali già raccolti (diminuisce la probabilità di drop)
        collectedPenalty: {
            1: 0.1,  // -10% per materiali comuni già raccolti
            2: 0.15, // -15% per materiali rari già raccolti
            3: 0.2,  // -20% per materiali epici già raccolti
            4: 0.25  // -25% per materiali leggendari già raccolti
        },
        // Bonus per nemici elite
        eliteMultiplier: 2.0,
        // Bonus per boss
        bossMultiplier: 5.0,
        // Bonus per stage avanzati
        stageBonus: 0.1, // +10% per ogni stage
        // Probabilità base di drop materiale
        baseMaterialChance: 0.3
    },
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
        
        // Inizializza il sistema di materiali se non esiste
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
    update(game, joystick) { 
        // Controllo di sicurezza per le statistiche
        if (!this.stats || !this.stats.speed || !this.stats.radius) {
            console.warn('Player stats non inizializzate correttamente');
            return;
        }
        
        let kDx = 0, kDy = 0; 
        if (this.keys['KeyW'] || this.keys['ArrowUp']) kDy -= 1; 
        if (this.keys['KeyS'] || this.keys['ArrowDown']) kDy += 1; 
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) kDx -= 1; 
        if (this.keys['KeyD'] || this.keys['ArrowRight']) kDx += 1; 
        
        // Controllo di sicurezza per il joystick
        if (!joystick) {
            console.warn('Joystick non fornito al player update');
            return;
        }
        
        // Assicurati che dx e dy siano numeri validi
        const joystickDx = typeof joystick.dx === 'number' ? joystick.dx : 0;
        const joystickDy = typeof joystick.dy === 'number' ? joystick.dy : 0;
        
        let fDx = joystickDx !== 0 ? joystickDx : kDx; 
        let fDy = joystickDy !== 0 ? joystickDy : kDy; 
        
        const m = Math.sqrt(fDx * fDx + fDy * fDy); 
        if (m > 1) { 
            fDx /= m; 
            fDy /= m; 
        } 
        
        this.x += fDx * this.stats.speed; 
        this.y += fDy * this.stats.speed; 
        this.x = Math.max(this.stats.radius, Math.min(CONFIG.world.width - this.stats.radius, this.x)); 
        this.y = Math.max(this.stats.radius, Math.min(CONFIG.world.height - this.stats.radius, this.y)); 
        
        for (const key in this.powerUpTimers) { 
            if (this.powerUpTimers[key] > 0) this.powerUpTimers[key]--; 
        } 
    }
    
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

        // Sistema di drop materiali
        this.dropMaterials(game);

        // Particelle di morte
        for (let j = 0; j < 8; j++) {
            game.addEntity('particles', new Particle(this.x, this.y, { vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 20, color: this.color }));
        }
    }

    dropMaterials(game) {
        // Controllo di sicurezza per il sistema di materiali
        if (!game.player || !game.player.materials) {
            console.warn('Sistema materiali non inizializzato');
            return;
        }
        
        // Probabilità base di drop materiale
        let materialChance = CONFIG.materialDrop.baseMaterialChance;
        
        // Bonus per nemici elite
        if (this.stats.isElite) {
            materialChance *= CONFIG.materialDrop.eliteMultiplier;
        }
        
        // Bonus per stage avanzati
        const stageBonus = (game.currentStage - 1) * CONFIG.materialDrop.stageBonus;
        materialChance += stageBonus;
        
        // Bonus per fortuna del giocatore
        materialChance += game.player.modifiers.luck || 0;

        // Controlla se droppa un materiale
        if (Math.random() < materialChance) {
            const materialId = this.selectMaterialToDrop(game);
            if (materialId) {
                // Posizione casuale intorno al nemico
                const offsetX = (Math.random() - 0.5) * 40;
                const offsetY = (Math.random() - 0.5) * 40;
                game.addEntity('materialItems', new MaterialItem(this.x + offsetX, this.y + offsetY, materialId));
            }
        }
    }

    selectMaterialToDrop(game) {
        // Controllo di sicurezza per il sistema di materiali
        if (!game.player || !game.player.materials) {
            console.warn('Sistema materiali non inizializzato in selectMaterialToDrop');
            return null;
        }
        
        const allMaterials = [];
        
        // Raccogli tutti i materiali disponibili
        for (const [category, materials] of Object.entries(CONFIG.materials)) {
            for (const [materialId, materialInfo] of Object.entries(materials)) {
                allMaterials.push({ id: materialId, info: materialInfo, category });
            }
        }

        if (allMaterials.length === 0) return null;

        // Calcola probabilità per ogni materiale
        const materialProbabilities = allMaterials.map(material => {
            let probability = material.info.baseDropChance;
            
            // Moltiplicatore per stage
            probability *= material.info.stageMultiplier;
            
            // Penalità per materiali già raccolti
            if (game.player.materials && game.player.materials[material.id]) {
                const collectedCount = game.player.materials[material.id];
                const penalty = CONFIG.materialDrop.collectedPenalty[material.info.rarity] || 0;
                probability *= Math.pow(1 - penalty, collectedCount);
            }
            
            // Bonus per nemici elite
            if (this.stats.isElite) {
                probability *= CONFIG.materialDrop.eliteMultiplier;
            }
            
            // Bonus per fortuna
            probability *= (1 + (game.player.modifiers.luck || 0));
            
            return { material, probability };
        });

        // Seleziona materiale basato su probabilità
        const totalProbability = materialProbabilities.reduce((sum, item) => sum + item.probability, 0);
        let random = Math.random() * totalProbability;
        
        for (const item of materialProbabilities) {
            random -= item.probability;
            if (random <= 0) {
                return item.material.id;
            }
        }

        // Fallback: seleziona un materiale comune
        const commonMaterials = allMaterials.filter(m => m.info.rarity === 1);
        if (commonMaterials.length > 0) {
            return commonMaterials[Math.floor(Math.random() * commonMaterials.length)].id;
        }

        return null;
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

class MaterialItem extends Entity {
    constructor(x, y, materialId) {
        super(x, y);
        this.materialId = materialId;
        this.materialInfo = this.getMaterialInfo(materialId);
        this.life = 900; // Durata più lunga dei materiali
        this.bobOffset = Math.random() * Math.PI * 2;
        this.rotation = 0;
        this.glowIntensity = 0;
        this.pulseDirection = 1;
    }

    getMaterialInfo(materialId) {
        // Cerca il materiale in tutte le categorie
        for (const category of Object.values(CONFIG.materials)) {
            if (category[materialId]) {
                return category[materialId];
            }
        }
        return null;
    }

    update(game) {
        this.life--;
        if (this.life <= 0) {
            this.toRemove = true;
            return;
        }

        // Animazioni
        this.rotation += 0.02;
        this.glowIntensity += 0.1 * this.pulseDirection;
        if (this.glowIntensity >= 1 || this.glowIntensity <= 0) {
            this.pulseDirection *= -1;
        }

        // Controllo raccolta
        const dist = Utils.getDistance(game.player, this);
        if (dist < game.player.stats.radius + 15) {
            this.collectMaterial(game);
            this.toRemove = true;
        }
    }

    collectMaterial(game) {
        if (!this.materialInfo) return;

        // Aggiungi al inventario del giocatore
        if (!game.player.materials) {
            game.player.materials = {};
        }
        
        if (!game.player.materials[this.materialId]) {
            game.player.materials[this.materialId] = 0;
        }
        
        game.player.materials[this.materialId]++;

        // Salva automaticamente i materiali
        game.saveGameData();

        // Mostra notifica
        game.showNotification(`+1 ${this.materialInfo.name}`, this.materialInfo.color);

        // Effetti particellari
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const speed = 3 + Math.random() * 2;
            game.addEntity('particles', new Particle(
                this.x, 
                this.y, 
                { 
                    vx: Math.cos(angle) * speed, 
                    vy: Math.sin(angle) * speed, 
                    life: 30, 
                    color: this.materialInfo.color 
                }
            ));
        }
    }

    draw(ctx) {
        if (!this.materialInfo) return;

        ctx.save();
        
        // Calcola trasparenza basata sulla vita rimanente
        const alpha = this.life > 120 ? 1.0 : Math.max(0, this.life / 120);
        ctx.globalAlpha = alpha;

        // Posizione con effetto bob
        const bob = Math.sin(Date.now() / 300 + this.bobOffset) * 4;
        const drawX = this.x;
        const drawY = this.y + bob;

        // Effetto glow basato sulla rarità
        const glowRadius = 8 + this.materialInfo.rarity * 2;
        const glowAlpha = 0.3 + this.glowIntensity * 0.2;
        
        // Glow esterno
        ctx.globalAlpha = glowAlpha * alpha;
        ctx.fillStyle = this.materialInfo.color;
        ctx.beginPath();
        ctx.arc(drawX, drawY, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Corpo principale
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.materialInfo.color;
        ctx.beginPath();
        ctx.arc(drawX, drawY, 8, 0, Math.PI * 2);
        ctx.fill();

        // Bordo luminoso
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Effetto di rarità (stelle per leggendari, scintille per epici, etc.)
        if (this.materialInfo.rarity >= 3) {
            this.drawRarityEffect(ctx, drawX, drawY);
        }

        ctx.restore();
    }

    drawRarityEffect(ctx, x, y) {
        const time = Date.now() / 1000;
        
        if (this.materialInfo.rarity === 4) {
            // Effetto stellare per leggendari
            for (let i = 0; i < 4; i++) {
                const angle = time + (i * Math.PI / 2);
                const starX = x + Math.cos(angle) * 12;
                const starY = y + Math.sin(angle) * 12;
                
                ctx.fillStyle = '#FFFFFF';
                ctx.globalAlpha = 0.8 * Math.sin(time * 3 + i);
                ctx.beginPath();
                ctx.arc(starX, starY, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.materialInfo.rarity === 3) {
            // Effetto scintille per epici
            for (let i = 0; i < 3; i++) {
                const angle = time * 2 + (i * Math.PI * 2 / 3);
                const sparkX = x + Math.cos(angle) * 10;
                const sparkY = y + Math.sin(angle) * 10;
                
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 1;
                ctx.globalAlpha = 0.6 * Math.sin(time * 4 + i);
                ctx.beginPath();
                ctx.moveTo(sparkX - 3, sparkY - 3);
                ctx.lineTo(sparkX + 3, sparkY + 3);
                ctx.stroke();
            }
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
        this.joystick = { 
            dx: 0, 
            dy: 0, 
            active: false,
            touchId: null,
            startX: 0,
            startY: 0,
            radius: 50, // Raggio fisso per il joystick
            ...this.dom.joystick 
        };
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
            canvas: document.getElementById('gameCanvas'),
            menuOverlay: document.getElementById('menuOverlay'),
            joystick: {
                container: document.getElementById('joystick-container'),
                stick: document.getElementById('joystick-stick')
            },
            buttons: {
                start: document.getElementById('startGameBtn'),
                restart: document.getElementById('restartGameBtn'),
                restartFromPause: document.getElementById('restartFromPauseBtn'),
                pause: document.getElementById('pauseButton'),
                returnToMenu: document.getElementById('returnToMenuBtn'),
                returnToMenuPause: document.getElementById('returnToMenuPauseBtn'),
                copy: document.getElementById('copyCodeBtn'),
                load: document.getElementById('loadGameBtn'),
                generateDebugSave: document.getElementById('generateDebugSave'),
                copyDebugCodeBtn: document.getElementById('copyDebugCodeBtn'),
                closeShopBtn: document.getElementById('closeShopBtn'),
                closeMaterialsBtn: document.getElementById('closeMaterialsBtn'),
                materialsInventory: document.createElement('button')
            },
            inputs: {
                saveCode: document.getElementById('saveCodeOutput'),
                loadCode: document.getElementById('loadCodeInput')
            },
            containers: {
                characterSelection: document.getElementById('characterSelectionContainer'),
                stageSelection: document.getElementById('stageSelectionContainer'),
                upgradeOptions: document.getElementById('upgradeOptions'),
                runStats: document.getElementById('runStatsContainer'),
                pauseStats: document.getElementById('pauseStatsContainer'),
                playerStats: document.getElementById('playerStatsColumn'),
                weaponsStats: document.getElementById('weaponsStatsColumn'),
                permanentUpgradeOptions: document.getElementById('permanentUpgradeOptions'),
                materialsInventory: document.getElementById('materialsInventoryContainer')
            },
            popups: {
                start: document.getElementById('startScreen'),
                upgrade: document.getElementById('upgradeMenu'),
                pause: document.getElementById('pauseMenu'),
                gameOver: document.getElementById('gameOver'),
                shop: document.getElementById('permanentUpgradeShop'),
                materialsInventory: document.getElementById('materialsInventory')
            },
            inGameUI: {
                container: document.getElementById('inGameUI'),
                timer: document.getElementById('gameTimer'),
                xpBarFill: document.getElementById('xpBarFill'),
                xpBarText: document.getElementById('xpBarText'),
                gemCounter: document.getElementById('gemCounter')
            }
        };

        // Debug per mobile - verifica inizializzazione DOM
        if (window.innerWidth <= 768) {
            console.log('Mobile Debug - DOM inizializzazione:', {
                canvas: !!this.dom.canvas,
                joystickContainer: !!this.dom.joystick.container,
                joystickStick: !!this.dom.joystick.stick,
                inGameUI: !!this.dom.inGameUI.container
            });
            
            // Verifica che il joystick sia inizializzato correttamente
            if (this.dom.joystick.container && this.dom.joystick.stick) {
                // Assicurati che il joystick abbia le proprietà corrette
                this.dom.joystick.container.style.position = 'fixed';
                this.dom.joystick.container.style.display = 'none';
                this.dom.joystick.container.style.zIndex = '1000';
                this.dom.joystick.stick.style.transform = 'translate(0px, 0px)';
                
                console.log('Mobile Debug - Joystick inizializzato correttamente');
            } else {
                console.warn('Mobile Debug - Joystick non trovato nel DOM');
            }
        }
        
        // Crea il pulsante per l'inventario materiali
        this.dom.buttons.materialsInventory.innerHTML = '📦 Materiali';
        this.dom.buttons.materialsInventory.className = 'material-inventory-btn';
        this.dom.buttons.materialsInventory.style.cssText = `
            position: fixed;
            top: 12px;
            left: 12px;
            z-index: 1002;
            font-size: 16px;
            padding: 8px 12px;
            border-radius: 6px;
            background: #4a90e2;
            color: #fff;
            border: none;
            box-shadow: 0 2px 8px #0005;
            display: none;
        `;
        document.body.appendChild(this.dom.buttons.materialsInventory);
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
        this.dom.buttons.materialsInventory.onclick = () => this.showMaterialsInventory();
     
        
        // Pulsante chiudi negozio
        const closeShopBtn = document.getElementById('closeShopBtn');
        if (closeShopBtn) {
            closeShopBtn.onclick = () => this.hideAllPopups();
        }
        
        // Pulsante chiudi inventario materiali
        const closeMaterialsBtn = document.getElementById('closeMaterialsBtn');
        if (closeMaterialsBtn) {
            closeMaterialsBtn.onclick = () => this.hideAllPopups();
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
        // Debug per mobile - verifica canvas prima di aggiungere event listeners
        if (window.innerWidth <= 768) {
            console.log('Mobile Debug - Canvas prima degli event listeners:', {
                canvas: !!this.canvas,
                canvasWidth: this.canvas ? this.canvas.width : 'N/A',
                canvasHeight: this.canvas ? this.canvas.height : 'N/A'
            });
        }
        
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

            // Carica i materiali salvati se esistono
            try {
                const savedData = localStorage.getItem('ballSurvivalSaveData_v4.7');
                if (savedData) {
                    const data = JSON.parse(savedData);
                    if (data.materials && this.player) {
                        this.player.materials = data.materials;
                    }
                }
            } catch (e) {
                console.error("Errore nel caricamento materiali:", e);
            }

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
        this.dom.buttons.materialsInventory.style.display = 'block'; // Mostra pulsante materiali
        
        // Reset del joystick per mobile
        if (this.joystick) {
            this.joystick.active = false;
            this.joystick.touchId = null;
            this.joystick.dx = 0;
            this.joystick.dy = 0;
            this.joystick.startX = 0;
            this.joystick.startY = 0;
        }
        
        this.state = 'running'; 
        this.lastFrameTime = performance.now();
        
        // Controllo di sicurezza per assicurarsi che il player sia completamente inizializzato
        if (this.player && this.player.stats && typeof this.player.hp !== 'undefined') {
            if (!this.gameLoopId) this.gameLoop();
        } else {
            console.warn('Player non completamente inizializzato, riprovo tra 100ms');
            setTimeout(() => {
                if (this.state === 'running' && !this.gameLoopId) {
                    this.gameLoop();
                }
            }, 100);
        }
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
        this.dom.buttons.materialsInventory.style.display = 'none'; // Nascondi pulsante materiali
        this.dom.inGameUI.container.style.display = 'none';
        this.hideAllPopups(true); 
        this.showPopup('gameOver');
    }
    resetRunState() {
        this.entities = {
            enemies: [],
            projectiles: [],
            xpOrbs: [],
            gemOrbs: [],
            particles: [],
            effects: [],
            chests: [],
            droppedItems: [],
            materialItems: [], // Aggiunto supporto per materiali
            fireTrails: [],
            sanctuaries: [],
            staticFields: [],
            bosses: [],
            enemyProjectiles: [],
            auras: [],
            orbitals: []
        };
        // Le notifiche sono gestite separatamente (non sono entità)
        this.notifications = [];
        this.score = 0; this.enemiesKilled = 0; this.gemsThisRun = 0;
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
            // Controllo di sicurezza più robusto per updateInGameUI
            if (this.player && 
                this.player.stats && 
                typeof this.player.hp !== 'undefined' && 
                this.player.hp !== null &&
                this.dom && 
                this.dom.inGameUI) {
                this.updateInGameUI();
            } else {
                // Debug per mobile - mostra errori
                if (window.innerWidth <= 768) {
                    console.warn('Mobile Debug - Player state:', {
                        player: !!this.player,
                        stats: !!(this.player && this.player.stats),
                        hp: this.player ? this.player.hp : 'undefined',
                        dom: !!this.dom,
                        inGameUI: !!(this.dom && this.dom.inGameUI)
                    });
                }
            }
        }
        this.draw(); 
        this.lastFrameTime = now;
    }
    update(deltaTime) {
        if (this.state !== 'running') return; // Non aggiornare nulla se non in gioco
        
        // Controllo di sicurezza per il player
        if (!this.player) {
            console.warn('update: Player non ancora inizializzato');
            return;
        }
        
        this.player.update(this, this.joystick); 
        this.updateCamera();
        this.checkStage();
        for (const type in this.entities) {
            for (let i = this.entities[type].length - 1; i >= 0; i--) {
                const entity = this.entities[type][i];
                if (entity && typeof entity.update === 'function') {
                    entity.update(this);
                } else {
                    console.warn(`Entità senza metodo update trovata in ${type}:`, entity);
                    // Rimuovi entità non valide
                    this.entities[type].splice(i, 1);
                    continue;
                }
                if (entity.toRemove) this.entities[type].splice(i, 1);
            }
        }
        // Aggiorna le notifiche (non sono entità, quindi non usano il metodo update)
        if (this.notifications && Array.isArray(this.notifications)) {
            for (let i = this.notifications.length - 1; i >= 0; i--) {
                if (this.notifications[i] && typeof this.notifications[i].life !== 'undefined') {
                    this.notifications[i].life--;
                    if (this.notifications[i].life <= 0) this.notifications.splice(i, 1);
                } else {
                    // Rimuovi notifiche non valide
                    this.notifications.splice(i, 1);
                }
            }
        }
        this.spawnEnemies(); 
        this.spawnBoss(); 
        this.spawnChests(); 
        this.spawnMapXpOrbs();
        this.castSpells();
        this.checkForLevelUp(); // Spostato qui per coerenza
        this.updateNotifications(); // Aggiunto aggiornamento notifiche
    }
    
    draw() {
        // Debug per mobile - verifica se il canvas è valido
        if (window.innerWidth <= 768 && (!this.ctx || !this.canvas)) {
            console.error('Mobile Debug - Canvas non valido:', {
                ctx: !!this.ctx,
                canvas: !!this.canvas,
                canvasWidth: this.canvas ? this.canvas.width : 'N/A',
                canvasHeight: this.canvas ? this.canvas.height : 'N/A'
            });
            return;
        }
        
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        this.drawBackground();
        
        // Controlli di sicurezza per tutti gli array di entità
        if (this.entities.fireTrails) this.entities.fireTrails.forEach(e => e.draw(this.ctx, this));
        if (this.entities.sanctuaries) this.entities.sanctuaries.forEach(e => e.draw(this.ctx, this));
        if (this.entities.staticFields) this.entities.staticFields.forEach(e => e.draw(this.ctx, this));
        if (this.entities.xpOrbs) this.entities.xpOrbs.forEach(e => e.draw(this.ctx, this));
        if (this.entities.gemOrbs) this.entities.gemOrbs.forEach(e => e.draw(this.ctx, this));
        if (this.entities.chests) this.entities.chests.forEach(e => e.draw(this.ctx, this));
        if (this.entities.droppedItems) this.entities.droppedItems.forEach(e => e.draw(this.ctx, this));
        if (this.entities.materialItems) this.entities.materialItems.forEach(e => e.draw(this.ctx)); // Aggiunto disegno materiali
        if (this.entities.enemies) this.entities.enemies.forEach(e => e.draw(this.ctx, this));
        if (this.entities.bosses) this.entities.bosses.forEach(e => e.draw(this.ctx, this));
        if (this.player) {
            this.player.draw(this.ctx, this);
        } else {
            console.warn('draw: Player non ancora inizializzato');
        }
        if (this.entities.projectiles) this.entities.projectiles.forEach(e => e.draw(this.ctx, this));
        if (this.entities.enemyProjectiles) this.entities.enemyProjectiles.forEach(e => e.draw(this.ctx, this));
        if (this.entities.auras) this.entities.auras.forEach(e => e.draw(this.ctx, this));
        if (this.entities.orbitals) this.entities.orbitals.forEach(e => e.draw(this.ctx, this));
        if (this.entities.particles) this.entities.particles.forEach(e => e.draw(this.ctx, this));
        if (this.entities.effects) this.entities.effects.forEach(e => e.draw(this.ctx, this));
        this.drawMerchant();
        this.ctx.restore();
        this.drawOffscreenIndicators();
        if (this.notifications && Array.isArray(this.notifications)) {
            this.drawNotifications(this.ctx); // Aggiunto disegno notifiche
        }
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

    spawnEnemies() {
        if (this.lastEnemySpawnTime && (this.totalElapsedTime - this.lastEnemySpawnTime < CONFIG.enemies.spawnInterval)) return;
        this.lastEnemySpawnTime = this.totalElapsedTime;
        const maxEnemies = 100 + Math.floor(this.totalElapsedTime / 6); 
        if (this.entities.enemies.length >= maxEnemies) return;
        const batchSize = 3 + Math.floor(Math.random() * 4); 

        for (let i = 0; i < batchSize; i++) {
            if (this.entities.enemies.length >= maxEnemies) break;

            const side = Math.floor(Math.random() * 4);
            let x, y; const buffer = 80; 
            switch (side) {
                case 0: x = this.camera.x + Math.random() * this.camera.width; y = this.camera.y - buffer; break;
                case 1: x = this.camera.x + this.camera.width + buffer; y = this.camera.y + Math.random() * this.camera.height; break;
                case 2: x = this.camera.x + Math.random() * this.camera.width; y = this.camera.y + this.camera.height + buffer; break;
                case 3: x = this.camera.x - buffer; y = this.camera.y + Math.random() * this.camera.height; break;
            }

            let spawnX = x + (Math.random() - 0.5) * 60;
            let spawnY = y + (Math.random() - 0.5) * 60;

            const timeFactor = this.totalElapsedTime / CONFIG.enemies.scaling.timeFactor;
            const levelFactor = this.player.level * CONFIG.enemies.scaling.levelFactorMultiplier;
            const combinedFactor = timeFactor + levelFactor;
            const scaling = CONFIG.enemies.scaling;

            let finalStats = { 
                ...CONFIG.enemies.base, 
                hp: CONFIG.enemies.base.hp + Math.floor(combinedFactor) * scaling.hpPerFactor, 
                speed: CONFIG.enemies.base.speed + combinedFactor * scaling.speedPerFactor, 
                damage: CONFIG.enemies.base.damage + Math.floor(combinedFactor) * scaling.damagePerFactor, 
                xp: CONFIG.enemies.base.xp + Math.floor(Math.pow(combinedFactor, scaling.xpPowerFactor) * scaling.xpPerFactor),
                dr: Math.min(0.75, combinedFactor * scaling.drPerFactor)
            };
            
            // Applica le proprietà dello stage corrente
            const stageInfo = CONFIG.stages[this.currentStage];
            if (stageInfo && stageInfo.difficulty) {
                finalStats.dr += stageInfo.difficulty.dr;
                finalStats.speed *= (1 + stageInfo.difficulty.speed);
            }
            
            let eliteChance = 0.05 + Math.min(0.20, this.totalElapsedTime / 600); 
            if (stageInfo && stageInfo.difficulty && stageInfo.difficulty.eliteChance) {
                eliteChance = stageInfo.difficulty.eliteChance;
            }

            if (this.totalElapsedTime > 60 && Math.random() < eliteChance) {
                finalStats.hp *= 5; finalStats.damage *= 2; finalStats.speed *= 0.8;
                finalStats.radius *= 1.5; finalStats.xp *= 5; finalStats.isElite = true;
            }

            finalStats.maxHp = finalStats.hp; 
            this.addEntity('enemies', new Enemy(spawnX, spawnY, finalStats));
        }
    }

    spawnBoss() {
        if (this.entities.bosses.length === 0 && this.enemiesKilledSinceBoss >= CONFIG.boss.spawnThreshold) {
            const side = Math.floor(Math.random() * 4); let x, y; const buffer = 100;
            switch (side) {
                case 0: x = this.camera.x + Math.random() * this.camera.width; y = this.camera.y - buffer; break;
                case 1: x = this.camera.x + this.camera.width + buffer; y = this.camera.y + Math.random() * this.camera.height; break;
                case 2: x = this.camera.x + Math.random() * this.camera.width; y = this.camera.y + this.camera.height + buffer; break;
                case 3: x = this.camera.x - buffer; y = this.camera.y + Math.random() * this.camera.height; break;
            }
            const timeFactor = this.totalElapsedTime / CONFIG.boss.scaling.timeFactor;
            const stats = { ...CONFIG.boss.base, hp: CONFIG.boss.base.hp + timeFactor * CONFIG.boss.scaling.hpPerFactor, dr: Math.min(0.5, timeFactor * 0.01) };
            stats.maxHp = stats.hp; 
            const boss = new Boss(x, y, stats);
            this.addEntity('bosses', boss);
            this.notifications.push({ text: "!!! UN BOSS È APPARSO !!!", life: 300 }); 
            this.enemiesKilledSinceBoss = 0;
        }
    }
    spawnChests() {
        if (this.entities.chests.length === 0 && this.totalElapsedTime > this.nextChestSpawnTime) {
            const buffer = 200; let x, y, dist;
            do { x = Math.random() * (CONFIG.world.width - buffer * 2) + buffer; y = Math.random() * (CONFIG.world.height - buffer * 2) + buffer; dist = Utils.getDistance({ x, y }, this.player); }
            while (dist < this.camera.width);
            this.addEntity('chests', new Chest(x,y));
            this.nextChestSpawnTime = this.totalElapsedTime + CONFIG.chest.respawnTime;
        }
    }
    spawnMapXpOrbs() {
        const c = CONFIG.xpOrbs.mapSpawn;
        if (this.totalElapsedTime > this.nextMapXpSpawnTime) {
            if (this.entities.xpOrbs.length < c.max - c.batch) {
                const clusterCenterX = Math.random() * CONFIG.world.width; const clusterCenterY = Math.random() * CONFIG.world.height;
                for (let i = 0; i < c.batch; i++) {
                    const x = clusterCenterX + (Math.random() - 0.5) * 400; const y = clusterCenterY + (Math.random() - 0.5) * 400;
                    const finalX = Math.max(0, Math.min(CONFIG.world.width - 1, x)); const finalY = Math.max(0, Math.min(CONFIG.world.height - 1, y));
                    this.addEntity('xpOrbs', new XpOrb(finalX, finalY, c.value));
                }
            }
            this.nextMapXpSpawnTime = this.totalElapsedTime + c.interval;
        }
    }
    resetSpells() {
        this.spells = {
            magicMissile: { id: 'magicMissile', name: "Proiettile Magico", level: 0, evolution: 'none', mastered: false, damage: 14, cooldown: 1200, lastCast: 0, speed: 6, size: 5 },
            fireball:     { id: 'fireball',    name: "Sfera di Fuoco",    level: 0, evolution: 'none', mastered: false, damage: 15, cooldown: 1200, lastCast: 0, size: 8, speed: 7, explosionRadius: 20, burnDamage: 5, meteorCount: 3 },
            lightning:    { id: 'lightning',   name: "Fulmine a Catena",  level: 0, evolution: 'none', mastered: false, damage: 10, cooldown: 1200, lastCast: 0, range: 250, chains: 2, stunChance: 0.15, stunDuration: 30, fieldDuration: 300, fieldTickRate: 20 },
            frostbolt:    { id: 'frostbolt',   name: "Dardo di Gelo",     level: 0, evolution: 'none', mastered: false, damage: 12, cooldown: 1200, lastCast: 0, slow: 0.5, slowDuration: 120, size: 7, speed: 6, penetration: 1, stunDuration: 120, auraDps: 5, auraSlow: 0.3 },
            shotgun:      { id: 'shotgun',     name: "Fucile Arcano",     level: 0, evolution: 'none', mastered: false, damage: 8,  count: 5, angleSpread: Math.PI / 4, cooldown: 1500, lastCast: 0, spinningDuration: 300, spinningRate: 5 },
            shockwave:    { id: 'shockwave',   name: "Onda d'Urto",       level: 0, evolution: 'none', mastered: false, damage: 20, radius: 100, cooldown: 8000, lastCast: 0, knockback: 15, resonantCount: 3, resonantDelay: 15 },
            heal:         { id: 'heal',        name: "Cura",              level: 0, evolution: 'none', mastered: false, amount: 20, cooldown: 10000, lastCast: 0, sanctuaryDuration: 300, sanctuaryHps: 10, lifestealDuration: 300, lifestealPercent: 0.05 },
            shield:       { id: 'shield',      name: "Scudo Magico",      level: 0, evolution: 'none', mastered: false, duration: 2000, cooldown: 15000, lastCast: 0, active: false, dr: 0.7, reflectDamage: 0.5, orbitalCount: 1, orbitalRadius: 10, orbitalDistance: 60 }
        };
        Object.values(this.spells).forEach(s => s.level = 0);
        this.passives = { health: { level: 0 }, speed: { level: 0 }, armor: { level: 0}, attack_speed: { level: 0 } };
    }
    
    castSpells() {
        const now = Date.now();
        const freq = this.player.modifiers.frequency;
        for (const spellKey in this.spells) {
            const s = this.spells[spellKey];
            if (s.level > 0 && now - s.lastCast > s.cooldown * freq) {
                let castFunctionName;

                if (s.evolution && s.evolution !== 'none') {
                    const evoName = s.evolution;
                    const finalEvoName = s.id === 'frostbolt' && evoName === 'storm' ? 'glacial' : evoName;
                    castFunctionName = `cast${finalEvoName.charAt(0).toUpperCase() + finalEvoName.slice(1)}`;
                } else {
                    castFunctionName = `cast${spellKey.charAt(0).toUpperCase() + spellKey.slice(1)}`;
                }

                if (typeof this[castFunctionName] === 'function') {
                    if (spellKey === 'heal' && this.player.hp >= this.player.stats.maxHp && s.evolution !== 'lifesteal') continue;
                    if (spellKey === 'shield' && s.active) continue;

                    if (this[castFunctionName](now)) {
                        s.lastCast = now;
                    }
                }
            }
        }
    }

    getDamage(baseDamage) { 
        if (!this.player) {
            console.warn('getDamage: Player non ancora inizializzato');
            return baseDamage;
        }
        return baseDamage * (this.player.powerUpTimers.damageBoost > 0 ? 1.25 : 1) * this.player.modifiers.power; 
    }
    
    castMagicMissile(now) {
        const s = this.spells.magicMissile;
        const nearest = Utils.findNearest(this.player, [...this.entities.enemies, ...this.entities.bosses]);
        if (!nearest) return false;
        const angle = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x);
        this.addEntity('projectiles', new Projectile(this.player.x, this.player.y, {
            angle, damage: this.getDamage(s.damage), speed: s.speed, life: 80,
            size: s.size * this.player.modifiers.area, penetration: 1, color: '#9d75ff'
        }));
        return true;
    }
    castFireball(now) {
        const s = this.spells.fireball;
        let burnDamage = s.burnDamage;
        const bonuses = this.player.archetype.weaponBonuses && this.player.archetype.weaponBonuses.fireball;
        if (bonuses && bonuses.burnDamage) burnDamage *= bonuses.burnDamage;
        const nearest = Utils.findNearest(this.player, [...this.entities.enemies, ...this.entities.bosses]);
        if (!nearest) return false;
        const angle = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x);
        this.addEntity('projectiles', new Projectile(this.player.x, this.player.y, {
            angle, damage: this.getDamage(s.damage), type: 'fireball', life: 100, speed: s.speed, size: s.size * this.player.modifiers.area, penetration: 1, onDeathEffect: 'explosion', explosionRadius: s.explosionRadius * this.player.modifiers.area, burnDamage,
            drawFunc: (ctx, p) => { const g = ctx.createRadialGradient(p.x, p.y, p.size / 2, p.x, p.y, p.size * 1.5); g.addColorStop(0, 'rgba(255,200,0,1)'); g.addColorStop(0.5, 'rgba(255,100,0,0.8)'); g.addColorStop(1, 'rgba(255,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2); ctx.fill(); }
        }));
        return true;
    }
    castGiant(now) { const s = this.spells.fireball; const nearest = Utils.findNearest(this.player, [...this.entities.enemies, ...this.entities.bosses]); if (!nearest) return false; const angle = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x); this.addEntity('projectiles', new Projectile(this.player.x, this.player.y, { angle, damage: this.getDamage(s.damage * 4), type: 'great_fireball', life: 200, speed: s.speed * 0.5, size: s.size * 3 * this.player.modifiers.area, penetration: 999, leavesTrail: true, burnDamage: this.getDamage(s.burnDamage), drawFunc: (ctx, p) => { const g = ctx.createRadialGradient(p.x, p.y, p.size / 4, p.x, p.y, p.size); g.addColorStop(0, 'rgba(255, 255, 255, 1)'); g.addColorStop(0.2, 'rgba(255, 220, 150, 1)'); g.addColorStop(0.6, 'rgba(255, 100, 0, 0.9)'); g.addColorStop(1, 'rgba(150, 0, 0, 0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); } })); return true; }
    castMeteor(now) { const s = this.spells.fireball; const visibleEnemies = [...this.entities.enemies, ...this.entities.bosses].filter(e => e.x > this.camera.x && e.x < this.camera.x + this.camera.width && e.y > this.camera.y && e.y < this.camera.y + this.camera.height); for (let i = 0; i < s.meteorCount; i++) { let target = visibleEnemies.length > 0 ? visibleEnemies[Math.floor(Math.random() * visibleEnemies.length)] : { x: this.player.x + (Math.random() - 0.5) * 400, y: this.player.y + (Math.random() - 0.5) * 400 }; let explosionRadius = s.explosionRadius * this.player.modifiers.area; this.addEntity('effects', new Effect(target.x, target.y, { type: 'meteor_indicator', radius: explosionRadius, life: 45, initialLife: 45 })); setTimeout(() => { this.createExplosion(target.x, target.y, explosionRadius, this.getDamage(s.damage * 1.5)); for(let k=0; k<10; k++) this.addEntity('particles', new Particle(target.x, target.y, { vx: (Math.random()-0.5)*8, vy: (Math.random()-0.5)*8, life: 30, color: '#ffaa00' })); }, 750); } return true; }
    castLightning(now) {
        const s = this.spells.lightning;
        let chains = s.chains, area = 1;
        const bonuses = this.player.archetype.weaponBonuses && this.player.archetype.weaponBonuses.lightning;
        if (bonuses) {
            if (bonuses.chains) chains += bonuses.chains;
            if (bonuses.area) area *= bonuses.area;
        }
        const nearest = Utils.findNearest(this.player, [...this.entities.enemies, ...this.entities.bosses], s.range);
        if (!nearest) return false;
        let lastTarget = this.player;
        let chainedEnemies = [];
        for (let c = 0; c < chains; c++) {
            let nextTarget = Utils.findNearest(lastTarget, [...this.entities.enemies, ...this.entities.bosses].filter(e => !chainedEnemies.includes(e)), 200 * area);
            if (nextTarget) {
                nextTarget.takeDamage(this.getDamage(s.damage), this);
                this.addEntity('effects', new Effect(0, 0, { type: 'lightning_chain', from: { x: lastTarget.x, y: lastTarget.y }, to: { x: nextTarget.x, y: nextTarget.y }, life: 10, initialLife: 10 }));
                lastTarget = nextTarget;
                chainedEnemies.push(nextTarget);
            } else break;
        }
        return true;
    }
    castStorm(now) {
        const s = this.spells.lightning;
        const nearest = Utils.findNearest(this.player, [...this.entities.enemies, ...this.entities.bosses], 1000);
        const position = nearest ? {x: nearest.x, y: nearest.y} : {x: this.player.x + (Math.random()-0.5)*400, y: this.player.y + (Math.random()-0.5)*400};
        this.addEntity('staticFields', new StaticField(position.x, position.y, {
            damage: this.getDamage(s.damage), radius: s.range * this.player.modifiers.area,
            life: s.fieldDuration, tickRate: s.fieldTickRate
        }));
        return true;
    }
    castSpear(now) {
        const s = this.spells.lightning;
        const nearest = Utils.findNearest(this.player, [...this.entities.enemies, ...this.entities.bosses]);
        if (!nearest) return false;
        const angle = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x);
        this.addEntity('projectiles', new Projectile(this.player.x, this.player.y, {
            angle, damage: this.getDamage(s.damage) * 3, speed: 12, life: 100,
            size: 10 * this.player.modifiers.area, penetration: 999, type: 'lightning_spear',
            stunChance: s.stunChance, stunDuration: s.stunDuration,
            drawFunc: (ctx, p) => { ctx.strokeStyle = '#FFFF00'; ctx.lineWidth = p.size; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx*2, p.y - p.vy*2); ctx.stroke();}
        }));
        return true;
    }
    castFrostbolt(now) {
        const s = this.spells.frostbolt;
        let slow = s.slow, damage = this.getDamage(s.damage);
        const bonuses = this.player.archetype.weaponBonuses && this.player.archetype.weaponBonuses.frostbolt;
        if (bonuses) {
            if (bonuses.slow) slow *= bonuses.slow;
            if (bonuses.damage) damage *= bonuses.damage;
        }
        const nearest = Utils.findNearest(this.player, [...this.entities.enemies, ...this.entities.bosses]);
        if (!nearest) return false;
        const angle = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x);
        this.addEntity('projectiles', new Projectile(this.player.x, this.player.y, {
            angle, damage, speed: s.speed, life: 100, size: s.size * this.player.modifiers.area, penetration: s.penetration, slow, slowDuration: s.slowDuration,
            drawFunc: (ctx, p) => { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Date.now() / 100); ctx.fillStyle = '#add8e6'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; const spikes = 6, outerR = p.size, innerR = p.size / 2; ctx.beginPath(); for (let i = 0; i < spikes * 2; i++) { const r = i % 2 === 0 ? outerR : innerR; const a = (i * Math.PI) / spikes; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
        }));
        return true;
    }
    castGlacial(now) {
        const s = this.spells.frostbolt;
        this.addEntity('auras', new Aura(this.player.x, this.player.y, {
            life: 300, radius: 150 * this.player.modifiers.area, tickRate: 30,
            dps: this.getDamage(s.auraDps), slowAmount: s.auraSlow
        }));
        return true;
    }
    castComet(now) {
        const s = this.spells.frostbolt;
        const nearest = Utils.findNearest(this.player, [...this.entities.enemies, ...this.entities.bosses]);
        if (!nearest) return false;
        const targetPos = {x: nearest.x, y: nearest.y};
        const explosionRadius = 100 * this.player.modifiers.area;
        this.addEntity('effects', new Effect(targetPos.x, targetPos.y, { type: 'meteor_indicator', radius: explosionRadius, life: 60, initialLife: 60, color: '0,191,255' }));
        setTimeout(() => {
            this.createExplosion(targetPos.x, targetPos.y, explosionRadius, this.getDamage(s.damage) * 2, (enemy) => {
                enemy.stunTimer = Math.max(enemy.stunTimer, s.stunDuration);
            });
        }, 1000);
        return true;
    }
    castShotgun(now) {
        const s = this.spells.shotgun;
        let count = s.count, critChance = 0;
        const bonuses = this.player.archetype.weaponBonuses && this.player.archetype.weaponBonuses.shotgun;
        if (bonuses) {
            if (bonuses.count) count += bonuses.count;
            if (bonuses.critChance) critChance = bonuses.critChance;
        }
        const nearest = Utils.findNearest(this.player, [...this.entities.enemies, ...this.entities.bosses]);
        if (!nearest) return false;
        const angleBase = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x);
        for (let i = 0; i < count; i++) {
            const offset = (i - (count-1) / 2) * (s.angleSpread / count);
            let damage = this.getDamage(s.damage);
            if (critChance && Math.random() < critChance) damage *= 2;
            this.addEntity('projectiles', new Projectile(this.player.x, this.player.y, {
                angle: angleBase + offset, damage, speed: 10, life: 30, size: 4 * this.player.modifiers.area, penetration: 1, color: '#ffaa00'
            }));
        }
        return true;
    }
    castExplosive(now) {
        const s = this.spells.shotgun;
        const nearest = Utils.findNearest(this.player, [...this.entities.enemies, ...this.entities.bosses]);
        if (!nearest) return false;
        const angleBase = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x);
        for (let i = 0; i < s.count; i++) {
            const offset = (i - (s.count - 1) / 2) * (s.angleSpread / s.count);
            this.addEntity('projectiles', new Projectile(this.player.x, this.player.y, {
                angle: angleBase + offset, damage: this.getDamage(s.damage), speed: 10, life: 30,
                size: 6 * this.player.modifiers.area, penetration: 1, color: '#ffaa00',
                onDeathEffect: 'explosion', explosionRadius: 40 * this.player.modifiers.area
            }));
        }
        return true;
    }
    castCannon(now) {
        const s = this.spells.shotgun;
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const angle = Math.random() * 2 * Math.PI;
                this.addEntity('projectiles', new Projectile(this.player.x, this.player.y, {
                    angle, damage: this.getDamage(s.damage) * 0.7, speed: 8, life: 40,
                    size: 4, penetration: 1, color: '#ff5500'
                }));
            }, i * 50);
        }
        return true;
    }
    castShockwave(now) {
        const s = this.spells.shockwave;
        let damage = this.getDamage(s.damage);
        let knockback = s.knockback;
        const bonuses = this.player.archetype.weaponBonuses && this.player.archetype.weaponBonuses.shockwave;
        if (bonuses) {
            if (bonuses.damage) damage *= bonuses.damage;
            if (bonuses.knockback) knockback *= bonuses.knockback;
        }
        const radius = s.radius * this.player.modifiers.area;
        for (let enemy of [...this.entities.enemies, ...this.entities.bosses]) {
            if (Utils.getDistance(this.player, enemy) <= radius) {
                enemy.takeDamage(damage, this);
                const kAngle = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
                enemy.x += Math.cos(kAngle) * knockback;
                enemy.y += Math.sin(kAngle) * knockback;
            }
        }
        this.addEntity('effects', new Effect(this.player.x, this.player.y, { type: 'emp_wave', maxRadius: radius, life: 30, initialLife: 30 }));
        return true;
    }
    castResonant(now) {
        const s = this.spells.shockwave;
        const radius = s.radius * this.player.modifiers.area * 1.5;
        this.addEntity('effects', new Effect(this.player.x, this.player.y, { type: 'emp_wave', maxRadius: radius, life: 30, initialLife: 30, color: '148,0,211' }));
        [...this.entities.enemies, ...this.entities.bosses].forEach(enemy => {
            if (Utils.getDistance(this.player, enemy) <= radius) {
                enemy.takeDamage(this.getDamage(s.damage), this);
                const kAngle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
                enemy.x += Math.cos(kAngle) * s.knockback * 1.5; enemy.y += Math.sin(kAngle) * s.knockback * 1.5;
            }
        });
        return true;
    }
    castImplosion(now) {
        const s = this.spells.shockwave;
        const radius = s.radius * this.player.modifiers.area * 1.5;
        this.addEntity('effects', new Effect(this.player.x, this.player.y, { type: 'emp_wave', maxRadius: radius, life: 30, initialLife: 30, color: '148,0,211' }));
        [...this.entities.enemies, ...this.entities.bosses].forEach(enemy => {
            if (Utils.getDistance(this.player, enemy) <= radius) {
                enemy.takeDamage(this.getDamage(s.damage), this);
                const kAngle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
                enemy.x += Math.cos(kAngle) * s.knockback * 1.5; enemy.y += Math.sin(kAngle) * s.knockback * 1.5;
            }
        });
        return true;
    }
    castHeal(now) { 
        const s = this.spells.heal; 
        if (!this.player || !this.player.stats || typeof this.player.hp === 'undefined') {
            console.warn('castHeal: player non ancora inizializzato');
            return false;
        }
        this.player.hp = Math.min(this.player.stats.maxHp, this.player.hp + s.amount); 
        for(let i=0; i<10; i++) this.addEntity('particles', new Particle(this.player.x, this.player.y, {vx:(Math.random()-0.5)*2, vy:(Math.random()-0.5)*4 - 2, life: 40, color: '#00ff00'})); 
        return true; 
    }
    castSanctuary(now) {
        const s = this.spells.heal;
        if (!this.player || !this.player.modifiers) {
            console.warn('castSanctuary: player non ancora inizializzato');
            return false;
        }
        this.addEntity('sanctuaries', new Sanctuary(this.player.x, this.player.y, {
            life: s.sanctuaryDuration, radius: 100 * this.player.modifiers.area, hps: s.sanctuaryHps
        }));
        return true;
    }
    castLifesteal(now) {
        const s = this.spells.heal;
        if (!this.player || !this.player.powerUpTimers) {
            console.warn('castLifesteal: player non ancora inizializzato');
            return false;
        }
        this.player.powerUpTimers.lifesteal = s.lifestealDuration;
        this.notifications.push({ text: "Sacrificio Vitale Attivato!", life: 120 });
        return true;
    }
    castShield(now) { 
        const s = this.spells.shield; 
        s.active = true; 
        s.lastCast = now + s.duration; // Il cooldown inizia alla fine dell'abilità
        setTimeout(() => { s.active = false; }, s.duration); 
        return true; 
    }
    castReflect(now) {
        const s = this.spells.shield; 
        s.active = true;
        s.lastCast = now + s.duration; // Il cooldown inizia alla fine dell'abilità
        setTimeout(() => { s.active = false; }, s.duration);
        return true;
    }
    castOrbital(now) {
        const s = this.spells.shield;
        if (!this.player) {
            console.warn('castOrbital: player non ancora inizializzato');
            return false;
        }
        for (let i = 0; i < s.orbitalCount; i++) {
            this.addEntity('orbitals', new Orbital(this.player.x, this.player.y, {
                angle: (2 * Math.PI / s.orbitalCount) * i,
                distance: s.orbitalDistance, rotationSpeed: 0.03,
                damage: this.getDamage(5), radius: s.orbitalRadius
            }));
        }
        s.cooldown *= 2;
        return true;
    }

    createExplosion(x, y, radius, damage, onHitCallback = null) {
        this.addEntity('effects', new Effect(x, y, { type: 'explosion', maxRadius: radius, life: 20, initialLife: 20 }));
        for (let enemy of [...this.entities.enemies, ...this.entities.bosses]) {
            if (Utils.getDistance({x,y}, enemy) <= radius) {
                enemy.takeDamage(damage, this);
                if (onHitCallback) onHitCallback(enemy);
            }
        }
    }
    checkForLevelUp() {
        if (this.state !== 'running') return;
        
        // Controlli di sicurezza per evitare loop infiniti
        let levelUpCount = 0;
        const maxLevelUpsPerFrame = 10; // Limite di sicurezza
        
        while (this.player.xp >= this.player.xpNext && this.player.xpNext > 0 && levelUpCount < maxLevelUpsPerFrame) {
            this.handleLevelUp();
            levelUpCount++;
        }
        
        // Se abbiamo raggiunto il limite, log per debug
        if (levelUpCount >= maxLevelUpsPerFrame) {
            console.warn(`Troppi level up in un frame! XP: ${this.player.xp}, XP necessario: ${this.player.xpNext}`);
        }
    }
    handleLevelUp() {
        this.player.levelUp();
        this.addEntity('effects', new Effect(this.player.x, this.player.y, { type: 'level_up_burst', maxRadius: 60, life: 30, initialLife: 30 }));
        this.notifications.push({ text: "Scudo temporaneo attivato!", life: 120 });
        this.populateUpgradeMenu();
        this.showPopup('upgrade');
    }
    populateUpgradeMenu() { 
        const container = this.dom.containers.upgradeOptions; 
        container.innerHTML = ''; 
        const choices = this.getUpgradeChoices(); 
        choices.forEach(upgrade => { 
            if (!upgrade) return; 
            const div = document.createElement('div'); 
            div.className = 'upgrade-option' + (upgrade.type === 'evolution' ? ' evolution' : '') + (upgrade.type === 'mastery' ? ' mastery' : ''); 
            
            let s;
            if (upgrade.type === 'passive') {
                s = this.passives[upgrade.id];
            } else {
                const baseId = upgrade.id.split('_')[0];
                s = this.spells[baseId];
            }

            let levelText = s && s.level > 0 ? `(Liv. ${s.level + 1})` : `(Nuovo!)`; 
            if (upgrade.type === 'evolution' || upgrade.id === 'magicMissile' || upgrade.type === 'mastery') levelText = ''; 
            div.innerHTML = `<div class="upgrade-title">${upgrade.name} ${levelText}</div><div class="upgrade-desc">${upgrade.details || upgrade.desc}</div>`; 
            div.onclick = () => { this.applyUpgrade(upgrade.id); this.hideAllPopups(); }; 
            container.appendChild(div); 
        }); 
    }
    
    getUpgradeChoices() {
        let choices = [];
        const upgradeTree = CONFIG.upgradeTree;
        const availableEvolutions = [];
        const availableMasteries = [];
        const newSkillsPool = [];
        const otherUpgradesPool = [];

        for (const spellKey in this.spells) {
            const spell = this.spells[spellKey];
            const baseUpgrade = upgradeTree[spellKey];
            if (!baseUpgrade) continue;

            if (spell.level === baseUpgrade.maxLevel && spell.evolution === 'none') {
                const evolutions = Object.keys(upgradeTree).filter(id => id.startsWith(spellKey + '_evolve_'));
                evolutions.forEach(evoId => availableEvolutions.push(upgradeTree[evoId]));
            } else if (spell.evolution !== 'none' && !spell.mastered) {
                const masteryId = `${spellKey}_mastery_${spell.evolution}`;
                const masteryUpgrade = upgradeTree[masteryId];
                if(masteryUpgrade) {
                    availableMasteries.push(masteryUpgrade);
                }
            }
        }
        
        const priorityPool = [...availableEvolutions, ...availableMasteries];
        if (priorityPool.length > 0) {
            while(choices.length < 3 && priorityPool.length > 0) {
                 choices.push(priorityPool.splice(Math.floor(Math.random() * priorityPool.length), 1)[0]);
            }
        }

        Object.keys(upgradeTree).forEach(id => {
            if (upgradeTree[id].type === 'evolution' || upgradeTree[id].type === 'mastery' || id === 'magicMissile') return;

            if (upgradeTree[id].type === 'passive') {
                if (!this.passives[id] || this.passives[id].level < upgradeTree[id].maxLevel) {
                    otherUpgradesPool.push(upgradeTree[id]);
                }
            } else {
                const baseId = id.split('_')[0];
                const spell = this.spells[baseId];
                if (spell) {
                    if (spell.level === 0) {
                        newSkillsPool.push(upgradeTree[id]);
                    } else if (spell.level > 0 && spell.level < (upgradeTree[id].maxLevel || Infinity) && spell.evolution === 'none') {
                        otherUpgradesPool.push(upgradeTree[id]);
                    }
                }
            }
        });

        if (choices.length < 3 && newSkillsPool.length > 0) {
            choices.push(newSkillsPool.splice(Math.floor(Math.random() * newSkillsPool.length), 1)[0]);
        }
        
        const combinedPool = [...newSkillsPool, ...otherUpgradesPool];
        while (choices.length < 3 && combinedPool.length > 0) {
            choices.push(combinedPool.splice(Math.floor(Math.random() * combinedPool.length), 1)[0]);
        }
        
        return choices.filter(c => c);
    }

    applyUpgrade(upgradeId) {
        const upgrade = CONFIG.upgradeTree[upgradeId];
        if (!upgrade) return;

        let baseId = upgrade.id.split('_')[0];

        if(upgrade.type === 'evolution') {
            const evoType = upgrade.id.split('_evolve_')[1];
            if (this.spells[baseId]) {
                this.spells[baseId].evolution = evoType;
                if(upgrade.id === 'shield_evolve_orbital') { this.castOrbital(Date.now()); }
            }
            return;
        }

        if(upgrade.type === 'mastery') {
             if (this.spells[baseId]) {
                this.spells[baseId].mastered = true;
                if (upgradeId === 'fireball_mastery_giant') { this.spells.fireball.damage += 30; this.spells.fireball.burnDamage += 5; }
                if (upgradeId === 'fireball_mastery_meteor') { this.spells.fireball.meteorCount++; this.spells.fireball.explosionRadius += 10; }
                if (upgradeId === 'lightning_mastery_storm') { this.spells.lightning.fieldDuration += 120; this.spells.lightning.fieldTickRate = Math.max(10, this.spells.lightning.fieldTickRate - 5); }
                if (upgradeId === 'lightning_mastery_spear') { this.spells.lightning.damage *= 1.25; this.spells.lightning.stunChance += 0.1; }
                if (upgradeId === 'frostbolt_mastery_glacial') { this.spells.frostbolt.auraDps += 3; this.spells.frostbolt.auraSlow += 0.1; }
                if (upgradeId === 'frostbolt_mastery_comet') { this.spells.frostbolt.leavesIcePatch = true; } 
             }
            return;
        }
        
        let target;
        if (upgrade.type === 'passive') {
            target = this.passives[upgrade.id];
        } else {
            target = this.spells[baseId];
        }

        if (!target) { return; }
        
        target.level++;

        if (upgrade.id === 'fireball') { target.damage += 5; target.explosionRadius += 5; }
        else if (upgrade.id === 'lightning') { target.damage += 4; target.chains++; }
        else if (upgrade.id === 'frostbolt') { target.damage += 3; target.penetration++; }
        else if (upgrade.id === 'shotgun') { target.damage += 2; target.count += 2; }
        else if (upgrade.id === 'shockwave') { target.damage += 10; target.radius += 15; target.knockback += 5; }
        else if (upgrade.id === 'heal') { target.amount += 10; target.cooldown = Math.max(4000, target.cooldown - 1000); }
        else if (upgrade.id === 'shield') { target.duration += 500; target.cooldown = Math.max(10000, target.cooldown - 1000); }
        else if (upgrade.id === 'health') { this.player.stats.maxHp += 25; this.player.hp += 25; }
        else if (upgrade.id === 'speed') { this.player.stats.speed += 0.4; }
        else if (upgrade.id === 'armor') { this.player.stats.dr = Math.min(this.player.stats.dr + 0.02, 1.0); }
        else if (upgrade.id === 'attack_speed') { this.player.modifiers.frequency *= 0.92; }
    }
    
    populateCharacterSelection() {
        const container = this.dom.containers.characterSelection;
        container.innerHTML = '';
        for (const key in CONFIG.characterArchetypes) {
            const archetype = CONFIG.characterArchetypes[key];
            const unlocked = unlockedArchetypes.has(archetype.id);
            const div = document.createElement('div');
            div.className = 'character-option' + (unlocked ? '' : ' locked');
            div.dataset.id = archetype.id;
            div.innerHTML = `
                <h5>${archetype.name}</h5>
                <p>${archetype.desc}</p>
                <p class="character-bonus"><strong>Bonus:</strong> ${archetype.bonus}</p>
                <p class="character-malus"><strong>Malus:</strong> ${archetype.malus}</p>
                ${archetype.cost > 0 ? `<p class="character-cost">Costo: ${archetype.cost} 💎</p>` : ''}
                <button class="buy-archetype-btn" style="display:${!unlocked && archetype.cost > 0 ? 'block' : 'none'}" ${this.totalGems < archetype.cost ? 'disabled' : ''}>Sblocca</button>
            `;
            div.onclick = () => {
                if (unlockedArchetypes.has(archetype.id)) {
                    this.selectCharacter(archetype.id);
                }
            };
            // Gestione acquisto
            const buyBtn = div.querySelector('.buy-archetype-btn');
            if (buyBtn) {
                buyBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (this.totalGems >= archetype.cost) {
                        this.totalGems -= archetype.cost;
                        unlockedArchetypes.add(archetype.id);
                        this.populateCharacterSelection();
                        this.notifications.push({ text: `${archetype.name} sbloccato!`, life: 120 });
                        this.dom.totalGemsShop.textContent = this.totalGems;
                    } else {
                        this.notifications.push({ text: `Non hai abbastanza gemme!`, life: 120 });
                        buyBtn.disabled = true;
                        setTimeout(() => { buyBtn.disabled = this.totalGems < archetype.cost; }, 1000);
                    }
                };
            }
            container.appendChild(div);
        }
        this.selectCharacter(this.selectedArchetype);
    }

    selectCharacter(archetypeId) {
        if (!unlockedArchetypes.has(archetypeId)) return;
        this.selectedArchetype = archetypeId;
        document.querySelectorAll('.character-option').forEach(el => {
            el.classList.remove('selected');
        });
        const selectedElement = document.querySelector(`.character-option[data-id="${archetypeId}"]`);
        if (selectedElement) {
            selectedElement.classList.add('selected');
        }
    }
    
    populateStageSelection() {
        const container = this.dom.containers.stageSelection;
        container.innerHTML = '';
        
        Object.keys(CONFIG.stages).forEach(stageId => {
            const stage = CONFIG.stages[stageId];
            const stageDiv = document.createElement('div');
            stageDiv.className = 'character-option';
            stageDiv.style.cssText = `
                display: inline-block;
                margin: 5px;
                padding: 10px;
                border: 2px solid ${stage.unlocked ? '#4a90e2' : '#666'};
                border-radius: 8px;
                cursor: ${stage.unlocked ? 'pointer' : 'not-allowed'};
                background: ${stage.unlocked ? 'rgba(74, 144, 226, 0.1)' : 'rgba(100, 100, 100, 0.3)'};
                color: ${stage.unlocked ? '#fff' : '#666'};
                text-align: center;
                min-width: 120px;
                position: relative;
            `;
            
            if (this.selectedStage == stageId) {
                stageDiv.style.borderColor = '#f39c12';
                stageDiv.style.background = 'rgba(243, 156, 18, 0.2)';
            }
            
            stageDiv.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 5px;">${stage.name}</div>
                <div style="font-size: 12px; opacity: 0.8;">
                    ${stage.unlocked ? 'Disponibile' : this.getUnlockRequirementText(stage.unlockRequirement)}
                </div>
                ${!stage.unlocked ? '<div style="position: absolute; top: 5px; right: 5px; font-size: 16px;">🔒</div>' : ''}
            `;
            
            if (stage.unlocked) {
                stageDiv.onclick = () => this.selectStage(stageId);
            }
            
            container.appendChild(stageDiv);
        });
    }
    
    selectStage(stageId) {
        this.selectedStage = parseInt(stageId);
        this.populateStageSelection();
    }
    
    getUnlockRequirementText(requirement) {
        if (!requirement) return 'Sempre disponibile';
        
        switch (requirement.type) {
            case 'survival':
                return `Sopravvivi ${Math.floor(requirement.time / 60)} min in Stage ${requirement.stage}`;
            case 'boss_kill':
                return `Uccidi ${requirement.count} boss in Stage ${requirement.stage}`;
            case 'level':
                return `Raggiungi livello ${requirement.level} in Stage ${requirement.stage}`;
            case 'total_time':
                return `Gioca ${Math.floor(requirement.time / 60)} min totali`;
            default:
                return 'Sconosciuto';
        }
    }
    
    returnToStartScreen() {
        this.hideAllPopups(true); 
        this.dom.inGameUI.container.style.display = 'none';
        this.dom.buttons.pause.style.display = 'none';
        this.state = 'startScreen';
        this.populateCharacterSelection(); 
        this.populateStageSelection(); // Ricarica anche la selezione stage
        this.showPopup('start');
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }
        this.draw(); 
    }

    updateInGameUI() {
        // Controlli di sicurezza più robusti
        if (!this.dom.inGameUI || !this.player) {
            console.warn('updateInGameUI: DOM o player non ancora inizializzati');
            return;
        }

        // Controllo aggiuntivo per le proprietà del player
        if (!this.player.stats || typeof this.player.hp === 'undefined') {
            console.warn('updateInGameUI: Player non completamente inizializzato');
            return;
        }

        const ui = this.dom.inGameUI;
        
        // Controlli per ogni elemento UI
        if (ui.timer) {
            ui.timer.textContent = '🕒 ' + Math.floor(this.totalElapsedTime) + 's';
        }
        
        if (ui.gemCounter) {
            ui.gemCounter.textContent = '💎 ' + this.gemsThisRun;
        }

        if (ui.xpBarFill && ui.xpBarText && this.player.xpNext !== undefined) {
            if (this.player.xpNext > 0) {
                const xpPercent = Math.min(100, (this.player.xp / this.player.xpNext) * 100);
                ui.xpBarFill.style.width = xpPercent + '%';
            } else {
                ui.xpBarFill.style.width = '100%';
            }
            ui.xpBarText.textContent = `LVL ${this.player.level}`;
        }
        
        // Aggiorna anche la barra XP mobile
        const xpBarMobile = document.getElementById('xpBarMobile');
        const xpBarMobileFill = document.getElementById('xpBarMobileFill');
        const xpBarMobileText = document.getElementById('xpBarMobileText');
        if (xpBarMobile && xpBarMobileFill && xpBarMobileText && this.player.xpNext !== undefined) {
            if (this.player.xpNext > 0) {
                const xpPercent = Math.min(100, (this.player.xp / this.player.xpNext) * 100);
                xpBarMobileFill.style.width = xpPercent + '%';
            } else {
                xpBarMobileFill.style.width = '100%';
            }
            xpBarMobileText.textContent = `LVL ${this.player.level}`;
        }
    }

    showPopup(popupKey) { 
        if (popupKey !== 'upgrade' && popupKey !== 'shop') {
            this.state = (popupKey === 'gameOver' || popupKey === 'start') ? popupKey : 'paused';
        } else if (this.state === 'running') {
            this.state = 'paused';
        }
        
        this.dom.menuOverlay.style.display = 'block'; 
        Object.values(this.dom.popups).forEach(p => p.style.display = 'none'); 
        this.dom.popups[popupKey].style.display = 'flex'; 
        
        if (popupKey === 'shop') {
            this.populateShop(); 
        }
        if (popupKey === 'pause') { 
            this.populateStatsMenu(); 
        } 
    }
    hideAllPopups(forceNoResume) { 
        Object.values(this.dom.popups).forEach(p => p.style.display = 'none'); 
        this.dom.menuOverlay.style.display = 'none'; 
        if (this.state === 'paused' && !forceNoResume) { 
            this.state = 'running'; 
            this.lastFrameTime = performance.now(); 
            this.menuCooldown = 5; 
        } 
    }
    togglePause() { 
        if (this.state !== 'running' && this.state !== 'paused') return; 
        if (this.state === 'running') { 
            this.dom.buttons.materialsInventory.style.display = 'none'; // Nascondi pulsante materiali in pausa
            this.showPopup('pause'); 
        } else { 
            this.dom.buttons.materialsInventory.style.display = 'block'; // Mostra pulsante materiali
            this.hideAllPopups(); 
            this.dom.containers.debugSaveContainer.style.display = 'none'; 
        } 
    }
    populateStatsMenu() { 
        const runStatsContainer = this.dom.containers.runStats;
        if (runStatsContainer) {
            runStatsContainer.innerHTML = `
                <div class="run-stat-item">Tempo <span>${Math.floor(this.totalElapsedTime)}s</span></div>
                <div class="run-stat-item">Punteggio <span>${this.score}</span></div>
                <div class="run-stat-item">Nemici <span>${this.entities.enemies.length + this.entities.bosses.length}</span></div>
                <div class="run-stat-item">Cristalli <span>${this.gemsThisRun} 💎</span></div>
            `;
        } else {
            console.warn('Elemento runStats non trovato nel DOM');
        }

        const p = this.player; 
        if (!p || !p.stats) {
            console.warn('populateStatsMenu: Player non ancora inizializzato');
            return;
        }
        
        let playerHTML = `<div class="stats-section"><div class="stats-section-title">${p.archetype ? p.archetype.name : 'Sconosciuto'}</div>`; 
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.health}<span class="stat-item-label">Salute:</span><span class="stat-item-value">${Math.floor(p.hp || 0)} / ${p.stats.maxHp || 0}</span></div>`; 
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.speed}<span class="stat-item-label">Velocità:</span><span class="stat-item-value">${(p.stats.speed || 0).toFixed(1)}</span></div>`; 
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.defense}<span class="stat-item-label">Rid. Danni:</span><span class="stat-item-value">${Math.round((p.stats.dr || 0) * 100)}%</span></div></div>`; 
        playerHTML += `<div class="stats-section"><div class="stats-section-title">Modificatori</div>`; 
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.power}<span class="stat-item-label">Potenza:</span><span class="stat-item-value">${Math.round(((p.modifiers.power || 1) - 1) * 100)}%</span></div>`; 
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.frequency}<span class="stat-item-label">Frequenza:</span><span class="stat-item-value">${Math.round((1 - (p.modifiers.frequency || 1)) * 100)}%</span></div>`; 
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.area}<span class="stat-item-label">Area:</span><span class="stat-item-value">${Math.round(((p.modifiers.area || 1) - 1) * 100)}%</span></div>`; 
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.xpGain}<span class="stat-item-label">Guadagno XP:</span><span class="stat-item-value">${Math.round(((p.modifiers.xpGain || 1) - 1) * 100)}%</span></div>`; 
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.luck}<span class="stat-item-label">Fortuna:</span><span class="stat-item-value">${Math.round((p.modifiers.luck || 0) * 100)}%</span></div></div>`; 
        
        if (this.dom.containers.playerStats) {
            this.dom.containers.playerStats.innerHTML = playerHTML;
        } else {
            console.warn('Elemento playerStats non trovato nel DOM');
        } 
        
        let weaponsHTML = `<div class="stats-section"><div class="stats-section-title">Armi e Abilità</div>`; 
        let hasWeapons = false; 
        Object.values(this.spells).filter(s => s.level > 0).forEach(s => { 
            hasWeapons = true; 
            weaponsHTML += `<div class="stat-item-title">${s.name} (Liv. ${s.level}) ${s.evolution !== 'none' ? `[EVO]` : ''}</div>`; 
            let details = ''; 
            if (s.damage) details += `Danno: ${Math.round(this.getDamage(s.damage))}, `; 
            if (s.cooldown) details += `Ricarica: ${(s.cooldown * p.modifiers.frequency / 1000).toFixed(2)}s, `; 
            weaponsHTML += `<div class="weapon-stat-details">${details.slice(0, -2) || 'Statistiche base'}</div>`; 
        }); 
        if (!hasWeapons) weaponsHTML += `<div>Nessuna abilità acquisita.</div>`; 
        weaponsHTML += `</div>`; 
        
        if (this.dom.containers.weaponsStats) {
            this.dom.containers.weaponsStats.innerHTML = weaponsHTML;
        } else {
            console.warn('Elemento weaponsStats non trovato nel DOM');
        } 
    }
    handleEscapeKey() { const anyPopupOpen = Object.values(this.dom.popups).some(p => p.style.display === 'flex'); if (anyPopupOpen && this.state !== 'startScreen' && this.state !== 'gameOver') { this.hideAllPopups(); } else { this.togglePause(); } }
    handleInteractionKey() { 
        if (this.menuCooldown > 0 || this.state !== 'running') {
            return; 
        }
        
        const distance = Utils.getDistance(this.player, CONFIG.merchant);
        
        if (distance < CONFIG.merchant.interactionRadius) { 
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
            e.stopPropagation();
            
            // Debug per mobile
            console.log('Mobile Debug - Touch detected:', {
                pointerType: e.pointerType,
                clientX: clientX,
                clientY: clientY,
                joystickActive: this.joystick.active,
                joystickExists: !!this.joystick,
                domJoystickExists: !!(this.dom && this.dom.joystick),
                state: this.state,
                pointerId: e.pointerId
            });
            
            // Controllo di sicurezza per il joystick
            if (!this.joystick || !this.dom.joystick || !this.dom.joystick.container) {
                console.warn('Joystick non inizializzato correttamente');
                return;
            }
            
            console.log('Mobile Debug - Activating joystick');
            this.joystick.touchId = e.pointerId; 
            this.joystick.active = true; 
            this.joystick.startX = clientX; 
            this.joystick.startY = clientY; 
            this.joystick.dx = 0;
            this.joystick.dy = 0;
            
            // Posizionamento migliorato del joystick
            this.dom.joystick.container.style.display = 'block'; 
            this.dom.joystick.container.style.position = 'fixed';
            this.dom.joystick.container.style.left = `${clientX - this.dom.joystick.radius}px`; 
            this.dom.joystick.container.style.top = `${clientY - this.dom.joystick.radius}px`; 
            this.dom.joystick.container.style.zIndex = '1000';
            
            // Reset del stick al centro
            this.dom.joystick.stick.style.transform = 'translate(0px, 0px)';
            
            console.log('Mobile Debug - Joystick activated:', {
                active: this.joystick.active,
                touchId: this.joystick.touchId,
                startX: this.joystick.startX,
                startY: this.joystick.startY,
                containerLeft: this.dom.joystick.container.style.left,
                containerTop: this.dom.joystick.container.style.top
            });
        } else if (e.pointerType === 'touch' && this.joystick.active) {
            // Se il joystick è già attivo, gestisci il movimento
            console.log('Mobile Debug - Joystick already active, handling movement');
            this.handlePointerMove(e);
        } 
    }
    handlePointerMove(e) { 
        if (!this.joystick.active || e.pointerId !== this.joystick.touchId) {
            console.log('Mobile Debug - handlePointerMove skipped:', {
                joystickActive: this.joystick.active,
                pointerId: e.pointerId,
                touchId: this.joystick.touchId
            });
            return; 
        }
        
        e.preventDefault(); 
        e.stopPropagation();
        
        // Controllo di sicurezza per il joystick
        if (!this.joystick || !this.dom.joystick || !this.dom.joystick.stick) {
            console.warn('Joystick non inizializzato correttamente in handlePointerMove');
            return;
        }
        
        let deltaX = e.clientX - this.joystick.startX; 
        let deltaY = e.clientY - this.joystick.startY; 
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY); 
        const maxDistance = this.dom.joystick.radius; 
        
        if (distance > maxDistance) { 
            deltaX = (deltaX / distance) * maxDistance; 
            deltaY = (deltaY / distance) * maxDistance; 
        } 
        
        // Aggiorna la posizione del stick
        this.dom.joystick.stick.style.transform = `translate(${deltaX}px, ${deltaY}px)`; 
        this.joystick.dx = deltaX / maxDistance; 
        this.joystick.dy = deltaY / maxDistance;
        
        console.log('Mobile Debug - Joystick moved:', {
            deltaX: deltaX,
            deltaY: deltaY,
            dx: this.joystick.dx,
            dy: this.joystick.dy,
            distance: distance,
            maxDistance: maxDistance,
            pointerId: e.pointerId
        }); 
    }
    handlePointerEnd(e) { 
        if (this.joystick.active && e.pointerId === this.joystick.touchId) { 
            e.preventDefault();
            e.stopPropagation();
            
            // Controllo di sicurezza per il joystick
            if (!this.joystick || !this.dom.joystick || !this.dom.joystick.stick || !this.dom.joystick.container) {
                console.warn('Joystick non inizializzato correttamente in handlePointerEnd');
                return;
            }
            
            this.joystick.active = false; 
            this.joystick.touchId = null; 
            this.dom.joystick.stick.style.transform = 'translate(0px, 0px)'; 
            this.dom.joystick.container.style.display = 'none'; 
            this.joystick.dx = 0; 
            this.joystick.dy = 0;
            
            console.log('Mobile Debug - Joystick deactivated'); 
        } 
    }
    
    generateAndShowDebugCode() {
        this.dom.inputs.debugSaveOutput.value = this.generateSaveCode(true);
        this.dom.containers.debugSaveContainer.style.display = 'block';
    }
    copyDebugCode() {
        const debugCode = this.dom.inputs.debugSaveOutput.value;
        if(debugCode) {
            navigator.clipboard.writeText(debugCode).then(() => {
                this.notifications.push({ text: "Codice Debug Copiato!", life: 120 });
            });
        }
    }
    generateSaveCode(isDebug = false) {
        const saveData = {
            v: "4.7-menus", 
            gems: this.totalGems,
            perm_upgrades: this.permanentUpgrades,
            unlocked_archetypes: Array.from(unlockedArchetypes)
        };

        if (isDebug) {
            saveData.run_state = {
                time: this.totalElapsedTime,
                score: this.score,
                player: {
                    level: this.player.level,
                    xp: this.player.xp,
                    xpNext: this.player.xpNext,
                    hp: this.player.hp,
                    stats: this.player.stats,
                    modifiers: this.player.modifiers,
                    x: this.player.x,
                    y: this.player.y,
                    archetype: this.player.archetype.id
                },
                spells: this.spells,
                passives: this.passives,
                difficultyTier: this.difficultyTier
            };
        }
        
        try {
            const jsonString = JSON.stringify(saveData);
            return btoa(jsonString);
        } catch (e) {
            console.error("Errore durante la creazione del codice di salvataggio:", e);
            return "ERRORE";
        }
    }

    loadFromSaveCode() {
        const code = this.dom.inputs.loadCode.value.trim();
        const notification = this.dom.loadNotification;
        if (!code) { notification.textContent = "Inserisci un codice."; notification.style.color = '#e74c3c'; setTimeout(() => notification.textContent = "", 3000); return; }

        try {
            const jsonString = atob(code);
            const loadedData = JSON.parse(jsonString);
            
            if (loadedData.gems !== undefined) this.totalGems = loadedData.gems;
            if (loadedData.perm_upgrades) {
                Object.keys(this.permanentUpgrades).forEach(key => {
                    if (loadedData.perm_upgrades[key] && typeof loadedData.perm_upgrades[key].level === 'number') {
                        this.permanentUpgrades[key].level = loadedData.perm_upgrades[key].level;
                    }
                });
            }
            this.saveGameData(); 

            if(loadedData.run_state) {
                const run = loadedData.run_state;
                this.resetRunState(); 
                this.totalElapsedTime = run.time || 0;
                this.score = run.score || 0;
                this.difficultyTier = run.difficultyTier || 0;

                this.player.resetForNewRun(this.permanentUpgrades, run.player.archetype || 'standard'); 
                this.player.level = run.player.level;
                this.player.xp = run.player.xp;
                this.player.xpNext = run.player.xpNext;
                this.player.hp = run.player.hp;
                this.player.x = run.player.x;
                this.player.y = run.player.y;
                
                this.spells = run.spells;
                this.passives = run.passives;

                this.player.stats.maxHp += (this.passives.health.level * 25);
                this.player.stats.speed += (this.passives.speed.level * 0.4);
                this.player.stats.dr = Math.min(this.player.stats.dr + (this.passives.armor.level * 0.02), 1.0);
                this.player.modifiers.frequency *= Math.pow(0.92, this.passives.attack_speed.level);


                notification.textContent = "Stato di debug caricato!";
                notification.style.color = '#2ecc71';
                setTimeout(() => {
                    this.startGame(true);
                }, 1000);

            } else {
                 notification.textContent = "Dati caricati!";
                 notification.style.color = '#2ecc71';
            }
        } catch (e) {
            console.error("Errore durante il caricamento:", e);
            notification.textContent = "Codice non valido o corrotto.";
            notification.style.color = '#e74c3c';
        }
        setTimeout(() => notification.textContent = "", 3000);
    }
    
    copySaveCode() { const saveCodeInput = this.dom.inputs.saveCode; if (saveCodeInput.value) { saveCodeInput.select(); saveCodeInput.setSelectionRange(0, 99999); try { document.execCommand('copy'); this.notifications.push({ text: "Codice copiato!", life: 120 }); } catch (err) { console.error("Copia fallita", err); } } }
    copyDebugCode() {
        const debugCode = this.dom.inputs.debugSaveOutput.value;
        if(debugCode) {
            this.dom.inputs.debugSaveOutput.select();
            this.dom.inputs.debugSaveOutput.setSelectionRange(0, 99999);
            try {
                document.execCommand('copy');
                this.notifications.push({ text: "Codice Debug Copiato!", life: 120 });
            } catch (err) {
                console.error("Copia fallita", err);
            }
        }
    }
    loadGameData() { 
        this.permanentUpgrades = {}; 
        Object.keys(CONFIG.permanentUpgrades).forEach(key => { 
            this.permanentUpgrades[key] = { ...CONFIG.permanentUpgrades[key], level: 0 }; 
        }); 
        
        try { 
            const savedData = localStorage.getItem('ballSurvivalSaveData_v4.7'); 
            
            if (savedData) { 
                const data = JSON.parse(savedData); 
                this.totalGems = data.totalGems || 0; 
                
                if (data.upgrades) { 
                    Object.keys(this.permanentUpgrades).forEach(key => { 
                        if (data.upgrades[key]) this.permanentUpgrades[key].level = data.upgrades[key].level || 0; 
                    }); 
                }
                
                // Carica i materiali salvati
                if (data.materials && this.player) {
                    this.player.materials = data.materials;
                }
            } else { 
                this.totalGems = 0; 
            } 
        } catch (e) { 
            console.error("Impossibile caricare:", e); 
            this.totalGems = 0; 
        } 
    }
    saveGameData() { 
        try { 
            const saveData = { 
                totalGems: this.totalGems, 
                upgrades: this.permanentUpgrades,
                materials: this.player ? this.player.materials || {} : {}
            }; 
            localStorage.setItem('ballSurvivalSaveData_v4.7', JSON.stringify(saveData)); 
        } catch (e) { 
            console.error("Impossibile salvare:", e); 
        } 
    }
    populateShop() { 
        this.dom.totalGemsShop.textContent = this.totalGems; 
        const container = this.dom.containers.permanentUpgradeOptions; 
        
        container.innerHTML = ''; 
        
        // Aggiungi messaggio se non ci sono cristalli
        if (this.totalGems === 0) {
            container.innerHTML = `<div class="zero-gems-message">
                💎 Non hai ancora cristalli! Completa partite per guadagnarne.
            </div>`;
            return;
        }
        
        for (const key in this.permanentUpgrades) { 
            const upg = this.permanentUpgrades[key]; 
            const cost = Math.floor(upg.baseCost * Math.pow(upg.costGrowth, upg.level));
            
            let costColor = this.totalGems < cost ? '#e74c3c' : '#fff';
            let optionHTML = `<div class="permanent-upgrade-option">
                <div>
                    <div class="upgrade-title">${upg.name}</div>
                    <div class="perm-upgrade-level">Livello: ${upg.level} / ${upg.maxLevel}</div>
                    <div class="upgrade-desc">Effetto attuale: ${upg.effect(upg.level)}</div>
                </div>`;
            if (upg.level < upg.maxLevel) {
                optionHTML += `<div>
                    <div class="perm-upgrade-cost" style="color:${costColor}">Costo: ${cost} 💎</div>
                    <button class="buy-button" data-key="${key}" ${this.totalGems < cost ? 'disabled' : ''}>
                        ${this.totalGems < cost ? 'Cristalli Insufficienti' : 'Compra'}
                    </button>
                </div>`;
            } else {
                optionHTML += `<div class="max-level-indicator">MAX</div>`;
            }
            optionHTML += `</div>`;
            container.innerHTML += optionHTML;
        } 
        
        container.querySelectorAll('.buy-button').forEach(btn => { 
            btn.onclick = () => this.buyPermanentUpgrade(btn.dataset.key); 
        });
    }
    buyPermanentUpgrade(key) { const upg = this.permanentUpgrades[key]; const cost = Math.floor(upg.baseCost * Math.pow(upg.costGrowth, upg.level)); if (upg.level < upg.maxLevel && this.totalGems >= cost) { this.totalGems -= cost; upg.level++; this.saveGameData(); this.player.applyPermanentUpgrades(this.permanentUpgrades); this.populateShop(); } }
    applyItemEffect(item) { 
        const itemInfo = CONFIG.itemTypes[item.type]; 
        this.notifications.push({ text: itemInfo.desc, life: 300 }); 
        if (!this.player || !this.player.stats || typeof this.player.hp === 'undefined') {
            console.warn('applyItemEffect: player non ancora inizializzato');
            return;
        }
        switch (item.type) { 
            case 'HEAL_POTION': this.player.hp = Math.min(this.player.stats.maxHp, this.player.hp + this.player.stats.maxHp * 0.5); break; 
            case 'XP_BOMB': this.player.gainXP(this.player.xpNext); break; 
            case 'INVINCIBILITY': this.player.powerUpTimers.invincibility = 600; break; 
            case 'DAMAGE_BOOST': this.player.powerUpTimers.damageBoost = 1200; break; 
            case 'LEGENDARY_ORB': this.player.powerUpTimers.damageBoost = 3600; this.player.powerUpTimers.invincibility = 3600; break; 
        } 
    }
    updateCamera() { 
        if (!this.player) {
            console.warn('updateCamera: Player non ancora inizializzato');
            return;
        }
        
        // Controllo di sicurezza per la camera
        if (!this.camera || typeof this.camera.width === 'undefined' || typeof this.camera.height === 'undefined') {
            console.warn('updateCamera: Camera non inizializzata correttamente');
            return;
        }
        
        this.camera.x = this.player.x - this.camera.width / 2; 
        this.camera.y = this.player.y - this.camera.height / 2; 
        this.camera.x = Math.max(0, Math.min(this.camera.x, CONFIG.world.width - this.camera.width)); 
        this.camera.y = Math.max(0, Math.min(this.camera.y, CONFIG.world.height - this.camera.height)); 
    }
    resizeCanvas() {
        if (!this.dom || !this.dom.canvas) {
            console.warn('Canvas non disponibile per il resize');
            return;
        }
        
        // Usa il canvas stesso per ottenere le dimensioni
        const rect = this.dom.canvas.getBoundingClientRect();
        
        // Limiti massimi desktop
        const maxW = window.innerWidth <= 700 ? CONFIG.world.width : Math.min(CONFIG.world.width, 1200);
        const maxH = window.innerWidth <= 700 ? CONFIG.world.height : Math.min(CONFIG.world.height, 900);
        let width = Math.min(rect.width, maxW);
        let height = Math.min(rect.height, maxH);
        
        // Assicurati che le dimensioni siano valide
        if (width <= 0 || height <= 0) {
            console.warn('Dimensioni canvas non valide:', width, height);
            width = Math.max(100, width);
            height = Math.max(100, height);
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.camera.width = width;
        this.camera.height = height;
        
        // Forza un ridisegno se il gioco è in corso
        if (this.state === 'running' && this.ctx) {
            this.draw();
        } else if (this.state !== 'running' && this.entities) {
            this.draw();
        }
    }
    drawOffscreenIndicators() { 
        if (!this.player) {
            console.warn('drawOffscreenIndicators: Player non ancora inizializzato');
            return;
        }
        if(this.entities.chests.length > 0) this.drawOffscreenIndicator(this.entities.chests[0], "rgba(255, 215, 0, 0.7)", 'arrow'); 
        this.drawOffscreenIndicator(CONFIG.merchant, "rgba(155, 89, 182, 0.8)", 'triangle'); 
    }
    drawOffscreenIndicator(target, color, shape) { 
        if (!this.player) {
            console.warn('drawOffscreenIndicator: Player non ancora inizializzato');
            return;
        }
        const screenX = target.x - this.camera.x; 
        const screenY = target.y - this.camera.y; 
        if (screenX > 0 && screenX < this.canvas.width && screenY > 0 && screenY < this.canvas.height) return; 
        const pScreenX = this.player.x - this.camera.x; 
        const pScreenY = this.player.y - this.camera.y; 
        const angle = Math.atan2(screenY - pScreenY, screenX - pScreenX); 
        const padding = 30; 
        let arrowX = pScreenX + Math.cos(angle) * (Math.min(this.canvas.width, this.canvas.height) / 2.5); 
        let arrowY = pScreenY + Math.sin(angle) * (Math.min(this.canvas.width, this.canvas.height) / 2.5); 
        arrowX = Math.max(padding, Math.min(this.canvas.width - padding, arrowX)); 
        arrowY = Math.max(padding, Math.min(this.canvas.height - padding, arrowY)); 
        this.ctx.save(); 
        this.ctx.translate(arrowX, arrowY); 
        this.ctx.rotate(angle); 
        this.ctx.fillStyle = color; 
        this.ctx.strokeStyle = "white"; 
        this.ctx.lineWidth = 1; 
        this.ctx.beginPath(); 
        if (shape === 'arrow') { 
            this.ctx.moveTo(15, 0); 
            this.ctx.lineTo(-15, -10); 
            this.ctx.lineTo(-10, 0); 
            this.ctx.lineTo(-15, 10); 
        } else { 
            this.ctx.moveTo(0, -10); 
            this.ctx.lineTo(10, 10); 
            this.ctx.lineTo(-10, 10); 
        } 
        this.ctx.closePath(); 
        this.ctx.fill(); 
        this.ctx.stroke(); 
        this.ctx.restore(); 
    }
    drawNotifications(ctx) {
        // Controllo di sicurezza per le notifiche
        if (!this.notifications || !Array.isArray(this.notifications)) {
            console.warn('drawNotifications: Notifications non inizializzate correttamente');
            return;
        }
        
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = '16px Arial';
        
        for (const notification of this.notifications) {
            if (!notification || typeof notification.life === 'undefined') {
                continue; // Salta notifiche non valide
            }
            
            const alpha = notification.life > 60 ? 1.0 : notification.life / 60;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = notification.color || '#ffffff';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            
            // Testo con outline
            ctx.strokeText(notification.text, notification.x, notification.y);
            ctx.fillText(notification.text, notification.x, notification.y);
        }
        
        ctx.restore();
    }
    drawMerchant() { 
        const m = CONFIG.merchant; 
        this.ctx.fillStyle = '#9b59b6'; 
        this.ctx.fillRect(m.x, m.y, m.size, m.size); 
        this.ctx.strokeStyle = '#f1c40f'; 
        this.ctx.lineWidth = 3; 
        this.ctx.strokeRect(m.x, m.y, m.size, m.size); 
        if (this.state === 'running' && this.player && Utils.getDistance(this.player, m) < CONFIG.merchant.interactionRadius) { 
            this.ctx.font = 'bold 14px "Courier New"'; 
            this.ctx.fillStyle = 'white'; 
            this.ctx.textAlign = 'center'; 
            this.ctx.fillText("[E] / Tocca", m.x + m.size / 2, m.y - 25); 
            this.ctx.fillText("Negozio", m.x + m.size / 2, m.y - 10); 
        } 
    }

    showInGameUI() {
        this.dom.inGameUI.style.display = 'flex';
        this.dom.pauseButton.style.display = 'block';
        this.dom.pauseButtonMobile.style.display = 'block';
        
        // Mostra la barra XP mobile se siamo su mobile
        const xpBarMobile = document.getElementById('xpBarMobile');
        if (xpBarMobile && window.innerWidth <= 700) {
            xpBarMobile.style.display = 'block';
        }
    }

    hideInGameUI() {
        this.dom.inGameUI.style.display = 'none';
        this.dom.pauseButton.style.display = 'none';
        this.dom.pauseButtonMobile.style.display = 'none';
        
        // Nascondi la barra XP mobile
        const xpBarMobile = document.getElementById('xpBarMobile');
        if (xpBarMobile) {
            xpBarMobile.style.display = 'none';
        }
    }

    showBossUpgradePopup() {
        // Mostra popup con scelta upgrade passivo extra (overcap)
        this.state = 'paused';
        this.dom.menuOverlay.style.display = 'block';
        Object.values(this.dom.popups).forEach(p => p.style.display = 'none');
        this.dom.popups['upgrade'].style.display = 'flex';
        this.populateBossUpgradeMenu();
    }

    populateBossUpgradeMenu() {
        const container = this.dom.containers.upgradeOptions;
        container.innerHTML = '';
        const choices = this.getBossUpgradeChoices();
        choices.forEach(upgrade => {
            if (!upgrade) return;
            const div = document.createElement('div');
            div.className = 'upgrade-option' + (upgrade.type === 'evolution' ? ' evolution' : '') + (upgrade.type === 'mastery' ? ' mastery' : '');
            let s;
            if (upgrade.type === 'passive') {
                s = this.passives[upgrade.id];
            } else {
                const baseId = upgrade.id.split('_')[0];
                s = this.spells[baseId];
            }
            let levelText = s && s.level > 0 ? `(Liv. ${s.level + 1})` : `(Nuovo!)`;
            if (upgrade.type === 'evolution' || upgrade.id === 'magicMissile' || upgrade.type === 'mastery') levelText = '';
            div.innerHTML = `<div class="upgrade-title">${upgrade.name} ${levelText}</div><div class="upgrade-desc">${upgrade.details || upgrade.desc}</div>`;
            div.onclick = () => { this.applyBossUpgrade(upgrade.id); this.hideAllPopups(); };
            container.appendChild(div);
        });
    }

    getBossUpgradeChoices() {
        // Permettiamo l'overcap: includi tutti i passivi, anche se già maxati
        const upgradeTree = CONFIG.upgradeTree;
        const passives = Object.values(upgradeTree).filter(u => u.type === 'passive');
        // Scegli 3 a caso
        const shuffled = passives.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 3);
    }

    applyBossUpgrade(upgradeId) {
        const upgrade = CONFIG.upgradeTree[upgradeId];
        if (!upgrade) return;
        let target;
        if (upgrade.type === 'passive') {
            target = this.passives[upgrade.id];
        } else {
            const baseId = upgrade.id.split('_')[0];
            target = this.spells[baseId];
        }
        if (!target) return;
        target.level++;
        this.notifications.push({ text: `Upgrade boss: ${upgrade.name}!`, life: 180 });
    }

    // Funzione di test per il negozio
    testShop() {
        console.log('=== TEST NEGOZIO ===');
        console.log('DOM elements:');
        console.log('- totalGemsShop:', this.dom.totalGemsShop);
        console.log('- permanentUpgradeOptions:', this.dom.containers.permanentUpgradeOptions);
        console.log('- shop popup:', this.dom.popups.shop);
        
        console.log('Dati:');
        console.log('- totalGems:', this.totalGems);
        console.log('- permanentUpgrades:', this.permanentUpgrades);
        
        // Test diretto del populateShop
        console.log('Testando populateShop...');
        this.populateShop();
        
        console.log('=== FINE TEST ===');
    }

    showNotification(text, color = '#ffffff') {
        // Controllo di sicurezza per le notifiche
        if (!this.notifications || !Array.isArray(this.notifications)) {
            console.warn('showNotification: Notifications non inizializzate correttamente');
            return;
        }
        
        // Controllo di sicurezza per il player
        if (!this.player) {
            console.warn('showNotification: Player non ancora inizializzato');
            return;
        }
        
        const notification = {
            text: text,
            color: color,
            life: 120, // 2 secondi a 60 FPS
            y: this.player.y - 50,
            x: this.player.x
        };
        this.notifications.push(notification);
    }

    updateNotifications() {
        // Controllo di sicurezza per le notifiche
        if (!this.notifications || !Array.isArray(this.notifications)) {
            console.warn('updateNotifications: Notifications non inizializzate correttamente');
            return;
        }
        
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            const notification = this.notifications[i];
            if (!notification || typeof notification.life === 'undefined') {
                this.notifications.splice(i, 1); // Rimuovi notifiche non valide
                continue;
            }
            
            notification.life--;
            notification.y -= 0.5; // Movimento verso l'alto
            
            if (notification.life <= 0) {
                this.notifications.splice(i, 1);
            }
        }
    }

    drawNotifications(ctx) {
        // Controllo di sicurezza per le notifiche
        if (!this.notifications || !Array.isArray(this.notifications)) {
            console.warn('drawNotifications: Notifications non inizializzate correttamente');
            return;
        }
        
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = '16px Arial';
        
        for (const notification of this.notifications) {
            if (!notification || typeof notification.life === 'undefined') {
                continue; // Salta notifiche non valide
            }
            
            const alpha = notification.life > 60 ? 1.0 : notification.life / 60;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = notification.color || '#ffffff';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            
            // Testo con outline
            ctx.strokeText(notification.text, notification.x, notification.y);
            ctx.fillText(notification.text, notification.x, notification.y);
        }
        
        ctx.restore();
    }

    showMaterialsInventory() {
        if (!this.player.materials) {
            this.player.materials = {};
        }

        const container = this.dom.containers.materialsInventory;
        if (!container) {
            console.warn('Container materiali non trovato nel DOM');
            return;
        }
        
        container.innerHTML = '';
        container.className = 'materials-inventory';

        // Raccogli tutti i materiali per categoria
        const categories = ['common', 'rare', 'epic', 'legendary'];
        const categoryNames = {
            common: 'Comuni',
            rare: 'Rari', 
            epic: 'Epici',
            legendary: 'Leggendari'
        };

        categories.forEach(category => {
            const categoryMaterials = [];
            
            // Trova tutti i materiali di questa categoria che il giocatore ha
            for (const [materialId, count] of Object.entries(this.player.materials)) {
                const materialInfo = this.getMaterialInfo(materialId);
                if (materialInfo && this.getMaterialCategory(materialId) === category && count > 0) {
                    categoryMaterials.push({ id: materialId, info: materialInfo, count });
                }
            }

            if (categoryMaterials.length > 0) {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = `material-category ${category}`;
                categoryDiv.innerHTML = `<h3>${categoryNames[category]}</h3>`;
                
                categoryMaterials.forEach(material => {
                    const materialDiv = document.createElement('div');
                    materialDiv.className = 'material-item';
                    materialDiv.innerHTML = `
                        <div class="material-icon" style="background-color: ${material.info.color}"></div>
                        <div class="material-info">
                            <div class="material-name">${material.info.name}</div>
                            <div class="material-count">x${material.count}</div>
                        </div>
                    `;
                    categoryDiv.appendChild(materialDiv);
                });
                
                container.appendChild(categoryDiv);
            }
        });

        if (container.children.length === 0) {
            container.innerHTML = '<p>Nessun materiale raccolto ancora!</p>';
        }

        // Mostra il popup usando il sistema esistente
        this.showPopup('materialsInventory');
    }

    getMaterialInfo(materialId) {
        for (const category of Object.values(CONFIG.materials)) {
            if (category[materialId]) {
                return category[materialId];
            }
        }
        return null;
    }

    getMaterialCategory(materialId) {
        for (const [categoryName, category] of Object.entries(CONFIG.materials)) {
            if (category[materialId]) {
                return categoryName;
            }
        }
        return null;
    }
}

// Stato runtime degli archetipi acquistati (non salvato in localStorage)
let unlockedArchetypes = new Set(['standard']);

let game;
window.addEventListener('DOMContentLoaded', () => { 
    game = new BallSurvivalGame('gameCanvas'); 
});