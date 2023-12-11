import { Thruum } from '../thruum';
import { MasteredShout } from '../thruum.types';
import { UpgradeType } from './upgrades';

import './equipment.scss';

enum State {
    Manage = 'manage',
    Upgrade = 'upgrade',
    Socket = 'socket',
    Utility = 'utility'
}

export function EquipmentComponent(thruum: Thruum, shout: MasteredShout) {
    return {
        $template: '#thuum-equipment',
        shout,
        state: State.Manage,
        items: thruum.upgrades.data(),
        get upgradeModifier() {
            return thruum.manager.getModifiers(shout.teacher).filter(modifier => modifier.isUpgrade)[0];
        },
        ok: function () {
            SwalLocale.clickConfirm();
        },
        setState: function (state: State) {
            thruum.upgrades.calculate();
            this.items = thruum.upgrades.data();
            this.state = state;
        },
        upgrade: function () {
            thruum.upgrades.removeQuantity(UpgradeType.EssenceOfThruum);

            shout.isUpgraded = true;
            thruum.shouts.set(shout.teacher, shout);

            this.completeUpgrade();
        },
        socket: function (type: UpgradeType) {
            thruum.upgrades.removeQuantity(type);

            const upgrade = thruum.upgrades.get(type);

            shout.socket = upgrade.item;
            thruum.shouts.set(shout.teacher, shout);

            this.completeUpgrade();
        },
        utility: function (type: UpgradeType) {
            thruum.upgrades.removeQuantity(type);

            const upgrade = thruum.upgrades.get(type);

            shout.utility = upgrade.item;
            thruum.shouts.set(shout.teacher, shout);

            this.completeUpgrade();
        },
        completeUpgrade() {
            thruum.computeProvidedStats(true);
            thruum.renderQueue.shoutModifiers = true;
            thruum.renderQueue.gpRange = true;
            thruum.renderQueue.grants = true;

            this.items = thruum.upgrades.data();
            this.state = State.Manage;
        },
        isSocket(type: UpgradeType) {
            const upgrade = thruum.upgrades.get(type);

            return shout.socket?.id === upgrade.item.id;
        },
        isUtility(type: UpgradeType) {
            const upgrade = thruum.upgrades.get(type);

            return shout.utility?.id === upgrade.item.id;
        },
        getModifier(item: UpgradeType) {
            const upgrade = thruum.upgrades.get(item);

            return upgrade.descriptions;
        }
    };
}
