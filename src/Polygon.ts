import {
  type ArxColor,
  type ArxPolygon,
  ArxPolygonFlags,
  type ArxTextureContainer,
  type ArxVector3,
  type ArxVertex,
} from 'arx-convert/types'
import { MAP_DEPTH_IN_CELLS, MAP_WIDTH_IN_CELLS, type QuadrupleOf, isQuad } from 'arx-convert/utils'
import { Box3, Triangle } from 'three'
import { type Color } from '@src/Color.js'
import { NO_TEXTURE_CONTAINER, Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { Vertex } from '@src/Vertex.js'
import { isBetween, percentOf } from '@src/helpers.js'
import { type ArxVertexWithColor } from '@src/types.js'

export type TransparencyType = 'multiplicative' | 'additive' | 'blended' | 'subtractive'

const DEFAULT_ROOM_ID = 1

type PolygonConfig = {
  /** setting this to true will prevent calculation of norm, norm2 and normals properties */
  areNormalsCalculated: boolean
}

type PolygonContructorProps = {
  isQuad?: boolean
  vertices: QuadrupleOf<Vertex>
  /** face normal for the 1st half of the polygon enclosed by vertices a, b and c */
  norm?: Vector3
  /** face normal for the 2nd half of the polygon enclosed by vertices d, b and c when polygon is a quad */
  norm2?: Vector3
  texture?: Texture
  flags?: ArxPolygonFlags
  /** vertex normals */
  normals?: QuadrupleOf<Vector3>
  transval?: number
  area?: number
  room?: number
  paddy?: number
  config?: Partial<PolygonConfig>
}

export class Polygon {
  static fromArxPolygon(
    polygon: ArxPolygon,
    colors: ArxColor[],
    textures: ArxTextureContainer[],
    areNormalsCalculated: boolean,
  ): Polygon {
    const extendedVertices = polygon.vertices.map(({ llfColorIdx, ...vertex }) => {
      const extendedVertex: ArxVertexWithColor = vertex
      if (typeof llfColorIdx === 'number') {
        extendedVertex.color = colors[llfColorIdx]
      }

      return Vertex.fromArxVertex(extendedVertex)
    })

    let texture: Texture | undefined
    const textureContainer = textures.find(({ id }) => id === polygon.textureContainerId)
    if (textureContainer) {
      texture = Texture.fromArxTextureContainer(textureContainer)
    }

    let normals: QuadrupleOf<Vector3> | undefined
    if (polygon.normals) {
      normals = polygon.normals.map(Vector3.fromArxVector3) as QuadrupleOf<Vector3>
    }

    return new Polygon({
      vertices: extendedVertices as QuadrupleOf<Vertex>,
      norm: Vector3.fromArxVector3(polygon.norm),
      norm2: Vector3.fromArxVector3(polygon.norm2),
      texture,
      flags: polygon.flags,
      normals,
      transval: polygon.transval,
      area: polygon.area,
      room: polygon.room,
      paddy: polygon.paddy,
      config: {
        areNormalsCalculated,
      },
    })
  }

  vertices: QuadrupleOf<Vertex>
  /** face normal for the 1st half of the polygon enclosed by vertices a, b and c */
  norm: Vector3
  /** face normal for the 2nd half of the polygon enclosed by vertices d, b and c when polygon is a quad */
  norm2: Vector3
  texture?: Texture
  flags: ArxPolygonFlags
  /** vertex normals */
  normals?: QuadrupleOf<Vector3>
  transval: number
  area: number
  room: number
  paddy?: number
  config: PolygonConfig = {
    /** setting this to true will prevent calculation of norm, norm2 and normals properties */
    areNormalsCalculated: false,
  }

  constructor(props: PolygonContructorProps) {
    this.vertices = props.vertices
    this.norm = props.norm ?? new Vector3(0, 0, 0)
    this.norm2 = props.norm2 ?? new Vector3(0, 0, 0)
    this.texture = props.texture
    this.flags = props.flags ?? ArxPolygonFlags.None
    if (props.isQuad === true) {
      this.flags = this.flags | ArxPolygonFlags.Quad
    }

    this.normals = props.normals
    this.transval = props.transval ?? 0
    this.area = props.area ?? 0
    this.room = props.room ?? DEFAULT_ROOM_ID
    this.paddy = props.paddy
    this.config = { ...this.config, ...props.config }
  }

  clone(): Polygon {
    return new Polygon({
      vertices: this.vertices.map((v) => v.clone()) as QuadrupleOf<Vertex>,
      norm: this.norm.clone(),
      norm2: this.norm2.clone(),
      texture: this.texture,
      flags: this.flags,
      normals: this.normals?.map((n) => n.clone()) as QuadrupleOf<Vector3>,
      transval: this.transval,
      area: this.area,
      room: this.room,
      paddy: this.paddy,
      config: {
        areNormalsCalculated: this.config.areNormalsCalculated,
      },
    })
  }

  hasTexture(): this is { texture: Texture } {
    return this.texture !== undefined
  }

  async toArxPolygon(textureContainers: (ArxTextureContainer & { remaining: number })[]): Promise<ArxPolygon> {
    const vertices = this.vertices.map((vertex) => vertex.toArxVertex()) as QuadrupleOf<ArxVertex>

    let textureContainerId = NO_TEXTURE_CONTAINER
    if (this.hasTexture()) {
      const textureFilename = this.texture.filename
      const nindices = this.getNindices()
      const textureContainer = textureContainers.find(({ filename, remaining }) => {
        return remaining - nindices >= 0 && filename === textureFilename
      })
      if (textureContainer !== undefined) {
        textureContainer.remaining = textureContainer.remaining - nindices
        textureContainerId = textureContainer.id
      }
    }

    let normals: QuadrupleOf<ArxVector3> | undefined
    if (this.normals) {
      normals = this.normals.map((normal) => normal.toArxVector3()) as QuadrupleOf<Vector3>
    }

    return {
      vertices,
      norm: this.norm.toArxVector3(),
      norm2: this.norm2.toArxVector3(),
      textureContainerId,
      flags: this.flags,
      normals,
      transval: this.transval,
      area: this.area,
      room: this.room,
      paddy: this.paddy,
    }
  }

  isQuad(): boolean {
    return isQuad(this)
  }

  isTransparent(): boolean {
    return (this.flags & ArxPolygonFlags.Transparent) !== 0
  }

  calculateNormals(): void {
    if (this.config.areNormalsCalculated === true) {
      return
    }

    const [a, b, c, d] = this.vertices

    const triangle = new Triangle(a, b, c)
    triangle.getNormal(this.norm)

    if (this.isQuad()) {
      const triangle2 = new Triangle(d, c, b)
      triangle2.getNormal(this.norm2)
    }
  }

  /**
   * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/Mesh.cpp#L1100
   */
  getNindices(): number {
    if (this.isQuad()) {
      return 6
    }

    return 3
  }

  /**
   * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/Mesh.cpp#L1102
   */
  getTransparencyType(): TransparencyType | 'opaque' {
    if (!this.isTransparent()) {
      return 'opaque'
    }

    if (this.transval >= 2) {
      return 'multiplicative'
    }

    if (this.transval >= 1) {
      return 'additive'
    }

    if (this.transval > 0) {
      return 'blended'
    }

    return 'subtractive'
  }

  setOpacity(percent: number, transparencyType: TransparencyType = 'additive'): void {
    if (percent === 100) {
      this.flags = this.flags & ~ArxPolygonFlags.Transparent
      return
    }

    this.flags = this.flags | ArxPolygonFlags.Transparent

    const value = percentOf(percent, 1)

    switch (transparencyType) {
      case 'additive': {
        this.transval = 1 + value
        break
      }

      case 'blended': {
        this.transval = value
        break
      }

      case 'multiplicative': {
        this.transval = 2 + value
        break
      }

      case 'subtractive': {
        this.transval = -value
        break
      }
    }
  }

  /**
   * Quote from Dscharrer:
   *
   * Looks like this is the "correct" formula for trinagles:
   * @see https://github.com/arx/ArxLibertatis/blob/ArxFatalis-1.21/Sources/EERIE/EERIEPoly.cpp#L3134
   *
   * And for quads:
   * @see https://github.com/arx/ArxLibertatis/blob/ArxFatalis-1.21/Sources/EERIE/EERIEDraw.cpp#L267
   *
   * At least the triangle formula looks like it was supposed to be the actual area but it only works for
   * specific kinds of triangles. The quad "area" is probably annoying or impossible to replicate as it will
   * depend on the order of the vertices in the triangle before they were reordered when merging into the quad.
   *
   * AFAICT the area value is only used for collisions to to do additional checks for larger polygons.
   * I don't think the exact value matters in practice.
   */
  calculateArea(): void {
    this.area = this.getHalfPolygonArea(false)

    if (this.isQuad()) {
      this.area = this.area + this.getHalfPolygonArea(true)
    }
  }

  /**
   * All the vertices are inside or on the surface of the box
   * If exludeOnSurface (default true) is true, then we ignore checking the surface by shrinking
   * the box by 1 on each side
   */
  isWithin(box: Box3, excludeOnSurface: boolean = true): boolean {
    const copyOfBox = box.clone()
    if (excludeOnSurface) {
      copyOfBox.min.add(new Vector3(1, 1, 1))
      copyOfBox.max.sub(new Vector3(1, 1, 1))
    }

    const [a, b, c, d] = this.vertices

    if (!copyOfBox.containsPoint(a) || !copyOfBox.containsPoint(b) || !copyOfBox.containsPoint(c)) {
      return false
    }

    if (this.isQuad() && !copyOfBox.containsPoint(d)) {
      return false
    }

    return true
  }

  /**
   * At least one of the vertices are inside or on the surface of the box
   * If `exludeOnSurface` (default true) is true, then we ignore checking the surface by shrinking
   * the box by a specific value on each side
   */
  isPartiallyWithin(box: Box3, excludeOnSurface: boolean = true): boolean {
    const padding = 0.1

    const copyOfBox = box.clone()
    if (excludeOnSurface) {
      copyOfBox.min.add(new Vector3(padding, padding, padding))
      copyOfBox.max.sub(new Vector3(padding, padding, padding))
    }

    const [a, b, c, d] = this.vertices

    if (copyOfBox.containsPoint(a) || copyOfBox.containsPoint(b) || copyOfBox.containsPoint(c)) {
      return true
    }

    if (this.isQuad() && copyOfBox.containsPoint(d)) {
      return true
    }

    return false
  }

  setColor(color: Color): void {
    this.vertices.forEach((vertex) => {
      vertex.color = color
    })
  }

  move(offset: Vector3): void {
    this.vertices.forEach((vertex) => {
      vertex.add(offset)
    })
  }

  scale(scale: number): void {
    this.vertices.forEach((vertex) => {
      vertex.multiplyScalar(scale)
    })
  }

  equals(polygon: Polygon, epsilon: number = 0): boolean {
    if (this.isQuad() !== polygon.isQuad()) {
      return false
    }

    for (let i = 0; i < 3; i++) {
      const aVertex = this.vertices[i]
      if (!polygon.vertices.some((bVertex) => aVertex.equals(bVertex, epsilon))) {
        return false
      }
    }

    if (this.isQuad()) {
      const aVertex = this.vertices[3]
      if (!polygon.vertices.some((bVertex) => aVertex.equals(bVertex, epsilon))) {
        return false
      }
    }

    return true
  }

  isOutOfBounds(): boolean {
    let numberOfPolygons = 3
    if (this.isQuad()) {
      numberOfPolygons = 4
    }

    const outOfBoundVertex = this.vertices.slice(0, numberOfPolygons).find(({ x, z }) => {
      const fitsX = isBetween(0, MAP_WIDTH_IN_CELLS * 100 - 1, x)
      const fitsZ = isBetween(0, MAP_DEPTH_IN_CELLS * 100 - 1, z)
      return !fitsX || !fitsZ
    })

    return outOfBoundVertex !== undefined
  }

  makeDoubleSided(): void {
    this.flags = this.flags | ArxPolygonFlags.DoubleSided
  }

  flipUVHorizontally(): void {
    const [a, b, c, d] = this.vertices

    a.uv.x = -a.uv.x
    b.uv.x = -b.uv.x
    c.uv.x = -c.uv.x
    if (this.isQuad()) {
      d.uv.x = -d.uv.x
    }
  }

  flipUVVertically(): void {
    const [a, b, c, d] = this.vertices

    a.uv.y = -a.uv.y
    b.uv.y = -b.uv.y
    c.uv.y = -c.uv.y
    if (this.isQuad()) {
      d.uv.y = -d.uv.y
    }
  }

  getBoundingBox(): Box3 {
    const box = new Box3()

    for (let i = 0; i < 3; i++) {
      box.expandByPoint(this.vertices[i])
    }

    if (this.isQuad()) {
      box.expandByPoint(this.vertices[3])
    }

    return box
  }

  /**
   * assuming the order of vertices taking up a russian i (И) shape:
   * ```
   * 0 2
   * 1 3
   * ```
   *
   * `isQuadPart` === true  -> calculate the area of 1-2-3
   * `isQuadPart` === false -> calculate the area of 0-1-2
   */
  private getHalfPolygonArea(isQuadPart: boolean): number {
    const [a, b, c, d] = this.vertices

    let triangle: Triangle
    if (isQuadPart) {
      triangle = new Triangle(b, c, d)
    } else {
      triangle = new Triangle(a, b, c)
    }

    return triangle.getArea()
  }
}
