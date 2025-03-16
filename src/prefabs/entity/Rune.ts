import { Audio } from '@src/Audio.js'
import { Entity, type EntityConstructorPropsWithoutSrc } from '@src/Entity.js'
import { Script, type ScriptHandler } from '@src/Script.js'
import { Texture } from '@src/Texture.js'
import { ScriptSubroutine } from '@scripting/ScriptSubroutine.js'
import { Sound, SoundFlags } from '@scripting/classes/Sound.js'
import { TweakSkin } from '@scripting/commands/TweakSkin.js'
import { Label } from '@scripting/properties/Label.js'
import { Material } from '@scripting/properties/Material.js'
import { Variable } from '@scripting/properties/Variable.js'
import type { Simplify } from 'type-fest'

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

type RuneConstructorProps = Simplify<
  EntityConstructorPropsWithoutSrc & {
    /**
     * default value is true when Entity is root
     */
    arxTutorialEnabled?: boolean
  }
>

export class Rune extends Entity {
  private readonly propRuneName: Variable<string>
  private propArxTutorialEnabled?: Variable<boolean>

  constructor(variant: RuneVariant, { arxTutorialEnabled, ...props }: RuneConstructorProps = {}) {
    super({
      src: 'items/magic/rune_aam',
      ...props,
    })
    this.withScript()

    this.propRuneName = new Variable('string', 'rune_name', variant)

    this.script?.properties.push(this.propRuneName)

    const system = new Sound(Audio.system.filename, SoundFlags.EmitFromPlayer)
    const system2 = new Sound(Audio.system2.filename, SoundFlags.EmitFromPlayer)

    const { script } = this
    function whenRoot(handler: () => ScriptHandler) {
      return (): string => {
        if (!script?.isRoot) {
          return ''
        }

        return Script.handlerToString(handler())
      }
    }

    const tutorialMagic = new Variable('global int', 'TUTORIAL_MAGIC', 0, true)

    this.script?.on('init', () => {
      if (this.script?.isRoot) {
        this.propArxTutorialEnabled = new Variable('bool', 'arx_tutorial_enabled', arxTutorialEnabled ?? true)
        return [this.propArxTutorialEnabled, tutorialMagic]
      }

      if (arxTutorialEnabled !== undefined) {
        this.propArxTutorialEnabled = new Variable('bool', 'arx_tutorial_enabled', arxTutorialEnabled)
        return [this.propArxTutorialEnabled]
      }

      return []
    })

    this.script?.on(
      'init',
      whenRoot(() => {
        return [Material.stone, 'set_group provisions', 'set_price 1000', 'set_steal 50', 'set_weight 0']
      }),
    )

    this.script?.on(
      'initend',
      whenRoot(() => {
        return [
          new Label(`[system_~${this.propRuneName.name}~]`),
          `tweak icon rune_~${this.propRuneName.name}~[icon]`,
          new TweakSkin(Texture.itemRuneAam, `item_rune_~${this.propRuneName.name}~`),
        ]
      }),
    )

    const tutorialFoundRunes = new ScriptSubroutine(
      'tutorial_found_runes',
      whenRoot(() => {
        return `
          ${system.play()}
          herosay [system_tutorial_6]
          quest [system_tutorial_6]
        `
      }),
    )

    const tutorialAddedRunesToBook = new ScriptSubroutine(
      'tutorial_added_runes_to_book',
      whenRoot(() => {
        return `
          ${system.play()}
          herosay [system_tutorial_6bis]
          quest [system_tutorial_6bis]
        `
      }),
    )

    this.script?.subroutines.push(tutorialFoundRunes, tutorialAddedRunesToBook)

    this.script?.on(
      'inventoryuse',
      whenRoot(() => {
        return `
          ${system2.play()}
          rune -a ~${this.propRuneName.name}~

          if (${this.propArxTutorialEnabled?.name} == 1) {
            if (${tutorialMagic.name} < 9) {
              inc ${tutorialMagic.name} 3
            }

            if (${tutorialMagic.name} >= 6) {
              set ${tutorialMagic.name} 9
              ${tutorialAddedRunesToBook.invoke()}
            }
          }

          destroy self
        `
      }),
    )

    this.script?.on(
      'inventoryin',
      whenRoot(() => {
        return `
          if (${this.propArxTutorialEnabled?.name} == 1) {
            if (${tutorialMagic.name} > 1) {
              accept
            }

            inc ${tutorialMagic.name} 1

            if (${tutorialMagic.name} == 2) {
              ${tutorialFoundRunes.invoke()}
            }
          }
        `
      }),
    )
  }

  get variant(): RuneVariant {
    return this.propRuneName.value as RuneVariant
  }

  set variant(value: RuneVariant) {
    this.propRuneName.value = value
  }
}
