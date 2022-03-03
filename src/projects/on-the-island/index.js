const { compose, identity } = require("ramda");
const { ambiences } = require("../../assets/ambiences");
const {
  items,
  createItem,
  moveTo,
  markAsUsed,
  addScript,
} = require("../../assets/items");
const { textures } = require("../../assets/textures");
const { HFLIP, VFLIP } = require("../../constants");
const {
  saveToDisk,
  finalize,
  generateBlankMapData,
  movePlayerTo,
  addZone,
  setColor,
  setTexture,
  addLight,
  pickRandom,
  circleOfVectors,
  setPolygonGroup,
  unsetPolygonGroup,
} = require("../../helpers");
const { plain, wallX } = require("../../prefabs");
const {
  disableBumping,
  connectToNearPolygons,
} = require("../../prefabs/plain");
const { getInjections } = require("../../scripting");

const createWelcomeMarker = (pos) => {
  return compose(
    markAsUsed,
    moveTo(pos, [0, 0, 0]),
    addScript((self) => {
      return `
// component: welcomeMarker
ON INIT {
  ${getInjections("init", self)}
  SETCONTROLLEDZONE palette0
  ACCEPT
}

ON CONTROLLEDZONE_ENTER {
  TELEPORT -p ${self.ref}
  ACCEPT
}
      `;
    }),
    createItem
  )(items.marker);
};

const createPlant = (pos) => {
  return compose(
    markAsUsed,
    moveTo(pos, [0, 0, 0]),
    createItem
  )(items.plants.fern);
};

const createAmikarsRock = (pos) => {
  return compose(
    markAsUsed,
    moveTo(pos, [0, 0, 0]),
    createItem
  )(items.magic.amikarsRock);
};

const createCompanion = (pos, angle) => {
  return compose(
    markAsUsed,
    moveTo(pos, angle),
    addScript((self) => {
      return `
// component createCompanion
ON INIT {
  ${getInjections("init", self)}
  SPAWN NPC goblin_base/goblin_base ${self.ref}
  ACCEPT
}
      `;
    }),
    createItem
  )(items.marker);
};

const generate = async (config) => {
  const { origin } = config;

  createWelcomeMarker([500, 0, 500]);

  createPlant([700, 0, 700]);
  createCompanion([250, 0, 250], [0, 135, 0]);

  createAmikarsRock([-500, 220, 500]);

  return compose(
    saveToDisk,
    finalize,

    (mapData) => {
      circleOfVectors([0, -1000, 0], 1000, 3).forEach((pos) => {
        addLight(pos, {
          fallstart: 1,
          fallend: 3000,
          intensity: 3,
        })(mapData);
      });

      return mapData;
    },
    setColor("white"),

    plain([0, 10, 0], [50, 50], "floor", disableBumping),
    setTexture(textures.water.cave),
    // setColor("red"),

    unsetPolygonGroup,
    plain(
      [-500, 210, 500],
      [10, 10],
      "floor",
      connectToNearPolygons("island-3", 150),
      () => ({
        textureRotation: pickRandom([0, 90, 180, 270]),
        textureFlags: pickRandom([0, HFLIP, VFLIP, HFLIP | VFLIP]),
      })
    ),
    setPolygonGroup("island-4"),
    plain(
      [-500, 140, -500],
      [10, 10],
      "floor",
      connectToNearPolygons("island-2"),
      () => ({
        textureRotation: pickRandom([0, 90, 180, 270]),
        textureFlags: pickRandom([0, HFLIP, VFLIP, HFLIP | VFLIP]),
      })
    ),
    setPolygonGroup("island-3"),
    plain(
      [500, 70, -500],
      [10, 10],
      "floor",
      connectToNearPolygons("island-1"),
      () => ({
        textureRotation: pickRandom([0, 90, 180, 270]),
        textureFlags: pickRandom([0, HFLIP, VFLIP, HFLIP | VFLIP]),
      })
    ),
    setPolygonGroup("island-2"),
    plain([500, 0, 500], [10, 10], "floor", identity, () => ({
      textureRotation: pickRandom([0, 90, 180, 270]),
      textureFlags: pickRandom([0, HFLIP, VFLIP, HFLIP | VFLIP]),
    })),
    setPolygonGroup("island-1"),
    setTexture(textures.gravel.ground1),
    setColor("hsv(150, 37%, 70%)"),

    addZone(
      [-origin[0], 0, -origin[2]],
      [100, 0, 100],
      "palette0",
      ambiences.none,
      2000
    ),
    setColor("#DBF4FF"),

    movePlayerTo([-origin[0], 0, -origin[2]]),
    (mapData) => {
      mapData.meta.mapName = "On the island";
      return mapData;
    },

    generateBlankMapData
  )(config);
};

module.exports = generate;

/*
TODOs:
 - create a custom goblin from goblin_base
 - add some cards to the map
 - add possibility to give the cards to the goblin
 - add fireplace to the center of the island-1
 - add invisible wall around the 4 islands -- need transparent textures for that
 - add a small yellow brick wall to connect island-1 and island-4

lol, make a small quest where they got drunk, woke up somewhere random and now have to find their lost cards 🥴
*/
