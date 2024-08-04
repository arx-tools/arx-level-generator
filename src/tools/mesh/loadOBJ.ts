import fs from 'node:fs/promises'
import path from 'node:path'
import { ArxPolygonFlags } from 'arx-convert/types'
import {
  type Box3,
  type BufferAttribute,
  type BufferGeometry,
  Mesh,
  MeshBasicMaterial,
  type MeshPhongMaterial,
  Vector2,
} from 'three'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { Material } from '@src/Material.js'
import { type Rotation } from '@src/Rotation.js'
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
   * which is also the same as what you will get as the value for defaultFlags when
   * you pass a function as the value
   */
  materialFlags?: ArxPolygonFlags | ((texture: Texture, defaultFlags: ArxPolygonFlags) => ArxPolygonFlags)
  /**
   * default value is Texture.missingTexture with the same flags as materialFlags
   */
  fallbackTexture?: Texture
  /**
   * default value is false
   */
  reversedPolygonWinding?: boolean
  /**
   * aligns the center of the model to 0/0/0
   *
   * default value is false
   */
  centralize?: boolean
  /**
   * Aligns an object's y axis to 0/0/0
   *
   * - `"bottom"` will make all the points of the model above 0/0/0
   * - `"top"` will make all the points of the model below 0/0/0
   * - `"center"` keeps the model in the middle
   *
   * if centralize is true then the default value is 'center'
   * otherwise undefined
   */
  verticalAlign?: 'bottom' | 'center' | 'top'
}

function toRows(rawObj: string): string[] {
  // long lines can be broken up, using a backslash (\) character at the end of lines to be continued
  // (source: https://www.loc.gov/preservation/digital/formats/fdd/fdd000507.shtml)
  rawObj = rawObj.replaceAll('\\\n', '')

  return rawObj.split(/\r?\n/)
}

function isTriangulatedMesh(rawObj: string): boolean {
  const rows = toRows(rawObj)

  const isNotTriangulated = rows.some((row) => {
    if (!row.startsWith('f ')) {
      return false
    }

    return row.trim().split(' ').length > 4
  })

  return !isNotTriangulated
}

function reversePolygonWinding(rawObj: string): string {
  let rows = toRows(rawObj)

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
 * comments out lines that start with `"l "` by placing a `"# "` before it
 */
function removeLineElements(rawObj: string): string {
  let rows = toRows(rawObj)

  rows = rows.map((row) => {
    if (!row.startsWith('l')) {
      return row
    }

    return '# ' + row
  })

  return rows.join('\n')
}

function getMaterialFlags(texture: Texture, materialFlags: loadOBJProperties['materialFlags']): ArxPolygonFlags {
  const defaultFlags = ArxPolygonFlags.DoubleSided | ArxPolygonFlags.Tiled
  return typeof materialFlags === 'function' ? materialFlags(texture, defaultFlags) : (materialFlags ?? defaultFlags)
}

async function loadMTL(
  filenameWithoutExtension: string,
  { materialFlags, fallbackTexture }: Pick<loadOBJProperties, 'materialFlags' | 'fallbackTexture'> = {},
): Promise<{
  materials: MeshBasicMaterial | Record<string, MeshBasicMaterial>
  fallbackMaterial: Material
}> {
  const mtlLoader = new MTLLoader()

  const { dir, name: filename } = path.parse(filenameWithoutExtension)

  const mtlSrc = path.resolve('assets/' + dir + '/' + filename + '.mtl')

  const fallbackMaterial =
    fallbackTexture === undefined
      ? Material.fromTexture(Texture.missingTexture, {
          flags: getMaterialFlags(Texture.missingTexture, materialFlags),
        })
      : Material.fromTexture(fallbackTexture, {
          flags: getMaterialFlags(fallbackTexture, materialFlags),
        })

  let materials: MeshBasicMaterial | Record<string, MeshBasicMaterial>

  if (await fileExists(mtlSrc)) {
    try {
      const rawMtl = await fs.readFile(mtlSrc, 'utf8')
      const mtl = mtlLoader.parse(rawMtl, '')

      const entriesOfMaterials = Object.entries(mtl.materialsInfo)
      const nameMaterialPairs: [string, MeshBasicMaterial][] = []

      for (const [name, materialInfo] of entriesOfMaterials) {
        let material: Material

        if (materialInfo.map_kd === undefined) {
          console.info(
            `[info] loadOBJ: Material "${name}" in "${filename}.mtl" doesn't have a texture, using fallback/default texture`,
          )
          material = fallbackMaterial
        } else {
          const textureFromFile = Texture.fromCustomFile({
            filename: path.parse(materialInfo.map_kd).base,
            sourcePath: [dir, path.parse(materialInfo.map_kd).dir].filter((row) => row !== '').join('/'),
          })

          const flags = getMaterialFlags(textureFromFile, materialFlags)
          material = Material.fromTexture(textureFromFile, { flags })
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
    } catch (error: unknown) {
      console.error(`[error] loadOBJ: error while parsing ${filename}.mtl file:`, error)
      materials = new MeshBasicMaterial({
        name: filename,
        map: fallbackMaterial,
      })
    }
  } else {
    materials = new MeshBasicMaterial({
      name: filename,
      map: fallbackMaterial,
    })
  }

  return {
    materials,
    fallbackMaterial,
  }
}

/**
 * Loads an obj file and an optional mtl file
 *
 * @see https://en.wikipedia.org/wiki/Wavefront_.obj_file
 */
export async function loadOBJ(
  filenameWithoutExtension: string,
  {
    position,
    scale,
    scaleUV,
    orientation,
    materialFlags,
    fallbackTexture,
    reversedPolygonWinding = false,
    centralize = false,
    verticalAlign,
  }: loadOBJProperties = {},
): Promise<{
  meshes: Mesh[]
  materials: Texture[]
}> {
  const { materials, fallbackMaterial } = await loadMTL(filenameWithoutExtension, {
    materialFlags,
    fallbackTexture,
  })
  const fallbackMeshMaterial = new MeshBasicMaterial({
    name: 'fallback-texture',
    map: fallbackMaterial,
  })

  const objLoader = new OBJLoader()

  const { dir, name: filename } = path.parse(filenameWithoutExtension)

  const objSrc = path.resolve('assets/' + dir + '/' + filename + '.obj')
  let rawObj = await fs.readFile(objSrc, 'utf8')

  if (!isTriangulatedMesh(rawObj)) {
    console.warn(`[warning] loadOBJ: ${filename}.obj is not triangulated`)
  }

  // objLoader can't seem to be able to load line elements
  rawObj = removeLineElements(rawObj)

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
        return materials instanceof MeshBasicMaterial ? materials : (materials[name] ?? fallbackMeshMaterial)
      })
    } else {
      const name = (child.material as MeshPhongMaterial).name
      material = materials instanceof MeshBasicMaterial ? materials : (materials[name] ?? fallbackMeshMaterial)
    }

    const geometry = child.geometry

    if (scale) {
      if (typeof scale === 'number') {
        geometry.scale(scale, scale, scale)
      } else {
        geometry.scale(scale.x, scale.y, scale.z)
      }
    }

    geometry.computeBoundingBox()

    const boundingBox = geometry.boundingBox as Box3
    const halfDimensions = boundingBox.max.clone().sub(boundingBox.min).divideScalar(2)

    let x = 0
    let y = 0
    let z = 0

    if (centralize === true) {
      x = -boundingBox.min.x - halfDimensions.x
      z = -boundingBox.min.z - halfDimensions.z
      if (typeof verticalAlign === 'undefined') {
        verticalAlign = 'center'
      }
    }

    switch (verticalAlign) {
      case 'bottom': {
        y = -boundingBox.max.y
        break
      }

      case 'center': {
        y = -boundingBox.min.y - halfDimensions.y
        break
      }

      case 'top': {
        y = -boundingBox.min.y
        break
      }
    }

    if (x !== 0 || y !== 0 || z !== 0) {
      geometry.translate(x, y, z)
      geometry.computeBoundingBox()
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

  const materialList = [
    fallbackMeshMaterial,
    ...(materials instanceof MeshBasicMaterial ? [materials] : Object.values(materials)),
  ]
    .map(({ map }) => map)
    .filter((texture) => texture !== null) as Texture[]

  return { meshes, materials: materialList }
}
