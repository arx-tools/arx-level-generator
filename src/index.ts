import { ArxLightFlags, ArxPolygonFlags } from 'arx-convert/types'
import { QuadrupleOf } from 'arx-convert/utils'
import path from 'node:path'
import seedrandom from 'seedrandom'
import { BoxGeometry, ConeGeometry, PlaneGeometry, MathUtils, Mesh, BufferAttribute } from 'three'
import { ArxMap } from './ArxMap'
import { Color } from './Color'
import { createFloorMesh } from './prefabs/mesh/floor'
import { makeBumpy, randomBetween } from './helpers'
import { Polygon } from './Polygon'
import { Rotation } from './Rotation'
import { Texture } from './Texture'
import { Vector3 } from './Vector3'
import { Vertex } from './Vertex'

// ....
import { Light } from './Light'
;(async () => {
  const {
    OUTPUTDIR = path.resolve(__dirname, './dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

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

  const map = new ArxMap()

  map.config.offset = new Vector3(1000, 0, 1000)
  map.player.position.adjustToPlayerHeight()
  map.hideMinimap()

  const backroomsCarpet = await Texture.fromCustomFile({
    sourcePath: 'projects/the-backrooms/textures/',
    filename: 'backrooms-[fabric]-carpet-dirty.jpg',
    isNative: false,
  })

  const floorMesh = createFloorMesh(2000, 2000, Color.white.darken(50), backroomsCarpet)
  makeBumpy(20, 10, floorMesh)
  const floor = ArxMap.fromThreeJsMesh(floorMesh)
  floor.config.offset.y += 15
  floor.polygons.forEach((polygon) => {
    polygon.flags |= ArxPolygonFlags.Tiled
  })
  map.add(floor, true)

  const water = ArxMap.fromThreeJsMesh(createFloorMesh(2000, 2000, Color.white, Texture.water))
  water.polygons.forEach((polygon) => {
    polygon.flags |= ArxPolygonFlags.Tiled | ArxPolygonFlags.Water
    polygon.setOpacity(10)
  })
  map.add(water, true)

  const light = new Light({
    color: Color.yellow.lighten(50),
    position: new Vector3(0, -800, 0),
    lightData: {
      fallStart: 100,
      fallEnd: 1000,
      intensity: 2,
      i: 0, // ?
      exFlicker: Color.transparent,
      exRadius: 0,
      exFrequency: 0,
      exSize: 0,
      exSpeed: 0,
      exFlareSize: 0,
    },
  })

  map.lights.push(light)

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
})()
