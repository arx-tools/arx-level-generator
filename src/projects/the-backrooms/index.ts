import { ArxPolygonFlags } from 'arx-convert/types'
import path from 'node:path'
import seedrandom from 'seedrandom'
import { ArxMap } from '../../ArxMap'
import { Color } from '../../Color'
import { createFloorMesh } from '../../prefabs/mesh/floor'
import { makeBumpy } from '../../helpers'
import { Texture } from '../../Texture'
import { Vector3 } from '../../Vector3'
import { Light } from '../../Light'

export default async () => {
  const {
    OUTPUTDIR = path.resolve(__dirname, './dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

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
    fallStart: 100,
    fallEnd: 1000,
    intensity: 2,
    lightData: {
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
}
