/**
 * Simulazione bilanciamento Ball Survival
 * Modella: HP giocatore vs DPS nemici, tempo di sopravvivenza, scaling
 *
 * Esegui: node scripts/balance-simulation.js
 */

const CONFIG = {
    player: { base: { hp: 150, speed: 3, radius: 15, dr: 0 } },
    enemies: {
        base: { hp: 25, speed: 1.2, radius: 12, damage: 7, xp: 4, dr: 0 },
        scaling: {
            timeFactor: 15,
            hpPerFactor: 5,
            speedPerFactor: 0.02,
            damagePerFactor: 1.05,
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

// Scenario 1: Danno da contatto PER FRAME (comportamento attuale)
console.log('--- PROBLEMA CRITICO: Danno da contatto per frame ---');
console.log('Ogni nemico in contatto infligge damage OGNI frame (60 fps).\n');

const baseEnemyDamage = 7;
for (const n of [1, 2, 3, 5, 8]) {
    const dps = n * baseEnemyDamage * FPS;
    const ttk = 150 / dps; // time to kill (secondi)
    console.log(`${n} nemici a contatto: DPS=${dps.toFixed(0)}, Player (150 HP) muore in ${(ttk * 1000).toFixed(0)} ms`);
}

console.log('\n>>> Il giocatore muore in < 0.5 secondi con 2+ nemici. Impossibile reagire!\n');

// Scenario 2: Se il danno fosse per secondo (ipotetico fix)
console.log('--- Se il danno fosse per secondo (1 hit/sec per nemico) ---');
for (const n of [1, 3, 5, 8, 12]) {
    const dps = n * baseEnemyDamage; // 1 hit per secondo per nemico
    const ttk = 150 / dps;
    console.log(`${n} nemici: DPS=${dps}, sopravvivenza ${ttk.toFixed(1)}s`);
}

// Scenario 3: Scaling nel tempo (t=0, 5min, 10min, 15min)
console.log('\n--- Scaling nemici nel tempo (player level 5) ---');
const playerLevel = 5;
for (const t of [0, 60, 300, 600, 900]) {
    const stats = getEnemyStats(t, playerLevel);
    const dps1 = 3 * stats.damage * FPS; // 3 nemici, per-frame
    const dps2 = 3 * stats.damage;       // 3 nemici, per-second
    console.log(`t=${t}s (${Math.floor(t/60)}min): damage=${stats.damage.toFixed(0)}, 3 nemici DPS(per-frame)=${dps1.toFixed(0)}, DPS(per-sec)=${dps2}`);
}

// Scenario 4: NUOVO BILANCIAMENTO (implementato)
console.log('\n--- NUOVO BILANCIAMENTO (post-fix) ---');
const COOLDOWN = 0.9;
const NEW_HP = 200;
const NEW_DAMAGE = 8;
const NEW_DAMAGE_FACTOR = 0.65;

for (const n of [1, 3, 5, 8, 12]) {
    const dps = n * NEW_DAMAGE / COOLDOWN;
    const ttk = NEW_HP / dps;
    console.log(`${n} nemici (cooldown ${COOLDOWN}s): DPS=${dps.toFixed(1)}, sopravvivenza ${ttk.toFixed(1)}s`);
}

console.log('\n--- Scaling 10min con damagePerFactor 0.65 ---');
const cf10min = 600/15 + 5*0.7; // ~44
const dmg10min = 8 + Math.floor(cf10min) * NEW_DAMAGE_FACTOR;
const dps5enemies = 5 * dmg10min / COOLDOWN;
console.log(`Damage nemico: ${dmg10min.toFixed(0)}, 5 nemici DPS: ${dps5enemies.toFixed(0)}, survival (200 HP): ${(200/dps5enemies).toFixed(1)}s`);
