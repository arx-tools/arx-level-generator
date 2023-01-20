import { ScriptProperty } from '@src/ScriptProperty'

export type MaterialType = 'stone' | 'wood' | 'metal' | 'cloth' | 'flesh' | 'ice' | 'glass' | 'earth' | 'weapon'

export class Material extends ScriptProperty<MaterialType> {
  static stone = Object.freeze(new Material('stone'))
  static wood = Object.freeze(new Material('wood'))
  static metal = Object.freeze(new Material('metal'))
  static cloth = Object.freeze(new Material('cloth'))
  static flesh = Object.freeze(new Material('flesh'))
  static ice = Object.freeze(new Material('ice'))
  static glass = Object.freeze(new Material('glass'))
  static earth = Object.freeze(new Material('earth'))
  static weapon = Object.freeze(new Material('weapon'))

  toCommand() {
    return `set_material ${this.value}`
  }
}
