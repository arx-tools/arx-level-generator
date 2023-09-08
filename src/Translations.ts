import fs from 'node:fs'
import path from 'node:path'
import { Settings } from '@src/Settings.js'

export type Locales =
  | 'chinese'
  | 'german'
  | 'english'
  | 'french'
  | 'hungarian'
  | 'italian'
  | 'japanese'
  | 'russian'
  | 'spanish'

const toArxLocale = (locale: Locales) => {
  if (locale === 'german') {
    return 'deutsch'
  }

  if (locale === 'french') {
    return 'francais'
  }

  if (locale === 'italian') {
    return 'italiano'
  }

  return locale
}

export class Translations {
  translations: Record<string, Partial<Record<Locales, string>>> = {}

  exportSourcesAndTargets(settings: Settings) {
    const translations: Partial<Record<Locales, Record<string, string>>> = {}

    Object.entries(this.translations).forEach(([key, valuesByLocale]) => {
      const localeValuePairs = Object.entries(valuesByLocale) as [Locales, string][]
      localeValuePairs.forEach(([locale, value]) => {
        const translation = translations[locale]
        if (typeof translation === 'undefined') {
          translations[locale] = {
            [key]: value,
          }
        } else {
          translation[key] = value
        }
      })
    })

    const results: Record<string, string> = {}

    const languageDictionaryPairs = Object.entries(translations) as [Locales, Record<string, string>][]
    languageDictionaryPairs.forEach(([locale, dictionary]) => {
      const content = this.stringifyDictionary(dictionary)
      if (content.length) {
        const filename = path.resolve(
          settings.outputDir,
          `localisation/xtext_${toArxLocale(locale)}_002_arx-level-generator.ini`,
        )
        results[filename] = content
      }
    })

    return results
  }

  stringifyDictionary(dictionary: Record<string, string>) {
    return Object.entries(dictionary)
      .map(([key, value]) => {
        return `[${key}]
  string="${value}"
  
  `
      })
      .join('')
  }

  add(translations: Record<string, Partial<Record<Locales, string>>>) {
    this.translations = {
      ...this.translations,
      ...translations,
    }
  }

  async addFromFile(filename: string, settings: Settings) {
    try {
      const rawIn = await fs.promises.readFile(path.resolve(settings.assetsDir, filename), 'utf-8')
      const translations = JSON.parse(rawIn) as Record<string, Partial<Record<Locales, string>>>
      this.add(translations)
    } catch (error) {
      console.error(error)
    }
  }
}
