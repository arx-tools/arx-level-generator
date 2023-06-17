import sharp, { Metadata, Sharp } from 'sharp'
import { sharpFromBmp } from 'sharp-bmp'

type ImageData = {
  image: Sharp
  metadata: Metadata
}

const cache: Record<string, ImageData> = {}

const load = async (filename: string) => {
  const image = filename.endsWith('bmp') ? (sharpFromBmp(filename) as Sharp) : sharp(filename)
  const metadata = await image.metadata()

  cache[filename] = {
    image,
    metadata,
  }
}

export const getMetadata = async (filename: string) => {
  if (typeof cache[filename] === 'undefined') {
    await load(filename)
  }

  return cache[filename].metadata
}

export const getSharpInstance = async (filename: string) => {
  if (typeof cache[filename] === 'undefined') {
    await load(filename)
  }

  return cache[filename].image
}
