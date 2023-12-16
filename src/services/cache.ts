import fs from 'node:fs/promises'

export const createCacheFolderIfNotExists = async (folder: string) => {
  try {
    await fs.access(folder, fs.constants.R_OK | fs.constants.W_OK)
  } catch (e) {
    await fs.mkdir(folder, { recursive: true })
  }
}
