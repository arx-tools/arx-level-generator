import path from 'node:path'
import { sharpToBmp } from 'sharp-bmp'
import { MathUtils } from 'three'
import { type SupportedExtension, Texture, type TextureExportData } from '@src/Texture.js'
import type { SingleFileExport } from '@src/types.js'
import type { Settings } from '@platform/common/Settings.js'
import { fileOrFolderExists } from '@platform/node/io.js'
import { createHashOfFile, loadHashOf, saveHashOf } from '@platform/node/services/cache.js'
import { getMetadata, getSharpInstance } from '@platform/node/services/image.js'

export class TextureExporter {
  private readonly settings: Settings

  // private alreadyMadeTileable: boolean

  constructor(settings: Settings) {
    this.settings = settings
  }

  async exportSourceAndTarget(textureExportData: TextureExportData): Promise<SingleFileExport> {
    const { needsToBeTileable, dontCatchErrors, isInternalAsset, source, target } = textureExportData.data

    try {
      if (needsToBeTileable) {
        const { width, height } = await getMetadata(this.getPathToSource(textureExportData.data))
        const isTileable = this.isTileable(width, height)
        if (!isTileable) {
          return await this.makeTileable(textureExportData.data)
        }
      }

      return await this.makeCopy(textureExportData.data)
    } catch (error: unknown) {
      if (dontCatchErrors) {
        throw error
      }

      let fallbackTexture: Texture
      if (target.filename.endsWith('[icon].bmp')) {
        fallbackTexture = Texture.missingInventoryIcon
      } else {
        fallbackTexture = Texture.missingTexture
      }

      console.error(`[error] TextureExporter: file not found: "${source.filename}", using fallback texture`)

      return await this.makeCopy(/* TODO */)
    }
  }

  private getPathToSource({ isInternalAsset, source }: TextureExportData['data']): string {
    let pathToSource: string
    if (isInternalAsset) {
      pathToSource = path.resolve(this.settings.assetsDir, source.path, source.filename)
    } else {
      pathToSource = path.resolve(this.settings.internalAssetsDir, source.path, source.filename)
    }

    return pathToSource
  }

  private getPathToCache({}: TextureExportData['data']): string {
    let pathToCache: string

    // TODO: implement method - make sure to change the extension to jpg if source is not ending in a supported format

    return pathToCache
  }

  private getPathToTarget({}: TextureExportData['data']): string {
    let pathToTarget: string

    // TODO: implement method - make sure to override target filename extension to jpg if not ending in a supported format

    return pathToTarget
  }

  /*
  const { filename, extension } = this.getFilenameAndExtension()

  const originalSource = this.getFilename(settings)
  const convertedTarget = path.resolve(settings.outputDir, BaseTexture.targetPath, filename)

  const convertedSourceFolder = await createCacheFolderIfNotExists(
    this.sourcePath ?? BaseTexture.targetPath,
    settings,
  )
  const convertedSource = path.join(convertedSourceFolder, filename)
  */

  private isTileable(width: number, height: number): boolean {
    return width === height && MathUtils.isPowerOfTwo(width)
  }

  private async makeTileable(exportData: TextureExportData['data']): Promise<SingleFileExport> {
    // TODO

    return ['todo', 'todo']
  }

  private async makeCopy(exportData: TextureExportData['data']): Promise<SingleFileExport> {
    const pathToSource = this.getPathToSource(exportData)
    const pathToCache = this.getPathToCache(exportData)
    const pathToTarget = this.getPathToTarget(exportData)

    const currentHash = await createHashOfFile(pathToSource, { isTileable: false })

    if (await fileOrFolderExists(pathToCache)) {
      const storedHash = await loadHashOf(pathToSource, this.settings)

      if (storedHash === currentHash) {
        return [pathToSource, pathToTarget]
      }
    }

    await saveHashOf(pathToSource, currentHash, this.settings)

    const image = await getSharpInstance(pathToSource)

    const extension = path.parse(pathToCache).ext as SupportedExtension
    switch (extension) {
      case '.bmp': {
        await sharpToBmp(image, pathToCache)
        break
      }

      case '.png': {
        await image.png({ quality: 100 }).toFile(pathToCache)
        break
      }

      case '.jpeg':
      case '.jpg': {
        await image.jpeg({ quality: 100, progressive: false }).toFile(pathToCache)
        break
      }
    }

    return [pathToSource, pathToTarget]
  }

  /*
  private getFilenameAndExtension(pathToFile: string): { filename: string; extension: SupportedExtension } {
    const { ext, name } = path.parse(pathToFile)

    if (isSupportedExtension(ext)) {
      return {
        filename: `${name}${ext}`,
        extension: ext,
      }
    }

    return {
      filename: `${name}.jpg`,
      extension: '.jpg',
    }
  }
  */

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
