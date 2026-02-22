import { getGlossaryIcon } from '../data/icons.js';
import { searchTerms, getAllTerms } from '../data/glossary.js';

export const GlossaryUI = {
    showGlossary() {
        this.populateGlossary();
        this.showPopup('glossary');
        this._wireGlossaryHandlers();
    },
    hideGlossary() {
        this.hideAllPopups();
        this.showPopup('start');
    },
    populateGlossary() {
        const container = document.getElementById('glossaryContent');
        if (!container) return;
        const searchInput = document.getElementById('glossarySearch');
        const categorySelect = document.getElementById('glossaryCategory');
        const query = searchInput?.value?.trim() || '';
        const category = categorySelect?.value || '';
        let terms = query ? searchTerms(query) : getAllTerms();
        if (category) terms = terms.filter((t) => t.category === category);
        container.innerHTML = '';
        const catLabels = { base: 'Base', combattimento: 'Combattimento', spell: 'Spell', equip: 'Equipaggiamento', progressione: 'Progressione' };
        const byCat = {};
        terms.forEach((t) => {
            if (!byCat[t.category]) byCat[t.category] = [];
            byCat[t.category].push(t);
        });
        Object.keys(byCat).sort().forEach((cat) => {
            const h = document.createElement('h4');
            h.className = 'glossary-category-title';
            h.textContent = catLabels[cat] || cat;
            container.appendChild(h);
            byCat[cat].forEach((t) => {
                const div = document.createElement('div');
                div.className = 'glossary-term';
                const icon = getGlossaryIcon(t.id);
                div.innerHTML = `<span class="glossary-term-icon">${icon}</span><div class="glossary-term-text"><strong>${t.name}</strong><p>${t.desc}</p></div>`;
                container.appendChild(div);
            });
        });
        if (terms.length === 0) {
            const p = document.createElement('p');
            p.className = 'glossary-empty';
            p.textContent = 'Nessun termine trovato.';
            container.appendChild(p);
        }
    },
    _wireGlossaryHandlers() {
        const searchInput = document.getElementById('glossarySearch');
        const categorySelect = document.getElementById('glossaryCategory');
        if (!searchInput || !categorySelect) return;
        const refresh = () => this.populateGlossary();
        searchInput.oninput = refresh;
        searchInput.onchange = refresh;
        categorySelect.onchange = refresh;
    }
};
