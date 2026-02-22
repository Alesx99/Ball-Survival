import { CONFIG } from '../config/index.js';

export const ShopUI = {
    populateShop() {
        if (this.dom.totalGemsShop) this.dom.totalGemsShop.textContent = this.totalGems;
        const container = this.dom.containers.permanentUpgradeOptions;
        if (!container) return;

        this.initShopCloseButton();
        container.innerHTML = '';

        if (!this.metaProgressionSystem) {
            console.error("MetaProgressionSystem non trovato!");
            return;
        }

        const skillTree = CONFIG.skillTree;

        for (const [nodeId, nodeData] of Object.entries(skillTree)) {
            const currentLevel = this.metaProgressionSystem.getUnlockedLevel(nodeId);
            const isMax = currentLevel >= nodeData.maxLevel;
            const canUnlock = this.metaProgressionSystem.canUnlockNode(nodeId);
            const cost = this.metaProgressionSystem.getNodeCost(nodeId);
            const isLocked = !canUnlock && currentLevel === 0;

            let costColor = this.totalGems < cost ? '#e74c3c' : '#fff';
            let btnHTML = '';

            if (isMax) {
                btnHTML = `<button class="skill-node-btn max-level" disabled>Assimilato</button>`;
            } else if (isLocked) {
                btnHTML = `<button class="skill-node-btn locked" disabled>Bloccato</button>`;
            } else {
                btnHTML = `<div class="skill-node-cost" style="color:${costColor}">${cost} 💎</div>
                           <button class="skill-node-btn buy-button" data-key="${nodeId}" ${this.totalGems < cost ? 'disabled' : ''}>
                               ${this.totalGems < cost ? 'Cristalli Insuff.' : 'Sblocca'}
                           </button>`;
            }

            const nodeHTML = `
                <div class="skill-node ${isLocked ? 'locked' : ''} ${isMax ? 'max-level' : ''}">
                    <div class="skill-node-header">
                        <div class="skill-node-icon">${nodeData.icon || '✨'}</div>
                        <div class="skill-node-level">${currentLevel}/${nodeData.maxLevel}</div>
                    </div>
                    <div class="skill-node-title">${nodeData.name}</div>
                    <div class="skill-node-desc">${nodeData.desc}</div>
                    ${btnHTML}
                </div>
            `;
            container.innerHTML += nodeHTML;
        }

        container.querySelectorAll('.buy-button').forEach(btn => {
            btn.onclick = () => {
                const nodeId = btn.dataset.key;
                if (this.metaProgressionSystem.unlockNode(nodeId)) {
                    this.saveGameData();
                    if (this.audio) this.audio.playLevelUp(); // Suono generico per lo sblocco
                    this.populateShop(); // Aggiorna UI
                }
            };
        });
    },

    initShopCloseButton() {
        const closeBtn = document.getElementById('closeShopBtn');
        if (closeBtn && !closeBtn.hasAttribute('data-initialized')) {
            closeBtn.setAttribute('data-initialized', 'true');
            closeBtn.addEventListener('click', () => {
                this.hideAllPopups();
            });
        }
    },

    populateSecretShop() {
        const gemsEl = document.getElementById('totalGemsSecretShop');
        if (gemsEl) gemsEl.textContent = this.totalGems;
        const container = document.getElementById('secretShopOptions');
        if (!container) return;

        container.innerHTML = '';
        const items = [
            { id: 'divine_shard', name: 'Frammento Divino', desc: 'Invincibilità e Danni ++ per 60s.', cost: 500, icon: '🔮', type: 'item' },
            { id: 'treasure_map', name: 'Evoca Tesoro', desc: 'Spawna istantaneamente un Forziere Epico.', cost: 300, icon: '🗺️', type: 'buff' },
            { id: 'full_heal', name: 'Cura Miracolosa', desc: 'Ripristina tutti gli HP attuali.', cost: 150, icon: '❤️', type: 'heal' }
        ];

        items.forEach(item => {
            const canAfford = this.totalGems >= item.cost;
            const costColor = canAfford ? '#fff' : '#e74c3c';
            const btnHTML = `<div class="skill-node-cost" style="color:${costColor}">${item.cost} 💎</div>
                             <button class="skill-node-btn buy-button" data-key="${item.id}" data-cost="${item.cost}" data-type="${item.type}" ${canAfford ? '' : 'disabled'}>
                                 ${canAfford ? 'Acquista' : 'Cristalli Insuff.'}
                             </button>`;

            const nodeHTML = `
                <div class="skill-node" style="border-color: #ff0000; background: rgba(255,0,0,0.05);">
                    <div class="skill-node-header">
                        <div class="skill-node-icon">${item.icon}</div>
                    </div>
                    <div class="skill-node-title" style="color:#ff6b6b;">${item.name}</div>
                    <div class="skill-node-desc">${item.desc}</div>
                    ${btnHTML}
                </div>
            `;
            container.innerHTML += nodeHTML;
        });

        container.querySelectorAll('.buy-button').forEach(btn => {
            btn.onclick = () => {
                const id = btn.dataset.key;
                const cost = parseInt(btn.dataset.cost);

                if (this.totalGems >= cost) {
                    this.totalGems -= cost;
                    if (this.audio) this.audio.playAchievementUnlock?.();

                    if (id === 'divine_shard') {
                        this.player.powerUpTimers = this.player.powerUpTimers || {};
                        this.player.powerUpTimers.invincibility = 60 * 60;
                        this.player.powerUpTimers.damageBoost = 60 * 60;
                        this.game.notifications.push({ text: "POTERE ASSOLUTO!", life: 120, color: '#ffff00' });
                    } else if (id === 'treasure_map') {
                        const ChestClass = this._entityClasses.Chest;
                        this.addEntity('chests', new ChestClass(this.player.x + 200, this.player.y + 200, 'epic'));
                        this.notifications.push({ text: 'Un Forziere Epico è apparso!', life: 250, color: '#9b59b6' });
                    } else if (id === 'full_heal') {
                        this.player.hp = this.player.stats.maxHp;
                        this.notifications.push({ text: 'Salute Max Ripristinata!', life: 200, color: '#2ecc71' });
                    }

                    this.populateSecretShop(); // Refresh UI
                }
            };
        });
    }
};
