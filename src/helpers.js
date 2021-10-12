const rgba = require("color-rgba");

const toRgba = (colorDefinition) => {
  const [r, g, b, a] = rgba(colorDefinition);

  return {
    r,
    g,
    b,
    a: (255 / 100) * a,
  };
};

module.exports = {
  toRgba,
};
