import { createPlaneMesh } from '@prefabs/mesh/plane.js'
import { createLight } from '@projects/the-backrooms/light.js'
import { ArxMap } from '@src/ArxMap.js'
import { Color } from '@src/Color.js'
import { Material } from '@src/Material.js'
import { DONT_QUADIFY, SHADING_SMOOTH } from '@src/Polygons.js'
import { Rotation } from '@src/Rotation.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { loadOBJ } from '@tools/mesh/loadOBJ.js'
import { ArxPolygonFlags } from 'arx-convert/types'
import path from 'node:path'
import seedrandom from 'seedrandom'
import { MathUtils, Vector2 } from 'three'

const createFloor = async (width: number, height: number) => {
  const mesh = await createPlaneMesh(
    new Vector2(width, height),
    100,
    Color.white.darken(50),
    Material.fromTexture(Texture.stoneHumanStoneWall1, {
      flags: ArxPolygonFlags.None,
    }),
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
  map.player.withScript()
  map.hud.hide('all')

  map.add(await createFloor(1000, 2000), true)

  const ceilingLamp = await loadOBJ('projects/the-backrooms/models/ceiling-lamp/ceiling-lamp', {
    position: new Vector3(2000, 300, 2500),
    scale: 50,
    scaleUV: 5,
    materialFlags: ArxPolygonFlags.Glow,
    // fallbackTexture: Material.fromTexture(Texture.aliciaRoomMur02, {
    //   flags: ArxPolygonFlags.Glow,
    // }),
  })

  // TODO: flip polygons' UV from code
  const fountain = await loadOBJ('projects/forest/models/fountain/fountain', {
    position: new Vector3(2000, 3, 2500),
    scale: 2,
  })

  const tree = await loadOBJ('projects/forest/models/tree/tree', {
    position: new Vector3(2300, 0, 2800),
    scale: 30,
    // fallbackTexture: Texture.l2TrollWoodPillar08,
  })

  const ladder = await loadOBJ('projects/forest/models/ladder/ladder', {
    position: new Vector3(2300, 100, 2740),
    scale: 10,
    rotation: new Rotation(MathUtils.degToRad(-70), 0, 0),
  })

  const cableDrum = await loadOBJ('projects/the-backrooms/models/cable-drum/cable-drum', {
    position: new Vector3(1800, 15, 2600),
    scale: 10,
    // materialFlags: ArxPolygonFlags.NoShadow | ArxPolygonFlags.DoubleSided,
    // fallbackTexture: Material.fromTexture(Texture.l2GobelStoneCenter, {
    //   flags: ArxPolygonFlags.NoShadow | ArxPolygonFlags.DoubleSided,
    // }),
  })

  const teddy = await loadOBJ('projects/model-tester/models/teddy-bear/teddy-bear', {
    position: new Vector3(1825, 15, 2600),
    scale: 7,
    rotation: new Rotation(0, 0, MathUtils.degToRad(30)),
  })

  const megaphone = await loadOBJ('models/megaphone/megaphone', {
    position: new Vector3(2000, 100, 2700),
    scale: 10,
  })

  const importedModels = [teddy, tree, cableDrum, ceilingLamp, fountain, ladder, megaphone].flat()

  importedModels.forEach((mesh) => {
    map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_SMOOTH })
  })

  map.lights.push(createLight(new Vector3(0, -200, 0), 2000))

  map.lights.push(createLight(new Vector3(0, -200, 500), 300))

  map.lights.push(createLight(new Vector3(1000, -200, 1000), 1300))
  map.lights.push(createLight(new Vector3(1000, -200, -1000), 1300))
  map.lights.push(createLight(new Vector3(-1000, -200, 1000), 1300))
  map.lights.push(createLight(new Vector3(-1000, -200, -1000), 1300))

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
