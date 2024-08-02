import { Thuum } from '../thuum';
import { Teacher } from '../thuum.types';

import './teacher.scss';

export function TeacherComponent(thuum: Thuum, teacher: Teacher, game: Game) {
    return {
        $template: '#thuum-teacher',
        teacher,
        teacherName: teacher.name,
        media: teacher.media,
        id: teacher.id,
        localId: teacher.localID.toLowerCase(),
        minGP: 0,
        maxGP: 0,
        displayMinGP: 0,
        displayMaxGP: 0,
        disabled: false, // @ts-ignore // TODO: TYPES
        progressBar: {} as ProgressBarElement,
        mounted: function () {
            const grantsContainer = document
                .querySelector(`#${this.localId}`)
                .querySelector('#grants-container') as HTMLElement;

            this.xpIcon = grantsContainer.querySelector('#thuum-xp');
            this.masteryIcon = grantsContainer.querySelector('#thuum-mastery-xp');
            this.masteryPoolIcon = grantsContainer.querySelector('#thuum-pool-xp');
            this.intervalIcon = grantsContainer.querySelector('#thuum-interval');

            this.progressBar = document
                .querySelector(`#${this.localId}`)
                // @ts-ignore // TODO: TYPES
                .querySelector<ProgressBarElement>('progress-bar');
        },
        updateGrants: function (
            xp: number,
            baseXP: number,
            masteryXP: number,
            baseMasteryXP: number,
            masteryPoolXP: number,
            interval: number,
            // @ts-ignore // TODO: TYPES
            realm: Realm
        ) {
            this.xpIcon.setXP(xp, baseXP); // @ts-ignore // TODO: TYPES
            this.xpIcon.setSources(game.thuum.getXPSources(teacher));
            this.masteryIcon.setXP(masteryXP, baseMasteryXP); // @ts-ignore // TODO: TYPES
            this.masteryIcon.setSources(game.thuum.getMasteryXPSources(teacher));
            this.masteryPoolIcon.setXP(masteryPoolXP);
            // @ts-ignore // TODO: TYPES
            game.unlockedRealms.length > 1 ? this.masteryPoolIcon.setRealm(realm) : this.masteryPoolIcon.hideRealms();
            // @ts-ignore // TODO: TYPES
            this.intervalIcon.setInterval(interval, thuum.getIntervalSources(teacher));
        },
        goldToTake: function () {
            let minGP = this.getMinGPRoll();
            let maxGP = this.getMaxGPRoll();

            // Roll a value between min and max
            let gpToTake = rollInteger(minGP, maxGP);

            return this.modGP(gpToTake)
        },
        modGP: function (gp: number) {
            let gpToTake = 0
            // Calculate the GP modifier multiplier
            const increasedGPModifier = this.getGPModifier(); // -109
            let gpMultiplier = 1 + increasedGPModifier / 100; //2.09

            // Apply the multiplier to the rolled GP value
            // @ts-ignore // TODO: TYPES
            gpToTake = Math.floor(gpMultiplier * gp + game.modifiers.getValue('melvorD:flatCurrencyGain', game.gp.modQuery)); // ~ 2 * gp + 0 ~~ 200

            if (typeof gpToTake !== 'number') {
                gpToTake = 0
            }
            return gpToTake
        },
        updateGPRange: function () {
            let minGP = this.getMinGPRoll();
            let maxGP = this.getMaxGPRoll();
            minGP = -this.modGP(minGP); // Negate the result of modGP(minGP)
            maxGP = -this.modGP(maxGP); // Negate the result of modGP(maxGP)
            this.minGP = minGP;
            this.maxGP = maxGP;
            this.displayMinGP = minGP;
            this.displayMaxGP = maxGP;
        },        
        train: function () {
            thuum.train(teacher);
        },
        Master: function () {
            thuum.Master(teacher);
        },
        mastery: function () {
            thuum.unlockMastery(teacher);
        },
        updateDisabled: function () {
            this.disabled = thuum.shouts.isMastered(teacher);
        },
        getSkillIcons: function () {
            return teacher.skills.map(skillId => {
                return game.skills.find(skill => skill.id === skillId)?.media;
            });
        },
        getMinGPRoll: function () {
            return Math.max(1, Math.floor(this.getMaxGPRoll() / 100));
        },
        getMaxGPRoll: function () {
            return teacher.maxGP + thuum.getMasteryLevel(teacher);
        },
        getGPModifier: function () {
            // @ts-ignore // TODO: TYPES
            let increasedGPModifier = game.thuum.getCurrencyModifier(game.gp);
            // @ts-ignore // TODO: TYPES
            increasedGPModifier += game.modifiers.getValue('namespace_thuum:ThuumGP', game.gp.modQuery);
            return increasedGPModifier;
        }
    };
}
