import type { ArxMap } from '@src/ArxMap.js'
import { ensureArray, uniq } from '@src/faux-ramda.js'
import type { IODiff, Platform as IPlatform } from '@platform/common/Platform.js'
import type { Settings } from '@platform/common/Settings.js'

export class Platform implements IPlatform {
  private readonly maps: ArxMap[]

  constructor() {
    this.maps = []
  }

  from(map: ArxMap | ArxMap[]): this {
    this.maps.push(...ensureArray(map))
    return this
  }

  async save(settings: Settings, exportJsonFiles: boolean = false, prettify: boolean = false): Promise<void> {
    const files: IODiff = {
      toAdd: {},
      toCopy: {},
      toRemove: [],
      toExport: [],
    }

    const maps = uniq(this.maps)

    for (const map of maps) {
      const { toAdd, toCopy, toExport } = await map.export(settings, exportJsonFiles, prettify)
      files.toAdd = { ...files.toAdd, ...toAdd }
      files.toCopy = { ...files.toCopy, ...toCopy }
      files.toExport = [...files.toExport, ...toExport]
    }

    /*
    // TODO: implement browser version of TextureExporter
    const textureExporter = new TextureExporter(settings)

    for (const exportData of files.toExport) {
      if (exportData.type === 'Texture') {
        const [source, target] = textureExporter.exportSourceAndTarget(exportData)
        files.toCopy[target] = source
      }
    }
    */

    // TODO: combine contents of files.toCopy and files.toAdd and put them into a zip file
  }
}
