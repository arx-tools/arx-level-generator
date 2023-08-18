import { exec } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { DLF, FTS, LLF } from 'arx-convert'
import { ArxDLF, ArxFTS, ArxLLF } from 'arx-convert/types'
import { getHeaderSize } from 'arx-header-size'
import { Compression, DictionarySize, implode, stream } from 'node-pkware'
import { Settings } from '@src/Settings.js'

const { through, transformSplitBy, splitAt, transformIdentity } = stream

const compileFTS = async (settings: Settings) => {
  const ftsPath = path.join(settings.outputDir, `game/graph/levels/level${settings.levelIdx}`)
  const ftsJSONRaw = await fs.promises.readFile(path.join(ftsPath, 'fast.fts.json'), 'utf-8')
  const ftsJSON = JSON.parse(ftsJSONRaw) as ArxFTS

  const repackedFts = FTS.save(ftsJSON)
  const { total: ftsHeaderSize } = getHeaderSize(repackedFts, 'fts')

  Readable.from(repackedFts)
    .pipe(
      through(
        transformSplitBy(
          splitAt(ftsHeaderSize),
          transformIdentity(),
          implode(Compression.Binary, DictionarySize.Large),
        ),
      ),
    )
    .pipe(fs.createWriteStream(path.join(ftsPath, 'fast.fts')))
}

const compileLLF = async (settings: Settings) => {
  const llfPath = path.join(settings.outputDir, `graph/levels/level${settings.levelIdx}`)
  const llfJSONRaw = await fs.promises.readFile(path.join(llfPath, `level${settings.levelIdx}.llf.json`), 'utf-8')
  const llfJSON = JSON.parse(llfJSONRaw) as ArxLLF

  const repackedLlf = LLF.save(llfJSON)
  const { total: llfHeaderSize } = getHeaderSize(repackedLlf, 'llf')

  Readable.from(repackedLlf)
    .pipe(
      through(
        transformSplitBy(
          splitAt(llfHeaderSize),
          transformIdentity(),
          implode(Compression.Binary, DictionarySize.Large),
        ),
      ),
    )
    .pipe(fs.createWriteStream(path.join(llfPath, `level${settings.levelIdx}.llf`)))
}

const compileDLF = async (settings: Settings) => {
  const dlfPath = path.join(settings.outputDir, `graph/levels/level${settings.levelIdx}`)
  const dlfJSONRaw = await fs.promises.readFile(path.join(dlfPath, `level${settings.levelIdx}.dlf.json`), 'utf-8')
  const dlfJSON = JSON.parse(dlfJSONRaw) as ArxDLF

  const repackedDlf = DLF.save(dlfJSON)
  const { total: dlfHeaderSize } = getHeaderSize(repackedDlf, 'dlf')

  Readable.from(repackedDlf)
    .pipe(
      through(
        transformSplitBy(
          splitAt(dlfHeaderSize),
          transformIdentity(),
          implode(Compression.Binary, DictionarySize.Large),
        ),
      ),
    )
    .pipe(fs.createWriteStream(path.join(dlfPath, `level${settings.levelIdx}.dlf`)))
}

const hasLights = async (settings: Settings) => {
  const llfPath = path.join(settings.outputDir, `graph/levels/level${settings.levelIdx}`)
  const llfJSONRaw = await fs.promises.readFile(path.join(llfPath, `level${settings.levelIdx}.llf.json`), 'utf-8')
  const llfJSON = JSON.parse(llfJSONRaw) as ArxLLF

  return llfJSON.lights.length > 0
}

const hasDotnet6OrNewer = async () => {
  try {
    const { stdout } = await promisify(exec)(`dotnet --version`)
    const majorOfVersion = parseInt(stdout.trim().split('.')[0])
    return majorOfVersion >= 6
  } catch (e: unknown) {
    return false
  }
}

const calculateLighting = async (settings: Settings) => {
  const operatingSystem = os.platform()

  if (operatingSystem !== 'win32' && operatingSystem !== 'linux') {
    console.error(
      `[error] compile: lighting generator: unsupported platform (expected "win32" or "linux", but got "${operatingSystem}")`,
    )
    return
  }

  if (!(await hasDotnet6OrNewer())) {
    console.error(
      `[error] compile: lighting generator: no compatible version found (expected "dotnet --version" to return 6.x.x, 7.x.x or newer)`,
    )
    return
  }

  const args = [
    `--level "level${settings.levelIdx}"`,
    `--arx-data-dir "${settings.outputDir}"`,
    `--lighting-profile "${settings.lightingCalculatorMode}"`,
  ]

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)

  const libPath = path.resolve(__dirname, '../../lib')

  let exeFile: string
  switch (operatingSystem) {
    case 'win32':
      exeFile = path.resolve(libPath, `fredlllll-lighting-calculator/win/ArxLibertatisLightingCalculator.exe`)
      break
    case 'linux':
      exeFile = path.resolve(libPath, `fredlllll-lighting-calculator/linux/ArxLibertatisLightingCalculator`)
      break
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

export const compile = async (settings: Settings) => {
  await Promise.allSettled([compileFTS(settings), compileLLF(settings), compileDLF(settings)])

  if (settings.calculateLighting && (await hasLights(settings))) {
    await calculateLighting(settings)
  }
}
