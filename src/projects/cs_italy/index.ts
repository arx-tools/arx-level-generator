import { ArxMap } from '@src/ArxMap.js'
import { Material } from '@src/Material.js'
import { DONT_QUADIFY, SHADING_FLAT, SHADING_SMOOTH } from '@src/Polygons.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { applyTransformations } from '@src/helpers.js'
import { loadOBJ } from '@tools/mesh/loadOBJ.js'
import { ArxPolygonFlags } from 'arx-convert/types'
import path from 'node:path'
import seedrandom from 'seedrandom'

export default async () => {
  const {
    OUTPUTDIR = path.resolve('./dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

  const map = new ArxMap()
  map.meta.mapName = 'cs_italy'
  map.meta.seed = SEED
  map.config.offset = new Vector3(1000, 0, 1000)
  map.player.withScript()
  map.player.position.adjustToPlayerHeight()
  map.hud.hide('all')

  // ---------------------------------

  const cs_italy = await loadOBJ('projects/counter-strike/models/cs_italy/cs_italy', {
    position: new Vector3(50, 1000, 100),
    scale: 0.008,
    materialFlags: ArxPolygonFlags.Tiled,
  })

  const models = [cs_italy].flat()

  // ---------------------------------

  models.forEach((mesh) => {
    mesh.translateX(map.config.offset.x)
    mesh.translateY(map.config.offset.y)
    mesh.translateZ(map.config.offset.z)
    applyTransformations(mesh)
    map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_FLAT })
  })

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
