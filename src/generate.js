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

const generate = pipe(
  generateBlankMapData,
  setLightColor("red"),
  floor(200, 0, 200, textures.gravel.ground1, "floor", null, 0, 100),
  unsetLightColor,
  skybox(200, 0, 200, 400),
  movePlayerTo(200, 0, 200),
  finalize,
  saveToDisk
);

generate({
  levelIdx: 1,
  outputDir: "C:/Program Files/Arx Libertatis",
});

console.log("done");
