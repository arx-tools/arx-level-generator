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
} = require("ramda");
const { padCharsStart } = require("ramda-adjunct");

const items = {
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
const useItems = ([x, y, z], [a, b, g], item, script = "") => {
  usedItems[item.src] = usedItems[item.src] || [];

  usedItems[item.src].push({
    filename: item.src,
    identifier: usedItems[item.src].length + 1,
    pos: {
      x,
      y,
      z,
    },
    angle: {
      a,
      b,
      g,
    },
    script,
    flags: 0,
  });
};

// source: https://stackoverflow.com/a/40011873/1806628
const capitalize = compose(join(""), juxt([compose(toUpper, head), tail]));

// asd/asd.teo -> Asd\\Asd.teo
const arxifyFilename = (filename) => {
  return compose(join("\\"), map(capitalize), split("/"))(filename);
};

const exportUsedItems = (mapData) => {
  mapData.dlf.interactiveObjects = compose(
    map((item) => {
      item.name =
        "C:\\ARX\\Graph\\Obj3D\\Interactive\\" + arxifyFilename(item.filename);
      delete item.filename;
      delete item.script;
      return item;
    }),
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
    unnest,
    values,
    clone
  )(usedItems);
};

module.exports = { items, useItems, exportUsedItems, exportScripts };
