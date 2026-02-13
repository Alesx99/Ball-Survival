# Note di Bilanciamento - Ball Survival

## Problema individuato (simulazione)

Il danno da **contatto** veniva applicato **ogni frame** (60 fps) per ogni nemico a contatto con il giocatore:
- 1 nemico: 7 dmg × 60 = 420 DPS → morte in 357 ms
- 3 nemici: 1260 DPS → morte in 119 ms
- 5 nemici: 2100 DPS → morte in 71 ms

Impossibile reagire con 2+ nemici addosso.

## Modifiche implementate

### 1. Cooldown danno da contatto
- **`CONFIG.enemies.contactDamageCooldown`**: 1.0 secondi (era 0.9)
- Ogni nemico può infliggere danno da contatto al massimo 1 volta ogni 0.9 secondi
- Effetto: DPS da swarm limitato e prevedibile

### 2. HP base giocatore
- **Prima**: 150 HP
- **Dopo (v1)**: 200 HP
- **Dopo (v2)**: 220 HP (Feb 2025 – più margine mid/late)
- Maggiore margine per errori e reazione

### 3. Danno base nemici
- **Prima**: 7
- **Dopo**: 8
- Compensa il cooldown per mantenere pressione adeguata in early game

### 4. Scaling danno nemici
- **`damagePerFactor`**: da 1.05 a 0.65, poi a 0.58 (curva più morbida)
- Curva di crescita del danno più morbida nel tempo
- Evita che a 10+ minuti il giocatore muoia istantaneamente

## Risultati simulati (post-fix v2 – Feb 2025)

| Nemici a contatto | DPS   | Sopravvivenza (220 HP) |
|-------------------|-------|------------------------|
| 1                 | 8.0   | 27.5s                  |
| 3                 | 24.0  | 9.2s                   |
| 5                 | 40.0  | 5.5s                   |
| 8                 | 64.0  | 3.4s                   |
| 12                | 96.0  | 2.3s                   |

A 10 minuti con 5 nemici (damage ~34): DPS ~170, sopravvivenza ~1.3s base, ~3s con +5 Vitalità e 6% DR. Margine sufficiente per usare shockwave/heal e disimpegnarsi.

## Simulazione

Esegui `node scripts/balance-simulation.js` per rivedere i numeri.
