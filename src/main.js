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
    // 1. Setup login handlers (attaches global functions for inline onclick)
    setupLoginHandlers(playerAuth);

    // 2. Create the game instance
    const game = new BallSurvivalGame('gameCanvas');

    // 3. Wire auth into game
    game.playerAuth = playerAuth;

    // 4. Expose game and analyticsManager globally (needed for LoginManager cloud sync)
    window.game = game;
    window.analyticsManager = game.analyticsManager;

    // 5. Wire up token setup screen buttons (HTML references these but they were never implemented)
    window.configureStartupToken = () => {
        const tokenInput = document.getElementById('startupToken');
        if (tokenInput && tokenInput.value.trim()) {
            playerAuth.configureCloudSync();
        }
    };
    window.skipTokenSetup = () => {
        const tokenScreen = document.getElementById('tokenSetupScreen');
        if (tokenScreen) tokenScreen.style.display = 'none';
    };

    console.log('Ball Survival initialized via ES modules.');
}

// Bootstrap
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
