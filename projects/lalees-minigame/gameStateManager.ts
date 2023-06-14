import { Entity } from '@src/Entity.js'
import { ScriptSubroutine } from '@scripting/ScriptSubroutine.js'
import { Variable } from '@scripting/properties/Variable.js'

const tutorialWelcome = new ScriptSubroutine('tutorial_welcome', () => {
  return `
    play -o "system"
    herosay [tutorial--welcome]
    quest [tutorial--welcome]
  `
})
const tutorialFoundAGame = new ScriptSubroutine('tutorial_found_a_game', () => {
  return `
    play -o "system"
    herosay [tutorial--found-a-game]
    quest [tutorial--found-a-game]
  `
})
const tutorialGaveGameToGoblin = new ScriptSubroutine('tutorial_gave_game_to_goblin', () => {
  return `
    play -o "system"
    herosay [tutorial--gave-game-to-goblin]
    quest [tutorial--gave-game-to-goblin]
  `
})

const achievementListenSmall = new ScriptSubroutine('achievement_found_games_small', () => {
  return `
    play -o "system3"
    herosay [achievement--found-games-small]
    quest [achievement--found-games-small]
  `
})
const achievementListenMedium = new ScriptSubroutine('achievement_found_games_medium', () => {
  return `
    play -o "system3"
    herosay [achievement--found-games-medium]
    quest [achievement--found-games-medium]
  `
})
const achievementListenLarge = new ScriptSubroutine('achievement_found_games_large', () => {
  return `
    play -o "system3"
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
    return `TIMERwelcome -m 1 3000 gosub ${tutorialWelcome.name}`
  })

  manager.script?.on('goblin_received_a_game', () => {
    return `
    inc ${numberOfGamesTheGoblinHas.name} 1

    if (${numberOfGamesTheGoblinHas.name} == 1) {
      gosub ${tutorialGaveGameToGoblin.name}
    }

    if (${numberOfGamesTheGoblinHas.name} == 2) {
      gosub ${achievementListenSmall.name}
    }

    if (${numberOfGamesTheGoblinHas.name} == 5) {
      gosub ${achievementListenMedium.name}
    }

    if (${numberOfGamesTheGoblinHas.name} == 8) {
      gosub ${achievementListenLarge.name}
    }
    `
  })
  manager.script?.on('player_found_a_game', () => {
    return `
    if (${playerFoundAnyGames.name} == 0) {
      set ${playerFoundAnyGames.name} 1
      gosub ${tutorialFoundAGame.name}
    }
    `
  })

  return manager
}
