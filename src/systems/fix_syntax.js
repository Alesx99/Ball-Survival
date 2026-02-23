const fs = require('fs');
const file = 'c:/Users/alesx/Documents/Ball-Survival/src/systems/SpellSystem.js';
let code = fs.readFileSync(file, 'utf8');

let fixed = 0;
// We incorrectly removed the start of a function call without removing it's closing parens:
// "this.addEntity('projectiles', poolManager.get('Projectile', () => new Projectile(0, 0, {})).init(this.player.x, this.player.y, {"
// -> "this.addPooledProjectile(this.player.x, this.player.y, {"

code = code.replace(/projectileProps\)\);/g, () => { fixed++; return "projectileProps);"; });
code = code.replace(/\}\)\);/g, () => { fixed++; return "});"; });
code = code.replace(/\}\)\),/g, () => { fixed++; return "}),"; });

fs.writeFileSync(file, code);
console.log(`Replaced ${fixed} occurrences.`);
