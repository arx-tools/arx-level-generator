import { Entity, EntityConstructorPropsWithoutSrc } from '@src/Entity.js'
import { Interactivity } from '@scripting/properties/Interactivity.js'
import { Invulnerability } from '@scripting/properties/Invulnerability.js'
import { Scale } from '@scripting/properties/Scale.js'
import { Shadow } from '@scripting/properties/Shadow.js'

export class Cursor extends Entity {
  constructor(props: EntityConstructorPropsWithoutSrc = {}) {
    super({
      src: 'npc/flying_creature',
      ...props,
    })
    this.withScript()
    this.script?.properties.push(new Scale(0.2), Shadow.off, Invulnerability.on, Interactivity.off)

    this.script?.on('move_x', () => {
      return `
        move ^#param1 0 0
      `
    })
  }
}
