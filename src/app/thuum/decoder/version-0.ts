import { Thuum } from '../thuum';
import { MasteredShout } from '../thuum.types';
import { DecodeVersion } from './version.base';

export class Version0 implements DecodeVersion {
    constructor(private readonly game: Game, private readonly thuum: Thuum) {}

    public decode(reader: SaveWriter) {
        const version = reader.getUint32();

        if (version !== 0) {
            throw new Error(`Did not read correct version number: ${version} - trying version 0`);
        }
        // get teacher
        if (reader.getBoolean()) {
            const teacher = reader.getNamespacedObject(this.thuum.actions);
            if (typeof teacher === 'string' || teacher.level > this.thuum.level) {
                this.thuum.shouldResetAction = true;
            } else {
                this.thuum.activeTeacher = teacher;
            }
        }
        // get masteries
        reader.getArray(reader => {
            const teacher = reader.getNamespacedObject(this.thuum.actions);
            if (typeof teacher !== 'string') {
                const masteriesUnlocked: boolean[] = [];

                reader.getArray(reader => {
                    const isUnlocked = reader.getBoolean();
                    masteriesUnlocked.push(isUnlocked);
                });
                this.thuum.masteriesUnlocked.set(teacher, masteriesUnlocked);
            } else {
                reader.getArray(reader => reader.getBoolean());
            }
        });
        this.thuum.shouts.clear()
        // get shouts
        reader.getComplexMap(reader => {
            const teacher = reader.getNamespacedObject(this.thuum.actions);
            const slot = reader.getUint32();

            let masteredShout: MasteredShout;

            if (typeof teacher !== 'string') {
                masteredShout = {
                    teacher,
                    slot
                };

                this.thuum.shouts.set(teacher, masteredShout);
            }

            return {
                key: teacher,
                value: masteredShout
            };
        });
        const shout1 = this.thuum.shouts.get(1);
        this.thuum.userInterface.shout1.setShout(shout1);

        this.thuum.userInterface.teachers.forEach(component => {
            component.updateDisabled();
        });

        if (this.thuum.shouldResetAction) {
            this.thuum.resetActionState();
        }
    }
}
