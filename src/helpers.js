const fs = require("fs");
const rgba = require("color-rgba");
const { exportUsedTextures, useTexture, textures } = require("./textures.js");
const {
  createDlfData,
  createFtsData,
  createLlfData,
} = require("./blankMap.js");
const { compose } = require("ramda");
const { POLY_QUAD, POLY_NO_SHADOW } = require("./constants.js");

const toRgba = (colorDefinition) => {
  const [r, g, b, a] = rgba(colorDefinition);

  return {
    r,
    g,
    b,
    a: Math.round(255 * a),
  };
};

const movePlayerTo = (x, y, z) => (mapData) => {
  mapData.fts.sceneHeader.mScenePosition = { x, y: y - 140, z };
  return mapData;
};

const finalize = (mapData) => {
  mapData.dlf.header.numberOfBackgroundPolygons = mapData.fts.polygons.length;
  mapData.llf.header.numberOfBackgroundPolygons = mapData.fts.polygons.length;
  exportUsedTextures(mapData);
  return mapData;
};

const addOriginPolygon = (mapData) => {
  mapData.fts.polygons.push({
    vertices: [
      {
        posX: 0,
        posY: 0,
        posZ: 0,
        texU: 0,
        texV: 0,
      },
      {
        posX: 1,
        posY: 0,
        posZ: 0,
        texU: 0,
        texV: 1,
      },
      {
        posX: 0,
        posY: 0,
        posZ: 1,
        texU: 1,
        texV: 0,
      },
      {
        posX: 1,
        posY: 0,
        posZ: 1,
        texU: 1,
        texV: 1,
      },
    ],
    tex: useTexture(textures.gravel.ground1),
    norm: { x: 0, y: -1, z: 0 },
    norm2: { x: 0, y: -1, z: 0 },
    normals: [
      { x: 0, y: -1, z: 0 },
      { x: 0, y: -1, z: 0 },
      { x: 0, y: -1, z: 0 },
      { x: 0, y: -1, z: 0 },
    ],
    transval: 0,
    area: 1,
    type: POLY_QUAD | POLY_NO_SHADOW,
    room: 1,
    paddy: 0,
  });

  mapData.llf.colors.push(toRgba("black"));
  mapData.llf.colors.push(toRgba("black"));
  mapData.llf.colors.push(toRgba("black"));
  mapData.llf.colors.push(toRgba("black"));

  return mapData;
};

const generateBlankMapData = (config) => {
  const now = Math.floor(Date.now() / 1000);

  const mapData = {
    config: {
      ...config,
      now,
    },
    state: {
      lightColor: null,
      vertexCounter: 0,
    },
    dlf: createDlfData(config.levelIdx, now),
    fts: createFtsData(config.levelIdx),
    llf: createLlfData(now),
  };

  return compose(addOriginPolygon)(mapData);
};

const saveToDisk = (mapData) => {
  const { levelIdx, outputDir } = mapData.config;

  const files = {
    fts: `${outputDir}/game/graph/levels/level${levelIdx}/fast.fts.json`,
    dlf: `${outputDir}/graph/levels/level${levelIdx}/level${levelIdx}.dlf.json`,
    llf: `${outputDir}/graph/levels/level${levelIdx}/level${levelIdx}.llf.json`,
  };

  fs.writeFileSync(files.dlf, JSON.stringify(mapData.dlf, null, 2));
  fs.writeFileSync(files.fts, JSON.stringify(mapData.fts, null, 2));
  fs.writeFileSync(files.llf, JSON.stringify(mapData.llf, null, 2));
};

const setLightColor = (color) => (mapData) => {
  mapData.state.lightColor = color;
  return mapData;
};

const unsetLightColor = (mapData) => {
  mapData.state.lightColor = null;
  return mapData;
};

module.exports = {
  toRgba,
  movePlayerTo,
  finalize,
  generateBlankMapData,
  saveToDisk,
  setLightColor,
  unsetLightColor,
};
