export const ENEMIES_CONFIG = {
    enemies: {
        spawnInterval: 0.7,
        spawnImmunity: 60,
        /** Cooldown (secondi) tra un hit da contatto e il successivo per ogni nemico. Limita DPS da swarm. */
        contactDamageCooldown: 0.75,
        scaling: {
            timeFactor: 18,       // Rallentato del 50% (era 12) per curva più morbida
            hpPerFactor: 7,
            speedPerFactor: 0.025,
            damagePerFactor: 1.0,
            xpPerFactor: 1.25,
            xpPowerFactor: 1.05,
            levelFactorMultiplier: 0.75,
            drPerFactor: 0.0005   // Ridotto (era 0.0008) per late-game meno tanky
        },
        base: { hp: 31, speed: 1.49, radius: 12, damage: 15, xp: 4, dr: 0 }, // speed +10% (era 1.35)

        /** Tipi di nemici con comportamenti unici. I moltiplicatori sono relativi alle stats base calcolate. */
        enemyTypes: {
            'dasher': {
                behavior: 'dash', hp: 0.6, speed: 2.0, damage: 1.8, radius: 0.8, xp: 1.5,
                color: '#ff6600', prepTime: 90, dashSpeed: 8, dashDuration: 20
            },
            'orbiter': {
                behavior: 'orbit', hp: 0.8, speed: 1.5, damage: 1.2, radius: 0.9, xp: 1.3,
                color: '#00ccff', orbitRadius: 120, orbitSpeed: 0.04, lungeTimer: 300
            },
            'splitter': {
                behavior: 'split', hp: 1.5, speed: 0.9, damage: 0.8, radius: 1.3, xp: 2.0,
                color: '#66ff66', splitCount: 2, maxGeneration: 2
            },
            'bomber': {
                behavior: 'bomb', hp: 0.5, speed: 0.6, damage: 0.5, radius: 1.0, xp: 1.5,
                color: '#ff3333', explosionRadius: 80, explosionDamage: 40
            },
            'sniper': {
                behavior: 'ranged', hp: 0.4, speed: 0.5, damage: 0.3, radius: 0.7, xp: 1.8,
                color: '#ffcc00', range: 350, shootCooldown: 120, projectileSpeed: 5
            },
            'necromancer': {
                behavior: 'necro', hp: 1.2, speed: 0.4, damage: 0.5, radius: 1.1, xp: 3.0,
                color: '#9900cc', reviveRadius: 150, reviveCooldown: 300, maxRevives: 3
            },
            'tank': {
                behavior: 'tank', hp: 3.0, speed: 0.4, damage: 1.5, radius: 1.8, xp: 2.5,
                color: '#778899', bonusDr: 0.3, knockbackForce: 15
            },
            'teleporter': {
                behavior: 'teleport', hp: 0.7, speed: 1.0, damage: 1.4, radius: 0.85, xp: 1.8,
                color: '#da70d6', teleportCooldown: 240, teleportDistance: 60
            },
            'summoner': {
                behavior: 'summon', hp: 1.0, speed: 0.3, damage: 0.3, radius: 1.2, xp: 3.5,
                color: '#20b2aa', summonCooldown: 360, maxMinions: 6, summonCount: 2
            }
        },

        /** Tabella spawn progressiva: ogni tipo nemico si sblocca a un tempo e stage minimo */
        spawnTable: [
            { type: 'dasher', minTime: 120, weight: 1.0, minStage: 1 },
            { type: 'tank', minTime: 180, weight: 0.6, minStage: 1 },
            { type: 'orbiter', minTime: 240, weight: 0.8, minStage: 2 },
            { type: 'bomber', minTime: 360, weight: 0.6, minStage: 2 },
            { type: 'splitter', minTime: 480, weight: 0.5, minStage: 3 },
            { type: 'teleporter', minTime: 540, weight: 0.7, minStage: 3 },
            { type: 'sniper', minTime: 600, weight: 0.7, minStage: 3 },
            { type: 'summoner', minTime: 720, weight: 0.4, minStage: 4 },
            { type: 'necromancer', minTime: 900, weight: 0.3, minStage: 4 }
        ]
    },
    difficultyTiers: {
        '1': { time: 300, dr: 0.25, speed: 0.15, message: "DIFFICOLTÀ AUMENTATA: L'Orda si Agita!" },
        '2': { time: 600, dr: 0.45, speed: 0.25, championChance: 0.08, message: "ALLARME: Campioni nemici individuati!" },
        '3': { time: 900, dr: 0.70, speed: 0.40, eliteChanceMultiplier: 3, message: "ALLARME ROSSO: Convergenza Planare!" },
        '4': { time: 1200, dr: 0.80, speed: 0.55, championChance: 0.15, enemyRegen: 1, message: "CALAMITÀ: I nemici si rigenerano!" },
        '5': { time: 1500, dr: 0.85, speed: 0.65, eliteChanceMultiplier: 5, twinBoss: true, message: "APOCALISSE: Boss gemelli avvistati!" },
        '6': { time: 1800, dr: 0.90, speed: 0.75, spawnMultiplier: 2, deathExplosion: true, message: "FINE DEI TEMPI: Non c'è più speranza..." },
        '7': { time: 2100, dr: 0.92, speed: 0.80, necromancerChance: 0.10, allTypesUnlocked: true, message: "TRASCENDENZA: Il caos prende forma!" },
        '8': { time: 2400, dr: 0.95, speed: 0.90, spawnMultiplier: 3, allTypesUnlocked: true, message: "OBLIO: Nulla può salvarti!" }
    },
    /** Configurazione eventi ambientali dinamici */
    stormEvent: {
        minTime: 300,           // Prima tempesta dopo 5 minuti
        interval: [300, 480],   // Ogni 5-8 minuti
        duration: [1800, 2700], // 30-45 secondi in frames (60fps)
        spawnMultiplier: 2.0,
        speedMultiplier: 1.2,
        xpBonusDuration: 900,   // 15 secondi post-tempesta in frames
        xpBonusMultiplier: 1.5
    },
    /** Power-up a terra */
    groundPickups: {
        spawnInterval: [60, 120], // Secondi tra spawn
        maxOnMap: 2,
        despawnTime: 30,          // Secondi prima che scompaia
        types: {
            'speed_boost': { name: 'Impulso Velocità', color: '#00ff88', duration: 300, effect: { speed: 0.4 } },
            'damage_boost': { name: 'Gemma Potenziante', color: '#ff4500', duration: 600, effect: { power: 0.3 } },
            'magnet_pulse': { name: 'Impulso Magnetico', color: '#ffff00', duration: 1, effect: { magnetRadius: 300 } },
            'shield_bubble': { name: 'Bolla di Scudo', color: '#87ceeb', duration: 600, effect: { shield: true } },
            'rage_crystal': { name: 'Cristallo di Rabbia', color: '#ff1744', duration: 240, effect: { power: 0.8 } },
            'freeze_pulse': { name: 'Impulso Glaciale', color: '#b0e0ff', duration: 1, effect: { freezeRadius: 200, freezeDuration: 120 } }
        }
    },
    boss: {
        spawnThreshold: 120,
        base: { hp: 2500, speed: 2.1, radius: 45, damage: 50 },
        scaling: { timeFactor: 50, hpPerFactor: 1200 },
        attack: { cooldown: 1650, projectileSpeed: 5.5, projectileRadius: 10 }
    },
    bossRush: {
        bossSequence: ['orc_boss', 'slime_boss', 'golem_boss', 'shadow_boss'],
        spawnInterval: 2, // Seconds between boss spawns after death
        victoryCount: 20,
        // Scaling per onda (i primi boss usano HP base, poi crescono)
        hpPerKill: 1200,
        damagePerKill: 10,
        speedFactorPerKill: 0.04,
        drPerKill: 0.03,
        drCap: 0.65,
        doubleBossFromWave: 4 // Da onda 4 (1-based) spawnano 2 boss per volta
    },
    // Affissi per Loot dei Boss
};
