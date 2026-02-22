import { CONFIG } from '../config/index.js';
import { getUpgradeIcon, ICONS } from '../data/icons.js';

export const RunHistoryUI = {
    showRunHistory() {
        this.populateRunHistory();
        this.showPopup('runHistory');
    },

    hideRunHistory() {
        this.hideAllPopups();
        this.showPopup('start');
    },

    populateRunHistory() {
        const container = document.getElementById('runHistoryList');
        if (!container || !this.runHistorySystem) return;
        container.innerHTML = '';

        const history = this.runHistorySystem.getHistory();
        if (history.length === 0) {
            container.innerHTML = '<div class="empty-state">Nessuna partita registrata.</div>';
            return;
        }

        history.forEach(run => {
            const date = new Date(run.date).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
            const resultClass = run.result === 'Victory' ? 'victory' : 'defeat';
            const resultIcon = run.result === 'Victory' ? '🏆' : '💀';

            const div = document.createElement('div');
            div.className = `history-item ${resultClass}`;

            const archName = CONFIG.characterArchetypes[run.archetype]?.name || run.archetype;

            let weaponsHtml = '';
            run.weapons.forEach(w => {
                const icon = getUpgradeIcon(w) || '⚔️';
                weaponsHtml += `<span title="${w}">${icon}</span>`;
            });

            div.innerHTML = `
                <div class="history-header">
                    <span class="history-result">${resultIcon} ${run.result === 'Victory' ? 'Vittoria' : 'Sconfitta'}</span>
                    <span class="history-date">${date}</span>
                </div>
                <div class="history-details">
                    <div>Archetipo: <strong>${archName}</strong></div>
                    <div>Livello: ${run.level}</div>
                    <div>Tempo: ${Math.floor(run.time / 60)}:${(Math.floor(run.time) % 60).toString().padStart(2, '0')}</div>
                    <div>Score: ${run.score.toLocaleString()}</div>
                </div>
                <div class="history-weapons">
                    ${weaponsHtml}
                </div>
            `;
            container.appendChild(div);
        });
    }
};
