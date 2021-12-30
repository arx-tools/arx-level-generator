const { compose, map, props, any, __, when } = require("ramda");
const {
  setColor,
  move,
  isPointInPolygon,
  addLight,
  setTexture,
  setPolygonGroup,
  unsetPolygonGroup,
} = require("../../helpers.js");
const { colors, NORTH, SOUTH, WEST, EAST, NONE } = require("./constants.js");
const { plain, connectToNearPolygons } = require("../../prefabs/plain.js");
const { declare, getInjections } = require("../../scripting.js");
const {
  items,
  moveTo,
  createItem,
  addScript,
  markAsUsed,
} = require("../../assets/items.js");
const { isNotEmpty } = require("ramda-adjunct");
const { textures } = require("../../assets/textures.js");
const { nanoid } = require("nanoid");
const { ISLAND_JOINT_LENGTH } = require("../../constants.js");

// PP = pressure plate

const getPPIndices = (exits) => {
  // [0 1]
  // [2 3]
  switch (exits) {
    case NORTH | SOUTH | WEST | EAST:
    case NORTH | SOUTH | EAST:
    case NORTH | SOUTH | WEST:
    case NORTH | EAST | WEST:
    case SOUTH | EAST | WEST:
    case NORTH | SOUTH:
    case EAST | WEST:
      return [0, 1, 2, 3];
    case NORTH | WEST:
      return [0, 1, 2];
    case NORTH | EAST:
      return [0, 1, 3];
    case SOUTH | WEST:
      return [0, 2, 3];
    case SOUTH | EAST:
      return [1, 2, 3];
    case NORTH:
      return [0, 1];
    case SOUTH:
      return [2, 3];
    case EAST:
      return [1, 3];
    case WEST:
      return [0, 2];
    default:
      return [];
  }
};

const createPressurePlates = (eventBus) => {
  const pp0 = compose(
    declare("int", "onme", 0),
    createItem
  )(items.mechanisms.pressurePlate);
  addScript(
    `
// component: island.pp0
  ON INIT {
    SETSCALE 101
    ${getInjections("init", pp0)}
    ACCEPT
  }

  ON INITEND {
    TIMERontop -im 0 500 GOTO TOP
    ACCEPT
  }

  >>TOP
    IF ( ^$OBJONTOP == "NONE" ) {
      IF ( ${pp0.state.onme} == 1 ) {
        SET ${pp0.state.onme} 0
        PLAYANIM ACTION2
        SENDEVENT CUSTOM ${eventBus.ref} "pp0.released"
      }
      ACCEPT
    }
    IF ( ${pp0.state.onme} == 0 ) {
      SET ${pp0.state.onme} 1
      PLAYANIM ACTION1
      SENDEVENT CUSTOM ${eventBus.ref} "pp0.pressed"
    }
    ACCEPT
  `,
    pp0
  );

  const pp1 = compose(
    declare("int", "onme", 0),
    createItem
  )(items.mechanisms.pressurePlate);
  addScript(
    `
// component: island.pp1
  ON INIT {
    SETSCALE 101
    ${getInjections("init", pp1)}
    ACCEPT
  }

  ON INITEND {
    TIMERontop -im 0 500 GOTO TOP
    ACCEPT
  }

  >>TOP
    IF ( ^$OBJONTOP == "NONE" ) {
      IF ( ${pp1.state.onme} == 1 ) {
        SET ${pp1.state.onme} 0
        PLAYANIM ACTION2
        SENDEVENT CUSTOM ${eventBus.ref} "pp1.released"
      }
      ACCEPT
    }
    IF ( ${pp1.state.onme} == 0 ) {
      SET ${pp1.state.onme} 1
      PLAYANIM ACTION1
      SENDEVENT CUSTOM ${eventBus.ref} "pp1.pressed"
    }
    ACCEPT
  `,
    pp1
  );

  const pp2 = compose(
    declare("int", "onme", 0),
    createItem
  )(items.mechanisms.pressurePlate);
  addScript(
    `
// component: island.pp2
  ON INIT {
    SETSCALE 101
    ${getInjections("init", pp2)}
    ACCEPT
  }

  ON INITEND {
    TIMERontop -im 0 500 GOTO TOP
    ACCEPT
  }

  >>TOP
    IF ( ^$OBJONTOP == "NONE" ) {
      IF ( ${pp2.state.onme} == 1 ) {
        SET ${pp2.state.onme} 0
        PLAYANIM ACTION2
        SENDEVENT CUSTOM ${eventBus.ref} "pp2.released"
      }
      ACCEPT
    }
    IF ( ${pp2.state.onme} == 0 ) {
      SET ${pp2.state.onme} 1
      PLAYANIM ACTION1
      SENDEVENT CUSTOM ${eventBus.ref} "pp2.pressed"
    }
    ACCEPT
  `,
    pp2
  );

  const pp3 = compose(
    declare("int", "onme", 0),
    createItem
  )(items.mechanisms.pressurePlate);
  addScript(
    `
// component: island.pp3
  ON INIT {
    SETSCALE 101
    ${getInjections("init", pp3)}
    ACCEPT
  }

  ON INITEND {
    TIMERontop -im 0 500 GOTO TOP
    ACCEPT
  }

  >>TOP
    IF ( ^$OBJONTOP == "NONE" ) {
      IF ( ${pp3.state.onme} == 1 ) {
        SET ${pp3.state.onme} 0
        PLAYANIM ACTION2
        SENDEVENT CUSTOM ${eventBus.ref} "pp3.released"
      }
      ACCEPT
    }
    IF ( ${pp3.state.onme} == 0 ) {
      SET ${pp3.state.onme} 1
      PLAYANIM ACTION1
      SENDEVENT CUSTOM ${eventBus.ref} "pp3.pressed"
    }
    ACCEPT
  `,
    pp3
  );

  return [pp0, pp1, pp2, pp3];
};

const createEventBus = (gates) => {
  const eventBus = compose(
    declare("int", "northGateOpened", 0),
    declare("int", "southGateOpened", 0),
    declare("int", "westGateOpened", 0),
    declare("int", "eastGateOpened", 0),
    declare("int", "pp0pressed", 0),
    declare("int", "pp1pressed", 0),
    declare("int", "pp2pressed", 0),
    declare("int", "pp3pressed", 0),
    createItem
  )(items.marker);

  addScript(
    `
// component: island.eventBus
ON INIT {
  ${getInjections("init", eventBus)}
  ACCEPT
}

ON CUSTOM {
  if ("pp0." isin ^$PARAM1) {
    if ("pressed" isin ^$PARAM1) {
      SET ${eventBus.state.pp0pressed} 1
    } else {
      SET ${eventBus.state.pp0pressed} 0
    }
  }

  if ("pp1." isin ^$PARAM1) {
    if ("pressed" isin ^$PARAM1) {
      SET ${eventBus.state.pp1pressed} 1
    } else {
      SET ${eventBus.state.pp1pressed} 0
    }
  }

  if ("pp2." isin ^$PARAM1) {
    if ("pressed" isin ^$PARAM1) {
      SET ${eventBus.state.pp2pressed} 1
    } else {
      SET ${eventBus.state.pp2pressed} 0
    }
  }

  if ("pp3." isin ^$PARAM1) {
    if ("pressed" isin ^$PARAM1) {
      SET ${eventBus.state.pp3pressed} 1
    } else {
      SET ${eventBus.state.pp3pressed} 0
    }
  }

  if (${eventBus.state.pp0pressed} == 1) {
    if (${eventBus.state.pp1pressed} == 1) {
      if (${eventBus.state.northGateOpened} == 0) {
        SENDEVENT OPEN ${gates.north.ref} ""
        SET ${eventBus.state.northGateOpened} 1
      }
    } else {
      if (${eventBus.state.northGateOpened} == 1) {
        SENDEVENT CLOSE ${gates.north.ref} ""
        SET ${eventBus.state.northGateOpened} 0
      }
    }
  } else {
    if (${eventBus.state.northGateOpened} == 1) {
      SENDEVENT CLOSE ${gates.north.ref} ""
      SET ${eventBus.state.northGateOpened} 0
    }
  }

  if (${eventBus.state.pp2pressed} == 1) {
    if (${eventBus.state.pp3pressed} == 1) {
      if (${eventBus.state.southGateOpened} == 0) {
        SENDEVENT OPEN ${gates.south.ref} ""
        SET ${eventBus.state.southGateOpened} 1
      }
    } else {
      if (${eventBus.state.southGateOpened} == 1) {
        SENDEVENT CLOSE ${gates.south.ref} ""
        SET ${eventBus.state.southGateOpened} 0
      }
    }
  } else {
    if (${eventBus.state.southGateOpened} == 1) {
      SENDEVENT CLOSE ${gates.south.ref} ""
      SET ${eventBus.state.southGateOpened} 0
    }
  }

  if (${eventBus.state.pp1pressed} == 1) {
    if (${eventBus.state.pp3pressed} == 1) {
      if (${eventBus.state.eastGateOpened} == 0) {
        SENDEVENT OPEN ${gates.east.ref} ""
        SET ${eventBus.state.eastGateOpened} 1
      }
    } else {
      if (${eventBus.state.eastGateOpened} == 1) {
        SENDEVENT CLOSE ${gates.east.ref} ""
        SET ${eventBus.state.eastGateOpened} 0
      }
    }
  } else {
    if (${eventBus.state.eastGateOpened} == 1) {
      SENDEVENT CLOSE ${gates.east.ref} ""
      SET ${eventBus.state.eastGateOpened} 0
    }
  }

  if (${eventBus.state.pp0pressed} == 1) {
    if (${eventBus.state.pp2pressed} == 1) {
      if (${eventBus.state.westGateOpened} == 0) {
        SENDEVENT OPEN ${gates.west.ref} ""
        SET ${eventBus.state.westGateOpened} 1
      }
    } else {
      if (${eventBus.state.westGateOpened} == 1) {
        SENDEVENT CLOSE ${gates.west.ref} ""
        SET ${eventBus.state.westGateOpened} 0
      }
    }
  } else {
    if (${eventBus.state.westGateOpened} == 1) {
      SENDEVENT CLOSE ${gates.west.ref} ""
      SET ${eventBus.state.westGateOpened} 0
    }
  }

  ACCEPT
}
  `,
    eventBus
  );

  return eventBus;
};

const createGates = () => {
  const north = compose(
    declare("int", "open", 0),
    createItem
  )(items.doors.portcullis);
  addScript(
    `
// component island:gates.north
ON INIT {
  ${getInjections("init", north)}
  ACCEPT
}
ON LOAD {
  USE_MESH "L2_Gobel_portcullis\\L2_Gobel_portcullis.teo"
  ACCEPT
}
ON CLOSE {
  IF (${north.state.open} == 0) {
    ACCEPT
  }
  SET ${north.state.open} 0
  PLAYANIM -e ACTION2 COLLISION ON
  VIEWBLOCK ON
  PLAY ~£closesfx~
  REFUSE
}
ON OPEN {
  IF (${north.state.open} == 1) {
    ACCEPT
  }
  SET ${north.state.open} 1
  PLAYANIM -e ACTION1 COLLISION OFF
  PLAY ~£opensfx~
  VIEWBLOCK OFF
  ANCHOR_BLOCK OFF
  REFUSE
}
  `,
    north
  );

  const south = compose(
    declare("int", "open", 0),
    createItem
  )(items.doors.portcullis);
  addScript(
    `
// component island:gates.south
ON INIT {
  ${getInjections("init", south)}
  ACCEPT
}
ON LOAD {
  USE_MESH "L2_Gobel_portcullis\\L2_Gobel_portcullis.teo"
  ACCEPT
}
ON CLOSE {
  IF (${south.state.open} == 0) {
    ACCEPT
  }
  SET ${south.state.open} 0
  PLAYANIM -e ACTION2 COLLISION ON
  VIEWBLOCK ON
  PLAY ~£closesfx~
  REFUSE
}
ON OPEN {
  IF (${south.state.open} == 1) {
    ACCEPT
  }
  SET ${south.state.open} 1
  PLAYANIM -e ACTION1 COLLISION OFF
  PLAY ~£opensfx~
  VIEWBLOCK OFF
  ANCHOR_BLOCK OFF
  REFUSE
}
  `,
    south
  );

  const east = compose(
    declare("int", "open", 0),
    createItem
  )(items.doors.portcullis);
  addScript(
    `
// component island:gates.east
ON INIT {
  ${getInjections("init", east)}
  ACCEPT
}
ON LOAD {
  USE_MESH "L2_Gobel_portcullis\\L2_Gobel_portcullis.teo"
  ACCEPT
}
ON CLOSE {
  IF (${east.state.open} == 0) {
    ACCEPT
  }
  SET ${east.state.open} 0
  PLAYANIM -e ACTION2 COLLISION ON
  VIEWBLOCK ON
  PLAY ~£closesfx~
  REFUSE
}
ON OPEN {
  IF (${east.state.open} == 1) {
    ACCEPT
  }
  SET ${east.state.open} 1
  PLAYANIM -e ACTION1 COLLISION OFF
  PLAY ~£opensfx~
  VIEWBLOCK OFF
  ANCHOR_BLOCK OFF
  REFUSE
}
  `,
    east
  );

  const west = compose(
    declare("int", "open", 0),
    createItem
  )(items.doors.portcullis);
  addScript(
    `
// component island:gates.west
ON INIT {
  ${getInjections("init", west)}
  ACCEPT
}
ON LOAD {
  USE_MESH "L2_Gobel_portcullis\\L2_Gobel_portcullis.teo"
  ACCEPT
}
ON CLOSE {
  IF (${west.state.open} == 0) {
    ACCEPT
  }
  SET ${west.state.open} 0
  PLAYANIM -e ACTION2 COLLISION ON
  VIEWBLOCK ON
  PLAY ~£closesfx~
  REFUSE
}
ON OPEN {
  IF (${west.state.open} == 1) {
    ACCEPT
  }
  SET ${west.state.open} 1
  PLAYANIM -e ACTION1 COLLISION OFF
  PLAY ~£opensfx~
  VIEWBLOCK OFF
  ANCHOR_BLOCK OFF
  REFUSE
}
  `,
    west
  );

  return { north, south, east, west };
};

const island = (config) => (mapData) => {
  const id = nanoid(6);
  const { pos, entrances = NONE, width, height } = config;
  // exits are locked connection points, entrances are not
  let { exits = NONE } = config;
  exits = exits & ~entrances;
  const spawn = move(...mapData.config.origin, mapData.state.spawn);

  const quartX = width * 50 - 300;
  const quartZ = height * 50 - 300;

  const ppCoords = [
    move(-quartX, -6, quartZ, pos),
    move(quartX, -6, quartZ, pos),
    move(-quartX, -6, -quartZ, pos),
    move(quartX, -6, -quartZ, pos),
  ];
  const ppIndices = getPPIndices(exits);

  const jointOffset = (ISLAND_JOINT_LENGTH * 100) / 2 - 100;

  const gates = createGates();
  const eventBus = createEventBus(gates);
  const pps = createPressurePlates(eventBus);

  for (let i = 0; i < 4; i++) {
    moveTo(ppCoords[i], [0, 0, 0], pps[i]);
  }

  props(ppIndices, pps).forEach((pp) => {
    markAsUsed(pp);
  });

  if (isNotEmpty(ppIndices)) {
    markAsUsed(eventBus);
  }

  // TODO: moveTo the used gates + add small bridge segments
  if (exits & NORTH) {
    markAsUsed(gates.north);
    moveTo(
      move(0, 0, (height * 100) / 2 + ISLAND_JOINT_LENGTH * 100 - 200, pos),
      [0, 90, 0],
      gates.north
    );
  }
  if (exits & SOUTH) {
    markAsUsed(gates.south);
    moveTo(
      move(0, 0, -(height * 100) / 2 - ISLAND_JOINT_LENGTH * 100 - 200, pos),
      [0, 270, 0],
      gates.south
    );
  }
  if (exits & EAST) {
    markAsUsed(gates.east);
    moveTo(
      move((width * 100) / 2 + ISLAND_JOINT_LENGTH * 100 - 200, 0, 0, pos),
      [0, 0, 0],
      gates.east
    );
  }
  if (exits & WEST) {
    markAsUsed(gates.west);
    moveTo(
      move(-(width * 100) / 2 - ISLAND_JOINT_LENGTH * 100 - 200, 0, 0, pos),
      [0, 180, 0],
      gates.west
    );
  }

  return compose(
    unsetPolygonGroup,

    (mapData) => {
      props(ppIndices, ppCoords).forEach((ppCoord) => {
        mapData = addLight(move(0, -10, 0, ppCoord))(mapData);
      });
      return mapData;
    },
    setColor(colors.lights),

    when(
      () => (exits | entrances) & NORTH,
      compose(
        plain(
          move(0, 100, (height * 100) / 2 + jointOffset, pos),
          [2, ISLAND_JOINT_LENGTH],
          "ceiling",
          connectToNearPolygons(`${id}-north-island-joint-top`)
        ),
        setPolygonGroup(`${id}-north-island-joint-bottom`),
        setTexture(textures.gravel.ground1),
        plain(
          move(0, 0, (height * 100) / 2 + jointOffset, pos),
          [2, ISLAND_JOINT_LENGTH],
          "floor"
        ),
        setPolygonGroup(`${id}-north-island-joint-top`),
        setTexture(textures.stone.humanWall1)
      )
    ),
    when(
      () => (exits | entrances) & SOUTH,
      compose(
        plain(
          move(0, 100, -((height * 100) / 2 + jointOffset), pos),
          [2, ISLAND_JOINT_LENGTH],
          "ceiling",
          connectToNearPolygons(`${id}-south-island-joint-top`)
        ),
        setPolygonGroup(`${id}-south-island-joint-bottom`),
        setTexture(textures.gravel.ground1),
        plain(
          move(0, 0, -((height * 100) / 2 + jointOffset), pos),
          [2, ISLAND_JOINT_LENGTH],
          "floor"
        ),
        setPolygonGroup(`${id}-south-island-joint-top`),
        setTexture(textures.stone.humanWall1)
      )
    ),
    when(
      () => (exits | entrances) & EAST,
      compose(
        plain(
          move((width * 100) / 2 + jointOffset, 100, 0, pos),
          [ISLAND_JOINT_LENGTH, 2],
          "ceiling",
          connectToNearPolygons(`${id}-east-island-joint-top`)
        ),
        setPolygonGroup(`${id}-east-island-joint-bottom`),
        setTexture(textures.gravel.ground1),
        plain(
          move((width * 100) / 2 + jointOffset, 0, 0, pos),
          [ISLAND_JOINT_LENGTH, 2],
          "floor"
        ),
        setPolygonGroup(`${id}-east-island-joint-top`),
        setTexture(textures.stone.humanWall1)
      )
    ),
    when(
      () => (exits | entrances) & WEST,
      compose(
        plain(
          move(-((width * 100) / 2 + jointOffset), 100, 0, pos),
          [ISLAND_JOINT_LENGTH, 2],
          "ceiling",
          connectToNearPolygons(`${id}-west-island-joint-top`)
        ),
        setPolygonGroup(`${id}-west-island-joint-bottom`),
        setTexture(textures.gravel.ground1),
        plain(
          move(-((width * 100) / 2 + jointOffset), 0, 0, pos),
          [ISLAND_JOINT_LENGTH, 2],
          "floor"
        ),
        setPolygonGroup(`${id}-west-island-joint-top`),
        setTexture(textures.stone.humanWall1)
      )
    ),

    plain(
      move(0, 100, 0, pos),
      [width, height],
      "ceiling",
      connectToNearPolygons(`${id}-island-top`)
    ),
    setPolygonGroup(`${id}-island-bottom`),
    setTexture(textures.gravel.ground1),

    plain(pos, [width, height], "floor", (polygons) => {
      const ppAbsoluteCoords = map(
        move(...mapData.config.origin),
        props(ppIndices, ppCoords)
      );

      return map((polygon) => {
        if (isPointInPolygon(pos, polygon)) {
          polygon.config.bumpable = false;
        }

        if (isPointInPolygon(move(...mapData.config.origin, spawn), polygon)) {
          polygon.config.bumpable = false;
        }

        if (
          any(
            isPointInPolygon(__, polygon),
            map(move(0, 6, 0), ppAbsoluteCoords)
          )
        ) {
          polygon.tex = 0;
          polygon.config.bumpable = false;
        }

        return polygon;
      }, polygons);
    }),
    setPolygonGroup(`${id}-island-top`),
    setTexture(textures.stone.humanWall1),
    setColor(colors.terrain)
  )(mapData);
};

module.exports = island;
