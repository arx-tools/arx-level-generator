import { Entity } from '@src/Entity.js'
import { ScriptSubroutine } from '@scripting/ScriptSubroutine.js'

const tutorialWelcome = new ScriptSubroutine('tutorial_welcome', () => {
  return `
    play -o "system"
    herosay [tutorial--welcome]
    quest [tutorial--welcome]
  `
})
const tutorialFirstGameGivenToGoblin = new ScriptSubroutine('tutorial_first_game_given_to_goblin', () => {
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

export const createGameStateMarker = () => {
  const marker = Entity.marker.withScript()
  marker.script?.subroutines.push(
    tutorialWelcome,
    tutorialFirstGameGivenToGoblin,
    achievementListenSmall,
    achievementListenMedium,
    achievementListenLarge,
  )
  marker.script?.on('init', () => {
    return `TIMERwelcome -m 1 3000 gosub ${tutorialWelcome.name}`
  })
  marker.script?.on('init', () => {
    return `set §gave_game_to_goblin 0`
  })
  marker.script?.on('gave_game_to_goblin', () => {
    return `
    INC §gave_game_to_goblin 1

    if (§gave_game_to_goblin == 1) {
      gosub ${tutorialFirstGameGivenToGoblin.name}
    }

    if (§gave_game_to_goblin == 2) {
      gosub ${achievementListenSmall.name}
    }

    if (§gave_game_to_goblin == 5) {
      gosub ${achievementListenMedium.name}
    }

    if (§gave_game_to_goblin == 8) {
      gosub ${achievementListenLarge.name}
    }
    `
  })

  return marker
}
