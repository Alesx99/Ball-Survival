export const ITEMS_CONFIG = {
    chest: {
        spawnTime: 20,
        respawnTime: 45, // Increased slightly to allow multiple chests
        maxMapChests: 3,
        size: 30,
        normalChance: 0.85,
        epicChance: 0.12,
        legendaryChance: 0.03,
        gemDrop: { min: 10, random: 15 } // Base gems
    },
    merchant: { x: 4000, y: 2800, size: 40, interactionRadius: 60 },
    xpOrbs: { mapSpawn: { interval: 4, batch: 15, max: 300, value: 5 }, pickupRadius: 100 },
    materials: {
        coreMaterials: {
            'iron_fragment': { id: 'iron_fragment', name: 'Frammento di Ferro', rarity: 'common', color: '#8B7355', dropChance: 0.15, enemyTypes: ['slime'], stage: 1, description: "Metallo grezzo estratto dalle viscere della terra" },
            'steel_fragment': { id: 'steel_fragment', name: 'Frammento di Acciaio', rarity: 'uncommon', color: '#708090', dropChance: 0.08, enemyTypes: ['slime_elite'], stage: 1, description: "Acciaio temprato dalle fucine degli antichi" },
            'wood_fragment': { id: 'wood_fragment', name: 'Frammento di Legno Corrotto', rarity: 'common', color: '#2d5016', dropChance: 0.12, enemyTypes: ['goblin'], stage: 2, description: "Legno corrotto dalla magia oscura della foresta" },
            'poison_fragment': { id: 'poison_fragment', name: 'Frammento di Veleno', rarity: 'uncommon', color: '#32cd32', dropChance: 0.06, enemyTypes: ['goblin_elite'], stage: 2, description: "Veleno distillato dalle piante carnivore" },
            'sand_fragment': { id: 'sand_fragment', name: 'Frammento di Sabbia Ardente', rarity: 'common', color: '#daa520', dropChance: 0.14, enemyTypes: ['golem'], stage: 3, description: "Sabbia infuocata dal sole del deserto" },
            'fire_fragment': { id: 'fire_fragment', name: 'Frammento di Fuoco', rarity: 'uncommon', color: '#ff4500', dropChance: 0.07, enemyTypes: ['golem_elite'], stage: 3, description: "Fuoco eterno racchiuso in cristalli di quarzo" },
            'ice_fragment': { id: 'ice_fragment', name: 'Frammento di Ghiaccio Eterno', rarity: 'common', color: '#87ceeb', dropChance: 0.13, enemyTypes: ['ice_spirit'], stage: 4, description: "Ghiaccio che non si scioglie mai" },
            'frost_fragment': { id: 'frost_fragment', name: 'Frammento di Brina', rarity: 'uncommon', color: '#00ffff', dropChance: 0.065, enemyTypes: ['ice_spirit_elite'], stage: 4, description: "Brina che congela il tempo stesso" },
            'void_fragment': { id: 'void_fragment', name: 'Frammento del Vuoto', rarity: 'rare', color: '#8A2BE2', dropChance: 0.04, enemyTypes: ['cosmic_demon'], stage: 5, description: "Essenza pura del vuoto interstellare" },
            'star_fragment': { id: 'star_fragment', name: 'Frammento di Stella', rarity: 'epic', color: '#ffd700', dropChance: 0.02, enemyTypes: ['cosmic_demon_elite'], stage: 5, description: "Polvere di stelle cadute" },
            'demon_fragment': { id: 'demon_fragment', name: 'Frammento Demoniaco', rarity: 'common', color: '#8b0000', dropChance: 0.10, enemyTypes: ['demon'], stage: 6, description: "Essenza demoniaca strappata dalle fiamme" },
            'hellfire_fragment': { id: 'hellfire_fragment', name: 'Frammento di Fuoco Infernale', rarity: 'rare', color: '#ff2200', dropChance: 0.03, enemyTypes: ['demon_elite'], stage: 6, description: "Fuoco infernale in forma cristallina" },
            'celestial_fragment': { id: 'celestial_fragment', name: 'Frammento Celeste', rarity: 'rare', color: '#ffd700', dropChance: 0.03, enemyTypes: ['angel'], stage: 7, description: "Luce divina solidificata" },
            'divine_fragment': { id: 'divine_fragment', name: 'Frammento Divino', rarity: 'legendary', color: '#fff8e1', dropChance: 0.01, enemyTypes: ['angel_elite'], stage: 7, description: "Essenza della creazione stessa" }
        },
        weaponMaterials: {
            'stone_fragment': { id: 'stone_fragment', name: 'Frammento di Pietra', rarity: 'common', color: '#696969', dropChance: 0.16, enemyTypes: ['slime'], stage: 1, description: "Pietra solida della pianura" },
            'metal_fragment': { id: 'metal_fragment', name: 'Frammento di Metallo', rarity: 'uncommon', color: '#C0C0C0', dropChance: 0.08, enemyTypes: ['slime_elite'], stage: 1, description: "Metallo raffinato dalle miniere" },
            'vine_fragment': { id: 'vine_fragment', name: 'Frammento di Vite', rarity: 'common', color: '#228b22', dropChance: 0.15, enemyTypes: ['goblin'], stage: 2, description: "Viti animate della foresta oscura" },
            'shadow_fragment': { id: 'shadow_fragment', name: "Frammento d'Ombra", rarity: 'uncommon', color: '#2f2f2f', dropChance: 0.07, enemyTypes: ['goblin_elite'], stage: 2, description: "Ombra solidificata dalla magia oscura" },
            'obsidian_fragment': { id: 'obsidian_fragment', name: 'Frammento di Ossidiana', rarity: 'common', color: '#1a1a1a', dropChance: 0.14, enemyTypes: ['golem'], stage: 3, description: "Ossidiana forgiata dal calore del deserto" },
            'magma_fragment': { id: 'magma_fragment', name: 'Frammento di Magma', rarity: 'uncommon', color: '#ff4500', dropChance: 0.06, enemyTypes: ['golem_elite'], stage: 3, description: "Magma liquido racchiuso in cristalli" },
            'crystal_fragment': { id: 'crystal_fragment', name: 'Frammento di Cristallo', rarity: 'common', color: '#87CEEB', dropChance: 0.13, enemyTypes: ['ice_spirit'], stage: 4, description: "Cristalli di ghiaccio purissimo" },
            'energy_fragment': { id: 'energy_fragment', name: 'Frammento di Energia', rarity: 'uncommon', color: '#00FFFF', dropChance: 0.065, enemyTypes: ['ice_spirit_elite'], stage: 4, description: "Energia pura congelata nel tempo" },
            'cosmic_fragment': { id: 'cosmic_fragment', name: 'Frammento Cosmico', rarity: 'rare', color: '#FF1493', dropChance: 0.03, enemyTypes: ['cosmic_demon'], stage: 5, description: "Essenza cosmica dell'universo" },
            'nebula_fragment': { id: 'nebula_fragment', name: 'Frammento di Nebulosa', rarity: 'epic', color: '#9370db', dropChance: 0.015, enemyTypes: ['cosmic_demon_elite'], stage: 5, description: "Polvere di nebulose lontane" },
            'chaos_fragment': { id: 'chaos_fragment', name: 'Frammento del Caos', rarity: 'epic', color: '#ff00ff', dropChance: 0.03, enemyTypes: ['void_entity'], stage: 8, description: "Caos puro dall'aldilà della realtà" },
            'reality_fragment': { id: 'reality_fragment', name: 'Frammento di Realtà', rarity: 'legendary', color: '#ffffff', dropChance: 0.015, enemyTypes: ['void_entity_elite'], stage: 8, description: "Un pezzo della realtà stessa" }
        }
    },
    itemTypes: {
        'HEAL_POTION': { name: "Pozione di Cura", color: '#ff69b4', desc: "Ripristina il 50% della salute massima." },
        'XP_BOMB': { name: "Bomba di XP", color: '#ffff00', desc: "Fornisce un'enorme quantità di esperienza." },
        'INVINCIBILITY': { name: "Scudo Divino", color: '#ffffff', desc: "Immunità dai danni per 10 secondi." },
        'DAMAGE_BOOST': { name: "Gemma del Potere", color: '#ff4500', desc: "Aumenta i danni del 25% per 20 secondi." },
        'LEGENDARY_ORB': { name: "Frammento Divino", color: '#ff00ff', desc: "Invincibilità e danni aumentati per 60 secondi!" },

        // Nuovi oggetti consumabili attivi (Hotbar)
        'BOMB_ACTIVE': { name: "Bomba a Frammentazione", color: '#e74c3c', desc: "Consumabile: Esplode infliggendo ingenti danni ad area", isActive: true },
        'TURRET_ACTIVE': { name: "Torretta Portatile", color: '#3498db', desc: "Consumabile: Piazza una torretta che spara ai nemici per 15s", isActive: true },
        'HEAL_ACTIVE': { name: "Fiala Vitale", color: '#2ecc71', desc: "Consumabile: Ripristina subito il 100% HP (Uso manuale)", isActive: true }
    }
};
