import path from 'node:path'
import type { ArxTextureContainer } from 'arx-convert/types'
import { sharpToBmp } from 'sharp-bmp'
import { ClampToEdgeWrapping, Texture as ThreeJsTextue, UVMapping, MathUtils } from 'three'
import type { Simplify } from 'type-fest'
import type { Settings } from '@src/Settings.js'
import { ExportBuiltinAssetError } from '@src/errors.js'
import type { SingleFileExport } from '@src/types.js'
import { fileOrFolderExists } from '@platform/node/io.js'
import { createCacheFolderIfNotExists, loadHashOf, createHashOfFile, saveHashOf } from '@services/cache.js'
import { getMetadata, getSharpInstance } from '@services/image.js'

export type TextureConstructorProps = {
  filename: string
  /**
   * whether the texture is from the main game or a custom added file
   *
   * default value is true (meaning that the texture is from the game)
   */
  isNative?: boolean
  width?: number
  height?: number
  size?: number
  /**
   * this path is relative to the project's "assets" folder
   *
   * default value is "graph/obj3d/texture"
   */
  sourcePath?: string
  /**
   * default value is false
   */
  isInternalAsset?: boolean
}

export const SIZE_UNKNOWN = -1
export const NO_TEXTURE_CONTAINER = 0

const supportedExtensions = new Set(['.jpg', '.png', '.bmp'])

export class Texture extends ThreeJsTextue {
  static targetPath = 'graph/obj3d/textures'

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

  alreadyMadeTileable: boolean
  filename: string
  isNative: boolean
  _width: number
  _height: number
  sourcePath?: string
  isInternalAsset: boolean

  constructor(props: TextureConstructorProps) {
    super(undefined, UVMapping, ClampToEdgeWrapping, ClampToEdgeWrapping)

    this.alreadyMadeTileable = false
    this.filename = props.filename
    this.isNative = props.isNative ?? true
    this.sourcePath = props.sourcePath
    this.isInternalAsset = props.isInternalAsset ?? false

    this._width = props.size ?? props.width ?? SIZE_UNKNOWN
    this._height = props.size ?? props.height ?? SIZE_UNKNOWN
  }

  clone(): this {
    const copy = new Texture({
      filename: this.filename,
      isNative: this.isNative,
      width: this._width,
      height: this._height,
      sourcePath: this.sourcePath,
      isInternalAsset: this.isInternalAsset,
    })

    return copy as this
  }

  async getWidth(settings: Settings): Promise<number> {
    if (this._width === SIZE_UNKNOWN) {
      const { width } = await getMetadata(this.getFilename(settings))
      this._width = width ?? SIZE_UNKNOWN
    }

    return this._width
  }

  async getHeight(settings: Settings): Promise<number> {
    if (this._height === SIZE_UNKNOWN) {
      const { height } = await getMetadata(this.getFilename(settings))
      this._height = height ?? SIZE_UNKNOWN
    }

    return this._height
  }

  /**
   * this also gives value to this._width and this._height
   * if any of them is SIZE_UNKNOWN
   */
  async isTileable(settings: Settings): Promise<boolean> {
    const width = await this.getWidth(settings)
    const height = await this.getHeight(settings)
    return width === height && MathUtils.isPowerOfTwo(width)
  }

  /**
   * default value for `needsToBeTileable` is false
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
      const isTileable = await this.isTileable(settings)

      if (needsToBeTileable && !isTileable) {
        return await this.makeTileable(settings)
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
      this._width = fallbackTexture._width
      this._height = fallbackTexture._height
      this.isInternalAsset = fallbackTexture.isInternalAsset

      return this.makeCopy(settings)
    }
  }

  /**
   * Compares filenames of textures without the extensions.
   * Comparision is case-**insensitive**
   *
   * For example:
   *  - texture.jpg == TEXTURE.JPG
   *  - texture.bmp == texture.jpg
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

  private async makeCopy(settings: Settings): Promise<SingleFileExport> {
    const { ext, name } = path.parse(this.filename)
    const hasSupportedFormat = supportedExtensions.has(ext)

    let newFilename: string
    if (hasSupportedFormat) {
      newFilename = this.filename
    } else {
      newFilename = `${name}.jpg`
    }

    const originalSource = this.getFilename(settings)
    const convertedTarget = path.resolve(settings.outputDir, Texture.targetPath, newFilename)

    const convertedSourceFolder = await createCacheFolderIfNotExists(this.sourcePath ?? Texture.targetPath, settings)
    const convertedSource = path.join(convertedSourceFolder, newFilename)

    const currentHash = await createHashOfFile(originalSource, { isTileable: false })

    if (await fileOrFolderExists(convertedSource)) {
      const storedHash = await loadHashOf(originalSource, settings)

      if (storedHash === currentHash) {
        return [convertedSource, convertedTarget]
      }
    }

    await saveHashOf(originalSource, currentHash, settings)

    const image = await getSharpInstance(originalSource)

    switch (ext) {
      case '.bmp': {
        await sharpToBmp(image, convertedSource)
        break
      }

      case '.png': {
        await image.png({ quality: 100 }).toFile(convertedSource)
        break
      }

      // .jpg
      default: {
        await image.jpeg({ quality: 100, progressive: false }).toFile(convertedSource)
        break
      }
    }

    return [convertedSource, convertedTarget]
  }

  private async makeTileable(settings: Settings): Promise<SingleFileExport> {
    const { ext, name } = path.parse(this.filename)
    const hasSupportedFormat = supportedExtensions.has(ext)

    let newFilename: string
    if (hasSupportedFormat) {
      newFilename = this.filename
    } else {
      newFilename = `${name}.jpg`
    }

    const originalSource = this.getFilename(settings)
    const convertedTarget = path.resolve(settings.outputDir, Texture.targetPath, newFilename)

    const convertedSourceFolder = await createCacheFolderIfNotExists(this.sourcePath ?? Texture.targetPath, settings)
    const convertedSource = path.join(convertedSourceFolder, newFilename)

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

    const powerOfTwo = MathUtils.floorPowerOfTwo(this._width)

    image.resize(powerOfTwo, powerOfTwo, { fit: 'cover' })

    switch (ext) {
      case '.bmp': {
        await sharpToBmp(image, convertedSource)
        break
      }

      case '.png': {
        await image.png({ quality: 100 }).toFile(convertedSource)
        break
      }

      // .jpg
      default: {
        await image.jpeg({ quality: 100, progressive: false }).toFile(convertedSource)
        break
      }
    }

    this.alreadyMadeTileable = true

    return [convertedSource, convertedTarget]
  }
}
