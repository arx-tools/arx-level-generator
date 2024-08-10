import { type ArxColor } from 'arx-convert/types'
import rgba from 'color-rgba'
import { type Color as ThreeJsColor, MathUtils } from 'three'
import { percentOf } from '@src/helpers.js'

export enum Alpha {
  Transparent = 0,
  Opaque = 1,
}

/**
 * three.js's color is not being used as it doesn't come with an alpha channel
 */
export class Color {
  static fromCSS(color: string): Color {
    const channels = rgba(color)
    if (channels === undefined) {
      throw new Error(`failed to parse color "${color}"`)
    }

    const [r, g, b, a] = channels
    if (r === undefined || g === undefined || b === undefined) {
      throw new Error(`failed to parse color "${color}"`)
    }

    return new Color(r, g, b, a)
  }

  static fromArxColor({ r, g, b, a }: ArxColor): Color {
    return new Color(r, g, b, a)
  }

  static fromThreeJsColor({ r, g, b }: ThreeJsColor): Color {
    return new Color(r * 255, g * 255, b * 255)
  }

  // ----------------

  static get red(): Color {
    return Color.fromCSS('red')
  }

  static get green(): Color {
    return Color.fromCSS('green')
  }

  static get blue(): Color {
    return Color.fromCSS('blue')
  }

  static get white(): Color {
    return Color.fromCSS('white')
  }

  static get black(): Color {
    return Color.fromCSS('black')
  }

  static get yellow(): Color {
    return Color.fromCSS('yellow')
  }

  static get transparent(): Color {
    return Color.fromCSS('transparent')
  }

  // ----------------

  r: number
  g: number
  b: number
  a: number

  constructor(r: number, g: number, b: number, a: number = Alpha.Opaque) {
    this.r = r
    this.g = g
    this.b = b
    this.a = a
  }

  toArxColor(): ArxColor {
    return { r: this.r, g: this.g, b: this.b, a: this.a }
  }

  toScriptColor(): string {
    return `${this.r / 256} ${this.g / 256} ${this.b / 256}`
  }

  clone(): Color {
    return new Color(this.r, this.g, this.b, this.a)
  }

  getHex(): number {
    return (this.r << 16) + (this.g << 8) + this.b
  }

  lighten(percent: number): this {
    const extra = percentOf(percent, 255)

    this.r = MathUtils.clamp(this.r + extra, 0, 255)
    this.g = MathUtils.clamp(this.g + extra, 0, 255)
    this.b = MathUtils.clamp(this.b + extra, 0, 255)

    return this
  }

  darken(percent: number): this {
    const extra = percentOf(percent, 255)

    this.r = MathUtils.clamp(this.r - extra, 0, 255)
    this.g = MathUtils.clamp(this.g - extra, 0, 255)
    this.b = MathUtils.clamp(this.b - extra, 0, 255)

    return this
  }
}
