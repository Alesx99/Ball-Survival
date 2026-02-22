import { CONFIG } from '../config/index.js';

export const StageUI = {
    populateStageSelection() {
        const dropdown = this.dom.containers.stageDropdown;
        if (!dropdown || !CONFIG.stages) return;
        dropdown.innerHTML = '';

        Object.keys(CONFIG.stages).forEach(stageId => {
            const stage = CONFIG.stages[stageId];
            const option = document.createElement('option');
            option.value = stageId;
            option.textContent = stage.name;
            option.disabled = !stage.unlocked;

            if (!stage.unlocked) {
                option.textContent += ` (${this.getUnlockRequirementText(stage.unlockRequirement)})`;
            }

            dropdown.appendChild(option);
        });

        // Imposta il valore selezionato
        dropdown.value = this.selectedStage;
    },

    selectStage(stageId) {
        this.selectedStage = parseInt(stageId);
        this.dom.containers.stageDropdown.value = this.selectedStage;
    },

    getUnlockRequirementText(requirement) {
        if (!requirement) return 'Sempre disponibile';

        switch (requirement.type) {
            case 'craft_core':
                const core = CONFIG.cores[requirement.coreId];
                return `Crea il ${core ? core.name : 'Core'}`;
            case 'craft_weapon':
                const weapon = CONFIG.weapons[requirement.weaponId];
                return `Crea le ${weapon ? weapon.name : 'Armi'}`;
            case 'kill_elites':
                return `Uccidi ${requirement.count} elite in Stage ${requirement.stage}`;
            case 'reach_level':
                return `Raggiungi livello ${requirement.level}`;
            case 'arsenal_size':
                return `Possiedi almeno ${requirement.cores} core e ${requirement.weapons} armi`;
            case 'survival':
                if (requirement.stage) {
                    const stageName = CONFIG.stages[requirement.stage]?.name || `Stage ${requirement.stage}`;
                    return `Sopravvivi ${Math.floor(requirement.time / 60)} min in ${stageName}`;
                }
                return `Sopravvivi ${Math.floor(requirement.time / 60)} minuti`;
            case 'boss_kill':
                return `Uccidi ${requirement.count} boss in Stage ${requirement.stage}`;
            case 'boss_kill_total':
                return `Uccidi ${requirement.count} boss in totale`;
            case 'total_time':
                return `Gioca ${Math.floor(requirement.time / 60)} min totali`;
            default:
                return 'Sconosciuto';
        }
    }
};
