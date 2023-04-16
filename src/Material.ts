import { ArxPolygonFlags } from 'arx-convert/types'
import { Texture, TextureConstructorProps } from './Texture.js'

type MaterialExtraProps = {
  flags?: ArxPolygonFlags
}

type MaterialConstructorProps = TextureConstructorProps & MaterialExtraProps

export class Material extends Texture {
  flags: ArxPolygonFlags

  constructor({ flags = ArxPolygonFlags.None, ...props }: MaterialConstructorProps) {
    super(props)
    this.flags = flags
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
