# Passivi e Magie: Analisi e Mappatura per Ball Survival

Questo documento raccoglie le idee provenienti da *Vampire Survivors* (VS) e *Magic Survival* (MS), mappandole all'interno del sistema di progressione e delle meccaniche attuali di **Ball Survival**.

## 1. Passivi "Base" (Stile VS)
La maggior parte degli archetipi base è già mappata sui modificatori del giocatore (`modifiers`). Le seguenti idee verranno implementate come passivi sbloccabili in-game (Level Up) o tramite Albero Meta-Progressione.

| Passivo Originale (VS) | Modificatore Ball Survival | Stato attuale | Note per l'implementazione |
| :--- | :--- | :--- | :--- |
| **Spinach** (+Might) | `power` | Già presente | N/A |
| **Armor** (+Retaliation/DR) | `dr` / `damageReflection` | DR presente | Aggiungere nuova stat `damageReflection` (danno da ritorsione). |
| **Hollow Heart** (+Max HP) | `maxHp` (percentuale) | Presente | N/A |
| **Pummarola** (+Regen) | `hpRegen` | Da implementare | Creare logica nel `Game.update` che cura `X` HP ogni secondo. |
| **Empty Tome** (-Cooldown) | `frequency` | Già presente | N/A |
| **Candelabrador** (+Area) | `area` | Già presente | N/A |
| **Bracer** (+Proj. Speed) | `projectileSpeed` | Da implementare | Nuovo moltiplicatore globale aggiunto a `player.modifiers`. |
| **Spellbinder** (+Duration) | `duration` | Da implementare | Moltiplicatore per effetti tipo slow, burn, scudi. |
| **Duplicator** (+Amount) | `projectiles` / Count | Parziale | Applicare +1 project al level up o alle armi specifiche. |
| **Wings** (+Move Speed) | `speed` | Già presente | N/A |
| **Attractorb** (+Pickup) | `pickupRadius` | Da implementare | Esistente in `CONFIG.xpOrbs`, va spostato/sovrascritto dal player. |
| **Clover** (+Luck) | `luck` | Già presente | N/A |
| **Crown** (+EXP) | `xpGain` | Già presente | N/A |
| **Stone Mask** (+Greed) | `gemGain` | Da implementare | Extra moltiplicatore di gemme e materiali a fine run. |
| **Parm Aegis** (+i-frames) | `iframeTimer` | Da implementare | Breve finestra di invulnerabilità dopo aver subito danno. |

## 2. Passivi "Rischio / Ricompensa" e Sistema Curse
Il sistema malus aumenta la difficoltà del gioco garantendo power up elevatissimi.

| Passivo Originale / Meccanica | Effetto su Ball Survival | Implementazione |
| :--- | :--- | :--- |
| **Curse (Stat)** | Aumenta HP nemici, MS, frequenza di spawn | Nuovo modificatore `player.modifiers.curse` base `0.0` (fino a 1.0 = +100%). Applicato in `SpawnSystem.js`. |
| **Skull O'Maniac** | +10% Curse a livello | Genera drop migliori / più EXP per via dei nemici aumentati. |
| **Torrona's Box** | +Omni stats, ma al Max Livello +Curse Massiccio | Upgrade speciale: buffa `power`, `speed`, `area`, ma all'ultimo livello spara `curse` alle stelle. |
| **Blood Magic** | +ATK, -HP Regen | Build "Glass Cannon". |
| **Juggernaut** | +ATK, -Danni subiti | Tank build. |

## 3. Passivi Speciali / Oggetti Nascosti
Questi oggetti esistono nella mappa anziché comparire nelle scelte di livello.

| Oggetto / Passivo | Effetto / Requisito |
| :--- | :--- |
| **Silver Ring / Gold Ring** | +Durata/+Area vs +Curse. Richiede di sbloccare o sconfiggere mini-boss posti sulla mappa laterale. |
| **Noblesse** | Evoca periodicamente o una tantum forzieri (Chest) attorno al player. |
| **Anima Persistente (Tirajisú/Guardian Angel)** | Già presente (revive). Possibilità di sovrapposizione fino a `maxRevives = 2`. |
| **Lord of Fire / Stormy Clouds (MS)** | Passivi "Elementali": +25% Danno seccato esclusivamente su spell di Fuoco / Fulmine / Ghiaccio. Ottimo come Meta Upgrade. |

## 4. Nuove Magie Attive / Armi
La mappatura delle magie offensive e di supporto.

| Nome Magic Survival | Idea Ball Survival | Stato |
| :--- | :--- | :--- |
| **Fireball / Meteor** | Sfera o meteora esplosiva. | Parzialmente coperto. Da aggiungere "Meteor" per attacchi Area on-click/auto. |
| **Thunderstorm...** | Fulmine a catena. | Già presente (`lightning_strike`). |
| **Blizzard / Tsunami** | Onda di gelo / rallentamento frontale. | Da implementare stile `Tsunami` (onda che spinge). |
| **Cyclone** | Vortice che attrae i nemici (crowd-control). | Da implementare "Buco Nero / Ciclone". |
| **Energy Bolt / Arcane**| Proiettile infinito/perforante | Presenti o espandibili (es. Arcane Ray). |
| **Shield / Cloaking** | Assorbimento singolo colpo o Invisibilità | Da implementare `Cloaking` (pass-through e MS up). |
| **Armageddon** | "Nuke" a schermo intero | Cooldown altissimo (es. 60-120s), cancella tutti i nemici. |

## 5. Passivi "Growth" (MS)
Un nuovo sistema che "scala" con il livello del personaggio direttamente in gioco.
In Ball Survival, modificheremo le scelte di progressione per introdurre un tag `type: 'growth'`.
Invece di avere "Livello 1, 2, 3", la skill dirà: **"+2% Danno per ogni tuo Livello"**. Questo re-calcola dinamicamente le stat nel ciclo `update()` del Player.

---

## Prossimi Passi (Priorità di Sviluppo)
**Fase 1: Meccaniche di Base Omise**
- [ ] Implementare I-Frames (`iframeTimer`) dopo i danni subiti.
- [ ] Implementare Pickup Radius dinamico (`pickupRadius`).
- [ ] Rigenerazione passiva della Salute (`hpRegen`).

**Fase 2: Il Sistema "Curse"**
- [ ] Aggiungere parametro `curse` globale e farlo scalare i nemici nello `SpawnSystem`.
- [ ] Creare gli oggetti `Skull_Passivo` e `Torrona_Box` per scalare e giocare sulla meccanica Curse.

**Fase 3: Magie "Utility & Crowd Control"**
- [ ] `Armageddon`: Cancellazione schermo.
- [ ] `Cyclone`: Vortice che sposta i nemici. 
- [ ] `Cloaking`: Permette attraversamento nemici (rimuove collision damage). 

**Fase 4: Oggetti Nascosti sulla Mappa**
- [ ] Piazzare Ring e Reliquie agli angoli estremi della mappa con dei guardiani fortissimi, seguendo lo stile del "Mercante Segreto" appena realizzato.
