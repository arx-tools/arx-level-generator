import path from 'node:path'
import { ArxPolygonFlags } from 'arx-convert/types'
import seedrandom from 'seedrandom'
import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  CylinderGeometry,
  EdgesGeometry,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  Vector2,
} from 'three'
import { Ambience } from '@src/Ambience.js'
import { ArxMap } from '@src/ArxMap.js'
import { Audio } from '@src/Audio.js'
import { Color } from '@src/Color.js'
import { Entity } from '@src/Entity.js'
import { HudElements } from '@src/HUD.js'
import { Light } from '@src/Light.js'
import { Material } from '@src/Material.js'
import { DONT_QUADIFY, SHADING_SMOOTH } from '@src/Polygons.js'
import { Rotation } from '@src/Rotation.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { any, uniq } from '@src/faux-ramda.js'
import { applyTransformations } from '@src/helpers.js'
import { createPlaneMesh } from '@src/prefabs/mesh/plane.js'
import { randomBetween } from '@src/random.js'
import { makeBumpy } from '@src/tools/mesh/makeBumpy.js'
import { transformEdge } from '@src/tools/mesh/transformEdge.js'
import { TextureOrMaterial } from '@src/types.js'
import { createBox } from '@prefabs/mesh/box.js'
import { Speed } from '@scripting/properties/Speed.js'
import { createLight } from '@tools/createLight.js'
import { createZone } from '@tools/createZone.js'
import { getNonIndexedVertices, getVertices } from '@tools/mesh/getVertices.js'
import { scaleUV } from '@tools/mesh/scaleUV.js'
import { toArxCoordinateSystem } from '@tools/mesh/toArxCoordinateSystem.js'

type createTerrainProps = {
  size: Vector2 | number
  /**
   * default value is new Vector(0, 0, 0)
   */
  position?: Vector3
  /**
   * rotation on the Y axis in degrees
   *
   * default value is 0
   */
  angleY?: number
  /**
   * used internally by createBridge()
   *
   * when specified angleY gets ignored
   */
  _orientation?: Rotation
  /**
   * default value is true
   */
  hasBumps?: boolean
  /**
   * default value is true
   */
  hasLight?: boolean
  texture?: TextureOrMaterial
  /**
   * default value is true
   */
  hasCenterMarker?: boolean
  type: 'island' | 'bridge'
}

// -----------------------------

const complement = (fn: (...args: any[]) => boolean) => {
  return (...args: any[]) => !fn(...args)
}

const partition = <T>(fn: (arg: T) => boolean, values: T[]): [T[], T[]] => {
  return [values.filter(fn), values.filter(complement(fn))]
}

const countBy = <T>(fn: (value: T) => string, values: T[]) => {
  return values.reduce((acc, value) => {
    const key = fn(value)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
}

type HashAndAmount = [string, number]

const unpackCoords = (coords: HashAndAmount[]) => {
  return coords.map(([hash, amount]) => {
    const [x, y, z] = hash.split('|').map((x) => parseFloat(x))
    return new Vector3(x, y, z)
  })
}

/**
 * This function expects geometry to be triangulated, no quads or anything
 */
const categorizeVertices = (geometry: BufferGeometry) => {
  const polygons = getNonIndexedVertices(geometry)

  const summary = Object.entries(
    countBy(({ vector }) => `${vector.x}|${vector.y}|${vector.z}`, polygons),
  ) as HashAndAmount[]

  const [corner, edgeOrMiddle] = partition(([hash, amount]) => amount === 1 || amount === 2 || amount === 5, summary)
  const [edge, middle] = partition(([hash, amount]) => amount === 3, edgeOrMiddle)

  /*
  // TODO: for quadified meshes
  const [corner, edgeOrMiddle] = partition(([hash, amount]) => amount === 1 || amount === 3, summary)
  const [edge, middle] = partition(([hash, amount]) => amount === 2, edgeOrMiddle)
  */

  return {
    corners: unpackCoords(corner),
    edges: unpackCoords(edge),
    middles: unpackCoords(middle),
  }
}

// --------------------------

/**
 * Connect the edge vertices of "source" to the edge vertices of "target"
 */
const connectEdgeTo = (source: BufferGeometry, target: BufferGeometry) => {
  const categorizedSourceVertices = categorizeVertices(source)
  const sourceEdgeVertices = [...categorizedSourceVertices.edges, ...categorizedSourceVertices.corners]

  const sourceVertices = getVertices(source)
  const sourceCoords = source.getAttribute('position') as BufferAttribute

  const categorizedTargetVertices = categorizeVertices(target)
  const targetEdgeVertices = [...categorizedTargetVertices.edges, ...categorizedTargetVertices.corners]

  sourceVertices.forEach((vertex) => {
    const edgeIdx = sourceEdgeVertices.findIndex((edgeVertex) => {
      return edgeVertex.equals(vertex.vector)
    })
    if (edgeIdx !== -1) {
      const [edgePoint] = sourceEdgeVertices.splice(edgeIdx, 1)

      const closestTargetVertex = targetEdgeVertices.slice(1).reduce((closestSoFar, candidate) => {
        if (candidate.distanceTo(edgePoint) < closestSoFar.distanceTo(edgePoint)) {
          return candidate
        } else {
          return closestSoFar
        }
      }, targetEdgeVertices[0])

      sourceCoords.setX(vertex.idx, closestTargetVertex.x)
      sourceCoords.setY(vertex.idx, closestTargetVertex.y)
      sourceCoords.setZ(vertex.idx, closestTargetVertex.z)
    }
  })
}

const createTerrain = ({
  size,
  position = new Vector3(0, 0, 0),
  angleY = 0,
  _orientation,
  hasBumps = true,
  hasLight = true,
  hasCenterMarker = true,
  texture,
  type,
}: createTerrainProps) => {
  const meshes: Mesh[] = []
  const lights: Light[] = []
  const entities: Entity[] = []

  const t = texture ?? Texture.stoneHumanAkbaa2F

  if (type === 'island') {
    // -------------------------------

    const islandTop = createPlaneMesh({ size, texture: t })
    if (hasBumps) {
      transformEdge(new Vector3(0, 30, 0), islandTop)
      makeBumpy(20, 60, true, islandTop.geometry)
    }

    if (typeof _orientation !== 'undefined') {
      islandTop.geometry.rotateX(_orientation.x)
      islandTop.geometry.rotateY(_orientation.y)
      islandTop.geometry.rotateZ(_orientation.z)
    } else {
      islandTop.geometry.rotateY(MathUtils.degToRad(angleY))
    }

    islandTop.geometry.translate(position.x, position.y, position.z)

    // ---------------

    const islandBottom = createPlaneMesh({ size, texture: t })
    if (hasBumps) {
      makeBumpy([0, -100], 10, true, islandBottom.geometry)
      makeBumpy([0, -60], 40, true, islandBottom.geometry)
      makeBumpy([0, -20], 60, true, islandBottom.geometry)
    }

    if (typeof _orientation !== 'undefined') {
      // TODO: rotation needs to be reversed as the island bottom is flipped upside down
      islandBottom.geometry.rotateX(_orientation.x)
      islandBottom.geometry.rotateY(_orientation.y)
      islandBottom.geometry.rotateZ(_orientation.z)
    } else {
      islandBottom.geometry.rotateY(MathUtils.degToRad(-angleY))
    }

    // rotate it upside down
    islandBottom.geometry.rotateX(MathUtils.degToRad(180))

    islandBottom.geometry.translate(position.x, position.y + 85, position.z)

    // -------------------------------

    connectEdgeTo(islandBottom.geometry, islandTop.geometry)

    meshes.push(islandTop, islandBottom)
  } else {
    const s = typeof size === 'number' ? new Vector2(size, size) : size

    // TODO: rotate face textures
    // https://stackoverflow.com/a/50859810/1806628
    const bridge = createBox({
      position: new Vector3(0, 0, 0),
      size: new Vector3(s.x, 10, s.y),
      materials: t instanceof Texture ? Material.fromTexture(t) : t,
    })

    scaleUV(new Vector2(s.x / 100, s.y / 100), bridge.geometry)

    if (typeof _orientation !== 'undefined') {
      bridge.geometry.rotateX(_orientation.x)
      bridge.geometry.rotateY(_orientation.y)
      bridge.geometry.rotateZ(_orientation.z)
    } else {
      bridge.geometry.rotateY(MathUtils.degToRad(angleY))
    }

    bridge.geometry.translate(position.x, position.y, position.z)
    meshes.push(bridge)
  }

  if (hasLight) {
    let radius = typeof size === 'number' ? size : Math.max(size.x, size.y)
    radius *= 1.6
    const light = createLight({
      position: position.clone().add(new Vector3(0, -radius / 2, 0)),
      radius: radius,
      intensity: 0.5,
      color: Color.fromCSS('hsla(0, 64%, 83%, 1)'),
    })
    lights.push(light)
  }

  if (hasCenterMarker) {
    const centerMarker = Entity.mushroom
    centerMarker.position = position
    entities.push(centerMarker)
  }

  return {
    meshes,
    lights,
    entities,
  }
}

const getVectorRadians = (vec: Vector2) => {
  const tau = Math.PI * 2

  return (tau + Math.atan2(vec.y, vec.x)) % tau
}

const getSquarePolarRadius = (phi: number) => {
  const quarterPi = Math.PI / 4
  const halfPi = Math.PI / 2

  let phiInPiBy4Range = phi
  while (phiInPiBy4Range > quarterPi) {
    phiInPiBy4Range -= halfPi
  }

  while (phiInPiBy4Range < -quarterPi) {
    phiInPiBy4Range += halfPi
  }

  return 1 / Math.cos(phiInPiBy4Range)
}

const getIntersectionAtAngle = (origin: Vector2, rectangle: Vector2, alpha: number) => {
  const v = new Vector2((Math.cos(alpha) * rectangle.x) / 2, (Math.sin(alpha) * rectangle.y) / 2)
  return v.multiplyScalar(getSquarePolarRadius(alpha)).add(origin)
}

const bridgeBetween = (a: createTerrainProps, b: createTerrainProps): createTerrainProps => {
  const aSize = typeof a.size === 'number' ? new Vector2(a.size, a.size) : a.size
  const bSize = typeof b.size === 'number' ? new Vector2(b.size, b.size) : b.size

  const aPos = a.position?.clone() ?? new Vector3(0, 0, 0)
  const bPos = b.position?.clone() ?? new Vector3(0, 0, 0)

  const aAngle = MathUtils.degToRad(a.angleY ?? 0)
  const bAngle = MathUtils.degToRad(b.angleY ?? 0)

  // ----

  const a2b = bPos.clone().sub(aPos)
  const angleBetweenAandB = getVectorRadians(new Vector2(a2b.x, a2b.z))

  const aTargetVec2 = getIntersectionAtAngle(new Vector2(aPos.x, aPos.z), aSize, angleBetweenAandB + aAngle)
  const aTarget = new Vector3(aTargetVec2.x - aPos.x, 0, aTargetVec2.y - aPos.z)
  aTarget.applyEuler(new Rotation(0, aAngle, 0))
  aTarget.add(aPos)

  if (a.hasBumps ?? true) {
    aTarget.y += 30
  }

  // ----

  const b2a = aPos.clone().sub(bPos)
  const angleBetweenBandA = getVectorRadians(new Vector2(b2a.x, b2a.z))

  const bTargetVec2 = getIntersectionAtAngle(new Vector2(bPos.x, bPos.z), bSize, angleBetweenBandA + bAngle)
  const bTarget = new Vector3(bTargetVec2.x - bPos.x, 0, bTargetVec2.y - bPos.z)
  bTarget.applyEuler(new Rotation(0, bAngle, 0))
  bTarget.add(bPos)

  if (b.hasBumps ?? true) {
    bTarget.y += 30
  }

  // ----

  const a2bLength = bTarget.clone().sub(aTarget)
  const na2bLength = a2bLength.clone().normalize()

  const base = new Vector3(0, 0, 1)

  const quat = new Quaternion()
  quat.setFromUnitVectors(base, na2bLength)

  const rotation = new Rotation(0, 0, 0)
  rotation.setFromQuaternion(quat)

  rotation.z *= -1

  // ----

  return {
    size: new Vector2(100, a2bLength.length() + 50),
    position: aTarget.clone().add(a2bLength.clone().divideScalar(2)),
    _orientation: rotation,
    texture: Material.fromTexture(Texture.l4DwarfWoodBoard02, {
      flags: ArxPolygonFlags.DoubleSided,
    }),
    hasBumps: false,
    hasLight: false,
    hasCenterMarker: false,
    type: 'bridge',
  }
}

const getGeometryBoundingBox = (geometry: BufferGeometry) => {
  const bbox = new Box3()
  const vertices = getVertices(geometry)

  vertices.forEach(({ vector }) => {
    bbox.expandByPoint(vector)
  })

  return bbox
}

const createSpawnZone = (position: Vector3 = new Vector3(0, 0, 0)) => {
  return createZone({
    name: 'spawn',
    position,
    drawDistance: 4000,
    backgroundColor: Color.fromCSS('hsla(0, 64%, 23%, 1)'),
    ambience: Ambience.fromAudio(
      'loop_sirs',
      Audio.fromCustomFile({
        filename: 'loop_sirs.wav',
        sourcePath: 'projects/alias-nightmare/sfx',
      }),
    ),
  })
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
  map.meta.mapName = "Alia's nightmare"
  map.meta.seed = SEED
  map.config.offset = new Vector3(6000, 0, 6000)
  map.player.position.adjustToPlayerHeight()
  map.player.withScript()
  map.player.script?.properties.push(new Speed(2))
  map.hud.hide(HudElements.Minimap)

  // ----------------------

  const islands: createTerrainProps[] = [
    {
      size: 800,
      position: new Vector3(100, 0, 100),
      angleY: randomBetween(-20, 20),
      type: 'island',
    },
    {
      size: 500,
      position: new Vector3(0, -100, 1000),
      angleY: randomBetween(-20, 20),
      type: 'island',
    },
    {
      size: 700,
      position: new Vector3(-1000, -50, 700),
      angleY: randomBetween(-20, 20),
      type: 'island',
    },
    {
      size: 500,
      position: new Vector3(-30, -70, 3000),
      angleY: randomBetween(-20, 20),
      type: 'island',
    },
    {
      size: 600,
      position: new Vector3(1800, 300, 1000),
      angleY: randomBetween(-20, 20),
      type: 'island',
    },
    {
      size: 700,
      position: new Vector3(-2600, 0, 300),
      angleY: randomBetween(-20, 20),
      type: 'island',
    },
    {
      size: 300,
      position: new Vector3(-270, 300, -1570),
      angleY: randomBetween(-20, 20),
      type: 'island',
    },
    {
      size: 500,
      position: new Vector3(1400, -150, 2500),
      angleY: randomBetween(-20, 20),
      type: 'island',
    },
  ]

  const terrain = [
    createTerrain(islands[0]),
    createTerrain(islands[1]),
    createTerrain(islands[2]),
    createTerrain(islands[3]),
    createTerrain(islands[4]),
    createTerrain(islands[5]),
    createTerrain(islands[6]),
    createTerrain(islands[7]),
    createTerrain(bridgeBetween(islands[0], islands[1])),
    createTerrain(bridgeBetween(islands[1], islands[2])),
    createTerrain(bridgeBetween(islands[0], islands[2])),
    createTerrain(bridgeBetween(islands[1], islands[3])),
    createTerrain(bridgeBetween(islands[0], islands[4])),
    createTerrain(bridgeBetween(islands[2], islands[5])),
    createTerrain(bridgeBetween(islands[6], islands[0])),
    createTerrain(bridgeBetween(islands[7], islands[3])),
    createTerrain(bridgeBetween(islands[4], islands[7])),
  ]

  const boundingBoxes = terrain.flatMap(({ meshes }) => meshes).map((mesh) => getGeometryBoundingBox(mesh.geometry))

  for (let i = 0; i < 150; i++) {
    const size = new Vector2(5, 5000)

    let pos: Vector3
    let columnBBox: Box3

    do {
      pos = new Vector3(randomBetween(-4000, 4000), 0, randomBetween(-2000, 5000))
      columnBBox = new Box3(
        new Vector3(pos.x - size.x / 2, pos.y - size.y / 2, pos.z - size.x / 2),
        new Vector3(pos.x + size.x / 2, pos.y + size.y / 2, pos.z + size.x / 2),
      )
    } while (any((bbox) => bbox.intersectsBox(columnBBox), boundingBoxes))

    let geometry = new CylinderGeometry(size.x, size.x, size.y, 4, 4)
    geometry = toArxCoordinateSystem(geometry)

    scaleUV(new Vector2(size.x / 100, size.y / 100), geometry)

    const material = new MeshBasicMaterial({ map: Texture.stoneHumanAkbaa4F })
    const column = new Mesh(geometry, material)

    column.geometry.translate(pos.x, pos.y, pos.z)

    terrain.push({
      meshes: [column],
      lights: [],
      entities: [],
    })
  }

  terrain
    .flatMap(({ meshes }) => meshes)
    .forEach((mesh) => {
      applyTransformations(mesh)
      mesh.translateX(map.config.offset.x)
      mesh.translateY(map.config.offset.y)
      mesh.translateZ(map.config.offset.z)
      applyTransformations(mesh)
      map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_SMOOTH })
    })

  terrain.forEach(({ lights, entities }) => {
    map.lights.push(...lights)
    map.entities.push(...entities)
  })

  map.zones.push(createSpawnZone(new Vector3(0, 0, 0)))

  // ----------------------

  map.finalize()
  map.saveToDisk(OUTPUTDIR, parseInt(LEVEL))
}
