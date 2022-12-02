import { ArxFTS } from 'arx-level-json-converter/dist/fts/FTS'
import path from 'path'

const { OUTPUTDIR = path.resolve('./dist'), LEVEL = 1 } = process.env

console.log({
  OUTPUTDIR,
  LEVEL,
})
