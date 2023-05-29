import path from 'node:path'
import { ArxPolygonFlags } from 'arx-convert/types'
import seedrandom from 'seedrandom'
import { Object3D } from 'three'
import { ArxMap } from '@src/ArxMap.js'
import { Color } from '@src/Color.js'
import { DONT_QUADIFY, SHADING_FLAT } from '@src/Polygons.js'
import { Vector3 } from '@src/Vector3.js'
import { applyTransformations } from '@src/helpers.js'
import { createZone } from '@tools/createZone.js'
import { loadOBJ } from '@tools/mesh/loadOBJ.js'

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
  map.config.offset = new Vector3(6000, 0, 6000)
  map.player.withScript()
  map.player.position.adjustToPlayerHeight()

  map.hud.hide('all')

  const meshes: (Object3D | Object3D[])[] = []

  // ---------------------------------

  const spawn = createZone({
    name: 'spawn',
    backgroundColor: Color.fromCSS('#b0d6f5'),
    drawDistance: 10000,
  })

  map.zones.push(spawn)

  // ---------------------------------

  const cs_italy = await loadOBJ('projects/counter-strike/models/cs_italy/cs_italy', {
    position: new Vector3(700, 3200, -2600),
    scale: new Vector3(-0.025, 0.025, 0.025),
    materialFlags: (texture) => {
      if (!texture.filename.startsWith('cs_italy_texture_')) {
        return undefined
      }

      // TODO: turn polygons inside out by reversing polygon winding
      let flags = ArxPolygonFlags.None | ArxPolygonFlags.DoubleSided

      const textureIdx = parseInt(texture.filename.split('_')[3])

      if (textureIdx >= 80) {
        flags |= ArxPolygonFlags.Transparent
      }

      if (textureIdx === 32 || textureIdx === 43) {
        flags |= ArxPolygonFlags.Glow
      }

      return flags
    },
  })

  meshes.push(cs_italy)

  // ---------------------------------

  meshes.flat().forEach((mesh) => {
    mesh.translateX(map.config.offset.x)
    mesh.translateY(map.config.offset.y)
    mesh.translateZ(map.config.offset.z)
    applyTransformations(mesh)
    map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_FLAT })
  })

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
