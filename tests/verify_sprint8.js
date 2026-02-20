
import { BestiarySystem } from '../src/systems/BestiarySystem.js';
import { RunHistorySystem } from '../src/systems/RunHistorySystem.js';
import { Utils } from '../src/utils/index.js';

// Mock Config & Game
global.CONFIG = {
    accessibility: { reduceMotion: false }
};
global.localStorage = {
    _data: {},
    getItem(key) { return this._data[key] || null; },
    setItem(key, val) { this._data[key] = val; }
};

console.log("--- Testing BestiarySystem ---");
const bestiary = new BestiarySystem();
bestiary.registerKill('slime');
bestiary.registerKill('slime');
bestiary.registerKill('boss_orc');
console.log("Entries:", bestiary.getAllEntries());

console.log("\n--- Testing RunHistorySystem ---");
const history = new RunHistorySystem();
history.saveRun({
    time: 120,
    level: 5,
    score: 1000,
    archetype: 'warrior',
    weapons: ['sword'],
    result: 'Defeat',
    mode: 'standard',
    date: Date.now()
});
console.log("History:", history.getHistory());

const entries = bestiary.getAllEntries();
if (entries['slime']?.kills === 2 && history.getHistory().length === 1) {
    console.log("\n✅ Systems Verification PASSED");
} else {
    console.error("\n❌ Systems Verification FAILED");
    process.exit(1);
}
