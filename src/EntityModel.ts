import fs from 'node:fs'
import path from 'node:path'
import { FTL } from 'arx-convert'
import { ArxAction, ArxFTL, ArxFaceType } from 'arx-convert/types'
import { Expand, QuadrupleOf, TripleOf } from 'arx-convert/utils'
import { BufferAttribute, MathUtils, Mesh, MeshBasicMaterial, Vector2 } from 'three'
import { Polygons } from '@src/Polygons.js'
import { Settings } from '@src/Settings.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { fileExists, roundToNDecimals } from '@src/helpers.js'
import { getNonIndexedVertices } from '@tools/mesh/getVertices.js'

type EntityModelConstructorProps = {
  filename: string
  /**
   * default value is "./" (relative to the assets folder)
   */
  sourcePath?: string
  actionPoints?: ArxAction[]
}

/**
 * a, b and c are normal vectors
 * @see https://stackoverflow.com/a/35205710/1806628
 */
const getFaceNormal = (a: Vector3, b: Vector3, c: Vector3) => {
  return new Vector3().crossVectors(b.clone().sub(a), c.clone().sub(a)).normalize()
}

export class EntityModel {
  static targetPath = 'game/graph/obj3d/interactive'

  filename: string
  sourcePath: string
  originIdx: number
  mesh?: Mesh | Polygons
  actionPoints: ArxAction[]

  constructor(props: EntityModelConstructorProps) {
    this.filename = props.filename
    this.sourcePath = props.sourcePath ?? './'
    this.actionPoints = props.actionPoints ?? []
    this.originIdx = 0
  }

  /**
   * props.originIdx is optional, its default value is 0
   */
  static fromThreeJsObj(threeJsObj: Mesh, props: Expand<EntityModelConstructorProps & { originIdx?: number }>) {
    const model = new EntityModel(props)

    model.mesh = threeJsObj
    model.originIdx = props.originIdx ?? 0

    return model
  }

  /**
   * props.originIdx is optional, its default value is 0
   */
  static fromPolygons(polygons: Polygons, props: Expand<EntityModelConstructorProps & { originIdx?: number }>) {
    const model = new EntityModel(props)

    model.mesh = polygons
    model.originIdx = props.originIdx ?? 0

    return model
  }

  clone() {
    const copy = new EntityModel({
      filename: this.filename,
      sourcePath: this.sourcePath,
    })

    copy.mesh = this.mesh

    return copy
  }

  /**
   * targetName is the folder relative to EntityModel.targetPath without the filename,
   * for example `items/quest_item/mirror`
   */
  async exportSourceAndTarget(settings: Settings, targetName: string) {
    let source: string

    if (typeof this.mesh === 'undefined') {
      source = path.resolve(settings.assetsDir, this.sourcePath, this.filename)
    } else {
      source = await this.generateFtl(settings, targetName)
    }

    const { name: entityName } = path.parse(targetName)
    const target = path.resolve(settings.outputDir, EntityModel.targetPath, targetName, `${entityName}.ftl`)

    const files: Record<string, string> = {
      [target]: source,
    }

    return files
  }

  // TODO: this is the same as Texture.createCacheFolderIfNotExists
  private async createCacheFolderIfNotExists(folder: string) {
    try {
      await fs.promises.access(folder, fs.promises.constants.R_OK | fs.promises.constants.W_OK)
    } catch (e) {
      await fs.promises.mkdir(folder, { recursive: true })
    }
  }

  /**
   * this method assumes that this.mesh is defined
   */
  private async generateFtl(settings: Settings, targetName: string) {
    const { name: entityName } = path.parse(targetName)
    const target = path.resolve(settings.cacheFolder, EntityModel.targetPath, targetName, `${entityName}.ftl`)

    if (await fileExists(target)) {
      return target
    }

    const ftlData: ArxFTL = {
      header: {
        origin: this.originIdx,
        name: entityName,
      },
      vertices: [],
      faces: [],
      textureContainers: [],
      groups: [],
      actions: this.actionPoints,
      selections: [],
    }

    const vertexPrecision = 5

    const mesh = this.mesh
    if (mesh instanceof Polygons) {
      mesh.calculateNormals()

      const vertices = mesh.flatMap((polygon) => polygon.vertices.slice(polygon.isQuad() ? 3 : 4))

      const origin = vertices[ftlData.header.origin].clone()

      ftlData.vertices = mesh.flatMap((polygon) => {
        const vectors = polygon.vertices.slice(polygon.isQuad() ? 3 : 4)
        const normals = polygon.normals as QuadrupleOf<Vector3>

        const vertices = [
          { vector: vectors[0].clone().sub(origin).toArxVector3(), norm: normals[0] },
          { vector: vectors[1].clone().sub(origin).toArxVector3(), norm: normals[1] },
          { vector: vectors[2].clone().sub(origin).toArxVector3(), norm: normals[2] },
        ]

        if (polygon.isQuad()) {
          vertices.push({ vector: vectors[3].clone().sub(origin).toArxVector3(), norm: normals[3] })
        }

        return vertices
      })
    } else {
      const { geometry, material } = mesh as Mesh

      geometry.rotateY(MathUtils.degToRad(90))

      const normals = geometry.getAttribute('normal') as BufferAttribute
      const uvs = geometry.getAttribute('uv') as BufferAttribute

      const vertices: { vector: Vector3; norm: Vector3; uv: Vector2; textureIdx: number }[] = []
      const faceIndexes: TripleOf<number>[] = []

      getNonIndexedVertices(geometry).forEach(({ idx, vector, materialIndex }, i) => {
        vertices.push({
          vector: new Vector3(
            roundToNDecimals(vertexPrecision, vector.x),
            roundToNDecimals(vertexPrecision, vector.y),
            roundToNDecimals(vertexPrecision, vector.z),
          ),
          norm: new Vector3(normals.getX(idx), normals.getY(idx), normals.getZ(idx)),
          uv: new Vector2(uvs.getX(idx), uvs.getY(idx)),
          textureIdx: materialIndex ?? 0,
        })

        if (i % 3 === 0) {
          faceIndexes.push([-1, -1, i])
        } else {
          faceIndexes[faceIndexes.length - 1][2 - (i % 3)] = i
        }
      })

      const origin = vertices[ftlData.header.origin].vector.clone()

      ftlData.vertices = vertices.map(({ vector, norm }) => ({
        vector: vector.clone().sub(origin).toArxVector3(),
        norm: norm.toArxVector3(),
      }))

      ftlData.faces = faceIndexes.map(([aIdx, bIdx, cIdx]) => {
        const a = vertices[aIdx]
        const b = vertices[bIdx]
        const c = vertices[cIdx]
        const faceNormal = getFaceNormal(a.norm, b.norm, c.norm)

        return {
          faceType: ArxFaceType.Flat,
          vertexIdx: [aIdx, bIdx, cIdx],
          textureIdx: a.textureIdx,
          u: [a.uv.x, b.uv.x, c.uv.x],
          v: [a.uv.y, b.uv.y, c.uv.y],
          norm: faceNormal.toArxVector3(),
        }
      })

      let texture: Texture | undefined | (Texture | undefined)[] = undefined
      if (material instanceof MeshBasicMaterial) {
        if (material.map instanceof Texture) {
          texture = material.map
        } else {
          console.warn('[warning] EntityModel: Unsupported texture map in material when adding threejs mesh')
        }
      } else if (Array.isArray(material)) {
        texture = material.map((material) => {
          if (material instanceof MeshBasicMaterial) {
            if (material.map instanceof Texture) {
              return material.map
            } else {
              console.warn('[warning] EntityModel: Unsupported texture map in material when adding threejs mesh')
              return undefined
            }
          } else {
            console.warn('[warning] EntityModel: Unsupported material found when adding threejs mesh')
            return undefined
          }
        })
      } else if (typeof material !== 'undefined') {
        console.warn('[warning] EntityModel: Unsupported material found when adding threejs mesh')
      }

      if (Array.isArray(texture)) {
        texture.forEach((t) => {
          if (typeof t !== 'undefined') {
            ftlData.textureContainers.push({
              filename: t.filename,
            })
          }
        })
      } else if (typeof texture !== 'undefined') {
        ftlData.textureContainers.push({
          filename: texture.filename,
        })
      }
    }

    const ftl = FTL.save(ftlData)
    await this.createCacheFolderIfNotExists(path.dirname(target))
    await fs.promises.writeFile(target, ftl)

    return target
  }
}
