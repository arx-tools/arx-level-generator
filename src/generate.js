const seedrandom = require("seedrandom");

const aliasNightmare = require("./projects/alias-nightmare/index.js");
const theBackrooms = require("./projects/backrooms/index.js");

(async () => {
  // const seed = Math.floor(Math.random() * 1e20);
  let seed = 70448428008674860000;
  seedrandom(seed, { global: true });
  console.log(`seed: ${seed}`);

  const config = {
    origin: [6000, 0, 6000],
    levelIdx: 1,
    seed,
  };

  const project = "backrooms";

  switch (project) {
    case "backrooms":
      await theBackrooms({
        ...config,
        numberOfRooms: 20,
        roomDimensions: { width: [1, 5], depth: [1, 5], height: 2 },
      });
      break;
    case "alias-nightmare":
      await aliasNightmare({
        ...config,
      });
      break;
  }

  console.log("done");
})();
