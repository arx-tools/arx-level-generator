import aliasNightmare from '@projects/alias-nightmare/index.js'
import ambienceGallery from '@projects/ambience-gallery/index.js'
import city from '@projects/city/index.js'
import csItaly from '@projects/cs_italy/index.js'
import disco from '@projects/disco/index.js'
import escapeFromOffice from '@projects/escape-from-office/index.js'
import forest from '@projects/forest/index.js'
import joinedGoblinLevels from '@projects/joined-goblin-levels/index.js'
import laleesMinigame from '@projects/lalees-minigame/index.js'
import modelTester from '@projects/model-tester/index.js'
import theBackrooms from '@projects/the-backrooms/index.js'
import tiltedRoomDemo from '@projects/tilted-room-demo/index.js'

const { PROJECT } = process.env

switch (PROJECT) {
  case 'the-backrooms':
    theBackrooms()
    break
  case 'joined-goblin-levels':
    joinedGoblinLevels()
    break
  case 'ambience-gallery':
    ambienceGallery()
    break
  case 'tilted-room-demo':
    tiltedRoomDemo()
    break
  case 'alias-nightmare':
    aliasNightmare()
    break
  case 'disco':
    disco()
    break
  case 'model-tester':
    modelTester()
    break
  case 'city':
    city()
    break
  case 'escape-from-office':
    escapeFromOffice()
    break
  case 'forest':
    forest()
    break
  case 'cs_italy':
    csItaly()
    break
  case 'lalees-minigame':
    laleesMinigame()
    break
  default:
    throw new Error(`project "${PROJECT}" not found`)
}
