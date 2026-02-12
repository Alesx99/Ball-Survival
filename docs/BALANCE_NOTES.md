# Note di Bilanciamento - Ball Survival

## Problema individuato (simulazione)

Il danno da **contatto** veniva applicato **ogni frame** (60 fps) per ogni nemico a contatto con il giocatore:
- 1 nemico: 7 dmg × 60 = 420 DPS → morte in 357 ms
- 3 nemici: 1260 DPS → morte in 119 ms
- 5 nemici: 2100 DPS → morte in 71 ms

Impossibile reagire con 2+ nemici addosso.

## Modifiche implementate

### 1. Cooldown danno da contatto
- **`CONFIG.enemies.contactDamageCooldown`**: 0.9 secondi
- Ogni nemico può infliggere danno da contatto al massimo 1 volta ogni 0.9 secondi
- Effetto: DPS da swarm limitato e prevedibile

### 2. HP base giocatore
- **Prima**: 150 HP
- **Dopo**: 200 HP
- Maggiore margine per errori e reazione

### 3. Danno base nemici
- **Prima**: 7
- **Dopo**: 8
- Compensa il cooldown per mantenere pressione adeguata in early game

### 4. Scaling danno nemici
- **`damagePerFactor`**: da 1.05 a 0.65
- Curva di crescita del danno più morbida nel tempo
- Evita che a 10+ minuti il giocatore muoia istantaneamente

## Risultati simulati (post-fix)

| Nemici a contatto | DPS   | Sopravvivenza (200 HP) |
|-------------------|-------|------------------------|
| 1                 | 8.9   | 22.5s                  |
| 3                 | 26.7  | 7.5s                   |
| 5                 | 44.4  | 4.5s                   |
| 8                 | 71.1  | 2.8s                   |
| 12                | 106.7 | 1.9s                   |

A 10 minuti con 5 nemici (damage ~36): DPS 200, sopravvivenza ~1s base. Con upgrade Vitalità e cure in run, margine sufficiente per usare shockwave/heal e disimpegnarsi.

## Simulazione

Esegui `node scripts/balance-simulation.js` per rivedere i numeri.
