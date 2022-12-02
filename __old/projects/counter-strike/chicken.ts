import { addScript, createItem, createRootItem, items, markAsUsed, moveTo, InjectableProps } from '../../assets/items'
import { getInjections, playSound, PLAY_VARY_PITCH } from '../../scripting'
import { RelativeCoords } from '../../types'
import { ArxRotation } from 'arx-level-json-converter/types/binary/BinaryIO'

export const defineChicken = (config: InjectableProps = {}) => {
  const rootRef = createRootItem(items.npc.chicken, {
    ...config,
  })

  addScript((self) => {
    return `
// component: improved chicken
ON INIT {
  ${getInjections('init', self)}

  SET §player_in_sight 0       // 1 indicates that the NPC currently sees he player.
  SET §reflection_mode 1    // 0 : shut up
  SET §enemy 0                  // defines if the NPC is enemy to the player at the moment
  SET §roti 0                   // for chicken only
  SET £tmp "none"       // misc reflection management
  SET §sound 0
  SET §sound_amount 3
  SET §explode_count 0
  SET §dead 0      // Used to check if npc is dead
  SET £misc "chicken_idle"
  SET #TMP ~^RND_6~
  INC #TMP 6
  TIMERmisc_reflection -i 0 ~#TMP~ SENDEVENT MISC_REFLECTION SELF ""
  SET £dying "Chicken_die"
  SETEVENT HEAR OFF
  SETNAME [description_chicken]
  SET_NPC_STAT BACKSTAB 1
  SET_MATERIAL FLESH
  SET_ARMOR_MATERIAL LEATHER
  SET_STEP_MATERIAL Foot_bare
  SET_NPC_STAT RESISTMAGIC 1
  SET_NPC_STAT RESISTPOISON 1
  SET_NPC_STAT RESISTFIRE 1
  SET_NPC_STAT armor_class 1
  SET_NPC_STAT absorb 1
  SET_NPC_STAT damages 1
  SET_NPC_STAT tohit 1
  SET §confusability 1           // level of magic needed to confuse this npc
  SET_NPC_STAT aimtime 500
  SET_NPC_STAT life 2
  SET_XP_VALUE 1
  COLLISION OFF
  SETDETECT 40
  SETIRCOLOR 0.8 0.0 0.0
  LOADANIM WALK                       "chicken_walk"
  LOADANIM RUN                        "chicken_run"
  LOADANIM WAIT                       "chicken_wait"
  LOADANIM DIE                        "chicken_death"

  IF (§dead == 1) {
    ACCEPT
  }
  IF (§ribs == 1) {
    ACCEPT
  }
  SET §ribs 1

  INVENTORY CREATE
  INVENTORY ADD "PROVISIONS\\food_chicken_uncooked\\food_chicken_uncooked"
  INVENTORY ADD "PROVISIONS\\food_chicken_uncooked\\food_chicken_uncooked"

  ACCEPT
}

ON SPELLCAST {
  IF (^SENDER != PLAYER) {
    ACCEPT
  }
  IF (^$PARAM1 == FIREBALL) {
    SET §roti 1
  }

  ACCEPT
}

ON SPELLEND {
  IF (^SENDER != PLAYER) {
    ACCEPT
  }
  IF (^$PARAM1 == FIREBALL) {
    SET §roti 0
  }

  ACCEPT
}

ON COLLIDE_DOOR {
  >>AWAY

  BEHAVIOR FLEE 200
  SETTARGET ^SENDER
  GOSUB SAVE_BEHAVIOR
  TIMERpathfail 1 2 GOSUB RESTORE_BEHAVIOR

  ACCEPT
}

ON COLLIDE_NPC {
  GOTO AWAY
  ACCEPT
}

ON DETECTPLAYER {
  IF (^PLAYERSPELL_INVISIBILITY == 1) {
    ACCEPT
  }

  SET §player_in_sight 1
  SET_NPC_STAT BACKSTAB 0

  IF (§enemy == 1) {
    GOTO FLEE
  }

  ACCEPT
}

ON UNDETECTPLAYER {
  SET §player_in_sight 0
  ACCEPT
}

ON FLEE_END {
  IF (§player_in_sight == 1) {
    GOTO FLEE
  }

  BEHAVIOR WANDER_AROUND 2000
  SETTARGET NONE
  SET §reflection_mode 1

  ACCEPT
}

ON AGRESSION {
  GOTO OUCHSUITE
  ACCEPT
}

ON OUCH {
  >>OUCHSUITE
  
  SET §enemy 1
  GOTO FLEE
}

>>FLEE {
  SET §reflection_mode 0
  BEHAVIOR FLEE 1000
  SETTARGET PLAYER
  SETMOVEMODE RUN
  
  ACCEPT
}

ON MISC_REFLECTION {
  IF ( §reflection_mode == 0 ) {
    ACCEPT
  }
  
  IF ( #SHUT_UP == 1 ) {
    ACCEPT
  }

  SET #TMP ~^RND_6~
  INC #TMP 6
  TIMERmisc_reflection -i 0 ~#TMP~ SENDEVENT MISC_REFLECTION SELF ""
  RANDOM 40 ACCEPT
  SET £tmp ^RND_~§sound_amount~
  SET §sound ~£tmp~
  INC §sound 1

  IF (§sound > §sound_amount) {
    SET §sound 1
  }
  
  IF (§last_misc == §sound) {
    INC §sound 1
    IF (§sound > §sound_amount) {
      SET §sound 1
    }
  }
  
  SET §last_misc §sound
  ${playSound('~£misc~~§sound~', PLAY_VARY_PITCH, true)}
  ACCEPT
}

ON DIE {
  SET §dead 1
  SETDETECT -1
  TIMERmisc_reflection OFF
  COLLISION OFF
  IF (§roti == 1) {
    SPAWN ITEM "provisions\\roast_chicken\\roast_chicken.teo" ME
    DESTROY SELF
    ACCEPT
  }

  IF (§explode_count == 100) {
    INVENTORY DESTROY
    TIMERdeath 1 6 ${playSound('~£dying~', 0, true)} SPAWN ITEM "provisions\\roast_chicken\\roast_chicken.teo" ME
    SPECIALFX YLSIDE_DEATH
    ACCEPT
  }

  IF (£dying != "none") {
    ${playSound('~£dying~', PLAY_VARY_PITCH, true)}
  }

  FORCEANIM DIE
  ACCEPT
}

ON FIRE_AFFRAID {
  IF (§flee == 1) {
    ACCEPT
  }

  SET §flee 1
  ${playSound('~£dying~', PLAY_VARY_PITCH, true)}

  IF (§enemy == 0) {
    BEHAVIOR STACK
    TIMERrestore 1 8 IF (§enemy == 0) BEHAVIOR UNSTACK
  }

  IF (§enemy == 1) {
    TIMERattak 1 8 SET §enemy 1
    SET §enemy 0
    SET §fighting_mode 0
  }

  BEHAVIOR FLEE 1500
  SETTARGET PLAYER
  SETMOVEMODE RUN

  ACCEPT
}

ON CHAT {
  IF (§explode_count > 5) {
    ${playSound('chicken_cot', PLAY_VARY_PITCH)}
  }

  IF (§explode_count == 100) {
    ACCEPT
  }

  INC §explode_count 1
  TIMERinit 1 20 GOTO INIT

  IF (§explode_count == 20) {
    TIMERinit OFF
    SET §explode_count 100
    LOADANIM RUN "chicken_run_faster"
    TIMERdiereal 1 1 FORCEDEATH SELF
    GOTO FLEE
    ACCEPT
  }

  ACCEPT
}

>>INIT {
  SET §explode_count 0
  ACCEPT
}

ON GAME_READY {
  IF (§dead == 1) {
    ACCEPT
  }

  TELEPORT -i
  BEHAVIOR WANDER_AROUND 2000
  SETTARGET NONE

  IF (§ribs == 1) {
    ACCEPT
  }

  SET §ribs 1

  INVENTORY CREATE
  INVENTORY ADD "PROVISIONS\\food_chicken_uncooked\\food_chicken_uncooked"
  INVENTORY ADD "PROVISIONS\\food_chicken_uncooked\\food_chicken_uncooked"

  ACCEPT
}
`
  }, rootRef)

  return rootRef
}

export const createChicken = (pos: RelativeCoords, angle: ArxRotation) => {
  const ref = createItem(items.npc.chicken)

  addScript((self) => {
    return `
// component: improved chicken
ON INIT {
  ${getInjections('init', self)}
  ACCEPT
}
    `
  }, ref)

  moveTo(pos, angle, ref)
  markAsUsed(ref)

  return ref
}
