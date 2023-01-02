import { ArxPolygonFlags } from 'arx-convert/types'
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

  const map = await ArxMap.loadLevel(8)

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

  /*
  const map = new ArxMap()

  const polygon = new Polygon({
    area: 100,
    config: {
      areNormalsCalculated: false,
    },
    flags: ArxPolygonFlags.Quad,
    room: 1,
    transval: 0,
    norm: new Vector3(0, 0, 0),
    norm2: new Vector3(0, 0, 0),
    vertices: [
      new Vertex(0, 0, 0, 0, 0, Color.red),
      new Vertex(100, 0, 0, 1, 0, Color.red),
      new Vertex(0, 0, 100, 0, 1, Color.red),
      new Vertex(100, 0, 100, 1, 1, Color.red),
    ],
    texture: new Texture({
      filename: 'GRAPH\\OBJ3D\\TEXTURES\\[STONE]_HUMAN_PAVING1.BMP',
    }),
  })

  map.polygons.push(polygon)
  map.player.position = new Vector3(50, -200, 50)
  */

  map.removePortals()

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
})()
