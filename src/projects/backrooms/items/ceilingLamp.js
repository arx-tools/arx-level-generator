const { compose } = require("ramda");
const {
  addScript,
  createItem,
  items,
  markAsUsed,
  moveTo,
  createRootItem,
} = require("../../../assets/items");
const { useTexture, textures } = require("../../../assets/textures");
const { getInjections, declare } = require("../../../scripting");

module.exports.defineCeilingLamp = () => {
  useTexture(textures.backrooms.ceilingLampOn);
  useTexture(textures.backrooms.ceilingLampOff);

  return compose(
    addScript((self) => {
      return `
// component: ceilingLamp
ON INIT {
  ${getInjections("init", self)}

  GOTO SET_SKIN

  ACCEPT
}

>>SET_SKIN {
  if (${self.state.isOn} == 1) {
    TWEAK SKIN "[stone]_ground_caves_wet05" "backrooms-[metal]-light-on"
  } else {
    TWEAK SKIN "[stone]_ground_caves_wet05" "backrooms-[metal]-light-off"
  }

  ACCEPT
}

ON ON {
  SET ${self.state.isOn} 1
  GOTO SET_SKIN
  ACCEPT
}

ON OFF {
  SET ${self.state.isOn} 0
  GOTO SET_SKIN
  ACCEPT
}
      `;
    }),
    declare("int", "isOn", 1),
    createRootItem
  )(items.shape.cube, {
    name: "Ceiling Lamp",
    interactive: false,
  });
};

module.exports.createCeilingLamp = (pos, angle = [0, 0, 0], props = {}) => {
  return compose(
    markAsUsed,
    moveTo(pos, angle),
    addScript((self) => {
      return `
// component: ceilingLamp
ON INIT {
  ${getInjections("init", self)}
  ACCEPT
}
      `;
    }),
    createItem
  )(items.shape.cube, props);
};
