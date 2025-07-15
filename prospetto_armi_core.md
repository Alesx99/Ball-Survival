# PROSPETTO E SIMULAZIONE: ARMI E CORE IN BALL SURVIVAL

## 📋 PANORAMICA GENERALE

Il sistema di combattimento di Ball Survival si basa su due componenti principali:
- **CORE**: Rivestimenti della sfera che forniscono effetti passivi permanenti
- **ARMI**: Dispositivi esterni che forniscono danni attivi e abilità speciali

---

## 🔧 SISTEMA CORE

### Caratteristiche Generali
- **Max 1 core attivo** per volta
- **Non potenziabili** (solo 1 livello)
- **Effetti permanenti** una volta equipaggiati
- **Crafting richiesto** con materiali specifici

### Core Disponibili

#### 1. **Core Magnetico** 🧲
```javascript
{
    id: 'magnetic',
    name: 'Core Magnetico',
    materials: { 'iron_fragment': 3, 'steel_fragment': 1 },
    effect: { type: 'magnet', range: 1.5 }
}
```
**Funzione**: Attira gemme e XP da +50% distanza
**Effetto Visivo**: Anelli blu rotanti con particelle magnetiche
**Simulazione**:
```
Distanza normale raccolta: 100px
Con Core Magnetico: 150px (+50%)
Gemme e XP vengono attirati automaticamente
```

#### 2. **Core Riflettente** 🛡️
```javascript
{
    id: 'reflection',
    materials: { 'steel_fragment': 2, 'crystal_fragment': 1 },
    effect: { type: 'reflect', chance: 0.3 }
}
```
**Funzione**: Riflette il 30% dei proiettili nemici
**Effetto Visivo**: Scudo dorato con prismi riflettenti
**Simulazione**:
```
Proiettile nemico: 10 danno
Probabilità riflessione: 30%
Danno riflesso: 10 danno (al nemico)
```

#### 3. **Core Rimbalzante** ⚡
```javascript
{
    id: 'bounce',
    materials: { 'iron_fragment': 2, 'wood_fragment': 2 },
    effect: { type: 'bounce', damage: 15 }
}
```
**Funzione**: Spine che rimbalzano sui nemici infliggendo +15 danno
**Effetto Visivo**: Spine arancioni rotanti
**Simulazione**:
```
Contatto con nemico: +15 danno automatico
Rimbalzo: Danno applicato a nemici vicini
```

#### 4. **Core di Velocità** 💨
```javascript
{
    id: 'speed',
    materials: { 'crystal_fragment': 1, 'energy_fragment': 1 },
    effect: { type: 'speed', bonus: 0.15 }
}
```
**Funzione**: Aumenta velocità di movimento del 15%
**Effetto Visivo**: Scie ciano multiple rotanti
**Simulazione**:
```
Velocità base: 3.0
Con Core Velocità: 3.45 (+15%)
Movimento più fluido e reattivo
```

#### 5. **Core di Resistenza** 🛡️
```javascript
{
    id: 'resistance',
    materials: { 'steel_fragment': 3, 'stone_fragment': 2 },
    effect: { type: 'resistance', dr: 0.1 }
}
```
**Funzione**: Riduce i danni ricevuti del 10%
**Effetto Visivo**: Doppia barriera marrone
**Simulazione**:
```
Danno ricevuto: 20
Riduzione: 10% = 2
Danno finale: 18
```

#### 6. **Core di Amplificazione** 🔥
```javascript
{
    id: 'amplification',
    materials: { 'magma_fragment': 1, 'energy_fragment': 2 },
    effect: { type: 'amplify', multiplier: 1.5 }
}
```
**Funzione**: Potenzia il danno da contatto del 50%
**Effetto Visivo**: Aura rossa con particelle
**Simulazione**:
```
Danno contatto base: 10
Con Amplificazione: 15 (+50%)
Efficace contro nemici deboli
```

#### 7. **Core del Vuoto** 🌌
```javascript
{
    id: 'void',
    materials: { 'void_fragment': 1, 'cosmic_fragment': 1 },
    effect: { type: 'void_teleport', threshold: 0.3, cooldown: 10000 }
}
```
**Funzione**: Teletrasporto quando salute < 30% (cooldown 10s)
**Effetto Visivo**: Vortice viola rotante
**Simulazione**:
```
Salute attuale: 25/100 (25%)
Condizione attivata: Sì
Teletrasporto: Posizione sicura
Cooldown: 10 secondi
```

---

## ⚔️ SISTEMA ARMI

### Caratteristiche Generali
- **Max 2 armi attive** contemporaneamente
- **Potenziabili** fino a 3 livelli
- **Effetti attivi** con danni e abilità speciali
- **Crafting e upgrade** con materiali crescenti

### Armi Disponibili

#### 1. **Anello di Spine** 🌿
```javascript
{
    id: 'spike_ring',
    materials: { 'wood_fragment': 3, 'stone_fragment': 2 },
    effect: { type: 'spikes', damage: 20, radius: 25 },
    maxLevel: 3,
    upgradeCost: { 'wood_fragment': 2, 'stone_fragment': 1 }
}
```
**Funzione**: 12 spine che danneggiano nemici per +20 danno al contatto
**Effetto Visivo**: Spine triangolari marroni
**Simulazione Livello 1**:
```
Danno per contatto: +20
Raggio: 25px
Nemici colpiti: Tutti nel raggio
```

**Simulazione Livello 2**:
```
Danno per contatto: +30 (+10)
Raggio: 30px (+5)
Costo upgrade: 2 wood + 1 stone
```

**Simulazione Livello 3**:
```
Danno per contatto: +40 (+10)
Raggio: 35px (+5)
Costo upgrade: 2 wood + 1 stone
```

#### 2. **Campo Energetico** ⚡
```javascript
{
    id: 'energy_field',
    materials: { 'energy_fragment': 2, 'crystal_fragment': 1 },
    effect: { type: 'field', damage: 10, slow: 0.3, radius: 40 },
    maxLevel: 3,
    upgradeCost: { 'energy_fragment': 1, 'crystal_fragment': 1 }
}
```
**Funzione**: Campo che rallenta nemici del 30% e infligge 10 DPS
**Effetto Visivo**: Onde energetiche ciano
**Simulazione Livello 1**:
```
DPS: 10 danno/secondo
Rallentamento: 30%
Raggio: 40px
```

**Simulazione Livello 2**:
```
DPS: 15 danno/secondo (+5)
Rallentamento: 35% (+5%)
Raggio: 45px (+5)
```

**Simulazione Livello 3**:
```
DPS: 20 danno/secondo (+5)
Rallentamento: 40% (+5%)
Raggio: 50px (+5)
```

#### 3. **Scudo Orbitale** 🛡️
```javascript
{
    id: 'orbital_shield',
    materials: { 'metal_fragment': 2, 'steel_fragment': 1 },
    effect: { type: 'orbital', count: 2, damage: 15 },
    maxLevel: 3,
    upgradeCost: { 'metal_fragment': 1, 'steel_fragment': 1 }
}
```
**Funzione**: 2 scudi che orbitano infliggendo +15 danno
**Effetto Visivo**: Scudi bianchi orbitanti
**Simulazione Livello 1**:
```
Scudi: 2
Danno per scudo: 15
Orbita: Circolare intorno al giocatore
```

**Simulazione Livello 2**:
```
Scudi: 3 (+1)
Danno per scudo: 20 (+5)
Orbita: Più veloce
```

**Simulazione Livello 3**:
```
Scudi: 4 (+1)
Danno per scudo: 25 (+5)
Orbita: Massima velocità
```

#### 4. **Onda Pulsante** 🌊
```javascript
{
    id: 'pulse_wave',
    materials: { 'cosmic_fragment': 1, 'energy_fragment': 1 },
    effect: { type: 'pulse', damage: 25, knockback: 30, cooldown: 3000 },
    maxLevel: 3,
    upgradeCost: { 'cosmic_fragment': 1, 'energy_fragment': 1 }
}
```
**Funzione**: Onde che respingono nemici infliggendo +25 danno
**Effetto Visivo**: Onde multiple rosa
**Simulazione Livello 1**:
```
Danno: 25
Respinta: 30px
Cooldown: 3 secondi
```

**Simulazione Livello 2**:
```
Danno: 35 (+10)
Respinta: 40px (+10)
Cooldown: 2.5 secondi (-0.5)
```

**Simulazione Livello 3**:
```
Danno: 45 (+10)
Respinta: 50px (+10)
Cooldown: 2 secondi (-0.5)
```

#### 5. **Lama del Vuoto** ⚔️
```javascript
{
    id: 'void_blade',
    materials: { 'void_fragment': 1, 'metal_fragment': 2 },
    effect: { type: 'void_blade', damage: 30, slow: 0.5, duration: 3000 },
    maxLevel: 3,
    upgradeCost: { 'void_fragment': 1, 'metal_fragment': 1 }
}
```
**Funzione**: 6 lame che tagliano nemici per +30 danno e li rallentano del 50% per 3s
**Effetto Visivo**: Lame viola rotanti
**Simulazione Livello 1**:
```
Danno: 30
Rallentamento: 50%
Durata: 3 secondi
```

**Simulazione Livello 2**:
```
Danno: 40 (+10)
Rallentamento: 60% (+10%)
Durata: 3.5 secondi (+0.5)
```

**Simulazione Livello 3**:
```
Danno: 50 (+10)
Rallentamento: 70% (+10%)
Durata: 4 secondi (+0.5)
```

#### 6. **Barriera di Cristallo** 💎
```javascript
{
    id: 'crystal_barrier',
    materials: { 'crystal_fragment': 2, 'stone_fragment': 3 },
    effect: { type: 'crystal_barrier', blockChance: 0.8, reflectDamage: 15 },
    maxLevel: 3,
    upgradeCost: { 'crystal_fragment': 1, 'stone_fragment': 2 }
}
```
**Funzione**: Barriera che blocca l'80% dei proiettili e riflette +15 danno
**Effetto Visivo**: Cristalli riflettenti azzurri
**Simulazione Livello 1**:
```
Blocco proiettili: 80%
Danno riflesso: 15
```

**Simulazione Livello 2**:
```
Blocco proiettili: 85% (+5%)
Danno riflesso: 20 (+5)
```

**Simulazione Livello 3**:
```
Blocco proiettili: 90% (+5%)
Danno riflesso: 25 (+5)
```

---

## 🎮 SIMULAZIONE DI COMBATTIMENTO

### Scenario: Giocatore con Core Magnetico + Anello di Spine Livello 2

```javascript
// Configurazione giocatore
const player = {
    core: 'magnetic',
    weapons: ['spike_ring_lv2'],
    stats: {
        hp: 120,
        speed: 3.0,
        radius: 15
    }
};

// Simulazione combattimento
const combatSimulation = {
    // Core Magnetico attivo
    magnetRange: 150, // +50% raccolta
    autoCollect: true,
    
    // Anello di Spine Livello 2
    spikeDamage: 30,
    spikeRadius: 30,
    
    // Nemici nell'area
    enemies: [
        { x: 50, y: 50, hp: 30, distance: 25 }, // Nel raggio spine
        { x: 100, y: 100, hp: 25, distance: 80 }, // Fuori raggio
        { x: 150, y: 150, hp: 40, distance: 140 } // Nel raggio magnete
    ],
    
    // Risultati simulazione
    results: {
        enemiesHit: 1, // Solo il primo nemico nel raggio spine
        damageDealt: 30,
        materialsCollected: 2, // Gemme e XP attirati dal magnete
        timeToKill: "2.5 secondi"
    }
};
```

### Scenario: Giocatore con Core Riflettente + Campo Energetico Livello 3

```javascript
// Configurazione giocatore
const player = {
    core: 'reflection',
    weapons: ['energy_field_lv3'],
    stats: {
        hp: 120,
        speed: 3.0,
        radius: 15
    }
};

// Simulazione combattimento
const combatSimulation = {
    // Core Riflettente attivo
    reflectChance: 0.3, // 30%
    reflectDamage: 10,
    
    // Campo Energetico Livello 3
    fieldDamage: 20, // DPS
    fieldSlow: 0.4, // 40%
    fieldRadius: 50,
    
    // Nemici nell'area
    enemies: [
        { x: 30, y: 30, hp: 50, inField: true },
        { x: 60, y: 60, hp: 40, inField: true },
        { x: 100, y: 100, hp: 60, inField: false }
    ],
    
    // Risultati simulazione
    results: {
        enemiesSlowed: 2,
        fieldDamagePerSecond: 40, // 20 DPS × 2 nemici
        projectilesReflected: 3, // Su 10 proiettili ricevuti
        reflectedDamage: 30, // 3 × 10 danno riflesso
        timeToKill: "4.2 secondi"
    }
};
```

---

## 📊 ANALISI COMPARATIVA

### Core più Efficaci per Situazione

| Situazione | Core Consigliato | Motivo |
|------------|------------------|---------|
| Raccolta Materiali | Magnetico | +50% raggio raccolta |
| Sopravvivenza | Resistenza | -10% danni ricevuti |
| Velocità | Velocità | +15% movimento |
| Danno Contatto | Amplificazione | +50% danno contatto |
| Difesa Proiettili | Riflettente | 30% riflessione |
| Emergenza | Vuoto | Teletrasporto automatico |

### Armi più Efficaci per Situazione

| Situazione | Arma Consigliata | Motivo |
|------------|------------------|---------|
| Danno Costante | Anello di Spine | Danno continuo al contatto |
| Controllo Area | Campo Energetico | Rallentamento + DPS |
| Difesa | Scudo Orbitale | Protezione orbitante |
| Respinta | Onda Pulsante | Knockback + danno |
| Debuff | Lama del Vuoto | Rallentamento forte |
| Difesa Proiettili | Barriera di Cristallo | 80% blocco proiettili |

---

## 🔄 SISTEMA DI CRAFTING

### Materiali Richiesti

```javascript
const materials = {
    // Core Materials
    'iron_fragment': 'Frammento di Ferro',
    'steel_fragment': 'Frammento d\'Acciaio', 
    'crystal_fragment': 'Frammento di Cristallo',
    'energy_fragment': 'Frammento Energetico',
    'wood_fragment': 'Frammento di Legno',
    'stone_fragment': 'Frammento di Pietra',
    'metal_fragment': 'Frammento Metallico',
    'magma_fragment': 'Frammento Magmatico',
    'void_fragment': 'Frammento del Vuoto',
    'cosmic_fragment': 'Frammento Cosmico'
};
```

### Costi di Crafting

| Item | Materiali | Costo Totale |
|------|-----------|---------------|
| Core Magnetico | 3 iron + 1 steel | 4 frammenti |
| Core Riflettente | 2 steel + 1 crystal | 3 frammenti |
| Anello di Spine Lv1 | 3 wood + 2 stone | 5 frammenti |
| Campo Energetico Lv1 | 2 energy + 1 crystal | 3 frammenti |
| Scudo Orbitale Lv1 | 2 metal + 1 steel | 3 frammenti |

---

## 🎯 STRATEGIE DI GIOCO

### Build Defensiva
```
Core: Resistenza (-10% danni)
Arma 1: Barriera di Cristallo (80% blocco)
Arma 2: Scudo Orbitale (protezione orbitante)
Risultato: Sopravvivenza massima
```

### Build Offensiva
```
Core: Amplificazione (+50% danno contatto)
Arma 1: Anello di Spine (danno costante)
Arma 2: Lama del Vuoto (debuff + danno)
Risultato: Danno massimo
```

### Build Utility
```
Core: Magnetico (+50% raccolta)
Arma 1: Campo Energetico (controllo area)
Arma 2: Onda Pulsante (respinta)
Risultato: Controllo e utilità
```

---

## 📈 PROGRESSIONE RACCOMANDATA

### Fase Iniziale (Livello 1-10)
1. **Craft Core Magnetico** per raccolta efficiente
2. **Craft Anello di Spine** per danno base
3. **Upgrade Anello di Spine** a livello 2

### Fase Intermedia (Livello 10-20)
1. **Craft Core Resistenza** per sopravvivenza
2. **Craft Campo Energetico** per controllo area
3. **Upgrade entrambe le armi** a livello 2

### Fase Avanzata (Livello 20+)
1. **Craft Core Amplificazione** per danno
2. **Craft Lama del Vuoto** per debuff
3. **Max upgrade** tutte le armi a livello 3

---

## 🎨 EFFETTI VISIVI DETTAGLIATI

### Core Magnetico
- **Anelli rotanti**: 3 anelli blu che ruotano a velocità diverse
- **Particelle magnetiche**: 8 particelle che orbitano con movimento sinusoidale
- **Campo pulsante**: Raggio che pulsa con effetto gradiente

### Core Riflettente  
- **Scudo dorato**: Gradiente radiale con bordo brillante
- **Prismi rotanti**: 8 prismi triangolari che riflettono luce
- **Raggi di luce**: 12 raggi che emanano dal centro

### Anello di Spine
- **12 spine triangolari**: Disposte in cerchio
- **Rotazione costante**: Movimento fluido
- **Effetto contatto**: Particelle di danno al tocco

### Campo Energetico
- **Onde concentriche**: Multiple onde che si espandono
- **Colore ciano**: Gradiente energetico
- **Effetto rallentamento**: Particelle che rallentano i nemici

---

Questo sistema offre una profondità strategica notevole, permettendo ai giocatori di personalizzare il loro stile di gioco attraverso la combinazione di core e armi, con progressione graduale e effetti visivi distintivi per ogni elemento. 