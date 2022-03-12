const floor = require("./base/floor.js");
const {
  categorizeVertices,
  bumpByMagnitude,
  adjustVertexBy,
  randomBetween,
  pickRandoms,
  move,
  vertexToVector,
  distance,
  isBetween,
} = require("../helpers.js");
const {
  identity,
  reject,
  __,
  map,
  clamp,
  includes,
  pick,
  unnest,
  pluck,
} = require("ramda");
const { isEmptyArray } = require("ramda-adjunct");

// pos is relative to origin
const plain = (
  pos,
  size,
  facing = "floor",
  onBeforeBumping = identity,
  config = () => ({})
) => {
  return (mapData) => {
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
        tmp = floor(
          pos,
          facing,
          null,
          config().textureRotation ?? 90,
          100,
          config().textureFlags ?? 0
        )(tmp);
      }
    }

    let polygons = onBeforeBumping(
      tmp.fts.polygons[mapData.state.polygonGroup],
      mapData
    );

    const nonBumpablePolygons = polygons.filter(
      (polygon) => polygon.config.bumpable === false
    );

    if (polygons.length > nonBumpablePolygons.length) {
      const nonBumpableVertices = nonBumpablePolygons.reduce(
        (acc, { vertices }) => {
          acc.push(
            ...vertices.map(({ posX, posY, posZ }) => `${posX}|${posY}|${posZ}`)
          );
          return acc;
        },
        []
      );

      let { corners, edges, middles } = categorizeVertices(polygons);

      corners
        .filter(
          ({ posX, posY, posZ }) =>
            !nonBumpableVertices.includes(`${posX}|${posY}|${posZ}`)
        )
        .forEach((corner) => {
          const magnitude = 5 * mapData.config.bumpFactor;
          adjustVertexBy(
            corner,
            bumpByMagnitude(
              randomBetween(-magnitude, magnitude) +
                (facing === "floor" ? -80 : 80)
            ),
            polygons
          );
        });

      edges
        .filter(
          ({ posX, posY, posZ }) =>
            !nonBumpableVertices.includes(`${posX}|${posY}|${posZ}`)
        )
        .forEach((edge) => {
          const magnitude = 5 * mapData.config.bumpFactor;
          adjustVertexBy(
            edge,
            bumpByMagnitude(
              randomBetween(-magnitude, magnitude) +
                (facing === "floor" ? -40 : 40)
            ),
            polygons
          );
        });

      middles = middles.filter(
        ({ posX, posY, posZ }) =>
          !nonBumpableVertices.includes(`${posX}|${posY}|${posZ}`)
      );
      pickRandoms(15, middles).forEach((middle) => {
        const magnitude = 10 * mapData.config.bumpFactor;
        adjustVertexBy(
          middle,
          bumpByMagnitude(
            facing === "floor"
              ? clamp(-50, Infinity, randomBetween(-magnitude, magnitude))
              : clamp(
                  -Infinity,
                  50,
                  randomBetween(-magnitude, magnitude) * 3 -
                    randomBetween(5, 25) * mapData.config.bumpFactor
                )
          ),
          polygons
        );
      });
    }

    if (!mapData.fts.polygons[mapData.state.polygonGroup]) {
      mapData.fts.polygons[mapData.state.polygonGroup] = polygons;
    } else {
      mapData.fts.polygons[mapData.state.polygonGroup].push(...polygons);
    }

    return mapData;
  };
};

const disableBumping = (polygons) => {
  polygons.forEach((polygon) => {
    polygon.config.bumpable = false;
  });
  return polygons;
};

const connectToNearPolygons =
  (targetGroup, distanceThreshold = 100) =>
  (polygons, mapData) => {
    const { corners, edges } = categorizeVertices(polygons);
    const sourceVertices = [...corners, ...edges];

    const target = categorizeVertices(mapData.fts.polygons[targetGroup] || []);
    const targetVertices = map(vertexToVector, [
      ...target.corners,
      ...target.edges,
    ]);

    if (isEmptyArray(targetVertices)) {
      return polygons;
    }

    const candidates = {};
    const vertices = [];

    sourceVertices.forEach((polygon, idx) => {
      adjustVertexBy(
        polygon,
        (vertex, polyOfVertex) => {
          const targets = targetVertices.filter((targetVertex) => {
            const d = distance(vertexToVector(vertex), targetVertex);
            return isBetween(10, distanceThreshold, d);
          });

          if (targets.length) {
            vertex.haveBeenAdjusted = false;
            vertices.push(vertex);
          }

          targets.forEach((targetVertex) => {
            const [x, y, z] = targetVertex;
            candidates[`${x}|${y}|${z}`] = candidates[`${x}|${y}|${z}`] || [];
            candidates[`${x}|${y}|${z}`].push({
              polygon: polyOfVertex,
              vertex,
              distance: distance(vertexToVector(vertex), targetVertex),
              coordinates: [x, y, z],
            });
          });

          return vertex;
        },
        polygons
      );
    });

    Object.values(candidates)
      .sort((a, b) => {
        const aDistance = Math.min(...pluck("distance", a));
        const bDistance = Math.min(...pluck("distance", b));
        return aDistance - bDistance;
      })
      .forEach((candidate) => {
        const smallestDistance = Math.min(...pluck("distance", candidate));

        candidate
          .filter(
            (x) =>
              x.distance === smallestDistance &&
              x.vertex.haveBeenAdjusted !== true
          )
          .forEach(({ coordinates, polygon, vertex }) => {
            const [x, y, z] = coordinates;
            vertex.haveBeenAdjusted = true;
            polygon.config.bumpable = false;
            vertex.posX = x;
            vertex.posY = y;
            vertex.posZ = z;
          });
      });

    vertices.forEach((vertex) => {
      delete vertex.haveBeenAdjusted;
    });

    return polygons;
  };

module.exports = { plain, disableBumping, connectToNearPolygons };
