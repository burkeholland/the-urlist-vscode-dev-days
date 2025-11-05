const SLUG_REGEX = /^[A-Za-z0-9][A-Za-z0-9/_-]*$/
const RESERVED = new Set(['site','api'])

export function isValidSlug(slug: string): boolean {
  return SLUG_REGEX.test(slug) && !RESERVED.has(slug)
}

export function normalizeSlug(input: string): string {
  let s = input.trim()
    .replace(/\s+/g, '-')
    .replace(/[^A-Za-z0-9/_-]/g, '')
  if (!/^[A-Za-z0-9]/.test(s)) {
    s = 'u' + s
  }
  return s.slice(0, 64)
}

export function generateRandomSlug(len: number = 7): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let out = ''
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export function suggestAlternative(taken: string): string {
  let attempt: string
  do {
    attempt = normalizeSlug(taken + '-' + generateRandomSlug(4))
  } while (attempt === taken)
  return attempt
}
