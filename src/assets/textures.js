const {
  includes,
  indexOf,
  addIndex,
  map,
  compose,
  clone,
  filter,
  propEq,
  reduce,
  uniq,
} = require("ramda");
const path = require("path");

const textures = {
  none: null,
  gravel: {
    ground1: {
      src: "L5_CAVES_[GRAVEL]_GROUND05",
      native: true,
    },
  },
  wood: {
    aliciaRoomMur02: {
      src: "[WOOD]_ALICIAROOM_MUR02.jpg",
      native: true,
    },
  },
  stone: {
    humanWall1: {
      src: "[STONE]_HUMAN_STONE_WALL1.jpg",
      native: true,
    },
    akbaa4f: {
      src: "[STONE]_HUMAN_AKBAA4_F.jpg",
      native: true,
    },
    humanPriest4: {
      src: "[STONE]_HUMAN_PRIEST4.jpg",
      native: true,
    },
    stairs: {
      src: "[STONE]_HUMAN_STONE_ORNAMENT.jpg",
      native: true,
      width: 256,
      height: 256,
    },
  },
  skybox: {
    top: {
      src: "skybox_01_top.jpg",
      native: false,
    },
    left: {
      src: "skybox_01_left.jpg",
      native: false,
    },
    right: {
      src: "skybox_01_right.jpg",
      native: false,
    },
    front: {
      src: "skybox_01_front.jpg",
      native: false,
    },
    back: {
      src: "skybox_01_back.jpg",
      native: false,
    },
    bottom: {
      src: "skybox_01_bottom.jpg",
      native: false,
    },
  },
  backrooms: {
    wall: {
      src: "backrooms-[stone]-wall.jpg",
      native: false,
    },
    wall2: {
      src: "backrooms-[stone]-wall2.jpg",
      native: false,
    },
    floor: {
      src: "backrooms-[fabric]-carpet.jpg",
      native: false,
    },
    floor2: {
      src: "backrooms-[fabric]-carpet2.jpg",
      native: false,
    },
    ceiling: {
      src: "backrooms-[stone]-ceiling-tile.jpg",
      native: false,
    },
    ceilingDiffuser: {
      src: "backrooms-[metal]-ceiling-air-diffuser.jpg",
      native: false,
    },
    ceilingLampOn: {
      src: "backrooms-[metal]-light-on.jpg",
      native: false,
    },
    ceilingLampOff: {
      src: "backrooms-[metal]-light-off.jpg",
      native: false,
    },
  },
};

let usedTextures = [];

const useTexture = (texture) => {
  if (texture === textures.none) {
    return 0;
  }

  if (!includes(texture, usedTextures)) {
    usedTextures.push(texture);
  }

  return indexOf(texture, usedTextures) + 1;
};

const createTextureContainers = (mapData) => {
  mapData.fts.textureContainers = addIndex(map)((texture, idx) => {
    return {
      tc: idx + 1,
      temp: 0,
      fic: `GRAPH\\OBJ3D\\TEXTURES\\${texture.src}`,
    };
  }, usedTextures);
  return mapData;
};

const exportTextures = (outputDir) => {
  return compose(
    reduce((files, texture) => {
      const filename = `${outputDir}/graph/obj3d/textures/${texture.src}`;
      files[filename] = path.resolve(
        `assets/graph/obj3d/textures/${texture.src}`
      );
      return files;
    }, {}),
    uniq,
    filter(propEq("native", false)),
    clone
  )(usedTextures);
};

const resetTextures = () => {
  usedTextures = [];
};

module.exports = {
  textures,
  useTexture,
  createTextureContainers,
  exportTextures,
  resetTextures,
};
