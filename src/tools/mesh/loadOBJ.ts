import fs from 'node:fs'
import path from 'node:path'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { Material } from '@src/Material.js'
import { ArxPolygonFlags } from 'arx-convert/types'
import { scaleUV as scaleUVTool } from '@tools/mesh/scaleUV.js'
import { Vector3 } from '@src/Vector3.js'
import { Rotation } from '@src/Rotation.js'
import { Texture } from '@src/Texture.js'
import { BufferGeometry, Mesh, MeshBasicMaterial, MeshPhongMaterial, Vector2 } from 'three'
import { Color } from '@src/Color.js'
import { fileExists } from '@src/helpers.js'
import { last, uniq } from '@src/faux-ramda.js'
import { getVertices } from './getVertices.js'
import { TripleOf } from 'arx-convert/utils'

type OBJProperties = {
  position?: Vector3
  scale?: number | Vector3
  scaleUV?: number | Vector2
  rotation?: Rotation
  materialFlags?: ArxPolygonFlags
  fallbackTexture?: Texture
}

// TODO: turn this into a class:
//   const teddy = new Object('assets/projects/.../teddy-bear') // no extension -> search for both obj and mtl
//   const mesh = teddy.toMesh()
//   mesh.scale(1.2)
//   applyTransformations(mesh)

const missingTexture = Texture.fromCustomFile({
  filename: 'jorge-[stone].jpg',
  sourcePath: 'textures',
  size: 32,
})

const reTriangulateGeometry = (geometry: BufferGeometry, rawObjDefinition: string) => {
  const groupedVerticesPerFaces = rawObjDefinition
    //.replace(/\\\n/g, '')
    .split(/\r?\n/)
    .reduce((groups, row, index) => {
      if (!row.startsWith('f ') && !row.startsWith('usemtl ')) {
        return groups
      }

      if (row.startsWith('usemtl ')) {
        groups.push([])
      } else {
        const vertices = row.replace(/^f /, '').split(' ')
        last(groups)?.push({
          faceDefinition: row,
          lineNumber: index + 1,
          numberOfVertices: vertices.length,
          isCoplanar:
            uniq(
              vertices.map((triplets) => {
                const [vertexIndex, uvIndex, normalIndex] = triplets
                  .split('/')
                  .map((n) => parseInt(n)) as TripleOf<number>
                return normalIndex
              }),
            ).length === 1,
        })
      }

      return groups
    }, [] as { faceDefinition: string; lineNumber: number; numberOfVertices: number; isCoplanar: boolean }[][])

  const vertices = getVertices(geometry)

  let verticesIndex = 0

  groupedVerticesPerFaces.forEach((group) => {
    const groupHasNonTriangleFace = group.some((face) => face.numberOfVertices > 3)

    if (!groupHasNonTriangleFace) {
      // group is triangulated, we can skip to next group
      verticesIndex += group.length
      return
    }

    group.forEach((face) => {
      const trianglesPerFace = face.numberOfVertices - 2

      if (trianglesPerFace === 1) {
        // face is a triangle, we can skip to next face
        verticesIndex += 1
        // TODO: copy this triangle to the new geometry, as this does not change
        return
      }

      if (!face.isCoplanar) {
        // obj files don't contain enough information
        console.warn(
          `skipping re-triangulation of non-coplanar face definition at line ${face.lineNumber}: ${face.faceDefinition}`,
        )
        verticesIndex += trianglesPerFace
        // TODO: copy these triangles to the new geometry, as these don't change
        return
      }

      // revert fan-triangulation done by threeJS' OBJLoader
      const nGon = [
        vertices[verticesIndex * 3].vector,
        vertices[verticesIndex * 3 + 1].vector,
        vertices[verticesIndex * 3 + 2].vector,
      ]
      for (let i = 1; i < trianglesPerFace; i++) {
        nGon.push(vertices[(verticesIndex + i) * 3 + 2].vector)
      }

      // for debugging to see how the shape looks like:
      // https://www.mathsisfun.com/data/cartesian-coordinates-interactive.html
      // nGon.forEach((vector) => {
      //   console.log('( ' + (vector.x * 10) + ', ' + (vector.y * 10) + ' ),')
      // })

      // TODO: triangulate nGon

      // TODO: what about UV coordinates?
      // const uvs: BufferAttribute = threeJsObj.geometry.getAttribute('uv') as BufferAttribute
      // uvs.getX(idx) / uvs.getY(idx) -> idx === vertices[vertexIndex].idx

      verticesIndex += trianglesPerFace
    })
  })

  // TODO: create a new geometry from the old one
  const newGeometry = geometry

  return newGeometry
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

  const defaultTexture = Material.fromTexture(await missingTexture, {
    flags: materialFlags ?? ArxPolygonFlags.None,
  })

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
            filename: materialInfo.map_kd,
            sourcePath: dir,
          })

          textureMap = Material.fromTexture(textureFromFile, {
            flags: materialFlags ?? ArxPolygonFlags.DoubleSided | ArxPolygonFlags.Tiled,
          })
        }

        const material = new MeshBasicMaterial({
          name,
          color: Color.white.getHex(),
          map: textureMap,
        })

        nameMaterialPairs.push([name, material])
      }

      materials = Object.fromEntries(nameMaterialPairs)
    } catch (e: unknown) {
      console.error(`Error while parsing ${name}.mtl file:`, e)
      materials = new MeshBasicMaterial({
        name,
        color: Color.white.getHex(),
        map: fallbackTexture ?? defaultTexture,
      })
    }
  } else {
    materials = new MeshBasicMaterial({
      name,
      color: Color.white.getHex(),
      map: fallbackTexture ?? defaultTexture,
    })
  }

  const objSrc = path.resolve('assets/' + dir + '/' + name + '.obj')
  const rawObj = await fs.promises.readFile(objSrc, 'utf-8')
  const obj = objLoader.parse(rawObj)

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

    const geometry = reTriangulateGeometry(child.geometry, rawObj)

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
