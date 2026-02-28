/**
 * Enemy class — supports multiple behaviors
 * @module entities/Enemy
 */

import { Entity } from './Entity.js';
import { CONFIG } from '../config/index.js';
import { Utils } from '../utils/index.js';

export class Enemy extends Entity {
    constructor(x, y, stats) {
        super(x, y);
        this.init(x, y, stats);
        this.poolType = 'Enemy';
    }

    init(x, y, stats) {
        this.x = x;
        this.y = y;
        this.toRemove = false;
        this.stats = { ...stats };
        this.type = this.stats.type || 'enemy';
        this.hp = this.stats.maxHp || this.stats.hp || 25;
        this.stats.maxHp = this.hp;
        this.spawnImmunityTimer = CONFIG.enemies.spawnImmunity;
        this.slowAmount = 0;
        this.slowTimer = 0;
        this.stunTimer = 0;
        this.burnTimer = 0;
        this.burnDamage = 0;
        this.lastContactDamageTime = -999;

        // Behavior system
        this.behavior = this.stats.behavior || 'chase';
        this._behaviorState = 'idle';
        this._behaviorTimer = 0;
        this._dashAngle = 0;
        this._orbitAngle = Math.random() * Math.PI * 2;
        this._lastShot = 0;
        this._reviveCount = 0;
        this._reviveCooldownTimer = 0;
        this._generation = this.stats._generation || 0;
        this._teleportTimer = 0;
        this._summonTimer = 0;
        this.isChampion = this.stats.isChampion || false;

        return this;
    }

    update(game) {
        if (this.spawnImmunityTimer > 0) {
            this.spawnImmunityTimer--;
            return;
        }

        if (this.stunTimer > 0) {
            this.stunTimer--;
            return;
        }

        // Regen da difficulty tier (tier 4+)
        if (this.stats.regen && this.hp < this.stats.maxHp) {
            this.hp = Math.min(this.stats.maxHp, this.hp + this.stats.regen / 60);
        }

        let speed = this.stats.speed;
        if (this.slowTimer > 0) {
            speed *= (1 - this.slowAmount);
            this.slowTimer--;
        }

        if (this.burnTimer > 0) {
            this.hp -= this.burnDamage / 60;
            this.burnTimer--;
            if (this.hp <= 0) {
                this.onDeath(game);
                return;
            }
        }

        // Behavior dispatch
        switch (this.behavior) {
            case 'dash': this._updateDash(game, speed); break;
            case 'orbit': this._updateOrbit(game, speed); break;
            case 'bomb': this._updateBomb(game, speed); break;
            case 'ranged': this._updateRanged(game, speed); break;
            case 'necro': this._updateNecro(game, speed); break;
            case 'tank': this._updateTank(game, speed); break;
            case 'teleport': this._updateTeleport(game, speed); break;
            case 'summon': this._updateSummon(game, speed); break;
            case 'split':    // Splitter uses normal chase, splits on death
            default: this._updateChase(game, speed); break;
        }

        // Clamp to world bounds
        this.x = Math.max(this.stats.radius, Math.min(CONFIG.world.width - this.stats.radius, this.x));
        this.y = Math.max(this.stats.radius, Math.min(CONFIG.world.height - this.stats.radius, this.y));

        // Contact damage check
        const dist = Utils.getDistance(this, game.player);
        if (dist < game.player.stats.radius + this.stats.radius) {
            if (!game.player._phantomPassthrough) {
                const cooldownSec = CONFIG.enemies.contactDamageCooldown ?? 0.9;
                const cooldownFrames = cooldownSec * 60;
                if (game.totalElapsedTime - this.lastContactDamageTime >= cooldownFrames) {
                    game.player.takeDamage(this.stats.damage, game, this);
                    this.lastContactDamageTime = game.totalElapsedTime;
                }
            }

            // Contact effects from player archetype
            if (game.player.modifiers.contactBurn) {
                this.burnTimer = 120;
                this.burnDamage = 8;
            }
            if (game.player.modifiers.contactSlow) {
                this.slowAmount = 0.5;
                this.slowTimer = 60;
            }

            // Bomber explodes on contact
            if (this.behavior === 'bomb') {
                this._explode(game);
                return;
            }
        }
    }

    // === BEHAVIOR: Chase (default) ===
    _updateChase(game, speed) {
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            this.x += (dx / dist) * speed;
            this.y += (dy / dist) * speed;
        }
    }

    // === BEHAVIOR: Dash ===
    _updateDash(game, speed) {
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (this._behaviorState === 'idle') {
            // Walk towards player slowly
            if (dist > 0) {
                this.x += (dx / dist) * speed * 0.4;
                this.y += (dy / dist) * speed * 0.4;
            }
            // Start prepping when close enough
            if (dist < 300) {
                this._behaviorState = 'prep';
                this._behaviorTimer = this.stats.prepTime || 90;
                this._dashAngle = Math.atan2(dy, dx); // Lock angle
            }
        } else if (this._behaviorState === 'prep') {
            // Preparing to dash — shake slightly
            this.x += (Math.random() - 0.5) * 2;
            this.y += (Math.random() - 0.5) * 2;
            this._behaviorTimer--;
            // Update aim during prep
            this._dashAngle = Math.atan2(dy, dx);
            if (this._behaviorTimer <= 0) {
                this._behaviorState = 'dash';
                this._behaviorTimer = this.stats.dashDuration || 20;
            }
        } else if (this._behaviorState === 'dash') {
            // Dashing forward at high speed
            const dashSpeed = this.stats.dashSpeed || 8;
            this.x += Math.cos(this._dashAngle) * dashSpeed;
            this.y += Math.sin(this._dashAngle) * dashSpeed;
            this._behaviorTimer--;
            if (this._behaviorTimer <= 0) {
                this._behaviorState = 'idle';
            }
        }
    }

    // === BEHAVIOR: Orbit ===
    _updateOrbit(game, speed) {
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const orbitRadius = this.stats.orbitRadius || 120;

        if (this._behaviorState === 'idle') {
            this._behaviorTimer++;

            if (dist > orbitRadius + 50) {
                // Approach to orbit distance
                if (dist > 0) {
                    this.x += (dx / dist) * speed;
                    this.y += (dy / dist) * speed;
                }
            } else {
                // Orbit around the player
                const orbitSpeed = this.stats.orbitSpeed || 0.04;
                this._orbitAngle += orbitSpeed;
                this.x = game.player.x + Math.cos(this._orbitAngle) * orbitRadius;
                this.y = game.player.y + Math.sin(this._orbitAngle) * orbitRadius;
            }

            // After orbiting for a while, lunge
            if (this._behaviorTimer >= (this.stats.lungeTimer || 300)) {
                this._behaviorState = 'lunge';
                this._behaviorTimer = 30;
            }
        } else if (this._behaviorState === 'lunge') {
            // Lunge directly at the player
            if (dist > 0) {
                this.x += (dx / dist) * speed * 3;
                this.y += (dy / dist) * speed * 3;
            }
            this._behaviorTimer--;
            if (this._behaviorTimer <= 0) {
                this._behaviorState = 'idle';
                this._behaviorTimer = 0;
            }
        }
    }

    // === BEHAVIOR: Bomb ===
    _updateBomb(game, speed) {
        // Walk slowly toward player
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            this.x += (dx / dist) * speed * 0.5;
            this.y += (dy / dist) * speed * 0.5;
        }

        // Pulsing glow when close to player
        this._behaviorTimer = dist < 100 ? Math.min(60, this._behaviorTimer + 1) : Math.max(0, this._behaviorTimer - 1);
    }

    _explode(game) {
        if (this._exploded) return;
        this._exploded = true;
        const explosionRadius = this.stats.explosionRadius || 80;
        const explosionDamage = this.stats.explosionDamage || 40;

        // Damage player if in range
        const distToPlayer = Utils.getDistance(this, game.player);
        if (distToPlayer < explosionRadius) {
            game.player.takeDamage(explosionDamage, game, this);
        }

        // Visual explosion effect
        const { Particle } = game._entityClasses;
        const count = CONFIG.accessibility?.reduceMotion ? 6 : 20;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 3 + Math.random() * 6;
            game.addEntity('particles', new Particle(this.x, this.y, {
                vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
                life: 30 + Math.floor(Math.random() * 20),
                color: '#ff3333'
            }));
        }
        game.addScreenShake?.(8);
        this.onDeath(game);
    }

    // === BEHAVIOR: Ranged (Sniper) ===
    _updateRanged(game, speed) {
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const preferredRange = this.stats.range || 350;

        // Maintain distance
        if (dist < preferredRange - 50) {
            // Too close — retreat
            if (dist > 0) {
                this.x -= (dx / dist) * speed * 0.8;
                this.y -= (dy / dist) * speed * 0.8;
            }
        } else if (dist > preferredRange + 50) {
            // Too far — approach
            if (dist > 0) {
                this.x += (dx / dist) * speed * 0.6;
                this.y += (dy / dist) * speed * 0.6;
            }
        } else {
            // Strafe slightly
            const perpX = -dy / dist;
            const perpY = dx / dist;
            this.x += perpX * speed * 0.3;
            this.y += perpY * speed * 0.3;
        }

        // Shoot at player
        this._lastShot++;
        const shootCooldown = this.stats.shootCooldown || 120;
        if (this._lastShot >= shootCooldown && dist < preferredRange + 100) {
            this._lastShot = 0;
            const angle = Math.atan2(dy, dx);
            const { Projectile } = game._entityClasses;
            const projSpeed = this.stats.projectileSpeed || 5;
            const proj = new Projectile(this.x, this.y, {
                angle: angle,
                speed: projSpeed,
                damage: this.stats.damage,
                radius: 6,
                life: 200,
                color: this.stats.color || '#ffcc00'
            });
            game.addEntity('enemyProjectiles', proj);
        }
    }

    // === BEHAVIOR: Necromancer ===
    _updateNecro(game, speed) {
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Walk slowly toward player but stay at medium distance
        if (dist > 200) {
            if (dist > 0) {
                this.x += (dx / dist) * speed * 0.4;
                this.y += (dy / dist) * speed * 0.4;
            }
        }

        // Revive cooldown
        if (this._reviveCooldownTimer > 0) {
            this._reviveCooldownTimer--;
            return;
        }

        // Try to revive dead enemies nearby
        const maxRevives = this.stats.maxRevives || 3;
        if (this._reviveCount >= maxRevives) return;

        const reviveRadius = this.stats.reviveRadius || 150;
        // Use death positions stored in game
        if (game._recentDeathPositions && game._recentDeathPositions.length > 0) {
            // Find the closest recent death within range
            let bestIdx = -1;
            let bestDist = Infinity;
            for (let i = 0; i < game._recentDeathPositions.length; i++) {
                const pos = game._recentDeathPositions[i];
                const d = Utils.getDistance(this, pos);
                if (d < reviveRadius && d < bestDist) {
                    bestDist = d;
                    bestIdx = i;
                }
            }

            if (bestIdx >= 0) {
                const pos = game._recentDeathPositions.splice(bestIdx, 1)[0];
                // Spawn a weaker "zombie" enemy
                const zombieStats = {
                    ...CONFIG.enemies.base,
                    hp: Math.floor(this.stats.maxHp * 0.3),
                    maxHp: Math.floor(this.stats.maxHp * 0.3),
                    speed: this.stats.speed * 0.8,
                    damage: Math.floor(this.stats.damage * 0.5),
                    radius: 10,
                    xp: Math.floor(this.stats.xp * 0.3),
                    dr: 0,
                    type: 'zombie',
                    behavior: 'chase'
                };
                const zombie = new Enemy(pos.x, pos.y, zombieStats);
                zombie.spawnImmunityTimer = 30;
                game.addEntity('enemies', zombie);

                // Visual effect
                const { Particle } = game._entityClasses;
                for (let i = 0; i < 8; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const spd = 1 + Math.random() * 3;
                    game.addEntity('particles', new Particle(pos.x, pos.y, {
                        vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
                        life: 20 + Math.floor(Math.random() * 15),
                        color: '#9900cc'
                    }));
                }

                this._reviveCount++;
                this._reviveCooldownTimer = this.stats.reviveCooldown || 300;
            }
        }
    }

    // === BEHAVIOR: Tank ===
    _updateTank(game, speed) {
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Slow chase
        if (dist > 0) {
            this.x += (dx / dist) * speed;
            this.y += (dy / dist) * speed;
        }

        // Apply bonus DR (stacks with base)
        if (!this._bonusDrApplied && this.stats.bonusDr) {
            this.stats.dr = Math.min(0.85, (this.stats.dr || 0) + this.stats.bonusDr);
            this._bonusDrApplied = true;
        }

        // Knockback on contact
        if (dist < game.player.stats.radius + this.stats.radius + 5) {
            const force = this.stats.knockbackForce || 15;
            const angle = Math.atan2(game.player.y - this.y, game.player.x - this.x);
            game.player.x += Math.cos(angle) * force;
            game.player.y += Math.sin(angle) * force;
            // Clamp player to world bounds
            game.player.x = Math.max(game.player.stats.radius, Math.min(CONFIG.world.width - game.player.stats.radius, game.player.x));
            game.player.y = Math.max(game.player.stats.radius, Math.min(CONFIG.world.height - game.player.stats.radius, game.player.y));
        }
    }

    // === BEHAVIOR: Teleporter ===
    _updateTeleport(game, speed) {
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Normal chase between teleports
        if (dist > 0) {
            this.x += (dx / dist) * speed;
            this.y += (dy / dist) * speed;
        }

        // Teleport cooldown
        this._teleportTimer++;
        const cooldown = this.stats.teleportCooldown || 240;
        if (this._teleportTimer >= cooldown) {
            this._teleportTimer = 0;
            const tpDist = this.stats.teleportDistance || 60;

            // Teleport behind the player (opposite of player's movement direction)
            const playerDx = game.player.x - this.x;
            const playerDy = game.player.y - this.y;
            const playerDist = Math.sqrt(playerDx * playerDx + playerDy * playerDy);
            if (playerDist > 0) {
                // Appear behind the player relative to enemy's approach direction
                const behindAngle = Math.atan2(playerDy, playerDx) + Math.PI;
                this.x = game.player.x + Math.cos(behindAngle) * tpDist;
                this.y = game.player.y + Math.sin(behindAngle) * tpDist;
            }

            // Clamp to world bounds
            this.x = Math.max(this.stats.radius, Math.min(CONFIG.world.width - this.stats.radius, this.x));
            this.y = Math.max(this.stats.radius, Math.min(CONFIG.world.height - this.stats.radius, this.y));

            // Teleport particles
            const { Particle } = game._entityClasses;
            for (let i = 0; i < 10; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = 1 + Math.random() * 3;
                game.addEntity('particles', new Particle(this.x, this.y, {
                    vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
                    life: 15 + Math.floor(Math.random() * 10),
                    color: '#da70d6'
                }));
            }
        }
    }

    // === BEHAVIOR: Summoner ===
    _updateSummon(game, speed) {
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const preferredRange = 250;

        // Stay at medium distance
        if (dist > preferredRange + 50) {
            // Approach
            if (dist > 0) {
                this.x += (dx / dist) * speed * 0.6;
                this.y += (dy / dist) * speed * 0.6;
            }
        } else if (dist < preferredRange - 50) {
            // Retreat
            if (dist > 0) {
                this.x -= (dx / dist) * speed * 0.5;
                this.y -= (dy / dist) * speed * 0.5;
            }
        } else {
            // Strafe slightly
            const perpX = -dy / dist;
            const perpY = dx / dist;
            this.x += perpX * speed * 0.2;
            this.y += perpY * speed * 0.2;
        }

        // Count actual living minions
        if (!this._summonerUid) this._summonerUid = Math.random();
        const livingMinions = game.entities.enemies.filter(e => e._summonerId === this._summonerUid && !e.toRemove).length;

        // Summon cooldown
        this._summonTimer++;
        const cooldown = this.stats.summonCooldown || 360;
        const maxMinions = this.stats.maxMinions || 6;

        if (this._summonTimer >= cooldown && livingMinions < maxMinions) {
            this._summonTimer = 0;
            const count = Math.min(this.stats.summonCount || 2, maxMinions - livingMinions);

            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spawnDist = 30 + Math.random() * 20;
                const minionStats = {
                    hp: Math.floor(this.stats.maxHp * 0.25),
                    maxHp: Math.floor(this.stats.maxHp * 0.25),
                    speed: this.stats.speed * 2.5,
                    damage: Math.floor(this.stats.damage * 0.5),
                    radius: 8,
                    xp: Math.floor(this.stats.xp * 0.2),
                    dr: 0,
                    type: 'minion',
                    behavior: 'chase'
                };
                const minion = new Enemy(
                    this.x + Math.cos(angle) * spawnDist,
                    this.y + Math.sin(angle) * spawnDist,
                    minionStats
                );
                minion._summonerId = this._summonerUid;
                minion.spawnImmunityTimer = 20;
                game.addEntity('enemies', minion);
            }

            // Summon particles
            const { Particle } = game._entityClasses;
            for (let i = 0; i < 6; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = 1 + Math.random() * 2;
                game.addEntity('particles', new Particle(this.x, this.y, {
                    vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
                    life: 15 + Math.floor(Math.random() * 10),
                    color: '#20b2aa'
                }));
            }
        }
    }

    takeDamage(amount, game) {
        if (this.spawnImmunityTimer > 0) return;
        const dr = this.stats.dr || 0;
        const finalDamage = amount * (1 - dr);
        this.hp -= finalDamage;

        // Stats tracking per achievement
        if (game.stats) game.stats.totalDamageDealt += finalDamage;

        // Lifesteal (da powerUp e da Core Sangue)
        const lsPower = game.player.powerUpTimers?.lifesteal > 0 ? 0.15 : 0;
        const lsCore = game.player.modifiers?.lifestealPercent ?? 0;
        const lsTotal = Math.max(lsPower, lsCore);
        if (lsTotal > 0) {
            game.player.hp = Math.min(game.player.stats.maxHp, game.player.hp + finalDamage * lsTotal);
        }

        if (this.hp <= 0) {
            this.onDeath(game);
        }
    }

    onDeath(game) {
        this.toRemove = true;
        game.audio?.playEnemyDeath();
        game.addScreenShake?.(this.stats.isElite ? 5 : (this.stats.isGolden ? 10 : 3));
        game.enemiesKilled++;
        game.bestiarySystem?.registerKill(this.type);
        game.score += 10 * (this.stats.isElite ? 3 : (this.stats.isGolden ? 50 : 1));

        // Store death position for Necromancer revive
        if (!game._recentDeathPositions) game._recentDeathPositions = [];
        if (this.behavior !== 'necro' && this.type !== 'zombie') {
            game._recentDeathPositions.push({ x: this.x, y: this.y });
            // Keep only the last 20 positions
            if (game._recentDeathPositions.length > 20) {
                game._recentDeathPositions.shift();
            }
        }

        // Bomber explodes on death
        if (this.behavior === 'bomb' && !this._exploded) {
            this._exploded = true;
            const explosionRadius = this.stats.explosionRadius || 80;
            const explosionDamage = this.stats.explosionDamage || 40;
            const distToPlayer = Utils.getDistance(this, game.player);
            if (distToPlayer < explosionRadius) {
                game.player.takeDamage(explosionDamage, game, this);
            }
            const { Particle } = game._entityClasses;
            const ct = CONFIG.accessibility?.reduceMotion ? 4 : 12;
            for (let i = 0; i < ct; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = 2 + Math.random() * 5;
                game.addEntity('particles', new Particle(this.x, this.y, {
                    vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
                    life: 25 + Math.floor(Math.random() * 15),
                    color: '#ff3333'
                }));
            }
            game.addScreenShake?.(6);
        }

        // Splitter splits on death
        if (this.behavior === 'split' && this._generation < (this.stats.maxGeneration || 2)) {
            const splitCount = this.stats.splitCount || 2;
            for (let i = 0; i < splitCount; i++) {
                const angle = (Math.PI * 2 / splitCount) * i + Math.random() * 0.5;
                const offsetX = Math.cos(angle) * 20;
                const offsetY = Math.sin(angle) * 20;
                const childStats = {
                    ...this.stats,
                    hp: Math.floor(this.stats.maxHp * 0.4),
                    maxHp: Math.floor(this.stats.maxHp * 0.4),
                    damage: Math.floor(this.stats.damage * 0.6),
                    radius: Math.max(6, Math.floor(this.stats.radius * 0.7)),
                    xp: Math.floor(this.stats.xp * 0.4),
                    _generation: this._generation + 1,
                    type: 'splitter_child'
                };
                const child = new Enemy(this.x + offsetX, this.y + offsetY, childStats);
                child.spawnImmunityTimer = 20;
                game.addEntity('enemies', child);
            }
        }

        // AnomalousArea progress (evento kill)
        if (game.entities && game.entities.anomalousAreas) {
            game.entities.anomalousAreas.forEach(area => {
                if (!area.completed && area.eventType === 'kill') {
                    if (Utils.getDistance(this, area) < area.radius) {
                        area.progress++;
                    }
                }
            });
        }

        // Golden enemy reward
        if (this.stats.isGolden) {
            game.gemsThisRun += 120;
            game.notifications?.push?.({ text: '✨ NEMICO DORATO! +120 💎', life: 300, color: '#ffd700' });
            game.cheatCodeSystem?.discoverEgg('golden_enemy');
            game.audio?.playAchievementUnlock?.();
            // Confetti particles
            const { Particle } = game._entityClasses;
            for (let i = 0; i < 30; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 3 + Math.random() * 5;
                const colors = ['#ffd700', '#ff6347', '#00ff88', '#ff69b4', '#87ceeb'];
                game.addEntity('particles', new Particle(this.x, this.y, {
                    vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                    life: 40 + Math.floor(Math.random() * 30),
                    color: colors[Math.floor(Math.random() * colors.length)]
                }));
            }
        }

        // Death particles
        const stageInfo = CONFIG.stages[game.currentStage];
        const particleColor = this.stats.color
            || (this.stats.isElite
                ? (stageInfo?.enemies?.eliteColor || '#c0392b')
                : (stageInfo?.enemies?.baseColor || '#e74c3c'));
        const { Particle } = game._entityClasses;
        const count = CONFIG.accessibility?.reduceMotion ? (this.stats.isElite ? 4 : 2) : (this.stats.isElite ? 14 : 8);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            game.addEntity('particles', new Particle(this.x, this.y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 25 + Math.floor(Math.random() * 15),
                color: particleColor
            }));
        }

        // Drop XP orb
        const { XpOrb } = game._entityClasses;
        const stageEffects = CONFIG.stages[game.currentStage]?.effects || { xpBonus: 1, dropBonus: 1 };
        const xpValue = Math.floor(this.stats.xp * stageEffects.xpBonus);
        game.addEntity('xpOrbs', new XpOrb(this.x, this.y, xpValue));

        // Drop gems sometimes
        if (Math.random() < 0.05 + game.player.modifiers.luck * 0.5) {
            const { GemOrb } = game._entityClasses;
            game.addEntity('gemOrbs', new GemOrb(this.x, this.y, 1));
        }

        // Drop materials (disattivato: nuovo sistema di core/armi via chest)

        // Track elite kills
        if (this.stats.isElite) {
            game.elitesKilledThisStage++;
            game.enemiesKilledSinceBoss += 3;
            if (game.achievementSystem) {
                game.achievementSystem.updateProgress('elites_killed', 1, game);
            }
        } else {
            game.enemiesKilledSinceBoss++;
        }

        // Achievement tracking
        if (game.achievementSystem) {
            game.achievementSystem.updateProgress('enemies_killed', 1, game);
        }

        // Stats tracking per combat achievements
        if (game.stats) {
            game.stats.kills++;
            // Easter egg: 666 kills
            game.cheatCodeSystem?.check666(game.stats.kills);
            // Combo kills (entro 3s)
            const now = Date.now();
            if (now - game.stats._lastKillTime < 3000) {
                game.stats._comboKillCount++;
                game.stats.bestComboKills = Math.max(game.stats.bestComboKills, game.stats._comboKillCount);
            } else {
                game.stats._comboKillCount = 1;
            }
            game.stats._lastKillTime = now;

            // === COMBO XP BONUS ===
            const combo = game.stats._comboKillCount;
            if (combo >= 20) {
                // Triple XP + 3 gemme
                const { XpOrb, GemOrb } = game._entityClasses;
                game.addEntity('xpOrbs', new XpOrb(this.x + 5, this.y + 5, Math.floor(this.stats.xp * 2)));
                for (let g = 0; g < 3; g++) game.addEntity('gemOrbs', new GemOrb(this.x + (g - 1) * 8, this.y - 10, 1));
                game.notifications?.push?.({ text: `🔥 COMBO ×${combo}! XP ×3!`, life: 200, color: '#ff1744' });
            } else if (combo >= 10) {
                // Double XP + 1 gemma
                const { XpOrb, GemOrb } = game._entityClasses;
                game.addEntity('xpOrbs', new XpOrb(this.x + 5, this.y + 5, Math.floor(this.stats.xp)));
                game.addEntity('gemOrbs', new GemOrb(this.x, this.y - 10, 1));
                if (combo === 10) game.notifications?.push?.({ text: `⚡ COMBO ×10! XP ×2!`, life: 180, color: '#ff9100' });
            } else if (combo >= 5) {
                // 1.5x XP
                const { XpOrb } = game._entityClasses;
                game.addEntity('xpOrbs', new XpOrb(this.x + 5, this.y + 5, Math.floor(this.stats.xp * 0.5)));
                if (combo === 5) game.notifications?.push?.({ text: `✨ COMBO ×5! XP ×1.5!`, life: 150, color: '#ffd600' });
            }
        }

        // Meta Progression System hook
        game.metaProgressionSystem?.onEnemyKilled?.(this);
    }

    draw(ctx, game) {
        if (this.spawnImmunityTimer > 0) {
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 50) * 0.2;
        }

        const stageInfo = CONFIG.stages[game.currentStage];
        const shape = stageInfo?.enemies?.shape || 'circle';

        // Use behavior-specific color if available
        let baseColor;
        if (this.stats.color) {
            baseColor = this.stats.color;
        } else if (this.stats.isGolden) {
            baseColor = '#ffd700';
        } else if (this.stats.isElite) {
            baseColor = stageInfo?.enemies?.eliteColor || '#c0392b';
        } else {
            baseColor = stageInfo?.enemies?.baseColor || '#e74c3c';
        }

        // Draw behavior-specific visual indicator
        this._drawBehaviorIndicator(ctx, game);

        Utils.drawEnemySprite(ctx, this.x, this.y, this.stats.radius, shape, baseColor, this.stats.isElite);

        // Golden enemy sparkle
        if (this.stats.isGolden) {
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 15 + Math.sin(Date.now() / 200) * 5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.stats.radius + 2, 0, Math.PI * 2);
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // HP bar
        if (this.hp < this.stats.maxHp) {
            const barW = this.stats.radius * 2;
            const barH = 4;
            const barX = this.x - barW / 2;
            const barY = this.y - this.stats.radius - 10;
            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = this.hp / this.stats.maxHp > 0.5 ? '#0f0' : (this.hp / this.stats.maxHp > 0.25 ? '#ff0' : '#f00');
            ctx.fillRect(barX, barY, barW * (this.hp / this.stats.maxHp), barH);
        }

        ctx.globalAlpha = 1;
    }

    _drawBehaviorIndicator(ctx, game) {
        const r = this.stats.radius;
        switch (this.behavior) {
            case 'dash':
                // Flash when preparing to dash
                if (this._behaviorState === 'prep') {
                    const flash = Math.sin(Date.now() / 50) * 0.4 + 0.5;
                    ctx.fillStyle = `rgba(255, 102, 0, ${flash})`;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, r + 4, 0, Math.PI * 2);
                    ctx.fill();
                } else if (this._behaviorState === 'dash') {
                    // Motion trail during dash
                    ctx.strokeStyle = 'rgba(255, 102, 0, 0.4)';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(this.x - Math.cos(this._dashAngle) * r * 2.5, this.y - Math.sin(this._dashAngle) * r * 2.5);
                    ctx.stroke();
                }
                break;

            case 'orbit':
                // Orbit trail (small arc)
                ctx.strokeStyle = 'rgba(0, 204, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(game.player.x, game.player.y, this.stats.orbitRadius || 120, this._orbitAngle - 0.5, this._orbitAngle);
                ctx.stroke();
                break;

            case 'bomb':
                // Pulsing red glow when near player
                if (this._behaviorTimer > 0) {
                    const pulseIntensity = this._behaviorTimer / 60;
                    const pulse = Math.sin(Date.now() / (200 - pulseIntensity * 150)) * 0.3 + 0.3;
                    ctx.fillStyle = `rgba(255, 50, 50, ${pulse * pulseIntensity})`;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, r + 6 + pulseIntensity * 4, 0, Math.PI * 2);
                    ctx.fill();
                }
                // Fuse icon
                ctx.fillStyle = '#ff3333';
                ctx.font = `${Math.max(8, r)}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText('💣', this.x, this.y - r - 4);
                break;

            case 'ranged':
                // Crosshair indicator when aiming
                if (this._lastShot > (this.stats.shootCooldown || 120) * 0.7) {
                    ctx.strokeStyle = 'rgba(255, 204, 0, 0.5)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    const angle = Math.atan2(game.player.y - this.y, game.player.x - this.x);
                    ctx.moveTo(this.x + Math.cos(angle) * r, this.y + Math.sin(angle) * r);
                    ctx.lineTo(this.x + Math.cos(angle) * (r + 20), this.y + Math.sin(angle) * (r + 20));
                    ctx.stroke();
                }
                break;

            case 'necro':
                // Dark aura
                const auraOpacity = 0.15 + Math.sin(Date.now() / 500) * 0.1;
                ctx.fillStyle = `rgba(153, 0, 204, ${auraOpacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.stats.reviveRadius || 150, 0, Math.PI * 2);
                ctx.fill();
                // Skull icon
                ctx.fillStyle = '#9900cc';
                ctx.font = `${Math.max(8, r)}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText('💀', this.x, this.y - r - 4);
                break;

            case 'split':
                // Split indicator (diamond shape outline)
                ctx.strokeStyle = 'rgba(102, 255, 102, 0.4)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - r - 3);
                ctx.lineTo(this.x + r * 0.5, this.y);
                ctx.lineTo(this.x, this.y + r + 3);
                ctx.lineTo(this.x - r * 0.5, this.y);
                ctx.closePath();
                ctx.stroke();
                break;

            case 'tank':
                // Thick armor border
                ctx.strokeStyle = 'rgba(119, 136, 153, 0.7)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(this.x, this.y, r + 3, 0, Math.PI * 2);
                ctx.stroke();
                // Shield icon
                ctx.fillStyle = '#778899';
                ctx.font = `${Math.max(8, r)}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText('🛡️', this.x, this.y - r - 4);
                break;

            case 'teleport': {
                // Teleport shimmer effect
                const tpAlpha = 0.2 + Math.sin(Date.now() / 200) * 0.15;
                ctx.fillStyle = `rgba(218, 112, 214, ${tpAlpha})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, r + 5, 0, Math.PI * 2);
                ctx.fill();
                // Teleport readiness (timer filling)
                const cooldown = this.stats.teleportCooldown || 240;
                const readiness = Math.min(1, this._teleportTimer / cooldown);
                if (readiness > 0.7) {
                    ctx.strokeStyle = `rgba(218, 112, 214, ${readiness})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, r + 7, -Math.PI / 2, -Math.PI / 2 + readiness * Math.PI * 2);
                    ctx.stroke();
                }
                break;
            }

            case 'summon': {
                // Runic circle
                const runeAlpha = 0.2 + Math.sin(Date.now() / 400) * 0.1;
                ctx.strokeStyle = `rgba(32, 178, 170, ${runeAlpha})`;
                ctx.lineWidth = 1;
                const runeR = r + 8;
                ctx.beginPath();
                ctx.arc(this.x, this.y, runeR, 0, Math.PI * 2);
                ctx.stroke();
                // Rune marks
                const runeAngle = Date.now() / 1000;
                for (let i = 0; i < 3; i++) {
                    const a = runeAngle + (i * Math.PI * 2 / 3);
                    ctx.fillStyle = `rgba(32, 178, 170, ${runeAlpha + 0.1})`;
                    ctx.beginPath();
                    ctx.arc(this.x + Math.cos(a) * runeR, this.y + Math.sin(a) * runeR, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                // Summon icon
                ctx.fillStyle = '#20b2aa';
                ctx.font = `${Math.max(8, r)}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText('⚔️', this.x, this.y - r - 4);
                break;
            }
        }

        // Champion aura (golden glow)
        if (this.isChampion) {
            const champAlpha = 0.2 + Math.sin(Date.now() / 300) * 0.1;
            ctx.strokeStyle = `rgba(255, 215, 0, ${champAlpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, r + 6, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}
