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
        disabled: false,
        progressBar: {} as ProgressBar,
        mounted: function () {
            const grantsContainer = document
                .querySelector(`#${this.localId}`)
                .querySelector('#grants-container') as HTMLElement;

            this.xpIcon = new XPIcon(grantsContainer, 0, 0, 32);
            this.masteryIcon = new MasteryXPIcon(grantsContainer, 0, 0, 32);
            this.masteryPoolIcon = new MasteryPoolIcon(grantsContainer, 0, 32);
            this.intervalIcon = new IntervalIcon(grantsContainer, 0, 32);

            this.xpIcon = grantsContainer.querySelector('#thruum-xp');
            this.masteryIcon = grantsContainer.querySelector('#thruum-mastery-xp');
            this.masteryPoolIcon = grantsContainer.querySelector('#thruum-pool-xp');
            this.intervalIcon = grantsContainer.querySelector('#thruum-interval');

            this.progressBar = document
                .querySelector(`#${this.localId}`)
                // @ts-ignore // TODO: TYPES
                .querySelector<ProgressBar>('progress-bar');

            // this.progressBar = new ProgressBar(progressBar, 'bg-secondary');
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
            this.xpIcon.setXP(xp, baseXP);
            this.masteryIcon.setXP(masteryXP, baseMasteryXP);
            this.masteryPoolIcon.setXP(masteryPoolXP);
            // this.intervalIcon.setInterval(interval);
            // @ts-ignore // TODO: TYPES
            game.unlockedRealms.length > 1 ? this.masteryPoolIcon.setRealm(realm) : this.masteryPoolIcon.hideRealms();
            // @ts-ignore // TODO: TYPES
            this.intervalIcon.setInterval(interval, music.getIntervalSources(instrument));
        },
        updateGPRange: function () {
            let minGP = this.getMinGPRoll();
            let maxGP = this.getMaxGPRoll();

            const gpModifier = this.getGPModifier();
            const modGp = (gp: number) => {
                gp *= 1 + gpModifier / 100;
                 // @ts-ignore // TODO: TYPES
                gp = Math.floor(gp + game.modifiers.getValue('melvorD:flatCurrencyGain', game.gp.modQuery));                    
                    // game.modifiers.increasedGPFlat);
                return gp;
            };

            minGP = modGp(minGP);
            maxGP = modGp(maxGP);
            if (minGP < 1) {
                minGP = 1
            }
            if (maxGP < 1) {
                maxGP = 1
            }
            if (minGP > 10000000000000) {
                minGP = 10000000000000
            }
            if (maxGP > 10000000000000) {
                maxGP = 10000000000000
            }
            this.minGP = minGP;
            this.maxGP = maxGP;
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
            // Each levels provides + 10 GP is here [thuum.getMasteryLevel(teacher) * 10;]
            return teacher.maxGP + thuum.getMasteryLevel(teacher) * 10;
        },
        getGPModifier: function () {
            let increasedGPModifier = game.modifiers.increasedGPGlobal - game.modifiers.decreasedGPGlobal;
            increasedGPModifier += game.modifiers.increasedThuumGP - game.modifiers.decreasedThuumGP;

            return increasedGPModifier;
        }
    };
}
