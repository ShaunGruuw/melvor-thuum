import { Thruum } from './thruum';
import { Teacher } from './thruum.types';

export class ThruumActionEvent extends SkillActionEvent {
    public skill: Thruum;
    public action: Teacher;

    constructor(skill: Thruum, action: Teacher) {
        super();
        this.skill = skill;
        this.action = action;
    }
}

export interface ThruumActionEventMatcherOptions extends SkillActionEventMatcherOptions {
    type: 'ThruumAction';
    actionIDs?: string[];
}

export class ThruumActionEventMatcher extends SkillActionEventMatcher<ThruumActionEvent> {
    /** If present, the recipe of the action must match a member */
    public actions?: Set<Teacher>;
    public type = <any>'ThruumAction';

    constructor(options: ThruumActionEventMatcherOptions, game: Game) {
        super(options, game);

        if (options.actionIDs !== undefined) {
            const thruum = game.skills.find(skill => skill.id === 'namespace_thuum:Thruum') as Thruum;
            this.actions = thruum.actions.getSetForConstructor(options.actionIDs, this, Teacher.name);
        }
    }

    public doesEventMatch(event: GameEvent): boolean {
        return (
            event instanceof ThruumActionEvent &&
            (this.actions === undefined || this.actions.has(event.action)) &&
            super.doesEventMatch(event)
        );
    }

    public _assignNonRaidHandler(handler: Handler<ThruumActionEvent>) {
        const thruum = this.game.skills.getObjectByID('namespace_thuum:Thruum') as Thruum;
        thruum.on('action', handler);
    }

    public _unassignNonRaidHandler(handler: Handler<ThruumActionEvent>) {
        const thruum = this.game.skills.getObjectByID('namespace_thuum:Thruum') as Thruum;
        thruum.off('action', handler);
    }
}
