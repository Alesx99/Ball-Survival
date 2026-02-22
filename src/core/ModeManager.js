import { CONFIG } from '../config/index.js';
import { Boss } from '../entities/Boss.js';

export class ModeManager {
    constructor(game) {
        this.game = game;
    }

    update() {
        if (this.game.gameMode === 'daily') {
            this.checkDailyObjective();
        } else if (this.game.gameMode === 'bossRush') {
            this.handleBossRushLogic();
            this.checkBossRushVictory();
        }
    }

    checkDailyObjective() {
        if (!this.game.dailyChallengeSystem?.config?.objective) return;

        const obj = this.game.dailyChallengeSystem.config.objective;
        const timeElapsed = this.game.totalElapsedTime;

        // Controlla se il tempo limite è scaduto
        if (obj.timeLimit && timeElapsed >= obj.timeLimit) {
            if (obj.type === 'survival') {
                this.triggerDailyVictory();
            } else {
                this.triggerDailyDefeat();
            }
            return;
        }

        // Condizioni di vittoria anticipate
        if (obj.type === 'kills' && this.game.enemiesKilled >= obj.target) {
            this.triggerDailyVictory();
        } else if (obj.type === 'level' && this.game.player.level >= obj.target) {
            this.triggerDailyVictory();
        }
    }

    triggerDailyVictory() {
        if (this.game.state === 'gameOver') return;
        this.game.score += 5000;
        this.game.gemsThisRun += 1000;
        this.game.notifications.push({ text: '🏆 SFIDA GIORNALIERA COMPLETATA! +1000 Gemme', life: 300, color: '#FFD700' });

        const gameOverTitle = this.game.dom.popups.gameOver.querySelector('h2');
        if (gameOverTitle) gameOverTitle.textContent = "🏆 Sfida Completata!";

        this.game.gameOver();
    }

    triggerDailyDefeat() {
        if (this.game.state === 'gameOver') return;

        const gameOverTitle = this.game.dom.popups.gameOver.querySelector('h2');
        if (gameOverTitle) gameOverTitle.textContent = "❌ Sfida Fallita: Tempo Scaduto";

        this.game.gameOver();
    }

    handleBossRushLogic() {
        if (this.game.entities.bosses.length === 0 && !this.game._bossRushWaiting) {
            this.game._bossRushWaiting = true;
            setTimeout(() => {
                this.spawnBossRushBoss();
                this.game._bossRushWaiting = false;
            }, (CONFIG.bossRush?.spawnInterval || 5) * 1000);
        }
    }

    spawnBossRushBoss() {
        const cfg = CONFIG.bossRush || {};
        const base = CONFIG.boss?.base || { hp: 1500, speed: 1.8, radius: 45, damage: 35 };
        const k = this.game.bossesKilled;
        const hpPerKill = cfg.hpPerKill ?? 600;
        const damagePerKill = cfg.damagePerKill ?? 10;
        const speedFactor = cfg.speedFactorPerKill ?? 0.05;
        const drPerKill = cfg.drPerKill ?? 0.03;
        const drCap = cfg.drCap ?? 0.55;

        const stats = {
            ...base,
            hp: (base.hp + k * hpPerKill) * 1.5, // Base HP buff ridotto per Boss Rush
            damage: (base.damage || 35) + k * damagePerKill,
            speed: (base.speed || 1.8) * (1 + k * speedFactor),
            dr: Math.min(drCap, k * drPerKill)
        };
        stats.maxHp = stats.hp;

        const spawnOne = (offsetX = 0, offsetY = 0) => {
            const bossType = cfg.bossSequence?.[(this.game.bossesKilled) % (cfg.bossSequence?.length || 4)] || 'boss';
            const x = this.game.player.x + (Math.random() - 0.5) * 100 + offsetX;
            const y = this.game.player.y - 400 + offsetY;
            this.game.addEntity('bosses', new Boss(x, y, { ...stats }));
            this.game.notifications.push({ text: `BOSS RUSH: ${bossType} APPARSO!`, life: 200 });
        };

        spawnOne();
        const doubleFrom = (cfg.doubleBossFromWave ?? 5) - 1;
        if (k >= doubleFrom) {
            spawnOne(200, 80);
        }
    }

    checkBossRushVictory() {
        if (this.game.bossesKilled >= (CONFIG.bossRush?.victoryCount || 10)) {
            this.game.triggerVictory();
        }
    }
}
