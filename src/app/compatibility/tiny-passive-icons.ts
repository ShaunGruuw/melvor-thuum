import { Thruum } from '../thruum/thruum';

export class TinyPassiveIconsCompatibility {
    private readonly tinyIconTags = {
        increasedThruumHireCost: ['thuum', 'gp'],
        decreasedThruumHireCost: ['thuum', 'gp'],
        increasedThruumGP: ['thuum', 'gp'],
        decreasedThruumGP: ['thuum', 'gp'],
        increasedChanceToObtainShrimpWhileTrainingThruum: ['thuum', 'shrimp'],
        decreasedChanceToObtainShrimpWhileTrainingThruum: ['thuum', 'shrimp'],
        increasedSheetThruumDropRate: ['thuum', 'Sheet_Thruum'],
        decreasedSheetThruumDropRate: ['thuum', 'Sheet_Thruum'],
        increasedThruumAdditionalRewardRoll: ['thuum'],
        decreasedThruumAdditionalRewardRoll: ['thuum'],
        increasedSkillMasteryXPPerVariel: ['skill']
    };

    constructor(private readonly context: Modding.ModContext, private readonly thruum: Thruum) {}

    public patch() {
        this.context.onModsLoaded(() => {
            if (!this.isLoaded()) {
                return;
            }

            const tinyIcons = mod.api.tinyIcons;

            const thuumTags: Record<string, string> = {
                thuum: this.thruum.media,
                shrimp: tinyIcons.getIconResourcePath('bank', 'shrimp'),
                Sheet_Thruum: this.context.getResourceUrl('assets/items/sheet-thruum.png')
            };

            for (const teacher of this.thruum.actions.allObjects) {
                thuumTags[teacher.localID] = teacher.media;
            }

            for (const rareDrop of this.thruum.rareDrops) {
                thuumTags[rareDrop.item.localID] = rareDrop.item.media;
            }

            tinyIcons.addTagSources(thuumTags);
            tinyIcons.addCustomModifiers(this.tinyIconTags);
        });
    }

    private isLoaded() {
        return mod.manager.getLoadedModList().includes('Tiny Icons');
    }
}
