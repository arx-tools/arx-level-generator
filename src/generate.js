const seedrandom = require("seedrandom");

const aliasNightmare = require("./projects/alias-nightmare/index.js");
const theBackrooms = require("./projects/the-backrooms/index.js");

(async () => {
  // const seed = Math.floor(Math.random() * 1e20);
  let seed = 70448428008674860000;
  seedrandom(seed, { global: true });
  console.log(`seed: ${seed}`);

  const config = {
    origin: [6000, 0, 6000],
    levelIdx: 1,
    seed,
    lootTable: [],
  };

  const project = "the-backrooms";

  switch (project) {
    case "the-backrooms":
      await theBackrooms({
        ...config,
        numberOfRooms: 10,
        roomDimensions: { width: [1, 5], depth: [1, 5], height: 2 },
        lootTable: [
          {
            name: "almondWater",
            weight: 10,
            variant: "mana",
          },
          {
            name: "almondWater",
            weight: 1,
            variant: "xp",
          },
          {
            name: "almondWater",
            weight: 2,
            variant: "slow",
          },
        ],
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
