import crypto from 'node:crypto'
import { createReadStream } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { type Cache, createCache } from 'cache-manager'
import objectHash from 'object-hash'
import { ensureArray } from '@src/faux-ramda.js'
import type { Settings } from '@platform/common/Settings.js'
import { fileOrFolderExists, readTextFile, writeTextFile } from '@platform/node/io.js'

// ---------------------------
// file cache + hashing

const hashingAlgorithm = 'sha1'

/**
 * Creates the folder structure inside the project's cache folder for a given path
 * (supports nested folders)
 *
 * @param folder - a folder relative to the project's cache folder
 * @param settings - an instance of the Settings object
 * @returns the absolute path for the given folder
 */
export async function createCacheFolderIfNotExists(folder: string, settings: Settings): Promise<string> {
  const fullFolder = path.resolve(settings.cacheDir, folder)

  if (!(await fileOrFolderExists(fullFolder))) {
    await fs.mkdir(fullFolder, { recursive: true })
  }

  return fullFolder
}

/**
 * This function assumes that the cache folder exists
 * and that the hash of the cached file is in sync with the contents of the __hashes.json
 *
 * @param filename - full path to a file
 */
export async function loadHashOf(filename: string, settings: Settings): Promise<string | undefined> {
  const hashesFilename = path.resolve(settings.cacheDir, '__hashes.json')

  try {
    const hashes = JSON.parse(await readTextFile(hashesFilename)) as Record<string, string>
    return hashes[filename]
  } catch {
    return undefined
  }
}

/**
 * @param filename - a pathname of a file relative to the project's root directory
 */
export async function getCacheInfo(
  filename: string,
  settings: Settings,
): Promise<{ filename: string; exists: boolean; hash: string | undefined }> {
  const { dir, base } = path.parse(filename)
  const cachedFolder = await createCacheFolderIfNotExists(dir, settings)
  const cachedFilename = path.join(cachedFolder, base)
  const cacheExists = await fileOrFolderExists(cachedFilename)

  const hashOfCachedFilename = await loadHashOf(cachedFilename, settings)

  return {
    filename: cachedFilename,
    exists: cacheExists,
    hash: hashOfCachedFilename,
  }
}

/**
 * This function does not generate hashes, but merely stores them
 *
 * @param filename - full path to a file
 */
export async function saveHashOf(filename: string, hash: string, settings: Settings): Promise<void> {
  const hashesFilename = path.resolve(settings.cacheDir, '__hashes.json')

  await createCacheFolderIfNotExists('.', settings)

  let hashes: Record<string, string> = {}

  try {
    hashes = JSON.parse(await readTextFile(hashesFilename)) as Record<string, string>
  } catch {}

  hashes[filename] = hash

  await writeTextFile(hashesFilename, JSON.stringify(hashes))
}

export function createHashOfObject(data: any, metadata?: Record<string, any>): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- here I don't care about the contents of the data
  return objectHash({ data, metadata }, { algorithm: hashingAlgorithm })
}

/**
 * @param filename - full path to a file
 */
export async function createHashOfFile(filename: string, metadata?: Record<string, any>): Promise<string> {
  const hash = crypto.createHash(hashingAlgorithm)
  const stream = createReadStream(filename, 'binary')

  stream.on('data', (chunk) => {
    const base64String = chunk.toString('base64')
    hash.update(base64String, 'base64')
  })

  return new Promise((resolve, reject) => {
    stream.on('error', (err) => {
      reject(err)
    })
    stream.on('end', () => {
      if (metadata !== undefined) {
        const hashOfMetadata = createHashOfObject(metadata)
        hash.update(hashOfMetadata, 'ascii')
      }

      resolve(hash.digest('hex'))
    })
  })
}

// ---------------------------
// memory cache

class CacheService {
  cache: Cache
  verbose: boolean
  ttlInMilliseconds: number

  constructor() {
    this.verbose = false
    this.ttlInMilliseconds = 3600 * 1000

    this.cache = createCache()
  }

  async get<T = unknown>(key: string, storeFunction: () => Promise<T>): Promise<T> {
    const value = this.cache.get(key)

    if (value !== undefined) {
      if (this.verbose) {
        console.log(`[CacheService] get from cache: key=${key}, ttl=${this.ttlInMilliseconds}`)
      }

      return value as T
    }

    const result = await storeFunction()

    if (this.verbose) {
      console.log(`[CacheService] get from store: key=${key}, ttl=${this.ttlInMilliseconds}`)
    }

    await this.cache.set(key, result, this.ttlInMilliseconds)

    return result
  }

  async set(key: string, value: any): Promise<void> {
    await this.cache.set(key, value, this.ttlInMilliseconds)
  }

  async del(keys: string | string[]): Promise<void> {
    const result = await this.cache.mdel(ensureArray(keys))
    if (this.verbose) {
      console.log('[CacheService] del from cache:', keys, result)
    }
  }

  async flush(): Promise<void> {
    await this.cache.clear()
    if (this.verbose) {
      console.info('[CacheService] all data flushed')
    }
  }
}

export const cacheService = new CacheService()
