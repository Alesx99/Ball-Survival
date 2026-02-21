/**
 * Item Entity Classes
 * Chest, DroppedItem
 * @module entities/Items
 */

import { Entity } from './Entity.js';
import { CONFIG } from '../config/index.js';
import { Utils } from '../utils/index.js';

export class Chest extends Entity {
    constructor(x, y, rarity = 'normal') {
        super(x, y);
        this.size = CONFIG.chest.size;
        this.rarity = rarity; // 'normal', 'epic', 'legendary'
        this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update(game) {
        this.pulsePhase += 0.05;
        const centerX = this.x + this.size / 2;
        const centerY = this.y + this.size / 2;
        const dist = Utils.getDistance(game.player, { x: centerX, y: centerY });

        if (dist < game.player.stats.radius + this.size) {
            const { DroppedItem, Particle } = game._entityClasses;
            const luck = game.player.modifiers?.luck || 0;

            let itemDrops = 1;
            let gemMin = 5;
            let gemMax = 15;
            let possibleItems = Object.keys(CONFIG.itemTypes).filter(k => k !== 'LEGENDARY_ORB');
            let guaranteedItem = null;

            if (this.rarity === 'epic') {
                gemMin = 20;
                gemMax = 50;
                possibleItems = ['DAMAGE_BOOST', 'INVINCIBILITY', 'HEAL_POTION']; // High value standard items
                if (Math.random() < 0.3) itemDrops = 2;
            } else if (this.rarity === 'legendary') {
                gemMin = 100;
                gemMax = 100; // Fixed 100 guaranteed, plus standard gem scaling later
                guaranteedItem = 'LEGENDARY_ORB';
                if (Math.random() < 0.5) itemDrops = 3;
            }

            // Spawn items
            for (let i = 0; i < itemDrops; i++) {
                let typeToSpawn;
                if (i === 0 && guaranteedItem) {
                    typeToSpawn = guaranteedItem;
                } else {
                    typeToSpawn = possibleItems[Math.floor(Math.random() * possibleItems.length)];
                }

                // Spread items slightly if multiple
                const offX = (Math.random() - 0.5) * 40;
                const offY = (Math.random() - 0.5) * 40;
                game.addEntity('droppedItems', new DroppedItem(centerX + offX, this.y - 10 + offY, typeToSpawn));
            }

            // Trigger alarm per Epic / Legendary
            if (this.rarity === 'epic' || this.rarity === 'legendary') {
                if (game.spawnSystem && game.spawnSystem.triggerChestAlarm) {
                    game.spawnSystem.triggerChestAlarm(centerX, centerY, this.rarity);
                    game.addScreenShake?.(15);
                }
            }

            // Spawn Gems
            if (this.rarity !== 'normal' || Math.random() < 0.7 + luck) {
                const gemsFound = gemMin + Math.floor(Math.random() * (gemMax - gemMin) * (1 + luck));
                game.gemsThisRun += gemsFound;
                game.notifications.push({ text: `+${gemsFound} Gemme!${this.rarity !== 'normal' ? ' (' + this.rarity.toUpperCase() + ')' : ''}`, life: 200, color: '#f1c40f' });
            }

            // Visual explosion
            const particleCount = this.rarity === 'legendary' ? 40 : (this.rarity === 'epic' ? 20 : 10);
            const pColors = this.rarity === 'legendary' ? ['#f1c40f', '#e67e22', '#ffffff'] : (this.rarity === 'epic' ? ['#9b59b6', '#8e44ad', '#fff'] : ['#8B4513', '#FFD700', '#fff']);
            for (let i = 0; i < particleCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = (this.rarity === 'legendary' ? 4 : 2) + Math.random() * 4;
                game.addEntity('particles', new Particle(centerX, centerY, {
                    vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                    life: 20 + Math.random() * 30, color: pColors[Math.floor(Math.random() * pColors.length)], size: 2 + Math.random() * 3
                }));
            }
            if (this.rarity === 'legendary') game.addScreenShake?.(10);
            if (this.rarity === 'epic') game.addScreenShake?.(5);

            this.toRemove = true;
        }
    }

    draw(ctx, game) {
        ctx.save();
        const pulse = Math.sin(this.pulsePhase);

        let mainColor = '#8B4513';
        let detailColor = '#FFD700';
        let glowColor = 'transparent';
        let glowV = 0;

        if (this.rarity === 'epic') {
            mainColor = '#4a235a';
            detailColor = '#9b59b6';
            glowColor = '#8e44ad';
            glowV = 10 + pulse * 5;
        } else if (this.rarity === 'legendary') {
            mainColor = '#f39c12';
            detailColor = '#f1c40f';
            glowColor = '#f1c40f';
            glowV = 15 + pulse * 10;
        }

        if (glowV > 0) {
            ctx.shadowBlur = glowV;
            ctx.shadowColor = glowColor;
        }

        // Base box
        ctx.fillStyle = mainColor;
        Utils.drawRoundedRect(ctx, this.x, this.y, this.size, this.size, 4, true, false);

        // Remove shadow for inner details to keep them crisp
        ctx.shadowBlur = 0;

        // Details / Straps
        ctx.fillStyle = detailColor;
        ctx.fillRect(this.x + this.size * 0.2, this.y, this.size * 0.15, this.size);
        ctx.fillRect(this.x + this.size * 0.65, this.y, this.size * 0.15, this.size);
        ctx.fillRect(this.x, this.y + this.size * 0.4, this.size, this.size * 0.2);

        // Lock
        const lockBob = this.rarity === 'legendary' ? pulse * 2 : 0;
        ctx.fillStyle = '#ecf0f1';
        Utils.drawRoundedRect(ctx, this.x + this.size * 0.4, this.y + this.size * 0.35 + lockBob, this.size * 0.2, this.size * 0.3, 2, true, false);

        // Inner lock hole
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(this.x + this.size * 0.47, this.y + this.size * 0.45 + lockBob, this.size * 0.06, this.size * 0.1);

        // Floating particle effect for legendary
        if (this.rarity === 'legendary' && Math.random() < 0.2) {
            const { Particle } = game._entityClasses;
            game.addEntity('particles', new Particle(
                this.x + Math.random() * this.size,
                this.y + this.size,
                { vx: (Math.random() - 0.5) * 0.5, vy: -1 - Math.random() * 2, life: 30, color: '#f1c40f', size: 1.5 }
            ));
        }

        ctx.restore();
    }
}

export class DroppedItem extends Entity {
    constructor(x, y, type) {
        super(x, y);
        this.type = type;
        this.life = 600;
    }

    update(game) {
        this.life--;
        if (this.life <= 0) this.toRemove = true;

        const dist = Utils.getDistance(game.player, this);
        if (dist < game.player.stats.radius + 10) {
            const itemInfo = CONFIG.itemTypes[this.type];
            if (itemInfo && itemInfo.isActive) {
                // Tenta di aggiungere l'oggetto attivo alla hotbar
                const added = game.player.addItemToHotbar(this.type);
                if (added) {
                    game.notifications.push({ text: itemInfo.name + " (Premi 1, 2 o 3)", life: 300, color: '#f1c40f' });
                    game.audio?.playPickup?.();
                    this.toRemove = true; // Rimosso solo se aggiunto
                } else if (!this._fullInventoryNotified) {
                    game.notifications.push({ text: "Inventario Pieno!", life: 180, color: '#e74c3c' });
                    this._fullInventoryNotified = true; // Evita spam di notifiche ad ogni frame di contatto
                }
            } else {
                // Oggetto passivo immediato
                game.applyItemEffect(this);
                this.toRemove = true;
            }
        } else {
            this._fullInventoryNotified = false; // Reset notifica quando esce dal raggio
        }
    }

    draw(ctx, game) {
        const itemInfo = CONFIG.itemTypes[this.type] || { color: '#ffffff' };
        ctx.save();
        ctx.globalAlpha = this.life > 60 ? 1.0 : Math.max(0, this.life / 60);
        const bob = Math.sin(Date.now() / 200 + this.x) * 3;
        ctx.fillStyle = itemInfo.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y + bob, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }
}

export class Relic extends Entity {
    constructor(x, y, type) {
        super(x, y);
        this.type = type; // 'silver_ring', 'gold_ring', 'metaglio_left', 'metaglio_right'
        this.size = 20;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.poolType = 'Relic';
    }

    update(game) {
        this.pulsePhase += 0.05;
        const dist = Utils.getDistance(game.player, this);

        if (dist < game.player.stats.radius + this.size) {
            if (this.type === 'silver_ring') {
                game.player.modifiers.area += 0.4;
                game.player.modifiers.curse += 0.5;
                if (game.notifications) game.notifications.push({ text: "Anello d'Argento! Area ++, Maledizione ++", life: 180, color: '#c0c0c0' });
            } else if (this.type === 'gold_ring') {
                game.player.modifiers.frequency *= 0.6;
                game.player.modifiers.curse += 0.5;
                if (game.notifications) game.notifications.push({ text: "Anello d'Oro! Ricarica Rapida, Maledizione ++", life: 180, color: '#ffd700' });
            } else if (this.type === 'metaglio_left') {
                game.player.modifiers.hpRegen += 2;
                game.player.stats.maxHp += 100;
                game.player.hp = Math.min(game.player.hp + 100, game.player.stats.maxHp);
                game.player.modifiers.curse += 0.5;
                if (game.notifications) game.notifications.push({ text: "Metaglio Sinistro! Cure ++, Maledizione ++", life: 180, color: '#ff3333' });
            } else if (this.type === 'metaglio_right') {
                game.player.modifiers.curse += 1.0;
                game.player.stats.dr = Math.min(0.95, game.player.stats.dr + 0.15);
                if (game.notifications) game.notifications.push({ text: "Metaglio Destro! Difesa ++, Maledizione ++++", life: 180, color: '#3333ff' });
            }

            game.audio?.playLevelUp();
            this.toRemove = true;
        }
    }

    draw(ctx, game) {
        ctx.save();
        ctx.translate(this.x, this.y);
        const scale = 1 + Math.sin(this.pulsePhase) * 0.1;
        ctx.scale(scale, scale);

        ctx.lineWidth = 4;
        if (this.type === 'silver_ring') {
            ctx.strokeStyle = '#e0e0e0';
            ctx.shadowColor = '#e0e0e0';
        } else if (this.type === 'gold_ring') {
            ctx.strokeStyle = '#ffd700';
            ctx.shadowColor = '#ffd700';
        } else if (this.type === 'metaglio_left') {
            ctx.strokeStyle = '#ff3333';
            ctx.shadowColor = '#ff3333';
        } else if (this.type === 'metaglio_right') {
            ctx.strokeStyle = '#3333ff';
            ctx.shadowColor = '#3333ff';
        }

        ctx.shadowBlur = 15;
        ctx.beginPath();
        if (this.type.includes('ring')) {
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        } else {
            // Metaglio
            ctx.moveTo(0, -this.size);
            ctx.lineTo(this.size, 0);
            ctx.lineTo(0, this.size);
            ctx.lineTo(-this.size, 0);
            ctx.closePath();
        }
        ctx.stroke();
        ctx.restore();
    }
}
