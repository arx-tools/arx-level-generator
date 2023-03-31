import { Variable } from '@scripting/properties/Variable.js'
import { Entity, EntityConstructorProps, EntityConstructorPropsWithoutName } from '@src/Entity.js'

export abstract class Door extends Entity {
  private propIsOpen: Variable<boolean>
  private propIsUnlocked: Variable<boolean>
  private propLockpickability: Variable<number>

  constructor(props: EntityConstructorProps) {
    super(props)
    this.withScript()

    this.propIsOpen = new Variable('bool', 'open', false)
    this.propIsUnlocked = new Variable('bool', 'unlock', true)
    this.propLockpickability = new Variable('int', 'lockpickability', 100)

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
  constructor(props: EntityConstructorPropsWithoutName = {}) {
    super({
      name: 'fix_inter/porticullis',
      ...props,
    })
  }
}

export class LightDoor extends Door {
  constructor(props: EntityConstructorPropsWithoutName = {}) {
    super({
      name: 'fix_inter/light_door',
      ...props,
    })
  }
}
