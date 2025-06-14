import type { TextureExportData } from '@src/Texture.js'
import type { SingleFileExport } from '@src/types.js'
import type { Settings } from '@platform/common/Settings.js'

export class TextureExporter {
  private readonly settings: Settings

  // private alreadyMadeTileable: boolean

  constructor(settings: Settings) {
    this.settings = settings
  }

  exportSourceAndTarget(textureExportData: TextureExportData): SingleFileExport {
    const { needsToBeTileable, dontCatchErrors, isInternalAsset, source, target } = textureExportData.data

    // try {
    //   if (needsToBeTileable) {
    //     const isTileable = await this.isTileable(settings)
    //     if (isTileable !== true) {
    //       return await this.makeTileable(settings)
    //     }
    //   }
    //   return await this.makeCopy(settings)
    // } catch (error: unknown) {
    //   if (dontCatchErrors) {
    //     throw error
    //   }
    //   console.error(`[error] Texture: file not found: "${this.filename}", using fallback texture`)
    //   const fallbackTexture = Texture.missingTexture
    //   this.filename = fallbackTexture.filename
    //   this.sourcePath = fallbackTexture.sourcePath
    //   this.width = fallbackTexture.width
    //   this.height = fallbackTexture.height
    //   this.isInternalAsset = fallbackTexture.isInternalAsset
    //   return this.makeCopy(settings)
    // }

    return ['todo', 'todo']
  }

  // TODO: we no longer store the width and height, needs to be always calculated

  // private async setSizeFromFile(settings: Settings): Promise<void> {
  //   if (this.width === SIZE_UNKNOWN || this.height === SIZE_UNKNOWN) {
  //     const { width, height } = await getMetadata(this.getFilename(settings))
  //     this.width = width ?? SIZE_UNKNOWN
  //     this.height = height ?? SIZE_UNKNOWN
  //   }
  // }

  // /**
  //  * calling this also tries to set the values of `this.width` and `this.height` if any of them is `SIZE_UNKNOWN`
  //  *
  //  * if `SIZE_UNKNOWN` prevails after the setters, then the return value is `undefined`
  //  */
  // private async isTileable(settings: Settings): Promise<boolean | undefined> {
  //   await this.setSizeFromFile(settings)

  //   if (this.width === SIZE_UNKNOWN || this.height === SIZE_UNKNOWN) {
  //     return undefined
  //   }

  //   return this.width === this.height && MathUtils.isPowerOfTwo(this.width)
  // }

  // private getFilename(settings: Settings): string {
  //   let assetsDir: string
  //   if (this.isInternalAsset) {
  //     assetsDir = settings.internalAssetsDir
  //   } else {
  //     assetsDir = settings.assetsDir
  //   }

  //   return path.resolve(assetsDir, this.sourcePath ?? BaseTexture.targetPath, this.filename)
  // }

  // private getFilenameAndExtension(): { filename: string; extension: SupportedExtension } {
  //   const { ext, name } = path.parse(this.filename)

  //   let filename: string
  //   let extension: SupportedExtension

  //   if (isSupportedExtension(ext)) {
  //     filename = this.filename
  //     extension = ext
  //   } else {
  //     filename = `${name}.jpg`
  //     extension = '.jpg'
  //   }

  //   return {
  //     filename,
  //     extension,
  //   }
  // }

  // private async makeCopy(settings: Settings): Promise<SingleFileExport> {
  //   const { filename, extension } = this.getFilenameAndExtension()

  //   const originalSource = this.getFilename(settings)
  //   const convertedTarget = path.resolve(settings.outputDir, BaseTexture.targetPath, filename)

  //   const convertedSourceFolder = await createCacheFolderIfNotExists(
  //     this.sourcePath ?? BaseTexture.targetPath,
  //     settings,
  //   )
  //   const convertedSource = path.join(convertedSourceFolder, filename)

  //   const currentHash = await createHashOfFile(originalSource, { isTileable: false })

  //   if (await fileOrFolderExists(convertedSource)) {
  //     const storedHash = await loadHashOf(originalSource, settings)

  //     if (storedHash === currentHash) {
  //       return [convertedSource, convertedTarget]
  //     }
  //   }

  //   await saveHashOf(originalSource, currentHash, settings)

  //   const image = await getSharpInstance(originalSource)

  //   switch (extension) {
  //     case '.bmp': {
  //       await sharpToBmp(image, convertedSource)
  //       break
  //     }

  //     case '.png': {
  //       await image.png({ quality: 100 }).toFile(convertedSource)
  //       break
  //     }

  //     case '.jpeg':
  //     case '.jpg': {
  //       await image.jpeg({ quality: 100, progressive: false }).toFile(convertedSource)
  //       break
  //     }

  //     /*
  //     case '.tga': {
  //       // TODO
  //       break
  //     }
  //     */
  //   }

  //   return [convertedSource, convertedTarget]
  // }

  // private async makeTileable(settings: Settings): Promise<SingleFileExport> {
  //   const { filename, extension } = this.getFilenameAndExtension()

  //   const originalSource = this.getFilename(settings)
  //   const convertedTarget = path.resolve(settings.outputDir, BaseTexture.targetPath, filename)

  //   const convertedSourceFolder = await createCacheFolderIfNotExists(
  //     this.sourcePath ?? BaseTexture.targetPath,
  //     settings,
  //   )
  //   const convertedSource = path.join(convertedSourceFolder, filename)

  //   if (this.alreadyMadeTileable) {
  //     return [convertedSource, convertedTarget]
  //   }

  //   const currentHash = await createHashOfFile(originalSource, { isTileable: true })

  //   if (await fileOrFolderExists(convertedSource)) {
  //     const storedHash = await loadHashOf(originalSource, settings)

  //     if (storedHash === currentHash) {
  //       this.alreadyMadeTileable = true
  //       return [convertedSource, convertedTarget]
  //     }
  //   }

  //   await saveHashOf(originalSource, currentHash, settings)

  //   const image = await getSharpInstance(originalSource)

  //   const powerOfTwo = MathUtils.floorPowerOfTwo(this.width)

  //   image.resize(powerOfTwo, powerOfTwo, { fit: 'cover' })

  //   switch (extension) {
  //     case '.bmp': {
  //       await sharpToBmp(image, convertedSource)
  //       break
  //     }

  //     case '.png': {
  //       await image.png({ quality: 100 }).toFile(convertedSource)
  //       break
  //     }

  //     case '.jpeg':
  //     case '.jpg': {
  //       await image.jpeg({ quality: 100, progressive: false }).toFile(convertedSource)
  //       break
  //     }

  //     /*
  //     case '.tga': {
  //       // TODO
  //       break
  //     }
  //     */
  //   }

  //   this.alreadyMadeTileable = true

  //   return [convertedSource, convertedTarget]
  // }
}
