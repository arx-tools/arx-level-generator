const { compose, map, props, any, __, when } = require("ramda");
const {
  setColor,
  move,
  isPointInPolygon,
  addLight,
  setTexture,
  setPolygonGroup,
  unsetPolygonGroup,
  addZone,
} = require("../../helpers.js");
const { colors, NORTH, SOUTH, WEST, EAST, NONE } = require("./constants.js");
const {
  plain,
  connectToNearPolygons,
  disableBumping,
} = require("../../prefabs/plain.js");
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
const {
  ISLAND_JOINT_LENGTH,
  ISLAND_JOINT_WIDTH,
} = require("../../constants.js");
const { ambiences } = require("../../assets/ambiences.js");

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

const createPressurePlate = (id, eventBus) => {
  return compose(
    addScript((self) => {
      return `
  // component: island.${id}
    ON INIT {
      SETSCALE 101
      ${getInjections("init", self)}
      ACCEPT
    }
  
    ON INITEND {
      TIMERontop -im 0 500 GOTO TOP
      ACCEPT
    }
  
    >>TOP
      IF ( ^$OBJONTOP == "NONE" ) {
        IF ( ${self.state.onme} == 1 ) {
          SET ${self.state.onme} 0
          PLAYANIM ACTION2
          SENDEVENT CUSTOM ${eventBus.ref} "${id}.released"
        }
        ACCEPT
      }
      IF ( ${self.state.onme} == 0 ) {
        SET ${self.state.onme} 1
        PLAYANIM ACTION1
        SENDEVENT CUSTOM ${eventBus.ref} "${id}.pressed"
      }
      ACCEPT
    `;
    }),
    declare("int", "onme", 0),
    createItem
  )(items.mechanisms.pressurePlate);
};

const createPressurePlates = (eventBus) => {
  return [
    createPressurePlate("pp0", eventBus),
    createPressurePlate("pp1", eventBus),
    createPressurePlate("pp2", eventBus),
    createPressurePlate("pp3", eventBus),
  ];
};

const createEventBus = (gates) => {
  return compose(
    addScript((self) => {
      return `
  // component: island.eventBus
  ON INIT {
    ${getInjections("init", self)}
    ACCEPT
  }
  
  ON CUSTOM {
    if ("pp0." isin ^$PARAM1) {
      if ("pressed" isin ^$PARAM1) {
        SET ${self.state.pp0pressed} 1
      } else {
        SET ${self.state.pp0pressed} 0
      }
    }
  
    if ("pp1." isin ^$PARAM1) {
      if ("pressed" isin ^$PARAM1) {
        SET ${self.state.pp1pressed} 1
      } else {
        SET ${self.state.pp1pressed} 0
      }
    }
  
    if ("pp2." isin ^$PARAM1) {
      if ("pressed" isin ^$PARAM1) {
        SET ${self.state.pp2pressed} 1
      } else {
        SET ${self.state.pp2pressed} 0
      }
    }
  
    if ("pp3." isin ^$PARAM1) {
      if ("pressed" isin ^$PARAM1) {
        SET ${self.state.pp3pressed} 1
      } else {
        SET ${self.state.pp3pressed} 0
      }
    }
  
    if (${self.state.pp0pressed} == 1) {
      if (${self.state.pp1pressed} == 1) {
        if (${self.state.northGateOpened} == 0) {
          SENDEVENT OPEN ${gates.north.ref} ""
          SET ${self.state.northGateOpened} 1
        }
      } else {
        if (${self.state.northGateOpened} == 1) {
          SENDEVENT CLOSE ${gates.north.ref} ""
          SET ${self.state.northGateOpened} 0
        }
      }
    } else {
      if (${self.state.northGateOpened} == 1) {
        SENDEVENT CLOSE ${gates.north.ref} ""
        SET ${self.state.northGateOpened} 0
      }
    }
  
    if (${self.state.pp2pressed} == 1) {
      if (${self.state.pp3pressed} == 1) {
        if (${self.state.southGateOpened} == 0) {
          SENDEVENT OPEN ${gates.south.ref} ""
          SET ${self.state.southGateOpened} 1
        }
      } else {
        if (${self.state.southGateOpened} == 1) {
          SENDEVENT CLOSE ${gates.south.ref} ""
          SET ${self.state.southGateOpened} 0
        }
      }
    } else {
      if (${self.state.southGateOpened} == 1) {
        SENDEVENT CLOSE ${gates.south.ref} ""
        SET ${self.state.southGateOpened} 0
      }
    }
  
    if (${self.state.pp1pressed} == 1) {
      if (${self.state.pp3pressed} == 1) {
        if (${self.state.eastGateOpened} == 0) {
          SENDEVENT OPEN ${gates.east.ref} ""
          SET ${self.state.eastGateOpened} 1
        }
      } else {
        if (${self.state.eastGateOpened} == 1) {
          SENDEVENT CLOSE ${gates.east.ref} ""
          SET ${self.state.eastGateOpened} 0
        }
      }
    } else {
      if (${self.state.eastGateOpened} == 1) {
        SENDEVENT CLOSE ${gates.east.ref} ""
        SET ${self.state.eastGateOpened} 0
      }
    }
  
    if (${self.state.pp0pressed} == 1) {
      if (${self.state.pp2pressed} == 1) {
        if (${self.state.westGateOpened} == 0) {
          SENDEVENT OPEN ${gates.west.ref} ""
          SET ${self.state.westGateOpened} 1
        }
      } else {
        if (${self.state.westGateOpened} == 1) {
          SENDEVENT CLOSE ${gates.west.ref} ""
          SET ${self.state.westGateOpened} 0
        }
      }
    } else {
      if (${self.state.westGateOpened} == 1) {
        SENDEVENT CLOSE ${gates.west.ref} ""
        SET ${self.state.westGateOpened} 0
      }
    }
  
    ACCEPT
  }
    `;
    }),
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
};

const createGate = (orientation, props) => {
  return compose(
    addScript((self) => {
      return `
// component island:gates.${orientation}
ON INIT {
  ${getInjections("init", self)}
  ACCEPT
}
ON INITEND {
  IF (${self.state.isWide} == 1) {
    USE_MESH "L2_Gobel_portcullis_big\\L2_Gobel_portcullis_big.teo"
  } ELSE {
    USE_MESH "L2_Gobel_portcullis\\L2_Gobel_portcullis.teo"
  }

  ACCEPT
}
ON CLOSE {
  IF (${self.state.isOpen} == 0) {
    ACCEPT
  }
  SET ${self.state.isOpen} 0
  PLAYANIM -e ACTION2 COLLISION ON
  VIEWBLOCK ON
  PLAY ~£closesfx~
  REFUSE
}
ON OPEN {
  IF (${self.state.isOpen} == 1) {
    ACCEPT
  }
  SET ${self.state.isOpen} 1
  PLAYANIM -e ACTION1 COLLISION OFF
  PLAY ~£opensfx~
  VIEWBLOCK OFF
  ANCHOR_BLOCK OFF
  REFUSE
}
  `;
    }),
    declare("int", "isOpen", props.isOpen ?? false ? 1 : 0),
    declare("int", "isWide", props.isWide ?? false ? 1 : 0),
    createItem
  )(items.doors.portcullis);
};

const createGates = () => {
  return {
    north: createGate("north", { isWide: true, isOpen: false }),
    south: createGate("south", { isWide: true, isOpen: false }),
    west: createGate("west", { isWide: true, isOpen: false }),
    east: createGate("east", { isWide: true, isOpen: false }),
  };
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
      move(-25, 0, (height * 100) / 2 + ISLAND_JOINT_LENGTH * 100 - 200, pos),
      [0, 90, 0],
      gates.north
    );
  }
  if (exits & SOUTH) {
    markAsUsed(gates.south);
    moveTo(
      move(25, 0, -(height * 100) / 2 - ISLAND_JOINT_LENGTH * 100 + 200, pos),
      [0, 270, 0],
      gates.south
    );
  }
  if (exits & EAST) {
    markAsUsed(gates.east);
    moveTo(
      move((width * 100) / 2 + ISLAND_JOINT_LENGTH * 100 - 200, 0, 25, pos),
      [0, 0, 0],
      gates.east
    );
  }
  if (exits & WEST) {
    markAsUsed(gates.west);
    moveTo(
      move(-(width * 100) / 2 - ISLAND_JOINT_LENGTH * 100 + 200, 0, -25, pos),
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
          [ISLAND_JOINT_WIDTH, ISLAND_JOINT_LENGTH],
          "ceiling",
          (polygon, mapData) => {
            return connectToNearPolygons(`${id}-north-island-joint-top`)(
              disableBumping(polygon),
              mapData
            );
          }
        ),
        setPolygonGroup(`${id}-north-island-joint-bottom`),
        setTexture(textures.gravel.ground1),
        plain(
          move(0, 0, (height * 100) / 2 + jointOffset, pos),
          [ISLAND_JOINT_WIDTH, ISLAND_JOINT_LENGTH],
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
          [ISLAND_JOINT_WIDTH, ISLAND_JOINT_LENGTH],
          "ceiling",
          (polygon, mapData) => {
            return connectToNearPolygons(`${id}-south-island-joint-top`)(
              disableBumping(polygon),
              mapData
            );
          }
        ),
        setPolygonGroup(`${id}-south-island-joint-bottom`),
        setTexture(textures.gravel.ground1),
        plain(
          move(0, 0, -((height * 100) / 2 + jointOffset), pos),
          [ISLAND_JOINT_WIDTH, ISLAND_JOINT_LENGTH],
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
          [ISLAND_JOINT_LENGTH, ISLAND_JOINT_WIDTH],
          "ceiling",
          (polygon, mapData) => {
            return connectToNearPolygons(`${id}-east-island-joint-top`)(
              disableBumping(polygon),
              mapData
            );
          }
        ),
        setPolygonGroup(`${id}-east-island-joint-bottom`),
        setTexture(textures.gravel.ground1),
        plain(
          move((width * 100) / 2 + jointOffset, 0, 0, pos),
          [ISLAND_JOINT_LENGTH, ISLAND_JOINT_WIDTH],
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
          [ISLAND_JOINT_LENGTH, ISLAND_JOINT_WIDTH],
          "ceiling",
          (polygon, mapData) => {
            return connectToNearPolygons(`${id}-west-island-joint-top`)(
              disableBumping(polygon),
              mapData
            );
          }
        ),
        setPolygonGroup(`${id}-west-island-joint-bottom`),
        setTexture(textures.gravel.ground1),
        plain(
          move(-((width * 100) / 2 + jointOffset), 0, 0, pos),
          [ISLAND_JOINT_LENGTH, ISLAND_JOINT_WIDTH],
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

    plain(
      move(0, 10000, 0, pos),
      [width + 10, height + 10],
      "floor",
      disableBumping
    ),
    setTexture(textures.none),
    setColor(colors.terrain),

    addZone(
      move(0, 5000, 0, pos),
      [(width + 10) * 100, 100, (height + 10) * 100],
      `fall-detector-${config.idx}`,
      ambiences.none,
      5000
    ),
    setColor(colors.ambience[0])
  )(mapData);
};

module.exports = island;
