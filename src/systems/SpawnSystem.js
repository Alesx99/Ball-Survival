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
        /**
         * SISTEMA SPAWN NEMICI OTTIMIZZATO - VERSIONE 5.3
         * 
         * PROBLEMA RISOLTO: Troppi nemici all'inizio causavano session time brevi
         * - Spawn rate: 4/sec (troppo veloce) → 0.5-1.67/sec (graduale)
         * - Batch size: 3-6 fisso → 1-6 dinamico basato sul tempo
         * - Max enemies: 100+ veloce → 20-200 graduale
         * - Elite spawn: 1 minuto → 3 minuti (più tempo per imparare)
         * 
         * EFFETTI ATTESI:
         * - Primi 5 min: -83% spawn rate, -70% nemici totali
         * - Pressione iniziale ridotta dell'80%
         * - Retention target >95% nei primi 5 minuti
         * - Session time target 18-22 minuti
         */
        // Spawn interval dinamico per versione 5.3
        const timeInMinutes = this.totalElapsedTime / 60;
        let dynamicSpawnInterval = CONFIG.enemies.spawnInterval;
        
        // Rallenta lo spawn all'inizio ma con pressione sufficiente, accelera gradualmente
        if (timeInMinutes < 2) {
            dynamicSpawnInterval = 1.4; // 1.4 secondi primi 2 min (prima 2.0 - troppo facile)
        } else if (timeInMinutes < 5) {
            dynamicSpawnInterval = 1.5; // 1.5 secondi 2-5 min
        } else if (timeInMinutes < 10) {
            dynamicSpawnInterval = 1.0; // 1 secondo 5-10 min
        } else if (timeInMinutes < 15) {
            dynamicSpawnInterval = 0.8; // 0.8 secondi 10-15 min
        } else {
            dynamicSpawnInterval = 0.6; // 0.6 secondi dopo 15 min
        }
        
        if (this.lastEnemySpawnTime && (this.totalElapsedTime - this.lastEnemySpawnTime < dynamicSpawnInterval)) return;
        this.lastEnemySpawnTime = this.totalElapsedTime;
        
        // Curva di spawn graduale per versione 5.3
        const maxEnemies = Math.min(200, 20 + Math.floor(timeInMinutes * 8)); // Più graduale
        if (this.entities.enemies.length >= maxEnemies) return;
        
        // Batch size dinamico basato sul tempo
        let batchSize;
        if (timeInMinutes < 2) {
            batchSize = 2 + Math.floor(Math.random() * 2); // 2-3 nemici primi 2 min (prima 1-2)
        } else if (timeInMinutes < 5) {
            batchSize = 2 + Math.floor(Math.random() * 2); // 2-3 nemici 2-5 min
        } else if (timeInMinutes < 10) {
            batchSize = 2 + Math.floor(Math.random() * 3); // 2-4 nemici 5-10 min
        } else if (timeInMinutes < 15) {
            batchSize = 3 + Math.floor(Math.random() * 3); // 3-5 nemici 10-15 min
        } else {
            batchSize = 3 + Math.floor(Math.random() * 4); // 3-6 nemici dopo 15 min
        }

        for (let i = 0; i < batchSize; i++) {
            if (this.entities.enemies.length >= maxEnemies) break;

            const side = Math.floor(Math.random() * 4);
            let x, y; const buffer = 80; 
            switch (side) {
                case 0: x = this.camera.x + Math.random() * this.camera.width; y = this.camera.y - buffer; break;
                case 1: x = this.camera.x + this.camera.width + buffer; y = this.camera.y + Math.random() * this.camera.height; break;
                case 2: x = this.camera.x + Math.random() * this.camera.width; y = this.camera.y + this.camera.height + buffer; break;
                case 3: x = this.camera.x - buffer; y = this.camera.y + Math.random() * this.camera.height; break;
            }

            let spawnX = x + (Math.random() - 0.5) * 60;
            let spawnY = y + (Math.random() - 0.5) * 60;

            const timeFactor = this.totalElapsedTime / CONFIG.enemies.scaling.timeFactor;
            const levelFactor = this.player.level * CONFIG.enemies.scaling.levelFactorMultiplier;
            const combinedFactor = timeFactor + levelFactor;
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
            
            // Elite spawn graduale per versione 5.3
            let eliteChance = 0.02 + Math.min(0.15, this.totalElapsedTime / 900); // Più graduale
            if (stageInfo && stageInfo.difficulty && stageInfo.difficulty.eliteChance) {
                eliteChance = stageInfo.difficulty.eliteChance * 0.8; // Riduce elite chance del 20%
            }

            // Elite spawn solo dopo 3 minuti invece di 1 minuto
            if (this.totalElapsedTime > 180 && Math.random() < eliteChance) {
                finalStats.hp *= 5; finalStats.damage *= 2; finalStats.speed *= 0.8;
                finalStats.radius *= 1.5; finalStats.xp *= 5; finalStats.isElite = true;
            }

            finalStats.maxHp = finalStats.hp; 
            this.addEntity('enemies', new Enemy(spawnX, spawnY, finalStats));
        }
    },

    spawnBoss() {
        if (this.entities.bosses.length === 0 && this.enemiesKilledSinceBoss >= CONFIG.boss.spawnThreshold) {
            const side = Math.floor(Math.random() * 4); let x, y; const buffer = 100;
            switch (side) {
                case 0: x = this.camera.x + Math.random() * this.camera.width; y = this.camera.y - buffer; break;
                case 1: x = this.camera.x + this.camera.width + buffer; y = this.camera.y + Math.random() * this.camera.height; break;
                case 2: x = this.camera.x + Math.random() * this.camera.width; y = this.camera.y + this.camera.height + buffer; break;
                case 3: x = this.camera.x - buffer; y = this.camera.y + Math.random() * this.camera.height; break;
            }
            const timeFactor = this.totalElapsedTime / CONFIG.boss.scaling.timeFactor;
            const stats = { ...CONFIG.boss.base, hp: CONFIG.boss.base.hp + timeFactor * CONFIG.boss.scaling.hpPerFactor, dr: Math.min(0.5, timeFactor * 0.01) };
            stats.maxHp = stats.hp; 
            const boss = new Boss(x, y, stats);
            this.addEntity('bosses', boss);
            this.notifications.push({ text: "!!! UN BOSS È APPARSO !!!", life: 300 }); 
            this.enemiesKilledSinceBoss = 0;
        }
    },

    spawnChests() {
        if (this.entities.chests.length === 0 && this.totalElapsedTime > this.nextChestSpawnTime) {
            const buffer = 200; let x, y, dist;
            do { x = Math.random() * (CONFIG.world.width - buffer * 2) + buffer; y = Math.random() * (CONFIG.world.height - buffer * 2) + buffer; dist = Utils.getDistance({ x, y }, this.player); }
            while (dist < this.camera.width);
            this.addEntity('chests', new Chest(x,y));
            this.nextChestSpawnTime = this.totalElapsedTime + CONFIG.chest.respawnTime;
        }
    },

    spawnMapXpOrbs() {
        const c = CONFIG.xpOrbs.mapSpawn;
        if (this.totalElapsedTime > this.nextMapXpSpawnTime) {
            if (this.entities.xpOrbs.length < c.max - c.batch) {
                const clusterCenterX = Math.random() * CONFIG.world.width; const clusterCenterY = Math.random() * CONFIG.world.height;
                for (let i = 0; i < c.batch; i++) {
                    const x = clusterCenterX + (Math.random() - 0.5) * 400; const y = clusterCenterY + (Math.random() - 0.5) * 400;
                    const finalX = Math.max(0, Math.min(CONFIG.world.width - 1, x)); const finalY = Math.max(0, Math.min(CONFIG.world.height - 1, y));
                    this.addEntity('xpOrbs', new XpOrb(finalX, finalY, c.value));
                }
            }
            this.nextMapXpSpawnTime = this.totalElapsedTime + c.interval;
        }
    }
};
