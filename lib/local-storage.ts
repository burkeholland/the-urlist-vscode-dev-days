import { DraftList, DraftLink } from './supabase/database.types'

const KEY = 'urlist_draft_new'

export function loadDraft(): DraftList | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed.slug === 'string' && Array.isArray(parsed.links)) {
      const links = parsed.links.map((link: DraftLink) => ({
        ...link,
        imageUrl: 'imageUrl' in link ? link.imageUrl ?? null : null
      }))
      return { ...parsed, links } as DraftList
    }
  } catch {}
  return null
}

export function saveDraft(draft: DraftList) {
  if (typeof window === 'undefined') return
  draft.lastUpdated = Date.now()
  localStorage.setItem(KEY, JSON.stringify(draft))
}

export function clearDraft() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
}

export function ensureDraft(): DraftList {
  const existing = loadDraft()
  if (existing) return existing
  const fresh: DraftList = {
    slug: '',
    description: '',
    is_public: true,
    links: [],
    lastUpdated: Date.now()
  }
  saveDraft(fresh)
  return fresh
}
