import { ScriptProperty } from '@scripting/ScriptProperty.js'

export type VariableType =
  | 'bool'
  | 'int'
  | 'float'
  | 'string'
  | 'global bool'
  | 'global int'
  | 'global float'
  | 'global string'

/**
 * A ScriptProperty for declaring in-game variables for an Entity or globally
 *
 * @extends ScriptProperty
 * @see https://wiki.arx-libertatis.org/Script:Variables
 */
export class Variable<T> extends ScriptProperty<T> {
  private propType: VariableType
  private propName: string
  private startUninitialized: boolean

  constructor(type: 'bool' | 'global bool', name: string, value: T extends boolean ? T : never)
  // prettier-ignore
  constructor(type: 'bool' | 'global bool', name: string, value: T extends boolean ? T : never, startUninitialized: boolean)
  constructor(type: 'int' | 'float' | 'global int' | 'global float', name: string, value: T extends number ? T : never)
  // prettier-ignore
  constructor(type: 'int' | 'float' | 'global int' | 'global float', name: string, value: T extends number ? T : never, startUninitialized: boolean)
  constructor(type: 'string' | 'global string', name: string, value: T extends string ? T : never)
  // prettier-ignore
  constructor(type: 'string' | 'global string', name: string, value: T extends string ? T : never, startUninitialized: boolean)
  constructor(type: VariableType, name: string, value: T, startUninitialized: boolean = false) {
    super(value)
    this.propType = type
    this.propName = name
    this.startUninitialized = startUninitialized
  }

  toString() {
    if (this.startUninitialized) {
      return ''
    }

    return `set ${this.name} ${this.scriptValue}`
  }

  get name() {
    switch (this.propType) {
      case 'bool':
      case 'int':
        return `§${this.propName}`
      case 'float':
        return `@${this.propName}`
      case 'string':
        return `£${this.propName}`

      case 'global bool':
      case 'global int':
        return `#${this.propName}`
      case 'global float':
        return `&${this.propName}`
      case 'global string':
        return `$${this.propName}`
    }
  }

  get scriptValue() {
    switch (this.propType) {
      case 'bool':
      case 'global bool':
        return `${this.value ? 1 : 0}`
      case 'int':
      case 'float':
      case 'global int':
      case 'global float':
        return `${this.value}`
      case 'string':
      case 'global string':
        return `"${this.value}"`
    }
  }
}
