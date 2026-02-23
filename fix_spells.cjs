const fs = require('fs');

const path = 'src/systems/SpellSystem.js';
let lines = fs.readFileSync(path, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('this.addEntity(')) {
        let openCount = (lines[i].match(/\(/g) || []).length;
        let closeCount = (lines[i].match(/\)/g) || []).length;

        // As long as we are missing closing parentheses, add them.
        while (openCount > closeCount) {
            // Find the last semicolon or end of line and insert ')'
            if (lines[i].trim().endsWith(';')) {
                lines[i] = lines[i].replace(/(;\s*)$/, ')$1');
            } else {
                lines[i] += ')';
            }
            closeCount++;
        }
    }
}

fs.writeFileSync(path, lines.join('\n'));
console.log('Fixed SpellSystem.js parenthesis counts');
