import { Audio } from '@src/Audio.js'
import { Entity, EntityConstructorPropsWithoutSrc } from '@src/Entity.js'
import { Invulnerability } from '@scripting/properties/Invulnerability.js'
import { Variable } from '@scripting/properties/Variable.js'

export class Goblin extends Entity {
  constructor({ gameStateMarker, ...props }: EntityConstructorPropsWithoutSrc & { gameStateMarker: Entity }) {
    super({
      src: 'npc/goblin_base',
      ...props,
    })
    this.withScript()

    const isBusy = new Variable('bool', 'busy', false)

    const goblinVoiceYes = Audio.fromCustomFile({
      filename: 'goblin_victory3_shorter.wav',
      sourcePath: 'projects/lalees-minigame/speech',
      type: 'speech',
    })

    this.otherDependencies.push(goblinVoiceYes)

    this.script?.properties.push(Invulnerability.on)
    this.script?.on('chat', () => {
      return `
        if (${isBusy.name} == 1) {
          speak -p [player_not_now]
          accept
        }

        set ${isBusy.name} 1
        speak [goblin_misc6] set ${isBusy.name} 0
      `
    })
    this.script?.on('idle', () => {
      return `
        if (${isBusy.name} == 1) {
          accept
        }

        speak [goblin_misc]
      `
    })
    this.script?.on('initend', () => {
      return `
        set ${isBusy.name} 1
        speak [goblin_misc6] set ${isBusy.name} 0
        TIMERmisc_reflection -i 0 10 sendevent idle self ""
      `
    })
    this.script?.on('combine', () => {
      return `
        if (${isBusy.name} == 1) {
          speak -p [player_not_now]
          accept
        }

        set ${isBusy.name} 1
        if (^$param1 isclass pcgame) {
          sendevent goblin_received_a_game ${gameStateMarker.ref} nop

          random 20 {
            speak -h [goblin_victory3_shorter] set ${isBusy.name} 0
          } else {
            speak [goblin_ok] set ${isBusy.name} 0
          }
  
          destroy ^$param1
        } else {
          speak -a [goblin_mad] set ${isBusy.name} 0
        }
      `
    })
  }
}
