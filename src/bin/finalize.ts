import fs from 'node:fs/promises'
import { type ArxFTS, type ArxDLF, type ArxLLF } from 'arx-convert/types'
import { ArxMap } from '@src/ArxMap.js'
import { Settings, type SettingsConstructorProps } from '@src/Settings.js'
import { stringifyJSON } from './helpers.js'

export async function finalize(
  inputs: { dlf: string; fts: string; llf: string },
  outputs: { dlf: string; fts: string; llf: string },
  config: Pick<SettingsConstructorProps, 'calculateLighting' | 'lightingCalculatorMode'>,
  prettify: boolean = false,
): Promise<void> {
  const rawDLF = await fs.readFile(inputs.dlf, 'utf8')
  const jsonDLF = JSON.parse(rawDLF) as ArxDLF

  const rawFTS = await fs.readFile(inputs.fts, 'utf8')
  const jsonFTS = JSON.parse(rawFTS) as ArxFTS

  const rawLLF = await fs.readFile(inputs.llf, 'utf8')
  const jsonLLF = JSON.parse(rawLLF) as ArxLLF

  const map = new ArxMap(jsonDLF, jsonFTS, jsonLLF)

  const settings = new Settings({
    ...config,
    levelIdx: jsonDLF.scene.levelIdx,
  })

  map.finalize(settings)

  const { dlf, fts, llf } = await map.toArxData(settings)

  const stringDLF = stringifyJSON(dlf, prettify)
  await fs.writeFile(outputs.dlf, stringDLF, 'utf8')

  const stringFTS = stringifyJSON(fts, prettify)
  await fs.writeFile(outputs.fts, stringFTS, 'utf8')

  const stringLLF = stringifyJSON(llf, prettify)
  await fs.writeFile(outputs.llf, stringLLF, 'utf8')
}
