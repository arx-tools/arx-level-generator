import { ArxColor, ArxPolygonFlags, ArxTextureContainer, ArxVertex } from 'arx-convert/types'
import { sum, times } from '@src/faux-ramda'
import { applyTransformations, evenAndRemainder, roundToNDecimals } from '@src/helpers'
import { Polygon, TransparencyType } from '@src/Polygon'
import { Vector3 } from '@src/Vector3'
import { Mesh, MeshBasicMaterial, Object3D, Color as ThreeJsColor, Box3, BufferAttribute } from 'three'
import { Color } from '@src/Color'
import { Texture } from '@src/Texture'
import { Vertex } from '@src/Vertex'
import { getCellCoords, MAP_DEPTH_IN_CELLS, MAP_WIDTH_IN_CELLS, QuadrupleOf, TripleOf } from 'arx-convert/utils'

export const QUADIFY = 'quadify'
export const DONT_QUADIFY = "don't quadify"

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

  addThreeJsMesh(threeJsObj: Object3D, tryToQuadify: typeof QUADIFY | typeof DONT_QUADIFY = QUADIFY) {
    if (threeJsObj.parent === null) {
      applyTransformations(threeJsObj)
    }

    if (threeJsObj instanceof Mesh) {
      const index: BufferAttribute = threeJsObj.geometry.getIndex()
      const coords: BufferAttribute = threeJsObj.geometry.getAttribute('position')
      const uvs: BufferAttribute = threeJsObj.geometry.getAttribute('uv')
      const vertices: Vertex[] = []

      let color = Color.white
      let texture: Texture | undefined = undefined
      if (threeJsObj.material instanceof MeshBasicMaterial) {
        color = Color.fromThreeJsColor(threeJsObj.material.color as ThreeJsColor)
        if (threeJsObj.material.map instanceof Texture) {
          texture = threeJsObj.material.map
        }
      }

      function toVertex3(idx: number, coords: BufferAttribute, uvs: BufferAttribute, color: Color) {
        const precision = 10
        const x = roundToNDecimals(precision, coords.getX(idx))
        const y = roundToNDecimals(precision, coords.getY(idx) * -1)
        const z = roundToNDecimals(precision, coords.getZ(idx))
        const u = uvs.getX(idx)
        const v = uvs.getY(idx)
        return new Vertex(x, y, z, u, v, color)
      }

      if (index === null) {
        // non-indexed, all vertices are unique
        for (let idx = 0; idx < coords.count; idx++) {
          vertices.push(toVertex3(idx, coords, uvs, color))
        }
      } else {
        // indexed, has shared vertices
        for (let i = 0; i < index.count; i++) {
          const idx = index.getX(i)
          vertices.push(toVertex3(idx, coords, uvs, color))
        }
      }

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
          this.push(
            new Polygon({
              vertices: [a, d, c, b] as QuadrupleOf<Vertex>,
              texture,
              isQuad: true,
            }),
          )
          previousPolygon = null
          continue
        }

        this.push(
          new Polygon({
            vertices: [...previousPolygon, new Vertex(0, 0, 0)] as QuadrupleOf<Vertex>,
            texture,
          }),
        )
        previousPolygon = currentPolygon
      }

      if (previousPolygon !== null) {
        this.push(
          new Polygon({
            vertices: [...previousPolygon, new Vertex(0, 0, 0)] as QuadrupleOf<Vertex>,
            texture,
          }),
        )
      }
    }

    threeJsObj.children.forEach((child) => {
      this.addThreeJsMesh(child, tryToQuadify)
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
