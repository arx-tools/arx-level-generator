import fs from 'node:fs'
import path from 'node:path'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { Material } from '@src/Material.js'
import { ArxPolygonFlags } from 'arx-convert/types'
import { scaleUV } from '@tools/mesh/scaleUV.js'
import { Vector3 } from '@src/Vector3.js'
import { Rotation } from '@src/Rotation.js'
import { Texture } from '@src/Texture.js'
import { BufferGeometry, Mesh, MeshBasicMaterial, MeshPhongMaterial, Vector2 } from 'three'
import { Color } from '@src/Color.js'

type OBJProperties = {
  position: Vector3
  scale: Vector3
  rotation: Rotation
  texture: Texture
}

// TODO: turn this into a class:
//   const teddy = new Object('assets/projects/.../teddy-bear') // no extension -> search for both obj and mtl
//   const mesh = teddy.toMesh()
//   mesh.scale(1.2)
//   applyTransformations(mesh)

export const loadOBJ = async (
  filenameWithoutExtension: string,
  { position, scale, rotation, texture }: OBJProperties,
) => {
  const mtlLoader = new MTLLoader()
  const objLoader = new OBJLoader()

  const { dir, name } = path.parse(filenameWithoutExtension)

  // TODO: handle cases when mtl is not present
  const mtlSrc = path.resolve('assets/' + dir + '/' + name + '.mtl')
  const rawMtl = await fs.promises.readFile(mtlSrc, 'utf-8')
  const mtl = mtlLoader.parse(rawMtl, '')

  const entriesOfMaterials = Object.entries(mtl.materialsInfo)
  const nameMaterialPairs: [string, MeshBasicMaterial][] = []

  for (const [name, materialInfo] of entriesOfMaterials) {
    const material = new MeshBasicMaterial({
      name,
      color: Color.white.getHex(),
      map: Material.fromTexture(
        typeof materialInfo.map_kd !== 'undefined'
          ? await Texture.fromCustomFile({
              filename: materialInfo.map_kd,
              sourcePath: dir,
            })
          : texture,
        {
          flags: ArxPolygonFlags.DoubleSided | ArxPolygonFlags.Tiled,
        },
      ),
    })

    nameMaterialPairs.push([name, material])
  }

  const materials = Object.fromEntries(nameMaterialPairs)

  const objSrc = path.resolve('assets/' + dir + '/' + name + '.obj')
  const rawObj = await fs.promises.readFile(objSrc, 'utf-8')
  const obj = objLoader.parse(rawObj)

  const meshes: Mesh[] = []

  const children = obj.children.filter((child) => {
    return child instanceof Mesh
  }) as Mesh<BufferGeometry, MeshPhongMaterial[]>[]

  children.forEach((child) => {
    const material = child.material.map(({ name }) => {
      return materials[name]
    })

    const geometry = child.geometry
    geometry.scale(scale.x, scale.y, scale.z)
    geometry.rotateX(rotation.x)
    geometry.rotateY(rotation.y)
    geometry.rotateZ(rotation.z)
    geometry.translate(position.x, position.y, position.z)

    // TODO: this only scales the 1st texture
    // TODO: Texture._makeTileable resizing when texture is not square needs to be done
    // scaleUV(new Vector2(3, 3), geometry)

    meshes.push(new Mesh(geometry, material))
  })

  return meshes
}
