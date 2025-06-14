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
import type { Rotation } from '@src/Rotation.js'
import { Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { applyTransformations } from '@src/helpers.js'
import type { VerticalAlign } from '@src/types.js'
import { fileOrFolderExists, readTextFile } from '@platform/node/io.js'
import { getVertices } from '@tools/mesh/getVertices.js'
import { scaleUV as scaleUVTool } from '@tools/mesh/scaleUV.js'
import { toArxCoordinateSystem } from '@tools/mesh/toArxCoordinateSystem.js'

type loadOBJProperties = {
  /**
   * Move the mesh to a given position
   *
   * default value is `undefined`, which is equivalent to `new Vector3(0, 0, 0)`
   */
  position?: Vector3
  /**
   * Resize the mesh. You can scale the mesh evenly on all 3 axis by specifying a single number,
   * but resizing on all 3 axis independently is also possible with a `Vector3`
   *
   * default value is `undefined`, which is equivalent to `1` or `new Vector3(1, 1, 1)`
   */
  scale?: number | Vector3
  /**
   * Resize the texture uv mapping. You can scale the uv coordinates evenly on both axis with a single number,
   * or independently on both axis with a `Vector2`. It is also possible to pass in a function that will
   * get called for every texture that the model has and you can specify scaling to them separately.
   *
   * see {@link scaleUVTool @tools/mesh/scaleUV} on negative numbers can be used for flipping a texture
   *
   * default value is `undefined`, which is equivalent to `1` or `new Vector2(1, 1)`
   */
  scaleUV?: number | Vector2 | ((texture: Texture) => number | Vector2)
  /**
   * default value is `undefined`
   */
  orientation?: Rotation
  /**
   * default value is ({@link ArxPolygonFlags.DoubleSided} | {@link ArxPolygonFlags.Tiled})
   * which is also the same as what you will get as the value for defaultFlags when
   * you pass a function as the value
   */
  materialFlags?: ArxPolygonFlags | ((texture: Texture, defaultFlags: ArxPolygonFlags) => ArxPolygonFlags)
  /**
   * default value is `Texture.missingTexture` with the same flags as `materialFlags`
   */
  fallbackTexture?: Texture
  /**
   * Polygon winding determines where each face of a model is facing.
   *
   * Reverse the polygon winding to turn a model inside out (or fix it if it looks already turned inside out).
   *
   * default value is `false`
   */
  reversedPolygonWinding?: boolean
  /**
   * aligns the center of the model to `0/0/0`
   *
   * default value is `false`
   */
  centralize?: boolean
  /**
   * Aligns an object's y axis to `0/0/0` if `centralize` prop is `true`
   *
   * - `"bottom"` will make all the points of the model above `0/0/0`
   * - `"top"` will make all the points of the model below `0/0/0`
   * - `"middle"` keeps the model in the middle
   *
   * default value is `"middle"`
   */
  verticalAlign?: VerticalAlign
}

/**
 * long lines can be broken up [in obj files] using a backslash (`\`) character at the end of lines
 * to be continued on new lines
 *
 * @source https://www.loc.gov/preservation/digital/formats/fdd/fdd000507.shtml
 */
function joinSplitObjLines(rawObj: string): string {
  return rawObj.replaceAll('\\\n', '')
}

function toRows(rawObj: string): string[] {
  return joinSplitObjLines(rawObj).split(/\r?\n/)
}

function isMeshTriangulated(rawObj: string): boolean {
  const rows = toRows(rawObj)

  const isNotTriangulated = rows.some((row) => {
    if (!row.startsWith('f ')) {
      return false
    }

    return row.trim().split(' ').length > 4
  })

  return !isNotTriangulated
}

/**
 * Polygon winding determines where the faces of each polygon face.
 *
 * Reversing the winding of polygons can make a model turn inside out
 * (or fix that if it already looks inside out).
 *
 * @param rawObj contents of an OBJ file
 */
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

    return `# ${row}`
  })

  return rows.join('\n')
}

function getMaterialFlags(texture: Texture, materialFlags: loadOBJProperties['materialFlags']): ArxPolygonFlags {
  const defaultFlags = ArxPolygonFlags.DoubleSided | ArxPolygonFlags.Tiled

  if (typeof materialFlags === 'function') {
    return materialFlags(texture, defaultFlags)
  }

  return materialFlags ?? defaultFlags
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

  let fallbackMaterial: Material
  if (fallbackTexture === undefined) {
    fallbackMaterial = Material.fromTexture(Texture.missingTexture, {
      flags: getMaterialFlags(Texture.missingTexture, materialFlags),
    })
  } else {
    fallbackMaterial = Material.fromTexture(fallbackTexture, {
      flags: getMaterialFlags(fallbackTexture, materialFlags),
    })
  }

  let materials: MeshBasicMaterial | Record<string, MeshBasicMaterial>

  if (await fileOrFolderExists(mtlSrc)) {
    try {
      const rawMtl = await readTextFile(mtlSrc)
      const mtl = mtlLoader.parse(rawMtl, '')

      const entriesOfMaterials = Object.entries(mtl.materialsInfo)
      const nameMaterialPairs: [name: string, material: MeshBasicMaterial][] = []

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
            sourcePath: [dir, path.parse(materialInfo.map_kd).dir]
              .filter((row) => {
                return row !== ''
              })
              .join('/'),
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
 * Loads an OBJ file and an optional MTL file
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
  let rawObj = await readTextFile(objSrc)

  if (!isMeshTriangulated(rawObj)) {
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
        if (materials instanceof MeshBasicMaterial) {
          return materials
        }

        return materials[name] ?? fallbackMeshMaterial
      })
    } else {
      const { name } = child.material as MeshPhongMaterial

      if (materials instanceof MeshBasicMaterial) {
        material = materials
      } else {
        material = materials[name] ?? fallbackMeshMaterial
      }
    }

    const { geometry } = child

    if (scale) {
      if (typeof scale === 'number') {
        geometry.scale(scale, scale, scale)
      } else {
        geometry.scale(scale.x, scale.y, scale.z)
      }
    }

    geometry.computeBoundingBox()

    if (centralize === true) {
      const boundingBox = geometry.boundingBox as Box3

      const offset = new Vector3()
      boundingBox.getCenter(offset)

      if (verticalAlign === 'top') {
        offset.y = boundingBox.min.y
      } else if (verticalAlign === 'bottom') {
        offset.y = boundingBox.max.y
      }

      offset.multiplyScalar(-1)

      if (offset.length() !== 0) {
        geometry.translate(offset.x, offset.y, offset.z)
        geometry.computeBoundingBox()
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
      } else if (Array.isArray(material)) {
        // we have multiple materials
        material.forEach((singleMaterial, indexOfMaterial) => {
          const rawScale = scaleUV(singleMaterial.map as Texture)

          let scale: Vector2
          if (typeof rawScale === 'number') {
            scale = new Vector2(rawScale, rawScale)
          } else {
            scale = rawScale
          }

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

        let scale: Vector2
        if (typeof rawScale === 'number') {
          scale = new Vector2(rawScale, rawScale)
        } else {
          scale = rawScale
        }

        scaleUVTool(scale, geometry)
      }
    }

    meshes.push(new Mesh(geometry, material))
  })

  const tmp: MeshBasicMaterial[] = [fallbackMeshMaterial]
  if (materials instanceof MeshBasicMaterial) {
    tmp.push(materials)
  } else {
    tmp.push(...Object.values(materials))
  }

  const materialList = tmp
    .map(({ map }) => {
      if (map === null) {
        return undefined
      }

      // changing type from three.js' Texture to our own Texture
      return map as Texture
    })
    .filter((texture) => {
      return texture !== undefined
    })

  return { meshes, materials: materialList }
}
