# Piano Grafica e Audio - Ball Survival

Piano strutturato in step sequenziali. Procedere **uno alla volta**.

---

## Step 1: Variabilità pitch sugli effetti audio ✅
**Area:** Audio | **Stima:** 15 min

- [x] Applicare variazione random al pitch in `_beep()` e metodi correlati
- [x] Formula: `freq * (1 - amount/2 + Math.random() * amount)` (default 10%)
- [x] File: `src/systems/AudioManager.js`

**Risultato:** Suoni meno ripetitivi e meccanici.

---

## Step 2: Glow sugli orbs (XP, gemme, materiali) ✅
**Area:** Grafica | **Stima:** 20 min

- [x] Usare `ctx.shadowBlur` e `ctx.shadowColor` nel draw degli orbs
- [x] Glow leggero, colore coerente con tipo orb (XP verde, gemma cyan, materiali per rarità)
- [x] File: `src/entities/Orbs.js`

**Risultato:** Pickup più visibili e gradevoli.

---

## Step 3: Particelle alla morte nemici ✅
**Area:** Grafica | **Stima:** 25 min

- [x] Alla morte di un nemico, spawnare particelle dal sistema esistente
- [x] Colore basato su stage (baseColor/eliteColor), elite = 14 part., normali = 8
- [x] Boss: 20 particelle viola aggiuntive in `Boss.onDeath`
- [x] File: `src/entities/Enemy.js`, `src/entities/Boss.js`

**Risultato:** Morte nemici più soddisfacente.

---

## Step 4: ADSR sugli effetti audio ✅
**Area:** Audio | **Stima:** 20 min

- [x] Envelope Attack–Decay: helper `_applyEnvelope(gain, start, duration, vol, attackRatio)`
- [x] `_beep()` usa l'envelope; level up e game over anche
- [x] File: `src/systems/AudioManager.js`

**Risultato:** Suoni più naturali, meno "flat".

---

## Step 5: Camera smooth (lerp) ✅
**Area:** Grafica | **Stima:** 15 min

- [x] Interpolazione camera verso posizione target (player), factor 0.1
- [x] `updateCamera()` in `RenderSystem.js` con lerp + clamp ai bordi mondo
- [x] `clearCanvas()`: camera centrata su player per evitare salto al reset
- [x] File: `src/systems/RenderSystem.js`

**Risultato:** Movimento più fluido, meno "agganciato".

---

## Step 6: Screen shake ✅
**Area:** Grafica | **Stima:** 25 min

- [x] `screenShakeIntensity` in Game, decay 0.88 per frame in gameLoop
- [x] `addScreenShake(amount)` su Game; rispetta `CONFIG.accessibility?.reduceMotion`
- [x] `ctx.translate(shakeX, shakeY)` in RenderSystem.draw() (dopo scale)
- [x] Trigger: player takeDamage 10, enemy death 3/5 (elite), boss 12, createExplosion 4 + radius/15
- [x] File: `Game.js`, `RenderSystem.js`, `Player.js`, `Enemy.js`, `Boss.js`, `SpellSystem.js`

**Risultato:** Impatto visivo agli eventi importanti.

---

## Step 7: BGM più ricca ✅
**Area:** Audio | **Stima:** 30 min

- [x] Accordo C minore (C, Eb, G) leggermente ridotto
- [x] Melodia 8 note (C4→Eb4→G4→C5→G4→Eb4→C4) con envelope
- [x] Arpeggio C4–Eb4–G4–C5 ogni 0.35s
- [x] Basso C2 con pluck sui beat (0.5s)
- [x] Loop 8 secondi
- [x] File: `src/systems/AudioManager.js`

**Risultato:** Musica di sottofondo meno monotona.

---

## Step 8: Hit flash (danno player) ✅
**Area:** Grafica | **Stima:** 20 min

- [x] `hitFlashTimer` su Game, impostato a 10 in Player.takeDamage
- [x] Overlay rosso `rgba(255,50,50,α)` con alpha proporzionale al timer (max 0.35)
- [x] Decay 1 per frame in gameLoop; disegno dopo ctx.restore() in RenderSystem
- [x] File: `Game.js`, `RenderSystem.js`, `Player.js`

**Risultato:** Feedback visivo immediato al danno.

---

## Step 9: Vignette ai bordi ✅
**Area:** Grafica | **Stima:** 15 min

- [x] Gradiente radiale da centro (trasparente) a bordi (nero 40% opacità)
- [x] Disegno dopo hit flash, prima degli indicatori offscreen
- [x] File: `src/systems/RenderSystem.js`

**Risultato:** Maggiore profondità e focus sul centro.

---

## Step 10: Trail sul player ✅
**Area:** Grafica | **Stima:** 25 min

- [x] Array `_trail` di posizioni recenti (max 12), aggiornato in update quando si muove
- [x] Trail solo se speed > 0.5
- [x] Disegno: cerchi sfumati con colore archetipo, alpha decrescente
- [x] Reset `_trail` in resetForNewRun
- [x] File: `src/entities/Player.js`

**Risultato:** Senso di movimento più dinamico.

---

## Riepilogo

| Step | Descrizione            | Area   | Stima |
|------|------------------------|--------|-------|
| 1    | Variabilità pitch      | Audio  | 15 m  |
| 2    | Glow su orbs           | Grafica| 20 m  |
| 3    | Part. morte nemici     | Grafica| 25 m  |
| 4    | ADSR effetti           | Audio  | 20 m  |
| 5    | Camera smooth          | Grafica| 15 m  |
| 6    | Screen shake           | Grafica| 25 m  |
| 7    | BGM più ricca          | Audio  | 30 m  |
| 8    | Hit flash              | Grafica| 20 m  |
| 9    | Vignette               | Grafica| 15 m  |
| 10   | Trail player           | Grafica| 25 m  |

**Totale stimato:** ~3 ore.

---

## Note

- Ogni step è indipendente e testabile da solo.
- Dopo ogni step: build, test manuale, commit.
- Se un passo richiede modifiche impreviste, documentare in CHANGELOG.
