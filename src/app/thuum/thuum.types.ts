import { ModifierType } from './settings';

export interface ShoutModifier {
    description: any[];
    isActive: boolean;
    level: number;
}

export interface UpgradeData {
    itemId: string;
    modifiers: StatObject[];
}

export class UpgradeModifier {
    itemId: string;
    modifiers: StatObject[];

    constructor(private readonly data: UpgradeData, private readonly game: Game) {
        this.itemId = this.data.itemId;
        // @ts-ignore
        this.modifiers = new StatObject(this.data, this.game, `${UpgradeModifier.name} with id ${this.itemId}`);
        // @ts-ignore
        this.modifiers.registerSoftDependencies(this.data, this.game);
    }
}

export interface ThuumSkillData extends MasterySkillData {
    teachers: TeacherData[];
    upgrades: UpgradeData[];
}

export interface TeacherData extends BasicSkillRecipeData {
    name: string;
    media: string;
    baseInterval: number;
    maxGP: number;
    standardModifiers: StatObject[];
    // hardcoreModifiers: StatObject[];
    skills: string[];
}

export interface MasteredShout {
    teacher: Teacher;
    slot: number;
}

export class Teacher extends BasicSkillRecipe {
    baseInterval: number;
    maxGP: number;
    skills: string[];
    private standardModifiers: StatObject[];
    // private hardcoreModifiers: StatObject[];

    public get name() {
        return getLangString(`Thuum_Thuum_Teacher_${this.localID}`);
    }

    public get media() {
        return this.getMediaURL(this.data.media);
    }

    public modifiers(type: ModifierType) {
        switch (type) {
            case ModifierType.Standard:
                return this.standardModifiers;
            // case ModifierType.Hardcore:
            //     return this.standardModifiers;
        }
    }

    constructor(namespace: DataNamespace, private readonly data: TeacherData, game: Game) {
        super(namespace, data, game);

        this.baseInterval = data.baseInterval;
        this.maxGP = data.maxGP;

        this.baseInterval = data.baseInterval;
        this.maxGP = data.maxGP;
        this.standardModifiers = data.standardModifiers.map(modifier => {
            // @ts-ignore because this is for the old json's.
            if (modifier.value) {
                const newModifier = {
                    level: modifier.level,
                        modifiers: {
                            "increasedMasteryXP": [
                                {
                                    "value": 5,
                                    "skillID": "melvorD:Firemaking"
                                }
                            ]
                        }
                }
                const stats = new StatObject(newModifier, game, `${Teacher.name}`);
                stats.level = modifier.level;
                return stats;
            } else {
                // @ts-ignore // new json 
                const stats = new StatObject(modifier, game, `${Teacher.name}`);
                stats.level = modifier.level;
                return stats;
            }
        });
        // this.hardcoreModifiers = data.hardcoreModifiers.map(modifier => {
        //     const stats = new StatObject(modifier, game, `${Teacher.name}`);
        //     stats.level = modifier.level;
        //     return stats;
        // });
        this.skills = data.skills;
    }
}
