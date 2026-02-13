# Piano di Sviluppo - Ball Survival

Piano dettagliato per le prossime funzionalità, in ordine di priorità.

---

## Fase 1: Testing

**Obiettivo**: Garantire stabilità e regressioni con test automatizzati.

### 1.1 Setup test
- [x] Installare Vitest (o Jest) come runner
- [x] Configurare `vitest.config.js` con coverage
- [x] Script npm: `test`, `test:run`, `test:coverage`
- [x] Directory `tests/`

### 1.2 Test unitari – Utils
- [x] `Utils.getDistance()` – distanza tra due punti
- [x] `Utils.findNearest()` – entità più vicina
- [ ] `Utils.clamp()` / helpers matematici se presenti

### 1.3 Test unitari – Sistemi core
- [x] **BalanceSystem** – `calculateRetention`, `calculateSatisfaction`
- [ ] **ProgressionSystem** – `checkForLevelUp`, scelta upgrade (opzionale)
- [x] **SaveSystem** – `generateSaveCode` (roundtrip base64)
- [ ] **SpellSystem** – cooldown, `getDamage()` (opzionale)

### 1.4 Test integrazione leggeri
- [x] Config: CONFIG valido, stage definiti
- [ ] Entities: Player.initStats, Enemy.update (opzionale)

**Deliverable**: Suite test eseguibile con `npm test`, almeno 80% coverage sui moduli critici.

---

## Fase 2: Musica di sottofondo ✅

**Obiettivo**: Aggiungere musica loop durante il gameplay.

### 2.1 Scelta approccio
- [x] **B**: Musica procedurale con Web Audio API – nessun asset, generata al volo
- [ ] **B**: Musica procedurale con Web Audio API – nessun asset, generata al volo
- [ ] **C**: Libreria esterna (es. tone.js) per pattern melodici – più controllo

### 2.2 Implementazione
- [x] Estendere `AudioManager` con `playBackgroundMusic()`, `stopBackgroundMusic()`
- [x] Loop senza gap (AudioBuffer con loop=true)
- [x] Avvio musica al `startGame`, stop al `gameOver` / ritorno al menu
- [x] Rispettare policy browser: start solo dopo user interaction

### 2.3 File da creare/modificare
- [x] `src/systems/AudioManager.js` – metodi musica
- [x] `src/core/Game.js` – hook start/stop musica
- [ ] (Opzionale) `public/audio/bgm-loop.ogg` se approccio A

**Deliverable**: Musica di sottofondo durante la partita, disattivabile in seguito (Fase 3).

---

## Fase 3: Opzioni audio ✅

**Obiettivo**: Volume e mute per suoni e musica.

### 3.1 UI
- [x] Sezione "Audio" in menu Impostazioni (pulsante ⚙️)
- [x] Slider volume effetti (0–100%)
- [x] Slider volume musica (0–100%)
- [x] Toggle mute globale
- [x] Salvataggio preferenze in `localStorage`

### 3.2 Backend
- [x] `AudioManager`: `setEffectsVolume(0–1)`, `setMusicVolume(0–1)`, `setMuted(bool)`
- [ ] Applicare gain node su ogni suono / canale musica
- [ ] Caricare preferenze all’avvio

### 3.3 File da creare/modificare
- [x] `src/systems/AudioManager.js` – gain, persistenza
- [x] `src/core/Game.js` – showSettingsPopup, _wireSettingsAudio
- [x] `index.html` – markup popup impostazioni

**Deliverable**: Menu impostazioni con volume e mute funzionanti e persistenti.

---

## Fase 4: Fine-tuning bilanciamento ✅

**Obiettivo**: Migliorare equilibrio gameplay da feedback reale.

### 4.1 Raccolta dati (manuale o script)
- [x] Simulazione `scripts/balance-simulation.js` con scenari scaling, build, i-frames
- [x] Metriche: DPS da contatto, sopravvivenza per N nemici, scaling tempo

### 4.2 Aggiustamenti configurazione
- [x] HP base 200 → 220, contactDamageCooldown 0.9 → 1.0, damagePerFactor 0.65 → 0.58
- [ ] Eventuale differenziazione per stage (Stage 1 vs Stage 5) – opzionale
- [x] Aggiornare `scripts/balance-simulation.js` con nuovi parametri
- [x] Documentare modifiche in `docs/BALANCE_NOTES.md`

### 4.3 Test e iterazione
- [x] Rieseguire simulazioni
- [ ] Validare con gameplay reale (manuale)

**Deliverable**: Bilanciamento aggiornato e documentato, simulazione allineata.

---

## Fase 5: Accessibilità ✅

**Obiettivo**: Gioco usabile da più utenti possibili.

### 5.1 Controlli
- [x] Tutti i controlli raggiungibili da tastiera (già WASD + E + ESC)
- [ ] Focus visibile su elementi interattivi (outline)
- [ ] Ordine tab sensato nei menu
- [ ] Evitare shortcut che catturano il focus in modo inaspettato

### 5.2 Visivo
- [ ] Contrasto testo/sfondo conforme a WCAG AA
- [x] Opzione "alta visibilità" (bordi più marcati, colori più contrastati)
- [ ] Test con screen reader su elementi UI principali (label, ruoli ARIA)

### 5.3 Motion / Epilessia
- [x] Opzione "ridotta motion" – disattivare/ridurre particelle, flash, vignette, trail, screen shake
- [ ] Evitare pattern lampeggianti potenzialmente pericolosi

### 5.4 File da creare/modificare
- [x] `CONFIG.accessibility` – flag `reduceMotion`, `highContrast` (in config/index.js)
- [x] `style.css` – classe `.high-contrast` su body
- [x] `RenderSystem`, `Player`, `Enemy`, `Boss` – applicare flag dove serve
- [x] `index.html` – checkbox accessibilità in Impostazioni, aria-label

**Deliverable**: Gioco accessibile con opzioni visive e di motion configurabili.

---

## Fase 6: PWA (Progressive Web App) ✅

**Obiettivo**: Installabile su mobile/desktop, funzionamento offline limitato.

### 6.1 Manifest
- [x] vite-plugin-pwa genera manifest.webmanifest (name, short_name, icons, start_url, display)
- [x] Link manifest iniettato automaticamente nel build
- [x] Icona SVG in public/icon.svg

### 6.2 Service Worker
- [x] Workbox generateSW con autoUpdate
- [x] Precache di JS, CSS, HTML (7 entries)
- [x] Runtime cache per Google Fonts

### 6.3 Integrazione build
- [x] vite-plugin-pwa in vite.config.js
- [x] Build produce sw.js, manifest.webmanifest, registerSW.js
- [ ] Test su HTTPS (richiesto per SW)

### 6.4 Meta e asset
- [x] Meta tag viewport, theme-color (#8b4513), description
- [x] Icona PWA (SVG) coerente con il tema

**Deliverable**: App installabile, con supporto offline di base per asset e index.

---

## Riepilogo ordine esecuzione

| Fase | Contenuto principale        | Stima |
|------|-----------------------------|-------|
| 1    | Testing (Vitest + unit test)| 1–2 gg|
| 2    | Musica di sottofondo        | 0.5 gg|
| 3    | Opzioni audio               | 0.5 gg|
| 4    | Fine-tuning bilanciamento   | 0.5–1 gg|
| 5    | Accessibilità               | 1 gg  |
| 6    | PWA                         | 1 gg  |

**Totale stimato**: ~5–6 giorni di sviluppo.

---

## Note

- Ogni fase può essere committata separatamente.
- Dopo Fase 1, eseguire `npm test` prima di ogni merge significativo.
- Le Fasi 2 e 3 sono collegate: la musica userà il volume della Fase 3.
