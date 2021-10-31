const { compose, map, props, any, __ } = require("ramda");
const { setColor, move, isPointInPolygon } = require("../../helpers.js");
const { colors, NORTH, SOUTH, WEST, EAST } = require("./constants.js");
const { plain, pillars } = require("../../prefabs");
const { declare, getInjections } = require("../../scripting.js");
const {
  items,
  moveTo,
  createItem,
  addScript,
  markAsUsed,
} = require("../../assets/items.js");
const { isNotEmpty } = require("ramda-adjunct");

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

  // -------------------------

  if (${eventBus.state.pp0pressed} == 1) {
    if (${eventBus.state.pp1pressed} == 1) {
      if (${eventBus.state.northGateOpened} == 0) {
        HEROSAY "north gate opening"
        SET ${eventBus.state.northGateOpened} 1
      }
    } else {
      if (${eventBus.state.northGateOpened} == 1) {
        HEROSAY "north gate closing"
        SET ${eventBus.state.northGateOpened} 0
      }
    }
  } else {
    if (${eventBus.state.northGateOpened} == 1) {
      HEROSAY "north gate closing"
      SET ${eventBus.state.northGateOpened} 0
    }
  }

  if (${eventBus.state.pp2pressed} == 1) {
    if (${eventBus.state.pp3pressed} == 1) {
      if (${eventBus.state.southGateOpened} == 0) {
        HEROSAY "south gate opening"
        SET ${eventBus.state.southGateOpened} 1
      }
    } else {
      if (${eventBus.state.southGateOpened} == 1) {
        HEROSAY "south gate closing"
        SET ${eventBus.state.southGateOpened} 0
      }
    }
  } else {
    if (${eventBus.state.southGateOpened} == 1) {
      HEROSAY "south gate closing"
      SET ${eventBus.state.southGateOpened} 0
    }
  }

  if (${eventBus.state.pp1pressed} == 1) {
    if (${eventBus.state.pp3pressed} == 1) {
      if (${eventBus.state.eastGateOpened} == 0) {
        HEROSAY "east gate opening"
        SET ${eventBus.state.eastGateOpened} 1
      }
    } else {
      if (${eventBus.state.eastGateOpened} == 1) {
        HEROSAY "east gate closing"
        SET ${eventBus.state.eastGateOpened} 0
      }
    }
  } else {
    if (${eventBus.state.eastGateOpened} == 1) {
      HEROSAY "east gate closing"
      SET ${eventBus.state.eastGateOpened} 0
    }
  }

  if (${eventBus.state.pp0pressed} == 1) {
    if (${eventBus.state.pp2pressed} == 1) {
      if (${eventBus.state.westGateOpened} == 0) {
        HEROSAY "west gate opening"
        SET ${eventBus.state.westGateOpened} 1
      }
    } else {
      if (${eventBus.state.westGateOpened} == 1) {
        HEROSAY "west gate closing"
        SET ${eventBus.state.westGateOpened} 0
      }
    }
  } else {
    if (${eventBus.state.westGateOpened} == 1) {
      HEROSAY "west gate closing"
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

const createGates = () => {};

const island = (config) => (mapData) => {
  const { pos, exits } = config;
  const spawn = move(...mapData.config.origin, mapData.state.spawn);
  const radius = 12;
  const quarth = (radius * 100) / 4;
  const ppCoords = [
    move(-quarth, -6, quarth, pos),
    move(quarth, -6, quarth, pos),
    move(-quarth, -6, -quarth, pos),
    move(quarth, -6, -quarth, pos),
  ];
  const ppIndices = getPPIndices(exits);

  const gates = createGates();
  const eventBus = createEventBus(gates);
  const pps = createPressurePlates(eventBus);

  moveTo(ppCoords[0], [0, 0, 0], pps[0]);
  moveTo(ppCoords[1], [0, 0, 0], pps[1]);
  moveTo(ppCoords[2], [0, 0, 0], pps[2]);
  moveTo(ppCoords[3], [0, 0, 0], pps[3]);

  props(ppIndices, pps).forEach((pp) => {
    markAsUsed(pp);
  });

  if (isNotEmpty(ppIndices)) {
    markAsUsed(eventBus);
  }

  return compose(
    plain(pos, radius, (polygons) => {
      const ppAbsoluteCoords = map(
        move(...mapData.config.origin),
        props(ppIndices, ppCoords)
      );

      return map((polygon) => {
        if (isPointInPolygon(spawn, polygon)) {
          polygon.bumpable = false;
        }

        if (
          any(
            isPointInPolygon(__, polygon),
            map(move(0, 6, 0), ppAbsoluteCoords)
          )
        ) {
          polygon.tex = 0;
          polygon.bumpable = false;
        }

        return polygon;
      }, polygons);
    }),

    setColor(colors.terrain),

    pillars(pos, 30, 3000, 1250, [350, 350, 350, 350]),
    setColor(colors.pillars)
  )(mapData);
};

module.exports = island;
