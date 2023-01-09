import fs from 'node:fs'
import path from 'node:path'
import { Mesh } from 'three'

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

export const applyTransformations = (mesh: Mesh) => {
  mesh.updateMatrix()

  mesh.geometry.applyMatrix4(mesh.matrix)

  mesh.position.set(0, 0, 0)
  mesh.rotation.set(0, 0, 0)
  mesh.scale.set(1, 1, 1)
  mesh.updateMatrix()
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
