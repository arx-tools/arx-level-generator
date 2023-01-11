import theBackrooms from '@projects/the-backrooms/index'
import joinedGoblinLevels from '@projects/joined-goblin-levels/index'
import winterSurface from './projects/winter-surface/index'

const { PROJECT } = process.env

switch (PROJECT) {
  case 'the-backrooms':
    theBackrooms()
    break
  case 'joined-goblin-levels':
    joinedGoblinLevels()
    break
  case 'winter-surface':
    winterSurface()
    break
  default:
    console.log(`project "${PROJECT}" not found`)
}
