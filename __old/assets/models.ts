import fs from 'fs'
import { PosVertex3, Vector3, RelativeCoords } from '../types'
import { isBetween, MapData, roundToNDecimals } from '../helpers'
import { MAP_MAX_HEIGHT, MAP_MAX_WIDTH, POLY_NO_SHADOW, POLY_QUAD } from '../constants'
import { useTexture } from '../assets/textures'
import { Euler, MathUtils, Vector3 as TreeJsVector3 } from 'three'
import { clone, identity, max, min, partition } from '../faux-ramda'
import { doesPolygonFitIntoACell, isPolygonVisible, toTriangleHelper } from '../subdivisionHelper'
import { ArxRotation } from 'arx-level-json-converter/types/binary/BinaryIO'

const EOL = /\r?\n/

type Obj = {
  vertices: Vector3[]
  // normals: Vector3[]
  textureCoords: Vector3[]
  faces: { indices: Vector3[]; texture: string }[]
}

type TexturedPolygon = {
  polygon: PosVertex3[]
  texture: string
}

const dropFirst = <T>(values: T[]) => {
  return values.slice(1)
}

const parseVector3 = (line: string): Vector3 => {
  const [a, b, c] = dropFirst(line.split(/\s+/))
  return [parseFloat(a), parseFloat(b), parseFloat(c)]
}

const parseFace = (line: string) => {
  const triplets = dropFirst(line.split(/\s+/))

  return triplets.map((triplet): Vector3 => {
    const [v, t, n] = triplet.split('/')
    return [parseInt(v) - 1, parseInt(t) - 1, parseInt(n) - 1]
  })
}

// source: https://en.wikipedia.org/wiki/Wavefront_.obj_file
export const loadObj = async (filename: string) => {
  const polygons: TexturedPolygon[] = []

  let rows: string[]

  try {
    const source = await fs.promises.readFile(filename, 'utf-8')
    rows = source.trim().split(EOL)
  } catch (e: unknown) {
    console.error('loadObj: file not found')
    return polygons
  }

  const state: Obj = {
    vertices: [],
    // normals: [],
    textureCoords: [],
    faces: [],
  }

  let texture: string = ''

  rows.forEach((line) => {
    line = line.trim()

    if (line.startsWith('v ')) {
      state.vertices.push(parseVector3(line))
    }

    // if (line.startsWith('vn ')) {
    //   state.normals.push(parseVector3(line))
    // }

    if (line.startsWith('vt ')) {
      state.textureCoords.push(parseVector3(line))
    }

    if (line.startsWith('usemtl ')) {
      texture = line.split(/\s+/)[1]
    }

    if (line.startsWith('f ')) {
      state.faces.push({ indices: parseFace(line), texture })
    }
  })

  state.faces.forEach(({ indices, texture }) => {
    const polygon: PosVertex3[] = indices.map(([vIndex, tIndex /*, nIndex*/]) => {
      const [x, y, z] = state.vertices[vIndex]
      const [u, v, w] = state.textureCoords[tIndex]
      // const normals = state.normals[nIndex]

      return { x, y, z, u, v }
    })

    polygons.push({
      polygon,
      texture,
    })
  })

  return polygons
}

export const flipPolygonAxis = (axis: string, polygons: TexturedPolygon[]) => {
  polygons.forEach(({ polygon }) => {
    polygon.forEach((vertex) => {
      if (axis.includes('x')) {
        vertex.x *= -1
      }

      if (axis.includes('y')) {
        vertex.y *= -1
      }

      if (axis.includes('z')) {
        vertex.z *= -1
      }
    })
  })
}

export const rotatePolygonData = ({ a, b, g }: ArxRotation, polygons: TexturedPolygon[]) => {
  const rotation = new Euler(MathUtils.degToRad(a), MathUtils.degToRad(b), MathUtils.degToRad(g), 'XYZ')

  polygons.forEach(({ polygon }) => {
    polygon.forEach((vertex) => {
      const v = new TreeJsVector3(vertex.x, vertex.y, vertex.z)
      v.applyEuler(rotation)
      vertex.x = v.x
      vertex.y = v.y
      vertex.z = v.z
    })
  })
}

export const scalePolygonData = (scale: number, polygons: TexturedPolygon[]) => {
  polygons.forEach(({ polygon }) => {
    polygon.forEach((vertex) => {
      vertex.x = vertex.x * scale
      vertex.y = vertex.y * scale
      vertex.z = vertex.z * scale
    })
  })
}

export const toTriangles = (polygons: TexturedPolygon[]) => {
  return polygons.flatMap(({ polygon, texture }) => {
    if (polygon.length === 3) {
      return [{ polygon, texture }]
    }

    const subPolys: TexturedPolygon[] = []

    for (let i = 0; i < polygon.length - 2; i++) {
      subPolys.push({ polygon: [clone(polygon[0]), clone(polygon[i + 1]), polygon[i + 2]], texture })
    }

    return subPolys
  })
}

const createPointHalfwayBetween = (a: TreeJsVector3, b: TreeJsVector3) => {
  return b.clone().sub(a).divideScalar(2).add(a)
}

export const subdivideTriangles = (polygons: TexturedPolygon[]): TexturedPolygon[] => {
  const [fits, tooLarge] = partition(({ polygon }) => doesPolygonFitIntoACell(polygon), polygons)

  if (tooLarge.length === 0) {
    return fits
  }

  const dividedPolygons = tooLarge.flatMap(({ polygon, texture }) => {
    const triangle = toTriangleHelper(polygon)
    const longestSide = triangle.getLongestSide()
    const [a, b, c] = polygon

    const subPolys: TexturedPolygon[] = []

    if (longestSide === triangle.abLength) {
      const midpoint = createPointHalfwayBetween(triangle.a, triangle.b)
      const u = (a.u + b.u) / 2
      const v = (a.v + b.v) / 2
      const m: PosVertex3 = { x: midpoint.x, y: midpoint.y, z: midpoint.z, u, v }
      subPolys.push(
        { polygon: [clone(a), clone(m), clone(c)], texture },
        { polygon: [clone(m), clone(b), clone(c)], texture },
      )
    } else if (longestSide === triangle.bcLength) {
      const midpoint = createPointHalfwayBetween(triangle.b, triangle.c)
      const u = (b.u + c.u) / 2
      const v = (b.v + c.v) / 2
      const m: PosVertex3 = { x: midpoint.x, y: midpoint.y, z: midpoint.z, u, v }
      subPolys.push(
        { polygon: [clone(a), clone(b), clone(m)], texture },
        { polygon: [clone(a), clone(m), clone(c)], texture },
      )
    } else {
      const midpoint = createPointHalfwayBetween(triangle.c, triangle.a)
      const u = (c.u + a.u) / 2
      const v = (c.v + a.v) / 2
      const m: PosVertex3 = { x: midpoint.x, y: midpoint.y, z: midpoint.z, u, v }
      subPolys.push(
        { polygon: [clone(m), clone(b), clone(c)], texture },
        { polygon: [clone(a), clone(b), clone(m)], texture },
      )
    }

    return subPolys
  })

  return [...fits, ...subdivideTriangles(dividedPolygons)]
}

export const renderPolygonData = (
  polygons: TexturedPolygon[],
  pos: RelativeCoords,
  doSomethingWithTheVertices: (vertices: TexturedPolygon) => void = identity,
) => {
  return (mapData: MapData) => {
    mapData.fts.polygons[mapData.state.polygonGroup] = mapData.fts.polygons[mapData.state.polygonGroup] || []

    polygons.forEach(({ polygon, texture }) => {
      polygon.forEach((vertex) => {
        vertex.x += mapData.config.origin.coords[0] + pos.coords[0]
        vertex.y += mapData.config.origin.coords[1] + pos.coords[1]
        vertex.z += mapData.config.origin.coords[2] + pos.coords[2]
      })

      doSomethingWithTheVertices({ polygon, texture })

      // last minute fixing the vertices
      let tmp = polygon[0]
      polygon[0] = polygon[1]
      polygon[1] = tmp

      const isQuad = polygon.length === 4

      if (!isQuad) {
        polygon.push({ x: 0, y: 0, z: 0, u: 0, v: 0 })
      }

      let textureFlags = mapData.state.texture?.flags ?? POLY_NO_SHADOW

      if (isQuad) {
        textureFlags |= POLY_QUAD
      } else {
        textureFlags &= ~POLY_QUAD
      }

      mapData.fts.polygons[mapData.state.polygonGroup].push({
        config: {
          color: mapData.state.color,
          isQuad,
          bumpable: true,
        },
        vertices: polygon,
        tex: useTexture(mapData.state.texture),
        transval: 2,
        area: 1000,
        type: textureFlags,
        room: 1,
        paddy: 0,
      })
    })
  }
}

export const willThePolygonDataFit = (
  name: string,
  polygons: TexturedPolygon[],
  pos: RelativeCoords,
  mapData: MapData,
) => {
  if (polygons.length === 0) {
    return
  }

  const vertices = polygons.flatMap(({ polygon }) => polygon)
  const xs = vertices.map(({ x }) => x)
  const zs = vertices.map(({ z }) => z)

  const minX = roundToNDecimals(3, min(xs) + pos.coords[0] + mapData.config.origin.coords[0])
  const maxX = roundToNDecimals(3, max(xs) + pos.coords[0] + mapData.config.origin.coords[0])
  const minZ = roundToNDecimals(3, min(zs) + pos.coords[2] + mapData.config.origin.coords[2])
  const maxZ = roundToNDecimals(3, max(zs) + pos.coords[2] + mapData.config.origin.coords[2])

  if (!isBetween(0, MAP_MAX_WIDTH * 100, minX)) {
    throw new Error(`"${name}" doesn't fit into the level, the minimum value on the X axis is ${minX}`)
  }

  if (!isBetween(0, MAP_MAX_WIDTH * 100, maxX)) {
    throw new Error(`"${name}" doesn't fit into the level, the maximum value on the X axis is ${maxX}`)
  }

  if (!isBetween(0, MAP_MAX_HEIGHT * 100, minZ)) {
    throw new Error(`"${name}" doesn't fit into the level, the minimum value on the Z axis is ${minZ}`)
  }

  if (!isBetween(0, MAP_MAX_HEIGHT * 100, maxZ)) {
    throw new Error(`"${name}" doesn't fit into the level, the maximum value on the Z axis is ${maxZ}`)
  }
}

export const removeInvisiblePolygons = (polygons: TexturedPolygon[]) => {
  return polygons.filter(({ polygon }) => {
    switch (polygon.length) {
      case 3:
        return isPolygonVisible(polygon, false)
      case 4:
        return isPolygonVisible(polygon, true)
      default:
        // TODO: decide whether a polygon with 4+ vertices is visible or not
        return true
    }
  })
}

export const turnPolygonDataInsideOut = (polygons: TexturedPolygon[]) => {
  polygons.forEach(({ polygon }, i) => {
    polygons[i].polygon = polygon.reverse()
  })
}

export const flipTextureUpsideDown = (polygons: TexturedPolygon[]) => {
  polygons.forEach(({ polygon }) => {
    polygon.forEach((vertex) => {
      vertex.v *= -1
    })
  })
}