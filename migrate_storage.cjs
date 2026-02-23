const fs = require('fs');

const files = [
    'src/systems/StageSystem.js', 'src/systems/SkinSystem.js', 'src/systems/RunHistorySystem.js',
    'src/systems/CheatCodeSystem.js', 'src/systems/BestiarySystem.js', 'src/systems/AudioManager.js',
    'src/systems/AchievementSystem.js', 'src/entities/Boss.js', 'src/core/Game.js',
    'src/auth/LoginManager.js', 'src/auth/AuthService.js'
];

const keyMap = {
    "'ballSurvivalTotalBossKills'": "StorageKeys.TOTAL_BOSS_KILLS",
    "'ballSurvivalStageProgress'": "StorageKeys.STAGE_PROGRESS",
    "'ballSurvivalSkins'": "StorageKeys.SKIN_STORAGE",
    "'ballSurvivalPlayers'": "StorageKeys.PLAYERS",
    "'ballSurvival_runHistory'": "StorageKeys.RUN_HISTORY",
    "'ballSurvival_achievements'": "StorageKeys.ACHIEVEMENTS",
    "'ballSurvival_globalStats'": "StorageKeys.GLOBAL_STATS",
    "'ballSurvival_bestiary'": "StorageKeys.BESTIARY",
    "'ballSurvivalAudioSettings'": "StorageKeys.AUDIO",
    "'ballSurvivalActiveDifficultyTier'": "StorageKeys.DIFFICULTY_TIER",
    "'ballSurvival_archetypesPlayed'": "StorageKeys.ARCHETYPES_PLAYED",
    "'ballSurvivalAccessibilitySettings'": "StorageKeys.ACCESSIBILITY",
    "'ballSurvivalSaveData'": "StorageKeys.LEGACY_SAVE",
    "STORAGE_PLAYERS": "StorageKeys.PLAYERS"
};

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');

    if (content.includes('localStorage.') && f !== 'src/core/StorageManager.js') {
        const hasSM = content.includes('StorageManager');
        const hasSK = content.includes('StorageKeys');

        let relPath = '../core/StorageManager.js';
        if (f.startsWith('src/core/')) relPath = './StorageManager.js';
        if (f.startsWith('src/auth/')) relPath = '../core/StorageManager.js';

        if (!hasSM && !hasSK) {
            let lines = content.split('\n');
            let importIndex = 0;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith('import')) importIndex = i + 1;
            }
            if (importIndex === 0 && lines[0].includes('/**')) {
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].includes('*/')) {
                        importIndex = i + 1;
                        break;
                    }
                }
            }
            lines.splice(importIndex, 0, `import { StorageManager, StorageKeys } from '${relPath}';`);
            content = lines.join('\n');
        }

        for (const [str, code] of Object.entries(keyMap)) {
            // Need to avoid replacing it if it forms part of a larger string, but single quotes are exact
            content = content.replace(new RegExp(str, 'g'), code);
        }

        content = content.replace(/localStorage\.getItem\((.*?)\)/g, 'StorageManager.getItem($1)');
        content = content.replace(/localStorage\.setItem\((.*?),\s*(.*?)\)/g, 'StorageManager.setItem($1, $2)');
        content = content.replace(/localStorage\.removeItem\((.*?)\)/g, 'StorageManager.removeItem($1)');

        // Remove JSON.parse wrapping:
        content = content.replace(/JSON\.parse\(StorageManager\.getItem\((.*?)\)\s*\|\|\s*'(\{\}|\[\])'\)/g, '((StorageManager.getItem($1) || $2))');
        content = content.replace(/JSON\.parse\(StorageManager\.getItem\((.*?)\)\)/g, 'StorageManager.getItem($1)');

        // Remove try/catch surrounding specific parse cases (CheatCodeSystem specific)
        content = content.replace(/try \{(.*?)=\s*StorageManager\.getItem\((.*?)\)\s*\} catch \{ \}/g, '$1= StorageManager.getItem($2) || {};');
        content = content.replace(/try \{ return StorageManager\.getItem\((.*?)\); \} catch \{ return \{[^}]*?\}; \}/g, 'return StorageManager.getItem($1) || {};');

        // Remove try/catch around set (CheatCodeSystem specific)
        content = content.replace(/try \{ StorageManager\.setItem\((.*?)\); \} catch \{ \/\* ignore \*\/ \}/g, 'StorageManager.setItem($1);');
        content = content.replace(/try \{ StorageManager\.setItem\((.*?)\); \} catch \(e\) \{ \}/g, 'StorageManager.setItem($1);');

        // Remove JSON.stringify on setItem
        content = content.replace(/StorageManager\.setItem\((.*?),\s*JSON\.stringify\((.*?)\)\)/g, 'StorageManager.setItem($1, $2)');

        // Game.js has JSON.parse(localStorage.getItem(...) || '{}') mapped down to ((...)) above 
        // Let's clean up those extra parens
        content = content.replace(/\(\(StorageManager\.getItem\((.*?)\)\s*\|\|\s*'(.*?)'\)\)/g, '(StorageManager.getItem($1) || $2)');

        // And some left-over parseInt since StorageManager yields parsed values
        content = content.replace(/parseInt\(StorageManager\.getItem\((.*?)\)\s*\|\|\s*'0'\)/g, '(StorageManager.getItem($1) || 0)');

        fs.writeFileSync(f, content);
    }
});
console.log('Migration complete');
