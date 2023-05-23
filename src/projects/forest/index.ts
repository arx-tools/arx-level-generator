import { ArxMap } from '@src/ArxMap.js'
import { Vector3 } from '@src/Vector3.js'
import path from 'node:path'
import seedrandom from 'seedrandom'
import { createGround } from './createGround.js'
import { Mesh, Vector2 } from 'three'
import { DONT_QUADIFY, SHADING_SMOOTH } from '@src/Polygons.js'
import { applyTransformations } from '@src/helpers.js'
import { createLight } from '@tools/createLight.js'
import { Color } from '@src/Color.js'

export default async () => {
  const {
    OUTPUTDIR = path.resolve('./dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

  const map = new ArxMap()
  map.meta.mapName = 'The Forest'
  map.meta.seed = SEED
  map.config.offset = new Vector3(6000, 0, 6000)
  map.player.position.adjustToPlayerHeight()
  map.player.withScript()
  map.hud.hide('all')

  const meshes: Mesh[] = []

  // ---------------------------

  meshes.push(...(await createGround({ size: new Vector2(2000, 2000) })))

  meshes.forEach((mesh) => {
    mesh.translateX(map.config.offset.x)
    mesh.translateY(map.config.offset.y)
    mesh.translateZ(map.config.offset.z)
    applyTransformations(mesh)
    map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_SMOOTH })
  })

  map.lights.push(
    createLight({
      position: new Vector3(0, -300, 0),
      radius: 600,
      color: Color.white,
    }),
  )

  // TODO: add dead tree

  // ---------------------------

  map.finalize()
  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
