const { compose } = require("ramda");
const { NORTH, SOUTH, EAST, WEST } = require("./constants");
const { move, setColor } = require("../../helpers");
const { floor } = require("../../prefabs");

// {
//   pos: [0, 0, 0],
//   entrances: NONE,
//   exits: NORTH,
//   width: 14,
//   height: 10,
// }
// {
//   pos: [0, -500, 3000],
//   entrances: SOUTH,
//   exits: EAST,
//   width: 10,
//   height: 10,
// }

const getJoints = ({ pos, entrances, exits, width, height }) => {
  const joints = [];

  if ((exits | entrances) & NORTH) {
    joints.push(move(0, 0, (height * 100) / 2 + 150, pos)); // [2, 5]
  }

  if ((exits | entrances) & SOUTH) {
    joints.push(move(0, 0, -((height * 100) / 2 + 150), pos)); // [2, 5]
  }

  if ((exits | entrances) & EAST) {
    joints.push(move((width * 100) / 2 + 150, 0, 0, pos)); // [5, 2]
  }

  if ((exits | entrances) & WEST) {
    joints.push(move(-((width * 100) / 2 + 150), 0, 0, pos)); // [5, 2]
  }

  return joints;
};

const bridge = (islandA, islandB) => (mapData) => {
  console.log(getJoints(islandA));
  console.log(getJoints(islandB));

  const { origin } = mapData.config;

  return compose(
    floor(move(0, -100, 0, move(...getJoints(islandB)[0], origin))),
    setColor("green"),

    floor(move(0, -100, 0, move(...getJoints(islandA)[0], origin))),
    setColor("blue")
  )(mapData);
};

module.exports = bridge;
