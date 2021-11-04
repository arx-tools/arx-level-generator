const { compose } = require("ramda");
const { move, setColor } = require("../../helpers.js");
const { plain } = require("../../prefabs");
const { colors } = require("./constants.js");

const bridge = (config) => (mapData) => {
  const { from, to, width = 0, height = 0 } = config;

  const center = move(...from, [
    (to[0] - from[0]) / 2,
    (to[1] - from[1]) / 2,
    (to[2] - from[2]) / 2,
  ]);

  return compose(
    plain(
      center,
      [Math.ceil(center[0] / 100) + width, Math.ceil(center[2] / 100) + height],
      "floor"
    ),
    setColor(colors.terrain)
  )(mapData);
};

module.exports = bridge;
