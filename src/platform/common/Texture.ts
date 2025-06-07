import { ClampToEdgeWrapping, Texture as ThreeJsTexture, UVMapping } from 'three'
import { getFilenameFromPath } from '@src/helpers.js'
import type { SingleFileExport } from '@src/types.js'
import type { Settings } from '@platform/common/Settings.js'

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
   *
   * If `width` is the same as `height` you can specify just one number via the `size` property.
   */
  width?: number

  /**
   * If you already know the size of the texture file, then you can make the class skip some checks
   * when loading custom texture files.
   *
   * If `width` is the same as `height` you can specify just one number via the `size` property.
   */
  height?: number

  /**
   * If you already know the size of the texture file, then you can make the class skip some checks
   * when loading custom texture files.
   *
   * If `width` is the same as `height` you can specify just one number via the `size` property.
   */
  size?: number

  /**
   * This path is relative to the "assets" folder in the project that uses the arx-level-generator
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
export const supportedExtensions = ['.png', '.jpg', '.jpeg', '.bmp' /* , '.tga' */] as const

export type SupportedExtension = (typeof supportedExtensions)[number]

export function isSupportedExtension(input: any): input is SupportedExtension {
  return typeof input === 'string' && (supportedExtensions as readonly string[]).includes(input)
}

export abstract class Texture extends ThreeJsTexture {
  static readonly targetPath = 'graph/obj3d/textures'

  // ----------------

  filename: string
  isNative: boolean
  sourcePath?: string
  isInternalAsset: boolean

  /**
   * The width of the image where the values is taken from the props given to the constructor.
   * If no width is specified there, then the value will remain `SIZE_UNKNOWN` until `exportSourceAndTarget` is called
   * to delay file IO operations as much as possible (and keeping other methods from becoming async)
   */
  protected width: number
  /**
   * The height of the image where the values is taken from the props given to the constructor.
   * If no height is specified there, then the value will remain `SIZE_UNKNOWN` until `exportSourceAndTarget` is called
   * to delay file IO operations as much as possible (and keeping other methods from becoming async)
   */
  protected height: number

  constructor(props: TextureConstructorProps) {
    super(undefined, UVMapping, ClampToEdgeWrapping, ClampToEdgeWrapping)

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

    const aFilename = getFilenameFromPath(aPath)
    const bFilename = getFilenameFromPath(bPath)

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

  abstract clone(): this

  abstract exportSourceAndTarget(
    settings: Settings,
    needsToBeTileable: boolean,
    dontCatchTheError: boolean,
  ): Promise<SingleFileExport>
}
