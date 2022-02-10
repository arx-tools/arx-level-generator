/**
 * The Backrooms
 *
 * Issues:
 *  - https://bugs.arx-libertatis.org/arx/issues/1599
 *
 * To be reported:
 *   -x flag a spellcast-nál nem némítja el a douse-ot, meg az ignite-ot
 *   a light-oknak lehet extra flag-eknél NO_IGNIT-et megadni, de nincs NO_DOUSE
 *   nem lehet level 0-nál lightningbolt-ot ellőni: https://github.com/arx/ArxLibertatis/blob/master/src/game/Spells.cpp#L742
 *
 * Neon light sound effects: https://www.youtube.com/watch?v=UKoktRXJZLM (Peter Seeba)
 * Glass popping sound effects: https://www.youtube.com/watch?v=6nKbpLUpqiQ (SOUND EFFECT EN & FR)
 */

const { compose } = require("ramda");
const { textures } = require("../../assets/textures");
const {
  generateBlankMapData,
  finalize,
  saveToDisk,
  setColor,
  setTexture,
  movePlayerTo,
  addLight,
  move,
  randomBetween,
  circleOfVectors,
  pickRandoms,
  pickRandom,
} = require("../../helpers");
const { wallX, wallZ, plain } = require("../../prefabs");
const { defineCeilingLamp, createCeilingLamp } = require("./items/ceilingLamp");
const {
  EXTRAS_SEMIDYNAMIC,
  EXTRAS_EXTINGUISHABLE,
  EXTRAS_STARTEXTINGUISHED,
  EXTRAS_NO_IGNIT,
  HFLIP,
  VFLIP,
} = require("../../constants");
const {
  markAsUsed,
  moveTo,
  addScript,
  createItem,
  items,
  addDependencyAs,
  addDependency,
} = require("../../assets/items");
const { getInjections, declare, color } = require("../../scripting");
const { generateGrid, addRoom, getRadius, isOccupied } = require("./rooms");
const { disableBumping } = require("../../prefabs/plain");
const {
  defineCeilingDiffuser,
  createCeilingDiffuser,
} = require("./items/ceilingDiffuser");
const { overridePlayerScript } = require("../shared/player");
const { createLampController } = require("./items/lampController");

const UNIT = 200;

const wall = ([x, y, z], face, config = {}) => {
  return (mapData) => {
    const { origin, roomDimensions } = mapData.config;

    const internalUnit = 100;

    const h = config.height ?? (UNIT * roomDimensions.height) / internalUnit;

    return compose((mapData) => {
      for (let height = 0; height < h; height++) {
        for (let width = 0; width < UNIT / 100; width++) {
          (face === "left" || face === "right" ? wallX : wallZ)(
            move(
              x +
                internalUnit / 2 +
                (face === "front" || face === "back"
                  ? width * internalUnit + UNIT
                  : 0),
              y - internalUnit / 2 - height * internalUnit,
              z +
                internalUnit / 2 +
                (face === "left" || face === "right"
                  ? width * internalUnit + UNIT
                  : 0),
              origin
            ),
            face,
            null,
            0,
            internalUnit
          )(mapData);
        }
      }
      return mapData;
    })(mapData);
  };
};

const addLamp = (pos, angle, config = {}) => {
  return (mapData) => {
    const isOn = config.on ?? false;
    const lampEntity = createCeilingLamp(pos, angle, { on: isOn });

    compose(
      addLight(move(0, 20, 0, pos), {
        fallstart: 100,
        fallend: 1000,
        intensity: 1,
        exFlicker: {
          r: 0.2,
          g: 0,
          b: 0,
        },
        extras:
          EXTRAS_SEMIDYNAMIC |
          EXTRAS_EXTINGUISHABLE |
          (isOn ? 0 : EXTRAS_STARTEXTINGUISHED) |
          EXTRAS_NO_IGNIT,
      }),
      setColor("white")
    )(mapData);

    return lampEntity;
  };
};

const createWelcomeMarker = (pos, config) => {
  return compose(
    markAsUsed,
    moveTo(pos, [0, 0, 0]),
    addScript((self) => {
      return `
// component: welcomeMarker
ON INIT {
  ${getInjections("init", self)}
  ADDXP 2000 // can't cast lightning bolt at level 0
  ACCEPT
}
      `;
    }),
    addDependency("graph/levels/level1/map.bmp"),
    addDependencyAs(
      "projects/the-backrooms/loading.bmp",
      `graph/levels/level${config.levelIdx}/loading.bmp`
    ),
    addDependencyAs(
      "projects/the-backrooms/sfx/no-sound.wav",
      "sfx/magic_spell_ignite.wav"
    ),
    addDependencyAs(
      "projects/the-backrooms/sfx/no-sound.wav",
      "sfx/magic_spell_douse.wav"
    ),
    addDependencyAs(
      "projects/the-backrooms/sfx/no-sound.wav",
      "sfx/player_level_up.wav"
    ),
    createItem
  )(items.marker);
};

const createJumpscareController = (pos, config) => {
  return compose(
    markAsUsed,
    moveTo(pos, [0, 0, 0]),
    addScript((self) => {
      return `
// component jumpscareController
ON INIT {
  ${getInjections("init", self)}

  SET #noexitTrigger ^RND_30000
  INC #noexitTrigger 30000
  SET #smellTrigger ^RND_60000
  INC #smellTrigger 40000

  TIMERnoexit -m 1 #noexitTrigger GOSUB WHISPER_NOEXIT

  TIMERsmell -m 1 #smellTrigger GOSUB WHISPER_SMELL

  ACCEPT
}

ON PICKUP {
  IF ("almondwater" isin ^$PARAM1) {
    INC ${self.state.almondwaterCntr} 1
    IF (${self.state.almondwaterCntr} == 2) {
      GOSUB WHISPER_DRINK1
    }
    IF (${self.state.almondwaterCntr} == 3) {
      GOSUB WHISPER_DRINK2
    }
  }

  ACCEPT
}

ON SPELLCAST {
  IF (^SENDER != PLAYER) {
    ACCEPT
  }

  INC ${self.state.magicCntr} 1
  IF (${self.state.magicCntr} == 1) {
    TIMERspeak -m 1 3000 GOSUB WHISPER_MAGIC
  }

  ACCEPT
}

>>WHISPER_NOEXIT {
  SPEAK -p [whisper--no-exit]
  HEROSAY [whisper--no-exit]
  RETURN
}

>>WHISPER_DRINK1 {
  SPEAK -p [whisper--drink-the-almond-water]
  HEROSAY [whisper--drink-the-almond-water]
  RETURN
}

>>WHISPER_DRINK2 {
  SPEAK -p [whisper--drink-it]
  HEROSAY [whisper--drink-it]
  RETURN
}

>>WHISPER_SMELL {
  SPEAK -p [whisper--do-you-smell-it]
  HEROSAY [whisper--do-you-smell-it]
  RETURN
}

>>WHISPER_MAGIC {
  SPEAK -p [whisper--magic-wont-save-you]
  HEROSAY [whisper--magic-wont-save-you]
  RETURN
}
      `;
    }),
    addDependencyAs(
      "projects/the-backrooms/whispers/english/do-you-smell-it.wav",
      "speech/english/whisper--do-you-smell-it.wav"
    ),
    addDependencyAs(
      "projects/the-backrooms/whispers/german/do-you-smell-it.wav",
      "speech/deutsch/whisper--do-you-smell-it.wav"
    ),
    addDependencyAs(
      "projects/the-backrooms/whispers/english/drink-it.wav",
      "speech/english/whisper--drink-it.wav"
    ),
    addDependencyAs(
      "projects/the-backrooms/whispers/german/drink-it.wav",
      "speech/deutsch/whisper--drink-it.wav"
    ),
    addDependencyAs(
      "projects/the-backrooms/whispers/english/drink-the-almond-water.wav",
      "speech/english/whisper--drink-the-almond-water.wav"
    ),
    addDependencyAs(
      "projects/the-backrooms/whispers/german/drink-the-almond-water.wav",
      "speech/deutsch/whisper--drink-the-almond-water.wav"
    ),
    addDependencyAs(
      "projects/the-backrooms/whispers/english/magic-wont-save-you.wav",
      "speech/english/whisper--magic-wont-save-you.wav"
    ),
    addDependencyAs(
      "projects/the-backrooms/whispers/german/magic-wont-save-you.wav",
      "speech/deutsch/whisper--magic-wont-save-you.wav"
    ),
    addDependencyAs(
      "projects/the-backrooms/whispers/english/no-exit.wav",
      "speech/english/whisper--no-exit.wav"
    ),
    addDependencyAs(
      "projects/the-backrooms/whispers/german/no-exit.wav",
      "speech/deutsch/whisper--no-exit.wav"
    ),
    declare("int", "magicCntr", 0),
    declare("int", "almondwaterCntr", 0),
    createItem
  )(items.marker);
};

const createRune = (runeName, pos, angle = [0, 0, 0]) => {
  return compose(
    markAsUsed,
    moveTo(pos, angle),
    addScript((self) => {
      return `
// component: rune
ON INIT {
  ${getInjections("init", self)}
  ACCEPT
}
      `;
    }),
    declare("string", "rune_name", runeName),
    createItem
  )(items.magic.rune);
};

const createExit = (pos, angle = [0, 0, 0], key, lampCtrl) => {
  return compose(
    markAsUsed,
    moveTo(pos, angle),
    addScript((self) => {
      return `
// component: exit
ON INIT {
  ${getInjections("init", self)}
  ACCEPT
}
 
ON LOAD {
  USE_MESH "DOOR_YLSIDES\\DOOR_YLSIDES.TEO"
  ACCEPT
}

ON ACTION {
  IF (${self.state.unlock} == 0) {
    ACCEPT
  }

  IF (${self.state.open} == 1) {
    ACCEPT
  }

  GOTO OUTRO
  ACCEPT
}

>>OUTRO {
  TIMERmute -m 1 1500 SENDEVENT MUTE ${lampCtrl.ref} NOP
  PLAYERINTERFACE HIDE
  SETPLAYERCONTROLS OFF
  TIMERfadeout -m 1 700 WORLDFADE OUT 300 ${color("khaki")}
  PLAY -o "backrooms-outro" // [o] = emit from player
  TIMERfadeout2 -m 1 18180 WORLDFADE OUT 0 ${color("black")}
  TIMERendgame -m 1 20000 END_GAME
  ACCEPT
}
      `;
    }),
    declare("int", "lockpickability", 100),
    declare("string", "type", "Door_Ylsides"),
    declare("string", "key", key.ref),
    declare("int", "open", 0),
    declare("int", "unlock", 0),
    addDependencyAs(
      "projects/the-backrooms/sfx/backrooms-outro.wav",
      "sfx/backrooms-outro.wav"
    ),
    createItem
  )(items.doors.lightDoor, { name: "[door--exit]" });
};

const createKey = (pos, angle = [0, 0, 0]) => {
  return compose(
    markAsUsed,
    moveTo(pos, angle),
    addScript((self) => {
      return `
// component: key
ON INIT {
  ${getInjections("init", self)}
  OBJECT_HIDE SELF NO
  ACCEPT
}
      `;
    }),
    createItem
  )(items.keys.oliverQuest, { name: "[key--exit]" });
};

const getAlmondWaterVariant = () => {
  const factor = randomBetween(0, 100);

  if (factor < 1) {
    return "xp";
  }

  if (factor < 10) {
    return "slow";
  }

  return "mana";
};

const createAlmondWater = (
  pos,
  angle = [0, 0, 0],
  variant = "mana",
  jumpscareCtrl
) => {
  return compose(
    markAsUsed,
    moveTo(pos, angle),
    addScript((self) => {
      return `
// component: almondWater
ON INIT {
  ${getInjections("init", self)}
  ACCEPT
}

ON INVENTORYIN {
  IF (${self.state.pickedUp} == 0) {
    SET ${self.state.pickedUp} 0
    SENDEVENT PICKUP ${jumpscareCtrl.ref} "almondwater:${variant}"
  }

  ACCEPT
}

ON INVENTORYUSE {
  PLAY "drink"

  IF (${self.state.variant} == "xp") {
    ADDXP 2000
  }

  IF (${self.state.variant} == "mana") {
    SPECIALFX MANA 25
  }

  IF (${self.state.variant} == "slow") {
    // SENDEVENT SETSPEED player 0.5
    // TIMERpenalty 1 10 SENDEVENT SETSPEED player 1
  }

  SETINTERACTIVITY NONE
  TIMERdestroy 1 1 DESTROY SELF

  REFUSE
}
      `;
    }),
    addDependencyAs(
      "projects/the-backrooms/almondwater.bmp",
      "graph/obj3d/interactive/items/magic/potion_mana/potion_mana[icon].bmp"
    ),
    declare("string", "variant", variant),
    declare("int", "pickedUp", 0),
    createItem
  )(items.magic.potion.mana, {
    name: `[item--almond-water]`,
  });
};

const renderGrid = (grid) => {
  return (mapData) => {
    const { roomDimensions } = mapData.config;
    const radius = getRadius(grid);
    const top = -radius * UNIT + UNIT / 2;
    const left = -radius * UNIT + UNIT / 2;

    const wallTextures = {
      front:
        Math.random() > 0.3
          ? textures.backrooms.wall
          : textures.backrooms.wall2,
      back:
        Math.random() > 0.7
          ? textures.backrooms.wall
          : textures.backrooms.wall2,
      left:
        Math.random() > 0.5
          ? textures.backrooms.wall
          : textures.backrooms.wall2,
      right:
        Math.random() > 0.5
          ? textures.backrooms.wall
          : textures.backrooms.wall2,
    };

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] === 1) {
          setTexture(textures.backrooms.carpetDirty, mapData);
          plain(
            [left + x * UNIT, 0, -(top + y * UNIT)],
            [UNIT / 100, UNIT / 100],
            "floor",
            disableBumping,
            {
              textureRotation: pickRandom([0, 90, 180, 270]),
              textureFlags: pickRandom([0, HFLIP, VFLIP, HFLIP | VFLIP]),
            }
          )(mapData);

          setTexture(textures.backrooms.ceiling, mapData);
          plain(
            [
              left + x * UNIT,
              -(UNIT * roomDimensions.height),
              -(top + y * UNIT),
            ],
            [UNIT / 100, UNIT / 100],
            "ceiling",
            disableBumping
          )(mapData);

          if (isOccupied(x - 1, y, grid) !== true) {
            setTexture(wallTextures.right, mapData);
            wall(
              [
                left + x * UNIT - UNIT / 2,
                0,
                -(top + (y + 1) * UNIT) - UNIT / 2,
              ],
              "right"
            )(mapData);

            setTexture(textures.backrooms.wallMold, mapData);
            wall(
              [
                left + x * UNIT - UNIT / 2 + 1,
                0,
                -(top + (y + 1) * UNIT) - UNIT / 2,
              ],
              "right",
              { height: 1 }
            )(mapData);
          }
          if (isOccupied(x + 1, y, grid) !== true) {
            setTexture(wallTextures.left, mapData);
            wall(
              [
                left + x * UNIT + UNIT / 2,
                0,
                -(top + (y + 1) * UNIT) - UNIT / 2,
              ],
              "left"
            )(mapData);

            setTexture(textures.backrooms.wallMold, mapData);
            wall(
              [
                left + x * UNIT + UNIT / 2 - 1,
                0,
                -(top + (y + 1) * UNIT) - UNIT / 2,
              ],
              "left",
              { height: 1 }
            )(mapData);
          }
          if (isOccupied(x, y + 1, grid) !== true) {
            setTexture(wallTextures.front, mapData);
            wall(
              [
                left + (x - 1) * UNIT - UNIT / 2,
                0,
                -(top + y * UNIT) - UNIT / 2,
              ],
              "front"
            )(mapData);

            setTexture(textures.backrooms.wallMold, mapData);
            wall(
              [
                left + (x - 1) * UNIT - UNIT / 2,
                0,
                -(top + y * UNIT) - UNIT / 2 + 1,
              ],
              "front",
              { height: 1 }
            )(mapData);
          }
          if (isOccupied(x, y - 1, grid) !== true) {
            setTexture(wallTextures.back, mapData);
            wall(
              [
                left + (x - 1) * UNIT - UNIT / 2,
                0,
                -(top + y * UNIT) + UNIT / 2,
              ],
              "back"
            )(mapData);

            setTexture(textures.backrooms.wallMold, mapData);
            wall(
              [
                left + (x - 1) * UNIT - UNIT / 2,
                0,
                -(top + y * UNIT) + UNIT / 2 - 1,
              ],
              "back",
              { height: 1 }
            )(mapData);
          }
        }
      }
    }

    return mapData;
  };
};

const generate = async (config) => {
  defineCeilingLamp();
  defineCeilingDiffuser();

  overridePlayerScript();
  createWelcomeMarker([0, 0, 0], config);

  const runes = ["aam", "folgora", "taar"];
  circleOfVectors([0, 0, UNIT / 2], 40, 3).forEach((pos, idx) => {
    createRune(runes[idx], pos, [0, 0, 0]);
  });

  const grid = compose(
    (grid) => {
      for (let i = 0; i < config.numberOfRooms; i++) {
        grid = addRoom(
          randomBetween(...config.roomDimensions.width),
          randomBetween(...config.roomDimensions.depth),
          grid
        );
      }
      return grid;
    },
    addRoom(3, 3),
    generateGrid
  )(50);

  return compose(
    saveToDisk,
    finalize,

    (mapData) => {
      const radius = getRadius(grid);
      const top = -radius * UNIT + UNIT / 2;
      const left = -radius * UNIT + UNIT / 2;

      const walls = [];
      const floors = [];

      const lamps = [];

      let isFirstLamp = true;

      for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
          if (isOccupied(x, y, grid)) {
            floors.push([x, y]);

            const offsetX = Math.floor(randomBetween(0, UNIT / 100)) * 100;
            const offsetZ = Math.floor(randomBetween(0, UNIT / 100)) * 100;

            if (x % 3 === 0 && y % 3 === 0) {
              const lampConfig = {
                on: Math.random() < 0.3,
              };

              if (isFirstLamp) {
                isFirstLamp = false;
                lampConfig.on = true;
              }

              const lamp = addLamp(
                [
                  left + x * UNIT - 50 + offsetX,
                  -(config.roomDimensions.height * UNIT - 10),
                  -(top + y * UNIT) - 50 + offsetZ,
                ],
                [0, 0, 0],
                lampConfig
              )(mapData);

              lamps.push(lamp);
            } else {
              if (Math.random() < 0.05) {
                createCeilingDiffuser([
                  left + x * UNIT - 50 + offsetX,
                  -(config.roomDimensions.height * UNIT - 5),
                  -(top + y * UNIT) - 50 + offsetZ,
                ]);
              }
            }

            if (isOccupied(x - 1, y, grid) !== true) {
              walls.push([x - 1, y, "right"]);
            }
            if (isOccupied(x + 1, y, grid) !== true) {
              walls.push([x + 1, y, "left"]);
            }
            if (isOccupied(x, y + 1, grid) !== true) {
              walls.push([x, y + 1, "front"]);
            }
            if (isOccupied(x, y - 1, grid) !== true) {
              walls.push([x, y - 1, "back"]);
            }
          }
        }
      }

      const [wallX, wallZ, wallFace] = pickRandoms(1, walls)[0];
      const [[keyX, keyZ], ...lootSlot] = pickRandoms(
        Math.floor(mapData.config.numberOfRooms / 3) + 5,
        floors
      );

      const key = createKey([
        left + keyX * UNIT - 50,
        0,
        -(top + keyZ * UNIT) - 50,
      ]);

      const jumpscareCtrl = createJumpscareController([-10, 0, -10], config);

      const loots = [
        (pos) =>
          createAlmondWater(
            pos,
            [0, 0, 0],
            getAlmondWaterVariant(),
            jumpscareCtrl
          ),
        // TODO: more loot
      ];

      lootSlot.forEach(([x, z]) => {
        const offsetX = Math.floor(randomBetween(0, UNIT / 100)) * 100;
        const offsetZ = Math.floor(randomBetween(0, UNIT / 100)) * 100;
        const pos = [
          left + x * UNIT - 50 + offsetX,
          0,
          -(top + z * UNIT) - 50 + offsetZ,
        ];
        pickRandoms(1, loots)[0](pos);
      });

      let translate = [0, 0, 0];
      let rotate = [0, 0, 0];

      switch (wallFace) {
        case "left":
          translate = [-80, 0, -75];
          rotate = [0, 180, 0];
          break;
        case "right":
          translate = [80, 0, 75];
          rotate = [0, 0, 0];
          break;
        case "back":
          translate = [75, 0, -80];
          rotate = [0, 270, 0];
          break;
        case "front":
          translate = [-75, 0, 80];
          rotate = [0, 90, 0];
          break;
      }

      const lampCtrl = createLampController([10, 0, 10], lamps, config);

      createExit(
        move(...translate, [left + wallX * UNIT, 0, -(top + wallZ * UNIT)]),
        rotate,
        key,
        lampCtrl
      );

      return mapData;
    },

    renderGrid(grid),

    setColor("#0b0c10"),

    movePlayerTo([0, 0, 0]),
    (mapData) => {
      mapData.meta.mapName = "The Backrooms";
      return mapData;
    },
    generateBlankMapData
  )(config);
};

module.exports = generate;
