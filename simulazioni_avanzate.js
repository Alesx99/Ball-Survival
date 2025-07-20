/**
 * 📊 SIMULAZIONI AVANZATE - Ball Survival (2025)
 * 
 * Questo file contiene simulazioni statistiche avanzate per analizzare
 * il bilanciamento del gioco e ottimizzare l'esperienza utente.
 */

// Configurazione del gioco (estratta da game.js)
const CONFIG = {
    player: {
        base: { hp: 150, speed: 3, radius: 15, dr: 0 },
        xpCurve: { base: 15, growth: 1.20, levelFactor: 12, power: 1.0 }
    },
    enemies: {
        scaling: { 
            timeFactor: 12,
            hpPerFactor: 6,
            speedPerFactor: 0.025,
            damagePerFactor: 1.1,
            xpPerFactor: 1.3,
            xpPowerFactor: 1.06,
            levelFactorMultiplier: 0.8,
            drPerFactor: 0.0008
        },
        base: { hp: 25, speed: 1.2, radius: 12, damage: 7, xp: 4, dr: 0 }
    },
    characterArchetypes: {
        'standard': { hp: 150, speed: 3, dr: 0, damage: 1.0, cost: 0 },
        'steel': { hp: 150, speed: 1.5, dr: 0.7, damage: 1.4, cost: 200 },
        'magma': { hp: 150, speed: 3, dr: 0, damage: 1.25, cost: 300 },
        'frost': { hp: 135, speed: 3, dr: 0, damage: 1.25, cost: 300 },
        'shadow': { hp: 120, speed: 4.05, dr: 0, damage: 1.15, cost: 400 },
        'tech': { hp: 150, speed: 3, dr: 0, damage: 0.95, cost: 800 }
    }
};

/**
 * 🎯 SIMULAZIONE 1: Progressione XP
 * Calcola l'XP richiesto per ogni livello e analizza la curva
 */
class XPSimulation {
    constructor() {
        this.results = [];
        this.calculateXPProgression();
    }

    calculateXPForLevel(level) {
        const c = CONFIG.player.xpCurve;
        return Math.floor(c.base * Math.pow(c.growth, level - 1) + c.levelFactor * level);
    }

    calculateXPGrowthRate(level) {
        const c = CONFIG.player.xpCurve;
        return c.base * Math.log(c.growth) * Math.pow(c.growth, level - 1) + c.levelFactor;
    }

    calculateXPProgression() {
        for (let level = 1; level <= 30; level++) {
            const xpRequired = this.calculateXPForLevel(level);
            const growthRate = this.calculateXPGrowthRate(level);
            const totalXP = this.calculateTotalXP(level);
            
            this.results.push({
                level: level,
                xpRequired: xpRequired,
                growthRate: growthRate,
                totalXP: totalXP,
                timeToLevel: this.estimateTimeToLevel(level)
            });
        }
    }

    calculateTotalXP(level) {
        let total = 0;
        for (let i = 1; i <= level; i++) {
            total += this.calculateXPForLevel(i);
        }
        return total;
    }

    estimateTimeToLevel(level) {
        // Stima tempo per raggiungere il livello basato su XP/min
        const xpPerMinute = 8; // Media stimata
        const totalXP = this.calculateTotalXP(level);
        return Math.ceil(totalXP / xpPerMinute);
    }

    getAnalysis() {
        const analysis = {
            averageXPPerLevel: 0,
            steepestLevel: 1,
            easiestLevel: 1,
            totalXPForMaxLevel: 0,
            progressionCurve: 'balanced'
        };

        let totalXP = 0;
        let maxGrowthRate = 0;
        let minGrowthRate = Infinity;

        this.results.forEach((result, index) => {
            totalXP += result.xpRequired;
            
            if (result.growthRate > maxGrowthRate) {
                maxGrowthRate = result.growthRate;
                analysis.steepestLevel = result.level;
            }
            
            if (result.growthRate < minGrowthRate) {
                minGrowthRate = result.growthRate;
                analysis.easiestLevel = result.level;
            }
        });

        analysis.averageXPPerLevel = totalXP / this.results.length;
        analysis.totalXPForMaxLevel = totalXP;

        // Analizza la curva di progressione
        const earlyLevels = this.results.slice(0, 5);
        const midLevels = this.results.slice(10, 15);
        const lateLevels = this.results.slice(20, 25);

        const earlyAvg = earlyLevels.reduce((sum, r) => sum + r.xpRequired, 0) / earlyLevels.length;
        const midAvg = midLevels.reduce((sum, r) => sum + r.xpRequired, 0) / midLevels.length;
        const lateAvg = lateLevels.reduce((sum, r) => sum + r.xpRequired, 0) / lateLevels.length;

        if (lateAvg / earlyAvg > 3) {
            analysis.progressionCurve = 'steep';
        } else if (lateAvg / earlyAvg < 2) {
            analysis.progressionCurve = 'flat';
        } else {
            analysis.progressionCurve = 'balanced';
        }

        return analysis;
    }
}

/**
 * ⚔️ SIMULAZIONE 2: Scaling Nemici
 * Analizza come i nemici diventano più difficili nel tempo
 */
class EnemyScalingSimulation {
    constructor() {
        this.results = [];
        this.calculateEnemyScaling();
    }

    calculateEnemyStats(timeInSeconds, playerLevel = 1) {
        const timeFactor = timeInSeconds / CONFIG.enemies.scaling.timeFactor;
        const levelFactor = playerLevel * CONFIG.enemies.scaling.levelFactorMultiplier;
        const combinedFactor = timeFactor + levelFactor;
        
        return {
            hp: CONFIG.enemies.base.hp + Math.floor(combinedFactor) * CONFIG.enemies.scaling.hpPerFactor,
            speed: CONFIG.enemies.base.speed + combinedFactor * CONFIG.enemies.scaling.speedPerFactor,
            damage: CONFIG.enemies.base.damage + Math.floor(combinedFactor) * CONFIG.enemies.scaling.damagePerFactor,
            xp: CONFIG.enemies.base.xp + Math.floor(Math.pow(combinedFactor, CONFIG.enemies.scaling.xpPowerFactor) * CONFIG.enemies.scaling.xpPerFactor)
        };
    }

    calculateEnemyScalingRate(timeInSeconds) {
        const timeFactor = 1 / CONFIG.enemies.scaling.timeFactor;
        return {
            hpRate: timeFactor * CONFIG.enemies.scaling.hpPerFactor,
            speedRate: timeFactor * CONFIG.enemies.scaling.speedPerFactor,
            damageRate: timeFactor * CONFIG.enemies.scaling.damagePerFactor
        };
    }

    calculateEnemyScaling() {
        for (let time = 0; time <= 1800; time += 60) { // 30 minuti
            const stats = this.calculateEnemyStats(time);
            const rate = this.calculateEnemyScalingRate(time);
            const difficulty = this.calculateDifficulty(stats);
            
            this.results.push({
                time: time / 60, // Converti in minuti
                stats: stats,
                rate: rate,
                difficulty: difficulty,
                playerLevel: this.estimatePlayerLevel(time)
            });
        }
    }

    calculateDifficulty(stats) {
        // Calcola un indice di difficoltà basato su HP, velocità e danno
        const hpFactor = stats.hp / CONFIG.enemies.base.hp;
        const speedFactor = stats.speed / CONFIG.enemies.base.speed;
        const damageFactor = stats.damage / CONFIG.enemies.base.damage;
        
        return (hpFactor + speedFactor + damageFactor) / 3;
    }

    estimatePlayerLevel(time) {
        // Stima il livello del giocatore basato sul tempo
        const xpPerMinute = 8;
        const totalXP = (time / 60) * xpPerMinute;
        
        let level = 1;
        let xpNeeded = 0;
        
        while (xpNeeded < totalXP && level < 30) {
            xpNeeded += this.calculateXPForLevel(level);
            level++;
        }
        
        return Math.min(level, 30);
    }

    calculateXPForLevel(level) {
        const c = CONFIG.player.xpCurve;
        return Math.floor(c.base * Math.pow(c.growth, level - 1) + c.levelFactor * level);
    }

    getAnalysis() {
        const analysis = {
            maxDifficulty: 0,
            difficultySpike: null,
            balancedRange: { start: 0, end: 0 },
            scalingType: 'linear'
        };

        let maxDiff = 0;
        let maxDiffTime = 0;
        let difficultySpikes = [];

        this.results.forEach((result, index) => {
            if (result.difficulty > maxDiff) {
                maxDiff = result.difficulty;
                maxDiffTime = result.time;
            }

            // Trova spike di difficoltà
            if (index > 0) {
                const diffIncrease = result.difficulty - this.results[index - 1].difficulty;
                if (diffIncrease > 0.5) {
                    difficultySpikes.push({
                        time: result.time,
                        increase: diffIncrease
                    });
                }
            }
        });

        analysis.maxDifficulty = maxDiff;
        analysis.difficultySpike = difficultySpikes.length > 0 ? difficultySpikes[0] : null;

        // Determina il range bilanciato (difficoltà 1.0 - 3.0)
        const balancedResults = this.results.filter(r => r.difficulty >= 1.0 && r.difficulty <= 3.0);
        if (balancedResults.length > 0) {
            analysis.balancedRange = {
                start: balancedResults[0].time,
                end: balancedResults[balancedResults.length - 1].time
            };
        }

        // Analizza il tipo di scaling
        const earlyDifficulty = this.results[5].difficulty;
        const midDifficulty = this.results[15].difficulty;
        const lateDifficulty = this.results[25].difficulty;

        const earlyToMid = midDifficulty / earlyDifficulty;
        const midToLate = lateDifficulty / midDifficulty;

        if (Math.abs(earlyToMid - midToLate) < 0.2) {
            analysis.scalingType = 'linear';
        } else if (midToLate > earlyToMid) {
            analysis.scalingType = 'exponential';
        } else {
            analysis.scalingType = 'logarithmic';
        }

        return analysis;
    }
}

/**
 * 🎮 SIMULAZIONE 3: Performance Archetipi
 * Simula le performance di ogni archetipo in diverse condizioni
 */
class ArchetypePerformanceSimulation {
    constructor() {
        this.results = {};
        this.simulateAllArchetypes();
    }

    simulateArchetype(archetypeId, duration = 20) {
        const archetype = CONFIG.characterArchetypes[archetypeId];
        const results = [];
        
        for (let time = 0; time < duration * 60; time += 30) {
            const playerLevel = this.estimatePlayerLevel(time);
            const enemyStats = this.calculateEnemyStats(time, playerLevel);
            
            const performance = this.calculatePerformance(archetype, enemyStats, playerLevel);
            
            results.push({
                time: time / 60,
                level: playerLevel,
                performance: performance,
                survivalChance: this.calculateSurvivalChance(archetype, enemyStats),
                efficiency: this.calculateEfficiency(archetype, enemyStats, playerLevel)
            });
        }
        
        return results;
    }

    calculatePerformance(archetype, enemyStats, playerLevel) {
        // Calcola performance basata su HP, velocità, danno e DR
        const hpFactor = archetype.hp / 150; // Normalizzato
        const speedFactor = archetype.speed / 3; // Normalizzato
        const damageFactor = archetype.damage;
        const drFactor = 1 + archetype.dr; // DR aggiunge protezione
        
        const enemyThreat = (enemyStats.hp * enemyStats.speed * enemyStats.damage) / 1000;
        
        return (hpFactor * drFactor * damageFactor * speedFactor) / enemyThreat;
    }

    calculateSurvivalChance(archetype, enemyStats) {
        // Calcola probabilità di sopravvivenza
        const playerEHP = archetype.hp / (1 - archetype.dr); // Effective HP
        const enemyDPS = enemyStats.damage / enemyStats.speed;
        
        const survivalTime = playerEHP / enemyDPS;
        return Math.min(0.95, Math.max(0.05, survivalTime / 60)); // Normalizzato 0-1
    }

    calculateEfficiency(archetype, enemyStats, playerLevel) {
        // Calcola efficienza (danno per secondo / rischio)
        const dps = archetype.damage * archetype.speed;
        const risk = enemyStats.damage / (1 - archetype.dr);
        
        return dps / risk;
    }

    calculateEnemyStats(timeInSeconds, playerLevel = 1) {
        const timeFactor = timeInSeconds / CONFIG.enemies.scaling.timeFactor;
        const levelFactor = playerLevel * CONFIG.enemies.scaling.levelFactorMultiplier;
        const combinedFactor = timeFactor + levelFactor;
        
        return {
            hp: CONFIG.enemies.base.hp + Math.floor(combinedFactor) * CONFIG.enemies.scaling.hpPerFactor,
            speed: CONFIG.enemies.base.speed + combinedFactor * CONFIG.enemies.scaling.speedPerFactor,
            damage: CONFIG.enemies.base.damage + Math.floor(combinedFactor) * CONFIG.enemies.scaling.damagePerFactor
        };
    }

    estimatePlayerLevel(time) {
        const xpPerMinute = 8;
        const totalXP = (time / 60) * xpPerMinute;
        
        let level = 1;
        let xpNeeded = 0;
        
        while (xpNeeded < totalXP && level < 30) {
            xpNeeded += this.calculateXPForLevel(level);
            level++;
        }
        
        return Math.min(level, 30);
    }

    calculateXPForLevel(level) {
        const c = CONFIG.player.xpCurve;
        return Math.floor(c.base * Math.pow(c.growth, level - 1) + c.levelFactor * level);
    }

    simulateAllArchetypes() {
        const archetypes = Object.keys(CONFIG.characterArchetypes);
        
        archetypes.forEach(archetypeId => {
            this.results[archetypeId] = this.simulateArchetype(archetypeId);
        });
    }

    getArchetypeRanking() {
        const rankings = [];
        
        Object.keys(this.results).forEach(archetypeId => {
            const results = this.results[archetypeId];
            const finalPerformance = results[results.length - 1].performance;
            const avgSurvival = results.reduce((sum, r) => sum + r.survivalChance, 0) / results.length;
            const avgEfficiency = results.reduce((sum, r) => sum + r.efficiency, 0) / results.length;
            
            rankings.push({
                archetype: archetypeId,
                finalPerformance: finalPerformance,
                avgSurvival: avgSurvival,
                avgEfficiency: avgEfficiency,
                overallScore: (finalPerformance + avgSurvival + avgEfficiency) / 3
            });
        });
        
        return rankings.sort((a, b) => b.overallScore - a.overallScore);
    }

    getAnalysis() {
        const analysis = {
            bestArchetype: null,
            mostBalanced: null,
            difficultySpread: {},
            recommendations: []
        };

        const rankings = this.getArchetypeRanking();
        analysis.bestArchetype = rankings[0];

        // Trova l'archetipo più bilanciato (deviazione standard più bassa)
        let mostBalanced = null;
        let lowestVariance = Infinity;

        Object.keys(this.results).forEach(archetypeId => {
            const performances = this.results[archetypeId].map(r => r.performance);
            const mean = performances.reduce((sum, p) => sum + p, 0) / performances.length;
            const variance = performances.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / performances.length;
            
            if (variance < lowestVariance) {
                lowestVariance = variance;
                mostBalanced = archetypeId;
            }
        });

        analysis.mostBalanced = mostBalanced;

        // Analizza la diffusione della difficoltà
        Object.keys(this.results).forEach(archetypeId => {
            const results = this.results[archetypeId];
            const earlyPerformance = results[5].performance;
            const midPerformance = results[15].performance;
            const latePerformance = results[results.length - 1].performance;
            
            analysis.difficultySpread[archetypeId] = {
                early: earlyPerformance,
                mid: midPerformance,
                late: latePerformance,
                decline: (latePerformance - earlyPerformance) / earlyPerformance
            };
        });

        // Genera raccomandazioni
        analysis.recommendations = this.generateRecommendations(rankings, analysis);

        return analysis;
    }

    generateRecommendations(rankings, analysis) {
        const recommendations = [];

        // Raccomandazione per principianti
        const beginnerArchetype = rankings.find(r => r.archetype === 'standard');
        if (beginnerArchetype) {
            recommendations.push({
                type: 'beginner',
                archetype: 'standard',
                reason: 'Archetipo più bilanciato e facile da usare',
                score: beginnerArchetype.overallScore
            });
        }

        // Raccomandazione per esperti
        const expertArchetype = rankings[0];
        if (expertArchetype && expertArchetype.archetype !== 'standard') {
            recommendations.push({
                type: 'expert',
                archetype: expertArchetype.archetype,
                reason: 'Massima performance ma richiede skill',
                score: expertArchetype.overallScore
            });
        }

        // Raccomandazione per bilanciamento
        if (analysis.mostBalanced && analysis.mostBalanced !== 'standard') {
            recommendations.push({
                type: 'balanced',
                archetype: analysis.mostBalanced,
                reason: 'Performance costante nel tempo',
                score: rankings.find(r => r.archetype === analysis.mostBalanced)?.overallScore || 0
            });
        }

        return recommendations;
    }
}

/**
 * 📊 SIMULAZIONE 4: Retention e Session Time
 * Analizza la correlazione tra durata partite e retention
 */
class RetentionSimulation {
    constructor() {
        this.results = [];
        this.simulateRetention();
    }

    simulateRetention() {
        for (let sessionTime = 5; sessionTime <= 60; sessionTime += 5) {
            const retention = this.calculateRetentionRate(sessionTime);
            const satisfaction = this.calculateSatisfactionScore(sessionTime);
            const returnRate = this.calculateReturnRate(sessionTime);
            
            this.results.push({
                sessionTime: sessionTime,
                retention: retention,
                satisfaction: satisfaction,
                returnRate: returnRate,
                optimal: this.isOptimalSessionTime(sessionTime)
            });
        }
    }

    calculateRetentionRate(sessionTime) {
        // Modello di retention basato su session time
        const baseRetention = 0.6;
        const timeFactor = Math.min(sessionTime / 20, 1.0);
        const satisfactionBonus = this.calculateSatisfactionScore(sessionTime) * 0.2;
        
        return Math.min(0.95, baseRetention + (0.3 * timeFactor) + satisfactionBonus);
    }

    calculateSatisfactionScore(sessionTime) {
        // Modello di soddisfazione basato su session time
        if (sessionTime < 5) return 0.3; // Troppo breve
        if (sessionTime < 10) return 0.6; // Breve ma accettabile
        if (sessionTime < 20) return 0.85; // Ottimale
        if (sessionTime < 30) return 0.9; // Molto buono
        if (sessionTime < 45) return 0.8; // Lungo ma gestibile
        return 0.6; // Troppo lungo
    }

    calculateReturnRate(sessionTime) {
        // Probabilità che il giocatore torni
        const retention = this.calculateRetentionRate(sessionTime);
        const satisfaction = this.calculateSatisfactionScore(sessionTime);
        
        return retention * satisfaction * 0.8; // Fattore di conversione
    }

    isOptimalSessionTime(sessionTime) {
        // Determina se il session time è ottimale (15-25 min)
        return sessionTime >= 15 && sessionTime <= 25;
    }

    getAnalysis() {
        const analysis = {
            optimalSessionTime: { min: 0, max: 0 },
            maxRetention: 0,
            maxSatisfaction: 0,
            sweetSpot: 0,
            recommendations: []
        };

        let maxRetention = 0;
        let maxSatisfaction = 0;
        let optimalRange = { min: 0, max: 0 };

        this.results.forEach(result => {
            if (result.retention > maxRetention) {
                maxRetention = result.retention;
            }
            
            if (result.satisfaction > maxSatisfaction) {
                maxSatisfaction = result.satisfaction;
            }
            
            if (result.optimal) {
                if (optimalRange.min === 0) optimalRange.min = result.sessionTime;
                optimalRange.max = result.sessionTime;
            }
        });

        analysis.maxRetention = maxRetention;
        analysis.maxSatisfaction = maxSatisfaction;
        analysis.optimalSessionTime = optimalRange;

        // Trova il sweet spot (miglior compromesso)
        const sweetSpot = this.results.reduce((best, current) => {
            const currentScore = current.retention * current.satisfaction;
            const bestScore = best.retention * best.satisfaction;
            return currentScore > bestScore ? current : best;
        });

        analysis.sweetSpot = sweetSpot.sessionTime;

        // Genera raccomandazioni
        analysis.recommendations = this.generateRetentionRecommendations();

        return analysis;
    }

    generateRetentionRecommendations() {
        const recommendations = [];

        const optimalResults = this.results.filter(r => r.optimal);
        const avgOptimalRetention = optimalResults.reduce((sum, r) => sum + r.retention, 0) / optimalResults.length;

        recommendations.push({
            type: 'session_time',
            target: '15-25 minuti',
            reason: `Retention media del ${(avgOptimalRetention * 100).toFixed(1)}%`,
            impact: 'Alto'
        });

        const shortSessionResults = this.results.filter(r => r.sessionTime < 10);
        const longSessionResults = this.results.filter(r => r.sessionTime > 30);

        if (shortSessionResults.length > 0) {
            const avgShortRetention = shortSessionResults.reduce((sum, r) => sum + r.retention, 0) / shortSessionResults.length;
            recommendations.push({
                type: 'avoid',
                target: 'Sessioni < 10 minuti',
                reason: `Retention bassa: ${(avgShortRetention * 100).toFixed(1)}%`,
                impact: 'Critico'
            });
        }

        if (longSessionResults.length > 0) {
            const avgLongRetention = longSessionResults.reduce((sum, r) => sum + r.retention, 0) / longSessionResults.length;
            recommendations.push({
                type: 'avoid',
                target: 'Sessioni > 30 minuti',
                reason: `Retention in calo: ${(avgLongRetention * 100).toFixed(1)}%`,
                impact: 'Medio'
            });
        }

        return recommendations;
    }
}

/**
 * 🔗 ANALISI CORRELAZIONI
 * Calcola correlazioni tra diverse metriche del gioco
 */
class CorrelationAnalysis {
    constructor() {
        this.correlations = {};
        this.calculateCorrelations();
    }

    calculateCorrelations() {
        // Simula dati per diverse metriche
        const sessionTimes = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
        const retentionRates = [0.45, 0.60, 0.75, 0.85, 0.90, 0.88, 0.85, 0.82, 0.78, 0.75];
        const playerLevels = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
        const enemyScaling = [1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6, 2.8];
        const satisfactionScores = [0.4, 0.6, 0.8, 0.9, 0.95, 0.92, 0.88, 0.85, 0.80, 0.75];

        this.correlations = {
            'session_time_retention': this.calculatePearsonCorrelation(sessionTimes, retentionRates),
            'session_time_level': this.calculatePearsonCorrelation(sessionTimes, playerLevels),
            'session_time_scaling': this.calculatePearsonCorrelation(sessionTimes, enemyScaling),
            'session_time_satisfaction': this.calculatePearsonCorrelation(sessionTimes, satisfactionScores),
            'retention_level': this.calculatePearsonCorrelation(retentionRates, playerLevels),
            'retention_scaling': this.calculatePearsonCorrelation(retentionRates, enemyScaling),
            'retention_satisfaction': this.calculatePearsonCorrelation(retentionRates, satisfactionScores),
            'level_scaling': this.calculatePearsonCorrelation(playerLevels, enemyScaling),
            'level_satisfaction': this.calculatePearsonCorrelation(playerLevels, satisfactionScores),
            'scaling_satisfaction': this.calculatePearsonCorrelation(enemyScaling, satisfactionScores)
        };
    }

    calculatePearsonCorrelation(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        return denominator === 0 ? 0 : numerator / denominator;
    }

    getStrongCorrelations(threshold = 0.7) {
        const strong = [];
        
        Object.keys(this.correlations).forEach(key => {
            const correlation = this.correlations[key];
            if (Math.abs(correlation) >= threshold) {
                strong.push({
                    variables: key,
                    correlation: correlation,
                    strength: correlation > 0 ? 'positive' : 'negative',
                    magnitude: Math.abs(correlation)
                });
            }
        });

        return strong.sort((a, b) => b.magnitude - a.magnitude);
    }

    getAnalysis() {
        const analysis = {
            strongestCorrelation: null,
            weakestCorrelation: null,
            positiveCorrelations: [],
            negativeCorrelations: [],
            insights: []
        };

        let strongest = { correlation: 0, variables: '' };
        let weakest = { correlation: 1, variables: '' };

        Object.keys(this.correlations).forEach(key => {
            const correlation = this.correlations[key];
            
            if (Math.abs(correlation) > Math.abs(strongest.correlation)) {
                strongest = { correlation: correlation, variables: key };
            }
            
            if (Math.abs(correlation) < Math.abs(weakest.correlation)) {
                weakest = { correlation: correlation, variables: key };
            }

            if (correlation > 0) {
                analysis.positiveCorrelations.push({ variables: key, correlation: correlation });
            } else {
                analysis.negativeCorrelations.push({ variables: key, correlation: correlation });
            }
        });

        analysis.strongestCorrelation = strongest;
        analysis.weakestCorrelation = weakest;

        // Genera insights
        analysis.insights = this.generateCorrelationInsights();

        return analysis;
    }

    generateCorrelationInsights() {
        const insights = [];

        // Analizza correlazioni forti
        const strongCorrelations = this.getStrongCorrelations(0.7);
        strongCorrelations.forEach(corr => {
            insights.push({
                type: 'strong_correlation',
                variables: corr.variables,
                correlation: corr.correlation,
                insight: this.generateInsightForCorrelation(corr.variables, corr.correlation)
            });
        });

        // Analizza correlazioni deboli
        const weakCorrelations = Object.keys(this.correlations).filter(key => 
            Math.abs(this.correlations[key]) < 0.3
        );

        weakCorrelations.forEach(variables => {
            insights.push({
                type: 'weak_correlation',
                variables: variables,
                correlation: this.correlations[variables],
                insight: `Le variabili ${variables} sono poco correlate, indicando che sono indipendenti`
            });
        });

        return insights;
    }

    generateInsightForCorrelation(variables, correlation) {
        const variableMap = {
            'session_time_retention': 'Session Time e Retention Rate',
            'session_time_level': 'Session Time e Player Level',
            'session_time_scaling': 'Session Time e Enemy Scaling',
            'session_time_satisfaction': 'Session Time e Satisfaction',
            'retention_level': 'Retention Rate e Player Level',
            'retention_scaling': 'Retention Rate e Enemy Scaling',
            'retention_satisfaction': 'Retention Rate e Satisfaction',
            'level_scaling': 'Player Level e Enemy Scaling',
            'level_satisfaction': 'Player Level e Satisfaction',
            'scaling_satisfaction': 'Enemy Scaling e Satisfaction'
        };

        const variableNames = variableMap[variables] || variables;
        
        if (correlation > 0.8) {
            return `${variableNames} sono fortemente correlate positivamente (${correlation.toFixed(2)}). Questo indica una relazione diretta e importante.`;
        } else if (correlation > 0.5) {
            return `${variableNames} sono moderatamente correlate positivamente (${correlation.toFixed(2)}). Esiste una relazione diretta.`;
        } else if (correlation < -0.5) {
            return `${variableNames} sono correlate negativamente (${correlation.toFixed(2)}). Quando una aumenta, l'altra diminuisce.`;
        } else {
            return `${variableNames} hanno una correlazione debole (${correlation.toFixed(2)}). Sono relativamente indipendenti.`;
        }
    }
}

/**
 * 📊 MAIN ANALYSIS
 * Esegue tutte le simulazioni e genera il report completo
 */
class BallSurvivalAnalysis {
    constructor() {
        this.xpSimulation = new XPSimulation();
        this.enemyScaling = new EnemyScalingSimulation();
        this.archetypePerformance = new ArchetypePerformanceSimulation();
        this.retentionSimulation = new RetentionSimulation();
        this.correlationAnalysis = new CorrelationAnalysis();
        
        this.generateCompleteReport();
    }

    generateCompleteReport() {
        this.report = {
            timestamp: new Date().toISOString(),
            version: '5.2',
            year: '2025',
            
            xpAnalysis: this.xpSimulation.getAnalysis(),
            enemyScalingAnalysis: this.enemyScaling.getAnalysis(),
            archetypeAnalysis: this.archetypePerformance.getAnalysis(),
            retentionAnalysis: this.retentionSimulation.getAnalysis(),
            correlationAnalysis: this.correlationAnalysis.getAnalysis(),
            
            summary: this.generateSummary(),
            recommendations: this.generateRecommendations(),
            metrics: this.calculateKeyMetrics()
        };
    }

    generateSummary() {
        const summary = {
            overallScore: 0,
            strengths: [],
            weaknesses: [],
            improvements: []
        };

        // Calcola punteggio complessivo
        const xpScore = this.xpSimulation.getAnalysis().progressionCurve === 'balanced' ? 0.9 : 0.6;
        const scalingScore = this.enemyScaling.getAnalysis().scalingType === 'linear' ? 0.95 : 0.7;
        const retentionScore = this.retentionSimulation.getAnalysis().maxRetention;
        const archetypeScore = this.archetypePerformance.getAnalysis().bestArchetype?.overallScore || 0.7;

        summary.overallScore = (xpScore + scalingScore + retentionScore + archetypeScore) / 4;

        // Identifica punti di forza
        if (xpScore > 0.8) summary.strengths.push('Progressione XP bilanciata');
        if (scalingScore > 0.8) summary.strengths.push('Scaling nemici graduale');
        if (retentionScore > 0.8) summary.strengths.push('Alta retention rate');
        if (archetypeScore > 0.8) summary.strengths.push('Archetipi ben bilanciati');

        // Identifica debolezze
        if (xpScore < 0.7) summary.weaknesses.push('Progressione XP troppo ripida');
        if (scalingScore < 0.7) summary.weaknesses.push('Scaling nemici troppo aggressivo');
        if (retentionScore < 0.7) summary.weaknesses.push('Retention rate bassa');
        if (archetypeScore < 0.7) summary.weaknesses.push('Squilibrio archetipi');

        // Suggerisce miglioramenti
        if (summary.strengths.length === 0) {
            summary.improvements.push('Rivedere completamente il bilanciamento');
        } else if (summary.weaknesses.length > 0) {
            summary.improvements.push('Focalizzarsi sui punti deboli identificati');
        } else {
            summary.improvements.push('Mantenere il bilanciamento attuale');
        }

        return summary;
    }

    generateRecommendations() {
        const recommendations = [];

        // Raccomandazioni basate su XP
        const xpAnalysis = this.xpSimulation.getAnalysis();
        if (xpAnalysis.progressionCurve === 'steep') {
            recommendations.push({
                category: 'XP Curve',
                priority: 'High',
                action: 'Ridurre la crescita XP per livelli alti',
                impact: 'Migliorerà la progressione e retention'
            });
        }

        // Raccomandazioni basate su scaling
        const scalingAnalysis = this.enemyScaling.getAnalysis();
        if (scalingAnalysis.scalingType === 'exponential') {
            recommendations.push({
                category: 'Enemy Scaling',
                priority: 'Critical',
                action: 'Implementare scaling lineare',
                impact: 'Eviterà partite troppo brevi'
            });
        }

        // Raccomandazioni basate su retention
        const retentionAnalysis = this.retentionSimulation.getAnalysis();
        if (retentionAnalysis.maxRetention < 0.8) {
            recommendations.push({
                category: 'Retention',
                priority: 'High',
                action: 'Ottimizzare session time target',
                impact: 'Aumenterà significativamente la retention'
            });
        }

        // Raccomandazioni basate su archetipi
        const archetypeAnalysis = this.archetypePerformance.getAnalysis();
        if (archetypeAnalysis.recommendations.length === 0) {
            recommendations.push({
                category: 'Archetypes',
                priority: 'Medium',
                action: 'Rivedere bilanciamento archetipi',
                impact: 'Migliorerà la varietà di gameplay'
            });
        }

        return recommendations;
    }

    calculateKeyMetrics() {
        return {
            averageSessionTime: 20, // minuti
            retentionRate: this.retentionSimulation.getAnalysis().maxRetention,
            playerProgression: this.xpSimulation.results.length,
            enemyScalingEfficiency: this.enemyScaling.getAnalysis().scalingType === 'linear' ? 0.95 : 0.7,
            archetypeBalance: this.archetypePerformance.getAnalysis().bestArchetype?.overallScore || 0.7,
            overallSatisfaction: this.correlationAnalysis.getAnalysis().maxSatisfaction || 0.85
        };
    }

    getReport() {
        return this.report;
    }

    exportToJSON() {
        return JSON.stringify(this.report, null, 2);
    }
}

// Esporta le classi per uso esterno
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        XPSimulation,
        EnemyScalingSimulation,
        ArchetypePerformanceSimulation,
        RetentionSimulation,
        CorrelationAnalysis,
        BallSurvivalAnalysis
    };
}

// Esegui analisi se eseguito direttamente
if (typeof window !== 'undefined') {
    console.log('🚀 Avvio Analisi Statistica Ball Survival...');
    const analysis = new BallSurvivalAnalysis();
    console.log('📊 Report Completo:', analysis.getReport());
    console.log('💾 JSON Export:', analysis.exportToJSON());
} 