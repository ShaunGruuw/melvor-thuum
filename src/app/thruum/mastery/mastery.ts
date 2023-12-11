import { Thruum } from '../thruum';
import { ShoutModifier, Teacher } from '../thruum.types';

import './mastery.scss';

enum State {
    View = 'view',
    Unlock = 'unlock'
}

interface EssenceOfThruum {
    item: AnyItem;
    quantity: number;
}

export function MasteryComponent(game: Game, thruum: Thruum, teacher: Teacher) {
    return {
        $template: '#thuum-mastery',
        teacher,
        state: State.View,
        modifier: undefined as ShoutModifier,
        essenceOfThruum: undefined as EssenceOfThruum,
        unlockGPCost: 0,
        get unlockableModifiers() {
            const modifiers = thruum.manager.getModifiers(teacher);

            return modifiers.filter(modifier => modifier.level < 100);
        },
        get currentMasteryLevel() {
            return thruum.getMasteryLevel(teacher);
        },
        mounted: function () {
            this.updateCosts();
        },
        isUnlocked: function (index: number) {
            const teacherRef = thruum.actions.find(action => action.id === teacher.id);
            const unlockedMasteries = thruum.masteriesUnlocked.get(teacherRef);

            return unlockedMasteries[index];
        },
        canUnlock: function (modifier: ShoutModifier) {
            const masteryLevel = thruum.getMasteryLevel(teacher);

            return masteryLevel >= modifier.level;
        },
        getNextHireCost: function () {
            const { costs, unlocked } = thruum.manager.calculateHireCost(teacher);

            return formatNumber(costs[unlocked]);
        },
        ok: function () {
            SwalLocale.clickConfirm();
        },
        setState: function (state: State, modifier: ShoutModifier | undefined) {
            this.state = state;
            this.modifier = modifier;

            if (!this.modifier) {
                this.unlockGPCost = 100000;
                return;
            }

            switch (this.modifier.level) {
                case 40:
                default:
                    this.unlockGPCost = 100000;
                    break;
                case 75:
                    this.unlockGPCost = 1000000;
                    break;
                case 99:
                    this.unlockGPCost = 10000000;
                    break;
            }
        },
        unlock: function (modifier: ShoutModifier) {
            game.bank.removeItemQuantityByID('namespace_thuum:Essence_Of_Thruum', 1, true);
            game.gp.remove(this.unlockGPCost);

            const teacherRef = thruum.actions.find(action => action.id === teacher.id);
            const index = teacherRef
                .modifiers(thruum.settings.modifierType)
                .findIndex(mod => mod.level === modifier.level);
            const unlockedMasteries = thruum.masteriesUnlocked.get(teacherRef);

            unlockedMasteries[index] = true;

            thruum.masteriesUnlocked.set(teacherRef, unlockedMasteries);

            this.updateCosts();
            this.completeUpgrade();
        },
        updateCosts: function () {
            const item = game.items.getObjectByID(`namespace_thuum:Essence_Of_Thruum`);

            this.essenceOfThruum = {
                item,
                quantity: game.bank.getQty(item)
            };
        },
        completeUpgrade: function () {
            thruum.computeProvidedStats(true);
            thruum.renderQueue.shoutModifiers = true;
            thruum.renderQueue.gpRange = true;
            thruum.renderQueue.grants = true;

            this.state = State.View;
        }
    };
}
