const fs = require("fs");
const rgba = require("color-rgba");
const {
  createTextureContainers,
  textures,
  exportTextures,
  resetTextures,
} = require("./assets/textures.js");
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
  replace,
  keys,
  curry,
  apply,
  zip,
  filter,
  includes,
  divide,
  repeat,
  either,
  clone,
  flatten,
  times,
} = require("ramda");
const {
  POLY_QUAD,
  MAP_MAX_HEIGHT,
  MAP_MAX_WIDTH,
  POLY_NODRAW,
  PLAYER_HEIGHT_ADJUSTMENT,
  PATH_RGB,
  PATH_AMBIANCE,
  PATH_FARCLIP,
} = require("./constants.js");
const {
  exportUsedItems,
  exportScripts,
  exportDependencies,
  resetItems,
} = require("./assets/items.js");
const {
  exportAmbiences,
  useAmbience,
  resetAmbiences,
} = require("./assets/ambiences.js");
const { dirname, resolve } = require("path");

const normalize = (v) => {
  return map(apply(divide), zip(v, repeat(magnitude(v), 3)));
};

const move = curry((x, y, z, vector) => {
  return [vector[0] + x, vector[1] + y, vector[2] + z];
});

// "#ff07a4" -> { r: [0..255], g: [0..255], b: [0..255], a: [0..255] }
const toRgba = (colorDefinition) => {
  const [r, g, b, a] = rgba(colorDefinition);

  return {
    r,
    g,
    b,
    a: Math.round(255 * a),
  };
};

// { r: 127, g: 0, b: 0, a: 1 } -> { r: [0.0..1.0], g: [0.0..1.0], b: [0.0..1.0] }
const toFloatRgb = (color) => {
  const { r, g, b } = color;
  return { r: r / 256, g: g / 256, b: b / 256 };
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

const generateLights = (mapData) => {
  let colorIdx = 0;

  const colors = [];
  const white = toRgba("white");

  const p = mapData.fts.polygons.reduce((acc, { config }, idx) => {
    const cellX = Math.floor(config.minX / 100);
    const cellZ = Math.floor(config.minZ) + 1;

    if (!acc[`${cellZ}-${cellX}`]) {
      acc[`${cellZ}-${cellX}`] = [idx];
    } else {
      acc[`${cellZ}-${cellX}`].push(idx);
    }

    return acc;
  }, {});

  for (let z = 0; z < MAP_MAX_HEIGHT; z++) {
    for (let x = 0; x < MAP_MAX_WIDTH; x++) {
      (p[`${z}-${x}`] || []).forEach((idx) => {
        const { config, vertices } = mapData.fts.polygons[idx];
        const { color, isQuad } = config;

        if (color === null) {
          color = white;
        }

        colors.push(color, color, color);
        vertices[0].llfColorIdx = colorIdx++;
        vertices[1].llfColorIdx = colorIdx++;
        vertices[2].llfColorIdx = colorIdx++;

        if (isQuad) {
          colors.push(color);
          vertices[3].llfColorIdx = colorIdx++;
        }
      });
    }
  }

  mapData.llf.colors = colors;
};

const vertexToVector = ({ posX, posY, posZ }) => [
  Math.round(posX * 10000) / 10000,
  Math.round(posY * 10000) / 10000,
  Math.round(posZ * 10000) / 10000,
];

const vectorToXYZ = ([x, y, z]) => ({ x, y, z });

const calculateNormals = (mapData) => {
  // https://computergraphics.stackexchange.com/questions/4031/programmatically-generating-vertex-normals

  mapData.fts.polygons.forEach((polygon) => {
    const { vertices, config } = polygon;

    const points = vertices.map(vertexToVector);

    // vertices are laid down in a russian i shape (И):
    // a c
    // b d
    const [a, b, c, d] = points;

    if (config.isQuad) {
      polygon.norm2 = vectorToXYZ(
        normalize(cross(subtractVec3(c, d), subtractVec3(b, d)))
      );
    } else {
      polygon.norm2 = vectorToXYZ([0, 0, 0]);
    }

    polygon.norm = vectorToXYZ(
      normalize(cross(subtractVec3(b, a), subtractVec3(c, a)))
    );

    polygon.normals = [polygon.norm, polygon.norm, polygon.norm, polygon.norm2];
  });
};

const finalize = (mapData) => {
  mapData.fts.polygons = compose(unnest, values)(mapData.fts.polygons);
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

  mapData.llf.lights.forEach((light) => {
    light.pos.x -= spawn[0];
    light.pos.y -= spawn[1] + PLAYER_HEIGHT_ADJUSTMENT;
    light.pos.z -= spawn[2];
  });

  mapData.dlf.paths.forEach((zone) => {
    zone.header.initPos.x -= spawn[0];
    zone.header.initPos.y -= spawn[1] + PLAYER_HEIGHT_ADJUSTMENT;
    zone.header.initPos.z -= spawn[2];

    zone.header.pos.x -= spawn[0];
    zone.header.pos.y -= spawn[1] + PLAYER_HEIGHT_ADJUSTMENT;
    zone.header.pos.z -= spawn[2];
  });

  createTextureContainers(mapData);
  exportUsedItems(mapData);
  calculateNormals(mapData);
  generateLights(mapData);

  return mapData;
};

const addOriginPolygon = (mapData) => {
  mapData.fts.polygons.global.push({
    config: {
      color: toRgba("black"),
      isQuad: true,
      minX: 0,
      minZ: 0,
      bumpable: false,
    },
    vertices: [
      { posX: 0, posY: 0, posZ: 0, texU: 0, texV: 0 },
      { posX: 1, posY: 0, posZ: 0, texU: 0, texV: 1 },
      { posX: 0, posY: 0, posZ: 1, texU: 1, texV: 0 },
      { posX: 1, posY: 0, posZ: 1, texU: 1, texV: 1 },
    ],
    tex: 0, // no texture at all!
    transval: 0,
    area: 1,
    type: POLY_QUAD | POLY_NODRAW,
    room: 1,
    paddy: 0,
  });

  return mapData;
};

const timestampToDate = (timestamp) => {
  const date = new Date();
  date.setTime(timestamp * 1000);
  return date.toUTCString();
};

const generateBlankMapData = (config) => {
  const now = Math.floor(Date.now() / 1000);
  const generatorVersion = require("../package.json").version;

  const mapData = {
    meta: {
      createdAt: timestampToDate(now),
      generatorVersion,
    },
    config: {
      ...config,
    },
    state: {
      color: null,
      texture: textures.none,
      spawn: [0, 0, 0],
      vertexCounter: 0,
      polygonGroup: "global",
    },
    items: [],
    dlf: createDlfData(config.levelIdx, now),
    fts: createFtsData(config.levelIdx),
    llf: createLlfData(now),
  };

  return compose(addOriginPolygon)(mapData);
};

const uninstall = async (dir) => {
  try {
    const manifest = require(`${dir}/manifest.json`);
    for (let file of manifest.files) {
      try {
        await fs.promises.rm(file);
      } catch (f) {}
    }
    await fs.promises.rm(`${dir}/manifest.json`);
  } catch (e) {}
};

const saveToDisk = async (mapData) => {
  const { levelIdx } = mapData.config;

  const defaultOutputDir = resolve("./dist");

  const outputDir =
    process.env.OUTPUTDIR ?? mapData.config.outputDir ?? defaultOutputDir;

  if (outputDir === defaultOutputDir) {
    try {
      await fs.promises.rm("dist", { recursive: true });
    } catch (e) {}
  } else {
    await uninstall(outputDir);
  }

  let scripts = exportScripts(outputDir);
  let textures = exportTextures(outputDir);
  let ambiences = exportAmbiences(outputDir);
  let dependencies = exportDependencies(outputDir);

  const files = {
    fts: `${outputDir}/game/graph/levels/level${levelIdx}/fast.fts.json`,
    dlf: `${outputDir}/graph/levels/level${levelIdx}/level${levelIdx}.dlf.json`,
    llf: `${outputDir}/graph/levels/level${levelIdx}/level${levelIdx}.llf.json`,
  };

  const manifest = {
    meta: mapData.meta,
    config: mapData.config,
    files: [
      ...values(files),
      ...keys(scripts),
      ...keys(ambiences),
      ...keys(dependencies),
      ...keys(textures),
      files.fts.replace(".fts.json", ".fts"),
      files.dlf.replace(".dlf.json", ".dlf"),
      files.llf.replace(".llf.json", ".llf"),
    ].sort(),
  };

  const tasks = map(
    (path) => fs.promises.mkdir(dirname(path), { recursive: true }),
    manifest.files
  );

  for (let task of tasks) {
    await task;
  }

  // ------------

  scripts = toPairs(scripts);

  for (let [filename, script] of scripts) {
    await fs.promises.writeFile(filename, script, "latin1");
  }

  // ------------

  ambiences = toPairs(ambiences);
  dependencies = toPairs(dependencies);
  textures = toPairs(textures);

  for (let [target, source] of [...ambiences, ...dependencies, ...textures]) {
    await fs.promises.copyFile(source, target);
  }

  // ------------

  await fs.promises.writeFile(files.dlf, JSON.stringify(mapData.dlf));
  await fs.promises.writeFile(files.fts, JSON.stringify(mapData.fts));
  await fs.promises.writeFile(files.llf, JSON.stringify(mapData.llf));

  await fs.promises.writeFile(
    `${outputDir}/manifest.json`,
    JSON.stringify(manifest, null, 2)
  );
};

const setColor = curry((color, mapData) => {
  mapData.state.color = toRgba(color);
  return mapData;
});

const setTexture = curry((texture, mapData) => {
  mapData.state.texture = clone(texture);
  return mapData;
});

const setPolygonGroup = curry((group, mapData) => {
  mapData.state.polygonGroup = group;
  return mapData;
});

const unsetPolygonGroup = (mapData) => {
  mapData.state.polygonGroup = "global";
  return mapData;
};

const unpackCoords = map(
  compose(
    ([posX, posY, posZ]) => ({ posX, posY, posZ }),
    map(unary(parseInt)),
    split("|"),
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
  partition(compose(either(equals(1), equals(3)), nth(1))),
  toPairs,
  countBy(({ posX, posY, posZ }) => `${posX}|${posY}|${posZ}`),
  map(pick(["posX", "posY", "posZ"])),
  unnest,
  pluck("vertices")
);

const bumpByMagnitude = (magnitude) => (vertex) => {
  if (!vertex.modified) {
    vertex.posY -= magnitude;
    vertex.modified = true;
  }

  return vertex;
};

const adjustVertexBy = (ref, fn, polygons) => {
  return polygons.map((polygon) => {
    polygon.vertices = polygon.vertices.map((vertex) => {
      if (
        vertex.posX === ref.posX &&
        vertex.posY === ref.posY &&
        vertex.posZ === ref.posZ
      ) {
        return fn(vertex, polygon);
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

const pickRandom = (set) => {
  return pickRandoms(1, set)[0];
};

const cross = (u, v) => {
  return [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ];
};

const subtractVec3 = (a, b) => {
  return [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
};

const magnitude = ([x, y, z]) => {
  return Math.sqrt(x ** 2 + y ** 2 + z ** 2);
};

const triangleArea = (a, b, c) => {
  return magnitude(cross(subtractVec3(a, b), subtractVec3(a, c))) / 2;
};

const distance = (a, b) => {
  return Math.abs(magnitude(subtractVec3(a, b)));
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

const addLight =
  (pos, props = {}) =>
  (mapData) => {
    let [x, y, z] = pos;

    mapData.llf.lights.push({
      ...{
        pos: { x, y, z },
        rgb: toFloatRgb(mapData.state.color),
        fallstart: 100,
        fallend: 180,
        intensity: 1.3,
        i: 0,
        exFlicker: toFloatRgb(toRgba("black")), // this gets subtracted from light.rgb when flickering
        exRadius: 0,
        exFrequency: 0.01,
        exSize: 0,
        exSpeed: 0,
        exFlareSize: 0,
        extras: 0,
      },
      ...props,
    });

    return mapData;
  };

const addZone =
  (pos, size, name, ambience = ambiences.none, drawDistance = 2000) =>
  (mapData) => {
    let [x, y, z] = pos;

    useAmbience(ambience);

    const zoneData = {
      header: {
        name,
        idx: 0,
        flags: PATH_RGB | PATH_AMBIANCE | PATH_FARCLIP,
        initPos: { x, y, z },
        pos: { x, y, z },
        rgb: toFloatRgb(mapData.state.color),
        farClip: drawDistance,
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

const flipPolygon = (vertices) => {
  const [a, b, c, d] = vertices;
  // vertices are laid down in a russian i shape (И):
  // a c
  // b d
  // to flip both triangles I'm flipping the middle 2 vertices
  return [a, c, b, d];
};

const sortByDistance = (vertex) => (a, b) => {
  const distanceA = distance(vertex, a);
  const distanceB = distance(vertex, b);

  if (distanceA < distanceB) {
    return -1;
  }

  if (distanceA > distanceB) {
    return 1;
  }

  return 0;
};

// [ a, b, c  [ x      [ ax + by + cz
//   d, e, f    y    =   dx + ey + fz
//   g, h, i ]  z ]      gx + hy + iz ]
const matrix3MulVec3 = ([a, b, c, d, e, f, g, h, i], [x, y, z]) => {
  return [a * x + b * y + c * z, d * x + e * y + f * z, g * x + h * y + i * z];
};

const degToRad = (deg) => (deg * Math.PI) / 180;
const radToDeg = (rad) => rad * (180 / Math.PI);

const rotateVec3 = (point, [a, b, g]) => {
  a = degToRad(a);
  b = degToRad(b);
  g = degToRad(g);

  const { sin, cos } = Math;

  const rotation = [
    cos(a) * cos(b),
    cos(a) * sin(b) * sin(g) - sin(a) * cos(g),
    cos(a) * sin(b) * cos(g) + sin(a) * sin(g),
    sin(a) * cos(b),
    sin(a) * sin(b) * sin(g) + cos(a) * cos(g),
    sin(a) * sin(b) * cos(g) - cos(a) * sin(g),
    -sin(b),
    cos(b) * sin(g),
    cos(b) * cos(g),
  ];

  return matrix3MulVec3(rotation, point);
};

const circleOfVectors = (center, radius, division) => {
  const angle = 360 / division;

  const vectors = [];

  for (let i = 0; i < division; i++) {
    vectors.push(
      move(...rotateVec3([0, 0, 1 * radius], [0, angle * i, 0]), center)
    );
  }

  return vectors;
};

const cleanupCache = () => {
  resetItems();
  resetAmbiences();
  resetTextures();
};

const pickRandomLoot = (lootTable) => {
  const idx = pickRandom(
    flatten(lootTable.map(({ weight }, idx) => repeat(idx, weight)))
  );
  return lootTable[idx];
};

module.exports = {
  subtractVec3,
  magnitude,
  normalize,
  move,
  toRgba,
  movePlayerTo,
  finalize,
  generateBlankMapData,
  saveToDisk,
  setColor,
  setTexture,
  categorizeVertices,
  bumpByMagnitude,
  adjustVertexBy,
  randomBetween,
  pickRandoms,
  pickRandom,
  isPointInPolygon,
  isBetween,
  isBetweenInclusive,
  toFloatRgb,
  addLight,
  addZone,
  vertexToVector,
  flipPolygon,
  distance,
  sortByDistance,
  setPolygonGroup,
  unsetPolygonGroup,
  matrix3MulVec3,
  degToRad,
  radToDeg,
  rotateVec3,
  circleOfVectors,
  cleanupCache,
  uninstall,
  pickRandomLoot,
};
