const seedrandom = require("seedrandom");
const aliasNightmare = require("./projects/alias-nightmare/index.js");

(async () => {
  const seed = Math.floor(Math.random() * 1e20);
  seedrandom(seed, { global: true });

  console.log(`seed: ${seed}`);

  await aliasNightmare({
    origin: [6000, 0, 6000],
    levelIdx: 1,
    seed,
  });

  console.log("done");
})();
