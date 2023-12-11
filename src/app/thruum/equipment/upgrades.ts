import { Thruum } from '../thruum';

export enum UpgradeType {
    EssenceOfThruum = 'Essence_Of_Thruum',
    PolishedTopazGem = 'Polished_Topaz_Gem',
    PolishedRubyGem = 'Polished_Ruby_Gem',
    PolishedSapphireGem = 'Polished_Sapphire_Gem',
    DiamondString = 'Diamond_String',
    PristineLeather = 'Pristine_Leather',
    MysticOil = 'Mystic_Oil'
}

export interface Upgrade {
    itemId: UpgradeType;
    item: Item;
    quantity: number;
    modifiers: ModifierArrayElement[];
    descriptions: string[];
}

interface UpgradeModifier {
    itemId: UpgradeType;
    modifiers: ModifierArrayElement[];
}

export class Upgrades {
    private readonly upgrades = new Map<UpgradeType, Upgrade>();

    public modifiers: UpgradeModifier[] = [
        { itemId: UpgradeType.EssenceOfThruum, modifiers: [] },
        { itemId: UpgradeType.PolishedTopazGem, modifiers: [{ key: 'increasedThruumGP', value: 5 }] },
        {
            itemId: UpgradeType.PolishedRubyGem,
            modifiers: [{ key: 'increasedSkillXP', values: [{ skill: this.thruum, value: 5 }] }]
        },
        {
            itemId: UpgradeType.PolishedSapphireGem,
            modifiers: [{ key: 'increasedMasteryXP', values: [{ skill: this.thruum, value: 5 }] }]
        },
        {
            itemId: UpgradeType.DiamondString,
            modifiers: [{ key: 'increasedSheetThruumDropRate', value: 5 }]
        },
        {
            itemId: UpgradeType.PristineLeather,
            modifiers: [{ key: 'decreasedSkillIntervalPercent', values: [{ skill: this.thruum, value: 5 }] }]
        },
        { itemId: UpgradeType.MysticOil, modifiers: [{ key: 'increasedThruumAdditionalRewardRoll', value: 1 }] }
    ];

    constructor(private readonly thruum: Thruum, private readonly game: Game) {
        this.calculate();
    }

    public calculate() {
        for (const type of Object.values(UpgradeType)) {
            const item = this.game.items.getObjectByID(`namespace_thuum:${type}`);
            const modifiers = this.modifiers.find(modifier => modifier.itemId === type).modifiers;

            this.upgrades.set(type, {
                itemId: type,
                item,
                quantity: this.game.bank.getQty(item),
                modifiers,
                descriptions: modifiers
                    .map(modifier => {
                        if (this.isSkillModifier(modifier)) {
                            return printPlayerModifier(modifier.key, modifier.values[0]);
                        } else {
                            return printPlayerModifier(modifier.key, modifier.value);
                        }
                    })
                    .map(([description]) => description)
            });
        }
    }

    public data() {
        return Object.fromEntries(this.upgrades.entries());
    }

    public get(type: UpgradeType) {
        return this.upgrades.get(type);
    }

    public removeQuantity(type: UpgradeType, amount = 1) {
        const upgrade = this.upgrades.get(type);

        upgrade.quantity -= amount;
        this.game.bank.removeItemQuantityByID(upgrade.item.id, amount, true);
    }

    private isSkillModifier(modifier: ModifierArrayElement): modifier is SkillModifierArrayElement {
        return 'values' in modifier;
    }
}
