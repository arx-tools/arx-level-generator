const fs = require("fs");
const { textures, exportUsedTextures } = require("./textures.js");
const { skybox, floor, wallX, wallZ } = require("./prefabs");
const { generateBlankMapData } = require("./blankMap.js");
const { compose } = require("ramda");

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

const levelIdx = 1;

const mapData = compose(
  finalize,
  skybox(200, 0, 200, 400),
  floor(200, 0, 200, textures.gravel.ground1, "floor", null, 0, 100),
  movePlayerTo(200, 0, 200),
  generateBlankMapData({})
)(levelIdx);

/*
// --------------------------------------

const width = 8;
const length = 7;
const height = 4;
const originX = 5300;
const originY = 350;
const originZ = 10900;

// --------------------------------------

for (let x = 0; x < width; x++) {
  for (let z = 0; z < length; z++) {
    const isSecondaryTexture = Math.random() * 100 < 15;
    fts.polygons.push(
      floor(
        originX - width * 50 + x * 100,
        originY,
        originZ - length * 50 + z * 100,
        isSecondaryTexture ? textures.wood.table : textures.gravel.ground1,
        "bottom",
        isSecondaryTexture ? 2 : Math.floor(Math.random() * 4),
        isSecondaryTexture ? 0 : Math.floor(Math.random() * 4) * 90
      )
    );
  }
}

const windowPercent = 0;

for (let z = 0; z < length; z++) {
  for (let h = 0; h < height; h++) {
    if (Math.random() > windowPercent) {
      continue;
    }
    fts.polygons.push(
      wallX(
        originX - width * 50,
        originY - 50 - h * 100,
        originZ - length * 50 + z * 100,
        h == 2 ? textures.stone.roof : textures.stone.wall8,
        "right",
        h == 2 ? 1 : (h % 2 ? 0 : 2) + (z % 2)
      )
    );
  }
}

for (let z = 0; z < length; z++) {
  for (let h = 0; h < height; h++) {
    if (Math.random() > windowPercent) {
      continue;
    }
    fts.polygons.push(
      wallX(
        originX - width * 50 + width * 100,
        originY - 50 - h * 100,
        originZ - length * 50 + z * 100,
        h == 2 ? textures.stone.roof : textures.stone.wall8,
        "left",
        h == 2 ? 1 : (h % 2 ? 0 : 2) + (z % 2)
      )
    );
  }
}

for (let x = 0; x < width; x++) {
  for (let h = 0; h < height; h++) {
    if (Math.random() > windowPercent) {
      continue;
    }
    fts.polygons.push(
      wallZ(
        originX - width * 50 + x * 100,
        originY - 50 - h * 100,
        originZ + length * 50,
        h == 2 ? textures.stone.roof : textures.stone.wall8,
        "back",
        h == 2 ? 1 : (h % 2 ? 0 : 2) + (x % 2)
      )
    );
  }
}

for (let x = 0; x < width; x++) {
  for (let h = 0; h < height; h++) {
    if (Math.random() > windowPercent) {
      continue;
    }

    fts.polygons.push(
      wallZ(
        originX - width * 50 + x * 100,
        originY - 50 - h * 100,
        originZ + length * 50 - length * 100,
        h == 2 ? textures.stone.roof : textures.stone.wall8,
        "front",
        h == 2 ? 1 : (h % 2 ? 0 : 2) + (x % 2)
      )
    );
  }
}

llf.colors = fts.polygons.map(() => ({
  r: 250,
  g: 250,
  b: 250,
  a: 255,
}));

skybox(originX, originY, originZ, 4000, { dlf, llf, fts });

// --------------------------------------

fts.sceneHeader.playerPosition = {
  x: 11050,
  y: 350 - 30,
  z: 4650,
};

fts.sceneHeader.mScenePosition = {
  x: 7550,
  y: 370,
  z: 3550,
};

dlf.header.posEdit = {
  x: -2240,
  y: -150.0,
  z: 7164,
};

dlf.header.numberOfBackgroundPolygons = fts.polygons.length;

fts.textureContainers = Object.values(textures).reduce(
  (a, x) => a.concat(Object.values(x)),
  []
);
*/

// ----------------------

const files = {
  fts: `C:/Program Files/Arx Libertatis/game/graph/levels/level${levelIdx}/fast.fts.json`,
  dlf: `C:/Program Files/Arx Libertatis/graph/levels/level${levelIdx}/level${levelIdx}.dlf.json`,
  llf: `C:/Program Files/Arx Libertatis/graph/levels/level${levelIdx}/level${levelIdx}.llf.json`,
};

fs.writeFileSync(files.dlf, JSON.stringify(mapData.dlf, null, 2));
fs.writeFileSync(files.fts, JSON.stringify(mapData.fts, null, 2));
fs.writeFileSync(files.llf, JSON.stringify(mapData.llf, null, 2));

console.log("done");
