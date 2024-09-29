import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function pathToPackageJson(): string {
  const filename = fileURLToPath(import.meta.url)
  const dirname = path.dirname(filename)

  return path.resolve(dirname, '../../package.json')
}

export async function getPackageVersion(): Promise<string> {
  try {
    const rawIn = await fs.promises.readFile(pathToPackageJson(), 'utf8')
    const { version } = JSON.parse(rawIn) as { version: string }
    return version
  } catch {
    return 'unknown'
  }
}

export function stringifyJSON(json: any, prettify = false): string {
  if (prettify) {
    return JSON.stringify(json, null, '\t')
  }

  return JSON.stringify(json)
}
