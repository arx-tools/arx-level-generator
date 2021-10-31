const path = require("path");
const {
  map,
  values,
  compose,
  unnest,
  clone,
  split,
  join,
  juxt,
  toUpper,
  head,
  tail,
  reduce,
  toString,
  trim,
  propEq,
  filter,
  curry,
} = require("ramda");
const { padCharsStart } = require("ramda-adjunct");
const { PLAYER_HEIGHT_ADJUSTMENT } = require("../constants");

const items = {
  marker: {
    src: "system/marker/marker.teo",
    native: true,
  },
  plants: {
    fern: {
      src: "items/magic/fern/fern.teo",
      native: true,
    },
  },
  torch: {
    src: "items/provisions/torch/torch.teo",
    native: true,
  },
  mechanisms: {
    pressurePlate: {
      src: "fix_inter/pressurepad_gob/pressurepad_gob.teo",
      native: true,
    },
  },
  signs: {
    stone: {
      src: "fix_inter/public_notice/public_notice.teo",
      native: true,
    },
  },
  doors: {
    portcullis: {
      src: "fix_inter/porticullis/porticullis.teo",
      native: true,
    },
  },
};

const usedItems = {};

const createItem = (item) => {
  usedItems[item.src] = usedItems[item.src] || [];

  const id = usedItems[item.src].length;

  usedItems[item.src].push({
    filename: item.src,
    used: false,
    identifier: id + 1,
    pos: {
      x: 0,
      y: 0,
      z: 0,
    },
    angle: {
      a: 0,
      b: 0,
      g: 0,
    },
    script: "",
    flags: 0,
  });

  const { name } = path.parse(item.src);
  const numericId = padCharsStart("0", 4, toString(id + 1));

  return {
    src: item.src,
    id,
    state: {},
    injections: {},
    ref: `${name}_${numericId}`,
  };
};

const addScript = curry((script, itemRef) => {
  const { src, id } = itemRef;
  usedItems[src][id].script = trim(script);
  return itemRef;
});

const moveTo = curry(([x, y, z], [a, b, g], itemRef) => {
  const { src, id } = itemRef;
  usedItems[src][id].pos = { x, y, z };
  usedItems[src][id].angle = { a, b, g };
  return itemRef;
});

const markAsUsed = (itemRef) => {
  const { src, id } = itemRef;
  usedItems[src][id].used = true;
  return itemRef;
};

// source: https://stackoverflow.com/a/40011873/1806628
const capitalize = compose(join(""), juxt([compose(toUpper, head), tail]));

// asd/asd.teo -> Asd\\Asd.teo
const arxifyFilename = (filename) => {
  return compose(join("\\"), map(capitalize), split("/"))(filename);
};

const exportUsedItems = (mapData) => {
  const { spawn } = mapData.state;

  mapData.dlf.interactiveObjects = compose(
    map((item) => {
      item.name =
        "C:\\ARX\\Graph\\Obj3D\\Interactive\\" + arxifyFilename(item.filename);
      delete item.filename;
      delete item.script;
      const { x, y, z } = item.pos;
      item.pos = {
        x: x - spawn[0],
        y: y - spawn[1] - PLAYER_HEIGHT_ADJUSTMENT,
        z: z - spawn[2],
      };
      return item;
    }),
    filter(propEq("used", true)),
    unnest,
    values,
    clone
  )(usedItems);

  return mapData;
};

const exportScripts = (outputDir) => {
  return compose(
    reduce((files, item) => {
      const { dir, name } = path.parse(item.filename);

      const id = padCharsStart("0", 4, toString(item.identifier));
      const filename = `${outputDir}graph/obj3d/interactive/${dir}/${name}_${id}/${name}.asl`;

      files[filename] = item.script;
      return files;
    }, {}),
    filter(propEq("used", true)),
    unnest,
    values,
    clone
  )(usedItems);
};

module.exports = {
  items,
  createItem,
  addScript,
  moveTo,
  markAsUsed,
  exportUsedItems,
  exportScripts,
};
