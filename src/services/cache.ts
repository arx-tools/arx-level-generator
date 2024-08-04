import crypto from 'node:crypto'
import { createReadStream } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { type Settings } from '@src/Settings.js'
import { fileExists } from '@src/helpers.js'

export const hashingAlgorithm = 'sha1'

/**
 * Creates the folder structure inside the project's cache folder for a given path
 * (supports nested folders)
 *
 * @param folder - a folder relative to the project's cache folder
 * @param settings - an instance of the Settings object
 * @returns the absolute path for the given folder
 */
export async function createCacheFolderIfNotExists(folder: string, settings: Settings): Promise<string> {
  const fullFolder = path.resolve(settings.cacheFolder, folder)

  try {
    await fs.access(fullFolder, fs.constants.R_OK | fs.constants.W_OK)
  } catch {
    await fs.mkdir(fullFolder, { recursive: true })
  }

  return fullFolder
}

/**
 * This function assumes that the cache folder exists
 * and that the hash of the cached file is in sync with the contents of the __hashes.json
 *
 * @param filename - full path to a file
 */
export async function loadHashOf(filename: string, settings: Settings): Promise<string | undefined> {
  const hashesFilename = path.resolve(settings.cacheFolder, '__hashes.json')

  try {
    const hashes = JSON.parse(await fs.readFile(hashesFilename, { encoding: 'utf8' })) as Record<string, string>
    return hashes[filename]
  } catch {
    return undefined
  }
}

/**
 *
 * @param filename - a pathname of a file relative to the project's root directory
 */
export async function getCacheStats(filename: string, settings: Settings) {
  const { dir, base } = path.parse(filename)
  const cachedFolder = await createCacheFolderIfNotExists(dir, settings)
  const cachedFilename = path.join(cachedFolder, base)
  const cacheExists = await fileExists(cachedFilename)

  const hashOfCachedFilename = await loadHashOf(cachedFilename, settings)

  return {
    filename: cachedFilename,
    exists: cacheExists,
    hash: hashOfCachedFilename,
  }
}

/**
 * This function does not generate hashes, but merely stores them
 *
 * @param filename - full path to a file
 */
export async function saveHashOf(filename: string, hash: string, settings: Settings): Promise<void> {
  const hashesFilename = path.resolve(settings.cacheFolder, '__hashes.json')

  await createCacheFolderIfNotExists('.', settings)

  let hashes: Record<string, string> = {}

  try {
    hashes = JSON.parse(await fs.readFile(hashesFilename, { encoding: 'utf8' })) as Record<string, string>
  } catch {}

  hashes[filename] = hash

  await fs.writeFile(hashesFilename, JSON.stringify(hashes), { encoding: 'utf8' })
}

/**
 * @param filename - full path to a file
 */
export async function getHashOfFile(filename: string): Promise<string> {
  const hash = crypto.createHash(hashingAlgorithm)
  const stream = createReadStream(filename)

  stream.on('data', (chunk) => {
    hash.update(chunk)
  })

  return new Promise((resolve, reject) => {
    stream.on('error', (err) => {
      reject(err)
    })
    stream.on('end', () => {
      resolve(hash.digest('hex'))
    })
  })
}
