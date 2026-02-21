/**
 * InputManager
 * Handles keyboard, pointer, and gamepad inputs.
 */

export class InputManager {
    constructor(game) {
        this.game = game;
        this.keys = {}; // Current state of keys
        this.pointers = {}; // Pointer states
    }

    init() {
        this.bindKeyboard();
        this.bindPointers();
        this.bindGamepad();
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    bindPointers() {
        const gameContainer = document.getElementById('gameContainer') || document.body;
        gameContainer.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
        gameContainer.addEventListener('pointermove', (e) => this.handlePointerMove(e), { passive: false });
        gameContainer.addEventListener('pointerup', (e) => this.handlePointerEnd(e));
        gameContainer.addEventListener('pointercancel', (e) => this.handlePointerEnd(e));
        // Prevent default touch only on game area; allow scroll and tap in popups/menus
        const isInsidePopupOrScrollable = (el) => el && (
            el.closest('.popup-menu') ||
            el.closest('.menu-content') ||
            el.closest('.scrollable') ||
            ['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'A'].includes(el.tagName)
        );
        gameContainer.addEventListener('touchstart', (e) => {
            if (!isInsidePopupOrScrollable(e.target) && e.cancelable) e.preventDefault();
        }, { passive: false });
        gameContainer.addEventListener('touchmove', (e) => {
            if (!isInsidePopupOrScrollable(e.target) && e.cancelable) e.preventDefault();
        }, { passive: false });
    }

    bindGamepad() {
        // Future gamepad support can be added here
    }

    handleKeyDown(e) {
        if (this.game.state === 'running') this.game.audio?.unlock();
        this.game.player.keys[e.code] = true;

        if (e.code === 'Escape') this.game.handleEscapeKey();
        if (e.code === 'KeyE') this.game.handleInteractionKey();
        if (e.code === 'KeyJ') {
            this.game.logLevelSystem?.discoverLog('test_log');
        }

        // Hotkeys for Consumable Items
        if (e.code === 'Digit1' || e.code === 'Numpad1') this.game.player.consumeItem(0, this.game);
        if (e.code === 'Digit2' || e.code === 'Numpad2') this.game.player.consumeItem(1, this.game);
        if (e.code === 'Digit3' || e.code === 'Numpad3') this.game.player.consumeItem(2, this.game);
    }

    handleKeyUp(e) {
        this.game.player.keys[e.code] = false;
    }

    handlePointerDown(e) {
        this.game.handlePointerDown(e);
    }

    handlePointerMove(e) {
        if (!e.target.closest?.('.popup-menu') && !e.target.closest?.('.menu-content') && e.cancelable) e.preventDefault();
        this.game.handlePointerMove(e);
    }

    handlePointerEnd(e) {
        this.game.handlePointerEnd(e);
    }

    cleanup() {
        // Remove event listeners if needed when destroying game
    }
}
