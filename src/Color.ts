import { ArxColor } from 'arx-convert/types'
import rgba from 'color-rgba'

/**
 * Three JS's color is not being used as it doesn't come with an alpha channel
 */
export class Color {
  readonly r: number
  readonly g: number
  readonly b: number
  readonly a: number

  constructor(r: number, g: number, b: number, a: number) {
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

  toArxColor(): ArxColor {
    return { r: this.r, g: this.g, b: this.b, a: this.a }
  }
}

export const transparent = new Color(0, 0, 0, 0)
export const red = Color.fromCSS('red')
