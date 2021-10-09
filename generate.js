const fs = require("fs");

const level = 1;
const files = {
  fts: `C:/Program Files/Arx Libertatis/game/graph/levels/level${level}/fast.fts.json`,
  dlf: `C:/Program Files/Arx Libertatis/graph/levels/level${level}/level${level}.dlf.json`,
  llf: `C:/Program Files/Arx Libertatis/graph/levels/level${level}/level${level}.llf.json`,
};

const fts = require(files.fts);
const dlf = require(files.dlf);
const llf = require(files.llf);

// ----------------------

const POLY_NO_SHADOW = 0x1;
const POLY_DOUBLESIDED = 0x2;
const POLY_TRANS = 0x4;
const POLY_WATER = 0x8;
const POLY_GLOW = 0x10;
const POLY_IGNORE = 0x20;
const POLY_QUAD = 0x40;
const POLY_TILED = 0x80; // unused
const POLY_METAL = 0x100;
const POLY_HIDE = 0x200;
const POLY_STONE = 0x400;
const POLY_WOOD = 0x800;
const POLY_GRAVEL = 0x1000;
const POLY_EARTH = 0x2000;
const POLY_NOCOL = 0x4000;
const POLY_LAVA = 0x8000;
const POLY_CLIMB = 0x10000;
const POLY_FALL = 0x20000;
const POLY_NOPATH = 0x40000;
const POLY_NODRAW = 0x80000;
const POLY_PRECISE_PATH = 0x100000;
const POLY_NO_CLIMB = 0x200000; // unused
const POLY_ANGULAR = 0x400000; // unused
const POLY_ANGULAR_IDX0 = 0x800000; // unused
const POLY_ANGULAR_IDX1 = 0x1000000; // unused
const POLY_ANGULAR_IDX2 = 0x2000000; // unused
const POLY_ANGULAR_IDX3 = 0x4000000; // unused
const POLY_LATE_MIP = 0x8000000;

// ----------------------

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

const HFLIP = 0x100;
const VFLIP = 0x200;

const floor = (
  x,
  y,
  z,
  texture,
  direction = "right",
  quad = 0,
  textureRotation = 0,
  size = 100,
  flags = 0
) => {
  let texU = 0;
  let texV = 0;

  let a = { u: 0.5, v: 0 };
  let b = { u: 0.5, v: 0.5 };
  let c = { u: 0, v: 0 };
  let d = { u: 0, v: 0.5 };

  if (quad === null) {
    a = { u: 1, v: 0 };
    b = { u: 1, v: 1 };
    c = { u: 0, v: 0 };
    d = { u: 0, v: 1 };
  } else {
    switch (quad) {
      case 0:
        texU = 0;
        texV = 0;
        break;
      case 1:
        texU = 0.5;
        texV = 0;
        break;
      case 2:
        texU = 0;
        texV = 0.5;
        break;
      case 3:
        texU = 0.5;
        texV = 0.5;
        break;
    }
  }

  let uv = [c, d, a, b]; // 0
  switch (textureRotation) {
    case 90:
      uv = [a, c, b, d]; // 90
      break;
    case 180:
      uv = [b, a, d, c]; // 180
      break;
    case 270:
      uv = [d, b, c, a]; // 270
  }

  if (flags & HFLIP) {
    uv = [uv[2], uv[3], uv[0], uv[1]];
  }

  if (flags & VFLIP) {
    uv = [uv[1], uv[0], uv[3], uv[2]];
  }

  return {
    vertices: [
      {
        posX: x - size / 2,
        posY: y,
        posZ: z - size / 2,
        texU: texU + uv[0].u,
        texV: texV + uv[0].v,
      },
      {
        posX: x + size / 2,
        posY: y,
        posZ: z - size / 2,
        texU: texU + uv[1].u,
        texV: texV + uv[1].v,
      },
      {
        posX: x - size / 2,
        posY: y,
        posZ: z + size / 2,
        texU: texU + uv[2].u,
        texV: texV + uv[2].v,
      },
      {
        posX: x + size / 2,
        posY: y,
        posZ: z + size / 2,
        texU: texU + uv[3].u,
        texV: texV + uv[3].v,
      },
    ],
    tex: texture.tc,
    norm: { x: 0, y: direction === "top" ? 1 : -1, z: 0 },
    norm2: { x: 0, y: direction === "top" ? 1 : -1, z: 0 },
    normals: [
      { x: 0, y: direction === "top" ? 1 : -1, z: 0 },
      { x: 0, y: direction === "top" ? 1 : -1, z: 0 },
      { x: 0, y: direction === "top" ? 1 : -1, z: 0 },
      { x: 0, y: direction === "top" ? 1 : -1, z: 0 },
    ],
    transval: 0,
    area: size * size,
    type: texture.flags ?? POLY_QUAD | POLY_NO_SHADOW,
    room: 1,
    paddy: 0,
  };
};

const wallX = (
  x,
  y,
  z,
  texture,
  direction = "right",
  quad = 0,
  textureRotation = 0,
  size = 100,
  flags = 0
) => {
  let texU = 0;
  let texV = 0;

  let a = { u: 0.5, v: 0 };
  let b = { u: 0.5, v: 0.5 };
  let c = { u: 0, v: 0 };
  let d = { u: 0, v: 0.5 };

  if (quad === null) {
    a = { u: 1, v: 0 };
    b = { u: 1, v: 1 };
    c = { u: 0, v: 0 };
    d = { u: 0, v: 1 };
  } else {
    switch (quad) {
      case 0:
        texU = 0;
        texV = 0;
        break;
      case 1:
        texU = 0.5;
        texV = 0;
        break;
      case 2:
        texU = 0.5;
        texV = 0.5;
        break;
      case 3:
        texU = 0;
        texV = 0.5;
        break;
    }
  }

  let uv = [c, d, a, b]; // 0
  switch (textureRotation) {
    case 90:
      uv = [a, c, b, d]; // 90
      break;
    case 180:
      uv = [b, a, d, c]; // 180
      break;
    case 270:
      uv = [d, b, c, a]; // 270
  }

  if (flags & HFLIP) {
    uv = [uv[2], uv[3], uv[0], uv[1]];
  }

  if (flags & VFLIP) {
    uv = [uv[1], uv[0], uv[3], uv[2]];
  }

  return {
    vertices: [
      {
        posX: x - size / 2,
        posY: y - size / 2,
        posZ: z - size / 2,
        texU: texU + uv[0].u,
        texV: texV + uv[0].v,
      },
      {
        posX: x - size / 2,
        posY: y + size / 2,
        posZ: z - size / 2,
        texU: texU + uv[1].u,
        texV: texV + uv[1].v,
      },
      {
        posX: x - size / 2,
        posY: y - size / 2,
        posZ: z + size / 2,
        texU: texU + uv[2].u,
        texV: texV + uv[2].v,
      },
      {
        posX: x - size / 2,
        posY: y + size / 2,
        posZ: z + size / 2,
        texU: texU + uv[3].u,
        texV: texV + uv[3].v,
      },
    ],
    tex: texture.tc,
    norm: { x: direction === "right" ? 1 : -1, y: 0, z: 0 },
    norm2: { x: direction === "right" ? 1 : -1, y: 0, z: 0 },
    normals: [
      { x: direction === "right" ? 1 : -1, y: 0, z: 0 },
      { x: direction === "right" ? 1 : -1, y: 0, z: 0 },
      { x: direction === "right" ? 1 : -1, y: 0, z: 0 },
      { x: direction === "right" ? 1 : -1, y: 0, z: 0 },
    ],
    transval: 0,
    area: 10000,
    type: texture.flags || POLY_QUAD | POLY_NO_SHADOW,
    room: 1,
    paddy: 0,
  };
};

const wallZ = (
  x,
  y,
  z,
  texture,
  direction = "front",
  quad = 0,
  textureRotation = 0,
  size = 100,
  flags = 0
) => {
  let texU = 0;
  let texV = 0;

  let a = { u: 0.5, v: 0 };
  let b = { u: 0.5, v: 0.5 };
  let c = { u: 0, v: 0 };
  let d = { u: 0, v: 0.5 };

  if (quad === null) {
    a = { u: 1, v: 0 };
    b = { u: 1, v: 1 };
    c = { u: 0, v: 0 };
    d = { u: 0, v: 1 };
  } else {
    switch (quad) {
      case 0:
        texU = 0;
        texV = 0;
        break;
      case 1:
        texU = 0.5;
        texV = 0;
        break;
      case 2:
        texU = 0.5;
        texV = 0.5;
        break;
      case 3:
        texU = 0;
        texV = 0.5;
        break;
    }
  }

  let uv = [c, d, a, b]; // 0
  switch (textureRotation) {
    case 90:
      uv = [a, c, b, d]; // 90
      break;
    case 180:
      uv = [b, a, d, c]; // 180
      break;
    case 270:
      uv = [d, b, c, a]; // 270
  }

  if (flags & HFLIP) {
    uv = [uv[2], uv[3], uv[0], uv[1]];
  }

  if (flags & VFLIP) {
    uv = [uv[1], uv[0], uv[3], uv[2]];
  }

  return {
    vertices: [
      {
        posX: x - size / 2,
        posY: y - size / 2,
        posZ: z - size / 2,
        texU: texU + uv[0].u,
        texV: texV + uv[0].v,
      },
      {
        posX: x - size / 2,
        posY: y + size / 2,
        posZ: z - size / 2,
        texU: texU + uv[1].u,
        texV: texV + uv[1].v,
      },
      {
        posX: x + size / 2,
        posY: y - size / 2,
        posZ: z - size / 2,
        texU: texU + uv[2].u,
        texV: texV + uv[2].v,
      },
      {
        posX: x + size / 2,
        posY: y + size / 2,
        posZ: z - size / 2,
        texU: texU + uv[3].u,
        texV: texV + uv[3].v,
      },
    ],
    tex: texture.tc,
    norm: { x: 0, y: 0, z: direction === "front" ? 1 : -1 },
    norm2: { x: 0, y: 0, z: direction === "front" ? 1 : -1 },
    normals: [
      { x: 0, y: 0, z: direction === "front" ? 1 : -1 },
      { x: 0, y: 0, z: direction === "front" ? 1 : -1 },
      { x: 0, y: 0, z: direction === "front" ? 1 : -1 },
      { x: 0, y: 0, z: direction === "front" ? 1 : -1 },
    ],
    transval: 0,
    area: 10000,
    type: texture.flags || POLY_QUAD | POLY_NO_SHADOW,
    room: 1,
    paddy: 0,
  };
};

// --------------------------------------

const skybox = (x, y, z, size) => {
  fts.polygons.push(
    floor(x, y - size / 2, z, textures.skybox.top, "top", null, 0, size),
    floor(x, y + size / 2, z, textures.skybox.bottom, "bottom", null, 2, size),
    wallX(x + size, y, z, textures.skybox.left, "left", null, 0, size, HFLIP),
    wallX(x, y, z, textures.skybox.right, "right", null, 0, size),
    wallZ(x, y, z, textures.skybox.front, "front", null, 0, size, HFLIP),
    wallZ(x, y, z + size, textures.skybox.back, "back", null, 0, size)
  );

  llf.colors.push(
    { r: 255, g: 255, b: 255, a: 255 },
    { r: 255, g: 255, b: 255, a: 255 },
    { r: 255, g: 255, b: 255, a: 255 },
    { r: 255, g: 255, b: 255, a: 255 },
    { r: 255, g: 255, b: 255, a: 255 },
    { r: 255, g: 255, b: 255, a: 255 }
  );
};

// --------------------------------------

const width = 8;
const length = 7;
const height = 4;
const originX = 5300;
const originY = 350;
const originZ = 10900;

// --------------------------------------

dlf.interactiveObjects = [];
fts.polygons = [];
llf.colors = [];

for (let x = 0; x < width; x++) {
  for (let z = 0; z < length; z++) {
    const isSecondaryTexture = Math.random() * 100 < 15;
    fts.polygons.push(
      floor(
        originX - width * 50 + x * 100,
        originY,
        originZ - length * 50 + z * 100,
        isSecondaryTexture ? textures.wood.table : textures.gravel.ground1,
        "bottom",
        isSecondaryTexture ? 2 : Math.floor(Math.random() * 4),
        isSecondaryTexture ? 0 : Math.floor(Math.random() * 4) * 90
      )
    );
  }
}

const windowPercent = 0;

for (let z = 0; z < length; z++) {
  for (let h = 0; h < height; h++) {
    if (Math.random() > windowPercent) {
      continue;
    }
    fts.polygons.push(
      wallX(
        originX - width * 50,
        originY - 50 - h * 100,
        originZ - length * 50 + z * 100,
        h == 2 ? textures.stone.roof : textures.stone.wall8,
        "right",
        h == 2 ? 1 : (h % 2 ? 0 : 2) + (z % 2)
      )
    );
  }
}

for (let z = 0; z < length; z++) {
  for (let h = 0; h < height; h++) {
    if (Math.random() > windowPercent) {
      continue;
    }
    fts.polygons.push(
      wallX(
        originX - width * 50 + width * 100,
        originY - 50 - h * 100,
        originZ - length * 50 + z * 100,
        h == 2 ? textures.stone.roof : textures.stone.wall8,
        "left",
        h == 2 ? 1 : (h % 2 ? 0 : 2) + (z % 2)
      )
    );
  }
}

for (let x = 0; x < width; x++) {
  for (let h = 0; h < height; h++) {
    if (Math.random() > windowPercent) {
      continue;
    }
    fts.polygons.push(
      wallZ(
        originX - width * 50 + x * 100,
        originY - 50 - h * 100,
        originZ + length * 50,
        h == 2 ? textures.stone.roof : textures.stone.wall8,
        "back",
        h == 2 ? 1 : (h % 2 ? 0 : 2) + (x % 2)
      )
    );

    /*
    if ((h === 0 || h === 1) && x === Math.floor(width / 2)) {
      if (h === 0) {
        dlf.interactiveObjects.push({
          name: "C:\\ARX\\GRAPH\\OBJ3D\\INTERACTIVE\\FIX_INTER\\LIGHT_DOOR\\LIGHT_DOOR.teo",
          pos: {
            x: dlf.header.posEdit.x - 60,
            y: dlf.header.posEdit.y + 130,
            z: dlf.header.posEdit.z - 211,
            // x: -2084,
            // y: -80,
            // z: 7444,
          },
          angle: {
            a: 0,
            b: 90,
            g: 0,
          },
          identifier: 1,
          flags: 0,
        });
      }

      continue;
    }
    */
  }
}

for (let x = 0; x < width; x++) {
  for (let h = 0; h < height; h++) {
    if (Math.random() > windowPercent) {
      continue;
    }

    fts.polygons.push(
      wallZ(
        originX - width * 50 + x * 100,
        originY - 50 - h * 100,
        originZ + length * 50 - length * 100,
        h == 2 ? textures.stone.roof : textures.stone.wall8,
        "front",
        h == 2 ? 1 : (h % 2 ? 0 : 2) + (x % 2)
      )
    );
  }
}

llf.colors = fts.polygons.map(() => ({
  r: 250,
  g: 250,
  b: 250,
  a: 255,
}));

skybox(originX, originY, originZ, 4000);

// --------------------------------------

fts.sceneHeader.playerPosition = {
  x: 11050,
  y: 350 - 30,
  z: 4650,
};

fts.sceneHeader.mScenePosition = {
  x: 7550,
  y: 370,
  z: 3550,
};

dlf.header.posEdit = {
  x: -2240,
  y: -150.0,
  z: 7164,
};

dlf.header.numberOfBackgroundPolygons = fts.polygons.length;

fts.textureContainers = Object.values(textures).reduce(
  (a, x) => a.concat(Object.values(x)),
  []
);

// ----------------------

fs.writeFileSync(files.fts, JSON.stringify(fts, null, 2));
fs.writeFileSync(files.dlf, JSON.stringify(dlf, null, 2));
fs.writeFileSync(files.llf, JSON.stringify(llf, null, 2));

console.log("done");
