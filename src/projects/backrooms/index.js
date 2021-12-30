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
  EXTRAS_SPAWNSMOKE,
} = require("../../constants");

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

const generate = async (config) => {
  defineCeilingLamp();
  createCeilingLamp([50, -290, 50]);

  return compose(
    saveToDisk,
    finalize,

    addLight([50, -270, 50], {
      fallstart: 100,
      fallend: 800,
      intensity: 2,
      exFlicker: {
        r: 0.1,
        g: 0,
        b: 0,
      },
      extras:
        EXTRAS_SEMIDYNAMIC |
        EXTRAS_EXTINGUISHABLE |
        EXTRAS_STARTEXTINGUISHED |
        EXTRAS_NO_IGNIT,
    }),
    setColor("khaki"),

    wall([-500, 0, -500], "right"),
    wall([500, 0, -500], "left"),
    setTexture(textures.backrooms.wall),

    wall([-500, 0, 500], "back"),
    wall([-500, 0, -500], "front"),
    setTexture(textures.backrooms.wall2),

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
