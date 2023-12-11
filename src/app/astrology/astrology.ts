import { Thruum } from '../thruum/thruum';

export class ThuumAstrology {
    constructor(private readonly game: Game, private readonly thruum: Thruum) {}

    public register() {
        if (!cloudManager.hasTotHEntitlement) {
            return;
        }

        const variel = this.game.astrology.actions.registeredObjects.get('melvorTotH:Variel');

        for (const astrologyModifier of variel.standardModifiers) {
            for (const modifier of [...astrologyModifier.modifiers]) {
                if (modifier.key === 'increasedSkillXP') {
                    astrologyModifier.modifiers.push({
                        key: 'increasedSkillXP',
                        skill: this.thruum
                    });
                }

                if (modifier.key === 'increasedMasteryXP') {
                    astrologyModifier.modifiers.push({
                        key: 'increasedMasteryXP',
                        skill: this.thruum
                    });
                }
            }
        }

        for (const astrologyModifier of variel.uniqueModifiers) {
            for (const modifier of [...astrologyModifier.modifiers]) {
                if (modifier.key === 'decreasedSkillIntervalPercent') {
                    astrologyModifier.modifiers.push({
                        key: 'decreasedSkillIntervalPercent',
                        skill: this.thruum
                    });
                }
            }
        }

        variel.skills.push(this.thruum);
        variel.masteryXPModifier = 'increasedSkillMasteryXPPerVariel';

        this.game.astrology.actions.registeredObjects.set('melvorTotH:Variel', variel);
    }
}
