import fs from 'node:fs/promises'
import path from 'node:path'
import { Settings } from '@src/Settings.js'
import { fileExists } from '@src/helpers.js'

/**
 * Creates the folder structure inside the project's cache folder for a given path
 * (supports nested folders)
 *
 * @param folder - a folder relative to the project's cache folder
 * @param settings - an instance of the Settings object
 * @returns the absolute path for the given folder
 */
export const createCacheFolderIfNotExists = async (folder: string, settings: Settings) => {
  const fullFolder = path.resolve(settings.cacheFolder, folder)

  try {
    await fs.access(fullFolder, fs.constants.R_OK | fs.constants.W_OK)
  } catch (e) {
    await fs.mkdir(fullFolder, { recursive: true })
  }

  return fullFolder
}

export const getCacheStats = async (filename: string, settings: Settings) => {
  const { dir, base } = path.parse(filename)
  const cachedFolder = await createCacheFolderIfNotExists(dir, settings)
  const cachedFilename = path.join(cachedFolder, base)
  const cacheExists = await fileExists(cachedFilename)

  const hashOfCachedFilename = await getHashOf(cachedFilename, settings)

  return {
    filename: cachedFilename,
    exists: cacheExists,
    hash: hashOfCachedFilename,
  }
}

/**
 * This function assumes that the cache folder exists
 * and that the hash of the cached file is in sync with the contents of the __hashes.json
 */
export const getHashOf = async (filename: string, settings: Settings) => {
  const hashesFilename = path.resolve(settings.cacheFolder, '__hashes.json')

  try {
    const hashes = JSON.parse(await fs.readFile(hashesFilename, { encoding: 'utf-8' })) as Record<string, string>
    return hashes[filename]
  } catch (e: unknown) {
    return undefined
  }
}

export const saveHashOf = async (filename: string, hash: string, settings: Settings) => {
  const hashesFilename = path.resolve(settings.cacheFolder, '__hashes.json')

  await createCacheFolderIfNotExists('.', settings)

  let hashes: Record<string, string> = {}

  try {
    hashes = JSON.parse(await fs.readFile(hashesFilename, { encoding: 'utf-8' })) as Record<string, string>
  } catch (e: unknown) {}

  hashes[filename] = hash

  await fs.writeFile(hashesFilename, JSON.stringify(hashes), { encoding: 'utf-8' })
}
