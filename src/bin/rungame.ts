import { exec } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { Settings } from '@src/Settings.js'
import { fileExists } from '@src/helpers.js'

export const rungame = async (settings: Settings) => {
  const operatingSystem = os.platform()

  if (operatingSystem !== 'win32' && operatingSystem !== 'linux') {
    console.error(`[error] rungame: unsupported platform (expected "win32" or "linux", but got "${operatingSystem}")`)
    return
  }

  const args = [`--loadlevel ${settings.levelIdx}`]

  let exeFile: string
  switch (operatingSystem) {
    case 'win32':
      exeFile = path.resolve(settings.outputDir, 'arx.exe')
      break
    case 'linux':
      exeFile = path.resolve(settings.outputDir, 'arx')
      break
  }

  if (!(await fileExists(exeFile))) {
    console.error(`[error] rungame: executable not found at "${exeFile}"`)
    return
  }

  try {
    const { stdout, stderr } = await promisify(exec)(`${exeFile} ${args.join(' ')}`)
    console.log(stdout)
    if (stderr !== '') {
      console.error(stderr)
    }
  } catch (e: unknown) {
    console.error(e)
  }
}
