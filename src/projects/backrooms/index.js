const { compose } = require("ramda");
const { textures } = require("../../assets/textures");
const {
  generateBlankMapData,
  finalize,
  saveToDisk,
  setPolygonGroup,
  unsetPolygonGroup,
  setColor,
  setTexture,
  movePlayerTo,
  addLight,
  move,
} = require("../../helpers");
const { wallX, wallZ } = require("../../prefabs");
const { plain, disableBumping } = require("../../prefabs/plain.js");
const { defineCeilingLamp, createCeilingLamp } = require("./items/ceilingLamp");
const { nanoid } = require("nanoid");
const {
  EXTRAS_SEMIDYNAMIC,
  EXTRAS_EXTINGUISHABLE,
  EXTRAS_STARTEXTINGUISHED,
  EXTRAS_NO_IGNIT,
} = require("../../constants");
const {
  markAsUsed,
  moveTo,
  addScript,
  createItem,
  items,
} = require("../../assets/items");
const { getInjections, declare } = require("../../scripting");

const wall = ([x, y, z], face) => {
  return (mapData) => {
    const id = nanoid(6);
    const { origin } = mapData.config;

    return compose(
      unsetPolygonGroup,
      (mapData) => {
        for (let height = 0; height < 6; height++) {
          for (let width = 0; width < 20; width++) {
            (face === "left" || face === "right" ? wallX : wallZ)(
              move(
                x + 25 + (face === "front" || face === "back" ? width * 50 : 0),
                y - 25 - height * 50,
                z + 25 + (face === "left" || face === "right" ? width * 50 : 0),
                origin
              ),
              face,
              null,
              0,
              50
            )(mapData);
          }
        }
        return mapData;
      },
      setPolygonGroup(`${id}-wall`)
    )(mapData);
  };
};

const addLamp = (pos) => (mapData) => {
  createCeilingLamp(pos);

  return compose(
    addLight(move(0, 20, 0, pos), {
      fallstart: 100,
      fallend: 800,
      intensity: 2,
      exFlicker: {
        r: 0.2,
        g: 0,
        b: 0,
      },
      extras:
        EXTRAS_SEMIDYNAMIC |
        EXTRAS_EXTINGUISHABLE |
        EXTRAS_STARTEXTINGUISHED |
        EXTRAS_NO_IGNIT,
    }),
    setColor("khaki")
  )(mapData);
};

const createWelcomeMarker = (pos) => {
  return compose(
    markAsUsed,
    moveTo(pos, [0, 0, 0]),
    addScript((self) => {
      return `
// component: welcomeMarker
ON INIT {
  ${getInjections("init", self)}
  ACCEPT
}
      `;
    }),
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

const generate = async (config) => {
  defineCeilingLamp();
  createWelcomeMarker([0, 0, 0]);

  createRune("aam", [250, 0, 240], [0, 114, 0]);
  createRune("folgora", [290, 0, 250], [0, 90, 0]);
  createRune("taar", [230, 0, 280], [0, 43, 0]);

  return compose(
    saveToDisk,
    finalize,

    addLamp([50, -290, 50]),

    wall([-500, 0, -500], "right"),
    setTexture(
      Math.random() > 0.5 ? textures.backrooms.wall : textures.backrooms.wall2
    ),

    wall([500, 0, -500], "left"),
    setTexture(
      Math.random() > 0.5 ? textures.backrooms.wall : textures.backrooms.wall2
    ),

    wall([-500, 0, 500], "back"),
    setTexture(
      Math.random() > 0.5 ? textures.backrooms.wall : textures.backrooms.wall2
    ),

    wall([-500, 0, -500], "front"),
    setTexture(
      Math.random() > 0.5 ? textures.backrooms.wall : textures.backrooms.wall2
    ),

    unsetPolygonGroup,
    plain([0, -300, 0], [10, 10], "ceiling", disableBumping),
    setTexture(textures.backrooms.ceiling),
    setPolygonGroup("ceiling"),

    unsetPolygonGroup,
    plain([0, 0, 0], [10, 10], "floor", disableBumping),
    setTexture(textures.backrooms.floor),
    setPolygonGroup("floor"),

    setColor("#1e1d11"),

    movePlayerTo([0, 0, 0]),
    generateBlankMapData
  )(config);
};

module.exports = generate;
