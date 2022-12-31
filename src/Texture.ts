import { ArxTextureContainer } from 'arx-convert/types'

// TODO: Three JS comes with a Texture class, might worth investigating
// https://threejs.org/docs/?q=Texture#api/en/textures/Texture

export class Texture {
  filename: string

  constructor(filename: string) {
    this.filename = filename
  }

  static fromArxTextureContainer(texture: ArxTextureContainer) {
    return new Texture(texture.filename)
  }
}

export const NO_TEXTURE = 0
