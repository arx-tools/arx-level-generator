import { exec } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import type { Settings } from '@src/Settings.js'
import { fileOrFolderExists } from '@src/platform/node/io.js'

export async function rungame(settings: Settings, otherArgs: string[]): Promise<void> {
  const operatingSystem = os.platform()

  if (operatingSystem !== 'win32' && operatingSystem !== 'linux' && operatingSystem !== 'darwin') {
    console.error(
      `[error] rungame: unsupported platform (expected "win32", "darwin" or "linux" but got "${operatingSystem}")`,
    )
    return
  }

  const args = [`--loadlevel ${settings.levelIdx}`, ...otherArgs]

  let exeFile: string
  switch (operatingSystem) {
    case 'win32': {
      exeFile = path.resolve(settings.outputDir, 'arx.exe')
      break
    }

    case 'darwin':
    case 'linux': {
      exeFile = path.resolve(settings.outputDir, 'arx')
      break
    }
  }

  if (!(await fileOrFolderExists(exeFile))) {
    console.error(`[error] rungame: executable not found at "${exeFile}"`)
    return
  }

  try {
    const { stdout, stderr } = await promisify(exec)(`${exeFile} ${args.join(' ')}`)
    console.log(stdout)
    if (stderr !== '') {
      console.error(stderr)
    }
  } catch (error: unknown) {
    console.error(error)
  }
}
