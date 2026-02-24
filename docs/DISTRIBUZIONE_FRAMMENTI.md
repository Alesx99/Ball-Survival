# Distribuzione frammenti e oggetti per crafting

## Come funziona il drop

**File:** `CraftingSystem.tryDropMaterial(enemy)`  
**Trigger:** Alla morte di ogni nemico (non boss).

1. **Stage corrente:** `stage = this.currentStage` (1–8, in base allo stage selezionato / sbloccato).
2. **Tipo di nemico:** L'indice dello stage mappa su una coppia nemico normale / elite:
   - Stage 1 → slime / slime_elite
   - Stage 2 → goblin / goblin_elite
   - Stage 3 → golem / golem_elite
   - Stage 4 → ice_spirit / ice_spirit_elite
   - Stage 5 → cosmic_demon / cosmic_demon_elite
   - Stage 6 → demon / demon_elite
   - Stage 7 → angel / angel_elite
   - Stage 8 → void_entity / void_entity_elite
3. **Per ogni materiale** (core + weapon da CONFIG.materials):
   - Si controlla `def.stage === stage` e `def.enemyTypes.includes(enemyType)`.
   - Ogni materiale è legato a **un solo** tipo (es. solo slime, o solo slime_elite).
4. **Probabilità:** `chance = dropChance * dropBonus * (1 + luck)`.
   - dropBonus da CONFIG.stages[stage].effects.dropBonus (1.0 stage 1 → 3.0 stage 8).
   - Un roll per materiale per kill: se passa, spawna **1** MaterialOrb.

---

## Riepilogo materiali

### Core materials

| Materiale | Stage | Nemico | dropChance | Rarità | Usato in (equipment) |
|-----------|-------|--------|------------|--------|----------------------|
| iron_fragment | 1 | slime | 0.15 | common | magnetic, resistance, iron_spikes, thorn_shield |
| steel_fragment | 1 | slime_elite | 0.08 | uncommon | resistance, steel_barrier |
| wood_fragment | 2 | goblin | 0.12 | common | poison, shadow_cloak, thorn_shield |
| poison_fragment | 2 | goblin_elite | 0.06 | uncommon | poison, blood, poison_vines, corrosive_mist |
| sand_fragment | 3 | golem | 0.14 | common | fire, fire_ring, corrosive_mist |
| fire_fragment | 3 | golem_elite | 0.07 | uncommon | fire, fire_ring |
| ice_fragment | 4 | ice_spirit | 0.13 | common | frost, ice_shards |
| frost_fragment | 4 | ice_spirit_elite | 0.065 | uncommon | frost, storm, frost_field |
| void_fragment | 5 | cosmic_demon | 0.04 | rare | void, blood, gravity, void_blade |
| star_fragment | 5 | cosmic_demon_elite | 0.02 | epic | stellar, arcane, stellar_pulse |
| demon_fragment | 6 | demon | 0.10 | common | **non usato in nessun recipe** |
| hellfire_fragment | 6 | demon_elite | 0.03 | rare | **non usato** |
| celestial_fragment | 7 | angel | 0.03 | rare | **non usato** |
| divine_fragment | 7 | angel_elite | 0.01 | legendary | **non usato** |

### Weapon materials

| Materiale | Stage | Nemico | dropChance | Rarità | Usato in (equipment) |
|-----------|-------|--------|------------|--------|----------------------|
| stone_fragment | 1 | slime | 0.16 | common | resistance, iron_spikes |
| metal_fragment | 1 | slime_elite | 0.08 | uncommon | steel_barrier, orbital_blades |
| vine_fragment | 2 | goblin | 0.15 | common | poison_vines, shadow_cloak, thorn_shield |
| shadow_fragment | 2 | goblin_elite | 0.07 | uncommon | shadow, shadow_cloak |
| obsidian_fragment | 3 | golem | 0.14 | common | volcanic, obsidian_blade, orbital_blades |
| magma_fragment | 3 | golem_elite | 0.06 | uncommon | volcanic, obsidian_blade |
| crystal_fragment | 4 | ice_spirit | 0.13 | common | crystal, ice_shards |
| energy_fragment | 4 | ice_spirit_elite | 0.065 | uncommon | crystal, storm, frost_field, arcane, arcane_lightning |
| cosmic_fragment | 5 | cosmic_demon | 0.03 | rare | void, gravity, void_blade, stellar_pulse, arcane_lightning |
| nebula_fragment | 5 | cosmic_demon_elite | 0.015 | epic | stellar, stellar_pulse |
| chaos_fragment | 8 | void_entity | 0.03 | epic | **non usato** |
| reality_fragment | 8 | void_entity_elite | 0.015 | legendary | **non usato** |

---

## Criticità

1. **Stage 6 e 7 (core):** demon_fragment, hellfire_fragment, celestial_fragment, divine_fragment droppano ma **nessun core/arma in equipment.js** li usa. Recipe solo stage 1–5.
2. **Stage 8 (weapon):** chaos_fragment e reality_fragment droppano ma **nessuna arma/core** li richiede.
3. **Un materiale = un nemico:** ogni frammento ha un solo enemyType; per stage ci sono solo 2 tipi (normale + elite).
4. **Chance effettiva:** con dropBonus 1.0 e no luck, common 15% = 15% per kill del tipo giusto. Epic/legendary (0.01–0.03) restano molto rari.

---

## Dove si modifica

- **Materiali e dropChance:** `src/config/items.js` → materials.coreMaterials, materials.weaponMaterials
- **Logica drop:** `src/systems/CraftingSystem.js` → tryDropMaterial
- **Recipe core/armi:** `src/config/equipment.js` → cores, weapons
- **Bonus drop stage:** `src/config/stages.js` → effects.dropBonus
- **Mappatura stage → nemico:** `src/systems/CraftingSystem.js` → array enemyTypes in tryDropMaterial
