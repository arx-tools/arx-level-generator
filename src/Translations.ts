import fs from 'node:fs'
import path from 'node:path'

export class Translations {
  translations: Record<string, Record<string, string>> = {}

  exportSourcesAndTargets(outputDir: string) {
    const translations: Record<string, Record<string, string>> = {}

    Object.entries(this.translations).forEach(([key, valuesByLanguage]) => {
      Object.entries(valuesByLanguage).forEach(([language, value]) => {
        if (!translations[language]) {
          translations[language] = {}
        }
        translations[language][key] = value
      })
    })

    const results: Record<string, string> = {}

    Object.entries(translations).forEach(([language, dictionary]) => {
      const content = this.stringifyDictionary(dictionary)
      if (content.length) {
        const filename = path.resolve(outputDir, `localisation/xtext_${language}_002_arx-level-generator.ini`)
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

  add(translations: Record<string, Record<string, string>>) {
    this.translations = {
      ...this.translations,
      ...translations,
    }
  }

  async addFromFile(filename: string) {
    try {
      const rawIn = await fs.promises.readFile(filename, 'utf-8')
      const translations = JSON.parse(rawIn) as Record<string, Record<string, string>>
      this.add(translations)
    } catch (error) {
      console.error(error)
    }
  }
}
