import { addScript, createItem, items, moveTo, markAsUsed, ItemRef, ItemDefinition } from '../../../assets/items'
import { declare, FALSE, getInjections, playSound, PLAY_FROM_PLAYER, SCRIPT_EOL, TRUE } from '../../../scripting'
import { Vector3 } from '../../../types'

const SPAWN_PROTECT_TIME = 3000

// this has to be <= 7000 otherwise the player will fade out to the main menu after dying
// TODO: find a way to fake player's death animation without triggering the fadeout (immediately respawn him)
const DEATHCAM_TIME = 5000

export const createRespawnController = (pos: Vector3, numberOfBots: number, gameCtrl: ItemRef) => {
  const ref = createItem(items.marker, {})

  declare('bool', 'ignoreNextKillEvent', FALSE, ref)

  declare('int', 'respawnQueueSize', 0, ref)
  for (let i = 1; i <= numberOfBots; i++) {
    declare('string', `respawnQueueItem${i}`, '', ref)
  }

  declare('int', 'spawnProtectQueueSize', 0, ref)
  for (let i = 1; i <= numberOfBots; i++) {
    declare('string', `spawnProtectQueueItem${i}`, '', ref)
  }

  addScript((self) => {
    return `
// component: respawnController
ON INIT {
  ${getInjections('init', self)}
  ACCEPT
}

ON KILLED {
  SET £victimID ^$param1
  SET £killerID ^$param2

  IF (£victimID == "player") {
    IF (${ref.state.ignoreNextKillEvent} == ${TRUE}) {
      SET ${ref.state.ignoreNextKillEvent} ${FALSE}
    } ELSE {
      sendevent died gameCtrl "~£victimID~ ~£killerID~"
      TIMERrespawn -m 1 ${DEATHCAM_TIME} GOTO RESURRECT
    }
  } ELSE {
    sendevent died gameCtrl "~£victimID~ ~£killerID~"

    INC ${self.state.respawnQueueSize} 1
    SET "£respawnQueueItem~${self.state.respawnQueueSize}~" £victimID
    TIMER -m 1 ${DEATHCAM_TIME} GOTO RESURRECT_NPC
  }

  ACCEPT
}

>>RESURRECT_NPC {
  if (${self.state.respawnQueueSize} > 0) {
    sendevent respawn £respawnQueueItem1 nop

    INC ${self.state.spawnProtectQueueSize} 1
    SET "£spawnProtectQueueItem~${self.state.spawnProtectQueueSize}~" £respawnQueueItem1

    // move respawn queue to the left
${[...Array(numberOfBots).keys()]
  .map((i) => {
    if (i === numberOfBots - 1) {
      return `    SET £respawnQueueItem${i + 1} ""`
    } else {
      return `    SET £respawnQueueItem${i + 1} £respawnQueueItem${i + 2}`
    }
  })
  .join(SCRIPT_EOL)}

    DEC ${self.state.respawnQueueSize} 1
    TIMER -m 1 ${SPAWN_PROTECT_TIME} GOTO SPAWN_PROTECT_OFF_NPC
  }

  ACCEPT
}

>>SPAWN_PROTECT_OFF_NPC {
  if (${self.state.spawnProtectQueueSize} > 0) {
    sendevent spawn_protect_off £spawnProtectQueueItem1 nop

  // move spawn protection queue to the left
${[...Array(numberOfBots).keys()]
  .map((i) => {
    if (i === numberOfBots - 1) {
      return `    SET £spawnProtectQueueItem${i + 1} ""`
    } else {
      return `    SET £spawnProtectQueueItem${i + 1} £spawnProtectQueueItem${i + 2}`
    }
  })
  .join(SCRIPT_EOL)}

    DEC ${self.state.spawnProtectQueueSize} 1
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

  moveTo({ type: 'relative', coords: pos }, { a: 0, b: 0, g: 0 }, ref)

  markAsUsed(ref)

  return ref
}
