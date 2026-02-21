import { Utils } from '../utils/index.js';

/**
 * Specialized rendering module for Player Archetypes.
 * Handles volumetric effects (shadows, highlights) and complex procedural models.
 */
export const PlayerDraw = {
    /**
     * Draws a soft drop-shadow under the player.
     */
    drawShadow: (ctx, player) => {
        const r = player.stats.radius;
        const pulse = Math.sin(Date.now() * 0.002) * 2;

        ctx.save();
        ctx.translate(player.x, player.y + r * 1.2);
        ctx.scale(1.2, 0.4);

        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },

    /**
     * Draws a 3D specular highlight on the player.
     */
    drawHighlight: (ctx, player) => {
        const r = player.stats.radius;
        ctx.save();
        ctx.translate(player.x, player.y);

        const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, -r * 0.3, -r * 0.3, r * 0.7);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },

    /**
     * Standard Archetype
     */
    drawStandard: (ctx, player) => {
        const r = player.stats.radius;
        const t = Date.now() * 0.002;
        const pulse = Math.sin(t) * 2;

        PlayerDraw.drawShadow(ctx, player);

        ctx.save();
        ctx.translate(player.x, player.y);

        // Outer glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = player.archetype.color;

        // Core
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r + pulse);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, player.archetype.color);
        grad.addColorStop(1, 'rgba(68, 136, 255, 0.1)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Orbiting Rings
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.ellipse(0, 0, r + 4 + pulse, r / 2, t, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = player.archetype.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, r + 4 + pulse, r / 2, -t * 1.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

        PlayerDraw.drawHighlight(ctx, player);
    },

    /**
     * Steel Archetype
     */
    drawSteel: (ctx, player) => {
        const r = player.stats.radius;
        const t = Date.now() * 0.001;

        PlayerDraw.drawShadow(ctx, player);

        ctx.save();
        ctx.translate(player.x, player.y);

        ctx.shadowBlur = 10;
        ctx.shadowColor = '#7f8c8d';

        // Metallic Core
        const grad = ctx.createRadialGradient(-r / 3, -r / 3, 0, 0, 0, r);
        grad.addColorStop(0, '#ecf0f1');
        grad.addColorStop(0.5, player.archetype.color);
        grad.addColorStop(1, '#2c3e50');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // Rotating Armor Plates
        ctx.rotate(t);
        ctx.strokeStyle = '#95a5a6';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';

        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, r + 2, i * (Math.PI * 2 / 3) + 0.2, (i + 1) * (Math.PI * 2 / 3) - 0.2);
            ctx.stroke();
        }

        // Inner details
        ctx.rotate(-t * 2);
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, r - 5, i * (Math.PI * 2 / 3), (i + 1) * (Math.PI * 2 / 3) - 0.5);
            ctx.stroke();
        }

        ctx.restore();
        PlayerDraw.drawHighlight(ctx, player);
    },

    /**
     * Magma Archetype
     */
    drawMagma: (ctx, player) => {
        const r = player.stats.radius;
        const t = Date.now() * 0.005;
        const pulse = Math.sin(t * 0.5) * 3;

        PlayerDraw.drawShadow(ctx, player);

        ctx.save();
        ctx.translate(player.x, player.y);

        // Deep glow
        ctx.shadowBlur = 20 + pulse * 2;
        ctx.shadowColor = '#ff4500';

        // Core
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        grad.addColorStop(0, '#ffffcc');
        grad.addColorStop(0.3, '#ffaa00');
        grad.addColorStop(0.8, '#ff3300');
        grad.addColorStop(1, '#8b0000');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // Animated flames
        ctx.fillStyle = 'rgba(255, 69, 0, 0.6)';
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const a = (i * Math.PI * 2) / 8 + t * 0.2;
            const flameHeight = r + 5 + Math.sin(t + i) * 6;
            const ctrlDist = r + 2;

            const pX = Math.cos(a) * flameHeight;
            const pY = Math.sin(a) * flameHeight;

            const c1a = a - 0.2;
            const c1X = Math.cos(c1a) * ctrlDist;
            const c1Y = Math.sin(c1a) * ctrlDist;

            if (i === 0) ctx.moveTo(pX, pY);
            else ctx.quadraticCurveTo(c1X, c1Y, pX, pY);
        }
        ctx.closePath();
        ctx.fill();

        ctx.restore();
        PlayerDraw.drawHighlight(ctx, player);
    },

    /**
     * Frost Archetype
     */
    drawFrost: (ctx, player) => {
        const r = player.stats.radius;
        const t = Date.now() * 0.001;

        PlayerDraw.drawShadow(ctx, player);

        ctx.save();
        ctx.translate(player.x, player.y);

        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ffff';

        // Core crystal
        ctx.fillStyle = 'rgba(52, 152, 219, 0.4)';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Rotating Snowflake / Crystal layers
        ctx.strokeStyle = '#ecf0f1';
        ctx.lineWidth = 2;

        // Outer slow rotation
        ctx.rotate(t * 0.5);
        Utils.drawPolygon(ctx, 0, 0, r + Math.sin(t * 2), 6, 0, 'rgba(52, 152, 219, 0.6)');
        ctx.stroke();

        // Inner fast reverse rotation
        ctx.rotate(-t * 1.5);
        ctx.strokeStyle = '#00ffff';
        Utils.drawPolygon(ctx, 0, 0, r * 0.8, 6, 0, 'transparent');
        ctx.stroke();

        ctx.restore();
        PlayerDraw.drawHighlight(ctx, player);
    },

    /**
     * Shadow Archetype
     */
    drawShadowModel: (ctx, player) => {
        const r = player.stats.radius;
        const t = Date.now() * 0.002;

        PlayerDraw.drawShadow(ctx, player);

        ctx.save();
        ctx.translate(player.x, player.y);

        ctx.shadowBlur = 25;
        ctx.shadowColor = '#4a235a'; // Deep purple glow

        // Event Horizon
        const g = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r * 1.5);
        g.addColorStop(0, '#000000');
        g.addColorStop(0.6, player.archetype.color);
        g.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Swirling dark matter
        ctx.strokeStyle = 'rgba(142, 68, 173, 0.5)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.rotate(t + i * Math.PI / 1.5);
            ctx.beginPath();
            ctx.ellipse(0, 0, r * 1.2, r * 0.4, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
        // Shadow highlight is darker
        ctx.save();
        ctx.translate(player.x, player.y);
        const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, -r * 0.3, -r * 0.3, r * 0.7);
        grad.addColorStop(0, 'rgba(100, 50, 255, 0.2)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    },

    /**
     * Tech Archetype
     */
    drawTech: (ctx, player) => {
        const r = player.stats.radius;
        const t = Date.now() * 0.002;

        PlayerDraw.drawShadow(ctx, player);

        ctx.save();
        ctx.translate(player.x, player.y);

        ctx.shadowBlur = 10;
        ctx.shadowColor = player.archetype.color;

        // Center node
        ctx.fillStyle = '#16a085';
        ctx.beginPath(); ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = player.archetype.color;
        ctx.lineWidth = 2;

        // Ring 1 (Inner, rotating right)
        ctx.save();
        ctx.rotate(t);
        ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, Math.PI * 1.5); ctx.stroke();
        ctx.fillStyle = player.archetype.color;
        ctx.beginPath(); ctx.arc(r * 0.6, 0, 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Ring 2 (Middle, rotating left)
        ctx.save();
        ctx.rotate(-t * 1.2);
        ctx.beginPath(); ctx.arc(0, 0, r * 0.85, Math.PI * 0.5, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, r * 0.85, 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Ring 3 (Outer, segments)
        ctx.save();
        ctx.rotate(t * 0.8);
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, r * 1.1, i * Math.PI / 2, i * Math.PI / 2 + 0.5);
            ctx.stroke();
        }
        ctx.restore();

        ctx.restore();
        PlayerDraw.drawHighlight(ctx, player);
    },

    /**
     * Prism Archetype
     */
    drawPrism: (ctx, player) => {
        const r = player.stats.radius;
        const t = Date.now() * 0.001;
        const pulse = Math.sin(t * 3) * 2;

        PlayerDraw.drawShadow(ctx, player);

        ctx.save();
        ctx.translate(player.x, player.y);

        // Dynamically changing shadow color
        const hue = (Date.now() / 20) % 360;
        ctx.shadowBlur = 20 + pulse;
        ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;

        // Core isometric diamond
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.4)`;
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(r, 0);
        ctx.lineTo(0, r);
        ctx.lineTo(-r, 0);
        ctx.fill();

        // 3D-like wireframe
        ctx.strokeStyle = `hsl(${(hue + 60) % 360}, 100%, 70%)`;
        ctx.lineWidth = 2;
        ctx.rotate(t);

        for (let i = 0; i < 6; i++) {
            const a = i * Math.PI / 3;
            const nextA = (i + 1) * Math.PI / 3;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * (r * 0.4 + pulse), Math.sin(a) * (r * 0.4 + pulse));
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            ctx.lineTo(Math.cos(nextA) * r, Math.sin(nextA) * r);
            ctx.stroke();
        }

        ctx.restore();
        PlayerDraw.drawHighlight(ctx, player);
    },

    /**
     * Unstable Archetype
     */
    drawUnstable: (ctx, player) => {
        const r = player.stats.radius;
        const t = Date.now() * 0.005;
        const pulse = Math.sin(t * 0.8) * 3;

        PlayerDraw.drawShadow(ctx, player);

        ctx.save();
        ctx.translate(player.x, player.y);

        const colorPhase = (Date.now() / 150) % 3;
        const baseColor = colorPhase < 1 ? '#ff1744' : colorPhase < 2 ? '#ffea00' : '#ffffff';

        ctx.shadowBlur = 15 + Math.random() * 10;
        ctx.shadowColor = baseColor;

        // Core
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.5 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Sparking electrical arcs
        ctx.strokeStyle = '#ffea00';
        ctx.lineWidth = 1.5;

        for (let i = 0; i < 6; i++) {
            if (Math.random() > 0.4) continue;
            const a = Math.random() * Math.PI * 2;
            const len = r * (0.8 + Math.random() * 0.5);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            const midX = Math.cos(a + 0.2) * len * 0.5;
            const midY = Math.sin(a + 0.2) * len * 0.5;
            ctx.lineTo(midX, midY);
            ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
            ctx.stroke();
        }

        ctx.restore();
        PlayerDraw.drawHighlight(ctx, player);
    },

    /**
     * Druid Archetype
     */
    drawDruid: (ctx, player) => {
        const r = player.stats.radius;
        const t = Date.now() * 0.001;
        const pulse = Math.sin(t * 2) * 2;

        PlayerDraw.drawShadow(ctx, player);

        ctx.save();
        ctx.translate(player.x, player.y);

        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00e676';

        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r + pulse);
        grad.addColorStop(0, '#76ff03');
        grad.addColorStop(0.5, 'rgba(0, 230, 118, 0.4)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r + pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#00e676';
        for (let i = 0; i < 4; i++) {
            const a = t * 1.5 + i * Math.PI / 2;
            const orbitDist = r * 1.4 + Math.sin(t * 3 + i) * 2;
            ctx.save();
            ctx.translate(Math.cos(a) * orbitDist, Math.sin(a) * orbitDist);
            ctx.rotate(a + Math.PI / 4);
            ctx.beginPath();
            ctx.ellipse(0, 0, 4, 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.restore();
        PlayerDraw.drawHighlight(ctx, player);
    },

    /**
     * Phantom Archetype
     */
    drawPhantom: (ctx, player) => {
        const r = player.stats.radius;
        const t = Date.now() * 0.002;

        PlayerDraw.drawShadow(ctx, player);

        ctx.save();
        ctx.translate(player.x, player.y);

        const hoverOffset = Math.sin(t) * 3;
        ctx.globalAlpha = 0.6 + Math.sin(t * 0.5) * 0.2;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#e0f7fa';

        ctx.fillStyle = 'rgba(176, 190, 197, 0.6)';
        ctx.beginPath();
        ctx.moveTo(0, -r + hoverOffset);
        ctx.bezierCurveTo(r, -r + hoverOffset, r * 1.2, r * 0.5 + hoverOffset, 0, r * 1.5 + hoverOffset);
        ctx.bezierCurveTo(-r * 1.2, r * 0.5 + hoverOffset, -r, -r + hoverOffset, 0, -r + hoverOffset);
        ctx.fill();

        const g = ctx.createRadialGradient(0, hoverOffset, 0, 0, hoverOffset, r);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.5, 'rgba(176, 190, 197, 0.5)');
        g.addColorStop(1, 'rgba(176, 190, 197, 0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0, hoverOffset, r, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath(); ctx.arc(-5, -4 + hoverOffset, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(5, -4 + hoverOffset, 2, 0, Math.PI * 2); ctx.fill();

        ctx.restore();
    }
};
