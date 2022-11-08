import fs from 'fs'
import { PosVertex3, Vector3, RelativeCoords, RotationVertex3 } from '../types'
import { isBetween, MapData, roundToNDecimals } from '../helpers'
import { POLY_NO_SHADOW, POLY_QUAD } from '../constants'
import { useTexture } from '../assets/textures'
import { Euler, MathUtils, Vector3 as TreeJsVector3 } from 'three'
import { clone, identity } from '../faux-ramda'
import { isPolygonVisible } from '../subdivisionHelper'

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

      return {
        posX: x,
        posY: y,
        posZ: z,
        texU: u,
        texV: v,
      }
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
        vertex.posX *= -1
      }

      if (axis.includes('y')) {
        vertex.posY *= -1
      }

      if (axis.includes('z')) {
        vertex.posZ *= -1
      }
    })
  })
}

export const rotatePolygonData = ({ a, b, g }: RotationVertex3, polygons: TexturedPolygon[]) => {
  const rotation = new Euler(MathUtils.degToRad(a), MathUtils.degToRad(b), MathUtils.degToRad(g), 'XYZ')

  polygons.forEach(({ polygon }) => {
    polygon.forEach((vertex) => {
      const v = new TreeJsVector3(vertex.posX, vertex.posY, vertex.posZ)
      v.applyEuler(rotation)
      vertex.posX = v.x
      vertex.posY = v.y
      vertex.posZ = v.z
    })
  })
}

export const scalePolygonData = (scale: number, polygons: TexturedPolygon[]) => {
  polygons.forEach(({ polygon }) => {
    polygon.forEach((vertex) => {
      vertex.posX = vertex.posX * scale
      vertex.posY = vertex.posY * scale
      vertex.posZ = vertex.posZ * scale
    })
  })
}

export const renderPolygonData = (
  polygons: TexturedPolygon[],
  pos: RelativeCoords,
  doSomethingWithTheVertices: (vertices: TexturedPolygon & { isQuad: boolean }) => void = identity,
) => {
  return (mapData: MapData) => {
    mapData.fts.polygons[mapData.state.polygonGroup] = mapData.fts.polygons[mapData.state.polygonGroup] || []

    polygons.forEach(({ polygon, texture }) => {
      const subPolys: PosVertex3[][] = []

      switch (polygon.length) {
        case 3:
        case 4:
          subPolys.push(polygon)
          break
        default:
          for (let i = 1; i <= polygon.length - 2; i++) {
            subPolys.push([clone(polygon[0]), clone(polygon[i]), polygon[i + 1]])
          }
      }

      subPolys.forEach((polygon) => {
        polygon.forEach((vertex) => {
          vertex.posX = vertex.posX + mapData.config.origin.coords[0] + pos.coords[0]
          vertex.posY = vertex.posY + mapData.config.origin.coords[1] + pos.coords[1]
          vertex.posZ = vertex.posZ + mapData.config.origin.coords[2] + pos.coords[2]
        })

        const isQuad = polygon.length === 4
        if (!isQuad) {
          polygon.push({ posX: 0, posY: 0, posZ: 0, texU: 0, texV: 0 })
        }

        doSomethingWithTheVertices({ polygon, texture, isQuad })

        // last minute fixing the vertices
        let tmp = polygon[0]
        polygon[0] = polygon[1]
        polygon[1] = tmp

        const textureFlags = mapData.state.texture?.flags ?? POLY_QUAD | POLY_NO_SHADOW

        let flags = textureFlags
        if (isQuad) {
          flags = flags | POLY_QUAD
        } else {
          flags = flags & ~POLY_QUAD
        }

        mapData.fts.polygons[mapData.state.polygonGroup].push({
          config: {
            color: mapData.state.color,
            isQuad: (flags & POLY_QUAD) > 0,
            bumpable: true,
          },
          vertices: polygon,
          tex: useTexture(mapData.state.texture),
          transval: 2,
          area: 1000,
          type: flags,
          room: 1,
          paddy: 0,
        })
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
  const xs = polygons.flatMap(({ polygon }) => polygon).map(({ posX }) => posX)
  const zs = polygons.flatMap(({ polygon }) => polygon).map(({ posZ }) => posZ)

  const minX = roundToNDecimals(3, Math.min(...xs) + pos.coords[0] + mapData.config.origin.coords[0])
  const maxX = roundToNDecimals(3, Math.max(...xs) + pos.coords[0] + mapData.config.origin.coords[0])
  const minZ = roundToNDecimals(3, Math.min(...zs) + pos.coords[2] + mapData.config.origin.coords[2])
  const maxZ = roundToNDecimals(3, Math.max(...zs) + pos.coords[2] + mapData.config.origin.coords[2])

  if (!isBetween(0, 16000, minX)) {
    throw new Error(`"${name}" doesn't fit into the level, the minimum value on the X axis is ${minX}`)
  }

  if (!isBetween(0, 16000, maxX)) {
    throw new Error(`"${name}" doesn't fit into the level, the maximum value on the X axis is ${maxX}`)
  }

  if (!isBetween(0, 16000, minZ)) {
    throw new Error(`"${name}" doesn't fit into the level, the minimum value on the Z axis is ${minZ}`)
  }

  if (!isBetween(0, 16000, maxZ)) {
    throw new Error(`"${name}" doesn't fit into the level, the maximum value on the Z axis is ${maxZ}`)
  }
}

export const removeInvisiblePolygons = (polygons: TexturedPolygon[]) => {
  return polygons.filter(({ polygon }) => {
    const isQuad = polygon.length === 4
    return isPolygonVisible(polygon, isQuad)
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
      vertex.texV *= -1
    })
  })
}
