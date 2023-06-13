import { ArxColor } from 'arx-level-json-converter/dist/common/Color'
import rgba from 'color-rgba'
import fs from 'fs'
import { dirname, resolve } from 'path'
import { Euler, Vector3 as ThreeJsVector3 } from 'three'
import { ambiences, exportAmbiences, useAmbience, resetAmbiences, AmbienceDefinition } from './assets/ambiences'
import { exportTranslations, resetTranslations } from './assets/i18n'
import { exportUsedItems, exportScripts, exportDependencies, resetItems } from './assets/items'
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
import { countBy, partition, clone, min } from './faux-ramda'
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

export const posVertexToVector = ({ x, y, z }: PosVertex3): Vector3 => {
  return [x, y, z]
}

const vectorToXYZ = ([x, y, z]: Vector3): Vertex3 => {
  return { x, y, z }
}

export const calculateNormal = ([a, b, c]: Vector3[]) => {
  return vectorToXYZ(normalize(cross(subtractVec3(b, a), subtractVec3(c, a))))
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
