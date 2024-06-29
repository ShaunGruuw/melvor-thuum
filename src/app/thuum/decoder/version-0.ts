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
        console.log(version, reader.getNamespacedObject(this.thuum.actions), this.thuum.shouts)
        // get teacher
        console.log('decode get teacher')
        if (reader.getBoolean()) {
            const teacher = reader.getNamespacedObject(this.thuum.actions);
            if (typeof teacher === 'string' || teacher.level > this.thuum.level) {
                this.thuum.shouldResetAction = true;
            } else {
                this.thuum.activeTeacher = teacher;
            }
        }
        // get masteries
        console.log('decode get masteries')
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
        console.log('decode get shouts')
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
        console.log('decode shout1')
        const shout1 = this.thuum.shouts.get(1);
        console.log('decode setShout')
        this.thuum.userInterface.shout1.setShout(shout1);

        this.thuum.userInterface.teachers.forEach(component => {
            component.updateDisabled();
        });

        if (this.thuum.shouldResetAction) {
            this.thuum.resetActionState();
        }
    }
}
