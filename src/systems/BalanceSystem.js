import { CONFIG } from '../config/index.js';

export const BalanceSystem = {
    trackRetentionMetrics() {
        const sessionTime = this.gameTime / 60; // Converti in minuti
        const playerLevel = this.player.level;
        const enemyCount = this.entities.enemies.length + this.entities.bosses.length;

        // Calcola retention basata su session time
        const retention = this.calculateRetention(sessionTime);

        // Calcola satisfaction basata su player level e enemy scaling
        const satisfaction = this.calculateSatisfaction(playerLevel, enemyCount);

        // Calcola enemy scaling
        const enemyScaling = this.calculateEnemyScaling();

        // Traccia metriche
        this.retentionMonitor.trackSession({
            sessionTime: sessionTime,
            retention: retention,
            satisfaction: satisfaction,
            playerLevel: playerLevel,
            enemyScaling: enemyCount // Usa enemyCount invece di enemyScaling per tracciare numero nemici
        });

        // Controlla milestone
        this.progressionOptimizer.checkMilestone(playerLevel);

        // Log metriche ogni 5 minuti
        if (Math.floor(sessionTime) % 5 === 0) {
            console.log('📊 Metriche Versione 5.3:', {
                sessionTime: sessionTime.toFixed(1) + ' min',
                retention: (retention * 100).toFixed(1) + '%',
                satisfaction: (satisfaction * 100).toFixed(1) + '%',
                playerLevel: playerLevel,
                enemyCount: enemyCount,
                spawnRate: 'Dinamico' // Indica che lo spawn è ora dinamico
            });
        }
    },

    calculateRetention(sessionTime) {
        // Modello retention basato su session time
        if (sessionTime < 5) return 0.6; // Troppo breve
        if (sessionTime < 10) return 0.75; // Breve ma accettabile
        if (sessionTime < 20) return 0.9; // Ottimale
        if (sessionTime < 30) return 0.85; // Lungo ma gestibile
        return 0.7; // Troppo lungo
    },

    calculateSatisfaction(playerLevel, enemyCount) {
        // Modello satisfaction basato su progressione
        const levelSatisfaction = Math.min(1.0, playerLevel / 10);
        const enemySatisfaction = Math.min(1.0, enemyCount / 20);
        return (levelSatisfaction + enemySatisfaction) / 2;
    },

    calculateEnemyScaling() {
        // Calcola scaling nemici basato su tempo
        const timeFactor = this.gameTime / (CONFIG.enemies.scaling.timeFactor * 60);
        const levelFactor = this.player.level * CONFIG.enemies.scaling.levelFactorMultiplier;
        return timeFactor + levelFactor;
    },

    checkAutoBalance() {
        if (!this.analyticsManager) return;

        const report = this.analyticsManager.getAnalyticsReport();
        const scores = this.analyticsManager.getAllArchetypeScores();
        const currentArchetype = this.player.archetype.id;
        const currentScore = scores[currentArchetype] || 0.5;

        // Calcola la media degli score
        const avgScore = Object.values(scores).reduce((a, b) => a + b) / Object.values(scores).length;
        const scoreDiff = currentScore - avgScore;

        // Se lo score è troppo alto (>20% sopra la media), applica nerf temporaneo
        if (scoreDiff > 0.2) {
            this.applyTemporaryNerf(currentArchetype);
            console.log(`Auto-nerf applicato a ${currentArchetype}: score ${currentScore.toFixed(2)} vs media ${avgScore.toFixed(2)}`);
        }
        // Se lo score è troppo basso (<20% sotto la media), applica buff temporaneo
        else if (scoreDiff < -0.2) {
            this.applyTemporaryBuff(currentArchetype);
            console.log(`Auto-buff applicato a ${currentArchetype}: score ${currentScore.toFixed(2)} vs media ${avgScore.toFixed(2)}`);
        }
    },

    applyTemporaryNerf(archetype) {
        const nerfDuration = 300; // 5 minuti
        const nerfAmount = 0.15; // 15% di riduzione

        switch(archetype) {
            case 'steel':
                this.player.stats.dr *= (1 - nerfAmount);
                this.player.stats.speed *= (1 - nerfAmount * 0.5);
                break;
            case 'shadow':
                this.player.modifiers.power *= (1 - nerfAmount);
                break;
            case 'tech':
                this.player.modifiers.area *= (1 - nerfAmount);
                break;
            case 'magma':
                this.player.modifiers.frequency *= (1 + nerfAmount);
                break;
            default:
                this.player.modifiers.power *= (1 - nerfAmount);
                break;
        }

        // Notifica al giocatore
        this.notifications.push({
            text: `Auto-nerf applicato a ${archetype}`,
            life: 180,
            color: '#ff6b6b'
        });

        // Rimuovi il nerf dopo il tempo stabilito
        setTimeout(() => {
            this.removeTemporaryNerf(archetype);
        }, nerfDuration * 1000);
    },

    applyTemporaryBuff(archetype) {
        const buffDuration = 300; // 5 minuti
        const buffAmount = 0.15; // 15% di aumento

        switch(archetype) {
            case 'steel':
                this.player.stats.dr *= (1 + buffAmount);
                this.player.stats.speed *= (1 + buffAmount * 0.5);
                break;
            case 'shadow':
                this.player.modifiers.power *= (1 + buffAmount);
                break;
            case 'tech':
                this.player.modifiers.area *= (1 + buffAmount);
                break;
            case 'magma':
                this.player.modifiers.frequency *= (1 - buffAmount);
                break;
            default:
                this.player.modifiers.power *= (1 + buffAmount);
                break;
        }

        // Notifica al giocatore
        this.notifications.push({
            text: `Auto-buff applicato a ${archetype}`,
            life: 180,
            color: '#4ecdc4'
        });

        // Rimuovi il buff dopo il tempo stabilito
        setTimeout(() => {
            this.removeTemporaryBuff(archetype);
        }, buffDuration * 1000);
    },

    removeTemporaryNerf(archetype) {
        const nerfAmount = 0.15;

        switch(archetype) {
            case 'steel':
                this.player.stats.dr /= (1 - nerfAmount);
                this.player.stats.speed /= (1 - nerfAmount * 0.5);
                break;
            case 'shadow':
                this.player.modifiers.power /= (1 - nerfAmount);
                break;
            case 'tech':
                this.player.modifiers.area /= (1 - nerfAmount);
                break;
            case 'magma':
                this.player.modifiers.frequency /= (1 + nerfAmount);
                break;
            default:
                this.player.modifiers.power /= (1 - nerfAmount);
                break;
        }

        this.notifications.push({
            text: `Auto-nerf rimosso da ${archetype}`,
            life: 120,
            color: '#ffa500'
        });
    },

    removeTemporaryBuff(archetype) {
        const buffAmount = 0.15;

        switch(archetype) {
            case 'steel':
                this.player.stats.dr /= (1 + buffAmount);
                this.player.stats.speed /= (1 + buffAmount * 0.5);
                break;
            case 'shadow':
                this.player.modifiers.power /= (1 + buffAmount);
                break;
            case 'tech':
                this.player.modifiers.area /= (1 + buffAmount);
                break;
            case 'magma':
                this.player.modifiers.frequency /= (1 - buffAmount);
                break;
            default:
                this.player.modifiers.power /= (1 + buffAmount);
                break;
        }

        this.notifications.push({
            text: `Auto-buff rimosso da ${archetype}`,
            life: 120,
            color: '#ffa500'
        });
    }
};
