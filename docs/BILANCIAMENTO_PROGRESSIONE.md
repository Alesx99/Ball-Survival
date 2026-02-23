# Panoramica bilanciamento: progressione personaggio, core e armi

## 1. Come scalano le statistiche al salire di livello

### Curve XP (config: `config/player.js`)
- **Formula:** `xpNext = base * growth^(level-1) + levelFactor * level`
- **Valori attuali:** `base: 12`, `growth: 1.15`, `levelFactor: 10`
- **Esempi:** Livello 1→2: 22 XP, Livello 5→6: ~71 XP, Livello 10→11: ~142 XP

I primi livelli sono **molto veloci**: pochi kill e sali. Più livelli = più upgrade = più danno/XP → **effetto palla di neve**.

### Stat per level-up (run, non permanenti)
- **Passivi (scelta a ogni level):**
  - Vitalità: **+60 HP** a livello (max 10) → fino a +600 HP
  - Rapidità: **+0,4 velocità** (max 5)
  - Armatura: **+3% riduzione danno** (max 10) → fino a 30% DR
  - Velocità attacco: **cooldown ×0,92** a livello (max 5) → ~34% meno cooldown
- **Spell (esempi):**
  - Fireball: **+8 danno, +8 raggio** a livello (max 4) → +32 danno
  - Shockwave: **+10 danno, +15 raggio, +5 knockback** a livello (max 4)
  - Lightning: **+6 danno, +1 rimbalzo** a livello
- **Torrona (passivo speciale):** Ogni livello: **+4% power, +4% area**, frequency ×0,96, **+0,2 speed**. Al livello 9 aggiunge anche **+100% Curse**. Fino a 9 livelli → **+36% power** solo da Torrona.

### Modificatore “power” (moltiplicatore danno globale)
- **Base:** 1,0
- **Upgrade permanenti (menu):** +8% per livello (max 10) → **+80%** (totale 1,8)
- **Archetipo:** es. Unstable +40%, Tech -5%
- **Core:** Stellare +15%, Arcano +18% → moltiplicatori sul `power`
- **Torrona (in run):** fino a +36%
- **Effetto:** Con permanenti max + Torrona + core si arriva facilmente a **2,5–3× power**.  
  **Tutto il danno** (spell + armi + core che usano `getDamage`) viene moltiplicato per `power`.

---

## 2. Perché si sente lo snowballing

1. **XP iniziale bassa** → livelli 1–5 molto rapidi → tanti upgrade subito.
2. **Ogni livello** dà bonus forti (60 HP, +8 danno spell, ecc.) e **3 scelte** → si impilano passivi e livelli spell.
3. **`modifiers.power`** si impila da più fonti (permanenti, Torrona, core) e moltiplica **tutto**.
4. **Nemici:** HP e danno scalano con `combinedFactor = (tempo/12) + (livello × 0,75)` (lineare).  
   Il danno del giocatore cresce con livello **e** con power → può crescere più in fretta dell’HP dei nemici.

---

## 3. Core e armi: perché sembrano “troppo forti”

### Come viene applicato il danno
- **Spell:** `getDamage(dannoBase)` = `dannoBase × (damageBoost?) × modifiers.power`
- **Armi:** stessa cosa: `this.getDamage(eff.damage)` → il danno dell’arma viene moltiplicato per **power**.
- **Core “danno”:**
  - **Stellare:** `modifiers.power *= 1.15`
  - **Arcano:** `modifiers.power *= 1.18`  
  Quindi non sono “danno fisso”, ma **aumentano il moltiplicatore globale** (spell + armi).

### Numeri di riferimento (config equipment)
- **Core:** Veleno 3 DPS, Fuoco 5 DPS, Vulcanico 8, Tempesta 12, Stellare +15% power, Arcano +18% power.
- **Armi:** Spine 10, Lama Ossidiana 15, Void 18, Impulso Stellare 20, Fulmine Arcano 14, ecc.  
  Con power 2×, un’arma da 20 diventa **40**; con 3× diventa **60**.

### Perché “scalano troppo col danno”
- Power alto moltiplica **sia** spell **sia** armi **sia** effetti core che passano da `getDamage`.
- Core Stellare + Arcano da soli portano power a ×1,357; insieme a permanenti e Torrona si arriva facilmente a **×2,5–3**.
- Le armi non sono “danno base early game”: sono **scalate come le spell** → late game diventano molto forti.

---

## 4. Riepilogo problemi

| Problema | Causa probabile |
|----------|------------------|
| Snowballing | XP early bassa, molti level-up rapidi, power che si impila |
| Stat che “esplodono” | +60 HP / +8 danno spell per level, Torrona +36% power, nessun soft cap |
| Core “troppo forti” | Stellare/Arcano moltiplicano power globale; altri core beneficiano di power alto |
| Armi “troppo forti” | Stesso moltiplicatore `power` delle spell → scale late game altissime |

---

## 5. Possibili direzioni di intervento (da decidere)

- **XP / curve livello**
  - Aumentare `base` o `growth` (o ridurre `levelFactor`) per livelli 1–10 più lenti.
  - Introdurre un “costo” extra per livello (es. crescita esponenziale più marcata).

- **Stat per level-up**
  - Ridurre bonus per livello (es. 40 HP invece di 60, +5 danno fireball invece di +8).
  - Ridurre o limitare i livelli massimi di passivi/spell.
  - Torrona: meno % power per livello o cap (es. max +20% invece di +36%).

- **Power e moltiplicatori**
  - Cap su `modifiers.power` (es. max 2.0 o 2.2).
  - Core Stellare/Arcano: da moltiplicatori a bonus additivi (es. +10% / +12% su base 1,0) o valori più bassi.

- **Core e armi**
  - Armi: usare **danno “parzialmente flat”** (es. `baseDamage + (baseDamage * (power - 1) * 0.5)`) per ridurre scaling col power.
  - Core con danno fisso (Veleno, Fuoco, Tempesta): non farli passare da `getDamage` (già flat) oppure applicare un moltiplicatore ridotto (es. sqrt(power)).

Quando vuoi, possiamo scegliere **una o due** di queste direzioni (es. “rallentare early level” + “cap power”) e tradurle in numeri e modifiche precise nei file di config e nel codice.

---

## 6. Modifica applicata: power "linearizzato" (danni meno moltiplicativi)

È stato introdotto un **moltiplicatore effettivo** con diminishing returns su `modifiers.power`:

- **Formula:** `effectivePower = 1 + (rawPower - 1) * 0.5`
- **Effetto:** Con power 2× il danno è 1.5× (non 2×); con power 3× è 2× (non 3×). Lo stacking di power conta meno.
- **Dove si usa:** `SpellSystem.getDamage()` (spell + armi), meteor (MetaProgressionSystem), esplosione instabile e bomba (Player). Il fattore `0.5` è in `SpellSystem.getEffectivePower()`.