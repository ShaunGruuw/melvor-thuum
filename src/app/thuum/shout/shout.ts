import { Thuum } from '../thuum';
import { ShoutModifier, MasteredShout } from '../thuum.types';

import './shout.scss';

export function ShoutComponent(thuum: Thuum) {
    let shout: MasteredShout = undefined;

    return {
        get media() {
            return shout?.teacher?.media;
        },
        get name() {
            return shout?.teacher?.name;
        },
        get hasBard() {
            return shout !== undefined;
        },
        get socket() {
            return shout?.socket !== undefined;
        },
        get utility() {
            return shout?.utility !== undefined;
        },
        $template: '#thuum-shout',
        isEnabled: false,
        modifiers: [] as ShoutModifier[],
        currentMasteryLevel: 1,
        essenceIcon: function () {
            return thuum.manager.essenceOfThuumIcon;
        },
        setShout: function (shout: MasteredShout) {
            shout = shout;
            this.updateCurrentMasteryLevel();
        },
        updateCurrentMasteryLevel: function () {
            if (shout) {
                const teacher = shout.teacher;
                const teacherRef = thuum.actions.allObjects.find(action => action.id === teacher.id);

                this.currentMasteryLevel = thuum.getMasteryLevel(teacherRef);
            }
        },
        updateEnabled: function (enabled: boolean) {
            this.isEnabled = enabled;
        },
        updateModifiers: function () {
            this.modifiers = [];

            if (shout) {
                this.modifiers = thuum.manager.getModifiers(shout.teacher);
            }
        }
    };
}
