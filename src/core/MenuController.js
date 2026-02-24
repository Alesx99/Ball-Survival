/**
 * MenuController
 * Handles UI DOM bindings and menu interactions that used to be in Game.js
 */

export class MenuController {
    constructor(game) {
        this.game = game;
    }

    init() {
        let resizeT = null;
        window.addEventListener('resize', () => {
            if (resizeT) clearTimeout(resizeT);
            resizeT = setTimeout(() => this.game.resizeCanvas(), 150);
        });

        if (this.game.dom.buttons.start) {
            this.game.dom.buttons.start.addEventListener('pointerdown', () => this.game.audio?.unlock(), { capture: true });
            this.game.dom.buttons.start.onclick = () => this.game.startGame(this.game.selectedMode);
        }

        // Mode Selection Handlers
        const updateModeUI = (mode) => {
            this.game.selectedMode = mode;
            ['modeStandard', 'modeEndless', 'modeDaily', 'modeBossRush', 'modeTutorial'].forEach(key => {
                if (this.game.dom.buttons[key]) this.game.dom.buttons[key].classList.remove('active');
            });

            const desc = document.getElementById('modeDescription');
            if (mode === 'standard') {
                this.game.dom.buttons.modeStandard?.classList.add('active');
                if (desc) desc.innerText = "Sopravvivi 30 minuti.";
            } else if (mode === 'endless') {
                this.game.dom.buttons.modeEndless?.classList.add('active');
                if (desc) desc.innerText = "Sopravvivi il più a lungo possibile. Difficoltà infinita.";
            } else if (mode === 'daily') {
                this.game.dom.buttons.modeDaily?.classList.add('active');
                if (desc) desc.innerText = "Sfida giornaliera con seed e build fissa.";
                this.game.showDailyChallengePopup();
            } else if (mode === 'bossRush') {
                this.game.dom.buttons.modeBossRush?.classList.add('active');
                if (desc) desc.innerText = "Combatti contro ondate di boss senza sosta!";
            } else if (mode === 'tutorial') {
                this.game.dom.buttons.modeTutorial?.classList.add('active');
                if (desc) desc.innerText = "Impara come giocare a Ball Survival.";
            }
        };

        if (this.game.dom.buttons.modeStandard) this.game.dom.buttons.modeStandard.onclick = () => updateModeUI('standard');
        if (this.game.dom.buttons.modeEndless) this.game.dom.buttons.modeEndless.onclick = () => updateModeUI('endless');
        if (this.game.dom.buttons.modeDaily) this.game.dom.buttons.modeDaily.onclick = () => updateModeUI('daily');
        if (this.game.dom.buttons.modeBossRush) this.game.dom.buttons.modeBossRush.onclick = () => updateModeUI('bossRush');
        if (this.game.dom.buttons.modeTutorial) this.game.dom.buttons.modeTutorial.onclick = () => updateModeUI('tutorial');

        // Daily Challenge Popup Handlers
        if (this.game.dom.buttons.startDaily) {
            this.game.dom.buttons.startDaily.onclick = () => {
                this.game.hideAllPopups();
                this.game.startGame('daily');
            };
        }
        if (this.game.dom.buttons.closeDaily) {
            this.game.dom.buttons.closeDaily.onclick = () => {
                this.game.dom.popups.dailyChallenge.style.display = 'none';
                updateModeUI('standard');
            };
        }
        if (this.game.dom.buttons.restart) {
            this.game.dom.buttons.restart.addEventListener('pointerdown', () => this.game.audio?.unlock(), { capture: true });
            this.game.dom.buttons.restart.onclick = () => this.game.startGame();
        }
        if (this.game.dom.buttons.restartFromPause) {
            this.game.dom.buttons.restartFromPause.addEventListener('pointerdown', () => this.game.audio?.unlock(), { capture: true });
            this.game.dom.buttons.restartFromPause.onclick = () => this.game.startGame();
        }
        if (this.game.dom.buttons.pause) this.game.dom.buttons.pause.onclick = () => this.game.togglePause();
        if (this.game.dom.buttons.copy) this.game.dom.buttons.copy.onclick = () => this.game.copySaveCode();
        if (this.game.dom.buttons.load) this.game.dom.buttons.load.onclick = () => this.game.loadFromSaveCode();
        if (this.game.dom.buttons.generateDebugSave) this.game.dom.buttons.generateDebugSave.onclick = () => this.game.generateAndShowDebugCode();
        if (this.game.dom.buttons.copyDebugCodeBtn) this.game.dom.buttons.copyDebugCodeBtn.onclick = () => this.game.copyDebugCode();
        if (this.game.dom.buttons.returnToMenu) this.game.dom.buttons.returnToMenu.onclick = () => this.game.returnToStartScreen();
        if (this.game.dom.buttons.returnToMenuPause) this.game.dom.buttons.returnToMenuPause.onclick = () => this.game.returnToStartScreen();

        if (this.game.dom.buttons.settings) this.game.dom.buttons.settings.onclick = () => this.game.showSettingsPopup();

        // Sprint 5: Cheat code + Skin buttons
        if (this.game.dom.buttons.cheats) this.game.dom.buttons.cheats.onclick = () => this.game.cheatCodeSystem?.showCheatPopup();
        if (this.game.dom.buttons.skins) this.game.dom.buttons.skins.onclick = () => this.game.skinSystem?.showSkinPopup();

        // Sprint 8: Bestiary/History
        if (this.game.dom.buttons.bestiary) this.game.dom.buttons.bestiary.onclick = () => this.game.uiSystem?.showBestiary();
        if (this.game.dom.buttons.closeBestiary) this.game.dom.buttons.closeBestiary.onclick = () => this.game.uiSystem?.hideBestiary();
        if (this.game.dom.buttons.runHistory) this.game.dom.buttons.runHistory.onclick = () => this.game.uiSystem?.showRunHistory();
        if (this.game.dom.buttons.closeRunHistory) this.game.dom.buttons.closeRunHistory.onclick = () => this.game.uiSystem?.hideRunHistory();
        // Crafting disattivato: le core/armi ora si trovano dai Forzieri

        // Logo tap easter egg
        const logo = document.querySelector('.main-menu-logo');
        if (logo) logo.addEventListener('click', () => this.game.cheatCodeSystem?.onLogoTap());

        // Settings long press easter egg (5s)
        if (this.game.dom.buttons.settings) {
            let pressTimer = null;
            this.game.dom.buttons.settings.addEventListener('pointerdown', () => {
                pressTimer = setTimeout(() => this.game.cheatCodeSystem?.onSettingsLongPress(), 5000);
            });
            this.game.dom.buttons.settings.addEventListener('pointerup', () => clearTimeout(pressTimer));
            this.game.dom.buttons.settings.addEventListener('pointerleave', () => clearTimeout(pressTimer));
        }

        // Keyboard 'S' in start screen for shake easter egg
        document.addEventListener('keydown', (e) => {
            if (this.game.state === 'startScreen') this.game.cheatCodeSystem?.onKeyInStartScreen(e.key);
        });
        if (this.game.dom.buttons.closeSettings) this.game.dom.buttons.closeSettings.onclick = () => {
            if (this.game.state === 'startScreen') {
                this.game.returnToStartScreen();
            } else if (this.game.state === 'paused') {
                this.game.hideAllPopups();
                this.game.showPopup('pause');
            } else {
                this.game.hideAllPopups();
                this.game.showPopup('start');
            }
        };
        this.game._wireSettingsAudio();
        this.game._wireSettingsAccessibility();
        // Pulsante inventario
        if (this.game.dom.buttons.inventory) this.game.dom.buttons.inventory.onclick = () => this.game.showInventory();
        if (this.game.dom.buttons.closeInventory) this.game.dom.buttons.closeInventory.onclick = () => this.game.closeInventory();

        // Pulsanti popup personaggi
        if (this.game.dom.buttons.openCharacterPopup) this.game.dom.buttons.openCharacterPopup.onclick = () => this.game.showCharacterPopup();
        if (this.game.dom.buttons.closeCharacterPopup) this.game.dom.buttons.closeCharacterPopup.onclick = () => this.game.hideCharacterPopup();

        // Pulsante achievements
        if (this.game.dom.buttons.achievements) {
            this.game.dom.buttons.achievements.onclick = () => this.game.showAchievements();
        }
        // Pulsante glossario
        if (this.game.dom.buttons.glossary) {
            this.game.dom.buttons.glossary.onclick = () => this.game.showGlossary();
        }
        if (this.game.dom.buttons.closeGlossary) {
            this.game.dom.buttons.closeGlossary.onclick = () => this.game.hideGlossary();
        }

        // Pulsante chiudi achievements
        if (this.game.dom.buttons.closeAchievements) {
            this.game.dom.buttons.closeAchievements.onclick = () => {
                this.game.hideAllPopups();
                this.game.showPopup('start');
            };
        }

        // Pulsante chiudi negozio
        const closeShopBtn = document.getElementById('closeShopBtn');
        if (closeShopBtn) {
            closeShopBtn.onclick = () => {
                this.game.hideAllPopups();
                if (this.game.state === 'startScreen') this.game.showPopup('start');
            };
        }

        // Pulsante chiudi negozio segreto
        const closeSecretShopBtn = document.getElementById('closeSecretShopBtn');
        if (closeSecretShopBtn) {
            closeSecretShopBtn.onclick = () => {
                this.game.hideAllPopups();
            };
        }

        // Dropdown stage
        if (this.game.dom.containers.stageDropdown) {
            this.game.dom.containers.stageDropdown.onchange = (e) => {
                this.game.selectStage(parseInt(e.target.value));
            };
        }

        // Tasto pausa mobile
        const pauseBtnMobile = document.getElementById('pauseButtonMobile');
        if (pauseBtnMobile) {
            pauseBtnMobile.onclick = () => this.game.togglePause();
        }

        if (this.game.dom.menuOverlay) {
            this.game.dom.menuOverlay.onclick = () => {
                if (this.game.state === 'gameOver' || this.game.state === 'startScreen') {
                    return;
                }

                // Se il popup dei personaggi è aperto, torna al menù principale
                if (this.game.dom.popups.characterSelection && this.game.dom.popups.characterSelection.style.display === 'flex') {
                    this.game.hideCharacterPopup();
                    return;
                }

                this.game.hideAllPopups();
            };
        }

        // Cloud status indicator
        this.game._cloudStatusInterval = setInterval(() => {
            const btn = document.getElementById('cloudSyncBtn');
            if (btn && this.game.cloudSyncManager) {
                const icon = this.game.cloudSyncManager.getStatusIcon();
                // Update only if changed to avoid DOM thrashing
                if (!btn.innerHTML.includes(icon)) {
                    btn.innerHTML = `☁️ <span style="font-size:0.8em">${icon}</span>`;
                }
            }
        }, 1000);

        Object.values(this.game.dom.popups).forEach(p => {
            if (p) p.addEventListener('click', e => e.stopPropagation());
        });
    }
}
