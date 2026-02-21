/**
 * Icone per spell, passivi, core, armi, glossario e menu
 * Usate per richiamare visivamente la scelta in tutti i menu
 * @module data/icons
 */

export const ICONS = {
    // Spell e upgrade base
    magicMissile: '🔮',
    fireball: '🔥',
    lightning: '⚡',
    frostbolt: '❄️',
    shotgun: '💨',
    shockwave: '💥',
    heal: '💚',
    shield: '🛡️',
    singularity: '🌌',
    stellarAura: '✨',
    pulsarRay: '🌠',

    // Evoluzioni (prefisso base + evolve)
    fireball_evolve_giant: '🔥',
    fireball_evolve_meteor: '☄️',
    lightning_evolve_storm: '⛈️',
    lightning_evolve_spear: '⚡',
    frostbolt_evolve_glacial: '🌨️',
    frostbolt_evolve_comet: '☄️',
    shotgun_evolve_explosive: '💣',
    shotgun_evolve_cannon: '🔫',
    shockwave_evolve_resonant: '🌀',
    shockwave_evolve_implosion: '💫',
    heal_evolve_sanctuary: '⛪',
    heal_evolve_lifesteal: '🧛',
    shield_evolve_reflect: '🪞',
    shield_evolve_orbital: '🔵',

    // Maestrie
    fireball_mastery_giant: '🔥',
    fireball_mastery_meteor: '☄️',
    lightning_mastery_storm: '⛈️',
    lightning_mastery_spear: '⚡',
    frostbolt_mastery_glacial: '🌨️',
    frostbolt_mastery_comet: '☄️',
    shotgun_mastery_explosive: '💣',
    shotgun_mastery_cannon: '🔫',
    shockwave_mastery_resonant: '🌀',
    shockwave_mastery_implosion: '💫',
    heal_mastery_sanctuary: '⛪',
    heal_mastery_lifesteal: '🧛',
    shield_mastery_reflect: '🪞',
    shield_mastery_orbital: '🔵',

    // Fusioni
    fireball_lightning: '⚡🔥',
    frostbolt_shield: '❄️🛡️',
    shotgun_heal: '💨💚',
    black_hole: '🕳️',
    spectral_veil: '👻❄️',
    stellar_rain: '🌠🔥',
    paradox: '⏳',

    // Passivi
    health: '❤️',
    speed: '👟',
    armor: '🛡️',
    attack_speed: '⏱️',

    // Upgrade permanenti
    defense: '🛡️',
    xpGain: '📈',
    luck: '🍀',
    power: '💪',
    frequency: '⏱️',
    area: '◯',

    // Core
    magnetic: '🧲',
    resistance: '🛡️',
    poison: '☠️',
    shadow: '🌑',
    fire: '🔥',
    volcanic: '🌋',
    frost: '❄️',
    crystal: '💎',
    void: '🕳️',
    stellar: '⭐',
    storm: '⛈️',
    blood: '🩸',
    gravity: '🌀',
    arcane: '✨',

    // Armi
    iron_spikes: '🔩',
    steel_barrier: '🔒',
    poison_vines: '🌿',
    shadow_cloak: '👻',
    fire_ring: '🔥',
    obsidian_blade: '🗡️',
    ice_shards: '🧊',
    frost_field: '❄️',
    void_blade: '🗡️',
    stellar_pulse: '💫',
    arcane_lightning: '⚡',
    orbital_blades: '🔄',
    thorn_shield: '🌵',
    corrosive_mist: '☁️',

    // Archetipi
    standard: '🔵',
    steel: '⚙️',
    magma: '🌋',
    frost: '❄️',
    shadow: '🌑',
    tech: '🤖',
    prism: '🔮',
    unstable: '💥',
    druid: '🌿',
    phantom: '👻',

    // Glossario / termini generici
    xp: '💚',
    livello: '📊',
    gemme: '💎',
    materiali: '📦',
    rarita: '🌈',
    stage: '🗺️',
    dps: '💥',
    dr: '🛡️',
    knockback: '↩️',
    slow: '🐢',
    burn: '🔥',
    poison: '☠️',
    crit: '✨',
    evoluzione: '⬆️',
    maestria: '👑',
    cooldown: '⏳',
    area: '◯',
    core: '⚙️',
    arma: '⚔️',
    arsenale: '📋',
    magnet: '🧲',
    fusione: '🔗',
    passivo: '📌',
    upgrade_permanente: '🔧',
    archetipo: '🎭',
};

/** Ritorna l'icona per un upgrade (spell, passive, evolution, mastery, fusion) */
export function getUpgradeIcon(upgradeId, upgrade = null) {
    if (ICONS[upgradeId]) return ICONS[upgradeId];
    if (upgrade?.type === 'fusion') return ICONS[upgradeId] || '🔗';
    if (upgrade?.type === 'evolution') return ICONS[upgradeId] || ICONS[upgradeId?.split('_')[0]] || '⬆️';
    if (upgrade?.type === 'mastery') return ICONS[upgradeId] || ICONS[upgradeId?.split('_')[0]] || '👑';
    if (upgrade?.type === 'passive') return ICONS[upgradeId] || '📌';
    const baseId = upgrade?.primary || upgradeId?.split('_')[0];
    return ICONS[baseId] || ICONS[upgradeId] || '✨';
}

/** Ritorna l'icona per core o arma */
export function getItemIcon(itemId, type = 'core') {
    return ICONS[itemId] || (type === 'core' ? '⚙️' : '⚔️');
}

/** Ritorna l'icona per termine glossario */
export function getGlossaryIcon(termId) {
    return ICONS[termId] || '📖';
}
