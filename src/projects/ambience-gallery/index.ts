import path from 'node:path'
import seedrandom from 'seedrandom'
import { MathUtils } from 'three'
import { Ambience } from '@src/Ambience'
import { ArxMap } from '@src/ArxMap'
import { Color } from '@src/Color'
import { Vector3 } from '@src/Vector3'
import { DONT_QUADIFY, SHADING_FLAT, SHADING_SMOOTH } from '@src/Polygons'
import { applyTransformations } from '@src/helpers'
import { HudElements } from '@src/HUD'
import { ambiences } from '@projects/ambience-gallery/constants'
import { createGround } from '@projects/ambience-gallery/ground'
import { createEastWall, createNorthWall, createSouthWall, createWestWall } from '@projects/ambience-gallery/walls'
import { createNECorner, createNWCorner, createSECorner, createSWCorner } from '@projects/ambience-gallery/corners'
import { createLight } from '@projects/ambience-gallery/light'
import { createStoneBlocks } from './stoneBlock'
import { createZone } from './zone'
import { createMainMarker } from './mainMarker'

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
  map.hud.hide(HudElements.Minimap)
  map.hud.hide(HudElements.Healthbar)
  map.hud.hide(HudElements.Manabar)
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
    createLight(new Vector3(-200 + width / 2, -1000, 0), Color.white.darken(30), 'main'),
    createLight(new Vector3(200, -300, 600), Color.white.darken(40), 'small'),
    createLight(new Vector3(100, -300, 0), Color.white.darken(40), 'small'),
    createLight(new Vector3(200, -300, -600), Color.white.darken(40), 'small'),
    createLight(new Vector3(width - 650, -300, 600), Color.white.darken(40), 'small'),
    createLight(new Vector3(width - 550, -300, 0), Color.white.darken(40), 'small'),
    createLight(new Vector3(width - 650, -300, -600), Color.white.darken(40), 'small'),
  ]

  const zones = [
    ...blocks.zones,
    createZone(new Vector3(-200, 20, -depth / 2), new Vector3(width, 10, depth), Ambience.none, Color.fromCSS('#444')),
  ]
  const entities = [mainMarker, ...blocks.entities]

  const meshes = [
    ...blocks.meshes,
    ...(await createNorthWall(3100)),
    ...(await createSouthWall(3100)),
    ...(await createEastWall(1700)),
    ...(await createWestWall(1700)),
    await createNWCorner(), // TODO: remove top and bottom -> quadify
    await createSWCorner(), // TODO: remove top and bottom -> quadify
    await createNECorner(), // TODO: remove top and bottom -> quadify
    await createSECorner(), // TODO: remove top and bottom -> quadify
  ]
  const smoothMeshes = [await createGround(width, depth)]

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

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
