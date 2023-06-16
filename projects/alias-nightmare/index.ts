import path from 'node:path'
import seedrandom from 'seedrandom'
import { Vector2 } from 'three'
import { Ambience } from '@src/Ambience.js'
import { ArxMap } from '@src/ArxMap.js'
import { Audio } from '@src/Audio.js'
import { Color } from '@src/Color.js'
import { HudElements } from '@src/HUD.js'
import { DONT_QUADIFY } from '@src/Polygons.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { createPlaneMesh } from '@src/prefabs/mesh/plane.js'
import { makeBumpy } from '@src/tools/mesh/makeBumpy.js'
import { transformEdge } from '@src/tools/mesh/transformEdge.js'
import { createZone } from '@tools/createZone.js'

const createIsland = async (width: number, height: number) => {
  const floorMesh = await createPlaneMesh({
    size: new Vector2(width, height),
    texture: Texture.stoneHumanAkbaa2F,
  })
  transformEdge(new Vector3(0, -30, 0), floorMesh)
  makeBumpy(10, 60, false, floorMesh.geometry)
  return ArxMap.fromThreeJsMesh(floorMesh, { tryToQuadify: DONT_QUADIFY })
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
  map.meta.mapName = "Alia's nightmare"
  map.meta.seed = SEED
  map.config.offset = new Vector3(6000, 0, 6000)
  map.player.position.adjustToPlayerHeight()
  map.hud.hide(HudElements.Minimap)

  map.add(await createIsland(1000, 1000), true)

  map.zones.push(
    createZone({
      name: 'spawn',
      backgroundColor: Color.fromCSS('hsla(0, 64%, 8%, 1)'),
      ambience: Ambience.fromAudio(
        'loop_sirs',
        Audio.fromCustomFile({
          filename: 'loop_sirs.wav',
          sourcePath: 'projects/alias-nightmare/sfx',
        }),
      ),
    }),
  )

  map.finalize()
  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
