import { CONFIG } from '../config/index.js';

export const EnvironmentRenderer = {
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

        // Init parallax cache se non esiste per questo stage
        if (!this._parallaxCache || this._parallaxCache.stage !== this.currentStage) {
            this._initParallaxCache(stageInfo);
        }

        // Sfondo base solido
        this.ctx.fillStyle = stageInfo.background.color;
        this.ctx.fillRect(0, 0, CONFIG.world.width, CONFIG.world.height);

        // Overlay gradient per profondità (glow centrale) fisso al world
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

        // Disegna layer pre-renderizzati
        const layers = this._parallaxCache.layers;
        if (!layers) return;

        const tileSize = this._parallaxCache.tileSize;

        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            const canvas = layer.canvas;
            if (!canvas) continue;

            // Calcola offset basato sulla camera e sul fattore parallasse
            const parallaxX = this.camera.x * layer.speed;
            const parallaxY = this.camera.y * layer.speed;

            // Tile che copre la vista camera con l'offset parallasse
            const startX = Math.floor((this.camera.x - parallaxX) / tileSize) * tileSize + parallaxX;
            const startY = Math.floor((this.camera.y - parallaxY) / tileSize) * tileSize + parallaxY;

            for (let x = startX - tileSize; x < this.camera.x + this.camera.width + tileSize; x += tileSize) {
                for (let y = startY - tileSize; y < this.camera.y + this.camera.height + tileSize; y += tileSize) {
                    if (x + tileSize > this.camera.x && x < this.camera.x + this.camera.width &&
                        y + tileSize > this.camera.y && y < this.camera.y + this.camera.height) {
                        this.ctx.drawImage(canvas, x, y);
                    }
                }
            }
        }
    },

    _initParallaxCache(stageInfo) {
        this._parallaxCache = {
            stage: this.currentStage,
            tileSize: CONFIG.world.gridSize * 4, // 400x400 tile
            layers: []
        };

        const ts = this._parallaxCache.tileSize;

        // Layer 0: Background distante (lento)
        const canvas0 = document.createElement('canvas');
        canvas0.width = ts; canvas0.height = ts;
        const ctx0 = canvas0.getContext('2d');

        // Layer 1: Foreground (1:1 o quasi, la vecchia griglia)
        const canvas1 = document.createElement('canvas');
        canvas1.width = ts; canvas1.height = ts;
        const ctx1 = canvas1.getContext('2d');

        // Renderizza nei canvas in base al pattern
        ctx1.strokeStyle = stageInfo.background.gridColor;
        ctx1.lineWidth = 1;

        const pattern = stageInfo.background.pattern;

        if (pattern === 'grid') {
            // Layer 0: slow-moving background dots (speed 0.3) — creates parallax depth
            ctx0.fillStyle = 'rgba(0, 245, 255, 0.12)';
            for (let i = 0; i < 30; i++) {
                const sx = (i * 137.5) % ts;
                const sy = (i * 89.3 + 41) % ts;
                ctx0.beginPath();
                ctx0.arc(sx, sy, 1 + (i % 3) * 0.5, 0, Math.PI * 2);
                ctx0.fill();
            }
            // Background subtle grid lines
            ctx0.strokeStyle = 'rgba(0, 245, 255, 0.04)';
            ctx0.lineWidth = 1;
            for (let cx = 0; cx < ts; cx += CONFIG.world.gridSize * 2) {
                ctx0.beginPath(); ctx0.moveTo(cx, 0); ctx0.lineTo(cx, ts); ctx0.stroke();
            }
            for (let cy = 0; cy < ts; cy += CONFIG.world.gridSize * 2) {
                ctx0.beginPath(); ctx0.moveTo(0, cy); ctx0.lineTo(ts, cy); ctx0.stroke();
            }
            this._parallaxCache.layers.push({ canvas: canvas0, speed: 0.3 });

            // Layer 0.5: mid-speed crossing lines (speed 0.65)
            const canvas05 = document.createElement('canvas');
            canvas05.width = ts; canvas05.height = ts;
            const ctx05 = canvas05.getContext('2d');
            ctx05.strokeStyle = 'rgba(0, 245, 255, 0.06)';
            ctx05.lineWidth = 1;
            for (let cx = 0; cx < ts; cx += CONFIG.world.gridSize * 1.5) {
                ctx05.beginPath(); ctx05.moveTo(cx, 0); ctx05.lineTo(cx, ts); ctx05.stroke();
            }
            for (let cy = 0; cy < ts; cy += CONFIG.world.gridSize * 1.5) {
                ctx05.beginPath(); ctx05.moveTo(0, cy); ctx05.lineTo(ts, cy); ctx05.stroke();
            }
            // Some brighter dots
            ctx05.fillStyle = 'rgba(0, 245, 255, 0.15)';
            for (let i = 0; i < 15; i++) {
                const sx = (i * 97.3 + 20) % ts;
                const sy = (i * 63.7 + 55) % ts;
                ctx05.beginPath(); ctx05.arc(sx, sy, 1.5, 0, Math.PI * 2); ctx05.fill();
            }
            this._parallaxCache.layers.push({ canvas: canvas05, speed: 0.65 });

            // Layer 1: foreground grid (speed 1.0)
            for (let cx = 0; cx < ts; cx += CONFIG.world.gridSize) {
                ctx1.beginPath(); ctx1.moveTo(cx, 0); ctx1.lineTo(cx, ts); ctx1.stroke();
            }
            for (let cy = 0; cy < ts; cy += CONFIG.world.gridSize) {
                ctx1.beginPath(); ctx1.moveTo(0, cy); ctx1.lineTo(ts, cy); ctx1.stroke();
            }
            this._parallaxCache.layers.push({ canvas: canvas1, speed: 1.0 });

        } else if (pattern === 'forest') {
            // Alberi distanti nel layer 0
            ctx0.strokeStyle = 'rgba(20, 100, 20, 0.1)';
            ctx0.lineWidth = 1.5;
            for (let i = 0; i < 5; i++) {
                const tx = Math.random() * ts; const ty = Math.random() * ts;
                ctx0.beginPath(); ctx0.moveTo(tx, ty + 15); ctx0.lineTo(tx - 8, ty); ctx0.lineTo(tx + 8, ty); ctx0.closePath(); ctx0.stroke();
            }
            this._parallaxCache.layers.push({ canvas: canvas0, speed: 0.5 });

            // Prato/viti vicine layer 1
            for (let cx = 0; cx < ts; cx += CONFIG.world.gridSize * 1.5) {
                for (let cy = 0; cy < ts; cy += CONFIG.world.gridSize * 1.5) {
                    ctx1.beginPath(); ctx1.moveTo(cx, cy + 20); ctx1.lineTo(cx - 10, cy); ctx1.lineTo(cx + 10, cy); ctx1.closePath(); ctx1.stroke();
                }
            }
            this._parallaxCache.layers.push({ canvas: canvas1, speed: 1.0 });

        } else if (pattern === 'desert') {
            // Dune distanti
            ctx0.strokeStyle = 'rgba(200, 100, 0, 0.1)';
            ctx0.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                ctx0.beginPath(); ctx0.moveTo(0, ts / 2 + i * 50); ctx0.quadraticCurveTo(ts / 2, ts / 2 - 40 + i * 50, ts, ts / 2 + i * 50); ctx0.stroke();
            }
            this._parallaxCache.layers.push({ canvas: canvas0, speed: 0.3 });

            // Crepe / dune vicine
            for (let cx = 0; cx <= ts; cx += CONFIG.world.gridSize) {
                const cy = (cx * 1.5) % ts;
                ctx1.beginPath(); ctx1.moveTo(cx, cy); ctx1.quadraticCurveTo(cx + 50, cy - 30, cx + 100, cy); ctx1.stroke();
            }
            this._parallaxCache.layers.push({ canvas: canvas1, speed: 1.0 });

        } else if (pattern === 'cosmic') {
            // Stelle lontane
            ctx0.fillStyle = 'rgba(255,255,255,0.3)';
            for (let i = 0; i < 20; i++) {
                ctx0.beginPath(); ctx0.arc(Math.random() * ts, Math.random() * ts, 0.5 + Math.random(), 0, Math.PI * 2); ctx0.fill();
            }
            this._parallaxCache.layers.push({ canvas: canvas0, speed: 0.1 });

            // Costellazioni vicine
            const starColor = stageInfo.background.accentColor || '#ff00ff';
            ctx1.fillStyle = 'rgba(255, 0, 255, 0.6)';
            for (let i = 0; i < 15; i++) {
                ctx1.beginPath(); ctx1.arc(Math.random() * ts, Math.random() * ts, 1.5 + Math.random() * 1.5, 0, Math.PI * 2); ctx1.fill();
            }
            this._parallaxCache.layers.push({ canvas: canvas1, speed: 0.8 });
        } else if (pattern === 'ice') {
            // Cristalli di ghiaccio sfocati lontani
            ctx0.strokeStyle = 'rgba(200, 240, 255, 0.2)';
            ctx0.lineWidth = 1;
            for (let i = 0; i < 8; i++) {
                const tx = Math.random() * ts; const ty = Math.random() * ts;
                ctx0.beginPath(); ctx0.moveTo(tx, ty); ctx0.lineTo(tx + 5, ty - 10); ctx0.lineTo(tx + 10, ty); ctx0.lineTo(tx + 5, ty + 10); ctx0.closePath(); ctx0.stroke();
            }
            this._parallaxCache.layers.push({ canvas: canvas0, speed: 0.4 });

            // Ghiaccio nitido vicino
            ctx1.strokeStyle = stageInfo.background.gridColor;
            for (let cx = 0; cx < ts; cx += CONFIG.world.gridSize) {
                for (let cy = 0; cy < ts; cy += CONFIG.world.gridSize) {
                    ctx1.beginPath(); ctx1.moveTo(cx, cy); ctx1.lineTo(cx + 5, cy - 10); ctx1.lineTo(cx + 10, cy); ctx1.lineTo(cx + 5, cy + 10); ctx1.closePath(); ctx1.stroke();
                }
            }
            this._parallaxCache.layers.push({ canvas: canvas1, speed: 1.0 });

        } else if (pattern === 'infernal') {
            // Braci fluttuanti
            ctx0.fillStyle = 'rgba(255, 100, 0, 0.4)';
            for (let i = 0; i < 15; i++) {
                ctx0.beginPath(); ctx0.arc(Math.random() * ts, Math.random() * ts, 1 + Math.random(), 0, Math.PI * 2); ctx0.fill();
            }
            this._parallaxCache.layers.push({ canvas: canvas0, speed: 0.6 });

            // Onde infuocate (griglia deformata)
            ctx1.fillStyle = stageInfo.background.gridColor;
            for (let cx = 0; cx < ts; cx += CONFIG.world.gridSize * 1.5) {
                for (let cy = 0; cy < ts; cy += CONFIG.world.gridSize * 2) {
                    const h = (cx * 13 + cy * 29) % 100;
                    if (h < 25) {
                        const flameHeight = 15 + (h % 15);
                        const fx = cx + (h * 7 % 30);
                        const fy = cy + ((h * 11 + 3) % 30);
                        ctx1.beginPath(); ctx1.moveTo(fx - 5, fy); ctx1.quadraticCurveTo(fx, fy - flameHeight, fx + 5, fy); ctx1.closePath(); ctx1.fill();
                    }
                }
            }
            this._parallaxCache.layers.push({ canvas: canvas1, speed: 1.0 });

        } else if (pattern === 'celestial') {
            // Raggi di luce lenti
            const lc = stageInfo.background.accentColor || '#ffd700';
            const lr = parseInt(lc.slice(1, 3), 16) || 255; const lg = parseInt(lc.slice(3, 5), 16) || 215; const lb = parseInt(lc.slice(5, 7), 16) || 0;
            ctx0.strokeStyle = `rgba(${lr},${lg},${lb},0.15)`;
            ctx0.lineWidth = 4;
            for (let i = 0; i < 3; i++) {
                const rx = Math.random() * ts;
                ctx0.beginPath(); ctx0.moveTo(rx, 0); ctx0.lineTo(rx + 30, ts); ctx0.stroke();
            }
            this._parallaxCache.layers.push({ canvas: canvas0, speed: 0.2 });

            // Stelle dorate vicine
            ctx1.fillStyle = `rgba(${lr},${lg},${lb},0.5)`;
            for (let i = 0; i < 25; i++) {
                ctx1.beginPath(); ctx1.arc(Math.random() * ts, Math.random() * ts, 1.5, 0, Math.PI * 2); ctx1.fill();
            }
            this._parallaxCache.layers.push({ canvas: canvas1, speed: 0.9 });

        } else if (pattern === 'void') {
            // Stelle lentissime
            ctx0.fillStyle = 'rgba(200, 200, 255, 0.4)';
            for (let i = 0; i < 15; i++) {
                ctx0.beginPath(); ctx0.arc(Math.random() * ts, Math.random() * ts, 0.5, 0, Math.PI * 2); ctx0.fill();
            }
            this._parallaxCache.layers.push({ canvas: canvas0, speed: 0.05 });

            // Punti bianchi radi
            ctx1.fillStyle = 'rgba(255, 255, 255, 0.7)';
            for (let cx = 0; cx < ts; cx += CONFIG.world.gridSize) {
                for (let cy = 0; cy < ts; cy += CONFIG.world.gridSize) {
                    const h = (cx * 41 + cy * 19) % 100;
                    if (h < 15) {
                        ctx1.beginPath(); ctx1.arc(cx + (h * 13 % 50), cy + (h * 7 + 11) % 50, 0.5 + (h % 3) * 0.5, 0, Math.PI * 2); ctx1.fill();
                    }
                }
            }
            this._parallaxCache.layers.push({ canvas: canvas1, speed: 0.7 });

        } else {
            // Fallback: add slow background dots + grid
            ctx0.fillStyle = 'rgba(255,255,255,0.1)';
            for (let i = 0; i < 20; i++) {
                ctx0.beginPath(); ctx0.arc((i * 137.5) % ts, (i * 89.3 + 41) % ts, 1, 0, Math.PI * 2); ctx0.fill();
            }
            this._parallaxCache.layers.push({ canvas: canvas0, speed: 0.3 });

            for (let cx = 0; cx < ts; cx += CONFIG.world.gridSize) {
                ctx1.beginPath(); ctx1.moveTo(cx, 0); ctx1.lineTo(cx, ts); ctx1.stroke();
            }
            for (let cy = 0; cy < ts; cy += CONFIG.world.gridSize) {
                ctx1.beginPath(); ctx1.moveTo(0, cy); ctx1.lineTo(ts, cy); ctx1.stroke();
            }
            this._parallaxCache.layers.push({ canvas: canvas1, speed: 1.0 });
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
    }
};
