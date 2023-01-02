import { ArxTextureContainer } from 'arx-convert/types'

// TODO: Three JS comes with a Texture class, might worth investigating
// https://threejs.org/docs/?q=Texture#api/en/textures/Texture

type TextureConstructorProps = {
  filename: string
}

export class Texture {
  filename: string

  static humanPaving1 = Object.freeze(
    new Texture({
      filename: 'GRAPH\\OBJ3D\\TEXTURES\\[STONE]_HUMAN_PAVING1.BMP',
    }),
  )

  constructor(props: TextureConstructorProps) {
    this.filename = props.filename
  }

  static fromArxTextureContainer(texture: ArxTextureContainer) {
    return new Texture({
      filename: texture.filename,
    })
  }
}

export const NO_TEXTURE = 0
