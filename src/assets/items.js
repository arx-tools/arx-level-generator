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
  isEmpty,
  reject,
  pluck,
  isNil,
  uniq,
} = require("ramda");
const { padCharsStart, isFunction, isObject } = require("ramda-adjunct");
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
  keys: {
    oliverQuest: {
      src: "items/quest_item/key_oliverquest/key_oliverquest.teo",
      native: true,
    },
  },
  doors: {
    portcullis: {
      src: "fix_inter/porticullis/porticullis.teo",
      native: true,
    },
    ylside: {
      src: "fix_inter/door_ylsides/door_ylsides.teo", // non functional
      native: true,
    },
    lightDoor: {
      src: "fix_inter/light_door/light_door.teo",
      native: true,
    },
  },
  corpse: {
    hanging: {
      src: "npc/tortured_corpse/tortured_corpse.teo",
      native: true,
    },
  },
  questItems: {
    mirror: {
      src: "items/quest_item/mirror/mirror.teo",
      native: true,
    },
  },
  magic: {
    rune: {
      src: "items/magic/rune_aam/rune_aam.teo",
      native: true,
    },
    potion: {
      mana: {
        src: "items/magic/potion_mana/potion_mana.teo",
        native: true,
      },
    },
  },
  npc: {
    statue: {
      src: "npc/statue/statue.teo",
      native: false,
      dependencies: [
        "game/graph/obj3d/interactive/npc/statue/statue.ftl",
        "graph/obj3d/anims/npc/statue_rotate.tea",
        "graph/obj3d/anims/npc/statue_wait_1.tea",
        "graph/obj3d/anims/npc/statue_wait_2.tea",
        "graph/obj3d/anims/npc/statue_wait_3.tea",
        "graph/obj3d/anims/npc/statue_wait_4.tea",
        "graph/obj3d/anims/npc/statue_wait.tea",
        "graph/obj3d/textures/demon_statue.jpg",
      ],
    },
  },
  shape: {
    cube: {
      src: "fix_inter/polytrans/polytrans.teo",
      native: true,
    },
  },
};

const usedItems = {};

const propsToInjections = (props) => {
  const init = [];

  if (props.name) {
    init.push(`SETNAME "${props.name}"`);
  }
  if (props.speed) {
    init.push(`SETSPEED ${props.speed}`);
  }
  if (props.hp) {
    init.push(`SET_NPC_STAT life ${props.hp}`);
  }
  if (typeof props.interactive !== "undefined") {
    init.push(`SET_INTERACTIVITY ${props.interactive ? "ON" : "NONE"}`);
  }
  if (typeof props.collision !== "undefined") {
    init.push(`COLLISION ${props.collision ? "ON" : "OFF"}`);
  }

  if (isEmpty(init)) {
    return {};
  } else {
    return { init };
  }
};

const createItem = (item, props = {}) => {
  usedItems[item.src] = usedItems[item.src] || [];

  const id = usedItems[item.src].length;

  usedItems[item.src].push({
    filename: item.src,
    used: false,
    identifier: id + 1,
    pos: { x: 0, y: 0, z: 0 },
    angle: { a: 0, b: 0, g: 0 },
    script: "",
    flags: 0,
    dependencies: item.dependencies || [],
  });

  const { name } = path.parse(item.src);
  const numericId = padCharsStart("0", 4, toString(id + 1));

  return {
    src: item.src,
    id,
    state: {}, // container for script variables
    injections: propsToInjections({ ...item.props, ...props }),
    ref: `${name}_${numericId}`,
  };
};

const createRootItem = (item, props = {}) => {
  usedItems[item.src] = usedItems[item.src] || [];

  usedItems[item.src].root = {
    filename: item.src,
    used: false,
    identifier: "root",
    script: "",
    dependencies: item.dependencies || [],
  };

  const { name } = path.parse(item.src);

  return {
    src: item.src,
    id: "root",
    state: {}, // container for script variables
    injections: propsToInjections({ ...item.props, ...props }),
    ref: `${name}_root`,
  };
};

const addDependency = curry((dependency, itemRef) => {
  const { src, id } = itemRef;
  usedItems[src][id].dependencies.push(dependency);
  return itemRef;
});

const addDependencyAs = curry((source, target, itemRef) => {
  const { src, id } = itemRef;

  usedItems[src][id].dependencies.push({
    source,
    target,
  });

  return itemRef;
});

const addScript = curry((script, itemRef) => {
  const { src, id } = itemRef;
  usedItems[src][id].script = trim(
    isFunction(script) ? script(itemRef) : script
  );
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
  if (usedItems[src].root) {
    usedItems[src].root.used = true;
  }
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
    reject(propEq("identifier", "root")),
    unnest,
    map(values),
    values,
    clone
  )(usedItems);

  return mapData;
};

const exportScripts = (outputDir) => {
  return compose(
    reduce((files, item) => {
      const { dir, name } = path.parse(item.filename);

      let filename;
      if (item.identifier === "root") {
        filename = `${outputDir}/graph/obj3d/interactive/${dir}/${name}.asl`;
      } else {
        const id = padCharsStart("0", 4, toString(item.identifier));
        filename = `${outputDir}/graph/obj3d/interactive/${dir}/${name}_${id}/${name}.asl`;
      }
      files[filename] = item.script;

      return files;
    }, {}),
    filter(propEq("used", true)),
    unnest,
    map(values),
    values,
    clone
  )(usedItems);
};

const exportDependencies = (outputDir) => {
  return compose(
    reduce((files, filename) => {
      if (isObject(filename)) {
        const { source, target } = filename;
        const { dir: dir1, name: name1, ext: ext1 } = path.parse(target);
        const { dir: dir2, name: name2, ext: ext2 } = path.parse(source);
        files[
          `${outputDir}/${dir1}/${name1}${ext1}`
        ] = `./assets/${dir2}/${name2}${ext2}`;
      } else {
        const { dir, name, ext } = path.parse(filename);
        const target = `${outputDir}/${dir}/${name}${ext}`;
        files[target] = `./assets/${dir}/${name}${ext}`;
      }

      return files;
    }, {}),
    uniq,
    unnest,
    pluck("dependencies"),
    filter(propEq("used", true)),
    unnest,
    map(values),
    values,
    clone
  )(usedItems);
};

const saveAs = curry((filename, itemRef) => {
  const { src, id } = itemRef;

  // TODO: add possibility to set where the file should land
  // could be combined with the USEMESH command to use the source item

  // USEMESH "polytrans\\polytrans.teo"

  return itemRef;
});

module.exports = {
  items,
  createItem,
  createRootItem,
  addScript,
  addDependency,
  addDependencyAs,
  moveTo,
  markAsUsed,
  exportUsedItems,
  exportScripts,
  exportDependencies,
  saveAs,
};
