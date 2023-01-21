import theBackrooms from '@projects/the-backrooms'
import joinedGoblinLevels from '@projects/joined-goblin-levels'
import ambienceGallery from '@projects/ambience-gallery'
import tiltedRoomDemo from './projects/tilted-room-demo/index'

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
  default:
    console.log(`project "${PROJECT}" not found`)
}
