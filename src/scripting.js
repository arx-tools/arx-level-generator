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

const declare = curry((type, name, initialValue, scope) => {
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
    let value = initialValue;
    switch (type) {
      case "int":
        scope.state[name] = `§${name}`;
        break;
      case "float":
        scope.state[name] = `@${name}`;
        break;
      case "string":
        scope.state[name] = `£${name}`;
        initialValue = `"${initialValue}"`;
        break;
    }

    if (initialValue !== null) {
      scope.injections.init = scope.injections.init || [];
      scope.injections.init.push(`SET ${scope.state[name]} ${value}`);
    }
  }

  return scope;
});

const getInjections = (eventName, scope) => {
  return (scope.injections[eventName] || []).join("\n  ");
};

module.exports = {
  globalScope,
  color,
  declare,
  getInjections,
};
