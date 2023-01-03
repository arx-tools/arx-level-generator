import { ArxPolygonFlags } from 'arx-convert/types'
import { QuadrupleOf } from 'arx-convert/utils'
import path from 'node:path'
import { BoxGeometry, BufferAttribute, ConeGeometry, Mesh } from 'three'
import { ArxMap } from './ArxMap'
import { Color } from './Color'
import { randomBetween } from './helpers'
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

  // -------------
  //  create mesh
  // -------------

  const geometry = new BoxGeometry(300, 100, 300, 3, 1, 3)
  // const geometry = new ConeGeometry(50, 100, 10)

  const mesh = new Mesh(geometry, Color.white.toBasicMaterial())
  mesh.position.add(new Vector3(1000, 0, 1000))

  // -----------
  //  add bumps
  // -----------

  let idx = mesh.geometry.getIndex() as BufferAttribute
  let coords = mesh.geometry.getAttribute('position')
  for (let i = 0; i < idx.count; i++) {
    coords.setY(i, coords.getY(i) + randomBetween(-10, 10))
  }

  // ----------
  //  add mesh
  // ----------

  idx = mesh.geometry.getIndex() as BufferAttribute
  coords = mesh.geometry.getAttribute('position')

  const vertices: Vertex[] = []
  for (let i = 0; i < idx.count; i++) {
    const v = new Vertex(
      coords.getX(idx.array[i]),
      coords.getY(idx.array[i]) * -1,
      coords.getZ(idx.array[i]),
      [0, 1, 0][i % 3], // TODO: calculate U
      [0, 1, 1][i % 3], // TODO: calculate V
      Color.fromThreeJsColor(mesh.material.color),
    )
    v.add(mesh.position)
    vertices.push(v)
  }

  for (let i = 0; i < vertices.length; i += 3) {
    map.polygons.push(
      new Polygon({
        flags: ArxPolygonFlags.NoShadow | ArxPolygonFlags.DoubleSided,
        vertices: [...vertices.slice(i, i + 3), new Vertex(0, 0, 0)] as QuadrupleOf<Vertex>,
        texture: Texture.humanPaving1,
      }),
    )
  }

  map.player.position = new Vector3(1000, -200, 1000)

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
})()
