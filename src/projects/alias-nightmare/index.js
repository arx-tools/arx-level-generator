const { compose } = require("ramda");
const {
  generateBlankMapData,
  movePlayerTo,
  finalize,
  saveToDisk,
} = require("../../helpers");
const island = require("./island.js");
// const bridge = require("./bridge.js");
const { NORTH, WEST, SOUTH, EAST } = require("./constants.js");

const generate = async (config) => {
  return compose(
    saveToDisk,
    finalize,

    // bridge({
    //   length: 33,
    // }),
    island({
      pos: [0, 0, 0],
      exits: NORTH | WEST,
    }),

    movePlayerTo([-300, 0, 0]),
    generateBlankMapData
  )(config);
};

module.exports = generate;
