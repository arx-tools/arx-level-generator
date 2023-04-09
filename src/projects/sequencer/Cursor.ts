import { Scale } from '@scripting/properties/Scale.js'
import { Entity, EntityConstructorPropsWithoutSrc } from '@src/Entity.js'

export class Cursor extends Entity {
  constructor(props: EntityConstructorPropsWithoutSrc = {}) {
    super({
      src: 'npc/flying_creature',
      ...props,
    })
    this.withScript()
    this.script?.properties.push(new Scale(0.2))
    this.script?.on('init', () => {
      return `SET_SHADOW OFF`
    })

    this.script?.on('move_x', () => {
      return `
        move ^#param1 0 0
      `
    })
  }
}
