import path from 'node:path'
import seedrandom from 'seedrandom'
import { MathUtils } from 'three'
import { Ambience } from '@src/Ambience.js'
import { ArxMap } from '@src/ArxMap.js'
import { Color } from '@src/Color.js'
import { Vector3 } from '@src/Vector3.js'
import { DONT_QUADIFY, SHADING_FLAT, SHADING_SMOOTH } from '@src/Polygons.js'
import { applyTransformations } from '@src/helpers.js'
import { ambiences } from '@projects/ambience-gallery/constants.js'
import { createGround } from '@projects/ambience-gallery/ground.js'
import { createEastWestWall, createNorthSouthWall } from '@projects/ambience-gallery/walls.js'
import { createNECorner, createNWCorner, createSECorner, createSWCorner } from '@projects/ambience-gallery/corners.js'
import { createStoneBlocks } from './stoneBlock.js'
import { createMainMarker } from './mainMarker.js'
import { Entity } from '@src/Entity.js'
import { times } from '@src/faux-ramda.js'
import { pickRandom, randomBetween } from '@src/random.js'
import { Interactivity } from '@scripting/properties/Interactivity.js'
import { Texture } from '@src/Texture.js'
import { Rotation } from '@src/Rotation.js'
import { loadOBJ } from '@tools/mesh/loadOBJ.js'
import { createZone } from '@tools/createZone.js'
import { createLight } from '@tools/createLight.js'
import { createMoon } from './moon.js'

export default async () => {
  const {
    OUTPUTDIR = path.resolve('./dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

  const map = new ArxMap()
  map.meta.mapName = 'Ambience Gallery'
  map.meta.seed = SEED
  map.config.offset = new Vector3(2000, 0, 2000)
  map.player.position.adjustToPlayerHeight()
  map.player.orientation.y = MathUtils.degToRad(-90)
  map.player.withScript()
  map.hud.hide('all')
  await map.i18n.addFromFile(path.resolve('assets/projects/ambience-gallery/i18n.json'))

  // -----------------------------

  const rowSize = 5

  const width = Math.ceil(ambiences.length / rowSize) * 300 + 400
  const depth = rowSize * 300 + 200

  const mainMarker = createMainMarker()

  const blocks = createStoneBlocks(rowSize, depth, mainMarker)

  const moon = createMoon({
    position: new Vector3(width + 500, -1000, -1000),
    size: 50,
  })

  const nwCorner = await createNWCorner()
  const swCorner = await createSWCorner()
  const neCorner = await createNECorner()
  const seCorner = await createSECorner()

  const lights = [
    moon.lights,
    nwCorner.lights,
    swCorner.lights,
    neCorner.lights,
    seCorner.lights,
    [
      new Vector3(width * (0.1 + 0.4 * 0), -300, -1000),
      new Vector3(width * (0.1 + 0.4 * 0), -300, 0),
      new Vector3(width * (0.1 + 0.4 * 0), -300, 1000),

      new Vector3(width * (0.1 + 0.4 * 1), -300, -1000),
      new Vector3(width * (0.1 + 0.4 * 1), -300, 0),
      new Vector3(width * (0.1 + 0.4 * 1), -300, 1000),

      new Vector3(width * (0.1 + 0.4 * 2), -300, -1000),
      new Vector3(width * (0.1 + 0.4 * 2), -300, 0),
      new Vector3(width * (0.1 + 0.4 * 2), -300, 1000),
    ].map((position) => {
      const xOffset = randomBetween(-100, 100)
      const yOffset = randomBetween(-50, 50)
      const zOffset = randomBetween(-100, 100)
      return createLight({
        position: position.clone().add(new Vector3(xOffset, yOffset, zOffset)),
        color: Color.white.darken(40),
        fallStart: 1,
        radius: 1000,
        intensity: 0.45,
      })
    }),
  ]

  const randomGraveyardJunk = times(() => {
    const item = pickRandom([Entity.skull, Entity.boneBassin, Entity.bone]).withScript()
    item.position.add(new Vector3(randomBetween(-200, 2800), 5 + randomBetween(-5, 5), randomBetween(-800, 800)))
    item.orientation = new Rotation(
      MathUtils.degToRad(randomBetween(-45, 45)),
      MathUtils.degToRad(randomBetween(0, 360)),
      MathUtils.degToRad(randomBetween(-45, 45)),
    )

    if (item.entityName === 'bone_bassin') {
      item.position.y += 15
    }

    item.script?.properties.push(Interactivity.off)
    return item
  }, Math.round(randomBetween(30, 80)))

  const zones = [
    blocks.zones,
    createZone({
      position: new Vector3(-200, 20, -depth / 2),
      size: new Vector3(width, 10, depth),
      name: Ambience.none.name,
      ambience: Ambience.none,
      backgroundColor: Color.fromCSS('#444'),
      drawDistance: 10000,
    }),
  ]

  const entities = [mainMarker, blocks.entities, randomGraveyardJunk]

  const meshes = [blocks.meshes]

  const smoothMeshes = [
    moon.meshes,
    await createGround(width, depth),
    createEastWestWall(new Vector3(-160, 0, 850), 14),
    createEastWestWall(new Vector3(-160, 0, -850), 14),
    createNorthSouthWall(new Vector3(-200, 0, 850), 8),
    createNorthSouthWall(new Vector3(2900, 0, 850), 8),
    nwCorner.meshes,
    swCorner.meshes,
    neCorner.meshes,
    seCorner.meshes,
  ]

  map.zones.push(...zones.flat())
  map.entities.push(...entities.flat())
  map.lights.push(...lights.flat())
  meshes.flat().forEach((mesh) => {
    applyTransformations(mesh)
    mesh.translateX(map.config.offset.x)
    mesh.translateY(map.config.offset.y)
    mesh.translateZ(map.config.offset.z)
    applyTransformations(mesh)
    map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_FLAT })
  })
  smoothMeshes.flat().forEach((mesh) => {
    applyTransformations(mesh)
    mesh.translateX(map.config.offset.x)
    mesh.translateY(map.config.offset.y)
    mesh.translateZ(map.config.offset.z)
    applyTransformations(mesh)
    map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_SMOOTH })
  })

  // -----------------------------

  const tree = await loadOBJ('models/tree/tree', {
    position: new Vector3(4770, -10, 1450),
    scale: new Vector3(0.8, 0.7, 0.8),
    rotation: new Rotation(0, MathUtils.degToRad(70), 0),
    fallbackTexture: Texture.l2TrollWoodPillar08,
  })

  const importedModels = [...tree]

  importedModels.forEach((mesh) => {
    map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_SMOOTH })
  })

  // -----------------------------

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
