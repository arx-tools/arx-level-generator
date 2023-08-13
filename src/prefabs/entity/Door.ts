import { Expand } from 'arx-convert/utils'
import { Entity, EntityConstructorProps } from '@src/Entity.js'
import { UseMesh } from '@scripting/commands/UseMesh.js'
import { Variable } from '@scripting/properties/Variable.js'

export type DoorConstructorProps = Expand<
  EntityConstructorProps & {
    /**
     * default value is false
     */
    isOpen?: boolean
    /**
     * default value is false
     */
    isLocked?: boolean
    lockpickDifficulty?: number
  }
>

export type DoorConstructorPropsWithFixSrc = Expand<Omit<DoorConstructorProps, 'src'>>

export abstract class Door extends Entity {
  protected propIsOpen: Variable<boolean>
  protected propIsUnlocked: Variable<boolean>
  protected propLockpickability: Variable<number>

  constructor(props: DoorConstructorProps) {
    super(props)
    this.withScript()

    this.propIsOpen = new Variable('bool', 'open', props.isOpen ?? false)
    this.propIsUnlocked = new Variable('bool', 'unlock', !(props.isLocked ?? false))
    this.propLockpickability = new Variable('int', 'lockpickability', props.lockpickDifficulty ?? 100)

    this.script?.properties.push(this.propIsOpen, this.propIsUnlocked, this.propLockpickability)
  }

  get isOpen() {
    return this.propIsOpen.value
  }
  set isOpen(value: boolean) {
    this.propIsOpen.value = value
  }

  get isLocked() {
    return !this.propIsUnlocked.value
  }
  set isLocked(value: boolean) {
    this.propIsUnlocked.value = !value
  }

  get lockpickDifficulty() {
    return this.propLockpickability.value
  }
  set lockpickDifficulty(value: number) {
    this.propLockpickability.value = value
  }
}

export class Portcullis extends Door {
  constructor(props: DoorConstructorPropsWithFixSrc = {}) {
    super({
      src: 'fix_inter/porticullis',
      ...props,
    })
  }
}

/**
 * 150 wide / 220 high
 */
export class LightDoor extends Door {
  protected propType: Variable<string>
  protected propKey: Variable<string>

  constructor(props: DoorConstructorPropsWithFixSrc = {}) {
    super({
      src: 'fix_inter/light_door',
      ...props,
    })

    this.propType = new Variable('string', 'type', 'light_door')
    this.propKey = new Variable('string', 'key', 'none')

    this.script?.properties.push(this.propType, this.propKey)
  }

  setKey(key: Entity) {
    this.propKey.value = key.ref
  }

  removeKey() {
    this.propKey.value = 'none'
  }
}

/**
 * 150 wide / 200 high
 */
export class CatacombHeavyDoor extends LightDoor {
  constructor(props: DoorConstructorPropsWithFixSrc = {}) {
    super(props)
    this.propType.value = 'door_catacomb_heavy'
    this.script?.on('load', new UseMesh('door_catacomb_heavy/door_catacomb_heavy.teo'))
  }
}

/**
 * 150 wide / 250 high
 */
export class YlsideDoor extends LightDoor {
  constructor(props: DoorConstructorPropsWithFixSrc = {}) {
    super(props)
    this.propType.value = 'door_ylsides'
    this.script?.on('load', new UseMesh('door_ylsides/door_ylsides.teo'))
  }
}

/**
 * ? wide / ? high
 */
export class GoblinVeryLightDoor extends LightDoor {
  constructor(props: DoorConstructorPropsWithFixSrc = {}) {
    super(props)
    this.script?.on('load', new UseMesh('door_goblin_light_very/door_goblin_light_very.teo'))
  }
}
