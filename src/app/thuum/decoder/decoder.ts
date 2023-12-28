import { Thuum } from '../thuum';
import { Version0 } from './version-0';
import { Version1 } from './version-1';
import { Version2 } from './version-2';
import { Version3 } from './version-3';
import { Version4 } from './version-4';

export class Decoder {
    constructor(private readonly game: Game, private readonly thuum: Thuum, private readonly start: number) {}

    public decode(reader: SaveWriter) {
        const saveVersions = [
            this.loadSaveFactory(() => new Version4(this.game, this.thuum).decode(reader)),
            this.loadSaveFactory(() => new Version3(this.game, this.thuum).decode(reader)),
            this.loadSaveFactory(() => new Version2(this.thuum).decode(reader)),
            this.loadSaveFactory(() => new Version1(this.thuum).decode(reader)),
            this.loadSaveFactory(() => new Version0(this.thuum).decode(reader))
        ];

        for (const save of saveVersions) {
            const isLoaded = save();

            // Loaded the save successfully.
            if (isLoaded) {
                break;
            }

            // Reset the byte offset if we failed to load this version of the save.
            reader.byteOffset = this.start;
        }
    }

    private loadSaveFactory(callback: () => void) {
        return () => {
            let isLoaded = false;

            try {
                callback();
                isLoaded = true;
            } catch (e) {
                console.warn('Failed to load thuum save', e);
            }

            return isLoaded;
        };
    }
}
