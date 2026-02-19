import { CONFIG } from '../config/index.js';

export class TutorialSystem {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.currentStepIndex = 0;
        this.steps = CONFIG.tutorial?.steps || [];
        this.completed = false;
        this.initialPos = { x: 0, y: 0 };
        this.movementThreshold = 150; // Units to move for movement step
    }

    start() {
        this.active = true;
        this.currentStepIndex = 0;
        this.completed = false;
        this.game.state = 'running';
        this.game.gameMode = 'tutorial';
        this.initialPos = { x: this.game.player.x, y: this.game.player.y };

        // Hide menus and show game UI
        this.game.hideAllPopups(true);
        if (this.game.dom.inGameUI) this.game.dom.inGameUI.container.style.display = 'flex';
        if (this.game.dom.buttons.pause) this.game.dom.buttons.pause.style.display = 'flex';

        // Disable normal spawning
        this.game.spawnEnabled = false;

        console.log("Tutorial Started");
        this.showStepMessage();
    }

    update() {
        if (!this.active || this.completed) return;

        const step = this.steps[this.currentStepIndex];
        if (!step) return;

        let stepCompleted = false;

        switch (step.type) {
            case 'movement':
                const dist = Math.sqrt(
                    Math.pow(this.game.player.x - this.initialPos.x, 2) +
                    Math.pow(this.game.player.y - this.initialPos.y, 2)
                );
                if (dist >= this.movementThreshold) stepCompleted = true;
                break;

            case 'combat':
                // Check if target enemy is dead
                if (this.game.enemiesKilled > 0) stepCompleted = true;
                break;

            case 'levelup':
                // Check if player level > 1
                if (this.game.player.level > 1) stepCompleted = true;
                break;
        }

        if (stepCompleted) {
            this.advanceStep();
        }
    }

    advanceStep() {
        this.currentStepIndex++;
        if (this.currentStepIndex >= this.steps.length) {
            this.finish();
        } else {
            this.showStepMessage();
            this.onStepStart(this.steps[this.currentStepIndex]);
        }
    }

    onStepStart(step) {
        if (step.type === 'combat') {
            // Spawn a dummy enemy
            this.game.spawnDummyEnemy();
        }
        if (step.type === 'levelup') {
            // Give enough XP to level up
            this.game.player.xp = this.game.player.xpNext;
        }
    }

    showStepMessage() {
        const step = this.steps[this.currentStepIndex];
        if (!step) return;

        this.game.notifications.push({
            text: `🎯 TUTORIAL: ${step.message}`,
            life: 300,
            color: '#00f5ff'
        });
    }

    finish() {
        this.completed = true;
        this.active = false;
        this.game.notifications.push({
            text: "🏆 TUTORIAL COMPLETATO!",
            life: 300,
            color: '#ffd700'
        });

        // Transition back to start screen
        setTimeout(() => {
            this.game.returnToStartScreen();
        }, 3000);
    }

    draw(ctx) {
        if (!this.active || this.completed) return;

        const step = this.steps[this.currentStepIndex];
        if (!step) return;

        if (step.type === 'movement') {
            // Draw a faint arrow or pointer towards where to move?
            // For now, just a circle around the player
            ctx.strokeStyle = '#00f5ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.game.player.x, this.game.player.y, 100, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (step.type === 'combat') {
            // Point to the dummy enemy
            const enemy = this.game.entities.enemies[0];
            if (enemy) {
                ctx.strokeStyle = '#ff4444';
                ctx.beginPath();
                ctx.moveTo(this.game.player.x, this.game.player.y);
                ctx.lineTo(enemy.x, enemy.y);
                ctx.stroke();
            }
        }
    }
}
