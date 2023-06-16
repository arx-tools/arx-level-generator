import fs from 'node:fs'
import path from 'node:path'
import { ArxTextureContainer } from 'arx-convert/types'
import { Expand } from 'arx-convert/utils'
import sharp, { Sharp } from 'sharp'
import { sharpFromBmp, sharpToBmp } from 'sharp-bmp'
import { ClampToEdgeWrapping, Texture as ThreeJsTextue, UVMapping, MathUtils } from 'three'
import { fileExists } from '@src/helpers.js'

export type TextureConstructorProps = {
  filename: string
  isNative?: boolean
  width?: number
  height?: number
  size?: number
  sourcePath?: string
}

export const SIZE_UNKNOWN = -1
export const NO_TEXTURE_CONTAINER = 0

export class Texture extends ThreeJsTextue {
  static targetPath = 'graph/obj3d/textures'

  alreadyMadeTileable: boolean = false
  filename: string
  isNative: boolean
  width: number
  height: number
  sourcePath?: string

  constructor(props: TextureConstructorProps) {
    super(undefined, UVMapping, ClampToEdgeWrapping, ClampToEdgeWrapping)

    this.filename = props.filename
    this.isNative = props.isNative ?? true
    this.sourcePath = props.sourcePath

    this.width = props.size ?? props.width ?? SIZE_UNKNOWN
    this.height = props.size ?? props.height ?? SIZE_UNKNOWN
  }

  clone() {
    const copy = super.clone()

    copy.filename = this.filename
    copy.isNative = this.isNative
    copy.width = this.width
    copy.height = this.height
    copy.sourcePath = this.sourcePath
    copy.alreadyMadeTileable = this.alreadyMadeTileable

    return copy
  }

  async getMetadata() {
    // TODO: memoize the result of this function

    const source = path.resolve('assets', this.sourcePath ?? Texture.targetPath, this.filename)
    const image = this.filename.toLowerCase().endsWith('bmp') ? (sharpFromBmp(source) as Sharp) : sharp(source)
    const metadata = await image.metadata()

    return metadata
  }

  static async fromCustomFile(props: Expand<Omit<TextureConstructorProps, 'isNative'>>) {
    const texture = new Texture({
      ...props,
      isNative: false,
    })

    // TODO: only calculate width and height when needed
    if (texture.width === SIZE_UNKNOWN) {
      const { width } = await texture.getMetadata()
      texture.width = width ?? SIZE_UNKNOWN
    }
    if (texture.height === SIZE_UNKNOWN) {
      const { height } = await texture.getMetadata()
      texture.height = height ?? SIZE_UNKNOWN
    }

    return texture
  }

  static fromArxTextureContainer(texture: ArxTextureContainer) {
    return new Texture({
      filename: texture.filename,
    })
  }

  isTileable() {
    return this.width === this.height && MathUtils.isPowerOfTwo(this.width)
  }

  async exportSourceAndTarget(outputDir: string, needsToBeTileable: boolean) {
    if (this.isNative) {
      throw new Error('trying to export a native Texture')
    }

    if (needsToBeTileable && !this.isTileable()) {
      return this.makeTileable(outputDir)
    } else {
      return this.makeCopy(outputDir)
    }
  }

  private async makeCopy(outputDir: string): Promise<[string, string]> {
    const { ext, name } = path.parse(this.filename)
    const isBMP = ext === '.bmp'
    const newFilename = isBMP ? this.filename : `${name}.jpg`

    const originalSource = path.resolve('assets', this.sourcePath ?? Texture.targetPath, this.filename)
    const convertedSource = path.resolve('.cache', this.sourcePath ?? Texture.targetPath, newFilename)

    const convertedTarget = path.resolve(outputDir, Texture.targetPath, newFilename)

    await this.createCacheFolderIfNotExists(path.dirname(convertedSource))

    if (await fileExists(convertedSource)) {
      return [convertedSource, convertedTarget]
    }

    const image = isBMP ? (sharpFromBmp(originalSource) as Sharp) : sharp(originalSource)

    if (isBMP) {
      await sharpToBmp(image, convertedSource)
    } else {
      await image
        .jpeg({
          quality: 100,
          progressive: false,
        })
        .toFile(convertedSource)
    }

    return [convertedSource, convertedTarget]
  }

  private async makeTileable(outputDir: string): Promise<[string, string]> {
    const { ext, name } = path.parse(this.filename)
    const isBMP = ext === '.bmp'
    const newFilename = 'tileable-' + (isBMP ? this.filename : `${name}.jpg`)

    const originalSource = path.resolve('assets', this.sourcePath ?? Texture.targetPath, this.filename)
    const resizedSource = path.resolve('.cache', this.sourcePath ?? Texture.targetPath, newFilename)

    const resizedTarget = path.resolve(outputDir, Texture.targetPath, newFilename)

    if (this.alreadyMadeTileable) {
      return [resizedSource, resizedTarget]
    }

    await this.createCacheFolderIfNotExists(path.dirname(resizedSource))

    if (await fileExists(resizedSource)) {
      this.alreadyMadeTileable = true
      return [resizedSource, resizedTarget]
    }

    const image = isBMP ? (sharpFromBmp(originalSource) as Sharp) : sharp(originalSource)

    const powerOfTwo = MathUtils.floorPowerOfTwo(this.width)

    image.resize(powerOfTwo, powerOfTwo, {
      fit: 'cover',
    })

    if (isBMP) {
      await sharpToBmp(image, resizedSource)
    } else {
      await image
        .jpeg({
          quality: 100,
          progressive: false,
        })
        .toFile(resizedSource)
    }

    this.alreadyMadeTileable = true

    return [resizedSource, resizedTarget]
  }

  private async createCacheFolderIfNotExists(folder: string) {
    try {
      await fs.promises.access(folder, fs.promises.constants.R_OK | fs.promises.constants.W_OK)
    } catch (e) {
      await fs.promises.mkdir(folder, { recursive: true })
    }
  }

  // ----------------

  static get alpha() {
    return new Texture({ filename: 'alpha.bmp', size: 32 })
  }
  static get stoneHumanPaving() {
    return new Texture({ filename: '[stone]_human_paving.bmp', size: 256 })
  }
  static get stoneHumanPaving1() {
    return new Texture({ filename: '[stone]_human_paving1.bmp', size: 128 })
  }
  static get aliciaRoomMur02() {
    return new Texture({ filename: 'aliciaroom_mur02.jpg', size: 128 })
  }
  static get waterCavewater() {
    return new Texture({ filename: '(water)cavewater.jpg', size: 128 })
  }
  static get l1DragonStoneGround01() {
    return new Texture({ filename: 'l1_dragon_[stone]_ground01.jpg', size: 128 })
  }
  static get l1DragonIceGround08() {
    return new Texture({ filename: 'l1_dragon_[ice]_ground08.jpg', size: 128 })
  }
  static get l1DragonSpideLime1Nocol() {
    return new Texture({ filename: 'L1_Dragon_[spide]_Lime1nocol.bmp', size: 128 })
  }
  static get l1PrisonStoneGridl02() {
    return new Texture({ filename: 'l1_prison_(stone)_gridl02.bmp', size: 64 })
  }
  static get l1PrisonSandGround01() {
    return new Texture({ filename: 'l1_prison_[sand]_ground01.jpg', size: 64 })
  }
  static get l1TempleStoneWall03() {
    return new Texture({ filename: 'l1_temple_[stone]_wall03.jpg', size: 128 })
  }
  static get l2CavesRustyItem01() {
    return new Texture({ filename: 'l2_caves_[rusty]_item01.jpg', size: 128 })
  }
  static get l2TrollStoneGround04() {
    return new Texture({ filename: 'l2_troll_[stone]_ground04.jpg', size: 128 })
  }
  static get l2TrollWoodPillar08() {
    return new Texture({ filename: 'l2_troll_[wood]_pillar08.jpg', size: 256 })
  }
  static get l2GobelStoneFloor02() {
    return new Texture({ filename: 'l2_gobel_[stone]_floor02.jpg', size: 128 })
  }
  static get l2GobelStoneCenter() {
    return new Texture({ filename: 'l2_gobel_[stone]_center.jpg', size: 128 })
  }
  static get l3DissidWetGround01() {
    return new Texture({ filename: 'l3_dissid_[wet]_ground01.jpg', size: 128 })
  }
  static get l3DissidStoneGround09() {
    return new Texture({ filename: 'l3_dissid_[stone]_ground09.jpg', size: 128 })
  }
  static get l3DissidStoneGround10() {
    return new Texture({ filename: 'l3_dissid_[stone]_ground10.jpg', size: 128 })
  }
  static get l3DissidIronWall02() {
    return new Texture({ filename: 'l3_dissid_[iron]_wall02.bmp', size: 64 })
  }
  static get l3DissidStoneWall03() {
    return new Texture({ filename: 'l3_dissid_[stone]_wall03.jpg', size: 128 })
  }
  static get l3DissidStoneTrans01() {
    return new Texture({ filename: 'l3_dissid_[stone]_trans01.jpg', size: 128 })
  }
  static get l4YlsideStoneGround01() {
    return new Texture({ filename: 'l4_ylside_[stone]_ground01.jpg', size: 64 })
  }
  static get l4DwarfIronBoard02() {
    return new Texture({ filename: 'l4_dwarf_[iron]_board02.jpg', size: 256 })
  }
  static get l4DwarfWoodBoard02() {
    return new Texture({ filename: 'l4_dwarf_[wood]_board02.jpg', size: 128 })
  }
  static get l5CavesGravelGround05() {
    return new Texture({ filename: 'l5_caves_[gravel]_ground05.jpg', size: 128 })
  }
  static get l6RatmenFleshWall03() {
    return new Texture({ filename: 'l6_ratmen_[flesh]_wall03.jpg', size: 256 })
  }
  static get l7DwarfMetalPlate10() {
    return new Texture({ filename: 'l7_dwarf_[metal]_plate10.jpg', size: 128 })
  }
  static get stoneHumanStoneWall() {
    return new Texture({ filename: '[stone]_human_stone_wall.jpg', size: 256 })
  }
  static get stoneHumanStoneWall1() {
    return new Texture({ filename: '[stone]_human_stone_wall1.jpg', size: 256 })
  }
  static get stoneHumanStoneWall2() {
    return new Texture({ filename: '[stone]_human_stone_wall2.jpg', size: 256 })
  }
  static get stoneHumanAkbaa2F() {
    return new Texture({ filename: '[stone]_human_akbaa2_f.jpg', size: 256 })
  }
  static get stoneHumanAkbaa4F() {
    return new Texture({ filename: '[stone]_human_akbaa4_f.jpg', size: 256 })
  }
  static get stoneHumanPriest4() {
    return new Texture({ filename: '[stone]_human_priest4.jpg', size: 256 })
  }
  static get itemFishingPole2() {
    return new Texture({ filename: 'item_fishing pole2.bmp', size: 128 })
  }
  static get itemRope() {
    return new Texture({ filename: 'item_rope.bmp', size: 128 })
  }
  static get fixinterHeavyCatacombDoor() {
    return new Texture({ filename: 'fixinter_heavy_catacomb_door.bmp', size: 256 })
  }
  static get stoneGroundCavesWet05() {
    return new Texture({ filename: '[stone]_ground_caves_wet05', size: 128 })
  }
  static get glassGlass01() {
    return new Texture({ filename: '[glass]_glass01.jpg', size: 128 })
  }
  static get itemCheese() {
    return new Texture({ filename: 'item_cheese.jpg', size: 64 })
  }
  static get missingTexture() {
    return Texture.fromCustomFile({
      filename: 'jorge-[stone].jpg',
      sourcePath: 'textures',
      size: 32,
    })
  }
  static get itemRuneAam() {
    return new Texture({ filename: 'item_rune_aam', size: 64 })
  }
}
