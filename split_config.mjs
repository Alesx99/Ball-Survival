import fs from 'fs';
import path from 'path';

const configPath = './src/config/index.js';
const content = fs.readFileSync(configPath, 'utf8');

// Find all top level keys using regex capturing 4 spaces, word, colon
// We want to capture the start index of each section.
const regex = /\n    ([a-zA-Z0-9_]+): /g;
let match;
const sections = [];

while ((match = regex.exec(content)) !== null) {
    sections.push({
        key: match[1],
        startIndex: match.index + 1 // skip the newline
    });
}

// Add end index to each section
for (let i = 0; i < sections.length; i++) {
    sections[i].endIndex = i < sections.length - 1 ? sections[i + 1].startIndex : content.lastIndexOf('};');
}

// Extract string for each section
const parts = {};
for (const sec of sections) {
    let text = content.slice(sec.startIndex, sec.endIndex).trim();
    // Remove the trailing comma if it exists at the very end
    if (text.endsWith(',')) {
        text = text.slice(0, -1);
    }
    parts[sec.key] = text;
}

// Group into domains
const domains = {
    base: ['FPS', 'world', 'effects', 'accessibility'],
    player: ['player', 'characterArchetypes'],
    enemies: ['enemies', 'difficultyTiers', 'boss', 'bossRush'],
    stages: ['stages'],
    items: ['chest', 'merchant', 'xpOrbs', 'materials', 'itemTypes'],
    equipment: ['cores', 'weapons', 'fusions'],
    progression: ['upgradeTree', 'skillTree', 'permanentUpgrades', 'affixes'],
    ui: ['statIcons', 'tutorial']
};

const imports = {
    player: "import { PlayerDraw } from '../render/PlayerDraw.js';\n\n"
};

for (const [domain, keys] of Object.entries(domains)) {
    let fileContent = imports[domain] || "";
    fileContent += `export const ${domain.toUpperCase()}_CONFIG = {\n`;

    // Add each section
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (parts[key]) {
            fileContent += "    " + parts[key];
            if (i < keys.length - 1) {
                fileContent += ",\n";
            }
        } else {
            console.warn(`Key ${key} not found for domain ${domain}`);
        }
    }

    fileContent += "\n};\n";
    fs.writeFileSync(`./src/config/${domain}.js`, fileContent);
    console.log(`Created src/config/${domain}.js`);
}

// Write the new index.js
let newIndexContent = `/**\n * Game Configuration - All game constants and data\n * @module config\n */\n\n`;

for (const domain of Object.keys(domains)) {
    newIndexContent += `import { ${domain.toUpperCase()}_CONFIG } from './${domain}.js';\n`;
}

newIndexContent += `\nexport const CONFIG = {\n`;
for (let i = 0; i < Object.keys(domains).length; i++) {
    const domain = Object.keys(domains)[i];
    newIndexContent += `    ...${domain.toUpperCase()}_CONFIG`;
    if (i < Object.keys(domains).length - 1) {
        newIndexContent += ",\n";
    } else {
        newIndexContent += "\n";
    }
}
newIndexContent += `};\n`;

fs.writeFileSync('./src/config/index.js', newIndexContent);
console.log('Updated src/config/index.js');
