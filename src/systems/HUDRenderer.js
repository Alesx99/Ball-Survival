import { CONFIG } from '../config/index.js';
import { Utils } from '../utils/index.js';

export const HUDRenderer = {
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
        const startY = 80;
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

    drawSecretMerchant() {
        if (!this.ctx || !this.game?._secretMerchantPos) return;

        const m = this.game._secretMerchantPos;
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(m.x, m.y, m.size, m.size);
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#ff0000';
        this.ctx.strokeRect(m.x, m.y, m.size, m.size);
        this.ctx.shadowBlur = 0;

        if (this.state === 'running' && Utils.getDistance(this.player, m) < m.interactionRadius) {
            this.ctx.font = 'bold 14px "Courier New"';
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.textAlign = 'center';
            this.ctx.fillText("[E] / Tocca", m.x + m.size / 2, m.y - 25);
            this.ctx.fillText("Mercato Nero", m.x + m.size / 2, m.y - 10);
        }
    },

    showInGameUI() {
        if (this.dom.inGameUI) this.dom.inGameUI.style.display = 'flex';
        if (this.dom.pauseButton) this.dom.pauseButton.style.display = 'flex';
        if (this.dom.pauseButtonMobile) this.dom.pauseButtonMobile.style.display = 'flex';

        const xpBarMobile = document.getElementById('xpBarMobile');
        if (xpBarMobile && window.innerWidth <= 700) {
            xpBarMobile.style.display = 'block';
        }
    },

    hideInGameUI() {
        if (this.dom.inGameUI) this.dom.inGameUI.style.display = 'none';
        if (this.dom.pauseButton) this.dom.pauseButton.style.display = 'none';
        if (this.dom.pauseButtonMobile) this.dom.pauseButtonMobile.style.display = 'none';

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
        const y = 80;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.strokeStyle = '#ff4444';
        this.ctx.lineWidth = 2;
        Utils.drawRoundedRect(this.ctx, x, y, 200, 40, 8, true, true);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px "Cinzel"';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`BOSS SCONFITTI: ${this.bossesKilled}`, x + 15, y + 25);
    },

    drawHotbar() {
        if (!this.ctx || !this.player || !this.player.hotbar || this.gameMode === 'tutorial') return;

        const slotSize = 40;
        const gap = 10;
        const totalW = (slotSize * 3) + (gap * 2);

        const startX = (this.canvas.width / 2) - (totalW / 2);
        const startY = this.canvas.height - slotSize - 20;

        this.ctx.save();
        this.ctx.textAlign = 'center';

        for (let i = 0; i < 3; i++) {
            const x = startX + (i * (slotSize + gap));
            const y = startY;
            const itemType = this.player.hotbar[i];

            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            this.ctx.strokeStyle = itemType ? 'rgba(255, 215, 0, 0.8)' : 'rgba(255, 255, 255, 0.2)';
            this.ctx.lineWidth = 2;
            Utils.drawRoundedRect(this.ctx, x, y, slotSize, slotSize, 6, true, true);

            if (itemType) {
                const itemInfo = CONFIG.itemTypes[itemType];
                if (itemInfo) {
                    this.ctx.fillStyle = itemInfo.color;
                    this.ctx.beginPath();
                    this.ctx.arc(x + slotSize / 2, y + slotSize / 2, slotSize * 0.35, 0, Math.PI * 2);
                    this.ctx.fill();

                    this.ctx.shadowBlur = 10;
                    this.ctx.shadowColor = itemInfo.color;
                    this.ctx.stroke();
                    this.ctx.shadowBlur = 0;
                }
            }

            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 12px "Courier New", monospace';
            this.ctx.fillText(`${i + 1}`, x + 10, y + 15);
        }

        this.ctx.restore();
    },

    drawMinimap() {
        if (!CONFIG.ui?.showMinimap && CONFIG.ui?.showMinimap !== undefined) return;

        const mapSize = 150;
        const margin = 20;
        const ctx = this.ctx;
        const w = this.canvas.width;

        const mapX = w - mapSize - margin;
        const mapY = margin + 60;

        ctx.save();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.strokeStyle = 'rgba(0, 245, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(mapX, mapY, mapSize, mapSize, 8);
        else ctx.rect(mapX, mapY, mapSize, mapSize);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(mapX, mapY, mapSize, mapSize, 8);
        else ctx.rect(mapX, mapY, mapSize, mapSize);
        ctx.clip();

        const range = 2000;
        const scale = mapSize / (range * 2);

        if (!this.player) { ctx.restore(); return; }
        const px = this.player.x;
        const py = this.player.y;

        ctx.translate(mapX + mapSize / 2, mapY + mapSize / 2);

        const drawDot = (x, y, color, size) => {
            const dx = (x - px) * scale;
            const dy = (y - py) * scale;

            if (Math.abs(dx) < mapSize / 2 && Math.abs(dy) < mapSize / 2) {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(dx, dy, size, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        if (this.entities.chests) {
            this.entities.chests.forEach(e => drawDot(e.x, e.y, "rgba(255, 215, 0, 0.8)", 3));
        }

        if (CONFIG.merchant) {
            drawDot(CONFIG.merchant.x, CONFIG.merchant.y, "rgba(155, 89, 182, 0.8)", 4);
        }

        if (this.entities.bosses && this.entities.bosses.length > 0) {
            this.entities.bosses.forEach(e => drawDot(e.x, e.y, "rgba(255, 0, 0, 0.9)", 4));
        }

        if (this.entities.anomalousAreas) {
            this.entities.anomalousAreas.forEach(a => {
                const dx = (a.x - px) * scale;
                const dy = (a.y - py) * scale;
                if (Math.abs(dx) < mapSize / 2 && Math.abs(dy) < mapSize / 2) {
                    ctx.fillStyle = "rgba(100, 255, 100, 0.15)";
                    if (a.type === 'corrupted') ctx.fillStyle = "rgba(255, 50, 100, 0.15)";
                    ctx.beginPath();
                    ctx.arc(dx, dy, a.radius * scale, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }

        drawDot(px, py, "#00f5ff", 3);

        ctx.restore();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('N', mapX + mapSize / 2, mapY + 12);
    }
};
