import { ArxColor, ArxPolygon, ArxPolygonFlags, ArxTextureContainer, ArxVertex } from 'arx-convert/types'
import { getCellCoords, MAP_DEPTH_IN_CELLS, MAP_WIDTH_IN_CELLS, QuadrupleOf, TripleOf } from 'arx-convert/utils'
import { Mesh, MeshBasicMaterial, Object3D, BufferAttribute, Box3 } from 'three'
import { Color } from '@src/Color.js'
import { Material } from '@src/Material.js'
import { Polygon, TransparencyType } from '@src/Polygon.js'
import { Settings } from '@src/Settings.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { Vertex } from '@src/Vertex.js'
import { groupSequences, sum, times } from '@src/faux-ramda.js'
import { applyTransformations, averageVectors, evenAndRemainder, roundToNDecimals } from '@src/helpers.js'
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
  private selection: number[] = []

  async exportTextures(settings: Settings) {
    const files: Record<string, string> = {}

    for (const polygon of this) {
      if (typeof polygon.texture === 'undefined' || polygon.texture.isNative) {
        continue
      }

      const needsToBeTileable = (polygon.flags & ArxPolygonFlags.Tiled) !== 0

      const [source, target] = await polygon.texture.exportSourceAndTarget(settings, needsToBeTileable)

      files[target] = source
    }

    return files
  }

  async toArxData() {
    const textureContainers = this.getTextureContainers()

    // watch out, we're mutating textureContainers!
    const arxPolygons: ArxPolygon[] = []
    for (const polygon of this) {
      arxPolygons.push(await polygon.toArxPolygon(textureContainers))
    }

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

      const [wholeBlocks, remaining] = evenAndRemainder(65535, maxNindices)

      times(() => {
        textureContainers.push({ id: ++cntr, filename, remaining: 65535, maxRemaining: 65535 })
        textureContainers.push({ id: ++cntr, filename, remaining: 65535, maxRemaining: 65535 })
      }, wholeBlocks)

      textureContainers.push({ id: ++cntr, filename, remaining, maxRemaining: remaining })
      textureContainers.push({ id: ++cntr, filename, remaining, maxRemaining: remaining })
    })

    return textureContainers
  }

  empty() {
    this.length = 0
  }

  calculateNormals() {
    this.forEach((polygon) => {
      polygon.calculateNormals()
      polygon.normals = [polygon.norm.clone(), polygon.norm.clone(), polygon.norm.clone(), polygon.norm2.clone()]
    })
  }

  addThreeJsMesh(threeJsObj: Object3D): void
  addThreeJsMesh(threeJsObj: Object3D, meshImportProps: MeshImportProps): void
  addThreeJsMesh(threeJsObj: Object3D, meshImportProps: MeshImportProps, isRoot: false): Polygons
  addThreeJsMesh(threeJsObj: Object3D, meshImportProps: MeshImportProps = {}, isRoot: boolean = true) {
    if (isRoot) {
      applyTransformations(threeJsObj)
    }

    const { tryToQuadify = QUADIFY, shading = SHADING_FLAT, flags = ArxPolygonFlags.None, room } = meshImportProps
    const polygons = new Polygons()

    if (threeJsObj instanceof Mesh) {
      const uvs = threeJsObj.geometry.getAttribute('uv') as BufferAttribute

      let texture: Texture | undefined | (Texture | undefined)[] = undefined

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
            } else {
              console.warn('[warning] Polygons: Unsupported texture map in material when adding threejs mesh')
              return undefined
            }
          } else {
            console.warn('[warning] Polygons: Unsupported material found when adding threejs mesh')
            return undefined
          }
        })
      } else if (typeof threeJsObj.material !== 'undefined') {
        console.warn('[warning] Polygons: Unsupported material found when adding threejs mesh')
      }

      const vertexPrecision = 10
      const vertices = getNonIndexedVertices(threeJsObj.geometry).map(({ idx, vector, materialIndex }) => {
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
        } as VertexWithMaterialIndex
      })

      if (tryToQuadify === QUADIFY) {
        let previousPolygon: TripleOf<VertexWithMaterialIndex> | undefined = undefined
        let currentPolygon: TripleOf<VertexWithMaterialIndex>

        for (let i = 0; i < vertices.length; i += 3) {
          if (typeof previousPolygon === 'undefined') {
            previousPolygon = vertices.slice(i, i + 3).reverse() as TripleOf<VertexWithMaterialIndex>
            continue
          }

          currentPolygon = vertices.slice(i, i + 3).reverse() as TripleOf<VertexWithMaterialIndex>

          const materialIndex = currentPolygon[0].materialIndex

          let isQuadable = false
          if (tryToQuadify === QUADIFY) {
            // TODO: calculate this instead of having it hardcoded
            isQuadable = true
          }

          const currentTexture = Array.isArray(texture) ? texture[materialIndex ?? 0] : texture
          if (currentTexture instanceof Material && currentTexture.opacity === 100) {
            // remove opacity
            currentTexture.flags & ~ArxPolygonFlags.Transparent
          }

          if (isQuadable) {
            const [a, b, c] = previousPolygon
            const d = currentPolygon[1]
            const polygon = new Polygon({
              vertices: [a, d, c, b].map(({ vertex }) => vertex) as QuadrupleOf<Vertex>,
              texture: currentTexture,
              flags: currentTexture instanceof Material ? currentTexture.flags | flags : flags,
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

          const polygon = new Polygon({
            vertices: [...previousPolygon.map(({ vertex }) => vertex), new Vertex(0, 0, 0)] as QuadrupleOf<Vertex>,
            texture: currentTexture,
            flags: currentTexture instanceof Material ? currentTexture.flags | flags : flags,
            room,
          })
          if (currentTexture instanceof Material && currentTexture.opacity !== 100) {
            polygon.setOpacity(currentTexture.opacity, currentTexture.opacityMode)
          }
          polygons.push(polygon)
          previousPolygon = currentPolygon
        }

        if (typeof previousPolygon !== 'undefined') {
          const materialIndex = previousPolygon[0].materialIndex
          const currentTexture = Array.isArray(texture) ? texture[materialIndex ?? 0] : texture
          if (currentTexture instanceof Material && currentTexture.opacity === 100) {
            // remove opacity
            currentTexture.flags & ~ArxPolygonFlags.Transparent
          }
          const polygon = new Polygon({
            vertices: [...previousPolygon.map(({ vertex }) => vertex), new Vertex(0, 0, 0)] as QuadrupleOf<Vertex>,
            texture: currentTexture,
            flags: currentTexture instanceof Material ? currentTexture.flags | flags : flags,
            room,
          })
          if (currentTexture instanceof Material && currentTexture.opacity !== 100) {
            polygon.setOpacity(currentTexture.opacity, currentTexture.opacityMode)
          }
          polygons.push(polygon)
        }
      } else {
        for (let i = 0; i < vertices.length; i += 3) {
          const currentPolygon = vertices.slice(i, i + 3).reverse() as TripleOf<VertexWithMaterialIndex>
          const materialIndex = currentPolygon[0].materialIndex
          const currentTexture = Array.isArray(texture) ? texture[materialIndex ?? 0] : texture
          if (currentTexture instanceof Material && currentTexture.opacity === 100) {
            // remove opacity
            currentTexture.flags & ~ArxPolygonFlags.Transparent
          }
          const polygon = new Polygon({
            vertices: [...currentPolygon.map(({ vertex }) => vertex), new Vertex(0, 0, 0)] as QuadrupleOf<Vertex>,
            texture: currentTexture,
            flags: (currentTexture instanceof Material ? currentTexture.flags | flags : flags) & ~ArxPolygonFlags.Quad,
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

  // -------------------------
  // selection api

  clearSelection() {
    this.selection = []
    return this
  }

  hasSelection() {
    return this.selection.length > 0
  }

  sizeOfSelection() {
    return this.selection.length
  }

  selectAll() {
    this.selection = Array.from(this.keys())
    return this
  }

  /**
   * selects polygons based on a given predicate
   * if there are already polygons selected then this filters those further
   */
  selectBy(predicate: (polygon: Polygon, idx: number) => boolean) {
    if (!this.hasSelection()) {
      this.selectAll()
    }

    this.selection = this.selection.filter((idx) => {
      const polygon = this[idx]
      return predicate(polygon, idx)
    })

    return this
  }

  /**
   * selects polygons which go outside the 0-160 meters boundary on the horizontal axis
   */
  selectOutOfBounds() {
    return this.selectBy((polygon) => polygon.isOutOfBounds())
  }

  selectWithinBox(box: Box3) {
    return this.selectBy((polygon) => polygon.isWithin(box))
  }

  selectByTextures(textures: (Texture | string)[]) {
    return this.selectBy((polygon) => polygon.texture?.equalsAny(textures) ?? false)
  }

  invertSelection() {
    const oldSelection = this.selection
    return this.selectAll().selectBy((polygon, idx) => {
      return !oldSelection.includes(idx)
    })
  }

  /**
   * Removes polygons which have been selected
   *
   * @returns the number of polygons that have ben removed
   */
  removeSelected() {
    const selectedAmount = this.selection.length

    if (selectedAmount > 0) {
      groupSequences(this.selection)
        .reverse()
        .forEach(([start, size]) => {
          this.splice(start, size)
        })

      this.selection = []
    }

    return selectedAmount
  }

  apply(fn: (polygon: Polygon, idx: number) => void) {
    const applyToAll = !this.hasSelection()

    if (applyToAll) {
      this.selectAll()
    }

    this.selection.forEach((idx) => {
      const polygon = this[idx]
      fn(polygon, idx)
    })

    if (applyToAll) {
      this.clearSelection()
    }

    return this
  }

  copy() {
    const applyToAll = !this.hasSelection()

    if (applyToAll) {
      this.selectAll()
    }

    const copiedPolygons = this.selection.map((idx) => this[idx].clone())

    if (applyToAll) {
      this.clearSelection()
    }

    return new Polygons(...copiedPolygons)
  }

  // -------------------------

  makeDoubleSided() {
    return this.apply((polygon) => {
      polygon.makeDoubleSided()
    })
  }

  moveToRoom1() {
    return this.apply((polygon) => {
      if (polygon.room < 1) {
        return
      }

      polygon.room = 1
    })
  }

  move(offset: Vector3) {
    return this.apply((polygon) => {
      polygon.move(offset)
    })
  }

  scale(scale: number) {
    return this.apply((polygon) => {
      polygon.scale(scale)
    })
  }

  flipUVHorizontally() {
    return this.apply((polygon) => {
      polygon.flipUVHorizontally()
    })
  }

  flipUVVertically() {
    return this.apply((polygon) => {
      polygon.flipUVVertically()
    })
  }
}
