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

        // Traccia metriche (guard: retentionMonitor può non essere inizializzato in alcuni bundle)
        if (this.retentionMonitor && typeof this.retentionMonitor.trackSession === 'function') {
            this.retentionMonitor.trackSession({
                sessionTime: sessionTime,
                retention: retention,
                satisfaction: satisfaction,
                playerLevel: playerLevel,
                enemyScaling: enemyCount // Usa enemyCount invece di enemyScaling per tracciare numero nemici
            });
        }

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
        // Calcola scaling nemici basato su tempo: base progressiva + andamento a ondate (spikes)
        const timeFactor = this.gameTime / (CONFIG.enemies.scaling.timeFactor * 60);
        const levelFactor = this.player.level * CONFIG.enemies.scaling.levelFactorMultiplier;

        // Fase dell'onda: un ciclo completo ogni 3 minuti (180s)
        const wavePeriod = 180;
        const phase = (this.gameTime % wavePeriod) / wavePeriod;

        // Funzione asimmetrica: lenta salita (tensione), picco in top 20% del ciclo, veloce discesa (sollievo)
        // Usiamo un seno modificato: picco pronunciato positivo e valle più dolce
        const waveOffset = Math.sin(phase * Math.PI * 2);

        // Intensità dell'onda scala nel tempo (all'inizio le ondate sono lievi, poi diventano enormi)
        const waveIntensity = 0.5 + (timeFactor * 0.3);

        return Math.max(0, timeFactor + levelFactor + (waveOffset * waveIntensity));
    },

    checkAutoBalance() {
        if (!this.analyticsManager) return;

        const report = this.analyticsManager.getAnalyticsReport();
        const scores = this.analyticsManager.getAllArchetypeScores();
        const currentArchetype = this.player.archetype.id;
        const currentScore = scores[currentArchetype] || 0.5;

        // Calcola la media degli score
        const scoreValues = Object.values(scores);
        const avgScore = scoreValues.length > 0 ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length : 0.5;
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
        const nerfDuration = 300;
        const nerfAmount = 0.15;

        switch (archetype) {
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
            case 'prism':
                this.player.modifiers.area *= (1 - nerfAmount);
                this.player.modifiers.power *= (1 - nerfAmount * 0.5);
                break;
            case 'unstable':
                this.player.modifiers.power *= (1 - nerfAmount);
                break;
            case 'druid':
                this.player.stats.speed *= (1 - nerfAmount * 0.5);
                this.player.stats.maxHp = Math.floor(this.player.stats.maxHp * (1 - nerfAmount));
                break;
            case 'phantom':
                this.player.stats.speed *= (1 - nerfAmount);
                break;
            default:
                this.player.modifiers.power *= (1 - nerfAmount);
                break;
        }

        this.notifications.push({ text: `Auto-nerf applicato a ${archetype}`, life: 180, color: '#ff6b6b' });
        setTimeout(() => { this.removeTemporaryNerf(archetype); }, nerfDuration * 1000);
    },

    applyTemporaryBuff(archetype) {
        const buffDuration = 300;
        const buffAmount = 0.15;

        switch (archetype) {
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
            case 'prism':
                this.player.modifiers.area *= (1 + buffAmount);
                this.player.modifiers.power *= (1 + buffAmount * 0.5);
                break;
            case 'unstable':
                this.player.modifiers.power *= (1 + buffAmount);
                break;
            case 'druid':
                this.player.stats.speed *= (1 + buffAmount * 0.5);
                this.player.stats.maxHp = Math.floor(this.player.stats.maxHp * (1 + buffAmount));
                this.player.hp = Math.min(this.player.hp, this.player.stats.maxHp);
                break;
            case 'phantom':
                this.player.stats.speed *= (1 + buffAmount);
                break;
            default:
                this.player.modifiers.power *= (1 + buffAmount);
                break;
        }

        this.notifications.push({ text: `Auto-buff applicato a ${archetype}`, life: 180, color: '#4ecdc4' });
        setTimeout(() => { this.removeTemporaryBuff(archetype); }, buffDuration * 1000);
    },

    removeTemporaryNerf(archetype) {
        const nerfAmount = 0.15;

        switch (archetype) {
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
            case 'prism':
                this.player.modifiers.area /= (1 - nerfAmount);
                this.player.modifiers.power /= (1 - nerfAmount * 0.5);
                break;
            case 'unstable':
                this.player.modifiers.power /= (1 - nerfAmount);
                break;
            case 'druid':
                this.player.stats.speed /= (1 - nerfAmount * 0.5);
                this.player.stats.maxHp = Math.floor(this.player.stats.maxHp / (1 - nerfAmount));
                break;
            case 'phantom':
                this.player.stats.speed /= (1 - nerfAmount);
                break;
            default:
                this.player.modifiers.power /= (1 - nerfAmount);
                break;
        }

        this.notifications.push({ text: `Auto-nerf rimosso da ${archetype}`, life: 120, color: '#ffa500' });
    },

    removeTemporaryBuff(archetype) {
        const buffAmount = 0.15;

        switch (archetype) {
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
            case 'prism':
                this.player.modifiers.area /= (1 + buffAmount);
                this.player.modifiers.power /= (1 + buffAmount * 0.5);
                break;
            case 'unstable':
                this.player.modifiers.power /= (1 + buffAmount);
                break;
            case 'druid':
                this.player.stats.speed /= (1 + buffAmount * 0.5);
                this.player.stats.maxHp = Math.floor(this.player.stats.maxHp / (1 + buffAmount));
                break;
            case 'phantom':
                this.player.stats.speed /= (1 + buffAmount);
                break;
            default:
                this.player.modifiers.power /= (1 + buffAmount);
                break;
        }

        this.notifications.push({ text: `Auto-buff rimosso da ${archetype}`, life: 120, color: '#ffa500' });
    }
};
