const floor = require("./base/floor.js");
const {
  categorizeVertices,
  bumpByMagnitude,
  adjustVertexBy,
  randomBetween,
  pickRandoms,
  isPartOfNonBumpablePolygon,
  move,
} = require("../helpers.js");
const { identity, assoc, map, compose, reject, __ } = require("ramda");

const plain =
  (pos, size, facing = "floor", onBeforeBumping = identity) =>
  (mapData) => {
    const { origin } = mapData.config;

    const [x, y, z] = move(...pos, origin);

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
        polygons: {
          [mapData.state.polygonGroup]: [],
        },
      },
    };

    for (let j = 0; j < sizeZ; j++) {
      for (let i = 0; i < sizeX; i++) {
        tmp = floor(
          [
            x + 100 * i - (sizeX * 100) / 2 + 100 / 2,
            y,
            z + 100 * j - (sizeZ * 100) / 2 + 100 / 2,
          ],
          facing,
          null,
          90,
          100
        )(tmp);
      }
    }

    let polygons = onBeforeBumping(
      tmp.fts.polygons[mapData.state.polygonGroup],
      mapData
    );

    let { corners, edges, middles } = categorizeVertices(polygons);

    corners = reject(isPartOfNonBumpablePolygon(polygons), corners);
    edges = reject(isPartOfNonBumpablePolygon(polygons), edges);
    middles = reject(isPartOfNonBumpablePolygon(polygons), middles);

    corners.forEach((corner) => {
      const magnitude = 10;
      polygons = adjustVertexBy(
        corner,
        bumpByMagnitude(
          randomBetween(-magnitude, magnitude) + (facing === "floor" ? -80 : 80)
        ),
        polygons
      );
    });
    edges.forEach((edge) => {
      const magnitude = 10;
      polygons = adjustVertexBy(
        edge,
        bumpByMagnitude(
          randomBetween(-magnitude, magnitude) + (facing === "floor" ? -40 : 40)
        ),
        polygons
      );
    });
    pickRandoms(15, middles).forEach((middle) => {
      const magnitude = 50;
      polygons = adjustVertexBy(
        middle,
        bumpByMagnitude(randomBetween(-magnitude, magnitude)),
        polygons
      );
    });

    mapData.fts.polygons[mapData.state.polygonGroup] =
      mapData.fts.polygons[mapData.state.polygonGroup] || [];

    mapData.fts.polygons[mapData.state.polygonGroup] = [
      ...mapData.fts.polygons[mapData.state.polygonGroup],
      ...polygons,
    ];

    return mapData;
  };

module.exports = plain;
