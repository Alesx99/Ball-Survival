export const AchievementsUI = {
    showAchievements() {
        this.populateAchievements();
        this.showPopup('achievements');
    },
    populateAchievements() {
        if (!this.achievementSystem || !this.dom.containers.achievementsList) return;

        const container = this.dom.containers.achievementsList;
        container.innerHTML = '';

        const allAchievements = Object.values(this.achievementSystem.achievements);
        const progress = this.achievementSystem.getProgress();
        const totalTiers = allAchievements.reduce((sum, a) => sum + a.thresholds.length, 0);
        const completedTiers = allAchievements.reduce((sum, a) => sum + (a.tier || 0), 0);

        // Header con barra di progresso globale
        const header = document.createElement('div');
        header.style.cssText = 'margin-bottom:16px;text-align:center;';
        const globalPercent = totalTiers > 0 ? Math.round((completedTiers / totalTiers) * 100) : 0;
        header.innerHTML = `
            <div style="font-size:14px;color:var(--text-muted-color);margin-bottom:8px;">
                🏆 ${progress.unlocked}/${progress.total} sbloccati · ${completedTiers}/${totalTiers} tier completati
            </div>
            <div style="background:rgba(255,255,255,0.1);border-radius:8px;height:8px;overflow:hidden;">
                <div style="height:100%;width:${globalPercent}%;background:linear-gradient(90deg,#cd7f32,#c0c0c0,#ffd700);border-radius:8px;transition:width 0.3s;"></div>
            </div>
        `;
        container.appendChild(header);

        // Lista achievements
        allAchievements.forEach(achievement => {
            const isSecret = achievement.secret && !achievement.unlocked;
            const div = document.createElement('div');
            div.style.cssText = `display:flex;align-items:center;gap:12px;padding:10px 12px;margin-bottom:6px;border-radius:8px;background:${achievement.unlocked ? 'rgba(76,175,80,0.12)' : 'rgba(255,255,255,0.04)'};border:1px solid ${achievement.unlocked ? 'rgba(76,175,80,0.3)' : 'rgba(255,255,255,0.08)'};${isSecret ? 'opacity:0.5;' : ''}`;

            // Calcola progresso verso il prossimo tier
            const currentTier = achievement.tier || 0;
            const bestVal = achievement.bestValue ?? achievement.currentValue ?? 0;
            const nextThreshold = achievement.thresholds[currentTier] ?? achievement.thresholds[achievement.thresholds.length - 1];
            const prevThreshold = currentTier > 0 ? achievement.thresholds[currentTier - 1] : 0;
            const range = nextThreshold - prevThreshold;
            const progressInRange = bestVal - prevThreshold;
            const tierPercent = range > 0 ? Math.min(100, Math.max(0, (progressInRange / range) * 100)) : (achievement.unlocked ? 100 : 0);

            // Tier badges
            const tierBadges = ['🥉', '🥈', '🥇'];
            let badgesHtml = '';
            for (let t = 0; t < achievement.thresholds.length; t++) {
                if (currentTier > t) {
                    badgesHtml += `<span style="font-size:14px;">${tierBadges[t] || '⭐'}</span>`;
                } else {
                    badgesHtml += `<span style="font-size:14px;opacity:0.2;">${tierBadges[t] || '⭐'}</span>`;
                }
            }

            // Gems per il prossimo tier
            const gemRewards = achievement.gemReward || [5, 15, 50];
            const nextGem = gemRewards[currentTier] || gemRewards[gemRewards.length - 1] || 5;

            // Color della barra
            const barColor = currentTier >= 2 ? '#ffd700' : currentTier >= 1 ? '#c0c0c0' : '#cd7f32';

            const name = isSecret ? '???' : achievement.name;
            const desc = isSecret ? 'Achievement segreto' : achievement.description;
            const icon = isSecret ? '❓' : achievement.icon;

            div.innerHTML = `
                <div style="font-size:28px;min-width:36px;text-align:center;">${icon}</div>
                <div style="flex:1;min-width:0;">
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
                        <span style="font-weight:600;font-size:13px;color:${achievement.unlocked ? '#4caf50' : '#e0e0e0'};">${name}</span>
                        <span style="font-size:12px;">${badgesHtml}</span>
                    </div>
                    <div style="font-size:11px;color:var(--text-muted-color);margin-bottom:4px;">${desc}</div>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <div style="flex:1;background:rgba(255,255,255,0.1);border-radius:4px;height:6px;overflow:hidden;">
                            <div style="height:100%;width:${tierPercent}%;background:${barColor};border-radius:4px;transition:width 0.3s;"></div>
                        </div>
                        <span style="font-size:10px;color:var(--text-muted-color);white-space:nowrap;">${isSecret ? '?' : Math.floor(bestVal)}/${isSecret ? '?' : nextThreshold}</span>
                    </div>
                </div>
                <div style="text-align:center;min-width:40px;">
                    <div style="font-size:10px;color:#ffd700;">${!isSecret ? '+${nextGem}💎' : ''}</div>
                    <div style="font-size:18px;">${achievement.unlocked ? '✅' : '🔒'}</div>
                </div>
            `;

            container.appendChild(div);
        });
    }
};
