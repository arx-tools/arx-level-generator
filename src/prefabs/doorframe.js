const { POLY_QUAD, POLY_NO_SHADOW } = require("../constants.js");
const { useTexture, textures } = require("../textures.js");

const doorframe = () => (mapData) => {
  mapData.fts.polygons.push({
    /*
    config: {
      color: mapData.state.lightColor,
      isQuad: true,
      minX: 200,
      minZ: 200,
    },
    vertices: [
      { posX: 200, posY: 0, posZ: 200, texU: 0, texV: 0 },
      { posX: 400, posY: 50, posZ: 200, texU: 0, texV: 1 },
      { posX: 200, posY: 0, posZ: 400, texU: 1, texV: 0 },
      { posX: 400, posY: 0, posZ: 400, texU: 1, texV: 1 },
    ],
    tex: useTexture(textures.wall.white),
    norm: { x: 0, y: -1, z: 0 },
    norm2: { x: 0, y: -1, z: 0 },
    normals: [
      { x: 0, y: -1, z: 0 },
      { x: 0, y: -1, z: 0 },
      { x: 0, y: -1, z: 0 },
      { x: 0, y: -1, z: 0 },
    ],
    transval: 0,
    area: 40000,
    type: POLY_QUAD | POLY_NO_SHADOW,
    room: 1,
    paddy: 0,
    */
    config: {
      color: mapData.state.lightColor,
      isQuad: true,
      minX: 5190,
      minZ: 10550,
    },
    vertices: [
      {
        posX: 5190.00048828125,
        posY: 335.0000915527344,
        posZ: 10550.005859375,
        texU: 0.99609375, // 1.00
        texV: 0.80078125, // 0.80
        llfColorIdx: 0,
      },
      {
        posX: 5200.00048828125,
        posY: 340.0000915527344,
        posZ: 10560.005859375,
        texU: 0.99609375, // 1.00
        texV: 0.83984375, // 0.84
        llfColorIdx: 1,
      },
      {
        posX: 5190.00048828125,
        posY: 335.0000915527344,
        posZ: 10650.005859375,
        texU: 0, // 0.00
        texV: 0.80078125, // 0.80
        llfColorIdx: 2,
      },
      {
        posX: 5200.00048828125,
        posY: 340.0000915527344,
        posZ: 10650.005859375,
        texU: 0, // 0.00
        texV: 0.83984375, // 0.84
        llfColorIdx: 3,
      },
    ],
    tex: useTexture(textures.wall.white),
    norm: {
      x: 0.4454931914806366,
      y: -0.8909863829612732,
      z: 0,
    },
    norm2: {
      x: 0.44714510440826416,
      y: -0.8942902088165283,
      z: 0,
    },
    normals: [
      {
        x: 0.47862720489501953,
        y: -0.5233576893806458,
        z: 0.17258019745349884,
      },
      {
        x: 0.46038827300071716,
        y: -0.7081323862075806,
        z: 0.08627468347549438,
      },
      {
        x: 0.672273576259613,
        y: -0.509843111038208,
        z: 0,
      },
      {
        x: 0.7029166221618652,
        y: -0.44604381918907166,
        z: 0,
      },
    ],
    transval: 0,
    area: 4503.2490234375,
    type: 65,
    room: 1,
    paddy: 0,
  });

  return mapData;
};

module.exports = doorframe;
