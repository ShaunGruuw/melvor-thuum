import { Thruum } from '../thruum';
import { MasteredShout } from '../thruum.types';
import { DecodeVersion } from './version.base';

export class Version0 implements DecodeVersion {
    constructor(private readonly thruum: Thruum) {}

    public decode(reader: SaveWriter) {
        if (reader.getBoolean()) {
            const teacher = reader.getNamespacedObject(this.thruum.actions);

            if (typeof teacher === 'string' || teacher.level > this.thruum.level) {
                this.thruum.shouldResetAction = true;
            } else {
                this.thruum.activeTeacher = teacher;
            }
        }

        if (reader.getBoolean()) {
            const teacher = reader.getNamespacedObject(this.thruum.actions);

            if (typeof teacher === 'string' || teacher.level > this.thruum.level) {
                this.thruum.shouldResetAction = true;
            } else {
                const masteredShout: MasteredShout = {
                    teacher,
                    slot: 1,
                    isUpgraded: false,
                    socket: undefined,
                    utility: undefined
                };

                this.thruum.shouts.set(teacher, masteredShout);

                this.thruum.userInterface.shout1.setShout(masteredShout);
            }
        }

        if (this.thruum.shouldResetAction) {
            this.thruum.resetActionState();
        }
    }
}
