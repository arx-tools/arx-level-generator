const wallX = require("./base/wallX.js");
const wallZ = require("./base/wallZ.js");
const { textures } = require("../assets/textures.js");
const {
  POLY_QUAD,
  POLY_NO_SHADOW,
  POLY_WATER,
  POLY_FALL,
} = require("../constants.js");
const { assoc } = require("ramda");

const segment = (x, y, z, size) => (mapData) => {
  const height = 500;

  const uv = {
    a: { u: 0.52, v: 0 },
    b: { u: 0.52, v: 1 },
    c: { u: 0.48, v: 0 },
    d: { u: 0.48, v: 1 },
  };

  const texture = assoc(
    "flags",
    POLY_QUAD | POLY_NO_SHADOW,
    textures.wall.white
  );

  mapData = wallX(
    x - size / 2,
    y,
    z - size / 2,
    texture,
    "left",
    null,
    0,
    [size, height, size],
    0,
    uv
  )(mapData);

  mapData = wallX(
    x + size / 2,
    y,
    z - size / 2,
    texture,
    "right",
    null,
    0,
    [size, height, size],
    0,
    uv
  )(mapData);

  mapData = wallZ(
    x - size / 2,
    y,
    z - size / 2,
    texture,
    "back",
    null,
    0,
    [size, height, size],
    0,
    uv
  )(mapData);

  mapData = wallZ(
    x - size / 2,
    y,
    z + size / 2,
    texture,
    "front",
    null,
    0,
    [size, height, size],
    0,
    uv
  )(mapData);

  return mapData;
};

const pillar = (x, y, z, diameter) => (mapData) => {
  for (let i = -10; i < 10; i++) {
    mapData = segment(x, y + i * 500, z, diameter)(mapData);
  }

  return mapData;
};

module.exports = pillar;
