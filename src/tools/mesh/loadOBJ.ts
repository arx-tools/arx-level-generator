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
import { last } from '@src/faux-ramda.js'
import { getVertices } from './getVertices.js'
import { sum } from '@src/faux-ramda.js'

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
    .replace(/\\\n/g, '')
    .split(/\r?\n/)
    .filter((row) => row.startsWith('f ') || row.startsWith('usemtl '))
    .reduce((groups, row) => {
      if (row.startsWith('usemtl ')) {
        groups.push([])
      } else {
        const verticesPerFace = row.replace(/^f /, '').split(' ').length
        last(groups)?.push(verticesPerFace)
      }

      return groups
    }, [] as number[][])

  const vertices = getVertices(geometry)

  let verticesIndex = 0

  groupedVerticesPerFaces.forEach((group) => {
    const groupHasNonTriangleFace = group.some((verticesPerFace) => verticesPerFace > 3)

    if (!groupHasNonTriangleFace) {
      // group is triangulated, we can skip to next group
      verticesIndex += group.length
      return
    }

    group.forEach((verticesPerFace) => {
      const trianglesPerFace = verticesPerFace - 2

      if (trianglesPerFace === 1) {
        // face is a triangle, we can skip to next face
        verticesIndex += 1
        return
      }

      // revert fan-triangulation done by threeJS' OBJLoader
      const nGon = [vertices[verticesIndex * 3].vector, vertices[verticesIndex * 3 + 1].vector]
      for (let i = 0; i < trianglesPerFace; i++) {
        nGon.push(vertices[verticesIndex * 3 + 2 + i].vector)
      }

      // TODO: triangulate nGon

      // TODO: what about UV coordinates?

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
