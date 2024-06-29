import { Thuum } from '../thuum';
import { ShoutModifier, MasteredShout } from '../thuum.types';

import './shout.scss';

export interface ShoutContext {
    media: string;
    name: string;
    shoutId: string;
}

export function ShoutComponent(thuum: Thuum) {
    let MasteredShout: MasteredShout = undefined;
    // thuum-shout
    return {
        $template: '#thuum-shout',
        shout: undefined as ShoutContext,
        get media() {
            return this.shout?.media;
        },
        get name() {
            return this.shout?.name;
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
                    shoutId: shout.teacher?.id,
                    media: shout.teacher?.media,
                    name: shout.teacher?.name
                };
            }
            this.updateCurrentMasteryLevel();
        },
        updateCurrentMasteryLevel: function () {
            if (this.shout) {
                const teacherRef = thuum.actions.allObjects.find(action => action.id === this.shout.shoutId);

                this.currentMasteryLevel = thuum.getMasteryLevel(teacherRef);
            }
        },
        updateEnabled: function (enabled: boolean) {
            this.isEnabled = enabled;
        },
        updateModifiers: function () {
            this.modifiers = [];

            if (this.shout) {
                const teacherRef = thuum.actions.allObjects.find(action => action.id === this.shout.shoutId);
                console.log(this.shout, teacherRef, thuum.manager.getModifiers(teacherRef))
                this.modifiers = thuum.manager.getModifiers(teacherRef);
            }
        }
    };
}
