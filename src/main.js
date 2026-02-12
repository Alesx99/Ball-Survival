/**
 * Ball Survival - Main Entry Point
 * 
 * This module bootstraps the entire game:
 * 1. Imports all modules (config, utils, entities, systems, auth, game)
 * 2. Sets up login/auth handlers for inline HTML onclick attributes
 * 3. Instantiates the game and wires dependencies
 */

import { BallSurvivalGame } from './core/Game.js';
import { playerAuth, setupLoginHandlers } from './auth/LoginManager.js';

/**
 * Initialize the application when the DOM is ready.
 */
function initApp() {
    // 1. Create the game instance
    const game = new BallSurvivalGame('gameCanvas');

    // 2. Wire auth into game and setup login (pass analyticsManager for cloud sync)
    game.playerAuth = playerAuth;
    setupLoginHandlers(playerAuth, { analyticsManager: game.analyticsManager });

    // 3. Wire token setup screen buttons
    const configureBtn = document.getElementById('configureStartupTokenBtn');
    const skipBtn = document.getElementById('skipTokenSetupBtn');
    if (configureBtn) configureBtn.addEventListener('click', () => {
        const tokenInput = document.getElementById('startupToken');
        if (tokenInput?.value?.trim()) playerAuth.configureCloudSync(tokenInput.value.trim());
    });
    if (skipBtn) skipBtn.addEventListener('click', () => {
        const tokenScreen = document.getElementById('tokenSetupScreen');
        if (tokenScreen) tokenScreen.style.display = 'none';
    });

    console.log('Ball Survival initialized via ES modules.');
}

// Bootstrap
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
