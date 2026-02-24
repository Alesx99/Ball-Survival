import { Utils } from '../utils/index.js';
import { Projectile } from '../entities/Projectile.js';
import { Aura, StaticField, Orbital, Sanctuary } from '../entities/Areas.js';
import { Particle, FireTrail, Effect } from '../entities/Particles.js';
import { poolManager } from '../utils/PoolManager.js';
import { CONFIG } from '../config/index.js';

export const SpellSystem = {

    resetSpells() {
        this.spells = {
            magicMissile: { id: 'magicMissile', name: "Proiettile Magico", level: 0, evolution: 'none', mastered: false, damage: 8, cooldown: 1200, lastCast: 0, speed: 6, size: 5 },
            fireball: { id: 'fireball', name: "Sfera di Fuoco", level: 0, evolution: 'none', mastered: false, damage: 10, cooldown: 1200, lastCast: 0, size: 8, speed: 7, explosionRadius: 20, burnDamage: 3, meteorCount: 3 },
            lightning: { id: 'lightning', name: "Fulmine a Catena", level: 0, evolution: 'none', mastered: false, damage: 6, cooldown: 1200, lastCast: 0, range: 250, chains: 2, stunChance: 0.15, stunDuration: 30, fieldDuration: 300, fieldTickRate: 20 },
            frostbolt: { id: 'frostbolt', name: "Dardo di Gelo", level: 0, evolution: 'none', mastered: false, damage: 8, cooldown: 1200, lastCast: 0, slow: 0.5, slowDuration: 120, size: 7, speed: 6, penetration: 1, stunDuration: 120, auraDps: 3, auraSlow: 0.3 },
            shotgun: { id: 'shotgun', name: "Fucile Arcano", level: 0, evolution: 'none', mastered: false, damage: 5, count: 5, angleSpread: Math.PI / 4, cooldown: 1500, lastCast: 0, spinningDuration: 300, spinningRate: 5 },
            shockwave: { id: 'shockwave', name: "Onda d'Urto", level: 0, evolution: 'none', mastered: false, damage: 14, radius: 100, cooldown: 8000, lastCast: 0, knockback: 15, resonantCount: 3, resonantDelay: 15 },
            heal: { id: 'heal', name: "Cura", level: 0, evolution: 'none', mastered: false, amount: 15, cooldown: 10000, lastCast: 0, sanctuaryDuration: 300, sanctuaryHps: 10, lifestealDuration: 300, lifestealPercent: 0.05 },
            shield: { id: 'shield', name: "Scudo Magico", level: 0, evolution: 'none', mastered: false, duration: 1500, cooldown: 18000, lastCast: 0, active: false, dr: 0.7, reflectDamage: 0.5, orbitalCount: 1, orbitalRadius: 10, orbitalDistance: 60 },
            cyclone: { id: 'cyclone', name: "Ciclone Vuoto", level: 0, evolution: 'none', mastered: false, damage: 8, cooldown: 6000, lastCast: 0, radius: 100, duration: 180, pullForce: 2 },
            armageddon: { id: 'armageddon', name: "Armageddon", level: 0, evolution: 'none', mastered: false, damage: 99999, cooldown: 60000, lastCast: 0 },
            cloaking: { id: 'cloaking', name: "Velo D'Ombra", level: 0, evolution: 'none', mastered: false, duration: 3000, cooldown: 12000, lastCast: 0 },
            singularity: { id: 'singularity', name: "Singolarità", level: 0, evolution: 'none', mastered: false, damage: 7, cooldown: 5000, lastCast: 0, radius: 150, pullForce: 3 },
            stellarAura: { id: 'stellarAura', name: "Aura Stellare", level: 0, evolution: 'none', mastered: false, damage: 8, cooldown: 8000, lastCast: 0, radius: 120, duration: 300 },
            pulsarRay: { id: 'pulsarRay', name: "Raggio Pulsar", level: 0, evolution: 'none', mastered: false, damage: 30, cooldown: 10000, lastCast: 0, width: 30, range: 800 }
        };
        Object.values(this.spells).forEach(s => s.level = 0);
        this.passives = {};
        const upgradeTree = CONFIG.upgradeTree || {};
        for (const id in upgradeTree) {
            if (upgradeTree[id].type === 'passive') this.passives[id] = { level: 0 };
        }
    },

    castSpells() {
        const now = Date.now();
        const baseFreq = this.player.modifiers.frequency;
        const freq = baseFreq * (this.player.powerUpTimers?.attackSpeedBoost > 0 ? (1 - (this.spells.heal.sanctuaryAttackSpeed || 0.2)) : 1);
        for (const spellKey in this.spells) {
            const s = this.spells[spellKey];
            if (s.fusedInto) continue;
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
                    if (spellKey === 'shield' && this.player._phantomShieldBlock) continue; // Fantasma non può usare Shield

                    if (this[castFunctionName](now)) {
                        s.lastCast = now;
                        this.audio?.playSpell();
                        if (this.stats) this.stats.totalSpellCasts++;
                    }
                }
            }
        }
    },

    /** Moltiplicatore danno "linearizzato": riduce lo snowball del power (diminishing returns). */
    getEffectivePower() {
        const raw = this.player.modifiers.power ?? 1;
        const factor = 0.5; // 1 = come prima (moltiplicativo), 0.5 = power 2→1.5x, 3→2x
        return 1 + (raw - 1) * factor;
    },
    getDamage(baseDamage) {
        const boost = this.player.powerUpTimers.damageBoost > 0 ? 1.25 : 1;
        return baseDamage * boost * this.getEffectivePower();
    },

    castMagicMissile(now) {
        const s = this.spells.magicMissile;
        const nearest = Utils.findNearest(this.player, this.getEnemiesAndBosses());
        if (!nearest) return false;
        const angle = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x);
        this.addEntity('projectiles', poolManager.get('Projectile', () => new Projectile(0, 0, {})).init(this.player.x, this.player.y, {
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

        const isStellarRain = s.fusionId === 'stellar_rain';
        const projectileProps = {
            angle, damage, type: 'fireball', life: 100, speed: s.speed, size: s.size * (this.player.modifiers?.area ?? 1), penetration: 1, onDeathEffect: 'explosion', explosionRadius: s.explosionRadius * (this.player.modifiers?.area ?? 1), burnDamage,
            drawFunc: (ctx, p) => {
                const x = Number(p.x), y = Number(p.y), size = Math.max(0.01, Number(p.size));
                if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(size)) return;
                const r0 = size / 2, r1 = size * 1.5;
                const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
                g.addColorStop(0, 'rgba(255,200,0,1)'); g.addColorStop(0.5, 'rgba(255,100,0,0.8)'); g.addColorStop(1, 'rgba(255,0,0,0)');
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r1, 0, Math.PI * 2); ctx.fill();
            }
        };

        if (isStellarRain) {
            projectileProps.update = (game, p) => {
                // Attratto verso l'eventuale Singolarità o Buco Nero
                const singularities = game.entities.auras.filter(a => a.isSingularity);
                if (singularities.length > 0) {
                    const target = singularities[0];
                    const pullAngle = Math.atan2(target.y - p.y, target.x - p.x);
                    p.vx += Math.cos(pullAngle) * 0.5;
                    p.vy += Math.sin(pullAngle) * 0.5;
                }
                p.x += p.vx;
                p.y += p.vy;
                p.life--;
                if (p.life <= 0) p.toRemove = true;
            };
        }

        this.addEntity('projectiles', poolManager.get('Projectile', () => new Projectile(0, 0, {})).init(this.player.x, this.player.y, projectileProps));
        return true;
    },
    castGiant(now) {
        const s = this.spells.fireball; const nearest = Utils.findNearest(this.player, this.getEnemiesAndBosses()); if (!nearest) return false; const angle = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x); this.addEntity('projectiles', poolManager.get('Projectile', () => new Projectile(0, 0, {})).init(this.player.x, this.player.y, {
            angle, damage: this.getDamage(s.damage * 6), type: 'great_fireball', life: 250, speed: s.speed * 0.4, size: s.size * 4 * (this.player.modifiers?.area ?? 1), penetration: 999, leavesTrail: true, burnDamage: this.getDamage(s.burnDamage * 2), drawFunc: (ctx, p) => {
                const x = Number(p.x), y = Number(p.y), size = Math.max(0.01, Number(p.size));
                if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(size)) return;
                const r0 = size / 4, r1 = size;
                const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
                g.addColorStop(0, 'rgba(255, 255, 255, 1)'); g.addColorStop(0.2, 'rgba(255, 220, 150, 1)'); g.addColorStop(0.6, 'rgba(255, 100, 0, 0.9)'); g.addColorStop(1, 'rgba(150, 0, 0, 0)');
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r1, 0, Math.PI * 2); ctx.fill();
            }
        })); return true;
    },
    castMeteor(now) { const s = this.spells.fireball; const visibleEnemies = this.getEnemiesAndBosses().filter(e => e.x > this.camera.x && e.x < this.camera.x + this.camera.width && e.y > this.camera.y && e.y < this.camera.y + this.camera.height); for (let i = 0; i < s.meteorCount; i++) { let target = visibleEnemies.length > 0 ? visibleEnemies[Math.floor(Math.random() * visibleEnemies.length)] : { x: this.player.x + (Math.random() - 0.5) * 400, y: this.player.y + (Math.random() - 0.5) * 400 }; let explosionRadius = s.explosionRadius * this.player.modifiers.area; this.addEntity('effects', new Effect(target.x, target.y, { type: 'meteor_indicator', radius: explosionRadius, life: 45, initialLife: 45 })); setTimeout(() => { this.createExplosion(target.x, target.y, explosionRadius, this.getDamage(s.damage * 2.5)); for (let k = 0; k < 15; k++) this.addEntity('particles', new Particle(target.x, target.y, { vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, life: 40, color: '#ffaa00' })); }, 750); } return true; },
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
        const position = nearest ? { x: nearest.x, y: nearest.y } : { x: this.player.x + (Math.random() - 0.5) * 400, y: this.player.y + (Math.random() - 0.5) * 400 };
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
        this.addEntity('projectiles', poolManager.get('Projectile', () => new Projectile(0, 0, {})).init(this.player.x, this.player.y, {
            angle, damage: this.getDamage(s.damage) * 3, speed: 12, life: 100,
            size: 10 * this.player.modifiers.area, penetration: 999, type: 'lightning_spear',
            stunChance: s.stunChance, stunDuration: s.stunDuration,
            drawFunc: (ctx, p) => { ctx.strokeStyle = '#FFFF00'; ctx.lineWidth = p.size; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2); ctx.stroke(); }
        }));
        return true;
    },
    castFrostbolt(now, angleOverride = null) {
        const s = this.spells.frostbolt;
        let slow = s.slow, damage = this.getDamage(s.damage), penetration = s.penetration;
        const bonuses = this.player.archetype.weaponBonuses && this.player.archetype.weaponBonuses.frostbolt;
        if (bonuses) {
            if (bonuses.slow) slow *= bonuses.slow;
            if (bonuses.damage) damage *= bonuses.damage;
            if (bonuses.penetration) penetration *= bonuses.penetration;
        }

        let angle = angleOverride;
        if (angle === null) {
            const nearest = Utils.findNearest(this.player, this.getEnemiesAndBosses());
            if (!nearest) return false;
            angle = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x);
        }

        this.addEntity('projectiles', poolManager.get('Projectile', () => new Projectile(0, 0, {})).init(this.player.x, this.player.y, {
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
        const targetPos = { x: nearest.x, y: nearest.y };
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
            const offset = (i - (count - 1) / 2) * (s.angleSpread / count);
            let finalDamage = damage;
            if (critChance && Math.random() < critChance) finalDamage *= 2;
            this.addEntity('projectiles', poolManager.get('Projectile', () => new Projectile(0, 0, {})).init(this.player.x, this.player.y, {
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
            this.addEntity('projectiles', poolManager.get('Projectile', () => new Projectile(0, 0, {})).init(this.player.x, this.player.y, {
                angle: angleBase + offset, damage: this.getDamage(s.damage), speed: 10, life: 30,
                size: 6 * this.player.modifiers.area, penetration: 1, color: '#ffaa00',
                onDeathEffect: 'explosion', explosionRadius: (s.explosionRadius || 40) * this.player.modifiers.area
            }));
        }
        return true;
    },
    castCannon(now) {
        const s = this.spells.shotgun;
        for (let i = 0; i < (s.cannonCount || 20); i++) {
            setTimeout(() => {
                const angle = Math.random() * 2 * Math.PI;
                this.addEntity('projectiles', poolManager.get('Projectile', () => new Projectile(0, 0, {})).init(this.player.x, this.player.y, {
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
                if (s.stunDuration) enemy.stunTimer = Math.max(enemy.stunTimer || 0, s.stunDuration);
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
                let damageAmount = this.getDamage(s.damage);
                if (s.executeDamage) {
                    const missingHp = enemy.maxHp - enemy.hp;
                    damageAmount += missingHp * 0.15;
                }
                enemy.takeDamage(damageAmount, this);
                const kAngle = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
                enemy.x -= Math.cos(kAngle) * s.knockback * 2.0; enemy.y -= Math.sin(kAngle) * s.knockback * 2.0;
            }
        });
        return true;
    },
    castHeal(now) { const s = this.spells.heal; this.player.hp = Math.min(this.player.stats.maxHp, this.player.hp + s.amount); for (let i = 0; i < 10; i++) this.addEntity('particles', new Particle(this.player.x, this.player.y, { vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 4 - 2, life: 40, color: '#00ff00' })); return true; },
    castSanctuary(now) {
        const s = this.spells.heal;
        this.addEntity('sanctuaries', new Sanctuary(this.player.x, this.player.y, {
            life: s.sanctuaryDuration, radius: 100 * this.player.modifiers.area, hps: s.sanctuaryHps,
            attackSpeed: s.sanctuaryAttackSpeed
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
            if (Utils.getDistance({ x, y }, enemy) <= radius) {
                enemy.takeDamage(damage, this);
                if (onHitCallback) onHitCallback(enemy);
            }
        }
    },

    castCyclone(now) {
        const s = this.spells.cyclone;
        class CycloneAura extends Aura {
            update(game) {
                super.update(game);
                const enemies = game.entities.enemies || [];
                const bosses = game.entities.bosses || [];
                for (let e of [...enemies, ...bosses]) {
                    const dist = Utils.getDistance(this, e);
                    if (dist < this.radius) {
                        e.takeDamage((game.spells?.getDamage(s.damage) || s.damage) / 60, game);
                        const angle = Math.atan2(this.y - e.y, this.x - e.x);
                        e.x += Math.cos(angle) * s.pullForce;
                        e.y += Math.sin(angle) * s.pullForce;
                    }
                }
            }
            draw(ctx, game) {
                const opacity = this.life > 30 ? 0.6 : (this.life / 30) * 0.6;
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(Date.now() / 150);

                const gradient = ctx.createRadialGradient(0, 0, this.radius * 0.1, 0, 0, this.radius);
                gradient.addColorStop(0, `rgba(200, 200, 255, ${opacity})`);
                gradient.addColorStop(0.5, `rgba(138, 43, 226, ${opacity * 0.8})`);
                gradient.addColorStop(1, `rgba(75, 0, 130, 0)`);

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i < 4; i++) {
                    ctx.rotate(Math.PI / 2);
                    ctx.moveTo(this.radius * 0.2, 0);
                    ctx.quadraticCurveTo(this.radius * 0.5, this.radius * 0.5, this.radius * 0.9, 0);
                }
                ctx.stroke();
                ctx.restore();
            }
        }
        this.addEntity('areas', new CycloneAura(this.player.x, this.player.y, {
            radius: s.radius, life: s.duration, color: 'rgba(138, 43, 226, 0.4)'
        }));
        return true;
    },

    castArmageddon(now) {
        const s = this.spells.armageddon;
        this.addScreenShake(30);
        this.addEntity('effects', new Effect(this.player.x, this.player.y, { type: 'armageddon_flash', life: 60, initialLife: 60 }));
        if (this.notifications) this.notifications.push({ text: "ARMAGEDDON!", life: 180, color: '#ff0000' });

        if (s.fusionId === 'paradox') {
            this._timeStopActive = true;
            this._timeStopTimer = (s.fusionBonus?.timeStop || 10000) / 16.6;
            this.notifications.push({ text: "TEMPO FERMO!", life: 120, color: '#00ffff' });
            return true;
        }

        const targets = this.getEnemiesAndBosses();
        for (let enemy of targets) {
            enemy.takeDamage(s.damage, this);
        }
        return true;
    },

    castCloaking(now) {
        const s = this.spells.cloaking;
        const frames = Math.ceil(s.duration / 1000 * 60);
        this.player.iFramesTimer = Math.max(this.player.iFramesTimer || 0, frames);
        this.player.powerUpTimers.invincibility = Math.max(this.player.powerUpTimers.invincibility || 0, frames);
        if (this.notifications) this.notifications.push({ text: "Velo D'Ombra", life: 60, color: '#555555' });

        if (s.fusionId === 'spectral_veil') {
            this.player._spectralVeilTimer = frames;
        }
        return true;
    },

    castSingularity(now) {
        const s = this.spells.singularity;
        const nearest = Utils.findNearest(this.player, this.getEnemiesAndBosses());
        if (!nearest) return false;

        const angle = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x);
        const isBlackHole = s.fusionId === 'black_hole';
        const radius = (s.radius * (this.player.modifiers.area || 1)) * (isBlackHole ? 2 : 1);
        const pullForce = (s.pullForce + (s.fusionBonus?.pullForce || 0)) * (isBlackHole ? 3 : 1);

        this.addEntity('projectiles', poolManager.get('Projectile', () => new Projectile(0, 0, {})).init(this.player.x, this.player.y, {
            angle, damage: this.getDamage(s.damage) * (isBlackHole ? 2 : 1), speed: 5, life: 120,
            size: isBlackHole ? 30 : 15, penetration: 5, type: 'singularity',
            onDeathEffect: 'custom',
            customEffect: (p) => {
                // Crea un effetto di attrazione alla fine del proiettile
                const aura = new Aura(p.x, p.y, {
                    life: isBlackHole ? 300 : 180, radius: radius, tickRate: 1,
                    color: isBlackHole ? 'rgba(0, 0, 0, 0.8)' : 'rgba(75, 0, 130, 0.4)',
                    isSingularity: true
                });
                aura.update = (game) => {
                    const enemies = game.getEnemiesAndBosses();
                    enemies.forEach(e => {
                        const dist = Utils.getDistance(aura, e);
                        if (dist < aura.radius) {
                            const pullAngle = Math.atan2(aura.y - e.y, aura.x - e.x);
                            e.x += Math.cos(pullAngle) * pullForce;
                            e.y += Math.sin(pullAngle) * pullForce;
                            if (dist < (isBlackHole ? 40 : 20)) e.takeDamage(this.getDamage(s.damage) / (isBlackHole ? 5 : 10), game);
                        }
                    });
                    aura.life--;
                    if (aura.life <= 0) aura.toRemove = true;
                };
                aura.draw = (ctx, game) => {
                    if (isBlackHole) {
                        const ax = Number(aura.x), ay = Number(aura.y), ar = Math.max(1, Number(aura.radius));
                        if (!Number.isFinite(ax) || !Number.isFinite(ay) || !Number.isFinite(ar)) return;
                        ctx.save();
                        const opacity = aura.life > 30 ? 1 : aura.life / 30;
                        const g = ctx.createRadialGradient(ax, ay, 10, ax, ay, ar);
                        g.addColorStop(0, '#000');
                        g.addColorStop(0.5, `rgba(75, 0, 130, ${opacity})`);
                        g.addColorStop(1, 'rgba(0, 0, 0, 0)');
                        ctx.fillStyle = g;
                        ctx.beginPath();
                        ctx.arc(ax, ay, ar, 0, Math.PI * 2);
                        ctx.fill();

                        // Event horizon effect
                        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
                        ctx.lineWidth = 2;
                        ctx.setLineDash([5, 10]);
                        ctx.beginPath();
                        ctx.arc(ax, ay, ar * 0.8, Date.now() / 100, Date.now() / 100 + Math.PI * 2);
                        ctx.stroke();
                        ctx.restore();
                    } else {
                        // Default aura draw logic would be here if not overridden, but we use the base draw if we don't define one.
                        // However, Aura often has its own draw.
                    }
                };
                this.addEntity('auras', aura);
            },
            drawFunc: (ctx, p) => {
                const x = Number(p.x), y = Number(p.y), size = Math.max(0.01, Number(p.size));
                if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(size)) return;
                ctx.save();
                const r0 = size / 2, r1 = size * 2;
                const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
                g.addColorStop(0, '#ffffff');
                g.addColorStop(0.3, '#9370db');
                g.addColorStop(1, 'rgba(75,0,130,0)');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(x, y, r1, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }));
        return true;
    },

    castStellarAura(now) {
        const s = this.spells.stellarAura;
        const radius = s.radius * (this.player.modifiers?.area ?? 1);
        const duration = s.duration;

        this.addEntity('auras', new Aura(this.player.x, this.player.y, {
            life: duration, radius: radius, tickRate: 10,
            dps: this.getDamage(s.damage),
            color: 'rgba(173, 216, 230, 0.2)',
            draw: (ctx, game) => {
                const cx = Number(game.player.x);
                const cy = Number(game.player.y);
                const r = Math.max(1, Number(radius));
                if (!Number.isFinite(cx) || !Number.isFinite(cy) || !Number.isFinite(r)) return;
                ctx.save();
                ctx.translate(cx, cy);
                // Evitiamo numeri giganti nel rotate che bloccano il rendering del canvas in alcuni browser
                ctx.rotate((Date.now() / 500) % (Math.PI * 2));
                for (let i = 0; i < 4; i++) {
                    ctx.rotate(Math.PI / 2);
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.arc(r, 0, 5, 0, Math.PI * 2);
                    ctx.fill();
                    // Glow
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = '#00ffff';
                    ctx.strokeStyle = '#00ffff';
                    ctx.stroke();
                }
                ctx.restore();
            }
        }));
        return true;
    },

    castPulsarRay(now) {
        const s = this.spells.pulsarRay;
        const nearest = Utils.findNearest(this.player, this.getEnemiesAndBosses());
        if (!nearest) return false;

        const angle = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x);
        const range = s.range;
        const width = s.width * (this.player.modifiers.area || 1);

        this.addEntity('effects', new Effect(this.player.x, this.player.y, {
            type: 'pulsar_ray',
            angle,
            range,
            width,
            life: 20,
            initialLife: 20,
            onStart: () => {
                const enemies = this.getEnemiesAndBosses();
                enemies.forEach(e => {
                    // Controllo collisione segmento (laser)
                    const endX = this.player.x + Math.cos(angle) * range;
                    const endY = this.player.y + Math.sin(angle) * range;
                    const d = Utils.getDistanceToSegment(e, this.player, { x: endX, y: endY });
                    if (d < width / 2 + (e.stats?.radius || 20)) {
                        e.takeDamage(this.getDamage(s.damage), this);
                    }
                });
            }
        }));
        return true;
    }
};
