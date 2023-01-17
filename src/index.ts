import theBackrooms from '@projects/the-backrooms'
import joinedGoblinLevels from '@projects/joined-goblin-levels'
import ambienceGallery from './projects/ambience-gallery'

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
  default:
    console.log(`project "${PROJECT}" not found`)
}
