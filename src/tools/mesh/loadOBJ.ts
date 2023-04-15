import fs from 'node:fs'
import path from 'node:path'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { Material } from '@src/Material.js'
import { ArxPolygonFlags } from 'arx-convert/types'
import { scaleUV } from '@tools/mesh/scaleUV.js'
import { Vector3 } from '@src/Vector3.js'
import { Rotation } from '@src/Rotation.js'
import { Texture } from '@src/Texture.js'
import { Mesh, MeshBasicMaterial, Vector2 } from 'three'
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

// TODO: add support for mtl file
export const loadOBJ = async (filename: string, { position, scale, rotation, texture }: OBJProperties) => {
  const src = path.resolve(filename)
  const raw = await fs.promises.readFile(src, 'utf-8')
  const loader = new OBJLoader()
  const obj = loader.parse(raw)

  const meshes: Mesh[] = []

  obj.children.forEach((child) => {
    if (child instanceof Mesh) {
      const { geometry } = child
      geometry.scale(scale.x, scale.y, scale.z)
      geometry.rotateX(rotation.x)
      geometry.rotateY(rotation.y)
      geometry.rotateZ(rotation.z)
      geometry.translate(position.x, position.y, position.z)
      scaleUV(new Vector2(3, 3), geometry)
      const material = new MeshBasicMaterial({
        color: Color.white.getHex(),
        map: Material.fromTexture(texture, {
          flags: ArxPolygonFlags.DoubleSided,
        }),
      })

      meshes.push(new Mesh(geometry, material))
    }
  })

  return meshes
}
