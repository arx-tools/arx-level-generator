import { QuadrupleOf, TripleOf } from 'arx-convert/utils'
import path from 'node:path'
import { BoxGeometry, BufferAttribute, BufferGeometry, Mesh } from 'three'
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

  /*
  const geometry = new BufferGeometry()
  // prettier-ignore
  geometry.setAttribute('position', new BufferAttribute(new Float32Array([
    0, 0, 0,
    100, 0, 0,
    0, 0, 100,
    100, 0, 100
  ]), 3))
  */
  const geometry = new BoxGeometry(100, 100, 100)
  const mesh = new Mesh(geometry, Color.red.toBasicMaterial())
  mesh.position.add(new Vector3(0, 200, 0))

  const { array, itemSize, count } = mesh.geometry.attributes.position
  const coords = Array.from(array)

  const vertices: Vertex[] = []
  for (let i = 0; i < count; i++) {
    const [x, y, z] = coords.slice(i * itemSize, (i + 1) * itemSize)
    const v = new Vertex(
      x,
      y,
      z,
      0,
      0,
      new Color(mesh.material.color.r, mesh.material.color.g, mesh.material.color.b, 0),
    )
    v.add(mesh.position)
    vertices.push(v)
  }

  for (let i = 0; i < vertices.length; i += 3) {
    const vvv = vertices.slice(i * 3, (i + 1) * 3)
    vvv.push(new Vertex(0, 0, 0))
    map.polygons.push(
      new Polygon({
        vertices: vvv as QuadrupleOf<Vertex>,
        /*
        vertices: [
          new Vertex(0, 0, 0, 1, 0, Color.white),
          new Vertex(100, 0, 0, 1, 1, Color.white),
          new Vertex(0, 0, 100, 0, 0, Color.white),
          new Vertex(100, 0, 100, 0, 1, Color.white),
        ],
        */
        texture: Texture.humanPaving1,
      }),
    )
  }

  map.player.position = new Vector3(50, -200, 50)

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
})()
