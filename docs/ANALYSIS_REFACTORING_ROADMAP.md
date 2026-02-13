# Analisi profonda – Refactoring e nuove feature

Documento generato da analisi statica del codebase Ball Survival v6.0.2.

---

## 1. Metriche codice

### Linee per file (src/)

| File | Linee | Ruolo |
|------|-------|-------|
| Player.js | 925 | Entità giocatore – **molto grande** |
| UISystem.js | 879 | UI, popup, menu |
| LoginManager.js | 793 | Auth, cloud sync – **molto grande** |
| Game.js | 638 | Core orchestrator |
| RenderSystem.js | 373 | Canvas, camera, draw |
| systems/index.js | 335 | Analytics, Retention, Progression, Achievements |
| config/index.js | 340 | Configurazione centralizzata |
| SpellSystem.js | 320 | Spell e cast |
| AudioManager.js | 302 | Suoni e BGM |
| utils/index.js | 285 | Utils, draw helpers |
| WeaponSystem.js | 247 | Armi, proiettili, effetti |
| BalanceSystem.js | 219 | Retention, soddisfazione |
| SaveSystem.js | 200 | Salvataggio, codice, load |
| CraftingSystem.js | 195 | Materiali, drop, craft |
| SpawnSystem.js | 169 | Nemici, boss, chest |
| Orbs.js | 159 | XP, gemme, materiali |
| Areas.js | 158 | Aree, effetti zona |
| StageSystem.js | 123 | Stage, transizioni |
| ProgressionSystem.js | 146 | Level up, upgrade |
| Particles.js | 103 | Particelle, effetti |
| cloudSync.js | 116 | Sync cloud |
| security.js | 99 | Hash password |
| Boss.js | 89 | Entità boss |
| Items.js | 75 | Item, chest |
| Projectile.js | 72 | Proiettili |
| Entity.js | 20 | Base entity |
| main.js | 44 | Bootstrap |

**Totale stimato**: ~8.500 linee in `src/`.

---

## 2. Technical debt e code smells

### 2.1 Duplicazione

| Elemento | Ubicazioni | Soluzione |
|----------|------------|-----------|
| **`unlockedArchetypes`** | `UISystem.js` (3×), `Game.js` (1×) | Estrarre `getUnlockedArchetypes(totalGems)` in utils o ProgressionSystem |
| **Threshold gemme archetipi** | Hardcoded `200, 300, 300, 400, 800` in 4 punti | Centralizzare in `CONFIG.characterArchetypes[].cost` e derivare sblocco |
| **`findNearest` + spread enemies** | SpellSystem: `[...this.entities.enemies, ...this.entities.bosses]` ripetuto ~15× | Helper `getEnemiesAndBosses()` su Game |
| **`this.addEntity('particles', new Particle(...))`** | Pattern ripetuto in Spell, Enemy, Boss, Weapon | `addParticles(x, y, count, color, opts)` |

### 2.2 File troppo grandi

- **Player.js (925)** – Molti `draw*Core` e `draw*Weapon` (6 core, 6 armi). Possibile estrazione in `PlayerVisuals.js` o `CONFIG.cores[].draw`, `CONFIG.weapons[].draw`.
- **LoginManager.js (793)** – Mix di UI DOM, cloud sync, validazione. Separare: `AuthService` (logica) vs `LoginUI` (DOM).
- **UISystem.js (879)** – Populate di molti popup. Possibile split: `UISystem`, `ShopUI`, `InventoryUI`, `AchievementsUI`.

### 2.3 Configurazione

- **CONFIG (340)** – Contiene `draw` functions inline per archetipi. Separare `config/data.js` (dati puri) da `config/visuals.js` (draw).
- **SpellSystem** – `drawFunc` inline in ogni `cast*`. Estrarre in `CONFIG.spells[].drawProjectile` o modulo `SpellVisuals.js`.

### 2.4 Accoppiamento e dipendenze

- `Game` espone `_entityClasses`, `addEntity`, `createExplosion`, `spells`, `camera`, `player`, `entities` – molti sistemi dipendono da Game come “god object”.
- `SpellSystem` usa `setTimeout` per Meteor – fuori dal loop di gioco, può creare desync su pause/restart.

### 2.5 Altri code smells

- **Magic numbers** – Es. `0.88` (screen shake decay), `0.1` (camera lerp), `10` (hit flash frames). Spostare in CONFIG o costanti nominate.
- **index.html** – ~570 linee, HTML+inline style. Valutare template o componenti se il progetto cresce.
- **Mancanza TypeScript** – Nessun type checking; refactoring più rischioso.

---

## 3. Refactoring proposti (priorità)

### R1: Estrarre `getUnlockedArchetypes` – **Alta** ✅

- Creare `ProgressionSystem.getUnlockedArchetypes()` che ritorna `Set` basato su `totalGems`, `this.unlockedArchetypes` e `CONFIG.characterArchetypes`.
- Sostituire le 4 occorrenze in UISystem e Game.
- Aggiunto `saveGameData()` al buy archetype per persistenza.
- **Effort**: basso | **Impatto**: elimina duplicazione, single source of truth.

### R2: Helper `getEnemiesAndBosses()` – **Alta** ✅

- Aggiunto su Game: `getEnemiesAndBosses()`.
- Aggiornati SpellSystem, WeaponSystem, Areas, Particles, Projectile.
- **Effort**: basso | **Impatto**: meno ripetizioni, più chiarezza.

### R3: Parametri in CONFIG per effetti – **Media** ✅

- `CONFIG.effects = { screenShakeDecay, screenShakeMax, cameraLerp, hitFlashFrames }`.
- Usati in Game, RenderSystem, Player.
- **Effort**: basso | **Impatto**: valori sintonizzabili senza modificare logica.

### R4: Estrarre draw di Core/Weapon da Player – **Media** (3–4h)

- Creare `src/entities/PlayerVisuals.js` o usare `CONFIG.cores[id].draw`, `CONFIG.weapons[id].draw`.
- Player chiama `core.draw(ctx, this)` invece di switch gigante.
- **Effort**: medio | **Impatto**: Player più snello, nuove core/armi più facili.

### R5: Split LoginManager – **Media** (4–5h)

- `AuthService`: `loadPlayerData`, `savePlayerData`, `login`, `register`, `resetPlayerData`.
- `LoginUI`: `updateLoginUI`, gestione form, eventi DOM.
- LoginManager diventa facade che coordina i due.
- **Effort**: medio-alto | **Impatto**: testabilità, separazione responsabilità.

### R6: Estrarre spell drawFunc – **Media** (2h)

- Definire `CONFIG.spells[].projectileDraw` o `SpellVisuals.js` con funzioni per fireball, frostbolt, lightning_spear, ecc.
- SpellSystem passa solo `drawFunc: CONFIG.spells.fireball.projectileDraw` (o simile).
- **Effort**: medio | **Impatto**: SpellSystem più leggibile.

### R7: Split UISystem – **Bassa** (4–6h)

- `UISystem.js` (core: showPopup, hideAllPopups, resize).
- `ShopUI.js`, `InventoryUI.js`, `AchievementsUI.js`, `SettingsUI.js`.
- **Effort**: alto | **Impatto**: file più piccoli, responsabilità chiare.

---

## 4. Nuove feature (da DEVELOPMENT_PLAN + estese)

### Fase 5: Accessibilità (DEVELOPMENT_PLAN)

| Task | Descrizione | Stima |
|------|-------------|-------|
| 5.1 | `CONFIG.accessibility = { reduceMotion, highContrast }` + UI in Settings | 2h |
| 5.2 | Applicare flag a particelle, screen shake, vignette, hit flash | 1.5h |
| 5.3 | Contrasto WCAG AA, focus visibile, ordine tab | 2h |
| 5.4 | ARIA su pulsanti/menu | 1h |

**Totale Fase 5**: ~6.5h.

### Fase 6: PWA (DEVELOPMENT_PLAN)

| Task | Descrizione | Stima |
|------|-------------|-------|
| 6.1 | `manifest.json`, icone 192/512 | 2h |
| 6.2 | vite-plugin-pwa, Service Worker, precache | 3h |
| 6.3 | Meta viewport, theme-color, favicon | 0.5h |

**Totale Fase 6**: ~5.5h.

### Testing (DEVELOPMENT_PLAN – completare Fase 1)

| Task | Descrizione | Stima |
|------|-------------|-------|
| 1.1 | Test ProgressionSystem (`checkForLevelUp`, `getUpgradeChoices`) | 2h |
| 1.2 | Test SpellSystem (cooldown, `getDamage`) | 2h |
| 1.3 | Test integrazione leggeri (Player.initStats, Enemy.update) | 2h |
| 1.4 | Coverage 80% su moduli critici | 2h |

**Totale Testing**: ~8h.

### Feature aggiuntive (idee)

| ID | Feature | Descrizione | Stima |
|----|---------|-------------|-------|
| F1 | **Daily challenge** | Seed giornaliero, obiettivi specifici, ricompense gemme | 8h |
| F2 | **Leaderboard** | Classifica per tempo/score (locale o cloud) | 6h |
| F3 | **Nuovo stage** | Stage 6 con tema e nemici unici | 4h |
| F4 | **Tutorial** | Onboarding per nuovi giocatori | 4h |
| F5 | **Statistiche run** | Dettaglio danni, kill per tipo, uptime spell | 3h |
| F6 | **Doppia BGM** | Musica “calma” vs “battaglia” con crossfade | 2h |
| F7 | **Replay / ghost** | Salvataggio traiettoria e replay dopo game over | 12h |

---

## 5. Roadmap prioritaria

### Blocco A: Quick wins (refactor leggeri) – 1–2 giorni

1. **R1** – `getUnlockedArchetypes`
2. **R2** – `getEnemiesAndBosses`
3. **R3** – CONFIG effetti

### Blocco B: Accessibilità (Fase 5) – 1 giorno

4. **5.1–5.4** – Implementazione accessibilità completa

### Blocco C: PWA (Fase 6) – 1 giorno

5. **6.1–6.3** – PWA installabile

### Blocco D: Refactor medio – 2–3 giorni

6. **R4** – Estrarre draw Core/Weapon
7. **R6** – Estrarre spell drawFunc
8. **R5** – Split LoginManager (opzionale)

### Blocco E: Testing – 1–2 giorni

9. **1.1–1.4** – Completare Fase 1 Testing

### Blocco F: Nuove feature (a scelta)

10. **F6** – Doppia BGM (2h)
11. **F5** – Statistiche run (3h)
12. **F3** – Nuovo stage (4h)
13. **F2** – Leaderboard (6h)

---

## 6. Riepilogo stime

| Categoria | Ore stimate |
|-----------|-------------|
| Refactoring quick wins (R1–R3) | 2.5 |
| Accessibilità (Fase 5) | 6.5 |
| PWA (Fase 6) | 5.5 |
| Refactoring medio (R4–R6) | 9 |
| Testing (Fase 1) | 8 |
| **Totale roadmap core** | **~31.5h** |
| Feature opzionali (F2–F7) | 39+ |

---

## 7. Raccomandazioni

1. **Subito**: R1, R2, R3 – basso rischio, beneficio immediato.
2. **Prossimo sprint**: Fase 5 (Accessibilità) e Fase 6 (PWA) – valore utente e deploy.
3. **In parallelo**: R4 (draw Core/Weapon) per ridurre complessità di Player.
4. **Dopo**: Testing (Fase 1) e R5/R7 se si prevede crescita significativa del progetto.
