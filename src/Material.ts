import { ArxPolygonFlags } from 'arx-convert/types'
import { TransparencyType } from '@src/Polygon.js'
import { Texture, TextureConstructorProps } from '@src/Texture.js'

type MaterialExtraProps = {
  flags?: ArxPolygonFlags
  opacity?: number
  opacityMode?: TransparencyType
}

type MaterialConstructorProps = TextureConstructorProps & MaterialExtraProps

export class Material extends Texture {
  flags: ArxPolygonFlags
  opacity: number
  opacityMode: TransparencyType

  constructor({
    flags = ArxPolygonFlags.None,
    opacity = 100,
    opacityMode = 'subtractive',
    ...props
  }: MaterialConstructorProps) {
    super(props)
    this.flags = flags
    this.opacity = opacity
    this.opacityMode = opacityMode
  }

  static fromTexture(texture: Texture, props: MaterialExtraProps = {}) {
    return new Material({
      filename: texture.filename,
      isNative: texture.isNative,
      width: texture.width,
      height: texture.height,
      sourcePath: texture.sourcePath,
      ...props,
    })
  }
}
