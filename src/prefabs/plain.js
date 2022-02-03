const floor = require("./base/floor.js");
const {
  categorizeVertices,
  bumpByMagnitude,
  adjustVertexBy,
  randomBetween,
  pickRandoms,
  isPartOfNonBumpablePolygon,
  move,
  vertexToVector,
  distance,
  sortByDistance,
} = require("../helpers.js");
const { identity, reject, __, map } = require("ramda");
const { isEmptyArray } = require("ramda-adjunct");

// pos is relative to origin
const plain =
  (pos, size, facing = "floor", onBeforeBumping = identity, config = {}) =>
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
        const pos = [
          x + 100 * i - (sizeX * 100) / 2 + 100 / 2,
          y,
          z + 100 * j - (sizeZ * 100) / 2 + 100 / 2,
        ];
        tmp = floor(pos, facing, null, config.textureRotation ?? 90, 100)(tmp);
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

const disableBumping = (polygons) => {
  return map((polygon) => {
    polygon.config.bumpable = false;
    return polygon;
  })(polygons);
};

const connectToNearPolygons = (targetGroup) => (polygons, mapData) => {
  const { corners, edges } = categorizeVertices(polygons);

  const target = categorizeVertices(mapData.fts.polygons[targetGroup] || []);
  const allVertices = map(vertexToVector, [...target.corners, ...target.edges]);

  if (isEmptyArray(allVertices)) {
    return polygons;
  }

  const distanceThreshold = 100;

  [...corners, ...edges].forEach((corner) => {
    polygons = adjustVertexBy(
      corner,
      (vertex) => {
        const closestVertex = allVertices.sort(
          sortByDistance(vertexToVector(vertex))
        )[0];

        if (
          distance(vertexToVector(vertex), closestVertex) < distanceThreshold
        ) {
          vertex.posX = closestVertex[0];
          vertex.posY = closestVertex[1];
          vertex.posZ = closestVertex[2];
        }

        return vertex;
      },
      polygons
    );
    polygons.forEach((polygon) => {
      polygon.config.bumpable = false;
    });
  });

  return polygons;
};

module.exports = { plain, disableBumping, connectToNearPolygons };
