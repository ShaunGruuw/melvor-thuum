export enum ChangeType {
    ShoutHireCost,
    Modifiers
}

export enum ModifierType {
    Standard = 'standard',
    Hardcore = 'hardcore'
}

export type ShoutHireCostCallback = (value: number, previousValue: number) => void;
export type ModifierCallback = (value: ModifierType, previousValue: ModifierType) => void;

export class ThruumSettings {
    private shoutHireCostCallbacks: ShoutHireCostCallback[] = [];
    private modifierCallbacks: ModifierCallback[] = [];

    constructor(private readonly context: Modding.ModContext) {}

    public init() {
        const that = this;

        this.context.settings.section(getLangString('Thuum_Thruum_Settings_Shout_Hire_Cost')).add([
            {
                type: 'number',
                name: 'one-mastery',
                label: getLangString('Thuum_Thruum_Settings_Base_Shout_Hire_Cost_1'),
                hint: '',
                default: 10000,
                min: 100,
                max: 999999999999,
                onChange(value: number, previousValue: number) {
                    if (value < 100) {
                        return getLangString('Thuum_Thruum_Settings_Must_Be_Larger_Then');
                    }

                    if (value > 999999999999) {
                        return getLangString('Thuum_Thruum_Settings_Must_Be_Smaller_Then');
                    }

                    that.emitChange(ChangeType.ShoutHireCost, value, previousValue);
                }
            } as Modding.Settings.NumberConfig,
            {
                type: 'number',
                name: 'two-mastery',
                label: getLangString('Thuum_Thruum_Settings_Base_Shout_Hire_Cost_2'),
                hint: '',
                default: 100000,
                min: 100,
                max: 999999999999,
                onChange(value: number, previousValue: number) {
                    if (value < 100) {
                        return getLangString('Thuum_Thruum_Settings_Must_Be_Larger_Then');
                    }

                    if (value > 999999999999) {
                        return getLangString('Thuum_Thruum_Settings_Must_Be_Smaller_Then');
                    }

                    that.emitChange(ChangeType.ShoutHireCost, value, previousValue);
                }
            } as Modding.Settings.NumberConfig,
            {
                type: 'number',
                name: 'three-mastery',
                label: getLangString('Thuum_Thruum_Settings_Base_Shout_Hire_Cost_3'),
                hint: '',
                default: 1000000,
                min: 100,
                max: 999999999999,
                onChange(value: number, previousValue: number) {
                    if (value < 100) {
                        return getLangString('Thuum_Thruum_Settings_Must_Be_Larger_Then');
                    }

                    if (value > 999999999999) {
                        return getLangString('Thuum_Thruum_Settings_Must_Be_Smaller_Then');
                    }

                    that.emitChange(ChangeType.ShoutHireCost, value, previousValue);
                }
            } as Modding.Settings.NumberConfig,
            {
                type: 'number',
                name: 'four-mastery',
                label: getLangString('Thuum_Thruum_Settings_Base_Shout_Hire_Cost_4'),
                hint: '',
                default: 10000000,
                min: 100,
                max: 999999999999,
                onChange(value: number, previousValue: number) {
                    if (value < 100) {
                        return getLangString('Thuum_Thruum_Settings_Must_Be_Larger_Then');
                    }

                    if (value > 999999999999) {
                        return getLangString('Thuum_Thruum_Settings_Must_Be_Smaller_Then');
                    }

                    that.emitChange(ChangeType.ShoutHireCost, value, previousValue);
                }
            } as Modding.Settings.NumberConfig
        ]);

        this.context.settings.section(getLangString('Thuum_Thruum_Settings_Modifiers')).add({
            type: 'dropdown',
            name: 'modifiers',
            label: getLangString('Thuum_Thruum_Settings_Modifier_Scale'),
            hint: '',
            default: ModifierType.Standard,
            options: [
                {
                    value: ModifierType.Standard,
                    display: getLangString('Thuum_Thruum_Settings_Modifier_Standard')
                },
                {
                    value: ModifierType.Hardcore,
                    display: getLangString('Thuum_Thruum_Settings_Modifier_Hardcore')
                }
            ],
            onChange(value, previousValue) {
                that.emitChange(ChangeType.Modifiers, value, previousValue);
            }
        } as Modding.Settings.DropdownConfig);
    }

    public get shoutHireCostOne() {
        return this.context.settings
            .section(getLangString('Thuum_Thruum_Settings_Shout_Hire_Cost'))
            .get('one-mastery') as number;
    }

    public get shoutHireCostTwo() {
        return this.context.settings
            .section(getLangString('Thuum_Thruum_Settings_Shout_Hire_Cost'))
            .get('two-mastery') as number;
    }

    public get shoutHireCostThree() {
        return this.context.settings
            .section(getLangString('Thuum_Thruum_Settings_Shout_Hire_Cost'))
            .get('three-mastery') as number;
    }

    public get shoutHireCostFour() {
        return this.context.settings
            .section(getLangString('Thuum_Thruum_Settings_Shout_Hire_Cost'))
            .get('four-mastery') as number;
    }

    public get modifierType() {
        return this.context.settings
            .section(getLangString('Thuum_Thruum_Settings_Modifiers'))
            .get('modifiers') as ModifierType;
    }

    public onChange(type: ChangeType.ShoutHireCost, callback: ShoutHireCostCallback): void;
    public onChange(type: ChangeType.Modifiers, callback: ModifierCallback): void;
    public onChange(type: ChangeType, callback: ShoutHireCostCallback | ModifierCallback) {
        switch (type) {
            case ChangeType.ShoutHireCost:
                this.shoutHireCostCallbacks.push(callback as ShoutHireCostCallback);
                break;
            case ChangeType.Modifiers:
                this.modifierCallbacks.push(callback as ModifierCallback);
                break;
        }
    }

    private emitChange(type: ChangeType, value: unknown, previousValue: unknown) {
        switch (type) {
            case ChangeType.ShoutHireCost:
                for (const callback of this.shoutHireCostCallbacks) {
                    try {
                        callback(value as number, previousValue as number);
                    } catch {}
                }
                break;
            case ChangeType.Modifiers:
                for (const callback of this.modifierCallbacks) {
                    try {
                        callback(value as ModifierType, previousValue as ModifierType);
                    } catch {}
                }
                break;
        }
    }
}
