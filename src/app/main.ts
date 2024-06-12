import { ThuumActionEventMatcher, ThuumActionEventMatcherOptions } from "./thuum/event";
import { Thuum } from "./thuum/thuum";
import { UserInterface } from "./thuum/user-interface";
import { ThuumModifiers } from "./thuum/modifiers";
import { ThuumTownship } from "./township/township";
import { TinyPassiveIconsCompatibility } from "./compatibility/tiny-passive-icons";
import { ThuumSkillData } from "./thuum/thuum.types";
import { languages } from "./language";
import { ThuumTranslation } from "./translation/translation";
import { ThuumSettings } from "./thuum/settings";

declare global {
    interface CloudManager {
        hasTotHEntitlementAndIsEnabled: boolean;
        hasAoDEntitlementAndIsEnabled: boolean;
    }

    const cloudManager: CloudManager;

    interface SkillIDDataMap {
        "namespace_thuum:Thuum": ThuumSkillData;
    }

    interface SkillValue {
        skill: AnySkill;
        value: number;
    }

    interface Game {
        thuum: Thuum;
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
    constructor(private readonly context: Modding.ModContext, private readonly game: Game) { }

    public async init() {
        await this.context.loadTemplates("thuum/thuum.html");
        await this.context.loadTemplates("thuum/teacher/teacher.html");
        await this.context.loadTemplates("thuum/shout/shout.html");
        await this.context.loadTemplates("thuum/mastery/mastery.html");
        await this.context.loadTemplates("thuum/locked/locked.html");

        this.initLanguage();
        this.initTranslation();
        const settings = this.initSettings();
        this.patchEventManager();
        this.initModifiers();

        this.game.thuum = this.game.registerSkill(this.game.registeredNamespaces.getNamespace("namespace_thuum"), Thuum);

        await this.context.gameData.addPackage("data.json");

        const DragonList: any[] = [
            "melvorD:PratTheProtectorOfSecrets",
            "melvorD:GreenDragon",
            "melvorD:BlueDragon",
            "melvorD:RedDragon",
            "melvorD:BlackDragon",
            "melvorD:MalcsTheGuardianOfMelvor",
            "melvorF:ElderDragon",
            "melvorF:ChaoticGreaterDragon",
            "melvorF:HuntingGreaterDragon",
            "melvorF:WickedGreaterDragon",
            "melvorF:MalcsTheLeaderOfDragons",
            "melvorF:GreaterSkeletalDragon",
        ]

        this.context.onModsLoaded(async () => {
            if (cloudManager.hasTotHEntitlementAndIsEnabled) {
                await this.context.gameData.addPackage("data-toth.json");
    
                DragonList.push(
                    "melvorTotH:Kongamato", "melvorTotH:GretYun", "melvorTotH:RaZu",
                )
    
                await this.context.gameData
                    .buildPackage(builder => {
                        builder.skillData.add({
                            skillID: "namespace_thuum:Thuum",
                            data: {
                                minibar: {
                                    defaultItems: ["namespace_thuum:Superior_Thuum_Skillcape"],
                                    upgrades: [],
                                    pets: []
                                },
                                teachers: [],
                                upgrades:[]
                            }
                        });
                    })
                    .add();
            }
            const kcm = mod.manager.getLoadedModList().includes("Custom Modifiers in Melvor")
            const profileSkill = mod.manager.getLoadedModList().includes("(Skill) Classes and Species")
            const mythLoaded = mod.manager.getLoadedModList().includes("[Myth] Music")
    
            if (cloudManager.hasAoDEntitlementAndIsEnabled) {
                await this.context.gameData.addPackage("data-aod.json");
            }
            if (mythLoaded) {
                await this.context.gameData.addPackage("music.json");
            }
            if (kcm) {
                await this.context.gameData.addPackage("data-cmim.json");
            }
            if (kcm && profileSkill) {
                await this.context.gameData.addPackage("profile.json");
            }
            if (kcm) {
                const cmim = mod.api.customModifiersInMelvor;
                cmim.addMonsters("Dragon", DragonList)
                cmim.registerOrUpdateType("Elf", "Elves", "https://cdn.melvor.net/core/v018/assets/media/pets/elf_rock.png", [], true);
                cmim.registerOrUpdateType("Goblin", "Goblins", "https://cdn.melvor.net/core/v018/assets/media/monsters/goblin.png", [], true);
                cmim.forceBaseModTypeActive("Dragon");
                cmim.forceBaseModTypeActive("Undead");
                cmim.forceBaseModTypeActive("Human");
                cmim.forceBaseModTypeActive("Animal");
                cmim.forceBaseModTypeActive("Demon");
                cmim.forceBaseModTypeActive("Elemental");
                cmim.forceBaseModTypeActive("MythicalCreature");
                cmim.forceBaseModTypeActive("SeaCreature");
                const cmimDragonList = await cmim.getMonstersOfType("Dragon");
                const initialPackage = this.context.gameData.buildPackage(builder => {
                    for (let index = 0; index < cmimDragonList.length; index++) {
                        builder.monsters.modify({
                            "id": cmimDragonList[index],
                            "lootTable": {
                                "add": [
                                    {
                                        "itemID": "namespace_thuum:Dragon_Soul",
                                        "maxQuantity": 1,
                                        "minQuantity": 1,
                                        "weight": 1
                                    }
                                ]
                            }
                        });
                    }
                })
                initialPackage.add();
                // this.game.thuum.changesMade = initialPackage
            } else {
                for (let index = 0; index < DragonList.length; index++) {
                    await this.context.gameData.buildPackage(builder => {
                        builder.monsters.modify({
                            "id": DragonList[index],
                            "lootTable": {
                                "add": [
                                    {
                                        "itemID": "namespace_thuum:Dragon_Soul",
                                        "maxQuantity": 1,
                                        "minQuantity": 1,
                                        "weight": 1
                                    }
                                ]
                            }
                        });
                    }).add();
                }
            }
        })

        this.patchGamemodes(this.game.thuum);
        this.patchUnlock(this.game.thuum);
        this.initCompatibility(this.game.thuum);
        this.initTownship();

        this.game.thuum.userInterface = this.initInterface(this.game.thuum);
        this.game.thuum.initSettings(settings);
    }

    private patchEventManager() {
        this.context.patch(GameEventSystem, "constructMatcher").after((_patch, data) => {
            if (this.isThuumEvent(data)) {
                return new ThuumActionEventMatcher(data, this.game) as any;
            }
        });
    }

    private patchGamemodes(thuum: Thuum) {
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

                gamemode.startingSkills.add(thuum);
                gamemode.autoLevelSkillsPre99.push({ skill: thuum, value: 5 });
                gamemode.autoLevelSkillsPost99.push({ skill: thuum, value: 3 });
            }
        });
    }

    private patchUnlock(thuum: Thuum) {
        this.context.patch(EventManager, "loadEvents").after(() => {
            if (this.game.currentGamemode.allowDungeonLevelCapIncrease) {
                thuum.setUnlock(true);
                thuum.increasedLevelCap = this.game.attack.increasedLevelCap;
            }
        });
    }

    private isThuumEvent(
        data: GameEventMatcherData | ThuumActionEventMatcherOptions
    ): data is ThuumActionEventMatcherOptions {
        return data.type === "ThuumAction";
    }

    private initSettings() {
        const settings = new ThuumSettings(this.context);

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

    private initCompatibility(thuum: Thuum) {
        const tinyPassiveIcons = new TinyPassiveIconsCompatibility(this.context, thuum);

        tinyPassiveIcons.patch();
    }

    private initInterface(thuum: Thuum) {
        const userInterface = new UserInterface(this.context, this.game, thuum);

        userInterface.init();

        return userInterface;
    }

    private initTranslation() {
        const translation = new ThuumTranslation(this.context);

        translation.init();
    }

    private initLanguage() {
        let lang = setLang;

        if (lang === "lemon" || lang === "carrot") {
            lang = "en";
        }

        const keysToNotPrefix = [
            "MASTERY_CHECKPOINT",
            "MASTERY_BONUS",
            "POTION_NAME",
            "PET_NAME",
            "ITEM_NAME",
            "ITEM_DESCRIPTION",
            "SHOP_NAME",
            "SHOP_DESCRIPTION",
            "MONSTER_NAME",
            "COMBAT_AREA_NAME",
            "SPECIAL_ATTACK_NAME",
            "SPECIAL_ATTACK_DESCRIPTION",
            "mod_",
            "PASSIVES_NAME_",
            "MODIFIER_DATA_",
            "Profile_",
            "tes_",
            "Myth_Music_"
        ];

        for (const [key, value] of Object.entries<string>(languages[lang])) {
            if (keysToNotPrefix.some(prefix => key.includes(prefix))) {
                loadedLangJson[key] = value;
            } else {
                loadedLangJson[`Thuum_Thuum_${key}`] = value;
            }
        }
    }
}

// "level": 99,
// "key": "increasedSkillXP",
// "skill": "melvorD:Slayer",
// "value": 20