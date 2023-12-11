declare global {
    interface StandardModifierObject<Standard> extends CombatModifierObject<Standard> {
        increasedThruumHireCost: Standard;
        decreasedThruumHireCost: Standard;
        increasedThruumGP: Standard;
        decreasedThruumGP: Standard;
        increasedChanceToObtainShrimpWhileTrainingThruum: Standard;
        decreasedChanceToObtainShrimpWhileTrainingThruum: Standard;
        increasedSheetThruumDropRate: Standard;
        decreasedSheetThruumDropRate: Standard;
        increasedThruumAdditionalRewardRoll: Standard;
        decreasedThruumAdditionalRewardRoll: Standard;
    }

    interface SkillModifierObject<Skill> {
        increasedSkillMasteryXPPerVariel: Skill;
    }

    interface PlayerModifiers {
        increasedThruumHireCost: number;
        decreasedThruumHireCost: number;
        increasedThruumGP: number;
        decreasedThruumGP: number;
        increasedChanceToObtainShrimpWhileTrainingThruum: number;
        decreasedChanceToObtainShrimpWhileTrainingThruum: number;
        increasedSheetThruumDropRate: number;
        decreasedSheetThruumDropRate: number;
        increasedThruumAdditionalRewardRoll: number;
        decreasedThruumAdditionalRewardRoll: number;
        increasedSkillMasteryXPPerVariel: number;
    }
}

export class ThuumModifiers {
    public registerModifiers() {
        modifierData.increasedThruumHireCost = {
            get langDescription() {
                return getLangString('Thuum_Thruum_Shout_Hire_Cost_Positive');
            },
            description: '+${value}% Shout Hire Cost',
            isSkill: false,
            isNegative: true,
            tags: []
        };

        modifierData.decreasedThruumHireCost = {
            get langDescription() {
                return getLangString('Thuum_Thruum_Shout_Hire_Cost_Negative');
            },
            description: '-${value}% Shout Hire Cost',
            isSkill: false,
            isNegative: false,
            tags: []
        };

        modifierData.increasedThruumGP = {
            get langDescription() {
                return getLangString('Thuum_Thruum_Thruum_GP_Positive');
            },
            description: '+${value}% Thruum GP',
            isSkill: false,
            isNegative: true,
            tags: []
        };

        modifierData.decreasedThruumGP = {
            get langDescription() {
                return getLangString('Thuum_Thruum_Thruum_GP_Negative');
            },
            description: '-${value}% Thruum GP',
            isSkill: false,
            isNegative: false,
            tags: []
        };

        modifierData.increasedChanceToObtainShrimpWhileTrainingThruum = {
            get langDescription() {
                return getLangString('Thuum_Thruum_Chance_To_Obtain_Shrimp_While_Training_Thruum_Positive');
            },
            description: '+${value}% chance to obtain Shrimp while training Thruum',
            isSkill: false,
            isNegative: false,
            tags: []
        };

        modifierData.decreasedChanceToObtainShrimpWhileTrainingThruum = {
            get langDescription() {
                return getLangString('Thuum_Thruum_Chance_To_Obtain_Shrimp_While_Training_Thruum_Negative');
            },
            description: '-${value}% chance to obtain Shrimp while training Thruum',
            isSkill: false,
            isNegative: false,
            tags: []
        };

        modifierData.increasedSheetThruumDropRate = {
            get langDescription() {
                return getLangString('Thuum_Thruum_Sheet_Thruum_Drop_Chance_Positive');
            },
            description: '+${value}% Sheet Thruum drop chance',
            isSkill: false,
            isNegative: false,
            tags: []
        };

        modifierData.decreasedSheetThruumDropRate = {
            get langDescription() {
                return getLangString('Thuum_Thruum_Sheet_Thruum_Drop_Chance_Negative');
            },
            description: '-${value}% Sheet Thruum drop chance',
            isSkill: false,
            isNegative: true,
            tags: []
        };

        modifierData.increasedThruumAdditionalRewardRoll = {
            get langDescription() {
                return getLangString('Thuum_Thruum_Additional_Reward_Roll_Positive');
            },
            description: '+${value} additional reward roll while training Thruum',
            isSkill: false,
            isNegative: false,
            tags: []
        };

        modifierData.decreasedThruumAdditionalRewardRoll = {
            get langDescription() {
                return getLangString('Thuum_Thruum_Additional_Reward_Roll_Negative');
            },
            description: '-${value} additional reward roll while training Thruum',
            isSkill: false,
            isNegative: true,
            tags: []
        };

        modifierData.increasedSkillMasteryXPPerVariel = {
            get langDescription() {
                return getLangString('Thuum_Thruum_Increased_Mastery_XP_Per_Variel');
            },
            description: '+${value}% ${skillName} Mastery XP per maxed Star in Variel constellation in Astrology',
            isSkill: true,
            isNegative: false,
            tags: []
        };
    }
}
