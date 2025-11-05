"use client"

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import type { DraftLink, DraftList } from '@/lib/supabase/database.types'
import { ensureDraft, saveDraft, clearDraft } from '@/lib/local-storage'
import { createListAction } from '@/app/site/list/new/actions'
import type { CreateListPayload } from '@/app/site/list/new/actions'
import { isValidSlug, normalizeSlug } from '@/lib/slug'
import { cn } from '@/lib/utils'

const URL_REGEX = /^https?:\/\//i

interface NewListFormProps {
  initialUrl?: string
}

type SlugState =
  | { status: 'idle'; message: string }
  | { status: 'checking'; message: string }
  | { status: 'available'; message: string }
  | { status: 'invalid'; message: string }
  | { status: 'taken'; message: string; suggestion?: string | null }

function makeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

function deriveSlugFromUrl(rawUrl: string): string {
  try {
    const { hostname } = new URL(rawUrl)
    const trimmedHost = hostname.replace(/^www\./, '')
    return normalizeSlug(trimmedHost)
  } catch {
    return ''
  }
}

export function NewListForm({ initialUrl }: NewListFormProps) {
  const router = useRouter()
  const [draft, setDraft] = useState<DraftList | null>(null)
  const [newUrl, setNewUrl] = useState(initialUrl ?? '')
  const [newUrlError, setNewUrlError] = useState<string | null>(null)
  const [slugInfo, setSlugInfo] = useState<SlugState>({ status: 'idle', message: 'Pick something memorable. Slugs must be unique.' })
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const initialUrlRef = useRef(initialUrl)

  useEffect(() => {
    const baseDraft = ensureDraft()
    baseDraft.links = baseDraft.links.map((link, index) => ({
      ...link,
      order: index,
      isFetchingMetadata: false,
      metadataError: null,
      imageUrl: link.imageUrl ?? null
    }))
    setDraft(baseDraft)
  }, [])

  useEffect(() => {
    if (draft) {
      saveDraft(draft)
    }
  }, [draft])

  const orderedLinks = useMemo(() => {
    return draft?.links.slice().sort((a, b) => a.order - b.order) ?? []
  }, [draft])

  const updateDraft = useCallback((updater: (previous: DraftList) => DraftList) => {
    setDraft((previous) => {
      if (!previous) return previous
      return updater(previous)
    })
  }, [])

  const addLink = useCallback(async (rawUrl: string) => {
    const trimmed = rawUrl.trim()
    if (!URL_REGEX.test(trimmed)) {
      setNewUrlError('Links must start with http:// or https://')
      return
    }

    setNewUrlError(null)

    let linkId = ''

    updateDraft((previous) => {
      if (previous.links.some((link) => link.url === trimmed)) {
        return previous
      }

      linkId = makeId()
      const derivedSlug = previous.slug || deriveSlugFromUrl(trimmed)

      return {
        ...previous,
        slug: previous.slug || derivedSlug,
        links: [
          ...previous.links,
          {
            id: linkId,
            url: trimmed,
            title: null,
            description: null,
            metadataError: null,
            imageUrl: null,
            order: previous.links.length,
            isFetchingMetadata: true
          }
        ]
      }
    })

    setNewUrl('')

    if (!linkId) {
      return
    }

    setEditingLinkId(linkId)

    try {
      const response = await fetch(`/api/metadata?url=${encodeURIComponent(trimmed)}`)
      if (!response.ok) {
        throw new Error('Unable to fetch metadata')
      }
      const meta = await response.json()
      updateDraft((previous) => {
        const links = previous.links.map((link) => {
          if (link.id !== linkId) return link
          return {
            ...link,
            title: meta.title ?? link.title ?? null,
            description: meta.description ?? link.description ?? null,
            imageUrl: meta.image ?? link.imageUrl ?? null,
            metadataError: null,
            isFetchingMetadata: false
          }
        })
        return { ...previous, links }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch metadata'
      updateDraft((previous) => {
        const links = previous.links.map((link) => {
          if (link.id !== linkId) return link
          return {
            ...link,
            metadataError: message,
            isFetchingMetadata: false
          }
        })
        return { ...previous, links }
      })
    }
  }, [updateDraft, setEditingLinkId])

  useEffect(() => {
    if (!draft) return
    if (!initialUrlRef.current) return
    const candidate = initialUrlRef.current
    initialUrlRef.current = undefined
    if (candidate && URL_REGEX.test(candidate) && !draft.links.some((link) => link.url === candidate)) {
      void addLink(candidate)
    }
  }, [draft, addLink])

  const removeLink = useCallback((id: string) => {
    updateDraft((previous) => {
      const filtered = previous.links.filter((link) => link.id !== id)
      return {
        ...previous,
        links: filtered.map((link, index) => ({ ...link, order: index }))
      }
    })
    setEditingLinkId((current) => (current === id ? null : current))
  }, [updateDraft, setEditingLinkId])

  const updateLinkField = useCallback((id: string, field: keyof DraftLink, value: string | null) => {
    updateDraft((previous) => {
      const links = previous.links.map((link) => (link.id === id ? { ...link, [field]: value } : link))
      return { ...previous, links }
    })
  }, [updateDraft])

  const handleSlugChange = useCallback((value: string) => {
    updateDraft((previous) => ({ ...previous, slug: value }))
    setSlugInfo({ status: 'idle', message: 'Slugs sync with blur. Tap away to check availability.' })
  }, [updateDraft])

  const handleSlugBlur = useCallback(async (value?: string) => {
    const source = typeof value === 'string' ? value : draft?.slug ?? ''
    const normalized = normalizeSlug(source)

    updateDraft((previous) => ({ ...previous, slug: normalized }))

    if (!normalized) {
      setSlugInfo({ status: 'invalid', message: 'Slug cannot be empty.' })
      return
    }

    if (!isValidSlug(normalized)) {
      setSlugInfo({ status: 'invalid', message: 'Use letters, numbers, dashes, underscores, or / (no spaces).' })
      return
    }

    setSlugInfo({ status: 'checking', message: 'Checking slug availability…' })
    try {
      const response = await fetch(`/api/lists/check-slug?slug=${encodeURIComponent(normalized)}`)
      if (!response.ok) {
        throw new Error('Unable to verify slug')
      }
      const payload = await response.json()
      if (!payload.ok) {
        throw new Error(payload.error ?? 'Unable to verify slug')
      }
      if (payload.available) {
        setSlugInfo({ status: 'available', message: 'Nice! That slug is up for grabs.' })
      } else {
        setSlugInfo({ status: 'taken', message: 'Dang, that slug is spoken for.', suggestion: payload.suggestion })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to verify slug'
      setSlugInfo({ status: 'invalid', message })
    }
  }, [draft?.slug, updateDraft])

  const acceptSuggestion = useCallback((suggestion: string) => {
    handleSlugChange(suggestion)
    setTimeout(() => {
      void handleSlugBlur(suggestion)
    }, 0)
  }, [handleSlugBlur, handleSlugChange])

  const togglePublic = useCallback((value: boolean) => {
    updateDraft((previous) => ({ ...previous, is_public: value }))
  }, [updateDraft])

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft) return

    const publishLinks = draft.links.map((link, index) => ({
      url: link.url.trim(),
      title: link.title?.trim() || null,
      description: link.description?.trim() || null,
      imageUrl: link.imageUrl ?? null,
      order: index
    }))

    const payload: CreateListPayload = {
      slug: draft.slug.trim(),
      description: draft.description.trim(),
      is_public: draft.is_public,
      links: publishLinks
    }

    setActionError(null)

    setDraft((previous) => {
      if (!previous) return previous
      return {
        ...previous,
        links: previous.links.map((link, index) => ({
          ...link,
          order: index,
          metadataError: null,
          isFetchingMetadata: false
        }))
      }
    })

    startTransition(async () => {
      const result = await createListAction(payload)
      if (!result.success) {
        setActionError(result.error ?? 'Something went wrong while saving your list.')
        if (result.field === 'slug') {
          setSlugInfo({ status: 'invalid', message: result.error ?? 'Check your slug and try again.' })
        }
        return
      }

      clearDraft()
      router.push(`/site/list/${result.slug}`)
    })
  }, [draft, router, startTransition])

  if (!draft) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-white/70">
        Loading your draft…
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10 text-white/90">
      <div className="text-center">
        <h1 className="text-5xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">Craft your list</h1>
        <p className="text-xl md:text-2xl text-white/80 font-medium">Add links, choose a slug, and publish in seconds.</p>
      </div>

      {actionError ? (
        <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-red-100">
          {actionError}
        </div>
      ) : null}

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-6 backdrop-blur-xl">
        <header>
          <h2 className="text-2xl font-semibold text-white">List details</h2>
          <p className="text-sm text-white/70">Pick a slug and decide if everyone can view it.</p>
        </header>

        <label className="block space-y-2">
          <span className="text-sm uppercase tracking-wide text-white/70">Vanity slug</span>
          <input
            className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-lg outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-400"
            value={draft.slug}
            onChange={(event) => handleSlugChange(event.target.value)}
            onBlur={(event) => {
              void handleSlugBlur(event.target.value)
            }}
            placeholder="your-list-name"
            disabled={isPending}
          />
          <p
            className={cn(
              'text-sm',
              slugInfo.status === 'available' ? 'text-emerald-300' : slugInfo.status === 'invalid' || slugInfo.status === 'taken' ? 'text-red-200' : 'text-white/60'
            )}
          >
            {slugInfo.message}
          </p>
          {slugInfo.status === 'taken' && slugInfo.suggestion ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">Try this:</span>
              <Button type="button" variant="outline" size="sm" onClick={() => acceptSuggestion(slugInfo.suggestion!)}>
                {slugInfo.suggestion}
              </Button>
            </div>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm uppercase tracking-wide text-white/70">Description</span>
          <textarea
            className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-base min-h-[120px] outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-400"
            value={draft.description}
            onChange={(event) => updateDraft((previous) => ({ ...previous, description: event.target.value }))}
            placeholder="Tell people why these links are special"
            disabled={isPending}
          />
        </label>

        <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
          <div>
            <span className="text-base font-medium text-white">Make it public</span>
            <p className="text-sm text-white/60">Public lists are visible to anyone with the link.</p>
          </div>
          <input
            type="checkbox"
            className="size-6 accent-blue-400"
            checked={draft.is_public}
            onChange={(event) => togglePublic(event.target.checked)}
            disabled={isPending}
          />
        </label>
      </section>

      <section className="space-y-6">
        <header className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-white">Links</h2>
          <p className="text-sm text-white/70">Add, tweak, and reorder your favorites.</p>
        </header>

        <div className="space-y-4">
          {orderedLinks.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-white/20 bg-white/5 py-12 text-center text-white/60">
              Drop your first link to get started.
            </p>
          ) : (
            orderedLinks.map((link) => {
              const isEditing = editingLinkId === link.id
              let host = link.url
              try {
                host = new URL(link.url).hostname.replace(/^www\./, '')
              } catch {
                host = link.url
              }
              const titleText = link.title ?? 'Add a title'
              const descriptionText = link.description ?? 'Add a description'

              return (
                <div key={link.id} className="rounded-3xl border border-white/15 bg-black/20 backdrop-blur-xl">
                  {isEditing ? (
                    <div className="space-y-4 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm uppercase tracking-wide text-white/60">Editing link</p>
                          <p className="text-lg font-semibold text-white break-all">{link.url}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" variant="ghost" className="text-red-200 hover:text-red-100" onClick={() => removeLink(link.id)} disabled={isPending}>
                            Remove
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setEditingLinkId(null)} disabled={isPending}>
                            Done
                          </Button>
                        </div>
                      </div>

                      <label className="block space-y-1">
                        <span className="text-sm text-white/60">Title</span>
                        <input
                          className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-base outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-400"
                          value={link.title ?? ''}
                          placeholder="Add a catchy title"
                          onChange={(event) => updateLinkField(link.id, 'title', event.target.value ? event.target.value : null)}
                          disabled={isPending}
                        />
                      </label>

                      <label className="block space-y-1">
                        <span className="text-sm text-white/60">Description</span>
                        <textarea
                          className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-base outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-400"
                          value={link.description ?? ''}
                          placeholder="Tell people why this link matters"
                          onChange={(event) => updateLinkField(link.id, 'description', event.target.value ? event.target.value : null)}
                          disabled={isPending}
                        />
                      </label>

                      <label className="block space-y-1">
                        <span className="text-sm text-white/60">Preview image URL (optional)</span>
                        <input
                          className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-base outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-400"
                          value={link.imageUrl ?? ''}
                          placeholder="https://example.com/preview.jpg"
                          onChange={(event) => updateLinkField(link.id, 'imageUrl', event.target.value ? event.target.value : null)}
                          disabled={isPending}
                        />
                      </label>

                      {link.isFetchingMetadata ? <p className="text-sm text-white/60">Fetching metadata…</p> : null}
                      {link.metadataError ? <p className="text-sm text-red-200">{link.metadataError}</p> : null}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingLinkId(link.id)}
                      className="w-full p-5 text-left transition-colors hover:bg-white/10"
                      disabled={isPending}
                    >
                      <div className="flex flex-wrap gap-4">
                        <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                          {link.imageUrl ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={link.imageUrl} alt={titleText} className="h-full w-full object-cover" />
                            </>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-white/50">No image yet</div>
                          )}
                          {link.isFetchingMetadata ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-white/80">
                              Fetching…
                            </div>
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <p className="text-sm uppercase tracking-wide text-white/60">{host}</p>
                          <p className={cn('text-xl font-semibold', link.title ? 'text-white' : 'text-white/60 italic')}>{titleText}</p>
                          <p className={cn('text-sm', link.description ? 'text-white/70' : 'text-white/40 italic')}>{descriptionText}</p>
                        </div>
                        <div className="self-center text-sm text-white/60">Tap to edit</div>
                      </div>
                      {link.metadataError ? <p className="mt-3 text-sm text-red-200">{link.metadataError}</p> : null}
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl space-y-3">
          <label className="block space-y-2">
            <span className="text-sm uppercase tracking-wide text-white/60">Add another link</span>
            <input
              className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-base outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-400"
              value={newUrl}
              onChange={(event) => setNewUrl(event.target.value)}
              placeholder="https://example.com/awesome"
              disabled={isPending}
            />
          </label>
          {newUrlError ? <p className="text-sm text-red-200">{newUrlError}</p> : null}
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={() => void addLink(newUrl)} disabled={isPending || !newUrl.trim()}>
              Add link
            </Button>
            <Button type="button" variant="ghost" onClick={() => setNewUrl('')} disabled={isPending || !newUrl}>
              Clear
            </Button>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-white/60">Your progress auto-saves on this device.</p>
        <Button type="submit" disabled={isPending || !draft.links.length} className="px-8 py-4 text-lg font-semibold">
          {isPending ? 'Saving…' : 'Publish my list'}
        </Button>
      </div>
    </form>
  )
}
