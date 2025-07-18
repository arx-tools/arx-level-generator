import { getHeaderSize } from 'arx-header-size'
import { Bitmap, Bits } from 'binary-bmp'
import { concatArrayBuffers, implode, sliceArrayBufferAt } from 'node-pkware/simple'
import {
  Box3,
  type BufferGeometry,
  Euler,
  MathUtils,
  Mesh,
  type Object3D,
  type Vector3 as ThreeJsVector3,
  type Triangle,
} from 'three'
import { Vector3 } from '@src/Vector3.js'
import { mean, repeat } from '@src/faux-ramda.js'

/**
 * @example
 * ```js
 * quotientAndRemainder(20, 3) -> [6, 2]
 * ```
 */
export function quotientAndRemainder(dividend: number, divisor: number): [quotient: number, remainder: number] {
  return [Math.floor(dividend / divisor), dividend % divisor]
}

/**
 * Recursively applies the rotation and other transformations to geometries,
 * meaning if the mesh has its position set to 0/0/4, then add that vector to
 * every polygon's vertex in the geometry and reset the position to 0/0/0
 */
export function applyTransformations(threeJsObj: Object3D): void {
  threeJsObj.updateMatrix()

  if (threeJsObj instanceof Mesh) {
    ;(threeJsObj.geometry as BufferGeometry).applyMatrix4(threeJsObj.matrix)
  }

  threeJsObj.children.forEach((child) => {
    child.applyMatrix4(threeJsObj.matrix)
    applyTransformations(child)
  })

  threeJsObj.position.set(0, 0, 0)
  threeJsObj.rotation.set(0, 0, 0)
  threeJsObj.scale.set(1, 1, 1)
  threeJsObj.updateMatrix()
}

export function percentOf(percentage: number, maxValue: number): number {
  return (maxValue / 100) * percentage
}

/**
 * @see https://en.wikipedia.org/wiki/ISO/IEC_8859-15
 */
export function latin9ToLatin1(str: string): string {
  return str
    .replaceAll('€', '¤')
    .replaceAll('Š', '¦')
    .replaceAll('š', '¨')
    .replaceAll('Ž', '´')
    .replaceAll('ž', '¸')
    .replaceAll('Œ', '¼')
    .replaceAll('œ', '½')
    .replaceAll('Ÿ', '¾')
}

export function roundToNDecimals(decimals: number, x: number): number {
  return Math.round(x * 10 ** decimals) / 10 ** decimals
}

export function isEven(n: number): boolean {
  return n % 2 === 0
}

export function isOdd(n: number): boolean {
  return n % 2 === 1
}

export function averageVectors(vectors: ThreeJsVector3[]): Vector3 {
  const xs = vectors.map(({ x }) => {
    return x
  })
  const ys = vectors.map(({ y }) => {
    return y
  })
  const zs = vectors.map(({ z }) => {
    return z
  })

  return new Vector3(mean(xs), mean(ys), mean(zs))
}

/**
 * inclusive: min <= n <= max
 */
export function isBetween(min: number, max: number, n: number): boolean {
  if (min > max) {
    ;[max, min] = [min, max]
  }

  return n >= min && n <= max
}

export function circleOfVectors(
  center: ThreeJsVector3,
  radius: number,
  divisions: number,
  theta: number = 0,
): Vector3[] {
  const angle = (2 * Math.PI) / divisions

  const vectors: Vector3[] = []

  for (let i = 0; i < divisions; i++) {
    const point = new Vector3(0, 0, radius)
    const rotation = new Euler(0, theta + angle * i, 0, 'XYZ')
    point.applyEuler(rotation)
    vectors.push(point.add(center))
  }

  return vectors
}

/**
 * finds an angle between 0 and 360 degrees that is the same as the given degree
 */
export function normalizeDegree(degree: number): number {
  let normalizedDegree = degree % 360
  if (normalizedDegree < 0) {
    normalizedDegree = normalizedDegree + 360
  }

  return Math.abs(normalizedDegree)
}

export function numberOfVertices(geometry: BufferGeometry): number {
  return geometry.getAttribute('position').array.length / 3
}

/**
 * Expands a 3D point into a Box3 object with the given size
 *
 * @param point - the center of the box
 * @param size - sidelength/diameter of the box
 * @returns the generated Box3 object
 */
export function pointToBox(point: Vector3, size: number | Vector3): Box3 {
  if (typeof size === 'number') {
    size = new Vector3(size, size, size)
  }

  size.divideScalar(2)

  const min = point.clone().sub(size)
  const max = point.clone().add(size)

  return new Box3(min, max)
}

/**
 * This function also cuts the array to the given size!
 *
 * `arrayPadRight(4, undefined, [1, 2]) -> [1, 2, undefined, undefined]`
 *
 * `arrayPadRight(4, undefined, [1, 2, 3, 4, 5, 6]) -> [1, 2, 3, 4]`
 */
export function arrayPadRight<T>(length: number, paddingValue: T, array: T[]): T[] {
  return [...array, ...repeat(paddingValue, length)].slice(0, length)
}

/**
 * Check if a triangle fits into a 100×100 square
 *
 * @see https://math.stackexchange.com/a/4794939/355978
 */
export function triangleFitsInto100Square({ a, b, c }: Triangle): boolean {
  const diagonalOf100Square = 100 * Math.SQRT2

  const abDistance = a.distanceTo(b)
  if (abDistance > diagonalOf100Square) {
    return false
  }

  const bcDistance = b.distanceTo(c)
  if (bcDistance > diagonalOf100Square) {
    return false
  }

  const caDistance = c.distanceTo(a)
  if (caDistance > diagonalOf100Square) {
    return false
  }

  // -------------

  const deg45 = MathUtils.degToRad(45)

  const ab = b.clone().sub(a)
  const ac = c.clone().sub(a)
  const aAngle = ab.angleTo(ac)

  const ba = a.clone().sub(b)
  const bc = c.clone().sub(b)
  const bAngle = ba.angleTo(bc)

  const ca = a.clone().sub(c)
  const cb = b.clone().sub(c)
  const cAngle = ca.angleTo(cb)

  if (abDistance === diagonalOf100Square && (aAngle !== deg45 || bAngle !== deg45)) {
    return false
  }

  if (bcDistance === diagonalOf100Square && (bAngle !== deg45 || cAngle !== deg45)) {
    return false
  }

  if (caDistance === diagonalOf100Square && (cAngle !== deg45 || aAngle !== deg45)) {
    return false
  }

  // TODO: more checks

  return true
}

const textEncoder = new TextEncoder()

/**
 * latin1 = ISO 8859-1
 * latin9 = ISO 8859-15
 */
export function encodeText(text: string, encoding: 'utf8' | 'latin1' | 'latin9'): ArrayBufferLike {
  if (encoding === 'utf8') {
    return textEncoder.encode(text).buffer
  }

  if (encoding === 'latin9') {
    return encodeText(latin9ToLatin1(text), 'latin1')
  }

  const charcodes = [...text].map((char) => {
    return char.codePointAt(0)
  }) as number[]

  return new Uint8Array(charcodes).buffer
}

export function encodeJSON(data: any, prettify: boolean = false): ArrayBufferLike {
  let json: string
  if (prettify) {
    json = JSON.stringify(data, null, '\t')
  } else {
    json = JSON.stringify(data)
  }

  return encodeText(json, 'utf8')
}

export function compressAs(data: ArrayBuffer, format: Parameters<typeof getHeaderSize>[1]): ArrayBuffer {
  const { compression, total: totalHeaderSize } = getHeaderSize(data, format)

  if (compression === 'none') {
    return data
  }

  if (compression === 'full') {
    return implode(data, 'binary', 'large')
  }

  const [header, body] = sliceArrayBufferAt(data, totalHeaderSize)
  const compressedBody = implode(body, 'binary', 'large')

  return concatArrayBuffers([header, compressedBody])
}

export function generateBlankBMP(width: number, height: number): ArrayBuffer {
  const binary = new Bitmap({
    bits: Bits.RGB,
    width,
    height,
    data: repeat(0, width * height),
  })

  return binary.arrayBuffer()
}

/**
 * a naïve replacement for `path.parse(pathToFile).name` to work outside node.js
 */
export function getFilenameFromPath(pathToFile: string): string {
  return pathToFile.split(/[\\/]/).at(-1) ?? ''
}
