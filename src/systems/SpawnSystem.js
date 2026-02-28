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
import { GroundPickup } from '../entities/GroundPickup.js';
import { poolManager } from '../utils/PoolManager.js';

export const SpawnSystem = {
    spawnEnemies() {
        if (this.gameMode === 'tutorial') return;
        if (this.gameMode === 'bossRush') {
            this.handleBossRushLogic();
            return;
        }
        /**
         * SISTEMA SPAWN NEMICI OTTIMIZZATO - VERSIONE 8.0
         * 
         * Spawn rate dinamico basato sul tempo di gioco.
         * Esteso per supportare sessioni 30+ minuti con nuovi stage e difficulty tiers.
         * Aggiunto: typed enemies con comportamenti unici.
         * 
         * Session time target: 15-25 min (media), 30+ min (esperti)
         */
        const timeInMinutes = this.totalElapsedTime / 60;

        // === WAVE-BASED SCALING ===
        const wavePeriod = 180;
        const phase = (this.totalElapsedTime % wavePeriod) / wavePeriod;
        const waveSine = Math.sin(phase * Math.PI * 2);

        // Base spawn interval
        let baseSpawnInterval = 1.2 * Math.exp(-0.06 * timeInMinutes);
        baseSpawnInterval = Math.max(0.25, baseSpawnInterval);

        let dynamicSpawnInterval = baseSpawnInterval * (1 - waveSine * 0.40);

        // ENDLESS MODE SCALING
        if (this.gameMode === 'endless' && timeInMinutes >= 30) {
            dynamicSpawnInterval = Math.max(0.08, 0.25 - (timeInMinutes - 30) * 0.012);
            dynamicSpawnInterval *= (1 - waveSine * 0.3);
        }

        // Curse scaling
        const curse = this.player.modifiers?.curse || 0;
        dynamicSpawnInterval /= (1 + curse);

        // Difficulty tier
        const activeTier = this._getActiveDifficultyTier();
        if (activeTier?.spawnMultiplier) {
            dynamicSpawnInterval /= activeTier.spawnMultiplier;
        }

        // Storm event: doubles spawn rate
        if (this._stormActive) {
            dynamicSpawnInterval /= (CONFIG.stormEvent?.spawnMultiplier || 2.0);
        }

        // Daily challenge modifiers
        if (this.gameMode === 'daily') {
            const dailyModId = this.dailyChallengeSystem?.config?.modifier?.id;
            if (dailyModId === 'horde' || dailyModId === 'tiny_trouble') {
                dynamicSpawnInterval *= 0.67;
            }
        }

        if (this.lastEnemySpawnTime && (this.totalElapsedTime - this.lastEnemySpawnTime < dynamicSpawnInterval)) return;
        this.lastEnemySpawnTime = this.totalElapsedTime;

        // Max enemies
        let baseMaxEnemies = 26 + Math.floor(timeInMinutes * 12);
        let waveMaxEnemiesMod = 1 + Math.max(0, waveSine * 0.50);
        let maxEnemies = Math.min(350, Math.floor(baseMaxEnemies * waveMaxEnemiesMod));
        maxEnemies = Math.floor(maxEnemies * (1 + curse));

        if (this.gameMode === 'endless' && timeInMinutes > 30) {
            maxEnemies = 300 + Math.floor((timeInMinutes - 30) * 12);
        }
        if (this.entities.enemies.length >= maxEnemies) return;

        // Batch size
        let batchSize = 3 + Math.floor(timeInMinutes / 4) + Math.floor(this.rng.next() * 3);
        if (waveSine > 0.5) batchSize = Math.floor(batchSize * 1.8);
        else if (waveSine < -0.5) batchSize = Math.max(1, Math.floor(batchSize * 0.5));

        if (this.gameMode === 'endless' && timeInMinutes > 30) {
            batchSize += Math.floor((timeInMinutes - 30) / 1.8);
        }
        batchSize = Math.floor(batchSize * (1 + curse));

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
            let rawFactor = timeFactor + levelFactor;

            // Smooth ramp: softer scaling for the first 15 minutes
            let combinedFactor = rawFactor < 75
                ? rawFactor * (0.5 + 0.5 * Math.min(1, rawFactor / 75))  // S-curve ramp
                : rawFactor;

            if (this.gameMode === 'endless' && timeInMinutes > 30) {
                const overload = timeInMinutes - 30;
                combinedFactor *= Math.pow(1.06, overload);
            }
            const scaling = CONFIG.enemies.scaling;

            let finalStats = {
                ...CONFIG.enemies.base,
                hp: Math.floor((CONFIG.enemies.base.hp + Math.floor(combinedFactor) * scaling.hpPerFactor) * (1 + curse)),
                speed: (CONFIG.enemies.base.speed + combinedFactor * scaling.speedPerFactor) * (1 + curse * 0.3),
                damage: CONFIG.enemies.base.damage + Math.floor(combinedFactor) * scaling.damagePerFactor,
                xp: Math.floor((CONFIG.enemies.base.xp + Math.floor(Math.pow(combinedFactor, scaling.xpPowerFactor) * scaling.xpPerFactor)) * (1 + curse)),
                dr: Math.min(0.75, combinedFactor * scaling.drPerFactor)
            };

            // Stage modifiers
            const stageInfo = CONFIG.stages[this.currentStage];
            if (stageInfo && stageInfo.difficulty) {
                finalStats.dr += stageInfo.difficulty.dr;
                finalStats.speed *= (1 + stageInfo.difficulty.speed);
            }

            if (stageInfo && stageInfo.effects) {
                finalStats.xp = Math.floor(finalStats.xp * stageInfo.effects.xpBonus);
            }

            // Difficulty tier bonuses
            if (activeTier) {
                finalStats.dr = Math.min(0.95, finalStats.dr + (activeTier.dr || 0));
                finalStats.speed *= (1 + (activeTier.speed || 0));
                if (activeTier.enemyRegen) {
                    finalStats.regen = activeTier.enemyRegen;
                }
            }

            // Storm speed boost
            if (this._stormActive && CONFIG.stormEvent) {
                finalStats.speed *= (CONFIG.stormEvent.speedMultiplier || 1.2);
            }

            // Elite spawn
            let eliteChance = 0.02 + Math.min(0.15, this.totalElapsedTime / 900);
            if (stageInfo && stageInfo.difficulty && stageInfo.difficulty.eliteChance) {
                eliteChance = stageInfo.difficulty.eliteChance * 0.8;
            }
            if (activeTier?.eliteChanceMultiplier) {
                eliteChance *= activeTier.eliteChanceMultiplier;
            }

            let isElite = false;
            if (this.totalElapsedTime > 180 && this.rng.next() < eliteChance) {
                finalStats.hp *= 5; finalStats.damage *= 2; finalStats.speed *= 0.8;
                finalStats.radius *= 1.5; finalStats.xp *= 5; finalStats.isElite = true;
                isElite = true;
            }

            // Champion spawn (from championChance in difficulty tier)
            let isChampion = false;
            if (!isElite && activeTier?.championChance && this.rng.next() < activeTier.championChance) {
                finalStats.hp *= 2; finalStats.damage *= 2;
                finalStats.xp *= 2; finalStats.isChampion = true;
                isChampion = true;
            }

            // === ENEMY TYPE SELECTION ===
            const selectedType = this._selectEnemyType(isElite, activeTier);
            if (selectedType) {
                const typeDef = CONFIG.enemies.enemyTypes[selectedType];
                if (typeDef) {
                    // Apply type multipliers to base stats
                    finalStats.hp = Math.floor(finalStats.hp * typeDef.hp);
                    finalStats.speed *= typeDef.speed;
                    finalStats.damage = Math.floor(finalStats.damage * typeDef.damage);
                    finalStats.radius = Math.floor(finalStats.radius * typeDef.radius);
                    finalStats.xp = Math.floor(finalStats.xp * typeDef.xp);
                    finalStats.color = typeDef.color;
                    finalStats.behavior = typeDef.behavior;
                    finalStats.type = selectedType;

                    // Copy behavior-specific properties
                    if (typeDef.prepTime) finalStats.prepTime = typeDef.prepTime;
                    if (typeDef.dashSpeed) finalStats.dashSpeed = typeDef.dashSpeed;
                    if (typeDef.dashDuration) finalStats.dashDuration = typeDef.dashDuration;
                    if (typeDef.orbitRadius) finalStats.orbitRadius = typeDef.orbitRadius;
                    if (typeDef.orbitSpeed) finalStats.orbitSpeed = typeDef.orbitSpeed;
                    if (typeDef.lungeTimer) finalStats.lungeTimer = typeDef.lungeTimer;
                    if (typeDef.splitCount) finalStats.splitCount = typeDef.splitCount;
                    if (typeDef.maxGeneration) finalStats.maxGeneration = typeDef.maxGeneration;
                    if (typeDef.explosionRadius) finalStats.explosionRadius = typeDef.explosionRadius;
                    if (typeDef.explosionDamage) {
                        finalStats.explosionDamage = Math.floor(typeDef.explosionDamage * (1 + combinedFactor * 0.1));
                    }
                    if (typeDef.range) finalStats.range = typeDef.range;
                    if (typeDef.shootCooldown) finalStats.shootCooldown = typeDef.shootCooldown;
                    if (typeDef.projectileSpeed) finalStats.projectileSpeed = typeDef.projectileSpeed;
                    if (typeDef.reviveRadius) finalStats.reviveRadius = typeDef.reviveRadius;
                    if (typeDef.reviveCooldown) finalStats.reviveCooldown = typeDef.reviveCooldown;
                    if (typeDef.maxRevives) finalStats.maxRevives = typeDef.maxRevives;
                    // Phase 2: Tank, Teleporter, Summoner
                    if (typeDef.bonusDr) finalStats.bonusDr = typeDef.bonusDr;
                    if (typeDef.knockbackForce) finalStats.knockbackForce = typeDef.knockbackForce;
                    if (typeDef.teleportCooldown) finalStats.teleportCooldown = typeDef.teleportCooldown;
                    if (typeDef.teleportDistance) finalStats.teleportDistance = typeDef.teleportDistance;
                    if (typeDef.summonCooldown) finalStats.summonCooldown = typeDef.summonCooldown;
                    if (typeDef.maxMinions) finalStats.maxMinions = typeDef.maxMinions;
                    if (typeDef.summonCount) finalStats.summonCount = typeDef.summonCount;
                }
            }

            // Daily challenge modifiers
            const dailyModId = this.gameMode === 'daily' ? this.dailyChallengeSystem?.config?.modifier?.id : null;
            if (this.gameMode === 'daily' && dailyModId) {
                if (dailyModId === 'horde') {
                    finalStats.hp = Math.max(1, Math.floor(finalStats.hp * 0.8));
                    finalStats.maxHp = finalStats.hp;
                } else if (dailyModId === 'giant_slayer') {
                    finalStats.hp = Math.floor(finalStats.hp * 1.5);
                    finalStats.radius *= 1.5;
                    finalStats.xp = Math.floor(finalStats.xp * 1.5);
                    finalStats.maxHp = finalStats.hp;
                } else if (dailyModId === 'tiny_trouble') {
                    finalStats.radius *= 0.5;
                }
            }

            finalStats.maxHp = finalStats.hp;

            // Sanitize
            for (const key of ['hp', 'speed', 'damage', 'xp', 'dr', 'maxHp', 'radius']) {
                if (!Number.isFinite(finalStats[key])) {
                    finalStats[key] = CONFIG.enemies.base[key] || 0;
                }
            }

            // Golden enemy
            if (!this._goldenSpawned && this.rng.next() < 0.001) {
                finalStats.isGolden = true;
                finalStats.hp *= 3;
                finalStats.xp *= 10;
                finalStats.color = '#ffd700';
                this._goldenSpawned = true;
            }

            if (!finalStats.type || finalStats.type === 'enemy') {
                finalStats.type = finalStats.isGolden ? 'golden' : finalStats.isElite ? 'elite' : 'enemy';
            }
            this.addEntity('enemies', poolManager.get('Enemy', () => new Enemy(spawnX, spawnY, finalStats)).init(spawnX, spawnY, finalStats));
        }

        // Easter egg: Golden Boss from cheat code
        if (this._spawnGoldenBoss) {
            this._spawnGoldenBoss = false;
            const gx = this.camera.x + this.camera.width / 2 + (this.rng.next() - 0.5) * 200;
            const gy = this.camera.y - 150;
            const gStats = { ...CONFIG.boss.base, hp: 2000, maxHp: 2000, speed: 1, damage: 15, radius: 40, dr: 0.3, isGolden: true, color: '#ffd700' };
            const gBoss = new Boss(gx, gy, gStats);
            gBoss._entryTimer = 90;
            gBoss._goldenReward = 120;
            this.addEntity('bosses', gBoss);
            this.audio?.playBossSpawn();
            this.addScreenShake?.(20);
            this.notifications.push({ text: '✨ UN BOSS DORATO È APPARSO! ✨', life: 400 });
        }
    },

    /**
     * Seleziona un tipo di nemico dalla spawnTable in base a tempo e stage.
     * Ritorna null se deve spawnare un nemico standard.
     */
    _selectEnemyType(isElite, activeTier) {
        if (!CONFIG.enemies.spawnTable) return null;

        const currentStage = parseInt(this.currentStage || '1');
        const availableTypes = CONFIG.enemies.spawnTable.filter(entry => {
            if (this.totalElapsedTime < entry.minTime) return false;
            if (currentStage < entry.minStage) return false;
            // Tier con allTypesUnlocked bypassa minTime/minStage
            if (activeTier?.allTypesUnlocked) return true;
            return true;
        });

        if (availableTypes.length === 0) return null;

        // 35% chance di spawnare un tipo speciale (cresce col tempo fino al 60%)
        const specialChance = Math.min(0.60, 0.35 + this.totalElapsedTime / 3600 * 0.25);
        if (this.rng.next() > specialChance) return null;

        // Elite enemies non sono typed (restano come erano)
        if (isElite) return null;

        // === Wave-type linking: picchi -> aggressivi, cali -> tattici ===
        const wavePeriod = 180;
        const phase = (this.totalElapsedTime % wavePeriod) / wavePeriod;
        const waveSine = Math.sin(phase * Math.PI * 2);

        let weightedTypes = availableTypes.map(e => ({ ...e }));
        if (waveSine > 0.5) {
            // Peak: boost dasher/bomber/tank weights
            weightedTypes.forEach(e => {
                if (e.type === 'dasher' || e.type === 'bomber' || e.type === 'tank') e.weight *= 1.8;
            });
        } else if (waveSine < -0.4) {
            // Valley: boost sniper/necromancer/summoner weights
            weightedTypes.forEach(e => {
                if (e.type === 'sniper' || e.type === 'necromancer' || e.type === 'summoner') e.weight *= 2.0;
            });
        }

        // Weighted random selection
        const totalWeight = weightedTypes.reduce((sum, e) => sum + e.weight, 0);
        let roll = this.rng.next() * totalWeight;
        for (const entry of weightedTypes) {
            roll -= entry.weight;
            if (roll <= 0) return entry.type;
        }
        return weightedTypes[weightedTypes.length - 1].type;
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
                boss._entryTimer = 90;
                this.addEntity('bosses', boss);
            }
            this.notifications.push({ text: bossCount > 1 ? "!!! BOSS GEMELLI SONO APPARSI !!!" : "!!! UN BOSS È APPARSO !!!", life: 300 });
            this.audio?.playBossSpawn();
            this.addScreenShake?.(15);
            this.enemiesKilledSinceBoss = 0;
        }
    },

    spawnChests() {
        if (this.gameMode === 'tutorial' || this.gameMode === 'bossRush') return;

        const maxChests = CONFIG.chest.maxMapChests || 1;
        if (this.entities.chests.length < maxChests && this.totalElapsedTime > this.nextChestSpawnTime) {
            const buffer = 200; let x, y, dist;
            let attempts = 0;
            do {
                x = this.rng.next() * (CONFIG.world.width - buffer * 2) + buffer;
                y = this.rng.next() * (CONFIG.world.height - buffer * 2) + buffer;
                dist = Utils.getDistance({ x, y }, this.player);
                attempts++;
            } while (dist < this.camera.width && attempts < 50);

            let rarity = 'normal';
            const roll = this.rng.next();
            const epicThreshold = 1.0 - (CONFIG.chest.legendaryChance || 0.03) - (CONFIG.chest.epicChance || 0.12);
            const legendaryThreshold = 1.0 - (CONFIG.chest.legendaryChance || 0.03);

            if (roll >= legendaryThreshold) {
                rarity = 'legendary';
            } else if (roll >= epicThreshold) {
                rarity = 'epic';
            }

            this.addEntity('chests', new Chest(x, y, rarity));

            if (rarity === 'legendary') {
                this.notifications.push({ text: "UN FORZIERE LEGGENDARIO È APPARSO!", life: 300, color: '#f1c40f' });
            } else if (rarity === 'epic') {
                this.notifications.push({ text: "Un Forziere Epico è nelle vicinanze.", life: 250, color: '#9b59b6' });
            }

            this.nextChestSpawnTime = this.totalElapsedTime + CONFIG.chest.respawnTime;
        }
    },

    triggerChestAlarm(x, y, rarity) {
        if (rarity === 'normal') return;

        const count = rarity === 'legendary' ? 12 : 6;
        const radius = 250;
        this.notifications.push({ text: "TRAPPOLA DEL FORZIERE ATTIVATA!", life: 200, color: '#e74c3c' });

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const spawnX = x + Math.cos(angle) * radius;
            const spawnY = y + Math.sin(angle) * radius;

            const timeFactor = this.totalElapsedTime / 50;
            if (rarity === 'legendary' && i % 4 === 0) {
                const stats = { ...CONFIG.boss.base, hp: 1500 + timeFactor * 500, speed: 1.5, type: 'golem_boss' };
                stats.maxHp = stats.hp;
                this.addEntity('bosses', new Boss(spawnX, spawnY, stats));
            } else {
                const stats = { ...CONFIG.enemies.base, hp: CONFIG.enemies.base.hp * 8, damage: CONFIG.enemies.base.damage * 2, speed: CONFIG.enemies.base.speed * 0.9, radius: 25, xp: 50, isElite: true, type: 'elite' };
                this.addEntity('enemies', new Enemy(spawnX, spawnY, stats));
            }
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
    },

    spawnDynamicEvents() {
        if (this.gameMode === 'tutorial' || this.gameMode === 'bossRush') return;

        // === STORM EVENTS ===
        this._updateStormEvent();

        // === ANOMALOUS AREA EVENTS ===
        this._lastEventSpawnTime = this._lastEventSpawnTime || 0;
        const eventInterval = (5 + this.rng.next() * 3) * 60;

        if (this._lastEventSpawnTime === 0 && this.totalElapsedTime < 3 * 60) {
            return;
        }

        if (this.totalElapsedTime - this._lastEventSpawnTime > eventInterval) {
            this._lastEventSpawnTime = this.totalElapsedTime;

            if (this.entities.anomalousAreas && this.entities.anomalousAreas.length >= 1) return;

            const isKillEvent = this.rng.next() > 0.5;
            const eventType = isKillEvent ? 'kill' : 'survive';

            const angle = this.rng.next() * Math.PI * 2;
            const distance = 400 + this.rng.next() * 300;
            const x = this.player.x + Math.cos(angle) * distance;
            const y = this.player.y + Math.sin(angle) * distance;

            const maxProgress = isKillEvent ? 20 + Math.floor(this.totalElapsedTime / 60) : 60 * 60;
            const duration = isKillEvent ? 120 * 60 : 70 * 60;

            const { AnomalousArea } = this._entityClasses;
            this.addEntity('anomalousAreas', new AnomalousArea(x, y, {
                radius: 180,
                duration: duration,
                eventType: eventType,
                maxProgress: maxProgress,
                reward: 'epic_chest',
                color: isKillEvent ? '#ff4444' : '#4444ff'
            }));

            if (this.notifications) {
                this.notifications.push({ text: "ANOMALIA RILEVATA NEI PARAGGI!", life: 250, color: '#ff00ff' });
            }
        }
    },

    /** Storm Event System */
    _updateStormEvent() {
        const stormConfig = CONFIG.stormEvent;
        if (!stormConfig) return;

        // Initialize storm state
        if (this._stormNextTime === undefined) {
            this._stormNextTime = stormConfig.minTime;
            this._stormActive = false;
            this._stormTimer = 0;
            this._stormXpBonusTimer = 0;
        }

        // Post-storm XP bonus
        if (this._stormXpBonusTimer > 0) {
            this._stormXpBonusTimer--;
            if (this._stormXpBonusTimer === 0 && this.notifications) {
                this.notifications.push({ text: "⚡ Bonus XP terminato", life: 120, color: '#888888' });
            }
        }

        // Active storm
        if (this._stormActive) {
            this._stormTimer--;
            if (this._stormTimer <= 0) {
                // Storm ends
                this._stormActive = false;
                this._stormXpBonusTimer = stormConfig.xpBonusDuration || 900;
                const interval = stormConfig.interval;
                this._stormNextTime = this.totalElapsedTime + interval[0] + this.rng.next() * (interval[1] - interval[0]);
                if (this.notifications) {
                    this.notifications.push({ text: "🌟 Tempesta conclusa! Bonus XP ×1.5 per 15s!", life: 300, color: '#00ff88' });
                }
            }
            return;
        }

        // Check if it's time for a new storm
        if (this.totalElapsedTime >= this._stormNextTime) {
            this._stormActive = true;
            const duration = stormConfig.duration;
            this._stormTimer = Math.floor(duration[0] + this.rng.next() * (duration[1] - duration[0]));
            if (this.notifications) {
                this.notifications.push({ text: "⚡ TEMPESTA IN ARRIVO! ⚡", life: 250, color: '#ffcc00' });
            }
            this.addScreenShake?.(10);
        }
    },

    /** Ground Pickup Spawner */
    spawnGroundPickups() {
        if (this.gameMode === 'tutorial' || this.gameMode === 'bossRush') return;

        const pickupConfig = CONFIG.groundPickups;
        if (!pickupConfig) return;

        // Initialize pickup list if not present
        if (!this.entities.groundPickups) {
            this.entities.groundPickups = [];
        }

        // Initialize next spawn time
        if (this._nextPickupSpawnTime === undefined) {
            this._nextPickupSpawnTime = 60; // First pickup after 1 minute
        }

        // Update existing pickups
        for (let i = this.entities.groundPickups.length - 1; i >= 0; i--) {
            const pickup = this.entities.groundPickups[i];
            pickup.update(this);
            if (pickup.toRemove) {
                this.entities.groundPickups.splice(i, 1);
            }
        }

        // Spawn new pickup
        if (this.totalElapsedTime >= this._nextPickupSpawnTime && this.entities.groundPickups.length < pickupConfig.maxOnMap) {
            const typeKeys = Object.keys(pickupConfig.types);
            const selectedType = typeKeys[Math.floor(this.rng.next() * typeKeys.length)];

            // Spawn near player but not too close
            const angle = this.rng.next() * Math.PI * 2;
            const distance = 200 + this.rng.next() * 400;
            let px = this.player.x + Math.cos(angle) * distance;
            let py = this.player.y + Math.sin(angle) * distance;
            px = Math.max(50, Math.min(CONFIG.world.width - 50, px));
            py = Math.max(50, Math.min(CONFIG.world.height - 50, py));

            this.entities.groundPickups.push(new GroundPickup(px, py, selectedType));

            const typeDef = pickupConfig.types[selectedType];
            if (this.notifications) {
                this.notifications.push({
                    text: `✨ ${typeDef.name} apparso nelle vicinanze!`,
                    life: 180,
                    color: typeDef.color
                });
            }

            // Set next spawn time
            const interval = pickupConfig.spawnInterval;
            this._nextPickupSpawnTime = this.totalElapsedTime + interval[0] + this.rng.next() * (interval[1] - interval[0]);
        }
    }
};
