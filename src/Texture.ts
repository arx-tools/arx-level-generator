import { ArxTextureContainer } from 'arx-convert/types'

// TODO: Three JS comes with a Texture class, might worth investigating
// https://threejs.org/docs/?q=Texture#api/en/textures/Texture

type TextureConstructorProps = {
  filename: string
}

export class Texture {
  filename: string

  constructor(props: TextureConstructorProps) {
    this.filename = props.filename
  }

  static fromArxTextureContainer(texture: ArxTextureContainer) {
    return new Texture({
      filename: texture.filename
    })
  }
}

export const NO_TEXTURE = 0
