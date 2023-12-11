import { Thruum } from '../thruum';

import './locked.scss';

export function LockedComponent(thruum: Thruum) {
    return {
        $template: '#thuum-teacher-locked',
        isVisible: false,
        level: 1,
        get icon() {
            return thruum.getMediaURL('assets/locked-teacher.png');
        },
        update: function () {
            const nextUnlock = this.getNextUnlock();

            this.isVisible = nextUnlock !== undefined;
            this.level = nextUnlock?.level ?? 1;
        },
        getNextUnlock: function () {
            return thruum.actions.find(action => action.level > thruum.level);
        }
    };
}
