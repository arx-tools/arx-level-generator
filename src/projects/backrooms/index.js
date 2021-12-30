const { compose, map } = require("ramda");
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

const generate = async (config) => {
  const { origin } = config;

  defineCeilingLamp();
  createCeilingLamp([50, -290, 50]);

  return compose(
    saveToDisk,
    finalize,

    addLight([50, -260, 50]),
    setColor("white"),

    unsetPolygonGroup,
    (mapData) => {
      for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 20; x++) {
          wallX(
            move(525, -25 - y * 50, -475 + x * 50, origin),
            "left",
            null,
            0,
            50
          )(mapData);
        }
      }
      return mapData;
    },
    setTexture(textures.backrooms.wall),
    setPolygonGroup("wall-pattern"),

    unsetPolygonGroup,
    (mapData) => {
      for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 20; x++) {
          wallZ(
            move(-475 + x * 50, -25 - y * 50, 525, origin),
            "back",
            null,
            0,
            50
          )(mapData);
        }
      }
      return mapData;
    },
    setTexture(textures.backrooms.wall2),
    setPolygonGroup("wall-dotted"),

    unsetPolygonGroup,
    plain([0, -300, 0], [10, 10], "ceiling", disableBumping),
    setTexture(textures.backrooms.ceiling),
    setPolygonGroup("ceiling"),

    unsetPolygonGroup,
    plain([0, 0, 0], [10, 10], "floor", disableBumping),
    setTexture(textures.backrooms.floor),
    setPolygonGroup("floor"),

    setColor("#f0e68c"),

    movePlayerTo([0, 0, 0]),
    generateBlankMapData
  )(config);
};

module.exports = generate;
