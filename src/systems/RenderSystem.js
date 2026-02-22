import { CONFIG } from '../config/index.js';
import { Utils } from '../utils/index.js';
import { EnvironmentRenderer } from './EnvironmentRenderer.js';
import { HUDRenderer } from './HUDRenderer.js';

export const RenderSystem = {
    ...EnvironmentRenderer,
    ...HUDRenderer,

    draw() {
        if (!this.ctx || !this.canvas) return;

        // Se siamo nel menu principale: sfondo neon animato
        if (this.state === 'startScreen') {
            this.drawStartScreenBackground();
            return;
        }

        this.ctx.fillStyle = '#0a0a12';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        const scale = this.canvasScale ?? 1;
        this.ctx.scale(scale, scale);
        const shake = this.screenShakeIntensity || 0;
        if (shake > 0) {
            this.ctx.translate((Math.random() - 0.5) * 2 * shake, (Math.random() - 0.5) * 2 * shake);
        }
        this.ctx.translate(-this.camera.x, -this.camera.y);
        this.drawBackground();
        this.drawAmbientParticles?.();
        const margin = 120;
        const inView = (e) => {
            const ok = (x, y) => x >= this.camera.x - margin && x <= this.camera.x + this.camera.width + margin &&
                y >= this.camera.y - margin && y <= this.camera.y + this.camera.height + margin;
            if (e.from && e.to) return ok(e.from.x, e.from.y) || ok(e.to.x, e.to.y) || ok(e.x, e.y);
            return ok(e.x, e.y);
        };
        if (this.entities) {
            this.entities.fireTrails.filter(inView).forEach(e => e.draw(this.ctx, this));
            this.entities.sanctuaries.forEach(e => e.draw(this.ctx, this));
            this.entities.staticFields.forEach(e => e.draw(this.ctx, this));
            this.entities.xpOrbs.filter(inView).forEach(e => e.draw(this.ctx, this));
            this.entities.gemOrbs.filter(inView).forEach(e => e.draw(this.ctx, this));
            this.entities.materialOrbs.filter(inView).forEach(e => e.draw(this.ctx, this));
            this.entities.chests.forEach(e => e.draw(this.ctx, this));
            this.entities.droppedItems.forEach(e => e.draw(this.ctx, this));
            this.entities.enemies.forEach(e => e.draw(this.ctx, this));
            this.entities.bosses.forEach(e => e.draw(this.ctx, this));
            this.entities.projectiles.forEach(e => e.draw(this.ctx, this));
            this.entities.enemyProjectiles.forEach(e => e.draw(this.ctx, this));
            if (this.entities.anomalousAreas) this.entities.anomalousAreas.filter(inView).forEach(e => e.draw(this.ctx, this));
            this.entities.auras.forEach(e => e.draw(this.ctx, this));
            this.entities.orbitals.forEach(e => e.draw(this.ctx, this));
            this.entities.particles.filter(inView).forEach(e => e.draw(this.ctx, this));
            this.entities.effects.filter(inView).forEach(e => e.draw(this.ctx, this));
        }
        if (this.player) this.player.draw(this.ctx, this);
        this.drawBossEntry?.();
        this.drawMerchant();
        if (this.gameMode === 'tutorial') this.tutorialSystem?.draw(this.ctx);
        this.ctx.restore();
        const flash = CONFIG.accessibility?.reduceMotion ? 0 : (this.hitFlashTimer || 0);
        const maxFlash = CONFIG.effects?.hitFlashFrames ?? 10;
        if (flash > 0) {
            this.ctx.fillStyle = `rgba(255, 51, 102, ${0.3 * (flash / maxFlash)})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        // Easter egg: 666 kills red pulse
        if (this._666PulseTimer > 0) {
            const pulse666 = 0.15 + Math.sin(this._666PulseTimer * 0.15) * 0.15;
            this.ctx.fillStyle = `rgba(255, 0, 0, ${pulse666})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this._666PulseTimer--;
        }
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        const r = Math.sqrt(cx * cx + cy * cy);
        if (!CONFIG.accessibility?.reduceMotion) {
            const vig = this.ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r);
            vig.addColorStop(0, 'rgba(0,0,0,0)');
            vig.addColorStop(1, 'rgba(0,0,0,0.4)');
            this.ctx.fillStyle = vig;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.drawOffscreenIndicators();
        this.drawMinimap();
        this.drawHotbar();
        if (this.gameMode === 'bossRush') this.drawBossRushHUD();
        this.drawNotifications();
    },

    clearCanvas() {
        // Pulisci tutti gli array di entità
        for (const type in this.entities) {
            this.entities[type] = [];
        }

        // Pulisci le notifiche
        this.notifications = [];

        // Reset della camera centrata sul player (evita salto al primo frame con lerp)
        this.camera.x = CONFIG.world.width / 2 - this.camera.width / 2;
        this.camera.y = CONFIG.world.height / 2 - this.camera.height / 2;
        this.camera.x = Math.max(0, Math.min(this.camera.x, CONFIG.world.width - this.camera.width));
        this.camera.y = Math.max(0, Math.min(this.camera.y, CONFIG.world.height - this.camera.height));

        // Pulisci il canvas con sfondo nero
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Reset del giocatore alla posizione centrale
        this.player.x = CONFIG.world.width / 2;
        this.player.y = CONFIG.world.height / 2;

        // Reset di tutti i timer e stati di gioco
        this.totalElapsedTime = 0;
        this.enemiesKilled = 0;
        this.gemsThisRun = 0;
        this.score = 0;
        this.enemiesKilledSinceBoss = 0;
        this.nextChestSpawnTime = CONFIG.chest.spawnTime;
        this.nextMapXpSpawnTime = 5;
        this.lastEnemySpawnTime = 0;
        this.difficultyTier = 0;
        this.currentStage = 1;
        this.stageStartTime = 0;
        this.bossesKilledThisStage = 0;
        this.elitesKilledThisStage = 0;

        // Reset degli spell
        this.resetSpells();

        // Reset dei power-up del giocatore
        this.player.powerUpTimers = {
            invincibility: 0,
            damageBoost: 0
        };

        // Reset della salute del giocatore
        this.player.hp = this.player.stats.maxHp;
        this.player.level = 1;
        this.player.xp = 0;
        this.player.xpNext = CONFIG.player.xpCurve.base;

        console.log('Canvas pulito completamente');
    },

    updateCamera() {
        const lerp = CONFIG.effects?.cameraLerp ?? 0.1;
        const targetX = this.player.x - this.camera.width / 2;
        const targetY = this.player.y - this.camera.height / 2;
        this.camera.x += (targetX - this.camera.x) * lerp;
        this.camera.y += (targetY - this.camera.y) * lerp;
        this.camera.x = Math.max(0, Math.min(this.camera.x, CONFIG.world.width - this.camera.width));
        this.camera.y = Math.max(0, Math.min(this.camera.y, CONFIG.world.height - this.camera.height));
    },

    resizeCanvas() {
        if (!this.dom.gameContainer || !this.canvas) return;

        const rect = this.dom.gameContainer.getBoundingClientRect();
        const w = Math.floor(rect.width);
        const h = Math.floor(rect.height);
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const dpr = window.devicePixelRatio || 1;
        const scale = isMobile ? Math.min(dpr, 1.5) : Math.min(dpr, 2);
        const width = Math.floor(w * scale);
        const height = Math.floor(h * scale);
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
        this.camera.width = w;
        this.camera.height = h;
        this.canvasScale = scale;
        if (this.state !== 'running') this.draw();
    },

};
