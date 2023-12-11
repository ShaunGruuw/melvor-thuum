import { Thruum } from '../thruum/thruum';

export class ThuumAgility {
    constructor(private readonly game: Game, private readonly thruum: Thruum) {}

    public register() {
        const waterfall = this.game.agility.actions.registeredObjects.get('melvorF:Waterfall');

        waterfall.modifiers.decreasedSkillIntervalPercent.push({
            skill: this.thruum,
            value: 5
        });

        waterfall.modifiers.increasedSkillXP.push({
            skill: this.thruum,
            value: 5
        });

        waterfall.modifiers.increasedMasteryXP.push({
            skill: this.thruum,
            value: 5
        });

        this.game.agility.actions.registeredObjects.set('melvorF:Waterfall', waterfall);
    }
}
