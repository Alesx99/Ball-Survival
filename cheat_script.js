// ========================================
// BALL SURVIVAL - SCRIPT CHEAT ESTERNO
// ========================================
// 
// USO: Apri la console del browser (F12) e incolla questo script
// ATTENZIONE: Usa solo per test, non in partite competitive!
//
// Autore: Assistente AI
// Versione: 1.1
// Data: 2024

(function() {
    'use strict';
    
    // ========================================
    // CONFIGURAZIONE CHEAT
    // ========================================
    const CHEAT_CONFIG = {
        enabled: false,
        godMode: false,
        infiniteXP: false,
        maxLevel: false,
        unlimitedGems: false,
        instantKill: false,
        speedHack: false,
        autoCollect: false,
        showDebugInfo: false,
        drFixApplied: false
    };
    
    // ========================================
    // FUNZIONI UTILITY
    // ========================================
    
    function getGame() {
        // Prova diversi metodi per trovare l'istanza del gioco
        if (window.game) return window.game;
        
        // Cerca la variabile globale 'game'
        if (typeof game !== 'undefined') return game;
        
        // Cerca nel canvas
        const canvas = document.querySelector('#gameCanvas');
        if (canvas && canvas.game) return canvas.game;
        
        // Cerca nell'oggetto window per variabili che potrebbero contenere il gioco
        for (let key in window) {
            if (window[key] && typeof window[key] === 'object' && window[key].player && window[key].entities) {
                return window[key];
            }
        }
        
        return null;
    }
    
    function getPlayer() {
        const game = getGame();
        return game?.player;
    }
    
    function log(message, type = 'info') {
        const colors = {
            info: '#00ff00',
            warning: '#ffff00', 
            error: '#ff0000',
            success: '#00ffff'
        };
        console.log(`%c[CHEAT] ${message}`, `color: ${colors[type]}; font-weight: bold;`);
    }
    
    // ========================================
    // FIX DR AUTOMATICO
    // ========================================
    
    function applyDRFix() {
        if (CHEAT_CONFIG.drFixApplied) return;
        
        const player = getPlayer();
        if (!player) return;
        
        // Salva la funzione originale takeDamage se non è già stata salvata
        if (!player._originalTakeDamage) {
            player._originalTakeDamage = player.takeDamage;
        }
        
        // Sostituisci con versione che ha il cap DR
        player.takeDamage = function(amount, game, sourceEnemy = null) {
            const shieldSpell = game.spells.shield;
            if ((shieldSpell && shieldSpell.active && shieldSpell.evolution !== 'reflect') || this.powerUpTimers.invincibility > 0) return;
            
            let damageReduction = Math.min(1.0, this.stats.dr);  // CAP DR AL 100%
            
            // Penetrazione DR del 10% da elite, 25% da boss
            if (sourceEnemy && sourceEnemy.stats.isElite) {
                damageReduction = Math.max(0, damageReduction - 0.10);
            }
            if (sourceEnemy && sourceEnemy instanceof Boss) {
                damageReduction = Math.max(0, damageReduction - 0.25);
            }
            
            if (shieldSpell && shieldSpell.active && shieldSpell.evolution === 'reflect') {
                damageReduction += shieldSpell.dr;
                if(sourceEnemy) { 
                    sourceEnemy.takeDamage(amount * shieldSpell.reflectDamage, game); 
                }
            }
            
            const finalDamage = amount * (1 - damageReduction);
            this.hp -= finalDamage;
            if (this.hp <= 0) game.gameOver();
        };
        
        CHEAT_CONFIG.drFixApplied = true;
        log('Fix DR applicato automaticamente! DR limitato al 100%', 'success');
    }
    
    // ========================================
    // CHEAT FUNCTIONS
    // ========================================
    
    const Cheats = {
        // GOD MODE - Invincibilità completa
        toggleGodMode() {
            const player = getPlayer();
            if (!player) {
                log('Giocatore non trovato!', 'error');
                return;
            }
            
            CHEAT_CONFIG.godMode = !CHEAT_CONFIG.godMode;
            
            if (CHEAT_CONFIG.godMode) {
                // Salva la funzione originale
                if (!player._originalTakeDamage) {
                    player._originalTakeDamage = player.takeDamage;
                }
                
                // Sostituisci con versione che non fa nulla
                player.takeDamage = function() {
                    log('Danno bloccato!', 'success');
                };
                
                log('God Mode ATTIVATO - Sei invincibile!', 'success');
            } else {
                // Ripristina funzione originale
                if (player._originalTakeDamage) {
                    player.takeDamage = player._originalTakeDamage;
                    delete player._originalTakeDamage;
                }
                log('God Mode DISATTIVATO', 'warning');
            }
        },
        
        // INFINITE XP - XP infinito
        toggleInfiniteXP() {
            CHEAT_CONFIG.infiniteXP = !CHEAT_CONFIG.infiniteXP;
            
            if (CHEAT_CONFIG.infiniteXP) {
                log('Infinite XP ATTIVATO - XP non diminuisce mai!', 'success');
            } else {
                log('Infinite XP DISATTIVATO', 'warning');
            }
        },
        
        // MAX LEVEL - Livello massimo istantaneo
        setMaxLevel() {
            const player = getPlayer();
            if (!player) {
                log('Giocatore non trovato!', 'error');
                return;
            }
            
            player.level = 999;
            player.xp = 999999;
            player.xpNext = 1;
            player.hp = player.stats.maxHp;
            
            log('Livello impostato a 999!', 'success');
        },
        
        // UNLIMITED GEMS - Gemme infinite
        addGems(amount = 1000) {
            const game = getGame();
            if (!game) {
                log('Gioco non trovato!', 'error');
                return;
            }
            
            game.totalGems += amount;
            log(`Aggiunte ${amount} gemme!`, 'success');
        },
        
        // INSTANT KILL - Uccide tutti i nemici
        killAllEnemies() {
            const game = getGame();
            if (!game) {
                log('Gioco non trovato!', 'error');
                return;
            }
            
            const enemies = [...game.entities.enemies, ...game.entities.bosses];
            enemies.forEach(enemy => {
                enemy.hp = 0;
                enemy.toRemove = true;
            });
            
            log(`Uccisi ${enemies.length} nemici!`, 'success');
        },
        
        // SPEED HACK - Velocità aumentata
        toggleSpeedHack() {
            const player = getPlayer();
            if (!player) {
                log('Giocatore non trovato!', 'error');
                return;
            }
            
            CHEAT_CONFIG.speedHack = !CHEAT_CONFIG.speedHack;
            
            if (CHEAT_CONFIG.speedHack) {
                player.stats.speed *= 3;
                log('Speed Hack ATTIVATO - Velocità triplicata!', 'success');
            } else {
                player.stats.speed /= 3;
                log('Speed Hack DISATTIVATO', 'warning');
            }
        },
        
        // AUTO COLLECT - Raccolta automatica
        toggleAutoCollect() {
            CHEAT_CONFIG.autoCollect = !CHEAT_CONFIG.autoCollect;
            
            if (CHEAT_CONFIG.autoCollect) {
                log('Auto Collect ATTIVATO - Raccolta automatica!', 'success');
            } else {
                log('Auto Collect DISATTIVATO', 'warning');
            }
        },
        
        // HEAL PLAYER - Cura completa
        healPlayer() {
            const player = getPlayer();
            if (!player) {
                log('Giocatore non trovato!', 'error');
                return;
            }
            
            player.hp = player.stats.maxHp;
            log('Salute ripristinata al massimo!', 'success');
        },
        
        // ADD MATERIALS - Aggiunge materiali
        addMaterials(materialType = 'all', amount = 10) {
            const game = getGame();
            if (!game) {
                log('Gioco non trovato!', 'error');
                return;
            }
            
            const materials = [
                'iron_fragment', 'steel_fragment', 'crystal_fragment',
                'energy_fragment', 'wood_fragment', 'stone_fragment',
                'metal_fragment', 'magma_fragment', 'void_fragment',
                'cosmic_fragment'
            ];
            
            if (materialType === 'all') {
                materials.forEach(mat => {
                    game.addMaterial(mat, amount);
                });
                log(`Aggiunti ${amount} di ogni materiale!`, 'success');
            } else {
                game.addMaterial(materialType, amount);
                log(`Aggiunti ${amount} ${materialType}!`, 'success');
            }
        },
        
        // SPAWN BOSS - Spawna un boss
        spawnBoss() {
            const game = getGame();
            if (!game) {
                log('Gioco non trovato!', 'error');
                return;
            }
            
            const player = getPlayer();
            if (!player) {
                log('Giocatore non trovato!', 'error');
                return;
            }
            
            // Spawn boss vicino al giocatore
            const bossX = player.x + (Math.random() - 0.5) * 200;
            const bossY = player.y + (Math.random() - 0.5) * 200;
            
            const bossStats = {
                hp: 1000,
                speed: 1.5,
                radius: 25,
                damage: 20,
                xp: 100,
                dr: 0.3,
                isElite: true
            };
            
            const Boss = game.entities.bosses.constructor;
            const boss = new Boss(bossX, bossY, bossStats);
            game.entities.bosses.push(boss);
            
            log('Boss spawnato!', 'success');
        },
        
        // DEBUG INFO - Mostra informazioni di debug
        toggleDebugInfo() {
            CHEAT_CONFIG.showDebugInfo = !CHEAT_CONFIG.showDebugInfo;
            
            if (CHEAT_CONFIG.showDebugInfo) {
                log('Debug Info ATTIVATO', 'success');
                startDebugLoop();
            } else {
                log('Debug Info DISATTIVATO', 'warning');
            }
        },
        
        // FIX DR - Corregge il problema del DR eccessivo
        fixDR() {
            applyDRFix();
            log('Fix DR applicato manualmente!', 'success');
        },
        
        // RESET CHEATS - Disattiva tutti i cheat
        resetCheats() {
            const player = getPlayer();
            if (player) {
                // Ripristina takeDamage originale
                if (player._originalTakeDamage) {
                    player.takeDamage = player._originalTakeDamage;
                    delete player._originalTakeDamage;
                }
                
                // Ripristina velocità
                if (CHEAT_CONFIG.speedHack) {
                    player.stats.speed /= 3;
                }
            }
            
            // Reset configurazione
            Object.keys(CHEAT_CONFIG).forEach(key => {
                if (key !== 'drFixApplied') {
                    CHEAT_CONFIG[key] = false;
                }
            });
            
            log('Tutti i cheat sono stati disattivati!', 'warning');
        }
    };
    
    // ========================================
    // DEBUG LOOP
    // ========================================
    
    function startDebugLoop() {
        if (window._debugInterval) {
            clearInterval(window._debugInterval);
        }
        
        window._debugInterval = setInterval(() => {
            if (!CHEAT_CONFIG.showDebugInfo) {
                clearInterval(window._debugInterval);
                return;
            }
            
            const game = getGame();
            const player = getPlayer();
            
            if (game && player) {
                console.log(`%c[DEBUG] HP: ${player.hp}/${player.stats.maxHp} | Level: ${player.level} | XP: ${player.xp}/${player.xpNext} | Speed: ${player.stats.speed.toFixed(2)} | DR: ${(player.stats.dr * 100).toFixed(1)}% | Enemies: ${game.entities.enemies.length} | Bosses: ${game.entities.bosses.length}`, 'color: #ff00ff; font-size: 12px;');
            }
        }, 1000);
    }
    
    // ========================================
    // AUTO COLLECT LOOP
    // ========================================
    
    function startAutoCollectLoop() {
        if (window._autoCollectInterval) {
            clearInterval(window._autoCollectInterval);
        }
        
        window._autoCollectInterval = setInterval(() => {
            if (!CHEAT_CONFIG.autoCollect) {
                clearInterval(window._autoCollectInterval);
                return;
            }
            
            const game = getGame();
            if (game) {
                // Auto collect XP orbs
                game.entities.xpOrbs.forEach(orb => {
                    const player = getPlayer();
                    if (player && Utils.getDistance(orb, player) < 50) {
                        player.gainXP(orb.value);
                        orb.toRemove = true;
                    }
                });
                
                // Auto collect gem orbs
                game.entities.gemOrbs.forEach(orb => {
                    const player = getPlayer();
                    if (player && Utils.getDistance(orb, player) < 50) {
                        game.totalGems += orb.value;
                        orb.toRemove = true;
                    }
                });
            }
        }, 100);
    }
    
    // ========================================
    // INFINITE XP PATCH
    // ========================================
    
    function patchInfiniteXP() {
        const player = getPlayer();
        if (!player || !CHEAT_CONFIG.infiniteXP) return;
        
        // Salva XP originale
        if (!player._originalGainXP) {
            player._originalGainXP = player.gainXP;
        }
        
        // Sostituisci con versione che non diminuisce XP
        player.gainXP = function(amount) {
            this.xp += amount * this.modifiers.xpGain;
            // Non diminuisce mai l'XP
        };
    }
    
    // ========================================
    // INTERFACE
    // ========================================
    
    function showCheatMenu() {
        console.log(`
%c╔══════════════════════════════════════════════════════════════╗
║                    BALL SURVIVAL CHEAT MENU                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  COMANDI DISPONIBILI:                                        ║
║                                                              ║
║  • cheat.godMode()           - God Mode (Invincibilità)     ║
║  • cheat.infiniteXP()        - XP Infinito                  ║
║  • cheat.maxLevel()          - Livello Massimo              ║
║  • cheat.addGems(1000)       - Aggiungi Gemme              ║
║  • cheat.killAll()           - Uccidi Tutti i Nemici        ║
║  • cheat.speedHack()         - Velocità Triplicata          ║
║  • cheat.autoCollect()       - Raccolta Automatica          ║
║  • cheat.heal()              - Cura Completa                ║
║  • cheat.addMaterials()      - Aggiungi Materiali           ║
║  • cheat.spawnBoss()         - Spawna Boss                  ║
║  • cheat.debugInfo()         - Info Debug                   ║
║  • cheat.fixDR()             - Corregge DR Eccessivo        ║
║  • cheat.reset()             - Disattiva Tutti i Cheat      ║
║                                                              ║
║  ESEMPI:                                                     ║
║  • cheat.addGems(5000)       - Aggiungi 5000 gemme          ║
║  • cheat.addMaterials('iron', 50) - 50 frammenti ferro      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
        `, 'color: #00ffff; font-family: monospace;');
    }
    
    // ========================================
    // INIZIALIZZAZIONE
    // ========================================
    
    function init() {
        // Crea oggetto cheat globale
        window.cheat = {
            godMode: () => Cheats.toggleGodMode(),
            infiniteXP: () => Cheats.toggleInfiniteXP(),
            maxLevel: () => Cheats.setMaxLevel(),
            addGems: (amount) => Cheats.addGems(amount),
            killAll: () => Cheats.killAllEnemies(),
            speedHack: () => Cheats.toggleSpeedHack(),
            autoCollect: () => Cheats.toggleAutoCollect(),
            heal: () => Cheats.healPlayer(),
            addMaterials: (type, amount) => Cheats.addMaterials(type, amount),
            spawnBoss: () => Cheats.spawnBoss(),
            debugInfo: () => Cheats.toggleDebugInfo(),
            fixDR: () => Cheats.fixDR(),
            reset: () => Cheats.resetCheats(),
            menu: () => showCheatMenu(),
            status: () => console.log('Cheat Status:', CHEAT_CONFIG),
            debug: () => {
                console.log('=== DEBUG CHEAT ===');
                console.log('Game instance:', getGame());
                console.log('Player:', getPlayer());
                console.log('Window.game:', window.game);
                console.log('Global game:', typeof game !== 'undefined' ? game : 'undefined');
                console.log('Canvas:', document.querySelector('#gameCanvas'));
                console.log('Canvas.game:', document.querySelector('#gameCanvas')?.game);
                console.log('==================');
            }
        };
        
        // Avvia loop per infinite XP
        setInterval(() => {
            if (CHEAT_CONFIG.infiniteXP) {
                patchInfiniteXP();
            }
        }, 1000);
        
        // Avvia loop per auto collect
        setInterval(() => {
            if (CHEAT_CONFIG.autoCollect) {
                startAutoCollectLoop();
            }
        }, 100);
        
        // Applica automaticamente il fix DR
        setInterval(() => {
            applyDRFix();
        }, 2000);
        
        log('Script Cheat caricato! Digita "cheat.menu()" per vedere i comandi', 'success');
        log('ATTENZIONE: Usa solo per test, non in partite competitive!', 'warning');
        log('Fix DR automatico attivo - DR limitato al 100%', 'info');
    }
    
    // Avvia inizializzazione
    init();
    
    // Rendi il gioco accessibile globalmente per compatibilità
    function makeGameGlobal() {
        const gameInstance = getGame();
        if (gameInstance && !window.game) {
            window.game = gameInstance;
            log('Gioco reso accessibile globalmente come window.game', 'success');
        }
    }
    
    // Prova a rendere il gioco globale dopo un breve delay
    setTimeout(makeGameGlobal, 1000);
    
})(); 