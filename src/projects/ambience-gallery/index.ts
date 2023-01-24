import path from 'node:path'
import seedrandom from 'seedrandom'
import {
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
import { ambiences } from './constants'
import { DONT_QUADIFY } from '@src/Polygons'
import { makeBumpy } from '@tools/mesh/makeBumpy'
import { scaleUV } from '@tools/mesh/scaleUV'
import { translateUV } from '@tools/mesh/translateUV'
import { transformEdge } from '@tools/mesh/transformEdge'
import { randomBetween } from '@src/random'
import { applyTransformations } from '@src/helpers'

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
  const floorMesh = await createPlaneMesh(new Vector2(width, depth), 30, Color.white, Texture.l5CavesGravelGround05)
  floorMesh.translateX(width / 2 - 200)

  transformEdge(new Vector3(0, -5, 0), floorMesh)
  makeBumpy(12, 50, true, floorMesh.geometry)

  scaleUV(new Vector2(0.25, 0.25), floorMesh.geometry)

  return floorMesh
}

// TODO: turn this into 3 functions
const createStoneBlocks = (rowSize: number, depth: number) => {
  const size = new Vector3(100, 100, 100)

  const extrudeSettings = {
    steps: 1,
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
  scaleUV(new Vector2(1 / size.x, 1 / size.z), stoneBlockGeometry)
  translateUV(new Vector2(0.1, 0), stoneBlockGeometry)

  const zones: Zone[] = []
  const entities: Entity[] = []
  const meshes: Mesh[] = []

  for (let i = 0; i < ambiences.length; i += rowSize) {
    const slice = ambiences.slice(i, i + rowSize)
    for (let j = 0; j < slice.length; j++) {
      const pos = new Vector3((i / rowSize) * 300 + 100, 40, j * 300 - depth / 2 + 200)

      const ambience = ambiences[i + j]
      const zone = createZone(pos.clone(), size, ambience)
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
      stoneBlock.translateY(pos.y - extrudeSettings.depth)
      stoneBlock.translateZ(pos.z + (size.y - extrudeSettings.bevelSize))
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

export default async () => {
  const {
    OUTPUTDIR = path.resolve(__dirname, './dist'),
    LEVEL = '1',
    SEED = Math.floor(Math.random() * 1e20).toString(),
  } = process.env

  seedrandom(SEED, { global: true })
  console.log(`seed: ${SEED}`)

  const map = new ArxMap()

  map.config.offset = new Vector3(2000, 0, 2000)
  map.player.position.adjustToPlayerHeight()
  map.player.orientation.y = MathUtils.degToRad(-90)
  map.hideMinimap()

  const rowSize = 5

  const width = Math.ceil(ambiences.length / rowSize) * 300 + 400
  const depth = rowSize * 300 + 200

  const blocks = createStoneBlocks(rowSize, depth)
  const groundMesh = await createGround(width, depth)
  const mainZone = createZone(
    new Vector3(-200, 20, -depth / 2),
    new Vector3(width, 10, depth),
    Ambience.none,
    Color.fromCSS('#111'),
  )

  const zones: Zone[] = [...blocks.zones, mainZone]
  const entities: Entity[] = blocks.entities
  const meshes: Mesh[] = [...blocks.meshes, groundMesh]

  map.zones.push(...zones)
  map.entities.push(...entities)

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
