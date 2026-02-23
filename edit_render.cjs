const fs = require('fs');
const path = require('path');

const targetFile = 'c:/Users/alesx/Documents/Ball-Survival/src/systems/RenderSystem.js';
let content = fs.readFileSync(targetFile, 'utf8');

// Insert imports
content = content.replace(
    "import { Utils } from '../utils/index.js';",
    "import { Utils } from '../utils/index.js';\nimport { EnvironmentRenderer } from './EnvironmentRenderer.js';\nimport { HUDRenderer } from './HUDRenderer.js';"
);

// Add mixins to RenderSystem
content = content.replace(
    "export const RenderSystem = {",
    "export const RenderSystem = {\n    ...EnvironmentRenderer,\n    ...HUDRenderer,"
);

// Remove extracted methods string replacement (dirty but works since we know regex structure)
content = content.replace(/drawStartScreenBackground\(\) \{[\s\S]*?\},\s*(?=\/\*\* Ambient particles)/g, '');
content = content.replace(/\/\*\* Ambient particles per stage.*?drawAmbientParticles\(\) \{[\s\S]*?\},/g, '');
content = content.replace(/\/\*\* Boss entry animation.*?drawBossEntry\(\) \{[\s\S]*?\},/g, '');
content = content.replace(/drawOffscreenIndicators\(\) \{[\s\S]*?drawMinimap\(\) \{[\s\S]*?\}\n\};\n/g, '};\n');


fs.writeFileSync(targetFile, content);
console.log("RenderSystem.js modified successfully.");
