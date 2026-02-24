/**
 * InventoryUI - Logica di popolamento inventario, crafting, arsenale
 * @module ui/InventoryUI
 */

import { CONFIG } from '../config/index.js';
import { getItemIcon } from '../data/icons.js';

/** Popola inventario (solo arsenale: core/armi equip/equipaggiabili) */
export function populateInventory(game) {
    populateArsenal(game);
}

export function populateMaterialsList(game, containerId, materialsConfig) {
    const container = game.dom?.containers?.[containerId];
    if (!container) return;

    let html = '';
    let hasMaterials = false;

    for (const [materialId, material] of Object.entries(materialsConfig)) {
        const count = game.materials?.[materialId] || 0;
        if (count > 0) {
            hasMaterials = true;
            html += `
                <div class="material-item">
                    <div class="material-icon" style="background-color: ${material.color}">${material.name.charAt(0)}</div>
                    <div class="material-info">
                        <div class="material-name">${material.name}</div>
                        <div class="material-count">Quantità: ${count}</div>
                    </div>
                    <div class="material-rarity rarity-${material.rarity}">${material.rarity}</div>
                </div>
            `;
        }
    }

    container.innerHTML = hasMaterials ? html : '<div class="empty-inventory">Nessun materiale disponibile</div>';
}

export function populateCraftingList(game, containerId, itemsConfig, type) {
    const container = game.dom?.containers?.[containerId];
    if (!container) return;

    let html = '';
    let hasItems = false;

    for (const [itemId, item] of Object.entries(itemsConfig)) {
        const canCraft = type === 'core' ? game.canCraftCore?.(itemId) : game.canCraftWeapon?.(itemId);
        const materialsText = getMaterialsRequiredText(game, itemId, type);

        let statusText = '';
        let buttonText = 'Crea';

        if (type === 'core') {
            const coreData = game.cores?.[itemId];
            if (coreData) {
                statusText = `<div class="item-status">Posseduto (Livello ${coreData.level})</div>`;
                buttonText = 'Già posseduto';
            }
        } else {
            const weaponData = game.weapons?.[itemId];
            if (weaponData) {
                statusText = `<div class="item-status">Livello ${weaponData.level}/${item.maxLevel}</div>`;
                buttonText = weaponData.level >= item.maxLevel ? 'Livello massimo' : 'Potenziamento';
            }
        }

        const icon = getItemIcon(itemId, type);
        const itemClass = type === 'core' ? 'crafting-item crafting-item-core' : 'crafting-item crafting-item-weapon';
        html += `
            <div class="${itemClass}">
                <span class="crafting-item-icon">${icon}</span>
                <div class="crafting-item-content">
                <h5>${item.name}</h5>
                <p>${item.desc}</p>
                ${statusText}
                <div class="materials-required">${materialsText}</div>
                <button class="craft-btn" ${canCraft ? '' : 'disabled'} data-item-id="${itemId}" data-item-type="${type}">${buttonText}</button>
                </div>
            </div>
        `;
        hasItems = true;
    }

    container.innerHTML = hasItems ? html : '<div class="empty-inventory">Nessun oggetto disponibile</div>';

    container.querySelectorAll('.craft-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemId = e.target.dataset.itemId;
            const itemType = e.target.dataset.itemType;
            if (itemType === 'core') game.craftCore?.(itemId);
            else if (itemType === 'weapon') game.craftWeapon?.(itemId);
            if (game.populateInventory) game.populateInventory();
        });
    });
}

export function getMaterialsRequiredText(game, itemId, type) {
    const item = type === 'core' ? CONFIG.cores[itemId] : CONFIG.weapons[itemId];
    if (!item) return '';

    let materialsToCheck = item.materials;
    if (type === 'weapon' && game.weapons?.[itemId]) materialsToCheck = item.upgradeCost;
    if (!materialsToCheck) return '';

    const materials = [];
    for (const [materialId, amount] of Object.entries(materialsToCheck)) {
        const material = CONFIG.materials.coreMaterials[materialId] || CONFIG.materials.weaponMaterials[materialId];
        const current = game.materials?.[materialId] || 0;
        const color = current >= amount ? 'var(--highlight-color)' : 'var(--accent-color)';
        materials.push(`<span style="color: ${color}">${material?.name ?? materialId}: ${current}/${amount}</span>`);
    }
    return materials.join(', ');
}

export function populateArsenal(game) {
    populateActiveCore(game);
    populateActiveWeapons(game);
    populateAvailableCores(game);
    populateAvailableWeapons(game);
}

function populateActiveCore(game) {
    const container = document.getElementById('activeCoreDisplay');
    if (!container) return;

    if (game.arsenal?.activeCore) {
        const core = CONFIG.cores[game.arsenal.activeCore];
        const coreData = game.cores?.[game.arsenal.activeCore];
        const coreIcon = getItemIcon(game.arsenal.activeCore, 'core');
        container.innerHTML = `
            <div class="active-item">
                <span class="item-icon">${coreIcon}</span>
                <div><h6>${core?.name}</h6>
                <p>${core?.desc}</p>
                <div class="item-level">Livello ${coreData?.level}</div>
                <button class="unequip-btn" data-item-id="${game.arsenal.activeCore}" data-item-type="core">Rimuovi</button>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = '<div class="no-item">Nessun core equipaggiato</div>';
    }

    container.querySelectorAll('.unequip-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemId = e.target.dataset.itemId;
            if (e.target.dataset.itemType === 'core') game.unequipCore?.(itemId);
            if (game.populateArsenal) game.populateArsenal();
        });
    });
}

function populateActiveWeapons(game) {
    const container = document.getElementById('activeWeaponsDisplay');
    if (!container) return;

    if (game.arsenal?.activeWeapons?.length > 0) {
        let html = '';
        for (const weaponId of game.arsenal.activeWeapons) {
            const weapon = CONFIG.weapons[weaponId];
            const weaponData = game.weapons?.[weaponId];
            const weaponIcon = getItemIcon(weaponId, 'weapon');
            html += `
                <div class="active-item">
                    <span class="item-icon">${weaponIcon}</span>
                    <div><h6>${weapon?.name}</h6>
                    <p>${weapon?.desc}</p>
                    <div class="item-level">Livello ${weaponData?.level}/${weapon?.maxLevel}</div>
                    <button class="unequip-btn" data-item-id="${weaponId}" data-item-type="weapon">Rimuovi</button>
                    </div>
                </div>
            `;
        }
        container.innerHTML = html;
    } else {
        container.innerHTML = '<div class="no-item">Nessuna arma equipaggiata</div>';
    }

    container.querySelectorAll('.unequip-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemId = e.target.dataset.itemId;
            if (e.target.dataset.itemType === 'weapon') game.unequipWeapon?.(itemId);
            if (game.populateArsenal) game.populateArsenal();
        });
    });
}

function populateAvailableCores(game) {
    const container = document.getElementById('availableCoresDisplay');
    if (!container) return;

    let html = '';
    for (const [coreId, coreData] of Object.entries(game.cores || {})) {
        const core = CONFIG.cores[coreId];
        const coreIcon = getItemIcon(coreId, 'core');
        html += `
            <div class="available-item ${coreData.equipped ? 'equipped' : ''}">
                <span class="item-icon">${coreIcon}</span>
                <div><h6>${core?.name}</h6>
                <p>${core?.desc}</p>
                <div class="item-level">Livello ${coreData.level}</div>
                <button class="equip-btn" data-item-id="${coreId}" data-item-type="core" ${coreData.equipped ? 'disabled' : ''}>
                    ${coreData.equipped ? 'Equipaggiato' : 'Equipaggia'}
                </button>
                </div>
            </div>
        `;
    }
    container.innerHTML = html || '<div class="no-item">Nessun core posseduto</div>';

    container.querySelectorAll('.equip-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemId = e.target.dataset.itemId;
            if (e.target.dataset.itemType === 'core') game.equipCore?.(itemId);
            if (game.populateArsenal) game.populateArsenal();
        });
    });
}

function populateAvailableWeapons(game) {
    const container = document.getElementById('availableWeaponsDisplay');
    if (!container) return;

    let html = '';
    for (const [weaponId, weaponData] of Object.entries(game.weapons || {})) {
        const weapon = CONFIG.weapons[weaponId];
        const weaponIcon = getItemIcon(weaponId, 'weapon');
        html += `
            <div class="available-item ${weaponData.equipped ? 'equipped' : ''}">
                <span class="item-icon">${weaponIcon}</span>
                <div><h6>${weapon?.name}</h6>
                <p>${weapon?.desc}</p>
                <div class="item-level">Livello ${weaponData.level}/${weapon?.maxLevel}</div>
                <button class="equip-btn" data-item-id="${weaponId}" data-item-type="weapon" ${weaponData.equipped ? 'disabled' : ''}>
                    ${weaponData.equipped ? 'Equipaggiata' : 'Equipaggia'}
                </button>
                </div>
            </div>
        `;
    }
    container.innerHTML = html || '<div class="no-item">Nessuna arma posseduta</div>';

    container.querySelectorAll('.equip-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemId = e.target.dataset.itemId;
            if (e.target.dataset.itemType === 'weapon') game.equipWeapon?.(itemId);
            if (game.populateArsenal) game.populateArsenal();
        });
    });
}
