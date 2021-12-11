const { compose, reduce, __, isEmpty, addIndex, without } = require("ramda");
const { NORTH, SOUTH, EAST, WEST } = require("./constants");
const {
  move,
  setColor,
  magnitude,
  subtractVec3,
  radToDeg,
  isBetweenInclusive,
} = require("../../helpers");
const { floor } = require("../../prefabs");

const getJoints = ({ pos, entrances, exits, width, height }) => {
  const joints = {};

  const jointLength = 5;

  if ((exits | entrances) & NORTH) {
    joints.north = move(
      0,
      0,
      (height * 100) / 2 + 150 + (jointLength * 100) / 2,
      pos
    );
  }

  if ((exits | entrances) & SOUTH) {
    joints.south = move(
      0,
      0,
      -((height * 100) / 2 + 150 + (jointLength * 100) / 2),
      pos
    );
  }

  if ((exits | entrances) & EAST) {
    joints.east = move(
      (width * 100) / 2 + 150 + (jointLength * 100) / 2,
      0,
      0,
      pos
    );
  }

  if ((exits | entrances) & WEST) {
    joints.west = move(
      -((width * 100) / 2 + 150 + (jointLength * 100) / 2),
      0,
      0,
      pos
    );
  }

  return joints;
};

const findClosestJoint = (a, bx) => {
  if (bx.length === 1) {
    return bx[0];
  }

  const distances = bx.map((b) => Math.abs(magnitude(subtractVec3(a, b))));
  return bx[distances.indexOf(Math.min(...distances))];
};

const bridges = (islands) => (mapData) => {
  const { origin } = mapData.config;

  const joints = islands
    .map(getJoints)
    .reduce((candidates, island, idx, islands) => {
      const otherIslands = without([island], islands);

      const viewAngle = 20;

      if (island.north) {
        const souths = otherIslands
          .filter((island) => island.south)
          .map((island) => island.south)
          .filter((south) => {
            const [x, y, z] = subtractVec3(island.north, south);
            const angle = radToDeg(Math.atan(x / z));
            return isBetweenInclusive(-viewAngle, viewAngle, angle);
          });
        if (souths.length) {
          candidates.push([
            island.north,
            findClosestJoint(island.north, souths),
          ]);
        }
      }
      if (island.south) {
        const norths = otherIslands
          .filter((island) => island.north)
          .map((island) => island.north)
          .filter((north) => {
            const [x, y, z] = subtractVec3(island.south, north);
            const angle = radToDeg(Math.atan(x / z));
            return isBetweenInclusive(-viewAngle, viewAngle, angle);
          });
        if (norths.length) {
          candidates.push([
            island.south,
            findClosestJoint(island.south, norths),
          ]);
        }
      }
      if (island.east) {
        const wests = otherIslands
          .filter((island) => island.west)
          .map((island) => island.west)
          .filter((west) => {
            const [x, y, z] = subtractVec3(island.east, west);
            const angle = radToDeg(Math.atan(x / z)) - 90;
            return isBetweenInclusive(-viewAngle, viewAngle, angle);
          });
        if (wests.length) {
          candidates.push([island.east, findClosestJoint(island.east, wests)]);
        }
      }
      if (island.west) {
        const easts = otherIslands
          .filter((island) => island.east)
          .map((island) => island.east)
          .filter((east) => {
            const [x, y, z] = subtractVec3(island.west, east);
            const angle = radToDeg(Math.atan(x / z)) + 90;
            return isBetweenInclusive(-viewAngle, viewAngle, angle);
          });
        if (easts.length) {
          candidates.push([island.west, findClosestJoint(island.west, easts)]);
        }
      }

      return candidates;
    }, []);

  joints.forEach((joint) => {
    console.log(joint);
  });

  /*
  return compose(
    addIndex(reduce)(
      (mapData, [a, b], idx) => {
        return compose(
          floor(move(...b, origin)),
          floor(move(...a, origin)),
          setColor(["blue", "green", "yellow", "red", "orange"][idx])
        )(mapData);
      },
      __,
      pairs
    )
  )(mapData);
  */
  return mapData;
};

module.exports = bridges;
