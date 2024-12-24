import fs from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
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
    await fs.promises.writeFile(path.join(ftsPath, 'fast.fts'), new Uint8Array(repackedFts))
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

    Readable.from(new Uint8Array(repackedFts))
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

    Readable.from(new Uint8Array(repackedLlf))
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

    Readable.from(new Uint8Array(repackedDlf))
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

export async function compile(
  settings: Settings,
  { dlf, llf, fts }: { dlf: ArxDLF; llf: ArxLLF; fts: ArxFTS },
): Promise<void> {
  await Promise.allSettled([compileFTS(settings, fts), compileLLF(settings, llf), compileDLF(settings, dlf)])
}
