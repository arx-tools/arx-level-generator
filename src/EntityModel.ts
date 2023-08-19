import path from 'node:path'
import { Settings } from './Settings.js'

type EntityModelConstructorProps = {
  filename: string
  sourcePath: string
}

export class EntityModel {
  static targetPath = 'game/graph/obj3d/interactive'

  filename: string
  sourcePath: string

  constructor(props: EntityModelConstructorProps) {
    this.filename = props.filename
    this.sourcePath = props.sourcePath
  }

  clone() {
    return new EntityModel({
      filename: this.filename,
      sourcePath: this.sourcePath,
    })
  }

  /**
   * targetName is the folder relative to EntityModel.targetPath without the filename,
   * for example `items/quest_item/mirror`
   */
  exportSourceAndTarget(settings: Settings, targetName: string) {
    const source = path.resolve(settings.assetsDir, this.sourcePath, this.filename)

    const { name: filename } = path.parse(targetName)
    const target = path.resolve(settings.outputDir, EntityModel.targetPath, targetName, `${filename}.ftl`)

    const files: Record<string, string> = {
      [target]: source,
    }

    return files
  }
}
