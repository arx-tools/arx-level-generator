const { compose } = require("ramda");
const {
  addScript,
  createItem,
  items,
  markAsUsed,
  moveTo,
  createRootItem,
  addDependency,
  addDependencyAs,
} = require("../../../assets/items");
const { useTexture, textures } = require("../../../assets/textures");
const { getInjections, declare } = require("../../../scripting");

const itemDesc = {
  src: "fix_inter/ceiling_lamp/ceiling_lamp.teo",
  native: true,
};

module.exports.defineCeilingLamp = () => {
  useTexture(textures.backrooms.ceilingLampOn);
  useTexture(textures.backrooms.ceilingLampOff);

  return compose(
    addScript((self) => {
      return `
// component: ceilingLamp
ON INIT {
  ${getInjections("init", self)}
  USEMESH "polytrans/polytrans.teo"
  ACCEPT
}

ON INITEND {
  SET ${self.state.oldIsOn} ${self.state.isOn}

  if (${self.state.isOn} == 1) {
    TWEAK SKIN "[stone]_ground_caves_wet05" "backrooms-[metal]-light-on"
    if (${self.state.muted} == 0) {
      PLAY -lip "fluorescent-lamp-hum" // [l] = loop, [i] = unique, [p] = variable pitch
    }
  } else {
    TWEAK SKIN "[stone]_ground_caves_wet05" "backrooms-[metal]-light-off"
  }

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

ON SAVE {
  SET ${self.state.savedIsOn} ${self.state.isOn}
  ACCEPT
}

ON RESTORE {
  SET ${self.state.isOn} ${self.state.savedIsOn}
  GOTO SWITCH
  ACCEPT
}

ON RANDOM {
  IF (^RND_100 > 50) {
    SET ${self.state.isOn} 1
  } ELSE {
    SET ${self.state.isOn} 0
  }
  GOTO SWITCH
  ACCEPT
}

ON SPELLCAST {
  IF (^SENDER != PLAYER) {
    ACCEPT
  }

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
    SPELLCAST -smfx 1 IGNIT self // [s] = no anim, [m] = no draw, [f] = no mana required, [x] = no sound
    if (${self.state.muted} == 0) {
      PLAY "fluorescent-lamp-startup"
      PLAY -lip "fluorescent-lamp-hum" // [l] = loop, [i] = unique, [p] = variable pitch
    }
    TIMERon -m 1 500 GOSUB TURN_ON
  } else {
    SPELLCAST -smfx 1 DOUSE self
    TIMERoff -m 1 500 GOSUB TURN_OFF
  }

  ACCEPT
}

>>TURN_ON {
  TWEAK SKIN "[stone]_ground_caves_wet05" "backrooms-[metal]-light-on"
  if (${self.state.muted} == 0) {
    PLAY "fluorescent-lamp-plink"
  }
  RETURN
}

>>TURN_OFF {
  TWEAK SKIN "[stone]_ground_caves_wet05" "backrooms-[metal]-light-off"
  if (${self.state.muted} == 0) {
    PLAY -s "fluorescent-lamp-hum" // [s] = stop (only if unique)
    SET #TMP ^RND_100
    IF (#TMP < 33) {
      PLAY "glass-pop-1"
    } ELSE IF (#TMP < 66) {
      PLAY "glass-pop-2"
    } ELSE {
      PLAY "glass-pop-3"
    }
  }
  RETURN
}

ON MUTE {
  SET ${self.state.muted} 1
  GOTO VOLUME
  ACCEPT
}

ON UNMUTE {
  SET ${self.state.muted} 0
  GOTO VOLUME
  ACCEPT
}

>>VOLUME {
  if (${self.state.muted} == ${self.state.oldMuted}) {
    ACCEPT
  }

  SET ${self.state.oldMuted} ${self.state.muted}

  IF (${self.state.muted} == 1) {
    GOSUB MUTE
  } ELSE {
    GOSUB UNMUTE
  }

  ACCEPT
}

>>MUTE {
  PLAY -s "fluorescent-lamp-hum"
  PLAY -s "fluorescent-lamp-startup"
  PLAY -s "fluorescent-lamp-plink"

  RETURN
}

>>UNMUTE {
  IF (${self.state.isOn} == 1) {
    PLAY -lip "fluorescent-lamp-hum" // [l] = loop, [i] = unique, [p] = variable pitch
  }

  RETURN
}
      `;
    }),
    declare("int", "isOn", 0),
    declare("int", "oldIsOn", -1),
    declare("int", "savedIsOn", -1),
    declare("int", "lightningWasCast", 0),
    declare("int", "muted", 0),
    declare("int", "oldMuted", -1),
    addDependency("sfx/fluorescent-lamp-plink.wav"),
    addDependency("sfx/fluorescent-lamp-startup.wav"),
    addDependency("sfx/fluorescent-lamp-hum.wav"),
    addDependencyAs(
      "projects/backrooms/glass-pop-1.wav",
      "sfx/glass-pop-1.wav"
    ),
    addDependencyAs(
      "projects/backrooms/glass-pop-2.wav",
      "sfx/glass-pop-2.wav"
    ),
    addDependencyAs(
      "projects/backrooms/glass-pop-3.wav",
      "sfx/glass-pop-3.wav"
    ),
    createRootItem
  )(itemDesc, {
    name: "Ceiling Lamp",
    interactive: false,
  });
};

// TODO: disable ignite/douse sounds

module.exports.createCeilingLamp = (pos, angle = [0, 0, 0], config = {}) => {
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
    declare("int", "isOn", config.on ?? false ? 1 : 0),
    createItem
  )(itemDesc, {});
};
