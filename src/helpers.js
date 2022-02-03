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
    isBetween(cellZ * 100, (cellZ + 1) * 100, polygonZ + 1)
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

const vertexToVector = ({ posX, posY, posZ }) => [
  Math.round(posX * 10 ** 4) / 10 ** 4,
  Math.round(posY * 10 ** 4) / 10 ** 4,
  Math.round(posZ * 10 ** 4) / 10 ** 4,
];

// const dotProduct = (u, v) => {
//   // TODO
// };

const vectorToXYZ = ([x, y, z]) => ({ x, y, z });

// const averageVectors = (...vectors) => {
//   return [
//     sum(pluck(0, vectors)) / vectors.length,
//     sum(pluck(1, vectors)) / vectors.length,
//     sum(pluck(2, vectors)) / vectors.length,
//   ];
// };

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

  return mapData;
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

  return compose(
    generateLights,
    calculateNormals,
    exportUsedItems,
    createTextureContainers
  )(mapData);
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

  await fs.promises.writeFile(files.dlf, JSON.stringify(mapData.dlf, null, 2));
  await fs.promises.writeFile(files.fts, JSON.stringify(mapData.fts, null, 2));
  await fs.promises.writeFile(files.llf, JSON.stringify(mapData.llf, null, 2));

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

const isPartOfNonBumpablePolygon = curry((polygons, vertex) => {
  return compose(
    includes(vertex),
    map(pick(["posX", "posY", "posZ"])),
    unnest,
    pluck("vertices"),
    filter((polygon) => polygon.config.bumpable === false)
  )(polygons);
});

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
        return fn(vertex);
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

const toFloatRgb = (color) => {
  const { r, g, b } = color;
  return { r: r / 256, g: g / 256, b: b / 256 };
};

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
        exFlicker: {
          r: 0,
          g: 0,
          b: 0,
        },
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
  isPartOfNonBumpablePolygon,
  categorizeVertices,
  bumpByMagnitude,
  adjustVertexBy,
  randomBetween,
  pickRandoms,
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
};
