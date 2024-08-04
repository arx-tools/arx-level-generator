import sharp, { type Metadata, type Sharp } from 'sharp'
import { sharpFromBmp } from 'sharp-bmp'

type ImageData = {
  image: Sharp
  metadata: Metadata
}

const cache: Record<string, ImageData> = {}

async function load(filename: string): Promise<void> {
  const image = filename.endsWith('bmp') ? (sharpFromBmp(filename) as Sharp) : sharp(filename)
  const metadata = await image.metadata()

  cache[filename] = {
    image,
    metadata,
  }
}

export async function getMetadata(filename: string): Promise<Metadata> {
  if (cache[filename] === undefined) {
    await load(filename)
  }

  return cache[filename].metadata
}

export async function getSharpInstance(filename: string): Promise<Sharp> {
  if (cache[filename] === undefined) {
    await load(filename)
  }

  return cache[filename].image
}
