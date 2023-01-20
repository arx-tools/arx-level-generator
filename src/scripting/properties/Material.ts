import { ScriptProperty } from '@src/ScriptProperty'

export type MaterialType = 'stone' | 'wood' | 'metal' | 'cloth' | 'flesh' | 'ice' | 'glass' | 'earth' | 'weapon'

export class Material extends ScriptProperty<MaterialType> {
  toString() {
    return `set_material ${this.value}`
  }

  // ----------------

  static get stone() {
    return new Material('stone')
  }
  static get wood() {
    return new Material('wood')
  }
  static get metal() {
    return new Material('metal')
  }
  static get cloth() {
    return new Material('cloth')
  }
  static get flesh() {
    return new Material('flesh')
  }
  static get ice() {
    return new Material('ice')
  }
  static get glass() {
    return new Material('glass')
  }
  static get earth() {
    return new Material('earth')
  }
  static get weapon() {
    return new Material('weapon')
  }
}
