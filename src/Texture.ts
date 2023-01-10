import fs from 'node:fs'
import path from 'node:path'
import { ArxTextureContainer } from 'arx-convert/types'
import { ClampToEdgeWrapping, Texture as ThreeJsTextue, UVMapping, MathUtils } from 'three'
import sharp, { Sharp } from 'sharp'
import { sharpFromBmp, sharpToBmp } from 'sharp-bmp'

type TextureConstructorProps = {
  filename: string
  isNative?: boolean
  width?: number
  height?: number
  sourcePath?: string
}

export const SIZE_UNKNOWN = -1

export class Texture extends ThreeJsTextue {
  alreadyMadeTileable: boolean = false
  filename: string
  isNative: boolean
  width: number
  height: number
  sourcePath?: string

  static humanPaving1 = Object.freeze(
    new Texture({
      filename: '[STONE]_HUMAN_PAVING1.BMP',
      width: 128,
      height: 128,
    }),
  )

  static l3DissidWall02 = Object.freeze(
    new Texture({
      filename: 'L3_Dissid_[iron]_wall02.bmp',
      width: 64,
      height: 64,
    }),
  )

  static aliciaRoomMur02 = Object.freeze(
    new Texture({
      filename: 'ALICIAROOM_MUR02.jpg',
      width: 128,
      height: 128,
    }),
  )

  static water = Object.freeze(
    new Texture({
      filename: '(WATER)CAVEWATER.jpg',
      width: 128,
      height: 128,
    }),
  )

  constructor(props: TextureConstructorProps) {
    super(undefined, UVMapping, ClampToEdgeWrapping, ClampToEdgeWrapping)

    this.filename = props.filename
    this.isNative = props.isNative ?? true
    this.sourcePath = props.sourcePath

    this.width = props.width ?? SIZE_UNKNOWN
    this.height = props.height ?? SIZE_UNKNOWN
  }

  static async fromCustomFile(props: TextureConstructorProps) {
    // TODO: might need https://socket.dev/npm/package/sharp-bmp for handling bmp files

    const source = path.resolve('assets', props.sourcePath ?? 'graph/obj3d/textures', props.filename)

    let image: sharp.Sharp
    if (props.filename.toLowerCase().endsWith('bmp')) {
      image = sharpFromBmp(source) as Sharp
    } else {
      image = sharp(source)
    }

    const metadata = await image.metadata()

    if (metadata.format === 'jpeg' && metadata.isProgressive) {
      console.warn(`texture warning: '${props.filename}' is a progressive jpeg, Arx will not be able to load it`)
    }

    return new Texture({
      ...props,
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
      throw new Error('trying to export copying information for a native texture')
    }

    if (!needsToBeTileable || this.isTileable()) {
      const source = path.resolve('assets', this.sourcePath ?? 'graph/obj3d/textures', this.filename)
      const target = path.resolve(outputDir, 'graph/obj3d/textures', this.filename)

      return [source, target]
    }

    return await this._makeTileable(outputDir)
  }

  async _makeTileable(outputDir: string): Promise<[string, string]> {
    const originalSource = path.resolve('assets', this.sourcePath ?? 'graph/obj3d/textures', this.filename)
    const resizedSource = path.resolve('.cache', this.sourcePath ?? 'graph/obj3d/textures', 'tileable-' + this.filename)

    const resizedTarget = path.resolve(outputDir, 'graph/obj3d/textures', 'tileable-' + this.filename)

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

    let image: sharp.Sharp
    if (isBMP) {
      image = sharpFromBmp(originalSource) as Sharp
    } else {
      image = sharp(originalSource)
    }

    if (this.width !== this.height) {
      // TODO: extend the texture's lower side to get a square
    }

    const powerOfTwo = MathUtils.floorPowerOfTwo(this.width)

    image.resize(powerOfTwo, powerOfTwo)

    if (isBMP) {
      await sharpToBmp(image, resizedSource)
    } else {
      await image.toFile(resizedSource)
    }

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

export const NO_TEXTURE = 0
