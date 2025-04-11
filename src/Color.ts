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
   * @throws Error when parsing fails
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

  /**
   * Creates a Color instance from the ArxColor data
   */
  static fromArxColor({ r, g, b, a }: ArxColor): Color {
    return new Color(r, g, b, a)
  }

  /**
   * Creates a Color instance from three.js' Color class
   *
   * Extra infos of three.js' Color class:
   *
   * - it doesn't support transparency/alpha channel
   * - every channel is a float with values ranging between 0.0 and 1.0
   */
  static fromThreeJsColor({ r, g, b }: ThreeJsColor): Color {
    return new Color(r * 255, g * 255, b * 255)
  }

  // ----------------

  static get red(): Color {
    return new Color(255, 0, 0)
  }

  static get green(): Color {
    return new Color(0, 255, 0)
  }

  static get blue(): Color {
    return new Color(0, 0, 255)
  }

  static get white(): Color {
    return new Color(255, 255, 255)
  }

  static get black(): Color {
    return new Color(0, 0, 0)
  }

  static get yellow(): Color {
    return new Color(255, 255, 0)
  }

  static get transparent(): Color {
    return new Color(0, 0, 0, Alpha.Transparent)
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
   * @param a alpha channel, a floating point number between `0.0` (fully transparent) and `1.0` (fully opaque) - default value is `1.0`
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

  /**
   * Adds each channel of a color to the channels in this instance
   */
  add(color: Color): this {
    this.r = MathUtils.clamp(this.r + color.r, 0, 255)
    this.g = MathUtils.clamp(this.g + color.g, 0, 255)
    this.b = MathUtils.clamp(this.b + color.b, 0, 255)

    return this
  }

  /**
   * Adds a fixed amount to every channel
   */
  addScalar(value: number): this {
    this.r = MathUtils.clamp(this.r + value, 0, 255)
    this.g = MathUtils.clamp(this.g + value, 0, 255)
    this.b = MathUtils.clamp(this.b + value, 0, 255)

    return this
  }

  /**
   * Subtracts each channel of a color from the channels in this instance
   */
  sub(color: Color): this {
    this.r = MathUtils.clamp(this.r - color.r, 0, 255)
    this.g = MathUtils.clamp(this.g - color.g, 0, 255)
    this.b = MathUtils.clamp(this.b - color.b, 0, 255)

    return this
  }

  /**
   * Subtracts a fixed amount from every channel
   */
  subScalar(value: number): this {
    this.r = MathUtils.clamp(this.r - value, 0, 255)
    this.g = MathUtils.clamp(this.g - value, 0, 255)
    this.b = MathUtils.clamp(this.b - value, 0, 255)

    return this
  }

  /**
   * Multiplies each channel with a fixed amount
   */
  multiplyScalar(value: number): this {
    this.r = MathUtils.clamp(this.r * value, 0, 255)
    this.g = MathUtils.clamp(this.g * value, 0, 255)
    this.b = MathUtils.clamp(this.b * value, 0, 255)

    return this
  }

  /**
   * Brightens the color by adding <percent>% of 256 to every channel
   */
  lighten(percent: number): this {
    return this.addScalar(percentOf(percent, 255))
  }

  /**
   * Darkens the color by subtracting <percent>% of 256 from every channel
   */
  darken(percent: number): this {
    return this.subScalar(percentOf(percent, 255))
  }
}
