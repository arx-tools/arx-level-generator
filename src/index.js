const aliasNightmare = require("./projects/alias-nightmare/index.js");

(async () => {
  await aliasNightmare({
    origin: [6000, 0, 6000],
    levelIdx: 1,
  });
  console.log("done");
})();
