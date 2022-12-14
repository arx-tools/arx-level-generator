import floor from './base/floor'
import {
  categorizeVertices,
  raiseByMagnitude,
  adjustVertexBy,
  randomBetween,
  pickRandoms,
  move,
  posVertexToVector,
  distance,
  isBetween,
  MapData,
  generateBlankMapData,
} from '../helpers'
import { identity, clamp } from '../faux-ramda'
import { AbsoluteCoords, PosVertex3, TextureQuad, Vector3, Vertex3 } from '../types'
import { TEXTURE_FULL_SCALE } from '../constants'
import { FtsPolygon } from '../blankMap'

export type AdjustablePosVertex3 = PosVertex3 & { haveBeenAdjusted?: boolean }

export type Candidate = {
  polygon: FtsPolygon
  vertex: AdjustablePosVertex3
  distance: number
  coordinates: Vector3
}

// pos is relative to origin
export const plain = (
  pos: Vector3,
  size: number | [number, number],
  facing: 'floor' | 'ceiling' = 'floor',
  onBeforeBumping: (polygons: FtsPolygon[], mapData: MapData) => FtsPolygon[] = identity,
  getConfig: () => {
    textureRotation?: number
    textureFlags?: number
    quad: TextureQuad
  } = () => ({ quad: TEXTURE_FULL_SCALE }),
) => {
  return (mapData: MapData) => {
    const { origin } = mapData.config

    const [x, y, z] = move(...pos, origin.coords)

    const [sizeX, sizeZ] = Array.isArray(size) ? size : [size, size]

    const dummyMapData = generateBlankMapData({
      origin: { type: 'absolute', coords: [0, 0, 0] },
      levelIdx: 1,
      seed: '',
      lootTable: [],
      bumpFactor: 0,
    })

    dummyMapData.config = mapData.config
    dummyMapData.state = mapData.state
    dummyMapData.fts.polygons[mapData.state.polygonGroup] = []

    for (let j = 0; j < sizeZ; j++) {
      for (let i = 0; i < sizeX; i++) {
        const config = getConfig()
        const position: AbsoluteCoords = {
          type: 'absolute',
          coords: [x + 100 * i - (sizeX * 100) / 2 + 100 / 2, y, z + 100 * j - (sizeZ * 100) / 2 + 100 / 2],
        }

        floor(position, facing, config.quad, config.textureRotation ?? 90, 100, config.textureFlags ?? 0)(dummyMapData)
      }
    }

    const polygons = onBeforeBumping(dummyMapData.fts.polygons[mapData.state.polygonGroup], mapData)

    const nonBumpablePolygons = polygons.filter((polygon) => polygon.config.bumpable === false)

    if (polygons.length > nonBumpablePolygons.length) {
      const nonBumpableVertices = nonBumpablePolygons.reduce((acc, { vertices }) => {
        acc.push(...vertices.map(({ x, y, z }) => `${x}|${y}|${z}`))
        return acc
      }, [] as string[])

      let { corners, edges, middles } = categorizeVertices(polygons)

      corners
        .filter(({ x, y, z }) => !nonBumpableVertices.includes(`${x}|${y}|${z}`))
        .forEach((corner) => {
          const magnitude = 5 * mapData.config.bumpFactor
          adjustVertexBy(
            corner,
            raiseByMagnitude(randomBetween(-magnitude, magnitude) + (facing === 'floor' ? -80 : 80)),
            polygons,
          )
        })

      edges
        .filter(({ x, y, z }) => !nonBumpableVertices.includes(`${x}|${y}|${z}`))
        .forEach((edge) => {
          const magnitude = 5 * mapData.config.bumpFactor
          adjustVertexBy(
            edge,
            raiseByMagnitude(randomBetween(-magnitude, magnitude) + (facing === 'floor' ? -40 : 40)),
            polygons,
          )
        })

      middles = middles.filter(({ x, y, z }) => !nonBumpableVertices.includes(`${x}|${y}|${z}`))
      pickRandoms(15, middles).forEach((middle) => {
        const magnitude = 10 * mapData.config.bumpFactor
        adjustVertexBy(
          middle,
          raiseByMagnitude(
            facing === 'floor'
              ? clamp(-50, Infinity, randomBetween(-magnitude, magnitude))
              : clamp(
                  -Infinity,
                  50,
                  randomBetween(-magnitude, magnitude) * 3 - randomBetween(5, 25) * mapData.config.bumpFactor,
                ),
          ),
          polygons,
        )
      })
    }

    if (!mapData.fts.polygons[mapData.state.polygonGroup]) {
      mapData.fts.polygons[mapData.state.polygonGroup] = polygons
    } else {
      mapData.fts.polygons[mapData.state.polygonGroup].push(...polygons)
    }

    return mapData
  }
}

export const disableBumping = (polygons: FtsPolygon[]) => {
  polygons.forEach((polygon) => {
    polygon.config.bumpable = false
  })
  return polygons
}

export const connectToNearPolygons = (targetGroup: string, distanceThreshold: number = 100) => {
  return (polygons: FtsPolygon[], mapData: MapData) => {
    const target = categorizeVertices(mapData.fts.polygons[targetGroup] || [])
    const targetVertices = [...target.corners, ...target.edges].map(posVertexToVector)

    if (targetVertices.length === 0) {
      return polygons
    }

    const candidates: Record<string, Candidate[]> = {}

    const vertices: AdjustablePosVertex3[] = []

    const source = categorizeVertices(polygons)

    ;[...source.corners, ...source.edges].forEach((polygon) => {
      adjustVertexBy(
        polygon,
        (vertex: AdjustablePosVertex3, polyOfVertex) => {
          const targets = targetVertices.filter((targetVertex) => {
            const d = distance(posVertexToVector(vertex), targetVertex)
            return isBetween(10, distanceThreshold, d)
          })

          if (targets.length) {
            vertex.haveBeenAdjusted = false // TODO: remove the need for mutation
            vertices.push(vertex)
          }

          targets.forEach((targetVertex) => {
            const [x, y, z] = targetVertex
            candidates[`${x}|${y}|${z}`] = candidates[`${x}|${y}|${z}`] || []
            candidates[`${x}|${y}|${z}`].push({
              polygon: polyOfVertex,
              vertex,
              distance: distance(posVertexToVector(vertex), targetVertex),
              coordinates: [x, y, z],
            })
          })

          return vertex
        },
        polygons,
      )
    })

    Object.values(candidates)
      .sort((a, b) => {
        const aDistance = Math.min(...a.map(({ distance }) => distance))
        const bDistance = Math.min(...b.map(({ distance }) => distance))
        return aDistance - bDistance
      })
      .forEach((candidate) => {
        const smallestDistance = Math.min(...candidate.map(({ distance }) => distance))

        candidate
          .filter((x) => x.distance === smallestDistance && x.vertex.haveBeenAdjusted !== true)
          .forEach(({ coordinates, polygon, vertex }) => {
            const [x, y, z] = coordinates
            vertex.haveBeenAdjusted = true
            polygon.config.bumpable = false
            vertex.x = x
            vertex.y = y
            vertex.z = z
          })
      })

    vertices.forEach((vertex) => {
      delete vertex.haveBeenAdjusted
    })

    return polygons
  }
}