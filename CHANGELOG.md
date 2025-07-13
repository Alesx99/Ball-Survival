# Changelog - Ball Survival Game

## [Versione 5.0] - 2024-12-19

### 🔧 Correzioni Sistema Negozio
- **Risolto problema negozio vuoto**: Aggiunte le funzioni `effect()` mancanti nella configurazione `permanentUpgrades`
- **Visualizzazione corretta**: Il negozio ora mostra correttamente tutti gli upgrade disponibili con i loro effetti
- **Funzioni effect implementate**: Ogni upgrade ora ha una funzione che descrive l'effetto attuale
- **Descrizioni dettagliate**: Gli effetti mostrano valori specifici (es. "+50 HP massimi", "+25% Danno")

### 🎨 Revisione Sprite Nemici - Tema Dark
- **Sprite Slime**: Occhi demoniaci rossi, denti affilati, aura demoniaca per elite
- **Sprite Goblin**: Forma più spigolosa, occhi arancioni, zanne più grandi e minacciose
- **Sprite Golem**: Occhi rossi, denti, fessure scure, cristalli di energia per elite
- **Sprite Ice Crystal**: Diamante più affilato, occhi ciano, cristalli di ghiaccio intensi
- **Sprite Demon**: Stella più affilata, occhi rossi grandi, fiamme demoniache intense
- **Effetti Elite**: Aura demoniaca, tempeste di fuoco/ghiaccio, cristalli di energia
- **Colori**: Palette più scura e minacciosa, bordi più spessi, dettagli più intimidatori

### 🔧 Correzioni Sistema di Leveling
- **Risolto problema di blocco XP**: Il sistema di leveling ora include controlli di sicurezza per prevenire valori negativi o zero
- **Migliorata robustezza**: Aggiunto limite di sicurezza per evitare loop infiniti di level up
- **Curva XP bilanciata**: Ridotta la crescita XP da 1.15 a 1.12 e il fattore di livello da 10 a 8 per una progressione più equilibrata
- **Controlli di inizializzazione**: Aggiunti controlli di sicurezza in `initStats()` e `resetForNewRun()` per garantire valori validi
- **Debug migliorato**: Aggiunto logging per identificare problemi di leveling (solo in caso di errori)

### 🎮 Miglioramenti Precedenti
- **Sistema di Stage**: Aggiunto sistema di progressione con 5 stage unici, ognuno con tema e difficoltà specifiche
- **Stage 1 - Pianura Eterna**: Tutorial, sempre sbloccato, nemici semplici
- **Stage 2 - Foresta Oscura**: Sbloccato dopo 5 minuti nel primo stage, nemici triangolari verdi
- **Stage 3 - Deserto Infuocato**: Sbloccato dopo aver ucciso 1 boss nel secondo stage, nemici quadrati arancioni
- **Stage 4 - Ghiacciaio Perduto**: Sbloccato al livello 10 nel terzo stage, nemici diamanti blu
- **Stage 5 - Abisso Cosmico**: Sbloccato dopo 15 minuti totali di gioco, nemici stelle viola
- **Sistema di Unlock**: Progressione basata su tempo di sopravvivenza, uccisioni boss, e livelli raggiunti
- **Temi Visivi**: Ogni stage ha sfondo, griglia e pattern unici
- **Difficoltà Progressiva**: DR, velocità nemici e probabilità elite aumentano per stage
- **Menu di Selezione**: Interfaccia per scegliere lo stage prima di iniziare la partita
- **Salvataggio Progresso**: Il sistema ricorda gli stage sbloccati tra le sessioni

### 🎨 Sprite Nemici Dettagliati
- **Slime**: Corpo gelatinoso con occhi bianchi e bordo nero, elite con aura rossa
- **Goblin**: Forma triangolare con occhi rossi e zanne, elite con aura arancione
- **Golem**: Forma quadrata con occhi gialli e fessure, elite con cristalli di energia
- **Ice Crystal**: Diamante con occhi ciano e cristalli di ghiaccio, elite con tempesta di ghiaccio
- **Demon**: Stella con occhi rossi e fiamme, elite con tempesta di fuoco
- **Effetti Elite**: Aura colorata, particelle animate, effetti speciali per ogni tipo
- **Dettagli Tematici**: Ogni nemico ha caratteristiche visive che riflettono il suo tipo e rarità

### 🛠️ Correzioni Tecniche
- **Sistema di Salvataggio**: Migliorato per supportare il nuovo sistema di stage
- **Gestione Memoria**: Ottimizzata per gestire più entità e effetti visivi
- **Performance**: Miglioramenti per supportare sprite più complessi
- **Compatibilità**: Mantenuta compatibilità con salvataggi precedenti

### 📝 Note per gli Sviluppatori
- Il sistema di stage è estendibile: aggiungere nuovi stage richiede solo configurazione
- Gli sprite nemici sono modulari e possono essere facilmente personalizzati
- Il sistema di unlock è flessibile e supporta diversi tipi di requisiti
- Tutti i miglioramenti mantengono la retrocompatibilità con versioni precedenti 