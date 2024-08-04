import { type Color } from '@src/Color.js'

enum GlowFlags {
  Inactive = 0,
  Active = 1 << 0,
  Color = 1 << 1,
  Size = 1 << 2,
  Negative = 1 << 3,
}

type GlowConstructorProps = {
  color?: Color
  size?: number
  isNegative?: boolean
}

/**
 * glow color is like: 1 or 0 for R G and B channels
 * 1 is enabled with full intensity, 0 is disabled
 * in-between values only reduce the radius proportionally
 * colors are blended with additive color mixing:
 * 1 1 1 = white
 * 1 1 0 = yellow
 * 1 0.5 0 = red with a smaller aura of yellow, not orange
 * 0 0 0 = transparent
 *
 * -n is for inverting channels and making the mixing substractive
 * resulting in C M Y channels
 * 1 1 1 = black
 *
 * there is a total of 7 light colors and 7 dark colors + intensity
 */
export class Glow {
  color?: Color
  size?: number
  isNegative: boolean

  constructor({ color, size, isNegative = false }: GlowConstructorProps) {
    this.color = color
    this.size = size
    this.isNegative = isNegative
  }

  on(): string {
    const params = { color: '', radius: '' }

    let flags = GlowFlags.Active

    if (this.color !== undefined) {
      flags |= GlowFlags.Color
      params.color = this.color.toScriptColor()
    }

    if (this.size !== undefined) {
      flags |= GlowFlags.Size
      params.radius = this.size.toString()
    }

    if (this.isNegative) {
      flags |= GlowFlags.Negative
    }

    return `halo ${this.stringifyFlags(flags)} ${params.color} ${params.radius}`.trim()
  }

  off(): string {
    const flags = GlowFlags.Inactive
    return `halo ${this.stringifyFlags(flags)}`
  }

  /**
   * [o] = active
   * [f] = inactive
   * [c] = specify color (default halo color is #3370FF)
   * [s] = specify size (default size is 45)
   * [n] = negative
   */
  private stringifyFlags(flags: GlowFlags): string {
    let letters = ''

    if (flags & GlowFlags.Active) {
      letters += 'o'
    } else {
      letters += 'f'
    }

    if (flags & GlowFlags.Color) {
      letters += 'c'
    }

    if (flags & GlowFlags.Size) {
      letters += 's'
    }

    if (flags & GlowFlags.Negative) {
      letters += 'n'
    }

    return (letters === '' ? '' : '-') + letters
  }
}
