const floor = require("./floor.js");
const { textures } = require("../textures.js");
const {
  categorizeVertices,
  adjustVertexBy,
  randomBetween,
  pickRandoms,
} = require("../helpers.js");

const room =
  (x, y, z, size, entrance = "") =>
  (mapData) => {
    let sizeX = size;
    let sizeZ = size;

    if (Array.isArray(size)) {
      sizeX = size[0];
      sizeZ = size[1];
    }

    let tmp = {
      config: mapData.config,
      state: mapData.state,
      fts: {
        polygons: [],
      },
    };

    for (let j = 0; j < sizeZ; j++) {
      for (let i = 0; i < sizeX; i++) {
        tmp = floor(
          x + 100 * i - (100 * sizeX) / 2 + 100 / 2,
          y,
          z + 100 * j - (100 * sizeZ) / 2 + 100 / 2,
          textures.stone.whiteBricks,
          "floor",
          null,
          90,
          100
        )(tmp);
      }
    }

    let polygons = tmp.fts.polygons;

    const magnitude = 10;
    const { corners, edges, middles } = categorizeVertices(polygons);
    corners.forEach((corner) => {
      polygons = adjustVertexBy(
        corner,
        randomBetween(-magnitude / 2, magnitude / 2) + 20,
        polygons
      );
    });
    edges.forEach((edge) => {
      polygons = adjustVertexBy(
        edge,
        randomBetween(-magnitude / 2, magnitude / 2) + 10,
        polygons
      );
    });
    pickRandoms(7, middles).forEach((middle) => {
      const magnitude = 30;
      polygons = adjustVertexBy(
        middle,
        randomBetween(-magnitude / 2, magnitude / 2),
        polygons
      );
    });

    mapData.fts.polygons = [...mapData.fts.polygons, ...polygons];

    return mapData;
  };

module.exports = room;
