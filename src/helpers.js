const fs = require("fs");
const rgba = require("color-rgba");
const { exportUsedTextures } = require("./assets/textures.js");
const {
  createDlfData,
  createFtsData,
  createLlfData,
} = require("./blankMap.js");
const {
  pluck,
  compose,
  pick,
  map,
  unnest,
  countBy,
  toPairs,
  partition,
  nth,
  equals,
  adjust,
  split,
  unary,
  values,
  dropLast,
  join,
  replace,
  keys,
} = require("ramda");
const {
  POLY_QUAD,
  MAP_MAX_HEIGHT,
  MAP_MAX_WIDTH,
  POLY_NODRAW,
} = require("./constants.js");
const { exportUsedItems, exportScripts } = require("./assets/items.js");
const { exportAmbiences } = require("./assets/ambiences.js");

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
  return compose(generateLights, exportUsedItems, exportUsedTextures)(mapData);
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
    items: [],
    dlf: createDlfData(config.levelIdx, now),
    fts: createFtsData(config.levelIdx),
    llf: createLlfData(now),
  };

  return compose(addOriginPolygon)(mapData);
};

const saveToDisk = async (mapData) => {
  const { levelIdx } = mapData.config;

  const outputDir = "./dist/";

  try {
    await fs.promises.rmdir("dist", { recursive: true });
  } catch (e) {}

  let scripts = exportScripts(outputDir);

  let ambiences = exportAmbiences(outputDir);

  const files = {
    fts: `${outputDir}game/graph/levels/level${levelIdx}/fast.fts.json`,
    dlf: `${outputDir}graph/levels/level${levelIdx}/level${levelIdx}.dlf.json`,
    llf: `${outputDir}graph/levels/level${levelIdx}/level${levelIdx}.llf.json`,
  };

  const manifest = [...values(files), ...keys(scripts), ...keys(ambiences)];

  // TODO: create folders in sequence
  const tasks = compose(
    map(
      compose(
        (path) => async () => {
          await fs.promises.mkdir(path, { recursive: true });
        },
        join("/"),
        dropLast(1),
        split("/")
      )
    )
  )(manifest);

  for (let task of tasks) {
    await task();
  }

  // ------------

  scripts = toPairs(scripts);

  for (let [filename, script] of scripts) {
    await fs.promises.writeFile(filename, script, "latin1");
  }

  // ------------

  ambiences = toPairs(ambiences);

  for (let [target, source] of ambiences) {
    await fs.promises.copyFile(source, target);
  }

  // ------------

  await fs.promises.writeFile(files.dlf, JSON.stringify(mapData.dlf, null, 2));
  await fs.promises.writeFile(files.fts, JSON.stringify(mapData.fts, null, 2));
  await fs.promises.writeFile(files.llf, JSON.stringify(mapData.llf, null, 2));

  // TODO: this does not contain the compiled files!
  await fs.promises.writeFile(
    `${outputDir}manifest.json`,
    JSON.stringify(map(replace(/^\.\/dist\//, ""), manifest), null, 2)
  );
};

const setLightColor = (color) => (mapData) => {
  mapData.state.lightColor = toRgba(color);
  return mapData;
};

const unsetLightColor = (mapData) => {
  mapData.state.lightColor = null;
  return mapData;
};

const unpackCoords = map(
  compose(
    ([posX, posY, posZ]) => ({ posX, posY, posZ }),
    map(unary(parseInt)),
    split("-"),
    nth(0)
  )
);

const categorizeVertices = compose(
  ([corner, [edge, middle]]) => ({
    corners: unpackCoords(corner),
    edges: unpackCoords(edge),
    middles: unpackCoords(middle),
  }),
  adjust(1, partition(compose(equals(2), nth(1)))),
  partition(compose(equals(1), nth(1))),
  toPairs,
  countBy(({ posX, posY, posZ }) => `${posX}-${posY}-${posZ}`),
  map(pick(["posX", "posY", "posZ"])),
  unnest,
  pluck("vertices")
);

const adjustVertexBy = (ref, magnitude, polygons) => {
  return polygons.map((polygon) => {
    polygon.vertices = polygon.vertices.map((vertex) => {
      if (
        vertex.posX === ref.posX &&
        vertex.posY === ref.posY &&
        vertex.posZ === ref.posZ &&
        !vertex.modified
      ) {
        vertex.posY -= magnitude;
        vertex.modified = true;
      }
      return vertex;
    });

    return polygon;
  });
};

const randomBetween = (min, max) => {
  return Math.random() * (max - min) + min;
};

const pickRandoms = (n, set) => {
  if (set.length <= n) {
    return set;
  } else {
    let remaining = set.slice();
    let matches = [];
    for (let i = 0; i < n; i++) {
      let idx = randomBetween(0, remaining.length);
      matches = matches.concat(remaining.splice(idx, 1));
    }
    return matches;
  }
};

module.exports = {
  toRgba,
  movePlayerTo,
  finalize,
  generateBlankMapData,
  saveToDisk,
  setLightColor,
  unsetLightColor,
  categorizeVertices,
  adjustVertexBy,
  randomBetween,
  pickRandoms,
};
