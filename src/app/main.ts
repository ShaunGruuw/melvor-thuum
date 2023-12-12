import { ThruumActionEventMatcher, ThruumActionEventMatcherOptions } from './thruum/event';
import { Thruum } from './thruum/thruum';
import { UserInterface } from './thruum/user-interface';
import { ThuumModifiers } from './thruum/modifiers';
import { ThuumTownship } from './township/township';
import { ThuumAgility } from './agility/agility';
import { ThuumAstrology } from './astrology/astrology';
import { TinyPassiveIconsCompatibility } from './compatibility/tiny-passive-icons';
import { ThruumSkillData } from './thruum/thruum.types';
import { languages } from './language';
import { ThuumTranslation } from './translation/translation';
import { ThruumSettings } from './thruum/settings';

declare global {
    interface CloudManager {
        hasTotHEntitlement: boolean;
        hasAoDEntitlement: boolean;
    }

    const cloudManager: CloudManager;

    interface SkillIDDataMap {
        'namespace_thuum:Thruum': ThruumSkillData;
    }

    interface SkillValue {
        skill: AnySkill;
        value: number;
    }

    interface Game {
        thruum: Thruum;
    }

    interface Gamemode {
        /** The number of skill cap increase choices obtained per dungeon completion before Level 99 if allowDungeonLevelCapIncrease = true */
        skillCapIncreasesPre99: number;
        /** The number of skill cap increase choices obtained per dungeon completion after Level 99 if allowDungeonLevelCapIncrease = true */
        skillCapIncreasesPost99: number;
        /** Skills that auto level per dungeon completion before Level 99 if allowDungeonLevelCapIncrease = true */
        autoLevelSkillsPre99: SkillValue[];
        /** Skills that auto level per dungeon completion after Level 99 if allowDungeonLevelCapIncrease = true */
        autoLevelSkillsPost99: SkillValue[];
        /** Skills that are part of the cap increase pool before Level 99 obtained per dungeon completion if allowDungeonLevelCapIncrease = true */
        skillCapRollsPre99: SkillValue[];
        /** Skills that are part of the cap increase pool after Level 99 obtained per dungeon completion if allowDungeonLevelCapIncrease = true */
        skillCapRollsPost99: SkillValue[];
    }
}

export class App {
    constructor(private readonly context: Modding.ModContext, private readonly game: Game) {}

    public async init() {
        await this.context.loadTemplates('thruum/thruum.html');
        await this.context.loadTemplates('thruum/teacher/teacher.html');
        await this.context.loadTemplates('thruum/shout/shout.html');
        await this.context.loadTemplates('thruum/mastery/mastery.html');
        await this.context.loadTemplates('thruum/locked/locked.html');

        this.initLanguage();
        this.initTranslation();
        const settings = this.initSettings();
        this.patchEventManager();
        this.initModifiers();

        this.game.thruum = this.game.registerSkill(this.game.registeredNamespaces.getNamespace('namespace_thuum'), Thruum);

        await this.context.gameData.addPackage('data.json');
        const kcm = mod.manager.getLoadedModList().includes('Custom Modifiers in Melvor')
        if(kcm) {
            
        }
        if (cloudManager.hasTotHEntitlement) {
            await this.context.gameData.addPackage('data-toth.json');

            await this.context.gameData
                .buildPackage(builder => {
                    builder.skillData.add({
                        skillID: 'namespace_thuum:Thruum',
                        data: {
                            minibar: {
                                defaultItems: ['namespace_thuum:Superior_Thruum_Skillcape'],
                                upgrades: [],
                                pets: []
                            },
                            teachers: []
                        }
                    });
                })
                .add();
        }

        if (cloudManager.hasAoDEntitlement) {
            // await this.context.gameData.addPackage('data-aod.json');
        }

        this.patchGamemodes(this.game.thruum);
        this.patchUnlock(this.game.thruum);
        this.initCompatibility(this.game.thruum);
        this.initAgility(this.game.thruum);
        this.initAstrology(this.game.thruum);
        this.initTownship();

        this.game.thruum.userInterface = this.initInterface(this.game.thruum);
        this.game.thruum.initSettings(settings);
    }

    private patchEventManager() {
        this.context.patch(GameEventSystem, 'constructMatcher').after((_patch, data) => {
            if (this.isThruumEvent(data)) {
                return new ThruumActionEventMatcher(data, this.game) as any;
            }
        });
    }

    private patchGamemodes(thruum: Thruum) {
        this.game.gamemodes.forEach(gamemode => {
            if (gamemode.allowDungeonLevelCapIncrease) {
                if (!gamemode.startingSkills) {
                    gamemode.startingSkills = new Set();
                }

                if (!gamemode.autoLevelSkillsPre99) {
                    gamemode.autoLevelSkillsPre99 = [];
                }

                if (!gamemode.autoLevelSkillsPost99) {
                    gamemode.autoLevelSkillsPost99 = [];
                }

                gamemode.startingSkills.add(thruum);
                gamemode.autoLevelSkillsPre99.push({ skill: thruum, value: 5 });
                gamemode.autoLevelSkillsPost99.push({ skill: thruum, value: 3 });
            }
        });
    }

    private patchUnlock(thruum: Thruum) {
        this.context.patch(EventManager, 'loadEvents').after(() => {
            if (this.game.currentGamemode.allowDungeonLevelCapIncrease) {
                thruum.setUnlock(true);
                thruum.increasedLevelCap = this.game.attack.increasedLevelCap;
            }
        });
    }

    private isThruumEvent(
        data: GameEventMatcherData | ThruumActionEventMatcherOptions
    ): data is ThruumActionEventMatcherOptions {
        return data.type === 'ThruumAction';
    }

    private initSettings() {
        const settings = new ThruumSettings(this.context);

        settings.init();

        return settings;
    }

    private initModifiers() {
        const modifiers = new ThuumModifiers();

        modifiers.registerModifiers();
    }

    private initTownship() {
        const township = new ThuumTownship(this.context, this.game);

        township.register();
    }

    private initAgility(thruum: Thruum) {
        const agility = new ThuumAgility(this.game, thruum);

        agility.register();
    }

    private initAstrology(thruum: Thruum) {
        const astrology = new ThuumAstrology(this.game, thruum);

        astrology.register();
    }

    private initCompatibility(thruum: Thruum) {
        const tinyPassiveIcons = new TinyPassiveIconsCompatibility(this.context, thruum);

        tinyPassiveIcons.patch();
    }

    private initInterface(thruum: Thruum) {
        const userInterface = new UserInterface(this.context, this.game, thruum);

        userInterface.init();

        return userInterface;
    }

    private initTranslation() {
        const translation = new ThuumTranslation(this.context);

        translation.init();
    }

    private initLanguage() {
        let lang = setLang;

        if (lang === 'lemon' || lang === 'carrot') {
            lang = 'en';
        }

        const keysToNotPrefix = [
            'MASTERY_CHECKPOINT',
            'MASTERY_BONUS',
            'POTION_NAME',
            'PET_NAME',
            'ITEM_NAME',
            'ITEM_DESCRIPTION',
            'SHOP_NAME',
            'SHOP_DESCRIPTION',
            'MONSTER_NAME',
            'COMBAT_AREA_NAME',
            'SPECIAL_ATTACK_NAME',
            'SPECIAL_ATTACK_DESCRIPTION'
        ];

        for (const [key, value] of Object.entries<string>(languages[lang])) {
            if (keysToNotPrefix.some(prefix => key.includes(prefix))) {
                loadedLangJson[key] = value;
            } else {
                loadedLangJson[`Thuum_Thruum_${key}`] = value;
            }
        }
    }
}
