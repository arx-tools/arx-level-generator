import { Variable } from '@scripting/properties/Variable.js'
import { Entity, EntityConstructorPropsWithoutSrc } from '@src/Entity.js'

/**
 * @see https://wiki.arx-libertatis.org/Category:Runes
 */
type RuneVariant =
  | 'aam'
  | 'cetrius'
  | 'comunicatum'
  | 'cosum'
  | 'folgora'
  | 'fridd'
  | 'kaom'
  | 'mega'
  | 'morte'
  | 'movis'
  | 'nhi'
  | 'rhaa'
  | 'spacium'
  | 'stregum'
  | 'taar'
  | 'tempus'
  | 'tera'
  | 'vista'
  | 'vitae'
  | 'yok'

export class Rune extends Entity {
  private propRuneName: Variable<string>

  constructor(variant: RuneVariant, props: EntityConstructorPropsWithoutSrc = {}) {
    super({
      src: 'items/magic/rune_aam',
      ...props,
    })
    this.withScript()

    this.propRuneName = new Variable('string', 'rune_name', variant)

    /*
    ON INVENTORYUSE {
      SENDEVENT GOT_RUNE ${onEquipTarget.ref} "${runeName}"
      ACCEPT
    }
    */

    this.script?.properties.push(this.propRuneName)
  }

  get variant() {
    return this.propRuneName.value as RuneVariant
  }
  set variant(value: RuneVariant) {
    this.propRuneName.value = value
  }
}
