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

ON SPELLCAST {
  IF (^SENDER != PLAYER) ACCEPT

  IF (^$PARAM1 == lightning_strike) {
    SET ${self.state.lightningWasCast} 1
  } ELSE {
    IF (^$PARAM1 == DOUSE) {
      SENDEVENT OFF SELF ""
    }
    SET ${self.state.lightningWasCast} 0
  }

  ACCEPT
}

ON HIT {
  IF (^$PARAM2 == "spell") {
    IF (${self.state.lightningWasCast} == 1) {
      SENDEVENT ON SELF ""
    }
  }
  ACCEPT
}

>>SWITCH {
  if (${self.state.isOn} == ${self.state.oldIsOn}) {
    ACCEPT
  }

  SET ${self.state.oldIsOn} ${self.state.isOn}

  if (${self.state.isOn} == 1) {
    SPELLCAST -smfx 1 IGNIT self
    PLAY "fluorescent-lamp-startup"
    PLAY -lip "fluorescent-lamp-hum" // [l] = loop, [i] = unique, [p] = variable pitch
    TIMERon -m 1 1500 GOSUB TURN_ON
    TIMERautooff 1 ~^RND_30~ SENDEVENT OFF SELF ""
  } else {
    SPELLCAST -smfx 1 DOUSE self
    TIMERoff -m 1 500 GOSUB TURN_OFF
  }
  
  ACCEPT
}

>>TURN_ON {
  TWEAK SKIN "[stone]_ground_caves_wet05" "backrooms-[metal]-light-on"
  PLAY "fluorescent-lamp-pling"
  RETURN
}

>>TURN_OFF {
  TWEAK SKIN "[stone]_ground_caves_wet05" "backrooms-[metal]-light-off"
  PLAY -s "fluorescent-lamp-hum" // [s] = stop (only if unique)
  RETURN
}
      `;
    }),
    declare("int", "isOn", 0),
    declare("int", "oldIsOn", -1),
    declare("int", "lightningWasCast", 0),
    addDependency("sfx/fluorescent-lamp-pling.wav"),
    addDependency("sfx/fluorescent-lamp-startup.wav"),
    addDependency("sfx/fluorescent-lamp-hum.wav"),
    createRootItem
  )(items.shape.cube, {
    name: "Ceiling Lamp",
    interactive: false,
  });
};

// TODO: disable ignite/douse sounds

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
