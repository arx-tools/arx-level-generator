import { type ArxColor, type ArxVertex } from 'arx-convert/types'
import { type Expand } from 'arx-convert/utils'
import { type Material } from '@src/Material.js'
import { type Texture } from '@src/Texture.js'

export type ArxVertexWithColor = Expand<
  ArxVertex & {
    color?: ArxColor
  }
>

export type OriginalLevel =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23

export type TextureOrMaterial = Texture | Material

export type VerticalAlign = 'top' | 'middle' | 'bottom'

/**
 * `{ [target]: source }`
 *
 * where:
 * - target = filename
 * - source = filename
 */
export type FileExports = Record<string, string>

/**
 * `{ [target]: source }`
 *
 * where:
 * - target = filename
 * - source = text content
 */
export type TextExports = Record<string, string>
