export const ENEMIES_CONFIG = {
    enemies: {
        spawnInterval: 0.7,
        spawnImmunity: 60,
        /** Cooldown (secondi) tra un hit da contatto e il successivo per ogni nemico. Limita DPS da swarm. */
        contactDamageCooldown: 0.75,
        scaling: {
            timeFactor: 12,
            hpPerFactor: 6,
            speedPerFactor: 0.025,
            damagePerFactor: 0.65,
            xpPerFactor: 1.25,
            xpPowerFactor: 1.05,
            levelFactorMultiplier: 0.75,
            drPerFactor: 0.0008
        },
        base: { hp: 28, speed: 1.3, radius: 12, damage: 12, xp: 4, dr: 0 }
    },
    difficultyTiers: {
        '1': { time: 300, dr: 0.25, speed: 0.15, message: "DIFFICOLTÀ AUMENTATA: L'Orda si Agita!" },
        '2': { time: 600, dr: 0.45, speed: 0.25, championChance: 0.08, message: "ALLARME: Campioni nemici individuati!" },
        '3': { time: 900, dr: 0.70, speed: 0.40, eliteChanceMultiplier: 3, message: "ALLARME ROSSO: Convergenza Planare!" },
        '4': { time: 1200, dr: 0.80, speed: 0.55, championChance: 0.15, enemyRegen: 1, message: "CALAMITÀ: I nemici si rigenerano!" },
        '5': { time: 1500, dr: 0.85, speed: 0.65, eliteChanceMultiplier: 5, twinBoss: true, message: "APOCALISSE: Boss gemelli avvistati!" },
        '6': { time: 1800, dr: 0.90, speed: 0.75, spawnMultiplier: 2, deathExplosion: true, message: "FINE DEI TEMPI: Non c'è più speranza..." }
    },
    boss: {
        spawnThreshold: 120,
        base: { hp: 1800, speed: 2.0, radius: 45, damage: 40 },
        scaling: { timeFactor: 50, hpPerFactor: 950 },
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
