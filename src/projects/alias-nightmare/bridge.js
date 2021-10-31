const { compose } = require("ramda");
const { move, setColor } = require("../../helpers.js");
const { plain } = require("../../prefabs");
const { colors } = require("./constants.js");

const bridge = (config) => (mapData) => {
  const { pos, length } = config;
  const origin = move(...pos, mapData.config.origin);

  return compose(
    // TODO
    plain(move(0, 0, (12 * 100) / 2 + (length * 100) / 2, origin), [3, length]),
    setColor(colors.terrain)
  )(mapData);
};

module.exports = bridge;
