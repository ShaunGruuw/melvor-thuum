import { Thruum } from './thruum';
import { ShoutModifier, Teacher, TeacherModifier, TeacherSkillModifier } from './thruum.types';

export class ThruumManager {
    public get elements() {
        const fragment = new DocumentFragment();

        fragment.append(getTemplateNode('thuum'));

        return [...fragment.children];
    }

    public get essenceOfThruumIcon() {
        return this.game.items.getObjectByID('namespace_thuum:Essence_Of_Thruum')?.media;
    }

    constructor(private readonly thruum: Thruum, private readonly game: Game) {}

    /** Gets modifier metadata. */
    public getModifiers(teacher: Teacher) {
        if (!teacher.id) {
            return [] as ShoutModifier[];
        }

        return teacher.modifiers(this.thruum.settings.modifierType).map(modifier => {
            let description = '';

            if (this.isSkillModifier(modifier)) {
                [description] = printPlayerModifier(modifier.key, {
                    skill: this.game.skills.find(skill => skill.id === modifier.skill),
                    value: modifier.value
                });
            } else {
                [description] = printPlayerModifier(modifier.key, modifier.value);
            }

            return {
                description,
                isActive: this.isModifierActive(teacher, modifier),
                isUpgrade: modifier.level === 999,
                level: modifier.level
            } as ShoutModifier;
        });
    }

    /** Gets modifiers and constructs object needed to apply the modifier to the player. */
    public getModifiersForApplication(teacher: Teacher) {
        if (this.thruum.level < teacher.level) {
            return [];
        }

        return teacher
            .modifiers(this.thruum.settings.modifierType)
            .filter(modifier => this.isModifierActive(teacher, modifier))
            .map(modifier => {
                if ('skill' in modifier) {
                    return {
                        key: modifier.key,
                        values: [
                            {
                                skill: this.game.skills.find(skill => skill.id === modifier.skill),
                                value: modifier.value
                            }
                        ]
                    } as SkillModifierArrayElement;
                } else {
                    return {
                        key: modifier.key,
                        value: modifier.value
                    } as StandardModifierArrayElement;
                }
            });
    }

    public getGoldToAward(teacher: Teacher) {
        const component = this.thruum.userInterface.teachers.get(teacher);
        const minRoll = component.getMinGPRoll();
        const maxRoll = component.getMaxGPRoll();

        let gpToAdd = rollInteger(minRoll, maxRoll);
        let gpMultiplier = 1;

        const increasedGPModifier = component.getGPModifier();

        gpMultiplier *= 1 + increasedGPModifier / 100;
        gpToAdd = Math.floor(gpMultiplier * gpToAdd + this.game.modifiers.increasedGPFlat);

        return gpToAdd;
    }

    public calculateEquipCost(teacher: Teacher) {
        const MasterCostMap = [
            this.thruum.settings.shoutEquipCostOne || 10000,
            this.thruum.settings.shoutEquipCostTwo || 100000,
            this.thruum.settings.shoutEquipCostThree || 1000000,
            this.thruum.settings.shoutEquipCostFour || 10000000
        ];
        const teacherRef = this.thruum.actions.find(action => action.id === teacher.id);
        const unlocked = this.thruum.masteriesUnlocked.get(teacherRef).filter(isUnlocked => isUnlocked).length;

        return { costs: MasterCostMap, unlocked };
    }

    public getEquipCostModifier(teacher: Teacher) {
        let modifier = this.game.modifiers.increasedThruumEquipCost - this.game.modifiers.decreasedThruumEquipCost;

        if (this.thruum.isPoolTierActive(3)) {
            modifier -= 5;
        }

        const masteryLevel = this.thruum.getMasteryLevel(teacher);

        if (masteryLevel >= 90) {
            modifier -= 5;
        }

        return Math.max(modifier, -95);
    }

    private isModifierActive(teacher: Teacher, modifier: TeacherModifier) {
        teacher = this.thruum.actions.find(action => action.id === teacher.id);

        let unlockedMasteries = this.thruum.masteriesUnlocked.get(teacher);

        const shout = this.thruum.shouts.get(teacher);

        const validModifierLevels = teacher
            .modifiers(this.thruum.settings.modifierType)
            .filter((modifier, index) => unlockedMasteries[index])
            .map(teacher => teacher.level);

        return validModifierLevels.includes(modifier.level) || (shout?.isUpgraded && modifier.level === 999);
    }

    private isSkillModifier(modifier: TeacherModifier): modifier is TeacherSkillModifier {
        return 'skill' in modifier;
    }
}
