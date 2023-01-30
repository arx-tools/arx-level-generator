import path from 'node:path'
import seedrandom from 'seedrandom'
import {
  CircleGeometry,
  EdgesGeometry,
  ExtrudeGeometry,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Shape,
  ShapeGeometry,
  Vector2,
} from 'three'
import { Ambience } from '@src/Ambience'
import { ArxMap } from '@src/ArxMap'
import { Color } from '@src/Color'
import { Entity } from '@src/Entity'
import { createPlaneMesh } from '@src/prefabs/mesh/plane'
import { Texture } from '@src/Texture'
import { Vector3 } from '@src/Vector3'
import { Zone } from '@src/Zone'
import { ControlZone } from '@src/scripting/properties/ControlZone'
import { ambiences } from '@projects/ambience-gallery/constants'
import { DONT_QUADIFY } from '@src/Polygons'
import { makeBumpy } from '@tools/mesh/makeBumpy'
import { scaleUV } from '@tools/mesh/scaleUV'
import { translateUV } from '@tools/mesh/translateUV'
import { transformEdge } from '@tools/mesh/transformEdge'
import { randomBetween } from '@src/random'
import { applyTransformations } from '@src/helpers'
import { Light } from '@src/Light'
import { HudElements } from '@src/HUD'

const createZone = (pos: Vector3, size: Vector3, ambience: Ambience, color?: Color) => {
  const shape = new Shape()
  shape.lineTo(size.x, 0)
  shape.lineTo(size.x, size.z)
  shape.lineTo(0, size.z)

  const geometry = new ShapeGeometry(shape)
  const edge = new EdgesGeometry(geometry)
  edge.rotateX(MathUtils.degToRad(90))
  edge.translate(pos.x, pos.y, pos.z)

  return Zone.fromThreejsGeometry(edge, {
    name: ambience.name,
    height: size.y,
    ambience,
    backgroundColor: color,
  })
}

const createGround = async (width: number, depth: number) => {
  const floorMesh = await createPlaneMesh(
    new Vector2(width + 200, depth + 200),
    30,
    Color.white,
    Texture.l5CavesGravelGround05,
  )
  floorMesh.translateX(width / 2 - 200)

  transformEdge(new Vector3(0, -5, 0), floorMesh)
  makeBumpy(12, 50, true, floorMesh.geometry)

  scaleUV(new Vector2(0.25, 0.25), floorMesh.geometry)

  return floorMesh
}

const createNorthWall = async (width: number) => {
  const wallSize = new Vector2(width, 200)
  const wallMesh = await createPlaneMesh(wallSize, 100, Color.white.darken(50), Texture.l1DragonSpideLime1Nocol)
  wallMesh.translateX(wallSize.x / 2 - 200)
  wallMesh.translateY(wallSize.y / 2 - 15)
  wallMesh.translateZ(800 + 50 + 8)
  wallMesh.rotateX(MathUtils.degToRad(90 + 5))
  wallMesh.rotateZ(MathUtils.degToRad(180))
  scaleUV(new Vector2(100 / wallSize.y, 100 / wallSize.y), wallMesh.geometry)
  translateUV(new Vector2(0, -1 / (wallMesh.material.map as Texture).height), wallMesh.geometry)

  const blockerSize = new Vector2(width, 300)
  const blockerMesh = await createPlaneMesh(blockerSize, 100, Color.white.darken(50), Texture.alpha)
  blockerMesh.translateX(blockerSize.x / 2 - 200)
  blockerMesh.translateY(blockerSize.y / 2 - 15)
  blockerMesh.translateZ(800 + 50)
  blockerMesh.rotateX(MathUtils.degToRad(90))
  blockerMesh.rotateZ(MathUtils.degToRad(180))

  return [wallMesh, blockerMesh]
}

const createSouthWall = async (width: number) => {
  const [wallMesh, blockerMesh] = await createNorthWall(width)

  applyTransformations(wallMesh)
  wallMesh.translateX(2700)
  wallMesh.rotateY(MathUtils.degToRad(180))

  applyTransformations(blockerMesh)
  blockerMesh.translateX(2700)
  blockerMesh.rotateY(MathUtils.degToRad(180))

  return [wallMesh, blockerMesh]
}

const createEastWall = async (width: number) => {
  const [wallMesh, blockerMesh] = await createNorthWall(width)

  applyTransformations(wallMesh)
  wallMesh.translateX(650)
  wallMesh.translateZ(-width / 2 + 200)
  wallMesh.rotateY(MathUtils.degToRad(-90))

  applyTransformations(blockerMesh)
  blockerMesh.translateX(650)
  blockerMesh.translateZ(-width / 2 + 200)
  blockerMesh.rotateY(MathUtils.degToRad(-90))

  return [wallMesh, blockerMesh]
}

const createWestWall = async (width: number) => {
  const [wallMesh, blockerMesh] = await createNorthWall(width)

  applyTransformations(wallMesh)
  wallMesh.translateZ(650)
  wallMesh.translateX(width + 350)
  wallMesh.rotateY(MathUtils.degToRad(90))

  applyTransformations(blockerMesh)
  blockerMesh.translateZ(650)
  blockerMesh.translateX(width + 350)
  blockerMesh.rotateY(MathUtils.degToRad(90))

  return [wallMesh, blockerMesh]
}

const createNWCorner = async () => {
  const size = new Vector3(50, 400, 50)

  const extrudeSettings = {
    steps: size.y / 100,
    depth: size.y,
    bevelEnabled: false,
    bevelThickness: 0,
    bevelSize: 0,
    bevelOffset: 0,
    bevelSegments: 0,
  }

  const shape = new Shape()
  shape.lineTo(size.x - extrudeSettings.bevelSize * 2, 0)
  shape.lineTo(size.x - extrudeSettings.bevelSize * 2, size.z - extrudeSettings.bevelSize * 2)
  shape.lineTo(0, size.z - extrudeSettings.bevelSize * 2)

  const material = new MeshBasicMaterial({
    color: Color.white.darken(50).getHex(),
    map: Texture.stoneHumanAkbaa2F,
  })

  const stoneBlockGeometry = new ExtrudeGeometry(shape, extrudeSettings)
  scaleUV(new Vector2(0.5 / size.x, 0.5 / size.x), stoneBlockGeometry)

  const pos = new Vector3(-200 - size.x / 2, -50, 800 + size.z / 2 + 50)

  const mesh = new Mesh(stoneBlockGeometry.clone(), material)
  mesh.translateX(pos.x + extrudeSettings.bevelSize)
  mesh.translateY(pos.y)
  mesh.translateZ(pos.z + extrudeSettings.bevelSize)
  mesh.rotateX(MathUtils.degToRad(-90))
  return mesh
}

const createSWCorner = async () => {
  const mesh = await createNWCorner()
  applyTransformations(mesh)
  mesh.translateZ(-1600 - 100)
  return mesh
}

const createNECorner = async () => {
  const mesh = await createNWCorner()
  applyTransformations(mesh)
  mesh.translateX(3100)
  return mesh
}

const createSECorner = async () => {
  const mesh = await createNWCorner()
  applyTransformations(mesh)
  mesh.translateZ(-1600 - 100)
  mesh.translateX(3100)
  return mesh
}

// TODO: turn this into 3 functions
const createStoneBlocks = (rowSize: number, depth: number) => {
  const size = new Vector3(80, 100, 80)

  const extrudeSettings = {
    steps: size.y / 100,
    depth: size.y,
    bevelEnabled: true,
    bevelThickness: 10,
    bevelSize: 10,
    bevelOffset: 0,
    bevelSegments: 1,
  }

  const shape = new Shape()
  shape.lineTo(size.x - extrudeSettings.bevelSize * 2, 0)
  shape.lineTo(size.x - extrudeSettings.bevelSize * 2, size.z - extrudeSettings.bevelSize * 2)
  shape.lineTo(0, size.z - extrudeSettings.bevelSize * 2)

  const material = new MeshBasicMaterial({
    color: Color.white.darken(50).getHex(),
    map: Texture.l4YlsideStoneGround01,
  })

  const stoneBlockGeometry = new ExtrudeGeometry(shape, extrudeSettings)
  scaleUV(
    new Vector2(1 / (size.x + extrudeSettings.bevelSize * 2), 1 / (size.z + extrudeSettings.bevelSize * 2)),
    stoneBlockGeometry,
  )
  translateUV(new Vector2(0.1, 0), stoneBlockGeometry)

  const zones: Zone[] = []
  const entities: Entity[] = []
  const meshes: Mesh[] = []

  for (let i = 0; i < ambiences.length; i += rowSize) {
    const slice = ambiences.slice(i, i + rowSize)
    for (let j = 0; j < slice.length; j++) {
      const pos = new Vector3((i / rowSize) * 300 + 100, 40, j * 300 - depth / 2 + 200)
      const heightOffset = randomBetween(-5, 15)

      const ambience = ambiences[i + j]
      const zone = createZone(
        pos.clone().add(new Vector3(0, heightOffset, extrudeSettings.bevelSize * 2)),
        size,
        ambience,
      )
      zones.push(zone)

      const marker = Entity.marker.withScript()
      marker.position = pos.clone().add(new Vector3(50, -30, 50))
      marker.script?.properties.push(new ControlZone(zone))
      marker.script?.on('controlledzone_enter', () => {
        return `herosay "${zone.name}"`
      })
      entities.push(marker)

      const stoneBlock = new Mesh(stoneBlockGeometry.clone(), material)
      stoneBlock.translateX(pos.x + extrudeSettings.bevelSize)
      stoneBlock.translateY(pos.y - extrudeSettings.depth + heightOffset)
      stoneBlock.translateZ(pos.z + (100 - extrudeSettings.bevelSize))
      stoneBlock.rotateX(MathUtils.degToRad(-90 + randomBetween(-5, 5)))
      stoneBlock.rotateY(MathUtils.degToRad(randomBetween(-5, 5)))
      meshes.push(stoneBlock)
    }
  }

  return {
    zones,
    entities,
    meshes,
  }
}

const createLight = (position: Vector3, color: Color, type: 'main' | 'small') => {
  const config = {
    color,
    position,
    fallStart: 0,
    fallEnd: 0,
    intensity: 1,
    lightData: {
      exFlicker: Color.transparent,
      exRadius: 0,
      exFrequency: 0,
      exSize: 0,
      exSpeed: 0,
      exFlareSize: 0,
    },
  }

  if (type === 'main') {
    config.fallStart = 100
    config.fallEnd = 3500
  } else {
    config.fallStart = 10
    config.fallEnd = 500
  }

  return new Light(config)
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

  map.config.offset = new Vector3(2000, 0, 2000)
  map.player.position.adjustToPlayerHeight()
  map.player.orientation.y = MathUtils.degToRad(-90)
  map.hud.hide(HudElements.Minimap)
  map.hud.hide(HudElements.Healthbar)
  map.hud.hide(HudElements.Manabar)
  map.hud.hide(HudElements.LevelUpIcon)
  map.hud.hide(HudElements.BookIcon)
  map.hud.hide(HudElements.BackpackIcon)
  map.hud.hide(HudElements.PurseIcon)

  const rowSize = 5

  const width = Math.ceil(ambiences.length / rowSize) * 300 + 400
  const depth = rowSize * 300 + 200

  const blocks = createStoneBlocks(rowSize, depth)
  const northWall = await createNorthWall(3100)
  const southWall = await createSouthWall(3100)
  const eastWall = await createEastWall(1700)
  const westWall = await createWestWall(1700)
  const nortWestCorner = await createNWCorner()
  const southWestCorner = await createSWCorner()
  const northEastCorner = await createNECorner()
  const southEastCorner = await createSECorner()
  const groundMesh = await createGround(width, depth)
  const mainZone = createZone(
    new Vector3(-200, 20, -depth / 2),
    new Vector3(width, 10, depth),
    Ambience.none,
    Color.fromCSS('#111'),
  )
  const mainLight = createLight(new Vector3(-200 + width / 2, -1000, 0), Color.white.darken(40), 'main')
  const light1 = createLight(new Vector3(200, -300, 600), Color.white.darken(50), 'small')
  const light2 = createLight(new Vector3(100, -300, 0), Color.white.darken(50), 'small')
  const light3 = createLight(new Vector3(200, -300, -600), Color.white.darken(50), 'small')
  const light4 = createLight(new Vector3(width - 650, -300, 600), Color.white.darken(50), 'small')
  const light5 = createLight(new Vector3(width - 550, -300, 0), Color.white.darken(50), 'small')
  const light6 = createLight(new Vector3(width - 650, -300, -600), Color.white.darken(50), 'small')

  const zones: Zone[] = [...blocks.zones, mainZone]
  const entities: Entity[] = blocks.entities
  const lights: Light[] = [mainLight, light1, light2, light3, light4, light5, light6]
  const meshes: Mesh[] = [
    ...blocks.meshes,
    groundMesh,
    ...northWall,
    ...southWall,
    ...eastWall,
    ...westWall,
    nortWestCorner,
    southWestCorner,
    northEastCorner,
    southEastCorner,
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
    map.polygons.addThreeJsMesh(mesh, DONT_QUADIFY)
  })

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
