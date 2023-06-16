import { Audio } from '@src/Audio.js'
import { Entity } from '@src/Entity.js'
import { ScriptSubroutine } from '@scripting/ScriptSubroutine.js'
import { Sound, SoundFlags } from '@scripting/classes/Sound.js'
import { Variable } from '@scripting/properties/Variable.js'
import { ambiences } from './constants.js'

const notification = new Sound(Audio.system.filename, SoundFlags.EmitFromPlayer)
const achievement = new Sound(Audio.system3.filename, SoundFlags.EmitFromPlayer)

const tutorialWelcome = new ScriptSubroutine('tutorial_welcome', () => {
  return `
  ${notification.play()}
  herosay [tutorial--welcome]
  quest [tutorial--welcome]
`
})

const achievementListenSmall = new ScriptSubroutine('achievement_listen_small', () => {
  return `
  ${achievement.play()}
  herosay [achievement--listen-small]
  quest [achievement--listen-small]
  `
})
const achievementListenMedium = new ScriptSubroutine('achievement_listen_medium', () => {
  return `
  ${achievement.play()}
  herosay [achievement--listen-medium]
  quest [achievement--listen-medium]
  `
})
const achievementListenLarge = new ScriptSubroutine('achievement_listen_large', () => {
  return `
  ${achievement.play()}
  herosay [achievement--listen-large]
  quest [achievement--listen-large]
  `
})

export const createMainMarker = () => {
  const manager = Entity.marker.withScript()

  const numberOfSoundsListenedTo = new Variable('int', 'number_of_sounds_listened_to', 0)

  manager.script?.properties.push(numberOfSoundsListenedTo)
  manager.script?.on('init', () => {
    return `TIMERwelcome -m 1 2000 ${tutorialWelcome.invoke()}`
  })
  manager.script?.on('listened', () => {
    return `
    inc ${numberOfSoundsListenedTo.name} 1

    if (${numberOfSoundsListenedTo.name} == 10) {
      ${achievementListenSmall.invoke()}
    }
    if (${numberOfSoundsListenedTo.name} == 25) {
      ${achievementListenMedium.invoke()}
    }
    if (${numberOfSoundsListenedTo.name} == ${ambiences.length}) {
      ${achievementListenLarge.invoke()}
    }
    `
  })

  manager.script?.subroutines.push(
    tutorialWelcome,
    achievementListenSmall,
    achievementListenMedium,
    achievementListenLarge,
  )

  return manager
}
