import path from 'node:path'
import { ArxMap } from './ArxMap'
import { OriginalLevel } from './types'

// ....
;(async () => {
  const ix = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]

  for (let i of ix) {
    const level = await ArxMap.loadLevel(i as OriginalLevel)
  }

  // const { OUTPUTDIR = path.resolve(__dirname, './dist'), LEVEL = '1' } = process.env

  // const map = await ArxMap.loadLevel(2)

  // const map2 = await ArxMap.loadLevel(15)
  // map2.alignPolygonsTo(map)
  // map.add(map2)

  // // porticullis_0085.move 80 0 0
  // const portcullis = map.dlf.interactiveObjects.find((entity) => {
  //   return entity.name.toLowerCase().includes('porticullis') && entity.identifier === 85
  // })
  // if (typeof portcullis !== 'undefined') {
  //   portcullis.pos.x += 80
  // }

  // map.removePortals()

  // map.finalize()

  // map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
})()
