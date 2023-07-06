import path from 'node:path'
import { ArxPolygonFlags } from 'arx-convert/types'
import seedrandom from 'seedrandom'
import { MathUtils, Vector2 } from 'three'
import { ArxMap } from '@src/ArxMap.js'
import { Color } from '@src/Color.js'
import { Material } from '@src/Material.js'
import { DONT_QUADIFY, SHADING_SMOOTH } from '@src/Polygons.js'
import { Rotation } from '@src/Rotation.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { applyTransformations } from '@src/helpers.js'
import { createPlaneMesh } from '@prefabs/mesh/plane.js'
import { createLight } from '@tools/createLight.js'
import { createZone } from '@tools/createZone.js'
import { loadOBJ } from '@tools/mesh/loadOBJ.js'

const createFloor = (width: number, height: number) => {
  const mesh = createPlaneMesh({
    size: new Vector2(width, height),
    texture: Material.fromTexture(Texture.stoneHumanStoneWall1, {
      flags: ArxPolygonFlags.None,
    }),
  })

  return ArxMap.fromThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY })
}

const createSpawnZone = () => {
  return createZone({
    size: new Vector3(100, Infinity, 100),
    name: 'spawn',
    backgroundColor: Color.fromCSS('skyblue'),
    drawDistance: 20000,
  })
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
  map.config.offset = new Vector3(6000, 0, 6000)
  map.player.position.adjustToPlayerHeight()
  // map.player.orientation.y = MathUtils.degToRad(180)
  map.player.withScript()
  map.hud.hide('all')

  map.add(createFloor(1000, 2000), true)

  const fountain = await loadOBJ('models/fountain/fountain', {
    position: new Vector3(0, -3, 500),
    scale: 0.02,
    scaleUV: new Vector2(1, -1),
  })

  const tree = await loadOBJ('models/tree/tree', {
    position: new Vector3(300, 0, 800),
    scale: 0.3,
    fallbackTexture: Texture.l2TrollWoodPillar08,
  })

  const ladder = await loadOBJ('models/ladder/ladder', {
    position: new Vector3(300, -100, 740),
    scale: 0.1,
    rotation: new Rotation(MathUtils.degToRad(70), 0, 0),
    scaleUV: new Vector2(1, -1),
  })

  const importedModels = [tree, fountain, ladder]

  importedModels.flat().forEach((mesh) => {
    mesh.translateX(map.config.offset.x)
    mesh.translateY(map.config.offset.y)
    mesh.translateZ(map.config.offset.z)
    applyTransformations(mesh)
    map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_SMOOTH })
  })

  map.lights.push(createLight({ position: new Vector3(0, -200, 0), radius: 2000 }))

  map.lights.push(createLight({ position: new Vector3(0, -200, 500), radius: 300 }))

  map.lights.push(createLight({ position: new Vector3(1000, -200, 1000), radius: 1300 }))
  map.lights.push(createLight({ position: new Vector3(1000, -200, -1000), radius: 1300 }))
  map.lights.push(createLight({ position: new Vector3(-1000, -200, 1000), radius: 1300 }))
  map.lights.push(createLight({ position: new Vector3(-1000, -200, -1000), radius: 1300 }))

  map.zones.push(createSpawnZone())

  map.finalize()
  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
