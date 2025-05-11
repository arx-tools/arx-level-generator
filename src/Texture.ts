import path from 'node:path'
import type { ArxTextureContainer } from 'arx-convert/types'
import { sharpToBmp } from 'sharp-bmp'
import { ClampToEdgeWrapping, Texture as ThreeJsTextue, UVMapping, MathUtils } from 'three'
import type { Simplify } from 'type-fest'
import { ExportBuiltinAssetError } from '@src/errors.js'
import type { SingleFileExport } from '@src/types.js'
import type { Settings } from '@platform/common/Settings.js'
import { fileOrFolderExists } from '@platform/node/io.js'
import {
  createCacheFolderIfNotExists,
  loadHashOf,
  createHashOfFile,
  saveHashOf,
} from '@platform/node/services/cache.js'
import { getMetadata, getSharpInstance } from '@platform/node/services/image.js'

export type TextureConstructorProps = {
  filename: string

  /**
   * whether the texture is from the main game or a custom added file
   *
   * default value is `true` (meaning that the texture is from the game)
   */
  isNative?: boolean

  /**
   * If you already know the size of the texture file, then you can make the class skip some checks
   * when loading custom texture files.
   */
  width?: number

  /**
   * If you already know the size of the texture file, then you can make the class skip some checks
   * when loading custom texture files.
   */
  height?: number

  size?: number

  /**
   * This path is relative to "assets" folder in the project using arx-level-generator
   *
   * default value is `"graph/obj3d/texture"`
   */
  sourcePath?: string

  /**
   * Whether the asset is provided by the arx-level-generator
   *
   * default value is `false`
   */
  isInternalAsset?: boolean
}

export const SIZE_UNKNOWN = -1
export const NO_TEXTURE_CONTAINER = 0

/**
 * @see https://github.com/arx/ArxLibertatis/blob/ArxFatalis-1.21/Sources/EERIE/EERIETexture.cpp#L749
 */
const supportedExtensions = ['.png', '.jpg', '.jpeg', '.bmp' /* , '.tga' */] as const

type SupportedExtension = (typeof supportedExtensions)[number]

function isSupportedExtension(input: any): input is SupportedExtension {
  return typeof input === 'string' && (supportedExtensions as readonly string[]).includes(input)
}

export class Texture extends ThreeJsTextue {
  static readonly targetPath = 'graph/obj3d/textures'

  static fromCustomFile(props: Simplify<Omit<TextureConstructorProps, 'isNative'>>): Texture {
    return new Texture({
      ...props,
      isNative: false,
    })
  }

  static fromArxTextureContainer(texture: ArxTextureContainer): Texture {
    return new Texture({
      filename: texture.filename,
    })
  }

  // ----------------

  static get alpha(): Texture {
    return new Texture({ filename: 'alpha.bmp', size: 32 })
  }

  static get stoneHumanPaving(): Texture {
    return new Texture({ filename: '[stone]_human_paving.bmp', size: 256 })
  }

  static get stoneHumanPaving1(): Texture {
    return new Texture({ filename: '[stone]_human_paving1.bmp', size: 128 })
  }

  static get aliciaRoomMur01(): Texture {
    return new Texture({ filename: 'aliciaroom_mur01.jpg', size: 128 })
  }

  static get aliciaRoomMur02(): Texture {
    return new Texture({ filename: 'aliciaroom_mur02.jpg', size: 128 })
  }

  static get waterCavewater(): Texture {
    return new Texture({ filename: '(water)cavewater.jpg', size: 128 })
  }

  static get l1DragonStoneGround01(): Texture {
    return new Texture({ filename: 'l1_dragon_[stone]_ground01.jpg', size: 128 })
  }

  static get l1DragonIceGround08(): Texture {
    return new Texture({ filename: 'l1_dragon_[ice]_ground08.jpg', size: 128 })
  }

  static get l1DragonSpideLime1Nocol(): Texture {
    return new Texture({ filename: 'L1_Dragon_[spide]_Lime1nocol.bmp', size: 128 })
  }

  static get l1PrisonStoneGridl02(): Texture {
    return new Texture({ filename: 'l1_prison_(stone)_gridl02.bmp', size: 64 })
  }

  static get l1PrisonSandGround01(): Texture {
    return new Texture({ filename: 'l1_prison_[sand]_ground01.jpg', size: 64 })
  }

  static get l1TempleStoneWall03(): Texture {
    return new Texture({ filename: 'l1_temple_[stone]_wall03.jpg', size: 128 })
  }

  static get l2CavesRustyItem01(): Texture {
    return new Texture({ filename: 'l2_caves_[rusty]_item01.jpg', size: 128 })
  }

  static get l2TrollStoneGround04(): Texture {
    return new Texture({ filename: 'l2_troll_[stone]_ground04.jpg', size: 128 })
  }

  static get l2TrollWoodPillar08(): Texture {
    return new Texture({ filename: 'l2_troll_[wood]_pillar08.jpg', size: 256 })
  }

  static get l2GobelStoneFloor02(): Texture {
    return new Texture({ filename: 'l2_gobel_[stone]_floor02.jpg', size: 128 })
  }

  static get l2GobelStoneCenter(): Texture {
    return new Texture({ filename: 'l2_gobel_[stone]_center.jpg', size: 128 })
  }

  static get l3DissidWetGround01(): Texture {
    return new Texture({ filename: 'l3_dissid_[wet]_ground01.jpg', size: 128 })
  }

  static get l3DissidStoneGround09(): Texture {
    return new Texture({ filename: 'l3_dissid_[stone]_ground09.jpg', size: 128 })
  }

  static get l3DissidStoneGround10(): Texture {
    return new Texture({ filename: 'l3_dissid_[stone]_ground10.jpg', size: 128 })
  }

  static get l3DissidIronWall02(): Texture {
    return new Texture({ filename: 'l3_dissid_[iron]_wall02.bmp', size: 64 })
  }

  static get l3DissidStoneWall03(): Texture {
    return new Texture({ filename: 'l3_dissid_[stone]_wall03.jpg', size: 128 })
  }

  static get l3DissidStoneTrans01(): Texture {
    return new Texture({ filename: 'l3_dissid_[stone]_trans01.jpg', size: 128 })
  }

  static get l3DissidWoodFabric03(): Texture {
    return new Texture({ filename: 'l3_dissid_[wood]_fabric03.jpg', size: 256 })
  }

  static get l3DissidWoodFabric04(): Texture {
    return new Texture({ filename: 'l3_dissid_[wood]_fabric04.jpg', size: 128 })
  }

  static get l4YlsideStoneGround01(): Texture {
    return new Texture({ filename: 'l4_ylside_[stone]_ground01.jpg', size: 64 })
  }

  static get l4DwarfIronBoard02(): Texture {
    return new Texture({ filename: 'l4_dwarf_[iron]_board02.jpg', size: 256 })
  }

  static get l4DwarfWoodBoard02(): Texture {
    return new Texture({ filename: 'l4_dwarf_[wood]_board02.jpg', size: 128 })
  }

  static get l5CavesGravelGround05(): Texture {
    return new Texture({ filename: 'l5_caves_[gravel]_ground05.jpg', size: 128 })
  }

  static get l6RatmenFleshWall03(): Texture {
    return new Texture({ filename: 'l6_ratmen_[flesh]_wall03.jpg', size: 256 })
  }

  static get l7DwarfMetalPlate10(): Texture {
    return new Texture({ filename: 'l7_dwarf_[metal]_plate10.jpg', size: 128 })
  }

  static get stoneHumanStoneWall(): Texture {
    return new Texture({ filename: '[stone]_human_stone_wall.jpg', size: 256 })
  }

  static get stoneHumanStoneWall1(): Texture {
    return new Texture({ filename: '[stone]_human_stone_wall1.jpg', size: 256 })
  }

  static get stoneHumanStoneWall2(): Texture {
    return new Texture({ filename: '[stone]_human_stone_wall2.jpg', size: 256 })
  }

  static get stoneHumanAkbaa2F(): Texture {
    return new Texture({ filename: '[stone]_human_akbaa2_f.jpg', size: 256 })
  }

  static get stoneHumanAkbaa4F(): Texture {
    return new Texture({ filename: '[stone]_human_akbaa4_f.jpg', size: 256 })
  }

  static get stoneHumanPriest4(): Texture {
    return new Texture({ filename: '[stone]_human_priest4.jpg', size: 256 })
  }

  static get itemFishingPole2(): Texture {
    return new Texture({ filename: 'item_fishing pole2.bmp', size: 128 })
  }

  static get itemRope(): Texture {
    return new Texture({ filename: 'item_rope.bmp', size: 128 })
  }

  static get fixinterHeavyCatacombDoor(): Texture {
    return new Texture({ filename: 'fixinter_heavy_catacomb_door.bmp', size: 256 })
  }

  static get stoneGroundCavesWet05(): Texture {
    return new Texture({ filename: '[stone]_ground_caves_wet05', size: 128 })
  }

  static get glassGlass01(): Texture {
    return new Texture({ filename: '[glass]_glass01.jpg', size: 128 })
  }

  static get itemCheese(): Texture {
    return new Texture({ filename: 'item_cheese.jpg', size: 64 })
  }

  static get itemRuneAam(): Texture {
    return new Texture({ filename: 'item_rune_aam', size: 64 })
  }

  static get missingTexture(): Texture {
    return Texture.fromCustomFile({
      filename: 'jorge-[stone].jpg',
      sourcePath: 'textures',
      size: 32,
      isInternalAsset: true,
    })
  }

  static get uvDebugTexture(): Texture {
    return Texture.fromCustomFile({
      filename: 'uv-reference-map-[stone].jpg',
      sourcePath: 'textures',
      size: 1024,
      isInternalAsset: true,
    })
  }

  static get missingInventoryIcon(): Texture {
    return Texture.fromCustomFile({
      filename: 'missing[icon].bmp',
      sourcePath: 'ui',
      size: 32,
      isInternalAsset: true,
    })
  }

  // ----------------

  filename: string
  isNative: boolean
  sourcePath?: string
  isInternalAsset: boolean

  private alreadyMadeTileable: boolean
  /**
   * The width of the image where the values is taken from the props given to the constructor.
   * If no width is specified there, then the value will remain `SIZE_UNKNOWN` until `exportSourceAndTarget` is called
   * to delay file IO operations as much as possible (and keeping other methods from becoming async)
   */
  private width: number
  /**
   * The height of the image where the values is taken from the props given to the constructor.
   * If no height is specified there, then the value will remain `SIZE_UNKNOWN` until `exportSourceAndTarget` is called
   * to delay file IO operations as much as possible (and keeping other methods from becoming async)
   */
  private height: number

  constructor(props: TextureConstructorProps) {
    super(undefined, UVMapping, ClampToEdgeWrapping, ClampToEdgeWrapping)

    this.alreadyMadeTileable = false
    this.filename = props.filename
    this.isNative = props.isNative ?? true
    this.sourcePath = props.sourcePath
    this.isInternalAsset = props.isInternalAsset ?? false

    this.width = props.size ?? props.width ?? SIZE_UNKNOWN
    this.height = props.size ?? props.height ?? SIZE_UNKNOWN
  }

  exportState(): TextureConstructorProps {
    return {
      filename: this.filename,
      isNative: this.isNative,
      width: this.width,
      height: this.height,
      sourcePath: this.sourcePath,
      isInternalAsset: this.isInternalAsset,
    }
  }

  clone(): this {
    const copy = new Texture(this.exportState())
    return copy as this
  }

  /**
   * default value for `needsToBeTileable` is false
   *
   * @throws ExportBuiltinAssetError when trying to export an Audio that's built into the base game
   */
  async exportSourceAndTarget(
    settings: Settings,
    needsToBeTileable: boolean = false,
    _dontCatchTheError = false,
  ): Promise<SingleFileExport> {
    if (this.isNative) {
      throw new ExportBuiltinAssetError()
    }

    try {
      if (needsToBeTileable) {
        const isTileable = await this.isTileable(settings)
        if (isTileable !== true) {
          return await this.makeTileable(settings)
        }
      }

      return await this.makeCopy(settings)
    } catch (error: unknown) {
      if (_dontCatchTheError) {
        throw error
      }

      console.error(`[error] Texture: file not found: "${this.filename}", using fallback texture`)
      const fallbackTexture = Texture.missingTexture

      this.filename = fallbackTexture.filename
      this.sourcePath = fallbackTexture.sourcePath
      this.width = fallbackTexture.width
      this.height = fallbackTexture.height
      this.isInternalAsset = fallbackTexture.isInternalAsset

      return this.makeCopy(settings)
    }
  }

  /**
   * Compares filenames of textures.
   *
   * Comparision is case-**insensitive** and ignores file extensions!
   *
   * @example
   * `texture.jpg` == `TEXTURE.JPG`
   *
   * @example
   * `texture.bmp` == `texture.jpg`
   *
   * @see https://github.com/arx/ArxLibertatis/blob/ArxFatalis-1.21/Sources/EERIE/EERIETexture.cpp#L749
   */
  equals(texture: Texture | string): boolean {
    const aPath = this.filename.toLowerCase()

    let bPath: string
    if (typeof texture === 'string') {
      bPath = texture.toLowerCase()
    } else {
      bPath = texture.filename.toLowerCase()
    }

    const { name: aFilename } = path.parse(aPath)
    const { name: bFilename } = path.parse(bPath)

    return aFilename === bFilename
  }

  equalsAny(textures: (Texture | string)[]): boolean {
    if (textures.length === 0) {
      return false
    }

    return textures.some((texture) => {
      return this.equals(texture)
    })
  }

  private getFilename(settings: Settings): string {
    let assetsDir: string
    if (this.isInternalAsset) {
      assetsDir = settings.internalAssetsDir
    } else {
      assetsDir = settings.assetsDir
    }

    return path.resolve(assetsDir, this.sourcePath ?? Texture.targetPath, this.filename)
  }

  private async setSizeFromFile(settings: Settings): Promise<void> {
    if (this.isNative === true) {
      return
    }

    if (this.width === SIZE_UNKNOWN || this.height === SIZE_UNKNOWN) {
      const { width, height } = await getMetadata(this.getFilename(settings))
      this.width = width ?? SIZE_UNKNOWN
      this.height = height ?? SIZE_UNKNOWN
    }
  }

  /**
   * calling this also tries to set the values of `this.width` and `this.height` if any of them is `SIZE_UNKNOWN`
   *
   * if `SIZE_UNKNOWN` prevails after the setters, then the return value is `undefined`
   */
  private async isTileable(settings: Settings): Promise<boolean | undefined> {
    await this.setSizeFromFile(settings)

    if (this.width === SIZE_UNKNOWN || this.height === SIZE_UNKNOWN) {
      return undefined
    }

    return this.width === this.height && MathUtils.isPowerOfTwo(this.width)
  }

  private getFilenameAndExtension(): { filename: string; extension: SupportedExtension } {
    const { ext, name } = path.parse(this.filename)

    let filename: string
    let extension: SupportedExtension

    if (isSupportedExtension(ext)) {
      filename = this.filename
      extension = ext
    } else {
      filename = `${name}.jpg`
      extension = '.jpg'
    }

    return {
      filename,
      extension,
    }
  }

  private async makeCopy(settings: Settings): Promise<SingleFileExport> {
    const { filename, extension } = this.getFilenameAndExtension()

    const originalSource = this.getFilename(settings)
    const convertedTarget = path.resolve(settings.outputDir, Texture.targetPath, filename)

    const convertedSourceFolder = await createCacheFolderIfNotExists(this.sourcePath ?? Texture.targetPath, settings)
    const convertedSource = path.join(convertedSourceFolder, filename)

    const currentHash = await createHashOfFile(originalSource, { isTileable: false })

    if (await fileOrFolderExists(convertedSource)) {
      const storedHash = await loadHashOf(originalSource, settings)

      if (storedHash === currentHash) {
        return [convertedSource, convertedTarget]
      }
    }

    await saveHashOf(originalSource, currentHash, settings)

    const image = await getSharpInstance(originalSource)

    switch (extension) {
      case '.bmp': {
        await sharpToBmp(image, convertedSource)
        break
      }

      case '.png': {
        await image.png({ quality: 100 }).toFile(convertedSource)
        break
      }

      case '.jpeg':
      case '.jpg': {
        await image.jpeg({ quality: 100, progressive: false }).toFile(convertedSource)
        break
      }

      /*
      case '.tga': {
        // TODO
        break
      }
      */
    }

    return [convertedSource, convertedTarget]
  }

  private async makeTileable(settings: Settings): Promise<SingleFileExport> {
    const { filename, extension } = this.getFilenameAndExtension()

    const originalSource = this.getFilename(settings)
    const convertedTarget = path.resolve(settings.outputDir, Texture.targetPath, filename)

    const convertedSourceFolder = await createCacheFolderIfNotExists(this.sourcePath ?? Texture.targetPath, settings)
    const convertedSource = path.join(convertedSourceFolder, filename)

    if (this.alreadyMadeTileable) {
      return [convertedSource, convertedTarget]
    }

    const currentHash = await createHashOfFile(originalSource, { isTileable: true })

    if (await fileOrFolderExists(convertedSource)) {
      const storedHash = await loadHashOf(originalSource, settings)

      if (storedHash === currentHash) {
        this.alreadyMadeTileable = true
        return [convertedSource, convertedTarget]
      }
    }

    await saveHashOf(originalSource, currentHash, settings)

    const image = await getSharpInstance(originalSource)

    const powerOfTwo = MathUtils.floorPowerOfTwo(this.width)

    image.resize(powerOfTwo, powerOfTwo, { fit: 'cover' })

    switch (extension) {
      case '.bmp': {
        await sharpToBmp(image, convertedSource)
        break
      }

      case '.png': {
        await image.png({ quality: 100 }).toFile(convertedSource)
        break
      }

      case '.jpeg':
      case '.jpg': {
        await image.jpeg({ quality: 100, progressive: false }).toFile(convertedSource)
        break
      }

      /*
      case '.tga': {
        // TODO
        break
      }
      */
    }

    this.alreadyMadeTileable = true

    return [convertedSource, convertedTarget]
  }
}
