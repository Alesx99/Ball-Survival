/**
 * Draw functions for Player cores and weapons - extracted from Player.js
 * @module entities/PlayerVisuals
 */

export const coreDrawers = {
    magnetic(ctx, p) {
        const time = Date.now() / 1000, radius = p.stats.radius + 12;
        ctx.save();
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time * 3;
            const particleRadius = radius + Math.sin(time * 4 + i) * 5;
            const x = p.x + Math.cos(angle) * particleRadius, y = p.y + Math.sin(angle) * particleRadius;
            const g = ctx.createRadialGradient(x, y, 0, x, y, 6);
            g.addColorStop(0, 'rgba(74, 144, 226, 1)'); g.addColorStop(0.5, 'rgba(74, 144, 226, 0.6)'); g.addColorStop(1, 'rgba(74, 144, 226, 0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
        }
        for (let i = 0; i < 3; i++) {
            const ringRadius = radius + i * 8;
            ctx.strokeStyle = `rgba(74, 144, 226, ${0.8 - i * 0.2})`;
            ctx.lineWidth = 3 - i; ctx.globalAlpha = 0.9 - i * 0.2;
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(time * (2 + i * 0.5));
            ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.arc(0, 0, ringRadius, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
        }
        const pulseRadius = radius + Math.sin(time * 6) * 10;
        ctx.strokeStyle = `rgba(74, 144, 226, ${0.3 + Math.sin(time * 6) * 0.2})`;
        ctx.lineWidth = 2; ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(p.x, p.y, pulseRadius, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    },
    reflection(ctx, p) {
        const time = Date.now() / 1000, radius = p.stats.radius + 10;
        ctx.save();
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        g.addColorStop(0, 'rgba(255, 215, 0, 0.8)'); g.addColorStop(0.5, 'rgba(255, 215, 0, 0.4)'); g.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 4; ctx.globalAlpha = 0.9;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time * 2;
            const x = p.x + Math.cos(angle) * radius * 0.7, y = p.y + Math.sin(angle) * radius * 0.7;
            ctx.save(); ctx.translate(x, y); ctx.rotate(angle + time * 3);
            ctx.fillStyle = '#FFFFFF'; ctx.globalAlpha = 0.8;
            ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(-4, 4); ctx.lineTo(4, 4); ctx.closePath(); ctx.fill();
            ctx.restore();
        }
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + time * 1.5;
            const rayLength = 15 + Math.sin(time * 4 + i) * 5;
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 + Math.sin(time * 4 + i) * 0.4})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(p.x + Math.cos(angle) * radius, p.y + Math.sin(angle) * radius);
            ctx.lineTo(p.x + Math.cos(angle) * (radius + rayLength), p.y + Math.sin(angle) * (radius + rayLength));
            ctx.stroke();
        }
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + time * 4;
            const sparkRadius = radius + Math.sin(time * 6 + i) * 8;
            const x = p.x + Math.cos(angle) * sparkRadius, y = p.y + Math.sin(angle) * sparkRadius;
            const sg = ctx.createRadialGradient(x, y, 0, x, y, 4);
            sg.addColorStop(0, 'rgba(255, 255, 255, 1)'); sg.addColorStop(0.5, 'rgba(255, 215, 0, 0.8)'); sg.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    },
    bounce(ctx, p) {
        const time = Date.now() / 1000, radius = p.stats.radius + 10;
        ctx.save(); ctx.fillStyle = '#FF6B35'; ctx.globalAlpha = 0.8;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time;
            ctx.beginPath(); ctx.arc(p.x + Math.cos(angle) * radius, p.y + Math.sin(angle) * radius, 3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    },
    speed(ctx, p) {
        const time = Date.now() / 1000, radius = p.stats.radius + 8;
        ctx.save();
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + time * 8;
            const particleRadius = radius + Math.sin(time * 6 + i) * 8;
            const x = p.x + Math.cos(angle) * particleRadius, y = p.y + Math.sin(angle) * particleRadius;
            const pg = ctx.createRadialGradient(x, y, 0, x, y, 4);
            pg.addColorStop(0, 'rgba(0, 255, 255, 1)'); pg.addColorStop(0.5, 'rgba(0, 255, 255, 0.6)'); pg.addColorStop(1, 'rgba(0, 255, 255, 0)');
            ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
        }
        for (let i = 0; i < 4; i++) {
            const offset = (i / 4) * Math.PI * 2 + time * 6, sciaRadius = radius + i * 6, alpha = 0.8 - i * 0.15;
            ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`; ctx.lineWidth = 3 - i * 0.5; ctx.globalAlpha = alpha;
            ctx.beginPath(); ctx.arc(p.x, p.y, sciaRadius, offset, offset + Math.PI * 1.5); ctx.stroke();
            ctx.beginPath(); ctx.arc(p.x, p.y, sciaRadius * 0.7, offset + Math.PI, offset + Math.PI * 2.5); ctx.stroke();
        }
        for (let i = 0; i < 3; i++) {
            const shockRadius = radius + 15 + i * 8 + Math.sin(time * 8 + i) * 5;
            ctx.strokeStyle = `rgba(0, 255, 255, ${0.4 - i * 0.1})`; ctx.lineWidth = 2; ctx.setLineDash([10, 5]);
            ctx.beginPath(); ctx.arc(p.x, p.y, shockRadius, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.2 + Math.sin(time * 10) * 0.1})`;
        ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p.x, p.y, radius + Math.sin(time * 10) * 12, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    },
    resistance(ctx, p) {
        const radius = p.stats.radius + 12;
        ctx.save(); ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 4; ctx.globalAlpha = 0.7;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#A0522D'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius * 0.7, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    },
    amplification(ctx, p) {
        const time = Date.now() / 1000, radius = p.stats.radius + 8;
        ctx.save();
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        g.addColorStop(0, 'rgba(255, 69, 0, 0.8)'); g.addColorStop(1, 'rgba(255, 69, 0, 0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.fill();
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 + time * 2;
            ctx.fillStyle = '#FF4500'; ctx.beginPath();
            ctx.arc(p.x + Math.cos(angle) * radius * 0.6, p.y + Math.sin(angle) * radius * 0.6, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    },
    void(ctx, p) {
        const time = Date.now() / 1000, radius = p.stats.radius + 15;
        ctx.save(); ctx.strokeStyle = '#8A2BE2'; ctx.lineWidth = 3; ctx.globalAlpha = 0.9;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.stroke();
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(time * -1.5);
        ctx.beginPath(); ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + time * 3;
            ctx.fillStyle = '#8A2BE2'; ctx.beginPath();
            ctx.arc(p.x + Math.cos(angle) * radius * 0.8, p.y + Math.sin(angle) * radius * 0.8, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    },
    storm(ctx, p) {
        const time = Date.now() / 1000, radius = p.stats.radius + 18;
        ctx.save();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + time * 2;
            const r = radius + Math.sin(time * 5 + i) * 6;
            ctx.strokeStyle = `rgba(255, 255, 200, ${0.5 + Math.sin(time * 8) * 0.3})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(p.x + Math.cos(angle) * radius, p.y + Math.sin(angle) * radius);
            ctx.lineTo(p.x + Math.cos(angle) * r, p.y + Math.sin(angle) * r);
            ctx.stroke();
        }
        ctx.restore();
    },
    blood(ctx, p) {
        const time = Date.now() / 1000, radius = p.stats.radius + 12;
        ctx.save();
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        g.addColorStop(0, 'rgba(180, 0, 0, 0.4)');
        g.addColorStop(1, 'rgba(120, 0, 0, 0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    },
    gravity(ctx, p) {
        const time = Date.now() / 1000, radius = p.stats.radius + 20;
        ctx.save();
        ctx.strokeStyle = `rgba(100, 100, 200, ${0.4 + Math.sin(time * 4) * 0.2})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath(); ctx.arc(p.x, p.y, radius + Math.sin(time * 3) * 5, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    },
    arcane(ctx, p) {
        const time = Date.now() / 1000, radius = p.stats.radius + 14;
        ctx.save();
        ctx.strokeStyle = `rgba(200, 150, 255, ${0.5 + Math.sin(time * 6) * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + time;
            ctx.fillStyle = 'rgba(200, 150, 255, 0.8)';
            ctx.beginPath(); ctx.arc(p.x + Math.cos(angle) * radius * 0.7, p.y + Math.sin(angle) * radius * 0.7, 2, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    },
    poison(ctx, p) {
        const time = Date.now() / 1000, radius = p.stats.radius + 14;
        ctx.save();
        ctx.strokeStyle = `rgba(50, 205, 50, ${0.5 + Math.sin(time * 4) * 0.2})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    },
    fire(ctx, p) {
        const time = Date.now() / 1000, radius = p.stats.radius + 14;
        ctx.save();
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        g.addColorStop(0, 'rgba(255, 100, 0, 0.5)');
        g.addColorStop(1, 'rgba(255, 50, 0, 0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    },
    volcanic(ctx, p) {
        const time = Date.now() / 1000, radius = p.stats.radius + 18;
        ctx.save();
        ctx.strokeStyle = `rgba(255, 69, 0, ${0.4 + Math.sin(time * 5) * 0.2})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    },
    frost(ctx, p) {
        const time = Date.now() / 1000, radius = p.stats.radius + 14;
        ctx.save();
        ctx.strokeStyle = `rgba(135, 206, 235, ${0.5 + Math.sin(time * 4) * 0.2})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    },
    crystal(ctx, p) {
        const time = Date.now() / 1000, radius = p.stats.radius + 14;
        ctx.save();
        ctx.strokeStyle = `rgba(135, 206, 235, ${0.6})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    },
    stellar(ctx, p) {
        const time = Date.now() / 1000, radius = p.stats.radius + 16;
        ctx.save();
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time * 0.5;
            ctx.fillStyle = `rgba(255, 215, 0, ${0.4 + Math.sin(time * 3 + i) * 0.2})`;
            ctx.beginPath(); ctx.arc(p.x + Math.cos(angle) * radius, p.y + Math.sin(angle) * radius, 3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    },
};

export const weaponDrawers = {
    spike_ring(ctx, p, game) {
        const time = Date.now() / 1000, radius = p.stats.radius + 25;
        ctx.save(); ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 4; ctx.globalAlpha = 0.8;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.stroke();
        let spikeCount = 3;
        if (game?.weapons?.spike_ring) {
            const level = game.weapons.spike_ring.level || 1;
            spikeCount = level === 1 ? 3 : level === 2 ? 7 : 10;
        }
        for (let i = 0; i < spikeCount; i++) {
            const angle = (i / spikeCount) * Math.PI * 2 + time * 2;
            const spikeRadius = radius + Math.sin(time * 4 + i) * 3;
            const x = p.x + Math.cos(angle) * spikeRadius, y = p.y + Math.sin(angle) * spikeRadius;
            ctx.save(); ctx.translate(x, y); ctx.rotate(angle + time * 3);
            const sg = ctx.createLinearGradient(0, -12, 0, 12);
            sg.addColorStop(0, '#8B4513'); sg.addColorStop(0.5, '#A0522D'); sg.addColorStop(1, '#8B4513');
            ctx.fillStyle = sg; ctx.globalAlpha = 0.9;
            ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(-6, 0); ctx.lineTo(-3, 8); ctx.lineTo(3, 8); ctx.lineTo(6, 0); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#654321'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
        }
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time * 4;
            const x = p.x + Math.cos(angle) * radius * 0.6, y = p.y + Math.sin(angle) * radius * 0.6;
            const pg = ctx.createRadialGradient(x, y, 0, x, y, 3);
            pg.addColorStop(0, 'rgba(139, 69, 19, 1)'); pg.addColorStop(0.5, 'rgba(160, 82, 45, 0.8)'); pg.addColorStop(1, 'rgba(139, 69, 19, 0)');
            ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.strokeStyle = `rgba(139, 69, 19, ${0.3 + Math.sin(time * 6) * 0.2})`; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.arc(p.x, p.y, radius + Math.sin(time * 6) * 8, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    },
    energy_field(ctx, p) {
        const time = Date.now() / 1000, radius = p.stats.radius + 30;
        ctx.save();
        const fg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        fg.addColorStop(0, 'rgba(0, 255, 255, 0.8)'); fg.addColorStop(0.5, 'rgba(0, 255, 255, 0.4)'); fg.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#00FFFF'; ctx.lineWidth = 3; ctx.globalAlpha = 0.9;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius + Math.sin(time * 8) * 5, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 4; i++) {
            const waveRadius = radius + i * 8 + Math.sin(time * 3 + i) * 6;
            ctx.strokeStyle = `rgba(0, 255, 255, ${0.6 - i * 0.15})`; ctx.lineWidth = 2; ctx.setLineDash([10, 5]);
            ctx.beginPath(); ctx.arc(p.x, p.y, waveRadius, 0, Math.PI * 2); ctx.stroke();
        }
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + time * 5;
            const particleRadius = radius * 0.7 + Math.sin(time * 4 + i) * 10;
            const x = p.x + Math.cos(angle) * particleRadius, y = p.y + Math.sin(angle) * particleRadius;
            const pg = ctx.createRadialGradient(x, y, 0, x, y, 5);
            pg.addColorStop(0, 'rgba(0, 255, 255, 1)'); pg.addColorStop(0.5, 'rgba(0, 255, 255, 0.6)'); pg.addColorStop(1, 'rgba(0, 255, 255, 0)');
            ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
        }
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + time * 2;
            const lightningLength = 20 + Math.sin(time * 6 + i) * 10;
            ctx.strokeStyle = `rgba(0, 255, 255, ${0.8 + Math.sin(time * 8 + i) * 0.2})`; ctx.lineWidth = 3; ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(p.x + Math.cos(angle) * radius, p.y + Math.sin(angle) * radius);
            ctx.lineTo(p.x + Math.cos(angle) * (radius + lightningLength), p.y + Math.sin(angle) * (radius + lightningLength));
            ctx.stroke();
        }
        const cg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 8 + Math.sin(time * 10) * 3);
        cg.addColorStop(0, 'rgba(255, 255, 255, 1)'); cg.addColorStop(0.5, 'rgba(0, 255, 255, 0.8)'); cg.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(p.x, p.y, 8 + Math.sin(time * 10) * 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    },
    orbital_shield(ctx) { /* compatibilità - niente da disegnare */ },
    pulse_wave(ctx, p) {
        const time = Date.now() / 1000, radius = p.stats.radius + 30;
        ctx.save(); ctx.strokeStyle = '#FF1493'; ctx.lineWidth = 3; ctx.globalAlpha = 0.7;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.stroke();
        for (let i = 1; i <= 2; i++) {
            ctx.globalAlpha = 0.5 - i * 0.2;
            ctx.beginPath(); ctx.arc(p.x, p.y, radius + i * 10, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    },
    void_blade(ctx, p) {
        const time = Date.now() / 1000, radius = p.stats.radius + 12;
        ctx.save(); ctx.strokeStyle = '#8A2BE2'; ctx.lineWidth = 2; ctx.globalAlpha = 0.8;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + time * 2;
            ctx.beginPath();
            ctx.moveTo(p.x + Math.cos(angle) * radius, p.y + Math.sin(angle) * radius);
            ctx.lineTo(p.x + Math.cos(angle) * (radius + 12), p.y + Math.sin(angle) * (radius + 12));
            ctx.stroke();
        }
        ctx.restore();
    },
    crystal_barrier(ctx, p) {
        const time = Date.now() / 1000, radius = p.stats.radius + 22;
        ctx.save(); ctx.strokeStyle = '#87CEEB'; ctx.lineWidth = 3; ctx.globalAlpha = 0.8;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.fillStyle = '#87CEEB';
            ctx.beginPath(); ctx.arc(p.x + Math.cos(angle) * radius, p.y + Math.sin(angle) * radius, 4, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    },
    iron_spikes(ctx, p, game) {
        const time = Date.now() / 1000, radius = p.stats.radius + 25;
        let spikeCount = 4;
        const w = game?.weapons?.iron_spikes;
        if (w) spikeCount = w.level === 1 ? 4 : w.level === 2 ? 6 : 8;
        ctx.save(); ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 4; ctx.globalAlpha = 0.8;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < spikeCount; i++) {
            const angle = (i / spikeCount) * Math.PI * 2 + time * 2;
            const spikeRadius = radius + Math.sin(time * 4 + i) * 3;
            const x = p.x + Math.cos(angle) * spikeRadius, y = p.y + Math.sin(angle) * spikeRadius;
            ctx.save(); ctx.translate(x, y); ctx.rotate(angle + time * 3);
            const sg = ctx.createLinearGradient(0, -12, 0, 12);
            sg.addColorStop(0, '#8B4513'); sg.addColorStop(0.5, '#A0522D'); sg.addColorStop(1, '#8B4513');
            ctx.fillStyle = sg; ctx.globalAlpha = 0.9;
            ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(-6, 0); ctx.lineTo(-3, 8); ctx.lineTo(3, 8); ctx.lineTo(6, 0); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#654321'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
        }
        ctx.restore();
    },
    steel_barrier(ctx, p) {
        const radius = p.stats.radius + 20;
        ctx.save(); ctx.strokeStyle = '#708090'; ctx.lineWidth = 3; ctx.globalAlpha = 0.7;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    },
    orbital_blades(ctx, p, game) {
        const time = Date.now() / 1000, radius = p.stats.radius + 35;
        ctx.save();
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + time * 3;
            const x = p.x + Math.cos(angle) * radius, y = p.y + Math.sin(angle) * radius;
            ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
            ctx.strokeStyle = '#2F4F4F'; ctx.fillStyle = '#4A5568';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(4, 8); ctx.lineTo(-4, 8); ctx.closePath();
            ctx.fill(); ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    },
    thorn_shield(ctx, p) {
        const time = Date.now() / 1000, radius = p.stats.radius + 25;
        ctx.save(); ctx.strokeStyle = '#228B22'; ctx.lineWidth = 3; ctx.globalAlpha = 0.8;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + time;
            ctx.beginPath();
            ctx.moveTo(p.x + Math.cos(angle) * radius * 0.6, p.y + Math.sin(angle) * radius * 0.6);
            ctx.lineTo(p.x + Math.cos(angle) * radius, p.y + Math.sin(angle) * radius);
            ctx.stroke();
        }
        ctx.restore();
    },
    corrosive_mist(ctx, p) {
        const time = Date.now() / 1000, radius = p.stats.radius + 50;
        ctx.save();
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        g.addColorStop(0, 'rgba(50, 205, 50, 0.15)');
        g.addColorStop(1, 'rgba(34, 139, 34, 0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius + Math.sin(time * 2) * 5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    },
    arcane_lightning(ctx, p) {
        const time = Date.now() / 1000, radius = p.stats.radius + 25;
        ctx.save();
        ctx.strokeStyle = `rgba(200, 150, 255, ${0.4 + Math.sin(time * 8) * 0.3})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + time * 2;
            ctx.beginPath();
            ctx.moveTo(p.x + Math.cos(angle) * radius * 0.5, p.y + Math.sin(angle) * radius * 0.5);
            ctx.lineTo(p.x + Math.cos(angle) * radius, p.y + Math.sin(angle) * radius);
            ctx.stroke();
        }
        ctx.restore();
    },
};
