#!/usr/bin/env -S node --enable-source-maps
import minimist from 'minimist-lite'
import { Settings } from '@src/Settings.js'
import { rungame } from './rungame.js'

type AppArgs = {
  rungame: boolean
}

const args: AppArgs = minimist(process.argv.slice(2), {
  boolean: ['rungame'],
})

const settings = new Settings()

if (args.rungame) {
  await rungame(settings)
} else {
  console.info('[info] cli: available commands: "--rungame"')
}
