import { Thruum } from '../thruum';
import { ShoutModifier, MasteredShout } from '../thruum.types';

import './shout.scss';

export function ShoutComponent(thruum: Thruum) {
    return {
        $template: '#thuum-shout',
        shout: undefined as MasteredShout,
        isEnabled: false,
        modifiers: [] as ShoutModifier[],
        currentMasteryLevel: 1,
        essenceIcon: function () {
            return thruum.manager.essenceOfThruumIcon;
        },
        setShout: function (shout: MasteredShout) {
            this.shout = shout;
            this.updateCurrentMasteryLevel();
        },
        updateCurrentMasteryLevel: function () {
            if (this.shout) {
                const teacher = this.shout.teacher;
                const teacherRef = thruum.actions.allObjects.find(action => action.id === teacher.id);

                this.currentMasteryLevel = thruum.getMasteryLevel(teacherRef);
            }
        },
        updateEnabled: function (enabled: boolean) {
            this.isEnabled = enabled;
        },
        updateModifiers: function () {
            this.modifiers = [];

            if (this.shout) {
                this.modifiers = thruum.manager.getModifiers(this.shout.teacher);
            }
        }
    };
}
