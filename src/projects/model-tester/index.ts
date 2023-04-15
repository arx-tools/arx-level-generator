import { createPlaneMesh } from '@prefabs/mesh/plane.js'
import { createLight } from '@projects/the-backrooms/light.js'
import { ArxMap } from '@src/ArxMap.js'
import { Color } from '@src/Color.js'
import { DONT_QUADIFY, SHADING_SMOOTH } from '@src/Polygons.js'
import { Rotation } from '@src/Rotation.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { loadOBJ } from '@tools/mesh/loadOBJ.js'
import path from 'node:path'
import seedrandom from 'seedrandom'
import { MathUtils, Vector2 } from 'three'

const createFloor = async (width: number, height: number) => {
  const mesh = await createPlaneMesh(
    new Vector2(width, height),
    100,
    Color.white.darken(50),
    Texture.stoneHumanStoneWall1,
  )
  return ArxMap.fromThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY })
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
  map.meta.mapName = 'Model Tester'
  map.meta.seed = SEED
  map.config.offset = new Vector3(2000, 0, 2000)
  map.player.position.adjustToPlayerHeight()
  map.player.orientation.y = MathUtils.degToRad(-90)
  map.player.withScript()

  map.add(await createFloor(2000, 1000), true)

  const teddy = await loadOBJ('projects/model-tester/models/teddy-bear/teddy-bear', {
    position: new Vector3(2300, 100, 2000),
    scale: new Vector3(30, 30, 30),
    rotation: new Rotation(0, MathUtils.degToRad(180), 0),
    texture: Texture.l2TrollWoodPillar08,
  })

  const importedModels = [...teddy]

  importedModels.forEach((mesh) => {
    map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_SMOOTH })
  })

  map.lights.push(createLight(new Vector3(0, -300, 0), 2000))

  map.lights.push(createLight(new Vector3(1000, -300, 1000), 1300))
  map.lights.push(createLight(new Vector3(1000, -300, -1000), 1300))
  map.lights.push(createLight(new Vector3(-1000, -300, 1000), 1300))
  map.lights.push(createLight(new Vector3(-1000, -300, -1000), 1300))

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
