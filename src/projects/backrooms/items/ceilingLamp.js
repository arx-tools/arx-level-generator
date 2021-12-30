const { compose } = require("ramda");
const {
  addScript,
  createItem,
  items,
  markAsUsed,
  moveTo,
  createRootItem,
  addDependency,
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

  GOTO SWITCH

  ACCEPT
}

ON ON {
  SET ${self.state.isOn} 1
  GOTO SWITCH
  ACCEPT
}

ON OFF {
  SET ${self.state.isOn} 0
  GOTO SWITCH
  ACCEPT
}

>>SWITCH {
  if (${self.state.isOn} == ${self.state.oldIsOn}) {
    ACCEPT
  }

  SET ${self.state.oldIsOn} ${self.state.isOn}

  if (${self.state.isOn} == 1) {
    PLAY "fluorescent-lamp-startup"
    PLAY -lip "fluorescent-lamp-hum"
    TIMERx 1 1 GOSUB TURN_ON
  } else {
    TWEAK SKIN "[stone]_ground_caves_wet05" "backrooms-[metal]-light-off"
    PLAY -s "fluorescent-lamp-hum"
  }
  
  ACCEPT
}

>>TURN_ON {
  TWEAK SKIN "[stone]_ground_caves_wet05" "backrooms-[metal]-light-on"
  PLAY "fluorescent-lamp-pling"
  RETURN
}
      `;
    }),
    declare("int", "isOn", 0),
    declare("int", "oldIsOn", -1),
    addDependency("sfx/fluorescent-lamp-pling.wav"),
    addDependency("sfx/fluorescent-lamp-startup.wav"),
    addDependency("sfx/fluorescent-lamp-hum.wav"),
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
