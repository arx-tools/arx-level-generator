export class MetaData {
  name = ''
  description = ''
  version = ''
  author = ''
  url = ''
  generator = 'Arx Level Generator'
  generatorUrl = ''
  generatorVersion = ''
  seed = ''

  toData() {
    return {
      name: this.name,
      description: this.description,
      version: this.version,
      author: this.author,
      url: this.url,
      generator: this.generator,
      generatorVersion: this.generatorVersion,
      generatorUrl: this.generatorUrl,
      seed: this.seed,
    }
  }
}
