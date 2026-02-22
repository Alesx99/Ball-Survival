/**
 * InputManager
 * Handles keyboard, pointer, and gamepad inputs.
 */

import { CONFIG } from '../config/index.js';

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

        if (e.code === 'Escape') this.handleEscapeKey();
        if (e.code === 'KeyE') this.handleInteractionKey();
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

    handleEscapeKey() {
        const anyPopupOpen = Object.values(this.game.dom.popups).some(p => p && p.style.display === 'flex');

        if (this.game.dom.popups.characterSelection && this.game.dom.popups.characterSelection.style.display === 'flex') {
            this.game.hideCharacterPopup();
            return;
        }
        if (this.game.state === 'startScreen') {
            if (this.game.dom.popups.glossary?.style.display === 'flex') { this.game.hideGlossary(); return; }
            if (this.game.dom.popups.achievements?.style.display === 'flex') { this.game.hideAllPopups(); this.game.showPopup('start'); return; }
        }

        if (anyPopupOpen && this.game.state !== 'startScreen' && this.game.state !== 'gameOver') {
            this.game.hideAllPopups();
        } else {
            this.game.togglePause();
        }
    }

    handleInteractionKey() {
        if (this.game.menuCooldown > 0 || this.game.state !== 'running') {
            return;
        }

        // We use Math.hypot for distance or a local Utils.getDistance if we had it.
        // Assuming CONFIG is available directly or we just rewrite distance.
        const dx = this.game.player.x - CONFIG.merchant.x;
        const dy = this.game.player.y - CONFIG.merchant.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < CONFIG.merchant.interactionRadius) {
            this.game.showPopup('shop');
        }

        if (this.game._secretMerchantActive && this.game._secretMerchantPos) {
            const sdx = this.game.player.x - this.game._secretMerchantPos.x;
            const sdy = this.game.player.y - this.game._secretMerchantPos.y;
            const secretDistance = Math.sqrt(sdx * sdx + sdy * sdy);
            if (secretDistance < this.game._secretMerchantPos.interactionRadius) {
                this.game.showPopup('secretShop');
            }
        }
    }

    handlePointerDown(e) {
        this.game.audio?.unlock();
        if (this.game.state === 'gameOver' || this.game.state === 'startScreen') return;
        if (!this.game.canvas) return;

        const rect = this.game.canvas.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;
        const worldX = (clientX - rect.left) * (this.game.camera.width / rect.width) + this.game.camera.x;
        const worldY = (clientY - rect.top) * (this.game.camera.height / rect.height) + this.game.camera.y;
        if (this.game.state === 'running') {
            const mdx = worldX - CONFIG.merchant.x;
            const mdy = worldY - CONFIG.merchant.y;
            if (Math.sqrt(mdx * mdx + mdy * mdy) < CONFIG.merchant.interactionRadius) {
                this.game.showPopup('shop');
                return;
            }
            if (this.game._secretMerchantActive && this.game._secretMerchantPos) {
                const sdx = worldX - this.game._secretMerchantPos.x;
                const sdy = worldY - this.game._secretMerchantPos.y;
                if (Math.sqrt(sdx * sdx + sdy * sdy) < this.game._secretMerchantPos.interactionRadius) {
                    this.game.showPopup('secretShop');
                    return;
                }
            }
        }
        if (e.pointerType === 'touch' && !this.game.joystick.active) {
            e.preventDefault();
            this.game.joystick.touchId = e.pointerId;
            this.game.joystick.active = true;
            this.game.joystick.startX = clientX;
            this.game.joystick.startY = clientY;
            if (this.game.dom.joystick && this.game.dom.joystick.container) {
                this.game.dom.joystick.container.style.display = 'block';
                this.game.dom.joystick.container.style.left = `${clientX - this.game.dom.joystick.radius}px`;
                this.game.dom.joystick.container.style.top = `${clientY - this.game.dom.joystick.radius}px`;
            }
        }
    }

    handlePointerMove(e) {
        if (!e.target.closest?.('.popup-menu') && !e.target.closest?.('.menu-content') && e.cancelable) e.preventDefault();

        if (!this.game.joystick.active || e.pointerId !== this.game.joystick.touchId) return;
        e.preventDefault();
        let deltaX = e.clientX - this.game.joystick.startX;
        let deltaY = e.clientY - this.game.joystick.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = this.game.dom.joystick.radius;
        if (distance > maxDistance) {
            deltaX = (deltaX / distance) * maxDistance;
            deltaY = (deltaY / distance) * maxDistance;
        }
        const dxNorm = deltaX / maxDistance;
        const dyNorm = deltaY / maxDistance;
        this.game.joystick.dx = dxNorm;
        this.game.joystick.dy = dyNorm;

        // Balletto easter egg: track joystick spin (5 full rotations in 3s)
        if (distance > maxDistance * 0.5) {
            const angle = Math.atan2(dyNorm, dxNorm);
            if (this.game._ballettoLastAngle !== undefined) {
                let delta = angle - this.game._ballettoLastAngle;
                if (delta > Math.PI) delta -= 2 * Math.PI;
                if (delta < -Math.PI) delta += 2 * Math.PI;
                this.game._ballettoTotalSpin = (this.game._ballettoTotalSpin || 0) + Math.abs(delta);
            }
            this.game._ballettoLastAngle = angle;
            if (!this.game._ballettoStartTime) this.game._ballettoStartTime = Date.now();
            if (Date.now() - this.game._ballettoStartTime > 3000) {
                this.game._ballettoTotalSpin = 0;
                this.game._ballettoStartTime = Date.now();
            }
            if (this.game._ballettoTotalSpin >= Math.PI * 10) { // 5 full spins
                this.game._ballettoTotalSpin = 0;
                this.game._ballettoStartTime = 0;
                this.game.cheatCodeSystem?.discoverEgg('balletto');
                // Confetti explosion
                if (this.game.state === 'running' && this.game.player && this.game._entityClasses?.Particle) {
                    for (let i = 0; i < 40; i++) {
                        const a = Math.random() * Math.PI * 2;
                        const s = 2 + Math.random() * 6;
                        const colors = ['#ffd700', '#ff6347', '#00ff88', '#ff69b4', '#87ceeb', '#ff4500'];
                        this.game.addEntity('particles', new this.game._entityClasses.Particle(this.game.player.x, this.game.player.y, {
                            vx: Math.cos(a) * s, vy: Math.sin(a) * s,
                            life: 30 + Math.floor(Math.random() * 40),
                            color: colors[Math.floor(Math.random() * colors.length)]
                        }));
                    }
                    this.game.notifications?.push?.({ text: '💃 BALLETTO! 🎉', life: 200, color: '#ff69b4' });
                }
            }
        } else {
            this.game._ballettoLastAngle = undefined;
        }
        this.game._joystickPending.dx = deltaX;
        this.game._joystickPending.dy = deltaY;
        if (!this.game._joystickRAF) {
            this.game._joystickRAF = requestAnimationFrame(() => {
                this.game._joystickRAF = null;
                if (this.game.dom.joystick && this.game.dom.joystick.stick) {
                    this.game.dom.joystick.stick.style.transform = `translate(${this.game._joystickPending.dx}px, ${this.game._joystickPending.dy}px)`;
                }
            });
        }
    }

    handlePointerEnd(e) {
        if (this.game.joystick.active && e.pointerId === this.game.joystick.touchId) {
            this.game.joystick.active = false;
            this.game.joystick.touchId = null;
            if (this.game.dom.joystick && this.game.dom.joystick.stick) {
                this.game.dom.joystick.stick.style.transform = 'translate(0px, 0px)';
            }
            if (this.game.dom.joystick && this.game.dom.joystick.container) {
                this.game.dom.joystick.container.style.display = 'none';
            }
            this.game.joystick.dx = 0;
            this.game.joystick.dy = 0;
        }
    }

    cleanup() {
        // Remove event listeners if needed when destroying game
    }
}
