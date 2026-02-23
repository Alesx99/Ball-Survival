/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BallSurvivalGame } from '../src/core/Game.js';
import { poolManager } from '../src/utils/PoolManager.js';
import { StorageManager } from '../src/core/StorageManager.js';

// Mock DOM elements required by Game.js
beforeEach(() => {
    document.body.innerHTML = `
        <canvas id="gameCanvas" width="800" height="600"></canvas>
        <div id="gameContainer"></div>
        <div id="startScreen"><h2></h2></div>
        <div id="pauseMenu"></div>
        <div id="gameOver"><h2></h2></div>
        <div id="upgradeMenu"></div>
        <div id="permanentUpgradeShop"></div>
        <div id="secretShopPopup"></div>
        <div id="inventoryMenu"></div>
        <div id="characterSelectionPopup"></div>
        <div id="achievementsPopup"></div>
        <div id="glossaryPopup"></div>
        <div id="settingsPopup"></div>
        <div id="dailyChallengePopup"></div>
        <button id="modeStandardBtn"></button>
        <button id="modeEndlessBtn"></button>
        <button id="modeDailyBtn"></button>
        <button id="modeBossRushBtn"></button>
        <button id="modeTutorialBtn"></button>
        <button id="startDailyBtn"></button>
        <button id="closeDailyChallengeBtn"></button>
        <button id="startGameBtn"></button>
        <button id="restartGameBtn"></button>
        <button id="restartFromPauseBtn"></button>
        <button id="pauseButton"></button>
        <button id="loadGameBtn"></button>
        <button id="copyCodeBtn"></button>
        <button id="generateDebugSave"></button>
        <button id="copyDebugCodeBtn"></button>
        <button id="returnToMenuBtn"></button>
        <button id="returnToMenuPauseBtn"></button>
        <button id="inventoryBtn"></button>
        <button id="closeInventoryBtn"></button>
        <button id="openCharacterPopupBtn"></button>
        <button id="closeCharacterPopupBtn"></button>
        <button id="achievementsBtn"></button>
        <button id="bestiaryBtn"></button>
        <button id="runHistoryBtn"></button>
        <button id="closeAchievementsBtn"></button>
        <button id="closeBestiaryBtn"></button>
        <button id="closeRunHistoryBtn"></button>
        <button id="craftingPreviewBtn"></button>
        <button id="closeCraftingBtn"></button>
        <button id="glossaryBtn"></button>
        <button id="closeGlossaryBtn"></button>
        <button id="settingsBtn"></button>
        <button id="closeSettingsBtn"></button>
        <button id="cheatsBtn"></button>
        <button id="skinsBtn"></button>
        <input id="saveCodeOutput" />
        <input id="loadCodeInput" />
        <input id="debugSaveOutput" />
        <div id="debugSaveContainer"></div>
        <div id="characterSelectionContainer"></div>
        <div id="stageSelectionContainer"></div>
        <div id="characterPreviewContainer"></div>
        <div id="archetypeAbilitiesContainer"></div>
        <div id="characterDifficultyContainer"></div>
        <div id="dailyDate"></div>
        <div id="dailyArchetype"></div>
        <div id="dailyWeapon"></div>
        <div id="dailyModifierName"></div>
        <div id="dailyModifierDesc"></div>
        <div id="dailyRewardGems"></div>
        <div id="hpFill"></div>
        <div id="xpFill"></div>
        <div id="bossHpFill"></div>
        <canvas id="bossRushProgressCanvas"></canvas>
        <canvas id="minimapCanvas"></canvas>
        <div id="levelDisplay"></div>
        <div id="timerDisplay"></div>
        <div id="killCount"></div>
        <div id="gemCount"></div>
        <div id="fpsCounter"></div>
        <div id="effectsVolumeSlider"></div>
        <div id="musicVolumeSlider"></div>
        <div id="muteCheckbox"></div>
        <div id="effectsVolumeValue"></div>
        <div id="musicVolumeValue"></div>
        <div id="reduceMotionCheckbox"></div>
        <div id="highContrastCheckbox"></div>
        <div id="testSoundBtn"></div>
    `;

    // Mock localStorage
    const localStorageMock = (function () {
        let store = {};
        return {
            getItem(key) { return store[key] || null; },
            setItem(key, value) { store[key] = value.toString(); },
            clear() { store = {}; },
            removeItem(key) { delete store[key]; }
        };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        // Stopper per loop
    });

    // reset storage manager
    StorageManager.clearAll();
});

describe('Game Loop & Systems Integration', () => {
    it('initializes game correctly', () => {
        const game = new BallSurvivalGame('gameCanvas');
        expect(game).toBeDefined();
        expect(game.state).toBe('startScreen');
        expect(game.entities).toBeDefined();
    });

    it('runs update loop effectively using deltaTime', () => {
        const game = new BallSurvivalGame('gameCanvas');
        game.state = 'running';

        let previousTime = game.totalElapsedTime;
        game.lastFrameTime = performance.now() - 16.66; // simulated 1 frame passed
        game.gameLoop(performance.now());

        expect(game.totalElapsedTime).toBeGreaterThan(previousTime);
    });

    it('utilizza addPooledProjectile all interno dei sistemi', () => {
        const game = new BallSurvivalGame('gameCanvas');
        game.state = 'running';
        poolManager.clearAll();

        // Forza cast spell che lancia prop
        game.castFireball(Date.now(), 0);

        // Verifica che poolManager sia stato usato indirettamente per i proiettili
        const poolSize = poolManager.getPoolSize('Projectile');
        // I proiettili attivi in game.entities.projectiles. length > 0
        expect(game.entities.projectiles.length).toBeGreaterThan(0);

        // Simula frame per rimuoverli
        game.entities.projectiles.forEach(p => p.toRemove = true);
        game.update(1 / 60); // Loop removes them and recycles

        // Verifica che siano tornati nel pool
        const inPoolAfter = poolManager.getPoolSize('Projectile');
        expect(inPoolAfter).toBeGreaterThan(0);
        expect(game.entities.projectiles.length).toBe(0);
    });
});
