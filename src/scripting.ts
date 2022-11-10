import rgba from 'color-rgba'
import { ItemRef, RenderedInjectableProps } from './assets/items'
import { roundToNDecimals } from './helpers'

export const SCRIPT_EOL = '\r\n'

export const TRUE = 1
export const FALSE = 0
export const UNDEFINED = -1

const toFloat = (colorChannel: number) => {
  return roundToNDecimals(6, colorChannel / 256)
}

export const color = (colorDefinition: string) => {
  const parsedColor = rgba(colorDefinition)
  if (typeof parsedColor === 'undefined') {
    return '0 0 0'
  }

  const [r, g, b] = parsedColor
  return `${toFloat(r)} ${toFloat(g)} ${toFloat(b)}`
}

type VariableType =
  | 'bool'
  | 'int'
  | 'float'
  | 'string'
  | 'public bool'
  | 'public int'
  | 'public float'
  | 'public string'

const globalScope: ItemRef = {
  src: '',
  id: 0,
  state: {},
  injections: {},
  ref: 'global',
}

export const declare = (type: VariableType, name: string, initialValue: any, scope: ItemRef | 'global') => {
  let value = initialValue
  if (scope === 'global') {
    switch (type) {
      case 'bool':
      case 'int':
        globalScope.state[name] = `#${name}`
        break
      case 'float':
        globalScope.state[name] = `&${name}`
        break
      case 'string':
        globalScope.state[name] = `$${name}`
        value = `"${initialValue}"`
        break
    }

    if (value !== undefined) {
      globalScope.injections.init = globalScope.injections.init || []
      globalScope.injections.init.push(`SET ${globalScope.state[name]} ${value}`)
    }
  } else {
    switch (type) {
      case 'bool':
      case 'int':
        scope.state[name] = `§${name}`
        break
      case 'float':
        scope.state[name] = `@${name}`
        break
      case 'string':
        scope.state[name] = `£${name}`
        value = `"${initialValue}"`
        break
      case 'public bool':
      case 'public int':
        scope.state[name] = `#${scope.ref}___${name}`
        break
      case 'public float':
        scope.state[name] = `&${scope.ref}___${name}`
        break
      case 'public string':
        scope.state[name] = `$${scope.ref}___${name}`
        value = `"${initialValue}"`
        break
    }

    if (value !== undefined) {
      scope.injections.init = scope.injections.init || []
      scope.injections.init.push(`SET ${scope.state[name]} ${value}`)
    }
  }

  return scope
}

export const getInjections = (eventName: keyof RenderedInjectableProps, scope) => {
  if (scope === 'global') {
    return (globalScope.injections[eventName] ?? []).join(SCRIPT_EOL + ' ')
  }
  return (scope.injections[eventName] ?? []).join(SCRIPT_EOL + ' ')
}
