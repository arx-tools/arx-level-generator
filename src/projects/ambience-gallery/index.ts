import fs from 'node:fs'
import path from 'node:path'
import seedrandom from 'seedrandom'
import { MathUtils, Mesh, MeshBasicMaterial } from 'three'
import { Ambience } from '@src/Ambience.js'
import { ArxMap } from '@src/ArxMap.js'
import { Color } from '@src/Color.js'
import { Vector3 } from '@src/Vector3.js'
import { DONT_QUADIFY, SHADING_FLAT, SHADING_SMOOTH } from '@src/Polygons.js'
import { applyTransformations } from '@src/helpers.js'
import { HudElements } from '@src/HUD.js'
import { ambiences } from '@projects/ambience-gallery/constants.js'
import { createGround } from '@projects/ambience-gallery/ground.js'
import { createEastWestWall, createNorthSouthWall } from '@projects/ambience-gallery/walls.js'
import { createNECorner, createNWCorner, createSECorner, createSWCorner } from '@projects/ambience-gallery/corners.js'
import { createLight } from '@projects/ambience-gallery/light.js'
import { createStoneBlocks } from './stoneBlock.js'
import { createZone } from './zone.js'
import { createMainMarker } from './mainMarker.js'
import { Entity } from '@src/Entity.js'
import { times } from '@src/faux-ramda.js'
import { randomBetween } from '@src/random.js'
import { Interactivity } from '@scripting/properties/Interactivity.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { Texture } from '@src/Texture.js'
import { Material } from '@src/Material.js'
import { ArxPolygonFlags } from 'arx-convert/types'

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
  // map.player.script?.on('init', () => 'setspeed 3')
  map.hud.hide(HudElements.Minimap)
  map.hud.hide(HudElements.Healthbar)
  map.hud.hide(HudElements.Manabar)
  map.hud.hide(HudElements.StealthIndicator)
  map.hud.hide(HudElements.StealingIcon)
  map.hud.hide(HudElements.LevelUpIcon)
  map.hud.hide(HudElements.BookIcon)
  map.hud.hide(HudElements.BackpackIcon)
  map.hud.hide(HudElements.PurseIcon)
  await map.i18n.addFromFile(path.resolve('assets/projects/ambience-gallery/i18n.json'))

  const rowSize = 5

  const width = Math.ceil(ambiences.length / rowSize) * 300 + 400
  const depth = rowSize * 300 + 200

  const mainMarker = createMainMarker()

  const blocks = createStoneBlocks(rowSize, depth, mainMarker)

  const lights = [
    createLight(new Vector3(width + 500, -2000, -1000), Color.white.darken(30), 200, 5000, 1),

    createLight(
      new Vector3(
        width - 500 + randomBetween(-100, 100),
        -300 + randomBetween(-50, 50),
        -1000 + randomBetween(-100, 100),
      ),
      Color.white.darken(40),
      1,
      1000,
      0.45,
    ),
    createLight(
      new Vector3(width - 500 + randomBetween(-100, 100), -300 + randomBetween(-50, 50), 0 + randomBetween(-100, 100)),
      Color.white.darken(40),
      1,
      1000,
      0.45,
    ),
    createLight(
      new Vector3(
        width - 500 + randomBetween(-100, 100),
        -300 + randomBetween(-50, 50),
        1000 + randomBetween(-100, 100),
      ),
      Color.white.darken(40),
      1,
      1000,
      0.45,
    ),

    createLight(
      new Vector3(
        width / 2 + randomBetween(-100, 100),
        -300 + randomBetween(-50, 50),
        -1000 + randomBetween(-100, 100),
      ),
      Color.white.darken(40),
      1,
      1000,
      0.45,
    ),
    createLight(
      new Vector3(width / 2 + randomBetween(-100, 100), -300 + randomBetween(-50, 50), 0 + randomBetween(-100, 100)),
      Color.white.darken(40),
      1,
      1000,
      0.45,
    ),
    createLight(
      new Vector3(width / 2 + randomBetween(-100, 100), -300 + randomBetween(-50, 50), 1000 + randomBetween(-100, 100)),
      Color.white.darken(40),
      1,
      1000,
      0.45,
    ),

    createLight(
      new Vector3(300 + randomBetween(-100, 100), -300 + randomBetween(-50, 50), -1000 + randomBetween(-100, 100)),
      Color.white.darken(40),
      1,
      1000,
      0.45,
    ),
    createLight(
      new Vector3(300 + randomBetween(-100, 100), -300 + randomBetween(-50, 50), 0 + randomBetween(-100, 100)),
      Color.white.darken(40),
      1,
      1000,
      0.45,
    ),
    createLight(
      new Vector3(300 + randomBetween(-100, 100), -300 + randomBetween(-50, 50), 1000 + randomBetween(-100, 100)),
      Color.white.darken(40),
      1,
      1000,
      0.45,
    ),
  ]

  const plants = times(() => {
    // TODO: add mushroom
    const entity = Entity.fern.withScript()
    entity.position.add(new Vector3(randomBetween(-200, 2800), 0, randomBetween(-800, 800)))
    entity.orientation.y = MathUtils.degToRad(randomBetween(0, 360))
    entity.script?.properties.push(Interactivity.off)
    entity.script?.on('init', () => `setscale ${Math.round(randomBetween(30, 150))}`)
    return entity
  }, Math.round(randomBetween(60, 100)))

  const zones = [
    ...blocks.zones,
    createZone(new Vector3(-200, 20, -depth / 2), new Vector3(width, 10, depth), Ambience.none, Color.fromCSS('#444')),
  ]

  const entities = [mainMarker, ...blocks.entities, ...plants]

  const meshes = [...blocks.meshes]

  const smoothMeshes = [
    await createGround(width, depth),
    createEastWestWall(new Vector3(-160, 0, 850), 14),
    createEastWestWall(new Vector3(-160, 0, -850), 14),
    createNorthSouthWall(new Vector3(-200, 0, 850), 8),
    createNorthSouthWall(new Vector3(2900, 0, 850), 8),
    createNWCorner(),
    createSWCorner(),
    createNECorner(),
    createSECorner(),
  ]

  map.zones.push(...zones)
  map.entities.push(...entities)
  map.lights.push(...lights)
  meshes.forEach((mesh) => {
    applyTransformations(mesh)
    mesh.translateX(map.config.offset.x)
    mesh.translateY(map.config.offset.y)
    mesh.translateZ(map.config.offset.z)
    applyTransformations(mesh)
    map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_FLAT })
  })
  smoothMeshes.forEach((mesh) => {
    applyTransformations(mesh)
    mesh.translateX(map.config.offset.x)
    mesh.translateY(map.config.offset.y)
    mesh.translateZ(map.config.offset.z)
    applyTransformations(mesh)
    map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_SMOOTH })
  })

  // -----------------------------

  const src = path.resolve('./assets/projects/forest/models/tree/tree.obj')
  const raw = await fs.promises.readFile(src, 'utf-8')
  const loader = new OBJLoader()
  const obj = loader.parse(raw)

  const geometry = (obj.children[0] as Mesh).geometry
  geometry.scale(80, 70, 80)
  geometry.rotateY(MathUtils.degToRad(80))
  geometry.translate(4770, 0, 1450)
  const material = new MeshBasicMaterial({
    color: Color.white.getHex(),
    map: Material.fromTexture(Texture.l2TrollWoodPillar08, {
      flags: ArxPolygonFlags.DoubleSided,
    }),
  })

  const mesh = new Mesh(geometry, material)

  map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_SMOOTH })

  // -----------------------------

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
