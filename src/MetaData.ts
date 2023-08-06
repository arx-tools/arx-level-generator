export class MetaData {
  mapName: string = ''
  generator: string = 'Arx Level Generator'
  generatorVersion: string = ''
  credits: string =
    'This map was made using tools created by Lajos Mészáros and Frederik Gelder - Visit https://arx-tools.github.io/ to find out more.'

  toData() {
    return {
      mapName: this.mapName,
      generator: this.generator,
      generatorVersion: this.generatorVersion,
      credits: this.credits,
    }
  }
}
