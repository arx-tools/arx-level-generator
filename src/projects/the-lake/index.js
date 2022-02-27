const { compose } = require("ramda");
const { ambiences } = require("../../assets/ambiences");
const {
  items,
  createItem,
  moveTo,
  markAsUsed,
  addScript,
} = require("../../assets/items");
const { textures } = require("../../assets/textures");
const {
  saveToDisk,
  finalize,
  generateBlankMapData,
  movePlayerTo,
  addZone,
  setColor,
  setTexture,
  addLight,
} = require("../../helpers");
const { plain, wallX } = require("../../prefabs");
const { disableBumping } = require("../../prefabs/plain");
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

const generate = async (config) => {
  const { origin } = config;

  const welcomeMarker = createWelcomeMarker([500, 0, 500]);

  createPlant([700, 0, 700]);

  return compose(
    saveToDisk,
    finalize,

    (mapData) => {
      addLight([0, -2000, 0], {
        fallstart: 3000,
        fallend: 3000,
        intensity: 3,
      })(mapData);

      return mapData;
    },
    setColor("white"),

    plain([0, 10, 0], [23, 23], "floor", disableBumping),
    setTexture(textures.water.cave),
    setColor("lightblue"),

    plain([-450, 210, 450], [10, 10], "floor"),
    plain([-450, 140, -450], [10, 10], "floor"),
    plain([450, 70, -450], [10, 10], "floor"),
    plain([450, 0, 450], [10, 10], "floor"),
    setTexture(textures.gravel.ground1),
    setColor("lime"),

    addZone(
      [-origin[0], 0, -origin[2]],
      [100, 0, 100],
      "palette0",
      ambiences.none,
      5000
    ),
    setColor("#DBF4FF"),

    movePlayerTo([-origin[0], 0, -origin[2]]),
    (mapData) => {
      mapData.meta.mapName = "The Lake";
      return mapData;
    },

    generateBlankMapData
  )(config);
};

module.exports = generate;
