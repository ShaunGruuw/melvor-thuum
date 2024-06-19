import { Thuum } from '../thuum';
import { ShoutModifier, MasteredShout } from '../thuum.types';

import './shout.scss';

export interface ShoutContext {
    media: string;
    name: string;
    teacherId: string;
}

export function ShoutComponent(thuum: Thuum) {
    let MasteredShout: MasteredShout = undefined;
    // thuum-shout
    return {
        $template: '#thuum-shout',
        shout: undefined as ShoutContext,
        get media() {
            return this.shout?.teacher?.media;
        },
        get name() {
            return this.shout?.teacher?.name;
        },
        get hasShout() {
            return this.shout !== undefined;
        },
        isEnabled: false,
        modifiers: [] as ShoutModifier[],
        currentMasteryLevel: 1,
        essenceIcon: function () {
            return thuum.manager.essenceOfThuumIcon;
        },
        setShout: function (shout: MasteredShout) {
            MasteredShout = shout;
            if (!shout) {
                this.shout = undefined;
            } else {
                this.shout = {
                    instrumentId: shout.teacher?.id,
                    media: shout.teacher?.media,
                    name: shout.teacher?.name
                };
            }
            this.updateCurrentMasteryLevel();
        },
        updateCurrentMasteryLevel: function () {
            if (this.shout) {
                const teacher = this.shout.teacher;
                const teacherRef = thuum.actions.allObjects.find(action => action.id === teacher.id);

                this.currentMasteryLevel = thuum.getMasteryLevel(teacherRef);
            }
        },
        updateEnabled: function (enabled: boolean) {
            this.isEnabled = enabled;
        },
        updateModifiers: function () {
            this.modifiers = [];

            if (this.shout) {
                const teacherRef = thuum.actions.allObjects.find(action => action.id === this.shout.teacherId);

                this.modifiers = thuum.manager.getModifiers(teacherRef);
            }
        }
    };
}
