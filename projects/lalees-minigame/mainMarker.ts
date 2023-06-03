import { Entity } from '@src/Entity.js'
import { ScriptSubroutine } from '@scripting/ScriptSubroutine.js'

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
    return `TIMERwelcome -m 1 3000 gosub ${welcomeFn.name}`
  })
  marker.script?.on('init', () => {
    return `set §gave_game_to_goblin 0`
  })
  marker.script?.on('gave_game_to_goblin', () => {
    return `
    INC §gave_game_to_goblin 1

    if (§gave_game_to_goblin == 1) {
      play -o "system"
      herosay [tutorial--gave-game-to-goblin]
      quest [tutorial--gave-game-to-goblin]
    }

    if (§gave_game_to_goblin == 2) {
      gosub achievement_found_games_small
    }

    if (§gave_game_to_goblin == 5) {
      gosub achievement_found_games_medium
    }

    if (§gave_game_to_goblin == 8) {
      gosub achievement_found_games_large
    }
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
  marker.script?.subroutines.push(achievementListenSmall, achievementListenMedium, achievementListenLarge)

  return marker
}
