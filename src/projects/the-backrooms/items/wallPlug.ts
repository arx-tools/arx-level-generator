import {
  addScript,
  createItem,
  markAsUsed,
  moveTo,
  createRootItem,
  ItemDefinition,
  InjectableProps,
} from '../../../assets/items'
import { useTexture, textures } from '../../../assets/textures'
import {
  declare,
  getInjections,
  playSound,
  PLAY_FROM_PLAYER,
  PLAY_LOOP,
  PLAY_UNIQUE,
  PLAY_VARY_PITCH,
  stopSound,
} from '../../../scripting'
import { RotationVector3 } from '../../../types'

const wallPlugDesc: ItemDefinition = {
  src: 'fix_inter/wall_plug/wall_plug.teo',
  native: true,
}

export const defineWallPlug = () => {
  useTexture(textures.backrooms.socket.clean)
  useTexture(textures.backrooms.socket.broken)
  useTexture(textures.backrooms.socket.old)

  const ref = createRootItem(wallPlugDesc, {
    name: '[item--wallplug]',
    interactive: true,
    scale: 0.2,
    mesh: 'polytrans/polytrans.teo',
  })

  addScript((self) => {
    return `
// component: wallPlug
ON INIT {
  ${getInjections('init', self)}
  ACCEPT
}

ON INITEND {
  ${getInjections('initend', self)}
  TWEAK SKIN "[stone]_ground_caves_wet05" "socket-clean"
  ACCEPT
}
`
  }, ref)

  return ref
}

type WallPlugSpecificProps = {
  variant?: 'clean' | 'old' | 'broken'
}

export const createWallPlug = (
  pos,
  angle: RotationVector3 = [0, 0, 0],
  { variant, ...props }: InjectableProps & WallPlugSpecificProps,
  jumpscareCtrl,
) => {
  const ref = createItem(wallPlugDesc, {
    name:
      variant === 'old'
        ? '[item--wallplug-old]'
        : variant === 'broken'
        ? '[item--wallplug-broken]'
        : '[item--wallplug]',
    ...props,
  })

  declare('string', 'variant', variant ?? 'clean', ref)

  addScript((self) => {
    return `
// component: wallPlug
ON INIT {
  ${getInjections('init', self)}
  ACCEPT
}

ON INITEND {
  ${getInjections('initend', self)}
  IF (${ref.state.variant} == "clean") {
    TWEAK SKIN "[stone]_ground_caves_wet05" "socket-clean"
  }
  IF (${ref.state.variant} == "old") {
    TWEAK SKIN "[stone]_ground_caves_wet05" "socket-old"
  }
  IF (${ref.state.variant} == "broken") {
    TWEAK SKIN "[stone]_ground_caves_wet05" "socket-broken"
  }
  ACCEPT
}

ON COMBINE {
  IF ("key_" isin ^CLASS_~^$PARAM1~) {
    GOSUB TOUCH_POWER
    GOSUB SHUTDOWN
  }

  ACCEPT
}

ON ACTION {
  GOSUB TOUCH_POWER
  ACCEPT
}

>>TOUCH_POWER {
  IF (#powerOn == 0) {
    RETURN
  }

  IF (${ref.state.variant} == "old") {
    IF (^RND_100 < 50) {
      GOSUB ELECTROCUTE
      RETURN
    }
  }

  IF (${ref.state.variant} == "broken") {
    GOSUB ELECTROCUTE
    RETURN
  }

  ${playSound('thief_bag', PLAY_VARY_PITCH)}

  RETURN
}

>>ELECTROCUTE {
  DODAMAGE -n player ^player_mana
  ${playSound('sfx_spark', PLAY_VARY_PITCH)}
  QUAKE 300 500 10
  SPEAK -op "player_ouch_medium"
  ${playSound('player_heartb', PLAY_FROM_PLAYER | PLAY_UNIQUE | PLAY_LOOP)}
  TIMERstopheartbeat -m 1 1700 ${stopSound('player_heartb')}
  RETURN
}

>>SHUTDOWN {
  SENDEVENT POWEROUT ${jumpscareCtrl.ref} NOP
  TIMERsmalldelay -m 1 200 SET #powerOn 0
  RETURN
}
    `
  }, ref)

  moveTo({ type: 'relative', coords: pos }, angle, ref)
  markAsUsed(ref)

  return ref
}
