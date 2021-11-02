const floor = require("./base/floor.js");
const wallX = require("./base/wallX.js");
const wallZ = require("./base/wallZ.js");
const { HFLIP } = require("../constants.js");
const { textures } = require("../assets/textures.js");
const { compose } = require("ramda");

const skybox = (x, y, z, size) => {
  return compose(
    floor([x, y - size / 2, z], textures.skybox.top, "ceiling", null, 0, size),
    floor([x, y + size / 2, z], textures.skybox.bottom, "floor", null, 2, size),
    wallX([x + size, y, z], textures.skybox.left, "left", null, 0, size, HFLIP),
    wallX([x, y, z], textures.skybox.right, "right", null, 0, size),
    wallZ([x, y, z], textures.skybox.front, "front", null, 0, size, HFLIP),
    wallZ([x, y, z + size], textures.skybox.back, "back", null, 0, size)
  );
};

module.exports = skybox;
