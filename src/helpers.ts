import fs from 'node:fs'
import path from 'node:path'
import { Mesh, Object3D } from 'three'
import { mean } from './faux-ramda.js'
import { Vector3 } from './Vector3.js'

export const getPackageVersion = async () => {
  try {
    const rawIn = await fs.promises.readFile(path.resolve('./package.json'), 'utf-8')
    const { version } = JSON.parse(rawIn) as { version: string }
    return version
  } catch (error) {
    return 'unknown'
  }
}

// TODO: move this to ArxMap or somewhere more specific to handling/generating manifests
export type Manifest = {
  files: string[]
}

// TODO: move this to ArxMap or somewhere more specific to handling/generating manifests
export const uninstall = async (dir: string) => {
  try {
    const rawIn = await fs.promises.readFile(path.resolve(dir, 'arx-level-generator-manifest.json'), 'utf-8')
    const manifest = JSON.parse(rawIn) as Manifest
    for (let file of manifest.files) {
      try {
        await fs.promises.rm(path.resolve(dir, file))
      } catch (f) {}
    }
    await fs.promises.rm(path.resolve(dir, 'arx-level-generator-manifest.json'))
  } catch (e) {}
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

export const removeByValue = <T>(value: T, array: T[]) => {
  const idx = array.indexOf(value)
  array.splice(idx, 1)
}

/**
 * @see https://en.wikipedia.org/wiki/ISO/IEC_8859-15
 */
export const latin9ToLatin1 = (str: string) => {
  return str
    .replace('€', '¤')
    .replace('Š', '¦')
    .replace('š', '¨')
    .replace('Ž', '´')
    .replace('ž', '¸')
    .replace('Œ', '¼')
    .replace('œ', '½')
    .replace('Ÿ', '¾')
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
