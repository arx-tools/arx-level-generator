import {
  addScript,
  createItem,
  markAsUsed,
  moveTo,
  createRootItem,
  addDependencyAs,
  InjectableProps,
  ItemDefinition,
} from '../../../assets/items'
import { useTexture, textures } from '../../../assets/textures'
import {
  getInjections,
  declare,
  FALSE,
  TRUE,
  UNDEFINED,
  playSound,
  PLAY_LOOP,
  PLAY_UNIQUE,
  PLAY_VARY_PITCH,
  stopSound,
} from '../../../scripting'
import { Vector3 } from '../../../types'
import { ArxRotation } from 'arx-level-json-converter/types/binary/BinaryIO'

const ceilingLampDesc: ItemDefinition = {
  src: 'fix_inter/ceiling-lamp/ceiling-lamp.ftl',
  native: true,
}

export const defineCeilingLamp = () => {
  useTexture(textures.backrooms.ceilingLampOn)
  useTexture(textures.backrooms.ceilingLampOff)

  declare('bool', 'powerOn', TRUE, 'global')

  const ref = createRootItem(ceilingLampDesc, {
    interactive: false,
    // mesh: 'polytrans/polytrans.teo',
  })

  declare('bool', 'isOn', FALSE, ref)
  declare('bool', 'oldIsOn', UNDEFINED, ref)
  declare('bool', 'savedIsOn', UNDEFINED, ref)
  declare('bool', 'muted', FALSE, ref)
  declare('bool', 'oldMuted', UNDEFINED, ref)
  declare('bool', 'instantSwitching', FALSE, ref)
  declare('string', 'caster', '', ref)

  addDependencyAs(
    'projects/the-backrooms/ceiling-lamp.ftl',
    'game/graph/obj3d/interactive/fix_inter/ceiling-lamp/ceiling-lamp.ftl',
    ref,
  )

  addDependencyAs('projects/the-backrooms/sfx/fluorescent-lamp-plink.wav', 'sfx/fluorescent-lamp-plink.wav', ref)
  addDependencyAs('projects/the-backrooms/sfx/fluorescent-lamp-startup.wav', 'sfx/fluorescent-lamp-startup.wav', ref)
  addDependencyAs('projects/the-backrooms/sfx/fluorescent-lamp-hum.wav', 'sfx/fluorescent-lamp-hum.wav', ref)
  addDependencyAs('projects/the-backrooms/sfx/glass-pop-1.wav', 'sfx/glass-pop-1.wav', ref)
  addDependencyAs('projects/the-backrooms/sfx/glass-pop-2.wav', 'sfx/glass-pop-2.wav', ref)
  addDependencyAs('projects/the-backrooms/sfx/glass-pop-3.wav', 'sfx/glass-pop-3.wav', ref)

  addScript((self) => {
    return `
// component: ceilingLamp
ON INIT {
  ${getInjections('init', self)}
  ACCEPT
}

ON INITEND {
  ${getInjections('initend', self)}
  SET ${self.state.oldIsOn} ${self.state.isOn}


  if (${self.state.isOn} == ${TRUE}) {
    TWEAK SKIN "[metal]_dwarf_grid" "backrooms-[metal]-light-on"
    if (${self.state.muted} == ${FALSE}) {
      ${playSound('fluorescent-lamp-hum', PLAY_LOOP | PLAY_UNIQUE | PLAY_VARY_PITCH)}
    }
  } else {
    TWEAK SKIN "[metal]_dwarf_grid" "backrooms-[metal]-light-off"
  }

  ACCEPT
}

ON ON {
  if (#powerOn == ${FALSE}) {
    ACCEPT
  }

  SET ${self.state.isOn} ${TRUE}
  if (^$PARAM1 == "instant") {
    SET ${self.state.instantSwitching} ${TRUE}
  } else {
    SET ${self.state.instantSwitching} ${FALSE}
  }
  GOTO SWITCH
  ACCEPT
}

ON OFF {
  if (#powerOn == ${FALSE}) {
    ACCEPT
  }

  SET ${self.state.isOn} ${FALSE}
  if (^$PARAM1 == "instant") {
    SET ${self.state.instantSwitching} ${TRUE}
  } else {
    SET ${self.state.instantSwitching} ${FALSE}
  }
  GOTO SWITCH
  ACCEPT
}

ON SAVE {
  if (#powerOn == ${FALSE}) {
    ACCEPT
  }

  SET ${self.state.savedIsOn} ${self.state.isOn}
  ACCEPT
}

ON RESTORE {
  if (#powerOn == ${FALSE}) {
    ACCEPT
  }

  SET ${self.state.isOn} ${self.state.savedIsOn}
  GOTO SWITCH
  ACCEPT
}

ON RANDOM {
  if (#powerOn == ${FALSE}) {
    ACCEPT
  }

  IF (^RND_100 > 50) {
    SET ${self.state.isOn} ${TRUE}
  } ELSE {
    SET ${self.state.isOn} ${FALSE}
  }
  if (^$PARAM1 == "instant") {
    SET ${self.state.instantSwitching} ${TRUE}
  } else {
    SET ${self.state.instantSwitching} ${FALSE}
  }
  GOTO SWITCH
  ACCEPT
}

ON HIT {
  if (#powerOn == ${FALSE}) {
    ACCEPT
  }

  IF (^$PARAM2 == "spell") {
    IF (lightning_strike isin ^$PARAM3) {
      SET ${self.state.caster} ~^SENDER~
      SENDEVENT ON SELF ""
    }
    IF (douse isin ^$PARAM3) {
      SENDEVENT OFF SELF ""
    }
  }
  REFUSE
}

>>SWITCH {
  if (${self.state.isOn} == ${self.state.oldIsOn}) {
    ACCEPT
  }

  SET ${self.state.oldIsOn} ${self.state.isOn}

  IF (${self.state.caster} == "player") {
    SET ${self.state.caster} ""
  }

  if (${self.state.isOn} == ${TRUE}) {
    if (${self.state.instantSwitching} == ${TRUE}) {
      SET #ANIM 0
    } else {
      SET #ANIM ^RND_5
      DEC #ANIM 1
      MUL #ANIM 120
    }
    SET #ANIM2 #ANIM1
    INC #ANIM2 500
    TIMERonStart -m 1 #ANIM GOSUB TURN_ON_START
    TIMERonEnd -m 1 #ANIM2 GOSUB TURN_ON_END
  } else {
    if (${self.state.instantSwitching} == ${TRUE}) {
      SET #ANIM 0
    } else {
      SET #ANIM ^RND_5
      DEC #ANIM 1
      MUL #ANIM 120
    }
    SET #ANIM2 #ANIM1
    INC #ANIM2 500
    TIMERoffStart -m 1 #ANIM GOSUB TURN_OFF_START
    TIMERoffEnd -m 1 #ANIM2 GOSUB TURN_OFF_END
  }

  ACCEPT
}

>>TURN_ON_START {
  SPELLCAST -smfx 1 IGNIT self // [s] = no anim, [m] = no draw, [f] = no mana required, [x] = no sound
  if (${self.state.muted} == ${FALSE}) {
    ${playSound('fluorescent-lamp-startup')}
  }
  RETURN
}

>>TURN_ON_END {
  TWEAK SKIN "[stone]_ground_caves_wet05" "backrooms-[metal]-light-on"
  if (${self.state.muted} == ${FALSE}) {
    ${playSound('fluorescent-lamp-hum', PLAY_LOOP | PLAY_UNIQUE | PLAY_VARY_PITCH)}
    ${playSound('fluorescent-lamp-plink')}
  }
  RETURN
}

>>TURN_OFF_START {
  SPELLCAST -smfx 1 DOUSE self
  RETURN
}

>>TURN_OFF_END {
  TWEAK SKIN "[stone]_ground_caves_wet05" "backrooms-[metal]-light-off"
  if (${self.state.muted} == ${FALSE}) {
    ${stopSound('fluorescent-lamp-hum')}
    SET #TMP ^RND_100
    IF (#TMP < 33) {
      ${playSound('glass-pop-1')}
    } ELSE IF (#TMP < 66) {
      ${playSound('glass-pop-2')}
    } ELSE {
      ${playSound('glass-pop-3')}
    }
  }
  RETURN
}

ON MUTE {
  if (#powerOn == ${FALSE}) {
    ACCEPT
  }

  SET ${self.state.muted} ${TRUE}
  GOTO VOLUME
  ACCEPT
}

ON UNMUTE {
  if (#powerOn == ${FALSE}) {
    ACCEPT
  }

  SET ${self.state.muted} ${FALSE}
  GOTO VOLUME
  ACCEPT
}

>>VOLUME {
  if (${self.state.muted} == ${self.state.oldMuted}) {
    ACCEPT
  }

  SET ${self.state.oldMuted} ${self.state.muted}

  IF (${self.state.muted} == ${TRUE}) {
    GOSUB MUTE
  } ELSE {
    GOSUB UNMUTE
  }

  ACCEPT
}

>>MUTE {
  ${stopSound('fluorescent-lamp-hum')}
  ${stopSound('fluorescent-lamp-startup')}
  ${stopSound('fluorescent-lamp-plink')}

  RETURN
}

>>UNMUTE {
  IF (${self.state.isOn} == ${TRUE}) {
    ${playSound('fluorescent-lamp-hum', PLAY_LOOP | PLAY_UNIQUE | PLAY_VARY_PITCH)}
  }

  RETURN
}
      `
  }, ref)

  return ref
}

export type CeilingLampSpecificProps = {
  muted?: boolean
  on?: boolean
}

export const createCeilingLamp = (
  pos: Vector3,
  angle: ArxRotation = { a: 0, b: 0, g: 0 },
  { muted, on, ...props }: InjectableProps & CeilingLampSpecificProps = {},
) => {
  const ref = createItem(ceilingLampDesc, { ...props })

  declare('bool', 'muted', muted ?? false ? TRUE : FALSE, ref)
  declare('bool', 'isOn', on ?? false ? TRUE : FALSE, ref)

  addScript((self) => {
    return `
// component: ceilingLamp
ON INIT {
  ${getInjections('init', self)}
  ACCEPT
}
    `
  }, ref)

  moveTo({ type: 'relative', coords: pos }, angle, ref)
  markAsUsed(ref)
  return ref
}