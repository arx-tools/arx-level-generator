const { compose } = require("ramda");
const {
  generateBlankMapData,
  movePlayerTo,
  finalize,
  saveToDisk,
  setColor,
  addZone,
} = require("../../helpers");
const island = require("./island.js");
// const bridge = require("./bridge.js");
const { NORTH, WEST, SOUTH, EAST, colors } = require("./constants.js");
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
  compose(
    markAsUsed,
    moveTo([0, -300, 0], [0, 0, 0]),
    addScript((self) => {
      return `
ON INIT {
  ${getInjections("init", self)}
  SETCONTROLLEDZONE welcome
  CINEMASCOPE ON
  WORLDFADE OUT 0 ${color(colors.ambience)}
  ACCEPT
}

ON CONTROLLEDZONE_ENTER {
  if (${self.state.hadIntro} == 0) {
    SET ${self.state.hadIntro} 1
    SETPLAYERCONTROLS OFF
    TIMERfade 1 2 worldfade IN 2000
    SPEAK -a [alia_nightmare2] GOTO READY
    ACCEPT
  }
  ACCEPT
}

>>READY
  CINEMASCOPE -s OFF
  SETPLAYERCONTROLS ON
  ACCEPT
      `;
    }),
    declare("int", "hadIntro", 0),
    createItem
  )(items.marker);
};

const generate = async (config) => {
  createWelcomeMarker([0, 0, 0]);

  return compose(
    saveToDisk,
    finalize,

    // bridge({
    //   length: 33,
    // }),
    island({
      pos: [0, 0, 0],
      exits: NORTH | WEST,
    }),

    addZone([0, 0, 0], "welcome", ambiences.sirs),
    setColor(colors.ambience),

    movePlayerTo([0, 0, 0]),
    generateBlankMapData
  )(config);
};

module.exports = generate;
