const colors = {
  pillars: "#1a351c",
  ambience: [
    "hsla(0, 64%, 8%, 1)",
    "hsla(0, 64%, 16%, 1)",
    "hsla(0, 64%, 32%, 1)",
    "hsla(0, 64%, 64%, 1)",
    "hsla(0, 64%, 98%, 1)",
  ],
  lights: "#85a300",
  terrain: "#0a0a0a",
};

const NONE = 0x0;
const NORTH = 0x1;
const EAST = 0x2;
const SOUTH = 0x4;
const WEST = 0x8;

module.exports = {
  colors,
  NONE,
  NORTH,
  EAST,
  SOUTH,
  WEST,
};
