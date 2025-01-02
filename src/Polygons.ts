import {
  type ArxColor,
  type ArxPolygon,
  ArxPolygonFlags,
  type ArxTextureContainer,
  type ArxVertex,
} from 'arx-convert/types'
import {
  getCellCoords,
  MAP_DEPTH_IN_CELLS,
  MAP_WIDTH_IN_CELLS,
  type QuadrupleOf,
  type TripleOf,
  isTiled,
} from 'arx-convert/utils'
import { Mesh, MeshBasicMaterial, type Object3D, type BufferAttribute, Box3, type BufferGeometry } from 'three'
import { Color } from '@src/Color.js'
import { Material } from '@src/Material.js'
import { Polygon, type TransparencyType } from '@src/Polygon.js'
import { type ISettings } from '@platform/common/Settings.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { Vertex } from '@src/Vertex.js'
import { sum, times } from '@src/faux-ramda.js'
import { applyTransformations, averageVectors, quotientAndRemainder, roundToNDecimals } from '@src/helpers.js'
import { getNonIndexedVertices } from '@tools/mesh/getVertices.js'

export const QUADIFY = 'quadify'
export const DONT_QUADIFY = "don't quadify"

export const SHADING_FLAT = 'flat'
export const SHADING_SMOOTH = 'smooth'

export type MeshImportProps = {
  tryToQuadify?: typeof QUADIFY | typeof DONT_QUADIFY
  shading?: typeof SHADING_FLAT | typeof SHADING_SMOOTH
  flags?: ArxPolygonFlags
  /**
   * room id - used when a map has portals, default value is undefined (the Polygon constructor will handle it)
   */
  room?: number
}

type TextureContainer = ArxTextureContainer & { remaining: number; maxRemaining: number }

type VertexWithMaterialIndex = {
  vertex: Vertex
  materialIndex: number | undefined
}

export class Polygons extends Array<Polygon> {
  cashedBBox: {
    numberOfPolygons: number
    value: Box3
  }

  constructor(...items: Polygon[]) {
    super(...items)
    this.cashedBBox = {
      numberOfPolygons: 0,
      value: new Box3(),
    }
  }

  async exportTextures(settings: ISettings): Promise<Record<string, string>> {
    const texturesToExport: {
      tileable: Record<string, Texture>
      nonTileable: Record<string, Texture>
    } = {
      tileable: {},
      nonTileable: {},
    }

    for (const polygon of this) {
      if (polygon.texture === undefined || polygon.texture.isNative) {
        continue
      }

      const needsToBeTileable = isTiled(polygon)
      if (needsToBeTileable) {
        texturesToExport.tileable[polygon.texture.filename] = polygon.texture
      } else {
        texturesToExport.nonTileable[polygon.texture.filename] = polygon.texture
      }
    }

    const files: Record<string, string> = {}

    for (const filename in texturesToExport.tileable) {
      const texture = texturesToExport.tileable[filename]
      const [source, target] = await texture.exportSourceAndTarget(settings, true)
      files[target] = source
    }

    for (const filename in texturesToExport.nonTileable) {
      const texture = texturesToExport.nonTileable[filename]
      const [source, target] = await texture.exportSourceAndTarget(settings, false)
      files[target] = source
    }

    return files
  }

  toArxData(): { polygons: ArxPolygon[]; textureContainers: ArxTextureContainer[] } {
    const textureContainers = this.getTextureContainers()

    // watch out, we're mutating textureContainers!
    const arxPolygons: ArxPolygon[] = []
    for (const polygon of this) {
      arxPolygons.push(polygon.toArxData(textureContainers))
    }

    const arxTextureContainers = textureContainers
      .filter(({ remaining, maxRemaining }) => {
        return remaining !== maxRemaining
      })
      .map(({ id, filename }): ArxTextureContainer => {
        return { id, filename }
      })

    return {
      polygons: arxPolygons,
      textureContainers: arxTextureContainers,
    }
  }

  countNindices(): Record<string, Record<TransparencyType | 'opaque', number>> {
    const nindices: Record<string, Record<TransparencyType | 'opaque', number>> = {}

    this.forEach((polygon) => {
      if (polygon.texture === undefined) {
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

      nindices[polygon.texture.filename][polygon.getTransparencyType()] =
        nindices[polygon.texture.filename][polygon.getTransparencyType()] + polygon.getNindices()
    })

    return nindices
  }

  getTextureContainers(): TextureContainer[] {
    const textureContainers: TextureContainer[] = []

    let cntr = 0

    const nindices = this.countNindices()

    Object.entries(nindices).forEach(([filename, nindices]) => {
      const maxNindices = sum(Object.values(nindices))

      const [wholeBlocks, remaining] = quotientAndRemainder(maxNindices, 65_535)

      times(() => {
        textureContainers.push(
          { id: cntr + 1, filename, remaining: 65_535, maxRemaining: 65_535 },
          { id: cntr + 2, filename, remaining: 65_535, maxRemaining: 65_535 },
        )
        cntr = cntr + 2
      }, wholeBlocks)

      textureContainers.push(
        { id: cntr + 1, filename, remaining, maxRemaining: remaining },
        { id: cntr + 2, filename, remaining, maxRemaining: remaining },
      )
      cntr = cntr + 2
    })

    return textureContainers
  }

  empty(): void {
    this.length = 0
  }

  calculateNormals(): void {
    this.forEach((polygon) => {
      polygon.calculateNormals()
      polygon.normals = [polygon.norm.clone(), polygon.norm.clone(), polygon.norm.clone(), polygon.norm2.clone()]
    })
  }

  addThreeJsMesh(threeJsObj: Object3D): void
  addThreeJsMesh(threeJsObj: Object3D, meshImportProps: MeshImportProps): void
  addThreeJsMesh(threeJsObj: Object3D, meshImportProps: MeshImportProps, isRoot: false): Polygons
  // eslint-disable-next-line complexity -- the code should be split into smaller private methods in the future
  addThreeJsMesh(threeJsObj: Object3D, meshImportProps: MeshImportProps = {}, isRoot: boolean = true): Polygons | void {
    if (isRoot) {
      applyTransformations(threeJsObj)
    }

    const { tryToQuadify = QUADIFY, shading = SHADING_FLAT, flags = ArxPolygonFlags.None, room } = meshImportProps
    const polygons = new Polygons()

    if (threeJsObj instanceof Mesh) {
      const uvs = (threeJsObj.geometry as BufferGeometry).getAttribute('uv') as BufferAttribute

      let texture: Texture | undefined | (Texture | undefined)[]

      if (threeJsObj.material instanceof MeshBasicMaterial) {
        if (threeJsObj.material.map instanceof Texture) {
          texture = threeJsObj.material.map
        } else {
          console.warn('[warning] Polygons: Unsupported texture map in material when adding threejs mesh')
        }
      } else if (Array.isArray(threeJsObj.material)) {
        texture = threeJsObj.material.map((material) => {
          if (material instanceof MeshBasicMaterial) {
            if (material.map instanceof Texture) {
              return material.map
            }

            console.warn('[warning] Polygons: Unsupported texture map in material when adding threejs mesh')
            return undefined
          }

          console.warn('[warning] Polygons: Unsupported material found when adding threejs mesh')
          return undefined
        })
      } else if (threeJsObj.material !== undefined) {
        console.warn('[warning] Polygons: Unsupported material found when adding threejs mesh')
      }

      const vertexPrecision = 10
      const vertices = getNonIndexedVertices(threeJsObj.geometry).map(
        ({ idx, vector, materialIndex }): VertexWithMaterialIndex => {
          return {
            vertex: new Vertex(
              roundToNDecimals(vertexPrecision, vector.x),
              roundToNDecimals(vertexPrecision, vector.y),
              roundToNDecimals(vertexPrecision, vector.z),
              uvs.getX(idx),
              uvs.getY(idx),
              Color.white,
            ),
            materialIndex,
          }
        },
      )

      if (tryToQuadify === QUADIFY) {
        let previousPolygon: TripleOf<VertexWithMaterialIndex> | undefined
        let currentPolygon: TripleOf<VertexWithMaterialIndex>

        for (let i = 0; i < vertices.length; i = i + 3) {
          if (previousPolygon === undefined) {
            previousPolygon = vertices.slice(i, i + 3).reverse() as TripleOf<VertexWithMaterialIndex>
            continue
          }

          currentPolygon = vertices.slice(i, i + 3).reverse() as TripleOf<VertexWithMaterialIndex>

          const { materialIndex } = currentPolygon[0]

          // TODO: calculate this instead of having it hardcoded
          const isQuadable = true

          let currentTexture
          if (Array.isArray(texture)) {
            currentTexture = texture[materialIndex ?? 0]
          } else {
            currentTexture = texture
          }

          if (currentTexture instanceof Material && currentTexture.opacity === 100) {
            // remove opacity
            currentTexture.flags = currentTexture.flags & ~ArxPolygonFlags.Transparent
          }

          if (isQuadable) {
            const [a, b, c] = previousPolygon
            const d = currentPolygon[1]

            // TODO: add a proper name for this variable
            let ccc: ArxPolygonFlags
            if (currentTexture instanceof Material) {
              ccc = currentTexture.flags | flags
            } else {
              ccc = flags
            }

            const polygon = new Polygon({
              vertices: [a, d, c, b].map(({ vertex }) => {
                return vertex
              }) as QuadrupleOf<Vertex>,
              texture: currentTexture,
              flags: ccc,
              isQuad: true,
              room,
            })

            if (currentTexture instanceof Material && currentTexture.opacity !== 100) {
              polygon.setOpacity(currentTexture.opacity, currentTexture.opacityMode)
            }

            polygons.push(polygon)
            previousPolygon = undefined
            continue
          }

          // TODO: add a proper name for this variable
          let ccc: ArxPolygonFlags
          if (currentTexture instanceof Material) {
            ccc = currentTexture.flags | flags
          } else {
            ccc = flags
          }

          const polygon = new Polygon({
            vertices: [
              ...previousPolygon.map(({ vertex }) => {
                return vertex
              }),
              new Vertex(0, 0, 0),
            ] as QuadrupleOf<Vertex>,
            texture: currentTexture,
            flags: ccc,
            room,
          })

          if (currentTexture instanceof Material && currentTexture.opacity !== 100) {
            polygon.setOpacity(currentTexture.opacity, currentTexture.opacityMode)
          }

          polygons.push(polygon)
          previousPolygon = currentPolygon
        }

        if (previousPolygon !== undefined) {
          const { materialIndex } = previousPolygon[0]

          let currentTexture
          if (Array.isArray(texture)) {
            currentTexture = texture[materialIndex ?? 0]
          } else {
            currentTexture = texture
          }

          if (currentTexture instanceof Material && currentTexture.opacity === 100) {
            // remove opacity
            currentTexture.flags = currentTexture.flags & ~ArxPolygonFlags.Transparent
          }

          // TODO: add a proper name for this variable
          let ccc: ArxPolygonFlags
          if (currentTexture instanceof Material) {
            ccc = currentTexture.flags | flags
          } else {
            ccc = flags
          }

          const polygon = new Polygon({
            vertices: [
              ...previousPolygon.map(({ vertex }) => {
                return vertex
              }),
              new Vertex(0, 0, 0),
            ] as QuadrupleOf<Vertex>,
            texture: currentTexture,
            flags: ccc,
            room,
          })

          if (currentTexture instanceof Material && currentTexture.opacity !== 100) {
            polygon.setOpacity(currentTexture.opacity, currentTexture.opacityMode)
          }

          polygons.push(polygon)
        }
      } else {
        for (let i = 0; i < vertices.length; i = i + 3) {
          const currentPolygon = vertices.slice(i, i + 3).reverse() as TripleOf<VertexWithMaterialIndex>
          const { materialIndex } = currentPolygon[0]

          let currentTexture
          if (Array.isArray(texture)) {
            currentTexture = texture[materialIndex ?? 0]
          } else {
            currentTexture = texture
          }

          if (currentTexture instanceof Material && currentTexture.opacity === 100) {
            // remove opacity
            currentTexture.flags = currentTexture.flags & ~ArxPolygonFlags.Transparent
          }

          let ccc2
          if (currentTexture instanceof Material) {
            ccc2 = currentTexture.flags | flags
          } else {
            ccc2 = flags
          }

          ccc2 = ccc2 & ~ArxPolygonFlags.Quad

          const polygon = new Polygon({
            vertices: [
              ...currentPolygon.map(({ vertex }) => {
                return vertex
              }),
              new Vertex(0, 0, 0),
            ] as QuadrupleOf<Vertex>,
            texture: currentTexture,
            flags: ccc2,
            room,
          })

          if (currentTexture instanceof Material && currentTexture.opacity !== 100) {
            polygon.setOpacity(currentTexture.opacity, currentTexture.opacityMode)
          }

          polygons.push(polygon)
        }
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

      polygons.calculateNormals()

      polygons.forEach((polygon) => {
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

        const normals: Vector3[] = []
        polygons.forEach(([vertexIndex, polygon]) => {
          normals.push((polygon.normals as QuadrupleOf<Vector3>)[vertexIndex])
        })

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

  getVertexColors(): ArxColor[] {
    const cells: Record<string, number[]> = {}

    this.forEach((polygon, idx) => {
      const vertices = polygon.vertices.map((vertex) => {
        return vertex.toArxData()
      })
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
        if (cell === undefined) {
          continue
        }

        cell.forEach((idx) => {
          const polygon = this[idx]

          for (let i = 0; i < 3; i++) {
            const color = polygon.vertices[i]?.color ?? Color.transparent
            colors.push(color.toArxData())
          }

          if (polygon.isQuad()) {
            const color = polygon.vertices[3]?.color ?? Color.transparent
            colors.push(color.toArxData())
          }
        })
      }
    }

    return colors
  }

  getBoundingBox(): Box3 {
    // TODO: this isn't ideal when only a vertex gets changed, but not the number of polygons
    if (this.cashedBBox.numberOfPolygons === this.length) {
      return this.cashedBBox.value
    }

    const bbox = new Box3()

    for (const polygon of this) {
      const { min, max } = polygon.getBoundingBox()
      bbox.expandByPoint(min)
      bbox.expandByPoint(max)
    }

    this.cashedBBox.numberOfPolygons = this.length
    this.cashedBBox.value = bbox

    return bbox
  }

  getCenter(): Vector3 {
    const bb = this.getBoundingBox()
    const center = new Vector3()
    bb.getCenter(center)
    return center
  }

  getHeight(): number {
    const { max, min } = this.getBoundingBox()
    return max.y - min.y
  }

  getWidth(): number {
    const { max, min } = this.getBoundingBox()
    return max.x - min.x
  }

  getDepth(): number {
    const { max, min } = this.getBoundingBox()
    return max.z - min.z
  }

  subdivideLargePolygons(): void {
    let i = this.length

    let numberOfTooLargePolygons = 0

    while (i > 0) {
      i = i - 1

      const polygon = this[i]

      if (polygon.isTooLarge()) {
        numberOfTooLargePolygons = numberOfTooLargePolygons + 1

        const smallerPolygons = polygon.subdivide()
        this.splice(i, 1, ...smallerPolygons)
      }
    }

    if (numberOfTooLargePolygons > 0) {
      if (numberOfTooLargePolygons === 1) {
        console.info(`[info] Polygons: ${numberOfTooLargePolygons} polygon have been subdivided`)
      } else {
        console.info(`[info] Polygons: ${numberOfTooLargePolygons} polygons have been subdivided`)
      }
    }
  }
}
