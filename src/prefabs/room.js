const floor = require("./floor.js");
const { textures } = require("../textures.js");

const room =
  (x, y, z, size, entrance = "") =>
  (mapData) => {
    let sizeX = size;
    let sizeZ = size;

    if (Array.isArray(size)) {
      sizeX = size[0];
      sizeZ = size[1];
    }

    for (let j = 0; j < sizeZ; j++) {
      for (let i = 0; i < sizeX; i++) {
        mapData = floor(
          x + 100 * i - (100 * sizeX) / 2 + 100 / 2,
          y,
          z + 100 * j - (100 * sizeZ) / 2 + 100 / 2,
          textures.stone.whiteBricks,
          "floor",
          null,
          90,
          100
        )(mapData);
      }
    }

    return mapData;
  };

module.exports = room;
