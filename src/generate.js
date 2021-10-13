const { pipe } = require("ramda");
const { textures } = require("./textures.js");
const { skybox, floor } = require("./prefabs");
const {
  generateBlankMapData,
  movePlayerTo,
  finalize,
  saveToDisk,
  setLightColor,
  unsetLightColor,
} = require("./helpers.js");
const { MAP_WIDTH } = require("./constants.js");

const centerX = (MAP_WIDTH / 2) * 100;
const centerZ = (MAP_WIDTH / 2) * 100;

const generate = pipe(
  generateBlankMapData,
  // setLightColor("white"),
  floor(centerX, 0, centerZ, textures.gravel.ground1, "floor", null, 0, 100),
  // unsetLightColor,
  // skybox(centerX, 0, -centerZ, 400),
  movePlayerTo(centerX, 0, -centerZ),
  finalize,
  saveToDisk
);

generate({
  levelIdx: 1,
  outputDir: "C:/Program Files/Arx Libertatis",
});

console.log("done");
