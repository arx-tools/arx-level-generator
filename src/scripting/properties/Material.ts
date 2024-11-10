import { ScriptProperty } from '@scripting/ScriptProperty.js'

export type MaterialType =
  | 'weapon'
  | 'flesh'
  | 'metal'
  | 'glass'
  | 'cloth'
  | 'wood'
  | 'earth'
  | 'water'
  | 'ice'
  | 'gravel'
  | 'stone'
  | 'foot_large'
  | 'foot_bare'
  | 'foot_shoe'
  | 'foot_metal'
  | 'foot_stealth'

/**
 * A ScriptProperty for setting the material of an Entity
 *
 * @extends ScriptProperty
 * @see https://wiki.arx-libertatis.org/Script:setmaterial
 */
export class Material extends ScriptProperty<MaterialType> {
  static get weapon(): Material {
    return new Material('weapon')
  }

  static get flesh(): Material {
    return new Material('flesh')
  }

  static get metal(): Material {
    return new Material('metal')
  }

  static get glass(): Material {
    return new Material('glass')
  }

  static get cloth(): Material {
    return new Material('cloth')
  }

  static get wood(): Material {
    return new Material('wood')
  }

  static get earth(): Material {
    return new Material('earth')
  }

  static get water(): Material {
    return new Material('water')
  }

  static get ice(): Material {
    return new Material('ice')
  }

  static get gravel(): Material {
    return new Material('gravel')
  }

  static get stone(): Material {
    return new Material('stone')
  }

  static get footLarge(): Material {
    return new Material('foot_large')
  }

  static get footBare(): Material {
    return new Material('foot_bare')
  }

  static get footShoe(): Material {
    return new Material('foot_shoe')
  }

  static get footMetal(): Material {
    return new Material('foot_metal')
  }

  static get footStealth(): Material {
    return new Material('foot_stealth')
  }

  toString(): string {
    return `set_material ${this.value}`
  }
}
