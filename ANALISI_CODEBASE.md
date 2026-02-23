# Analisi Codebase - Ball Survival

Questo documento definisce le linee guida architetturali adottate durante i vari refactoring del progetto `Ball-Survival`, in particolare riguardo alla struttura dei *Sistemi*.

## Convenzioni per i Sistemi

All'inizio dello sviluppo, alcuni file di grandi dimensioni come `SpellSystem.js`, `SpawnSystem.js` o `UISystem.js` potevano essere strutturati come **Mixins** (oggetti puri le cui funzioni venivano direttamente assegnate all'oggetto `Game` in fase di inizializzazione tramite `Object.assign()`) o come enormi oggetti globali.

Attualmente, **la convenzione standard adottata è quella delle Classi ES6 (ES6 Classes)**.

### Perché `Classi ES6` invece di `Mixins`?

1. **Incapsulamento e Sicurezza**: Le classi permettono di mantenere logica e stato privati quando necessario (tramite `#field` o convenzioni `_field`), evitando collisioni di variabili generali che spesso si verificano assegnando tutto a `this` nel file `Game.js`.
2. **Modularità e Testabilità**: Le classi esterne a cui viene passato il riferimento di gioco (`new AchievementSystem(this)`) possono essere istanziate, testate e derubate molto più facilmente rispetto ad un mixin.
3. **Leggibilità (`ModeManager`, `StorageManager`)**: Tutte le estrazioni recenti sono state convertite in classi statiche (per gestori globali come dati salvati) o in classi istanziabili dipendenti da `Game`. Questo crea un pattern solido: `this.managerName = new ManagerClass(this)`.

### Deroghe e Sistemi Legacy

I seguenti sistemi potrebbero presentare ancora tracce del pattern mixin o esportare sia funzioni per il mixin che metodi di utilità globali. A seconda delle esigenze future di refactoring:
- Le funzionalità correlate al Rendering e Spawning (come `SpawnSystem` o `SpellSystem`) usano concetti molto centralizzati sull'oggetto principale per comodità;
- In caso di ulteriori interventi mirati, **qualsiasi nuovo sistema o refactoring di vecchio sistema DOVREBBE usare la notazione a Classe**.

## Modelli e Strutture Dati

I *Magic Numbers* per tempi e intervalli sono stati rimossi in favore di chiavi globali dichiarate in `CONFIG.timing`, in particolare per le chiamate ripetute su più frame (`cloudSync`, `achievements`, ecc.). I dati persistenti sono delegati centralmente alla classe statica `StorageManager` anziché al polimorfico `localStorage`.
