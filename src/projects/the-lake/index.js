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
} = require("../../helpers");
const { plain } = require("../../prefabs");
const { disableBumping } = require("../../prefabs/plain");
const { getInjections } = require("../../scripting");

const createWelcomeMarker = (pos) => (config) => {
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

const generate = async (config) => {
  const { origin } = config;

  const welcomeMarker = createWelcomeMarker([0, 0, 0])(config);

  return compose(
    saveToDisk,
    finalize,

    plain([0, 0, 0], [10, 10], "floor"),
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
