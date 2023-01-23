import path from 'node:path'
import seedrandom from 'seedrandom'
import {
  BufferAttribute,
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

const createZone = (pos: Vector3, size: Vector2, ambience: Ambience, height: number = Infinity) => {
  const shape = new Shape()
  shape.lineTo(size.x, 0)
  shape.lineTo(size.x, size.y)
  shape.lineTo(0, size.y)

  const geometry = new ShapeGeometry(shape)
  const edge = new EdgesGeometry(geometry)
  edge.rotateX(MathUtils.degToRad(90))
  edge.translate(pos.x, pos.y, pos.z)

  return Zone.fromThreejsGeometry(edge, {
    name: ambience.name,
    height,
    ambience,
  })
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
  const floorMesh = await createPlaneMesh(width, depth, Color.white, Texture.humanPaving1)
  floorMesh.translateX(width / 2 - 200)
  makeBumpy(5, 60, floorMesh)
  map.add(ArxMap.fromThreeJsMesh(floorMesh, DONT_QUADIFY), true)

  const position = new Vector3(-200, 10, -depth / 2)
  const mainZone = createZone(position, new Vector2(width, depth), Ambience.none, 10)
  mainZone.backgroundColor = Color.fromCSS('#111')
  map.zones.push(mainZone)

  for (let i = 0; i < ambiences.length; i += rowSize) {
    const slice = ambiences.slice(i, i + rowSize)
    for (let j = 0; j < slice.length; j++) {
      const ambience = ambiences[i + j]

      const pos = new Vector3((i / rowSize) * 300 + 100, 30, j * 300 - depth / 2 + 200)
      const size = new Vector2(100, 100)

      const zone = createZone(pos, size, ambience, 50)
      map.zones.push(zone)

      const marker = Entity.marker.withScript()
      marker.position = pos.clone().add(new Vector3(50, -30, 50))
      marker.script?.properties.push(new ControlZone(zone))
      marker.script?.on('controlledzone_enter', () => {
        return `herosay "${zone.name}"`
      })
      map.entities.push(marker)

      // --------------------------

      const extrudeSettings = {
        steps: 1,
        depth: 100,
        bevelEnabled: true,
        bevelThickness: 10,
        bevelSize: 10,
        bevelOffset: 0,
        bevelSegments: 1,
      }

      const shape = new Shape()
      shape.lineTo(size.x - extrudeSettings.bevelSize * 2, 0)
      shape.lineTo(size.x - extrudeSettings.bevelSize * 2, size.y - extrudeSettings.bevelSize * 2)
      shape.lineTo(0, size.y - extrudeSettings.bevelSize * 2)

      const tileGeometry = new ExtrudeGeometry(shape, extrudeSettings)
      scaleUV(new Vector2(1, 1), tileGeometry)

      const material = new MeshBasicMaterial({
        color: Color.white.getHex(),
        map: Texture.l2GobelCenter,
      })

      const mesh = new Mesh(tileGeometry, material)
      mesh.translateX(pos.x + extrudeSettings.bevelSize)
      mesh.translateY(pos.y - extrudeSettings.depth)
      mesh.translateZ(pos.z + (size.y - extrudeSettings.bevelSize))
      mesh.rotateX(MathUtils.degToRad(-90))

      // --------------------------

      map.add(ArxMap.fromThreeJsMesh(mesh, DONT_QUADIFY), true)
    }
  }

  map.finalize()

  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
