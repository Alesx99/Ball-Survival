# Documentazione API Completa - Ball Survival

## Indice

1. [Introduzione](#introduzione)
2. [Sistema di Login](#sistema-di-login)
3. [Classe BallSurvivalGame](#classe-ballsurvivalgame)
4. [Classe AnalyticsManager](#classe-analyticsmanager)
5. [Classi Entity](#classi-entity)
6. [Configurazione Globale (CONFIG)](#configurazione-globale-config)
7. [Funzioni Globali](#funzioni-globali)
8. [Sistemi di Gioco](#sistemi-di-gioco)
9. [Esempi di Utilizzo](#esempi-di-utilizzo)

---

## Introduzione

Ball Survival è un gioco HTML5 sviluppato con JavaScript vanilla. Questo documento descrive tutte le API pubbliche, funzioni e componenti disponibili per sviluppatori e utenti avanzati.

### Struttura del Progetto

- `game.js`: Logica principale del gioco (circa 7000+ righe)
- `login-simple.js`: Sistema di autenticazione e gestione utenti
- `index.html`: Interfaccia utente principale
- `style.css`: Stili e animazioni

---

## Sistema di Login

### Funzioni Pubbliche

#### `initLogin()`
Inizializza il sistema di login caricando i dati del giocatore salvati e aggiornando l'interfaccia.

```javascript
initLogin();
```

**Comportamento:**
- Carica i dati del giocatore da `localStorage`
- Aggiorna l'interfaccia utente del login
- Imposta lo stato globale `isLoggedIn` e `isGuest`

---

#### `login()`
Esegue il login di un utente esistente.

```javascript
async function login()
```

**Parametri:** Nessuno (legge dai campi HTML `username`, `password`, `githubToken`)

**Comportamento:**
- Valida username e password
- Configura il cloud sync se viene fornito un token GitHub
- Carica gli account dal cloud
- Autentica il giocatore
- Sincronizza i dati con analytics se disponibile

**Esempio:**
```javascript
// Compila i campi nel form HTML
document.getElementById('username').value = 'mioUsername';
document.getElementById('password').value = 'miaPassword';
document.getElementById('githubToken').value = 'ghp_xxxxxxxxxxxx';

// Esegui login
await login();
```

---

#### `register()`
Registra un nuovo utente.

```javascript
async function register()
```

**Parametri:** Nessuno (legge dai campi HTML `regUsername`, `regPassword`, `regPasswordConfirm`, `regGithubToken`)

**Validazioni:**
- Username minimo 3 caratteri
- Password minimo 4 caratteri
- Le password devono coincidere

**Esempio:**
```javascript
document.getElementById('regUsername').value = 'nuovoUtente';
document.getElementById('regPassword').value = 'password123';
document.getElementById('regPasswordConfirm').value = 'password123';

await register();
```

---

#### `logout()`
Esegue il logout dell'utente corrente.

```javascript
function logout()
```

**Comportamento:**
- Resetta i dati del giocatore
- Rimuove i dati da `localStorage`
- Aggiorna l'interfaccia utente

---

#### `playAsGuest()`
Crea un account guest temporaneo per giocare senza registrazione.

```javascript
function playAsGuest()
```

**Comportamento:**
- Crea un giocatore guest con username casuale
- Salva i dati localmente
- I progressi sono solo locali (non sincronizzati)

---

#### `updatePlayerStats(gameStats)`
Aggiorna le statistiche del giocatore dopo una partita.

```javascript
function updatePlayerStats(gameStats)
```

**Parametri:**
- `gameStats` (Object): Oggetto con le statistiche della partita
  - `duration` (number): Durata della partita in millisecondi
  - `level` (number): Livello raggiunto
  - `archetype` (string): ID dell'archetipo utilizzato

**Esempio:**
```javascript
const stats = {
    duration: 120000, // 2 minuti
    level: 15,
    archetype: 'steel'
};
updatePlayerStats(stats);
```

---

#### `getPlayerData()`
Restituisce i dati del giocatore corrente.

```javascript
function getPlayerData()
```

**Ritorna:** `Object | null`
- `id` (string): ID univoco del giocatore
- `username` (string): Nome utente
- `stats` (Object): Statistiche del giocatore
- `isGuest` (boolean): Se è un account guest

**Esempio:**
```javascript
const playerData = getPlayerData();
if (playerData) {
    console.log(`Giocatore: ${playerData.username}`);
    console.log(`Partite totali: ${playerData.stats.totalGames}`);
}
```

---

### Cloud Sync

#### `configureCloudSync(githubToken)`
Configura la sincronizzazione cloud con GitHub Gist.

```javascript
async function configureCloudSync(githubToken)
```

**Parametri:**
- `githubToken` (string): Token GitHub con permessi `gist`

**Comportamento:**
- Salva il token in `localStorage`
- Configura `AnalyticsManager`
- Testa la connessione al cloud

**Esempio:**
```javascript
await configureCloudSync('ghp_xxxxxxxxxxxxxxxxxxxx');
```

---

#### `syncUserAccounts()`
Sincronizza gli account utenti con il cloud.

```javascript
async function syncUserAccounts()
```

**Ritorna:** `Promise<boolean>` - `true` se la sincronizzazione è riuscita

**Comportamento:**
- Carica gli account da `localStorage`
- Carica i dati dal Gist
- Esegue un merge intelligente dei dati
- Carica i dati aggiornati nel Gist

**Esempio:**
```javascript
const success = await syncUserAccounts();
if (success) {
    console.log('Account sincronizzati con successo!');
}
```

---

#### `loadUserAccounts()`
Carica gli account utenti dal cloud.

```javascript
async function loadUserAccounts()
```

**Ritorna:** `Promise<boolean>` - `true` se il caricamento è riuscito

**Comportamento:**
- Scarica gli account dal Gist
- Esegue merge con gli account locali
- Salva gli account aggiornati in `localStorage`

---

#### `testCloudSync()`
Testa la connessione al cloud sync.

```javascript
async function testCloudSync()
```

**Ritorna:** `Promise<boolean>` - `true` se il test è riuscito

**Esempio:**
```javascript
const isWorking = await testCloudSync();
if (isWorking) {
    console.log('Cloud sync funzionante!');
} else {
    console.log('Errore nella connessione cloud');
}
```

---

#### `showCloudSyncConfig()`
Mostra il popup di configurazione del cloud sync.

```javascript
function showCloudSyncConfig()
```

**Comportamento:**
- Mostra il popup di configurazione
- Pre-compila il token se già salvato
- Aggiorna lo stato della sincronizzazione

**Esempio:**
```javascript
showCloudSyncConfig(); // Apre il popup di configurazione
```

---

#### `closeCloudSyncConfig()`
Chiude il popup di configurazione del cloud sync.

```javascript
function closeCloudSyncConfig()
```

---

#### `resetCloudSync()`
Resetta la configurazione del cloud sync.

```javascript
function resetCloudSync()
```

**Comportamento:**
- Rimuove il token salvato
- Disabilita il cloud sync
- Mostra un messaggio di conferma

**Esempio:**
```javascript
resetCloudSync(); // Richiede conferma prima di resettare
```

---

#### `testAccountSync()`
Testa la sincronizzazione degli account.

```javascript
async function testAccountSync()
```

**Comportamento:**
- Mostra gli account locali nella console
- Esegue sync e load degli account
- Mostra i risultati nella console

**Esempio:**
```javascript
await testAccountSync();
// Output nella console:
// 🧪 Test Sync Account...
// Account locali: ['user1', 'user2']
// Sync result: true
// Load result: true
// Account dopo sync: ['user1', 'user2', 'user3']
```

---

#### `forcePushCurrentUserToCloud()`
Forza la sovrascrittura dei dati dell'utente corrente sul cloud.

```javascript
async function forcePushCurrentUserToCloud()
```

**Comportamento:**
- Verifica che ci sia un utente loggato
- Sovrascrive i dati locali con quelli dell'utente corrente
- Sincronizza forzatamente con il cloud

**Esempio:**
```javascript
await forcePushCurrentUserToCloud();
// Mostra alert con risultato: "✅ Dati utente sovrascritti e sincronizzati sul cloud!"
```

---

#### `showLoginForm()`
Mostra il form di login.

```javascript
function showLoginForm()
```

**Comportamento:**
- Nasconde il menu principale
- Mostra il form di login
- Pre-compila il token GitHub se salvato

---

#### `showRegisterForm()`
Mostra il form di registrazione.

```javascript
function showRegisterForm()
```

**Comportamento:**
- Nasconde il menu principale
- Mostra il form di registrazione
- Pre-compila il token GitHub se salvato

---

#### `backToLoginMenu()`
Torna al menu principale del login.

```javascript
function backToLoginMenu()
```

**Comportamento:**
- Nasconde tutti i form
- Mostra il menu principale
- Nasconde eventuali messaggi

---

## Classe BallSurvivalGame

La classe principale del gioco, gestisce tutto il ciclo di vita della partita.

### Costruttore

```javascript
const game = new BallSurvivalGame('gameCanvas');
```

**Parametri:**
- `canvasId` (string): ID dell'elemento canvas HTML

**Proprietà Principali:**
- `canvas`: Elemento canvas HTML
- `ctx`: Contesto 2D del canvas
- `player`: Istanza del giocatore (`Player`)
- `state`: Stato corrente del gioco (`'startScreen' | 'running' | 'paused' | 'gameOver'`)
- `entities`: Oggetto contenente tutti gli entità del gioco
- `materials`: Inventario materiali
- `cores`: Core disponibili
- `weapons`: Armi disponibili
- `arsenal`: Arsenale attivo (core e armi equipaggiate)

---

### Metodi Principali

#### `startGame(isLoadedRun)`
Avvia una nuova partita.

```javascript
game.startGame(isLoadedRun = false)
```

**Parametri:**
- `isLoadedRun` (boolean): Se `true`, non resetta lo stato della run (per caricamenti)

**Comportamento:**
- Resetta lo stato della run
- Inizializza il giocatore con l'archetipo selezionato
- Applica i core e le armi equipaggiate
- Avvia il game loop

**Esempio:**
```javascript
// Avvia nuova partita
game.startGame();

// Carica partita salvata
game.startGame(true);
```

---

#### `gameOver()`
Termina la partita corrente e mostra lo schermo di game over.

```javascript
game.gameOver()
```

**Comportamento:**
- Salva le gemme guadagnate
- Registra le statistiche con AnalyticsManager
- Genera il codice di salvataggio
- Mostra il popup di game over

---

#### `togglePause()`
Mette in pausa o riprende il gioco.

```javascript
game.togglePause()
```

**Comportamento:**
- Se il gioco è in esecuzione, lo mette in pausa
- Se è in pausa, lo riprende
- Mostra/nasconde il menu di pausa

---

#### `showPopup(popupName)`
Mostra un popup specifico.

```javascript
game.showPopup(popupName)
```

**Parametri:**
- `popupName` (string): Nome del popup (`'start' | 'pause' | 'gameOver' | 'upgrade' | 'shop' | 'inventory' | 'characterSelection' | 'achievements'`)

**Esempio:**
```javascript
game.showPopup('shop'); // Mostra il negozio
game.showPopup('inventory'); // Mostra l'inventario
```

---

#### `hideAllPopups(keepStartScreen)`
Nasconde tutti i popup.

```javascript
game.hideAllPopups(keepStartScreen = false)
```

**Parametri:**
- `keepStartScreen` (boolean): Se `true`, mantiene visibile lo schermo iniziale

---

#### `generateSaveCode()`
Genera un codice di salvataggio per la partita corrente.

```javascript
const saveCode = game.generateSaveCode()
```

**Ritorna:** `string` - Codice di salvataggio codificato in base64

**Esempio:**
```javascript
const code = game.generateSaveCode();
console.log('Codice salvataggio:', code);
// Output: "eyJwZXJtYW5lbnRVcGdyYWRlcyI6eyJoZWFsdGgiOnsibGV2ZWwiOjB9fSwidG90YWxHZW1zIjowfQ=="
```

---

#### `loadFromSaveCode()`
Carica una partita da un codice di salvataggio.

```javascript
game.loadFromSaveCode()
```

**Comportamento:**
- Legge il codice dall'input HTML `loadCodeInput`
- Decodifica e applica i dati salvati
- Mostra una notifica di successo/errore

**Esempio:**
```javascript
// Imposta il codice nell'input HTML
document.getElementById('loadCodeInput').value = 'codice_salvataggio';

// Carica la partita
game.loadFromSaveCode();
```

---

#### `selectStage(stageId)`
Seleziona uno stage per la prossima partita.

```javascript
game.selectStage(stageId)
```

**Parametri:**
- `stageId` (number): ID dello stage (1-5)

**Comportamento:**
- Verifica se lo stage è sbloccato
- Aggiorna l'interfaccia utente
- Salva la selezione

---

#### `selectArchetype(archetypeId)`
Seleziona un archetipo di personaggio.

```javascript
game.selectArchetype(archetypeId)
```

**Parametri:**
- `archetypeId` (string): ID dell'archetipo (`'standard' | 'steel' | 'magma' | 'frost' | 'shadow' | 'tech'`)

**Esempio:**
```javascript
game.selectArchetype('steel'); // Seleziona Palla d'Acciaio
game.selectArchetype('shadow'); // Seleziona Sfera d'Ombra
```

---

### Gestione Inventario

#### `showInventory()`
Mostra il menu dell'inventario.

```javascript
game.showInventory()
```

**Comportamento:**
- Aggiorna la lista dei materiali
- Aggiorna la lista dei core e armi
- Mostra l'arsenale attivo

---

#### `closeInventory()`
Chiude il menu dell'inventario.

```javascript
game.closeInventory()
```

---

### Gestione Core e Armi

#### `craftCore(coreId)`
Crea un core utilizzando i materiali necessari.

```javascript
game.craftCore(coreId)
```

**Parametri:**
- `coreId` (string): ID del core da creare

**Comportamento:**
- Verifica se i materiali sono sufficienti
- Rimuove i materiali dall'inventario
- Aggiunge il core alla collezione
- Aggiorna l'interfaccia

**Esempio:**
```javascript
// Crea il Core Magnetico
game.craftCore('magnetic');
```

---

#### `equipCore(coreId)`
Equipaggia un core (solo 1 core può essere attivo).

```javascript
game.equipCore(coreId)
```

**Parametri:**
- `coreId` (string): ID del core da equipaggiare

**Comportamento:**
- Rimuove il core precedentemente equipaggiato
- Equipaggia il nuovo core
- Applica gli effetti del core

---

#### `unequipCore()`
Rimuove il core equipaggiato.

```javascript
game.unequipCore()
```

---

#### `craftWeapon(weaponId)`
Crea un'arma utilizzando i materiali necessari.

```javascript
game.craftWeapon(weaponId)
```

**Parametri:**
- `weaponId` (string): ID dell'arma da creare

**Comportamento:**
- Verifica se i materiali sono sufficienti
- Rimuove i materiali dall'inventario
- Aggiunge l'arma alla collezione

---

#### `equipWeapon(weaponId)`
Equipaggia un'arma (massimo 2 armi attive).

```javascript
game.equipWeapon(weaponId)
```

**Parametri:**
- `weaponId` (string): ID dell'arma da equipaggiare

**Comportamento:**
- Verifica se ci sono slot disponibili
- Equipaggia l'arma
- Applica gli effetti dell'arma

---

#### `unequipWeapon(weaponId)`
Rimuove un'arma dall'arsenale.

```javascript
game.unequipWeapon(weaponId)
```

**Parametri:**
- `weaponId` (string): ID dell'arma da rimuovere

---

### Sistemi Interni

#### `gameLoop()`
Ciclo principale del gioco (chiamato automaticamente).

```javascript
game.gameLoop()
```

**Comportamento:**
- Aggiorna tutte le entità
- Gestisce collisioni
- Spawna nemici
- Gestisce upgrade
- Ridisegna il canvas

---

#### `resizeCanvas()`
Ridimensiona il canvas in base alle dimensioni della finestra.

```javascript
game.resizeCanvas()
```

---

## Classe AnalyticsManager

Gestisce le statistiche e la sincronizzazione cloud dei dati di gioco.

### Costruttore

```javascript
const analyticsManager = new AnalyticsManager();
```

**Configurazione:**
```javascript
analyticsManager.config = {
    githubToken: 'ghp_your_token_here',
    gistId: '1dc2b7cdfc87ca61cfaf7e2dc7e13cfd',
    enableCloudSync: false,
    syncInterval: 10
};
```

---

### Metodi Principali

#### `trackGameCompletion(gameStats)`
Registra il completamento di una partita.

```javascript
analyticsManager.trackGameCompletion(gameStats)
```

**Parametri:**
- `gameStats` (Object): Statistiche della partita
  - `archetype` (string): ID dell'archetipo utilizzato
  - `duration` (number): Durata in millisecondi
  - `level` (number): Livello raggiunto
  - `satisfaction` (number): Soddisfazione (0-100)

**Esempio:**
```javascript
analyticsManager.trackGameCompletion({
    archetype: 'steel',
    duration: 180000,
    level: 20,
    satisfaction: 85
});
```

---

#### `syncPlayerData(playerData)`
Sincronizza i dati del giocatore con il cloud.

```javascript
await analyticsManager.syncPlayerData(playerData)
```

**Parametri:**
- `playerData` (Object): Dati del giocatore

**Comportamento:**
- Aggiorna gli achievement
- Sincronizza con il cloud se abilitato

---

#### `uploadToGist()`
Carica i dati analytics sul Gist GitHub.

```javascript
await analyticsManager.uploadToGist()
```

**Comportamento:**
- Scarica i dati esistenti
- Esegue merge intelligente
- Carica i dati aggiornati

---

#### `downloadFromGist(token, gistId)`
Scarica i dati analytics dal Gist GitHub.

```javascript
const data = await analyticsManager.downloadFromGist(token, gistId)
```

**Parametri:**
- `token` (string): Token GitHub
- `gistId` (string): ID del Gist

**Ritorna:** `Object | null` - Dati analytics o `null` se errore

---

#### `testCloudSync()`
Testa la connessione al cloud sync.

```javascript
const success = await analyticsManager.testCloudSync()
```

**Ritorna:** `Promise<boolean>` - `true` se il test è riuscito

---

#### `getAnalyticsReport()`
Genera un report delle statistiche.

```javascript
const report = analyticsManager.getAnalyticsReport()
```

**Ritorna:** `Object` - Report con statistiche aggregate

---

#### `getArchetypeBalanceScore(archetype)`
Ottiene il punteggio di bilanciamento per un archetipo.

```javascript
const score = analyticsManager.getArchetypeBalanceScore('steel')
```

**Parametri:**
- `archetype` (string): ID dell'archetipo

**Ritorna:** `number` - Punteggio di bilanciamento (0-1)

---

## Classi Entity

### Classe Player

Rappresenta il giocatore nel gioco.

#### Proprietà Principali

```javascript
player.x              // Posizione X
player.y              // Posizione Y
player.hp             // Punti vita attuali
player.stats          // Statistiche del giocatore
player.level          // Livello corrente
player.xp             // Esperienza corrente
player.xpNext         // Esperienza necessaria per il prossimo livello
player.archetype      // Archetipo selezionato
player.cores          // Array di ID core equipaggiati
player.weapons        // Array di ID armi equipaggiate
```

#### Metodi Principali

##### `gainXP(amount)`
Aggiunge esperienza al giocatore.

```javascript
player.gainXP(100)
```

**Parametri:**
- `amount` (number): Quantità di XP da aggiungere

**Comportamento:**
- Aggiunge XP
- Controlla se il giocatore può salire di livello
- Chiama `levelUp()` se necessario

---

##### `levelUp()`
Fa salire di livello il giocatore.

```javascript
player.levelUp()
```

**Comportamento:**
- Incrementa il livello
- Aumenta le statistiche base
- Mostra il menu di upgrade

---

##### `takeDamage(amount, game, sourceEnemy)`
Infligge danno al giocatore.

```javascript
player.takeDamage(10, game, enemy)
```

**Parametri:**
- `amount` (number): Quantità di danno
- `game` (BallSurvivalGame): Istanza del gioco
- `sourceEnemy` (Enemy): Nemico che ha inflitto il danno (opzionale)

**Comportamento:**
- Applica riduzione danno (DR)
- Gestisce invincibilità temporanea
- Gestisce scudi e riflessioni
- Chiama `game.gameOver()` se HP <= 0

---

##### `resetForNewRun(permUpgrades, archetypeId)`
Resetta il giocatore per una nuova partita.

```javascript
player.resetForNewRun(permanentUpgrades, 'steel')
```

**Parametri:**
- `permUpgrades` (Object): Upgrade permanenti
- `archetypeId` (string): ID dell'archetipo

**Comportamento:**
- Resetta HP, livello, XP
- Applica upgrade permanenti
- Applica modificatori dell'archetipo
- Equipaggia core e armi salvati

---

### Classe Enemy

Rappresenta un nemico generico.

#### Proprietà Principali

```javascript
enemy.x               // Posizione X
enemy.y               // Posizione Y
enemy.hp              // Punti vita
enemy.stats           // Statistiche del nemico
enemy.stats.isElite   // Se è un nemico elite
enemy.slowTimer       // Timer per effetti di rallentamento
enemy.stunTimer       // Timer per effetti di stordimento
```

#### Metodi Principali

##### `takeDamage(amount, game)`
Infligge danno al nemico.

```javascript
enemy.takeDamage(50, game)
```

**Parametri:**
- `amount` (number): Quantità di danno
- `game` (BallSurvivalGame): Istanza del gioco

**Comportamento:**
- Applica riduzione danno
- Gestisce immunità allo spawn
- Chiama `onDeath()` se HP <= 0

---

##### `onDeath(game)`
Gestisce la morte del nemico.

```javascript
enemy.onDeath(game)
```

**Comportamento:**
- Genera orb di XP
- Genera orb di gemme/materiali
- Aggiorna statistiche
- Gestisce achievement

---

### Classe Boss

Estende `Enemy` con capacità speciali.

#### Metodi Aggiuntivi

##### `attack(game)`
Esegue un attacco speciale del boss.

```javascript
boss.attack(game)
```

**Comportamento:**
- Spawna proiettili
- Applica effetti speciali
- Ha un cooldown tra gli attacchi

---

## Configurazione Globale (CONFIG)

Oggetto globale contenente tutta la configurazione del gioco.

### Struttura Principale

```javascript
CONFIG = {
    world: { width, height, gridSize },
    player: { base, xpCurve },
    characterArchetypes: { ... },
    enemies: { spawnInterval, scaling, base },
    stages: { ... },
    boss: { ... },
    materials: { ... },
    weapons: { ... },
    cores: { ... }
}
```

### Esempi di Accesso

```javascript
// Ottieni configurazione di un archetipo
const steelArchetype = CONFIG.characterArchetypes.steel;
console.log(steelArchetype.name); // "Palla d'Acciaio"
console.log(steelArchetype.bonus); // "+70% Riduzione Danno..."

// Ottieni configurazione di uno stage
const stage1 = CONFIG.stages['1'];
console.log(stage1.name); // "Pianura Eterna"
console.log(stage1.difficulty.dr); // 0

// Ottieni configurazione di un materiale
const ironFragment = CONFIG.materials.coreMaterials.iron_fragment;
console.log(ironFragment.name); // "Frammento di Ferro"
console.log(ironFragment.rarity); // "common"
```

---

## Funzioni Globali

### Variabili Globali

```javascript
window.game                      // Istanza di BallSurvivalGame
window.analyticsManager          // Istanza di AnalyticsManager
window.currentPlayer             // Dati del giocatore corrente
window.isLoggedIn                // Se l'utente è loggato
window.isGuest                   // Se è un account guest
window.updatePlayerStats         // Funzione per aggiornare statistiche
window.getPlayerData             // Funzione per ottenere dati giocatore
window.configureCloudSync        // Funzione per configurare cloud sync
window.showCloudSyncConfig       // Funzione per mostrare popup cloud sync
window.syncUserAccounts          // Funzione per sincronizzare account
window.loadUserAccounts          // Funzione per caricare account
window.testAccountSync           // Funzione per testare sync account
window.testCloudSync             // Funzione per testare cloud sync
window.resetCloudSync            // Funzione per resettare cloud sync
window.closeCloudSyncConfig      // Funzione per chiudere popup cloud sync
window.forcePushCurrentUserToCloud // Funzione per forzare push dati utente
```

### Funzioni di Utilità

#### `formatTime(ms)`
Formatta un tempo in millisecondi in formato leggibile.

```javascript
const formatted = formatTime(120000);
console.log(formatted); // "2m 0s"
```

**Parametri:**
- `ms` (number): Tempo in millisecondi

**Ritorna:** `string` - Tempo formattato (es. "5m 30s")

---

## Sistemi di Gioco

### Sistema di Upgrade

Il gioco include due tipi di upgrade:

1. **Upgrade Temporanei**: Validi solo per la partita corrente
   - Aumentano statistiche specifiche
   - Sbloccano evoluzioni delle armi
   - Scompaiono alla fine della partita

2. **Upgrade Permanenti**: Acquistabili con gemme nel negozio
   - Salute, Velocità, Difesa, XP Gain, Fortuna, Potenza, Frequenza, Area
   - Persistono tra le partite
   - Hanno livelli massimi

### Sistema di Materiali

I materiali vengono raccolti durante le partite e utilizzati per creare core e armi.

**Tipi di Materiali:**
- **Core Materials**: Per creare core (rivestimenti della sfera)
- **Weapon Materials**: Per creare armi

**Rarità:**
- `common`: Comune
- `uncommon`: Non comune
- `rare`: Raro
- `epic`: Epico
- `legendary`: Leggendario

### Sistema di Stage

Il gioco include 5 stage progressivi:

1. **Pianura Eterna** (Sempre sbloccato)
2. **Foresta Oscura** (Sblocca creando Core Magnetico)
3. **Deserto Infuocato** (Sblocca creando Spine di Ferro)
4. **Ghiacciaio Perduto** (Sblocca uccidendo 5 elite nel Deserto)
5. **Abisso Cosmico** (Sblocca possedendo 2 core e 2 armi)

Ogni stage ha:
- Difficoltà aumentata
- Bonus XP e drop
- Nemici con forme diverse
- Background unico

---

## Esempi di Utilizzo

### Esempio 1: Avviare una Partita con Archetipo Personalizzato

```javascript
// Seleziona l'archetipo
game.selectArchetype('steel');

// Seleziona lo stage
game.selectStage(1);

// Avvia la partita
game.startGame();
```

---

### Esempio 2: Gestire l'Inventario

```javascript
// Mostra l'inventario
game.showInventory();

// Crea un core
game.craftCore('magnetic');

// Equipaggia il core
game.equipCore('magnetic');

// Crea un'arma
game.craftWeapon('spike_ring');

// Equipaggia l'arma
game.equipWeapon('spike_ring');
```

---

### Esempio 3: Sincronizzazione Cloud

```javascript
// Configura il cloud sync
await configureCloudSync('ghp_xxxxxxxxxxxxxxxxxxxx');

// Sincronizza gli account
await syncUserAccounts();

// Carica gli account dal cloud
await loadUserAccounts();
```

---

### Esempio 4: Salvare e Caricare Partite

```javascript
// Genera codice di salvataggio
const saveCode = game.generateSaveCode();
console.log('Codice:', saveCode);

// Salva in localStorage o invia a server
localStorage.setItem('lastSaveCode', saveCode);

// Carica partita salvata
const savedCode = localStorage.getItem('lastSaveCode');
document.getElementById('loadCodeInput').value = savedCode;
game.loadFromSaveCode();
```

---

### Esempio 5: Accedere alle Statistiche

```javascript
// Ottieni dati giocatore
const playerData = getPlayerData();
if (playerData) {
    console.log('Username:', playerData.username);
    console.log('Partite totali:', playerData.stats.totalGames);
    console.log('Tempo totale:', playerData.stats.totalTime);
    console.log('Miglior livello:', playerData.stats.bestLevel);
}

// Ottieni report analytics
const report = analyticsManager.getAnalyticsReport();
console.log('Report:', report);
```

---

### Esempio 6: Gestire gli Achievement

```javascript
// Verifica se un achievement è sbloccato
if (window.currentPlayer && window.currentPlayer.achievements) {
    const hasAchievement = window.currentPlayer.achievements['first_kill'];
    if (hasAchievement) {
        console.log('Achievement "Prima Uccisione" sbloccato!');
    }
}

// Mostra gli achievement
game.showPopup('achievements');
```

---

### Esempio 7: Personalizzare il Gioco

```javascript
// Modifica configurazione nemici
CONFIG.enemies.spawnInterval = 0.5; // Spawn più frequente

// Modifica curva XP
CONFIG.player.xpCurve.base = 10; // XP base più bassa

// Aggiungi nuovo archetipo (richiede modifiche al codice)
CONFIG.characterArchetypes.custom = {
    id: 'custom',
    name: 'Archetipo Personalizzato',
    // ... configurazione
};
```

---

## Note Importanti

1. **Sicurezza**: Le password sono salvate in chiaro in `localStorage`. Non utilizzare password importanti.

2. **Cloud Sync**: Richiede un token GitHub con permessi `gist`. Il token viene salvato localmente.

3. **Performance**: Il gioco è ottimizzato per browser moderni. Su dispositivi mobili potrebbe essere necessario ridurre le impostazioni grafiche.

4. **Compatibilità**: Testato su Chrome, Firefox, Safari e Edge. Richiede supporto per Canvas API e LocalStorage.

5. **Salvataggi**: I codici di salvataggio sono codificati in base64. Non modificare manualmente.

---

## Supporto e Contributi

Per problemi o domande:
- Aprire una issue su GitHub
- Consultare il README principale
- Verificare il CHANGELOG per le ultime modifiche

---

## Riferimento Rapido

### Funzioni di Login più Utilizzate

| Funzione | Descrizione | Esempio |
|----------|-------------|---------|
| `login()` | Esegue login | `await login()` |
| `register()` | Registra nuovo utente | `await register()` |
| `logout()` | Esegue logout | `logout()` |
| `playAsGuest()` | Gioca come ospite | `playAsGuest()` |
| `getPlayerData()` | Ottiene dati giocatore | `const data = getPlayerData()` |

### Funzioni di Cloud Sync

| Funzione | Descrizione | Esempio |
|----------|-------------|---------|
| `configureCloudSync(token)` | Configura cloud sync | `await configureCloudSync('ghp_xxx')` |
| `syncUserAccounts()` | Sincronizza account | `await syncUserAccounts()` |
| `loadUserAccounts()` | Carica account dal cloud | `await loadUserAccounts()` |
| `testCloudSync()` | Testa connessione | `await testCloudSync()` |
| `showCloudSyncConfig()` | Mostra popup configurazione | `showCloudSyncConfig()` |

### Metodi Principali del Gioco

| Metodo | Descrizione | Esempio |
|--------|-------------|---------|
| `game.startGame()` | Avvia nuova partita | `game.startGame()` |
| `game.togglePause()` | Pausa/riprendi | `game.togglePause()` |
| `game.gameOver()` | Termina partita | `game.gameOver()` |
| `game.generateSaveCode()` | Genera codice salvataggio | `const code = game.generateSaveCode()` |
| `game.loadFromSaveCode()` | Carica partita | `game.loadFromSaveCode()` |
| `game.selectArchetype(id)` | Seleziona archetipo | `game.selectArchetype('steel')` |
| `game.selectStage(id)` | Seleziona stage | `game.selectStage(1)` |
| `game.showInventory()` | Mostra inventario | `game.showInventory()` |
| `game.craftCore(id)` | Crea core | `game.craftCore('magnetic')` |
| `game.equipCore(id)` | Equipaggia core | `game.equipCore('magnetic')` |
| `game.craftWeapon(id)` | Crea arma | `game.craftWeapon('spike_ring')` |
| `game.equipWeapon(id)` | Equipaggia arma | `game.equipWeapon('spike_ring')` |

### Archetipi Disponibili

| ID | Nome | Costo | Bonus Principale |
|----|------|-------|------------------|
| `standard` | Sfera Standard | Gratis | Nessuno (equilibrato) |
| `steel` | Palla d'Acciaio | 200 gemme | +70% DR, +40% danno shockwave |
| `magma` | Nucleo Magmatico | 300 gemme | Danno bruciatura potenziato |
| `frost` | Cristallo di Gelo | 300 gemme | Rallentamento nemici |
| `shadow` | Sfera d'Ombra | 400 gemme | +35% velocità, +25% critico |
| `tech` | Giroscopio Tecnologico | 800 gemme | +50% area d'effetto |

### Stage Disponibili

| ID | Nome | Sblocco | Bonus XP | Bonus Drop |
|----|------|---------|----------|------------|
| 1 | Pianura Eterna | Sempre | +0% | +0% |
| 2 | Foresta Oscura | Crea Core Magnetico | +20% | +10% |
| 3 | Deserto Infuocato | Crea Spine di Ferro | +40% | +25% |
| 4 | Ghiacciaio Perduto | Uccidi 5 elite nel Deserto | +60% | +40% |
| 5 | Abisso Cosmico | Possiedi 2 core e 2 armi | +100% | +80% |

---

**Versione Documentazione:** 1.0  
**Data Ultima Revisione:** 2024  
**Autore:** Documentazione generata automaticamente
