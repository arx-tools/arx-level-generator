import { ScriptProperty } from '@scripting/ScriptProperty.js'

export type MaterialType = 'stone' | 'wood' | 'metal' | 'cloth' | 'flesh' | 'ice' | 'glass' | 'earth' | 'weapon'

/**
 * A ScriptProperty for setting the material of an Entity
 *
 * @extends ScriptProperty
 * @see https://wiki.arx-libertatis.org/Script:setmaterial
 */
export class Material extends ScriptProperty<MaterialType> {
  static get stone(): Material {
    return new Material('stone')
  }

  static get wood(): Material {
    return new Material('wood')
  }

  static get metal(): Material {
    return new Material('metal')
  }

  static get cloth(): Material {
    return new Material('cloth')
  }

  static get flesh(): Material {
    return new Material('flesh')
  }

  static get ice(): Material {
    return new Material('ice')
  }

  static get glass(): Material {
    return new Material('glass')
  }

  static get earth(): Material {
    return new Material('earth')
  }

  static get weapon(): Material {
    return new Material('weapon')
  }

  toString(): string {
    return `set_material ${this.value}`
  }
}
