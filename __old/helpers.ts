import fs from 'fs'
import rgba from 'color-rgba'
import { createTextureContainers, textures, exportTextures, resetTextures, TextureDefinition } from './assets/textures'
import {
  createDlfData,
  createFtsData,
  createLlfData,
  DlfData,
  FtsData,
  FtsPolygon,
  LightData,
  LlfData,
  ZoneData,
} from './blankMap'
import { countBy, partition, clone, min } from './faux-ramda'
import {
  POLY_QUAD,
  MAP_MAX_HEIGHT,
  MAP_MAX_WIDTH,
  POLY_NODRAW,
  PLAYER_HEIGHT_ADJUSTMENT,
  PATH_RGB,
  PATH_AMBIANCE,
  PATH_FARCLIP,
} from './constants'
import { exportUsedItems, exportScripts, exportDependencies, resetItems } from './assets/items'
import { ambiences, exportAmbiences, useAmbience, resetAmbiences, AmbienceDefinition } from './assets/ambiences'
import { dirname, resolve } from 'path'
import {
  AbsoluteCoords,
  MapConfig,
  Polygon,
  PosVertex3,
  RelativeCoords,
  RgbaBytes,
  UVQuad,
  Vector3,
  Vertex3,
} from './types'
import { exportTranslations, resetTranslations } from './assets/i18n'
import { Euler, Vector3 as ThreeJsVector3 } from 'three'
import { ArxColor } from 'arx-level-json-converter/dist/common/Color'

export type MapData = {
  meta: {
    createdAt: string
    generatorVersion: string
    mapName?: string
  }
  config: MapConfig
  state: {
    color: RgbaBytes
    texture: TextureDefinition | null
    spawn: Vector3
    spawnAngle: number
    vertexCounter: number
    polygonGroup: string
  }
  items: any[] // TODO
  dlf: DlfData
  fts: FtsData
  llf: LlfData
}

export type FinalizedMapData = Record<string, any> // TODO

export const normalize = (vector: Vector3): Vector3 => {
  const [x, y, z] = vector
  const mag = magnitude(vector)
  return [x / mag, y / mag, z / mag]
}

export const move = (x: number, y: number, z: number, vector: Vector3): Vector3 => {
  const [vx, vy, vz] = vector
  return [vx + x, vy + y, vz + z]
}

export const addCoords = (
  a: RelativeCoords | AbsoluteCoords,
  b: RelativeCoords | AbsoluteCoords,
): RelativeCoords | AbsoluteCoords => {
  if (a.type !== b.type) {
    throw new Error('Incompatible coords')
  }

  return {
    type: a.type,
    coords: [a.coords[0] + b.coords[0], a.coords[1] + b.coords[1], a.coords[2] + b.coords[2]],
  }
}

// "#ff07a4" -> { r: [0..255], g: [0..255], b: [0..255], a: [0..255] }
export const toRgba = (cssColor: string): RgbaBytes => {
  const color = rgba(cssColor)

  if (color === undefined) {
    return { r: 255, g: 255, b: 255, a: 255 }
  }

  const [r, g, b, a] = color

  return {
    r,
    g,
    b,
    a: Math.round(255 * a),
  }
}

export const toArxColor = (color: RgbaBytes): ArxColor => {
  const { r, g, b, a } = color
  return { r, g, b, a }
}

export const movePlayerTo = (pos: RelativeCoords, mapData: MapData) => {
  mapData.state.spawn = pos.coords
  return mapData
}

const getCellCoords = (isQuad: boolean, vertices: PosVertex3[]) => {
  const v = vertices.slice(0, isQuad ? 4 : 3)

  const x = Math.round(min(v.map(({ x }) => x)))
  const z = Math.round(min(v.map(({ z }) => z)))

  const cellX = Math.floor(x / 100)
  const cellZ = Math.floor(z / 100) + 1

  return [cellX, cellZ]
}

const generateLights = (mapData: FinalizedMapData) => {
  let colorIdx = 0

  const colors: RgbaBytes[] = []
  const polygons: FtsPolygon[] = mapData.fts.polygons

  const cells = polygons.reduce(
    (acc, { vertices, config }: { vertices: PosVertex3[]; config: Record<string, any> }, idx) => {
      const [x, z] = getCellCoords(config.isQuad, vertices)

      if (!acc[`${z}-${x}`]) {
        acc[`${z}-${x}`] = [idx]
      } else {
        acc[`${z}-${x}`].push(idx)
      }

      return acc
    },
    {} as Record<string, number[]>,
  )

  for (let z = 0; z < MAP_MAX_HEIGHT; z++) {
    for (let x = 0; x < MAP_MAX_WIDTH; x++) {
      const cell = cells[`${z}-${x}`]
      if (cell) {
        cell.forEach((idx) => {
          const { config, vertices } = polygons[idx]
          let { color, isQuad } = config

          colors.push(color, color, color)
          vertices[0].llfColorIdx = colorIdx++
          vertices[1].llfColorIdx = colorIdx++
          vertices[2].llfColorIdx = colorIdx++

          if (isQuad) {
            colors.push(color)
            vertices[3].llfColorIdx = colorIdx++
          }
        })
      }
    }
  }

  mapData.llf.colors = colors
}

export const posVertexToVector = ({ x, y, z }: PosVertex3): Vector3 => {
  return [x, y, z]
}

const vectorToXYZ = ([x, y, z]: Vector3): Vertex3 => {
  return { x, y, z }
}

export const calculateNormal = ([a, b, c]: Vector3[]) => {
  return vectorToXYZ(normalize(cross(subtractVec3(b, a), subtractVec3(c, a))))
}

export const finalize = (mapData: MapData) => {
  const finalizedMapData: FinalizedMapData = clone(mapData)

  const ungroupedPolygons = Object.values(mapData.fts.polygons).flat(1)
  const numberOfPolygons = ungroupedPolygons.length

  finalizedMapData.fts.polygons = ungroupedPolygons
  finalizedMapData.dlf.header.numberOfBackgroundPolygons = numberOfPolygons
  finalizedMapData.llf.header.numberOfBackgroundPolygons = numberOfPolygons

  const { spawn, spawnAngle } = mapData.state

  const [x, y, z] = move(0, PLAYER_HEIGHT_ADJUSTMENT, 0, move(...mapData.config.origin.coords, spawn))
  finalizedMapData.fts.sceneHeader.mScenePosition = { x, y, z }

  finalizedMapData.llf.lights.forEach((light: LightData) => {
    light.pos.x -= spawn[0]
    light.pos.y -= spawn[1] + PLAYER_HEIGHT_ADJUSTMENT
    light.pos.z -= spawn[2]
  })

  finalizedMapData.dlf.paths.forEach((zone: ZoneData) => {
    zone.header.initPos.x -= spawn[0]
    zone.header.initPos.y -= spawn[1] + PLAYER_HEIGHT_ADJUSTMENT
    zone.header.initPos.z -= spawn[2]

    zone.header.pos.x -= spawn[0]
    zone.header.pos.y -= spawn[1] + PLAYER_HEIGHT_ADJUSTMENT
    zone.header.pos.z -= spawn[2]
  })

  finalizedMapData.dlf.header.angleEdit.b = normalizeDegree(spawnAngle)

  createTextureContainers(finalizedMapData)
  exportUsedItems(finalizedMapData)
  calculateNormals(finalizedMapData)
  generateLights(finalizedMapData)

  return finalizedMapData
}

const addOriginPolygon = (mapData: MapData) => {
  mapData.fts.polygons.global.push({
    config: {
      color: toRgba('black'),
      isQuad: true,
      bumpable: false,
    },
    vertices: [
      { x: 0, y: 0, z: 0, u: 0, v: 0 },
      { x: 1, y: 0, z: 0, u: 0, v: 1 },
      { x: 0, y: 0, z: 1, u: 1, v: 0 },
      { x: 1, y: 0, z: 1, u: 1, v: 1 },
    ],
    tex: 0, // no texture at all!
    transval: 0,
    area: 1,
    type: POLY_QUAD | POLY_NODRAW,
    room: 1,
    paddy: 0,
  })
}

const timestampToDate = (timestamp: number) => {
  const date = new Date()
  date.setTime(timestamp * 1000)
  return date.toUTCString()
}

export const generateBlankMapData = (config: MapConfig) => {
  const now = Math.floor(Date.now() / 1000)
  const generatorVersion = require('../package.json').version as string

  const mapData: MapData = {
    meta: {
      createdAt: timestampToDate(now),
      generatorVersion,
    },
    config: {
      ...config,
    },
    state: {
      color: toRgba('white'),
      texture: textures.none,
      spawn: [0, 0, 0],
      spawnAngle: 0,
      vertexCounter: 0,
      polygonGroup: 'global',
    },
    items: [],
    dlf: createDlfData(config.levelIdx, now),
    fts: createFtsData(config.levelIdx),
    llf: createLlfData(now),
  }

  addOriginPolygon(mapData)

  return mapData
}

export const saveToDisk = async (finalizedMapData: FinalizedMapData) => {
  const { levelIdx } = finalizedMapData.config
  const defaultOutputDir = resolve('./dist')

  const outputDir = process.env.OUTPUTDIR ?? finalizedMapData.config.outputDir ?? defaultOutputDir

  console.log('output directory:', outputDir)

  if (outputDir === defaultOutputDir) {
    try {
      await fs.promises.rm('dist', { recursive: true })
    } catch (e) {}
  } else {
    await uninstall(outputDir)
  }

  let scripts = exportScripts(outputDir)
  let textures = exportTextures(outputDir)
  let ambiences = exportAmbiences(outputDir)
  let translations = exportTranslations(outputDir)
  let dependencies = await exportDependencies(outputDir)

  const files = {
    fts: `${outputDir}/game/graph/levels/level${levelIdx}/fast.fts.json`,
    dlf: `${outputDir}/graph/levels/level${levelIdx}/level${levelIdx}.dlf.json`,
    llf: `${outputDir}/graph/levels/level${levelIdx}/level${levelIdx}.llf.json`,
  }

  const manifest = {
    meta: finalizedMapData.meta,
    config: finalizedMapData.config,
    files: [
      ...Object.values(files),
      ...Object.keys(scripts),
      ...Object.keys(ambiences),
      ...Object.keys(dependencies),
      ...Object.keys(textures),
      ...Object.keys(translations),
      files.fts.replace('.fts.json', '.fts'),
      files.dlf.replace('.dlf.json', '.dlf'),
      files.llf.replace('.llf.json', '.llf'),
    ].sort(),
  }

  const tasks = manifest.files.map((path) => {
    return fs.promises.mkdir(dirname(path), { recursive: true })
  })

  for (let task of tasks) {
    await task
  }

  // ------------

  for (let [filename, script] of Object.entries(scripts)) {
    script = latin9ToLatin1(script)
    await fs.promises.writeFile(filename, script, 'latin1')
  }

  for (let [filename, translation] of Object.entries(translations)) {
    await fs.promises.writeFile(
      filename,
      `// ${finalizedMapData.meta.mapName} - Arx Level Generator ${finalizedMapData.meta.generatorVersion}

${translation}`,
      'utf8',
    )
  }

  // ------------

  const ambiencesPairs = Object.entries(ambiences)
  const dependenciesPairs = Object.entries(dependencies)
  const texturesPairs = Object.entries(textures)

  for (let [target, source] of [...ambiencesPairs, ...dependenciesPairs, ...texturesPairs]) {
    await fs.promises.copyFile(source, target)
  }

  // ------------

  await fs.promises.writeFile(files.dlf, JSON.stringify(finalizedMapData.dlf))
  await fs.promises.writeFile(files.fts, JSON.stringify(finalizedMapData.fts))
  await fs.promises.writeFile(files.llf, JSON.stringify(finalizedMapData.llf))

  await fs.promises.writeFile(`${outputDir}/manifest.json`, JSON.stringify(manifest, null, 2))
}

export const setColor = (color: string, mapData: MapData) => {
  mapData.state.color = toRgba(color)
}

export const setTexture = (texture: TextureDefinition | null, mapData: MapData) => {
  mapData.state.texture = clone(texture)
}

export const setPolygonGroup = (group: string, mapData: MapData) => {
  mapData.state.polygonGroup = group
}

export const unsetPolygonGroup = (mapData: MapData) => {
  mapData.state.polygonGroup = 'global'
}

const unpackCoords = (coords: [string, number][]) => {
  return coords.map(([hash, amount]) => {
    const [x, y, z] = hash.split('|').map((x) => parseInt(x))
    return { x, y, z } as PosVertex3
  })
}

export const categorizeVertices = (polygons: FtsPolygon[]) => {
  const vertices = polygons.flatMap(({ vertices }) => {
    return vertices.flatMap((vertex) => {
      return clone(vertex)
    })
  })

  const summary = countBy(({ x, y, z }) => `${x}|${y}|${z}`, vertices)

  const [corner, tmp] = partition(
    ([hash, amount]: [string, number]) => amount === 1 || amount === 3,
    Object.entries(summary),
  )

  const [edge, middle] = partition(([hash, amount]: [string, number]) => amount === 2, tmp)

  return {
    corners: unpackCoords(corner),
    edges: unpackCoords(edge),
    middles: unpackCoords(middle),
  }
}

export const raiseByMagnitude = (magnitude: number) => (vertex: PosVertex3) => {
  if (!vertex.modified) {
    vertex.y -= magnitude
    vertex.modified = true
  }

  return vertex
}

export const adjustVertexBy = (
  ref: { x: number; y: number; z: number },
  fn: (v: PosVertex3, p: FtsPolygon) => PosVertex3,
  polygons: FtsPolygon[],
) => {
  polygons.forEach((polygon) => {
    polygon.vertices = polygon.vertices.map((vertex) => {
      if (vertex.x === ref.x && vertex.y === ref.y && vertex.z === ref.z) {
        return fn(vertex, polygon)
      }

      return vertex
    })
  })
}

const cross = (u: Vector3, v: Vector3): Vector3 => {
  return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]
}

export const subtractVec3 = (a: Vector3, b: Vector3): Vector3 => {
  return [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
}

export const magnitude = ([x, y, z]: Vector3) => {
  return Math.sqrt(x ** 2 + y ** 2 + z ** 2)
}

const triangleArea = (a: Vector3, b: Vector3, c: Vector3) => {
  return magnitude(cross(subtractVec3(a, b), subtractVec3(a, c))) / 2
}

export const distance = (a: Vector3, b: Vector3) => {
  return Math.abs(magnitude(subtractVec3(a, b)))
}

// source: https://www.scratchapixel.com/lessons/3d-basic-rendering/ray-tracing-rendering-a-triangle/barycentric-coordinates
const isPointInTriangle = (p: Vector3, a: Vector3, b: Vector3, c: Vector3) => {
  const area = triangleArea(a, b, c)

  const u = triangleArea(c, a, p) / area
  const v = triangleArea(a, b, p) / area
  const w = triangleArea(b, c, p) / area

  return isBetweenInclusive(0, 1, u) && isBetweenInclusive(0, 1, v) && isBetweenInclusive(0, 1, w) && u + v + w === 1
}

export const isPointInPolygon = (point: Vector3, polygon: FtsPolygon) => {
  const [a, b, c, d] = polygon.vertices.map(posVertexToVector)

  if (polygon.config.isQuad) {
    return isPointInTriangle(point, a, b, c) || isPointInTriangle(point, b, c, d)
  } else {
    return isPointInTriangle(point, a, b, c)
  }
}

export const addLight = ([x, y, z]: Vector3, props: Partial<LightData>, mapData: MapData) => {
  mapData.llf.lights.push({
    pos: { x, y, z },
    rgb: toArxColor(mapData.state.color),
    fallstart: 100,
    fallend: 180,
    intensity: 1.3,
    i: 0,
    exFlicker: toArxColor(toRgba('black')), // this gets subtracted from light.rgb when flickering
    exRadius: 0,
    exFrequency: 0.01,
    exSize: 0,
    exSpeed: 0,
    exFlareSize: 0,
    extras: 0,
    ...props,
  })
}

export const addZone = (
  pos: RelativeCoords,
  size: [number, number, number],
  name: string,
  ambience: AmbienceDefinition = ambiences.none,
  drawDistance = 2000,
  flags = PATH_RGB | PATH_AMBIANCE | PATH_FARCLIP,
) => {
  return (mapData: MapData) => {
    let [x, y, z] = pos.coords

    useAmbience(ambience)

    const zoneData: ZoneData = {
      header: {
        name,
        idx: 0,
        flags,
        initPos: { x, y, z },
        pos: { x, y, z },
        rgb: toArxColor(mapData.state.color),
        farClip: drawDistance,
        reverb: 0,
        ambianceMaxVolume: 100,
        height: size[1] === 0 ? -1 : size[1],
        ambiance: ambience.name,
      },
      pathways: [
        { rpos: { x: -size[0] / 2, y: 0, z: size[2] / 2 }, flag: 0, time: 0 },
        {
          rpos: { x: -size[0] / 2, y: 0, z: -size[2] / 2 },
          flag: 0,
          time: 2000,
        },
        {
          rpos: { x: size[0] / 2, y: 0, z: -size[2] / 2 },
          flag: 0,
          time: 2000,
        },
        { rpos: { x: size[0] / 2, y: 0, z: size[2] / 2 }, flag: 0, time: 0 },
      ],
    }

    mapData.dlf.paths.push(zoneData)
    return mapData
  }
}

export const flipPolygon = ([a, b, c, d]: Polygon): Polygon => {
  // vertices are laid down in a cyrillic i shape (И):
  // a c
  // b d
  // to flip both triangles I'm flipping the middle 2 vertices
  return [a, c, b, d]
}

export const sortByDistance = (fromPoint: Vector3) => (a: Vector3, b: Vector3) => {
  const distanceA = distance(fromPoint, a)
  const distanceB = distance(fromPoint, b)
  return distanceA - distanceB
}

export const circleOfVectors = (center: Vector3, radius: number, division: number) => {
  const angle = (2 * Math.PI) / division

  const vectors: Vector3[] = []

  for (let i = 0; i < division; i++) {
    const point = new ThreeJsVector3(0, 0, 1 * radius)
    const rotation = new Euler(0, angle * i, 0, 'XYZ')
    point.applyEuler(rotation)
    vectors.push(move(point.x, point.y, point.z, center))
  }

  return vectors
}

export const cleanupCache = () => {
  resetItems()
  resetAmbiences()
  resetTextures()
  resetTranslations()
}

export const normalizeDegree = (degree: number) => {
  let normalizedDegree = degree % 360
  if (normalizedDegree < 0) {
    normalizedDegree += 360
  }
  return Math.abs(normalizedDegree)
}

export const flipUVHorizontally = ([a, b, c, d]: UVQuad): UVQuad => {
  return [b, a, d, c]
}

export const flipUVVertically = ([a, b, c, d]: UVQuad): UVQuad => {
  return [c, d, a, b]
}

export const rotateUV = (
  degree: number,
  [rotateCenterU, rotateCenterV]: [number, number],
  [c, d, a, b]: UVQuad,
): UVQuad => {
  const normalizedDegree = normalizeDegree(degree)

  switch (normalizedDegree) {
    case 0:
      return [c, d, a, b]
    case 90:
      return [a, c, b, d]
    case 180:
      return [b, a, d, c]
    case 270:
      return [d, b, c, a]
    default:
      // TODO: implement custom rotation (https://forum.unity.com/threads/rotate-uv-coordinates-is-it-possible.135025/)
      return [a, b, c, d]
  }
}
