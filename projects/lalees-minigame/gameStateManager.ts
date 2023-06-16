import { Audio } from '@src/Audio.js'
import { Entity } from '@src/Entity.js'
import { ScriptSubroutine } from '@scripting/ScriptSubroutine.js'
import { Sound, SoundFlags } from '@scripting/classes/Sound.js'
import { Variable } from '@scripting/properties/Variable.js'

const notification = new Sound(Audio.system.filename, SoundFlags.EmitFromPlayer)
const achievement = new Sound(Audio.system3.filename, SoundFlags.EmitFromPlayer)

const tutorialWelcome = new ScriptSubroutine('tutorial_welcome', () => {
  return `
    ${notification.play()}
    herosay [tutorial--welcome]
    quest [tutorial--welcome]
  `
})
const tutorialFoundAGame = new ScriptSubroutine('tutorial_found_a_game', () => {
  return `
    ${notification.play()}
    herosay [tutorial--found-a-game]
    quest [tutorial--found-a-game]
  `
})
const tutorialGaveGameToGoblin = new ScriptSubroutine('tutorial_gave_game_to_goblin', () => {
  return `
    ${notification.play()}
    herosay [tutorial--gave-game-to-goblin]
    quest [tutorial--gave-game-to-goblin]
  `
})

const achievementListenSmall = new ScriptSubroutine('achievement_found_games_small', () => {
  return `
    ${achievement.play()}
    herosay [achievement--found-games-small]
    quest [achievement--found-games-small]
  `
})
const achievementListenMedium = new ScriptSubroutine('achievement_found_games_medium', () => {
  return `
    ${achievement.play()}
    herosay [achievement--found-games-medium]
    quest [achievement--found-games-medium]
  `
})
const achievementListenLarge = new ScriptSubroutine('achievement_found_games_large', () => {
  return `
    ${achievement.play()}
    herosay [achievement--found-games-large]
    quest [achievement--found-games-large]
  `
})

export const createGameStateManager = () => {
  const manager = Entity.marker.withScript()

  const numberOfGamesTheGoblinHas = new Variable('int', 'number_of_games_the_goblin_has', 0)
  const playerFoundAnyGames = new Variable('bool', 'player_found_any_games', false)

  manager.script?.properties.push(numberOfGamesTheGoblinHas, playerFoundAnyGames)

  manager.script?.subroutines.push(
    tutorialWelcome,
    tutorialFoundAGame,
    tutorialGaveGameToGoblin,
    achievementListenSmall,
    achievementListenMedium,
    achievementListenLarge,
  )
  manager.script?.on('init', () => {
    return `TIMERwelcome -m 1 3000 ${tutorialWelcome.invoke()}`
  })

  manager.script?.on('goblin_received_a_game', () => {
    return `
    inc ${numberOfGamesTheGoblinHas.name} 1

    if (${numberOfGamesTheGoblinHas.name} == 1) {
      ${tutorialGaveGameToGoblin.invoke()}
    }
    if (${numberOfGamesTheGoblinHas.name} == 2) {
      ${achievementListenSmall.invoke()}
    }
    if (${numberOfGamesTheGoblinHas.name} == 5) {
      ${achievementListenMedium.invoke()}
    }
    if (${numberOfGamesTheGoblinHas.name} == 8) {
      ${achievementListenLarge.invoke()}
    }
    `
  })
  manager.script?.on('player_found_a_game', () => {
    return `
    if (${playerFoundAnyGames.name} == 0) {
      set ${playerFoundAnyGames.name} 1
      ${tutorialFoundAGame.invoke()}
    }
    `
  })

  return manager
}
