import { ScriptProperty } from '@scripting/ScriptProperty.js'

export type VariableType = 'bool' | 'int' | 'float' | 'string'

export class Variable<T> extends ScriptProperty<T> {
  type: 'bool' | 'int' | 'float' | 'string'
  name: string

  constructor(type: VariableType, name: string, value: T) {
    super(value)
    this.type = type
    this.name = name
  }

  toString() {
    switch (this.type) {
      case 'bool':
        return `set §${this.name} ${this.value ? 1 : 0}`
      case 'int':
        return `set §${this.name} ${this.value}`
      case 'float':
        return `set @${this.name} ${this.value}`
      case 'string':
        return `set £${this.name} "${this.value}"`
    }
  }
}
