const { compose, map, props, any, __ } = require("ramda");
const { setColor, move, isPointInPolygon } = require("../../helpers.js");
const { colors, NORTH, SOUTH, WEST, EAST } = require("./constants.js");
const { plain, pillars } = require("../../prefabs");
const { declare } = require("../../scripting.js");
const {
  items,
  moveTo,
  createItem,
  addScript,
  markAsUsed,
} = require("../../assets/items.js");

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

const island = (config) => (mapData) => {
  const { pos, exits } = config;
  // const absolutePos = move(...pos, mapData.config.origin);
  const spawn = move(...mapData.config.origin, mapData.state.spawn);
  const radius = 12;
  const quarth = (radius * 100) / 4;
  const ppCoords = [
    move(-quarth, -6, quarth, pos),
    move(quarth, -6, quarth, pos),
    move(-quarth, -6, -quarth, pos),
    move(quarth, -6, -quarth, pos),
  ];

  const pp0 = compose(
    declare("int", "onme"),
    moveTo(ppCoords[0], [0, 0, 0]),
    createItem
  )(items.mechanisms.pressurePlate);
  addScript(
    `
  ON INIT {
    SETSCALE 101
    ACCEPT
  }
  `,
    pp0
  );

  const pp1 = compose(
    declare("int", "onme"),
    moveTo(ppCoords[1], [0, 0, 0]),
    createItem
  )(items.mechanisms.pressurePlate);
  addScript(
    `
  ON INIT {
    SETSCALE 101
    ACCEPT
  }
  `,
    pp1
  );

  const pp2 = compose(
    declare("int", "onme"),
    moveTo(ppCoords[2], [0, 0, 0]),
    createItem
  )(items.mechanisms.pressurePlate);
  addScript(
    `
  ON INIT {
    SETSCALE 101
    ACCEPT
  }
  `,
    pp2
  );

  const pp3 = compose(
    declare("int", "onme"),
    moveTo(ppCoords[3], [0, 0, 0]),
    createItem
  )(items.mechanisms.pressurePlate);
  addScript(
    `
  ON INIT {
    SETSCALE 101
    ACCEPT
  }
  `,
    pp3
  );

  props(getPPIndices(exits), [pp0, pp1, pp2, pp3]).forEach((pp) => {
    markAsUsed(pp);
  });

  return compose(
    plain(pos, radius, (polygons) => {
      const ppAbsoluteCoords = map(
        move(...mapData.config.origin),
        props(getPPIndices(exits), ppCoords)
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
