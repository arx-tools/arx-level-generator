import path from 'node:path'
import { MathUtils } from 'three'
import { Texture, type TextureExportData } from '@src/Texture.js'
import type { SingleFileExport } from '@src/types.js'
import type { Settings } from '@platform/common/Settings.js'
import { getMetadata } from '../services/image.js'

export class TextureExporter {
  private readonly settings: Settings

  // private alreadyMadeTileable: boolean

  constructor(settings: Settings) {
    this.settings = settings
  }

  async exportSourceAndTarget(textureExportData: TextureExportData): Promise<SingleFileExport> {
    const { needsToBeTileable, dontCatchErrors, isInternalAsset, source, target } = textureExportData.data

    let inputFile: string
    if (isInternalAsset) {
      inputFile = path.resolve(this.settings.assetsDir, source.path, source.filename)
    } else {
      inputFile = path.resolve(this.settings.internalAssetsDir, source.path, source.filename)
    }

    try {
      if (needsToBeTileable) {
        const { width, height } = await getMetadata(inputFile)
        const isTileable = this.isTileable(width, height)
        if (!isTileable) {
          return await this.makeTileable(/* TODO */)
        }
      }

      return await this.makeCopy(/* TODO */)
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

  private isTileable(width: number, height: number): boolean {
    return width === height && MathUtils.isPowerOfTwo(width)
  }

  private async makeTileable(): Promise<SingleFileExport> {
    const wait = Promise.resolve()
    await wait

    // TODO

    return ['todo', 'todo']
  }

  private async makeCopy(): Promise<SingleFileExport> {
    const wait = Promise.resolve()
    await wait

    // TODO

    return ['todo', 'todo']
  }

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
