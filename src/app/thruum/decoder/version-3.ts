import { Thruum } from '../thruum';
import { MasteredShout } from '../thruum.types';
import { DecodeVersion } from './version.base';

export class Version3 implements DecodeVersion {
    constructor(private readonly game: Game, private readonly thruum: Thruum) {}

    public decode(reader: SaveWriter) {
        const version = reader.getUint32();

        if (version !== 3) {
            throw new Error(`Did not read correct version number: ${version} - trying version 3`);
        }

        if (reader.getBoolean()) {
            const teacher = reader.getNamespacedObject(this.thruum.actions);
            if (typeof teacher === 'string' || teacher.level > this.thruum.level) {
                this.thruum.shouldResetAction = true;
            } else {
                this.thruum.activeTeacher = teacher;
            }
        }

        reader.getComplexMap(reader => {
            const teacher = reader.getNamespacedObject(this.thruum.actions);
            const slot = reader.getUint32();
            const isUpgraded = reader.getBoolean();
            let socket: string | Item;

            if (reader.getBoolean()) {
                socket = reader.getNamespacedObject(this.game.items);
            }

            let utility: string | Item;

            if (reader.getBoolean()) {
                utility = reader.getNamespacedObject(this.game.items);
            }

            let masteredShout: MasteredShout;

            if (typeof teacher !== 'string') {
                masteredShout = {
                    teacher,
                    slot,
                    isUpgraded,
                    socket: typeof socket !== 'string' ? socket : undefined,
                    utility: typeof utility !== 'string' ? utility : undefined
                };

                this.thruum.shouts.set(teacher, masteredShout);
            }

            const shout1 = this.thruum.shouts.get(1);

            this.thruum.userInterface.shout1.setShout(shout1);

            return {
                key: teacher,
                value: masteredShout
            };
        });

        // Migrate legacy data to new unlocked state.
        for (const action of this.thruum.actions.allObjects) {
            const masteryLevel = this.thruum.getMasteryLevel(action);
            const isUnlocked = action
                .modifiers(this.thruum.settings.modifierType)
                .filter(modifier => modifier.level <= 100)
                .map(modifier => modifier.level <= masteryLevel);

            this.thruum.masteriesUnlocked.set(action, isUnlocked);
        }
    }
}
