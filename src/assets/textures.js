const { includes, indexOf, addIndex, map } = require("ramda");

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
      src: "skybox_01_top.JPG",
      native: false,
    },
    left: {
      src: "skybox_01_left.JPG",
      native: false,
    },
    right: {
      src: "skybox_01_right.JPG",
      native: false,
    },
    front: {
      src: "skybox_01_front.JPG",
      native: false,
    },
    back: {
      src: "skybox_01_back.JPG",
      native: false,
    },
    bottom: {
      src: "skybox_01_bottom.JPG",
      native: false,
    },
  },
};

const usedTextures = [];
const useTexture = (texture) => {
  if (texture === textures.none) {
    return 0;
  }

  if (!includes(texture.src, usedTextures)) {
    usedTextures.push(texture.src);
  }

  return indexOf(texture.src, usedTextures) + 1;
};

const exportUsedTextures = (mapData) => {
  mapData.fts.textureContainers = addIndex(map)((texture, idx) => {
    return {
      tc: idx + 1,
      temp: 0,
      fic: `GRAPH\\OBJ3D\\TEXTURES\\${texture}`,
    };
  }, usedTextures);
  return mapData;
};

module.exports = { textures, useTexture, exportUsedTextures };
