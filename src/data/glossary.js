/**
 * Glossario - Termini e definizioni del gioco
 * Usato per la UI Glossario e tooltip
 * @module data/glossary
 */

export const GLOSSARY = {
    categories: ['base', 'combattimento', 'spell', 'equip', 'progressione'],

    terms: {
        // === BASE ===
        xp: {
            name: 'XP / Esperienza',
            category: 'base',
            desc: 'Raccogli globi verdi (da nemici uccisi o spawm sulla mappa) per guadagnare esperienza. Raggiungi la soglia per salire di livello e scegliere un potenziamento.',
        },
        livello: {
            name: 'Livello',
            category: 'base',
            desc: 'Il tuo livello attuale. Ogni livello sblocca una scelta tra 3 potenziamenti (spell, passivi o evoluzioni). La curva XP richiede più esperienza ad ogni livello.',
        },
        gemme: {
            name: 'Gemme / Cristalli',
            category: 'base',
            desc: 'Risorsa permanente (persiste tra le run). Usata nel Negozio per acquistare upgrade permanenti e sbloccare nuovi archetipi.',
        },
        materiali: {
            name: 'Materiali',
            category: 'base',
            desc: 'Frammenti collezionabili utilizzati nelle versioni precedenti per il crafting. Il sistema attuale basa il progresso di Core e Armi principalmente sul loot dai Forzieri.',
        },
        rarita: {
            name: 'Rarità',
            category: 'base',
            desc: 'Common (bianco), Uncommon (verde), Rare (blu), Epic (arancione), Legendary (viola). Materiali più rari hanno drop chance minore ma sono necessari per equipaggiamento avanzato.',
        },
        stage: {
            name: 'Stage / Mappa',
            category: 'base',
            desc: 'Le diverse zone del mondo (Pianura, Foresta, Deserto, Ghiacciaio, Abisso). Ogni stage ha difficoltà, nemici e materiali propri. Sbloccabili completando requisiti.',
        },

        // === COMBATTIMENTO ===
        dps: {
            name: 'DPS (Danni per Secondo)',
            category: 'combattimento',
            desc: 'Quantità di danno inflitto in media ogni secondo. Dipende da danno base, velocità di attacco, area e moltiplicatori.',
        },
        dr: {
            name: 'DR (Riduzione Danno)',
            category: 'combattimento',
            desc: 'Percentuale di danno ridotto quando colpito. Es: 30% DR = ricevi 70% del danno. Può arrivare fino al 85% (90% con archetipo Steel).',
        },
        knockback: {
            name: 'Knockback',
            category: 'combattimento',
            desc: 'Respinge i nemici colpiti. Utile per tenere distanza. Spell come Shockwave e alcune armi lo applicano.',
        },
        slow: {
            name: 'Slow (Rallentamento)',
            category: 'combattimento',
            desc: 'Riduce la velocità di movimento dei nemici. Frostbolt, Frost Core e alcune armi glaciali lo applicano. Essenziale per il kiting nel late game.',
        },
        burn: {
            name: 'Burn (Bruciatura)',
            category: 'combattimento',
            desc: 'Danno nel tempo (DoT) da fuoco. Fireball e Core Infuocato lo applicano. L\'archetipo Magma infligge burn al contatto.',
        },
        poison: {
            name: 'Poison (Veleno)',
            category: 'combattimento',
            desc: 'Danno nel tempo da veleno. Core Velenoso e Viti Velenose lo applicano. Si accumula con colpi ripetuti.',
        },
        crit: {
            name: 'Critico',
            category: 'combattimento',
            desc: 'Colpo che infligge danni moltiplicati. Attualmente non esplicitamente implementato; può essere aggiunto in future versioni.',
        },

        // === SPELL ===
        evoluzione: {
            name: 'Evoluzione',
            category: 'spell',
            desc: 'Trasforma una spell al livello massimo in una versione potenziata (es. Fireball → Palla Gigante o Pioggia di Meteore). Scegli una delle due evoluzioni disponibili.',
        },
        maestria: {
            name: 'Maestria',
            category: 'spell',
            desc: 'Potenziamento finale dopo l\'evoluzione. Aumenta ulteriormente i danni o aggiunge effetti (stun, area, durata).',
        },
        cooldown: {
            name: 'Cooldown (Ricarica)',
            category: 'spell',
            desc: 'Tempo in millisecondi tra un cast e il successivo. Riducibile con passivo Velocità d\'attacco e upgrade permanenti Frequenza.',
        },
        area: {
            name: 'Area d\'Effetto',
            category: 'spell',
            desc: 'Raggio o dimensione dell\'abilità. Un\'area maggiore colpisce più nemici. Modificabile con upgrade permanenti.',
        },

        // === EQUIPAGGIAMENTO ===
        core: {
            name: 'Core',
            category: 'equip',
            desc: 'Equipaggiamento passivo che trovi principalmente nei Forzieri (soprattutto Epici/Leggendari). Puoi equipaggiarne 1 alla volta. Conferisce effetti permanenti (magnet, resistenza, aura danni, ecc.).',
        },
        arma: {
            name: 'Arma',
            category: 'equip',
            desc: 'Equipaggiamento offensivo/defensivo ottenibile dai Forzieri e dall\'Arsenale. Puoi equipaggiarne 2. Ogni arma ha un effetto attivo (spine, barriera, lame, ecc.).',
        },
        arsenale: {
            name: 'Arsenale',
            category: 'equip',
            desc: 'L\'insieme del Core attivo e delle 2 Armi equipaggiate. Configurabile dall\'Inventario.',
        },
        magnet: {
            name: 'Magnet (Attrazione)',
            category: 'equip',
            desc: 'Aumenta la distanza a cui gemme e XP vengono attratti verso di te. Core Magnetico lo fornisce.',
        },

        // === PROGRESSIONE ===
        fusione: {
            name: 'Fusione',
            category: 'progressione',
            desc: 'Combinazione di due spell al livello massimo per ottenere un\'abilità potenziata. La spell secondaria viene sacrificata. Es: Fireball + Lightning → Fulmine Infuocato.',
        },
        passivo: {
            name: 'Passivo',
            category: 'progressione',
            desc: 'Potenziamento scelto al level up che modifica statistiche base: Vitalità (+60 HP), Rapidità (+velocità), Armatura (+3% DR), Velocità d\'attacco (-8% cooldown).',
        },
        upgrade_permanente: {
            name: 'Upgrade Permanente',
            category: 'progressione',
            desc: 'Acquistato con Gemme nel Negozio. Persiste tra le run. Es: Salute, Difesa, Potenza, Frequenza, Area.',
        },
        archetipo: {
            name: 'Archetipo',
            category: 'progressione',
            desc: 'La "classe" della tua sfera. Sbloccabile con Gemme. Ogni archetipo ha bonus e malus unici (Steel: +70% DR ma -50% velocità, Magma: burn al contatto, ecc.).',
        },
    },
};

/** Ritorna i termini per categoria */
export function getTermsByCategory(category) {
    return Object.entries(GLOSSARY.terms)
        .filter(([, t]) => t.category === category)
        .map(([id, t]) => ({ id, ...t }));
}

/** Ritorna tutti i termini come array */
export function getAllTerms() {
    return Object.entries(GLOSSARY.terms).map(([id, t]) => ({ id, ...t }));
}

/** Cerca nei termini (nome + desc) */
export function searchTerms(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) return getAllTerms();
    return getAllTerms().filter(
        (t) =>
            t.name.toLowerCase().includes(q) ||
            t.desc.toLowerCase().includes(q) ||
            t.id.toLowerCase().includes(q)
    );
}
