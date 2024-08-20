#!/usr/bin/env -S node --enable-source-maps
import process from 'node:process'
import minimist from 'minimist-lite'
import { Settings } from '@src/Settings.js'
import { rungame } from '@src/bin/rungame.js'

type AppArgs = {
  rungame: boolean
}

const args: AppArgs = minimist(process.argv.slice(2), {
  boolean: ['rungame'],
})

const settings = new Settings()

if (args.rungame) {
  const otherArgs = process.argv.slice(2).filter((param) => {
    return !param.trim().startsWith('--rungame')
  })
  await rungame(settings, otherArgs)
} else {
  console.info('[info] cli: available commands: "--rungame"')
  console.info('[info] cli: all other parameters will be passed to the arx executable')
}
