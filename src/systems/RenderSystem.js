import { CONFIG } from '../config/index.js';
import { Utils } from '../utils/index.js';

export const RenderSystem = {

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
        if (this.gameMode === 'bossRush') this.drawBossRushHUD();
        this.drawNotifications();
    },

    drawStartScreenBackground() {
        if (!this.ctx || !this.canvas) return;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const t = Date.now() * 0.0008;
        const gridSize = 80;

        // Gradient base
        const g = this.ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.6);
        g.addColorStop(0, '#0a0a14');
        g.addColorStop(0.5, '#0d0d18');
        g.addColorStop(1, '#050508');
        this.ctx.fillStyle = g;
        this.ctx.fillRect(0, 0, w, h);

        // Griglia neon sottile (offset animato)
        const offsetX = (Math.sin(t) * 20) % gridSize;
        const offsetY = (Math.cos(t * 0.7) * 20) % gridSize;
        const alpha = 0.06 + Math.sin(t * 2) * 0.02;
        this.ctx.strokeStyle = `rgba(0, 245, 255, ${alpha})`;
        this.ctx.lineWidth = 1;
        for (let x = -offsetX; x < w + gridSize; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, h);
            this.ctx.stroke();
        }
        for (let y = -offsetY; y < h + gridSize; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(w, y);
            this.ctx.stroke();
        }

        // Glow centrale
        const glow = this.ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.5);
        glow.addColorStop(0, 'rgba(0, 245, 255, 0.04)');
        glow.addColorStop(1, 'rgba(0, 245, 255, 0)');
        this.ctx.fillStyle = glow;
        this.ctx.fillRect(0, 0, w, h);
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

        // Overlay gradient per profondità (glow centrale)
        const accent = stageInfo.background.accentColor || '#00f5ff';
        const cx = this.camera.x + this.camera.width / 2;
        const cy = this.camera.y + this.camera.height / 2;
        const r = accent.startsWith('#') ? parseInt(accent.slice(1, 3), 16) : 0;
        const g = accent.startsWith('#') ? parseInt(accent.slice(3, 5), 16) : 245;
        const b = accent.startsWith('#') ? parseInt(accent.slice(5, 7), 16) : 255;
        const grad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, this.camera.width * 0.7);
        grad.addColorStop(0, `rgba(${r},${g},${b},0.05)`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(this.camera.x - 100, this.camera.y - 100, this.camera.width + 200, this.camera.height + 200);

        // Griglia o pattern specifico dello stage (solo area visibile)
        this.ctx.strokeStyle = stageInfo.background.gridColor;
        this.ctx.lineWidth = 1;

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
                // Stelle deterministiche neon (no Math.random in draw - causa jank su mobile)
                const starColor = stageInfo.background.accentColor || '#ff00ff';
                const sr = starColor.startsWith('#') ? parseInt(starColor.slice(1, 3), 16) : 255;
                const sg = starColor.startsWith('#') ? parseInt(starColor.slice(3, 5), 16) : 0;
                const sb = starColor.startsWith('#') ? parseInt(starColor.slice(5, 7), 16) : 255;
                this.ctx.fillStyle = `rgba(${sr},${sg},${sb},0.85)`;
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
            case 'infernal': {
                // Fiamme che salgono dal basso
                this.ctx.fillStyle = stageInfo.background.gridColor;
                for (let x = vx0; x < vx1; x += CONFIG.world.gridSize * 1.5) {
                    for (let y = vy0; y < vy1; y += CONFIG.world.gridSize * 2) {
                        const h = (x * 13 + y * 29) % 100;
                        if (h < 25) {
                            const flameHeight = 15 + (h % 15);
                            const fx = x + (h * 7 % 30);
                            const fy = y + ((h * 11 + 3) % 30);
                            this.ctx.beginPath();
                            this.ctx.moveTo(fx - 5, fy);
                            this.ctx.quadraticCurveTo(fx, fy - flameHeight, fx + 5, fy);
                            this.ctx.closePath();
                            this.ctx.fill();
                        }
                    }
                }
                break;
            }
            case 'celestial': {
                // Raggi di luce dorata
                const lc = stageInfo.background.accentColor || '#ffd700';
                const lr = parseInt(lc.slice(1, 3), 16);
                const lg = parseInt(lc.slice(3, 5), 16);
                const lb = parseInt(lc.slice(5, 7), 16);
                this.ctx.strokeStyle = `rgba(${lr},${lg},${lb},0.08)`;
                this.ctx.lineWidth = 2;
                for (let x = vx0; x < vx1; x += CONFIG.world.gridSize * 3) {
                    const h = (x * 17) % 100;
                    if (h < 40) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(x, vy0);
                        this.ctx.lineTo(x + 30, vy1);
                        this.ctx.stroke();
                    }
                }
                // Stella brillante sparsa
                this.ctx.fillStyle = `rgba(${lr},${lg},${lb},0.5)`;
                for (let x = vx0; x < vx1; x += CONFIG.world.gridSize * 2) {
                    for (let y = vy0; y < vy1; y += CONFIG.world.gridSize * 2) {
                        const h = (x * 23 + y * 11) % 100;
                        if (h < 12) {
                            this.ctx.beginPath();
                            this.ctx.arc(x + (h * 7 % 40), y + (h * 3 % 40), 1.5, 0, Math.PI * 2);
                            this.ctx.fill();
                        }
                    }
                }
                break;
            }
            case 'void': {
                // Vuoto: punti bianchi sparsi, nessuna griglia
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                for (let x = vx0; x < vx1; x += CONFIG.world.gridSize) {
                    for (let y = vy0; y < vy1; y += CONFIG.world.gridSize) {
                        const h = (x * 41 + y * 19) % 100;
                        if (h < 15) {
                            const sx = x + (h * 13 % 50);
                            const sy = y + ((h * 7 + 11) % 50);
                            const sz = 0.5 + (h % 3) * 0.5;
                            this.ctx.beginPath();
                            this.ctx.arc(sx, sy, sz, 0, Math.PI * 2);
                            this.ctx.fill();
                        }
                    }
                }
                break;
            }
        }
    },

    /** Ambient particles per stage — lightweight, deterministic, no random per frame */
    drawAmbientParticles() {
        if (CONFIG.accessibility?.reduceMotion) return;
        const stageInfo = CONFIG.stages[this.currentStage];
        if (!stageInfo) return;
        const pattern = stageInfo.background?.pattern;
        const t = (this.totalElapsedTime || 0) * 60; // frame count approx
        const cx = this.camera.x;
        const cy = this.camera.y;
        const cw = this.camera.width;
        const ch = this.camera.height;

        const particles = {
            'forest': { count: 12, color: 'rgba(180,255,100,0.4)', size: 2, drift: 0.3 },
            'desert': { count: 8, color: 'rgba(255,200,100,0.3)', size: 1.5, drift: 0.5 },
            'ice': { count: 15, color: 'rgba(200,230,255,0.5)', size: 2.5, drift: 0.15 },
            'cosmic': { count: 10, color: 'rgba(200,100,255,0.4)', size: 1.5, drift: 0.2 },
            'infernal': { count: 10, color: 'rgba(255,100,30,0.5)', size: 2, drift: 0.6 },
            'celestial': { count: 12, color: 'rgba(255,215,0,0.4)', size: 2, drift: 0.25 },
            'void': { count: 6, color: 'rgba(255,255,255,0.2)', size: 1, drift: 0.1 }
        };
        const cfg = particles[pattern];
        if (!cfg) return;

        this.ctx.fillStyle = cfg.color;
        for (let i = 0; i < cfg.count; i++) {
            const seed = i * 137.5;
            const baseX = ((seed * 73 + t * cfg.drift) % cw);
            const baseY = ((seed * 41 + t * cfg.drift * 0.7) % ch);
            const wobbleX = Math.sin(t * 0.02 + seed) * 8;
            const wobbleY = Math.cos(t * 0.015 + seed * 0.7) * 6;
            const px = cx + baseX + wobbleX;
            const py = cy + baseY + wobbleY;
            const pulse = 0.6 + Math.sin(t * 0.03 + seed) * 0.4;
            this.ctx.globalAlpha = pulse;
            this.ctx.beginPath();
            this.ctx.arc(px, py, cfg.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;
    },

    /** Boss entry animation — red cinematic bars + name display */
    drawBossEntry() {
        if (!this.entities?.bosses) return;
        for (const boss of this.entities.bosses) {
            if (!boss._entryTimer) continue;
            const progress = boss._entryTimer / 90; // 1.5s animation
            const barHeight = 40 * progress;
            // Red cinematic bars
            this.ctx.fillStyle = `rgba(180, 0, 0, ${0.6 * progress})`;
            this.ctx.fillRect(this.camera.x, this.camera.y, this.camera.width, barHeight);
            this.ctx.fillRect(this.camera.x, this.camera.y + this.camera.height - barHeight, this.camera.width, barHeight);
            // Boss name
            if (progress > 0.3) {
                const alpha = Math.min(1, (progress - 0.3) / 0.3);
                this.ctx.fillStyle = `rgba(255, 50, 50, ${alpha})`;
                this.ctx.font = 'bold 24px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('⚠ BOSS ⚠', this.camera.x + this.camera.width / 2, this.camera.y + this.camera.height / 2);
                this.ctx.textAlign = 'start';
            }
            boss._entryTimer--;
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

    drawOffscreenIndicators() {
        if (!this.ctx || !this.canvas) return;

        if (this.entities.chests.length > 0) this.drawOffscreenIndicator(this.entities.chests[0], "rgba(255, 215, 0, 0.7)", 'arrow');
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
        if (this.dom.pauseButton) this.dom.pauseButton.style.display = 'flex';
        if (this.dom.pauseButtonMobile) this.dom.pauseButtonMobile.style.display = 'flex';

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
    },

    drawBossRushHUD() {
        if (!this.ctx || this.gameMode !== 'bossRush') return;
        const margin = 20;
        const x = margin;
        const y = 80; // Below timer

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.strokeStyle = '#ff4444';
        this.ctx.lineWidth = 2;
        Utils.drawRoundedRect(this.ctx, x, y, 200, 40, 8, true, true);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px "Cinzel"';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`BOSS SCONFITTI: ${this.bossesKilled}`, x + 15, y + 25);
    },

    drawMinimap() {
        if (!CONFIG.ui?.showMinimap && CONFIG.ui?.showMinimap !== undefined) return;

        const mapSize = 150;
        const margin = 20;
        const ctx = this.ctx;
        const w = this.canvas.width;

        // Minimap position (top-right)
        const mapX = w - mapSize - margin;
        const mapY = margin + 60; // Below XP bar/Timer

        ctx.save();

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.strokeStyle = 'rgba(0, 245, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(mapX, mapY, mapSize, mapSize, 8);
        else ctx.rect(mapX, mapY, mapSize, mapSize);
        ctx.fill();
        ctx.stroke();

        // Clip to map area
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(mapX, mapY, mapSize, mapSize, 8);
        else ctx.rect(mapX, mapY, mapSize, mapSize);
        ctx.clip();

        // Calculate scale
        const range = 2000; // View range radius
        const scale = mapSize / (range * 2);

        if (!this.player) { ctx.restore(); return; }
        const px = this.player.x;
        const py = this.player.y;

        // Center map on player
        ctx.translate(mapX + mapSize / 2, mapY + mapSize / 2);

        const drawDot = (x, y, color, size) => {
            const dx = (x - px) * scale;
            const dy = (y - py) * scale;

            // Only draw if within range
            if (Math.abs(dx) < mapSize / 2 && Math.abs(dy) < mapSize / 2) {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(dx, dy, size, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        // Draw entities
        if (this.entities) {
            // Chests (Gold)
            if (this.entities.chests) this.entities.chests.forEach(e => drawDot(e.x, e.y, '#ffd700', 3));

            // Bosses (Purple/Skull)
            if (this.entities.bosses) this.entities.bosses.forEach(e => drawDot(e.x, e.y, '#9b59b6', 5));

            // Enemies (Red dots, smaller)
            if (this.entities.enemies) {
                this.entities.enemies.forEach(e => {
                    if (e.stats.isElite) drawDot(e.x, e.y, '#e74c3c', 3);
                    else drawDot(e.x, e.y, '#c0392b', 1.5);
                });
            }

            // Merchant (Cyan)
            if (CONFIG.merchant) {
                drawDot(CONFIG.merchant.x, CONFIG.merchant.y, '#00ffff', 4);
            }
        }

        // Player (Green center)
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        // Direction indicator
        if (this.player.dx || this.player.dy) {
            const angle = Math.atan2(this.player.dy, this.player.dx);
            ctx.strokeStyle = 'rgba(46, 204, 113, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * 10, Math.sin(angle) * 10);
            ctx.stroke();
        }

        ctx.restore();
    }
};
