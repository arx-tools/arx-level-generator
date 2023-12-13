import { BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import { Texture } from '@src/Texture.js'
import { circleOfVectors } from '@src/helpers.js'

/**
 * Adds a point to the mesh by turning the point into a triangle with the given radius
 *
 * @param mesh - containing the geometry and its textures
 * @param point - the location where the new polygon will be added
 * @param texture - the texture of the newly added polygon, default value is the alpha texture of Arx: Texture.alpha
 * @param radius - the size of the newly added polygon, default value is 1
 * @returns a new mesh with the updated geometry
 */
export const addPoint = (mesh: Mesh, point: Vector3, texture: Texture = Texture.alpha, radius: number = 1) => {
  const { material, geometry: _geometry } = mesh
  const materials = Array.isArray(material) ? material : [material]

  const positions = [..._geometry.getAttribute('position').array]
  const normals = [..._geometry.getAttribute('normal').array]
  const uvs = [..._geometry.getAttribute('uv').array]
  const groups = [..._geometry.groups]

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

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3))
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))

  groups.forEach(({ start, count, materialIndex }) => {
    geometry.addGroup(start, count, materialIndex)
  })

  return new Mesh(geometry, materials)
}
