import { CONFIG } from '../config/index.js';
import { Utils } from '../utils/index.js';

export const RenderSystem = {

    draw() {
        if (!this.ctx || !this.canvas) return;
        
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Se siamo nel menu principale, non disegnare elementi di gioco
        if (this.state === 'startScreen') {
            return;
        }
        
        this.ctx.save();
        const scale = this.canvasScale ?? 1;
        this.ctx.scale(scale, scale);
        const shake = this.screenShakeIntensity || 0;
        if (shake > 0) {
            this.ctx.translate((Math.random() - 0.5) * 2 * shake, (Math.random() - 0.5) * 2 * shake);
        }
        this.ctx.translate(-this.camera.x, -this.camera.y);
        this.drawBackground();
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
            this.entities.auras.forEach(e => e.draw(this.ctx, this));
            this.entities.orbitals.forEach(e => e.draw(this.ctx, this));
            this.entities.particles.filter(inView).forEach(e => e.draw(this.ctx, this));
            this.entities.effects.filter(inView).forEach(e => e.draw(this.ctx, this));
        }
        if (this.player) this.player.draw(this.ctx, this);
        this.drawMerchant();
        this.ctx.restore();
        const flash = CONFIG.accessibility?.reduceMotion ? 0 : (this.hitFlashTimer || 0);
        const maxFlash = CONFIG.effects?.hitFlashFrames ?? 10;
        if (flash > 0) {
            this.ctx.fillStyle = `rgba(255, 50, 50, ${0.35 * (flash / maxFlash)})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
        this.drawNotifications();
    },

    drawBackground() {
        if (!this.ctx) return;
        
        const stageInfo = CONFIG.stages[this.currentStage];
        if (!stageInfo) return;
        
        // Culling: disegna solo l'area visibile (ottimizzazione mobile)
        const pad = CONFIG.world.gridSize * 2;
        const vx0 = Math.max(0, Math.floor((this.camera.x - pad) / CONFIG.world.gridSize) * CONFIG.world.gridSize);
        const vy0 = Math.max(0, Math.floor((this.camera.y - pad) / CONFIG.world.gridSize) * CONFIG.world.gridSize);
        const vx1 = Math.min(CONFIG.world.width, this.camera.x + this.camera.width + pad);
        const vy1 = Math.min(CONFIG.world.height, this.camera.y + this.camera.height + pad);
        
        // Sfondo base
        this.ctx.fillStyle = stageInfo.background.color;
        this.ctx.fillRect(0, 0, CONFIG.world.width, CONFIG.world.height);
        
        // Griglia o pattern specifico dello stage (solo area visibile)
        this.ctx.strokeStyle = stageInfo.background.gridColor;
        this.ctx.lineWidth = 2;
        
        switch (stageInfo.background.pattern) {
            case 'grid':
                for (let x = vx0; x < vx1; x += CONFIG.world.gridSize) {
                    this.ctx.beginPath(); this.ctx.moveTo(x, vy0); this.ctx.lineTo(x, vy1); this.ctx.stroke();
                }
                for (let y = vy0; y < vy1; y += CONFIG.world.gridSize) {
                    this.ctx.beginPath(); this.ctx.moveTo(vx0, y); this.ctx.lineTo(vx1, y); this.ctx.stroke();
                }
                break;
            case 'forest':
                for (let x = vx0; x < vx1; x += CONFIG.world.gridSize * 2) {
                    for (let y = vy0; y < vy1; y += CONFIG.world.gridSize * 2) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(x, y + 20);
                        this.ctx.lineTo(x - 10, y);
                        this.ctx.lineTo(x + 10, y);
                        this.ctx.closePath();
                        this.ctx.stroke();
                    }
                }
                break;
            case 'desert':
                for (let x = vx0; x < vx1; x += CONFIG.world.gridSize) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, CONFIG.world.height);
                    this.ctx.quadraticCurveTo(x + 50, CONFIG.world.height - 30, x + 100, CONFIG.world.height);
                    this.ctx.stroke();
                }
                break;
            case 'ice':
                for (let x = vx0; x < vx1; x += CONFIG.world.gridSize) {
                    for (let y = vy0; y < vy1; y += CONFIG.world.gridSize) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(x, y);
                        this.ctx.lineTo(x + 5, y - 10);
                        this.ctx.lineTo(x + 10, y);
                        this.ctx.lineTo(x + 5, y + 10);
                        this.ctx.closePath();
                        this.ctx.stroke();
                    }
                }
                break;
            case 'cosmic':
                // Stelle deterministiche (no Math.random in draw - causa jank su mobile)
                this.ctx.fillStyle = 'rgba(255,255,255,0.9)';
                for (let x = vx0; x < vx1; x += CONFIG.world.gridSize) {
                    for (let y = vy0; y < vy1; y += CONFIG.world.gridSize) {
                        const h = (x * 31 + y * 7) % 100;
                        if (h < 30) {
                            const sx = x + (h * 17 % 20);
                            const sy = y + ((h * 13 + 7) % 20);
                            this.ctx.beginPath();
                            this.ctx.arc(sx, sy, 1, 0, Math.PI * 2);
                            this.ctx.fill();
                        }
                    }
                }
                break;
        }
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
        this.player.xpNext = 100;
        
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

    drawOffscreenIndicators() { 
        if (!this.ctx || !this.canvas) return;
        
        if(this.entities.chests.length > 0) this.drawOffscreenIndicator(this.entities.chests[0], "rgba(255, 215, 0, 0.7)", 'arrow'); 
        this.drawOffscreenIndicator(CONFIG.merchant, "rgba(155, 89, 182, 0.8)", 'triangle'); 
    },

    drawOffscreenIndicator(target, color, shape) { 
        if (!this.ctx || !this.canvas) return;
        
        const screenX = target.x - this.camera.x; 
        const screenY = target.y - this.camera.y; 
        if (screenX > 0 && screenX < this.camera.width && screenY > 0 && screenY < this.camera.height) return; 
        const pScreenX = this.player.x - this.camera.x; 
        const pScreenY = this.player.y - this.camera.y; 
        const angle = Math.atan2(screenY - pScreenY, screenX - pScreenX); 
        const padding = 30; 
        const scale = this.canvasScale || 1;
        let arrowX = (pScreenX + Math.cos(angle) * (Math.min(this.camera.width, this.camera.height) / 2.5)) * scale; 
        let arrowY = (pScreenY + Math.sin(angle) * (Math.min(this.camera.width, this.camera.height) / 2.5)) * scale; 
        arrowX = Math.max(padding, Math.min(this.canvas.width - padding, arrowX)); 
        arrowY = Math.max(padding, Math.min(this.canvas.height - padding, arrowY)); 
        this.ctx.save(); 
        this.ctx.translate(arrowX, arrowY); 
        this.ctx.rotate(angle); 
        this.ctx.fillStyle = color; 
        this.ctx.strokeStyle = "white"; 
        this.ctx.lineWidth = 1; 
        this.ctx.beginPath(); 
        if (shape === 'arrow') { 
            this.ctx.moveTo(15, 0); 
            this.ctx.lineTo(-15, -10); 
            this.ctx.lineTo(-10, 0); 
            this.ctx.lineTo(-15, 10); 
        } else { 
            this.ctx.moveTo(0, -10); 
            this.ctx.lineTo(10, 10); 
            this.ctx.lineTo(-10, 10); 
        } 
        this.ctx.closePath(); 
        this.ctx.fill(); 
        this.ctx.stroke(); 
        this.ctx.restore(); 
    },

    drawNotifications() {
        if (!this.ctx || !this.canvas) return;
        
        this.ctx.save();
        this.ctx.textAlign = 'center';
        this.ctx.font = 'bold clamp(14px, 2.5vw, 18px) "Courier New", monospace';
        const startY = 80; // Posizione Y iniziale abbassata
        this.notifications.forEach((n, index) => {
            const opacity = n.life > 30 ? 1.0 : n.life / 30;
            this.ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`;
            this.ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
            this.ctx.shadowBlur = 5;
            this.ctx.fillText(n.text, this.canvas.width / 2, startY + (index * 30));
        });
        this.ctx.restore();
    },

    drawMerchant() { 
        if (!this.ctx) return;
        
        const m = CONFIG.merchant; 
        this.ctx.fillStyle = '#9b59b6'; 
        this.ctx.fillRect(m.x, m.y, m.size, m.size); 
        this.ctx.strokeStyle = '#f1c40f'; 
        this.ctx.lineWidth = 3; 
        this.ctx.strokeRect(m.x, m.y, m.size, m.size); 
        if (this.state === 'running' && Utils.getDistance(this.player, m) < CONFIG.merchant.interactionRadius) { 
            this.ctx.font = 'bold 14px "Courier New"'; 
            this.ctx.fillStyle = 'white'; 
            this.ctx.textAlign = 'center'; 
            this.ctx.fillText("[E] / Tocca", m.x + m.size / 2, m.y - 25); 
            this.ctx.fillText("Negozio", m.x + m.size / 2, m.y - 10); 
        } 
    },

    showInGameUI() {
        if (this.dom.inGameUI) this.dom.inGameUI.style.display = 'flex';
        if (this.dom.pauseButton) this.dom.pauseButton.style.display = 'block';
        if (this.dom.pauseButtonMobile) this.dom.pauseButtonMobile.style.display = 'block';
        
        // Mostra la barra XP mobile se siamo su mobile
        const xpBarMobile = document.getElementById('xpBarMobile');
        if (xpBarMobile && window.innerWidth <= 700) {
            xpBarMobile.style.display = 'block';
        }
    },

    hideInGameUI() {
        if (this.dom.inGameUI) this.dom.inGameUI.style.display = 'none';
        if (this.dom.pauseButton) this.dom.pauseButton.style.display = 'none';
        if (this.dom.pauseButtonMobile) this.dom.pauseButtonMobile.style.display = 'none';
        
        // Nascondi la barra XP mobile
        const xpBarMobile = document.getElementById('xpBarMobile');
        if (xpBarMobile) {
            xpBarMobile.style.display = 'none';
        }
    },

    updateInGameUI() {
        const ui = this.dom.inGameUI;
        if (!ui) return;
        
        if (ui.timer) ui.timer.textContent = '🕒 ' + Math.floor(this.totalElapsedTime) + 's';
        if (ui.gemCounter) ui.gemCounter.textContent = '💎 ' + this.gemsThisRun;

        if (this.player && this.player.xpNext > 0) {
            const xpPercent = Math.min(100, (this.player.xp / this.player.xpNext) * 100);
            if (ui.xpBarFill) ui.xpBarFill.style.width = xpPercent + '%';
        } else {
            if (ui.xpBarFill) ui.xpBarFill.style.width = '100%';
        }
        if (ui.xpBarText && this.player) ui.xpBarText.textContent = `LVL ${this.player.level}`;
        
        // Aggiorna anche la barra XP mobile
        const xpBarMobile = document.getElementById('xpBarMobile');
        const xpBarMobileFill = document.getElementById('xpBarMobileFill');
        const xpBarMobileText = document.getElementById('xpBarMobileText');
        if (xpBarMobile && xpBarMobileFill && xpBarMobileText) {
            if (this.player.xpNext > 0) {
                const xpPercent = Math.min(100, (this.player.xp / this.player.xpNext) * 100);
                xpBarMobileFill.style.width = xpPercent + '%';
            } else {
                xpBarMobileFill.style.width = '100%';
            }
            xpBarMobileText.textContent = `LVL ${this.player.level}`;
        }
    }
};
