import fs from 'fs';
import path from 'path';

// --- SPLIT UTILS ---
const utilsPath = './src/utils/index.js';
let utilsContent = fs.readFileSync(utilsPath, 'utf8');

const mathBodyStart = utilsContent.indexOf('getDistance:');
const drawBodyStart = utilsContent.indexOf('drawJaggedLine:');
const mathContentText = utilsContent.slice(mathBodyStart, drawBodyStart).trim();
const drawContentText = utilsContent.slice(drawBodyStart, utilsContent.lastIndexOf('};')).trim().replace(/,\s*$/, ''); // remove trailing comma

let mathJs = `export const MathUtils = {\n    ${mathContentText}\n};\n`;
let drawJs = `export const GraphicsUtils = {\n    ${drawContentText}\n};\n`;

fs.writeFileSync('./src/utils/math.js', mathJs);
fs.writeFileSync('./src/utils/graphics.js', drawJs);

const newUtilsIndex = `/**\n * Utility functions for the game\n * @module utils\n */\n\nimport { MathUtils } from './math.js';\nimport { GraphicsUtils } from './graphics.js';\n\nexport const Utils = {\n    ...MathUtils,\n    ...GraphicsUtils\n};\n`;
fs.writeFileSync('./src/utils/index.js', newUtilsIndex);

// --- SPLIT SYSTEMS ---
const systemsPath = './src/systems/index.js';
let sysContent = fs.readFileSync(systemsPath, 'utf8');

const classNames = ['AnalyticsManager', 'RetentionMonitor', 'QuickFeedback', 'ProgressionOptimizer', 'AchievementSystem'];
const sysFiles = {};

for (let i = 0; i < classNames.length; i++) {
    const cls = classNames[i];
    const startIndex = sysContent.indexOf(`class ${cls} {`);
    let endIndex = 0;
    if (i < classNames.length - 1) {
        const nextCls = classNames[i + 1];
        endIndex = sysContent.indexOf(`class ${nextCls} {`) - 1;
        // Search back for jsdoc
        const partial = sysContent.slice(startIndex, endIndex);
        endIndex = startIndex + partial.lastIndexOf('}') + 1;
    } else {
        const partial = sysContent.slice(startIndex);
        endIndex = startIndex + partial.lastIndexOf('}') + 1;
    }

    let imports = '';
    if (cls === 'AnalyticsManager') imports = "import { cloudSyncManager } from '../utils/cloudSync.js';\n\n";

    sysFiles[cls] = imports + `export ` + sysContent.slice(startIndex, endIndex) + '\n';
}

for (const [cls, content] of Object.entries(sysFiles)) {
    fs.writeFileSync(`./src/systems/${cls}.js`, content);
}

const newSysIndex = `/**\n * Game Systems - Analytics, Retention, Feedback, Progression, Achievements\n * @module systems\n */\n\n${classNames.map(cls => `import { ${cls} } from './${cls}.js';`).join('\n')}\n\nexport { ${classNames.join(', ')} };\n`;
fs.writeFileSync('./src/systems/index.js', newSysIndex);

console.log('Successfully split utils and systems.');
