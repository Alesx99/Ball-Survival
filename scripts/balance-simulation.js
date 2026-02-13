/**
 * Simulazione bilanciamento Ball Survival
 * Modella: HP giocatore vs DPS nemici, tempo di sopravvivenza, scaling
 * Sincronizzato con src/config/index.js
 *
 * Esegui: node scripts/balance-simulation.js
 */

const CONFIG = {
    player: { base: { hp: 220, speed: 3, radius: 15, dr: 0 }, iFramesDuration: 0.8 },
    enemies: {
        base: { hp: 25, speed: 1.2, radius: 12, damage: 8, xp: 4, dr: 0 },
        contactDamageCooldown: 1.0,
        scaling: {
            timeFactor: 15,
            hpPerFactor: 5,
            speedPerFactor: 0.02,
            damagePerFactor: 0.58,
            levelFactorMultiplier: 0.7,
            drPerFactor: 0.0006
        }
    }
};

const FPS = 60;

// Calcola stats nemico al tempo t (secondi) con livello giocatore
function getEnemyStats(t, playerLevel) {
    const timeFactor = t / CONFIG.enemies.scaling.timeFactor;
    const levelFactor = playerLevel * CONFIG.enemies.scaling.levelFactorMultiplier;
    const cf = timeFactor + levelFactor;
    const s = CONFIG.enemies.scaling;
    return {
        damage: CONFIG.enemies.base.damage + Math.floor(cf) * s.damagePerFactor,
        hp: CONFIG.enemies.base.hp + Math.floor(cf) * 5
    };
}

// DPS da contatto: OGNI FRAME ogni nemico in contatto infligge damage
// Quindi DPS = N_nemici * damage * FPS (!!)
function contactDPS(enemyCount, enemyDamage) {
    return enemyCount * enemyDamage * FPS;
}

// Tempo di sopravvivenza (secondi) con HP effettivo e DPS entrante
function survivalTime(effectiveHP, dps) {
    if (dps <= 0) return Infinity;
    return effectiveHP / dps;
}

// HP effettivo con DR
function effectiveHP(maxHp, dr) {
    return maxHp / (1 - Math.min(0.85, dr));
}

console.log('=== SIMULAZIONE BILANCIAMENTO BALL SURVIVAL ===\n');

// Scenario 1: Danno da contatto PER FRAME (bug pre-fix, storico)
console.log('--- Riferimento: Danno per-frame (bug pre-fix) ---');
const baseEnemyDamage = 8;
for (const n of [1, 2, 3, 5, 8]) {
    const dps = n * baseEnemyDamage * FPS;
    const ttk = 200 / dps;
    console.log(`${n} nemici (per-frame): DPS=${dps.toFixed(0)}, morte in ${(ttk * 1000).toFixed(0)} ms`);
}

// Scenario 2: Con cooldown 0.9s (attuale)
const COOLDOWN = CONFIG.enemies.contactDamageCooldown ?? 0.9;
const BASE_HP = CONFIG.player.base.hp;
console.log('\n--- Bilanciamento attuale (cooldown ' + COOLDOWN + 's) ---');
for (const n of [1, 3, 5, 8, 12]) {
    const dps = n * baseEnemyDamage / COOLDOWN;
    const ttk = BASE_HP / dps;
    console.log(`${n} nemici: DPS=${dps.toFixed(1)}, sopravvivenza ${ttk.toFixed(1)}s`);
}

// Scenario 3: Scaling nel tempo (t=0, 5min, 10min, 15min)
console.log('\n--- Scaling nemici nel tempo (player level 5) ---');
const playerLevel = 5;
for (const t of [0, 60, 300, 600, 900]) {
    const stats = getEnemyStats(t, playerLevel);
    const dps3 = 3 * stats.damage / COOLDOWN;
    const survival = BASE_HP / dps3;
    console.log(`t=${t}s (${Math.floor(t/60)}min): damage=${stats.damage.toFixed(0)}, 3 nemici DPS=${dps3.toFixed(0)}, survival=${survival.toFixed(1)}s`);
}

// Scenario 4: 10min con build tipica (Vitalità + Armatura)
console.log('\n--- 10min con upgrade tipici ---');
const t10 = 600;
const stats10 = getEnemyStats(t10, 8);
const dmg10 = stats10.damage;
const dps5 = 5 * dmg10 / COOLDOWN;
const hpBase = BASE_HP;
const hpVitality3 = hpBase + 3 * 60; // upgradeTree.health: +60/level
const hpVitality5 = hpBase + 5 * 60;
const drArmor2 = 0.06;
const ehp = (hp, dr) => hp / (1 - Math.min(0.85, dr));
console.log(`Damage nemico: ${dmg10}, 5 nemici DPS: ${dps5.toFixed(0)}`);
console.log(`${BASE_HP} HP base: survival ${(BASE_HP/dps5).toFixed(1)}s`);
console.log(`380 HP (+3 Vitalità): survival ${(hpVitality3/dps5).toFixed(1)}s`);
console.log(`500 HP (+5 Vitalità): survival ${(hpVitality5/dps5).toFixed(1)}s`);
console.log(`500 HP + 6% DR: survival ${(ehp(500, 0.06)/dps5).toFixed(1)}s (effective)`);

// Scenario 5: I-frames contributo
const iFrames = CONFIG.player.iFramesDuration ?? 0.8;
console.log(`\n--- I-frames (${iFrames}s dopo danno) danno ~${(iFrames * dps5).toFixed(0)} HP "risparmiati" per ciclo ---`);
