import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Box3, BufferGeometry, Euler, Mesh, Object3D, Vector3 as ThreeJsVector3 } from 'three'
import { Vector3 } from '@src/Vector3.js'
import { mean, repeat } from '@src/faux-ramda.js'

export type PackageJsonProps = {
  name: string
  version: string
  description: string
  author: string
  homepage: string
}

let cacheOfGeneratorPackageJSON: PackageJsonProps
let cacheOfProjectPackageJSON: PackageJsonProps

export const getGeneratorPackageJSON = async (): Promise<PackageJsonProps> => {
  if (typeof cacheOfGeneratorPackageJSON === 'undefined') {
    try {
      const __filename = fileURLToPath(import.meta.url)
      const __dirname = path.dirname(__filename)

      const rawIn = await fs.readFile(path.resolve(__dirname, '../../package.json'), 'utf-8')
      cacheOfGeneratorPackageJSON = JSON.parse(rawIn)
    } catch (error) {
      cacheOfGeneratorPackageJSON = {
        name: '',
        version: '',
        description: '',
        author: '',
        homepage: '',
      }
    }
  }

  return cacheOfGeneratorPackageJSON
}

export const getProjectPackageJSON = async (): Promise<PackageJsonProps> => {
  if (typeof cacheOfProjectPackageJSON === 'undefined') {
    try {
      const rawIn = await fs.readFile(path.resolve('./package.json'), 'utf-8')
      cacheOfProjectPackageJSON = JSON.parse(rawIn)
    } catch (error) {
      cacheOfProjectPackageJSON = {
        name: '',
        version: '',
        description: '',
        author: '',
        homepage: '',
      }
    }
  }

  return cacheOfProjectPackageJSON
}

export const evenAndRemainder = (divisor: number, n: number): [number, number] => {
  return [Math.floor(n / divisor), n % divisor]
}

export const applyTransformations = (threeJsObj: Object3D) => {
  threeJsObj.updateMatrix()

  if (threeJsObj instanceof Mesh) {
    threeJsObj.geometry.applyMatrix4(threeJsObj.matrix)
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

export const percentOf = (percentage: number, maxValue: number) => {
  return (maxValue / 100) * percentage
}

/**
 * @see https://en.wikipedia.org/wiki/ISO/IEC_8859-15
 */
export const latin9ToLatin1 = (str: string) => {
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

export const roundToNDecimals = (decimals: number, x: number) => {
  return Math.round(x * 10 ** decimals) / 10 ** decimals
}

export const isEven = (n: number) => n % 2 === 0

export const isOdd = (n: number) => n % 2 === 1

export const averageVectors = (vectors: ThreeJsVector3[]) => {
  const xs = vectors.map(({ x }) => x)
  const ys = vectors.map(({ y }) => y)
  const zs = vectors.map(({ z }) => z)

  return new Vector3(mean(xs), mean(ys), mean(zs))
}

/** inclusive */
export const isBetween = (min: number, max: number, n: number) => {
  if (min > max) {
    ;[max, min] = [min, max]
  }
  return n >= min && n <= max
}

export const fileExists = async (filename: string) => {
  try {
    await fs.access(filename, fs.constants.R_OK)
    return true
  } catch (e: unknown) {
    return false
  }
}

export const circleOfVectors = (center: ThreeJsVector3, radius: number, divisions: number, theta: number = 0) => {
  const angle = (2 * Math.PI) / divisions

  const vectors: Vector3[] = []

  for (let i = 0; i < divisions; i++) {
    const point = new Vector3(0, 0, 1 * radius)
    const rotation = new Euler(0, theta + angle * i, 0, 'XYZ')
    point.applyEuler(rotation)
    vectors.push(point.add(center))
  }

  return vectors
}

export const normalizeDegree = (degree: number) => {
  let normalizedDegree = degree % 360
  if (normalizedDegree < 0) {
    normalizedDegree += 360
  }
  return Math.abs(normalizedDegree)
}

export const numberOfVertices = (geometry: BufferGeometry) => {
  return geometry.getAttribute('position').array.length / 3
}

/**
 * Expands a 3D point into a Box3 object with the given size
 *
 * @param point - the center of the box
 * @param size - sidelength/diameter of the box
 * @returns the generated Box3 object
 */
export const pointToBox = (point: Vector3, size: number | Vector3) => {
  size = typeof size === 'number' ? new Vector3(size / 2, size / 2, size / 2) : size.divideScalar(2)
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
export const arrayPadRight = <T>(length: number, paddingValue: T, array: T[]) => {
  return [...array, ...repeat(paddingValue, length)].slice(0, length)
}
