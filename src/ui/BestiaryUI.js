import { CONFIG } from '../config/index.js';

export const BestiaryUI = {
    showBestiary() {
        this.populateBestiary();
        this.showPopup('bestiary');
    },

    hideBestiary() {
        this.hideAllPopups();
        this.showPopup('start');
    },

    populateBestiary() {
        const container = document.getElementById('bestiaryGrid');
        if (!container || !this.bestiarySystem) return;
        container.innerHTML = '';

        const data = this.bestiarySystem.getAllEntries();
        const sortedKeys = Object.keys(data).sort();
        if (sortedKeys.length === 0) {
            container.innerHTML = '<div class="empty-state">Nessun nemico scoperto ancora!</div>';
            return;
        }

        sortedKeys.forEach(type => {
            const entry = data[type];
            const name = type.charAt(0).toUpperCase() + type.slice(1);

            const div = document.createElement('div');
            div.className = 'bestiary-card';

            let icon = '👾';
            if (type.includes('boss')) icon = '💀';
            else if (type.includes('bat')) icon = '🦇';
            else if (type.includes('slime')) icon = '🦠';
            else if (type.includes('ghost')) icon = '👻';
            else if (type.includes('snake')) icon = '🐍';
            else if (type.includes('tank')) icon = '🛡️';

            div.innerHTML = `
                <div class="bestiary-icon">${icon}</div>
                <div class="bestiary-info">
                    <div class="bestiary-name">${name}</div>
                    <div class="bestiary-stats">Uccisioni: ${entry.kills}</div>
                    <div class="bestiary-stats">Max/Run: ${entry.maxKillsInRun}</div>
                </div>
            `;
            container.appendChild(div);
        });
    }
};
