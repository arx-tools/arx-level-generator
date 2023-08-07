import fs from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
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

export const compile = async (settings: Settings) => {
  await Promise.all([compileFTS(settings), compileLLF(settings), compileDLF(settings)])

  // calculate lighting
}
