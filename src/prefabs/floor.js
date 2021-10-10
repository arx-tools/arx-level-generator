const { POLY_QUAD, POLY_NO_SHADOW, HFLIP, VFLIP } = require("../constants.js");

const floor = (
  x,
  y,
  z,
  texture,
  direction = "right",
  quad = 0,
  textureRotation = 0,
  size = 100,
  flags = 0
) => {
  let texU = 0;
  let texV = 0;

  let a = { u: 0.5, v: 0 };
  let b = { u: 0.5, v: 0.5 };
  let c = { u: 0, v: 0 };
  let d = { u: 0, v: 0.5 };

  if (quad === null) {
    a = { u: 1, v: 0 };
    b = { u: 1, v: 1 };
    c = { u: 0, v: 0 };
    d = { u: 0, v: 1 };
  } else {
    switch (quad) {
      case 0:
        texU = 0;
        texV = 0;
        break;
      case 1:
        texU = 0.5;
        texV = 0;
        break;
      case 2:
        texU = 0;
        texV = 0.5;
        break;
      case 3:
        texU = 0.5;
        texV = 0.5;
        break;
    }
  }

  let uv = [c, d, a, b]; // 0
  switch (textureRotation) {
    case 90:
      uv = [a, c, b, d]; // 90
      break;
    case 180:
      uv = [b, a, d, c]; // 180
      break;
    case 270:
      uv = [d, b, c, a]; // 270
  }

  if (flags & HFLIP) {
    uv = [uv[2], uv[3], uv[0], uv[1]];
  }

  if (flags & VFLIP) {
    uv = [uv[1], uv[0], uv[3], uv[2]];
  }

  return {
    vertices: [
      {
        posX: x - size / 2,
        posY: y,
        posZ: z - size / 2,
        texU: texU + uv[0].u,
        texV: texV + uv[0].v,
      },
      {
        posX: x + size / 2,
        posY: y,
        posZ: z - size / 2,
        texU: texU + uv[1].u,
        texV: texV + uv[1].v,
      },
      {
        posX: x - size / 2,
        posY: y,
        posZ: z + size / 2,
        texU: texU + uv[2].u,
        texV: texV + uv[2].v,
      },
      {
        posX: x + size / 2,
        posY: y,
        posZ: z + size / 2,
        texU: texU + uv[3].u,
        texV: texV + uv[3].v,
      },
    ],
    tex: texture.tc,
    norm: { x: 0, y: direction === "top" ? 1 : -1, z: 0 },
    norm2: { x: 0, y: direction === "top" ? 1 : -1, z: 0 },
    normals: [
      { x: 0, y: direction === "top" ? 1 : -1, z: 0 },
      { x: 0, y: direction === "top" ? 1 : -1, z: 0 },
      { x: 0, y: direction === "top" ? 1 : -1, z: 0 },
      { x: 0, y: direction === "top" ? 1 : -1, z: 0 },
    ],
    transval: 0,
    area: size * size,
    type: texture.flags ?? POLY_QUAD | POLY_NO_SHADOW,
    room: 1,
    paddy: 0,
  };
};

module.exports = floor;
