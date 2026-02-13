import { Utils } from '../utils/index.js';
import { Projectile } from '../entities/Projectile.js';
import { Aura, StaticField, Orbital, Sanctuary } from '../entities/Areas.js';
import { Particle, FireTrail, Effect } from '../entities/Particles.js';

export const SpellSystem = {

    resetSpells() {
        this.spells = {
            magicMissile: { id: 'magicMissile', name: "Proiettile Magico", level: 0, evolution: 'none', mastered: false, damage: 14, cooldown: 1200, lastCast: 0, speed: 6, size: 5 },
            fireball:     { id: 'fireball',    name: "Sfera di Fuoco",    level: 0, evolution: 'none', mastered: false, damage: 15, cooldown: 1200, lastCast: 0, size: 8, speed: 7, explosionRadius: 20, burnDamage: 5, meteorCount: 3 },
            lightning:    { id: 'lightning',   name: "Fulmine a Catena",  level: 0, evolution: 'none', mastered: false, damage: 10, cooldown: 1200, lastCast: 0, range: 250, chains: 2, stunChance: 0.15, stunDuration: 30, fieldDuration: 300, fieldTickRate: 20 },
            frostbolt:    { id: 'frostbolt',   name: "Dardo di Gelo",     level: 0, evolution: 'none', mastered: false, damage: 12, cooldown: 1200, lastCast: 0, slow: 0.5, slowDuration: 120, size: 7, speed: 6, penetration: 1, stunDuration: 120, auraDps: 5, auraSlow: 0.3 },
            shotgun:      { id: 'shotgun',     name: "Fucile Arcano",     level: 0, evolution: 'none', mastered: false, damage: 8,  count: 5, angleSpread: Math.PI / 4, cooldown: 1500, lastCast: 0, spinningDuration: 300, spinningRate: 5 },
            shockwave:    { id: 'shockwave',   name: "Onda d'Urto",       level: 0, evolution: 'none', mastered: false, damage: 20, radius: 100, cooldown: 8000, lastCast: 0, knockback: 15, resonantCount: 3, resonantDelay: 15 },
            heal:         { id: 'heal',        name: "Cura",              level: 0, evolution: 'none', mastered: false, amount: 20, cooldown: 10000, lastCast: 0, sanctuaryDuration: 300, sanctuaryHps: 10, lifestealDuration: 300, lifestealPercent: 0.05 },
            shield:       { id: 'shield',      name: "Scudo Magico",      level: 0, evolution: 'none', mastered: false, duration: 2000, cooldown: 15000, lastCast: 0, active: false, dr: 0.7, reflectDamage: 0.5, orbitalCount: 1, orbitalRadius: 10, orbitalDistance: 60 }
        };
        Object.values(this.spells).forEach(s => s.level = 0);
        this.passives = { health: { level: 0 }, speed: { level: 0 }, armor: { level: 0}, attack_speed: { level: 0 } };
    },

    castSpells() {
        const now = Date.now();
        const freq = this.player.modifiers.frequency;
        for (const spellKey in this.spells) {
            const s = this.spells[spellKey];
            if (s.level > 0 && now - s.lastCast > s.cooldown * freq) {
                let castFunctionName;

                if (s.evolution && s.evolution !== 'none') {
                    const evoName = s.evolution;
                    const finalEvoName = s.id === 'frostbolt' && evoName === 'storm' ? 'glacial' : evoName;
                    castFunctionName = `cast${finalEvoName.charAt(0).toUpperCase() + finalEvoName.slice(1)}`;
                } else {
                    castFunctionName = `cast${spellKey.charAt(0).toUpperCase() + spellKey.slice(1)}`;
                }

                if (typeof this[castFunctionName] === 'function') {
                    if (spellKey === 'heal' && this.player.hp >= this.player.stats.maxHp && s.evolution !== 'lifesteal') continue;
                    if (spellKey === 'shield' && s.active) continue;

                    if (this[castFunctionName](now)) {
                        s.lastCast = now;
                        this.audio?.playSpell();
                    }
                }
            }
        }
    },

    getDamage(baseDamage) { return baseDamage * (this.player.powerUpTimers.damageBoost > 0 ? 1.25 : 1) * this.player.modifiers.power; },

    castMagicMissile(now) {
        const s = this.spells.magicMissile;
        const nearest = Utils.findNearest(this.player, this.getEnemiesAndBosses());
        if (!nearest) return false;
        const angle = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x);
        this.addEntity('projectiles', new Projectile(this.player.x, this.player.y, {
            angle, damage: this.getDamage(s.damage), speed: s.speed, life: 80,
            size: s.size * this.player.modifiers.area, penetration: 1, color: '#9d75ff'
        }));
        return true;
    },
    castFireball(now) {
        const s = this.spells.fireball;
        let burnDamage = s.burnDamage, damage = this.getDamage(s.damage);
        const bonuses = this.player.archetype.weaponBonuses && this.player.archetype.weaponBonuses.fireball;
        if (bonuses) {
            if (bonuses.burnDamage) burnDamage *= bonuses.burnDamage;
            if (bonuses.damage) damage *= bonuses.damage;
        }
        const nearest = Utils.findNearest(this.player, this.getEnemiesAndBosses());
        if (!nearest) return false;
        const angle = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x);
        this.addEntity('projectiles', new Projectile(this.player.x, this.player.y, {
            angle, damage, type: 'fireball', life: 100, speed: s.speed, size: s.size * this.player.modifiers.area, penetration: 1, onDeathEffect: 'explosion', explosionRadius: s.explosionRadius * this.player.modifiers.area, burnDamage,
            drawFunc: (ctx, p) => { const g = ctx.createRadialGradient(p.x, p.y, p.size / 2, p.x, p.y, p.size * 1.5); g.addColorStop(0, 'rgba(255,200,0,1)'); g.addColorStop(0.5, 'rgba(255,100,0,0.8)'); g.addColorStop(1, 'rgba(255,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2); ctx.fill(); }
        }));
        return true;
    },
    castGiant(now) { const s = this.spells.fireball; const nearest = Utils.findNearest(this.player, this.getEnemiesAndBosses()); if (!nearest) return false; const angle = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x); this.addEntity('projectiles', new Projectile(this.player.x, this.player.y, { angle, damage: this.getDamage(s.damage * 6), type: 'great_fireball', life: 250, speed: s.speed * 0.4, size: s.size * 4 * this.player.modifiers.area, penetration: 999, leavesTrail: true, burnDamage: this.getDamage(s.burnDamage * 2), drawFunc: (ctx, p) => { const g = ctx.createRadialGradient(p.x, p.y, p.size / 4, p.x, p.y, p.size); g.addColorStop(0, 'rgba(255, 255, 255, 1)'); g.addColorStop(0.2, 'rgba(255, 220, 150, 1)'); g.addColorStop(0.6, 'rgba(255, 100, 0, 0.9)'); g.addColorStop(1, 'rgba(150, 0, 0, 0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); } })); return true; },
    castMeteor(now) { const s = this.spells.fireball; const visibleEnemies = this.getEnemiesAndBosses().filter(e => e.x > this.camera.x && e.x < this.camera.x + this.camera.width && e.y > this.camera.y && e.y < this.camera.y + this.camera.height); for (let i = 0; i < s.meteorCount; i++) { let target = visibleEnemies.length > 0 ? visibleEnemies[Math.floor(Math.random() * visibleEnemies.length)] : { x: this.player.x + (Math.random() - 0.5) * 400, y: this.player.y + (Math.random() - 0.5) * 400 }; let explosionRadius = s.explosionRadius * this.player.modifiers.area; this.addEntity('effects', new Effect(target.x, target.y, { type: 'meteor_indicator', radius: explosionRadius, life: 45, initialLife: 45 })); setTimeout(() => { this.createExplosion(target.x, target.y, explosionRadius, this.getDamage(s.damage * 2.5)); for(let k=0; k<15; k++) this.addEntity('particles', new Particle(target.x, target.y, { vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, life: 40, color: '#ffaa00' })); }, 750); } return true; },
    castLightning(now) {
        const s = this.spells.lightning;
        let chains = s.chains, area = 1;
        const bonuses = this.player.archetype.weaponBonuses && this.player.archetype.weaponBonuses.lightning;
        if (bonuses) {
            if (bonuses.chains) chains += bonuses.chains;
            if (bonuses.area) area *= bonuses.area;
        }
        const nearest = Utils.findNearest(this.player, this.getEnemiesAndBosses(), s.range);
        if (!nearest) return false;
        let lastTarget = this.player;
        let chainedEnemies = [];
        for (let c = 0; c < chains; c++) {
            let nextTarget = Utils.findNearest(lastTarget, this.getEnemiesAndBosses().filter(e => !chainedEnemies.includes(e)), 200 * area);
            if (nextTarget) {
                nextTarget.takeDamage(this.getDamage(s.damage), this);
                const midX = (lastTarget.x + nextTarget.x) / 2, midY = (lastTarget.y + nextTarget.y) / 2;
                this.addEntity('effects', new Effect(midX, midY, { type: 'lightning_chain', from: { x: lastTarget.x, y: lastTarget.y }, to: { x: nextTarget.x, y: nextTarget.y }, life: 10, initialLife: 10 }));
                lastTarget = nextTarget;
                chainedEnemies.push(nextTarget);
            } else break;
        }
        return true;
    },
    castStorm(now) {
        const s = this.spells.lightning;
        const nearest = Utils.findNearest(this.player, this.getEnemiesAndBosses(), 1000);
        const position = nearest ? {x: nearest.x, y: nearest.y} : {x: this.player.x + (Math.random()-0.5)*400, y: this.player.y + (Math.random()-0.5)*400};
        this.addEntity('staticFields', new StaticField(position.x, position.y, {
            damage: this.getDamage(s.damage), radius: s.range * this.player.modifiers.area,
            life: s.fieldDuration, tickRate: s.fieldTickRate
        }));
        return true;
    },
    castSpear(now) {
        const s = this.spells.lightning;
        const nearest = Utils.findNearest(this.player, this.getEnemiesAndBosses());
        if (!nearest) return false;
        const angle = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x);
        this.addEntity('projectiles', new Projectile(this.player.x, this.player.y, {
            angle, damage: this.getDamage(s.damage) * 3, speed: 12, life: 100,
            size: 10 * this.player.modifiers.area, penetration: 999, type: 'lightning_spear',
            stunChance: s.stunChance, stunDuration: s.stunDuration,
            drawFunc: (ctx, p) => { ctx.strokeStyle = '#FFFF00'; ctx.lineWidth = p.size; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx*2, p.y - p.vy*2); ctx.stroke();}
        }));
        return true;
    },
    castFrostbolt(now) {
        const s = this.spells.frostbolt;
        let slow = s.slow, damage = this.getDamage(s.damage), penetration = s.penetration;
        const bonuses = this.player.archetype.weaponBonuses && this.player.archetype.weaponBonuses.frostbolt;
        if (bonuses) {
            if (bonuses.slow) slow *= bonuses.slow;
            if (bonuses.damage) damage *= bonuses.damage;
            if (bonuses.penetration) penetration *= bonuses.penetration;
        }
        const nearest = Utils.findNearest(this.player, this.getEnemiesAndBosses());
        if (!nearest) return false;
        const angle = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x);
        this.addEntity('projectiles', new Projectile(this.player.x, this.player.y, {
            angle, damage, speed: s.speed, life: 100, size: s.size * this.player.modifiers.area, penetration, slow, slowDuration: s.slowDuration,
            drawFunc: (ctx, p) => { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Date.now() / 100); ctx.fillStyle = '#add8e6'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; const spikes = 6, outerR = p.size, innerR = p.size / 2; ctx.beginPath(); for (let i = 0; i < spikes * 2; i++) { const r = i % 2 === 0 ? outerR : innerR; const a = (i * Math.PI) / spikes; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
        }));
        return true;
    },
    castGlacial(now) {
        const s = this.spells.frostbolt;
        this.addEntity('auras', new Aura(this.player.x, this.player.y, {
            life: 300, radius: 150 * this.player.modifiers.area, tickRate: 30,
            dps: this.getDamage(s.auraDps), slowAmount: s.auraSlow
        }));
        return true;
    },
    castComet(now) {
        const s = this.spells.frostbolt;
        const nearest = Utils.findNearest(this.player, this.getEnemiesAndBosses());
        if (!nearest) return false;
        const targetPos = {x: nearest.x, y: nearest.y};
        const explosionRadius = 100 * this.player.modifiers.area;
        this.addEntity('effects', new Effect(targetPos.x, targetPos.y, { type: 'meteor_indicator', radius: explosionRadius, life: 60, initialLife: 60, color: '0,191,255' }));
        setTimeout(() => {
            this.createExplosion(targetPos.x, targetPos.y, explosionRadius, this.getDamage(s.damage) * 2, (enemy) => {
                enemy.stunTimer = Math.max(enemy.stunTimer, s.stunDuration);
            });
        }, 1000);
        return true;
    },
    castShotgun(now) {
        const s = this.spells.shotgun;
        let count = s.count, critChance = 0, damage = this.getDamage(s.damage);
        const bonuses = this.player.archetype.weaponBonuses && this.player.archetype.weaponBonuses.shotgun;
        if (bonuses) {
            if (bonuses.count) count += bonuses.count;
            if (bonuses.critChance) critChance = bonuses.critChance;
            if (bonuses.damage) damage *= bonuses.damage;
        }
        const nearest = Utils.findNearest(this.player, this.getEnemiesAndBosses());
        if (!nearest) return false;
        const angleBase = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x);
        for (let i = 0; i < count; i++) {
            const offset = (i - (count-1) / 2) * (s.angleSpread / count);
            let finalDamage = damage;
            if (critChance && Math.random() < critChance) finalDamage *= 2;
            this.addEntity('projectiles', new Projectile(this.player.x, this.player.y, {
                angle: angleBase + offset, damage: finalDamage, speed: 10, life: 30, size: 4 * this.player.modifiers.area, penetration: 1, color: '#ffaa00'
            }));
        }
        return true;
    },
    castExplosive(now) {
        const s = this.spells.shotgun;
        const nearest = Utils.findNearest(this.player, this.getEnemiesAndBosses());
        if (!nearest) return false;
        const angleBase = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x);
        for (let i = 0; i < s.count; i++) {
            const offset = (i - (s.count - 1) / 2) * (s.angleSpread / s.count);
            this.addEntity('projectiles', new Projectile(this.player.x, this.player.y, {
                angle: angleBase + offset, damage: this.getDamage(s.damage), speed: 10, life: 30,
                size: 6 * this.player.modifiers.area, penetration: 1, color: '#ffaa00',
                onDeathEffect: 'explosion', explosionRadius: 40 * this.player.modifiers.area
            }));
        }
        return true;
    },
    castCannon(now) {
        const s = this.spells.shotgun;
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const angle = Math.random() * 2 * Math.PI;
                this.addEntity('projectiles', new Projectile(this.player.x, this.player.y, {
                    angle, damage: this.getDamage(s.damage) * 0.7, speed: 8, life: 40,
                    size: 4, penetration: 1, color: '#ff5500'
                }));
            }, i * 50);
        }
        return true;
    },
    castShockwave(now) {
        const s = this.spells.shockwave;
        let damage = this.getDamage(s.damage);
        let knockback = s.knockback;
        let radius = s.radius * this.player.modifiers.area;
        const bonuses = this.player.archetype.weaponBonuses && this.player.archetype.weaponBonuses.shockwave;
        if (bonuses) {
            if (bonuses.damage) damage *= bonuses.damage;
            if (bonuses.knockback) knockback *= bonuses.knockback;
            if (bonuses.radius) radius *= bonuses.radius;
        }
        for (let enemy of this.getEnemiesAndBosses()) {
            if (Utils.getDistance(this.player, enemy) <= radius) {
                enemy.takeDamage(damage, this);
                const kAngle = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
                enemy.x += Math.cos(kAngle) * knockback;
                enemy.y += Math.sin(kAngle) * knockback;
            }
        }
        this.addEntity('effects', new Effect(this.player.x, this.player.y, { type: 'emp_wave', maxRadius: radius, life: 30, initialLife: 30 }));
        return true;
    },
    castResonant(now) {
        const s = this.spells.shockwave;
        const radius = s.radius * this.player.modifiers.area * 1.5;
        this.addEntity('effects', new Effect(this.player.x, this.player.y, { type: 'emp_wave', maxRadius: radius, life: 30, initialLife: 30, color: '148,0,211' }));
        this.getEnemiesAndBosses().forEach(enemy => {
            if (Utils.getDistance(this.player, enemy) <= radius) {
                enemy.takeDamage(this.getDamage(s.damage), this);
                const kAngle = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
                enemy.x += Math.cos(kAngle) * s.knockback * 4.0; enemy.y += Math.sin(kAngle) * s.knockback * 4.0;
            }
        });
        return true;
    },
    castImplosion(now) {
        const s = this.spells.shockwave;
        const radius = s.radius * this.player.modifiers.area * 1.5;
        this.addEntity('effects', new Effect(this.player.x, this.player.y, { type: 'emp_wave', maxRadius: radius, life: 30, initialLife: 30, color: '148,0,211' }));
        this.getEnemiesAndBosses().forEach(enemy => {
            if (Utils.getDistance(this.player, enemy) <= radius) {
                enemy.takeDamage(this.getDamage(s.damage), this);
                const kAngle = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
                enemy.x += Math.cos(kAngle) * s.knockback * 4.0; enemy.y += Math.sin(kAngle) * s.knockback * 4.0;
            }
        });
        return true;
    },
    castHeal(now) { const s = this.spells.heal; this.player.hp = Math.min(this.player.stats.maxHp, this.player.hp + s.amount); for(let i=0; i<10; i++) this.addEntity('particles', new Particle(this.player.x, this.player.y, {vx:(Math.random()-0.5)*2, vy:(Math.random()-0.5)*4 - 2, life: 40, color: '#00ff00'})); return true; },
    castSanctuary(now) {
        const s = this.spells.heal;
        this.addEntity('sanctuaries', new Sanctuary(this.player.x, this.player.y, {
            life: s.sanctuaryDuration, radius: 100 * this.player.modifiers.area, hps: s.sanctuaryHps
        }));
        return true;
    },
    castLifesteal(now) {
        const s = this.spells.heal;
        this.player.powerUpTimers.lifesteal = s.lifestealDuration;
        this.notifications.push({ text: "Sacrificio Vitale Attivato!", life: 120 });
        return true;
    },
    castShield(now) {
        const s = this.spells.shield;
        s.active = true;
        s.lastCast = now + s.duration; // Il cooldown inizia alla fine dell'abilità
        setTimeout(() => { s.active = false; }, s.duration);
        return true;
    },
    castReflect(now) {
        const s = this.spells.shield;
        s.active = true;
        s.lastCast = now + s.duration; // Il cooldown inizia alla fine dell'abilità
        setTimeout(() => { s.active = false; }, s.duration);
        return true;
    },
    castOrbital(now) {
        const s = this.spells.shield;
        for (let i = 0; i < s.orbitalCount; i++) {
            this.addEntity('orbitals', new Orbital(this.player.x, this.player.y, {
                angle: (2 * Math.PI / s.orbitalCount) * i,
                distance: s.orbitalDistance, rotationSpeed: 0.03,
                damage: this.getDamage(5), radius: s.orbitalRadius
            }));
        }
        s.cooldown *= 2;
        return true;
    },

    createExplosion(x, y, radius, damage, onHitCallback = null) {
        this.addScreenShake(4 + Math.min(12, Math.floor(radius / 15)));
        this.addEntity('effects', new Effect(x, y, { type: 'explosion', maxRadius: radius, life: 20, initialLife: 20 }));
        for (let enemy of this.getEnemiesAndBosses()) {
            if (Utils.getDistance({x,y}, enemy) <= radius) {
                enemy.takeDamage(damage, this);
                if (onHitCallback) onHitCallback(enemy);
            }
        }
    }
};
