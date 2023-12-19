import fs from 'node:fs/promises'
import path from 'node:path'
import { Settings } from '@src/Settings.js'

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
