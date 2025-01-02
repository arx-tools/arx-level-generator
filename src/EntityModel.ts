import fs from 'node:fs/promises'
import path from 'node:path'
import { FTL } from 'arx-convert'
import { type ArxAction, type ArxFTL, ArxFaceType, type ArxFace, type ArxFtlVertex } from 'arx-convert/types'
import { type Expand, type QuadrupleOf, type TripleOf } from 'arx-convert/utils'
import { type BufferAttribute, MathUtils, type Mesh, MeshBasicMaterial, Vector2 } from 'three'
import { Polygons } from '@src/Polygons.js'
import { type ISettings } from '@platform/common/ISettings.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { repeat } from '@src/faux-ramda.js'
import { arrayPadRight, roundToNDecimals } from '@src/helpers.js'
import { createHashOfObject, getCacheInfo, saveHashOf } from '@services/cache.js'
import { getNonIndexedVertices } from '@tools/mesh/getVertices.js'
import { fileExists } from '@platform/node/helpers.js'
import { type FileExports } from '@src/types.js'

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
function getFaceNormal(a: Vector3, b: Vector3, c: Vector3): Vector3 {
  return new Vector3().crossVectors(b.clone().sub(a), c.clone().sub(a)).normalize()
}

export class EntityModel {
  static targetPath = 'game/graph/obj3d/interactive'

  /**
   * props.originIdx is optional, its default value is 0
   *
   * use `@tools/mesh/getLowestPolygonIdx` to get the index of the lowest point of a mesh
   */
  static fromThreeJsObj(
    threeJsObj: Mesh,
    props: Expand<EntityModelConstructorProps & { originIdx?: number }>,
  ): EntityModel {
    const model = new EntityModel(props)

    model.mesh = threeJsObj
    model.originIdx = props.originIdx ?? 0

    return model
  }

  /**
   * props.originIdx is optional, its default value is 0
   *
   * use `@tools/mesh/getLowestPolygonIdx` to get the index of the lowest point of a mesh
   */
  static fromPolygons(
    polygons: Polygons,
    props: Expand<EntityModelConstructorProps & { originIdx?: number }>,
  ): EntityModel {
    const model = new EntityModel(props)

    model.mesh = polygons
    model.originIdx = props.originIdx ?? 0

    return model
  }

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

  clone(): EntityModel {
    const copy = new EntityModel({
      filename: this.filename,
      sourcePath: this.sourcePath,
    })

    copy.mesh = this.mesh

    return copy
  }

  /**
   * @param settings Settings instance (either browser or node version)
   * @param targetName the folder relative to EntityModel.targetPath without the filename, for example `items/quest_item/mirror`
   * @param exportJsonFiles when set to true the json version of an ftl file also gets exported (default false)
   * @param prettify when set to true the exported json gets indented with spaces, otherwise minified (default false)
   */
  async exportSourceAndTarget(
    settings: ISettings,
    targetName: string,
    exportJsonFiles: boolean = false,
    prettify: boolean = false,
  ): Promise<FileExports> {
    const files: FileExports = {}

    const { name: entityName } = path.parse(targetName)
    const binaryTarget = path.resolve(settings.outputDir, EntityModel.targetPath, targetName, `${entityName}.ftl`)
    const jsonTarget = `${binaryTarget}.json`

    if (this.mesh === undefined) {
      const binarySource = path.resolve(settings.assetsDir, this.sourcePath, this.filename)
      files[binaryTarget] = binarySource
    } else {
      const cachedBinary = await getCacheInfo(
        path.join(EntityModel.targetPath, targetName, `${entityName}.ftl`),
        settings,
      )

      const ftlData = this.generateFtl(entityName)
      const hashOfFtlData = createHashOfObject(ftlData)

      let binaryChanged = false
      if (hashOfFtlData !== cachedBinary.hash || !cachedBinary.exists) {
        const ftl = FTL.save(ftlData)
        await fs.writeFile(cachedBinary.filename, new Uint8Array(ftl))
        await saveHashOf(cachedBinary.filename, hashOfFtlData, settings)
        binaryChanged = true
      }

      files[binaryTarget] = cachedBinary.filename

      if (exportJsonFiles) {
        const cachedJsonTarget = `${cachedBinary.filename}.json`
        const cachedJsonExists = await fileExists(cachedJsonTarget)

        if (binaryChanged || !cachedJsonExists) {
          let stringifiedFtl: string
          if (prettify) {
            stringifiedFtl = JSON.stringify(ftlData, null, '\t')
          } else {
            stringifiedFtl = JSON.stringify(ftlData)
          }

          await fs.writeFile(cachedJsonTarget, stringifiedFtl, { encoding: 'utf8' })
        }

        files[jsonTarget] = cachedJsonTarget
      }
    }

    return files
  }

  /**
   * this method assumes that this.mesh is defined
   */
  private generateFtl(entityName: string): ArxFTL {
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

    const { mesh } = this
    if (mesh instanceof Polygons) {
      mesh.calculateNormals()

      // TODO: rotate +90 degrees on Y axis

      const vertices = mesh.flatMap((polygon) => {
        let numberOfVertices = 3
        if (polygon.isQuad()) {
          numberOfVertices = 4
        }

        return polygon.vertices.slice(0, numberOfVertices - 1)
      })

      const origin = vertices[ftlData.header.origin].clone()

      ftlData.vertices = mesh.flatMap((polygon) => {
        const vertices: ArxFtlVertex[] = []
        const normals = polygon.normals as QuadrupleOf<Vector3>

        vertices.push(
          { vector: polygon.vertices[0].clone().sub(origin).toArxData(), norm: normals[0] },
          { vector: polygon.vertices[1].clone().sub(origin).toArxData(), norm: normals[1] },
          { vector: polygon.vertices[2].clone().sub(origin).toArxData(), norm: normals[2] },
        )

        if (polygon.isQuad()) {
          vertices.push(
            { vector: polygon.vertices[2].clone().sub(origin).toArxData(), norm: normals[2] },
            { vector: polygon.vertices[1].clone().sub(origin).toArxData(), norm: normals[1] },
            { vector: polygon.vertices[3].clone().sub(origin).toArxData(), norm: normals[3] },
          )
        }

        return vertices
      })

      ftlData.textureContainers = mesh.getTextureContainers()

      let vertexIdxCntr = 0
      ftlData.faces = mesh.flatMap((polygon) => {
        const faces: ArxFace[] = []
        const normals = polygon.normals as QuadrupleOf<Vector3>

        const faceNormal = getFaceNormal(normals[0], normals[1], normals[2])
        const textureIdx = ftlData.textureContainers.findIndex(({ filename }) => {
          return polygon.texture?.equals(filename)
        })
        faces.push({
          faceType: ArxFaceType.Flat,
          vertexIdx: [vertexIdxCntr, vertexIdxCntr + 1, vertexIdxCntr + 2],
          textureIdx,
          u: [polygon.vertices[0].uv.x, polygon.vertices[1].uv.x, polygon.vertices[2].uv.x],
          v: [polygon.vertices[0].uv.y, polygon.vertices[1].uv.y, polygon.vertices[2].uv.y],
          norm: faceNormal.toArxData(),
        })

        vertexIdxCntr = vertexIdxCntr + 3

        if (polygon.isQuad()) {
          const faceNormal = getFaceNormal(normals[2], normals[1], normals[3])
          faces.push({
            faceType: ArxFaceType.Flat,
            vertexIdx: [vertexIdxCntr, vertexIdxCntr + 1, vertexIdxCntr + 2],
            textureIdx,
            u: [polygon.vertices[2].uv.x, polygon.vertices[1].uv.x, polygon.vertices[3].uv.x],
            v: [polygon.vertices[2].uv.y, polygon.vertices[1].uv.y, polygon.vertices[3].uv.y],
            norm: faceNormal.toArxData(),
          })

          vertexIdxCntr = vertexIdxCntr + 3
        }

        return faces
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
          const lastPolygon = faceIndexes.at(-1) as TripleOf<number>
          lastPolygon[2 - (i % 3)] = i
        }
      })

      const origin = vertices[ftlData.header.origin].vector.clone()

      ftlData.vertices = vertices.map(({ vector, norm }) => {
        return {
          vector: vector.clone().sub(origin).toArxData(),
          norm: norm.toArxData(),
        }
      })

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
          norm: faceNormal.toArxData(),
        }
      })

      let numberOfGroups: number
      if (geometry.groups.length === 0) {
        numberOfGroups = 1
      } else {
        numberOfGroups = geometry.groups.length
      }

      let textures: (Texture | undefined)[] = []
      if (material instanceof MeshBasicMaterial) {
        if (material.map instanceof Texture) {
          textures = repeat(material.map, numberOfGroups)
        } else {
          console.warn('[warning] EntityModel: Unsupported texture map in material when adding threejs mesh')
        }
      } else if (Array.isArray(material)) {
        textures = material.map((material) => {
          if (material instanceof MeshBasicMaterial) {
            if (material.map instanceof Texture) {
              return material.map
            }

            console.warn('[warning] EntityModel: Unsupported texture map in material when adding threejs mesh')
            return undefined
          }

          console.warn('[warning] EntityModel: Unsupported material found when adding threejs mesh')
          return undefined
        })
      } else if (material !== undefined) {
        console.warn('[warning] EntityModel: Unsupported material found when adding threejs mesh')
      }

      ftlData.textureContainers = arrayPadRight(numberOfGroups, undefined, textures).map((t) => {
        return {
          filename: t?.filename ?? '<missing material>',
        }
      })
    }

    return ftlData
  }
}
