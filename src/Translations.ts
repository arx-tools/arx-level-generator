import path from 'node:path'
import type { TextExports } from '@src/types.js'
import type { Settings } from '@platform/common/Settings.js'
import { readTextFile } from '@platform/node/io.js'

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

export function toArxLocale(locale: Locales): string {
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

  exportSourcesAndTargets(settings: Settings): TextExports {
    const translations: Partial<Record<Locales, Record<string, string>>> = {}

    Object.entries(this.translations).forEach(([key, valuesByLocale]) => {
      const localeValuePairs = Object.entries(valuesByLocale) as [Locales, string][]
      localeValuePairs.forEach(([locale, value]) => {
        const translation = translations[locale]
        if (translation === undefined) {
          translations[locale] = {
            [key]: value,
          }
        } else {
          translation[key] = value
        }
      })
    })

    const results: TextExports = {}

    const languageDictionaryPairs = Object.entries(translations) as [Locales, Record<string, string>][]
    languageDictionaryPairs.forEach(([locale, dictionary]) => {
      const content = this.stringifyDictionary(dictionary)
      if (content.length > 0) {
        const filename = path.resolve(
          settings.outputDir,
          `localisation/xtext_${toArxLocale(locale)}_002_arx-level-generator.ini`,
        )
        results[filename] = content
      }
    })

    return results
  }

  stringifyDictionary(dictionary: Record<string, string>): string {
    return Object.entries(dictionary)
      .map(([key, value]) => {
        return `[${key}]
string="${value}"

`
      })
      .join('')
  }

  add(translations: Record<string, Partial<Record<Locales, string>>>): void {
    this.translations = {
      ...this.translations,
      ...translations,
    }
  }

  async addFromFile(filename: string, settings: Settings): Promise<void> {
    try {
      const source = path.resolve(settings.assetsDir, filename)
      const rawInput = await readTextFile(source)
      const translations = JSON.parse(rawInput) as Record<string, Partial<Record<Locales, string>>>
      this.add(translations)
    } catch (error) {
      console.error(error)
    }
  }
}
