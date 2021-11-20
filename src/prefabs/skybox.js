const floor = require("./base/floor.js");
const wallX = require("./base/wallX.js");
const wallZ = require("./base/wallZ.js");
const { HFLIP } = require("../constants.js");
const { textures } = require("../assets/textures.js");
const { compose } = require("ramda");
const {
  setTexture,
  setColor,
  setPolygonGroup,
  unsetPolygonGroup,
} = require("../helpers.js");

const skybox = (x, y, z, size) => {
  return compose(
    unsetPolygonGroup,
    floor([x, y - size / 2, z], "ceiling", null, 0, size),
    setTexture(textures.skybox.top),
    floor([x, y + size / 2, z], "floor", null, 2, size),
    setTexture(textures.skybox.bottom),
    wallX([x + size, y, z], "left", null, 0, size, HFLIP),
    setTexture(textures.skybox.left),
    wallX([x, y, z], "right", null, 0, size),
    setTexture(textures.skybox.right),
    wallZ([x, y, z], "front", null, 0, size, HFLIP),
    setTexture(textures.skybox.front),
    wallZ([x, y, z + size], "back", null, 0, size),
    setPolygonGroup("skybox"),
    setTexture(textures.skybox.back),
    setColor("white")
  );
};

module.exports = skybox;
