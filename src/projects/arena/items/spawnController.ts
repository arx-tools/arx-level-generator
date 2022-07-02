import {
  addScript,
  createItem,
  items,
  moveTo,
  markAsUsed,
} from '../../../assets/items'
import { declare, FALSE, getInjections, TRUE } from '../../../scripting'
import { Vector3 } from '../../../types'

const SPAWN_PROTECT_TIME = 3000
const DEATHCAM_TIME = 4000

export const createSpawnController = (pos: Vector3) => {
  const ref = createItem(items.marker, {})

  declare('bool', 'ignoreNextKillEvent', FALSE, ref)

  addScript((self) => {
    return `
// component: spawnController
ON INIT {
  ${getInjections('init', self)}
  ACCEPT
}

ON KILLED {
  herosay "~^$param1~ was killed"
  IF (^$PARAM1 == "player") {
    IF (${ref.state.ignoreNextKillEvent} == ${TRUE}) {
      SET ${ref.state.ignoreNextKillEvent} ${FALSE}
    } ELSE {
      TIMERrespawn -m 1 ${DEATHCAM_TIME} GOTO RESURRECT
    }
  } ELSE {
    TIMERrespawn -m 1 ${DEATHCAM_TIME} sendevent custom ~^$param1~ "revive"
  }
  ACCEPT
}

>>RESURRECT {
  gosub respawn
  gosub spawn_protect_on
  TIMERspawnprotectOff -m 1 ${SPAWN_PROTECT_TIME} goto spawn_protect_off
  ACCEPT
}

>>RESPAWN {
  setplayercontrols on specialfx heal 1
  SET ${ref.state.ignoreNextKillEvent} ${TRUE}
  dodamage player 1
  setplayercontrols on specialfx heal ^player_maxlife
  RETURN
}

>>SPAWN_PROTECT_ON {
  sendevent glow player on
  invulnerability -p on
  RETURN
}
>>SPAWN_PROTECT_OFF {
  sendevent glow player off
  invulnerability -p off
  ACCEPT
}

    `
  }, ref)

  moveTo({ type: 'relative', coords: pos }, [0, 0, 0], ref)

  markAsUsed(ref)

  return ref
}