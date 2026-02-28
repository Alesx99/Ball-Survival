import { PlayerDraw } from '../render/PlayerDraw.js';

export const PLAYER_CONFIG = {
    player: {
        base: { hp: 220, speed: 3, radius: 15, dr: 0 },
        iFramesDuration: 0.35,
        xpCurve: { base: 50, growth: 1.18, levelFactor: 25, power: 1.0 }
    },
    characterArchetypes: {
        'standard': {
            id: 'standard',
            name: "Sfera Standard",
            desc: "L'archetipo base. Equilibrato e senza modificatori speciali.",
            startingWeapon: 'magicMissile',
            bonus: "Nessuno.",
            malus: "Nessuno.",
            color: '#4488ff',
            cost: 0,
            draw: (ctx, player) => PlayerDraw.drawStandard(ctx, player)
        },
        'steel': {
            id: 'steel',
            name: "Palla d'Acciaio",
            desc: "Incredibilmente resistente ma molto lenta. Ideale per chi ama la mischia.",
            startingWeapon: 'shockwave',
            bonus: "+70% Riduzione Danno (DR) base. Shockwave: +40% danno, +50% knockback, +25% area.",
            malus: "-50% Velocità di movimento, -40% Velocità di attacco.",
            color: '#bdc3c7',
            cost: 200,
            weaponBonuses: { shockwave: { damage: 1.4, knockback: 1.5, radius: 1.25 } },
            draw: (ctx, player) => PlayerDraw.drawSteel(ctx, player)
        },
        'magma': {
            id: 'magma',
            name: "Nucleo Magmatico",
            desc: "Una sfera volatile che incenerisce chiunque si avvicini troppo.",
            startingWeapon: 'fireball',
            bonus: "Infligge danni da bruciatura potenziati ai nemici al contatto. Fireball: +60% danno da bruciatura, +25% danno diretto.",
            malus: "+15% tempo di ricarica per tutte le abilità.",
            color: '#e67e22',
            cost: 300,
            weaponBonuses: { fireball: { burnDamage: 1.6, damage: 1.25 } },
            draw: (ctx, player) => PlayerDraw.drawMagma(ctx, player)
        },
        'frost': {
            id: 'frost',
            name: "Cristallo di Gelo",
            desc: "Fragile ma capace di controllare il campo di battaglia con il suo freddo glaciale.",
            startingWeapon: 'frostbolt',
            bonus: "Rallenta fortemente i nemici che entrano in contatto. Frostbolt: +40% slow, +25% danno, +30% penetrazione.",
            malus: "-15 Salute massima.",
            color: '#3498db',
            cost: 300,
            weaponBonuses: { frostbolt: { slow: 1.4, damage: 1.25, penetration: 1.3 } },
            draw: (ctx, player) => PlayerDraw.drawFrost(ctx, player)
        },
        'shadow': {
            id: 'shadow',
            name: "Sfera d'Ombra",
            desc: "Veloce e letale, ma non può incassare molti colpi. Per giocatori audaci.",
            startingWeapon: 'shotgun',
            bonus: "+35% Velocità di movimento. Shotgun: +2 proiettili, +25% critico, +15% danno.",
            malus: "-20% Salute massima.",
            color: '#8e44ad',
            cost: 400,
            weaponBonuses: { shotgun: { count: 2, critChance: 0.25, damage: 1.15 } },
            draw: (ctx, player) => PlayerDraw.drawShadowModel(ctx, player)
        },
        'tech': {
            id: 'tech',
            name: "Giroscopio Tecnologico",
            desc: "Un congegno preciso che amplifica l'area d'effetto a discapito della potenza pura.",
            startingWeapon: 'lightning',
            bonus: "+50% Area d'effetto. Lightning: +3 rimbalzi, +40% area, +25% danno. Tutte le armi: +15% area bonus.",
            malus: "-5% Danno globale.",
            color: '#1abc9c',
            cost: 800,
            weaponBonuses: { lightning: { chains: 3, area: 1.4, damage: 1.25 } },
            draw: (ctx, player) => PlayerDraw.drawTech(ctx, player)
        },
        'prism': {
            id: 'prism',
            name: "Prisma Arcano",
            desc: "Un cristallo di pura energia magica. Potenzia tutte le spell ma è estremamente fragile.",
            startingWeapon: 'magicMissile',
            bonus: "+25% Danno magico. Tutte le spell: +1 livello massimo. +20% Area d'effetto.",
            malus: "-25% Salute massima, -10% Velocità di movimento.",
            color: '#e040fb',
            cost: 1000,
            unlockRequirement: { type: 'all_stages', count: 5 },
            weaponBonuses: { magicMissile: { damage: 1.25, area: 1.2 } },
            draw: (ctx, player) => PlayerDraw.drawPrism(ctx, player)
        },
        'unstable': {
            id: 'unstable',
            name: "Nucleo Instabile",
            desc: "Un nucleo di energia caotica. Esplosioni casuali devastanti ma imprevedibile.",
            startingWeapon: 'fireball',
            bonus: "+40% Danno globale. Esplosione casuale ogni 30s che infligge 50 danni in area.",
            malus: "-30% Salute massima. Subisce 5 danni ogni 45 secondi.",
            color: '#ff1744',
            cost: 600,
            unlockRequirement: { type: 'boss_kills_single_run', count: 3 },
            weaponBonuses: { fireball: { damage: 1.4, burnDamage: 1.3 } },
            draw: (ctx, player) => PlayerDraw.drawUnstable(ctx, player)
        },
        'druid': {
            id: 'druid',
            name: "Druido Vivente",
            desc: "Una sfera di energia naturale. Rigenera costantemente e potenzia i danni nel tempo.",
            startingWeapon: 'heal',
            bonus: "+2 HP/sec rigenerazione. Tutti i DoT (veleno, fuoco): +50% durata.",
            malus: "-20% Velocità d'attacco.",
            color: '#00e676',
            cost: 500,
            unlockRequirement: { type: 'materials_collected', count: 1000 },
            weaponBonuses: { heal: { healAmount: 1.4, cooldown: 0.85 } },
            draw: (ctx, player) => PlayerDraw.drawDruid(ctx, player)
        },
        'phantom': {
            id: 'phantom',
            name: "Fantasma",
            desc: "Una sfera spettrale. Velocissima e sfuggente ma incredibilmente fragile.",
            startingWeapon: 'shotgun',
            bonus: "+50% Velocità di movimento. Immune ai danni da contatto per 0.5s ogni 5s. Attraversa i nemici.",
            malus: "-40% Salute massima. Non può usare Shield.",
            color: '#b0bec5',
            cost: 1200,
            unlockRequirement: { type: 'total_deaths', count: 100 },
            weaponBonuses: { shotgun: { count: 1, damage: 1.2, critChance: 0.15 } },
            draw: (ctx, player) => PlayerDraw.drawPhantom(ctx, player)
        },
    }
};
