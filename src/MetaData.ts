import { Settings } from '@src/Settings.js'
import { getGeneratorPackageJSON, getProjectPackageJSON } from '@src/helpers.js'

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

export const generateMetadata = async (settings: Settings): Promise<MetaData> => {
  const generator = await getGeneratorPackageJSON()
  const project = await getProjectPackageJSON()

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
