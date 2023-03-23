import fs from 'node:fs'
import path from 'node:path'
import { ArxTextureContainer } from 'arx-convert/types'
import { ClampToEdgeWrapping, Texture as ThreeJsTextue, UVMapping, MathUtils } from 'three'
import sharp, { Sharp } from 'sharp'
import { sharpFromBmp, sharpToBmp } from 'sharp-bmp'
import { Expand } from 'arx-convert/utils'

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

  static async fromCustomFile(props: Expand<Omit<TextureConstructorProps, 'isNative'>>) {
    const source = path.resolve('assets', props.sourcePath ?? Texture.targetPath, props.filename)

    const image = props.filename.toLowerCase().endsWith('bmp') ? (sharpFromBmp(source) as Sharp) : sharp(source)

    const metadata = await image.metadata()

    if (metadata.format === 'jpeg' && metadata.isProgressive) {
      console.warn(`Texture warning: '${props.filename}' is a progressive jpeg, Arx will not be able to load it`)
    }

    return new Texture({
      ...props,
      isNative: false,
      width: metadata.width,
      height: metadata.height,
    })
  }

  static fromArxTextureContainer(texture: ArxTextureContainer) {
    return new Texture({
      filename: texture.filename,
    })
  }

  isTileable() {
    return this.width === this.height && MathUtils.isPowerOfTwo(this.width)
  }

  async exportSourceAndTarget(outputDir: string, needsToBeTileable: boolean): Promise<[string, string]> {
    if (this.isNative) {
      throw new Error('trying to export a native Texture')
    }

    if (!needsToBeTileable || this.isTileable()) {
      const source = path.resolve('assets', this.sourcePath ?? Texture.targetPath, this.filename)
      const target = path.resolve(outputDir, Texture.targetPath, this.filename)

      return [source, target]
    }

    return await this._makeTileable(outputDir)
  }

  async _makeTileable(outputDir: string): Promise<[string, string]> {
    const originalSource = path.resolve('assets', this.sourcePath ?? Texture.targetPath, this.filename)
    const resizedSource = path.resolve('.cache', this.sourcePath ?? Texture.targetPath, 'tileable-' + this.filename)

    const resizedTarget = path.resolve(outputDir, Texture.targetPath, 'tileable-' + this.filename)

    if (this.alreadyMadeTileable) {
      return [resizedSource, resizedTarget]
    }

    await this._createCacheFolderIfNotExists(path.dirname(resizedSource))

    try {
      // assuming a cached version already exists
      await fs.promises.access(resizedSource, fs.promises.constants.R_OK)
      this.alreadyMadeTileable = true
      return [resizedSource, resizedTarget]
    } catch (e) {}

    const isBMP = this.filename.toLowerCase().endsWith('bmp')
    const image = isBMP ? (sharpFromBmp(originalSource) as Sharp) : sharp(originalSource)

    if (this.width !== this.height) {
      // TODO: extend the texture's lower side to get a square
    }

    const powerOfTwo = MathUtils.floorPowerOfTwo(this.width)

    image.resize(powerOfTwo, powerOfTwo)

    await (isBMP ? sharpToBmp(image, resizedSource) : image.toFile(resizedSource))

    this.alreadyMadeTileable = true

    return [resizedSource, resizedTarget]
  }

  async _createCacheFolderIfNotExists(folder: string) {
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
  static get l5CavesGravelGround05() {
    return new Texture({ filename: 'l5_caves_[gravel]_ground05.jpg', size: 128 })
  }
  static get l6RatmenFleshWall03() {
    return new Texture({ filename: 'l6_ratmen_[flesh]_wall03.jpg', size: 256 })
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
}
