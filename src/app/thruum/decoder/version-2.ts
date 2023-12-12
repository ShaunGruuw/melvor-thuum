import { Thruum } from '../thruum';
import { MasteredShout } from '../thruum.types';
import { DecodeVersion } from './version.base';

export class Version2 implements DecodeVersion {
    constructor(private readonly thruum: Thruum) {}

    public decode(reader: SaveWriter) {
        const version = reader.getUint32();

        if (version !== 2) {
            throw new Error(`Did not read correct version number: ${version} - trying version 2`);
        }

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
                    socket: undefined,
                    utility: undefined
                };

                this.thruum.shouts.set(teacher, masteredShout);

                this.thruum.userInterface.shout1.setShout(masteredShout);
            }
        }

        if (reader.getBoolean()) {
            const teacher = reader.getNamespacedObject(this.thruum.actions);

            if (typeof teacher === 'string' || teacher.level > this.thruum.level) {
                this.thruum.shouldResetAction = true;
            } else {
                const masteredShout: MasteredShout = {
                    teacher,
                    slot: 2,
                    socket: undefined,
                    utility: undefined
                };

                this.thruum.shouts.set(teacher, masteredShout);

            }
        }

        if (this.thruum.shouldResetAction) {
            this.thruum.resetActionState();
        }
    }
}
