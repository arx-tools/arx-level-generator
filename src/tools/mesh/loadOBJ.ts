import fs from 'node:fs'
import path from 'node:path'
import { ArxPolygonFlags } from 'arx-convert/types'
import { BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial, MeshPhongMaterial, Vector2 } from 'three'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { Material } from '@src/Material.js'
import { Rotation } from '@src/Rotation.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { applyTransformations, fileExists } from '@src/helpers.js'
import { getVertices } from '@tools/mesh/getVertices.js'
import { scaleUV as scaleUVTool } from '@tools/mesh/scaleUV.js'
import { toArxCoordinateSystem } from '@tools/mesh/toArxCoordinateSystem.js'

type loadOBJProperties = {
  /**
   * default value is undefined
   */
  position?: Vector3
  /**
   * default value is undefined
   */
  scale?: number | Vector3
  /**
   * default value is undefined
   */
  scaleUV?: number | Vector2 | ((texture: Texture) => number | Vector2)
  /**
   * default value is undefined
   */
  orientation?: Rotation
  /**
   * default value is (ArxPolygonFlags.DoubleSided | ArxPolygonFlags.Tiled)
   */
  materialFlags?: ArxPolygonFlags | ((texture: Texture) => ArxPolygonFlags | undefined)
  /**
   * default value is Texture.missingTexture with the same flags as materialFlags
   */
  fallbackTexture?: Texture
  /**
   * default value is false
   */
  reversedPolygonWinding?: boolean
}

const isTriangulatedMesh = (rawObj: string) => {
  const rows = rawObj.replace(/\\\n/g, '').split(/\r?\n/)

  const isNotTriangulated = rows.some((row) => {
    if (!row.startsWith('f ')) {
      return false
    }

    return row.trim().split(' ').length > 4
  })

  return !isNotTriangulated
}

const reversePolygonWinding = (rawObj: string) => {
  let rows = rawObj.replace(/\\\n/g, '').split(/\r?\n/)

  rows = rows.map((row) => {
    if (!row.startsWith('f')) {
      return row
    }

    const [, ...coords] = row.trim().split(' ')
    return 'f ' + coords.reverse().join(' ')
  })

  return rows.join('\n')
}

/**
 * Loads an obj file and an optional mtl file
 *
 * @see https://en.wikipedia.org/wiki/Wavefront_.obj_file
 */
export const loadOBJ = async (
  filenameWithoutExtension: string,
  {
    position,
    scale,
    scaleUV,
    orientation,
    materialFlags,
    fallbackTexture,
    reversedPolygonWinding = false,
  }: loadOBJProperties = {},
) => {
  const mtlLoader = new MTLLoader()
  const objLoader = new OBJLoader()

  const { dir, name: filename } = path.parse(filenameWithoutExtension)

  const mtlSrc = path.resolve('assets/' + dir + '/' + filename + '.mtl')

  let materials: MeshBasicMaterial | Record<string, MeshBasicMaterial>

  let defaultTexture: Material
  if (typeof materialFlags === 'function') {
    const flags = materialFlags(Texture.missingTexture)
    defaultTexture = Material.fromTexture(Texture.missingTexture, {
      flags: flags ?? ArxPolygonFlags.DoubleSided | ArxPolygonFlags.Tiled,
    })
  } else {
    defaultTexture = Material.fromTexture(Texture.missingTexture, {
      flags: materialFlags ?? ArxPolygonFlags.DoubleSided | ArxPolygonFlags.Tiled,
    })
  }

  if (await fileExists(mtlSrc)) {
    try {
      const rawMtl = await fs.promises.readFile(mtlSrc, 'utf-8')
      const mtl = mtlLoader.parse(rawMtl, '')

      const entriesOfMaterials = Object.entries(mtl.materialsInfo)
      const nameMaterialPairs: [string, MeshBasicMaterial][] = []

      for (const [name, materialInfo] of entriesOfMaterials) {
        let material: Material

        if (typeof materialInfo.map_kd !== 'undefined') {
          const textureFromFile = Texture.fromCustomFile({
            filename: path.parse(materialInfo.map_kd).base,
            sourcePath: [dir, path.parse(materialInfo.map_kd).dir].filter((row) => row !== '').join('/'),
          })

          if (typeof materialFlags === 'function') {
            const flags = materialFlags(textureFromFile)
            material = Material.fromTexture(textureFromFile, {
              flags: flags ?? ArxPolygonFlags.DoubleSided | ArxPolygonFlags.Tiled,
            })
          } else {
            material = Material.fromTexture(textureFromFile, {
              flags: materialFlags ?? ArxPolygonFlags.DoubleSided | ArxPolygonFlags.Tiled,
            })
          }
        } else {
          console.info(`Material "${name}" in ${filename}.mtl doesn't have a texture, using fallback/default texture`)
          material = Material.fromTexture(fallbackTexture ?? defaultTexture)
        }

        if (material.flags & ArxPolygonFlags.Transparent) {
          material.opacity = 50
        }

        const meshMaterial = new MeshBasicMaterial({
          name,
          map: material,
        })

        nameMaterialPairs.push([name, meshMaterial])
      }

      materials = Object.fromEntries(nameMaterialPairs)
    } catch (e: unknown) {
      console.error(`Error while parsing ${filename}.mtl file:`, e)
      materials = new MeshBasicMaterial({
        name: filename,
        map: fallbackTexture ?? defaultTexture,
      })
    }
  } else {
    materials = new MeshBasicMaterial({
      name: filename,
      map: fallbackTexture ?? defaultTexture,
    })
  }

  const objSrc = path.resolve('assets/' + dir + '/' + filename + '.obj')
  let rawObj = await fs.promises.readFile(objSrc, 'utf-8')

  if (!isTriangulatedMesh(rawObj)) {
    console.warn(`loadOBJ warning: ${filename}.obj is not triangulated`)
  }

  if (reversedPolygonWinding) {
    rawObj = reversePolygonWinding(rawObj)
  }

  let obj = objLoader.parse(rawObj)

  // the Y axis in Arx is flipped
  obj = toArxCoordinateSystem(obj)

  // 1 meter in blender = 1 centimeter in Arx
  obj.scale.multiply(new Vector3(100, 100, 100))
  applyTransformations(obj)

  const meshes: Mesh[] = []

  const children = obj.children.filter((child) => {
    return child instanceof Mesh
  }) as Mesh<BufferGeometry, MeshPhongMaterial[]>[]

  children.forEach((child) => {
    let material: MeshBasicMaterial | MeshBasicMaterial[]

    if (Array.isArray(child.material)) {
      material = child.material.map(({ name }) => {
        return materials instanceof MeshBasicMaterial ? materials : materials[name]
      })
    } else {
      const name = (child.material as MeshPhongMaterial).name
      material =
        materials instanceof MeshBasicMaterial
          ? materials
          : materials[name] ??
            new MeshBasicMaterial({
              name: 'fallback-texture',
              map: defaultTexture,
            })
    }

    const geometry = child.geometry

    if (scale) {
      if (typeof scale === 'number') {
        geometry.scale(scale, scale, scale)
      } else {
        geometry.scale(scale.x, scale.y, scale.z)
      }
    }

    if (orientation) {
      geometry.rotateX(orientation.x)
      geometry.rotateY(orientation.y)
      geometry.rotateZ(orientation.z)
    }

    if (position) {
      geometry.translate(position.x, position.y, position.z)
    }

    if (scaleUV) {
      if (typeof scaleUV === 'number') {
        scaleUVTool(new Vector2(scaleUV, scaleUV), geometry)
      } else if (scaleUV instanceof Vector2) {
        scaleUVTool(scaleUV, geometry)
      } else {
        if (Array.isArray(material)) {
          // we have multiple materials
          material.forEach((singleMaterial, indexOfMaterial) => {
            const rawScale = scaleUV(singleMaterial.map as Texture)
            const scale = typeof rawScale === 'number' ? new Vector2(rawScale, rawScale) : rawScale
            if (geometry.groups.length === 0) {
              // the geometry only has 1 material
              scaleUVTool(scale, geometry)
            } else {
              // the geometry has groups, we only rescale UVs for vertices which have the same
              // materialIndex as our currently selected material
              const uv = geometry.getAttribute('uv') as BufferAttribute
              getVertices(geometry).forEach(({ idx, materialIndex }) => {
                if (indexOfMaterial === materialIndex) {
                  const u = uv.getX(idx) * scale.x
                  const v = uv.getY(idx) * scale.y
                  uv.setXY(idx, u, v)
                }
              })
            }
          })
        } else {
          const rawScale = scaleUV(material.map as Texture)
          const scale = typeof rawScale === 'number' ? new Vector2(rawScale, rawScale) : rawScale
          scaleUVTool(scale, geometry)
        }
      }
    }

    meshes.push(new Mesh(geometry, material))
  })

  return meshes
}
