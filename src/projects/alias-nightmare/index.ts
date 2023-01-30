import { Ambience } from '@src/Ambience'
import { ArxMap } from '@src/ArxMap'
import { Color } from '@src/Color'
import { HudElements } from '@src/HUD'
import { DONT_QUADIFY } from '@src/Polygons'
import { createPlaneMesh } from '@src/prefabs/mesh/plane'
import { Texture } from '@src/Texture'
import { makeBumpy } from '@src/tools/mesh/makeBumpy'
import { transformEdge } from '@src/tools/mesh/transformEdge'
import { Vector3 } from '@src/Vector3'
import { Zone } from '@src/Zone'
import path from 'node:path'
import seedrandom from 'seedrandom'
import { EdgesGeometry, MathUtils, Shape, ShapeGeometry, Vector2 } from 'three'

const createSpawn = () => {
  const shape = new Shape()
  shape.lineTo(100, 0)
  shape.lineTo(100, 100)
  shape.lineTo(0, 100)

  const geometry = new ShapeGeometry(shape)
  const edge = new EdgesGeometry(geometry)
  edge.rotateX(MathUtils.degToRad(70))

  const zone = Zone.fromThreejsGeometry(edge, {
    name: 'spawn',
    backgroundColor: Color.fromCSS('hsla(0, 64%, 8%, 1)'),
    ambience: Ambience.fromCustomAudio('loop_sirs', 'loop_sirs.wav'),
  })

  return zone
}

const createIsland = async (width: number, height: number) => {
  const floorMesh = await createPlaneMesh(
    new Vector2(width, height),
    100,
    Color.white.darken(50),
    Texture.stoneHumanAkbaa2F,
  )
  transformEdge(new Vector3(0, -30, 0), floorMesh)
  makeBumpy(10, 60, false, floorMesh.geometry)
  return ArxMap.fromThreeJsMesh(floorMesh, DONT_QUADIFY)
}

export default async () => {
  const {
    OUTPUTDIR = path.resolve('./dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

  const map = new ArxMap()

  map.config.offset = new Vector3(6000, 0, 6000)
  map.player.position.adjustToPlayerHeight()
  map.hud.hide(HudElements.Minimap)

  map.add(await createIsland(1000, 1000), true)

  map.zones.push(createSpawn())

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
