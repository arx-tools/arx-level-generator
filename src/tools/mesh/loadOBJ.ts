import fs from 'node:fs'
import path from 'node:path'
import { ArxPolygonFlags } from 'arx-convert/types'
import { BufferGeometry, Mesh, MeshBasicMaterial, MeshPhongMaterial, Vector2 } from 'three'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { Color } from '@src/Color.js'
import { Material } from '@src/Material.js'
import { Rotation } from '@src/Rotation.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { applyTransformations, fileExists } from '@src/helpers.js'
import { scaleUV as scaleUVTool } from '@tools/mesh/scaleUV.js'
import { toArxCoordinateSystem } from '@tools/mesh/toArxCoordinateSystem.js'

type OBJProperties = {
  position?: Vector3
  scale?: number | Vector3
  scaleUV?: number | Vector2
  rotation?: Rotation
  materialFlags?: ArxPolygonFlags | ((texture: Texture) => ArxPolygonFlags | undefined)
  fallbackTexture?: Texture
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

export const loadOBJ = async (
  filenameWithoutExtension: string,
  { position, scale, scaleUV, rotation, materialFlags, fallbackTexture }: OBJProperties,
) => {
  const mtlLoader = new MTLLoader()
  const objLoader = new OBJLoader()

  const { dir, name } = path.parse(filenameWithoutExtension)

  const mtlSrc = path.resolve('assets/' + dir + '/' + name + '.mtl')

  let materials: MeshBasicMaterial | Record<string, MeshBasicMaterial>

  let defaultTexture: Material
  if (typeof materialFlags === 'function') {
    const flags = materialFlags(await Texture.missingTexture)
    defaultTexture = Material.fromTexture(await Texture.missingTexture, {
      flags: flags ?? ArxPolygonFlags.DoubleSided | ArxPolygonFlags.Tiled,
    })
  } else {
    defaultTexture = Material.fromTexture(await Texture.missingTexture, {
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
        let textureMap: Texture = fallbackTexture ?? defaultTexture

        if (typeof materialInfo.map_kd !== 'undefined') {
          const textureFromFile = await Texture.fromCustomFile({
            filename: path.parse(materialInfo.map_kd).base,
            sourcePath: [dir, path.parse(materialInfo.map_kd).dir].filter((row) => row !== '').join('/'),
          })

          if (typeof materialFlags === 'function') {
            const flags = materialFlags(textureFromFile)
            textureMap = Material.fromTexture(textureFromFile, {
              flags: flags ?? ArxPolygonFlags.DoubleSided | ArxPolygonFlags.Tiled,
            })
          } else {
            textureMap = Material.fromTexture(textureFromFile, {
              flags: materialFlags ?? ArxPolygonFlags.DoubleSided | ArxPolygonFlags.Tiled,
            })
          }
        }

        const material = new MeshBasicMaterial({
          name,
          map: textureMap,
        })

        nameMaterialPairs.push([name, material])
      }

      materials = Object.fromEntries(nameMaterialPairs)
    } catch (e: unknown) {
      console.error(`Error while parsing ${name}.mtl file:`, e)
      materials = new MeshBasicMaterial({
        name,
        map: fallbackTexture ?? defaultTexture,
      })
    }
  } else {
    materials = new MeshBasicMaterial({
      name,
      map: fallbackTexture ?? defaultTexture,
    })
  }

  const objSrc = path.resolve('assets/' + dir + '/' + name + '.obj')
  const rawObj = await fs.promises.readFile(objSrc, 'utf-8')

  if (!isTriangulatedMesh(rawObj)) {
    console.warn(`loadOBJ warning: ${name}.obj is not triangulated`)
  }

  let obj = objLoader.parse(rawObj)

  // the Y axis in Arx is flipped
  obj = toArxCoordinateSystem(obj)

  // 1 meter in blender = 1 centimeter in Arx
  obj.scale.multiply(new Vector3(100, 100, 100))
  applyTransformations(obj)

  const meshes: Mesh[] = []

  const children = obj.children.filter((child) => child instanceof Mesh) as Mesh<BufferGeometry, MeshPhongMaterial[]>[]

  children.forEach((child) => {
    let material: MeshBasicMaterial | MeshBasicMaterial[]

    if (Array.isArray(child.material)) {
      material = child.material.map(({ name }) => {
        return materials instanceof MeshBasicMaterial ? materials : materials[name]
      })
    } else {
      material = materials instanceof MeshBasicMaterial ? materials : Object.values(materials)[0]
    }

    const geometry = child.geometry

    if (scale) {
      if (typeof scale === 'number') {
        geometry.scale(scale, scale, scale)
      } else {
        geometry.scale(scale.x, scale.y, scale.z)
      }
    }

    if (rotation) {
      geometry.rotateX(rotation.x)
      geometry.rotateY(rotation.y)
      geometry.rotateZ(rotation.z)
    }

    if (position) {
      geometry.translate(position.x, position.y, position.z)
    }

    if (scaleUV) {
      // TODO: this only scales the 1st texture
      // TODO: Texture._makeTileable resizing when texture is not square needs to be done
      if (typeof scaleUV === 'number') {
        scaleUVTool(new Vector2(scaleUV, scaleUV), geometry)
      } else {
        scaleUVTool(scaleUV, geometry)
      }
    }

    meshes.push(new Mesh(geometry, material))
  })

  return meshes
}
