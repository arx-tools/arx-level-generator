import { type ISettings } from '@platform/common/ISettings.js'

export type MetaData = {
  seed: string

  generator: string
  generatorVersion: string
  generatorUrl: string

  name: string
  version: string
  description: string
  author: string
  url: string
}

export async function generateMetadata(settings: ISettings): Promise<MetaData> {
  const generator = await settings.getGeneratorPackageJSON()
  const project = await settings.getProjectPackageJSON()

  return {
    seed: settings.seed,

    generator: generator.name,
    generatorVersion: generator.version,
    generatorUrl: generator.homepage,

    name: project.name,
    version: project.version,
    description: project.description,
    author: project.author,
    url: project.homepage,
  }
}
