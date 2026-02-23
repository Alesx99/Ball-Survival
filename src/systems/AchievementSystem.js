import { StorageManager, StorageKeys } from '../core/StorageManager.js';
export class AchievementSystem {
    constructor() {
        this.achievements = {
            enemies_killed: { id: 'enemies_killed', name: 'Enemy Slayer', description: 'Kill enemies', icon: '⚔️', thresholds: [100, 500, 1000], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 },
            elites_killed: { id: 'elites_killed', name: 'Elite Hunter', description: 'Kill elite enemies', icon: '👹', thresholds: [10, 50, 100], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 },
            materials_collected: { id: 'materials_collected', name: 'Collector', description: 'Collect materials', icon: '💎', thresholds: [50, 200, 500], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 },
            items_crafted: { id: 'items_crafted', name: 'Craftsman', description: 'Craft items', icon: '🔨', thresholds: [5, 20, 50], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 },
            stages_unlocked: { id: 'stages_unlocked', name: 'Explorer', description: 'Unlock stages', icon: '🗺️', thresholds: [2, 3, 5], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 },
            archetypes_unlocked: { id: 'archetypes_unlocked', name: 'Versatile', description: 'Unlock archetypes', icon: '🎭', thresholds: [3, 4, 6], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 },
            survival_time_5min: { id: 'survival_time_5min', name: 'Survivor 5min', description: 'Survive 5 minutes', icon: '⏱️', thresholds: [300], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 },
            survival_time_10min: { id: 'survival_time_10min', name: 'Survivor 10min', description: 'Survive 10 minutes', icon: '⏱️', thresholds: [600], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 },
            survival_time_15min: { id: 'survival_time_15min', name: 'Survivor 15min', description: 'Survive 15 minutes', icon: '⏱️', thresholds: [900], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 },
            survival_time_666: { id: 'survival_time_666', name: '666', description: 'Sopravvivi 666 secondi (11:06)', icon: '👿', thresholds: [666], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 },
            level_10: { id: 'level_10', name: 'Level 10', description: 'Reach level 10', icon: '📈', thresholds: [10], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 },
            level_20: { id: 'level_20', name: 'Level 20', description: 'Reach level 20', icon: '📈', thresholds: [20], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 },
            level_30: { id: 'level_30', name: 'Level 30', description: 'Reach level 30', icon: '📈', thresholds: [30], currentValue: 0, bestValue: 0, unlocked: false, tier: 0 },
            // Combattimento
            boss_kills: { id: 'boss_kills', name: 'Boss Slayer', description: 'Uccidi boss', icon: '👑', thresholds: [5, 15, 30], currentValue: 0, bestValue: 0, unlocked: false, tier: 0, gemReward: [5, 15, 50] },
            damage_dealt: { id: 'damage_dealt', name: 'Devastatore', description: 'Infliggi danno totale', icon: '💥', thresholds: [10000, 50000, 200000], currentValue: 0, bestValue: 0, unlocked: false, tier: 0, gemReward: [5, 15, 50] },
            no_damage_run: { id: 'no_damage_run', name: 'Intoccabile', description: 'Sopravvivi senza danni per X secondi', icon: '🛡️', thresholds: [60, 120, 300], currentValue: 0, bestValue: 0, unlocked: false, tier: 0, gemReward: [5, 15, 50] },
            combo_kills: { id: 'combo_kills', name: 'Combo Master', description: 'Uccidi X nemici in 3 secondi', icon: '🔥', thresholds: [10, 20, 50], currentValue: 0, bestValue: 0, unlocked: false, tier: 0, gemReward: [5, 15, 50] },
            spell_casts: { id: 'spell_casts', name: 'Incantatore', description: 'Lancia spell totali', icon: '✨', thresholds: [500, 2000, 10000], currentValue: 0, bestValue: 0, unlocked: false, tier: 0, gemReward: [5, 15, 50] },
            // Esplorazione
            all_cores: { id: 'all_cores', name: 'Collezionista di Core', description: 'Crafta tutti i core', icon: '🧲', thresholds: [14], currentValue: 0, bestValue: 0, unlocked: false, tier: 0, gemReward: [50] },
            all_weapons: { id: 'all_weapons', name: 'Armaiolo Supremo', description: 'Crafta tutte le armi', icon: '⚔️', thresholds: [14], currentValue: 0, bestValue: 0, unlocked: false, tier: 0, gemReward: [50] },
            all_stages: { id: 'all_stages', name: 'Viaggiatore', description: 'Sblocca tutti gli stage', icon: '🌍', thresholds: [5], currentValue: 0, bestValue: 0, unlocked: false, tier: 0, gemReward: [50] },
            // Sfide speciali (segrete)
            pacifist_3min: { id: 'pacifist_3min', name: 'Pacifista', description: 'Sopravvivi 3 min senza uccidere', icon: '☮️', thresholds: [180], currentValue: 0, bestValue: 0, unlocked: false, tier: 0, gemReward: [50], secret: true },
            speedrun_lv10: { id: 'speedrun_lv10', name: 'Speed Demon', description: 'Lv 10 in meno di 60s', icon: '⚡', thresholds: [1], currentValue: 0, bestValue: 0, unlocked: false, tier: 0, gemReward: [50], secret: true },
            all_archetypes_run: { id: 'all_archetypes_run', name: 'Versatilologo', description: 'Gioca con tutti gli archetipi', icon: '🎭', thresholds: [9], currentValue: 0, bestValue: 0, unlocked: false, tier: 0, gemReward: [50] }
        };
        this.loadAchievements();
    }

    loadAchievements() {
        const saved = StorageManager.getItem(StorageKeys.ACHIEVEMENTS);
        if (saved) {
            try {
                // StorageManager.getItem restituisce già l'oggetto parsato
                const loaded = typeof saved === 'string' ? JSON.parse(saved) : saved;
                if (loaded && typeof loaded === 'object') {
                    for (const [id, data] of Object.entries(loaded)) {
                        if (this.achievements[id]) {
                            Object.assign(this.achievements[id], data);
                        }
                    }
                }
            } catch (e) {
                console.log('Achievement data corrupted, starting fresh');
            }
        }
    }

    saveAchievements() {
        StorageManager.setItem(StorageKeys.ACHIEVEMENTS, this.achievements);
    }

    updateProgress(achievementId, value, game) {
        const achievement = this.achievements[achievementId];
        if (!achievement || achievement.unlocked) return;

        achievement.currentValue = value;
        achievement.bestValue = Math.max(achievement.bestValue || 0, value);

        for (let tier = 0; tier < achievement.thresholds.length; tier++) {
            if (achievement.bestValue >= achievement.thresholds[tier]) {
                if (achievement.tier <= tier) {
                    this.unlockAchievement(achievementId, tier, game);
                }
            }
        }
        this.saveAchievements();
    }

    checkTimeBasedAchievements(gameTime, game) {
        const timeAchievements = ['survival_time_5min', 'survival_time_10min', 'survival_time_15min', 'survival_time_666'];
        for (const id of timeAchievements) {
            this.updateProgress(id, gameTime, game);
        }
    }

    checkPlayerStatsAchievements(player, game) {
        if (!player) return;
        if (typeof player.level === 'number') {
            this.updateProgress('level_10', player.level, game);
            this.updateProgress('level_20', player.level, game);
            this.updateProgress('level_30', player.level, game);
        }
        if (typeof player.kills === 'number') {
            this.updateProgress('enemies_killed', player.kills, game);
        }
        if (typeof player.eliteKills === 'number') {
            this.updateProgress('elites_killed', player.eliteKills, game);
        }
        if (typeof player.materialsCollected === 'number') {
            this.updateProgress('materials_collected', player.materialsCollected, game);
        }
        if (typeof player.itemsCrafted === 'number') {
            this.updateProgress('items_crafted', player.itemsCrafted, game);
        }
        if (typeof player.stagesUnlocked === 'number') {
            this.updateProgress('stages_unlocked', player.stagesUnlocked, game);
        }
        if (typeof player.archetypesUnlocked === 'number') {
            this.updateProgress('archetypes_unlocked', player.archetypesUnlocked, game);
        }
    }

    checkCombatAchievements(game) {
        if (!game) return;
        // Boss kills
        const bossKills = game.stats?.bossKills || 0;
        this.updateProgress('boss_kills', bossKills, game);
        // Damage dealt
        const totalDamage = game.stats?.totalDamageDealt || 0;
        this.updateProgress('damage_dealt', totalDamage, game);
        // Spell casts
        const spellCasts = game.stats?.totalSpellCasts || 0;
        this.updateProgress('spell_casts', spellCasts, game);
        // No damage timer
        const noDamageTime = game.stats?.noDamageTimer || 0;
        this.updateProgress('no_damage_run', noDamageTime, game);
        // Combo kills
        const comboKills = game.stats?.bestComboKills || 0;
        this.updateProgress('combo_kills', comboKills, game);
        // Pacifist
        if (game.stats?.pacifistTimer && game.stats.kills === 0) {
            this.updateProgress('pacifist_3min', game.stats.pacifistTimer, game);
            // Easter egg: pacifist skin unlock at 3 min
            if (game.stats.pacifistTimer >= 180) {
                game.cheatCodeSystem?.discoverEgg('pacifist');
                game.skinSystem?.unlockSkin?.('peace_aura');
            }
        }
        // Speedrun lv10
        if (game.player?.level >= 10 && game.gameTime <= 60) {
            this.updateProgress('speedrun_lv10', 1, game);
        }
    }

    checkExplorationAchievements(game) {
        if (!game) return;
        // All cores crafted
        const coresOwned = game.cores ? Object.keys(game.cores).filter(k => game.cores[k]?.equipped || game.cores[k]?.owned).length : 0;
        this.updateProgress('all_cores', coresOwned, game);
        // All weapons crafted
        const weaponsOwned = game.weapons ? Object.keys(game.weapons).filter(k => game.weapons[k]?.equipped || game.weapons[k]?.owned).length : 0;
        this.updateProgress('all_weapons', weaponsOwned, game);
        // All stages unlocked
        const stagesUnlocked = game.stages ? Object.keys(game.stages).filter(k => game.stages[k]?.unlocked).length : 0;
        this.updateProgress('all_stages', stagesUnlocked, game);
        // All archetypes played
        const archetypesPlayed = game.stats?.archetypesPlayed?.length || 0;
        this.updateProgress('all_archetypes_run', archetypesPlayed, game);
    }

    getAchievementsList() {
        return Object.values(this.achievements);
    }

    getProgress() {
        const list = Object.values(this.achievements);
        const unlocked = list.filter(a => a.unlocked).length;
        return {
            unlocked,
            total: list.length,
            percentage: list.length ? Math.round((unlocked / list.length) * 100) : 0
        };
    }

    unlockAchievement(achievementId, tier, game) {
        const achievement = this.achievements[achievementId];
        if (!achievement) return;

        achievement.unlocked = true;
        achievement.tier = Math.max(achievement.tier || 0, tier);

        // Gem rewards per tier
        const gemRewards = achievement.gemReward || [5, 15, 50];
        const gemAmount = gemRewards[tier] || gemRewards[gemRewards.length - 1] || 5;
        if (game?.totalGems !== undefined) {
            game.totalGems += gemAmount;
        }

        const tierBadge = tier === 0 ? '🥉' : tier === 1 ? '🥈' : '🥇';
        const tierName = achievement.thresholds[tier] !== undefined ? ` (${achievement.thresholds[tier]})` : '';
        const notification = {
            type: 'achievement',
            text: `🏆 ${tierBadge} ${achievement.name}${tierName}: ${achievement.description} +${gemAmount}💎`,
            icon: achievement.icon,
            life: 300,
            color: tier === 2 ? '#ffd700' : tier === 1 ? '#c0c0c0' : '#cd7f32'
        };

        if (game?.notifications?.push) {
            game.notifications.push(notification);
        }
        game?.audio?.playAchievementUnlock?.();

        this.saveAchievements();
    }
}
