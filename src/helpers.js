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
  curry,
  apply,
  flip,
  subtract,
  zip,
  propEq,
  filter,
  includes,
} = require("ramda");
const {
  POLY_QUAD,
  MAP_MAX_HEIGHT,
  MAP_MAX_WIDTH,
  POLY_NODRAW,
  PLAYER_HEIGHT_ADJUSTMENT,
} = require("./constants.js");
const { exportUsedItems, exportScripts } = require("./assets/items.js");
const { exportAmbiences, useAmbience } = require("./assets/ambiences.js");

const move = curry((x, y, z, vector) => {
  return [vector[0] + x, vector[1] + y, vector[2] + z];
});

const toRgba = (colorDefinition) => {
  const [r, g, b, a] = rgba(colorDefinition);

  return {
    r,
    g,
    b,
    a: Math.round(255 * a),
  };
};

const movePlayerTo = curry((pos, mapData) => {
  mapData.state.spawn = pos;
  return mapData;
});

const isBetween = (min, max, value) => {
  return value >= min && value < max;
};

const isBetweenInclusive = (min, max, value) => {
  return value >= min && value <= max;
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

  const { spawn } = mapData.state;

  const [x, y, z] = move(
    0,
    PLAYER_HEIGHT_ADJUSTMENT,
    0,
    move(...mapData.config.origin, spawn)
  );
  mapData.fts.sceneHeader.mScenePosition = { x, y, z };

  mapData.llf.lights = map((light) => {
    const { x, y, z } = light.pos;

    light.pos = {
      x: x - spawn[0],
      y: y - spawn[1] - PLAYER_HEIGHT_ADJUSTMENT,
      z: z - spawn[2],
    };

    return light;
  }, mapData.llf.lights);

  mapData.dlf.paths = map((zone) => {
    const { pos, initPos } = zone.header;
    zone.header.initPos = {
      x: initPos.x - spawn[0],
      y: initPos.y - spawn[1] - PLAYER_HEIGHT_ADJUSTMENT,
      z: initPos.z - spawn[2],
    };

    zone.header.pos = {
      x: pos.x - spawn[0],
      y: pos.y - spawn[1] - PLAYER_HEIGHT_ADJUSTMENT,
      z: pos.z - spawn[2],
    };

    return zone;
  }, mapData.dlf.paths);

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
      color: null,
      spawn: [0, 0, 0],
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

const setColor = curry((color, mapData) => {
  mapData.state.color = toRgba(color);
  return mapData;
});

const unsetColor = (mapData) => {
  mapData.state.color = null;
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

const isPartOfNonBumpablePolygon = curry((polygons, vertex) => {
  return compose(
    includes(vertex),
    map(pick(["posX", "posY", "posZ"])),
    unnest,
    pluck("vertices"),
    filter(propEq("bumpable", false))
  )(polygons);
});

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

const cross = (u, v) => {
  return [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ];
};

const subtractVec3 = (a, b) => compose(map(apply(flip(subtract))), zip)(a, b);

const magnitude = ([x, y, z]) => {
  return Math.sqrt(x ** 2 + y ** 2 + z ** 2);
};

const triangleArea = (a, b, c) => {
  return magnitude(cross(subtractVec3(a, b), subtractVec3(a, c))) / 2;
};

// source: https://www.scratchapixel.com/lessons/3d-basic-rendering/ray-tracing-rendering-a-triangle/barycentric-coordinates
const isPointInTriangle = curry((p, a, b, c) => {
  const area = triangleArea(a, b, c);

  const u = triangleArea(c, a, p) / area;
  const v = triangleArea(a, b, p) / area;
  const w = triangleArea(b, c, p) / area;

  return (
    isBetweenInclusive(0, 1, u) &&
    isBetweenInclusive(0, 1, v) &&
    isBetweenInclusive(0, 1, w) &&
    u + v + w === 1
  );
});

const isPointInPolygon = curry((point, polygon) => {
  const [a, b, c, d] = polygon.vertices.map(({ posX, posY, posZ }) => [
    posX,
    posY,
    posZ,
  ]);
  if (polygon.config.isQuad) {
    return (
      isPointInTriangle(point, a, b, c) || isPointInTriangle(point, b, c, d)
    );
  } else {
    return isPointInTriangle(point, a, b, c);
  }
});

const toFloatRgb = (color) => {
  const { r, g, b } = color;
  return { r: r / 256, g: g / 256, b: b / 256 };
};

const addLight = curry((pos, mapData) => {
  let [x, y, z] = pos;

  mapData.llf.lights.push({
    pos: { x, y, z },
    rgb: toFloatRgb(mapData.state.color),
    fallstart: 50,
    fallend: 180,
    intensity: 0.7,
    i: 0,
    exFlicker: {
      r: 0,
      g: 0,
      b: 0,
    },
    exRadius: 0,
    exFrequency: 0.01,
    exSize: 0.1,
    exSpeed: 0,
    exFlareSize: 0,
    extras: 0,
  });

  return mapData;
});

const addZone =
  (pos, size, name, ambience = ambiences.none) =>
  (mapData) => {
    let [x, y, z] = pos;

    useAmbience(ambience);

    const zoneData = {
      header: {
        name,
        idx: 0,
        flags: 6,
        initPos: { x, y, z },
        pos: { x, y, z },
        rgb: toFloatRgb(mapData.state.color),
        farClip: 2800,
        reverb: 0,
        ambianceMaxVolume: 100,
        height: size[1] === 0 ? -1 : size[1],
        ambiance: ambience.name,
      },
      pathways: [
        { rpos: { x: -size[0] / 2, y: 0, z: size[2] / 2 }, flag: 0, time: 0 },
        {
          rpos: { x: -size[0] / 2, y: 0, z: -size[2] / 2 },
          flag: 0,
          time: 2000,
        },
        {
          rpos: { x: size[0] / 2, y: 0, z: -size[2] / 2 },
          flag: 0,
          time: 2000,
        },
        { rpos: { x: size[0] / 2, y: 0, z: size[2] / 2 }, flag: 0, time: 0 },
      ],
    };

    mapData.dlf.paths.push(zoneData);
    return mapData;
  };

module.exports = {
  move,
  toRgba,
  movePlayerTo,
  finalize,
  generateBlankMapData,
  saveToDisk,
  setColor,
  unsetColor,
  isPartOfNonBumpablePolygon,
  categorizeVertices,
  adjustVertexBy,
  randomBetween,
  pickRandoms,
  isPointInPolygon,
  isBetween,
  isBetweenInclusive,
  toFloatRgb,
  addLight,
  addZone,
};
