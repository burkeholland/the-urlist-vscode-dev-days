const META_TIMEOUT = 8000
const USER_AGENT = 'the-urlist-metadata/1.0 (+https://the-urlist.dev)'

const TITLE_KEYS = ['og:title', 'twitter:title']
const DESCRIPTION_KEYS = ['og:description', 'twitter:description', 'description']
const IMAGE_KEYS = ['og:image', 'og:image:secure_url', 'twitter:image', 'twitter:image:src']

export interface LinkMetadata {
  title: string | null
  description: string | null
  image: string | null
}

export class MetadataError extends Error {
  status: number

  constructor(message: string, status = 502) {
    super(message)
    this.status = status
  }
}

function cleanValue(value: string | null | undefined): string | null {
  if (!value) return null
  return value.replace(/\s+/g, ' ').trim() || null
}

function findMetaValue(html: string, keys: string[]): string | null {
  for (const key of keys) {
    const regex = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i')
    const match = html.match(regex)
    if (match && match[1]) {
      const cleaned = cleanValue(match[1])
      if (cleaned) return cleaned
    }
  }
  return null
}

function extractTitle(html: string, keys: string[]): string | null {
  const metaTitle = findMetaValue(html, keys)
  if (metaTitle) return metaTitle

  const titleMatch = html.match(/<title>([^<]*)<\/title>/i)
  return cleanValue(titleMatch?.[1])
}

function extractDescription(html: string, keys: string[]): string | null {
  const description = findMetaValue(html, keys)
  return description ?? null
}

function extractImage(html: string, keys: string[], base: URL): string | null {
  const raw = findMetaValue(html, keys)
  if (!raw) return null

  try {
    const resolved = new URL(raw, base)
    return resolved.toString()
  } catch {
    return null
  }
}

export async function fetchLinkMetadata(target: URL): Promise<LinkMetadata> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), META_TIMEOUT)

  try {
    const response = await fetch(target, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT
      }
    })

    if (!response.ok) {
      throw new MetadataError(`Upstream responded with ${response.status}`)
    }

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('text/html')) {
      return { title: null, description: null, image: null }
    }

    const html = await response.text()
    return {
      title: extractTitle(html, TITLE_KEYS),
      description: extractDescription(html, DESCRIPTION_KEYS),
      image: extractImage(html, IMAGE_KEYS, target)
    }
  } catch (error) {
    if (error instanceof MetadataError) {
      throw error
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new MetadataError('Timed out fetching metadata', 504)
    }
    const message = error instanceof Error ? error.message : 'Unknown metadata error'
    throw new MetadataError(message)
  } finally {
    clearTimeout(timeout)
  }
}
