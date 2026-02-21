/**
 * Utility functions for the game
 * @module utils
 */

export const Utils = {
    getDistance: (obj1, obj2) => {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    findNearest: (from, targets, range = Infinity) => {
        let nearest = null;
        let minDist = range;
        for (const target of targets) {
            if (target.toRemove) continue;
            const dist = Utils.getDistance(from, target);
            if (dist < minDist) { minDist = dist; nearest = target; }
        }
        return nearest;
    },

    /** Distance from a point to a line segment. point, segStart, segEnd are { x, y }. */
    getDistanceToSegment: (point, segStart, segEnd) => {
        const ax = segStart.x;
        const ay = segStart.y;
        const bx = segEnd.x;
        const by = segEnd.y;
        const px = point.x;
        const py = point.y;
        const abx = bx - ax;
        const aby = by - ay;
        const apx = px - ax;
        const apy = py - ay;
        const ab2 = abx * abx + aby * aby;
        if (ab2 === 0) return Math.sqrt(apx * apx + apy * apy);
        let t = (apx * abx + apy * aby) / ab2;
        t = Math.max(0, Math.min(1, t));
        const qx = ax + t * abx;
        const qy = ay + t * aby;
        const dx = px - qx;
        const dy = py - qy;
        return Math.sqrt(dx * dx + dy * dy);
    },

    drawJaggedLine: (ctx, x1, y1, x2, y2, segments) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        const dx = x2 - x1, dy = y2 - y1, dist = Math.sqrt(dx * dx + dy * dy);
        for (let i = 1; i < segments; i++) {
            const t = i / segments, tx = x1 + dx * t, ty = y1 + dy * t;
            const offset = (Math.random() - 0.5) * (dist / segments) * 2;
            ctx.lineTo(tx - dy / dist * offset, ty + dx / dist * offset);
        }
        ctx.lineTo(x2, y2);
        ctx.stroke();
    },

    drawPolygon: (ctx, x, y, radius, sides, angle = 0, color = 'red') => {
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
        for (let i = 1; i <= sides; i++) {
            ctx.lineTo(
                x + radius * Math.cos(angle + i * 2 * Math.PI / sides),
                y + radius * Math.sin(angle + i * 2 * Math.PI / sides)
            );
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    },

    /** @param {CanvasRenderingContext2D} ctx @param {number} x @param {number} y @param {number} w @param {number} h @param {number} r @param {boolean} doFill @param {boolean} doStroke */
    drawRoundedRect: (ctx, x, y, w, h, r, doFill = true, doStroke = false) => {
        const rad = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + rad, y);
        ctx.lineTo(x + w - rad, y);
        ctx.arc(x + w - rad, y + rad, rad, -Math.PI / 2, 0);
        ctx.lineTo(x + w, y + h - rad);
        ctx.arc(x + w - rad, y + h - rad, rad, 0, Math.PI / 2);
        ctx.lineTo(x + rad, y + h);
        ctx.arc(x + rad, y + h - rad, rad, Math.PI / 2, Math.PI);
        ctx.lineTo(x, y + rad);
        ctx.arc(x + rad, y + rad, rad, Math.PI, Math.PI * 1.5);
        ctx.closePath();
        if (doFill) ctx.fill();
        if (doStroke) ctx.stroke();
    },

    drawGroundShadow: (ctx, x, y, radius) => {
        ctx.save();
        ctx.translate(x, y + radius * 1.1);
        ctx.scale(1.2, 0.35);
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    },

    drawSpecularHighlight: (ctx, x, y, radius) => {
        ctx.save();
        ctx.translate(x, y);
        const grad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, 0, -radius * 0.3, -radius * 0.3, radius * 0.8);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    },

    drawEnemySprite: (ctx, x, y, radius, type, color, isElite = false) => {
        Utils.drawGroundShadow(ctx, x, y, radius);
        ctx.save();
        switch (type) {
            case 'circle': Utils.drawSlimeSprite(ctx, x, y, radius, color, isElite); break;
            case 'triangle': Utils.drawGoblinSprite(ctx, x, y, radius, color, isElite); break;
            case 'square': Utils.drawGolemSprite(ctx, x, y, radius, color, isElite); break;
            case 'diamond': Utils.drawIceSprite(ctx, x, y, radius, color, isElite); break;
            case 'star': Utils.drawDemonSprite(ctx, x, y, radius, color, isElite); break;
            default: Utils.drawSlimeSprite(ctx, x, y, radius, color, isElite);
        }
        ctx.restore();
        Utils.drawSpecularHighlight(ctx, x, y, radius);
    },

    drawSlimeSprite: (ctx, x, y, radius, color, isElite) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isElite ? '#ff0000' : '#1a1a1a';
        ctx.lineWidth = 3;
        ctx.stroke();
        const eyeSize = radius * 0.25;
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.2, eyeSize, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.3, y - radius * 0.2, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.2, eyeSize * 0.6, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.3, y - radius * 0.2, eyeSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x, y + radius * 0.3, radius * 0.4, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 3; i++) {
            const toothX = x - radius * 0.2 + i * radius * 0.2;
            ctx.beginPath();
            ctx.moveTo(toothX, y + radius * 0.3);
            ctx.lineTo(toothX - 2, y + radius * 0.5);
            ctx.lineTo(toothX + 2, y + radius * 0.5);
            ctx.closePath();
            ctx.fill();
        }
        if (isElite) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#ff6600';
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI * 2) / 4;
                const fx = x + Math.cos(angle) * (radius + 6);
                const fy = y + Math.sin(angle) * (radius + 6);
                ctx.beginPath();
                ctx.moveTo(fx, fy);
                ctx.lineTo(fx + Math.cos(angle - 0.2) * 8, fy + Math.sin(angle - 0.2) * 8);
                ctx.lineTo(fx + Math.cos(angle + 0.2) * 8, fy + Math.sin(angle + 0.2) * 8);
                ctx.closePath();
                ctx.fill();
            }
        }
    },

    drawGoblinSprite: (ctx, x, y, radius, color, isElite) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y - radius);
        ctx.lineTo(x - radius * 0.9, y + radius * 0.6);
        ctx.lineTo(x + radius * 0.9, y + radius * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.1, radius * 0.25, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.3, y - radius * 0.1, radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.1, radius * 0.15, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.3, y - radius * 0.1, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x, y + radius * 0.2, radius * 0.4, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(x - radius * 0.25, y + radius * 0.1);
        ctx.lineTo(x - radius * 0.15, y + radius * 0.4);
        ctx.lineTo(x - radius * 0.35, y + radius * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + radius * 0.25, y + radius * 0.1);
        ctx.lineTo(x + radius * 0.15, y + radius * 0.4);
        ctx.lineTo(x + radius * 0.35, y + radius * 0.4);
        ctx.closePath();
        ctx.fill();
        if (isElite) {
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(x, y - radius - 4);
            ctx.lineTo(x - radius * 0.9, y + radius * 0.6 + 4);
            ctx.lineTo(x + radius * 0.9, y + radius * 0.6 + 4);
            ctx.closePath();
            ctx.stroke();
        }
    },

    drawGolemSprite: (ctx, x, y, radius, color, isElite) => {
        ctx.fillStyle = color;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - radius, y - radius, radius * 2, radius * 2);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(x - radius * 0.4, y - radius * 0.3, radius * 0.35, radius * 0.35);
        ctx.fillRect(x + radius * 0.05, y - radius * 0.3, radius * 0.35, radius * 0.35);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x - radius * 0.3, y - radius * 0.2, radius * 0.15, radius * 0.15);
        ctx.fillRect(x + radius * 0.15, y - radius * 0.2, radius * 0.15, radius * 0.15);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x - radius * 0.4, y + radius * 0.2, radius * 0.8, radius * 0.15);
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 4; i++) {
            const toothX = x - radius * 0.3 + i * radius * 0.2;
            ctx.fillRect(toothX, y + radius * 0.2, 4, 8);
        }
        if (isElite) {
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 5;
            ctx.strokeRect(x - radius - 3, y - radius - 3, radius * 2 + 6, radius * 2 + 6);
        }
    },

    drawIceSprite: (ctx, x, y, radius, color, isElite) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y - radius);
        ctx.lineTo(x + radius * 0.8, y - radius * 0.4);
        ctx.lineTo(x + radius * 0.8, y + radius * 0.4);
        ctx.lineTo(x, y + radius);
        ctx.lineTo(x - radius * 0.8, y + radius * 0.4);
        ctx.lineTo(x - radius * 0.8, y - radius * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.2, radius * 0.25, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.3, y - radius * 0.2, radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.2, radius * 0.15, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.3, y - radius * 0.2, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
        if (isElite) {
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(x, y - radius - 4);
            ctx.lineTo(x + radius * 0.8, y - radius * 0.4);
            ctx.lineTo(x + radius * 0.8, y + radius * 0.4);
            ctx.lineTo(x, y + radius + 4);
            ctx.lineTo(x - radius * 0.8, y + radius * 0.4);
            ctx.lineTo(x - radius * 0.8, y - radius * 0.4);
            ctx.closePath();
            ctx.stroke();
        }
    },

    drawDemonSprite: (ctx, x, y, radius, color, isElite) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const outerRadius = radius;
            const innerRadius = radius * 0.4;
            if (i === 0) {
                ctx.moveTo(x + Math.cos(angle) * outerRadius, y + Math.sin(angle) * outerRadius);
            } else {
                ctx.lineTo(x + Math.cos(angle) * outerRadius, y + Math.sin(angle) * outerRadius);
            }
            const nextAngle = ((i + 0.5) * Math.PI * 2) / 5 - Math.PI / 2;
            ctx.lineTo(x + Math.cos(nextAngle) * innerRadius, y + Math.sin(nextAngle) * innerRadius);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.2, radius * 0.3, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.3, y - radius * 0.2, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.2, radius * 0.2, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.3, y - radius * 0.2, radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
        if (isElite) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 5;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
                const outerRadius = radius + 4;
                const innerRadius = (radius + 4) * 0.4;
                if (i === 0) {
                    ctx.moveTo(x + Math.cos(angle) * outerRadius, y + Math.sin(angle) * outerRadius);
                } else {
                    ctx.lineTo(x + Math.cos(angle) * outerRadius, y + Math.sin(angle) * outerRadius);
                }
                const nextAngle = ((i + 0.5) * Math.PI * 2) / 5 - Math.PI / 2;
                ctx.lineTo(x + Math.cos(nextAngle) * innerRadius, y + Math.sin(nextAngle) * innerRadius);
            }
            ctx.closePath();
            ctx.stroke();
        }
    }
};
