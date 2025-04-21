import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readTextFile } from '@src/platform/node/io.js'

function pathToPackageJson(): string {
  const filename = fileURLToPath(import.meta.url)
  const dirname = path.dirname(filename)

  return path.resolve(dirname, '../../package.json')
}

export async function getPackageVersion(): Promise<string> {
  try {
    const rawIn = await readTextFile(pathToPackageJson())
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
