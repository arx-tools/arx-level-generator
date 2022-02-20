const { wallX, wallZ } = require("../../prefabs/index.js");
const { UNIT } = require("./constants.js");
const { compose } = require("ramda");
const { move } = require("../../helpers");

const internalUnit = 100;

module.exports.wall = ([x, y, z], face, config = {}) => {
  return (mapData) => {
    const { origin, roomDimensions } = mapData.config;

    const h = config.height ?? (UNIT * roomDimensions.height) / internalUnit;
    const w = config.width ?? 1;
    const textureRotation = config.textureRotation ?? 0;
    const textureFlags = config.textureFlags ?? 0;

    return compose((mapData) => {
      for (let height = 0; height < h; height++) {
        for (let width = 0; width < w * (UNIT / 100); width++) {
          (face === "left" || face === "right" ? wallX : wallZ)(
            move(
              x +
                internalUnit / 2 +
                (face === "front" || face === "back"
                  ? width * internalUnit + UNIT
                  : 0),
              y - internalUnit / 2 - height * internalUnit,
              z +
                internalUnit / 2 +
                (face === "left" || face === "right"
                  ? width * internalUnit + UNIT
                  : 0),
              origin
            ),
            face,
            null,
            textureRotation,
            internalUnit,
            textureFlags
          )(mapData);
        }
      }
      return mapData;
    })(mapData);
  };
};
