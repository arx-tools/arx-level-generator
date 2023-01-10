import { ArxPolygonFlags, ArxTextureContainer } from 'arx-convert/types'
import { sum, times } from '@src/faux-ramda'
import { evenAndRemainder } from '@src/helpers'
import { Polygon, TransparencyType } from '@src/Polygon'
import { Vector3 } from '@src/Vector3'

type TextureContainer = ArxTextureContainer & { remaining: number; maxRemaining: number }

export class Polygons extends Array<Polygon> {
  async exportTextures(outputDir: string) {
    const files: Record<string, string> = {}

    for (let polygon of this) {
      if (typeof polygon.texture === 'undefined' || polygon.texture.isNative) {
        return files
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
      polygon.vertices.forEach((vertex) => {
        vertex.add(offset)
      })
    })
  }
}
