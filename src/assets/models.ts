import fs from 'fs'
import { PosVertex3, Vector3, RelativeCoords } from '../types'
import { MapData, setTexture } from '../helpers'
import { POLY_NO_SHADOW, POLY_QUAD } from '../constants'
import { textures, useTexture } from '../assets/textures'

const EOL = /\r?\n/

type Obj = {
  vertices: Vector3[]
  normals: Vector3[]
  textureCoords: Vector3[]
  faces: Vector3[][]
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

export const loadObj = async (filename: string) => {
  const polygons: PosVertex3[][] = []

  let rows: string[]

  try {
    const source = await fs.promises.readFile(filename, 'utf-8')
    rows = source.trim().split(EOL)
  } catch (e: unknown) {
    return polygons
  }

  const state: Obj = {
    vertices: [],
    normals: [],
    textureCoords: [],
    faces: [],
  }

  rows.forEach((line) => {
    line = line.trim()

    if (line.startsWith('v ')) {
      state.vertices.push(parseVector3(line))
    }

    if (line.startsWith('vn ')) {
      state.normals.push(parseVector3(line))
    }

    if (line.startsWith('vt ')) {
      state.textureCoords.push(parseVector3(line))
    }

    if (line.startsWith('f ')) {
      state.faces.push(parseFace(line))
    }
  })

  state.faces.forEach((vertices) => {
    const polygon: PosVertex3[] = vertices.map(([vIndex, tIndex, nIndex]) => {
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
    polygons.push(polygon)
  })

  return polygons
}

export const renderPolygonData = (polygons: PosVertex3[][], pos: RelativeCoords, scale: number, mapData: MapData) => {
  const { texture } = mapData.state
  const textureFlags = texture?.flags ?? POLY_QUAD | POLY_NO_SHADOW

  mapData.fts.polygons[mapData.state.polygonGroup] = mapData.fts.polygons[mapData.state.polygonGroup] || []

  polygons.forEach((vertices) => {
    vertices = vertices.map((vertex, i) => {
      vertex.posX = vertex.posX * scale + mapData.config.origin.coords[0] + pos.coords[0]
      vertex.posY = vertex.posY * -1 * scale + mapData.config.origin.coords[1] + pos.coords[1]
      vertex.posZ = vertex.posZ * scale + mapData.config.origin.coords[2] + pos.coords[2]
      return vertex
    })

    let flags = textureFlags
    if (vertices.length === 3) {
      flags = flags & ~POLY_QUAD
      vertices.push({ posX: 0, posY: 0, posZ: 0, texU: 0, texV: 0 })
    }

    mapData.fts.polygons[mapData.state.polygonGroup].push({
      config: {
        color: mapData.state.color,
        isQuad: (flags & POLY_QUAD) > 0,
        bumpable: true,
      },
      vertices,
      tex: useTexture(texture),
      transval: 0,
      area: 1000,
      type: flags,
      room: 1,
      paddy: 0,
    })
  })
}
