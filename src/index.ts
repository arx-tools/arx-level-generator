import { ArxPolygonFlags } from 'arx-convert/types'
import { QuadrupleOf } from 'arx-convert/utils'
import path from 'node:path'
import { BoxGeometry, BufferAttribute, ConeGeometry, Group, MathUtils, Mesh } from 'three'
import { ArxMap } from './ArxMap'
import { Color } from './Color'
import { randomBetween } from './helpers'
import { Polygon } from './Polygon'
import { Rotation } from './Rotation'
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

  const box = new BoxGeometry(300, 100, 300, 3, 1, 3)
  const boxMesh = new Mesh(box, Color.red.toBasicMaterial())

  const cone = new ConeGeometry(50, 600, 10, 6)
  cone.translate(-200, 0, 0)
  const coneMesh = new Mesh(cone, Color.green.toBasicMaterial())

  const mesh = boxMesh
  mesh.position.add(new Vector3(1000, 0, 1000))
  mesh.rotateOnAxis(new Vector3(0.4, 0, 0.3), MathUtils.degToRad(20))

  const group = new Group()
  group.add(boxMesh)
  group.add(coneMesh)
  // TODO: add the whole group to ArxMap, not just a single mesh

  // ----------------------------
  //  apply mesh transformations
  // ----------------------------

  mesh.updateMatrix()

  mesh.geometry.applyMatrix4(mesh.matrix)

  mesh.position.set(0, 0, 0)
  mesh.rotation.set(0, 0, 0)
  mesh.scale.set(1, 1, 1)
  mesh.updateMatrix()

  // -------------------
  //  add bumps to mesh
  // -------------------

  let idx = mesh.geometry.getIndex() as BufferAttribute
  let coords = mesh.geometry.getAttribute('position')
  for (let i = 0; i < idx.count; i++) {
    coords.setY(i, coords.getY(i) + randomBetween(-10, 10))
  }

  // ---------------------
  //  add mesh to arx map
  // ---------------------

  idx = mesh.geometry.getIndex() as BufferAttribute
  coords = mesh.geometry.getAttribute('position')
  const uv = mesh.geometry.getAttribute('uv')

  const vertices: Vertex[] = []
  for (let i = 0; i < idx.count; i++) {
    vertices.push(
      new Vertex(
        coords.getX(idx.array[i]),
        coords.getY(idx.array[i]) * -1,
        coords.getZ(idx.array[i]),
        uv.getX(idx.array[i]) * 2,
        uv.getY(idx.array[i]) * 2,
        Color.fromThreeJsColor(mesh.material.color),
      ),
    )
  }

  for (let i = 0; i < vertices.length; i += 3) {
    map.polygons.push(
      new Polygon({
        vertices: [...vertices.slice(i, i + 3).reverse(), new Vertex(0, 0, 0)] as QuadrupleOf<Vertex>,
        texture: Texture.humanPaving1,
      }),
    )
  }

  map.player.position = new Vector3(1000, -200, 1000)

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
})()
