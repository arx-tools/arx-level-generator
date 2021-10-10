const {
  POLY_QUAD,
  POLY_NO_SHADOW,
  POLY_LAVA,
  POLY_FALL,
  POLY_STONE,
} = require("./constants.js");

const textures = {
  stone: {
    castleWall1: {
      tc: 47365312,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[STONE]_HUMAN_CASTLE_WALL1.BMP",
    },
    wall3: {
      tc: 47322688,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[STONE]_HUMAN_WALL3.BMP",
    },
    pattern1: {
      tc: 47368848,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[STONE]_HUMAN_PATTERN1.BMP",
    },
    roof: {
      tc: 47367456,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[STONE]_HUMAN_ROOF.BMP",
    },
    pattern: {
      tc: 47362528,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[STONE]_HUMAN_PATTERN.BMP",
    },
    castleWall3: {
      tc: 47319424,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[STONE]_HUMAN_CASTLE_WALL3.BMP",
    },
    wall8: {
      tc: 47376208,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[STONE]_HUMAN_WALL8.BMP",
    },
    various2: {
      tc: 47317760,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[STONE]_HUMAN_VARIOUS2.BMP",
    },
    wall2: {
      tc: 47373504,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[STONE]_HUMAN_WALL2.BMP",
    },
    various1: {
      tc: 47318592,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[STONE]_HUMAN_VARIOUS1.BMP",
    },
    wall4a: {
      tc: 47377600,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[STONE]_HUMAN_WALL4A.BMP",
    },
    wall22: {
      tc: 47371280,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[STONE]_HUMAN_WALL22.BMP",
    },
    wall21: {
      tc: 47372672,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[STONE]_HUMAN_WALL21.BMP",
    },
    fire02: {
      tc: 47793168,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[STONE]_HUMAN_FIRE02.BMP",
    },
    fire01: {
      tc: 47794000,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[STONE]_HUMAN_FIRE01.BMP",
    },
    castleGround: {
      tc: 47360384,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[STONE]_HUMAN_CASTLE_GROUND.BMP",
    },
    wall2: {
      tc: 47363920,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[STONE]_HUMAN_CASTLE_WALL2.BMP",
    },
    wall9a: {
      tc: 47374816,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[STONE]_HUMAN_WALL9A.BMP",
    },
  },
  wood: {
    various1: {
      tc: 47785808,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[WOOD]_HUMAN_VARIOUS1.BMP",
    },
    coatOfArms: {
      tc: 47321296,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[WOOD]_COAT_OF_ARMS.BMP",
    },
    various2: {
      tc: 47784416,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[WOOD]_HUMAN_VARIOUS2.BMP",
    },
    floor1: {
      tc: 47802096,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[WOOD]_FLOOR1.BMP",
    },
    table: {
      tc: 47800608,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[WOOD]_TABLE.BMP",
    },
  },
  metal: {
    dwarfWall1: {
      tc: 47381136,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[METAL]_DWARF_WALL1.BMP",
    },
    arxLogo: {
      tc: 47792336,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[IRON]_ARX_LOGO.BMP",
    },
    blackSmith: {
      tc: 47786640,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[METAL]_HUMAN_BLACKSMITH.BMP",
    },
    varioud: {
      tc: 47320256,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[IRON]_HUMAN_VARIOUS.BMP",
    },
  },
  fabric: {
    various4: {
      tc: 47361216,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[FABRIC]_HUMAN_VARIOUS4.BMP",
    },
    gobelinBed: {
      tc: 47356032,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\(FABRIC)_GOBELIN_BED.BMP",
    },
  },
  gravel: {
    ground1: {
      tc: 1,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\L5_CAVES_[GRAVEL]_GROUND05",
    },
    fireDust: {
      tc: 47794832,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[DUST]_FIRE_DUST.BMP",
    },
  },
  glass: {
    vitrail2: {
      tc: 2,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\L5_HUMAN_[GLASS]_VITRAIL02",
    },
  },
  misc: {
    sky: {
      tc: 3,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\[STONE]_HUMAN_SKY",
      flags: POLY_QUAD | POLY_NO_SHADOW | POLY_LAVA | POLY_FALL,
    },
    moss1: {
      tc: 4,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\L1_MOSS01",
      flags: POLY_QUAD | POLY_NO_SHADOW | POLY_STONE,
    },
  },
  skybox: {
    top: {
      tc: 5,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\skybox_01_top.JPG",
      flags: POLY_QUAD | POLY_NO_SHADOW /*| POLY_LAVA | POLY_FALL*/,
    },
    left: {
      tc: 6,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\skybox_01_left.JPG",
      flags: POLY_QUAD | POLY_NO_SHADOW /* | POLY_LAVA | POLY_FALL*/,
    },
    right: {
      tc: 7,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\skybox_01_right.JPG",
      flags: POLY_QUAD | POLY_NO_SHADOW /* | POLY_LAVA | POLY_FALL*/,
    },
    front: {
      tc: 8,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\skybox_01_front.JPG",
      flags: POLY_QUAD | POLY_NO_SHADOW /* | POLY_LAVA | POLY_FALL*/,
    },
    back: {
      tc: 9,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\skybox_01_back.JPG",
      flags: POLY_QUAD | POLY_NO_SHADOW /* | POLY_LAVA | POLY_FALL*/,
    },
    bottom: {
      tc: 10,
      temp: 0,
      fic: "GRAPH\\OBJ3D\\TEXTURES\\skybox_01_bottom.JPG",
      flags: POLY_QUAD | POLY_NO_SHADOW /*| POLY_WATER | POLY_FALL*/,
    },
  },
};

module.exports = textures;
