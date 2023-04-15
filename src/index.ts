import theBackrooms from '@projects/the-backrooms/index.js'
import joinedGoblinLevels from '@projects/joined-goblin-levels/index.js'
import ambienceGallery from '@projects/ambience-gallery/index.js'
import tiltedRoomDemo from '@projects/tilted-room-demo/index.js'
import aliasNightmare from '@projects/alias-nightmare/index.js'
import sequencer from '@projects/sequencer/index.js'
import modelTester from '@projects/model-tester/index.js'

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
  case 'sequencer':
    sequencer()
    break
  case 'model-tester':
    modelTester()
    break
  default:
    throw new Error(`project "${PROJECT}" not found`)
}
