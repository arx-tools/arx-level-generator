const { compose, times, identity, reduce, __ } = require("ramda");
const { room, pillar } = require("./prefabs");
const {
  generateBlankMapData,
  movePlayerTo,
  finalize,
  saveToDisk,
  setLightColor,
} = require("./helpers.js");
const { items } = require("./items.js");

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
  (x, y, z, ambiance = "NONE") =>
  (mapData) => {
    x -= 5000;
    z -= 5000;
    const zoneData = {
      header: {
        name: "HELLO",
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
        ambiance,
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

const addItem = (x, y, z, item) => (mapData) => {
  x -= 5000;
  z -= 5000;

  const itemData = {
    name: "C:\\ARX\\Graph\\Obj3D\\Interactive\\" + item.src,
    pos: {
      x: x,
      y: y + 150,
      z: z,
    },
    angle: {
      a: 0,
      b: 0,
      g: 0,
    },
    identifier: item.id,
    flags: 0,
  };

  mapData.dlf.interactiveObjects.push(itemData);

  return mapData;
};

const origin = [5000, 0, 5000];

const generate = compose(
  saveToDisk,
  finalize,

  room(
    origin[0],
    origin[1],
    origin[2] + (12 * 100) / 2 + (50 * 100) / 2,
    [3, 50],
    "ns"
  ),
  pillars(
    origin[0],
    origin[1],
    origin[2] + (12 * 100) / 2 + (50 * 100) / 2,
    10,
    3 * 100
  ),

  addZone(...origin, "ambient_noden"),
  addItem(...origin, items.plants.fern),
  room(...origin, 12, "n"),

  pillars(...origin, 30, 12 * 100),
  setLightColor("#575757"),

  movePlayerTo(...origin),
  generateBlankMapData
);

generate({
  levelIdx: 1,
  outputDir: "C:/Program Files/Arx Libertatis",
});

console.log("done");
