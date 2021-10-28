const { compose, times, identity, reduce, __, trim } = require("ramda");
const { room, pillar } = require("./prefabs");
const {
  generateBlankMapData,
  movePlayerTo,
  finalize,
  saveToDisk,
  setLightColor,
  move,
} = require("./helpers.js");
const { items, useItems } = require("./assets/items.js");
const { ambiences, useAmbience } = require("./assets/ambiences.js");

const pillars = (originalX, originalY, originalZ, n, excludeRadius = 100) =>
  reduce(
    (mapData) => {
      // TODO: generate them more evenly spaced out

      do {
        x = originalX + Math.random() * 5000 - 2500;
        z = originalZ + Math.random() * 5000 - 2500;
      } while (
        x >= originalX - excludeRadius &&
        x <= originalX + excludeRadius &&
        z >= originalZ - excludeRadius &&
        z <= originalZ + excludeRadius
      );

      return pillar(x, originalY, z, 20)(mapData);
    },
    __,
    times(identity, n)
  );

const addZone =
  (x, y, z, name, ambience = ambiences.none) =>
  (mapData) => {
    x -= 5000;
    z -= 5000;

    useAmbience(ambience);

    const zoneData = {
      header: {
        name,
        idx: 0,
        flags: 6,
        initPos: {
          x: x,
          y: y + 100,
          z: z,
        },
        pos: {
          x: x,
          y: y + 100,
          z: z,
        },
        rgb: mapData.state.lightColor,
        farClip: 2800,
        reverb: 0,
        ambianceMaxVolume: 100,
        height: -1,
        ambiance: ambience.name,
      },
      pathways: [
        {
          rpos: {
            x: -100,
            y: 0,
            z: 100,
          },
          flag: 0,
          time: 0,
        },
        {
          rpos: {
            x: -100,
            y: 0,
            z: -100,
          },
          flag: 0,
          time: 2000,
        },
        {
          rpos: {
            x: 100,
            y: 0,
            z: -100,
          },
          flag: 0,
          time: 2000,
        },
        {
          rpos: {
            x: 100,
            y: 0,
            z: 100,
          },
          flag: 0,
          time: 0,
        },
      ],
    };

    mapData.dlf.paths.push(zoneData);
    return mapData;
  };

const addItem =
  (x, y, z, item, script = "") =>
  (mapData) => {
    useItems(x - 5000, y + 150, z - 5000, item, trim(script));
    return mapData;
  };

const origin = [5000, 0, 5000];

const generate = compose(
  saveToDisk,
  finalize,

  room(...move(0, 0, (12 * 100) / 2 + (50 * 100) / 2, origin), [3, 50], "ns"),
  pillars(...move(0, 0, (12 * 100) / 2 + (50 * 100) / 2, origin), 10, 3 * 100),

  addZone(...origin, "zone1", ambiences.sirs),
  addItem(
    ...origin,
    items.plants.fern,
    `
ON INIT {
  SETNAME "Smelly Flower"
  ACCEPT
}
  `
  ),
  addItem(...move(-70, -20, +90, origin), items.torch),
  room(...origin, 12, "n"),

  pillars(...origin, 30, 12 * 100),
  setLightColor("#575757"),

  movePlayerTo(...origin),
  generateBlankMapData
);

(async () => {
  await generate({
    levelIdx: 1,
  });

  console.log("done");
})();
