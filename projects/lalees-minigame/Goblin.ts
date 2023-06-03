import { Audio } from '@src/Audio.js'
import { Entity, EntityConstructorPropsWithoutSrc } from '@src/Entity.js'
import { Invulnerability } from '@scripting/properties/Invulnerability.js'

export class Goblin extends Entity {
  constructor(props: EntityConstructorPropsWithoutSrc) {
    super({
      src: 'npc/goblin_base',
      ...props,
    })
    this.withScript()

    const goblinVoiceYes = Audio.fromCustomFile({
      filename: 'goblin_victory3_shorter.wav',
      sourcePath: 'projects/lalees-minigame/speech',
      type: 'speech',
    })

    this.otherDependencies.push(goblinVoiceYes)

    this.script?.properties.push(Invulnerability.on)
    this.script?.on('chat', () => {
      return `
        speak [goblin_misc6]
      `
    })
    this.script?.on('idle', () => {
      return `
        speak [goblin_misc]
      `
    })
    this.script?.on('initend', () => {
      return `
        speak [goblin_misc6]
        TIMERmisc_reflection -i 0 10 sendevent idle self ""
      `
    })
  }
}
