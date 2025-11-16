# Ball Survival

**Ball Survival** è un gioco HTML5 survival sviluppato da Alessio (Alesx99).

> **Versione 1.1.0** - Aggiornato con miglioramenti critici di stabilità, accessibilità e performance.

## Come giocare

1. Vai su [Ball Survival su GitHub Pages](https://alesx99.github.io/Ball-Survival/) per giocare direttamente online all'ultima versione.
2. Oppure scarica il repository e apri `index.html` con il tuo browser.

## ✨ Novità versione 1.1.0

### 🔴 Bug Critici Risolti
- ✅ **Risolto:** Cancellazione dati ad ogni avvio (localStorage.clear())
- ✅ **Risolto:** Event listener duplicati che causavano comportamenti imprevedibili
- ✅ Progressi ora salvati correttamente tra le sessioni

### 🎨 Miglioramenti UI/UX
- ✅ Accessibilità migliorata (WCAG AA compliant)
- ✅ Supporto navigazione da tastiera
- ✅ Effetti shimmer su elementi interattivi
- ✅ Animazioni popup più fluide
- ✅ Effetto ripple sui bottoni
- ✅ Support per `prefers-reduced-motion`

### 🚀 Performance
- ✅ Rendering canvas ottimizzato
- ✅ DNS prefetch per API
- ✅ Performance monitoring integrato
- ✅ Storage manager con gestione quota

### 📦 Nuove Utility
- ✅ Sistema notifiche in-game
- ✅ Scorciatoie da tastiera (F11 per fullscreen, Ctrl+S per quick save)
- ✅ Auto-save system
- ✅ Performance monitor

Vedi [MIGLIORAMENTI.md](MIGLIORAMENTI.md) per dettagli completi.

## Struttura del progetto

### Core
- `index.html`: Ultima versione giocabile del gioco
- `game.js`: Logica principale del gioco (player, enemies, weapons, etc.)
- `login-simple.js`: Sistema di autenticazione e cloud sync
- `style.css`: Stili, animazioni e responsive design
- `utils.js`: ⭐ **NUOVO** - Utility functions (performance, storage, notifications)

### Documentazione
- `README.md`: Questo file
- `MIGLIORAMENTI.md`: ⭐ **NUOVO** - Changelog dettagliato versione 1.1.0
- `CHANGELOG.md`: Cronologia delle modifiche
- `LICENSE`: Licenza del progetto

### Altri file
- `cheat_script.js`: Script per debug e test (solo per sviluppo)
- `README_CHEAT.md`: Documentazione per l'uso degli script cheat
- `Senza Fisica/`: Versioni alternative e archivio storico

## Documentazione aggiuntiva
- `CHANGELOG.md`: Cronologia delle modifiche
- `CONFIGURAZIONE_CLOUD_SYNC.md`: Istruzioni per configurare il cloud sync
- `analisi_dr_immortale.md`: Analisi del sistema Damage Reduction
- `bilanciamento_palla_acciaio.md`: Bilanciamento del gioco
- `idee_innovative.md`: Idee per sviluppi futuri
- `prospetto_armi_core.md`: Prospetto delle armi e meccaniche core
- `simulazione_danno_boss.md`: Simulazioni di danno contro i boss

## 🎮 Features

- ⚔️ Sistema di combattimento dinamico
- 🌟 Personaggi/Archetipi sbloccabili
- 🔫 Armi e upgrade progressivi
- 📦 Inventario e crafting
- 🏆 Sistema achievements
- 💎 Negozio permanente con cristalli
- ☁️ Cloud sync via GitHub Gist
- 👤 Sistema login/registrazione
- 📱 Supporto mobile con joystick touch
- 🎯 Multiple stages con difficoltà crescente
- 💾 Salvataggio/caricamento progressi

## 🎯 Controlli

### Desktop
- **WASD** o **Frecce**: Movimento
- **E**: Apri negozio (in-game)
- **ESC**: Pausa
- **F11**: Fullscreen
- **Ctrl+S**: Quick save

### Mobile
- **Joystick virtuale**: Movimento
- **Tap**: Interazioni
- **Pulsante Pausa**: Pausa gioco

## 🛠️ Tecnologie

- HTML5 Canvas
- JavaScript ES6+
- CSS3 con Custom Properties
- LocalStorage API
- GitHub Gist API (cloud sync)
- Google Fonts (Cinzel, Crimson Text)

## 📊 Requisiti

- Browser moderno (Chrome, Firefox, Safari, Edge)
- JavaScript abilitato
- LocalStorage abilitato
- Connessione internet (opzionale, per cloud sync)

## 🤝 Contributi

Questo progetto è sviluppato e mantenuto da Alessio (Alesx99).

## 📄 Licenza

Il gioco è di proprietà di Alessio (Alesx99). Tutti i diritti riservati. Vedi il file LICENSE per dettagli.

---

**Sviluppato con ❤️ da Alessio (Alesx99)**  
**Miglioramenti v1.1.0 by AI Assistant** 