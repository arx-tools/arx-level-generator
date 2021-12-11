const { compose, reduce, __ } = require("ramda");
const {
  generateBlankMapData,
  movePlayerTo,
  finalize,
  saveToDisk,
  setColor,
  addZone,
  randomBetween,
  circleOfVectors,
} = require("../../helpers");
const island = require("./island.js");
const {
  colors,
  NONE,
  ALL,
  NORTH,
  EAST,
  SOUTH,
  WEST,
} = require("./constants.js");
const { ambiences } = require("../../assets/ambiences");
const {
  items,
  createItem,
  markAsUsed,
  moveTo,
  addScript,
} = require("../../assets/items");
const { declare, color, getInjections } = require("../../scripting");
const bridges = require("./bridges");
const { createSmellyFlower } = require("./items/smellyFlower");
const { createHangingCorpse } = require("./items/hangingCorpse");
const { createStatue, defineStatue } = require("./items/statue");

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
  createHangingCorpse([-300, -150, -200], [0, 145, 0], {
    name: "[public_falan_tomb]",
  });

  circleOfVectors([3000, 0, 3000], 200, 9).forEach((pos) => {
    createSmellyFlower(pos);
  });

  defineStatue();
  createStatue([3000, 0, 3000]);

  // TODO: other coordinates in this generate function should be derived from these island coordinates
  const islands = [
    {
      pos: [0, 0, 0],
      entrances: EAST,
      exits: NORTH,
      width: 14,
      height: 10,
    },
    {
      pos: [100, -500, 3000],
      entrances: SOUTH | WEST,
      exits: EAST,
      width: 10,
      height: 10,
    },
    {
      pos: [3000, -200, 3000],
      entrances: WEST,
      exits: NONE,
      width: 10,
      height: 14,
    },
    {
      pos: [0, 100, 4000],
      entrances: SOUTH,
      exits: NONE,
      width: 6,
      height: 6,
    },
  ];

  return compose(
    saveToDisk,
    finalize,

    bridges(islands),
    reduce((mapData, config) => island(config)(mapData), __, islands),

    addZone(
      [-origin[0], 0, -origin[2]],
      [100, 0, 100],
      "palette0",
      ambiences.sirs,
      5000
    ),
    setColor(colors.ambience[0]),

    movePlayerTo([-origin[0], 0, -origin[2]]),
    generateBlankMapData
  )(config);
};

module.exports = generate;
