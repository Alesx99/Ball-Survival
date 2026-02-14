# Piano Overhaul Ball Survival

## Ordine di implementazione

1. **Glossario** (PRIMA) – Modulo dati, popolamento, UI
2. **Menu avvio** – Svecchiamento interfaccia
3. **Nuove armi e core** – Contenuti aggiuntivi
4. **Sistema Fusioni** – Magie combinate (stile Magic Survival)

---

## Fase 1: Glossario

### Struttura
- `src/data/glossary.js` – Dati ordinati per categoria
- `src/systems/GlossaryUI.js` – Logica apertura/chiusura, render
- Pulsante "📖 Glossario" nel menu principale
- Popup con ricerca, filtri per categoria, termini cliccabili

### Categorie
- **Termini base**: XP, Livello, Gemme, Materiali, Rarità, Stage
- **Combattimento**: DPS, DR, Knockback, Slow, Burn, Crit
- **Spell**: Evoluzione, Maestria, Cooldown, Area
- **Equipaggiamento**: Core, Arma, Arsenale
- **Progressione**: Fusione, Passivo, Upgrade permanente

---

## Fase 2: Menu avvio

### Problemi attuali
- Troppo inline styles, markup disordinato
- Login troppo prominente rispetto al gameplay
- Pulsanti piatti, poco distinti
- Layout confuso (stage, personaggio, salvataggio mescolati)

### Proposta
- Layout a schede o sezioni collassabili
- Design: header con titolo, area principale pulita
- Login compatto (collassabile o in sezione laterale)
- Card per Stage e Personaggio con anteprima
- Pulsante CTA principale "Inizia Partita" evidente
- Glossario, Impostazioni, Inventario come azioni secondarie

---

## Fase 3: Nuove armi e core

### Nuovi Core (da aggiungere)
- **Core di Tempesta** – Fulmini periodici a raggio
- **Core di Sangue** – Lifesteal al contatto
- **Core di Gravità** – Rallenta + attira nemici
- **Core Arcano** – Bonus danni magici %

### Nuove Armi
- **Fulmine Arcano** – Proiettile che rimbalza
- **Lame Orbitali** – Lame che ruotano intorno
- **Scudo di Spine** – Danno al contatto + riflesso
- **Nebbia Corrosiva** – DoT area

---

## Fase 4: Fusioni

### Meccanica (ispirata a Magic Survival)
- Due spell a livello max → Fusione
- La spell secondaria viene "sacrificata"
- La spell primaria ottiene effetto potenziato unico

### Fusioni proposte (esempio)
- **Fireball + Lightning** → Fulmine Infuocato (danno + stun)
- **Frostbolt + Shield** → Barriera Glaciale (slow + blocco)
- **Shotgun + Heal** → Raffica Vitale (proiettili curativi)

---

## File da creare/modificare

| File | Azione |
|------|--------|
| `src/data/glossary.js` | Crea |
| `src/systems/GlossaryUI.js` o UISystem.extend | Crea/estendi |
| `index.html` | Modifica (glossario popup, menu) |
| `style.css` | Modifica (nuovi stili menu) |
| `src/config/index.js` | Modifica (nuovi core/armi) |
| `src/systems/WeaponSystem.js` | Estendi per nuove armi |
| `src/systems/CraftingSystem.js` | Estendi per fusioni |
