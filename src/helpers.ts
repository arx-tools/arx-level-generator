import fs from 'node:fs'
import path from 'node:path'
import { Mesh, Object3D } from 'three'

export const getPackageVersion = async () => {
  try {
    const rawIn = await fs.promises.readFile(path.resolve(__dirname, '../package.json'), 'utf-8')
    const { version } = JSON.parse(rawIn) as { version: string }
    return version
  } catch (error) {
    return 'unknown'
  }
}

export type Manifest = {
  files: string[]
}

export const uninstall = async (dir: string) => {
  try {
    const rawIn = await fs.promises.readFile(`${dir}/arx-level-generator-manifest.json`, 'utf-8')
    const manifest = JSON.parse(rawIn) as Manifest
    for (let file of manifest.files) {
      try {
        await fs.promises.rm(file)
      } catch (f) {}
    }
    await fs.promises.rm(`${dir}/arx-level-generator-manifest.json`)
  } catch (e) {}
}

export const randomBetween = (min: number, max: number) => {
  return Math.random() * (max - min) + min
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

export const makeBumpy = (volume: number, percentage: number, mesh: Mesh) => {
  const index = mesh.geometry.getIndex()
  const coords = mesh.geometry.getAttribute('position')

  if (index === null) {
    // non-indexed, all vertices are unique
    for (let idx = 0; idx < coords.count; idx++) {
      if (randomBetween(0, 100) < percentage) {
        coords.setY(idx, coords.getY(idx) + randomBetween(-volume, volume))
      }
    }
  } else {
    // indexed, has shared vertices
    for (let i = 0; i < index.count; i++) {
      const idx = index.getX(i)
      if (randomBetween(0, 100) < percentage) {
        coords.setY(idx, coords.getY(idx) + randomBetween(-volume, volume))
      }
    }
  }
}

export const percentOf = (percentage: number, maxValue: number) => {
  return (maxValue / 100) * percentage
}

export const removeByValue = <T>(value: T, array: T[]) => {
  const idx = array.indexOf(value)
  array.splice(idx, 1)
}
