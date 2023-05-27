import { createPlaneMesh } from '@prefabs/mesh/plane.js'
import { ArxMap } from '@src/ArxMap.js'
import { Color } from '@src/Color.js'
import { SHADING_SMOOTH } from '@src/Polygons.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { createZone } from '@tools/createZone.js'
import { makeBumpy } from '@tools/mesh/makeBumpy.js'
import path from 'node:path'
import seedrandom from 'seedrandom'
import { Vector2 } from 'three'
import { floor } from 'three/examples/jsm/nodes/Nodes.js'

export default async () => {
  const {
    OUTPUTDIR = path.resolve('./dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

  const map = new ArxMap()
  map.meta.mapName = "Lalee's minigame"
  map.meta.seed = SEED
  map.config.offset = new Vector3(6000, 0, 6000)
  map.player.position.adjustToPlayerHeight()
  map.player.withScript()
  map.hud.hide('all')

  // --------------

  const floorMesh = await createPlaneMesh(
    new Vector2(500, 500),
    100,
    Color.fromCSS('white'),
    Texture.l4DwarfWoodBoard02,
  )
  makeBumpy(10, 30, false, floorMesh.geometry)
  const floor = ArxMap.fromThreeJsMesh(floorMesh, { tryToQuadify: "don't quadify", shading: SHADING_SMOOTH })
  map.add(floor, true)

  const spawnZone = createZone({
    name: 'spawn',
    backgroundColor: Color.fromCSS('white').darken(30),
    drawDistance: 5000,
  })
  map.zones.push(spawnZone)

  // --------------

  map.finalize()
  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
