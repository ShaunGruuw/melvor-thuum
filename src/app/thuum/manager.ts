import { Thuum } from './thuum';
import { ShoutModifier, Teacher } from './thuum.types';

export class ThuumManager {
    public get elements() {
        const fragment = new DocumentFragment();

        fragment.append(getTemplateNode('thuum'));

        return [...Array.from(fragment.children)];
    }

    public get essenceOfThuumIcon() {
        return this.game.items.getObjectByID('namespace_thuum:Dragon_Soul')?.media;
    }

    constructor(private readonly thuum: Thuum, private readonly game: Game) { }

    /** Gets modifier metadata. */
    public getModifiers(teacher: Teacher) {
        if (!teacher.id) {
            return [] as ShoutModifier[];
        }

        return teacher.modifiers(this.thuum.settings.modifierType).map(modifier => {
            // @ts-ignore // TODO: TYPES
            // let description = modifier.describePlain();
            let description: any[] = []
            // @ts-ignore // TODO: TYPES
            for (let index = 0; index < modifier.modifiers.length; index++) {
                // @ts-ignore // TODO: TYPES
                description.push(modifier.modifiers[index].getDescription())
            }
            return {
                description,
                isActive: this.isModifierActive(teacher, modifier),
                level: modifier.level
            } as ShoutModifier;
        });
    }

    /** Gets modifiers and constructs object needed to apply the modifier to the player. */
    public getModifiersForApplication(teacher: Teacher) {
        if (this.thuum.level < teacher.level) {
            return [];
        }

        return teacher
            .modifiers(this.thuum.settings.modifierType).filter(modifier => this.isModifierActive(teacher, modifier));
    }

    public getGoldToTake(teacher: Teacher) {
        const component = this.thuum.userInterface.teachers.get(teacher);
        const minRoll = component.getMinGPRoll();
        const maxRoll = component.getMaxGPRoll();

        let gpToTake = rollInteger(minRoll, maxRoll);
        let gpMultiplier = 1;

        const increasedGPModifier = component.getGPModifier();

        gpMultiplier *= 1 + increasedGPModifier / 100;
        // @ts-ignore // TODO: TYPES
        gpToTake = Math.floor(gpMultiplier * gpToTake + this.game.modifiers.getValue('melvorD:flatCurrencyGain', this.game.gp.modQuery));
        if (typeof gpToTake !== 'number') {
            gpToTake = 0
        }
        // @ts-ignore // TODO: TYPES
        return gpToTake * -1;
    }

    public getGoldToAward(teacher: Teacher) {
        const component = this.thuum.userInterface.teachers.get(teacher);
        const minRoll = component.getMinGPRoll();
        const maxRoll = component.getMaxGPRoll();

        let gpToAdd = rollInteger(minRoll, maxRoll);
        let gpMultiplier = 1;

        const increasedGPModifier = component.getGPModifier();

        gpMultiplier *= 1 + increasedGPModifier / 100;
        // @ts-ignore // TODO: TYPES
        gpToAdd = Math.floor(gpMultiplier * gpToAdd + this.game.modifiers.getValue('melvorD:flatCurrencyGain', this.game.gp.modQuery))

        return gpToAdd;
    }

    public calculateEquipCost(teacher: Teacher) {
        const MasterCostMap = [
            this.thuum.settings.shoutEquipCostOne || 1000,
            this.thuum.settings.shoutEquipCostTwo || 10000,
            this.thuum.settings.shoutEquipCostThree || 100000,
            this.thuum.settings.shoutEquipCostFour || 10000000,
            this.thuum.settings.shoutEquipCostFive || 10000000
        ];
        const teacherRef = this.thuum.actions.find(action => action.id === teacher.id);
        const unlocked = this.thuum.masteriesUnlocked.get(teacherRef).filter(isUnlocked => isUnlocked).length;

        return { costs: MasterCostMap, unlocked };
    }

    public getEquipCostModifier(teacher: Teacher) {
        // @ts-ignore // TODO: TYPES
        let modifier = this.game.modifiers.getValue('namespace_thuum:thuumEquipCost', this.thuum.getActionModifierQuery(teacher));
        return Math.max(modifier, -95);
    }

    private isModifierActive(teacher: Teacher, modifier: StatObject) {
        teacher = this.thuum.actions.find(action => action.id === teacher.id);

        let unlockedMasteries = this.thuum.masteriesUnlocked.get(teacher);

        const validModifierLevels = teacher
            .modifiers(this.thuum.settings.modifierType)
            .filter((modifier, index) => unlockedMasteries[index])
            .map(modifier => modifier.level);

        return validModifierLevels.includes(modifier.level);
    }
}
