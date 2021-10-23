const { POLY_QUAD, POLY_NO_SHADOW } = require("../constants.js");
const { useTexture, textures } = require("../textures.js");

const doorframe = () => (mapData) => {
  mapData.fts.polygons.push({
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
  });

  return mapData;
};

module.exports = doorframe;
