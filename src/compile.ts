import { exec } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { DLF, FTS, LLF } from 'arx-convert'
import { type ArxDLF, type ArxFTS, type ArxLLF } from 'arx-convert/types'
import { getHeaderSize } from 'arx-header-size'
import { Compression, DictionarySize, implode, stream } from 'node-pkware'
import { type Settings } from '@src/Settings.js'

const { through, transformSplitBy, splitAt, transformIdentity } = stream

async function compileFTS(settings: Settings, fts: ArxFTS): Promise<void> {
  const ftsPath = path.join(settings.outputDir, `game/graph/levels/level${settings.levelIdx}`)

  if (settings.uncompressedFTS) {
    const repackedFts = FTS.save(fts, false)
    await fs.promises.writeFile(path.join(ftsPath, 'fast.fts'), repackedFts)
    return
  }

  const repackedFts = FTS.save(fts, true)
  const { total: ftsHeaderSize } = getHeaderSize(repackedFts, 'fts')

  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(path.join(ftsPath, 'fast.fts'))

    writeStream
      .on('close', () => {
        resolve()
      })
      .on('error', (e) => {
        reject(e)
      })

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
      .pipe(writeStream)
  })
}

async function compileLLF(settings: Settings, llf: ArxLLF): Promise<void> {
  const llfPath = path.join(settings.outputDir, `graph/levels/level${settings.levelIdx}`)

  const repackedLlf = LLF.save(llf)
  const { total: llfHeaderSize } = getHeaderSize(repackedLlf, 'llf')

  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(path.join(llfPath, `level${settings.levelIdx}.llf`))

    writeStream
      .on('close', () => {
        resolve()
      })
      .on('error', (e) => {
        reject(e)
      })

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
      .pipe(writeStream)
  })
}

async function compileDLF(settings: Settings, dlf: ArxDLF): Promise<void> {
  const dlfPath = path.join(settings.outputDir, `graph/levels/level${settings.levelIdx}`)

  const repackedDlf = DLF.save(dlf)
  const { total: dlfHeaderSize } = getHeaderSize(repackedDlf, 'dlf')

  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(path.join(dlfPath, `level${settings.levelIdx}.dlf`))

    writeStream
      .on('close', () => {
        resolve()
      })
      .on('error', (e) => {
        reject(e)
      })

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
      .pipe(writeStream)
  })
}

async function hasDotnet6OrNewer(): Promise<boolean> {
  try {
    const { stdout } = await promisify(exec)(`dotnet --version`)
    const majorOfVersion = Number.parseInt(stdout.trim().split('.')[0], 10)
    return majorOfVersion >= 6
  } catch {
    return false
  }
}

async function calculateLighting(settings: Settings): Promise<void> {
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

  if (settings.uncompressedFTS) {
    args.push(`--dont-compress-fts`)
  }

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)

  const libPath = path.resolve(__dirname, '../../lib')

  let exeFile: string
  switch (operatingSystem) {
    case 'win32': {
      exeFile = path.resolve(libPath, `fredlllll-lighting-calculator/win/ArxLibertatisLightingCalculator.exe`)
      break
    }

    case 'linux': {
      exeFile = path.resolve(libPath, `fredlllll-lighting-calculator/linux/ArxLibertatisLightingCalculator`)
      break
    }
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

export async function compile(
  settings: Settings,
  { dlf, llf, fts }: { dlf: ArxDLF; llf: ArxLLF; fts: ArxFTS },
): Promise<void> {
  await Promise.allSettled([compileFTS(settings, fts), compileLLF(settings, llf), compileDLF(settings, dlf)])

  if (settings.calculateLighting && llf.lights.length > 0) {
    await calculateLighting(settings)
  }
}
