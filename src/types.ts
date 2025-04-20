import type { ArxColor, ArxVertex } from 'arx-convert/types'
import type { Simplify } from 'type-fest'
import type { Material } from '@src/Material.js'
import type { Texture } from '@src/Texture.js'

export type ArxVertexWithColor = Simplify<
  ArxVertex & {
    color?: ArxColor
  }
>

/**
 * Levels go as: 0..8, 10..23, there is no level 9
 */
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
 * - target = output filename
 * - source = input filename
 */
export type FileExports = Record<string, string>

/**
 * where:
 * - target = output filename
 * - source = input filename
 */
export type SingleFileExport = [source: string, target: string]

/**
 * `{ [target]: source }`
 *
 * where:
 * - target = output filename
 * - source = input ArrayBuffer
 */
export type ArrayBufferExports = Record<string, ArrayBufferLike>

/**
 * `{ [target]: source }`
 *
 * where:
 * - target = filename
 * - source = text content
 */
export type TextExports = Record<string, string>
