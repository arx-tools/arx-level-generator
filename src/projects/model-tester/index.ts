import { createPlaneMesh } from '@prefabs/mesh/plane.js'
import { ArxMap } from '@src/ArxMap.js'
import { Color } from '@src/Color.js'
import { Material } from '@src/Material.js'
import { DONT_QUADIFY, SHADING_SMOOTH } from '@src/Polygons.js'
import { Rotation } from '@src/Rotation.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { Zone } from '@src/Zone.js'
import { applyTransformations } from '@src/helpers.js'
import { createLight } from '@tools/createLight.js'
import { loadOBJ } from '@tools/mesh/loadOBJ.js'
import { ArxPolygonFlags } from 'arx-convert/types'
import path from 'node:path'
import seedrandom from 'seedrandom'
import { EdgesGeometry, MathUtils, Shape, ShapeGeometry, Vector2 } from 'three'

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

const createSpawnZone = () => {
  const shape = new Shape()
  shape.lineTo(100, 0)
  shape.lineTo(100, 100)
  shape.lineTo(0, 100)

  const geometry = new ShapeGeometry(shape)
  const edge = new EdgesGeometry(geometry)
  edge.rotateX(MathUtils.degToRad(90))

  const zone = Zone.fromThreejsGeometry(edge, {
    name: 'spawn',
    backgroundColor: Color.fromCSS('skyblue'),
  })

  return zone
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

  map.add(await createFloor(1000, 2000), true)

  const ceilingLamp = await loadOBJ('models/ceiling-lamp/ceiling-lamp', {
    position: new Vector3(0, 300, 500),
    scale: 50,
    scaleUV: 5,
    materialFlags: ArxPolygonFlags.Glow,
  })

  const fountain = await loadOBJ('models/fountain/fountain', {
    position: new Vector3(0, 3, 500),
    scale: 2,
    scaleUV: new Vector2(1, -1),
  })

  const tree = await loadOBJ('models/tree/tree', {
    position: new Vector3(300, 0, 800),
    scale: 30,
    fallbackTexture: Texture.l2TrollWoodPillar08,
  })

  const ladder = await loadOBJ('models/ladder/ladder', {
    position: new Vector3(300, 100, 740),
    scale: 10,
    rotation: new Rotation(MathUtils.degToRad(-70), 0, 0),
    scaleUV: new Vector2(1, -1),
  })

  const cableDrum = await loadOBJ('models/cable-drum/cable-drum', {
    position: new Vector3(-200, 15, 600),
    scale: 10,
  })

  const teddy = await loadOBJ('models/teddy-bear/teddy-bear', {
    position: new Vector3(-175, 150, 600),
    scale: 10,
    rotation: new Rotation(0, 0, MathUtils.degToRad(30)),
  })

  const megaphone = await loadOBJ('models/megaphone/megaphone', {
    position: new Vector3(0, 100, 700),
    scale: 20,
  })

  const speaker = await loadOBJ('models/speaker/speaker', {
    position: new Vector3(-310, 50, 850),
    scale: 10,
  })

  const pole = await loadOBJ('models/pole/pole', {
    position: new Vector3(-200, 50, 850),
    scale: 10,
    materialFlags: ArxPolygonFlags.None,
  })

  const area51Shaft = await loadOBJ('models/area51-shaft/area51-shaft', {
    position: new Vector3(-1230, -150, -1100),
    scale: 40,
    rotation: new Rotation(0, MathUtils.degToRad(180), 0),
    fallbackTexture: await Texture.fromCustomFile({
      filename: '[stone]-concrete.jpg',
      sourcePath: 'textures',
    }),
  })

  const importedModels = [teddy, tree, cableDrum, ceilingLamp, fountain, ladder, megaphone, speaker, pole, area51Shaft]

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
