import { ScriptSubroutine } from '@scripting/ScriptSubroutine.js'
import { Entity } from '@src/Entity.js'
import { ambiences } from './constants.js'

export const createMainMarker = () => {
  const marker = Entity.marker.withScript()
  const welcomeFn = new ScriptSubroutine('tutorial_welcome', () => {
    return `
    play -o "system"
    herosay [tutorial--welcome]
    quest [tutorial--welcome]
  `
  })
  marker.script?.subroutines.push(welcomeFn)
  marker.script?.on('init', () => {
    return `TIMERwelcome -m 1 2000 gosub ${welcomeFn.name}`
  })
  marker.script?.on('init', () => {
    return `set §listened 0`
  })
  marker.script?.on('listened', () => {
    return `
    INC §listened 1
    if (§listened == 10) {
      gosub achievement_listen_small
    }
    if (§listened == 25) {
      gosub achievement_listen_medium
    }
    if (§listened == ${ambiences.length}) {
      gosub achievement_listen_large
    }
    `
  })
  const achievementListenSmall = new ScriptSubroutine('achievement_listen_small', () => {
    return `
    play -o "system3"
    herosay [achievement--listen-small]
    quest [achievement--listen-small]
    `
  })
  const achievementListenMedium = new ScriptSubroutine('achievement_listen_medium', () => {
    return `
    play -o "system3"
    herosay [achievement--listen-medium]
    quest [achievement--listen-medium]
    `
  })
  const achievementListenLarge = new ScriptSubroutine('achievement_listen_large', () => {
    return `
    play -o "system3"
    herosay [achievement--listen-large]
    quest [achievement--listen-large]
    `
  })
  marker.script?.subroutines.push(achievementListenSmall, achievementListenMedium, achievementListenLarge)

  return marker
}
