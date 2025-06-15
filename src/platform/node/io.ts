import fs from 'node:fs/promises'

export async function fileOrFolderExists(pathToFileOrFolder: string): Promise<boolean> {
  try {
    await fs.access(pathToFileOrFolder, fs.constants.R_OK | fs.constants.W_OK)
    return true
  } catch {
    return false
  }
}

export async function readTextFile(pathToFile: string): Promise<string> {
  return await fs.readFile(pathToFile, { encoding: 'utf8' })
}

export async function readBinaryFile(pathToFile: string): Promise<ArrayBufferLike> {
  const byteArray = await fs.readFile(pathToFile)
  return byteArray.buffer
}

export async function writeTextFile(pathToFile: string, data: string): Promise<void> {
  await fs.writeFile(pathToFile, data, { encoding: 'utf8' })
}

export async function writeBinaryFile(pathToFile: string, data: ArrayBufferLike): Promise<void> {
  const byteArray = new Uint8Array(data)
  await fs.writeFile(pathToFile, byteArray)
}
