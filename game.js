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
            desc: "Incredibilmente resistente ma molto lenta. Ideale per chi ama la mischia.",
            startingWeapon: 'shockwave',
            bonus: "+70% Riduzione Danno (DR) base. Shockwave: +20% danno, +30% knockback.",
            malus: "-40% Velocità di movimento, -30% Velocità di attacco.",
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
    
    // Sistema di Materiali
    materials: {
        // Materiali per Core (rivestimenti della sfera)
        coreMaterials: {
            'iron_fragment': { id: 'iron_fragment', name: 'Frammento di Ferro', rarity: 'common', color: '#8B7355', dropChance: 0.25, enemyTypes: ['all'] },
            'steel_fragment': { id: 'steel_fragment', name: 'Frammento di Acciaio', rarity: 'uncommon', color: '#708090', dropChance: 0.15, enemyTypes: ['elite', 'boss'] },
            'crystal_fragment': { id: 'crystal_fragment', name: 'Frammento di Cristallo', rarity: 'rare', color: '#87CEEB', dropChance: 0.10, enemyTypes: ['boss'] },
            'magma_fragment': { id: 'magma_fragment', name: 'Frammento di Magma', rarity: 'epic', color: '#FF4500', dropChance: 0.08, enemyTypes: ['boss', 'elite'] },
            'void_fragment': { id: 'void_fragment', name: 'Frammento del Vuoto', rarity: 'legendary', color: '#8A2BE2', dropChance: 0.03, enemyTypes: ['boss'] }
        },
        
        // Materiali per Armi (esterne)
        weaponMaterials: {
            'wood_fragment': { id: 'wood_fragment', name: 'Frammento di Legno', rarity: 'common', color: '#8B4513', dropChance: 0.20, enemyTypes: ['all'] },
            'stone_fragment': { id: 'stone_fragment', name: 'Frammento di Pietra', rarity: 'common', color: '#696969', dropChance: 0.18, enemyTypes: ['all'] },
            'metal_fragment': { id: 'metal_fragment', name: 'Frammento di Metallo', rarity: 'uncommon', color: '#C0C0C0', dropChance: 0.12, enemyTypes: ['elite', 'boss'] },
            'energy_fragment': { id: 'energy_fragment', name: 'Frammento di Energia', rarity: 'rare', color: '#00FFFF', dropChance: 0.08, enemyTypes: ['boss'] },
            'cosmic_fragment': { id: 'cosmic_fragment', name: 'Frammento Cosmico', rarity: 'epic', color: '#FF1493', dropChance: 0.05, enemyTypes: ['boss'] }
        }
    },
    
    // Core disponibili (rivestimenti della sfera) - MAX 1 per tipo
    cores: {
        'magnetic': { 
            id: 'magnetic', 
            name: 'Core Magnetico', 
            desc: 'Anelli magnetici rotanti che attirano gemme e XP da +50% distanza. Effetto visivo: anelli blu rotanti',
            materials: { 'iron_fragment': 3, 'steel_fragment': 1 },
            effect: { type: 'magnet', range: 1.5 },
            maxLevel: 1, // Solo 1 livello
            upgradeCost: null // Non potenziabile
        },
        'reflection': { 
            id: 'reflection', 
            name: 'Core Riflettente', 
            desc: 'Scudo dorato che riflette il 30% dei proiettili nemici. Effetto visivo: scudo con scintille bianche',
            materials: { 'steel_fragment': 2, 'crystal_fragment': 1 },
            effect: { type: 'reflect', chance: 0.3 },
            maxLevel: 1,
            upgradeCost: null
        },
        'bounce': { 
            id: 'bounce', 
            name: 'Core Rimbalzante', 
            desc: 'Spine arancioni che rimbalzano sui nemici infliggendo +15 danno. Effetto visivo: spine rotanti',
            materials: { 'iron_fragment': 2, 'wood_fragment': 2 },
            effect: { type: 'bounce', damage: 15 },
            maxLevel: 1,
            upgradeCost: null
        },
        'speed': { 
            id: 'speed', 
            name: 'Core di Velocità', 
            desc: 'Scie ciano che aumentano la velocità di +15%. Effetto visivo: scie multiple rotanti',
            materials: { 'crystal_fragment': 1, 'energy_fragment': 1 },
            effect: { type: 'speed', bonus: 0.15 },
            maxLevel: 1,
            upgradeCost: null
        },
        'resistance': { 
            id: 'resistance', 
            name: 'Core di Resistenza', 
            desc: 'Barriera marrone che riduce i danni ricevuti del 10%. Effetto visivo: doppia barriera',
            materials: { 'steel_fragment': 3, 'stone_fragment': 2 },
            effect: { type: 'resistance', dr: 0.1 },
            maxLevel: 1,
            upgradeCost: null
        },
        'amplification': { 
            id: 'amplification', 
            name: 'Core di Amplificazione', 
            desc: 'Aura rossa che potenzia il danno da contatto del 50%. Effetto visivo: aura con particelle',
            materials: { 'magma_fragment': 1, 'energy_fragment': 2 },
            effect: { type: 'amplify', multiplier: 1.5 },
            maxLevel: 1,
            upgradeCost: null
        },
        'void': { 
            id: 'void', 
            name: 'Core del Vuoto', 
            desc: 'Vortice viola che teletrasporta quando salute < 30%. Cooldown: 10s. Effetto visivo: vortice rotante',
            materials: { 'void_fragment': 1, 'cosmic_fragment': 1 },
            effect: { type: 'void_teleport', threshold: 0.3, cooldown: 10000 },
            maxLevel: 1,
            upgradeCost: null
        }
    },
    
    // Armi esterne - MAX 3 livelli per tipo
    weapons: {
        'spike_ring': { 
            id: 'spike_ring', 
            name: 'Anello di Spine', 
            desc: '12 spine marroni che danneggiano i nemici per +20 danno al contatto. Raggio: 25px. Effetto visivo: spine triangolari',
            materials: { 'wood_fragment': 3, 'stone_fragment': 2 },
            effect: { type: 'spikes', damage: 20, radius: 25 },
            maxLevel: 3,
            upgradeCost: { 'wood_fragment': 2, 'stone_fragment': 1 } // Costo per potenziamento
        },
        'energy_field': { 
            id: 'energy_field', 
            name: 'Campo Energetico', 
            desc: 'Campo ciano che rallenta nemici del 30% e infligge 10 DPS. Raggio: 40px. Effetto visivo: onde energetiche',
            materials: { 'energy_fragment': 2, 'crystal_fragment': 1 },
            effect: { type: 'field', damage: 10, slow: 0.3, radius: 40 },
            maxLevel: 3,
            upgradeCost: { 'energy_fragment': 1, 'crystal_fragment': 1 }
        },
        'orbital_shield': { 
            id: 'orbital_shield', 
            name: 'Scudo Orbitale', 
            desc: '2 scudi bianchi che orbitano intorno alla palla infliggendo +15 danno. Effetto visivo: scudi orbitanti',
            materials: { 'metal_fragment': 2, 'steel_fragment': 1 },
            effect: { type: 'orbital', count: 2, damage: 15 },
            maxLevel: 3,
            upgradeCost: { 'metal_fragment': 1, 'steel_fragment': 1 }
        },
        'pulse_wave': { 
            id: 'pulse_wave', 
            name: 'Onda Pulsante', 
            desc: 'Onde rosa che respingono i nemici infliggendo +25 danno. Cooldown: 3s. Effetto visivo: onde multiple',
            materials: { 'cosmic_fragment': 1, 'energy_fragment': 1 },
            effect: { type: 'pulse', damage: 25, knockback: 30, cooldown: 3000 },
            maxLevel: 3,
            upgradeCost: { 'cosmic_fragment': 1, 'energy_fragment': 1 }
        },
        'void_blade': { 
            id: 'void_blade', 
            name: 'Lama del Vuoto', 
            desc: '6 lame viola che tagliano i nemici per +30 danno e li rallentano del 50% per 3s. Effetto visivo: lame rotanti',
            materials: { 'void_fragment': 1, 'metal_fragment': 2 },
            effect: { type: 'void_blade', damage: 30, slow: 0.5, duration: 3000 },
            maxLevel: 3,
            upgradeCost: { 'void_fragment': 1, 'metal_fragment': 1 }
        },
        'crystal_barrier': { 
            id: 'crystal_barrier', 
            name: 'Barriera di Cristallo', 
            desc: 'Barriera azzurra che blocca l\'80% dei proiettili e riflette +15 danno. Effetto visivo: cristalli riflettenti',
            materials: { 'crystal_fragment': 2, 'stone_fragment': 3 },
            effect: { type: 'crystal_barrier', blockChance: 0.8, reflectDamage: 15 },
            maxLevel: 3,
            upgradeCost: { 'crystal_fragment': 1, 'stone_fragment': 2 }
        }
    },
    
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
                    this.stats.dr += 0.7;  // Aggiunge +70% DR
                    this.stats.speed *= 0.6;  // -40% velocità movimento
                    this.modifiers.frequency *= 0.7;  // -30% velocità attacco
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
        
        // Applica gli effetti dei core salvati
        if (this.cores && this.cores.length > 0) {
            for (const coreId of this.cores) {
                // Troviamo il gioco per applicare gli effetti
                const game = window.game;
                if (game) {
                    game.applyCoreEffect(coreId);
                }
            }
        }
        
        // Applica gli effetti delle armi salvate
        if (this.weapons && this.weapons.length > 0) {
            for (const weaponId of this.weapons) {
                // Troviamo il gioco per applicare gli effetti
                const game = window.game;
                if (game) {
                    game.applyWeaponEffect(weaponId);
                }
            }
        }
        
        // Controlli di sicurezza finali per XP
        if (this.xp < 0) this.xp = 0;
        if (this.xpNext <= 0) this.xpNext = 1;
        if (this.level < 1) this.level = 1;
        
        console.log(`Reset completato - Livello: ${this.level}, XP: ${this.xp}, XP necessario: ${this.xpNext}`);
    }
    applyPermanentUpgrades(p) { this.stats.maxHp = this.baseStats.hp + (p.health.level * 10); this.stats.speed = this.baseStats.speed + (p.speed.level * 0.1); this.stats.dr += (p.defense.level * 0.01); this.modifiers.xpGain = 1 + (p.xpGain.level * 0.05); this.modifiers.luck = p.luck.level * 0.02; this.modifiers.power = 1 + (p.power.level * 0.05); this.modifiers.frequency = 1 - (p.frequency.level * 0.03); this.modifiers.area = 1 + (p.area.level * 0.04); }
    update(game, joystick) { 
        let kDx = 0, kDy = 0; 
        if (this.keys['KeyW'] || this.keys['ArrowUp']) kDy -= 1; 
        if (this.keys['KeyS'] || this.keys['ArrowDown']) kDy += 1; 
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) kDx -= 1; 
        if (this.keys['KeyD'] || this.keys['ArrowRight']) kDx += 1; 
        let fDx = joystick.dx !== 0 ? joystick.dx : kDx; 
        let fDy = joystick.dy !== 0 ? joystick.dy : kDy; 
        const m = Math.sqrt(fDx * fDx + fDy * fDy); 
        if (m > 1) { fDx /= m; fDy /= m; } 
        this.x += fDx * this.stats.speed; 
        this.y += fDy * this.stats.speed; 
        this.x = Math.max(this.stats.radius, Math.min(CONFIG.world.width - this.stats.radius, this.x)); 
        this.y = Math.max(this.stats.radius, Math.min(CONFIG.world.height - this.stats.radius, this.y)); 
        
        // Gestione teletrasporto del Core del Vuoto
        if (this.voidTeleportConfig && this.cores && this.cores.includes('void')) {
            const healthPercentage = this.hp / this.stats.maxHp;
            if (healthPercentage <= this.voidTeleportConfig.threshold) {
                const now = Date.now();
                if (!this.lastVoidTeleport || (now - this.lastVoidTeleport) > this.voidTeleportConfig.cooldown) {
                    // Trova una posizione sicura lontana dai nemici
                    let safeX, safeY;
                    let attempts = 0;
                    do {
                        safeX = Math.random() * (CONFIG.world.width - 200) + 100;
                        safeY = Math.random() * (CONFIG.world.height - 200) + 100;
                        attempts++;
                    } while (attempts < 10 && [...game.entities.enemies, ...game.entities.bosses].some(enemy => 
                        Utils.getDistance({x: safeX, y: safeY}, enemy) < 100
                    ));
                    
                    this.x = safeX;
                    this.y = safeY;
                    this.lastVoidTeleport = now;
                    
                    // Effetto visivo del teletrasporto
                    for (let i = 0; i < 20; i++) {
                        game.addEntity('particles', new Particle(this.x, this.y, {
                            vx: (Math.random() - 0.5) * 10,
                            vy: (Math.random() - 0.5) * 10,
                            life: 60,
                            color: '#8A2BE2'
                        }));
                    }
                    
                    game.notifications.push({ 
                        text: 'Teletrasporto del Vuoto!', 
                        life: 180,
                        color: '#8A2BE2'
                    });
                }
            }
        }
        
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
        
        let damageReduction = Math.min(1.0, this.stats.dr);  // Cap DR al 100%
        // Penetrazione DR del 10% da elite, 25% da boss
        if (sourceEnemy && sourceEnemy.stats.isElite) {
            damageReduction = Math.max(0, damageReduction - 0.10);
        }
        if (sourceEnemy && sourceEnemy instanceof Boss) {
            damageReduction = Math.max(0, damageReduction - 0.25);
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
        
        // Disegna i core attivi
        this.drawActiveCores(ctx, game);
        
        // Disegna le armi attive
        this.drawActiveWeapons(ctx, game);

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
    
    drawActiveCores(ctx, game) {
        if (!game.cores || Object.keys(game.cores).length === 0) return;
        
        for (const [coreId, coreData] of Object.entries(game.cores)) {
            if (!coreData.equipped) continue; // Disegna solo i core equipaggiati
            
            const core = CONFIG.cores[coreId];
            if (!core) continue;
            
            switch (coreId) {
                case 'magnetic':
                    this.drawMagneticCore(ctx);
                    break;
                case 'reflection':
                    this.drawReflectionCore(ctx);
                    break;
                case 'bounce':
                    this.drawBounceCore(ctx);
                    break;
                case 'speed':
                    this.drawSpeedCore(ctx);
                    break;
                case 'resistance':
                    this.drawResistanceCore(ctx);
                    break;
                case 'amplification':
                    this.drawAmplificationCore(ctx);
                    break;
                case 'void':
                    this.drawVoidCore(ctx);
                    break;
            }
        }
    }
    
    drawActiveWeapons(ctx, game) {
        if (!game.weapons || Object.keys(game.weapons).length === 0) return;
        
        for (const [weaponId, weaponData] of Object.entries(game.weapons)) {
            if (!weaponData.equipped) continue; // Disegna solo le armi equipaggiate
            
            const weapon = CONFIG.weapons[weaponId];
            if (!weapon) continue;
            
            switch (weaponId) {
                case 'spike_ring':
                    this.drawSpikeRing(ctx);
                    break;
                case 'energy_field':
                    this.drawEnergyField(ctx);
                    break;
                case 'orbital_shield':
                    this.drawOrbitalShield(ctx);
                    break;
                case 'pulse_wave':
                    this.drawPulseWave(ctx);
                    break;
                case 'void_blade':
                    this.drawVoidBlade(ctx);
                    break;
                case 'crystal_barrier':
                    this.drawCrystalBarrier(ctx);
                    break;
            }
        }
    }
    
    // Sprite dei Core
    drawMagneticCore(ctx) {
        // Anelli magnetici rotanti con particelle
        const time = Date.now() / 1000;
        const radius = this.stats.radius + 12;
        
        ctx.save();
        
        // Particelle magnetiche che orbitano
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time * 3;
            const particleRadius = radius + Math.sin(time * 4 + i) * 5;
            const x = this.x + Math.cos(angle) * particleRadius;
            const y = this.y + Math.sin(angle) * particleRadius;
            
            // Gradiente per ogni particella
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 6);
            gradient.addColorStop(0, 'rgba(74, 144, 226, 1)');
            gradient.addColorStop(0.5, 'rgba(74, 144, 226, 0.6)');
            gradient.addColorStop(1, 'rgba(74, 144, 226, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Anelli magnetici multipli
        for (let i = 0; i < 3; i++) {
            const ringRadius = radius + i * 8;
            const rotationSpeed = time * (2 + i * 0.5);
            
            ctx.strokeStyle = `rgba(74, 144, 226, ${0.8 - i * 0.2})`;
            ctx.lineWidth = 3 - i;
            ctx.globalAlpha = 0.9 - i * 0.2;
            
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(rotationSpeed);
            
            // Anello tratteggiato
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.restore();
        }
        
        // Campo magnetico pulsante
        const pulseRadius = radius + Math.sin(time * 6) * 10;
        const pulseAlpha = 0.3 + Math.sin(time * 6) * 0.2;
        
        ctx.strokeStyle = `rgba(74, 144, 226, ${pulseAlpha})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    drawReflectionCore(ctx) {
        // Scudo riflettente con specchi e prismi
        const time = Date.now() / 1000;
        const radius = this.stats.radius + 10;
        
        ctx.save();
        
        // Scudo principale con gradiente
        const shieldGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, radius);
        shieldGradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
        shieldGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.4)');
        shieldGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        
        ctx.fillStyle = shieldGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Bordo riflettente
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Prismi riflettenti rotanti
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time * 2;
            const prismRadius = radius * 0.7;
            const x = this.x + Math.cos(angle) * prismRadius;
            const y = this.y + Math.sin(angle) * prismRadius;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle + time * 3);
            
            // Disegna prisma triangolare
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.moveTo(0, -6);
            ctx.lineTo(-4, 4);
            ctx.lineTo(4, 4);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }
        
        // Raggi di luce riflessi
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + time * 1.5;
            const rayLength = 15 + Math.sin(time * 4 + i) * 5;
            const x1 = this.x + Math.cos(angle) * radius;
            const y1 = this.y + Math.sin(angle) * radius;
            const x2 = this.x + Math.cos(angle) * (radius + rayLength);
            const y2 = this.y + Math.sin(angle) * (radius + rayLength);
            
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 + Math.sin(time * 4 + i) * 0.4})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        
        // Scintille dorate
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + time * 4;
            const sparkRadius = radius + Math.sin(time * 6 + i) * 8;
            const x = this.x + Math.cos(angle) * sparkRadius;
            const y = this.y + Math.sin(angle) * sparkRadius;
            
            const sparkGradient = ctx.createRadialGradient(x, y, 0, x, y, 4);
            sparkGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            sparkGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.8)');
            sparkGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            
            ctx.fillStyle = sparkGradient;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    drawBounceCore(ctx) {
        // Spine rimbalzanti
        const time = Date.now() / 1000;
        const radius = this.stats.radius + 10;
        
        ctx.save();
        ctx.fillStyle = '#FF6B35';
        ctx.globalAlpha = 0.8;
        
        // Spine esterne
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time;
            const x = this.x + Math.cos(angle) * radius;
            const y = this.y + Math.sin(angle) * radius;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    drawSpeedCore(ctx) {
        // Scie di velocità con particelle e onde d'urto
        const time = Date.now() / 1000;
        const radius = this.stats.radius + 8;
        
        ctx.save();
        
        // Particelle di velocità che seguono il movimento
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + time * 8;
            const particleRadius = radius + Math.sin(time * 6 + i) * 8;
            const x = this.x + Math.cos(angle) * particleRadius;
            const y = this.y + Math.sin(angle) * particleRadius;
            
            // Gradiente per particelle di velocità
            const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, 4);
            particleGradient.addColorStop(0, 'rgba(0, 255, 255, 1)');
            particleGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.6)');
            particleGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
            
            ctx.fillStyle = particleGradient;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Scie multiple con effetti di velocità
        for (let i = 0; i < 4; i++) {
            const offset = (i / 4) * Math.PI * 2 + time * 6;
            const sciaRadius = radius + i * 6;
            const alpha = 0.8 - i * 0.15;
            
            ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
            ctx.lineWidth = 3 - i * 0.5;
            ctx.globalAlpha = alpha;
            
            // Scia principale
            ctx.beginPath();
            ctx.arc(this.x, this.y, sciaRadius, offset, offset + Math.PI * 1.5);
            ctx.stroke();
            
            // Scia secondaria
            ctx.beginPath();
            ctx.arc(this.x, this.y, sciaRadius * 0.7, offset + Math.PI, offset + Math.PI * 2.5);
            ctx.stroke();
        }
        
        // Onde d'urto di velocità
        for (let i = 0; i < 3; i++) {
            const shockRadius = radius + 15 + i * 8 + Math.sin(time * 8 + i) * 5;
            const shockAlpha = 0.4 - i * 0.1;
            
            ctx.strokeStyle = `rgba(0, 255, 255, ${shockAlpha})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 5]);
            ctx.beginPath();
            ctx.arc(this.x, this.y, shockRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Campo di velocità pulsante
        const speedFieldRadius = radius + Math.sin(time * 10) * 12;
        const speedFieldAlpha = 0.2 + Math.sin(time * 10) * 0.1;
        
        ctx.setLineDash([]);
        ctx.strokeStyle = `rgba(0, 255, 255, ${speedFieldAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, speedFieldRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    drawResistanceCore(ctx) {
        // Barriera di resistenza
        const radius = this.stats.radius + 12;
        
        ctx.save();
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.7;
        
        // Barriera esterna
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Barriera interna
        ctx.strokeStyle = '#A0522D';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    drawAmplificationCore(ctx) {
        // Aura di amplificazione
        const time = Date.now() / 1000;
        const radius = this.stats.radius + 8;
        
        ctx.save();
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, radius);
        gradient.addColorStop(0, 'rgba(255, 69, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Particelle di energia
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 + time * 2;
            const x = this.x + Math.cos(angle) * radius * 0.6;
            const y = this.y + Math.sin(angle) * radius * 0.6;
            
            ctx.fillStyle = '#FF4500';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    drawVoidCore(ctx) {
        // Aura del vuoto
        const time = Date.now() / 1000;
        const radius = this.stats.radius + 15;
        
        ctx.save();
        ctx.strokeStyle = '#8A2BE2';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.9;
        
        // Anello del vuoto
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Vortice interno
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(time * -1.5);
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        
        // Particelle del vuoto
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + time * 3;
            const x = this.x + Math.cos(angle) * radius * 0.8;
            const y = this.y + Math.sin(angle) * radius * 0.8;
            
            ctx.fillStyle = '#8A2BE2';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    // Sprite delle Armi
    drawSpikeRing(ctx) {
        // Anello di spine rotanti con effetti metallici
        const time = Date.now() / 1000;
        const radius = this.stats.radius + 25;
        
        ctx.save();
        
        // Anello base metallico
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Spine dinamiche rotanti
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2 + time * 2;
            const spikeRadius = radius + Math.sin(time * 4 + i) * 3;
            const x = this.x + Math.cos(angle) * spikeRadius;
            const y = this.y + Math.sin(angle) * spikeRadius;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle + time * 3);
            
            // Gradiente per ogni spina
            const spikeGradient = ctx.createLinearGradient(0, -12, 0, 12);
            spikeGradient.addColorStop(0, '#8B4513');
            spikeGradient.addColorStop(0.5, '#A0522D');
            spikeGradient.addColorStop(1, '#8B4513');
            
            ctx.fillStyle = spikeGradient;
            ctx.globalAlpha = 0.9;
            
            // Disegna spina triangolare
            ctx.beginPath();
            ctx.moveTo(0, -12);
            ctx.lineTo(-6, 0);
            ctx.lineTo(-3, 8);
            ctx.lineTo(3, 8);
            ctx.lineTo(6, 0);
            ctx.closePath();
            ctx.fill();
            
            // Bordo della spina
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            ctx.restore();
        }
        
        // Particelle metalliche che orbitano
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time * 4;
            const particleRadius = radius * 0.6;
            const x = this.x + Math.cos(angle) * particleRadius;
            const y = this.y + Math.sin(angle) * particleRadius;
            
            const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, 3);
            particleGradient.addColorStop(0, 'rgba(139, 69, 19, 1)');
            particleGradient.addColorStop(0.5, 'rgba(160, 82, 45, 0.8)');
            particleGradient.addColorStop(1, 'rgba(139, 69, 19, 0)');
            
            ctx.fillStyle = particleGradient;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Campo di forza delle spine
        const forceFieldRadius = radius + Math.sin(time * 6) * 8;
        const forceFieldAlpha = 0.3 + Math.sin(time * 6) * 0.2;
        
        ctx.strokeStyle = `rgba(139, 69, 19, ${forceFieldAlpha})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(this.x, this.y, forceFieldRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    drawEnergyField(ctx) {
        // Campo energetico con particelle e fulmini
        const time = Date.now() / 1000;
        const radius = this.stats.radius + 30;
        
        ctx.save();
        
        // Campo energetico principale con gradiente
        const fieldGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, radius);
        fieldGradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
        fieldGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.4)');
        fieldGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        ctx.fillStyle = fieldGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Bordo energetico pulsante
        const borderRadius = radius + Math.sin(time * 8) * 5;
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(this.x, this.y, borderRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Onde energetiche multiple
        for (let i = 0; i < 4; i++) {
            const waveRadius = radius + i * 8 + Math.sin(time * 3 + i) * 6;
            const waveAlpha = 0.6 - i * 0.15;
            
            ctx.strokeStyle = `rgba(0, 255, 255, ${waveAlpha})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 5]);
            ctx.beginPath();
            ctx.arc(this.x, this.y, waveRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Particelle energetiche che orbitano
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + time * 5;
            const particleRadius = radius * 0.7 + Math.sin(time * 4 + i) * 10;
            const x = this.x + Math.cos(angle) * particleRadius;
            const y = this.y + Math.sin(angle) * particleRadius;
            
            const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, 5);
            particleGradient.addColorStop(0, 'rgba(0, 255, 255, 1)');
            particleGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.6)');
            particleGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
            
            ctx.fillStyle = particleGradient;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Fulmini energetici
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + time * 2;
            const lightningLength = 20 + Math.sin(time * 6 + i) * 10;
            const x1 = this.x + Math.cos(angle) * radius;
            const y1 = this.y + Math.sin(angle) * radius;
            const x2 = this.x + Math.cos(angle) * (radius + lightningLength);
            const y2 = this.y + Math.sin(angle) * (radius + lightningLength);
            
            ctx.strokeStyle = `rgba(0, 255, 255, ${0.8 + Math.sin(time * 8 + i) * 0.2})`;
            ctx.lineWidth = 3;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        
        // Nucleo energetico centrale
        const coreRadius = 8 + Math.sin(time * 10) * 3;
        const coreGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, coreRadius);
        coreGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        coreGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.8)');
        coreGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, coreRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    drawOrbitalShield(ctx) {
        // Scudi orbitali (già implementati nella classe Orbital)
        // Questo metodo serve solo per compatibilità
    }
    
    drawPulseWave(ctx) {
        // Onda pulsante
        const time = Date.now() / 1000;
        const radius = this.stats.radius + 30;
        
        ctx.save();
        ctx.strokeStyle = '#FF1493';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.7;
        
        // Onda principale
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Onde secondarie
        for (let i = 1; i <= 2; i++) {
            const waveRadius = radius + i * 10;
            ctx.globalAlpha = 0.5 - i * 0.2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, waveRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    drawVoidBlade(ctx) {
        // Lame del vuoto
        const time = Date.now() / 1000;
        const radius = this.stats.radius + 18;
        
        ctx.save();
        ctx.strokeStyle = '#8A2BE2';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;
        
        // Lame rotanti
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + time * 2;
            const x1 = this.x + Math.cos(angle) * radius;
            const y1 = this.y + Math.sin(angle) * radius;
            const x2 = this.x + Math.cos(angle) * (radius + 12);
            const y2 = this.y + Math.sin(angle) * (radius + 12);
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    drawCrystalBarrier(ctx) {
        // Barriera di cristallo
        const time = Date.now() / 1000;
        const radius = this.stats.radius + 22;
        
        ctx.save();
        ctx.strokeStyle = '#87CEEB';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.8;
        
        // Barriera principale
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Cristalli riflettenti
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = this.x + Math.cos(angle) * radius;
            const y = this.y + Math.sin(angle) * radius;
            
            ctx.fillStyle = '#87CEEB';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
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
        
        // Drop di materiali basato su tipo di nemico
        this.dropMaterials(game);
        
        for (let j = 0; j < 8; j++) {
            game.addEntity('particles', new Particle(this.x, this.y, { vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 20, color: this.color }));
        }
    }
    
    dropMaterials(game) {
        const enemyType = this.isElite ? 'elite' : (this.isBoss ? 'boss' : 'normal');
        
        // Drop di materiali per core
        for (const [materialId, material] of Object.entries(CONFIG.materials.coreMaterials)) {
            if (material.enemyTypes.includes('all') || material.enemyTypes.includes(enemyType)) {
                const dropChance = material.dropChance * (1 + game.player.modifiers.luck);
                if (Math.random() < dropChance) {
                    game.addEntity('materialOrbs', new MaterialOrb(this.x + (Math.random() - 0.5) * 20, this.y + (Math.random() - 0.5) * 20, materialId));
                }
            }
        }
        
        // Drop di materiali per armi
        for (const [materialId, material] of Object.entries(CONFIG.materials.weaponMaterials)) {
            if (material.enemyTypes.includes('all') || material.enemyTypes.includes(enemyType)) {
                const dropChance = material.dropChance * (1 + game.player.modifiers.luck);
                if (Math.random() < dropChance) {
                    game.addEntity('materialOrbs', new MaterialOrb(this.x + (Math.random() - 0.5) * 20, this.y + (Math.random() - 0.5) * 20, materialId));
                }
            }
        }
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
    constructor(x, y, materialId) { 
        super(x, y); 
        this.materialId = materialId;
        this.material = CONFIG.materials.coreMaterials[materialId] || CONFIG.materials.weaponMaterials[materialId];
        this.life = 900; // 15 secondi
    }
    
    update(game) {
        this.life--;
        if (this.life <= 0) this.toRemove = true;
        
        const player = game.player;
        const dist = Utils.getDistance(this, player);
        
        // Attrazione magnetica se il player ha il core magnetico
        const magnetRange = 150;
        if (dist < magnetRange) {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            const speed = Math.max(3, (magnetRange - dist) * 0.08);
            this.x += Math.cos(angle) * speed; 
            this.y += Math.sin(angle) * speed;
        }
        
        if (dist < 20) { 
            game.addMaterial(this.materialId, 1);
            this.toRemove = true; 
        }
    }
    
    draw(ctx) {
        const rarity = this.material.rarity;
        const colors = {
            'common': '#8B7355',
            'uncommon': '#708090', 
            'rare': '#87CEEB',
            'epic': '#FF4500',
            'legendary': '#8A2BE2'
        };
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Date.now() / 800);
        
        // Effetto di rarità
        const pulse = Math.sin(Date.now() / 200) * 2;
        const size = 8 + (rarity === 'legendary' ? pulse : 0);
        
        // Colore base
        ctx.fillStyle = colors[rarity] || '#8B7355';
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Bordo per rarità più alte
        if (rarity !== 'common') {
            ctx.strokeStyle = rarity === 'legendary' ? '#FFD700' : '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Effetto speciale per legendary
        if (rarity === 'legendary') {
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(0, 0, size + 4, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
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
        this.materials = {}; // Inizializza l'inventario materiali
        this.cores = {}; // Inizializza i core
        this.weapons = {}; // Inizializza le armi
        this.arsenal = {
            activeCore: null, // Solo 1 core attivo
            activeWeapons: [] // Max 2 armi attive
        };
        this.loadGameData(); 
        this.loadStageProgress(); // Carica la progressione degli stage
        this.resetRunState(); 
        this.resizeCanvas();
        this.populateCharacterSelection();
        this.populateStageSelection();
        this.updateCharacterPreview(); // Inizializza l'anteprima del personaggio
        this.showPopup('start');
    }

    initDOM() {
        this.dom = {
            gameContainer: document.getElementById('gameContainer'),
            popups: { start: document.getElementById('startScreen'), pause: document.getElementById('pauseMenu'), gameOver: document.getElementById('gameOver'), upgrade: document.getElementById('upgradeMenu'), shop: document.getElementById('permanentUpgradeShop'), inventory: document.getElementById('inventoryMenu'), characterSelection: document.getElementById('characterSelectionPopup') },
            buttons: { start: document.getElementById('startGameBtn'), restart: document.getElementById('restartGameBtn'), restartFromPause: document.getElementById('restartFromPauseBtn'), pause: document.getElementById('pauseButton'), load: document.getElementById('loadGameBtn'), copy: document.getElementById('copyCodeBtn'), generateDebugSave: document.getElementById('generateDebugSave'), copyDebugCodeBtn: document.getElementById('copyDebugCodeBtn'), returnToMenu: document.getElementById('returnToMenuBtn'), returnToMenuPause: document.getElementById('returnToMenuPauseBtn'), inventory: document.getElementById('inventoryBtn'), closeInventory: document.getElementById('closeInventoryBtn'), openCharacterPopup: document.getElementById('openCharacterPopupBtn'), closeCharacterPopup: document.getElementById('closeCharacterPopupBtn') },
            inputs: { saveCode: document.getElementById('saveCodeOutput'), loadCode: document.getElementById('loadCodeInput'), debugSaveOutput: document.getElementById('debugSaveOutput') },
            containers: { 
                debugSaveContainer: document.getElementById('debugSaveContainer'),
                characterSelectionContainer: document.getElementById('characterSelectionContainer'),
                stageSelectionContainer: document.getElementById('stageSelectionContainer'),
                permanentUpgradeOptions: document.getElementById('permanentUpgradeOptions'),
                upgradeOptions: document.getElementById('upgradeOptions'),
                pauseStatsContainer: document.getElementById('pauseStatsContainer'),
                runStatsContainer: document.getElementById('runStatsContainer'),
                coreMaterialsList: document.getElementById('coreMaterialsList'),
                weaponMaterialsList: document.getElementById('weaponMaterialsList'),
                coresList: document.getElementById('coresList'),
                weaponsList: document.getElementById('weaponsList'),
                selectedCharacterPreview: document.getElementById('selectedCharacterPreview'),
                stageDropdown: document.getElementById('stageDropdown')
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
        
        // Pulsante inventario
        this.dom.buttons.inventory.onclick = () => this.showInventory();
        this.dom.buttons.closeInventory.onclick = () => this.closeInventory();
        
        // Pulsanti popup personaggi
        this.dom.buttons.openCharacterPopup.onclick = () => this.showCharacterPopup();
        this.dom.buttons.closeCharacterPopup.onclick = () => this.hideCharacterPopup();
        
        // Pulsante chiudi negozio
        const closeShopBtn = document.getElementById('closeShopBtn');
        if (closeShopBtn) {
            closeShopBtn.onclick = () => this.hideAllPopups();
        }
        
        // Dropdown stage
        this.dom.containers.stageDropdown.onchange = (e) => {
            this.selectStage(parseInt(e.target.value));
        };
        
        // Tasto pausa mobile
        const pauseBtnMobile = document.getElementById('pauseButtonMobile');
        if (pauseBtnMobile) {
            pauseBtnMobile.onclick = () => this.togglePause();
        }

        this.dom.menuOverlay.onclick = () => {
            if (this.state === 'gameOver' || this.state === 'startScreen') {
                return; 
            }
            
            // Se il popup dei personaggi è aperto, torna al menù principale
            if (this.dom.popups.characterSelection.style.display === 'flex') {
                this.hideCharacterPopup();
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
        
        // Applica gli effetti dei core e delle armi salvati
        if (this.cores && Object.keys(this.cores).length > 0) {
            for (const [coreId, coreData] of Object.entries(this.cores)) {
                if (coreData.equipped) {
                    this.applyCoreEffect(coreId);
                }
            }
        }
        
        if (this.weapons && Object.keys(this.weapons).length > 0) {
            for (const [weaponId, weaponData] of Object.entries(this.weapons)) {
                if (weaponData.equipped) {
                    this.applyWeaponEffect(weaponId);
                }
            }
        }
        
        this.hideAllPopups(true); 
        this.dom.inGameUI.container.style.display = 'flex';
        this.dom.buttons.pause.style.display = 'flex';
        this.state = 'running'; 
        this.lastFrameTime = performance.now();
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
        
        // NON reinizializzare materiali e arsenale - vengono mantenuti tra le run
        // this.materials, this.cores, this.weapons, this.arsenal rimangono invariati
        
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
        
        // Aggiorna gli effetti delle armi
        this.updateWeaponEffects();
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
    
    // Sistema di gestione materiali
    addMaterial(materialId, amount = 1) {
        console.log(`addMaterial chiamato: ${materialId}, quantità: ${amount}`);
        
        if (!this.materials[materialId]) {
            this.materials[materialId] = 0;
        }
        this.materials[materialId] += amount;
        
        console.log(`Materiali aggiornati:`, this.materials);
        
        // Notifica al giocatore
        const material = CONFIG.materials.coreMaterials[materialId] || CONFIG.materials.weaponMaterials[materialId];
        if (material) {
            this.notifications.push({ 
                text: `+${amount} ${material.name}`, 
                life: 180,
                color: material.color 
            });
        }
        
        // Salva i dati dopo aver aggiunto materiali
        this.saveGameData();
    }
    
    canCraftCore(coreId) {
        const core = CONFIG.cores[coreId];
        if (!core) return false;
        
        // Controlla se il core esiste già
        if (this.cores[coreId]) {
            return false; // Core già posseduto
        }
        
        // Controlla materiali
        for (const [materialId, required] of Object.entries(core.materials)) {
            if (!this.materials[materialId] || this.materials[materialId] < required) {
                return false;
            }
        }
        return true;
    }
    
    canCraftWeapon(weaponId) {
        const weapon = CONFIG.weapons[weaponId];
        if (!weapon) return false;
        
        const weaponData = this.weapons[weaponId];
        
        // Se l'arma non esiste, controlla materiali per crearla
        if (!weaponData) {
            for (const [materialId, required] of Object.entries(weapon.materials)) {
                if (!this.materials[materialId] || this.materials[materialId] < required) {
                    return false;
                }
            }
            return true;
        }
        
        // Se l'arma esiste, controlla se può essere potenziata
        if (weaponData.level >= weapon.maxLevel) {
            return false; // Livello massimo raggiunto
        }
        
        // Controlla materiali per potenziamento
        for (const [materialId, required] of Object.entries(weapon.upgradeCost)) {
            if (!this.materials[materialId] || this.materials[materialId] < required) {
                return false;
            }
        }
        return true;
    }
    
    craftCore(coreId) {
        if (!this.canCraftCore(coreId)) return false;
        
        const core = CONFIG.cores[coreId];
        
        // Consuma i materiali
        for (const [materialId, required] of Object.entries(core.materials)) {
            this.materials[materialId] -= required;
        }
        
        // Aggiungi il core all'arsenale
        this.cores[coreId] = { level: 1, equipped: false };
        
        // Se non c'è un core attivo, equipaggia questo
        if (!this.arsenal.activeCore) {
            this.equipCore(coreId);
        }
        
        this.notifications.push({ 
            text: `Core creato: ${core.name}`, 
            life: 300,
            color: '#FFD700' 
        });
        
        this.saveGameData();
        return true;
    }
    
    craftWeapon(weaponId) {
        if (!this.canCraftWeapon(weaponId)) return false;
        
        const weapon = CONFIG.weapons[weaponId];
        const weaponData = this.weapons[weaponId];
        
        if (!weaponData) {
            // Crea nuova arma
            for (const [materialId, required] of Object.entries(weapon.materials)) {
                this.materials[materialId] -= required;
            }
            
            this.weapons[weaponId] = { level: 1, equipped: false };
            
            // Se c'è spazio nell'arsenale, equipaggia l'arma
            if (this.arsenal.activeWeapons.length < 2) {
                this.equipWeapon(weaponId);
            }
            
            this.notifications.push({ 
                text: `Arma creata: ${weapon.name}`, 
                life: 300,
                color: '#FFD700' 
            });
        } else {
            // Potenzia arma esistente
            for (const [materialId, required] of Object.entries(weapon.upgradeCost)) {
                this.materials[materialId] -= required;
            }
            
            weaponData.level++;
            
            this.notifications.push({ 
                text: `${weapon.name} potenziata al livello ${weaponData.level}!`, 
                life: 300,
                color: '#FFD700' 
            });
        }
        
        this.saveGameData();
        return true;
    }
    
    applyCoreEffect(coreId) {
        const core = CONFIG.cores[coreId];
        if (!core) return;
        
        switch (core.effect.type) {
            case 'magnet':
                // Il core magnetico è già implementato nel MaterialOrb
                break;
            case 'reflect':
                this.player.modifiers.reflectChance = (this.player.modifiers.reflectChance || 0) + core.effect.chance;
                break;
            case 'bounce':
                this.player.modifiers.bounceDamage = (this.player.modifiers.bounceDamage || 0) + core.effect.damage;
                break;
            case 'speed':
                this.player.stats.speed += core.effect.bonus;
                break;
            case 'resistance':
                this.player.stats.dr += core.effect.dr;
                break;
            case 'amplify':
                this.player.modifiers.contactMultiplier = (this.player.modifiers.contactMultiplier || 1) * core.effect.multiplier;
                break;
            case 'void_teleport':
                // Il teletrasporto viene gestito nel metodo update del player
                this.player.voidTeleportConfig = core.effect;
                break;
        }
    }
    
    // Metodi per gestire l'arsenale
    equipCore(coreId) {
        if (!this.cores[coreId]) return false;
        
        // Disequipaggia il core attuale
        if (this.arsenal.activeCore) {
            this.cores[this.arsenal.activeCore].equipped = false;
        }
        
        // Equipaggia il nuovo core
        this.arsenal.activeCore = coreId;
        this.cores[coreId].equipped = true;
        
        // Applica l'effetto del core
        this.applyCoreEffect(coreId);
        
        this.notifications.push({ 
            text: `Core equipaggiato: ${CONFIG.cores[coreId].name}`, 
            life: 300,
            color: '#00FF00' 
        });
        
        return true;
    }
    
    equipWeapon(weaponId) {
        if (!this.weapons[weaponId]) return false;
        if (this.arsenal.activeWeapons.length >= 2) return false;
        
        this.arsenal.activeWeapons.push(weaponId);
        this.weapons[weaponId].equipped = true;
        
        this.notifications.push({ 
            text: `Arma equipaggiata: ${CONFIG.weapons[weaponId].name}`, 
            life: 300,
            color: '#00FF00' 
        });
        
        return true;
    }
    
    unequipWeapon(weaponId) {
        const index = this.arsenal.activeWeapons.indexOf(weaponId);
        if (index === -1) return false;
        
        this.arsenal.activeWeapons.splice(index, 1);
        this.weapons[weaponId].equipped = false;
        
        this.notifications.push({ 
            text: `Arma rimossa: ${CONFIG.weapons[weaponId].name}`, 
            life: 300,
            color: '#FF0000' 
        });
        
        return true;
    }
    
    applyWeaponEffect(weaponId) {
        const weapon = CONFIG.weapons[weaponId];
        if (!weapon) return;
        
        // Gli effetti delle armi verranno applicati durante il gameplay
        console.log(`Effetto arma applicato: ${weapon.name}`);
    }
    
    updateWeaponEffects() {
        if (!this.arsenal.activeWeapons || this.arsenal.activeWeapons.length === 0) return;
        
        for (const weaponId of this.arsenal.activeWeapons) {
            const weapon = CONFIG.weapons[weaponId];
            const weaponData = this.weapons[weaponId];
            if (!weapon || !weaponData) continue;
            
            switch (weapon.effect.type) {
                case 'spikes':
                    // Danno da contatto con spine
                    [...this.entities.enemies, ...this.entities.bosses].forEach(enemy => {
                        const dist = Utils.getDistance(this.player, enemy);
                        if (dist < this.player.stats.radius + weapon.effect.radius) {
                            enemy.takeDamage(weapon.effect.damage, this);
                        }
                    });
                    break;
                    
                case 'field':
                    // Campo energetico che rallenta e danneggia
                    [...this.entities.enemies, ...this.entities.bosses].forEach(enemy => {
                        const dist = Utils.getDistance(this.player, enemy);
                        if (dist < weapon.effect.radius) {
                            enemy.takeDamage(weapon.effect.damage / 60, this); // DPS
                            enemy.slowAmount = weapon.effect.slow;
                            enemy.slowTimer = 60; // 1 secondo
                        }
                    });
                    break;
                    
                case 'orbital':
                    // Scudi orbitali
                    if (!this.player.orbitals) this.player.orbitals = [];
                    if (this.player.orbitals.length < weapon.effect.count) {
                        const angle = (this.player.orbitals.length / weapon.effect.count) * Math.PI * 2;
                        this.addEntity('orbitals', new Orbital(this.player.x, this.player.y, {
                            angle: angle,
                            distance: 40,
                            rotationSpeed: 0.05,
                            damage: weapon.effect.damage,
                            radius: 8
                        }));
                    }
                    break;
                    
                case 'pulse':
                    // Onda pulsante (una volta ogni cooldown)
                    if (!this.player.lastPulseTime) this.player.lastPulseTime = 0;
                    if (Date.now() - this.player.lastPulseTime > weapon.effect.cooldown) {
                        this.createExplosion(this.player.x, this.player.y, weapon.effect.knockback, weapon.effect.damage);
                        this.player.lastPulseTime = Date.now();
                    }
                    break;
                    
                case 'void_blade':
                    // Lame del vuoto che rallentano
                    [...this.entities.enemies, ...this.entities.bosses].forEach(enemy => {
                        const dist = Utils.getDistance(this.player, enemy);
                        if (dist < this.player.stats.radius + 30) {
                            enemy.takeDamage(weapon.effect.damage / 60, this); // DPS
                            enemy.slowAmount = weapon.effect.slow;
                            enemy.slowTimer = weapon.effect.duration / 16; // Converti in frame
                        }
                    });
                    break;
                    
                case 'crystal_barrier':
                    // Barriera di cristallo che blocca proiettili
                    this.entities.enemyProjectiles.forEach(proj => {
                        const dist = Utils.getDistance(this.player, proj);
                        if (dist < this.player.stats.radius + 25) {
                            if (Math.random() < weapon.effect.blockChance) {
                                proj.toRemove = true;
                                // Riflette danno al nemico più vicino
                                const nearestEnemy = Utils.findNearest(this.player, [...this.entities.enemies, ...this.entities.bosses]);
                                if (nearestEnemy) {
                                    nearestEnemy.takeDamage(weapon.effect.reflectDamage, this);
                                }
                            }
                        }
                    });
                    break;
            }
        }
    }
    
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

    getDamage(baseDamage) { return baseDamage * (this.player.powerUpTimers.damageBoost > 0 ? 1.25 : 1) * this.player.modifiers.power; }
    
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
    castHeal(now) { const s = this.spells.heal; this.player.hp = Math.min(this.player.stats.maxHp, this.player.hp + s.amount); for(let i=0; i<10; i++) this.addEntity('particles', new Particle(this.player.x, this.player.y, {vx:(Math.random()-0.5)*2, vy:(Math.random()-0.5)*4 - 2, life: 40, color: '#00ff00'})); return true; }
    castSanctuary(now) {
        const s = this.spells.heal;
        this.addEntity('sanctuaries', new Sanctuary(this.player.x, this.player.y, {
            life: s.sanctuaryDuration, radius: 100 * this.player.modifiers.area, hps: s.sanctuaryHps
        }));
        return true;
    }
    castLifesteal(now) {
        const s = this.spells.heal;
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
        const container = this.dom.containers.characterSelectionContainer;
        container.innerHTML = '';
        const unlockedArchetypes = new Set(['standard']); // Standard sempre sbloccato
        if (this.totalGems >= 200) unlockedArchetypes.add('steel');
        if (this.totalGems >= 300) unlockedArchetypes.add('magma');
        if (this.totalGems >= 300) unlockedArchetypes.add('frost');
        if (this.totalGems >= 400) unlockedArchetypes.add('shadow');
        if (this.totalGems >= 500) unlockedArchetypes.add('tech');
        
        for (const key in CONFIG.characterArchetypes) {
            const archetype = CONFIG.characterArchetypes[key];
            const unlocked = unlockedArchetypes.has(archetype.id);
            const div = document.createElement('div');
            div.className = `character-option ${unlocked ? '' : 'locked'}`;
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
                    this.hideCharacterPopup();
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
                        this.updateCharacterPreview();
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
        const unlockedArchetypes = new Set(['standard']); // Standard sempre sbloccato
        if (this.totalGems >= 200) unlockedArchetypes.add('steel');
        if (this.totalGems >= 300) unlockedArchetypes.add('magma');
        if (this.totalGems >= 300) unlockedArchetypes.add('frost');
        if (this.totalGems >= 400) unlockedArchetypes.add('shadow');
        if (this.totalGems >= 500) unlockedArchetypes.add('tech');
        
        if (!unlockedArchetypes.has(archetypeId)) return;
        this.selectedArchetype = archetypeId;
        document.querySelectorAll('.character-option').forEach(el => {
            el.classList.remove('selected');
        });
        const selectedElement = document.querySelector(`.character-option[data-id="${archetypeId}"]`);
        if (selectedElement) {
            selectedElement.classList.add('selected');
        }
        this.updateCharacterPreview();
    }
    
    updateCharacterPreview() {
        const preview = this.dom.containers.selectedCharacterPreview;
        const archetype = CONFIG.characterArchetypes[this.selectedArchetype];
        
        if (preview && archetype) {
            preview.innerHTML = `
                <h5>${archetype.name}</h5>
                <p>${archetype.desc}</p>
                <p class="character-bonus"><strong>Bonus:</strong> ${archetype.bonus}</p>
                <p class="character-malus"><strong>Malus:</strong> ${archetype.malus}</p>
            `;
        }
    }
    
    showCharacterPopup() {
        this.showPopup('characterSelection');
        this.populateCharacterSelection();
    }
    
    hideCharacterPopup() {
        this.hideAllPopups();
        this.showPopup('start'); // Torna al menù principale
    }
    
    populateStageSelection() {
        const dropdown = this.dom.containers.stageDropdown;
        dropdown.innerHTML = '';
        
        Object.keys(CONFIG.stages).forEach(stageId => {
            const stage = CONFIG.stages[stageId];
            const option = document.createElement('option');
            option.value = stageId;
            option.textContent = stage.name;
            option.disabled = !stage.unlocked;
            
            if (!stage.unlocked) {
                option.textContent += ` (${this.getUnlockRequirementText(stage.unlockRequirement)})`;
            }
            
            dropdown.appendChild(option);
        });
        
        // Imposta il valore selezionato
        dropdown.value = this.selectedStage;
    }
    
    selectStage(stageId) {
        this.selectedStage = parseInt(stageId);
        this.dom.containers.stageDropdown.value = this.selectedStage;
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
        this.updateCharacterPreview(); // Aggiorna l'anteprima del personaggio
        this.showPopup('start');
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }
        this.draw(); 
    }

    updateInGameUI() {
        const ui = this.dom.inGameUI;
        ui.timer.textContent = '🕒 ' + Math.floor(this.totalElapsedTime) + 's';
        ui.gemCounter.textContent = '💎 ' + this.gemsThisRun;

        if (this.player.xpNext > 0) {
            const xpPercent = Math.min(100, (this.player.xp / this.player.xpNext) * 100);
            ui.xpBarFill.style.width = xpPercent + '%';
        } else {
            ui.xpBarFill.style.width = '100%';
        }
        ui.xpBarText.textContent = `LVL ${this.player.level}`;
        
        // Aggiorna anche la barra XP mobile
        const xpBarMobile = document.getElementById('xpBarMobile');
        const xpBarMobileFill = document.getElementById('xpBarMobileFill');
        const xpBarMobileText = document.getElementById('xpBarMobileText');
        if (xpBarMobile && xpBarMobileFill && xpBarMobileText) {
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
    
    showInventory() {
        console.log('showInventory chiamato');
        console.log('Popup inventory:', this.dom.popups.inventory);
        console.log('Materiali:', this.materials);
        
        this.showPopup('inventory');
        this.populateInventory();
        this.setupInventoryTabs();
        
        console.log('Inventario popolato');
    }
    
    closeInventory() {
        // Se siamo in gioco, riporta al menu principale
        if (this.state === 'running' || this.state === 'paused') {
            this.returnToStartScreen();
        } else {
            // Altrimenti chiudi semplicemente il popup
            this.hideAllPopups();
        }
    }
    
    populateInventory() {
        // Popola la lista dei materiali per core
        this.populateMaterialsList('coreMaterialsList', CONFIG.materials.coreMaterials);
        
        // Popola la lista dei materiali per armi
        this.populateMaterialsList('weaponMaterialsList', CONFIG.materials.weaponMaterials);
        
        // Popola la lista dei core disponibili
        this.populateCraftingList('coresList', CONFIG.cores, 'core');
        
        // Popola la lista delle armi disponibili
        this.populateCraftingList('weaponsList', CONFIG.weapons, 'weapon');
        
        // Popola l'arsenale
        this.populateArsenal();
    }
    
    populateMaterialsList(containerId, materialsConfig) {
        const container = this.dom.containers[containerId];
        if (!container) return;
        
        let html = '';
        let hasMaterials = false;
        
        for (const [materialId, material] of Object.entries(materialsConfig)) {
            const count = this.materials[materialId] || 0;
            if (count > 0) {
                hasMaterials = true;
                html += `
                    <div class="material-item">
                        <div class="material-icon" style="background-color: ${material.color}">
                            ${material.name.charAt(0)}
                        </div>
                        <div class="material-info">
                            <div class="material-name">${material.name}</div>
                            <div class="material-count">Quantità: ${count}</div>
                        </div>
                        <div class="material-rarity rarity-${material.rarity}">
                            ${material.rarity}
                        </div>
                    </div>
                `;
            }
        }
        
        if (!hasMaterials) {
            html = '<div class="empty-inventory">Nessun materiale disponibile</div>';
        }
        
        container.innerHTML = html;
    }
    
    populateCraftingList(containerId, itemsConfig, type) {
        const container = this.dom.containers[containerId];
        if (!container) return;
        
        let html = '';
        let hasItems = false;
        
        for (const [itemId, item] of Object.entries(itemsConfig)) {
            const canCraft = type === 'core' ? this.canCraftCore(itemId) : this.canCraftWeapon(itemId);
            const materialsText = this.getMaterialsRequiredText(itemId, type);
            
            // Informazioni sul livello e stato
            let statusText = '';
            let buttonText = 'Crea';
            
            if (type === 'core') {
                const coreData = this.cores[itemId];
                if (coreData) {
                    statusText = `<div class="item-status">Posseduto (Livello ${coreData.level})</div>`;
                    buttonText = 'Già posseduto';
                }
            } else {
                const weaponData = this.weapons[itemId];
                if (weaponData) {
                    statusText = `<div class="item-status">Livello ${weaponData.level}/${item.maxLevel}</div>`;
                    if (weaponData.level >= item.maxLevel) {
                        buttonText = 'Livello massimo';
                    } else {
                        buttonText = 'Potenziamento';
                    }
                }
            }
            
            html += `
                <div class="crafting-item">
                    <h5>${item.name}</h5>
                    <p>${item.desc}</p>
                    ${statusText}
                    <div class="materials-required">${materialsText}</div>
                    <button class="craft-btn" ${canCraft ? '' : 'disabled'} 
                            data-item-id="${itemId}" data-item-type="${type}">
                        ${buttonText}
                    </button>
                </div>
            `;
            hasItems = true;
        }
        
        if (!hasItems) {
            html = '<div class="empty-inventory">Nessun oggetto disponibile</div>';
        }
        
        container.innerHTML = html;
        
        // Aggiungi event listeners ai pulsanti
        container.querySelectorAll('.craft-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.dataset.itemId;
                const itemType = e.target.dataset.itemType;
                
                if (itemType === 'core') {
                    this.craftCore(itemId);
                } else if (itemType === 'weapon') {
                    this.craftWeapon(itemId);
                }
                
                // Aggiorna l'inventario dopo il crafting
                this.populateInventory();
            });
        });
    }
    
    getMaterialsRequiredText(itemId, type) {
        const item = type === 'core' ? CONFIG.cores[itemId] : CONFIG.weapons[itemId];
        if (!item) return '';
        
        let materialsToCheck = item.materials;
        
        // Se è un'arma e esiste già, usa i costi di potenziamento
        if (type === 'weapon' && this.weapons[itemId]) {
            materialsToCheck = item.upgradeCost;
        }
        
        if (!materialsToCheck) return '';
        
        const materials = [];
        for (const [materialId, amount] of Object.entries(materialsToCheck)) {
            const material = CONFIG.materials.coreMaterials[materialId] || CONFIG.materials.weaponMaterials[materialId];
            const current = this.materials[materialId] || 0;
            const color = current >= amount ? '#2ecc71' : '#e74c3c';
            materials.push(`<span style="color: ${color}">${material.name}: ${current}/${amount}</span>`);
        }
        
        return materials.join(', ');
    }
    
    setupInventoryTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Rimuovi la classe active da tutti i tab
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Aggiungi la classe active al tab selezionato
                button.classList.add('active');
                document.getElementById(targetTab + 'Tab').classList.add('active');
            });
        });
    }
    
    populateArsenal() {
        // Popola core attivo
        this.populateActiveCore();
        
        // Popola armi attive
        this.populateActiveWeapons();
        
        // Popola core disponibili
        this.populateAvailableCores();
        
        // Popola armi disponibili
        this.populateAvailableWeapons();
    }
    
    populateActiveCore() {
        const container = document.getElementById('activeCoreDisplay');
        if (!container) return;
        
        if (this.arsenal.activeCore) {
            const core = CONFIG.cores[this.arsenal.activeCore];
            const coreData = this.cores[this.arsenal.activeCore];
            
            container.innerHTML = `
                <div class="active-item">
                    <h6>${core.name}</h6>
                    <p>${core.desc}</p>
                    <div class="item-level">Livello ${coreData.level}</div>
                    <button class="unequip-btn" data-item-id="${this.arsenal.activeCore}" data-item-type="core">
                        Rimuovi
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = '<div class="no-item">Nessun core equipaggiato</div>';
        }
        
        // Aggiungi event listeners
        container.querySelectorAll('.unequip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.dataset.itemId;
                const itemType = e.target.dataset.itemType;
                
                if (itemType === 'core') {
                    this.unequipCore(itemId);
                }
                
                this.populateArsenal();
            });
        });
    }
    
    populateActiveWeapons() {
        const container = document.getElementById('activeWeaponsDisplay');
        if (!container) return;
        
        if (this.arsenal.activeWeapons.length > 0) {
            let html = '';
            for (const weaponId of this.arsenal.activeWeapons) {
                const weapon = CONFIG.weapons[weaponId];
                const weaponData = this.weapons[weaponId];
                
                html += `
                    <div class="active-item">
                        <h6>${weapon.name}</h6>
                        <p>${weapon.desc}</p>
                        <div class="item-level">Livello ${weaponData.level}/${weapon.maxLevel}</div>
                        <button class="unequip-btn" data-item-id="${weaponId}" data-item-type="weapon">
                            Rimuovi
                        </button>
                    </div>
                `;
            }
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div class="no-item">Nessuna arma equipaggiata</div>';
        }
        
        // Aggiungi event listeners
        container.querySelectorAll('.unequip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.dataset.itemId;
                const itemType = e.target.dataset.itemType;
                
                if (itemType === 'weapon') {
                    this.unequipWeapon(itemId);
                }
                
                this.populateArsenal();
            });
        });
    }
    
    populateAvailableCores() {
        const container = document.getElementById('availableCoresDisplay');
        if (!container) return;
        
        let html = '';
        for (const [coreId, coreData] of Object.entries(this.cores)) {
            const core = CONFIG.cores[coreId];
            
            html += `
                <div class="available-item ${coreData.equipped ? 'equipped' : ''}">
                    <h6>${core.name}</h6>
                    <p>${core.desc}</p>
                    <div class="item-level">Livello ${coreData.level}</div>
                    <button class="equip-btn" data-item-id="${coreId}" data-item-type="core" ${coreData.equipped ? 'disabled' : ''}>
                        ${coreData.equipped ? 'Equipaggiato' : 'Equipaggia'}
                    </button>
                </div>
            `;
        }
        
        if (!html) {
            html = '<div class="no-item">Nessun core posseduto</div>';
        }
        
        container.innerHTML = html;
        
        // Aggiungi event listeners
        container.querySelectorAll('.equip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.dataset.itemId;
                const itemType = e.target.dataset.itemType;
                
                if (itemType === 'core') {
                    this.equipCore(itemId);
                }
                
                this.populateArsenal();
            });
        });
    }
    
    populateAvailableWeapons() {
        const container = document.getElementById('availableWeaponsDisplay');
        if (!container) return;
        
        let html = '';
        for (const [weaponId, weaponData] of Object.entries(this.weapons)) {
            const weapon = CONFIG.weapons[weaponId];
            
            html += `
                <div class="available-item ${weaponData.equipped ? 'equipped' : ''}">
                    <h6>${weapon.name}</h6>
                    <p>${weapon.desc}</p>
                    <div class="item-level">Livello ${weaponData.level}/${weapon.maxLevel}</div>
                    <button class="equip-btn" data-item-id="${weaponId}" data-item-type="weapon" ${weaponData.equipped ? 'disabled' : ''}>
                        ${weaponData.equipped ? 'Equipaggiata' : 'Equipaggia'}
                    </button>
                </div>
            `;
        }
        
        if (!html) {
            html = '<div class="no-item">Nessuna arma posseduta</div>';
        }
        
        container.innerHTML = html;
        
        // Aggiungi event listeners
        container.querySelectorAll('.equip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.dataset.itemId;
                const itemType = e.target.dataset.itemType;
                
                if (itemType === 'weapon') {
                    this.equipWeapon(itemId);
                }
                
                this.populateArsenal();
            });
        });
    }
    
    unequipCore(coreId) {
        if (this.arsenal.activeCore !== coreId) return false;
        
        this.arsenal.activeCore = null;
        this.cores[coreId].equipped = false;
        
        this.notifications.push({ 
            text: `Core rimosso: ${CONFIG.cores[coreId].name}`, 
            life: 300,
            color: '#FF0000' 
        });
        
        return true;
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
            this.showPopup('pause'); 
        } else { 
            this.hideAllPopups(); 
            this.dom.containers.debugSaveContainer.style.display = 'none'; 
        } 
    }
    populateStatsMenu() { 
        const runStatsContainer = this.dom.containers.runStatsContainer;
        runStatsContainer.innerHTML = `
            <div class="run-stat-item">Tempo <span>${Math.floor(this.totalElapsedTime)}s</span></div>
            <div class="run-stat-item">Punteggio <span>${this.score}</span></div>
            <div class="run-stat-item">Nemici <span>${this.entities.enemies.length + this.entities.bosses.length}</span></div>
            <div class="run-stat-item">Cristalli <span>${this.gemsThisRun} 💎</span></div>
        `;

        const p = this.player; 
        let playerHTML = `<div class="stats-section"><div class="stats-section-title">${p.archetype.name}</div>`; 
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.health}<span class="stat-item-label">Salute:</span><span class="stat-item-value">${Math.floor(p.hp)} / ${p.stats.maxHp}</span></div>`; 
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.speed}<span class="stat-item-label">Velocità:</span><span class="stat-item-value">${p.stats.speed.toFixed(1)}</span></div>`; 
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.defense}<span class="stat-item-label">Rid. Danni:</span><span class="stat-item-value">${Math.round(p.stats.dr * 100)}%</span></div></div>`; 
        playerHTML += `<div class="stats-section"><div class="stats-section-title">Modificatori</div>`; 
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.power}<span class="stat-item-label">Potenza:</span><span class="stat-item-value">${Math.round((p.modifiers.power - 1) * 100)}%</span></div>`; 
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.frequency}<span class="stat-item-label">Frequenza:</span><span class="stat-item-value">${Math.round((1 - p.modifiers.frequency) * 100)}%</span></div>`; 
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.area}<span class="stat-item-label">Area:</span><span class="stat-item-value">${Math.round((p.modifiers.area - 1) * 100)}%</span></div>`; 
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.xpGain}<span class="stat-item-label">Guadagno XP:</span><span class="stat-item-value">${Math.round((p.modifiers.xpGain - 1) * 100)}%</span></div>`; 
        playerHTML += `<div class="stat-item">${CONFIG.statIcons.luck}<span class="stat-item-label">Fortuna:</span><span class="stat-item-value">${Math.round(p.modifiers.luck * 100)}%</span></div></div>`; 
        this.dom.playerStatsColumn.innerHTML = playerHTML; 
        
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
        this.dom.weaponsStatsColumn.innerHTML = weaponsHTML; 
    }
    handleEscapeKey() { 
        const anyPopupOpen = Object.values(this.dom.popups).some(p => p.style.display === 'flex'); 
        
        // Se il popup dei personaggi è aperto, torna al menù principale
        if (this.dom.popups.characterSelection.style.display === 'flex') {
            this.hideCharacterPopup();
            return;
        }
        
        if (anyPopupOpen && this.state !== 'startScreen' && this.state !== 'gameOver') { 
            this.hideAllPopups(); 
        } else { 
            this.togglePause(); 
        } 
    }
    handleInteractionKey() { 
        if (this.menuCooldown > 0 || this.state !== 'running') {
            return; 
        }
        
        const distance = Utils.getDistance(this.player, CONFIG.merchant);
        
        if (distance < CONFIG.merchant.interactionRadius) { 
            this.showPopup('shop'); 
        }
    }
    handlePointerDown(e) { if (this.state === 'gameOver' || this.state === 'startScreen') return; const rect = this.canvas.getBoundingClientRect(); const clientX = e.clientX; const clientY = e.clientY; const worldX = (clientX - rect.left) * (this.canvas.width / rect.width) + this.camera.x; const worldY = (clientY - rect.top) * (this.canvas.height / rect.height) + this.camera.y; if (this.state === 'running' && Utils.getDistance({x: worldX, y: worldY}, CONFIG.merchant) < CONFIG.merchant.interactionRadius) { this.showPopup('shop'); return; } if (e.pointerType === 'touch' && !this.joystick.active) { e.preventDefault(); this.joystick.touchId = e.pointerId; this.joystick.active = true; this.joystick.startX = clientX; this.joystick.startY = clientY; this.dom.joystick.container.style.display = 'block'; this.dom.joystick.container.style.left = `${clientX - this.dom.joystick.radius}px`; this.dom.joystick.container.style.top = `${clientY - this.dom.joystick.radius}px`; } }
    handlePointerMove(e) { if (!this.joystick.active || e.pointerId !== this.joystick.touchId) return; e.preventDefault(); let deltaX = e.clientX - this.joystick.startX; let deltaY = e.clientY - this.joystick.startY; const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY); const maxDistance = this.dom.joystick.radius; if (distance > maxDistance) { deltaX = (deltaX / distance) * maxDistance; deltaY = (deltaY / distance) * maxDistance; } this.dom.joystick.stick.style.transform = `translate(${deltaX}px, ${deltaY}px)`; this.joystick.dx = deltaX / maxDistance; this.joystick.dy = deltaY / maxDistance; }
    handlePointerEnd(e) { if (this.joystick.active && e.pointerId === this.joystick.touchId) { this.joystick.active = false; this.joystick.touchId = null; this.dom.joystick.stick.style.transform = 'translate(0px, 0px)'; this.dom.joystick.container.style.display = 'none'; this.joystick.dx = 0; this.joystick.dy = 0; } }
    
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
                difficultyTier: this.difficultyTier,
                cores: this.cores,
                weapons: this.weapons
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

                // Carica core e armi dal salvataggio
                if (run.cores) {
                    this.cores = run.cores;
                    this.player.cores = run.cores;
                }
                if (run.weapons) {
                    this.weapons = run.weapons;
                    this.player.weapons = run.weapons;
                }

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
        
        // Inizializza materiali, core e armi
        this.materials = {};
        this.cores = {};
        this.weapons = {};
        this.arsenal = {
            activeCore: null,
            activeWeapons: []
        };
        
        try { 
            const savedData = localStorage.getItem('ballSurvivalSaveData_v4.8'); 
            
            if (savedData) { 
                const data = JSON.parse(savedData); 
                this.totalGems = data.totalGems || 0; 
                
                if (data.upgrades) { 
                    Object.keys(this.permanentUpgrades).forEach(key => { 
                        if (data.upgrades[key]) this.permanentUpgrades[key].level = data.upgrades[key].level || 0; 
                    }); 
                }
                
                // Carica materiali, core e armi
                if (data.materials) {
                    this.materials = data.materials;
                }
                if (data.cores) {
                    this.cores = data.cores;
                }
                if (data.weapons) {
                    this.weapons = data.weapons;
                }
                if (data.arsenal) {
                    this.arsenal = data.arsenal;
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
                materials: this.materials,
                cores: this.cores,
                weapons: this.weapons,
                arsenal: this.arsenal
            }; 
            localStorage.setItem('ballSurvivalSaveData_v4.8', JSON.stringify(saveData)); 
        } catch (e) { 
            console.error("Impossibile salvare:", e); 
        } 
    }
    populateShop() { 
        this.dom.totalGemsShop.textContent = this.totalGems; 
        const container = this.dom.containers.permanentUpgradeOptions; 
        
        // Inizializza il pulsante di chiusura se non è già stato fatto
        this.initShopCloseButton();
        
        container.innerHTML = ''; 
        
        // Aggiungi messaggio se non ci sono cristalli
        if (this.totalGems === 0) {
            container.innerHTML = `<div class="zero-gems-message">
                💎 Non hai ancora cristalli! Completa partite per guadagnarne.
            </div>`;
            return;
        }
        
        let availableUpgrades = 0;
        
        for (const key in this.permanentUpgrades) { 
            const upg = this.permanentUpgrades[key]; 
            const cost = Math.floor(upg.baseCost * Math.pow(upg.costGrowth, upg.level));
            
            // Conta upgrade disponibili
            if (upg.level < upg.maxLevel) {
                availableUpgrades++;
            }
            
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
    
    initShopCloseButton() {
        // Setup close button se non è già stato fatto
        const closeBtn = document.getElementById('closeShopBtn');
        if (closeBtn && !closeBtn.hasAttribute('data-initialized')) {
            closeBtn.setAttribute('data-initialized', 'true');
            closeBtn.addEventListener('click', () => {
                this.hideAllPopups();
            });
        }
    }
    buyPermanentUpgrade(key) { const upg = this.permanentUpgrades[key]; const cost = Math.floor(upg.baseCost * Math.pow(upg.costGrowth, upg.level)); if (upg.level < upg.maxLevel && this.totalGems >= cost) { this.totalGems -= cost; upg.level++; this.saveGameData(); this.player.applyPermanentUpgrades(this.permanentUpgrades); this.populateShop(); } }
    applyItemEffect(item) { const itemInfo = CONFIG.itemTypes[item.type]; this.notifications.push({ text: itemInfo.desc, life: 300 }); switch (item.type) { case 'HEAL_POTION': this.player.hp = Math.min(this.player.stats.maxHp, this.player.hp + this.player.stats.maxHp * 0.5); break; case 'XP_BOMB': this.player.gainXP(this.player.xpNext); break; case 'INVINCIBILITY': this.player.powerUpTimers.invincibility = 600; break; case 'DAMAGE_BOOST': this.player.powerUpTimers.damageBoost = 1200; break; case 'LEGENDARY_ORB': this.player.powerUpTimers.damageBoost = 3600; this.player.powerUpTimers.invincibility = 3600; break; } }
    updateCamera() { this.camera.x = this.player.x - this.camera.width / 2; this.camera.y = this.player.y - this.camera.height / 2; this.camera.x = Math.max(0, Math.min(this.camera.x, CONFIG.world.width - this.camera.width)); this.camera.y = Math.max(0, Math.min(this.camera.y, CONFIG.world.height - this.camera.height)); }
    resizeCanvas() {
        const rect = this.dom.gameContainer.getBoundingClientRect();
        // Limiti massimi desktop
        const maxW = window.innerWidth <= 700 ? CONFIG.world.width : Math.min(CONFIG.world.width, 1200);
        const maxH = window.innerWidth <= 700 ? CONFIG.world.height : Math.min(CONFIG.world.height, 900);
        let width = Math.min(rect.width, maxW);
        let height = Math.min(rect.height, maxH);
        this.canvas.width = width;
        this.canvas.height = height;
        this.camera.width = width;
        this.camera.height = height;
        if (this.state !== 'running') this.draw();
    }
    drawOffscreenIndicators() { if(this.entities.chests.length > 0) this.drawOffscreenIndicator(this.entities.chests[0], "rgba(255, 215, 0, 0.7)", 'arrow'); this.drawOffscreenIndicator(CONFIG.merchant, "rgba(155, 89, 182, 0.8)", 'triangle'); }
    drawOffscreenIndicator(target, color, shape) { const screenX = target.x - this.camera.x; const screenY = target.y - this.camera.y; if (screenX > 0 && screenX < this.canvas.width && screenY > 0 && screenY < this.canvas.height) return; const pScreenX = this.player.x - this.camera.x; const pScreenY = this.player.y - this.camera.y; const angle = Math.atan2(screenY - pScreenY, screenX - pScreenX); const padding = 30; let arrowX = pScreenX + Math.cos(angle) * (Math.min(this.canvas.width, this.canvas.height) / 2.5); let arrowY = pScreenY + Math.sin(angle) * (Math.min(this.canvas.width, this.canvas.height) / 2.5); arrowX = Math.max(padding, Math.min(this.canvas.width - padding, arrowX)); arrowY = Math.max(padding, Math.min(this.canvas.height - padding, arrowY)); this.ctx.save(); this.ctx.translate(arrowX, arrowY); this.ctx.rotate(angle); this.ctx.fillStyle = color; this.ctx.strokeStyle = "white"; this.ctx.lineWidth = 1; this.ctx.beginPath(); if (shape === 'arrow') { this.ctx.moveTo(15, 0); this.ctx.lineTo(-15, -10); this.ctx.lineTo(-10, 0); this.ctx.lineTo(-15, 10); } else { this.ctx.moveTo(0, -10); this.ctx.lineTo(10, 10); this.ctx.lineTo(-10, 10); } this.ctx.closePath(); this.ctx.fill(); this.ctx.stroke(); this.ctx.restore(); }
    drawNotifications() {
        this.ctx.save();
        this.ctx.textAlign = 'center';
        this.ctx.font = 'bold clamp(14px, 2.5vw, 18px) "Courier New", monospace';
        const startY = 80; // Posizione Y iniziale abbassata
        this.notifications.forEach((n, index) => {
            const opacity = n.life > 30 ? 1.0 : n.life / 30;
            this.ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`;
            this.ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
            this.ctx.shadowBlur = 5;
            this.ctx.fillText(n.text, this.canvas.width / 2, startY + (index * 30));
        });
        this.ctx.restore();
    }
    drawMerchant() { const m = CONFIG.merchant; this.ctx.fillStyle = '#9b59b6'; this.ctx.fillRect(m.x, m.y, m.size, m.size); this.ctx.strokeStyle = '#f1c40f'; this.ctx.lineWidth = 3; this.ctx.strokeRect(m.x, m.y, m.size, m.size); if (this.state === 'running' && Utils.getDistance(this.player, m) < CONFIG.merchant.interactionRadius) { this.ctx.font = 'bold 14px "Courier New"'; this.ctx.fillStyle = 'white'; this.ctx.textAlign = 'center'; this.ctx.fillText("[E] / Tocca", m.x + m.size / 2, m.y - 25); this.ctx.fillText("Negozio", m.x + m.size / 2, m.y - 10); } }

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
}

// Stato runtime degli archetipi acquistati (non salvato in localStorage)
let unlockedArchetypes = new Set(['standard']);

let game;
window.addEventListener('DOMContentLoaded', () => { 
    game = new BallSurvivalGame('gameCanvas'); 
});