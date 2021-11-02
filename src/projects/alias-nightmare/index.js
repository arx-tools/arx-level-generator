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
    TIMERmove -m 1 10 SPEAK -p [alia_nightmare2] GOTO READY
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

const generateAtLeastOneExit = () => {
  return (
    Math.round(randomBetween(NONE, ALL)) || 1 << Math.round(randomBetween(0, 3))
  );
};

const generate = async (config) => {
  const { origin } = config;
  createWelcomeMarker([0, 0, 0]);

  return compose(
    saveToDisk,
    finalize,

    island({
      pos: [0, 0, 0],
      exits: generateAtLeastOneExit(),
      width: 14,
      height: 9,
    }),

    addZone(
      [-origin[0], 0, -origin[2]],
      [100, 0, 100],
      "palette0",
      ambiences.sirs
    ),
    setColor(colors.ambience[0]),

    movePlayerTo([-origin[0], 0, -origin[2]]),
    generateBlankMapData
  )(config);
};

module.exports = generate;
