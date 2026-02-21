/**
 * Particle and Visual Effect Entity Classes
 * Particle, FireTrail, Effect
 * @module entities/Particles
 */

import { Entity } from './Entity.js';
import { Utils } from '../utils/index.js';

export class Particle extends Entity {
    constructor(x, y, props) {
        super(x, y);
        Object.assign(this, props);
        this.initialLife = props.life ?? 30;
    }

    update(game) {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        if (this.life <= 0) this.toRemove = true;
    }

    draw(ctx, game) {
        ctx.globalAlpha = Math.max(0, this.life / this.initialLife);
        ctx.fillStyle = this.color || '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

export class FireTrail extends Entity {
    constructor(x, y, props) {
        super(x, y);
        this.radius = props.radius || 10;
        this.damage = props.damage || 0;
        this.life = 60;
        this.initialLife = 60;
    }

    update(game) {
        this.life--;
        if (this.life <= 0) this.toRemove = true;
        game.getEnemiesAndBosses().forEach(enemy => {
            if (enemy.toRemove) return;
            if (Utils.getDistance(enemy, this) < enemy.stats.radius + this.radius) {
                enemy.takeDamage(this.damage / 60, game);
            }
        });
    }

    draw(ctx, game) {
        ctx.globalAlpha = (this.life / this.initialLife) * 0.7;
        const g = ctx.createRadialGradient(this.x, this.y, 1, this.x, this.y, this.radius);
        g.addColorStop(0, 'rgba(255, 150, 0, 0.8)');
        g.addColorStop(1, 'rgba(255, 50, 0, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

export class Effect extends Entity {
    constructor(x, y, props) {
        super(x, y);
        Object.assign(this, props);
        if (typeof this.onStart === 'function') {
            this.onStart();
        }
    }

    update(game) {
        this.life--;
        if (this.life <= 0) this.toRemove = true;
    }

    draw(ctx, game) {
        const opacity = this.life / (this.initialLife || 1);
        if (this.type === 'emp_wave' || this.type === 'explosion' || this.type === 'level_up_burst') {
            const currentRadius = this.maxRadius * (1 - opacity);
            let color = this.color || '136,170,255';
            if (this.type === 'explosion' && !this.color) color = '255,150,0';
            if (this.type === 'level_up_burst' && !this.color) color = '255,215,0';
            ctx.strokeStyle = `rgba(${color},${opacity})`;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === 'lightning_chain') {
            ctx.strokeStyle = `rgba(255,255,0,${opacity})`;
            const baseLw = (game?.canvasScale ?? 1) > 1 ? 5 : 3;
            ctx.lineWidth = Math.random() * 3 + baseLw;
            Utils.drawJaggedLine(ctx, this.from.x, this.from.y, this.to.x, this.to.y, 10);
        } else if (this.type === 'meteor_indicator') {
            ctx.strokeStyle = `rgba(${this.color || '255,100,0'},${1 - opacity})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === 'armageddon_flash') {
            const w = game.canvas.width;
            const h = game.canvas.height;
            ctx.fillStyle = `rgba(255, 50, 50, ${opacity * 0.8})`;
            // Fill based on camera offset to cover entire screen relative to world
            ctx.fillRect(game.camera.x - w / 2, game.camera.y - h / 2, w * 2, h * 2);
        } else if (this.type === 'pulsar_ray') {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            // Outer glow
            const g = ctx.createLinearGradient(0, -this.width / 2, 0, this.width / 2);
            g.addColorStop(0, 'rgba(0, 255, 255, 0)');
            g.addColorStop(0.5, `rgba(0, 191, 255, ${opacity * 0.6})`);
            g.addColorStop(1, 'rgba(0, 255, 255, 0)');

            ctx.fillStyle = g;
            ctx.fillRect(0, -this.width / 2, this.range, this.width);

            // Inner core
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.fillRect(0, -this.width / 4, this.range, this.width / 2);

            ctx.restore();
        }
    }
}
