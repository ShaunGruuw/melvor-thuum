import { Thruum } from '../thruum';
import { Teacher } from '../thruum.types';

import './teacher.scss';

export function TeacherComponent(thruum: Thruum, teacher: Teacher, game: Game) {
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

            const progressBar = document
                .querySelector(`#${this.localId}`)
                .querySelector('.progress-bar') as HTMLElement;

            this.progressBar = new ProgressBar(progressBar, 'bg-secondary');
        },
        updateGrants: function (
            xp: number,
            baseXP: number,
            masteryXP: number,
            baseMasteryXP: number,
            masteryPoolXP: number,
            interval: number
        ) {
            this.xpIcon.setXP(xp, baseXP);
            this.masteryIcon.setXP(masteryXP, baseMasteryXP);
            this.masteryPoolIcon.setXP(masteryPoolXP);
            this.intervalIcon.setInterval(interval);
        },
        updateGPRange: function () {
            let minGP = this.getMinGPRoll();
            let maxGP = this.getMaxGPRoll();

            const gpModifier = this.getGPModifier();
            const modGp = (gp: number) => {
                gp *= 1 + gpModifier / 100;
                gp = Math.floor(gp + game.modifiers.increasedGPFlat);
                return gp;
            };

            minGP = modGp(minGP);
            maxGP = modGp(maxGP);

            this.minGP = minGP;
            this.maxGP = maxGP;
        },
        train: function () {
            thruum.train(teacher);
        },
        Master: function () {
            thruum.Master(teacher);
        },
        mastery: function () {
            thruum.unlockMastery(teacher);
        },
        updateDisabled: function () {
            this.disabled = thruum.shouts.isMastered(teacher);
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
            return teacher.maxGP + thruum.getMasteryLevel(teacher) * 10;
        },
        getGPModifier: function () {
            let increasedGPModifier = game.modifiers.increasedGPGlobal - game.modifiers.decreasedGPGlobal;
            increasedGPModifier += game.modifiers.increasedThruumGP - game.modifiers.decreasedThruumGP;

            return increasedGPModifier;
        }
    };
}
