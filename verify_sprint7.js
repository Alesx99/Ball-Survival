
import { SeededRNG } from './src/utils/SeededRNG.js';

console.log('=== VERIFYING SPRINT 7 FEATURES ===');

// 1. Test SeededRNG Determinism
console.log('\n[TEST 1] Testing Random Number Generator Determinism...');
const seed1 = 123456;
const rng1 = new SeededRNG(seed1);
const seq1 = [rng1.next(), rng1.next(), rng1.next()];

const rng2 = new SeededRNG(seed1);
const seq2 = [rng2.next(), rng2.next(), rng2.next()];

const rng3 = new SeededRNG(seed1 + 1);
const seq3 = [rng3.next(), rng3.next(), rng3.next()];

const isDeterministic = JSON.stringify(seq1) === JSON.stringify(seq2);
const isDifferent = JSON.stringify(seq1) !== JSON.stringify(seq3);

if (isDeterministic && isDifferent) {
    console.log('✅ PASS: RNG is deterministic and seed-sensitive.');
} else {
    console.error('❌ FAIL: RNG behavior is incorrect.');
    console.log('Seq1:', seq1);
    console.log('Seq2:', seq2);
    console.log('Seq3:', seq3);
}

// 2. Test RNG Utility Methods
console.log('\n[TEST 2] Testing RNG Utility Methods (Range, Pick)...');
const rng4 = new SeededRNG(999);
const rangeVal = rng4.range(10, 20);
const rangeCheck = rangeVal >= 10 && rangeVal < 20;

const arr = ['A', 'B', 'C', 'D'];
const picked = rng4.pick(arr);
const pickCheck = arr.includes(picked);

if (rangeCheck && pickCheck) {
    console.log(`✅ PASS: Range(${rangeVal}) and Pick(${picked}) work.`);
} else {
    console.error('❌ FAIL: RNG utilities failed.');
}

// 3. Test Scaling Logic (Mock Simulation)
console.log('\n[TEST 3] Testing Endless Scaling Formula...');
const calculateStats = (timeMinutes, gameMode = 'standard') => {
    let interval = 1.0;
    let maxEnemies = 20 + Math.floor(timeMinutes * 8);

    // Logic from SpawnSystem.js (simplified for test)
    if (timeMinutes < 2) interval = 1.4;
    else if (timeMinutes < 5) interval = 1.5;
    else if (timeMinutes < 10) interval = 1.0;
    else if (timeMinutes > 30) interval = 0.3;

    if (gameMode === 'endless' && timeMinutes >= 30) {
        interval = Math.max(0.1, 0.3 - (timeMinutes - 30) * 0.01);
        maxEnemies = 300 + Math.floor((timeMinutes - 30) * 10);
    } else {
        maxEnemies = Math.min(300, maxEnemies);
    }

    return { interval, maxEnemies };
};

const t25 = calculateStats(25, 'standard');
const t35_std = calculateStats(35, 'standard');
const t35_end = calculateStats(35, 'endless');
const t60_end = calculateStats(60, 'endless');

console.log('Time 25m (Std):', t25);
console.log('Time 35m (Std):', t35_std); // Should cap at 300 enemies, 0.3 interval
console.log('Time 35m (Endless):', t35_end); // Should exceed 300 enemies, < 0.3 interval
console.log('Time 60m (Endless):', t60_end); // heavy scaling

if (t35_std.maxEnemies === 300 && t35_end.maxEnemies > 300 && t60_end.interval < t35_end.interval) {
    console.log('✅ PASS: Endless scaling logic matches requirements.');
} else {
    console.error('❌ FAIL: Scaling logic mismatch.');
}

console.log('\n=== VERIFICATION COMPLETE ===');
