const createDlfData = (level, now) => ({
  meta: {
    type: "dlf",
    numberOfLeftoverBytes: 0,
  },
  header: {
    version: 1.440000057220459,
    identifier: "DANAE_FILE",
    lastUser: "generator",
    time: now,
    posEdit: {
      x: 0,
      y: 0,
      z: 0,
    },
    angleEdit: {
      a: 0,
      b: 0,
      g: 0,
    },
    numberOfNodes: 0,
    numberOfNodeLinks: 0,
    numberOfZones: 0,
    lighting: 0,
    numberOfBackgroundPolygons: 0,
    numberOfIgnoredPolygons: 0,
    numberOfChildPolygons: 0,
    offset: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
  scene: {
    name: `Graph\\Levels\\level${level}\\`,
  },
  interactiveObjects: [],
  colors: null,
  lights: [],
  fogs: [],
  paths: [],
});

const createFtsData = (level) => {
  const fts = {
    meta: {
      type: "fts",
      numberOfLeftoverBytes: 0,
    },
    header: {
      path: `C:\\ARX\\Game\\Graph\\Levels\\level${level}\\`,
      version: 0.14100000262260437,
    },
    uniqueHeaders: [],
    sceneHeader: {
      version: 0.14100000262260437,
      sizeX: 160, // sizeX is hardcoded to be 160 in the source code
      sizeZ: 160, // sizeZ is hardcoded to be 160 in the source code
      // player position doesn't seem to do anything - if you want to move the player
      // set mScenePosition
      playerPosition: {
        x: 0,
        y: 0,
        z: 0,
      },
      mScenePosition: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
    textureContainers: [],
    cells: [],
    polygons: [],
    anchors: [],
    portals: [],
    roomDistances: [
      {
        distance: -1,
        startPosition: {
          x: 0,
          y: 0,
          z: 0,
        },
        endPosition: {
          x: 1,
          y: null,
          z: 0,
        },
      },
      {
        distance: -1,
        startPosition: {
          x: 0,
          y: 0,
          z: 0,
        },
        endPosition: {
          x: 0,
          y: 1,
          z: null,
        },
      },
      {
        distance: -1,
        startPosition: {
          x: 0.984375,
          y: 0.984375,
          z: 0,
        },
        endPosition: {
          x: 0,
          y: 0,
          z: 0,
        },
      },
      {
        distance: -1,
        startPosition: {
          x: 0,
          y: 0,
          z: 0,
        },
        endPosition: {
          x: 0,
          y: 0,
          z: 0,
        },
      },
    ],
  };

  for (let i = 0; i < 160 * 160; i++) {
    fts.cells.push({ anchors: [] });
  }

  return fts;
};

const createLlfData = (now) => ({
  meta: {
    type: "llf",
    numberOfLeftoverBytes: 0,
  },
  header: {
    version: 1.440000057220459,
    identifier: "DANAE_LLH_FILE",
    lastUser: "generator",
    time: now,
    numberOfShadowPolygons: 0,
    numberOfIgnoredPolygons: 0,
    numberOfBackgroundPolygons: 0,
  },
  lights: [],
  colors: [],
});

const generateBlankMapData = (level) => {
  const now = Math.floor(Date.now() / 1000);

  return {
    dlf: createDlfData(level, now),
    fts: createFtsData(level),
    llf: createLlfData(now),
  };
};

module.exports = {
  generateBlankMapData,
};
