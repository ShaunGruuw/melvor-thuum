import { Thruum } from './thruum';
import { Teacher, MasteredShout } from './thruum.types';

export class MasteredShouts {
    public readonly shouts = new Map<Teacher, MasteredShout>();

    constructor(private readonly thruum: Thruum) {}

    public get(teacher: Teacher): MasteredShout | undefined;
    public get(slot: number): MasteredShout | undefined;
    public get(slotOrTeacher: Teacher | number): MasteredShout | undefined {
        let masteredShout: MasteredShout | undefined;

        if (typeof slotOrTeacher === 'number') {
            masteredShout = Array.from(this.shouts.values()).find(shout => shout.slot === slotOrTeacher);
        } else {
            const shout = this.thruum.actions.getObjectByID(slotOrTeacher.id);

            masteredShout = this.shouts.get(shout);
        }

        return masteredShout;
    }

    public set(key: Teacher, value: MasteredShout) {
        const shout = this.thruum.actions.getObjectByID(key.id);

        this.shouts.set(shout, value);
    }

    public all() {
        return Array.from(this.shouts.values());
    }

    public remove(key: Teacher) {
        const shout = this.thruum.actions.getObjectByID(key.id);

        this.shouts.delete(shout);
    }

    public clear() {
        this.shouts.clear();
    }

    public isMastered(teacher: Teacher) {
        const shout = this.thruum.actions.getObjectByID(teacher.id);

        return this.shouts.has(shout);
    }
}
