import { addDependencyAs, addScript, createItem, items, markAsUsed, moveTo } from '../../../assets/items'
import { color, declare, FALSE, getInjections, TRUE } from '../../../scripting'

export const createFallSaver = (pos, target) => {
  const ref = createItem(items.marker)

  declare('bool', 'isCatching', FALSE, ref)
  addDependencyAs('projects/alias-nightmare/sfx/uru-link.wav', `sfx/uru-link.wav`, ref)

  addScript((self) => {
    return `
// component fallsaver
ON INIT {
  ${getInjections('init', self)}
  SETCONTROLLEDZONE "fall-detector"
  ACCEPT
}

ON CONTROLLEDZONE_ENTER {
  IF (${self.state.isCatching} == ${TRUE}) {
    ACCEPT
  }
  SET ${self.state.isCatching} ${TRUE}
  GOSUB FADEOUT
  TIMERfadein -m 1 300 GOSUB FADEIN NOP
  ACCEPT
}

>>FADEOUT {
  WORLDFADE OUT 300 ${color('black')}
  PLAY -o "uru-link"
  RETURN
}

>>FADEIN {
  TELEPORT -p ${target.ref}
  SET ${self.state.isCatching} ${FALSE}
  TIMERfadein -m 1 2000 WORLDFADE IN 1000
  RETURN
}
        `
  }, ref)

  moveTo({ type: 'relative', coords: pos }, [0, 0, 0], ref)
  markAsUsed(ref)

  return ref
}
