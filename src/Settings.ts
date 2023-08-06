import path from 'node:path'

type SettingsConstructorProps = {
  /**
   * default value is "../pkware-test-files" relative to the project root
   */
  originalLevelFiles?: string
  /**
   * default value is "./.cache" relative to the project root
   */
  cacheFolder?: string
}

export class Settings {
  originalLevelFiles: string
  cacheFolder: string

  constructor(props: SettingsConstructorProps) {
    this.originalLevelFiles = props.originalLevelFiles ?? path.resolve('../pkware-test-files')
    this.cacheFolder = props.cacheFolder ?? path.resolve('./.cache')
  }
}
