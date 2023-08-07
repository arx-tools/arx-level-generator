import { ArxColor, ArxPolygon, ArxPolygonFlags, ArxTextureContainer, ArxVector3, ArxVertex } from 'arx-convert/types'
import { MAP_DEPTH_IN_CELLS, MAP_WIDTH_IN_CELLS, QuadrupleOf } from 'arx-convert/utils'
import { Box3, Triangle } from 'three'
import { Color } from '@src/Color.js'
import { Settings } from '@src/Settings.js'
import { NO_TEXTURE_CONTAINER, Texture } from '@src/Texture.js'
import { Vector3 } from '@src/Vector3.js'
import { Vertex } from '@src/Vertex.js'
import { isBetween, percentOf } from '@src/helpers.js'
import { ArxVertexWithColor } from '@src/types.js'

export type TransparencyType = 'multiplicative' | 'additive' | 'blended' | 'subtractive'

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
    this.room = props.room ?? 1
    this.paddy = props.paddy
    this.config = { ...this.config, ...(props.config ?? {}) }
  }

  static fromArxPolygon(
    polygon: ArxPolygon,
    colors: ArxColor[],
    textures: ArxTextureContainer[],
    areNormalsCalculated: boolean,
  ) {
    const extendedVertices = polygon.vertices.map(({ llfColorIdx, ...vertex }) => {
      const extendedVertex: ArxVertexWithColor = vertex
      if (typeof llfColorIdx === 'number') {
        extendedVertex.color = colors[llfColorIdx]
      }
      return Vertex.fromArxVertex(extendedVertex)
    })

    let texture: Texture | undefined = undefined
    const textureContainer = textures.find(({ id }) => id === polygon.textureContainerId)
    if (textureContainer) {
      texture = Texture.fromArxTextureContainer(textureContainer)
    }

    let normals: QuadrupleOf<Vector3> | undefined = undefined
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

  hasTexture(): this is { texture: Texture } {
    return typeof this.texture !== 'undefined'
  }

  async toArxPolygon(
    textureContainers: (ArxTextureContainer & { remaining: number })[],
    settings: Settings,
  ): Promise<ArxPolygon> {
    const vertices = this.vertices.map((vertex) => vertex.toArxVertex()) as QuadrupleOf<ArxVertex>

    let textureContainerId = NO_TEXTURE_CONTAINER
    if (this.hasTexture()) {
      const needsToBeTileable = (this.flags & ArxPolygonFlags.Tiled) !== 0
      const textureFilename =
        needsToBeTileable && !(await this.texture.isTileable(settings))
          ? 'tileable-' + this.texture.filename
          : this.texture.filename
      const nindices = this.getNindices()
      const textureContainer = textureContainers.find(({ filename, remaining }) => {
        return remaining - nindices >= 0 && filename === textureFilename
      })
      if (typeof textureContainer !== 'undefined') {
        textureContainer.remaining -= nindices
        textureContainerId = textureContainer.id
      }
    }

    let normals: QuadrupleOf<ArxVector3> | undefined = undefined
    if (this.normals) {
      normals = this.normals.map((normal) => normal.toArxVector3()) as QuadrupleOf<Vector3>
    }

    return {
      vertices,
      norm: this.norm.toArxVector3(),
      norm2: this.norm.toArxVector3(),
      textureContainerId,
      flags: this.flags,
      normals,
      transval: this.transval,
      area: this.area,
      room: this.room,
      paddy: this.paddy,
    }
  }

  isQuad() {
    return (this.flags & ArxPolygonFlags.Quad) !== 0
  }

  isTransparent() {
    return (this.flags & ArxPolygonFlags.Transparent) !== 0
  }

  calculateNormals() {
    if (this.config.areNormalsCalculated === true) {
      return
    }

    const [a, b, c, d] = this.vertices

    const triangle = new Triangle(a, b, c)
    triangle.getNormal(this.norm)

    if (this.isQuad()) {
      const triangle2 = new Triangle(d, b, c)
      triangle2.getNormal(this.norm2)
    }
  }

  /**
   * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/Mesh.cpp#L1100
   */
  getNindices() {
    return this.isQuad() ? 6 : 3
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

  setOpacity(percent: number, transparencyType: TransparencyType = 'additive') {
    if (percent === 100) {
      this.flags &= ~ArxPolygonFlags.Transparent
      return
    }

    this.flags |= ArxPolygonFlags.Transparent

    const value = percentOf(percent, 1)

    switch (transparencyType) {
      case 'additive':
        this.transval = 1 + value
        break
      case 'blended':
        this.transval = value
        break
      case 'multiplicative':
        this.transval = 2 + value
        break
      case 'subtractive':
        this.transval = -value
        break
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
  calculateArea() {
    this.area = this.getHalfPolygonArea(false) + (this.isQuad() ? this.getHalfPolygonArea(true) : 0)
  }

  /**
   * assuming the order of vertices taking up a russian i (И) shape:
   * ```
   * 0 2
   * 1 3
   * ```
   * `isQuadPart` === false -> calculate the area of 0-1-2
   * `isQuadPart` === true  -> calculate the area of 1-2-3
   */
  private getHalfPolygonArea(isQuadPart: boolean) {
    const triangle = new Triangle(...this.vertices.slice(isQuadPart ? 1 : 0, 3))
    return triangle.getArea()

    // const [i, j, k] = isQuadPart ? [1, 2, 3] : [0, 1, 2]
    // const a = this.vertices[i].clone().add(this.vertices[j]).divideScalar(2).distanceTo(this.vertices[k])
    // const b = this.vertices[isQuadPart ? i : k].distanceTo(this.vertices[j])
    // return (a * b) / 2
  }

  /**
   * All the vertices are inside or on the surface of the box
   * If exludeOnSurface (default true) is true, then we ignore checking the surface by shrinking
   * the box by 1 on each side
   */
  isWithin(box: Box3, excludeOnSurface: boolean = true) {
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
  isPartiallyWithin(box: Box3, excludeOnSurface: boolean = true) {
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

  setColor(color: Color) {
    this.vertices.forEach((vertex) => {
      vertex.color = color
    })
  }

  move(offset: Vector3) {
    this.vertices.forEach((vertex) => {
      vertex.add(offset)
    })
  }

  equals(polygon: Polygon, epsilon: number = 0) {
    if (this.isQuad() !== polygon.isQuad()) {
      return false
    }

    const unmatchedVertices = polygon.vertices.slice(0, this.isQuad() ? 4 : 3)

    this.vertices.slice(0, this.isQuad() ? 4 : 3).forEach((vertex) => {
      const idx = unmatchedVertices.findIndex((v) => vertex.equals(v, epsilon))
      if (idx !== -1) {
        unmatchedVertices.splice(idx, 1)
      }
    })

    return unmatchedVertices.length === 0
  }

  isOutOfBounds() {
    const outOfBoundVertex = this.vertices
      .slice(0, this.isQuad() ? 4 : 3)
      .find(
        (vertex) =>
          !isBetween(0, MAP_WIDTH_IN_CELLS * 100 - 1, vertex.x) ||
          !isBetween(0, MAP_DEPTH_IN_CELLS * 100 - 1, vertex.z),
      )

    return outOfBoundVertex !== undefined
  }
}
