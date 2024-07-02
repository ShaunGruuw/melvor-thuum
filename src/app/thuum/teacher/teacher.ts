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
            this.xpIcon.setXP(xp, baseXP); // @ts-ignore // TODO: TYPES
            this.xpIcon.setSources(game.thuum.getXPSources(teacher));
            this.masteryIcon.setXP(masteryXP, baseMasteryXP); // @ts-ignore // TODO: TYPES
            this.masteryIcon.setSources(game.thuum.getMasteryXPSources(teacher));
            this.masteryPoolIcon.setXP(masteryPoolXP);
            // this.intervalIcon.setInterval(interval);
            // @ts-ignore // TODO: TYPES
            game.unlockedRealms.length > 1 ? this.masteryPoolIcon.setRealm(realm) : this.masteryPoolIcon.hideRealms();
            // @ts-ignore // TODO: TYPES
            this.intervalIcon.setInterval(interval, thuum.getIntervalSources(teacher));
        },
        updateGPRange: function () {
            let minGP = this.getMinGPRoll();
            let maxGP = this.getMaxGPRoll();
            
            const gpModifier = this.getGPModifier();
            const modGp = (gp: number) => {
                let gpMultiplier = 1;
                gpMultiplier *= 1 + gpModifier / 100;
                // @ts-ignore // TODO: TYPES
                gp = Math.floor((gp * gpMultiplier)  - game.modifiers.getValue('melvorD:increasedGPFlat', game.gp.modQuery));
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
            // @ts-ignore // TODO: TYPES
            let increasedGPModifier = game.thuum.getCurrencyModifier(game.gp);
            // @ts-ignore // TODO: TYPES
            increasedGPModifier += game.modifiers.getValue('namespace_thuum:ThuumGP', game.gp.modQuery);
            // game.modifiers.getValue('namespace_thuum:ThuumGP', game.gp.modQuery)
            return increasedGPModifier;
        }
    };
}
