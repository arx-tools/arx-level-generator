import path from 'node:path'
import seedrandom from 'seedrandom'
import { EdgesGeometry, MathUtils, Shape, ShapeGeometry, Vector2 } from 'three'
import { createPlaneMesh } from '@prefabs/mesh/plane.js'
import { ArxMap } from '@src/ArxMap.js'
import { Color } from '@src/Color.js'
import { HudElements } from '@src/HUD.js'
import { DONT_QUADIFY } from '@src/Polygons.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { applyTransformations } from '@src/helpers.js'
import { scaleUV } from '@tools/mesh/scaleUV.js'
import { Zone } from '@src/Zone.js'

const facadeRatio = 1000 / 1319

const createFloor = async (width: number, height: number) => {
  const mesh = await createPlaneMesh(
    new Vector2(width, height),
    100,
    Color.white.darken(50),
    Texture.fromCustomFile({
      filename: '[stone]-concrete.jpg',
      sourcePath: 'textures',
    }),
  )
  return ArxMap.fromThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY })
}

const createWall = async (width: number, height: number) => {
  const mesh = await createPlaneMesh(
    new Vector2(width, height),
    100,
    Color.white.darken(50),
    Texture.fromCustomFile({
      filename: 'office-facade.jpg',
      sourcePath: 'projects/city/textures',
    }),
  )
  mesh.rotateX(MathUtils.degToRad(-90))
  scaleUV(new Vector2(0.1 / 1, 0.1 / (facadeRatio / 1)), mesh.geometry)
  applyTransformations(mesh)
  mesh.translateX(0)
  mesh.translateY(350)
  mesh.translateZ(400)
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
  map.meta.mapName = 'City'
  map.meta.seed = SEED
  map.config.offset = new Vector3(6000, 0, 6000)
  map.player.withScript()
  map.player.position.adjustToPlayerHeight()
  map.hud.hide('all')

  map.add(await createFloor(1000, 1000), true)

  map.add(await createWall(1000, 1000 * facadeRatio), true)

  const shape = new Shape()
  shape.lineTo(100, 0)
  shape.lineTo(100, 100)
  shape.lineTo(0, 100)
  shape.lineTo(0, 0)

  const geometry = new ShapeGeometry(shape)
  const edge = new EdgesGeometry(geometry)
  edge.rotateX(MathUtils.degToRad(90))
  edge.translate(0, 0, 0)

  map.zones.push(
    Zone.fromThreejsGeometry(edge, {
      name: 'sky changer',
      backgroundColor: Color.fromCSS('#7d94b7'),
    }),
  )

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}