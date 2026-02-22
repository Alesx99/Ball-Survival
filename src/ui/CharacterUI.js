import { CONFIG } from '../config/index.js';
import { ICONS } from '../data/icons.js';

export const CharacterUI = {
    populateCharacterSelection() {
        const container = this.dom.containers.characterSelectionContainer;
        container.innerHTML = '';
        const unlockedArchetypes = this.getUnlockedArchetypes();

        for (const key in CONFIG.characterArchetypes) {
            const archetype = CONFIG.characterArchetypes[key];
            const unlocked = unlockedArchetypes.has(archetype.id);
            const div = document.createElement('div');
            const archIcon = ICONS[archetype.id] || '🔵';
            div.className = `character-option ${unlocked ? '' : 'locked'}`;
            div.dataset.id = archetype.id;
            div.innerHTML = `
                <span class="character-option-icon">${archIcon}</span>
                <div class="character-option-content">
                <h5>${archetype.name}</h5>
                <p>${archetype.desc}</p>
                <p class="character-bonus"><strong>Bonus:</strong> ${archetype.bonus}</p>
                <p class="character-malus"><strong>Malus:</strong> ${archetype.malus}</p>
                ${archetype.cost > 0 ? `<p class="character-cost">Costo: ${archetype.cost} 💎</p>` : ''}
                <button class="buy-archetype-btn" style="display:${!unlocked && archetype.cost > 0 ? 'block' : 'none'}" ${this.totalGems < archetype.cost ? 'disabled' : ''}>Sblocca</button>
                </div>
            `;
            div.onclick = () => {
                if (unlockedArchetypes.has(archetype.id)) {
                    this.selectCharacter(archetype.id);
                    this.hideCharacterPopup();
                }
            };
            // Gestione acquisto
            const buyBtn = div.querySelector('.buy-archetype-btn');
            if (buyBtn) {
                buyBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (this.totalGems >= archetype.cost) {
                        this.totalGems -= archetype.cost;
                        this.unlockedArchetypes.add(archetype.id);
                        this.saveGameData?.();
                        this.populateCharacterSelection();
                        this.updateCharacterPreview();
                        this.notifications.push({ text: `${archetype.name} sbloccato!`, life: 120 });
                        this.dom.totalGemsShop.textContent = this.totalGems;
                    } else {
                        this.notifications.push({ text: `Non hai abbastanza gemme!`, life: 120 });
                        buyBtn.disabled = true;
                        setTimeout(() => { buyBtn.disabled = this.totalGems < archetype.cost; }, 1000);
                    }
                };
            }
            container.appendChild(div);
        }
        this.selectCharacter(this.selectedArchetype);
    },

    selectCharacter(archetypeId) {
        const unlockedArchetypes = this.getUnlockedArchetypes();
        if (!unlockedArchetypes.has(archetypeId)) return;
        this.selectedArchetype = archetypeId;
        document.querySelectorAll('.character-option').forEach(el => {
            el.classList.remove('selected');
        });
        const selectedElement = document.querySelector(`.character-option[data-id="${archetypeId}"]`);
        if (selectedElement) {
            selectedElement.classList.add('selected');
        }
        this.updateCharacterPreview();
    },

    updateCharacterPreview() {
        const preview = this.dom.containers.selectedCharacterPreview;
        const archetype = CONFIG.characterArchetypes[this.selectedArchetype];

        if (preview && archetype) {
            preview.innerHTML = `
                <h5>${archetype.name}</h5>
                <p>${archetype.desc}</p>
                <p class="character-bonus"><strong>Bonus:</strong> ${archetype.bonus}</p>
                <p class="character-malus"><strong>Malus:</strong> ${archetype.malus}</p>
            `;
        }
    },

    showCharacterPopup() {
        this.showPopup('characterSelection');
        this.populateCharacterSelection();
    },

    hideCharacterPopup() {
        this.hideAllPopups();
        this.showPopup('start'); // Torna al menù principale
    }
};
