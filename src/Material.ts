import { ArxPolygonFlags } from 'arx-convert/types'
import type { TransparencyType } from '@src/Polygon.js'
import { Texture, type TextureConstructorProps } from '@src/Texture.js'

type MaterialExtraProps = {
  flags?: ArxPolygonFlags
  /**
   * number between 0 and 100 (0..99 = min..max transparency, 100 = opaque - transparency flag should be removed)
   *
   * default value is 100
   */
  opacity?: number
  /**
   * default value is "additive"
   */
  opacityMode?: TransparencyType
}

type MaterialConstructorProps = TextureConstructorProps & MaterialExtraProps

export class Material extends Texture {
  static fromTexture(texture: Texture, props: MaterialExtraProps = {}): Material {
    return new Material({
      filename: texture.filename,
      isNative: texture.isNative,
      width: texture._width,
      height: texture._height,
      sourcePath: texture.sourcePath,
      isInternalAsset: texture.isInternalAsset,
      ...props,
    })
  }

  flags: ArxPolygonFlags
  opacity: number
  opacityMode: TransparencyType

  constructor({
    flags = ArxPolygonFlags.None,
    opacity = 100,
    opacityMode = 'additive',
    ...props
  }: MaterialConstructorProps) {
    super(props)
    this.flags = flags
    this.opacity = opacity
    this.opacityMode = opacityMode
  }

  clone(): this {
    const copy = super.clone()

    copy.flags = this.flags
    copy.opacity = this.opacity
    copy.opacityMode = this.opacityMode

    return copy
  }
}
