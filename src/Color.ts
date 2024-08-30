import { type ArxColor } from 'arx-convert/types'
import rgba from 'color-rgba'
import { type Color as ThreeJsColor, MathUtils } from 'three'
import { percentOf } from '@src/helpers.js'

export enum Alpha {
  Transparent = 0,
  Opaque = 1,
}

export class Color {
  /**
   * Parses a color string into numeric values for each channel.
   *
   * Parsing is handled internally using the `color-parse` package (via `color-rgba`),
   * so visit the homepage to see what color notations are supported.
   * For starters, everything that is available in CSS is supported.
   *
   * @see https://github.com/colorjs/color-parse
   */
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

  /**
   * red channel, a positive integer between `0` and `255` (inclusive)
   *
   * `0` = minimum value, no amount of red in the color
   *
   * `255` = maximum value, as much red as possible
   */
  r: number
  /**
   * green channel, a positive integer between `0` and `255` (inclusive)
   *
   * `0` = minimum value, no amount of green in the color
   *
   * `255` = maximum value, as much green as possible
   */
  g: number
  /**
   * blue channel, a positive integer between `0` and `255` (inclusive)
   *
   * `0` = minimum value, no amount of blue in the color
   *
   * `255` = maximum value, as much blue as possible
   */
  b: number
  /**
   * alpha channel, a floating point number between `0` and `1`
   *
   * `0` = fully transparent (`Alpha.Transparent`)
   *
   * `1` = fully opaque (`Alpha.Opaque`)
   */
  a: number

  /**
   *
   * @param r red channel, a positive integer between `0` and `255` (inclusive)
   * @param g green channel, a positive integer between `0` and `255` (inclusive)
   * @param b blue channel, a positive integer between `0` and `255` (inclusive)
   * @param a alpha channel, a floating point number between `0` (fully transparent) and `1` (fully opaque)
   */
  constructor(r: number, g: number, b: number, a: number = Alpha.Opaque) {
    this.r = r
    this.g = g
    this.b = b
    this.a = a
  }

  /**
   * Creates an object with rgba channels that `arx-convert` can work with.
   */
  toArxColor(): ArxColor {
    return { r: this.r, g: this.g, b: this.b, a: this.a }
  }

  /**
   * Creates a stringified version of the color that can be used in ASL scripts.
   * ASL scripts expect the channels to be floats and the alpha channel removed.
   */
  toScriptColor(): string {
    return `${this.r / 256} ${this.g / 256} ${this.b / 256}`
  }

  clone(): Color {
    return new Color(this.r, this.g, this.b, this.a)
  }

  /**
   * Converts the color into a format that can be used by three.js.
   * Alpha channels are ignored as they are handled separately in three.js
   *
   * `{ r: 255, g: 127, b: 0 }` becomes `0xff7f00`
   *
   * @example
   *
   * ```ts
   * const material = new MeshBasicMaterial({ color: this.getHex() })
   * ```
   */
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
