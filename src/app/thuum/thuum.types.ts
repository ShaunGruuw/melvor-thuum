import { ModifierType } from './settings';

export interface ShoutModifier {
    description: string;
    isActive: boolean;
    level: number;
}

export interface UpgradeData {
    itemId: string;
    modifiers: TeacherModifier[];
}

export class UpgradeModifier {
    itemId: string;
    // @ts-ignore // TODO: TYPES
    modifiers: StatObject[];

    constructor(private readonly data: UpgradeData, private readonly game: Game) {
        this.itemId = this.data.itemId;
        // @ts-ignore // TODO: TYPES
        this.modifiers = new StatObject(this.data, this.game, `${UpgradeModifier.name} with id ${this.itemId}`);

        // @ts-ignore // TODO: TYPES
        this.modifiers.registerSoftDependencies(this.data, this.game);
    }
}

export interface TeacherModifier {
    level: number;
    modifiers?: {};
    enemyModifiers?: {};
    conditionalModifiers?: [];
    combatEffects?: [];
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
    // @ts-ignore 
    standardModifiers: StatObject[];
    // @ts-ignore 
    hardcoreModifiers: StatObject[];
    skills: string[];
}

export interface MasteredShout {
    teacher: Teacher;
    slot: number;
    socket: Item;
    utility: Item;
}

export class Teacher extends BasicSkillRecipe {
    baseInterval: number;
    maxGP: number;
    skills: string[];

    private standardModifiers: TeacherModifier[];
    private hardcoreModifiers: TeacherModifier[];

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
            case ModifierType.Hardcore:
                return this.hardcoreModifiers;
        }
    }

    constructor(namespace: DataNamespace, private readonly data: TeacherData) {
        super(namespace, data);

        this.baseInterval = data.baseInterval;
        this.maxGP = data.maxGP;
        this.standardModifiers = data.standardModifiers;
        this.hardcoreModifiers = data.hardcoreModifiers;
        this.skills = data.skills;
    }
}
