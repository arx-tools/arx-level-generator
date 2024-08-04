import { Entity, type EntityConstructorPropsWithoutSrc } from '@src/Entity.js'

export class Marker extends Entity {
  constructor(props: EntityConstructorPropsWithoutSrc = {}) {
    super({
      src: 'system/marker',
      ...props,
    })
  }
}
