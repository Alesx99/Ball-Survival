export const PROGRESSION_CONFIG = {
    upgradeTree: {
        'health': { id: 'health', name: 'Vitalità', desc: 'Aumenta la salute massima di 60.', maxLevel: 8, type: 'passive' },
        'speed': { id: 'speed', name: 'Rapidità', desc: 'Aumenta la velocità di movimento.', maxLevel: 5, type: 'passive' },
        'armor': { id: 'armor', name: 'Armatura', desc: 'Aumenta la Riduzione Danno del 3%.', maxLevel: 8, type: 'passive' },
        'attack_speed': { id: 'attack_speed', name: "Velocità d'attacco", desc: 'Riduce la ricarica di tutte le abilità del 8%.', maxLevel: 5, type: 'passive' },
        'regen': { id: 'regen', name: 'Cuore Rigenerante', desc: 'Aumenta la rigenerazione salute.', maxLevel: 5, type: 'passive' },
        'attractorb': { id: 'attractorb', name: 'Magnete Arcano', desc: 'Aumenta il raggio di raccolta sfere.', maxLevel: 5, type: 'passive' },
        'aegis': { id: 'aegis', name: 'Mantello Divino', desc: 'Estende la finestra di invulnerabilità ai danni.', maxLevel: 5, type: 'passive' },
        'skull': { id: 'skull', name: 'Teschio Maledetto', desc: 'Aumenta exp, ma i nemici sono più forti e numerosi (+10% Curse).', maxLevel: 5, type: 'passive' },
        'torrona': { id: 'torrona', name: 'Scatola di Torrona', desc: 'Aumenta stats generali. Attenzione: al Liv 5 aggiunge +100% Curse.', maxLevel: 5, type: 'passive' },
        'magicMissile': { id: 'magicMissile', name: 'Proiettile Magico', desc: "L'attacco base, non potenziabile.", type: 'active' },
        'cyclone': { id: 'cyclone', name: 'Ciclone Vuoto', desc: 'Vortice statico che attrae debolmente i nemici prima di esplodere.', maxLevel: 4, type: 'active' },
        'armageddon': { id: 'armageddon', name: 'Armageddon', desc: 'Danno planetario enorme a schermo intero ogni minuto.', maxLevel: 1, type: 'active' },
        'cloaking': { id: 'cloaking', name: 'Velo D\'Ombra', desc: 'Diventi intangibile temporaneamente.', maxLevel: 4, type: 'active' },
        // Cosmic Spells (late game, rari)
        // minPlayerLevel: livello minimo del giocatore perché possano apparire tra le scelte (eccetto archetipi che le hanno come startingWeapon)
        // rarity: 'cosmic' => probabilità ridotta anche quando disponibili
        'singularity': { id: 'singularity', name: 'Singolarità', desc: 'Lancia un proiettile gravitazionale che attrae i nemici.', maxLevel: 4, type: 'active', minPlayerLevel: 22, rarity: 'cosmic' },
        'stellarAura': { id: 'stellarAura', name: 'Aura Stellare', desc: 'Crea un campo di stelle rotanti che danneggiano i nemici vicini.', maxLevel: 4, type: 'active', minPlayerLevel: 26, rarity: 'cosmic' },
        'pulsarRay': { id: 'pulsarRay', name: 'Raggio Pulsar', desc: 'Spara un raggio di energia pura altamente perforante.', maxLevel: 4, type: 'active', minPlayerLevel: 30, rarity: 'cosmic' },
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
        'shield': { id: 'shield', name: 'Scudo Magico', desc: 'Assorbe 1 colpo nemico quando attivo.', details: "+0.3s Finestra, -0.8s Ricarica", maxLevel: 5 },
        'shield_evolve_reflect': { id: 'shield_evolve_reflect', name: 'EVO: Barriera Riflettente', desc: 'Riduce danni e riflette.', type: 'evolution' },
        'shield_evolve_orbital': { id: 'shield_evolve_orbital', name: 'EVO: Singolarità Protettiva', desc: 'Globo orbitale protettivo.', type: 'evolution' },
        'shield_mastery_reflect': { id: 'shield_mastery_reflect', name: 'Maestria: Riflesso', desc: 'Aumenta danni riflessi.', type: 'mastery' },
        'shield_mastery_orbital': { id: 'shield_mastery_orbital', name: 'Maestria: Singolarità', desc: 'Aggiunge secondo globo.', type: 'mastery' }
    },
    skillTree: {
        // Base Node
        'base_health': { name: 'Vitalità Base', desc: '+20 HP Max per livello', baseCost: 10, maxLevel: 5, requires: [], icon: '❤️', effect: { type: 'stat', stat: 'maxHp', value: 20 } },

        // Tier 1 (Requires Base Health)
        'tier1_speed': { name: 'Agilità', desc: '+0.2 Velocità per livello', baseCost: 15, maxLevel: 5, requires: ['base_health'], icon: '⚡', effect: { type: 'stat', stat: 'speed', value: 0.2 } },
        'tier1_regen': { name: 'Rigenerazione P.', desc: 'Rigenera 1 HP ogni 5s', baseCost: 20, maxLevel: 3, requires: ['base_health'], icon: '✨', effect: { type: 'passive', id: 'passive_regen', value: 1 } },

        // Tier 2 (Requires Agility or Regen)
        'tier2_defense': { name: 'Pelle Ferrea', desc: '+2% Riduzione Danno', baseCost: 25, maxLevel: 5, requires: ['tier1_speed', 'tier1_regen'], requireType: 'any', icon: '🛡️', effect: { type: 'stat', stat: 'dr', value: 0.02 } },
        'tier2_power': { name: 'Forza Bruta', desc: '+5% Danno', baseCost: 30, maxLevel: 5, requires: ['tier1_speed', 'tier1_regen'], requireType: 'any', icon: '⚔️', effect: { type: 'stat', stat: 'power', value: 0.05 } },

        // Tier 3 (Requires Defense or Power)
        'tier3_frequency': { name: 'Reattività', desc: '-3% Tempo di Ricarica', baseCost: 40, maxLevel: 5, requires: ['tier2_defense', 'tier2_power'], requireType: 'any', icon: '⏱️', effect: { type: 'stat', stat: 'frequency', value: -0.03 } },
        'tier3_area': { name: 'Espansione', desc: '+5% Area', baseCost: 40, maxLevel: 5, requires: ['tier2_defense', 'tier2_power'], requireType: 'any', icon: '🌟', effect: { type: 'stat', stat: 'area', value: 0.05 } },

        // Special Nodes (Leaf nodes)
        'special_meteor': { name: 'Dono Astrale', desc: 'Evoca un meteorite ogni 100 uccisioni', baseCost: 100, maxLevel: 1, requires: ['tier3_area'], requireType: 'all', icon: '☄️', special: 'meteor_on_kills' },
        'special_second_chance': { name: 'Anima Persistente', desc: 'Una resurrezione a partita (50% HP)', baseCost: 150, maxLevel: 1, requires: ['tier3_frequency'], requireType: 'all', icon: '👼', special: 'revive' },
        'special_greed': { name: 'Avarizia', desc: '+10% XP e Fortuna', baseCost: 80, maxLevel: 3, requires: ['tier3_frequency', 'tier3_area'], requireType: 'all', icon: '💰', effect: { type: 'stat', stat: 'luck_and_xp', value: 0.1 } }
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
    affixes: {
        'sharp': { name: "Affilato", color: '#ff4444', stats: { 'power': 0.15 } },
        'hardened': { name: "Indurito", color: '#aaaaaa', stats: { 'dr': 0.05, 'hp': 25 } },
        'swift': { name: "Rapido", color: '#44ff44', stats: { 'speed': 0.4, 'frequency': -0.10 } },
        'arcane': { name: "Arcano", color: '#aa44ff', stats: { 'area': 0.20, 'power': 0.05 } },
        'lucky': { name: "Fortunato", color: '#ffff44', stats: { 'luck': 0.15, 'xpGain': 0.10 } },
        'divine': { name: "Divino", color: '#ffffff', stats: { 'power': 0.25, 'dr': 0.10, 'area': 0.15 } }
    }
};
