const { compose } = require("ramda");
const {
  generateBlankMapData,
  movePlayerTo,
  finalize,
  saveToDisk,
  setColor,
  addZone,
  randomBetween,
} = require("../../helpers");
const island = require("./island.js");
const { colors, NONE, ALL } = require("./constants.js");
const { ambiences } = require("../../assets/ambiences");
const {
  items,
  createItem,
  markAsUsed,
  moveTo,
  addScript,
} = require("../../assets/items");
const { declare, color, getInjections } = require("../../scripting");

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
  CINEMASCOPE ON
  WORLDFADE OUT 0 ${color(colors.ambience[0])}
  ACCEPT
}
ON CONTROLLEDZONE_ENTER {
  if (${self.state.hadIntro} == 0) {
    TELEPORT -p ${self.ref}
    SET ${self.state.hadIntro} 1
    SETPLAYERCONTROLS OFF
    TIMERfade 1 2 worldfade IN 2000
    SPEAK -p [alia_nightmare2] GOTO READY
    ACCEPT
  }
  ACCEPT
}
>>READY {
  CINEMASCOPE -s OFF
  SETPLAYERCONTROLS ON
  ACCEPT
}
      `;
    }),
    declare("int", "hadIntro", 0),
    createItem
  )(items.marker);
};

const generate = async (config) => {
  createWelcomeMarker([0, 0, 0]);

  const mainIslandExits =
    Math.round(randomBetween(NONE, ALL)) ||
    1 << Math.round(randomBetween(0, 3));

  return compose(
    saveToDisk,
    finalize,

    island({
      pos: [0, 0, 0],
      exits: mainIslandExits,
    }),

    addZone([-600, 0, -1000], [100, 0, 100], "palette4", ambiences.sirs),
    setColor(colors.ambience[4]),
    addZone([-700, 0, -1000], [100, 0, 100], "palette3", ambiences.sirs),
    setColor(colors.ambience[3]),
    addZone([-800, 0, -1000], [100, 0, 100], "palette2", ambiences.sirs),
    setColor(colors.ambience[2]),
    addZone([-900, 0, -1000], [100, 0, 100], "palette1", ambiences.sirs),
    setColor(colors.ambience[1]),
    addZone([-1000, 0, -1000], [100, 0, 100], "palette0", ambiences.sirs),
    setColor(colors.ambience[0]),

    movePlayerTo([-1000, 0, -1000]),
    generateBlankMapData
  )(config);
};

module.exports = generate;
