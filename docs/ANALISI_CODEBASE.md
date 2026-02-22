# Analisi codebase – Ball Survival

Analisi effettuata su struttura, architettura, pattern e debito tecnico. Di seguito cosa migliorare, in ordine di priorità.

---

## Priorità alta (bug / comportamento errato)

### 1. MetaProgressionSystem – riferimenti errati
**File:** `src/systems/MetaProgressionSystem.js` (circa righe 126, 140, 155)

- Usa `this.game.poolManager`: in `Game` il pool è importato come `poolManager`, non esposto come proprietà.
- Usa `this.game.projectiles`: in `Game` i proiettili sono in `this.entities.projectiles`.
- Tipo pool: viene usato `'projectile'`; il resto del codice usa `'Projectile'` (maiuscolo).

**Effetto:** rischio di crash o proiettili non aggiunti correttamente quando il sistema meta-progressione spara (es. meteora).

**Fix suggerito:** importare `poolManager` da `../utils/PoolManager.js`, usare `this.game.entities.projectiles` e `addEntity('projectiles', ...)`, e tipo pool `'Projectile'` come in SpellSystem.

---

### 2. Popup crafting duplicato in HTML
**File:** `index.html` (blocchi circa righe 448 e 464)

- Due blocchi identici con stessi `id`: `craftingPopup`, `closeCraftingBtn`, `craftingContent`, `craftingPreviewList`.
- ID duplicati sono invalidi e possono far selezionare l’elemento sbagliato da JS.

**Fix:** eliminare uno dei due blocchi duplicati.

---

## Priorità media (manutenibilità e robustezza)

### 3. Numeri magici e timing a frame
**File:** `src/core/Game.js`, `CheatCodeSystem.js`, vari sistemi

- Intervalli espressi in frame (es. `1800` = 30 s, `3600` = 60 s) o ms sparsi nel codice.
- Nessuna costante centralizzata (FPS, secondi per check retention, cloud sync, power-up).

**Suggerimento:** introdurre costanti con nome (es. `FPS = 60`, `RETENTION_CHECK_FRAMES`, `CLOUD_SYNC_INTERVAL_MS`) e usarle ovunque per timer e intervalli.

---

### 4. Chiavi localStorage sparse
**File:** SaveSystem, CheatCodeSystem, SkinSystem, RunHistorySystem, BestiarySystem, StageSystem, LoginManager, AuthService, achievements

- Molte chiavi `ballSurvival*` e forme dei dati definite in punti diversi.
- Nessun modulo unico che definisce chiavi e formato; refactoring e migrazione versioni sono più difficili.

**Suggerimento:** un unico modulo (o lista) che definisce tutte le chiavi e le forme; il resto del codice passa da lì per lettura/scrittura.

---

### 5. Gestione errori su persistenza e rete
**File:** SaveSystem (ha try/catch), altri sistemi che usano localStorage/cloud/auth

- SaveSystem gestisce errori in generate/load save code.
- Altri punti (localStorage, cloud sync, auth) non hanno sempre try/catch; errori di parse/rete possono far crashare l’app o lasciare stato incoerente.

**Suggerimento:** try/catch e messaggio all’utente dove si legge/scrive stato persistente o si chiama la rete; fallback sicuro (es. stato default) in caso di errore.

---

### 6. Creazione proiettili ripetuta
**File:** `src/systems/SpellSystem.js` (e ovunque si usano proiettili pooled)

- Pattern ripetuto: `poolManager.get('Projectile', () => new Projectile(0, 0, {})).init(...)`.
- Aumenta rumore e rischio di dimenticare pool type o init.

**Suggerimento:** helper centralizzato, es. `game.addPooledProjectile(x, y, props)` (o simile in SpellSystem) che incapsula get + init + addEntity.

---

## Priorità bassa (struttura e lunghezza file)

### 7. Due stili per i “sistemi”
- Alcuni sistemi sono **classi** con `game` iniettato (AudioManager, SkinSystem, MetaProgressionSystem, DailyChallengeSystem, …).
- Altri sono **mixin** assegnati a `BallSurvivalGame.prototype` (SpellSystem, SpawnSystem, RenderSystem, SaveSystem, …).

**Suggerimento:** scegliere uno stile (tutti classi o tutti mixin), documentarlo e allineare i sistemi; riduce confusione e accoppiamento.

---

### 8. Game.js molto grande
**File:** `src/core/Game.js` (~700+ righe prima dei mixin)

- Contiene loop, input, menu, boss rush, daily, shop, joystick, inizializzazione di molti sistemi.
- Ogni nuova feature tende a toccare Game.

**Suggerimento:** estrarre in moduli/controller (es. menu, joystick, modalità boss rush/daily) e lasciare Game come coordinatore che chiama questi moduli.

---

### 9. File molto lunghi
- **RenderSystem.js**: 800+ righe (tutto il disegno).
- **config/index.js**: 500+ righe.
- **LoginManager.js**: 700+ righe.
- **utils/index.js**: 330+ righe.
- **systems/index.js**: 380+ righe (analytics + achievements).

**Suggerimento:** spezzare per dominio (es. config: stages, nemici, player; Render: background, entità, HUD, notifiche) per navigazione e test più facili.

---

### 10. Test insufficienti
**Cartella:** `tests/`

- Esistono test per config, BalanceSystem, utils, SaveSystem, verify_sprint8.
- Loop principale, RenderSystem, SpawnSystem, SpellSystem, uso dei pool e MetaProgressionSystem non sono coperti.

**Suggerimento:** aggiungere test per: contratto update/draw del loop, load/save SaveSystem, uso pool in Spawn/Spell (e MetaProgression dopo il fix), e almeno un test di integrazione su un flusso critico.

---

## Riepilogo architettura (riferimento)

- **Entry:** `index.html` → `src/main.js` → `BallSurvivalGame`, poi `gameLoop()`.
- **Loop:** timestep fisso 1/60 s (max 3 step), `update()` poi `draw()` ogni frame.
- **Entità:** array in `this.entities` (enemies, projectiles, particles, auras, …); pool solo per `Projectile` e `Enemy`.
- **Sistemi:** comunicano tramite `this` (game): `this.player`, `this.entities`, `addEntity()`, `getEnemiesAndBosses()`, CONFIG.
- **Dipendenze:** nessuna libreria runtime; build con Vite, test con Vitest, PWA con vite-plugin-pwa.

---

## Azioni consigliate (ordine)

1. Correggere **MetaProgressionSystem** (pool + entities.projectiles + tipo `Projectile`).
2. Rimuovere il **popup crafting duplicato** in `index.html`.
3. Introdurre **costanti per FPS e intervalli** e sostituire i numeri magici.
4. Aggiungere **try/catch e feedback utente** su localStorage/cloud/auth dove manca.
5. Centralizzare **chiavi e formato localStorage** (modulo o lista).
6. Aggiungere **helper per proiettili pooled** e usarlo in SpellSystem (e altrove).
7. Decidere **stile sistemi** (classe vs mixin) e documentarlo.
8. **Scomporre Game.js** e i file più lunghi (RenderSystem, config) per dominio.
9. **Estendere i test** su loop, save, pool e MetaProgressionSystem.

Se vuoi, il prossimo passo può essere implementare i fix 1 e 2 (MetaProgressionSystem + HTML) direttamente nel codice.
