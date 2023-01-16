import fs from 'node:fs'
import path from 'node:path'
import { ArxTextureContainer } from 'arx-convert/types'
import { ClampToEdgeWrapping, Texture as ThreeJsTextue, UVMapping, MathUtils } from 'three'
import sharp, { Sharp } from 'sharp'
import { sharpFromBmp, sharpToBmp } from 'sharp-bmp'
import { Expand } from 'arx-convert/utils'

type TextureConstructorProps = {
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

  static humanPaving1 = Object.freeze(new Texture({ filename: '[stone]_human_paving1.bmp', size: 128 }))
  static l3DissidWall02 = Object.freeze(new Texture({ filename: 'l3_dissid_[iron]_wall02.bmp', size: 64 }))
  static aliciaRoomMur02 = Object.freeze(new Texture({ filename: 'aliciaroom_mur02.jpg', size: 128 }))
  static water = Object.freeze(new Texture({ filename: '(water)cavewater.jpg', size: 128 }))
  static l1DragonGround08 = Object.freeze(new Texture({ filename: 'l1_dragon_[ice]_ground08.jpg', size: 128 }))

  constructor(props: TextureConstructorProps) {
    super(undefined, UVMapping, ClampToEdgeWrapping, ClampToEdgeWrapping)

    this.filename = props.filename
    this.isNative = props.isNative ?? true
    this.sourcePath = props.sourcePath

    this.width = props.size ?? props.width ?? SIZE_UNKNOWN
    this.height = props.size ?? props.height ?? SIZE_UNKNOWN
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
      throw new Error('trying to export copying information for a native Texture')
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
}
