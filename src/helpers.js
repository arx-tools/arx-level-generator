const fs = require("fs");
const rgba = require("color-rgba");
const { exportUsedTextures, useTexture, textures } = require("./textures.js");
const {
  createDlfData,
  createFtsData,
  createLlfData,
} = require("./blankMap.js");
const { compose } = require("ramda");
const {
  POLY_QUAD,
  POLY_NO_SHADOW,
  MAP_MAX_HEIGHT,
  MAP_MAX_WIDTH,
  POLY_NODRAW,
} = require("./constants.js");

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

const isBetween = (min, max, value) => {
  return value >= min && value < max;
};

const isInCell = (polygonX, polygonZ, cellX, cellZ) => {
  return (
    isBetween(cellX * 100, (cellX + 1) * 100, polygonX) &&
    isBetween(cellZ * 100, (cellZ + 1) * 100, polygonZ)
  );
};

const generateLights = (mapData) => {
  const { polygons } = mapData.fts;

  let colorIdx = 0;

  for (let z = 0; z < MAP_MAX_HEIGHT; z++) {
    for (let x = 0; x < MAP_MAX_WIDTH; x++) {
      const polygonsInCell = polygons.filter(({ config }) => {
        return isInCell(config.minX, config.minZ, x, z);
      });

      polygonsInCell.forEach(({ config, vertices }) => {
        const { color, isQuad } = config;

        if (color === null) {
          mapData.llf.colors.push(toRgba("white"));
          vertices[0].llfColorIdx = colorIdx++;
          mapData.llf.colors.push(toRgba("white"));
          vertices[1].llfColorIdx = colorIdx++;
          mapData.llf.colors.push(toRgba("white"));
          vertices[2].llfColorIdx = colorIdx++;
          if (isQuad) {
            mapData.llf.colors.push(toRgba("white"));
            vertices[3].llfColorIdx = colorIdx++;
          }
        } else {
          mapData.llf.colors.push(color);
          vertices[0].llfColorIdx = colorIdx++;
          mapData.llf.colors.push(color);
          vertices[1].llfColorIdx = colorIdx++;
          mapData.llf.colors.push(color);
          vertices[2].llfColorIdx = colorIdx++;
          if (isQuad) {
            mapData.llf.colors.push(color);
            vertices[3].llfColorIdx = colorIdx++;
          }
        }
      });
    }
  }

  return mapData;
};

const finalize = (mapData) => {
  mapData.dlf.header.numberOfBackgroundPolygons = mapData.fts.polygons.length;
  mapData.llf.header.numberOfBackgroundPolygons = mapData.fts.polygons.length;
  return compose(generateLights, exportUsedTextures)(mapData);
};

const addOriginPolygon = (mapData) => {
  mapData.fts.polygons.push({
    config: {
      color: toRgba("black"),
      isQuad: true,
      minX: 0,
      minZ: 0,
    },
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
    tex: 0, // no texture at all!
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
    type: POLY_QUAD | POLY_NODRAW,
    room: 1,
    paddy: 0,
  });

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
  mapData.state.lightColor = toRgba(color);
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
