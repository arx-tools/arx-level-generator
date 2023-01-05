import { ArxPolygonFlags } from 'arx-convert/types'
import { QuadrupleOf } from 'arx-convert/utils'
import path from 'node:path'
import { BoxGeometry, ConeGeometry, PlaneGeometry, MathUtils, Mesh } from 'three'
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

  // const map = await ArxMap.fromOriginalLevel(2)

  // const map2 = await ArxMap.fromOriginalLevel(15)
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

  const level8 = await ArxMap.fromOriginalLevel(8)

  const map = new ArxMap()
  map.config.offset = new Vector3(1000, 0, 1000)

  const plane = new PlaneGeometry(100, 600, 1, 6)
  const planeMesh = new Mesh(plane, Color.red.toBasicMaterial())
  planeMesh.rotateX(MathUtils.degToRad(-90))
  map.add(ArxMap.fromThreeJsMesh(planeMesh), true)

  const cone = new ConeGeometry(50, 600, 10, 6, true)
  cone.translate(-200, 300, 0)
  const coneMesh = new Mesh(cone, Color.green.lighten(60).toBasicMaterial())
  coneMesh.rotateOnAxis(new Vector3(0.4, 0, 0.3), MathUtils.degToRad(20))
  map.add(ArxMap.fromThreeJsMesh(coneMesh), true)

  coneMesh.translateX(-300).rotateY(MathUtils.degToRad(-96))
  coneMesh.geometry.scale(1, 0.3, 1)
  map.add(ArxMap.fromThreeJsMesh(coneMesh), true)

  map.move(new Vector3(-2000, -1, 7500))

  level8.add(map, true)

  level8.entities = []

  level8.player.position.adjustToPlayerHeight()
  level8.player.orientation.y += MathUtils.degToRad(180)

  level8.finalize()

  level8.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
})()
