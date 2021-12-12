const { nanoid } = require("nanoid");
const { compose } = require("ramda");
const wallZ = require("./base/wallZ");
const { textures } = require("../assets/textures");
const {
  setPolygonGroup,
  unsetPolygonGroup,
  setTexture,
  move,
} = require("../helpers");
const { HFLIP, VFLIP } = require("../constants");
const floor = require("./base/floor");

const stairs = (pos) => (mapData) => {
  const id = nanoid(6);
  const { origin } = mapData.config;

  const isLeftFlipped = Math.random() > 0.5;
  const isRightFlipped = Math.random() > 0.5;

  return compose(
    unsetPolygonGroup,
    floor(
      move(45, -25, 43 / 2, move(...pos, origin)),
      "floor",
      null,
      90,
      [90, 0, 43],
      HFLIP | isLeftFlipped ? 0 : VFLIP,
      {
        a: { u: 1, v: 0.73 },
        b: { u: 1, v: 0.88 },
        c: { u: 0.5, v: 0.73 },
        d: { u: 0.5, v: 0.88 },
      }
    ),
    floor(
      move(-45, -25, 43 / 2, move(...pos, origin)),
      "floor",
      null,
      90,
      [90, 0, 43],
      HFLIP | isRightFlipped ? 0 : VFLIP,
      {
        a: { u: 0.5, v: 0.73 },
        b: { u: 0.5, v: 0.88 },
        c: { u: 0, v: 0.73 },
        d: { u: 0, v: 0.88 },
      }
    ),

    wallZ(
      move(45, -25 / 2, 0, move(...pos, origin)),
      "back",
      null,
      0,
      [90, 25, 0],
      isLeftFlipped ? HFLIP : 0,
      {
        a: { u: 1, v: 0.88 },
        b: { u: 1, v: 1 },
        c: { u: 0.5, v: 0.88 },
        d: { u: 0.5, v: 1 },
      }
    ),
    wallZ(
      move(-45, -25 / 2, 0, move(...pos, origin)),
      "back",
      null,
      0,
      [90, 25, 0],
      isRightFlipped ? HFLIP : 0,
      {
        a: { u: 0.5, v: 0.88 },
        b: { u: 0.5, v: 1 },
        c: { u: 0, v: 0.88 },
        d: { u: 0, v: 1 },
      }
    ),
    setTexture(textures.stone.stairs),
    setPolygonGroup(`${id}-stairs`)
  )(mapData);
};

module.exports = stairs;
