import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Mesh, Object3D } from 'three'
import { Vector3 } from '@src/Vector3.js'
import { mean } from '@src/faux-ramda.js'

type PackageJsonProps = {
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

      const rawIn = await fs.promises.readFile(path.resolve(__dirname, '../../package.json'), 'utf-8')
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
      const rawIn = await fs.promises.readFile(path.resolve('./package.json'), 'utf-8')
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

export const averageVectors = (vectors: Vector3[]) => {
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
    await fs.promises.access(filename, fs.constants.R_OK)
    return true
  } catch (e: unknown) {
    return false
  }
}
