/**
 * Game Configuration - All game constants and data
 * @module config
 */

import { BASE_CONFIG } from './base.js';
import { PLAYER_CONFIG } from './player.js';
import { ENEMIES_CONFIG } from './enemies.js';
import { STAGES_CONFIG } from './stages.js';
import { ITEMS_CONFIG } from './items.js';
import { EQUIPMENT_CONFIG } from './equipment.js';
import { PROGRESSION_CONFIG } from './progression.js';
import { UI_CONFIG } from './ui.js';

export const CONFIG = {
    ...BASE_CONFIG,
    ...PLAYER_CONFIG,
    ...ENEMIES_CONFIG,
    ...STAGES_CONFIG,
    ...ITEMS_CONFIG,
    ...EQUIPMENT_CONFIG,
    ...PROGRESSION_CONFIG,
    ...UI_CONFIG
};
