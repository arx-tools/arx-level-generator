export interface Manifest {
  generate(assetList: string[], prettify?: boolean): Promise<ArrayBufferLike>

  /**
   * read existing `manifest.json` from `this.settings.outputDir` if there's any
   * and deletes the files listed in it from the outputDir
   *
   * this method is optional to implement
   */
  uninstall?(): Promise<void>
}
