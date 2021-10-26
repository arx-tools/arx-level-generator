const { includes, indexOf, addIndex, map } = require("ramda");

const textures = {
  wall: {
    white: {
      src: "[WOOD]_ALICIAROOM_MUR02.jpg",
    },
  },
  gravel: {
    ground1: {
      src: "L5_CAVES_[GRAVEL]_GROUND05",
    },
  },
  stone: {
    whiteBricks: {
      src: "[STONE]_HUMAN_STONE_WALL1.jpg",
    },
  },
  skybox: {
    top: {
      src: "skybox_01_top.JPG",
    },
    left: {
      src: "skybox_01_left.JPG",
    },
    right: {
      src: "skybox_01_right.JPG",
    },
    front: {
      src: "skybox_01_front.JPG",
    },
    back: {
      src: "skybox_01_back.JPG",
    },
    bottom: {
      src: "skybox_01_bottom.JPG",
    },
  },
};

const usedTextures = [];
const useTexture = (texture) => {
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
