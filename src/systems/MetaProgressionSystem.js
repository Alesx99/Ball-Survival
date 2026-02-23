import { CONFIG } from '../config/index.js';
import { poolManager } from '../utils/PoolManager.js';
import { Particle } from '../entities/index.js';

export class MetaProgressionSystem {
    constructor(game) {
        this.game = game;
        // Carica nodi sbloccati dai salvataggi se esistono, altrimenti vuoto (o converte permanentUpgrades vecchi)
        this.unlockedNodes = this.game.loadGameData?.()?.skillTreeNodes || {};

        // Mantieni vecchio sistema di compatibilità se `skillTreeNodes` è vuoto ma `permanentUpgrades` esiste
        if (Object.keys(this.unlockedNodes).length === 0 && this.game.permanentUpgrades) {
            // Un semplice mapping potrebbe essere fatto qui se necessario
        }
    }

    getUnlockedLevel(nodeId) {
        return this.unlockedNodes[nodeId] || 0;
    }

    isNodeUnlocked(nodeId) {
        return this.getUnlockedLevel(nodeId) > 0;
    }

    canUnlockNode(nodeId) {
        const nodeData = CONFIG.skillTree ? CONFIG.skillTree[nodeId] : null;
        if (!nodeData) return false;

        // Se è già al livello massimo non si può sbloccare oltre
        if (this.getUnlockedLevel(nodeId) >= nodeData.maxLevel) return false;

        // Se non ha requisiti ed è il nodo base, si può sbloccare
        if (!nodeData.requires || nodeData.requires.length === 0) return true;

        const requireType = nodeData.requireType || 'any'; // 'any' (or) o 'all' (and)

        if (requireType === 'all') {
            return nodeData.requires.every(reqId => this.isNodeUnlocked(reqId));
        } else {
            return nodeData.requires.some(reqId => this.isNodeUnlocked(reqId));
        }
    }

    getNodeCost(nodeId) {
        const nodeData = CONFIG.skillTree ? CONFIG.skillTree[nodeId] : null;
        if (!nodeData) return Infinity;
        const currentLevel = this.getUnlockedLevel(nodeId);
        // Costo cresce del 30% per livello
        return Math.floor(nodeData.baseCost * Math.pow(1.3, currentLevel));
    }

    unlockNode(nodeId) {
        if (!this.canUnlockNode(nodeId)) return false;

        const cost = this.getNodeCost(nodeId);
        if (this.game.totalGems < cost) return false;

        this.game.totalGems -= cost;
        this.unlockedNodes[nodeId] = (this.unlockedNodes[nodeId] || 0) + 1;

        // Assicurati che il save data rifletta il cambiamento
        this.saveData();
        return true;
    }

    saveData() {
        if (this.game.saveGameData) {
            this.game.saveGameData();
        } else if (this.game.saveData) {
            this.game.saveData(); // metodo fallibile in base a com'è scritto
        }
    }

    // Applica logicamente i modificatori allo starting player (chiamato all'inizio della run)
    applyModifiersToPlayer(player) {
        // Applichiamo i bonus solo dai nodi skillTree
        for (const [nodeId, level] of Object.entries(this.unlockedNodes)) {
            const nodeData = CONFIG.skillTree ? CONFIG.skillTree[nodeId] : null;
            if (!nodeData || level === 0 || !nodeData.effect) continue;

            const effect = nodeData.effect;

            if (effect.type === 'stat') {
                if (effect.stat === 'luck_and_xp') {
                    player.modifiers.luck += effect.value * level;
                    player.modifiers.xpGain += effect.value * level;
                } else if (['maxHp', 'speed', 'dr'].includes(effect.stat)) {
                    // Statistiche assolute
                    player.stats[effect.stat] += effect.value * level;
                    if (effect.stat === 'maxHp') player.hp = player.stats.maxHp; // Cura il player al nuovo max
                } else {
                    // Statistiche relative (moltiplicatori)
                    player.modifiers[effect.stat] += effect.value * level;
                }
            }
        }
    }

    // Usato dal Game Loop per effetti attivi passivi (es. rigenerazione, meteorite)
    update(deltaTime) {
        const player = this.game.player;
        if (!player || player.hp <= 0) return;

        // Regen
        if (this.unlockedNodes['tier1_regen']) {
            const regenAmount = 1 * this.unlockedNodes['tier1_regen'];
            this.regenTimer = (this.regenTimer || 0) + deltaTime;
            if (this.regenTimer >= 5000) { // Ogni 5 secondi
                player.heal(regenAmount);
                this.regenTimer = 0;
            }
        }
    }

    // Usato da altri sistemi per comunicare eventi (es. kill)
    onEnemyKilled(enemy) {
        // Logica meteorite speciale
        if (this.unlockedNodes['special_meteor']) {
            this.meteorKillCount = (this.meteorKillCount || 0) + 1;
            if (this.meteorKillCount >= 100) {
                this.meteorKillCount = 0;
                this.spawnMeteor();
            }
        }
    }

    spawnMeteor() {
        if (!this.game.entities || !this.game.player) return;

        // Seleziona un bersaglio casuale (o zona attorno al player)
        const enemies = this.game.enemies || [];
        let targetX = this.game.player.x;
        let targetY = this.game.player.y;

        if (enemies.length > 0) {
            const rx = Math.floor(Math.random() * enemies.length);
            targetX = enemies[rx].x;
            targetY = enemies[rx].y;
        }

        // Simula lo spawn di uno shockwave o meteorite
        const meteor = poolManager.get('Projectile');
        if (meteor) {
            // Proprietà di base per sfruttare le logiche esistenti
            meteor.x = targetX;
            meteor.y = targetY;
            meteor.vx = 0;
            meteor.vy = 0;
            meteor.width = 100;
            meteor.height = 100;
            meteor.color = '#ff4500';
            meteor.damage = 500 * (this.game.getEffectivePower?.() ?? this.game.player.modifiers.power); // Danno elevato (power linearizzato)
            meteor.piercing = 999;
            meteor.duration = 500; // 0.5 sec explosion
            meteor.isExplosion = true; // Flag fittizia
            // Custom draw/update se possibile, oppure usiamo projectile base con duration bassa e size grande
            if (!this.game.entities.projectiles) this.game.entities.projectiles = [];
            this.game.entities.projectiles.push(meteor);

            this.game.addEntity('particles', new Particle(targetX, targetY, { color: '#ff4500', life: 50, vx: 0, vy: 0 }));
        }
    }

    onPlayerDeath(player) {
        // Logica revive
        if (this.unlockedNodes['special_second_chance'] && !this.hasRevivedThisRun) {
            this.hasRevivedThisRun = true;
            player.hp = player.stats.maxHp * 0.5;
            this.game.notifications?.push({ text: 'ANIMA PERSISTENTE: Hai ottenuto una seconda possibilità!', life: 200, color: '#ffd700' });
            return true; // Blocca la morte
        }
        return false; // Continua a morire
    }

    resetRunState() {
        this.meteorKillCount = 0;
        this.hasRevivedThisRun = false;
        this.regenTimer = 0;
    }
}
