import path from 'node:path'
import { ArxPolygonFlags } from 'arx-convert/types'
import seedrandom from 'seedrandom'
import { CylinderGeometry, MathUtils, Mesh, MeshBasicMaterial, Quaternion, Vector2 } from 'three'
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
import { applyTransformations } from '@src/helpers.js'
import { createPlaneMesh } from '@src/prefabs/mesh/plane.js'
import { randomBetween } from '@src/random.js'
import { makeBumpy } from '@src/tools/mesh/makeBumpy.js'
import { transformEdge } from '@src/tools/mesh/transformEdge.js'
import { TextureOrMaterial } from '@src/types.js'
import { createLight } from '@tools/createLight.js'
import { createZone } from '@tools/createZone.js'
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
}: createTerrainProps) => {
  const meshes: Mesh[] = []
  const lights: Light[] = []
  const entities: Entity[] = []

  const floorMesh = createPlaneMesh({ size, texture: texture ?? Texture.stoneHumanAkbaa2F })
  if (hasBumps) {
    transformEdge(new Vector3(0, 30, 0), floorMesh)
    makeBumpy(10, 60, false, floorMesh.geometry)
  }

  if (typeof _orientation !== 'undefined') {
    floorMesh.geometry.rotateX(_orientation.x)
    floorMesh.geometry.rotateY(_orientation.y)
    floorMesh.geometry.rotateZ(_orientation.z)
  } else {
    floorMesh.geometry.rotateY(MathUtils.degToRad(angleY))
  }

  floorMesh.geometry.translate(position.x, position.y, position.z)
  meshes.push(floorMesh)

  if (hasLight) {
    const radius = typeof size === 'number' ? size : Math.max(size.x, size.y)
    const light = createLight({
      position: position.clone().add(new Vector3(0, -radius / 2, 0)),
      radius: radius,
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

// ------------------------

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

// ----------------

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

  // ---------------------------

  const a2bLength = bTarget.clone().sub(aTarget)
  const na2bLength = a2bLength.clone().normalize()

  const base = new Vector3(0, 0, 1)

  const quat = new Quaternion()
  quat.setFromUnitVectors(base, na2bLength)

  const rotation = new Rotation(0, 0, 0)
  rotation.setFromQuaternion(quat)

  rotation.z *= -1

  // ---------------------------

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
  }
}

const createSpawnZone = (position: Vector3 = new Vector3(0, 0, 0)) => {
  return createZone({
    name: 'spawn',
    position,
    drawDistance: 4000,
    backgroundColor: Color.fromCSS('hsla(0, 64%, 8%, 1)'),
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
  map.hud.hide(HudElements.Minimap)

  // ----------------------

  const islands: createTerrainProps[] = [
    {
      size: 800,
      position: new Vector3(100, 0, 100),
      angleY: randomBetween(-20, 20),
    },
    {
      size: 500,
      position: new Vector3(0, -100, 1000),
      angleY: randomBetween(-20, 20),
    },
    {
      size: 700,
      position: new Vector3(-1000, -50, 700),
      angleY: randomBetween(-20, 20),
    },
    {
      size: 500,
      position: new Vector3(-30, -70, 3000),
      angleY: randomBetween(-20, 20),
    },
    {
      size: 600,
      position: new Vector3(1800, 300, 1000),
      angleY: randomBetween(-20, 20),
    },
    {
      size: 700,
      position: new Vector3(-2600, 0, 300),
      angleY: randomBetween(-20, 20),
    },
  ]

  const terrain = [
    createTerrain(islands[0]),
    createTerrain(islands[1]),
    createTerrain(islands[2]),
    createTerrain(islands[3]),
    createTerrain(islands[4]),
    createTerrain(islands[5]),
    createTerrain(bridgeBetween(islands[0], islands[1])),
    createTerrain(bridgeBetween(islands[1], islands[2])),
    createTerrain(bridgeBetween(islands[0], islands[2])),
    createTerrain(bridgeBetween(islands[1], islands[3])),
    createTerrain(bridgeBetween(islands[0], islands[4])),
    createTerrain(bridgeBetween(islands[2], islands[5])),
  ]

  for (let i = 0; i < 80; i++) {
    const pos = new Vector3(randomBetween(-3000, 3000), 0, randomBetween(-3000, 3000))
    const size = new Vector2(5, 5000)

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
