import type { ArxFTS, ArxDLF, ArxLLF } from 'arx-convert/types'
import type { Simplify } from 'type-fest'
import { ArxMap } from '@src/ArxMap.js'
import { stringifyJSON } from '@bin/helpers.js'
import type { SettingsConstructorProps } from '@platform/common/Settings.js'
import { Settings } from '@platform/node/Settings.js'
import { readTextFile, writeTextFile } from '@platform/node/io.js'

export async function finalize(
  inputs: { dlf: string; fts: string; llf: string },
  outputs: { dlf: string; fts: string; llf: string },
  config: Simplify<Pick<SettingsConstructorProps, 'calculateLighting' | 'lightingCalculatorMode'>>,
  prettify: boolean = false,
): Promise<void> {
  const rawDLF = await readTextFile(inputs.dlf)
  const jsonDLF = JSON.parse(rawDLF) as ArxDLF

  const rawFTS = await readTextFile(inputs.fts)
  const jsonFTS = JSON.parse(rawFTS) as ArxFTS

  const rawLLF = await readTextFile(inputs.llf)
  const jsonLLF = JSON.parse(rawLLF) as ArxLLF

  const map = new ArxMap(jsonDLF, jsonFTS, jsonLLF)

  const settings = new Settings({
    ...config,
    levelIdx: jsonDLF.scene.levelIdx,
  })

  map.finalize(settings)

  const { dlf, fts, llf } = await map.toArxData(settings)

  const stringDLF = stringifyJSON(dlf, prettify)
  await writeTextFile(outputs.dlf, stringDLF)

  const stringFTS = stringifyJSON(fts, prettify)
  await writeTextFile(outputs.fts, stringFTS)

  const stringLLF = stringifyJSON(llf, prettify)
  await writeTextFile(outputs.llf, stringLLF)
}
