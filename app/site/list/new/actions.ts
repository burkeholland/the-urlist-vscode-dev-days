'use server'

import { createClient } from '@/lib/supabase/server'
import { isValidSlug } from '@/lib/slug'

export interface CreateListResult {
  success: boolean
  error?: string
  slug?: string
  field?: 'slug' | 'links'
}

type PublishLinkInput = {
  url: string
  title: string | null
  description: string | null
  order: number
  imageUrl?: string | null
}

export interface CreateListPayload {
  slug: string
  description?: string | null
  is_public: boolean
  links: PublishLinkInput[]
}

export async function createListAction(draft: CreateListPayload): Promise<CreateListResult> {
  const normalizedSlug = draft.slug.trim()

  if (!normalizedSlug) {
    return { success: false, error: 'Please choose a slug for your list.', field: 'slug' }
  }

  if (!isValidSlug(normalizedSlug)) {
    return { success: false, error: 'Slugs may only include letters, numbers, underscores, dashes, and forward slashes.', field: 'slug' }
  }

  if (!draft.links.length) {
    return { success: false, error: 'Add at least one link before creating your list.', field: 'links' }
  }

  const supabase = await createClient()
  const { data: userResult } = await supabase.auth.getUser()
  const userId = userResult?.user?.id ?? null

  const { data: listData, error: listError } = await supabase
    .from('lists')
    .insert({
      slug: normalizedSlug,
      description: draft.description?.trim() || null,
      is_public: draft.is_public,
      user_id: userId
    })
    .select('id, slug')
    .single()

  if (listError) {
    if ('code' in listError && listError.code === '23505') {
      return { success: false, error: 'That slug is already taken. Try another one.', field: 'slug' }
    }
    return { success: false, error: 'We could not save your list. Try again in a moment.' }
  }

  const listId = listData.id

  const links = draft.links
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((link, index) => ({
      list_id: listId,
      url: link.url.trim(),
      title: link.title?.trim() || null,
      description: link.description?.trim() || null,
      order: index
    }))
    .filter((link) => link.url.length > 0)

  if (!links.length) {
    return { success: false, error: 'Add at least one link before creating your list.', field: 'links' }
  }

  const { error } = await supabase.from('links').insert(links)
  if (error) {
    return { success: false, error: 'Saved the list but failed to save links. Please try again.' }
  }

  return { success: true, slug: listData.slug }
}
