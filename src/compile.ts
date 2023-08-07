import fs from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import { FTS } from 'arx-convert'
import { ArxFTS } from 'arx-convert/types'
import { getHeaderSize } from 'arx-header-size'
import { Compression, DictionarySize, implode, stream } from 'node-pkware'
import { Settings } from '@src/Settings.js'

const { through, transformSplitBy, splitAt, transformIdentity } = stream

export const compile = async (settings: Settings) => {
  // compile FTS

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

  // compile LLF
  // compile DLF
  // calculate lighting
}
