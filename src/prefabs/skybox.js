const floor = require("./floor.js");
const wallX = require("./wallX.js");
const wallZ = require("./wallZ.js");
const { HFLIP, COLOR_WHITE } = require("../constants.js");
const textures = require("../textures.js");

const skybox = (x, y, z, size, { fts, llf }) => {
  fts.polygons.push(
    floor(x, y - size / 2, z, textures.skybox.top, "top", null, 0, size),
    floor(x, y + size / 2, z, textures.skybox.bottom, "bottom", null, 2, size),
    wallX(x + size, y, z, textures.skybox.left, "left", null, 0, size, HFLIP),
    wallX(x, y, z, textures.skybox.right, "right", null, 0, size),
    wallZ(x, y, z, textures.skybox.front, "front", null, 0, size, HFLIP),
    wallZ(x, y, z + size, textures.skybox.back, "back", null, 0, size)
  );

  llf.colors.push(
    COLOR_WHITE,
    COLOR_WHITE,
    COLOR_WHITE,
    COLOR_WHITE,
    COLOR_WHITE,
    COLOR_WHITE
  );
};

module.exports = skybox;
