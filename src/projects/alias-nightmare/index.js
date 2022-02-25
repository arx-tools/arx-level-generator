const { compose, reduce, __, addIndex } = require("ramda");
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
  addDependencyAs,
  addDependency,
} = require("../../assets/items");
const { declare, color, getInjections } = require("../../scripting");
const bridges = require("./bridges");
const { createSmellyFlower } = require("./items/smellyFlower");
const { createHangingCorpse } = require("./items/hangingCorpse");
const { createStatue, defineStatue } = require("./items/statue");
const { stairs } = require("../../prefabs");

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
  // CINEMASCOPE ON
  // WORLDFADE OUT 0 ${color(colors.ambience[0])}

  ACCEPT
}
ON CONTROLLEDZONE_ENTER {
  if (${self.state.hadIntro} == 0) {
    TELEPORT -p ${self.ref}
    SET ${self.state.hadIntro} 1
    SETPLAYERCONTROLS OFF
    // TIMERfade 1 2 worldfade IN 2000
    GOTO READY // TIMERmove -m 1 10 SPEAK -p [alia_nightmare2] GOTO READY

    ACCEPT
  }
  ACCEPT
}
>>READY {
  CINEMASCOPE -s OFF
  SETPLAYERCONTROLS ON

  INVENTORY PLAYERADD special/wall_block/wall_block
  INVENTORY PLAYERADD special/wall_block/wall_block
  INVENTORY PLAYERADD special/wall_block/wall_block
  INVENTORY PLAYERADD special/wall_block/wall_block

  ACCEPT
}
      `;
    }),
    declare("int", "hadIntro", 0),
    addDependency("graph/levels/level1/map.bmp"),
    addDependencyAs(
      "projects/alias-nightmare/loading.bmp",
      `graph/levels/level${config.levelIdx}/loading.bmp`
    ),
    createItem
  )(items.marker);
};

const generateFallSaver = (pos, idx, target) => {
  return compose(
    markAsUsed,
    moveTo(pos, [0, 0, 0]),
    addScript((self) => {
      return `
// component fallsaver
ON INIT {
  ${getInjections("init", self)}
  SETCONTROLLEDZONE "fall-detector-${idx}"
  ACCEPT
}

ON CONTROLLEDZONE_ENTER {
  TELEPORT -p ${target.ref}
  ACCEPT
}
      `;
    }),
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

  const islands = [
    {
      pos: [0, 0, 0],
      entrances: EAST,
      exits: NORTH,
      width: 12,
      height: 10,
    },
    {
      pos: [0, -200, 2500],
      entrances: SOUTH | NORTH,
      exits: EAST,
      width: 10,
      height: 10,
    },
    {
      pos: [3000, -100, 2400],
      entrances: WEST,
      exits: NONE,
      width: 10,
      height: 8,
    },
    {
      pos: [0, -500, 4500],
      entrances: SOUTH,
      exits: NONE,
      width: 6,
      height: 6,
    },
  ];

  const welcomeMarker = createWelcomeMarker(islands[0].pos)(config);
  /*
  createHangingCorpse([-300, -150, -200], [0, 145, 0], {
    name: "[public_falan_tomb]",
  });
  */

  circleOfVectors(islands[2].pos, 200, 9).forEach((pos) => {
    createSmellyFlower(pos);
  });

  defineStatue();
  createStatue(islands[2].pos);

  generateFallSaver(islands[0].pos, 0, welcomeMarker);
  generateFallSaver(islands[1].pos, 1, welcomeMarker);
  generateFallSaver(islands[2].pos, 2, welcomeMarker);
  generateFallSaver(islands[3].pos, 3, welcomeMarker);

  return compose(
    saveToDisk,
    finalize,

    bridges(islands),
    addIndex(reduce)(
      (mapData, config, idx) => island({ ...config, idx })(mapData),
      __,
      islands
    ),

    // stairs([300, -50, 600]),
    // setColor(colors.terrain),

    // TODO: pillars for every island is a bit too expensive
    // pillars(
    //   pos,
    //   30,
    //   [width * 100 * 3, height * 100 * 3],
    //   [width * 100 + 50, height * 100 + 50],
    //   [
    //     (exits | entrances) & NORTH ? 350 : 0,
    //     (exits | entrances) & EAST ? 350 : 0,
    //     (exits | entrances) & SOUTH ? 350 : 0,
    //     (exits | entrances) & WEST ? 350 : 0,
    //   ]
    // ),
    // setPolygonGroup(`${id}-pillars`),
    // setTexture(textures.stone.humanPriest4),
    // setColor(colors.pillars)afternoon gellert spa

    addZone(
      [-origin[0], 0, -origin[2]],
      [100, 0, 100],
      "palette0",
      ambiences.sirs,
      5000
    ),
    setColor(colors.ambience[0]),

    movePlayerTo([-origin[0], 0, -origin[2]]),
    (mapData) => {
      mapData.meta.mapName = "Alia's Nightmare";
      return mapData;
    },
    generateBlankMapData
  )(config);
};

module.exports = generate;
