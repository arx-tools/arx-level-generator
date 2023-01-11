import path from 'node:path'
import seedrandom from 'seedrandom'
import { ArxMap } from '@src/ArxMap'
import { Color } from '@src/Color'
import { Vector3 } from '@src/Vector3'
import { createPlaneMesh } from '@src/prefabs/mesh/plane'
import { Texture } from '@src/Texture'
import { applyTransformations, makeBumpy } from '@src/helpers'
import { DONT_QUADIFY } from '@src/Polygons'
import { BufferAttribute, MathUtils, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three'
import { ArxPolygonFlags } from 'arx-convert/types'

export default async () => {
  const {
    OUTPUTDIR = path.resolve(__dirname, './dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

  const map = new ArxMap()

  map.config.offset = new Vector3(4000, 0, 4000)
  map.player.position.adjustToPlayerHeight()
  map.hideMinimap()

  const plain = await createPlaneMesh(2000, 2000, Color.white, Texture.l1DragonGround08)
  plain.translateX(4000).translateZ(4000)
  makeBumpy(10, 40, plain)
  map.polygons.addThreeJsMesh(plain, DONT_QUADIFY)

  const skyTexture = await Texture.fromCustomFile({
    filename: 'winter-sky.jpg',
  })

  const geometry = new PlaneGeometry(2000, 1000, 20, 10)

  const uv = geometry.getAttribute('uv')
  const newUV = []
  for (let i = 0; i < uv.count; i++) {
    newUV.push(uv.array[i * uv.itemSize] * 1, uv.array[i * uv.itemSize + 1] * -0.5)
  }
  geometry.setAttribute('uv', new BufferAttribute(Float32Array.from(newUV), uv.itemSize))

  const material = new MeshBasicMaterial({
    color: Color.white.darken(30).getHex(),
    map: skyTexture,
  })

  const skyboxNorthWall = new Mesh(geometry, material)
  skyboxNorthWall.rotateY(MathUtils.degToRad(180))
  applyTransformations(skyboxNorthWall)
  skyboxNorthWall.translateX(4000).translateZ(5000).translateY(300)

  // ---------------

  const geometry2 = new PlaneGeometry(2000, 1000, 20, 10)

  const uv2 = geometry2.getAttribute('uv')
  const newUV2 = []
  for (let i = 0; i < uv2.count; i++) {
    newUV2.push(uv2.array[i * uv2.itemSize] * 1, uv2.array[i * uv2.itemSize + 1] * -0.5)
  }
  geometry2.setAttribute('uv', new BufferAttribute(Float32Array.from(newUV2), uv2.itemSize))

  const material2 = new MeshBasicMaterial({
    color: Color.white.darken(30).getHex(),
    map: skyTexture,
  })

  const skyboxSouthWall = new Mesh(geometry2, material2)
  applyTransformations(skyboxSouthWall)
  skyboxSouthWall.translateX(4000).translateZ(3000).translateY(300)

  map.polygons.addThreeJsMesh(skyboxNorthWall)
  map.polygons.addThreeJsMesh(skyboxSouthWall)

  map.polygons.forEach((polygon) => {
    polygon.flags |= ArxPolygonFlags.Tiled
  })

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
