const fs = require('fs');
const file = 'c:/Users/alesx/Documents/Ball-Survival/src/systems/SpellSystem.js';
let code = fs.readFileSync(file, 'utf8');

let fixed = 0;
code = code.replace(/projectileProps\)\);/g, () => { fixed++; return "projectileProps);"; });
code = code.replace(/\}\)\);/g, () => { fixed++; return "});"; });
code = code.replace(/\}\)\),/g, () => { fixed++; return "}),"; });

fs.writeFileSync(file, code);
console.log(`Replaced ${fixed} occurrences.`);
