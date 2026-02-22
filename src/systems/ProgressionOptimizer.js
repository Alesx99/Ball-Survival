export class ProgressionOptimizer {
    checkMilestone(playerLevel) {
        // Metodo per tracciare i milestone della progressione (attualmente placeholder)
        if (playerLevel % 5 === 0) {
            // Placeholder per logica futura legata ai milestone
        }
    }

    analyzeProgression(playerLevel, gameTime) {
        const issues = [];
        if (playerLevel < 5 && gameTime > 120) {
            issues.push({ type: 'slow_leveling', message: 'Progressione XP lenta nei primi minuti' });
        }
        if (playerLevel > 20 && gameTime < 300) {
            issues.push({ type: 'fast_leveling', message: 'Progressione XP troppo rapida' });
        }
        return { playerLevel, gameTime, issues };
    }

    getBalanceRecommendations(playerLevel, gameTime) {
        const recommendations = [];
        if (playerLevel < 3 && gameTime > 60) {
            recommendations.push('Aumentare XP early game per ridurre tempo al primo livello');
        }
        if (gameTime > 600 && playerLevel < 15) {
            recommendations.push('Ridurre curva XP per partite lunghe');
        }
        return recommendations;
    }
}
