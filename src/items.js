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
    },
  },
  torch: {
    src: "items/provisions/torch/torch.teo",
  },
};

const usedItems = {};
const useItems = (x, y, z, item, script = "") => {
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
      a: 0,
      b: 0,
      g: 0,
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
    reduce((files, { filename, identifier, script }) => {
      const { dir, name } = path.parse(filename);
      files[
        `${outputDir}graph/obj3d/interactive/${dir}/${name}_${padCharsStart(
          "0",
          4,
          toString(identifier)
        )}/${name}.asl`
      ] = script;
      return files;
    }, {}),
    unnest,
    values,
    clone
  )(usedItems);
};

module.exports = { items, useItems, exportUsedItems, exportScripts };
