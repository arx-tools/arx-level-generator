import { ScriptProperty } from '@scripting/ScriptProperty.js'

/**
 * A ScriptProperty for specifying whether an Entity can be collided with or can be passed through.
 *
 * @extends ScriptProperty
 * @see https://wiki.arx-libertatis.org/Script:collision
 */
export class Collision extends ScriptProperty<boolean> {
  static get on(): Collision {
    return new Collision(true)
  }

  static get off(): Collision {
    return new Collision(false)
  }

  toString(): string {
    return `collision ${this.value === true ? 'on' : 'off'}`
  }
}
