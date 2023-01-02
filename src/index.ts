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

  const getArea = (i: number, j: number, k: number, isQuadPart: boolean, polygon: Polygon) => {
    const a = polygon.vertices[i].clone().add(polygon.vertices[j]).divideScalar(2).distanceTo(polygon.vertices[k])
    const b = polygon.vertices[isQuadPart ? i : k].distanceTo(polygon.vertices[j])
    return (a * b) / 2
  }

  const triangle = map.polygons.find((polygon) => {
    return !polygon.isQuad()
  }) as Polygon

  console.log(triangle.vertices[3])
  console.log(triangle.area)
  console.log('-------------------')

  const variants: [number, number, number][] = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ]

  variants.forEach(([a, b, c]) => {
    console.log(getArea(a, b, c, false, triangle))
  })

  // const polygon = map.polygons[0]

  // const a = getArea(0, 1, 2, false, polygon)
  // const b = getArea(1, 2, 0, false, polygon)
  // const c = getArea(2, 0, 1, false, polygon)

  // const A = getArea(1, 2, 3, true, polygon)
  // const B = getArea(2, 3, 1, true, polygon)
  // const C = getArea(3, 1, 2, true, polygon)

  // console.log(polygon.area)
  // console.log(a + A, a + B, a + C)
  // console.log(b + A, b + B, b + C)
  // console.log(c + A, c + B, c + C)

  /*
  const area = getArea(0, 1, 2, false, polygon)

  let area2 = 0
  let area3 = 0
  let area4 = 0
  if (polygon.isQuad()) {
    area2 = getArea(1, 2, 3, true, polygon)
    area3 = getArea(2, 3, 1, true, polygon)
    area4 = getArea(3, 1, 2, true, polygon)
  }

  console.log(polygon.area, area + area2, area + area3, area + area4)
  */

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

  map.removePortals()

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
  */
})()
