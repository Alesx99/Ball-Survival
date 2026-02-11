import { CONFIG } from '../config/index.js';

export const CraftingSystem = {
    addMaterial(materialId, amount = 1) {
        if (!this.materials[materialId]) {
            this.materials[materialId] = 0;
        }
        this.materials[materialId] += amount;

        // Notifica al giocatore
        const material = CONFIG.materials.coreMaterials[materialId] || CONFIG.materials.weaponMaterials[materialId];
        if (material) {
            this.notifications.push({
                text: `+${amount} ${material.name}`,
                life: 180,
                color: material.color
            });
        }

        // Salva i dati dopo aver aggiunto materiali
        this.saveGameData();
    },

    canCraftCore(coreId) {
        const core = CONFIG.cores[coreId];
        if (!core) return false;

        // Controlla se il core è sbloccato per lo stage corrente
        const currentStage = parseInt(this.currentStage || '1');
        if (core.stage && core.stage > currentStage) {
            return false; // Core non ancora sbloccato
        }

        // Controlla se il core esiste già
        if (this.cores[coreId]) {
            return false; // Core già posseduto
        }

        // Controlla materiali
        for (const [materialId, required] of Object.entries(core.materials)) {
            if (!this.materials[materialId] || this.materials[materialId] < required) {
                return false;
            }
        }
        return true;
    },

    canCraftWeapon(weaponId) {
        const weapon = CONFIG.weapons[weaponId];
        if (!weapon) return false;

        // Controlla se l'arma è sbloccata per lo stage corrente
        const currentStage = parseInt(this.currentStage || '1');
        if (weapon.stage && weapon.stage > currentStage) {
            return false; // Arma non ancora sbloccata
        }

        const weaponData = this.weapons[weaponId];

        // Se l'arma non esiste, controlla materiali per crearla
        if (!weaponData) {
            for (const [materialId, required] of Object.entries(weapon.materials)) {
                if (!this.materials[materialId] || this.materials[materialId] < required) {
                    return false;
                }
            }
            return true;
        }

        // Se l'arma esiste, controlla se può essere potenziata
        if (weaponData.level >= weapon.maxLevel) {
            return false; // Livello massimo raggiunto
        }

        // Controlla materiali per potenziamento
        for (const [materialId, required] of Object.entries(weapon.upgradeCost)) {
            if (!this.materials[materialId] || this.materials[materialId] < required) {
                return false;
            }
        }
        return true;
    },

    craftCore(coreId) {
        if (!this.canCraftCore(coreId)) return false;

        const core = CONFIG.cores[coreId];

        // Consuma i materiali
        for (const [materialId, required] of Object.entries(core.materials)) {
            this.materials[materialId] -= required;
        }

        // Aggiungi il core all'arsenale
        this.cores[coreId] = { level: 1, equipped: false };

        // Se non c'è un core attivo, equipaggia questo
        if (!this.arsenal.activeCore) {
            this.equipCore(coreId);
        }

        // Achievement tracking per oggetti craftati
        if (this.achievementSystem) {
            this.achievementSystem.updateProgress('items_crafted', 1, this);
        }

        this.notifications.push({
            text: `Core creato: ${core.name}`,
            life: 300,
            color: '#FFD700'
        });

        this.saveGameData();
        return true
    },

    craftWeapon(weaponId) {
        if (!this.canCraftWeapon(weaponId)) return false;

        const weapon = CONFIG.weapons[weaponId];
        const weaponData = this.weapons[weaponId];

        if (!weaponData) {
            // Crea nuova arma
            for (const [materialId, required] of Object.entries(weapon.materials)) {
                this.materials[materialId] -= required;
            }

            this.weapons[weaponId] = { level: 1, equipped: false };

            // Se c'è spazio nell'arsenale, equipaggia l'arma
            if (this.arsenal.activeWeapons.length < 2) {
                this.equipWeapon(weaponId);
            }

            // Achievement tracking per oggetti craftati
            if (this.achievementSystem) {
                this.achievementSystem.updateProgress('items_crafted', 1, this);
            }

            this.notifications.push({
                text: `Arma creata: ${weapon.name}`,
                life: 300,
                color: '#FFD700'
            });
        } else {
            // Potenzia arma esistente
            for (const [materialId, required] of Object.entries(weapon.upgradeCost)) {
                this.materials[materialId] -= required;
            }

            weaponData.level++;

            this.notifications.push({
                text: `${weapon.name} potenziata al livello ${weaponData.level}!`,
                life: 300,
                color: '#FFD700'
            });
        }

        this.saveGameData();
        return true;
    }
};
