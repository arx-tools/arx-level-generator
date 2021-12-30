// flags for polygons
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

// flags for lighting
const EXTRAS_SEMIDYNAMIC = 0x1;
const EXTRAS_EXTINGUISHABLE = 0x2;
const EXTRAS_STARTEXTINGUISHED = 0x4;
const EXTRAS_SPAWNFIRE = 0x8;
const EXTRAS_SPAWNSMOKE = 0x10;
const EXTRAS_OFF = 0x20;
const EXTRAS_COLORLEGACY = 0x40;
const EXTRAS_NOCASTED = 0x80; // unused
const EXTRAS_FIXFLARESIZE = 0x100;
const EXTRAS_FIREPLACE = 0x200;
const EXTRAS_NO_IGNIT = 0x400; // = it will not react to player casting ignite spell. douse will still work!
const EXTRAS_FLARE = 0x800;

// zone.flags
const PATH_AMBIANCE = 0x02;
const PATH_RGB = 0x04;
const PATH_FARCLIP = 0x08;

const HFLIP = 0x100;
const VFLIP = 0x200;

const MAP_MAX_WIDTH = 160;
const MAP_MAX_HEIGHT = 160;

// in the quest book's map view the coordinates 0/0 and 16000/16000 end up forming a 472x472 square, which is too big
// based on what fits on one page and taking in account the fact, that 0/0 is positioned from the edge of the book
// with a left padding of 20 pixels and a top padding of 98 pixels: if we crop the same amount from the bottom and
// the middle of the book we are left with a 377x337 rectangle. This rectangle is able to display the player anywhere
// within a 12780/11424 size map:
// width = 16000 * 377 / 472 = 12779.661016949
// height = 16000 * 337 / 472 = 11423.728813559
const MAP_WIDTH = 127.8;
const MAP_HEIGHT = 114.24;

const PLAYER_HEIGHT_ADJUSTMENT = -140;

const ISLAND_JOINT_LENGTH = 3;

module.exports = {
  POLY_NO_SHADOW,
  POLY_DOUBLESIDED,
  POLY_TRANS,
  POLY_WATER,
  POLY_GLOW,
  POLY_IGNORE,
  POLY_QUAD,
  POLY_TILED,
  POLY_METAL,
  POLY_HIDE,
  POLY_STONE,
  POLY_WOOD,
  POLY_GRAVEL,
  POLY_EARTH,
  POLY_NOCOL,
  POLY_LAVA,
  POLY_CLIMB,
  POLY_FALL,
  POLY_NOPATH,
  POLY_NODRAW,
  POLY_PRECISE_PATH,
  POLY_NO_CLIMB,
  POLY_ANGULAR,
  POLY_ANGULAR_IDX0,
  POLY_ANGULAR_IDX1,
  POLY_ANGULAR_IDX2,
  POLY_ANGULAR_IDX3,
  POLY_LATE_MIP,

  EXTRAS_SEMIDYNAMIC,
  EXTRAS_EXTINGUISHABLE,
  EXTRAS_STARTEXTINGUISHED,
  EXTRAS_SPAWNFIRE,
  EXTRAS_SPAWNSMOKE,
  EXTRAS_OFF,
  EXTRAS_COLORLEGACY,
  EXTRAS_NOCASTED,
  EXTRAS_FIXFLARESIZE,
  EXTRAS_FIREPLACE,
  EXTRAS_NO_IGNIT,
  EXTRAS_FLARE,

  PATH_AMBIANCE,
  PATH_RGB,
  PATH_FARCLIP,

  HFLIP,
  VFLIP,

  MAP_MAX_WIDTH,
  MAP_MAX_HEIGHT,

  MAP_WIDTH,
  MAP_HEIGHT,

  PLAYER_HEIGHT_ADJUSTMENT,

  ISLAND_JOINT_LENGTH,
};
