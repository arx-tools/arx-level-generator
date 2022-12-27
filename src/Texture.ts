import { ArxTextureContainer } from 'arx-convert/types'

export class Texture {
  filename: string

  constructor(filename: string) {
    this.filename = filename
  }

  static fromArxTextureContainer(texture: ArxTextureContainer) {
    return new Texture(texture.filename)
  }
}
