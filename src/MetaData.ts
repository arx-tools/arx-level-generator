export class MetaData {
  mapName: string = ''
  generator: string = 'Arx Level Generator'
  generatorVersion: string = ''
  seed: string = ''

  toData() {
    return {
      mapName: this.mapName,
      generator: this.generator,
      generatorVersion: this.generatorVersion,
      seed: this.seed,
    }
  }
}
