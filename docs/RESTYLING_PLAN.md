# Ball Survival – Piano di Restyling UI

Documento di progetto per il restyling generale dell'applicazione: menù, skill, core e armi.

---

## 1. Stato attuale

### 1.1 Palette e tema
- **Tema**: Marrone/oro antico, stile dungeon fantasy
- **Font**: Crimson Text (body), Cinzel (titoli)
- **Colori principali**: 
  - Primary: `#8b4513` (marrone)
  - Secondary: `#daa520` (oro)
  - Highlight: `#ffd700` (oro brillante)
  - Accent: `#8b0000` (rosso scuro)

### 1.2 Inconsistenze rilevate
| Area | Problema |
|------|----------|
| **Arsenale** | Usa palette blu (#3498db) mentre il resto è marrone/oro |
| **Login** | Bottoni con colori Material (verde/blu/arancione) non coerenti con il tema |
| **Crafting** | Mix di stili: crafting items usano light-bg, arsenal usa blu/grigio |
| **Skill/Upgrade** | Layout funzionale ma visivamente “piatto” |
| **Core/Armi** | Emoji come icone; nessuna differenziazione visiva per rarità o tema |

---

## 2. Direzione di design (opzioni)

### Opzione A: **Fantasy arcade**
- Mantenere marrone/oro
- Aggiungere gradienti, glow e bordi più definiti
- Icone più grandi e leggibili
- Effetti hover più marcati (scale, shadow, glow)

### Opzione B: **Dark neon**
- Sfondo molto scuro (#0a0a12)
- Accenti neon (cyan, magenta, lime)
- Bordi sottili luminosi, stile cyberpunk-lite

### Opzione C: **Gothic minimal**
- Nero e grigi caldi
- Accenti oro/argento discreti
- Molto spazio bianco, tipografia forte

### Opzione D: **Coerenza e pulizia**
- Mantenere palette attuale
- Uniformare arsenale, inventario, login al tema marrone/oro
- Migliorare gerarchie visive e spaziatura
- Nessun cambio radicale di stile

---

## 3. Piano di restyling per area

### 3.1 Menù principali

| Componente | Interventi proposti |
|------------|---------------------|
| **Start screen** | Header più impattante, card stage/personaggio con hover definiti |
| **Pausa / Game Over** | Stesso stile dei popup, statistiche in card separate |
| **Login** | Bottoni coerenti con palette (gradienti oro/marrone), campi con bordi tematici |
| **Impostazioni** | Slider e checkbox con colori del tema |

### 3.2 Menu upgrade (level up)

| Elemento | Interventi |
|----------|------------|
| **Card skill** | Icona più grande, bordo sinistro colorato per tipo (evoluzione=oro, maestria=rosso) |
| **Layout** | Spaziatura uniforme, separazione visiva tra upgrade normali e speciali |
| **Livello massimo** | Card dedicata con stile “completamento” (badge, glow) |

### 3.3 Skill visive (in-game)

| Elemento | Interventi |
|----------|------------|
| **Icone** | Mantenere emoji ma aumentare dimensione e contrasto in barra/UI |
| **Cooldown** | Overlay visivo più chiaro (opacità, bordo) |
| **Tooltip** | Descrizione al passaggio del mouse con stile coerente |

### 3.4 Negozio permanente

| Elemento | Interventi |
|----------|------------|
| **Card upgrade** | Layout a griglia su desktop, icona + testo + costo allineati |
| **Livello** | Badge numerico (es. cerchio con numero) |
| **Costo** | Colore distintivo per “insufficiente” vs “acquistabile” |

### 3.5 Inventario – Materiali

| Elemento | Interventi |
|----------|------------|
| **Rarità** | Badge colorati più evidenti, bordi per rarità |
| **Conteggio** | Posizionamento chiaro, numeri grandi dove serve |

### 3.6 Inventario – Core e armi

| Elemento | Interventi |
|----------|------------|
| **Card crafting** | Icona grande, nome, descrizione, materiali in blocco leggibile |
| **Stato** | “Craftabile” vs “Fatto” vs “Livello max” con colori diversi |
| **Pulsante Craft** | Stati visivi chiari (abilitato, disabilitato, max level) |

### 3.7 Arsenale

| Elemento | Interventi |
|----------|------------|
| **Unificazione tema** | Sostituire blu (#3498db) con palette marrone/oro/verde (equipaggiato) |
| **Core attivo** | Card con bordo evidenziato, icona grande |
| **Armi attive** | Lista con icona + nome + livello |
| **Disponibili** | Stesso stile delle card crafting, hover chiaro |

### 3.8 Glossario

| Elemento | Interventi |
|----------|------------|
| **Termine** | Card compatta con icona + titolo + descrizione |
| **Ricerca** | Input con bordo tematico, placeholder leggibile |
| **Categorie** | Dropdown coerente con il resto dell’UI |

### 3.9 Selezione personaggio

| Elemento | Interventi |
|----------|------------|
| **Card archetipo** | Icona, nome, bonus/malus in evidenza |
| **Selezionato** | Bordo oro brillante, sfondo leggermente differente |
| **Bloccato** | Grayscale, bordo grigio, prezzo chiaro |

---

## 4. Variabili CSS suggerite (estensioni)

```css
/* Nuove variabili per coerenza */
:root {
  /* Esistenti... */
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  
  /* Shadows */
  --shadow-card: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-hover: 0 6px 20px rgba(0,0,0,0.5), 0 0 12px rgba(255,215,0,0.2);
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.25s ease;
}
```

---

## 5. Fasi di implementazione

| Fase | Area | Priorità | Stima |
|------|------|----------|-------|
| **1** | Palette e variabili CSS | Alta | 1–2h |
| **2** | Unificazione arsenale (tema marrone/oro) | Alta | 1h |
| **3** | Bottoni login coerenti con tema | Media | 30min |
| **4** | Card upgrade (level up + negozio) | Alta | 2h |
| **5** | Inventario (materiali, crafting, arsenale) | Alta | 2h |
| **6** | Glossario e selezione personaggio | Media | 1h |
| **7** | Menu start, pausa, game over | Media | 1h |
| **8** | Dettagli finali (hover, transizioni, mobile) | Media | 1–2h |

---

## 6. Domande aperte

1. **Tema**: Preferisci Opzione A (fantasy arcade) o D (coerenza e pulizia)?
2. **Icone**: Continuare con emoji o introdurre SVG/icone vettoriali?
3. **Mobile**: Dare priorità a dimensioni touch e spaziatura?
4. **Animazioni**: Più movimento (scale, glow) o stile più statico?

---

## 7. Implementato: Dark Neon (2026-02-14)

- **Palette**: Cyan (#00f5ff), Magenta (#ff00ff), Lime (#39ff14), Pink (#ff3366)
- **Background**: #0a0a12
- **Font**: Segoe UI (sostituito Crimson Text / Cinzel)
- Applicato a: popup, skill, negozio, inventario, arsenale, login, bottoni, glossario

---

*Documento creato il 2026-02-14 – aggiornato con tema Dark Neon.*
