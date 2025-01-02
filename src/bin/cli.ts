#!/usr/bin/env -S node --enable-source-maps

import process from 'node:process'
import minimist from 'minimist-lite'
import { type SettingsConstructorProps } from '@platform/common/ISettings.js'
import { Settings } from '@platform/node/Settings.js'
import { finalize } from '@bin/finalize.js'
import { getPackageVersion } from '@bin/helpers.js'
import { rungame } from '@bin/rungame.js'

type AppArgs = {
  _: string[]
  rungame: boolean
  finalize: boolean
  version: boolean
  v: boolean
}

const args: AppArgs = minimist(process.argv.slice(2), {
  string: ['output'],
  boolean: ['rungame', 'finalize'],
  alias: {
    v: 'version',
  },
})

if (args.version) {
  const version = await getPackageVersion()
  console.log(`arx-level-generator - version ${version}`)
  process.exit(0)
}

if (args.rungame) {
  const settings = new Settings()
  const otherArgs = process.argv.slice(2).filter((param) => {
    return !param.trim().startsWith('--rungame')
  })
  await rungame(settings, otherArgs)
  process.exit(0)
}

if (args.finalize) {
  // TODO: read values to all the options below from CLI

  const inputs = {
    dlf: '',
    fts: '',
    llf: '',
  }

  const outputs = {
    dlf: '',
    fts: '',
    llf: '',
  }
  const config: Pick<SettingsConstructorProps, 'calculateLighting' | 'lightingCalculatorMode'> = {
    calculateLighting: true,
    lightingCalculatorMode: 'Arx',
  }

  const prettify = true

  // TODO: error handling
  await finalize(inputs, outputs, config, prettify)
  process.exit(0)
}
