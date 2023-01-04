import { ArxColor } from 'arx-convert/types'
import rgba from 'color-rgba'
import { MeshBasicMaterial, Color as ThreeJsColor } from 'three'

export enum Alpha {
  Transparent = 0,
  Opaque = 1,
}

/**
 * Three JS's color is not being used as it doesn't come with an alpha channel
 */
export class Color {
  r: number
  g: number
  b: number
  a: number

  static red = Object.freeze(Color.fromCSS('red'))
  static green = Object.freeze(Color.fromCSS('green'))
  static blue = Object.freeze(Color.fromCSS('blue'))
  static white = Object.freeze(Color.fromCSS('white'))
  static transparent = Object.freeze(Color.fromCSS('transparent'))

  constructor(r: number, g: number, b: number, a: number = Alpha.Opaque) {
    this.r = r
    this.g = g
    this.b = b
    this.a = a
  }

  static fromCSS(color: string) {
    const channels = rgba(color)
    if (typeof channels === 'undefined') {
      throw new Error(`failed to parse color "${color}"`)
    }
    const [r, g, b, a] = channels
    return new Color(r, g, b, a)
  }

  static fromArxColor({ r, g, b, a }: ArxColor) {
    return new Color(r, g, b, a)
  }

  static fromThreeJsColor({ r, g, b }: ThreeJsColor) {
    return new Color(r * 255, g * 255, b * 255)
  }

  toArxColor(): ArxColor {
    return { r: this.r, g: this.g, b: this.b, a: this.a }
  }

  clone() {
    return new Color(this.r, this.g, this.b, this.a)
  }

  getHex() {
    return (this.r << 16) + (this.g << 8) + this.b
  }

  toBasicMaterial() {
    return new MeshBasicMaterial({ color: this.getHex() })
  }
}
