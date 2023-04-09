import { Entity, EntityConstructorPropsWithoutSrc } from '@src/Entity.js'

export class Cube extends Entity {
  constructor(props: EntityConstructorPropsWithoutSrc = {}) {
    super({
      src: 'fix_inter/polytrans',
      ...props,
    })
  }
}
