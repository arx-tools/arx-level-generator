import sharp, { type Metadata, type Sharp } from 'sharp'
import { sharpFromBmp } from 'sharp-bmp'

type ImageData = {
  image: Sharp
  metadata: Metadata
}

const cache: Record<string, ImageData> = {}

async function load(filename: string): Promise<void> {
  let image: Sharp
  if (filename.endsWith('bmp')) {
    image = sharpFromBmp(filename) as Sharp
  } else {
    image = sharp(filename)
  }

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
