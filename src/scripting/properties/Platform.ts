import { ScriptProperty } from '@scripting/ScriptProperty.js'

/**
 * A ScriptProperty for allowing the player to jump when standing on
 * this entity. This property also enables NPCs to walk on top of
 * the entity.
 *
 * @extends ScriptProperty
 * @see https://wiki.arx-libertatis.org/Script:setplatform
 */
export class Platform extends ScriptProperty<boolean> {
  static get on(): Platform {
    return new Platform(true)
  }

  static get off(): Platform {
    return new Platform(false)
  }

  toString(): string {
    if (this.value === true) {
      return `set_platform on`
    }

    return `set_platform off`
  }
}
