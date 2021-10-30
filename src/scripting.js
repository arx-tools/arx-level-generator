const rgba = require("color-rgba");
const { compose, dropLast, join, curry, map, divide, __ } = require("ramda");

const color = (colorDefinition) => {
  return compose(
    join(" "),
    map(divide(__, 256)),
    dropLast(1),
    rgba
  )(colorDefinition);
};

const globalScope = {};

const declare = curry((type, name, scope) => {
  if (scope === "global") {
    switch (type) {
      case "int":
        globalScope[name] = `#${name}`;
        break;
      case "float":
        globalScope[name] = `&${name}`;
        break;
      case "string":
        globalScope[name] = `$${name}`;
        break;
    }
  } else {
    switch (type) {
      case "int":
        scope.state[name] = `§${name}`;
        break;
      case "float":
        scope.state[name] = `@${name}`;
        break;
      case "string":
        scope.state[name] = `£${name}`;
        break;
    }
  }

  return scope;
});

module.exports = {
  globalScope,
  color,
  declare,
};
