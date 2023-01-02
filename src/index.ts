import path from 'node:path'
import { ArxMap } from './ArxMap'
import { Color } from './Color'
import { Polygon } from './Polygon'
import { Texture } from './Texture'
import { Vector3 } from './Vector3'
import { Vertex } from './Vertex'

// ....
;(async () => {
  const { OUTPUTDIR = path.resolve(__dirname, './dist'), LEVEL = '1' } = process.env

  // --------------

  // const map = await ArxMap.loadLevel(2)

  // const map2 = await ArxMap.loadLevel(15)
  // map2.alignPolygonsTo(map)
  // map.add(map2)

  // map.zones = []

  // // porticullis_0085.move 80 0 0
  // const portcullis = map.entities.find((entity) => {
  //   return entity.name.toLowerCase().includes('porticullis') && entity.id === 85
  // })
  // if (typeof portcullis !== 'undefined') {
  //   portcullis.position.add(new Vector3(80, 0, 0))
  // }

  // map.removePortals()

  // --------------

  const map = new ArxMap()

  const polygon = new Polygon({
    isQuad: true,
    vertices: [
      new Vertex(0, 0, 0, 1, 0, Color.white),
      new Vertex(100, 0, 0, 1, 1, Color.white),
      new Vertex(0, 0, 100, 0, 0, Color.white),
      new Vertex(100, 0, 100, 0, 1, Color.white),
    ],
    texture: Texture.humanPaving1,
  })

  map.polygons.push(polygon)

  map.player.position = new Vector3(50, -200, 50)

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
})()
