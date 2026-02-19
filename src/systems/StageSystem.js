/**
 * StageSystem - Mixin for stage progression, unlocks, and persistence
 * @module systems/StageSystem
 */

import { CONFIG } from '../config/index.js';
import { Particle } from '../entities/Particles.js';

export const StageSystem = {
    checkStage() {
        // Controlla solo se gli stage possono essere sbloccati
        this.checkStageUnlocks();
    },

    changeStage(newStage) {
        this.currentStage = newStage;
        this.stageStartTime = this.totalElapsedTime;
        this.bossesKilledThisStage = 0;
        this.elitesKilledThisStage = 0;
        this.audio?.setStageTone?.(newStage);

        const stageInfo = CONFIG.stages[newStage];
        this.notifications.push({ text: `STAGE ${newStage}: ${stageInfo.message}`, life: 400 });

        // Effetto visivo di transizione
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.addEntity('particles', new Particle(
                    Math.random() * CONFIG.world.width,
                    Math.random() * CONFIG.world.height,
                    { vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, life: 60, color: stageInfo.background.color }
                ));
            }, i * 50);
        }
    },

    checkStageUnlocks() {
        Object.keys(CONFIG.stages).forEach(stageId => {
            const stage = CONFIG.stages[stageId];
            if (!stage.unlocked && stage.unlockRequirement) {
                if (this.checkUnlockRequirement(stage.unlockRequirement)) {
                    stage.unlocked = true;
                    this.notifications.push({
                        text: `🎉 NUOVO STAGE SBLOCCATO: ${stage.name}!`,
                        life: 500
                    });
                    this.saveStageProgress();
                }
            }
        });
    },

    checkUnlockRequirement(requirement) {
        switch (requirement.type) {
            case 'craft_core':
                return this.cores[requirement.coreId] !== undefined;

            case 'craft_weapon':
                return this.weapons[requirement.weaponId] !== undefined;

            case 'kill_elites':
                if (this.currentStage.toString() === requirement.stage.toString()) {
                    return this.elitesKilledThisStage >= requirement.count;
                }
                return false;

            case 'reach_level':
                return this.player.level >= requirement.level;

            case 'arsenal_size':
                const coreCount = Object.keys(this.cores).length;
                const weaponCount = Object.keys(this.weapons).length;
                return coreCount >= requirement.cores && weaponCount >= requirement.weapons;

            case 'survival':
                // Sopravvivi X secondi, opzionalmente in uno stage specifico
                if (requirement.stage) {
                    return this.currentStage.toString() === requirement.stage.toString() && this.totalElapsedTime >= requirement.time;
                }
                return this.totalElapsedTime >= requirement.time;

            case 'boss_kill':
                return this.bossesKilledThisStage >= requirement.count;

            case 'boss_kill_total':
                // Controlla boss totali uccisi (persistente)
                const totalBossKills = parseInt(localStorage.getItem('ballSurvivalTotalBossKills') || '0');
                return totalBossKills >= requirement.count;

            case 'total_time':
                return this.totalElapsedTime >= requirement.time;

            default:
                return false;
        }
    },

    saveStageProgress() {
        try {
            const stageProgress = {};
            Object.keys(CONFIG.stages).forEach(stageId => {
                stageProgress[stageId] = CONFIG.stages[stageId].unlocked;
            });
            localStorage.setItem('ballSurvivalStageProgress', JSON.stringify(stageProgress));
        } catch (e) {
            console.error("Impossibile salvare la progressione degli stage:", e);
        }
    },

    loadStageProgress() {
        try {
            const savedProgress = localStorage.getItem('ballSurvivalStageProgress');
            if (savedProgress) {
                const stageProgress = JSON.parse(savedProgress);
                Object.keys(stageProgress).forEach(stageId => {
                    if (CONFIG.stages[stageId]) {
                        CONFIG.stages[stageId].unlocked = stageProgress[stageId];
                    }
                });
            }
        } catch (e) {
            console.error("Impossibile caricare la progressione degli stage:", e);
        }
    }
};
