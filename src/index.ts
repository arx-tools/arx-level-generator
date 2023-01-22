import theBackrooms from '@projects/the-backrooms'
import joinedGoblinLevels from '@projects/joined-goblin-levels'
import ambienceGallery from '@projects/ambience-gallery'
import tiltedRoomDemo from '@projects/tilted-room-demo'
import aliasNightmare from '@projects/alias-nightmare'

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
  default:
    throw new Error(`project "${PROJECT}" not found`)
}
