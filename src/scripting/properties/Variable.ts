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
  private readonly propType: VariableType
  private readonly propName: string
  private readonly startUninitialized: boolean

  constructor(type: 'bool' | 'global bool', name: string, value: boolean extends T ? T : never)
  // prettier-ignore
  constructor(type: 'bool' | 'global bool', name: string, value: boolean extends T ? T : never, startUninitialized: boolean)
  constructor(type: 'int' | 'float' | 'global int' | 'global float', name: string, value: number extends T ? T : never)
  // prettier-ignore
  constructor(type: 'int' | 'float' | 'global int' | 'global float', name: string, value: number extends T ? T : never, startUninitialized: boolean)
  constructor(type: 'string' | 'global string', name: string, value: T extends string ? T : never)
  constructor(type: 'string' | 'global string', name: string, value: string extends T ? T : never)
  // prettier-ignore
  constructor(type: 'string' | 'global string', name: string, value: T extends string ? T : never, startUninitialized: boolean)
  // prettier-ignore
  constructor(type: 'string' | 'global string', name: string, value: string extends T ? T : never, startUninitialized: boolean)
  constructor(type: VariableType, name: string, value: T, startUninitialized: boolean = false) {
    super(value)
    this.propType = type
    this.propName = name
    this.startUninitialized = startUninitialized
  }

  toString(): string {
    if (this.startUninitialized) {
      return ''
    }

    return `set ${this.name} ${this.scriptValue}`
  }

  get name(): string {
    let value: string

    switch (this.propType) {
      case 'bool':
      case 'int': {
        value = `§${this.propName}`
        break
      }

      case 'float': {
        value = `@${this.propName}`
        break
      }

      case 'string': {
        value = `£${this.propName}`
        break
      }

      case 'global bool':
      case 'global int': {
        value = `#${this.propName}`
        break
      }

      case 'global float': {
        value = `&${this.propName}`
        break
      }

      case 'global string': {
        value = `$${this.propName}`
        break
      }
    }

    return value
  }

  get scriptValue(): string {
    let value: string

    switch (this.propType) {
      case 'bool':
      case 'global bool': {
        value = `${this.value ? 1 : 0}`
        break
      }

      case 'int':
      case 'float':
      case 'global int':
      case 'global float': {
        value = `${this.value}`
        break
      }

      case 'string':
      case 'global string': {
        value = `"${this.value}"`
        break
      }
    }

    return value
  }
}
