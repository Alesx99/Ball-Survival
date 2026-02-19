/**
 * SpawnSystem - Mixin for enemy, boss, chest, and XP orb spawning
 * @module systems/SpawnSystem
 */

import { CONFIG } from '../config/index.js';
import { Utils } from '../utils/index.js';
import { Enemy } from '../entities/Enemy.js';
import { Boss } from '../entities/Boss.js';
import { Chest } from '../entities/Items.js';
import { XpOrb } from '../entities/Orbs.js';

export const SpawnSystem = {
    spawnEnemies() {
        if (this.gameMode === 'tutorial') return;
        if (this.gameMode === 'bossRush') {
            this.handleBossRushLogic();
            return;
        }
        /**
         * SISTEMA SPAWN NEMICI OTTIMIZZATO - VERSIONE 7.0
         * 
         * Spawn rate dinamico basato sul tempo di gioco.
         * Esteso per supportare sessioni 30+ minuti con nuovi stage e difficulty tiers.
         * 
         * Session time target: 15-25 min (media), 30+ min (esperti)
         */
        const timeInMinutes = this.totalElapsedTime / 60;
        let dynamicSpawnInterval = CONFIG.enemies.spawnInterval;

        // Spawn interval dinamico — accelera gradualmente
        if (timeInMinutes < 2) {
            dynamicSpawnInterval = 1.4;
        } else if (timeInMinutes < 5) {
            dynamicSpawnInterval = 1.5;
        } else if (timeInMinutes < 10) {
            dynamicSpawnInterval = 1.0;
        } else if (timeInMinutes < 15) {
            dynamicSpawnInterval = 0.8;
        } else if (timeInMinutes < 20) {
            dynamicSpawnInterval = 0.6;
        } else if (timeInMinutes < 25) {
            dynamicSpawnInterval = 0.5;
        } else if (timeInMinutes < 30) {
            dynamicSpawnInterval = 0.4;
        } else {
            dynamicSpawnInterval = 0.3; // Apocalisse
        }

        // ENDLESS MODE SCALING
        if (this.gameMode === 'endless' && timeInMinutes >= 30) {
            // Cap minimum interval but keep increasing spawn count via batch size
            dynamicSpawnInterval = Math.max(0.1, 0.3 - (timeInMinutes - 30) * 0.01);
        }

        // Applica spawnMultiplier da difficulty tier attivo
        const activeTier = this._getActiveDifficultyTier();
        if (activeTier?.spawnMultiplier) {
            dynamicSpawnInterval /= activeTier.spawnMultiplier;
        }

        // Daily challenge modifiers: spawn rate
        const dailyModId = this.dailyChallengeSystem?.config?.modifier?.id;
        if (dailyModId === 'horde' || dailyModId === 'tiny_trouble') {
            dynamicSpawnInterval *= 0.67; // +50% spawn rate
        }

        if (this.lastEnemySpawnTime && (this.totalElapsedTime - this.lastEnemySpawnTime < dynamicSpawnInterval)) return;
        this.lastEnemySpawnTime = this.totalElapsedTime;

        // Max enemies — scala fino a 300
        // Max enemies — scala fino a 300
        let maxEnemies = Math.min(300, 20 + Math.floor(timeInMinutes * 8));

        // Endless mode: cap increases +10 per minute after 30m
        if (this.gameMode === 'endless' && timeInMinutes > 30) {
            maxEnemies = 300 + Math.floor((timeInMinutes - 30) * 10);
        }
        if (this.entities.enemies.length >= maxEnemies) return;

        // Batch size dinamico
        let batchSize;
        if (timeInMinutes < 2) {
            batchSize = 2 + Math.floor(Math.random() * 2);     // 2-3
        } else if (timeInMinutes < 5) {
            batchSize = 2 + Math.floor(Math.random() * 2);     // 2-3
        } else if (timeInMinutes < 10) {
            batchSize = 2 + Math.floor(Math.random() * 3);     // 2-4
        } else if (timeInMinutes < 15) {
            batchSize = 3 + Math.floor(Math.random() * 3);     // 3-5
        } else if (timeInMinutes < 20) {
            batchSize = 3 + Math.floor(Math.random() * 4);     // 3-6
        } else if (timeInMinutes < 25) {
            batchSize = 4 + Math.floor(Math.random() * 4);     // 4-7
        } else if (timeInMinutes < 30) {
            batchSize = 5 + Math.floor(Math.random() * 4);     // 5-8
        } else {
            batchSize = 6 + Math.floor(this.rng.next() * 5);     // 6-10
        }

        // Endless mode batch size scaling
        if (this.gameMode === 'endless' && timeInMinutes > 30) {
            batchSize += Math.floor((timeInMinutes - 30) / 2);
        }

        for (let i = 0; i < batchSize; i++) {
            if (this.entities.enemies.length >= maxEnemies) break;

            const side = Math.floor(this.rng.next() * 4);
            let x, y; const buffer = 80;
            switch (side) {
                case 0: x = this.camera.x + this.rng.next() * this.camera.width; y = this.camera.y - buffer; break;
                case 1: x = this.camera.x + this.camera.width + buffer; y = this.camera.y + this.rng.next() * this.camera.height; break;
                case 2: x = this.camera.x + this.rng.next() * this.camera.width; y = this.camera.y + this.camera.height + buffer; break;
                case 3: x = this.camera.x - buffer; y = this.camera.y + this.rng.next() * this.camera.height; break;
            }

            let spawnX = x + (this.rng.next() - 0.5) * 60;
            let spawnY = y + (this.rng.next() - 0.5) * 60;

            const timeFactor = this.totalElapsedTime / CONFIG.enemies.scaling.timeFactor;
            const levelFactor = this.player.level * CONFIG.enemies.scaling.levelFactorMultiplier;
            let combinedFactor = timeFactor + levelFactor;

            // Endless mode exponential scaling after 30 mins
            if (this.gameMode === 'endless' && timeInMinutes > 30) {
                const overload = timeInMinutes - 30;
                // Exponential growth: 1.05^overload
                combinedFactor *= Math.pow(1.05, overload);
            }
            const scaling = CONFIG.enemies.scaling;

            let finalStats = {
                ...CONFIG.enemies.base,
                hp: CONFIG.enemies.base.hp + Math.floor(combinedFactor) * scaling.hpPerFactor,
                speed: CONFIG.enemies.base.speed + combinedFactor * scaling.speedPerFactor,
                damage: CONFIG.enemies.base.damage + Math.floor(combinedFactor) * scaling.damagePerFactor,
                xp: CONFIG.enemies.base.xp + Math.floor(Math.pow(combinedFactor, scaling.xpPowerFactor) * scaling.xpPerFactor),
                dr: Math.min(0.75, combinedFactor * scaling.drPerFactor)
            };

            // Applica le proprietà dello stage corrente
            const stageInfo = CONFIG.stages[this.currentStage];
            if (stageInfo && stageInfo.difficulty) {
                finalStats.dr += stageInfo.difficulty.dr;
                finalStats.speed *= (1 + stageInfo.difficulty.speed);
            }

            // Applica i bonus degli stage
            if (stageInfo && stageInfo.effects) {
                finalStats.xp = Math.floor(finalStats.xp * stageInfo.effects.xpBonus);
            }

            // Applica difficulty tier DR e speed bonus
            if (activeTier) {
                finalStats.dr = Math.min(0.95, finalStats.dr + (activeTier.dr || 0));
                finalStats.speed *= (1 + (activeTier.speed || 0));
                // Nemici che si rigenerano (tier 4+)
                if (activeTier.enemyRegen) {
                    finalStats.regen = activeTier.enemyRegen;
                }
            }

            // Elite spawn graduale
            let eliteChance = 0.02 + Math.min(0.15, this.totalElapsedTime / 900);
            if (stageInfo && stageInfo.difficulty && stageInfo.difficulty.eliteChance) {
                eliteChance = stageInfo.difficulty.eliteChance * 0.8;
            }
            // Applica eliteChanceMultiplier da difficulty tier
            if (activeTier?.eliteChanceMultiplier) {
                eliteChance *= activeTier.eliteChanceMultiplier;
            }

            // Elite spawn solo dopo 3 minuti
            if (this.totalElapsedTime > 180 && this.rng.next() < eliteChance) {
                finalStats.hp *= 5; finalStats.damage *= 2; finalStats.speed *= 0.8;
                finalStats.radius *= 1.5; finalStats.xp *= 5; finalStats.isElite = true;
            }

            finalStats.maxHp = finalStats.hp;

            // Daily challenge modifiers: nemici HP/size/XP
            if (dailyModId === 'horde') {
                finalStats.hp *= 0.8;
                finalStats.maxHp = finalStats.hp;
            } else if (dailyModId === 'giant_slayer') {
                finalStats.hp *= 1.5;
                finalStats.radius *= 1.5;
                finalStats.xp *= 1.5;
                finalStats.maxHp = finalStats.hp;
            } else if (dailyModId === 'tiny_trouble') {
                finalStats.radius *= 0.5;
            }

            // Sanitize: previeni NaN che corromperebbe il sistema XP
            for (const key of ['hp', 'speed', 'damage', 'xp', 'dr', 'maxHp', 'radius']) {
                if (!Number.isFinite(finalStats[key])) {
                    finalStats[key] = CONFIG.enemies.base[key] || 0;
                }
            }

            // Easter egg: Golden enemy (0.1% chance, once per run)
            if (!this._goldenSpawned && this.rng.next() < 0.001) {
                finalStats.isGolden = true;
                finalStats.hp *= 3;
                finalStats.xp *= 10;
                finalStats.color = '#ffd700';
                this._goldenSpawned = true;
            }

            finalStats.type = finalStats.isGolden ? 'golden' : finalStats.isElite ? 'elite' : 'enemy';
            this.addEntity('enemies', new Enemy(spawnX, spawnY, finalStats));
        }

        // Easter egg: Golden Boss from cheat code
        if (this._spawnGoldenBoss) {
            this._spawnGoldenBoss = false;
            const gx = this.camera.x + this.camera.width / 2 + (this.rng.next() - 0.5) * 200;
            const gy = this.camera.y - 150;
            const gStats = { ...CONFIG.boss.base, hp: 2000, maxHp: 2000, speed: 1, damage: 15, radius: 40, dr: 0.3, isGolden: true, color: '#ffd700' };
            const gBoss = new Boss(gx, gy, gStats);
            gBoss._entryTimer = 90;
            gBoss._goldenReward = 500;
            this.addEntity('bosses', gBoss);
            this.audio?.playBossSpawn();
            this.addScreenShake?.(20);
            this.notifications.push({ text: '✨ UN BOSS DORATO È APPARSO! ✨', life: 400 });
        }
    },

    /** Restituisce il difficulty tier attivo più alto, o null */
    _getActiveDifficultyTier() {
        let activeTier = null;
        for (const [, tier] of Object.entries(CONFIG.difficultyTiers)) {
            if (this.totalElapsedTime >= tier.time) {
                if (!activeTier || tier.time > activeTier.time) {
                    activeTier = tier;
                }
            }
        }
        return activeTier;
    },

    spawnBoss() {
        if (this.gameMode === 'bossRush') return;
        if (this.entities.bosses.length === 0 && this.enemiesKilledSinceBoss >= CONFIG.boss.spawnThreshold) {
            const stageLevel = parseInt(this.currentStage || '1');
            const stageMultiplier = stageLevel - 1;
            const timeFactor = this.totalElapsedTime / CONFIG.boss.scaling.timeFactor;

            // Twin boss dal difficulty tier 5
            const activeTier = this._getActiveDifficultyTier?.() || null;
            const bossCount = activeTier?.twinBoss ? 2 : 1;

            for (let b = 0; b < bossCount; b++) {
                const side = Math.floor(this.rng.next() * 4); let x, y; const buffer = 100;
                switch (side) {
                    case 0: x = this.camera.x + this.rng.next() * this.camera.width; y = this.camera.y - buffer; break;
                    case 1: x = this.camera.x + this.camera.width + buffer; y = this.camera.y + this.rng.next() * this.camera.height; break;
                    case 2: x = this.camera.x + this.rng.next() * this.camera.width; y = this.camera.y + this.camera.height + buffer; break;
                    case 3: x = this.camera.x - buffer; y = this.camera.y + this.rng.next() * this.camera.height; break;
                }
                const stats = {
                    ...CONFIG.boss.base,
                    hp: CONFIG.boss.base.hp + timeFactor * CONFIG.boss.scaling.hpPerFactor + stageMultiplier * 500,
                    speed: CONFIG.boss.base.speed + stageLevel * 0.1,
                    damage: CONFIG.boss.base.damage + stageLevel * 8,
                    radius: CONFIG.boss.base.radius + stageLevel * 3,
                    dr: Math.min(0.60, timeFactor * 0.01 + stageMultiplier * 0.03)
                };
                stats.maxHp = stats.hp;
                const boss = new Boss(x, y, stats);
                boss._entryTimer = 90; // 1.5s entry animation
                this.addEntity('bosses', boss);
            }
            this.notifications.push({ text: bossCount > 1 ? "!!! BOSS GEMELLI SONO APPARSI !!!" : "!!! UN BOSS È APPARSO !!!", life: 300 });
            this.audio?.playBossSpawn();
            this.addScreenShake?.(15);
            this.enemiesKilledSinceBoss = 0;
        }
    },

    spawnChests() {
        if (this.entities.chests.length === 0 && this.totalElapsedTime > this.nextChestSpawnTime) {
            const buffer = 200; let x, y, dist;
            do { x = this.rng.next() * (CONFIG.world.width - buffer * 2) + buffer; y = this.rng.next() * (CONFIG.world.height - buffer * 2) + buffer; dist = Utils.getDistance({ x, y }, this.player); }
            while (dist < this.camera.width);
            this.addEntity('chests', new Chest(x, y));
            this.nextChestSpawnTime = this.totalElapsedTime + CONFIG.chest.respawnTime;
        }
    },

    spawnMapXpOrbs() {
        const c = CONFIG.xpOrbs.mapSpawn;
        if (this.totalElapsedTime > this.nextMapXpSpawnTime) {
            if (this.entities.xpOrbs.length < c.max - c.batch) {
                const clusterCenterX = this.rng.next() * CONFIG.world.width; const clusterCenterY = this.rng.next() * CONFIG.world.height;
                for (let i = 0; i < c.batch; i++) {
                    const x = clusterCenterX + (this.rng.next() - 0.5) * 400; const y = clusterCenterY + (this.rng.next() - 0.5) * 400;
                    const finalX = Math.max(0, Math.min(CONFIG.world.width - 1, x)); const finalY = Math.max(0, Math.min(CONFIG.world.height - 1, y));
                    this.addEntity('xpOrbs', new XpOrb(finalX, finalY, c.value));
                }
            }
            this.nextMapXpSpawnTime = this.totalElapsedTime + c.interval;
        }
    }
};
