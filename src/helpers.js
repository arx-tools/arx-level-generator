const fs = require("fs");
const rgba = require("color-rgba");
const { exportUsedTextures } = require("./textures.js");
const {
  createDlfData,
  createFtsData,
  createLlfData,
} = require("./blankMap.js");

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

const generateBlankMapData = (config) => {
  const now = Math.floor(Date.now() / 1000);

  return {
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
