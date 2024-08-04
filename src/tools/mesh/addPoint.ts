import { BufferAttribute, BufferGeometry, type Material, Mesh, MeshBasicMaterial, type Vector3 } from 'three'
import { Texture } from '@src/Texture.js'
import { circleOfVectors } from '@src/helpers.js'

/**
 * Adds a point to the mesh by turning the point into a triangle with the given radius
 *
 * @param point - the location where the new polygon will be added
 * @param mesh - containing the geometry and its textures
 * @param texture - the texture of the newly added polygon, default value is the alpha texture of Arx: Texture.alpha
 * @param radius - the size of the newly added polygon, default value is 1
 * @returns a new mesh with the updated geometry
 */
export function addPoint(point: Vector3, mesh: Mesh, texture: Texture = Texture.alpha, radius: number = 1): Mesh {
  const { material, geometry } = mesh

  let materials: Material[]
  if (Array.isArray(material)) {
    materials = material
  } else {
    materials = [material]
  }

  const positions = [...geometry.getAttribute('position').array]
  const normals = [...geometry.getAttribute('normal').array]
  const uvs = [...geometry.getAttribute('uv').array]
  const groups = [...geometry.groups]

  const numberOfPolygons = positions.length / 3
  const numberOfMaterials = materials.length

  // ---------

  circleOfVectors(point, radius, 3).forEach((vertex) => {
    positions.push(vertex.x, vertex.y, vertex.z)
    normals.push(0, -1, 0)
    uvs.push(vertex.x - point.x, vertex.z - point.z)
  })

  groups.push({ start: numberOfPolygons, count: 3, materialIndex: numberOfMaterials })

  materials.push(
    new MeshBasicMaterial({
      map: texture,
    }),
  )

  // ---------

  const newGeometry = new BufferGeometry()
  newGeometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  newGeometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3))
  newGeometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))

  groups.forEach(({ start, count, materialIndex }) => {
    newGeometry.addGroup(start, count, materialIndex)
  })

  return new Mesh(newGeometry, materials)
}
