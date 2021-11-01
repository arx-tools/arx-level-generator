const { compose, map, F, evolve } = require("ramda");
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
const { plain } = require("../../prefabs");
const { useTexture, textures } = require("../../assets/textures");

const createWelcomeMarker = (pos) => {
  return compose(
    markAsUsed,
    moveTo(pos, [0, 0, 0]),
    addScript((self) => {
      return `
// component: welcomeMarker
ON INIT {
  ${getInjections("init", self)}
  SETCONTROLLEDZONE welcome
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

// const createKillzoneMarker = (pos) => {
//   return compose(
//     markAsUsed,
//     moveTo(pos, [0, 0, 0]),
//     addScript((self) => {
//       return `
// // component: killzoneMarker
// ON INIT {
//   ${getInjections("init", self)}
//   SETCONTROLLEDZONE killzone
//   ACCEPT
// }
// ON CONTROLLEDZONE_ENTER {
//   WORLDFADE OUT 3000 ${color("black")}
//   TIMERfade 1 3 GOTO KILL ^$PARAM1
//   ACCEPT
// }
// >>KILL {
//   HEROSAY ^$PARAM1
//   ACCEPT
// }
//       `;
//     }),
//     createItem
//   )(items.marker);
// };

const generate = async (config) => {
  createWelcomeMarker([0, 0, 0]);
  // createKillzoneMarker([0, 200, 0]);

  return compose(
    saveToDisk,
    finalize,

    // bridge({
    //   length: 33,
    // }),
    island({
      pos: [0, 0, 0],
      exits: NORTH | WEST | EAST | SOUTH,
    }),

    addZone([-1000, 0, -1000], [200, 0, 200], "welcome", ambiences.sirs),
    setColor(colors.ambience[0]),

    // addZone(
    //   [0, 500, 0],
    //   [config.origin[0] * 2, 20, config.origin[2] * 2],
    //   "killzone",
    //   ambiences.none
    // ),
    // setColor(colors.ambience[0]),

    movePlayerTo([-1000, 0, -1000]),
    generateBlankMapData
  )(config);
};

module.exports = generate;
