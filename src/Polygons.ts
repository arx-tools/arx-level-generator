import { ArxColor, ArxPolygonFlags, ArxTextureContainer, ArxVertex } from 'arx-convert/types'
import { sum, times } from '@src/faux-ramda.js'
import { applyTransformations, averageVectors, evenAndRemainder, roundToNDecimals } from '@src/helpers.js'
import { Polygon, TransparencyType } from '@src/Polygon.js'
import { Vector3 } from '@src/Vector3.js'
import { Mesh, MeshBasicMaterial, Object3D, Color as ThreeJsColor, BufferAttribute } from 'three'
import { Color } from '@src/Color.js'
import { Texture } from '@src/Texture.js'
import { Vertex } from '@src/Vertex.js'
import { getCellCoords, MAP_DEPTH_IN_CELLS, MAP_WIDTH_IN_CELLS, QuadrupleOf, TripleOf } from 'arx-convert/utils'
import { getNonIndexedVertices } from '@tools/mesh/getVertices.js'
import { Material } from './Material.js'

export const QUADIFY = 'quadify'
export const DONT_QUADIFY = "don't quadify"

export const SHADING_FLAT = 'flat'
export const SHADING_SMOOTH = 'smooth'

export type MeshImportProps = {
  tryToQuadify?: typeof QUADIFY | typeof DONT_QUADIFY
  shading?: typeof SHADING_FLAT | typeof SHADING_SMOOTH
  flags?: ArxPolygonFlags
}

type TextureContainer = ArxTextureContainer & { remaining: number; maxRemaining: number }

export class Polygons extends Array<Polygon> {
  async exportTextures(outputDir: string) {
    const files: Record<string, string> = {}

    for (let polygon of this) {
      if (typeof polygon.texture === 'undefined' || polygon.texture.isNative) {
        continue
      }

      const needsToBeTileable = (polygon.flags & ArxPolygonFlags.Tiled) !== 0

      const [source, target] = await polygon.texture.exportSourceAndTarget(outputDir, needsToBeTileable)

      files[target] = source
    }

    return files
  }

  toArxData() {
    const textureContainers = this.getTextureContainers()

    // watch out, we're mutating textureContainers!
    const arxPolygons = this.map((polygon) => {
      return polygon.toArxPolygon(textureContainers)
    })

    const arxTextureContainers = textureContainers
      .filter(({ remaining, maxRemaining }) => remaining !== maxRemaining)
      .map(({ id, filename }): ArxTextureContainer => {
        return { id, filename }
      })

    return {
      polygons: arxPolygons,
      textureContainers: arxTextureContainers,
    }
  }

  countNindices() {
    const nindices: Record<string, Record<TransparencyType | 'opaque', number>> = {}

    this.forEach((polygon) => {
      if (typeof polygon.texture === 'undefined') {
        return
      }

      if (!(polygon.texture.filename in nindices)) {
        nindices[polygon.texture.filename] = {
          additive: 0,
          blended: 0,
          multiplicative: 0,
          opaque: 0,
          subtractive: 0,
        }
      }

      nindices[polygon.texture.filename][polygon.getTransparencyType()] += polygon.getNindices()
    })

    return nindices
  }

  getTextureContainers() {
    const textureContainers: TextureContainer[] = []

    let cntr = 0

    const nindices = this.countNindices()

    Object.entries(nindices).forEach(([filename, nindices]) => {
      const maxNindices = sum(Object.values(nindices))

      const [wholeBlocks, remainder] = evenAndRemainder(65535, maxNindices)

      times(() => {
        textureContainers.push({ id: ++cntr, filename, remaining: 65535, maxRemaining: 65535 })
        textureContainers.push({ id: ++cntr, filename: 'tileable-' + filename, remaining: 65535, maxRemaining: 65535 })
      }, wholeBlocks)

      textureContainers.push({ id: ++cntr, filename, remaining: remainder, maxRemaining: remainder })
      textureContainers.push({
        id: ++cntr,
        filename: 'tileable-' + filename,
        remaining: remainder,
        maxRemaining: remainder,
      })
    })

    return textureContainers
  }

  move(offset: Vector3) {
    this.forEach((polygon) => {
      polygon.move(offset)
    })
  }

  empty() {
    this.length = 0
  }

  addThreeJsMesh(threeJsObj: Object3D, meshImportProps: MeshImportProps): void
  addThreeJsMesh(threeJsObj: Object3D, meshImportProps: MeshImportProps, isRoot: false): Polygon[]
  addThreeJsMesh(threeJsObj: Object3D, meshImportProps: MeshImportProps, isRoot: boolean = true) {
    if (isRoot) {
      applyTransformations(threeJsObj)
    }

    const { tryToQuadify = QUADIFY, shading = SHADING_FLAT, flags = ArxPolygonFlags.None } = meshImportProps
    const polygons: Polygon[] = []

    if (threeJsObj instanceof Mesh) {
      const uvs: BufferAttribute = threeJsObj.geometry.getAttribute('uv')

      let color = Color.white
      let texture: Texture | undefined = undefined
      if (threeJsObj.material instanceof MeshBasicMaterial) {
        color = Color.fromThreeJsColor(threeJsObj.material.color as ThreeJsColor)
        if (threeJsObj.material.map instanceof Texture) {
          texture = threeJsObj.material.map
        }
      }

      const vertexPrecision = 10
      const vertices = getNonIndexedVertices(threeJsObj.geometry).map(({ idx, vector }) => {
        return new Vertex(
          roundToNDecimals(vertexPrecision, vector.x),
          roundToNDecimals(vertexPrecision, vector.y * -1),
          roundToNDecimals(vertexPrecision, vector.z),
          uvs.getX(idx),
          uvs.getY(idx),
          color,
        )
      })

      let previousPolygon: TripleOf<Vertex> | null = null
      let currentPolygon: TripleOf<Vertex>
      for (let i = 0; i < vertices.length; i += 3) {
        if (previousPolygon === null) {
          previousPolygon = vertices.slice(i, i + 3).reverse() as TripleOf<Vertex>
          continue
        }

        currentPolygon = vertices.slice(i, i + 3).reverse() as TripleOf<Vertex>

        let isQuadable = false
        if (tryToQuadify === QUADIFY) {
          // TODO: calculate this instead of having it hardcoded
          isQuadable = true
        }

        if (isQuadable) {
          const [a, b, c] = previousPolygon
          const d = currentPolygon[1]
          polygons.push(
            new Polygon({
              vertices: [a, d, c, b] as QuadrupleOf<Vertex>,
              texture,
              isQuad: true,
            }),
          )
          previousPolygon = null
          continue
        }

        polygons.push(
          new Polygon({
            vertices: [...previousPolygon, new Vertex(0, 0, 0)] as QuadrupleOf<Vertex>,
            texture,
            flags: texture instanceof Material ? texture.flags | flags : flags,
          }),
        )
        previousPolygon = currentPolygon
      }

      if (previousPolygon !== null) {
        polygons.push(
          new Polygon({
            vertices: [...previousPolygon, new Vertex(0, 0, 0)] as QuadrupleOf<Vertex>,
            texture,
            flags: texture instanceof Material ? texture.flags | flags : flags,
          }),
        )
      }
    }

    threeJsObj.children.forEach((child) => {
      polygons.push(...this.addThreeJsMesh(child, meshImportProps, false))
    })

    if (!isRoot) {
      return polygons
    }

    if (shading === SHADING_SMOOTH) {
      const polygonsOfVertices: Record<string, [number, Polygon][]> = {}

      // TODO: calculate smooth normals for quads too

      polygons.forEach((polygon) => {
        polygon.calculateNormals()
        polygon.normals = [polygon.norm.clone(), polygon.norm.clone(), polygon.norm.clone(), polygon.norm2.clone()]

        const [a, b, c] = polygon.vertices
        if (Array.isArray(polygonsOfVertices[a.toString()])) {
          polygonsOfVertices[a.toString()].push([0, polygon])
        } else {
          polygonsOfVertices[a.toString()] = [[0, polygon]]
        }
        if (Array.isArray(polygonsOfVertices[b.toString()])) {
          polygonsOfVertices[b.toString()].push([1, polygon])
        } else {
          polygonsOfVertices[b.toString()] = [[1, polygon]]
        }
        if (Array.isArray(polygonsOfVertices[c.toString()])) {
          polygonsOfVertices[c.toString()].push([2, polygon])
        } else {
          polygonsOfVertices[c.toString()] = [[2, polygon]]
        }
      })

      Object.values(polygonsOfVertices).forEach((polygons) => {
        if (polygons.length === 1) {
          return
        }

        const normals = polygons.reduce((normals, [vertexIndex, polygon]) => {
          normals.push((polygon.normals as QuadrupleOf<Vector3>)[vertexIndex])
          return normals
        }, [] as Vector3[])

        const normal = averageVectors(normals)

        polygons.forEach(([vertexIndex, polygon]) => {
          ;(polygon.normals as QuadrupleOf<Vector3>)[vertexIndex] = normal.clone()
        })
      })
    }

    polygons.forEach((polygon) => {
      this.push(polygon)
    })
  }

  getVertexColors() {
    const cells: Record<string, number[]> = {}

    this.forEach((polygon, idx) => {
      const vertices = polygon.vertices.map((vertex) => vertex.toArxVertex())
      const [cellX, cellZ] = getCellCoords(vertices as QuadrupleOf<ArxVertex>)
      const key = `${cellZ}|${cellX}`

      if (key in cells) {
        cells[key].push(idx)
      } else {
        cells[key] = [idx]
      }
    })

    const colors: ArxColor[] = []

    for (let z = 0; z < MAP_DEPTH_IN_CELLS; z++) {
      for (let x = 0; x < MAP_WIDTH_IN_CELLS; x++) {
        const cell = cells[`${z}|${x}`] as number[] | undefined
        if (typeof cell === 'undefined') {
          continue
        }

        cell.forEach((idx) => {
          const polygon = this[idx]

          for (let i = 0; i < (polygon.isQuad() ? 4 : 3); i++) {
            const color = polygon.vertices[i]?.color ?? Color.transparent
            colors.push(color.toArxColor())
          }
        })
      }
    }

    return colors
  }

  moveToRoom1() {
    this.forEach((polygon) => {
      if (polygon.room < 1) {
        return
      }

      polygon.room = 1
    })
  }
}
